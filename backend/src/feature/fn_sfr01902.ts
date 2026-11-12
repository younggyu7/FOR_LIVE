import { Controller, Post, Put, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '근태 담당자';

// 가정: 생성일수는 사용 상태인 연차 생성 기준의 기본일수(base_days)이다.
// 가산 조건은 구조화되어 있지 않아 자동 적용하지 않고, 조정 생성 일수(grantedDays)가 있으면 그 값을 쓴다.

function parseId(value: unknown): number {
  const text = String(value ?? '');
  if (!/^[0-9]+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '연차 ID 형식이 올바르지 않습니다.');
  }
  return Number(text);
}

function parseDays(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '생성 일수는 0 이상의 숫자여야 합니다.');
  }
  return value;
}

@Controller('api/v1')
export class FnSfr01902Controller {
  @Post('/annual-leaves/generate')
  @HttpCode(200)
  async generateAnnualLeaves(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const ids = data['employeeIds'];
    const baseYear = data['baseYear'];
    if (!Array.isArray(ids) || ids.length === 0 || baseYear === undefined || baseYear === null || baseYear === '') {
      throw new ApiError(422, 'GENERATE_REQUIRED_MISSING', '대상 임직원과 기준 연도를 선택해 주세요.');
    }
    if (!Number.isInteger(baseYear)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '기준 연도는 정수여야 합니다.');
    }
    const employeeIds: number[] = [];
    for (const id of ids) {
      if (!Number.isInteger(id)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '대상 임직원 ID 형식이 올바르지 않습니다.');
      }
      if (!employeeIds.includes(id as number)) {
        employeeIds.push(id as number);
      }
    }
    let given: number | null = null;
    if (data['grantedDays'] !== undefined && data['grantedDays'] !== null && data['grantedDays'] !== '') {
      given = parseDays(data['grantedDays']);
    }
    return transaction(async (db) => {
      const rules = await db.query(
        'SELECT leave_grant_rule_id AS "ruleId", base_days AS "baseDays" FROM leave_grant_rule WHERE use_status = :status ORDER BY leave_grant_rule_id LIMIT 1',
        { status: '사용' },
      );
      if (rules.length === 0) {
        throw new ApiError(409, 'INVALID_STATE', '사용 중인 연차 생성 기준이 없습니다.');
      }
      const ruleId = Number(rules[0]['ruleId']);
      const days = given !== null ? given : Number(rules[0]['baseDays']);
      const items = [];
      for (const employeeId of employeeIds) {
        const employees = await db.query(
          'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
          { employeeId },
        );
        if (employees.length === 0) {
          throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '대상 임직원을 찾을 수 없습니다.');
        }
        const exists = await db.query(
          'SELECT annual_leave_id FROM annual_leave WHERE employee_id = CAST(:employeeId AS bigint) AND base_year = :baseYear',
          { employeeId, baseYear },
        );
        if (exists.length > 0) {
          throw new ApiError(409, 'ANNUAL_LEAVE_ALREADY_EXISTS', '동일 연도의 연차가 이미 존재합니다.');
        }
        const rows = await db.query(
          'INSERT INTO annual_leave (employee_id, leave_grant_rule_id, base_year, granted_days, is_confirmed, used_days, remaining_days, created_at, updated_at) ' +
            'VALUES (CAST(:employeeId AS bigint), CAST(:ruleId AS bigint), :baseYear, CAST(:days AS numeric), false, 0, CAST(:days AS numeric), now(), now()) ' +
            'RETURNING annual_leave_id AS "annualLeaveId", employee_id AS "employeeId", granted_days AS "grantedDays", is_confirmed AS "isConfirmed"',
          { employeeId, ruleId, baseYear, days },
        );
        items.push(rows[0]);
      }
      return { items, page: 0, size: items.length, total: items.length };
    });
  }

  @Post('/annual-leaves/confirm')
  @HttpCode(200)
  async confirmAnnualLeaves(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const ids = data['annualLeaveIds'];
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '확정할 연차를 선택해 주세요.');
    }
    const annualLeaveIds: number[] = [];
    for (const id of ids) {
      if (!Number.isInteger(id)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '연차 ID 형식이 올바르지 않습니다.');
      }
      if (!annualLeaveIds.includes(id as number)) {
        annualLeaveIds.push(id as number);
      }
    }
    return transaction(async (db) => {
      const items = [];
      for (const annualLeaveId of annualLeaveIds) {
        const found = await db.query(
          'SELECT is_confirmed AS "isConfirmed" FROM annual_leave WHERE annual_leave_id = CAST(:annualLeaveId AS bigint)',
          { annualLeaveId },
        );
        if (found.length === 0) {
          throw new ApiError(404, 'ANNUAL_LEAVE_NOT_FOUND', '연차를 찾을 수 없습니다.');
        }
        if (found[0]['isConfirmed'] === true) {
          throw new ApiError(409, 'ANNUAL_LEAVE_ALREADY_CONFIRMED', '이미 확정된 연차입니다.');
        }
        const rows = await db.query(
          'UPDATE annual_leave SET is_confirmed = true, confirmed_at = now(), updated_at = now() ' +
            'WHERE annual_leave_id = CAST(:annualLeaveId AS bigint) ' +
            'RETURNING annual_leave_id AS "annualLeaveId", is_confirmed AS "isConfirmed", confirmed_at AS "confirmedAt"',
          { annualLeaveId },
        );
        items.push(rows[0]);
      }
      return { items, page: 0, size: items.length, total: items.length };
    });
  }

  @Put('/annual-leaves/:annualLeaveId')
  async updateAnnualLeave(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const annualLeaveId = parseId(req.params['annualLeaveId']);
    const data = checks.inputOf(req.body);
    if (data['grantedDays'] === undefined || data['grantedDays'] === null || data['grantedDays'] === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '생성 일수를 입력해 주세요.');
    }
    const grantedDays = parseDays(data['grantedDays']);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT is_confirmed AS "isConfirmed" FROM annual_leave WHERE annual_leave_id = CAST(:annualLeaveId AS bigint)',
        { annualLeaveId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'ANNUAL_LEAVE_NOT_FOUND', '연차를 찾을 수 없습니다.');
      }
      if (found[0]['isConfirmed'] === true) {
        throw new ApiError(409, 'ANNUAL_LEAVE_CONFIRMED', '확정된 연차는 직접 수정할 수 없습니다. 정해진 변경 절차를 이용해 주세요.');
      }
      const rows = await db.query(
        'UPDATE annual_leave SET granted_days = CAST(:grantedDays AS numeric), ' +
          'remaining_days = CAST(:grantedDays AS numeric) - COALESCE(used_days, 0), updated_at = now() ' +
          'WHERE annual_leave_id = CAST(:annualLeaveId AS bigint) ' +
          'RETURNING annual_leave_id AS "annualLeaveId"',
        { annualLeaveId, grantedDays },
      );
      return rows[0];
    });
  }

  @Delete('/annual-leaves/:annualLeaveId')
  async deleteAnnualLeave(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const annualLeaveId = parseId(req.params['annualLeaveId']);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT is_confirmed AS "isConfirmed" FROM annual_leave WHERE annual_leave_id = CAST(:annualLeaveId AS bigint)',
        { annualLeaveId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'ANNUAL_LEAVE_NOT_FOUND', '연차를 찾을 수 없습니다.');
      }
      if (found[0]['isConfirmed'] === true) {
        throw new ApiError(409, 'ANNUAL_LEAVE_CONFIRMED', '확정된 연차는 직접 삭제할 수 없습니다. 정해진 변경 절차를 이용해 주세요.');
      }
      await db.execute(
        'DELETE FROM annual_leave WHERE annual_leave_id = CAST(:annualLeaveId AS bigint)',
        { annualLeaveId },
      );
      return {};
    });
  }
}
