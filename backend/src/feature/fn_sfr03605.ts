import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 검색 구분 값은 API 설명 그대로 '첨부파일 제목' / '사용자명' 문자열로 받는다.
const SEARCH_BY_FILE = '첨부파일 제목';
const SEARCH_BY_USER = '사용자명';
// 가정: 메시지 첨부파일은 attachment.target_type = 'MESSENGER_MESSAGE', target_id = 메시지 ID 로 연결된다.
const ATTACHMENT_TARGET_TYPE = 'MESSENGER_MESSAGE';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

const FROM_SQL =
  'FROM messenger_message m ' +
  'JOIN employee e ON e.employee_id = m.sender_id ' +
  'LEFT JOIN attachment a ON a.target_type = :targetType AND a.target_id = m.messenger_message_id ';

// 가정: 대화방 참여자 테이블이 없어, 권한 범위는 내가 보낸 메시지 또는 내가 만든 대화방의 메시지로 한정한다.
const SCOPE_SQL =
  'WHERE (m.sender_id = CAST(:userId AS bigint) ' +
  'OR EXISTS (SELECT 1 FROM messenger_room r ' +
  'WHERE r.messenger_room_id = m.messenger_room_id AND r.creator_id = CAST(:userId AS bigint))) ';

const COND_FILE_SQL = 'AND a.file_name ILIKE :pattern ';
const COND_USER_SQL = 'AND e.name ILIKE :pattern ';

@Controller('api/v1')
export class FnSfr03605Controller {
  @Get('/messenger-messages/search')
  async searchMessengerMessages(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);

    const searchType = typeof query['searchType'] === 'string' ? query['searchType'].trim() : '';
    if (searchType !== SEARCH_BY_FILE && searchType !== SEARCH_BY_USER) {
      throw new ApiError(400, 'VALIDATION_FAILED', '검색 구분을 선택해 주세요.');
    }
    const keyword = typeof query['keyword'] === 'string' ? query['keyword'].trim() : '';
    if (keyword === '') {
      throw new ApiError(422, 'KEYWORD_REQUIRED', '검색어를 입력해 주세요.');
    }

    const pageRaw = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '페이지 값이 올바르지 않습니다.');
    }
    const page = pageRaw;
    const size = Math.min(sizeRaw, MAX_SIZE);

    const cond = searchType === SEARCH_BY_FILE ? COND_FILE_SQL : COND_USER_SQL;
    const pattern = '%' + keyword.replace(/[\\%_]/g, (c) => '\\' + c) + '%';

    return transaction(async (db) => {
      const baseParams = {
        userId: user.id,
        targetType: ATTACHMENT_TARGET_TYPE,
        pattern,
      };
      const countRows = await db.query(
        'SELECT COUNT(*) AS "total" ' + FROM_SQL + SCOPE_SQL + cond,
        baseParams,
      );
      const total = Number(countRows[0]['total']);
      const items = await db.query(
        'SELECT m.messenger_message_id AS "messengerMessageId", ' +
          'm.content AS "content", ' +
          'm.sent_at AS "sentAt", ' +
          'e.name AS "senderName", ' +
          'a.file_name AS "fileName" ' +
          FROM_SQL +
          SCOPE_SQL +
          cond +
          'ORDER BY m.sent_at DESC, m.messenger_message_id DESC ' +
          'LIMIT :size OFFSET :offset',
        { ...baseParams, size, offset: page * size },
      );
      return { items, page, size, total };
    });
  }
}
