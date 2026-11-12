import { Controller, Get, Post, Put, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 월별 연차계획 등록 시 승인 처리 상태 초기값
const INITIAL_PLAN_STATUS = '신청';
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function textOf(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return String(value);
}

function numberOf(value: unknown, label: string): number | null {
  const text = textOf(value);
  if (text === null) {
    return null;
  }
  const number = Number(text);
  if (!Number.isFinite(number)) {
    throw invalid(label + ' 값은 숫자여야 합니다.');
  }
  return number;
}

function requiredNumber(value: unknown, label: string): number {
  const number = numberOf(value, label);
  if (number === null) {
    throw invalid(label + ' 값은 필수입니다.');
  }
  return number;
}

function pagingOf(query: Record<string, unknown>): { page: number; size: number } {
  const page = numberOf(query['page'], 'page') ?? 0;
  const size = numberOf(query['size'], 'size') ?? DEFAULT_SIZE;
  if (!Number.isInteger(page) || page < 0) {
    throw invalid('page는 0 이상의 정수여야 합니다.');
  }
  if (!Number.isInteger(size) || size < 1) {
    throw invalid('size는 1 이상의 정수여야 합니다.');
  }
  return { page, size: Math.min(size, MAX_SIZE) };
}

function optionalDate(value: unknown, label: string): string | null {
  const text = textOf(value);
  if (text !== null && !DATE_PATTERN.test(text)) {
    throw invalid(label + ' 형식은 YYYY-MM-DD여야 합니다.');
  }
  return text;
}

@Controller('api/v1')
export class FnSfr01706Controller {
  @Get('/annual-leave-plans')
  async listAnnualLeavePlans(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자', '임직원');
    const query = checks.queryOf(req.query);
    const { page, size } = pagingOf(query);
    const planMonth = textOf(query['planMonth']);
    const employeeId = numberOf(query['employeeId'], '임직원');
    return transaction(async (db) => {
      const params = { planMonth, employeeId, size, offset: page * size };
      const where = `WHERE (CAST(:planMonth AS text) IS NULL OR plan_month = :planMonth)
        AND (CAST(:employeeId AS bigint) IS NULL OR employee_id = CAST(:employeeId AS bigint))`;
      const items = await db.query(
        `SELECT annual_leave_plan_id AS "annualLeavePlanId",
          employee_id AS "employeeId",
          plan_month AS "planMonth",
          plan_dates AS "planDates",
          plan_days AS "planDays",
          approval_status AS "approvalStatus"
        FROM annual_leave_plan
        ${where}
        ORDER BY annual_leave_plan_id DESC
        LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        params,
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total" FROM annual_leave_plan ${where}`,
        params,
      );
      return { items, page, size, total: Number(counted[0].total) };
    });
  }

  @Post('/annual-leave-plans')
  @HttpCode(200)
  async createAnnualLeavePlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자', '임직원');
    const data = checks.inputOf(req.body);
    const employeeId = requiredNumber(data['employeeId'], '임직원');
    const planMonth = textOf(data['planMonth']);
    if (planMonth === null || !MONTH_PATTERN.test(planMonth)) {
      throw invalid('계획월은 YYYY-MM 형식이어야 합니다.');
    }
    const planDays = requiredNumber(data['planDays'], '계획 일수 합계');
    if (planDays <= 0) {
      throw invalid('계획 일수 합계는 0보다 커야 합니다.');
    }
    const planDates = optionalDate(data['planDates'], '계획 일자');
    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      if (employees.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
      }
      const existing = await db.query(
        `SELECT approval_status AS "approvalStatus" FROM annual_leave_plan
        WHERE employee_id = CAST(:employeeId AS bigint) AND plan_month = :planMonth`,
        { employeeId, planMonth },
      );
      if (existing.length > 0) {
        if (existing[0].approvalStatus === '마감') {
          throw new ApiError(409, 'ATTENDANCE_PERIOD_CLOSED', '마감된 기간입니다. 마감을 취소한 뒤 다시 시도해 주세요.');
        }
        throw new ApiError(409, 'DUPLICATE_PLAN', '해당 임직원의 같은 계획월 연차계획이 이미 있습니다.');
      }
      const rows = await db.query(
        `INSERT INTO annual_leave_plan
          (employee_id, plan_month, plan_dates, plan_days, approval_status, created_at, updated_at)
        VALUES
          (CAST(:employeeId AS bigint), :planMonth, CAST(:planDates AS date), CAST(:planDays AS numeric), :status, now(), now())
        RETURNING annual_leave_plan_id AS "annualLeavePlanId"`,
        { employeeId, planMonth, planDates, planDays, status: INITIAL_PLAN_STATUS },
      );
      return { annualLeavePlanId: Number(rows[0].annualLeavePlanId) };
    });
  }

  @Put('/annual-leave-plans/:annualLeavePlanId')
  async updateAnnualLeavePlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자', '임직원');
    const planId = requiredNumber(req.params['annualLeavePlanId'], '월별 연차계획 ID');
    const data = checks.inputOf(req.body);
    const planDays = requiredNumber(data['planDays'], '계획 일수 합계');
    if (planDays <= 0) {
      throw invalid('계획 일수 합계는 0보다 커야 합니다.');
    }
    const planDates = optionalDate(data['planDates'], '계획 일자');
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT CAST(plan_dates AS text) AS "planDates",
          plan_days AS "planDays",
          approval_status AS "approvalStatus"
        FROM annual_leave_plan
        WHERE annual_leave_plan_id = CAST(:planId AS bigint)
        FOR UPDATE`,
        { planId },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'ANNUAL_LEAVE_PLAN_NOT_FOUND', '연차계획을 찾을 수 없습니다.');
      }
      const before = rows[0];
      if (before.approvalStatus === '마감') {
        throw new ApiError(409, 'ATTENDANCE_PERIOD_CLOSED', '마감된 기간입니다. 마감을 취소한 뒤 수정해 주세요.');
      }
      if (before.approvalStatus === '승인') {
        throw new ApiError(409, 'ANNUAL_LEAVE_PLAN_APPROVED', '승인된 계획은 직접 수정할 수 없습니다. 승인 취소 절차를 거쳐 주세요.');
      }
      await db.execute(
        `UPDATE annual_leave_plan
        SET plan_dates = COALESCE(CAST(:planDates AS date), plan_dates),
          plan_days = CAST(:planDays AS numeric),
          updated_at = now()
        WHERE annual_leave_plan_id = CAST(:planId AS bigint)`,
        { planId, planDates, planDays },
      );
      const afterDates = planDates ?? before.planDates ?? '없음';
      const content = '계획 일자: ' + (before.planDates ?? '없음') + ' → ' + afterDates
        + ', 계획 일수: ' + before.planDays + ' → ' + planDays;
      await db.execute(
        `INSERT INTO change_history
          (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
        VALUES
          (CAST(:userId AS bigint), 'annual_leave_plan', CAST(:planId AS bigint), '수정', now(), :content, now(), now())`,
        { userId: user.id, planId, content },
      );
      return { annualLeavePlanId: planId };
    });
  }

  @Get('/leave-promotions')
  async listLeavePromotions(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const query = checks.queryOf(req.query);
    const { page, size } = pagingOf(query);
    const promotionYear = numberOf(query['promotionYear'], '기준연도');
    const employeeId = numberOf(query['employeeId'], '대상 임직원');
    return transaction(async (db) => {
      const params = { promotionYear, employeeId, size, offset: page * size };
      const where = `WHERE (CAST(:promotionYear AS int) IS NULL OR promotion_year = CAST(:promotionYear AS int))
        AND (CAST(:employeeId AS bigint) IS NULL OR employee_id = CAST(:employeeId AS bigint))`;
      const items = await db.query(
        `SELECT leave_promotion_id AS "leavePromotionId",
          employee_id AS "employeeId",
          promotion_year AS "promotionYear",
          promotion_stage AS "promotionStage",
          scheduled_date AS "scheduledDate",
          notified_at AS "notifiedAt",
          remaining_days AS "remainingDays"
        FROM leave_promotion
        ${where}
        ORDER BY leave_promotion_id DESC
        LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        params,
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total" FROM leave_promotion ${where}`,
        params,
      );
      return { items, page, size, total: Number(counted[0].total) };
    });
  }

  @Post('/leave-promotions')
  @HttpCode(200)
  async createLeavePromotion(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.inputOf(req.body);
    const employeeId = requiredNumber(data['employeeId'], '대상 임직원');
    const promotionYear = requiredNumber(data['promotionYear'], '기준연도');
    if (!Number.isInteger(promotionYear)) {
      throw invalid('기준연도는 정수여야 합니다.');
    }
    const promotionStage = textOf(data['promotionStage']);
    if (promotionStage === null || promotionStage.length > 50) {
      throw invalid('촉진 구분은 필수이며 50자 이하여야 합니다.');
    }
    const scheduledDate = optionalDate(data['scheduledDate'], '통지 예정일');
    if (scheduledDate === null) {
      throw invalid('통지 예정일은 필수입니다.');
    }
    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      if (employees.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '대상 임직원을 찾을 수 없습니다.');
      }
      const existing = await db.query(
        `SELECT leave_promotion_id FROM leave_promotion
        WHERE employee_id = CAST(:employeeId AS bigint)
          AND promotion_year = CAST(:promotionYear AS int)
          AND promotion_stage = :promotionStage`,
        { employeeId, promotionYear, promotionStage },
      );
      if (existing.length > 0) {
        throw new ApiError(409, 'DUPLICATE_PROMOTION', '같은 기준연도·촉진 구분의 계획이 이미 등록되어 있습니다.');
      }
      const rows = await db.query(
        `INSERT INTO leave_promotion
          (employee_id, promotion_year, promotion_stage, scheduled_date, created_at, updated_at)
        VALUES
          (CAST(:employeeId AS bigint), CAST(:promotionYear AS int), :promotionStage, CAST(:scheduledDate AS date), now(), now())
        RETURNING leave_promotion_id AS "leavePromotionId"`,
        { employeeId, promotionYear, promotionStage, scheduledDate },
      );
      return { leavePromotionId: Number(rows[0].leavePromotionId) };
    });
  }
}
