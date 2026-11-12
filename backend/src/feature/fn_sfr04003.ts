import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 읽음 상태 초기값은 수신 시 안읽음
const INITIAL_READ_STATUS = '안읽음';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function toInt(value: unknown, fallback: number, min: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < min) {
    throw new ApiError(400, 'VALIDATION_FAILED', '요청 값의 형식이 올바르지 않습니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr04003Controller {
  @Get('/mail-messages/inbox')
  async listInboxMailMessages(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const page = toInt(query['page'], 0, 0);
    const size = Math.min(toInt(query['size'], DEFAULT_SIZE, 1), MAX_SIZE);
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT m.mail_message_id AS "mailMessageId",
                m.subject AS "subject",
                m.sent_at AS "sentAt",
                r.read_status AS "readStatus"
           FROM mail_recipient r
           JOIN mail_message m ON m.mail_message_id = r.mail_message_id
          WHERE r.recipient_id = CAST(:userId AS bigint)
          ORDER BY m.sent_at DESC, m.mail_message_id DESC
          LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { userId: user.id, size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM mail_recipient r
          WHERE r.recipient_id = CAST(:userId AS bigint)`,
        { userId: user.id },
      );
      const total = Number(counts[0]?.total ?? 0);
      return { items, page, size, total };
    });
  }

  @Post('/mail-messages')
  @HttpCode(200)
  async createMailMessage(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const rawIds = data['recipientIds'];
    if (rawIds === undefined || rawIds === null || (Array.isArray(rawIds) && rawIds.length === 0)) {
      throw new ApiError(422, 'MAIL_RECIPIENT_REQUIRED', '받는 사람을 입력해 주세요.');
    }
    if (!Array.isArray(rawIds)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '받는 사람 목록의 형식이 올바르지 않습니다.');
    }
    const recipientIds: string[] = [];
    for (const raw of rawIds) {
      const n = Number(raw);
      if (raw === '' || raw === null || typeof raw === 'boolean' || !Number.isInteger(n) || n <= 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '받는 사람 ID가 올바르지 않습니다.');
      }
      if (!recipientIds.includes(String(n))) {
        recipientIds.push(String(n));
      }
    }
    const subject = data['subject'];
    if (typeof subject !== 'string' || subject.trim() === '' || subject.length > 500) {
      throw new ApiError(400, 'VALIDATION_FAILED', '제목을 500자 이내로 입력해 주세요.');
    }
    const body = data['body'];
    if (body !== undefined && body !== null && typeof body !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '본문의 형식이 올바르지 않습니다.');
    }
    // TODO: attachmentFiles(첨부파일) 항목 구조와 ECM 저장 방식이 입력에 없어 저장하지 못했다.
    // TODO: MAIL_SEND_FAILED(502) 발송 실패 판정 기준이 입력에 없어 구현하지 못했다.
    return transaction(async (db) => {
      for (const id of recipientIds) {
        const found = await db.query(
          `SELECT employee_id FROM employee WHERE employee_id = CAST(:id AS bigint)`,
          { id },
        );
        if (found.length === 0) {
          throw new ApiError(404, 'NOT_FOUND', '받는 사람을 찾을 수 없습니다.');
        }
      }
      const rows = await db.query(
        `INSERT INTO mail_message (sender_id, subject, body, sent_at, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), :subject, :body, now(), now(), now())
         RETURNING mail_message_id AS "mailMessageId"`,
        { userId: user.id, subject: subject.trim(), body: typeof body === 'string' ? body : null },
      );
      const mailMessageId = Number(rows[0].mailMessageId);
      for (const id of recipientIds) {
        await db.execute(
          `INSERT INTO mail_recipient (mail_message_id, recipient_id, read_status, created_at, updated_at)
           VALUES (CAST(:mailMessageId AS bigint), CAST(:id AS bigint), :readStatus, now(), now())`,
          { mailMessageId: String(mailMessageId), id, readStatus: INITIAL_READ_STATUS },
        );
      }
      return { mailMessageId };
    });
  }
}
