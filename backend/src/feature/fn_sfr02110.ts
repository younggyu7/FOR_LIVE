import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 급여구분(payroll_run.payroll_type)을 payroll_account_mapping.payroll_type 값으로 바꾸는 표
const PAYROLL_TYPE_MAP: Record<string, string> = {
  REGULAR: '상용직',
  DAILY: '일용직',
  SEVERANCE: '퇴직금',
};

// 가정: 전표 최초 상태
const INITIAL_JOURNAL_STATUS = '신청';

@Controller('api/v1')
export class FnSfr02110Controller {
  @Post('/payroll-runs/:payrollRunId/create-journal-entry')
  @HttpCode(200)
  async createPayrollJournalEntry(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const payrollRunId = req.params['payrollRunId'];
    if (typeof payrollRunId !== 'string' || !/^[0-9]+$/.test(payrollRunId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '급여 지급일 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const runs = await db.query(
        `SELECT payroll_run_id AS "payrollRunId",
                payroll_type AS "payrollType",
                is_closed AS "isClosed",
                journal_status AS "journalStatus"
           FROM payroll_run
          WHERE payroll_run_id = CAST(:payrollRunId AS bigint)
          FOR UPDATE`,
        { payrollRunId },
      );
      if (runs.length === 0) {
        throw new ApiError(404, 'PAYROLL_RUN_NOT_FOUND', '급여 지급일을 찾을 수 없습니다.');
      }
      const run = runs[0];
      if (!run.isClosed) {
        throw new ApiError(409, 'PAYROLL_NOT_CLOSED', '마감되지 않은 급여는 전표처리할 수 없습니다.');
      }
      if (run.journalStatus === 'PROCESSED') {
        throw new ApiError(409, 'JOURNAL_ALREADY_PROCESSED', '이미 전표처리된 급여입니다.');
      }
      const mappingType = PAYROLL_TYPE_MAP[String(run.payrollType)];
      const mappings = await db.query(
        `SELECT payroll_account_mapping_id AS "payrollAccountMappingId"
           FROM payroll_account_mapping
          WHERE payroll_type = :mappingType
            AND is_active = :active`,
        { mappingType: mappingType ?? '', active: '사용' },
      );
      if (mappings.length === 0) {
        throw new ApiError(
          422,
          'ACCOUNT_MAPPING_MISSING',
          `급여구분 '${mappingType ?? String(run.payrollType)}'의 계정과목 매핑이 없습니다. 급여 전표 계정 설정을 먼저 등록해 주세요.`,
        );
      }
      // 가정: expense_resolution_id 출처가 미정이라 가장 먼저 등록된 승인 결의서를 연결한다.
      const resolutions = await db.query(
        `SELECT expense_resolution_id AS "expenseResolutionId"
           FROM expense_resolution
          WHERE status = :status
          ORDER BY expense_resolution_id
          LIMIT 1`,
        { status: '승인' },
      );
      if (resolutions.length === 0) {
        throw new ApiError(409, 'INVALID_STATE', '전표에 연결할 승인된 결의서가 없습니다.');
      }
      // 가정: 급여 금액은 암호문 컬럼뿐이라 차변·대변 합계는 비워 둔다.
      const inserted = await db.query(
        `INSERT INTO journal_entry
           (expense_resolution_id, entry_date, status, created_at, updated_at)
         VALUES
           (CAST(:expenseResolutionId AS bigint), CAST(now() AS date), :status, now(), now())
         RETURNING journal_entry_id AS "journalEntryId",
                   entry_date AS "entryDate",
                   total_debit_amount AS "totalDebitAmount",
                   total_credit_amount AS "totalCreditAmount"`,
        {
          expenseResolutionId: String(resolutions[0].expenseResolutionId),
          status: INITIAL_JOURNAL_STATUS,
        },
      );
      const entry = inserted[0];
      const changed = await db.execute(
        `UPDATE payroll_run
            SET journal_status = :processed,
                journal_entry_id = CAST(:journalEntryId AS bigint),
                updated_at = now()
          WHERE payroll_run_id = CAST(:payrollRunId AS bigint)
            AND journal_status = :unprocessed`,
        {
          processed: 'PROCESSED',
          unprocessed: 'UNPROCESSED',
          journalEntryId: String(entry.journalEntryId),
          payrollRunId,
        },
      );
      if (changed === 0) {
        throw new ApiError(409, 'JOURNAL_ALREADY_PROCESSED', '이미 전표처리된 급여입니다.');
      }
      return {
        journalEntryId: entry.journalEntryId,
        entryDate: entry.entryDate,
        totalDebitAmount: entry.totalDebitAmount,
        totalCreditAmount: entry.totalCreditAmount,
        journalStatus: 'PROCESSED',
      };
    });
  }
}
