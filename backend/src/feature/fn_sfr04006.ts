import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 목록 크기 기본값과 최대값
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Controller('api/v1')
export class FnSfr04006Controller {
  @Get('/schedules')
  async listSchedules(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);

    const startRaw = query['startDate'];
    const endRaw = query['endDate'];
    const pageRaw = query['page'];
    const sizeRaw = query['size'];

    let startDate: string | null = null;
    if (startRaw !== undefined && startRaw !== null && startRaw !== '') {
      startDate = String(startRaw);
      if (!DATE_PATTERN.test(startDate)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '조회 시작일 형식이 올바르지 않습니다.');
      }
    }
    let endDate: string | null = null;
    if (endRaw !== undefined && endRaw !== null && endRaw !== '') {
      endDate = String(endRaw);
      if (!DATE_PATTERN.test(endDate)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '조회 종료일 형식이 올바르지 않습니다.');
      }
    }

    let page = 0;
    if (pageRaw !== undefined && pageRaw !== null && pageRaw !== '') {
      page = Number(pageRaw);
      if (!Number.isInteger(page) || page < 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
      }
    }
    let size = DEFAULT_SIZE;
    if (sizeRaw !== undefined && sizeRaw !== null && sizeRaw !== '') {
      size = Number(sizeRaw);
      if (!Number.isInteger(size) || size < 1) {
        throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
      }
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }

    return transaction(async (db) => {
      // 조회 기간을 지정하지 않으면 오늘 기준 (SQL COALESCE로 오늘 날짜 적용)
      // 가정: 권한 범위는 본인 일정(개인 범위)으로 한정한다.
      const where = `
        s.owner_id = CAST(:userId AS bigint)
        AND s.start_at < COALESCE(CAST(:endDate AS date), CURRENT_DATE) + 1
        AND s.end_at >= COALESCE(CAST(:startDate AS date), CURRENT_DATE)`;
      const params = {
        userId: user.id,
        startDate,
        endDate,
      };

      const countRows = await db.query(
        `SELECT COUNT(*) AS "total" FROM schedule s WHERE ${where}`,
        params,
      );
      const total = Number(countRows[0]['total']);

      const items = await db.query(
        `SELECT s.schedule_id AS "scheduleId",
                s.title AS "title",
                s.start_at AS "startAt",
                s.end_at AS "endAt",
                s.all_day AS "allDay",
                s.location AS "location"
           FROM schedule s
          WHERE ${where}
          ORDER BY s.start_at, s.schedule_id
          LIMIT :limit OFFSET :offset`,
        { ...params, limit: size, offset: page * size },
      );

      return { items, page, size, total };
    });
  }
}
