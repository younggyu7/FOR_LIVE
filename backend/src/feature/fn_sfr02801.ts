import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const READ_STATUSES = ['안읽음', '읽음'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 멘션 알림은 포털 채널, 이벤트 유형 '멘션'으로 생성한다.
const MENTION_CHANNEL = '포털';
const MENTION_EVENT_TYPE = '멘션';

function isNumeric(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  return Number.isFinite(Number(value));
}

function isText(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

@Controller('api/v1')
export class FnSfr02801Controller {
  @Get('/notifications')
  async listNotifications(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const page = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const size = Math.min(sizeRaw, MAX_SIZE);
    const where: string[] = ['recipient_id = CAST(:userId AS bigint)'];
    const params: Record<string, unknown> = { userId: user.id };
    const readStatus = query['readStatus'];
    if (readStatus !== undefined && readStatus !== '') {
      if (typeof readStatus !== 'string' || !READ_STATUSES.includes(readStatus)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '읽음 상태가 올바르지 않습니다.');
      }
      where.push('read_status = :readStatus');
      params['readStatus'] = readStatus;
    }
    const eventType = query['eventType'];
    if (eventType !== undefined && eventType !== '') {
      if (typeof eventType !== 'string') {
        throw new ApiError(400, 'VALIDATION_FAILED', '알림 이벤트 유형이 올바르지 않습니다.');
      }
      where.push('event_type = :eventType');
      params['eventType'] = eventType;
    }
    const whereSql = where.join(' AND ');
    return transaction(async (db) => {
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM notification WHERE ${whereSql}`,
        params,
      );
      const rows = await db.query(
        `SELECT notification_id AS "notificationId",
                channel AS "channel",
                title AS "title",
                content AS "content",
                read_status AS "readStatus",
                event_type AS "eventType",
                target_type AS "targetType",
                target_id AS "targetId",
                created_at AS "createdAt"
           FROM notification
          WHERE ${whereSql}
          ORDER BY created_at DESC, notification_id DESC
          LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        { ...params, size: size, offset: page * size },
      );
      return { items: rows, page: page, size: size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/notifications/mentions')
  @HttpCode(200)
  async createMentionNotifications(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    if (!isNumeric(data['recipientId'])) {
      throw new ApiError(400, 'VALIDATION_FAILED', '수신자를 선택해 주세요.');
    }
    if (!isText(data['title']) || String(data['title']).length > 200) {
      throw new ApiError(400, 'VALIDATION_FAILED', '알림 제목은 200자 이내로 입력해 주세요.');
    }
    if (!isText(data['targetType']) || String(data['targetType']).length > 50) {
      throw new ApiError(400, 'VALIDATION_FAILED', '바로가기 대상 유형을 입력해 주세요.');
    }
    if (!isNumeric(data['targetId'])) {
      throw new ApiError(400, 'VALIDATION_FAILED', '바로가기 대상 ID는 숫자여야 합니다.');
    }
    const content = data['content'] === undefined || data['content'] === null || data['content'] === '' ? null : String(data['content']);
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT employment_status AS "employmentStatus"
           FROM employee
          WHERE employee_id = CAST(:recipientId AS bigint)`,
        { recipientId: String(data['recipientId']) },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'MENTION_RECIPIENT_NOT_FOUND', '멘션 대상 사용자를 찾을 수 없습니다.');
      }
      // 가정: 콘텐츠 접근 권한을 확인할 근거 테이블이 없어 퇴직자만 접근 불가로 본다.
      if (found[0]['employmentStatus'] !== '재직자') {
        throw new ApiError(422, 'MENTION_ACCESS_DENIED', '멘션 대상 사용자가 해당 콘텐츠에 접근할 수 없습니다.');
      }
      const rows = await db.query(
        `INSERT INTO notification
           (recipient_id, channel, title, content, read_status, event_type, target_type, target_id, created_at, updated_at)
         VALUES
           (CAST(:recipientId AS bigint), :channel, :title, :content, '안읽음', :eventType, :targetType, CAST(:targetId AS bigint), now(), now())
         RETURNING notification_id AS "notificationId"`,
        {
          recipientId: String(data['recipientId']),
          channel: MENTION_CHANNEL,
          title: String(data['title']),
          content: content,
          eventType: MENTION_EVENT_TYPE,
          targetType: String(data['targetType']),
          targetId: String(data['targetId']),
        },
      );
      return { notificationId: Number(rows[0]['notificationId']) };
    });
  }

  @Patch('/notifications/:notificationId/read')
  async readNotification(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const notificationId = req.params['notificationId'];
    if (!isNumeric(notificationId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '알림 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT read_status AS "readStatus"
           FROM notification
          WHERE notification_id = CAST(:notificationId AS bigint)
            AND recipient_id = CAST(:userId AS bigint)`,
        { notificationId: notificationId, userId: user.id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', '본인에게 발송된 알림을 찾을 수 없습니다.');
      }
      if (found[0]['readStatus'] !== '안읽음') {
        throw new ApiError(409, 'INVALID_STATE', '이미 읽은 알림입니다.');
      }
      const rows = await db.query(
        `UPDATE notification
            SET read_status = '읽음', read_at = now(), updated_at = now()
          WHERE notification_id = CAST(:notificationId AS bigint)
            AND recipient_id = CAST(:userId AS bigint)
          RETURNING notification_id AS "notificationId", read_status AS "readStatus", read_at AS "readAt"`,
        { notificationId: notificationId, userId: user.id },
      );
      return {
        notificationId: Number(rows[0]['notificationId']),
        readStatus: rows[0]['readStatus'],
        readAt: rows[0]['readAt'],
      };
    });
  }
}
