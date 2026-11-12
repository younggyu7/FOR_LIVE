import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// 가정: 최초 마감 상태는 '마감 취소'(미마감 의미)
const INITIAL_CLOSING_STATUS = '마감 취소';
const CLOSED_STATUS = '마감';

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function requireDate(value: unknown, label: string): string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
  return value;
}

function requireId(value: unknown, label: string): number {
  const n = Number(value);
  if (isBlank(value) || !Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '을(를) 확인해 주세요.');
  }
  return n;
}

function optionalAmount(value: unknown, label: string): number | null {
  if (isBlank(value)) {
    return null;
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (typeof value === 'boolean' || !Number.isFinite(n) || n < 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 0 이상의 숫자여야 합니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr00903Controller {
  @Get('/fund-plans')
  async listFundPlans(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const page = isBlank(query['page']) ? 0 : Number(query['page']);
    let size = isBlank(query['size']) ? 20 : Number(query['size']);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 크기가 올바르지 않습니다.');
    }
    if (size > 200) {
      size = 200;
    }
    const conditions: string[] = [];
    const params: Record<string, unknown> = { limit: size, offset: page * size };
    if (!isBlank(query['startDate'])) {
      params['startDate'] = requireDate(query['startDate'], '계획 기간 시작');
      conditions.push('plan_end_date >= CAST(:startDate AS date)');
    }
    if (!isBlank(query['endDate'])) {
      params['endDate'] = requireDate(query['endDate'], '계획 기간 종료');
      conditions.push('plan_start_date <= CAST(:endDate AS date)');
    }
    if (!isBlank(query['fundSubjectId'])) {
      params['fundSubjectId'] = requireId(query['fundSubjectId'], '자금과목');
      conditions.push('fund_subject_id = CAST(:fundSubjectId AS bigint)');
    }
    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    return transaction(async (db) => {
      const countParams: Record<string, unknown> = { ...params };
      delete countParams['limit'];
      delete countParams['offset'];
      const totalRows = await db.query('SELECT COUNT(*) AS total FROM fund_plan ' + where + ' ', countParams);
      const items = await db.query(
        'SELECT fund_plan_id AS "fundPlanId", fund_subject_id AS "fundSubjectId", ' +
          'plan_start_date AS "planStartDate", plan_end_date AS "planEndDate", ' +
          'income_amount AS "incomeAmount", expense_amount AS "expenseAmount", remark, ' +
          'closing_status AS "closingStatus", ' +
          'COALESCE(income_amount, 0) - COALESCE(expense_amount, 0) AS "balanceDifference" ' +
          'FROM fund_plan ' + where + ' ORDER BY plan_start_date DESC, fund_plan_id DESC LIMIT :limit OFFSET :offset',
        params,
      );
      return { items, page, size, total: Number(totalRows[0]['total']) };
    });
  }

  @Post('/fund-plans')
  @HttpCode(200)
  async createFundPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const fundSubjectId = requireId(data['fundSubjectId'], '자금과목');
    const planStartDate = requireDate(data['planStartDate'], '계획 시작일');
    const planEndDate = requireDate(data['planEndDate'], '계획 종료일');
    const incomeAmount = optionalAmount(data['incomeAmount'], '수입 계획 금액');
    const expenseAmount = optionalAmount(data['expenseAmount'], '지출 계획 금액');
    const remark = isBlank(data['remark']) ? null : String(data['remark']);
    return transaction(async (db) => {
      const subjects = await db.query(
        'SELECT fund_subject_id FROM fund_subject WHERE fund_subject_id = CAST(:fundSubjectId AS bigint)',
        { fundSubjectId },
      );
      if (subjects.length === 0) {
        throw new ApiError(404, 'FUND_SUBJECT_NOT_FOUND', '자금과목을 찾을 수 없습니다.');
      }
      const range = await db.query(
        'SELECT CAST(:planEndDate AS date) < CAST(:planStartDate AS date) AS bad',
        { planStartDate, planEndDate },
      );
      if (range[0]['bad']) {
        throw new ApiError(422, 'INVALID_DATE_RANGE', '계획 종료일은 시작일보다 앞설 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT fund_plan_id FROM fund_plan WHERE fund_subject_id = CAST(:fundSubjectId AS bigint) ' +
          'AND plan_start_date = CAST(:planStartDate AS date) AND plan_end_date = CAST(:planEndDate AS date)',
        { fundSubjectId, planStartDate, planEndDate },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'FUND_PLAN_DUPLICATE', '같은 자금과목과 기간의 계획이 이미 있습니다.');
      }
      const rows = await db.query(
        'INSERT INTO fund_plan (fund_subject_id, plan_start_date, plan_end_date, income_amount, expense_amount, remark, closing_status, created_at, updated_at) ' +
          'VALUES (CAST(:fundSubjectId AS bigint), CAST(:planStartDate AS date), CAST(:planEndDate AS date), ' +
          'CAST(:incomeAmount AS numeric), CAST(:expenseAmount AS numeric), CAST(:remark AS text), :closingStatus, now(), now()) ' +
          'RETURNING fund_plan_id AS "fundPlanId"',
        { fundSubjectId, planStartDate, planEndDate, incomeAmount, expenseAmount, remark, closingStatus: INITIAL_CLOSING_STATUS },
      );
      return rows[0];
    });
  }

  @Patch('/fund-plans/:fundPlanId')
  async updateFundPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const fundPlanId = requireId(req.params['fundPlanId'], '자금수지계획');
    const fundSubjectId = isBlank(data['fundSubjectId']) ? null : requireId(data['fundSubjectId'], '자금과목');
    const planStartDate = isBlank(data['planStartDate']) ? null : requireDate(data['planStartDate'], '계획 시작일');
    const planEndDate = isBlank(data['planEndDate']) ? null : requireDate(data['planEndDate'], '계획 종료일');
    const incomeAmount = optionalAmount(data['incomeAmount'], '수입 계획 금액');
    const expenseAmount = optionalAmount(data['expenseAmount'], '지출 계획 금액');
    const remark = isBlank(data['remark']) ? null : String(data['remark']);
    return transaction(async (db) => {
      const rows = await db.query(
        'SELECT closing_status AS "closingStatus" FROM fund_plan WHERE fund_plan_id = CAST(:fundPlanId AS bigint) FOR UPDATE',
        { fundPlanId },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'FUND_PLAN_NOT_FOUND', '자금수지계획을 찾을 수 없습니다.');
      }
      if (rows[0]['closingStatus'] === CLOSED_STATUS) {
        throw new ApiError(409, 'FUND_PLAN_CLOSED', '마감된 기간의 계획입니다. 마감을 취소한 뒤 수정해 주세요.');
      }
      if (fundSubjectId !== null) {
        const subjects = await db.query(
          'SELECT fund_subject_id FROM fund_subject WHERE fund_subject_id = CAST(:fundSubjectId AS bigint)',
          { fundSubjectId },
        );
        if (subjects.length === 0) {
          throw new ApiError(404, 'FUND_SUBJECT_NOT_FOUND', '자금과목을 찾을 수 없습니다.');
        }
      }
      const range = await db.query(
        'SELECT COALESCE(CAST(:planEndDate AS date), plan_end_date) < COALESCE(CAST(:planStartDate AS date), plan_start_date) AS bad ' +
          'FROM fund_plan WHERE fund_plan_id = CAST(:fundPlanId AS bigint)',
        { fundPlanId, planStartDate, planEndDate },
      );
      if (range[0]['bad']) {
        throw new ApiError(422, 'INVALID_DATE_RANGE', '계획 종료일은 시작일보다 앞설 수 없습니다.');
      }
      await db.execute(
        'UPDATE fund_plan SET ' +
          'fund_subject_id = COALESCE(CAST(:fundSubjectId AS bigint), fund_subject_id), ' +
          'plan_start_date = COALESCE(CAST(:planStartDate AS date), plan_start_date), ' +
          'plan_end_date = COALESCE(CAST(:planEndDate AS date), plan_end_date), ' +
          'income_amount = COALESCE(CAST(:incomeAmount AS numeric), income_amount), ' +
          'expense_amount = COALESCE(CAST(:expenseAmount AS numeric), expense_amount), ' +
          'remark = COALESCE(CAST(:remark AS text), remark), ' +
          'updated_at = now() ' +
          'WHERE fund_plan_id = CAST(:fundPlanId AS bigint)',
        { fundPlanId, fundSubjectId, planStartDate, planEndDate, incomeAmount, expenseAmount, remark },
      );
      return { fundPlanId };
    });
  }

  @Delete('/fund-plans/:fundPlanId')
  async deleteFundPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const fundPlanId = requireId(req.params['fundPlanId'], '자금수지계획');
    return transaction(async (db) => {
      const rows = await db.query(
        'SELECT closing_status AS "closingStatus" FROM fund_plan WHERE fund_plan_id = CAST(:fundPlanId AS bigint) FOR UPDATE',
        { fundPlanId },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'FUND_PLAN_NOT_FOUND', '자금수지계획을 찾을 수 없습니다.');
      }
      if (rows[0]['closingStatus'] === CLOSED_STATUS) {
        throw new ApiError(409, 'FUND_PLAN_CLOSED', '마감된 기간의 계획입니다. 마감을 취소한 뒤 삭제해 주세요.');
      }
      await db.execute('DELETE FROM fund_plan WHERE fund_plan_id = CAST(:fundPlanId AS bigint)', { fundPlanId });
      return {};
    });
  }
}
