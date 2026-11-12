import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '급여 담당자';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DOC_TYPES = ['PAYMENT_STATEMENT', 'WITHHOLDING_RECEIPT'];
// 가정: 일용근로소득 원천징수세액 = (지급액 - 일 공제액 x 근무일수) x 세율, 원 단위 버림
const DEDUCTION_PER_DAY = 150000; // 가정
const TAX_RATE = 0.027; // 가정 (세율 6% x 산출세액 45%)
// 가정: 마감 판단은 기간 내 payroll.closing_status = '마감'인 급여가 있는 경우로 본다
const CLOSED_STATUS = '마감'; // 가정
const ACCESS_INFO_TYPE = '일용근로소득 지급명세서'; // 가정
const ACCESS_TYPE = '조회'; // 가정

function dateOf(v: unknown, label: string): string {
  if (typeof v !== 'string' || !DATE_RE.test(v.trim())) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return v.trim();
}

function optDate(v: unknown, label: string): string | null {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  return dateOf(v, label);
}

function optId(v: unknown, label: string): number | null {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 숫자여야 합니다.');
  }
  return n;
}

function intOf(v: unknown, def: number, label: string): number {
  if (v === undefined || v === null || v === '') {
    return def;
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr02113Controller {
  @Post('/income-certificates/generate')
  @HttpCode(200)
  async generateIncomeCertificates(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const periodStart = dateOf(data['periodStart'], '귀속 시작일');
    const periodEnd = dateOf(data['periodEnd'], '귀속 종료일');
    if (periodEnd < periodStart) {
      throw new ApiError(400, 'VALIDATION_FAILED', '귀속 종료일은 시작일보다 빠를 수 없습니다.');
    }
    const workerId = optId(data['dailyWorkerId'], '일용직 사원');
    return transaction(async (db) => {
      const payments = await db.query(
        'SELECT p.daily_worker_id AS "dailyWorkerId", ' +
          'SUM(p.payment_amount) AS "total", ' +
          'FLOOR(SUM(GREATEST(p.payment_amount - CAST(:deduct AS numeric) * p.work_days, 0) * CAST(:rate AS numeric))) AS "tax", ' +
          'w.resident_registration_no_enc AS "residentEnc" ' +
          'FROM daily_worker_payment p ' +
          'JOIN daily_worker w ON w.daily_worker_id = p.daily_worker_id ' +
          'WHERE p.payment_date >= CAST(:periodStart AS date) ' +
          'AND p.payment_date <= CAST(:periodEnd AS date) ' +
          'AND (CAST(:workerId AS bigint) IS NULL OR p.daily_worker_id = CAST(:workerId AS bigint)) ' +
          'GROUP BY p.daily_worker_id, w.resident_registration_no_enc ' +
          'ORDER BY p.daily_worker_id',
        { deduct: DEDUCTION_PER_DAY, rate: TAX_RATE, periodStart, periodEnd, workerId },
      );
      if (payments.length === 0) {
        throw new ApiError(404, 'NO_PAYMENT_DATA', '대상 급여가 없습니다.');
      }
      let generatedCount = 0;
      for (const pay of payments) {
        for (const docType of DOC_TYPES) {
          const existing = await db.query(
            'SELECT income_certificate_id AS "incomeCertificateId" ' +
              'FROM income_certificate ' +
              'WHERE certificate_category = :category ' +
              'AND document_type = :docType ' +
              'AND daily_worker_id = CAST(:workerId AS bigint) ' +
              'AND period_start = CAST(:periodStart AS date) ' +
              'AND period_end = CAST(:periodEnd AS date)',
            { category: 'DAILY_WAGE', docType, workerId: pay.dailyWorkerId, periodStart, periodEnd },
          );
          if (existing.length > 0) {
            const closed = await db.query(
              'SELECT payroll_id AS "payrollId" ' +
                'FROM payroll ' +
                'WHERE closing_status = :closed ' +
                'AND pay_date >= CAST(:periodStart AS date) ' +
                'AND pay_date <= CAST(:periodEnd AS date) ' +
                'LIMIT 1',
              { closed: CLOSED_STATUS, periodStart, periodEnd },
            );
            if (closed.length > 0) {
              throw new ApiError(409, 'INCOME_CERTIFICATE_PERIOD_CLOSED', '마감된 기간의 문서는 마감 취소 전에는 수정할 수 없습니다.');
            }
            await db.execute(
              'UPDATE income_certificate ' +
                'SET total_payment_amount = CAST(:total AS numeric), ' +
                'withheld_tax_amount = CAST(:tax AS numeric), ' +
                'issued_at = now(), updated_at = now() ' +
                'WHERE income_certificate_id = CAST(:id AS bigint)',
              { total: pay.total, tax: pay.tax, id: existing[0].incomeCertificateId },
            );
          } else {
            await db.query(
              'INSERT INTO income_certificate ' +
                '(daily_worker_id, certificate_category, document_type, period_start, period_end, ' +
                'total_payment_amount, withheld_tax_amount, resident_number_enc, issued_at, created_at, updated_at) ' +
                'VALUES (CAST(:workerId AS bigint), :category, :docType, CAST(:periodStart AS date), CAST(:periodEnd AS date), ' +
                'CAST(:total AS numeric), CAST(:tax AS numeric), :residentEnc, now(), now(), now()) ' +
                'RETURNING income_certificate_id AS "incomeCertificateId"',
              {
                workerId: pay.dailyWorkerId,
                category: 'DAILY_WAGE',
                docType,
                periodStart,
                periodEnd,
                total: pay.total,
                tax: pay.tax,
                residentEnc: pay.residentEnc,
              },
            );
          }
          generatedCount += 1;
        }
      }
      return { generatedCount };
    });
  }

  @Get('/income-certificates')
  async listIncomeCertificates(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const periodStart = optDate(q['periodStart'], '귀속 시작일');
    const periodEnd = optDate(q['periodEnd'], '귀속 종료일');
    const workerId = optId(q['dailyWorkerId'], '일용직 사원');
    const rawType = q['documentType'];
    const documentType = rawType === undefined || rawType === null || rawType === '' ? null : String(rawType);
    if (documentType !== null && !DOC_TYPES.includes(documentType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '문서 종류가 올바르지 않습니다.');
    }
    const page = intOf(q['page'], 0, '쪽');
    const size = Math.min(intOf(q['size'], 20, '크기') || 20, 200);
    return transaction(async (db) => {
      await db.execute(
        'INSERT INTO personal_info_access_log ' +
          '(employee_id, target_info_type, access_type, accessed_at, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :infoType, :accessType, now(), now(), now())',
        { userId: user.id, infoType: ACCESS_INFO_TYPE, accessType: ACCESS_TYPE },
      );
      const where =
        " certificate_category = 'DAILY_WAGE' " +
        'AND daily_worker_id IS NOT NULL ' +
        'AND (CAST(:periodStart AS date) IS NULL OR period_start >= CAST(:periodStart AS date)) ' +
        'AND (CAST(:periodEnd AS date) IS NULL OR period_end <= CAST(:periodEnd AS date)) ' +
        'AND (CAST(:workerId AS bigint) IS NULL OR daily_worker_id = CAST(:workerId AS bigint)) ' +
        'AND (CAST(:documentType AS text) IS NULL OR document_type = CAST(:documentType AS text)) ';
      const filter = { periodStart, periodEnd, workerId, documentType };
      const totals = await db.query('SELECT COUNT(*) AS "total" FROM income_certificate WHERE ' + where, filter);
      const items = await db.query(
        'SELECT income_certificate_id AS "incomeCertificateId", ' +
          'daily_worker_id AS "dailyWorkerId", ' +
          'document_type AS "documentType", ' +
          'period_start AS "periodStart", ' +
          'period_end AS "periodEnd", ' +
          'total_payment_amount AS "totalPaymentAmount", ' +
          'withheld_tax_amount AS "withheldTaxAmount", ' +
          'issued_at AS "issuedAt" ' +
          'FROM income_certificate WHERE ' +
          where +
          ' ORDER BY income_certificate_id DESC ' +
          'LIMIT :size OFFSET :offset',
        { ...filter, size, offset: page * size },
      );
      return { items, page, size, total: Number(totals[0].total) };
    });
  }
}
