import { Controller, Get, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NUMBER_PATTERN = /^\d+(\.\d+)?$/;
const INTEGER_PATTERN = /^\d+$/;
const USE_STATUSES = ['사용', '미사용'];

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function integerText(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const text = String(value);
  if (!INTEGER_PATTERN.test(text)) {
    throw invalid(label + ' 값은 정수여야 합니다.');
  }
  return text;
}

function numberText(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const text = String(value);
  if (!NUMBER_PATTERN.test(text)) {
    throw invalid(label + ' 값은 0 이상의 숫자여야 합니다.');
  }
  return text;
}

function dateText(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const text = String(value);
  if (!DATE_PATTERN.test(text)) {
    throw invalid(label + ' 형식은 YYYY-MM-DD여야 합니다.');
  }
  return text;
}

function pageOf(query: Record<string, unknown>): { page: number; size: number; offset: number } {
  const pageText = integerText(query['page'], '쪽');
  const sizeText = integerText(query['size'], '크기');
  const page = pageText === null ? 0 : Number(pageText);
  let size = sizeText === null ? DEFAULT_SIZE : Number(sizeText);
  if (size < 1) {
    throw invalid('크기는 1 이상이어야 합니다.');
  }
  if (size > MAX_SIZE) {
    size = MAX_SIZE;
  }
  return { page, size, offset: page * size };
}

@Controller('api/v1')
export class FnSfr01808Controller {
  @Get('/annual-leaves')
  async listAnnualLeaves(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const query = checks.queryOf(req.query);
    const paging = pageOf(query);
    const filter = {
      employeeId: integerText(query['employeeId'], '임직원'),
      baseYear: integerText(query['baseYear'], '기준연도'),
      departmentId: integerText(query['departmentId'], '부서'),
    };
    const fromWhere =
      ' FROM annual_leave al ' +
      ' JOIN employee e ON e.employee_id = al.employee_id ' +
      ' WHERE (CAST(:employeeId AS bigint) IS NULL OR al.employee_id = CAST(:employeeId AS bigint)) ' +
      ' AND (CAST(:baseYear AS integer) IS NULL OR al.base_year = CAST(:baseYear AS integer)) ' +
      ' AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint)) ';
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT al.annual_leave_id AS "annualLeaveId", al.employee_id AS "employeeId", ' +
          ' al.base_year AS "baseYear", al.granted_days AS "grantedDays", ' +
          ' al.used_days AS "usedDays", al.remaining_days AS "remainingDays" ' +
          fromWhere +
          ' ORDER BY al.base_year DESC, al.annual_leave_id DESC LIMIT :size OFFSET :offset',
        { ...filter, size: paging.size, offset: paging.offset },
      );
      const counts = await db.query('SELECT COUNT(*) AS total ' + fromWhere, filter);
      return {
        items,
        page: paging.page,
        size: paging.size,
        total: Number(counts[0]['total']),
      };
    });
  }

  @Get('/leave-usages')
  async listLeaveUsages(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const query = checks.queryOf(req.query);
    const paging = pageOf(query);
    const filter = {
      annualLeaveId: integerText(query['annualLeaveId'], '연차 ID'),
      startDate: dateText(query['startDate'], '조회 시작일'),
      endDate: dateText(query['endDate'], '조회 종료일'),
    };
    const fromWhere =
      ' FROM leave_usage lu ' +
      ' WHERE (CAST(:annualLeaveId AS bigint) IS NULL OR lu.annual_leave_id = CAST(:annualLeaveId AS bigint)) ' +
      ' AND (CAST(:startDate AS date) IS NULL OR lu.used_date >= CAST(:startDate AS date)) ' +
      ' AND (CAST(:endDate AS date) IS NULL OR lu.used_date <= CAST(:endDate AS date)) ';
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT lu.leave_usage_id AS "leaveUsageId", lu.used_date AS "usedDate", ' +
          ' lu.used_days AS "usedDays", lu.attendance_request_id AS "attendanceRequestId" ' +
          fromWhere +
          ' ORDER BY lu.used_date DESC, lu.leave_usage_id DESC LIMIT :size OFFSET :offset',
        { ...filter, size: paging.size, offset: paging.offset },
      );
      const counts = await db.query('SELECT COUNT(*) AS total ' + fromWhere, filter);
      return {
        items,
        page: paging.page,
        size: paging.size,
        total: Number(counts[0]['total']),
      };
    });
  }

  @Get('/leave-grant-rules')
  async listLeaveGrantRules(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const query = checks.queryOf(req.query);
    const paging = pageOf(query);
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT leave_grant_rule_id AS "leaveGrantRuleId", name AS "name", ' +
          ' base_days AS "baseDays", additional_days AS "additionalDays", ' +
          ' additional_condition AS "additionalCondition", use_status AS "useStatus" ' +
          ' FROM leave_grant_rule ' +
          ' ORDER BY leave_grant_rule_id LIMIT :size OFFSET :offset',
        { size: paging.size, offset: paging.offset },
      );
      const counts = await db.query('SELECT COUNT(*) AS total FROM leave_grant_rule', {});
      return {
        items,
        page: paging.page,
        size: paging.size,
        total: Number(counts[0]['total']),
      };
    });
  }

  @Patch('/leave-grant-rules/:leaveGrantRuleId')
  async updateLeaveGrantRule(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.inputOf(req.body);
    const ruleId = req.params['leaveGrantRuleId'];
    if (!INTEGER_PATTERN.test(ruleId)) {
      throw new ApiError(404, 'LEAVE_GRANT_RULE_NOT_FOUND', '연차 생성 기준을 찾을 수 없습니다.');
    }
    let name: string | null = null;
    if (data['name'] !== undefined && data['name'] !== null) {
      if (typeof data['name'] !== 'string' || data['name'].trim() === '' || data['name'].length > 100) {
        throw invalid('기준명은 1자 이상 100자 이하여야 합니다.');
      }
      name = data['name'];
    }
    let additionalCondition: string | null = null;
    if (data['additionalCondition'] !== undefined && data['additionalCondition'] !== null) {
      if (typeof data['additionalCondition'] !== 'string' || data['additionalCondition'].length > 500) {
        throw invalid('가산 조건은 500자 이하여야 합니다.');
      }
      additionalCondition = data['additionalCondition'];
    }
    let useStatus: string | null = null;
    if (data['useStatus'] !== undefined && data['useStatus'] !== null) {
      if (typeof data['useStatus'] !== 'string' || !USE_STATUSES.includes(data['useStatus'])) {
        throw invalid('사용 여부는 사용 또는 미사용이어야 합니다.');
      }
      useStatus = data['useStatus'];
    }
    const baseDays = numberText(data['baseDays'], '기본일수');
    const additionalDays = numberText(data['additionalDays'], '가산일수');
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT leave_grant_rule_id FROM leave_grant_rule WHERE leave_grant_rule_id = CAST(:id AS bigint)',
        { id: ruleId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'LEAVE_GRANT_RULE_NOT_FOUND', '연차 생성 기준을 찾을 수 없습니다.');
      }
      const rows = await db.query(
        'UPDATE leave_grant_rule SET ' +
          ' name = COALESCE(CAST(:name AS varchar), name), ' +
          ' base_days = COALESCE(CAST(:baseDays AS numeric), base_days), ' +
          ' additional_days = COALESCE(CAST(:additionalDays AS numeric), additional_days), ' +
          ' additional_condition = COALESCE(CAST(:additionalCondition AS varchar), additional_condition), ' +
          ' use_status = COALESCE(CAST(:useStatus AS varchar), use_status), ' +
          ' updated_at = now() ' +
          ' WHERE leave_grant_rule_id = CAST(:id AS bigint) ' +
          ' RETURNING leave_grant_rule_id AS "leaveGrantRuleId", use_status AS "useStatus"',
        { id: ruleId, name, baseDays, additionalDays, additionalCondition, useStatus },
      );
      return rows[0];
    });
  }
}
