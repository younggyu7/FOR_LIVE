import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 연차 변경이력은 change_history.target_type = 'annual_leave', target_id = annual_leave_id 로 기록된다.
const ANNUAL_LEAVE_TARGET_TYPE = 'annual_leave';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

@Controller('api/v1')
export class FnSfr01904Controller {
  @Get('/change-histories')
  async listChangeHistories(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const q = checks.queryOf(req.query);

    const page = isBlank(q['page']) ? 0 : Number(q['page']);
    const size = isBlank(q['size']) ? DEFAULT_SIZE : Number(q['size']);
    if (!Number.isInteger(page) || page < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
    }
    if (!Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
    }
    const limit = Math.min(size, MAX_SIZE);

    const where: string[] = ['ch.target_type = :targetType'];
    const params: Record<string, unknown> = { targetType: ANNUAL_LEAVE_TARGET_TYPE };

    if (!isBlank(q['employeeId'])) {
      const employeeId = String(q['employeeId']);
      if (!/^\d+$/.test(employeeId)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '대상 임직원이 올바르지 않습니다.');
      }
      where.push('EXISTS (SELECT 1 FROM annual_leave al WHERE al.annual_leave_id = ch.target_id AND al.employee_id = CAST(:employeeId AS bigint))');
      params['employeeId'] = employeeId;
    }
    if (!isBlank(q['fromDate'])) {
      const fromDate = String(q['fromDate']);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '변경 일시 시작은 YYYY-MM-DD 형식이어야 합니다.');
      }
      where.push('ch.changed_at >= CAST(:fromDate AS date)');
      params['fromDate'] = fromDate;
    }
    if (!isBlank(q['toDate'])) {
      const toDate = String(q['toDate']);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '변경 일시 종료는 YYYY-MM-DD 형식이어야 합니다.');
      }
      where.push("ch.changed_at < CAST(:toDate AS date) + interval '1 day'");
      params['toDate'] = toDate;
    }

    const whereSql = where.join(' AND ');

    return transaction(async (db) => {
      const countRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM change_history ch WHERE ' + whereSql,
        params,
      );
      const total = Number(countRows[0]?.['total'] ?? 0);
      const items = await db.query(
        'SELECT ch.changed_at AS "changedAt", ch.changer_id AS "changerId", ch.change_content AS "changeContent", ch.change_type AS "changeType" '
          + 'FROM change_history ch WHERE ' + whereSql
          + ' ORDER BY ch.changed_at DESC, ch.change_history_id DESC'
          + ' LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)',
        { ...params, limit: String(limit), offset: String(page * limit) },
      );
      return { items, page, size: limit, total };
    });
  }
}
