import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 신고서 유형 허용값은 schema.sql의 ck_tax_filing_filing_type과 같다.
const FILING_TYPES = [
  'WITHHOLDING_STATUS',
  'TUITION_REPAYMENT',
  'LOCAL_INCOME_TAX',
  'RESIDENT_TAX_EMPLOYEE',
  'SIMPLIFIED_PAYMENT',
  'SUBMISSION_SUMMARY',
  'PAYMENT_MEDIA',
];

@Controller('api/v1')
export class FnSfr02303Controller {
  @Post('/tax-filings/generate-local')
  @HttpCode(200)
  async generateLocalTaxFiling(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const filingType = data['filingType'];
    const attributionMonth = data['attributionMonth'];
    if (typeof filingType !== 'string' || !FILING_TYPES.includes(filingType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '신고서 유형을 올바르게 선택해 주세요.');
    }
    if (typeof attributionMonth !== 'string' || !/^\d{4}(0[1-9]|1[0-2])$/.test(attributionMonth)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '귀속연월은 YYYYMM 형식으로 입력해 주세요.');
    }
    return transaction(async (db) => {
      // 가정: 신고 대상 데이터는 귀속연월에 지급일이 속한 급여 행의 존재로 판단한다.
      const counted = await db.query(
        `SELECT COUNT(*) AS "cnt"
           FROM payroll
          WHERE pay_date >= to_date(:month, 'YYYYMM')
            AND pay_date < to_date(:month, 'YYYYMM') + interval '1 month'`,
        { month: attributionMonth },
      );
      const cnt = Number((counted[0] as Record<string, unknown>)['cnt']);
      if (!cnt) {
        throw new ApiError(422, 'FILING_SOURCE_DATA_NOT_FOUND', '신고 대상 데이터가 없어 신고서를 만들지 않았습니다.');
      }
      // 가정: 작성 직후 신고 상태는 DRAFT.
      const rows = await db.query(
        `INSERT INTO tax_filing (filing_type, attribution_month, filing_status, created_at, updated_at)
         VALUES (:filingType, :month, 'DRAFT', now(), now())
         RETURNING tax_filing_id AS "taxFilingId",
                   filing_type AS "filingType",
                   attribution_month AS "attributionMonth",
                   total_amount AS "totalAmount",
                   filing_status AS "filingStatus"`,
        { filingType, month: attributionMonth },
      );
      return rows[0];
    });
  }
}
