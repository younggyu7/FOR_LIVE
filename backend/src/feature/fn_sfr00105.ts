import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function toInt(raw: unknown, fallback: number, min: number, max: number, label: string): number {
  if (raw === undefined || raw === null || raw === '') {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr00105Controller {
  @Get('/menus')
  async listMenus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자', '인사 담당자', '근태 담당자', '급여 담당자', '자산 담당자');
    const q = checks.queryOf(req.query);
    const page = toInt(q['page'], 0, 0, 1000000, '페이지');
    const size = toInt(q['size'], DEFAULT_SIZE, 1, MAX_SIZE, '크기');
    const moduleRaw = q['module'];
    let moduleName: string | null = null;
    if (moduleRaw !== undefined && moduleRaw !== null && moduleRaw !== '') {
      if (typeof moduleRaw !== 'string' || moduleRaw.length > 100) {
        throw new ApiError(400, 'VALIDATION_FAILED', '연결 모듈 값이 올바르지 않습니다.');
      }
      moduleName = moduleRaw;
    }
    return transaction(async (db) => {
      const me = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:userId AS bigint)',
        { userId: user.id },
      );
      if (me.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '현재 사용자의 임직원 정보를 찾을 수 없습니다.');
      }
      const where =
        " FROM menu m JOIN menu_permission p ON p.menu_id = m.menu_id" +
        " WHERE p.employee_id = CAST(:userId AS bigint)" +
        " AND m.use_status = '사용'" +
        " AND (CAST(:module AS text) IS NULL OR m.module = CAST(:module AS text))";
      const countRows = await db.query(
        'SELECT COUNT(*) AS "total"' + where,
        { userId: user.id, module: moduleName },
      );
      const items = await db.query(
        'SELECT m.menu_id AS "menuId", m.name AS "name", m.module AS "module", m.display_order AS "displayOrder"' +
          where +
          ' ORDER BY m.display_order, m.menu_id' +
          ' LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { userId: user.id, module: moduleName, size: size, offset: page * size },
      );
      return {
        items: items,
        page: page,
        size: size,
        total: Number(countRows[0]['total']),
      };
    });
  }
}
