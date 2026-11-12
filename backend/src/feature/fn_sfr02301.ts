import { Controller, Get, HttpCode, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 원천세 신고 기준정보는 system_setting 의 분류 '원천세' 항목으로 보고, 값이 채워진 항목이 하나 이상 있으면 설정된 것으로 본다.
const WITHHOLDING_SETTING_CATEGORY = '원천세';
// 가정: 귀속연월·지급연월은 YYYYMM 6자리다.
const MONTH_PATTERN = /^\d{4}(0[1-9]|1[0-2])$/;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

const FILING_COLUMNS = `
  tax_filing_id AS "taxFilingId",
  filing_type AS "filingType",
  attribution_month AS "attributionMonth",
  payment_month AS "paymentMonth",
  total_amount AS "totalAmount",
  filing_status AS "filingStatus"
`;

function monthOf(value: unknown, label: string): string {
  if (typeof value !== 'string' || !MONTH_PATTERN.test(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${label}은(는) YYYYMM 형식으로 입력해 주세요.`);
  }
  return value;
}

function optionalText(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return String(value);
}

function integerOf(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 정수로 입력해 주세요.');
  }
  return n;
}

function amountOf(value: unknown): string {
  const isNumber = typeof value === 'number' && Number.isFinite(value);
  const isNumericText = typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value));
  if (!isNumber && !isNumericText) {
    throw new ApiError(400, 'VALIDATION_FAILED', '집계 금액은 숫자로 입력해 주세요.');
  }
  return String(value).trim();
}

@Controller('api/v1')
export class FnSfr02301Controller {
  @Post('/tax-filings/generate')
  @HttpCode(200)
  async generateTaxFiling(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const attributionMonth = monthOf(data['attributionMonth'], '귀속연월');
    const paymentMonth = monthOf(data['paymentMonth'], '지급연월');
    return transaction(async (db) => {
      const settings = await db.query(
        `SELECT setting_key FROM system_setting
          WHERE category = :category AND setting_value IS NOT NULL AND setting_value <> ''`,
        { category: WITHHOLDING_SETTING_CATEGORY },
      );
      if (settings.length === 0) {
        throw new ApiError(422, 'WITHHOLDING_SETTING_NOT_CONFIGURED', '원천세 신고 기준정보를 먼저 설정해 주세요.');
      }
      // 가정: payroll 에는 귀속연월 컬럼이 없어 급여 지급일의 연월을 지급연월과 맞춰 대상 데이터를 찾는다.
      const payrolls = await db.query(
        `SELECT COUNT(*) AS "count" FROM payroll WHERE to_char(pay_date, 'YYYYMM') = :paymentMonth`,
        { paymentMonth },
      );
      if (Number(payrolls[0]['count']) === 0) {
        throw new ApiError(422, 'PAYROLL_DATA_NOT_FOUND', '해당 귀속연월의 급여 지급 데이터가 없습니다.');
      }
      // 집계 금액은 급여 금액이 암호문이라 여기서 합산하지 않는다 (TODO 참고). 신고서 수정 때 입력한다.
      const rows = await db.query(
        `INSERT INTO tax_filing
           (filing_type, attribution_month, payment_month, filing_status, total_amount, created_at, updated_at)
         VALUES
           ('WITHHOLDING_STATUS', :attributionMonth, :paymentMonth, 'DRAFT', NULL, now(), now())
         RETURNING ${FILING_COLUMNS}`,
        { attributionMonth, paymentMonth },
      );
      return { items: rows, page: 0, size: rows.length, total: rows.length };
    });
  }

  @Get('/tax-filings')
  async listTaxFilings(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const query = checks.queryOf(req.query);
    const page = integerOf(query['page'], 0);
    const size = integerOf(query['size'], DEFAULT_SIZE);
    if (page < 0 || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const limit = Math.min(size, MAX_SIZE);
    const filters = {
      filingType: optionalText(query['filingType']),
      attributionMonth: optionalText(query['attributionMonth']),
      paymentMonth: optionalText(query['paymentMonth']),
    };
    const where = `
      (CAST(:filingType AS varchar) IS NULL OR filing_type = :filingType)
      AND (CAST(:attributionMonth AS varchar) IS NULL OR attribution_month = :attributionMonth)
      AND (CAST(:paymentMonth AS varchar) IS NULL OR payment_month = :paymentMonth)
    `;
    return transaction(async (db) => {
      const counts = await db.query(`SELECT COUNT(*) AS "total" FROM tax_filing WHERE ${where}`, filters);
      const items = await db.query(
        `SELECT
           ${FILING_COLUMNS},
           filed_at AS "filedAt",
           result_message AS "resultMessage",
           receipt_number AS "receiptNumber"
         FROM tax_filing
         WHERE ${where}
         ORDER BY tax_filing_id DESC
         LIMIT :limit OFFSET :offset`,
        { ...filters, limit, offset: page * limit },
      );
      return { items, page, size: limit, total: Number(counts[0]['total']) };
    });
  }

  @Put('/tax-filings/:taxFilingId')
  async updateTaxFiling(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const taxFilingId = req.params['taxFilingId'];
    if (!/^\d+$/.test(taxFilingId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '신고서 ID가 올바르지 않습니다.');
    }
    const totalAmount = amountOf(data['totalAmount']);
    const incomeCategory = optionalText(data['incomeCategory']);
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT filing_status AS "filingStatus" FROM tax_filing WHERE tax_filing_id = CAST(:taxFilingId AS bigint)`,
        { taxFilingId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'TAX_FILING_NOT_FOUND', '신고서를 찾을 수 없습니다.');
      }
      // 가정: 전자신고가 완료(SUCCESS)된 신고서만 수정할 수 없고, 작성 중·실패 상태는 수정할 수 있다.
      if (found[0]['filingStatus'] === 'SUCCESS') {
        throw new ApiError(409, 'TAX_FILING_ALREADY_SUBMITTED', '이미 신고 완료된 신고서는 수정할 수 없습니다.');
      }
      const rows = await db.query(
        `UPDATE tax_filing
            SET total_amount = CAST(:totalAmount AS numeric),
                income_category = COALESCE(:incomeCategory, income_category),
                updated_at = now()
          WHERE tax_filing_id = CAST(:taxFilingId AS bigint)
          RETURNING
            tax_filing_id AS "taxFilingId",
            total_amount AS "totalAmount",
            filing_status AS "filingStatus"`,
        { taxFilingId, totalAmount, incomeCategory },
      );
      return rows[0];
    });
  }
}
