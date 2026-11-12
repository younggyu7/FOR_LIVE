import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const LOGIN_TYPES = ['웹', '메신저', '모바일 앱'];
const DATE_FORM = /^\d{4}-\d{2}-\d{2}$/;

function textOf(v: unknown): string | null {
  if (typeof v !== 'string') {
    return null;
  }
  const t = v.trim();
  return t === '' ? null : t;
}

function intOf(v: unknown, fallback: number): number {
  const t = textOf(v);
  if (t === null) {
    return fallback;
  }
  const n = Number(t);
  if (!Number.isInteger(n)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 쪽 크기는 정수여야 합니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr03801Controller {
  @Get('/login-histories')
  async listLoginHistories(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const q = checks.queryOf(req.query);
    const startDate = textOf(q['startDate']);
    const endDate = textOf(q['endDate']);
    const employeeName = textOf(q['employeeName']);
    const loginType = textOf(q['loginType']);
    if (startDate !== null && !DATE_FORM.test(startDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 시작일 형식이 올바르지 않습니다.');
    }
    if (endDate !== null && !DATE_FORM.test(endDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 종료일 형식이 올바르지 않습니다.');
    }
    if (employeeName !== null && employeeName.length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', '임직원명은 100자 이하여야 합니다.');
    }
    if (loginType !== null && !LOGIN_TYPES.includes(loginType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '로그인 구분은 웹, 메신저, 모바일 앱 중 하나여야 합니다.');
    }
    const page = intOf(q['page'], 0);
    const size = intOf(q['size'], DEFAULT_SIZE);
    if (page < 0 || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 쪽 크기가 올바르지 않습니다.');
    }
    const pageSize = Math.min(size, MAX_SIZE);
    return transaction(async (db) => {
      if (startDate !== null && endDate !== null) {
        const rows = await db.query(
          'SELECT (CAST(:endDate AS date) < CAST(:startDate AS date)) AS "invalid"',
          { startDate, endDate },
        );
        if (rows[0] && rows[0]['invalid'] === true) {
          throw new ApiError(422, 'INVALID_LOGIN_HISTORY_PERIOD', '조회 종료일은 시작일보다 앞설 수 없습니다.');
        }
      }
      const where =
        ' FROM login_history h JOIN employee e ON e.employee_id = h.employee_id' +
        ' WHERE (CAST(:startDate AS date) IS NULL OR h.login_at >= CAST(:startDate AS date))' +
        ' AND (CAST(:endDate AS date) IS NULL OR h.login_at < CAST(:endDate AS date) + 1)' +
        ' AND (CAST(:employeeName AS text) IS NULL OR strpos(e.name, CAST(:employeeName AS text)) > 0)' +
        ' AND (CAST(:loginType AS text) IS NULL OR h.login_type = CAST(:loginType AS text))';
      const filter = { startDate, endDate, employeeName, loginType };
      const totalRows = await db.query('SELECT COUNT(*) AS "total"' + where, filter);
      const total = Number(totalRows[0]['total']);
      const items = await db.query(
        'SELECT e.name AS "employeeName", e.employee_no AS "employeeNo",' +
          ' h.login_at AS "loginAt", h.login_ip AS "loginIp", h.login_type AS "loginType"' +
          where +
          ' ORDER BY h.login_at DESC, h.login_history_id DESC' +
          ' LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)',
        { ...filter, limit: pageSize, offset: page * pageSize },
      );
      return { items, page, size: pageSize, total };
    });
  }
}
