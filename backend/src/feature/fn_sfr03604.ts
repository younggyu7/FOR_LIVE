import { Controller, Delete, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 메시지 첨부파일은 attachment.target_type = 'MESSENGER_MESSAGE', target_id = 메시지 ID 로 연결한다.
const MESSAGE_TARGET_TYPE = 'MESSENGER_MESSAGE';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function textOf(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

function integerOf(value: unknown, fallback: number): number {
  const text = textOf(value);
  if (text === '') {
    return fallback;
  }
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '숫자 형식이 올바르지 않습니다.');
  }
  return Number(text);
}

function idOf(value: unknown): string {
  const text = textOf(value);
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', 'ID 형식이 올바르지 않습니다.');
  }
  return text;
}

@Controller('api/v1')
export class FnSfr03604Controller {
  @Get('/messenger-messages')
  async listMessengerMessages(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const messageType = textOf(query['messageType']);
    const fromDate = textOf(query['fromDate']);
    const toDate = textOf(query['toDate']);
    const readStatus = textOf(query['readStatus']);
    if (messageType !== '' && messageType !== 'CHAT' && messageType !== 'NOTE') {
      throw new ApiError(400, 'VALIDATION_FAILED', '메시지 구분이 올바르지 않습니다.');
    }
    if (readStatus !== '' && readStatus !== '안읽음' && readStatus !== '읽음') {
      throw new ApiError(400, 'VALIDATION_FAILED', '읽음 상태가 올바르지 않습니다.');
    }
    if (fromDate !== '' && !DATE_PATTERN.test(fromDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 시작일 형식이 올바르지 않습니다.');
    }
    if (toDate !== '' && !DATE_PATTERN.test(toDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 종료일 형식이 올바르지 않습니다.');
    }
    const page = integerOf(query['page'], 0);
    let size = integerOf(query['size'], DEFAULT_SIZE);
    if (size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기는 1 이상이어야 합니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }

    return transaction(async (db) => {
      // 본인이 발신했거나 수신한 메시지만 조회한다.
      let from =
        'FROM messenger_message m ' +
        'WHERE (m.sender_id = CAST(:userId AS bigint) ' +
        'OR EXISTS (SELECT 1 FROM messenger_message_recipient r ' +
        'WHERE r.messenger_message_id = m.messenger_message_id ' +
        'AND r.recipient_id = CAST(:userId AS bigint)))';
      const params: Record<string, unknown> = { userId: user.id };
      if (messageType !== '') {
        from += ' AND m.message_type = :messageType';
        params['messageType'] = messageType;
      }
      if (fromDate !== '') {
        from += ' AND m.sent_at >= CAST(:fromDate AS date)';
        params['fromDate'] = fromDate;
      }
      if (toDate !== '') {
        from += ' AND m.sent_at < CAST(:toDate AS date) + 1';
        params['toDate'] = toDate;
      }
      if (readStatus !== '') {
        from +=
          ' AND EXISTS (SELECT 1 FROM messenger_message_recipient rs ' +
          'WHERE rs.messenger_message_id = m.messenger_message_id ' +
          'AND rs.recipient_id = CAST(:userId AS bigint) ' +
          'AND rs.read_status = :readStatus)';
        params['readStatus'] = readStatus;
      }

      const totalRows = await db.query('SELECT COUNT(*) AS "total" ' + from, params);
      const total = Number(totalRows[0]['total']);

      const rows = await db.query(
        'SELECT m.messenger_message_id AS "messengerMessageId", ' +
          'm.message_type AS "messageType", ' +
          'm.content AS "content", ' +
          'm.sent_at AS "sentAt", ' +
          '(SELECT a.file_name FROM attachment a ' +
          'WHERE a.target_type = :attachmentTargetType ' +
          'AND a.target_id = m.messenger_message_id ' +
          'ORDER BY a.attachment_id LIMIT 1) AS "fileName" ' +
          from +
          ' ORDER BY m.sent_at DESC, m.messenger_message_id DESC ' +
          'LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        {
          ...params,
          attachmentTargetType: MESSAGE_TARGET_TYPE,
          size,
          offset: page * size,
        },
      );

      return { items: rows, page, size, total };
    });
  }

  @Delete('/messenger-messages/:messengerMessageId')
  async deleteMessengerMessage(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const messengerMessageId = idOf(req.params['messengerMessageId']);

    return transaction(async (db) => {
      const found = await db.query(
        'SELECT (m.sender_id = CAST(:userId AS bigint)) AS "isSender", ' +
          '(EXISTS (SELECT 1 FROM messenger_message_recipient r ' +
          'WHERE r.messenger_message_id = m.messenger_message_id ' +
          'AND r.recipient_id = CAST(:userId AS bigint))) AS "isRecipient" ' +
          'FROM messenger_message m ' +
          'WHERE m.messenger_message_id = CAST(:id AS bigint)',
        { userId: user.id, id: messengerMessageId },
      );
      const row = found[0];
      if (!row || (!row['isSender'] && !row['isRecipient'])) {
        throw new ApiError(404, 'MESSENGER_MESSAGE_NOT_FOUND', '본인 관련 메시지를 찾을 수 없습니다.');
      }

      if (row['isSender']) {
        // 가정: 발신자가 삭제하면 메시지와 수신자 행·첨부 연결을 모두 지운다.
        await db.execute(
          'UPDATE messenger_message SET reply_to_message_id = NULL, updated_at = now() ' +
            'WHERE reply_to_message_id = CAST(:id AS bigint)',
          { id: messengerMessageId },
        );
        await db.execute(
          'DELETE FROM attachment WHERE target_type = :attachmentTargetType ' +
            'AND target_id = CAST(:id AS bigint)',
          { attachmentTargetType: MESSAGE_TARGET_TYPE, id: messengerMessageId },
        );
        await db.execute(
          'DELETE FROM messenger_message_recipient WHERE messenger_message_id = CAST(:id AS bigint)',
          { id: messengerMessageId },
        );
        await db.execute(
          'DELETE FROM messenger_message WHERE messenger_message_id = CAST(:id AS bigint)',
          { id: messengerMessageId },
        );
      } else {
        // 가정: 수신자가 삭제하면 본인의 수신 행만 지운다.
        await db.execute(
          'DELETE FROM messenger_message_recipient ' +
            'WHERE messenger_message_id = CAST(:id AS bigint) ' +
            'AND recipient_id = CAST(:userId AS bigint)',
          { id: messengerMessageId, userId: user.id },
        );
      }
      return {};
    });
  }

  @Delete('/notifications/:notificationId')
  async deleteNotification(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const notificationId = idOf(req.params['notificationId']);

    return transaction(async (db) => {
      const count = await db.execute(
        'DELETE FROM notification ' +
          'WHERE notification_id = CAST(:id AS bigint) ' +
          'AND recipient_id = CAST(:userId AS bigint)',
        { id: notificationId, userId: user.id },
      );
      if (count === 0) {
        throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', '본인 알림을 찾을 수 없습니다.');
      }
      return {};
    });
  }
}
