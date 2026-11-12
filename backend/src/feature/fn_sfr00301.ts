import { Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function intText(v: unknown): string | null {
  const s = typeof v === 'number' ? String(v) : typeof v === 'string' ? v.trim() : '';
  return /^-?\d+$/.test(s) ? s : null;
}

function amountText(v: unknown): string | null {
  const s = typeof v === 'number' ? String(v) : typeof v === 'string' ? v.trim() : '';
  return /^\d+(\.\d{1,2})?$/.test(s) ? s : null;
}

function optInt(v: unknown, label: string): string | null {
  if (isBlank(v)) {
    return null;
  }
  const t = intText(v);
  if (t === null) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값은 정수여야 합니다.');
  }
  return t;
}

function optText(v: unknown): string | null {
  if (isBlank(v)) {
    return null;
  }
  return String(v).trim();
}

@Controller('api/v1')
export class FnSfr00301Controller {
  @Get('/budget-mains')
  async listBudgetMains(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const accountingUnit = optText(q['accountingUnit']);
    const fiscalYear = optInt(q['fiscalYear'], '기수(회계연도)');
    const projectId = optInt(q['projectId'], '프로젝트');
    const budgetGroup = optText(q['budgetGroup']);
    const pageText = isBlank(q['page']) ? '0' : intText(q['page']);
    const sizeText = isBlank(q['size']) ? String(DEFAULT_SIZE) : intText(q['size']);
    if (pageText === null || sizeText === null || Number(pageText) < 0 || Number(sizeText) < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 쪽 크기가 올바르지 않습니다.');
    }
    const page = Number(pageText);
    const size = Math.min(Number(sizeText), MAX_SIZE);
    return transaction(async (db) => {
      const where = `WHERE (CAST(:accountingUnit AS text) IS NULL OR accounting_unit = CAST(:accountingUnit AS text))
        AND (CAST(:fiscalYear AS integer) IS NULL OR fiscal_year = CAST(:fiscalYear AS integer))
        AND (CAST(:projectId AS bigint) IS NULL OR project_id = CAST(:projectId AS bigint))
        AND (CAST(:budgetGroup AS text) IS NULL OR budget_group = CAST(:budgetGroup AS text))`;
      const filters = { accountingUnit, fiscalYear, projectId, budgetGroup };
      const items = await db.query(
        `SELECT budget_main_id AS "budgetMainId",
          accounting_unit AS "accountingUnit",
          fiscal_year AS "fiscalYear",
          project_id AS "projectId",
          budget_account_id AS "budgetAccountId",
          budget_group AS "budgetGroup",
          requested_amount AS "requestedAmount",
          requested_date AS "requestedDate",
          requester_id AS "requesterId",
          approval_status AS "approvalStatus"
        FROM budget_main
        ${''}` + where + `
        ORDER BY budget_main_id DESC
        LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { ...filters, size: String(size), offset: String(page * size) },
      );
      const counted = await db.query(
        'SELECT COUNT(*) AS "total" FROM budget_main ' + where,
        filters,
      );
      const total = Number(counted[0]['total']);
      return { items, page, size, total };
    });
  }

  @Post('/budget-mains')
  @HttpCode(200)
  async createBudgetMain(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const missing =
      isBlank(data['accountingUnit']) ||
      isBlank(data['fiscalYear']) ||
      isBlank(data['projectId']) ||
      isBlank(data['budgetAccountId']) ||
      isBlank(data['requestedAmount']) ||
      isBlank(data['requestedDate']);
    if (missing) {
      throw new ApiError(422, 'BUDGET_MAIN_REQUIRED_VALUE_MISSING', '회계단위, 기수, 프로젝트, 예산과목, 신청금액, 신청일을 모두 입력해 주세요.');
    }
    const accountingUnit = String(data['accountingUnit']).trim();
    if (accountingUnit.length > 50) {
      throw new ApiError(400, 'VALIDATION_FAILED', '회계단위는 50자 이하로 입력해 주세요.');
    }
    const budgetGroup = optText(data['budgetGroup']);
    if (budgetGroup !== null && budgetGroup.length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', '예산그룹은 100자 이하로 입력해 주세요.');
    }
    const fiscalYear = intText(data['fiscalYear']);
    const projectId = intText(data['projectId']);
    const budgetAccountId = intText(data['budgetAccountId']);
    if (fiscalYear === null || projectId === null || budgetAccountId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '기수, 프로젝트, 예산과목은 정수여야 합니다.');
    }
    const requestedAmount = amountText(data['requestedAmount']);
    if (requestedAmount === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '신청금액은 0 이상의 숫자(소수 2자리까지)여야 합니다.');
    }
    const requestedDate = String(data['requestedDate']).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '신청일은 YYYY-MM-DD 형식이어야 합니다.');
    }
    return transaction(async (db) => {
      const projects = await db.query(
        'SELECT project_id FROM project WHERE project_id = CAST(:projectId AS bigint)',
        { projectId },
      );
      if (projects.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      const accounts = await db.query(
        'SELECT budget_account_id FROM budget_account WHERE budget_account_id = CAST(:budgetAccountId AS bigint)',
        { budgetAccountId },
      );
      if (accounts.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '예산과목을 찾을 수 없습니다.');
      }
      const employees = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:userId AS bigint)',
        { userId: user.id },
      );
      if (employees.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '신청자 정보를 찾을 수 없습니다.');
      }
      const dup = await db.query(
        `SELECT budget_main_id FROM budget_main
         WHERE accounting_unit = :accountingUnit
           AND fiscal_year = CAST(:fiscalYear AS integer)
           AND project_id = CAST(:projectId AS bigint)
           AND budget_account_id = CAST(:budgetAccountId AS bigint)`,
        { accountingUnit, fiscalYear, projectId, budgetAccountId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'DUPLICATE_BUDGET_MAIN', '같은 회계단위·기수·프로젝트·예산과목의 본예산이 이미 있습니다.');
      }
      // 신청자는 현재 사용자(가정), 상태는 고정값 '신청'
      const rows = await db.query(
        `INSERT INTO budget_main (
           accounting_unit, fiscal_year, project_id, budget_account_id, budget_group,
           requested_amount, requested_date, requester_id, approval_status, created_at, updated_at
         ) VALUES (
           :accountingUnit, CAST(:fiscalYear AS integer), CAST(:projectId AS bigint), CAST(:budgetAccountId AS bigint), :budgetGroup,
           CAST(:requestedAmount AS numeric), CAST(:requestedDate AS date), CAST(:userId AS bigint), '신청', now(), now()
         )
         RETURNING budget_main_id AS "budgetMainId", approval_status AS "approvalStatus"`,
        {
          accountingUnit,
          fiscalYear,
          projectId,
          budgetAccountId,
          budgetGroup,
          requestedAmount,
          requestedDate,
          userId: user.id,
        },
      );
      return rows[0];
    });
  }
}
