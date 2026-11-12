import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 자동전표 최초 상태, 실행예산 최초 상태, 연계 구분, 적요 문구는 스펙에 값이 없어 아래 상수로 정한다.
const JOURNAL_STATUS = '신청';
const EXECUTION_STATUS = '신청';
const LINK_TYPE = 'BUDGET_REFLECT';
const JOURNAL_SUMMARY = '지출결의서 자동전표';

@Controller('api/v1')
export class FnSfr03211Controller {
  @Post('/expense-resolutions/:expenseResolutionId/reflect-budget')
  @HttpCode(200)
  async reflectExpenseResolutionBudget(@Req() req: Request) {
    const user = currentUser(req);
    user.require('로그인 사용자');
    const data = checks.inputOf(req.body);
    const resolutionId = req.params['expenseResolutionId'];
    if (!/^\d+$/.test(resolutionId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결의서 ID가 올바르지 않습니다.');
    }
    const raw = data['accountSubjectId'];
    let requestedSubjectId: string | null = null;
    if (raw !== undefined && raw !== null && raw !== '') {
      const okNumber = typeof raw === 'number' && Number.isInteger(raw) && raw > 0;
      const okString = typeof raw === 'string' && /^\d+$/.test(raw);
      if (!okNumber && !okString) {
        throw new ApiError(400, 'VALIDATION_FAILED', '계정과목 ID는 숫자여야 합니다.');
      }
      requestedSubjectId = String(raw);
    }

    return transaction(async (db) => {
      // 같은 결의서의 동시 처리를 막기 위해 행을 잠근다.
      const resolutions = await db.query(
        'SELECT expense_resolution_id AS "expenseResolutionId", project_id AS "projectId", budget_account_id AS "budgetAccountId", status AS "status", resolution_amount AS "resolutionAmount" FROM expense_resolution WHERE expense_resolution_id = CAST(:id AS bigint) FOR UPDATE',
        { id: resolutionId },
      );
      if (resolutions.length === 0) {
        throw new ApiError(404, 'EXPENSE_RESOLUTION_NOT_FOUND', '결의서를 찾을 수 없습니다.');
      }
      const resolution = resolutions[0];

      const reflected = await db.query(
        'SELECT journal_entry_id AS "journalEntryId" FROM journal_entry WHERE expense_resolution_id = CAST(:id AS bigint)',
        { id: resolutionId },
      );
      if (reflected.length > 0) {
        throw new ApiError(409, 'EXPENSE_RESOLUTION_ALREADY_REFLECTED', '이미 반영된 결의서입니다.');
      }

      // 가정: 결재 승인된 결의서(상태 '승인')만 반영할 수 있다.
      if (resolution.status !== '승인') {
        throw new ApiError(409, 'INVALID_STATE', '결재 승인된 결의서만 반영할 수 있습니다.');
      }

      let subjectId = requestedSubjectId;
      if (subjectId === null) {
        const mapped = await db.query(
          'SELECT account_subject_id AS "accountSubjectId" FROM budget_account WHERE budget_account_id = CAST(:budgetAccountId AS bigint)',
          { budgetAccountId: String(resolution.budgetAccountId) },
        );
        if (mapped.length > 0 && mapped[0].accountSubjectId !== null && mapped[0].accountSubjectId !== undefined) {
          subjectId = String(mapped[0].accountSubjectId);
        }
      }
      if (subjectId === null) {
        throw new ApiError(422, 'ACCOUNT_MAPPING_NOT_FOUND', '계정과목 매핑 기준이 없어 전표를 만들 수 없습니다.');
      }
      const subjects = await db.query(
        'SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:sid AS bigint)',
        { sid: subjectId },
      );
      if (subjects.length === 0) {
        throw new ApiError(422, 'ACCOUNT_MAPPING_NOT_FOUND', '계정과목 매핑 기준이 없어 전표를 만들 수 없습니다.');
      }

      // 가정: 결의서의 프로젝트·예산과목에 해당하는 가장 최근 회계연도의 본예산에 현재 월 집행액을 더한다.
      const mains = await db.query(
        'SELECT budget_main_id AS "budgetMainId" FROM budget_main WHERE project_id = CAST(:projectId AS bigint) AND budget_account_id = CAST(:budgetAccountId AS bigint) ORDER BY fiscal_year DESC LIMIT 1',
        { projectId: String(resolution.projectId), budgetAccountId: String(resolution.budgetAccountId) },
      );
      if (mains.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '결의서의 프로젝트·예산과목에 해당하는 본예산이 없습니다.');
      }

      // 연계 이력: 요청 시점 기록 (값의 출처 표 기준)
      await db.query(
        'INSERT INTO link_log (requester_id, link_target, link_type, status, requested_at, request_summary, created_at, updated_at) VALUES (CAST(:userId AS bigint), \'LEGACY_ERP\', :linkType, \'REQUESTED\', now(), :summary, now(), now()) RETURNING link_log_id AS "linkLogId"',
        { userId: user.id, linkType: LINK_TYPE, summary: 'expenseResolutionId=' + resolutionId },
      );

      const executions = await db.query(
        'INSERT INTO budget_execution (budget_main_id, execution_month, execution_amount, approval_status, created_at, updated_at) VALUES (CAST(:mainId AS bigint), CAST(EXTRACT(MONTH FROM now()) AS integer), CAST(:amount AS numeric), :status, now(), now()) ON CONFLICT (budget_main_id, execution_month) DO UPDATE SET execution_amount = budget_execution.execution_amount + EXCLUDED.execution_amount, updated_at = now() RETURNING execution_amount AS "executionAmount"',
        { mainId: String(mains[0].budgetMainId), amount: String(resolution.resolutionAmount), status: EXECUTION_STATUS },
      );

      const journals = await db.query(
        'INSERT INTO journal_entry (expense_resolution_id, entry_date, status, total_debit_amount, total_credit_amount, summary, created_at, updated_at) VALUES (CAST(:id AS bigint), CAST(now() AS date), :status, CAST(:amount AS numeric), CAST(:amount AS numeric), :summary, now(), now()) RETURNING journal_entry_id AS "journalEntryId", to_char(entry_date, \'YYYY-MM-DD\') AS "entryDate", total_debit_amount AS "totalDebitAmount", total_credit_amount AS "totalCreditAmount"',
        { id: resolutionId, status: JOURNAL_STATUS, amount: String(resolution.resolutionAmount), summary: JOURNAL_SUMMARY },
      );
      const journal = journals[0];

      return {
        journalEntryId: journal.journalEntryId,
        entryDate: journal.entryDate,
        totalDebitAmount: journal.totalDebitAmount,
        totalCreditAmount: journal.totalCreditAmount,
        executionAmount: executions[0].executionAmount,
      };
    });
  }
}
