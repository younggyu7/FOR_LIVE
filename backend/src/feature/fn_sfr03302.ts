import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 반복 유형을 보내지 않으면 NONE으로 저장한다.
const DEFAULT_REPEAT_TYPE = 'NONE';
// 가정: 첨부파일의 업무 대상 유형 코드 (코드 집합 미확정).
const ATTACHMENT_TARGET_TYPE = 'RESOURCE_RESERVATION';
const REPEAT_TYPES = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'];
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

@Controller('api/v1')
export class FnSfr03302Controller {
  @Post('/resource-reservations')
  @HttpCode(200)
  async createResourceReservation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);

    const resourceId = data['resourceId'];
    if (!isId(resourceId)) {
      throw invalid('자원을 선택해 주세요.');
    }
    const startAt = data['startAt'];
    if (typeof startAt !== 'string' || !DATE_TIME_PATTERN.test(startAt)) {
      throw invalid('시작 일시를 올바르게 입력해 주세요.');
    }
    const endAt = data['endAt'];
    if (typeof endAt !== 'string' || !DATE_TIME_PATTERN.test(endAt)) {
      throw invalid('종료 일시를 올바르게 입력해 주세요.');
    }
    const content = data['content'];
    if (typeof content !== 'string' || content.trim() === '') {
      throw invalid('예약 내용을 입력해 주세요.');
    }
    let repeatType = DEFAULT_REPEAT_TYPE;
    const rawRepeatType = data['repeatType'];
    if (rawRepeatType !== undefined && rawRepeatType !== null && rawRepeatType !== '') {
      if (typeof rawRepeatType !== 'string' || !REPEAT_TYPES.includes(rawRepeatType)) {
        throw invalid('반복 유형이 올바르지 않습니다.');
      }
      repeatType = rawRepeatType;
    }
    let repeatUntil: string | null = null;
    const rawRepeatUntil = data['repeatUntil'];
    if (rawRepeatUntil !== undefined && rawRepeatUntil !== null && rawRepeatUntil !== '') {
      if (typeof rawRepeatUntil !== 'string' || !DATE_PATTERN.test(rawRepeatUntil)) {
        throw invalid('반복 종료일을 올바르게 입력해 주세요.');
      }
      repeatUntil = rawRepeatUntil;
    }
    let reservationUserId: number | null = null;
    const rawUserId = data['userId'];
    if (rawUserId !== undefined && rawUserId !== null && rawUserId !== '') {
      if (!isId(rawUserId)) {
        throw invalid('사용자가 올바르지 않습니다.');
      }
      reservationUserId = rawUserId;
    }
    const attachmentIds: number[] = [];
    const rawAttachmentIds = data['attachmentIds'];
    if (rawAttachmentIds !== undefined && rawAttachmentIds !== null) {
      if (!Array.isArray(rawAttachmentIds)) {
        throw invalid('첨부파일 목록이 올바르지 않습니다.');
      }
      for (const id of rawAttachmentIds) {
        if (!isId(id)) {
          throw invalid('첨부파일 ID가 올바르지 않습니다.');
        }
        attachmentIds.push(id);
      }
    }

    return transaction(async (db) => {
      const resources = await db.query(
        'SELECT approval_required AS "approvalRequired" FROM resource WHERE resource_id = CAST(:resourceId AS bigint)',
        { resourceId },
      );
      if (resources.length === 0) {
        throw new ApiError(404, 'RESOURCE_NOT_FOUND', '자원을 찾을 수 없습니다.');
      }
      const approvalRequired = resources[0]['approvalRequired'];

      if (reservationUserId !== null) {
        const users = await db.query(
          'SELECT employee_id AS "employeeId" FROM employee WHERE employee_id = CAST(:reservationUserId AS bigint)',
          { reservationUserId },
        );
        if (users.length === 0) {
          throw invalid('사용자를 찾을 수 없습니다.');
        }
      }

      const permissions = await db.query(
        'SELECT COUNT(*) AS "total" FROM resource_permission rp '
          + 'WHERE rp.resource_id = CAST(:resourceId AS bigint) '
          + 'AND (rp.employee_id = CAST(:userId AS bigint) '
          + 'OR rp.department_id = (SELECT e.department_id FROM employee e WHERE e.employee_id = CAST(:userId AS bigint)))',
        { resourceId, userId: user.id },
      );
      if (Number(permissions[0]['total']) === 0) {
        throw new ApiError(403, 'FORBIDDEN', '이 자원을 사용할 권한이 없습니다.');
      }

      const periods = await db.query(
        'SELECT COALESCE((CAST(:endAt AS timestamptz) < CAST(:startAt AS timestamptz)) '
          + 'OR (CAST(:repeatUntil AS date) < CAST(:startAt AS timestamptz)), false) AS "invalid"',
        { startAt, endAt, repeatUntil },
      );
      if (periods[0]['invalid'] === true) {
        throw new ApiError(422, 'INVALID_RESERVATION_PERIOD', '종료일은 시작일보다 빠를 수 없습니다.');
      }

      const conflicts = await db.query(
        'SELECT COUNT(*) AS "total" FROM resource_reservation '
          + 'WHERE resource_id = CAST(:resourceId AS bigint) AND status = \'승인\' '
          + 'AND start_at < CAST(:endAt AS timestamptz) AND end_at > CAST(:startAt AS timestamptz)',
        { resourceId, startAt, endAt },
      );
      if (Number(conflicts[0]['total']) > 0) {
        throw new ApiError(409, 'RESERVATION_TIME_CONFLICT', '선택한 시간에 이미 승인된 예약이 있습니다.');
      }

      for (const attachmentId of attachmentIds) {
        const found = await db.query(
          'SELECT attachment_id AS "attachmentId" FROM attachment WHERE attachment_id = CAST(:attachmentId AS bigint)',
          { attachmentId },
        );
        if (found.length === 0) {
          throw invalid('첨부파일을 찾을 수 없습니다.');
        }
      }

      // 승인 절차 '사용'이면 신청, '미사용'이면 자동 승인
      const status = approvalRequired === '사용' ? '신청' : '승인';
      const rows = await db.query(
        'INSERT INTO resource_reservation '
          + '(resource_id, reserver_id, user_id, start_at, end_at, content, repeat_type, repeat_until, status, created_at, updated_at) '
          + 'VALUES (CAST(:resourceId AS bigint), CAST(:userId AS bigint), CAST(COALESCE(:reservationUserId, :userId) AS bigint), '
          + 'CAST(:startAt AS timestamptz), CAST(:endAt AS timestamptz), :content, :repeatType, CAST(:repeatUntil AS date), :status, now(), now()) '
          + 'RETURNING resource_reservation_id AS "resourceReservationId", status AS "status"',
        {
          resourceId,
          userId: user.id,
          reservationUserId,
          startAt,
          endAt,
          content,
          repeatType,
          repeatUntil,
          status,
        },
      );
      const created = rows[0];

      for (const attachmentId of attachmentIds) {
        await db.execute(
          'UPDATE attachment SET target_type = :targetType, target_id = CAST(:targetId AS bigint), updated_at = now() '
            + 'WHERE attachment_id = CAST(:attachmentId AS bigint)',
          {
            targetType: ATTACHMENT_TARGET_TYPE,
            targetId: created['resourceReservationId'],
            attachmentId,
          },
        );
      }

      return {
        resourceReservationId: Number(created['resourceReservationId']),
        status: created['status'],
      };
    });
  }
}
