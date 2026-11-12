import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 집행액은 결재대기·승인·완료 상태의 결의서 금액 합계이며, 통제 주기 기간의 결의서만 센다.
// 가정: 실행예산은 반려·승인 취소 건을 뺀 월별 금액이고, 예산조정은 승인된 건만 반영한다.
const COUNTED_RESOLUTION_STATUSES = ['결재대기', '승인', '완료'];

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

@Controller('api/v1')
export class FnSfr03210Controller {
  @Get('/budget-controls')
  async getBudgetControl(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const projectIdText = String(query['projectId'] ?? '').trim();
    const accountIdText = String(query['budgetAccountId'] ?? '').trim();
    const baseDateText = String(query['baseDate'] ?? '').trim();
    const requestAmountText = String(query['requestAmount'] ?? '').trim();
    if (!/^\d+$/.test(projectIdText) || !/^\d+$/.test(accountIdText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '프로젝트와 예산과목을 지정해 주세요.');
    }
    if (baseDateText !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(baseDateText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '기준 일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    if (requestAmountText !== '' && !Number.isFinite(Number(requestAmountText))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '집행 요청 금액은 숫자로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const accounts = await db.query(
        `SELECT control_cycle AS "controlCycle" FROM budget_account WHERE budget_account_id = CAST(:accountId AS bigint)`,
        { accountId: accountIdText },
      );
      if (accounts.length === 0) {
        throw new ApiError(404, 'BUDGET_BASIS_NOT_FOUND', '예산과목이 없습니다. 기준정보를 확인해 주세요.');
      }
      const controlCycle = String(accounts[0]['controlCycle']);
      const projects = await db.query(
        `SELECT project_id AS "projectId" FROM project WHERE project_id = CAST(:projectId AS bigint)`,
        { projectId: projectIdText },
      );
      if (projects.length === 0) {
        throw new ApiError(404, 'BUDGET_BASIS_NOT_FOUND', '프로젝트가 없습니다. 기준정보를 확인해 주세요.');
      }
      const baseRows = await db.query(
        `SELECT CAST(date_part('month', COALESCE(CAST(:baseDate AS date), CURRENT_DATE)) AS integer) AS "month",
          CAST(date_part('year', COALESCE(CAST(:baseDate AS date), CURRENT_DATE)) AS integer) AS "year"`,
        { baseDate: baseDateText === '' ? null : baseDateText },
      );
      const month = toNumber(baseRows[0]['month']);
      const year = toNumber(baseRows[0]['year']);
      let fromMonth = 1;
      let toMonth = 12;
      if (controlCycle === '월') {
        fromMonth = month;
        toMonth = month;
      } else if (controlCycle === '분기') {
        const quarterIndex = Math.floor((month - 1) / 3);
        fromMonth = quarterIndex * 3 + 1;
        toMonth = quarterIndex * 3 + 3;
      }
      const executionRows = await db.query(
        `SELECT COUNT(*) AS "cnt",
          COALESCE(SUM(CASE WHEN e.execution_month BETWEEN CAST(:fromMonth AS integer) AND CAST(:toMonth AS integer) THEN e.execution_amount ELSE 0 END), 0) AS "amount"
        FROM budget_execution e
        JOIN budget_main m ON m.budget_main_id = e.budget_main_id
        WHERE m.project_id = CAST(:projectId AS bigint)
          AND m.budget_account_id = CAST(:accountId AS bigint)
          AND m.fiscal_year = CAST(:year AS integer)
          AND e.approval_status NOT IN ('반려', '승인 취소')`,
        { projectId: projectIdText, accountId: accountIdText, year, fromMonth, toMonth },
      );
      if (toNumber(executionRows[0]['cnt']) === 0) {
        throw new ApiError(404, 'BUDGET_BASIS_NOT_FOUND', '실행예산이 없습니다. 기준정보를 확인해 주세요.');
      }
      const adjustmentRows = await db.query(
        `SELECT COALESCE(SUM(CASE
            WHEN adjustment_type IN ('추경예산', '예비비') AND budget_account_id = CAST(:accountId AS bigint) THEN adjustment_amount
            WHEN adjustment_type IN ('전용', '이용') AND target_budget_account_id = CAST(:accountId AS bigint) THEN adjustment_amount
            WHEN adjustment_type IN ('전용', '이용') AND budget_account_id = CAST(:accountId AS bigint) THEN 0 - adjustment_amount
            ELSE 0 END), 0) AS "amount"
        FROM budget_adjustment
        WHERE project_id = CAST(:projectId AS bigint)
          AND approval_status = '승인'
          AND (budget_account_id = CAST(:accountId AS bigint) OR target_budget_account_id = CAST(:accountId AS bigint))`,
        { projectId: projectIdText, accountId: accountIdText },
      );
      const executedRows = await db.query(
        `SELECT COALESCE(SUM(resolution_amount), 0) AS "amount"
        FROM expense_resolution
        WHERE project_id = CAST(:projectId AS bigint)
          AND budget_account_id = CAST(:accountId AS bigint)
          AND status IN ('결재대기', '승인', '완료')
          AND date_part('year', created_at) = CAST(:year AS integer)
          AND date_part('month', created_at) BETWEEN CAST(:fromMonth AS integer) AND CAST(:toMonth AS integer)`,
        { projectId: projectIdText, accountId: accountIdText, year, fromMonth, toMonth },
      );
      const allocatedAmount = toNumber(executionRows[0]['amount']) + toNumber(adjustmentRows[0]['amount']);
      const executedAmount = toNumber(executedRows[0]['amount']);
      const balanceAmount = allocatedAmount - executedAmount;
      if (requestAmountText !== '' && Number(requestAmountText) > balanceAmount) {
        throw new ApiError(422, 'BUDGET_BALANCE_EXCEEDED', '요청 금액이 예산 잔액을 초과했습니다. 집행을 진행할 수 없습니다.');
      }
      return {
        allocatedAmount,
        executedAmount,
        balanceAmount,
        controlCycle,
        executable: true,
      };
    });
  }
}
