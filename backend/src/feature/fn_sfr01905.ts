import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const SCOPES = ['전체', '부서', '개인'];

@Controller('api/v1')
export class FnSfr01905Controller {
  @Get('/annual-leaves/summary')
  async listAnnualLeaveSummaries(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    let isManager = true;
    try {
      user.require('근태 담당자');
    } catch (e) {
      isManager = false;
    }
    const query = checks.queryOf(req.query);
    const scope = String(query['scope'] ?? '');
    if (!SCOPES.includes(scope)) {
      throw new ApiError(422, 'INVALID_LEAVE_SCOPE', '조회 범위는 전체, 부서, 개인 중 하나여야 합니다.');
    }
    const departmentRaw = query['departmentId'];
    const hasDepartment = departmentRaw !== undefined && departmentRaw !== null && String(departmentRaw) !== '';
    if (scope === '부서' && !hasDepartment) {
      throw new ApiError(422, 'INVALID_LEAVE_SCOPE', '부서 범위 조회에는 부서를 선택해야 합니다.');
    }
    const baseYearText = String(query['baseYear'] ?? '');
    if (!/^\d{4}$/.test(baseYearText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '기준연도를 4자리 숫자로 입력해 주세요.');
    }
    if (hasDepartment && !/^\d+$/.test(String(departmentRaw))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '부서 값이 올바르지 않습니다.');
    }
    const statusRaw = query['employmentStatus'];
    const hasStatus = statusRaw !== undefined && statusRaw !== null && String(statusRaw) !== '';
    if (hasStatus && !['재직자', '퇴직자'].includes(String(statusRaw))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '재직 구분이 올바르지 않습니다.');
    }
    const pageText = String(query['page'] ?? '0');
    const sizeText = String(query['size'] ?? DEFAULT_SIZE);
    if (!/^\d+$/.test(pageText) || !/^\d+$/.test(sizeText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const page = Number(pageText);
    const size = Math.min(Math.max(Number(sizeText), 1), MAX_SIZE);

    // 임직원은 본인 연차만, 근태 담당자의 개인 범위는 본인 (가정)
    const ownOnly = !isManager || scope === '개인';
    const where: string[] = ['a.base_year = CAST(:baseYear AS integer)'];
    const params: Record<string, unknown> = { baseYear: baseYearText };
    if (ownOnly) {
      where.push('e.employee_id = CAST(:userId AS bigint)');
      params.userId = user.id;
    } else if (scope === '부서') {
      where.push('e.department_id = CAST(:departmentId AS bigint)');
      params.departmentId = String(departmentRaw);
    }
    if (hasStatus) {
      where.push('e.employment_status = :employmentStatus');
      params.employmentStatus = String(statusRaw);
    }
    const whereSql = where.join(' AND ');

    return transaction(async (db) => {
      const countRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM employee e JOIN annual_leave a ON a.employee_id = e.employee_id WHERE ' + whereSql,
        params,
      );
      const total = Number(countRows[0]?.total ?? 0);
      const rows = await db.query(
        'SELECT e.employee_id AS "employeeId", e.employee_no AS "employeeNo", e.name AS "employeeName", ' +
          'd.name AS "departmentName", a.granted_days AS "grantedDays", ' +
          'COALESCE(a.used_days, 0) AS "usedDays", COALESCE(a.remaining_days, 0) AS "remainingDays" ' +
          'FROM employee e ' +
          'JOIN department d ON d.department_id = e.department_id ' +
          'JOIN annual_leave a ON a.employee_id = e.employee_id ' +
          'WHERE ' + whereSql + ' ORDER BY e.employee_no LIMIT :limit OFFSET :offset',
        { ...params, limit: size, offset: page * size },
      );
      const monthRows = await db.query(
        'SELECT e.employee_id AS "employeeId", CAST(date_part(\'month\', u.used_date) AS integer) AS "month", ' +
          'SUM(u.used_days) AS "days" ' +
          'FROM employee e ' +
          'JOIN annual_leave a ON a.employee_id = e.employee_id ' +
          'JOIN leave_usage u ON u.annual_leave_id = a.annual_leave_id ' +
          'JOIN attendance_request r ON r.attendance_request_id = u.attendance_request_id ' +
          'WHERE r.approval_status = \'승인\' AND ' + whereSql +
          ' GROUP BY e.employee_id, date_part(\'month\', u.used_date)',
        params,
      );
      const monthly = new Map<string, number[]>();
      for (const m of monthRows) {
        const key = String(m.employeeId);
        if (!monthly.has(key)) {
          monthly.set(key, new Array(12).fill(0));
        }
        const arr = monthly.get(key) as number[];
        arr[Number(m.month) - 1] = Number(m.days);
      }
      const items = rows.map((r: Record<string, unknown>) => ({
        employeeNo: r.employeeNo,
        employeeName: r.employeeName,
        departmentName: r.departmentName,
        grantedDays: Number(r.grantedDays),
        usedDays: Number(r.usedDays),
        remainingDays: Number(r.remainingDays),
        monthlyUsedDays: monthly.get(String(r.employeeId)) ?? new Array(12).fill(0),
      }));
      return { items, page, size, total };
    });
  }
}
