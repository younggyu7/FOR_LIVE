import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const CONFLICT_CODE = 'BUDGET_EXECUTION_STATUS_CONFLICT';

type Db = {
  query: (sql: string, params?: Record<string, unknown>) => Promise<any[]>;
  execute: (sql: string, params?: Record<string, unknown>) => Promise<number>;
};

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || String(v).trim() === '';
}

function isNumeric(v: unknown): boolean {
  return !isBlank(v) && Number.isFinite(Number(v));
}

function isInt(v: unknown): boolean {
  return isNumeric(v) && Number.isInteger(Number(v));
}

function orNull(v: unknown): string | null {
  return isBlank(v) ? null : String(v);
}

// 상태 전환: 허용된 현재 상태에서만 바꾼다. 아니면 409.
async function changeStatus(db: Db, id: string, from: string, to: string) {
  if (!isInt(id)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '실행예산 ID 형식이 올바르지 않습니다.');
  }
  const rows = await db.query(
    'SELECT approval_status AS "approvalStatus" FROM budget_execution WHERE budget_execution_id = CAST(:id AS bigint) FOR UPDATE',
    { id },
  );
  if (rows.length === 0) {
    throw new ApiError(404, 'BUDGET_EXECUTION_NOT_FOUND', '실행예산을 찾을 수 없습니다.');
  }
  if (rows[0].approvalStatus !== from) {
    throw new ApiError(409, CONFLICT_CODE, '현재 상태에서는 처리할 수 없습니다.');
  }
  const out = await db.query(
    'UPDATE budget_execution SET approval_status = :to, updated_at = now() WHERE budget_execution_id = CAST(:id AS bigint) RETURNING approval_status AS "approvalStatus"',
    { id, to },
  );
  return { approvalStatus: out[0].approvalStatus };
}

@Controller('api/v1')
export class FnSfr00303Controller {
  @Get('/budget-executions')
  async listBudgetExecutions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const pageNo = isInt(q['page']) && Number(q['page']) >= 0 ? Number(q['page']) : 0;
    let size = isInt(q['size']) && Number(q['size']) > 0 ? Number(q['size']) : DEFAULT_SIZE;
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    for (const k of ['fiscalYear', 'budgetAccountId', 'projectId']) {
      if (!isBlank(q[k]) && !isInt(q[k])) {
        throw new ApiError(400, 'VALIDATION_FAILED', '조회 조건 형식이 올바르지 않습니다.');
      }
    }
    const params = {
      accountingUnit: orNull(q['accountingUnit']),
      fiscalYear: orNull(q['fiscalYear']),
      budgetGroup: orNull(q['budgetGroup']),
      budgetAccountId: orNull(q['budgetAccountId']),
      projectId: orNull(q['projectId']),
      size,
      offset: pageNo * size,
    };
    const where =
      ' FROM budget_execution e JOIN budget_main m ON m.budget_main_id = e.budget_main_id' +
      ' WHERE (CAST(:accountingUnit AS varchar) IS NULL OR m.accounting_unit = CAST(:accountingUnit AS varchar))' +
      ' AND (CAST(:fiscalYear AS integer) IS NULL OR m.fiscal_year = CAST(:fiscalYear AS integer))' +
      ' AND (CAST(:budgetGroup AS varchar) IS NULL OR m.budget_group = CAST(:budgetGroup AS varchar))' +
      ' AND (CAST(:budgetAccountId AS bigint) IS NULL OR m.budget_account_id = CAST(:budgetAccountId AS bigint))' +
      ' AND (CAST(:projectId AS bigint) IS NULL OR m.project_id = CAST(:projectId AS bigint))';
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT e.budget_execution_id AS "budgetExecutionId", e.budget_main_id AS "budgetMainId",' +
          ' e.execution_month AS "executionMonth", e.execution_amount AS "executionAmount",' +
          ' e.approval_status AS "approvalStatus"' +
          where +
          ' ORDER BY e.budget_execution_id DESC LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        params,
      );
      const counts = await db.query('SELECT COUNT(*) AS "total"' + where, params);
      return { items, page: pageNo, size, total: Number(counts[0].total) };
    });
  }

  @Post('/budget-executions')
  @HttpCode(200)
  async createBudgetExecution(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    if (!isInt(data['budgetMainId'])) {
      throw new ApiError(400, 'VALIDATION_FAILED', '본예산을 선택해 주세요.');
    }
    if (!isInt(data['executionMonth']) || Number(data['executionMonth']) < 1 || Number(data['executionMonth']) > 12) {
      throw new ApiError(400, 'VALIDATION_FAILED', '편성월은 1~12 사이의 정수여야 합니다.');
    }
    if (!isNumeric(data['executionAmount']) || Number(data['executionAmount']) < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '실행예산 금액은 0 이상의 숫자여야 합니다.');
    }
    const params = {
      budgetMainId: String(data['budgetMainId']),
      executionMonth: String(data['executionMonth']),
      executionAmount: String(data['executionAmount']),
    };
    return transaction(async (db) => {
      const mains = await db.query(
        'SELECT approval_status AS "approvalStatus", requested_amount AS "requestedAmount" FROM budget_main WHERE budget_main_id = CAST(:budgetMainId AS bigint)',
        { budgetMainId: params.budgetMainId },
      );
      if (mains.length === 0) {
        throw new ApiError(404, 'BUDGET_MAIN_NOT_FOUND', '기반 본예산을 찾을 수 없습니다.');
      }
      if (mains[0].approvalStatus !== '승인') {
        throw new ApiError(409, 'BUDGET_MAIN_NOT_APPROVED', '승인된 본예산이 아닙니다.');
      }
      const dup = await db.query(
        'SELECT budget_execution_id FROM budget_execution WHERE budget_main_id = CAST(:budgetMainId AS bigint) AND execution_month = CAST(:executionMonth AS integer)',
        { budgetMainId: params.budgetMainId, executionMonth: params.executionMonth },
      );
      if (dup.length > 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '이미 해당 월의 실행예산이 편성되어 있습니다.');
      }
      // 가정: 월별 실행예산 금액의 합계는 본예산 신청금액을 넘을 수 없다.
      const sums = await db.query(
        'SELECT COALESCE(SUM(execution_amount), 0) AS "used" FROM budget_execution WHERE budget_main_id = CAST(:budgetMainId AS bigint)',
        { budgetMainId: params.budgetMainId },
      );
      const used = Number(sums[0].used);
      if (used + Number(params.executionAmount) > Number(mains[0].requestedAmount)) {
        throw new ApiError(422, 'EXECUTION_AMOUNT_EXCEEDS_BUDGET', '월별 금액이 본예산 범위를 초과했습니다.');
      }
      const rows = await db.query(
        'INSERT INTO budget_execution (budget_main_id, execution_month, execution_amount, approval_status, created_at, updated_at)' +
          ' VALUES (CAST(:budgetMainId AS bigint), CAST(:executionMonth AS integer), CAST(:executionAmount AS numeric), :status, now(), now())' +
          ' RETURNING budget_execution_id AS "budgetExecutionId", approval_status AS "approvalStatus"',
        { ...params, status: '신청' },
      );
      return { budgetExecutionId: Number(rows[0].budgetExecutionId), approvalStatus: rows[0].approvalStatus };
    });
  }

  @Post('/budget-executions/:budgetExecutionId/close')
  @HttpCode(200)
  async closeBudgetExecution(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['budgetExecutionId'];
    return transaction(async (db) => changeStatus(db, id, '신청', '마감'));
  }

  @Post('/budget-executions/:budgetExecutionId/cancel-close')
  @HttpCode(200)
  async cancelCloseBudgetExecution(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['budgetExecutionId'];
    return transaction(async (db) => changeStatus(db, id, '마감', '마감 취소'));
  }

  @Post('/budget-executions/:budgetExecutionId/approve')
  @HttpCode(200)
  async approveBudgetExecution(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['budgetExecutionId'];
    return transaction(async (db) => changeStatus(db, id, '마감', '승인'));
  }

  @Post('/budget-executions/:budgetExecutionId/cancel-approval')
  @HttpCode(200)
  async cancelApprovalBudgetExecution(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['budgetExecutionId'];
    return transaction(async (db) => changeStatus(db, id, '승인', '승인 취소'));
  }
}
