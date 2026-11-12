import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 쪽 크기 기본값과 최대값
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Controller('api/v1')
export class FnSfr03804Controller {
  @Get('/menu-usage-statistics')
  async listMenuUsageStatistics(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const query = checks.queryOf(req.query);

    const startRaw = query['startDate'];
    const endRaw = query['endDate'];
    const startDate = startRaw === undefined || startRaw === null || startRaw === '' ? null : String(startRaw);
    const endDate = endRaw === undefined || endRaw === null || endRaw === '' ? null : String(endRaw);
    if (startDate !== null && !DATE_PATTERN.test(startDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '집계 시작일 형식이 올바르지 않습니다.');
    }
    if (endDate !== null && !DATE_PATTERN.test(endDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '집계 종료일 형식이 올바르지 않습니다.');
    }

    const pageRaw = query['page'];
    const sizeRaw = query['size'];
    const page = pageRaw === undefined || pageRaw === null || pageRaw === '' ? 0 : Number(pageRaw);
    let size = sizeRaw === undefined || sizeRaw === null || sizeRaw === '' ? DEFAULT_SIZE : Number(sizeRaw);
    if (!Number.isInteger(page) || page < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
    }
    if (!Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }

    return transaction(async (db) => {
      if (startDate !== null && endDate !== null) {
        const check = await db.query(
          'SELECT CAST(:endDate AS date) < CAST(:startDate AS date) AS "invalid"',
          { startDate, endDate },
        );
        if (check[0] && check[0]['invalid'] === true) {
          throw new ApiError(422, 'INVALID_STATISTICS_PERIOD', '집계 종료일은 시작일보다 앞設 수 없습니다.'.replace('앞設', '앞') );
        }
      }

      // 조회 기간 미입력 시 전체 기간으로 집계한다 (결정)
      const where = `
        WHERE (CAST(:startDate AS date) IS NULL OR l.used_at >= CAST(:startDate AS date))
          AND (CAST(:endDate AS date) IS NULL OR l.used_at < CAST(:endDate AS date) + 1)`;
      const params = { startDate, endDate };

      const totalRows = await db.query(
        `SELECT COUNT(*) AS "total" FROM (
           SELECT l.menu_id
             FROM menu_usage_log l
             JOIN menu m ON m.menu_id = l.menu_id
             ${where}
            GROUP BY l.menu_id
         ) t`,
        params,
      );
      const total = Number(totalRows[0]['total']);

      const rows = await db.query(
        `SELECT m.name AS "menuName", CAST(COUNT(*) AS integer) AS "usageCount"
           FROM menu_usage_log l
           JOIN menu m ON m.menu_id = l.menu_id
           ${where}
          GROUP BY m.menu_id, m.name
          ORDER BY COUNT(*) DESC, m.name
          LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { ...params, size, offset: page * size },
      );

      return { items: rows, page, size, total };
    });
  }
}
