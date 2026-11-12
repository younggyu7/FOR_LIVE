import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 건수 표시 대상 메뉴는 메뉴명이 메일, 전자결재, 게시판인 메뉴다.
// 가정: 전자결재 알림은 notification.target_type = 'APPROVAL_DOCUMENT', 게시판 알림은 'BOARD_POST'로 구분한다.
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function intOf(raw: unknown, fallback: number): number {
  if (raw === undefined || raw === null || raw === '') {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isInteger(n)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 정수여야 합니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr04002Controller {
  @Get('/mobile/menu-badges')
  async listMobileMenuBadges(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const page = intOf(query['page'], 0);
    const size = intOf(query['size'], DEFAULT_SIZE);
    if (page < 0 || size < 1 || size > MAX_SIZE) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호 또는 크기가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const params = {
        userId: user.id,
        size,
        offset: page * size,
      };
      const items = await db.query(
        `SELECT m.name AS "menuName",
          CASE m.name
            WHEN '메일' THEN (
              SELECT COUNT(*) FROM mail_recipient r
              WHERE r.recipient_id = CAST(:userId AS bigint) AND r.read_status = '안읽음')
            WHEN '전자결재' THEN (
              SELECT COUNT(*) FROM notification n
              WHERE n.recipient_id = CAST(:userId AS bigint) AND n.read_status = '안읽음'
                AND n.target_type = 'APPROVAL_DOCUMENT')
            WHEN '게시판' THEN (
              SELECT COUNT(*) FROM notification n
              WHERE n.recipient_id = CAST(:userId AS bigint) AND n.read_status = '안읽음'
                AND n.target_type = 'BOARD_POST')
            ELSE 0
          END AS "newCount"
        FROM menu m
        JOIN menu_permission p ON p.menu_id = m.menu_id
        WHERE p.employee_id = CAST(:userId AS bigint)
          AND m.use_status = '사용'
          AND m.name IN ('메일', '전자결재', '게시판')
        ORDER BY m.display_order, m.menu_id
        LIMIT :size OFFSET :offset`,
        params,
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total"
        FROM menu m
        JOIN menu_permission p ON p.menu_id = m.menu_id
        WHERE p.employee_id = CAST(:userId AS bigint)
          AND m.use_status = '사용'
          AND m.name IN ('메일', '전자결재', '게시판')`,
        { userId: user.id },
      );
      const total = Number(counted[0]?.['total'] ?? 0);
      return { items, page, size, total };
    });
  }
}
