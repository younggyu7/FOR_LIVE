import { Controller, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

@Controller('api/v1')
export class FnSfr02310Controller {
  @Post('/tax-filings/simplified-payments')
  @HttpCode(200)
  async createSimplifiedPaymentStatement(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const paymentMonth = data['paymentMonth'];
    const incomeCategory = data['incomeCategory'];
    if (typeof paymentMonth !== 'string' || !/^\d{4}(0[1-9]|1[0-2])$/.test(paymentMonth)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '지급연월은 YYYYMM 형식으로 입력해 주세요.');
    }
    if (typeof incomeCategory !== 'string' || incomeCategory.trim() === '' || incomeCategory.length > 30) {
      throw new ApiError(400, 'VALIDATION_FAILED', '소득 구분을 30자 이내로 입력해 주세요.');
    }
    return transaction(async (db) => {
      // TODO: 지급 데이터 테이블이 schema.sql에 없어 집계 금액을 계산하지 못한다.
      // filing_type은 고정값(가정), filing_status는 DRAFT(원문)이다.
      const rows = await db.query(
        `INSERT INTO tax_filing (filing_type, payment_month, income_category, filing_status, created_at, updated_at)
         VALUES ('SIMPLIFIED_PAYMENT', :paymentMonth, :incomeCategory, 'DRAFT', now(), now())
         RETURNING tax_filing_id AS "taxFilingId", total_amount AS "totalAmount"`,
        { paymentMonth, incomeCategory },
      );
      return rows[0];
    });
  }

  @Post('/tax-filings/:taxFilingId/file')
  @HttpCode(200)
  async fileSimplifiedPaymentStatement(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const taxFilingId = req.params['taxFilingId'];
    if (!/^\d+$/.test(taxFilingId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '세무 신고서 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT filing_status AS "filingStatus", receipt_number AS "receiptNumber", result_message AS "resultMessage"
         FROM tax_filing
         WHERE tax_filing_id = CAST(:taxFilingId AS bigint) AND filing_type = 'SIMPLIFIED_PAYMENT'`,
        { taxFilingId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'TAX_FILING_NOT_FOUND', '간이지급명세서를 찾을 수 없습니다.');
      }
      if (found[0].filingStatus !== 'DRAFT') {
        throw new ApiError(409, 'INVALID_STATE', '작성 중인 명세서만 전자신고할 수 있습니다.');
      }
      // TODO: 국세청 전자신고 연계 호출과 전자파일 규격 검사는 입력에 규격·연계 수단이 없어 구현하지 못했다.
      // 요청 이력만 남기고 신고 상태는 DRAFT(미신고)로 유지한다.
      await db.execute(
        `INSERT INTO link_log (requester_id, link_target, link_type, status, requested_at, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), 'NTS_EFILING', '신고', 'REQUESTED', now(), now(), now())`,
        { userId: user.id },
      );
      return found[0];
    });
  }
}
