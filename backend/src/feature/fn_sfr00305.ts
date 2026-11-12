import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const ADJUSTMENT_TYPES = ['추경예산', '전용', '이용', '예비비'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 예산잔액은 마감·승인된 예산조정의 증감 합계로 계산한다 (예산 원장 테이블이 스펙에 없음).
// 전용·이용은 출처 예산과목에서 빠지고 상대 예산과목에 더해진다. 추경예산·예비비는 대상 예산과목에 더해진다.
const REMAINING_BASE = `COALESCE((SELECT SUM(CASE WHEN a.budget_account_id = ba.budget_account_id THEN (CASE WHEN a.adjustment_type IN ('전용', '이용') THEN -a.adjustment_amount ELSE a.adjustment_amount END) ELSE a.adjustment_amount END) FROM budget_adjustment a WHERE (a.budget_account_id = ba.budget_account_id OR a.target_budget_account_id = ba.budget_account_id) AND a.approval_status IN ('마감', '승인')`;
const REMAINING_WITH_PROJECT = REMAINING_BASE + ` AND a.project_id = CAST(:projectId AS bigint)), 0)`;
const REMAINING_ALL = REMAINING_BASE + `), 0)`;

function optInt(v: unknown, name: string): number | null {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string' && typeof v !== 'number') {
    throw new ApiError(400, 'VALIDATION_FAILED', `${name} 형식이 올바르지 않습니다.`);
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${name} 형식이 올바르지 않습니다.`);
  }
  return n;
}

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

@Controller('api/v1')
export class FnSfr00305Controller {
  @Get('/budget-accounts/execution-status')
  async listBudgetAccountExecutionStatus(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const projectId = optInt(q['projectId'], '프로젝트');
    const budgetAccountId = optInt(q['budgetAccountId'], '예산과목');
    const pageRaw = isBlank(q['page']) ? 0 : Number(q['page']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호 형식이 올바르지 않습니다.');
    }
    const sizeRaw = isBlank(q['size']) ? DEFAULT_SIZE : Number(q['size']);
    if (!Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기 형식이 올바르지 않습니다.');
    }
    const size = Math.min(sizeRaw, MAX_SIZE);
    return transaction(async (db) => {
      const filterParams: Record<string, unknown> = {};
      let where = '';
      if (budgetAccountId !== null) {
        where = ' WHERE ba.budget_account_id = CAST(:budgetAccountId AS bigint)';
        filterParams['budgetAccountId'] = budgetAccountId;
      }
      let remaining = REMAINING_ALL;
      const listParams: Record<string, unknown> = { ...filterParams, size, offset: pageRaw * size };
      if (projectId !== null) {
        remaining = REMAINING_WITH_PROJECT;
        listParams['projectId'] = projectId;
      }
      const items = await db.query(
        `SELECT ba.budget_account_id AS "budgetAccountId", 0 AS "executedAmount", ${remaining} AS "remainingAmount" FROM budget_account ba${where} ORDER BY ba.budget_account_id LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        listParams,
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM budget_account ba${where}`,
        filterParams,
      );
      return { items, page: pageRaw, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/budget-adjustments')
  @HttpCode(200)
  async createBudgetAdjustment(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    if (isBlank(data['adjustmentType']) || isBlank(data['adjustmentAmount'])) {
      throw new ApiError(422, 'BUDGET_ADJUSTMENT_REQUIRED_VALUE_MISSING', '조정 구분과 조정 금액을 입력해 주세요.');
    }
    const adjustmentType = data['adjustmentType'];
    if (typeof adjustmentType !== 'string' || !ADJUSTMENT_TYPES.includes(adjustmentType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조정 구분은 추경예산, 전용, 이용, 예비비 중 하나여야 합니다.');
    }
    const rawAmount = data['adjustmentAmount'];
    const amount = typeof rawAmount === 'number' || (typeof rawAmount === 'string' && rawAmount.trim() !== '') ? Number(rawAmount) : NaN;
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조정 금액은 0보다 큰 숫자여야 합니다.');
    }
    const projectId = optInt(data['projectId'], '프로젝트');
    const budgetAccountId = optInt(data['budgetAccountId'], '예산과목');
    if (projectId === null || budgetAccountId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '프로젝트와 예산과목을 선택해 주세요.');
    }
    const needTarget = adjustmentType === '전용' || adjustmentType === '이용';
    const targetBudgetAccountId = needTarget ? optInt(data['targetBudgetAccountId'], '상대 예산과목') : null;
    if (needTarget && targetBudgetAccountId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '전용·이용은 상대 예산과목을 선택해 주세요.');
    }
    if (targetBudgetAccountId !== null && targetBudgetAccountId === budgetAccountId) {
      throw new ApiError(400, 'VALIDATION_FAILED', '상대 예산과목은 예산과목과 달라야 합니다.');
    }
    return transaction(async (db) => {
      const projects = await db.query(
        `SELECT project_id AS "projectId" FROM project WHERE project_id = CAST(:id AS bigint)`,
        { id: projectId },
      );
      if (projects.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      const accountIds = targetBudgetAccountId === null ? [budgetAccountId] : [budgetAccountId, targetBudgetAccountId];
      for (const id of accountIds) {
        const found = await db.query(
          `SELECT budget_account_id AS "budgetAccountId" FROM budget_account WHERE budget_account_id = CAST(:id AS bigint)`,
          { id },
        );
        if (found.length === 0) {
          throw new ApiError(404, 'NOT_FOUND', '예산과목을 찾을 수 없습니다.');
        }
      }
      if (needTarget) {
        // 가정: 전용·이용은 금액이 빠져나가는 출처 예산과목의 잔액이 조정 금액 이상이어야 한다.
        const balances = await db.query(
          `SELECT ${REMAINING_ALL} AS "remaining" FROM budget_account ba WHERE ba.budget_account_id = CAST(:id AS bigint)`,
          { id: budgetAccountId },
        );
        if (Number(balances[0]['remaining']) < amount) {
          throw new ApiError(422, 'BUDGET_BALANCE_INSUFFICIENT', '예산과목의 잔액이 부족해 신청할 수 없습니다.');
        }
      }
      const rows = await db.query(
        `INSERT INTO budget_adjustment (project_id, budget_account_id, target_budget_account_id, adjustment_type, adjustment_amount, approval_status, created_at, updated_at) VALUES (CAST(:projectId AS bigint), CAST(:budgetAccountId AS bigint), CAST(:targetBudgetAccountId AS bigint), :adjustmentType, CAST(:amount AS numeric), '신청', now(), now()) RETURNING budget_adjustment_id AS "budgetAdjustmentId", approval_status AS "approvalStatus"`,
        {
          projectId,
          budgetAccountId,
          targetBudgetAccountId,
          adjustmentType,
          amount: String(amount),
        },
      );
      return rows[0];
    });
  }

  @Post('/budget-adjustments/:budgetAdjustmentId/close')
  @HttpCode(200)
  async closeBudgetAdjustment(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['budgetAdjustmentId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '예산조정 ID 형식이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT approval_status AS "approvalStatus" FROM budget_adjustment WHERE budget_adjustment_id = CAST(:id AS bigint)`,
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'BUDGET_ADJUSTMENT_NOT_FOUND', '예산조정을 찾을 수 없습니다.');
      }
      if (found[0]['approvalStatus'] !== '신청') {
        throw new ApiError(409, 'BUDGET_ADJUSTMENT_STATUS_CONFLICT', '신청 상태의 예산조정만 마감할 수 있습니다.');
      }
      const rows = await db.query(
        `UPDATE budget_adjustment SET approval_status = '마감', updated_at = now() WHERE budget_adjustment_id = CAST(:id AS bigint) AND approval_status = '신청' RETURNING approval_status AS "approvalStatus"`,
        { id: idText },
      );
      if (rows.length === 0) {
        throw new ApiError(409, 'BUDGET_ADJUSTMENT_STATUS_CONFLICT', '신청 상태의 예산조정만 마감할 수 있습니다.');
      }
      return rows[0];
    });
  }
}
