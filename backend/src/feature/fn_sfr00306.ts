import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const CLOSING_TYPES = ['결의서', '출납'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function bad(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function optionalId(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const text = String(value);
  if (!/^\d+$/.test(text)) {
    throw bad(`${label} 형식이 올바르지 않습니다.`);
  }
  return text;
}

function requiredId(value: unknown, label: string): string {
  const id = optionalId(value, label);
  if (id === null) {
    throw bad(`${label}을(를) 입력해 주세요.`);
  }
  return id;
}

function amountOf(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw bad('이월 대상 금액은 0 이상의 숫자여야 합니다.');
  }
  return value;
}

function pageOf(query: Record<string, unknown>): { page: number; size: number } {
  const rawPage = query['page'];
  const rawSize = query['size'];
  const page = rawPage === undefined || rawPage === '' ? 0 : Number(rawPage);
  const size = rawSize === undefined || rawSize === '' ? DEFAULT_SIZE : Number(rawSize);
  if (!Number.isInteger(page) || page < 0) {
    throw bad('쪽 번호가 올바르지 않습니다.');
  }
  if (!Number.isInteger(size) || size < 1) {
    throw bad('쪽 크기가 올바르지 않습니다.');
  }
  return { page, size: Math.min(size, MAX_SIZE) };
}

@Controller('api/v1')
export class FnSfr00306Controller {
  @Get('/budget-closing-periods')
  async listBudgetClosingPeriods(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query) as Record<string, unknown>;
    const { page, size } = pageOf(query);
    const rawType = query['closingType'];
    const closingType = rawType === undefined || rawType === '' ? null : String(rawType);
    if (closingType !== null && !CLOSING_TYPES.includes(closingType)) {
      throw bad('폐쇄 구분은 결의서 또는 출납이어야 합니다.');
    }
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT budget_closing_period_id AS "budgetClosingPeriodId",
                closing_type AS "closingType",
                to_char(start_date, 'YYYY-MM-DD') AS "startDate",
                to_char(end_date, 'YYYY-MM-DD') AS "endDate"
           FROM budget_closing_period
          WHERE (CAST(:closingType AS text) IS NULL OR closing_type = CAST(:closingType AS text))
          ORDER BY start_date DESC, budget_closing_period_id DESC
          LIMIT :size OFFSET :offset`,
        { closingType, size, offset: page * size },
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM budget_closing_period
          WHERE (CAST(:closingType AS text) IS NULL OR closing_type = CAST(:closingType AS text))`,
        { closingType },
      );
      return { items, page, size, total: Number(counted[0].total) };
    });
  }

  @Post('/budget-closing-periods')
  @HttpCode(200)
  async createBudgetClosingPeriod(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const closingType = typeof data['closingType'] === 'string' ? (data['closingType'] as string) : '';
    const startDate = typeof data['startDate'] === 'string' ? (data['startDate'] as string) : '';
    const endDate = typeof data['endDate'] === 'string' ? (data['endDate'] as string) : '';
    if (!CLOSING_TYPES.includes(closingType)) {
      throw bad('폐쇄 구분은 결의서 또는 출납이어야 합니다.');
    }
    if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
      throw bad('시작일과 종료일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const compared = await db.query(
        `SELECT (CAST(:endDate AS date) < CAST(:startDate AS date)) AS "invalid"`,
        { startDate, endDate },
      );
      if (compared[0].invalid) {
        throw new ApiError(422, 'CLOSING_PERIOD_INVALID_RANGE', '종료일은 시작일보다 빠를 수 없습니다.');
      }
      const rows = await db.query(
        `INSERT INTO budget_closing_period (closing_type, start_date, end_date, created_at, updated_at)
         VALUES (:closingType, CAST(:startDate AS date), CAST(:endDate AS date), now(), now())
         RETURNING budget_closing_period_id AS "budgetClosingPeriodId",
                   closing_type AS "closingType",
                   to_char(start_date, 'YYYY-MM-DD') AS "startDate",
                   to_char(end_date, 'YYYY-MM-DD') AS "endDate"`,
        { closingType, startDate, endDate },
      );
      return rows[0];
    });
  }

  @Get('/budget-carryovers')
  async listBudgetCarryovers(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query) as Record<string, unknown>;
    const { page, size } = pageOf(query);
    const projectId = optionalId(query['projectId'], '프로젝트');
    const budgetAccountId = optionalId(query['budgetAccountId'], '예산과목');
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT budget_carryover_id AS "budgetCarryoverId",
                project_id AS "projectId",
                budget_account_id AS "budgetAccountId",
                carryover_amount AS "carryoverAmount",
                is_initial_carryover AS "isInitialCarryover"
           FROM budget_carryover
          WHERE (CAST(:projectId AS bigint) IS NULL OR project_id = CAST(:projectId AS bigint))
            AND (CAST(:budgetAccountId AS bigint) IS NULL OR budget_account_id = CAST(:budgetAccountId AS bigint))
          ORDER BY budget_carryover_id DESC
          LIMIT :size OFFSET :offset`,
        { projectId, budgetAccountId, size, offset: page * size },
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM budget_carryover
          WHERE (CAST(:projectId AS bigint) IS NULL OR project_id = CAST(:projectId AS bigint))
            AND (CAST(:budgetAccountId AS bigint) IS NULL OR budget_account_id = CAST(:budgetAccountId AS bigint))`,
        { projectId, budgetAccountId },
      );
      return { items, page, size, total: Number(counted[0].total) };
    });
  }

  @Post('/budget-carryovers')
  @HttpCode(200)
  async createBudgetCarryover(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const projectId = requiredId(data['projectId'], '프로젝트');
    const budgetAccountId = requiredId(data['budgetAccountId'], '예산과목');
    const carryoverAmount = amountOf(data['carryoverAmount']);
    const isInitialCarryover = data['isInitialCarryover'];
    if (typeof isInitialCarryover !== 'boolean') {
      throw bad('초기 이월 여부를 선택해 주세요.');
    }
    return transaction(async (db) => {
      const projects = await db.query(
        `SELECT project_id FROM project WHERE project_id = CAST(:projectId AS bigint)`,
        { projectId },
      );
      const accounts = await db.query(
        `SELECT budget_account_id FROM budget_account WHERE budget_account_id = CAST(:budgetAccountId AS bigint)`,
        { budgetAccountId },
      );
      if (projects.length === 0 || accounts.length === 0) {
        throw new ApiError(404, 'PROJECT_OR_BUDGET_ACCOUNT_NOT_FOUND', '프로젝트 또는 예산과목이 등록되어 있지 않습니다.');
      }
      const duplicated = await db.query(
        `SELECT budget_carryover_id
           FROM budget_carryover
          WHERE project_id = CAST(:projectId AS bigint)
            AND budget_account_id = CAST(:budgetAccountId AS bigint)
            AND is_initial_carryover = :isInitialCarryover`,
        { projectId, budgetAccountId, isInitialCarryover },
      );
      if (duplicated.length > 0) {
        throw bad('같은 프로젝트·예산과목·초기 이월 여부의 이월 내역이 이미 있습니다.');
      }
      const rows = await db.query(
        `INSERT INTO budget_carryover (project_id, budget_account_id, carryover_amount, is_initial_carryover, created_at, updated_at)
         VALUES (CAST(:projectId AS bigint), CAST(:budgetAccountId AS bigint), CAST(:carryoverAmount AS numeric), :isInitialCarryover, now(), now())
         RETURNING budget_carryover_id AS "budgetCarryoverId"`,
        { projectId, budgetAccountId, carryoverAmount, isInitialCarryover },
      );
      return rows[0];
    });
  }

  @Patch('/budget-carryovers/:budgetCarryoverId')
  async updateBudgetCarryover(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const budgetCarryoverId = requiredId(req.params['budgetCarryoverId'], '예산 이월');
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const hasAmount = data['carryoverAmount'] !== undefined && data['carryoverAmount'] !== null;
    const carryoverAmount = hasAmount ? amountOf(data['carryoverAmount']) : null;
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT budget_carryover_id FROM budget_carryover WHERE budget_carryover_id = CAST(:budgetCarryoverId AS bigint)`,
        { budgetCarryoverId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'BUDGET_CARRYOVER_NOT_FOUND', '이월 내역을 찾을 수 없습니다.');
      }
      if (carryoverAmount !== null) {
        await db.execute(
          `UPDATE budget_carryover
              SET carryover_amount = CAST(:carryoverAmount AS numeric), updated_at = now()
            WHERE budget_carryover_id = CAST(:budgetCarryoverId AS bigint)`,
          { carryoverAmount, budgetCarryoverId },
        );
      }
      const rows = await db.query(
        `SELECT budget_carryover_id AS "budgetCarryoverId",
                carryover_amount AS "carryoverAmount"
           FROM budget_carryover
          WHERE budget_carryover_id = CAST(:budgetCarryoverId AS bigint)`,
        { budgetCarryoverId },
      );
      return rows[0];
    });
  }
}
