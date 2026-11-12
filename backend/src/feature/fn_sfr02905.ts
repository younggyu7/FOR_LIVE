import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function intOf(value: unknown, fallback: number, label: string): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const text = String(value);
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return Number(text);
}

@Controller('api/v1')
export class FnSfr02905Controller {
  @Get('/employee-departments')
  async listEmployeeDepartments(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const page = intOf(query['page'], 0, '쪽 번호');
    const requestedSize = intOf(query['size'], DEFAULT_SIZE, '쪽 크기');
    if (requestedSize < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기는 1 이상이어야 합니다.');
    }
    const size = Math.min(requestedSize, MAX_SIZE);
    // 가정: employeeId가 없으면 본인(로그인 사용자)의 소속을 조회한다.
    const rawEmployeeId = query['employeeId'];
    const hasEmployeeId = rawEmployeeId !== undefined && rawEmployeeId !== null && rawEmployeeId !== '';
    if (hasEmployeeId && !/^\d+$/.test(String(rawEmployeeId))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '임직원 값이 올바르지 않습니다.');
    }
    const employeeId = hasEmployeeId ? String(rawEmployeeId) : user.id;
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '대상 임직원을 찾을 수 없습니다.');
      }
      const items = await db.query(
        `SELECT ed.employee_department_id AS "employeeDepartmentId",
          ed.employee_id AS "employeeId",
          ed.department_id AS "departmentId",
          e.department_id AS "primaryDepartmentId"
        FROM employee_department ed
        JOIN employee e ON e.employee_id = ed.employee_id
        WHERE ed.employee_id = CAST(:employeeId AS bigint)
        ORDER BY ed.employee_department_id
        LIMIT :size OFFSET :offset`,
        { employeeId, size, offset: page * size },
      );
      const counted = await db.query(
        'SELECT COUNT(*) AS "total" FROM employee_department WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      const total = Number(counted[0]['total']);
      return { items, page, size, total };
    });
  }
}
