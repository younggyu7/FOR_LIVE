import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 예약 첨부파일은 attachment.target_type 이 이 값이고 target_id 가 예약 ID 인 행이다
const ATTACHMENT_TARGET_TYPE = 'RESOURCE_RESERVATION';

// 사용 권한 및 공개범위가 허용된 자원만 (자원 별칭 r)
const RESOURCE_ACCESS = `(r.visibility_scope = '전체' OR EXISTS (
  SELECT 1 FROM resource_permission p
  WHERE p.resource_id = r.resource_id
    AND (p.employee_id = CAST(:userId AS bigint)
      OR p.department_id = (SELECT e.department_id FROM employee e WHERE e.employee_id = CAST(:userId AS bigint)))
))`;

const RANGE_START = `CASE CAST(:viewType AS text)
  WHEN 'DAY' THEN CAST(:baseDate AS date)
  WHEN 'WEEK' THEN date_trunc('week', CAST(:baseDate AS date))
  ELSE date_trunc('month', CAST(:baseDate AS date))
END`;

const RANGE_END = `CASE CAST(:viewType AS text)
  WHEN 'DAY' THEN CAST(:baseDate AS date) + interval '1 day'
  WHEN 'WEEK' THEN date_trunc('week', CAST(:baseDate AS date)) + interval '7 days'
  ELSE date_trunc('month', CAST(:baseDate AS date)) + interval '1 month'
END`;

function text(v: unknown): string | null {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  return String(v);
}

function idOf(v: unknown, name: string): string | null {
  const s = text(v);
  if (s === null) {
    return null;
  }
  if (!/^\d+$/.test(s)) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${name} 형식이 올바르지 않습니다.`);
  }
  return s;
}

function pagingOf(q: Record<string, unknown>): { page: number; size: number } {
  const p = idOf(q['page'], 'page') ?? '0';
  const s = idOf(q['size'], 'size') ?? String(DEFAULT_SIZE);
  const size = Number(s);
  if (size < 1 || size > MAX_SIZE) {
    throw new ApiError(400, 'VALIDATION_FAILED', `size는 1에서 ${MAX_SIZE} 사이여야 합니다.`);
  }
  return { page: Number(p), size };
}

@Controller('api/v1')
export class FnSfr03301Controller {
  @Get('/resources')
  async listResources(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const { page, size } = pagingOf(q);
    const params = {
      userId: user.id,
      categoryId: idOf(q['resourceCategoryId'], 'resourceCategoryId'),
      attributeName: text(q['attributeName']),
      attributeValue: text(q['attributeValue']),
    };
    const where = `WHERE ${RESOURCE_ACCESS}
      AND (CAST(:categoryId AS bigint) IS NULL OR r.resource_category_id = CAST(:categoryId AS bigint))
      AND ((CAST(:attributeName AS text) IS NULL AND CAST(:attributeValue AS text) IS NULL) OR EXISTS (
        SELECT 1 FROM resource_attribute a
        WHERE a.resource_id = r.resource_id
          AND (CAST(:attributeName AS text) IS NULL OR a.attribute_name = CAST(:attributeName AS text))
          AND (CAST(:attributeValue AS text) IS NULL OR a.attribute_value = CAST(:attributeValue AS text))
      ))`;
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT r.resource_id AS "resourceId", r.name AS "name",
          r.resource_category_id AS "resourceCategoryId", r.approval_required AS "approvalRequired"
        FROM resource r
        ${where}
        ORDER BY r.name, r.resource_id
        LIMIT CAST(:size AS bigint) OFFSET CAST(:offset AS bigint)`,
        { ...params, size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM resource r ${where}`,
        params,
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Get('/resource-reservations')
  async listResourceReservations(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const { page, size } = pagingOf(q);
    const viewType = text(q['viewType']);
    if (viewType === null || !['DAY', 'WEEK', 'MONTH'].includes(viewType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 형태는 일간, 주간, 월간 중 하나여야 합니다.');
    }
    const baseDate = text(q['baseDate']);
    if (baseDate === null || !/^\d{4}-\d{2}-\d{2}$/.test(baseDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 기준일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    const mine = text(q['mine']);
    if (mine !== null && mine !== 'true' && mine !== 'false') {
      throw new ApiError(400, 'VALIDATION_FAILED', '본인 예약 조건 형식이 올바르지 않습니다.');
    }
    const params = {
      userId: user.id,
      viewType,
      baseDate,
      categoryId: idOf(q['resourceCategoryId'], 'resourceCategoryId'),
      resourceId: idOf(q['resourceId'], 'resourceId'),
      mine,
    };
    const from = `FROM resource_reservation rr
      JOIN resource r ON r.resource_id = rr.resource_id
      WHERE ${RESOURCE_ACCESS}
        AND rr.start_at < (${RANGE_END})
        AND rr.end_at >= (${RANGE_START})
        AND (CAST(:categoryId AS bigint) IS NULL OR r.resource_category_id = CAST(:categoryId AS bigint))
        AND (CAST(:resourceId AS bigint) IS NULL OR rr.resource_id = CAST(:resourceId AS bigint))
        AND (CAST(:mine AS boolean) IS NOT TRUE
          OR rr.reserver_id = CAST(:userId AS bigint) OR rr.user_id = CAST(:userId AS bigint))`;
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT rr.resource_reservation_id AS "resourceReservationId", rr.resource_id AS "resourceId",
          rr.start_at AS "startAt", rr.end_at AS "endAt", rr.status AS "status"
        ${from}
        ORDER BY rr.start_at, rr.resource_reservation_id
        LIMIT CAST(:size AS bigint) OFFSET CAST(:offset AS bigint)`,
        { ...params, size, offset: page * size },
      );
      const counts = await db.query(`SELECT COUNT(*) AS "total" ${from}`, params);
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Get('/resource-reservations/:resourceReservationId')
  async getResourceReservation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const id = idOf(req.params['resourceReservationId'], 'resourceReservationId');
    if (id === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '예약 ID가 필요합니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT rr.resource_id AS "resourceId", rr.reserver_id AS "reserverId", rr.user_id AS "userId",
          rr.start_at AS "startAt", rr.end_at AS "endAt", rr.repeat_type AS "repeatType",
          to_char(rr.repeat_until, 'YYYY-MM-DD') AS "repeatUntil",
          rr.content AS "content", rr.status AS "status",
          (${RESOURCE_ACCESS}
            OR rr.reserver_id = CAST(:userId AS bigint)
            OR rr.user_id = CAST(:userId AS bigint)) AS "allowed"
        FROM resource_reservation rr
        JOIN resource r ON r.resource_id = rr.resource_id
        WHERE rr.resource_reservation_id = CAST(:id AS bigint)`,
        { id, userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'RESOURCE_RESERVATION_NOT_FOUND', '예약을 찾을 수 없습니다.');
      }
      const row = rows[0];
      if (row['allowed'] !== true) {
        throw new ApiError(403, 'FORBIDDEN', '이 예약 내역에 접근할 권한이 없습니다.');
      }
      delete row['allowed'];
      const attachments = await db.query(
        `SELECT attachment_id AS "attachmentId", file_name AS "fileName",
          file_extension AS "fileExtension", file_size AS "fileSize"
        FROM attachment
        WHERE target_type = :targetType AND target_id = CAST(:id AS bigint)
        ORDER BY attachment_id`,
        { targetType: ATTACHMENT_TARGET_TYPE, id },
      );
      return { ...row, attachments };
    });
  }
}
