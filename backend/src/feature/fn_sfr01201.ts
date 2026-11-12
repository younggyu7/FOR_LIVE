import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const STATUSES = ['재직자', '퇴직자'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 변경 이력 내용에는 이메일·휴대전화 전후 값을 그대로 적는다 (마스킹 방식 미정). 주민등록번호 값은 적지 않는다.

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function textOf(value: unknown, label: string, max: number, required: boolean): string | null {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw invalid(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (typeof value !== 'string') {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  const text = value.trim();
  if (!text) {
    if (required) {
      throw invalid(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (text.length > max) {
    throw invalid(label + '은(는) ' + max + '자 이하로 입력해 주세요.');
  }
  return text;
}

function intOf(value: unknown, label: string, required: boolean): number | null {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw invalid(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(num) || num <= 0) {
    throw invalid(label + '은(는) 숫자여야 합니다.');
  }
  return num;
}

function statusOf(value: unknown, required: boolean): string | null {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw invalid('재직 구분을 선택해 주세요.');
    }
    return null;
  }
  if (typeof value !== 'string' || !STATUSES.includes(value)) {
    throw invalid('재직 구분은 재직자 또는 퇴직자여야 합니다.');
  }
  return value;
}

@Controller('api/v1')
export class FnSfr01201Controller {
  @Post('/employees')
  @HttpCode(200)
  async createEmployee(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    const employeeNo = textOf(data['employeeNo'], '사번', 50, true);
    const name = textOf(data['name'], '임직원명', 100, true);
    const departmentId = intOf(data['departmentId'], '주부서', true);
    const employmentStatus = statusOf(data['employmentStatus'], true);
    const email = textOf(data['email'], '이메일', 255, false);
    const mobilePhone = textOf(data['mobilePhone'], '휴대전화번호', 20, false);
    if (data['residentNo'] !== undefined && data['residentNo'] !== null && typeof data['residentNo'] !== 'string') {
      throw invalid('주민등록번호 형식이 올바르지 않습니다.');
    }
    // TODO: 주민등록번호 암호화 저장 방식이 정해지지 않아 저장하지 않는다 (todos 참고).
    return transaction(async (db) => {
      const dept = await db.query(
        'SELECT department_id FROM department WHERE department_id = CAST(:departmentId AS bigint)',
        { departmentId },
      );
      if (dept.length === 0) {
        throw invalid('존재하지 않는 부서입니다.');
      }
      const dup = await db.query('SELECT employee_id FROM employee WHERE employee_no = :employeeNo', { employeeNo });
      if (dup.length > 0) {
        throw new ApiError(409, 'EMPLOYEE_NO_DUPLICATED', '이미 존재하는 사번입니다.');
      }
      const rows = await db.query(
        'INSERT INTO employee (employee_no, name, department_id, employment_status, email, mobile_phone, created_at, updated_at) ' +
          'VALUES (:employeeNo, :name, CAST(:departmentId AS bigint), :employmentStatus, :email, :mobilePhone, now(), now()) ' +
          'RETURNING employee_id AS "employeeId"',
        { employeeNo, name, departmentId, employmentStatus, email, mobilePhone },
      );
      return rows[0];
    });
  }

  @Patch('/employees/:employeeId')
  async updateEmployee(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    const employeeId = intOf(req.params['employeeId'], '임직원 ID', true);
    const name = textOf(data['name'], '임직원명', 100, false);
    const departmentId = intOf(data['departmentId'], '주부서', false);
    const employmentStatus = statusOf(data['employmentStatus'], false);
    const email = textOf(data['email'], '이메일', 255, false);
    const mobilePhone = textOf(data['mobilePhone'], '휴대전화번호', 20, false);
    if (data['residentNo'] !== undefined && data['residentNo'] !== null && typeof data['residentNo'] !== 'string') {
      throw invalid('주민등록번호 형식이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT employee_id AS "employeeId", name, department_id AS "departmentId", ' +
          'employment_status AS "employmentStatus", email, mobile_phone AS "mobilePhone" ' +
          'FROM employee WHERE employee_id = CAST(:employeeId AS bigint) FOR UPDATE',
        { employeeId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
      }
      const before = found[0];
      if (departmentId !== null) {
        const dept = await db.query(
          'SELECT department_id FROM department WHERE department_id = CAST(:departmentId AS bigint)',
          { departmentId },
        );
        if (dept.length === 0) {
          throw invalid('존재하지 않는 부서입니다.');
        }
      }
      const changes: string[] = [];
      if (name !== null && name !== before.name) {
        changes.push('임직원명: ' + before.name + ' → ' + name);
      }
      if (departmentId !== null && Number(before.departmentId) !== departmentId) {
        changes.push('주부서 ID: ' + before.departmentId + ' → ' + departmentId);
      }
      if (employmentStatus !== null && employmentStatus !== before.employmentStatus) {
        changes.push('재직 구분: ' + before.employmentStatus + ' → ' + employmentStatus);
      }
      if (email !== null && email !== before.email) {
        changes.push('이메일: ' + (before.email ?? '') + ' → ' + email);
      }
      if (mobilePhone !== null && mobilePhone !== before.mobilePhone) {
        changes.push('휴대전화번호: ' + (before.mobilePhone ?? '') + ' → ' + mobilePhone);
      }
      await db.execute(
        'UPDATE employee SET ' +
          'name = COALESCE(CAST(:name AS varchar), name), ' +
          'department_id = COALESCE(CAST(:departmentId AS bigint), department_id), ' +
          'employment_status = COALESCE(CAST(:employmentStatus AS varchar), employment_status), ' +
          'email = COALESCE(CAST(:email AS varchar), email), ' +
          'mobile_phone = COALESCE(CAST(:mobilePhone AS varchar), mobile_phone), ' +
          'updated_at = now() ' +
          'WHERE employee_id = CAST(:employeeId AS bigint)',
        { name, departmentId, employmentStatus, email, mobilePhone, employeeId },
      );
      if (changes.length > 0) {
        await db.execute(
          'INSERT INTO change_history (changer_id, target_type, target_id, changed_at, change_content, created_at, updated_at) ' +
            "VALUES (CAST(:userId AS bigint), 'employee', CAST(:employeeId AS bigint), now(), :content, now(), now())",
          { userId: user.id, employeeId, content: changes.join('\n') },
        );
      }
      return { employeeId };
    });
  }

  @Get('/employees')
  async listEmployees(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const query = checks.queryOf(req.query);
    const employmentStatus = statusOf(query['employmentStatus'], false);
    const departmentId = intOf(query['departmentId'], '주부서', false);
    const pageNo = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeNo = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(pageNo) || pageNo < 0) {
      throw invalid('page는 0 이상의 정수여야 합니다.');
    }
    if (!Number.isInteger(sizeNo) || sizeNo < 1) {
      throw invalid('size는 1 이상의 정수여야 합니다.');
    }
    const size = Math.min(sizeNo, MAX_SIZE);
    const offset = pageNo * size;
    return transaction(async (db) => {
      const where =
        'WHERE (CAST(:employmentStatus AS varchar) IS NULL OR employment_status = CAST(:employmentStatus AS varchar)) ' +
        'AND (CAST(:departmentId AS bigint) IS NULL OR department_id = CAST(:departmentId AS bigint))';
      const counted = await db.query('SELECT COUNT(*) AS "total" FROM employee ' + where, {
        employmentStatus,
        departmentId,
      });
      const items = await db.query(
        'SELECT employee_id AS "employeeId", employee_no AS "employeeNo", name, department_id AS "departmentId", ' +
          'employment_status AS "employmentStatus", email, mobile_phone AS "mobilePhone" ' +
          'FROM employee ' +
          where +
          ' ORDER BY employee_id LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { employmentStatus, departmentId, size, offset },
      );
      return { items, page: pageNo, size, total: Number(counted[0].total) };
    });
  }
}
