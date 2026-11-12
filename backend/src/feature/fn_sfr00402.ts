import { Controller, Get, Post, Put, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

type Db = Parameters<Parameters<typeof transaction>[0]>[0];

const ROLES = ['임직원', '예산·회계 담당자'];
const METHODS = ['카드사용내역', '세금계산서', '통장거래내역', '직접입력'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 새 결의서의 상태는 '기안'으로 시작한다.
const INITIAL_STATUS = '기안';
// 가정: 승인·완료된 결의서는 임의 수정할 수 없다.
const LOCKED_STATUSES = ['승인', '완료'];
// 가정: 집행액은 승인·완료된 결의서의 결의 금액 합계로 본다.
const EXECUTED_STATUSES_SQL = "('승인', '완료')";

function missing(label: string): ApiError {
  return new ApiError(422, 'REQUIRED_FIELD_MISSING', label + ' 항목을 입력해 주세요.');
}

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function idOf(v: unknown, label: string, required: boolean): string | null {
  if (isEmpty(v)) {
    if (required) {
      throw missing(label);
    }
    return null;
  }
  const n = Number(v);
  if (typeof v === 'boolean' || !Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return String(n);
}

function parseBody(data: Record<string, unknown>) {
  const projectId = idOf(data.projectId, '프로젝트', true);
  const budgetAccountId = idOf(data.budgetAccountId, '예산과목', true);
  const partnerId = idOf(data.partnerId, '거래처', true);
  const departmentId = idOf(data.departmentId, '결의부서', true);
  const requisitionId = idOf(data.requisitionId, '품의서', false);
  if (isEmpty(data.resolutionMethod)) {
    throw missing('결의 방식');
  }
  const resolutionMethod = String(data.resolutionMethod);
  if (!METHODS.includes(resolutionMethod)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '결의 방식 값이 올바르지 않습니다.');
  }
  if (isEmpty(data.resolutionAmount)) {
    throw missing('결의 금액');
  }
  const amount = Number(data.resolutionAmount);
  if (typeof data.resolutionAmount === 'boolean' || !Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '결의 금액은 0보다 큰 숫자여야 합니다.');
  }
  return {
    requisitionId,
    projectId,
    budgetAccountId,
    partnerId,
    departmentId,
    resolutionMethod,
    resolutionAmount: String(amount),
  };
}

async function checkRefs(db: Db, p: ReturnType<typeof parseBody>): Promise<void> {
  const project = await db.query('SELECT 1 AS ok FROM project WHERE project_id = CAST(:id AS bigint)', { id: p.projectId });
  if (project.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
  }
  const account = await db.query('SELECT 1 AS ok FROM budget_account WHERE budget_account_id = CAST(:id AS bigint)', { id: p.budgetAccountId });
  if (account.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', '예산과목을 찾을 수 없습니다.');
  }
  const partner = await db.query('SELECT 1 AS ok FROM partner WHERE partner_id = CAST(:id AS bigint)', { id: p.partnerId });
  if (partner.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', '거래처를 찾을 수 없습니다.');
  }
  const dept = await db.query('SELECT 1 AS ok FROM department WHERE department_id = CAST(:id AS bigint)', { id: p.departmentId });
  if (dept.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', '결의부서를 찾을 수 없습니다.');
  }
  if (p.requisitionId !== null) {
    const req = await db.query('SELECT 1 AS ok FROM requisition WHERE requisition_id = CAST(:id AS bigint)', { id: p.requisitionId });
    if (req.length === 0) {
      throw new ApiError(404, 'NOT_FOUND', '품의서를 찾을 수 없습니다.');
    }
  }
}

@Controller('api/v1')
export class FnSfr00402Controller {
  @Post('/expense-resolutions')
  @HttpCode(200)
  async createExpenseResolution(@Req() req: Request) {
    const user = currentUser(req);
    user.require(...ROLES);
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const p = parseBody(data);
    return transaction(async (db) => {
      await checkRefs(db, p);
      const rows = await db.query(
        'INSERT INTO expense_resolution (requisition_id, project_id, budget_account_id, partner_id, department_id, resolution_method, resolution_amount, status, created_at, updated_at) ' +
          'VALUES (CAST(:requisitionId AS bigint), CAST(:projectId AS bigint), CAST(:budgetAccountId AS bigint), CAST(:partnerId AS bigint), CAST(:departmentId AS bigint), :resolutionMethod, CAST(:resolutionAmount AS numeric), :status, now(), now()) ' +
          'RETURNING expense_resolution_id AS "expenseResolutionId", status AS "status"',
        { ...p, status: INITIAL_STATUS },
      );
      return rows[0];
    });
  }

  @Put('/expense-resolutions/:expenseResolutionId')
  async updateExpenseResolution(@Req() req: Request) {
    const user = currentUser(req);
    user.require(...ROLES);
    const rawId = req.params['expenseResolutionId'];
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const id = idOf(rawId, '결의서 ID', true);
    const p = parseBody(data);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT status AS "status" FROM expense_resolution WHERE expense_resolution_id = CAST(:id AS bigint)',
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EXPENSE_RESOLUTION_NOT_FOUND', '결의서를 찾을 수 없습니다.');
      }
      if (LOCKED_STATUSES.includes(String(found[0].status))) {
        throw new ApiError(409, 'EXPENSE_RESOLUTION_APPROVED', '승인된 결의서는 임의로 수정할 수 없습니다.');
      }
      await checkRefs(db, p);
      const rows = await db.query(
        'UPDATE expense_resolution SET requisition_id = CAST(:requisitionId AS bigint), project_id = CAST(:projectId AS bigint), budget_account_id = CAST(:budgetAccountId AS bigint), ' +
          'partner_id = CAST(:partnerId AS bigint), department_id = CAST(:departmentId AS bigint), resolution_method = :resolutionMethod, ' +
          'resolution_amount = CAST(:resolutionAmount AS numeric), updated_at = now() ' +
          'WHERE expense_resolution_id = CAST(:id AS bigint) ' +
          'RETURNING expense_resolution_id AS "expenseResolutionId", status AS "status"',
        { ...p, id },
      );
      return rows[0];
    });
  }

  @Get('/budget-statuses')
  async listBudgetStatuses(@Req() req: Request) {
    const user = currentUser(req);
    user.require(...ROLES);
    const query = checks.queryOf(req.query) as Record<string, unknown>;
    const budgetAccountId = idOf(query.budgetAccountId, '예산과목', false);
    const projectId = idOf(query.projectId, '프로젝트', false);
    const pageNo = isEmpty(query.page) ? 0 : Number(query.page);
    const sizeNo = isEmpty(query.size) ? DEFAULT_SIZE : Number(query.size);
    if (!Number.isInteger(pageNo) || pageNo < 0 || !Number.isInteger(sizeNo) || sizeNo < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호 또는 크기가 올바르지 않습니다.');
    }
    const size = Math.min(sizeNo, MAX_SIZE);
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT ba.budget_account_id AS "budgetAccountId", ' +
          'CAST(0 AS numeric) AS "executionBudgetAmount", ' +
          'CAST(0 AS numeric) AS "carryoverBudgetAmount", ' +
          'CAST(0 AS numeric) AS "totalBudgetAmount", ' +
          'CAST(COALESCE(SUM(er.resolution_amount), 0) AS numeric) AS "executedAmount", ' +
          'CAST(0 AS numeric) - CAST(COALESCE(SUM(er.resolution_amount), 0) AS numeric) AS "budgetBalance" ' +
          'FROM budget_account ba ' +
          'LEFT JOIN expense_resolution er ON er.budget_account_id = ba.budget_account_id ' +
          'AND er.status IN ' + EXECUTED_STATUSES_SQL + ' ' +
          'AND (CAST(:projectId AS bigint) IS NULL OR er.project_id = CAST(:projectId AS bigint)) ' +
          'WHERE (CAST(:budgetAccountId AS bigint) IS NULL OR ba.budget_account_id = CAST(:budgetAccountId AS bigint)) ' +
          'GROUP BY ba.budget_account_id ORDER BY ba.budget_account_id LIMIT :size OFFSET :offset',
        { budgetAccountId, projectId, size, offset: pageNo * size },
      );
      const counted = await db.query(
        'SELECT COUNT(*) AS "total" FROM budget_account ba WHERE (CAST(:budgetAccountId AS bigint) IS NULL OR ba.budget_account_id = CAST(:budgetAccountId AS bigint))',
        { budgetAccountId },
      );
      return { items, page: pageNo, size, total: Number(counted[0].total) };
    });
  }
}
