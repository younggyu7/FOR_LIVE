import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 전산매체 파일명 접두어와 확장자는 개발 담당자가 정한다 (BEHAVIOR.md 값의 출처: 미정, 결정)
const MEDIA_FILE_PREFIX = 'PAYMENT_MEDIA';
const MEDIA_FILE_EXTENSION = 'txt';

@Controller('api/v1')
export class FnSfr02309Controller {
  @Post('/tax-filings/submission-summaries')
  @HttpCode(200)
  async createSubmissionSummary(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const submissionYear = data['submissionYear'];
    const incomeCategory = data['incomeCategory'];
    if (typeof submissionYear !== 'string' || !/^[0-9]{4}$/.test(submissionYear)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '제출 대상 연도는 4자리 숫자로 입력해 주세요.');
    }
    if (typeof incomeCategory !== 'string' || incomeCategory.trim() === '' || incomeCategory.length > 30) {
      throw new ApiError(400, 'VALIDATION_FAILED', '소득 구분을 30자 이내로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const sums = await db.query(
        `SELECT COUNT(*) AS "cnt",
                COALESCE(SUM(total_payment_amount), 0) AS "total"
           FROM income_certificate
          WHERE document_type = 'PAYMENT_STATEMENT'
            AND certificate_category = :incomeCategory
            AND to_char(period_start, 'YYYY') = :submissionYear`,
        { incomeCategory, submissionYear },
      );
      const count = Number(sums[0]['cnt']);
      if (count === 0) {
        throw new ApiError(404, 'PAYMENT_STATEMENT_NOT_FOUND', '제출 대상 지급명세서 데이터가 없습니다.');
      }
      const rows = await db.query(
        `INSERT INTO tax_filing
           (filing_type, submission_year, income_category, filing_status, total_amount, created_at, updated_at)
         VALUES
           ('SUBMISSION_SUMMARY', :submissionYear, :incomeCategory, 'DRAFT', CAST(:totalAmount AS numeric), now(), now())
         RETURNING tax_filing_id AS "taxFilingId", total_amount AS "totalAmount"`,
        { submissionYear, incomeCategory, totalAmount: Number(sums[0]['total']) },
      );
      return rows[0];
    });
  }

  @Post('/tax-filings/:taxFilingId/generate-media')
  @HttpCode(200)
  async generatePaymentMediaFile(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const idText = req.params['taxFilingId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '세무 신고서 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const filings = await db.query(
        `SELECT tax_filing_id AS "taxFilingId",
                filing_type AS "filingType",
                submission_year AS "submissionYear",
                income_category AS "incomeCategory"
           FROM tax_filing
          WHERE tax_filing_id = CAST(:id AS bigint)`,
        { id: idText },
      );
      if (filings.length === 0 || filings[0]['filingType'] !== 'SUBMISSION_SUMMARY') {
        throw new ApiError(404, 'TAX_FILING_NOT_FOUND', '제출집계표를 찾을 수 없습니다.');
      }
      const filing = filings[0];
      const year = filing['submissionYear'];
      const category = filing['incomeCategory'];
      if (!year || !category) {
        throw new ApiError(422, 'MEDIA_SPEC_VALIDATION_FAILED', '제출 연도 또는 소득 구분이 없어 국세청 제출 규격 검증에 실패했습니다.');
      }
      // 가정: 규격 검증은 대상 지급명세서마다 총지급액·원천징수세액·주민등록번호가 모두 있는지 확인한다
      const checkRows = await db.query(
        `SELECT COUNT(*) AS "total",
                COALESCE(SUM(CASE WHEN total_payment_amount IS NULL
                                    OR withheld_tax_amount IS NULL
                                    OR resident_number_enc IS NULL THEN 1 ELSE 0 END), 0) AS "invalid"
           FROM income_certificate
          WHERE document_type = 'PAYMENT_STATEMENT'
            AND certificate_category = :category
            AND to_char(period_start, 'YYYY') = :year`,
        { category, year },
      );
      if (Number(checkRows[0]['total']) === 0) {
        throw new ApiError(404, 'TAX_FILING_NOT_FOUND', '제출집계표에 해당하는 지급명세서 데이터가 없습니다.');
      }
      const invalid = Number(checkRows[0]['invalid']);
      if (invalid > 0) {
        throw new ApiError(422, 'MEDIA_SPEC_VALIDATION_FAILED', `국세청 제출 규격 검증에 실패했습니다. 필수 값이 빠진 지급명세서가 ${invalid}건 있습니다.`);
      }
      const fileName = `${MEDIA_FILE_PREFIX}_${year}_${category}_${idText}.${MEDIA_FILE_EXTENSION}`;
      return { fileName };
    });
  }
}
