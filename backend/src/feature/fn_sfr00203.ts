import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const TYPES = ['수입', '지출'];
const CYCLES = ['월', '분기', '연'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const COLUMNS = `
  budget_account_id AS "budgetAccountId",
  account_subject_id AS "accountSubjectId",
  parent_budget_account_id AS "parentBudgetAccountId",
  budget_group AS "budgetGroup",
  name AS "name",
  income_expense_type AS "incomeExpenseType",
  control_cycle AS "controlCycle",
  transfer_allowed AS "transferAllowed",
  use_start_date AS "useStartDate",
  use_end_date AS "useEndDate"
`;

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function textOf(value: unknown, label: string, max: number, required: boolean): string | null {
  if (isEmpty(value)) {
    if (required) {
      throw invalid(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (typeof value !== 'string' || value.length > max) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  return value;
}

function idOf(value: unknown, label: string, required: boolean): number | null {
  if (isEmpty(value)) {
    if (required) {
      throw invalid(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(n) || n <= 0) {
    throw invalid(label + '은(는) 숫자여야 합니다.');
  }
  return n;
}

function oneOf(value: unknown, label: string, list: string[], required: boolean): string | null {
  if (isEmpty(value)) {
    if (required) {
      throw invalid(label + '을(를) 선택해 주세요.');
    }
    return null;
  }
  if (typeof value !== 'string' || !list.includes(value)) {
    throw invalid(label + ' 값이 올바르지 않습니다.');
  }
  return value;
}

function boolOf(value: unknown, label: string, required: boolean): boolean | null {
  if (isEmpty(value)) {
    if (required) {
      throw invalid(label + '을(를) 선택해 주세요.');
    }
    return null;
  }
  if (typeof value !== 'boolean') {
    throw invalid(label + ' 값이 올바르지 않습니다.');
  }
  return value;
}

function dateOf(value: unknown, label: string): string | null {
  if (isEmpty(value)) {
    return null;
  }
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw invalid(label + ' 형식은 YYYY-MM-DD 입니다.');
  }
  return value;
}

function pathId(req: Request): number {
  const n = Number(req.params['budgetAccountId']);
  if (!Number.isInteger(n) || n <= 0) {
    throw invalid('예산과목 ID가 올바르지 않습니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr00203Controller {
  @Get('/budget-accounts')
  async listBudgetAccounts(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const budgetGroup = textOf(query['budgetGroup'], '예산과목 그룹', 100, false);
    const incomeExpenseType = oneOf(query['incomeExpenseType'], '수입·지출 유형', TYPES, false);
    const pageNo = isEmpty(query['page']) ? 0 : Number(query['page']);
    const sizeRaw = isEmpty(query['size']) ? 20 : Number(query['size']);
    if (!Number.isInteger(pageNo) || pageNo < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw invalid('page 또는 size 값이 올바르지 않습니다.');
    }
    const size = Math.min(sizeRaw, 200);
    return transaction(async (db) => {
      const where = `
        WHERE (CAST(:budgetGroup AS varchar) IS NULL OR budget_group = CAST(:budgetGroup AS varchar))
          AND (CAST(:incomeExpenseType AS varchar) IS NULL OR income_expense_type = CAST(:incomeExpenseType AS varchar))
      `;
      const filter = { budgetGroup, incomeExpenseType };
      const items = await db.query(
        `SELECT ${COLUMNS} FROM budget_account ${where} ORDER BY budget_group, budget_account_id LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        { ...filter, size, offset: pageNo * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS total FROM budget_account ${where}`,
        filter,
      );
      return { items, page: pageNo, size, total: Number(counts[0].total) };
    });
  }

  @Post('/budget-accounts')
  @HttpCode(200)
  async createBudgetAccount(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const budgetGroup = textOf(data['budgetGroup'], '예산과목 그룹', 100, true);
    const incomeExpenseType = oneOf(data['incomeExpenseType'], '수입·지출 유형', TYPES, true);
    const parentId = idOf(data['parentBudgetAccountId'], '상위 예산과목', false);
    const name = textOf(data['name'], '예산과목 명칭', 200, true);
    const controlCycle = oneOf(data['controlCycle'], '예산 통제 주기', CYCLES, true);
    const transferAllowed = boolOf(data['transferAllowed'], '예산 전용 가능 여부', true);
    const useStartDate = dateOf(data['useStartDate'], '사용 시작일');
    const useEndDate = dateOf(data['useEndDate'], '사용 종료일');
    const accountSubjectId = idOf(data['accountSubjectId'], '매핑 계정과목', true);
    return transaction(async (db) => {
      if (useStartDate !== null && useEndDate !== null) {
        const check = await db.query(
          'SELECT CAST(:e AS date) < CAST(:s AS date) AS bad',
          { e: useEndDate, s: useStartDate },
        );
        if (check[0].bad) {
          throw new ApiError(422, 'INVALID_USE_PERIOD', '사용 종료일이 시작일보다 빠릅니다.');
        }
      }
      const subject = await db.query(
        'SELECT 1 AS ok FROM account_subject WHERE account_subject_id = CAST(:id AS bigint)',
        { id: accountSubjectId },
      );
      if (subject.length === 0) {
        throw new ApiError(422, 'INVALID_ACCOUNT_SUBJECT', '매핑할 계정과목이 없거나 유효하지 않습니다.');
      }
      if (parentId !== null) {
        const parent = await db.query(
          'SELECT 1 AS ok FROM budget_account WHERE budget_account_id = CAST(:id AS bigint)',
          { id: parentId },
        );
        if (parent.length === 0) {
          throw new ApiError(404, 'PARENT_BUDGET_ACCOUNT_NOT_FOUND', '상위 예산과목을 찾을 수 없습니다.');
        }
      }
      const rows = await db.query(
        `INSERT INTO budget_account (
           account_subject_id, parent_budget_account_id, budget_group, name,
           income_expense_type, control_cycle, transfer_allowed,
           use_start_date, use_end_date, created_at, updated_at
         ) VALUES (
           CAST(:accountSubjectId AS bigint), CAST(:parentId AS bigint), :budgetGroup, :name,
           :incomeExpenseType, :controlCycle, CAST(:transferAllowed AS boolean),
           CAST(:useStartDate AS date), CAST(:useEndDate AS date), now(), now()
         ) RETURNING budget_account_id AS "budgetAccountId"`,
        { accountSubjectId, parentId, budgetGroup, name, incomeExpenseType, controlCycle, transferAllowed, useStartDate, useEndDate },
      );
      return rows[0];
    });
  }

  @Patch('/budget-accounts/:budgetAccountId')
  async updateBudgetAccount(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const budgetAccountId = pathId(req);
    const data = checks.inputOf(req.body);
    const budgetGroup = textOf(data['budgetGroup'], '예산과목 그룹', 100, false);
    const name = textOf(data['name'], '예산과목 명칭', 200, false);
    const controlCycle = oneOf(data['controlCycle'], '예산 통제 주기', CYCLES, false);
    const transferAllowed = boolOf(data['transferAllowed'], '예산 전용 가능 여부', false);
    const useStartDate = dateOf(data['useStartDate'], '사용 시작일');
    const useEndDate = dateOf(data['useEndDate'], '사용 종료일');
    const accountSubjectId = idOf(data['accountSubjectId'], '매핑 계정과목', false);
    return transaction(async (db) => {
      const current = await db.query(
        `SELECT COALESCE(CAST(:e AS date), use_end_date) < COALESCE(CAST(:s AS date), use_start_date) AS bad
           FROM budget_account WHERE budget_account_id = CAST(:id AS bigint)`,
        { e: useEndDate, s: useStartDate, id: budgetAccountId },
      );
      if (current.length === 0) {
        throw new ApiError(404, 'BUDGET_ACCOUNT_NOT_FOUND', '예산과목을 찾을 수 없습니다.');
      }
      if (current[0].bad) {
        throw new ApiError(422, 'INVALID_USE_PERIOD', '사용 종료일이 시작일보다 빠릅니다.');
      }
      if (accountSubjectId !== null) {
        const subject = await db.query(
          'SELECT 1 AS ok FROM account_subject WHERE account_subject_id = CAST(:id AS bigint)',
          { id: accountSubjectId },
        );
        if (subject.length === 0) {
          throw new ApiError(422, 'INVALID_ACCOUNT_SUBJECT', '매핑할 계정과목이 없거나 유효하지 않습니다.');
        }
      }
      await db.execute(
        `UPDATE budget_account SET
           budget_group = COALESCE(CAST(:budgetGroup AS varchar), budget_group),
           name = COALESCE(CAST(:name AS varchar), name),
           control_cycle = COALESCE(CAST(:controlCycle AS varchar), control_cycle),
           transfer_allowed = COALESCE(CAST(:transferAllowed AS boolean), transfer_allowed),
           use_start_date = COALESCE(CAST(:useStartDate AS date), use_start_date),
           use_end_date = COALESCE(CAST(:useEndDate AS date), use_end_date),
           account_subject_id = COALESCE(CAST(:accountSubjectId AS bigint), account_subject_id),
           updated_at = now()
         WHERE budget_account_id = CAST(:id AS bigint)`,
        { budgetGroup, name, controlCycle, transferAllowed, useStartDate, useEndDate, accountSubjectId, id: budgetAccountId },
      );
      return { budgetAccountId };
    });
  }

  @Delete('/budget-accounts/:budgetAccountId')
  async deleteBudgetAccount(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const budgetAccountId = pathId(req);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT 1 AS ok FROM budget_account WHERE budget_account_id = CAST(:id AS bigint)',
        { id: budgetAccountId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'BUDGET_ACCOUNT_NOT_FOUND', '예산과목을 찾을 수 없습니다.');
      }
      // TODO(질문): 예산 집행 이력(409 BUDGET_ACCOUNT_HAS_EXECUTION) 확인은 집행 테이블이 입력 schema.sql에 없어 구현하지 못함
      await db.execute(
        'DELETE FROM budget_account WHERE budget_account_id = CAST(:id AS bigint)',
        { id: budgetAccountId },
      );
      return {};
    });
  }
}
