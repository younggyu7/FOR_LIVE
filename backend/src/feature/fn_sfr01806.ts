import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 법정 기준시간은 환경설정(분류 '근태', 키 'legal_weekly_work_hours')에서 읽는다.
const LIMIT_CATEGORY = '근태';
const LIMIT_KEY = 'legal_weekly_work_hours';
// 가정: 유형별 집계에서 반려된 신청은 제외한다.
const EXCLUDED_STATUS = '반려';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Controller('api/v1')
export class FnSfr01806Controller {
  @Get('/work-hours/weekly')
  async listWeeklyWorkHours(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const userId = user.id;
    if (userId === null || userId === undefined) {
      throw new ApiError(401, 'UNAUTHORIZED', '인증이 필요합니다.');
    }
    const q = checks.queryOf(req.query);
    const range = this.readRange(q);
    const filter = this.readFilter(q);
    const paging = this.readPaging(q);
    const isStaff = this.isStaff(user);
    return transaction(async (db) => {
      const scope = await this.scopeOf(db, String(userId), isStaff, filter);
      const limitRows = await db.query(
        'SELECT setting_value AS "settingValue" FROM system_setting WHERE category = :category AND setting_key = :key',
        { category: LIMIT_CATEGORY, key: LIMIT_KEY },
      );
      const rawLimit = limitRows.length > 0 ? limitRows[0].settingValue : null;
      const limit = rawLimit === null || rawLimit === undefined || String(rawLimit).trim() === '' ? NaN : Number(rawLimit);
      if (Number.isNaN(limit)) {
        throw new ApiError(422, 'WORK_HOUR_LIMIT_NOT_CONFIGURED', '근태 설정에 법정 기준시간이 없습니다.');
      }
      const rows = await db.query(
        `SELECT cr.employee_id AS "employeeId",
          to_char(date_trunc('week', cr.work_date), 'YYYY-MM-DD') AS "weekStartDate",
          COALESCE(SUM(date_part('epoch', cr.check_out_at - cr.check_in_at) / 3600.0)
            FILTER (WHERE cr.check_in_at IS NOT NULL AND cr.check_out_at IS NOT NULL), 0) AS "weeklyWorkHours",
          COALESCE(BOOL_OR(cr.check_in_at IS NULL OR cr.check_out_at IS NULL), false) AS "hasMissingRecord"
        FROM commute_record cr
        JOIN employee e ON e.employee_id = cr.employee_id
        WHERE cr.work_date >= CAST(:startDate AS date)
          AND cr.work_date <= CAST(:endDate AS date)
          AND (CAST(:employeeId AS bigint) IS NULL OR cr.employee_id = CAST(:employeeId AS bigint))
          AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))
        GROUP BY cr.employee_id, date_trunc('week', cr.work_date)
        ORDER BY date_trunc('week', cr.work_date), cr.employee_id`,
        { startDate: range.startDate, endDate: range.endDate, employeeId: scope.employeeId, departmentId: scope.departmentId },
      );
      const all = rows.map((r: any) => {
        const hours = Number(r.weeklyWorkHours);
        return {
          employeeId: Number(r.employeeId),
          weekStartDate: r.weekStartDate,
          weeklyWorkHours: hours,
          isOverLimit: hours > limit,
          hasMissingRecord: Boolean(r.hasMissingRecord),
        };
      });
      const from = paging.page * paging.size;
      return { items: all.slice(from, from + paging.size), page: paging.page, size: paging.size, total: all.length };
    });
  }

  @Get('/work-hours/type-summary')
  async listAttendanceTypeSummary(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const userId = user.id;
    if (userId === null || userId === undefined) {
      throw new ApiError(401, 'UNAUTHORIZED', '인증이 필요합니다.');
    }
    const q = checks.queryOf(req.query);
    const range = this.readRange(q);
    const filter = this.readFilter(q);
    const paging = this.readPaging(q);
    const isStaff = this.isStaff(user);
    return transaction(async (db) => {
      const scope = await this.scopeOf(db, String(userId), isStaff, filter);
      const rows = await db.query(
        `SELECT ar.attendance_type AS "attendanceType",
          COUNT(*) AS "count",
          SUM(ar.end_date - ar.start_date + 1) AS "days"
        FROM attendance_request ar
        JOIN employee e ON e.employee_id = ar.employee_id
        WHERE ar.start_date <= CAST(:endDate AS date)
          AND ar.end_date >= CAST(:startDate AS date)
          AND ar.approval_status <> :excluded
          AND (CAST(:employeeId AS bigint) IS NULL OR ar.employee_id = CAST(:employeeId AS bigint))
          AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))
        GROUP BY ar.attendance_type
        ORDER BY ar.attendance_type`,
        { startDate: range.startDate, endDate: range.endDate, excluded: EXCLUDED_STATUS, employeeId: scope.employeeId, departmentId: scope.departmentId },
      );
      const all = rows.map((r: any) => ({
        attendanceType: r.attendanceType,
        count: Number(r.count),
        days: Number(r.days),
      }));
      const from = paging.page * paging.size;
      return { items: all.slice(from, from + paging.size), page: paging.page, size: paging.size, total: all.length };
    });
  }

  private isStaff(user: any): boolean {
    try {
      user.require('근태 담당자');
      return true;
    } catch (e) {
      return false;
    }
  }

  private readRange(q: any) {
    const startDate = q['startDate'] === undefined || q['startDate'] === null ? '' : String(q['startDate']);
    const endDate = q['endDate'] === undefined || q['endDate'] === null ? '' : String(q['endDate']);
    if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 시작일과 종료일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    if (endDate < startDate) {
      throw new ApiError(400, 'VALIDATION_FAILED', '종료일은 시작일 이후여야 합니다.');
    }
    return { startDate, endDate };
  }

  private readId(value: unknown, label: string): string | null {
    if (value === undefined || value === null || String(value) === '') {
      return null;
    }
    const text = String(value);
    if (!/^\d+$/.test(text)) {
      throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 숫자여야 합니다.');
    }
    return text;
  }

  private readFilter(q: any) {
    return {
      employeeId: this.readId(q['employeeId'], '임직원 ID'),
      departmentId: this.readId(q['departmentId'], '부서 ID'),
    };
  }

  private readPaging(q: any) {
    const pageRaw = q['page'] === undefined || q['page'] === '' ? 0 : Number(q['page']);
    const sizeRaw = q['size'] === undefined || q['size'] === '' ? DEFAULT_SIZE : Number(q['size']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    return { page: pageRaw, size: Math.min(sizeRaw, MAX_SIZE) };
  }

  // 조회 범위: 근태 담당자는 전체, 임직원은 본인만 조회한다.
  private async scopeOf(db: any, userId: string, isStaff: boolean, filter: { employeeId: string | null; departmentId: string | null }) {
    if (isStaff) {
      return { employeeId: filter.employeeId, departmentId: filter.departmentId };
    }
    if (filter.employeeId !== null && filter.employeeId !== userId) {
      throw new ApiError(422, 'SCOPE_NOT_PERMITTED', '조회 권한 범위 밖의 요청입니다.');
    }
    if (filter.departmentId !== null) {
      const own = await db.query(
        'SELECT department_id AS "departmentId" FROM employee WHERE employee_id = CAST(:userId AS bigint)',
        { userId },
      );
      if (own.length === 0 || String(own[0].departmentId) !== filter.departmentId) {
        throw new ApiError(422, 'SCOPE_NOT_PERMITTED', '조회 권한 범위 밖의 요청입니다.');
      }
    }
    return { employeeId: userId, departmentId: filter.departmentId };
  }
}
