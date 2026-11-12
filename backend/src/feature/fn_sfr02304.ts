import { Controller, Post, Put, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 일용근로소득 원천징수세액은 소득세법상 일 공제 150,000원, 세율 6%, 근로소득세액공제 55%를 적용한다.
// 가정: 산출 세액이 1,000원 미만이면 소액부징수로 0원 처리한다.
const DAILY_DEDUCTION = 150000;
const DAILY_TAX_RATE = 0.06;
const DAILY_TAX_CREDIT_RATE = 0.55;
const MIN_TAX_AMOUNT = 1000;

function amountOf(value: unknown, label: string): number {
  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '을(를) 입력해 주세요.');
  }
  const n = Number(value);
  if (typeof value === 'boolean' || !Number.isFinite(n) || n < 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 0 이상의 숫자여야 합니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr02304Controller {
  @Post('/income-certificates/generate-daily')
  @HttpCode(200)
  async generateDailyIncomeCertificates(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const paymentMonth = data['paymentMonth'];
    if (typeof paymentMonth !== 'string' || !/^[0-9]{4}(0[1-9]|1[0-2])$/.test(paymentMonth)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '지급연월을 YYYYMM 형식으로 입력해 주세요.');
    }
    let dailyWorkerId: number | null = null;
    const rawWorker = data['dailyWorkerId'];
    if (rawWorker !== undefined && rawWorker !== null && rawWorker !== '') {
      const n = Number(rawWorker);
      if (typeof rawWorker === 'boolean' || !Number.isInteger(n) || n <= 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '일용직 사원이 올바르지 않습니다.');
      }
      dailyWorkerId = n;
    }
    return transaction(async (db) => {
      const params = {
        paymentMonth,
        workerId: dailyWorkerId,
        deduction: DAILY_DEDUCTION,
        rate: DAILY_TAX_RATE,
        credit: DAILY_TAX_CREDIT_RATE,
        minTax: MIN_TAX_AMOUNT,
      };
      const found = await db.query(
        `SELECT COUNT(*) AS "cnt"
           FROM daily_worker_payment p
          WHERE p.payment_date >= to_date(:paymentMonth, 'YYYYMM')
            AND p.payment_date < CAST(to_date(:paymentMonth, 'YYYYMM') + interval '1 month' AS date)
            AND (CAST(:workerId AS bigint) IS NULL OR p.daily_worker_id = CAST(:workerId AS bigint))`,
        { paymentMonth, workerId: dailyWorkerId },
      );
      if (Number(found[0]['cnt']) === 0) {
        throw new ApiError(422, 'DAILY_PAYMENT_DATA_NOT_FOUND', '대상 기간의 일용근로자 지급 데이터가 없어 생성할 수 없습니다.');
      }
      const items = await db.query(
        `WITH pay AS (
           SELECT p.daily_worker_id,
                  p.payment_amount,
                  TRUNC(GREATEST(p.payment_amount - CAST(:deduction AS numeric) * p.work_days, 0)
                        * CAST(:rate AS numeric) * (1 - CAST(:credit AS numeric))) AS tax_raw
             FROM daily_worker_payment p
            WHERE p.payment_date >= to_date(:paymentMonth, 'YYYYMM')
              AND p.payment_date < CAST(to_date(:paymentMonth, 'YYYYMM') + interval '1 month' AS date)
              AND (CAST(:workerId AS bigint) IS NULL OR p.daily_worker_id = CAST(:workerId AS bigint))
         ), base AS (
           SELECT daily_worker_id,
                  SUM(payment_amount) AS total,
                  SUM(CASE WHEN tax_raw < CAST(:minTax AS numeric) THEN 0 ELSE tax_raw END) AS tax
             FROM pay
            GROUP BY daily_worker_id
         )
         INSERT INTO income_certificate (
           daily_worker_id, certificate_category, document_type, period_start, period_end,
           total_payment_amount, withheld_tax_amount, resident_number_enc, issued_at, created_at, updated_at
         )
         SELECT w.daily_worker_id, 'DAILY_WAGE', d.doc,
                to_date(:paymentMonth, 'YYYYMM'),
                CAST(to_date(:paymentMonth, 'YYYYMM') + interval '1 month' - interval '1 day' AS date),
                b.total, b.tax, w.resident_registration_no_enc, now(), now(), now()
           FROM base b
           JOIN daily_worker w ON w.daily_worker_id = b.daily_worker_id
          CROSS JOIN (VALUES ('PAYMENT_STATEMENT'), ('WITHHOLDING_RECEIPT')) AS d(doc)
         RETURNING income_certificate_id AS "incomeCertificateId",
                   daily_worker_id AS "dailyWorkerId",
                   document_type AS "documentType",
                   period_start AS "periodStart",
                   period_end AS "periodEnd",
                   total_payment_amount AS "totalPaymentAmount",
                   withheld_tax_amount AS "withheldTaxAmount"`,
        params,
      );
      return { items, page: 0, size: items.length, total: items.length };
    });
  }

  @Put('/income-certificates/:incomeCertificateId')
  async updateIncomeCertificate(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const idText = req.params['incomeCertificateId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '지급명세서·영수증 ID가 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const totalPaymentAmount = amountOf(data['totalPaymentAmount'], '총지급액');
    const withheldTaxAmount = amountOf(data['withheldTaxAmount'], '원천징수세액');
    return transaction(async (db) => {
      const rows = await db.query(
        `UPDATE income_certificate
            SET total_payment_amount = CAST(:total AS numeric),
                withheld_tax_amount = CAST(:tax AS numeric),
                updated_at = now()
          WHERE income_certificate_id = CAST(:id AS bigint)
          RETURNING income_certificate_id AS "incomeCertificateId",
                    total_payment_amount AS "totalPaymentAmount",
                    withheld_tax_amount AS "withheldTaxAmount"`,
        { id: idText, total: totalPaymentAmount, tax: withheldTaxAmount },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'INCOME_CERTIFICATE_NOT_FOUND', '지급명세서·영수증을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }
}
