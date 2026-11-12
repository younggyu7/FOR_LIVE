import { Controller, Post, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 반려 사유를 비우면 DB 제약(반려는 사유 필수) 때문에 이 문장을 저장한다.
const DEFAULT_REJECT_REASON = '사유 없음';
// 가정: 승인 취소 후 상태는 BEHAVIOR.md 전환표대로 '신청'으로 되돌린다.
const CANCEL_APPROVAL_NEXT_STATUS = '신청';
// 가정: 삭제는 신청·반려·취소 상태의 예약에만 허용한다 (승인된 예약은 삭제 불가).
const DELETABLE_STATUSES = ['신청', '반려', '취소'];

type Db = {
  query(sql: string, params?: Record<string, unknown>): Promise<any[]>;
  execute(sql: string, params?: Record<string, unknown>): Promise<number>;
};

function userIdOf(user: { id: string | null }): string {
  if (typeof user.id !== 'string' || user.id === '') {
    throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다.');
  }
  return user.id;
}

function idOf(req: Request): string {
  const id = req.params['resourceReservationId'];
  if (typeof id !== 'string' || !/^[0-9]+$/.test(id)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '예약 번호 형식이 올바르지 않습니다.');
  }
  return id;
}

async function loadReservation(db: Db, id: string) {
  const rows = await db.query(
    `SELECT resource_reservation_id AS "resourceReservationId",
            resource_id AS "resourceId",
            status AS "status"
       FROM resource_reservation
      WHERE resource_reservation_id = CAST(:id AS bigint)
        FOR UPDATE`,
    { id },
  );
  if (rows.length === 0) {
    throw new ApiError(404, 'RESOURCE_RESERVATION_NOT_FOUND', '예약을 찾을 수 없습니다.');
  }
  return rows[0];
}

async function writeHistory(
  db: Db,
  id: string,
  userId: string,
  changeType: string,
  content: string,
  reason: string | null,
) {
  await db.execute(
    `INSERT INTO change_history
       (changer_id, target_type, target_id, change_type, changed_at, change_content, change_reason, created_at, updated_at)
     VALUES
       (CAST(:userId AS bigint), 'resource_reservation', CAST(:id AS bigint), :changeType, now(), :content, :reason, now(), now())`,
    { userId, id, changeType, content, reason },
  );
}

async function changeStatus(
  db: Db,
  id: string,
  userId: string,
  allowed: string[],
  mismatchMessage: string,
  nextStatus: string,
  changeType: string,
  rejectReason: string | null,
) {
  const current = await loadReservation(db, id);
  if (!allowed.includes(current.status)) {
    throw new ApiError(409, 'RESERVATION_STATUS_MISMATCH', mismatchMessage);
  }
  if (nextStatus === '승인') {
    const conflicts = await db.query(
      `SELECT resource_reservation_id AS "resourceReservationId"
         FROM resource_reservation
        WHERE resource_id = CAST(:resourceId AS bigint)
          AND status = '승인'
          AND resource_reservation_id <> CAST(:id AS bigint)
          AND start_at < (SELECT end_at FROM resource_reservation WHERE resource_reservation_id = CAST(:id AS bigint))
          AND end_at > (SELECT start_at FROM resource_reservation WHERE resource_reservation_id = CAST(:id AS bigint))
        LIMIT 1`,
      { resourceId: current.resourceId, id },
    );
    if (conflicts.length > 0) {
      throw new ApiError(409, 'RESERVATION_TIME_CONFLICT', '다른 승인 예약과 시간이 겹쳐 승인할 수 없습니다.');
    }
  }
  const rows = await db.query(
    `UPDATE resource_reservation
        SET status = :nextStatus,
            reject_reason = COALESCE(CAST(:rejectReason AS text), reject_reason),
            processed_by = CAST(:userId AS bigint),
            processed_at = now(),
            updated_at = now()
      WHERE resource_reservation_id = CAST(:id AS bigint)
      RETURNING status AS "status", processed_at AS "processedAt", processed_by AS "processedBy"`,
    { nextStatus, rejectReason, userId, id },
  );
  await writeHistory(
    db,
    id,
    userId,
    changeType,
    `예약 상태 변경: ${current.status} → ${nextStatus}`,
    rejectReason,
  );
  return rows[0];
}

@Controller('api/v1')
export class FnSfr03305Controller {
  @Post('/resource-reservations/:resourceReservationId/approve')
  @HttpCode(200)
  async approveResourceReservation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자원 담당자');
    const userId = userIdOf(user);
    const id = idOf(req);
    return transaction(async (db) => {
      return changeStatus(db, id, userId, ['신청'], '신청 상태의 예약만 승인할 수 있습니다.', '승인', '예약 승인', null);
    });
  }

  @Post('/resource-reservations/:resourceReservationId/reject')
  @HttpCode(200)
  async rejectResourceReservation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자원 담당자');
    const userId = userIdOf(user);
    const id = idOf(req);
    const data = checks.inputOf(req.body);
    const raw = data['rejectReason'];
    if (raw !== undefined && raw !== null && typeof raw !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '반려 사유는 글자로 입력해야 합니다.');
    }
    const reason = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : DEFAULT_REJECT_REASON;
    return transaction(async (db) => {
      return changeStatus(db, id, userId, ['신청'], '신청 상태의 예약만 반려할 수 있습니다.', '반려', '예약 반려', reason);
    });
  }

  @Post('/resource-reservations/:resourceReservationId/cancel-approval')
  @HttpCode(200)
  async cancelApprovalResourceReservation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자원 담당자');
    const userId = userIdOf(user);
    const id = idOf(req);
    return transaction(async (db) => {
      return changeStatus(
        db,
        id,
        userId,
        ['승인'],
        '승인 상태의 예약만 승인을 취소할 수 있습니다.',
        CANCEL_APPROVAL_NEXT_STATUS,
        '승인 취소',
        null,
      );
    });
  }

  @Post('/resource-reservations/:resourceReservationId/cancel')
  @HttpCode(200)
  async cancelResourceReservation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자원 담당자', '임직원');
    const userId = userIdOf(user);
    const id = idOf(req);
    return transaction(async (db) => {
      return changeStatus(
        db,
        id,
        userId,
        ['신청', '승인'],
        '신청 또는 승인 상태의 예약만 취소할 수 있습니다.',
        '취소',
        '예약 취소',
        null,
      );
    });
  }

  @Delete('/resource-reservations/:resourceReservationId')
  async deleteResourceReservation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자원 담당자');
    const userId = userIdOf(user);
    const id = idOf(req);
    return transaction(async (db) => {
      const current = await loadReservation(db, id);
      if (!DELETABLE_STATUSES.includes(current.status)) {
        throw new ApiError(409, 'RESERVATION_STATUS_MISMATCH', '승인된 예약은 삭제할 수 없습니다. 먼저 승인을 취소해 주세요.');
      }
      await db.execute(
        `DELETE FROM resource_reservation WHERE resource_reservation_id = CAST(:id AS bigint)`,
        { id },
      );
      await writeHistory(db, id, userId, '예약 삭제', `예약 삭제: 삭제 전 상태 ${current.status}`, null);
      return {};
    });
  }
}
