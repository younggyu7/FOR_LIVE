import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: post_audience 테이블이 입력에 없어 공개범위를 아래처럼 해석한다.
// 전체 = 모두, 부서 = 작성자와 같은 부서의 임직원, 개인 = 작성자 본인.
const VISIBLE_SQL = `(
  p.visibility_scope = '전체'
  OR p.author_id = CAST(:userId AS bigint)
  OR (
    p.visibility_scope = '부서'
    AND EXISTS (
      SELECT 1
      FROM employee a
      JOIN employee v ON v.department_id = a.department_id
      WHERE a.employee_id = p.author_id
        AND v.employee_id = CAST(:userId AS bigint)
    )
  )
)`;

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const POST_TYPES = ['공지', '게시글'];

function textOf(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function intOf(value: unknown, fallback: number, min: number, max: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호 또는 크기가 올바르지 않습니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr03403Controller {
  @Get('/board-posts')
  async listBoardPosts(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const category = textOf(query['category']);
    const postType = textOf(query['postType']);
    const keyword = textOf(query['keyword']);
    if (postType !== null && !POST_TYPES.includes(postType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '구분은 공지 또는 게시글이어야 합니다.');
    }
    const page = intOf(query['page'], 0, 0, 1000000);
    const size = intOf(query['size'], DEFAULT_SIZE, 1, MAX_SIZE);
    const pattern = keyword === null ? null : '%' + keyword + '%';
    return transaction(async (db) => {
      const where = `${VISIBLE_SQL}
        AND (CAST(:category AS text) IS NULL OR p.category = CAST(:category AS text))
        AND (CAST(:postType AS text) IS NULL OR p.post_type = CAST(:postType AS text))
        AND (CAST(:pattern AS text) IS NULL OR p.title ILIKE CAST(:pattern AS text) OR p.content ILIKE CAST(:pattern AS text))`;
      const params = {
        userId: user.id,
        category,
        postType,
        pattern,
      };
      const items = await db.query(
        `SELECT
          p.board_post_id AS "boardPostId",
          p.post_type AS "postType",
          p.category AS "category",
          p.title AS "title",
          p.author_id AS "authorId",
          p.created_at AS "createdAt",
          p.pin_start_date AS "pinStartDate",
          p.pin_end_date AS "pinEndDate",
          CASE WHEN EXISTS (
            SELECT 1 FROM post_read_log l
            WHERE l.board_post_id = p.board_post_id
              AND l.employee_id = CAST(:userId AS bigint)
          ) THEN '읽음' ELSE '안읽음' END AS "readStatus"
        FROM board_post p
        WHERE ${where}
        ORDER BY
          (p.pin_start_date IS NOT NULL
            AND p.pin_end_date IS NOT NULL
            AND p.pin_start_date <= CURRENT_DATE
            AND p.pin_end_date >= CURRENT_DATE) DESC,
          p.created_at DESC,
          p.board_post_id DESC
        LIMIT CAST(:limit AS bigint) OFFSET CAST(:offset AS bigint)`,
        { ...params, limit: size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM board_post p WHERE ${where}`,
        params,
      );
      const total = Number(counts[0]['total']);
      return { items, page, size, total };
    });
  }

  @Get('/board-posts/:boardPostId')
  async getBoardPost(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const boardPostId = req.params['boardPostId'];
    if (typeof boardPostId !== 'string' || !/^[0-9]{1,18}$/.test(boardPostId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '공지·게시물 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT
          p.board_post_id AS "boardPostId",
          p.post_type AS "postType",
          p.category AS "category",
          p.title AS "title",
          p.content AS "content",
          p.author_id AS "authorId",
          p.created_at AS "createdAt"
        FROM board_post p
        WHERE p.board_post_id = CAST(:boardPostId AS bigint)
          AND ${VISIBLE_SQL}`,
        { boardPostId, userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'BOARD_POST_NOT_FOUND', '공지·게시물이 삭제되었거나 존재하지 않습니다.');
      }
      await db.execute(
        `INSERT INTO post_read_log (board_post_id, employee_id, read_at, created_at, updated_at)
        VALUES (CAST(:boardPostId AS bigint), CAST(:userId AS bigint), now(), now(), now())
        ON CONFLICT (board_post_id, employee_id)
        DO UPDATE SET read_at = now(), updated_at = now()`,
        { boardPostId, userId: user.id },
      );
      return rows[0];
    });
  }
}
