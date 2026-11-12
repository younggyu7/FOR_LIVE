import { Controller, Get, Put, Delete, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

function toId(value: unknown, label: string): string {
  const text = String(value ?? '');
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return text;
}

function toAmount(value: unknown): string {
  if (value === undefined || value === null || value === '' || typeof value === 'boolean') {
    throw new ApiError(400, 'VALIDATION_FAILED', '품의 금액을 입력해 주세요.');
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '품의 금액은 0보다 큰 숫자여야 합니다.');
  }
  return String(num);
}

@Controller('api/v1')
export class FnSfr02401Controller {
  @Put('/requisitions/:requisitionId')
  async updateRequisition(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const requisitionId = toId(req.params['requisitionId'], '품의서 ID');
    const data = checks.inputOf(req.body);
    const projectId = toId(data['projectId'], '프로젝트');
    const budgetAccountId = toId(data['budgetAccountId'], '예산과목');
    const title = typeof data['title'] === 'string' ? data['title'].trim() : '';
    if (title === '' || title.length > 200) {
      throw new ApiError(400, 'VALIDATION_FAILED', '품의 제목은 1자 이상 200자 이하로 입력해 주세요.');
    }
    const amount = toAmount(data['requisitionAmount']);
    const content = data['content'] === undefined || data['content'] === null ? null : String(data['content']);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT status AS "status" FROM requisition WHERE requisition_id = CAST(:id AS bigint)',
        { id: requisitionId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'REQUISITION_NOT_FOUND', '품의서를 찾을 수 없습니다.');
      }
      if (found[0]['status'] === '승인') {
        throw new ApiError(409, 'REQUISITION_APPROVED', '승인된 품의서는 수정할 수 없습니다. 승인 취소 또는 회수 절차를 진행해 주세요.');
      }
      const project = await db.query(
        'SELECT project_id FROM project WHERE project_id = CAST(:id AS bigint)',
        { id: projectId },
      );
      if (project.length === 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '선택한 프로젝트가 없습니다.');
      }
      const account = await db.query(
        'SELECT budget_account_id FROM budget_account WHERE budget_account_id = CAST(:id AS bigint)',
        { id: budgetAccountId },
      );
      if (account.length === 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '선택한 예산과목이 없습니다.');
      }
      // TODO(예산 통제): 예산잔액 초과 시 422 BUDGET_BALANCE_EXCEEDED. 실행예산 테이블이 schema.sql에 없어 구현하지 못함
      await db.execute(
        'UPDATE requisition SET project_id = CAST(:projectId AS bigint), budget_account_id = CAST(:budgetAccountId AS bigint), title = :title, requisition_amount = CAST(:amount AS numeric), content = :content, updated_at = now() WHERE requisition_id = CAST(:id AS bigint)',
        { projectId, budgetAccountId, title, amount, content, id: requisitionId },
      );
      return { requisitionId: Number(requisitionId) };
    });
  }

  @Delete('/requisitions/:requisitionId')
  async deleteRequisition(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const requisitionId = toId(req.params['requisitionId'], '품의서 ID');
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT status AS "status" FROM requisition WHERE requisition_id = CAST(:id AS bigint)',
        { id: requisitionId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'REQUISITION_NOT_FOUND', '품의서를 찾을 수 없습니다.');
      }
      if (found[0]['status'] === '승인') {
        throw new ApiError(409, 'REQUISITION_APPROVED', '승인된 품의서는 삭제할 수 없습니다. 승인 취소 또는 회수 절차를 진행해 주세요.');
      }
      await db.execute(
        'DELETE FROM requisition WHERE requisition_id = CAST(:id AS bigint)',
        { id: requisitionId },
      );
      return {};
    });
  }

  @Get('/requisitions/budget-status')
  async listRequisitionBudgetStatus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const projectId = query['projectId'] === undefined || query['projectId'] === '' ? null : toId(query['projectId'], '프로젝트');
    const budgetAccountId = query['budgetAccountId'] === undefined || query['budgetAccountId'] === '' ? null : toId(query['budgetAccountId'], '예산과목');
    const rawPage = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const rawSize = query['size'] === undefined || query['size'] === '' ? 20 : Number(query['size']);
    if (!Number.isInteger(rawPage) || rawPage < 0 || !Number.isInteger(rawSize) || rawSize < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호 또는 크기가 올바르지 않습니다.');
    }
    const page = rawPage;
    const size = Math.min(rawSize, 200);
    const where = '(CAST(:projectId AS bigint) IS NULL OR project_id = CAST(:projectId AS bigint)) AND (CAST(:budgetAccountId AS bigint) IS NULL OR budget_account_id = CAST(:budgetAccountId AS bigint))';
    return transaction(async (db) => {
      const counted = await db.query(
        'SELECT COUNT(*) AS "total" FROM requisition WHERE ' + where,
        { projectId, budgetAccountId },
      );
      // 실행예산액·이월예산액·집행액은 출처가 미정이고 해당 테이블이 schema.sql에 없어 0으로 둔다 (TODO)
      const items = await db.query(
        'SELECT requisition_id AS "requisitionId", title AS "title", requisition_amount AS "requisitionAmount", '
          + 'CAST(0 AS numeric) AS "executionBudgetAmount", CAST(0 AS numeric) AS "carryoverBudgetAmount", '
          + 'CAST(0 AS numeric) + CAST(0 AS numeric) AS "totalBudgetAmount", CAST(0 AS numeric) AS "executedAmount", '
          + 'CAST(0 AS numeric) + CAST(0 AS numeric) - CAST(0 AS numeric) AS "budgetBalanceAmount" '
          + 'FROM requisition WHERE ' + where + ' ORDER BY requisition_id DESC LIMIT :size OFFSET :offset',
        { projectId, budgetAccountId, size, offset: page * size },
      );
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }
}
