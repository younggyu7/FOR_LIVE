import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: post_audience 테이블이 스키마에 없어 공개범위 대상자를 다음처럼 정한다.
// 전체 = 재직자 전원, 부서 = 작성자와 같은 주부서의 임직원, 개인 = 열람 기록이 있는 임직원.
// 가정: 열람자 확인 권한은 작성자 본인 또는 시스템 관리자에게 있다.
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

const FROM_WHERE = `
  FROM employee e
  JOIN department d ON d.department_id = e.department_id
  LEFT JOIN post_read_log l
    ON l.board_post_id = CAST(:postId AS bigint)
   AND l.employee_id = e.employee_id
  WHERE (
    (CAST(:scope AS text) = '전체' AND e.employment_status = '재직자')
    OR (CAST(:scope AS text) = '부서' AND e.department_id = CAST(:authorDeptId AS bigint))
    OR (CAST(:scope AS text) = '개인' AND l.post_read_log_id IS NOT NULL)
  )
  AND (
    CAST(:readStatus AS text) = ''
    OR (CAST(:readStatus AS text) = '읽음' AND l.post_read_log_id IS NOT NULL)
    OR (CAST(:readStatus AS text) = '안읽음' AND l.post_read_log_id IS NULL)
  )`;

@Controller('api/v1')
export class FnSfr03402Controller {
  @Get('/board-posts/:boardPostId/readers')
  async listBoardPostReaders(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '시스템 관리자');
    const query = checks.queryOf(req.query);
    const boardPostId = req.params['boardPostId'];
    if (!/^\d+$/.test(boardPostId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '공지·게시물 ID가 올바르지 않습니다.');
    }
    const readStatus = query['readStatus'] === undefined || query['readStatus'] === null ? '' : String(query['readStatus']);
    if (readStatus !== '' && readStatus !== '읽음' && readStatus !== '안읽음') {
      throw new ApiError(400, 'VALIDATION_FAILED', '읽음 상태는 읽음 또는 안읽음이어야 합니다.');
    }
    const pageText = query['page'] === undefined || query['page'] === null || query['page'] === '' ? '0' : String(query['page']);
    const sizeText = query['size'] === undefined || query['size'] === null || query['size'] === '' ? String(DEFAULT_SIZE) : String(query['size']);
    if (!/^\d+$/.test(pageText) || !/^\d+$/.test(sizeText) || Number(sizeText) < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const page = Number(pageText);
    const size = Math.min(Number(sizeText), MAX_SIZE);

    return transaction(async (db) => {
      const posts = await db.query(
        `SELECT p.board_post_id AS "boardPostId",
                p.author_id AS "authorId",
                p.visibility_scope AS "scope",
                a.department_id AS "authorDeptId",
                CASE WHEN p.author_id = CAST(:userId AS bigint) THEN 1 ELSE 0 END AS "isAuthor"
           FROM board_post p
           JOIN employee a ON a.employee_id = p.author_id
          WHERE p.board_post_id = CAST(:postId AS bigint)`,
        { postId: boardPostId, userId: user.id },
      );
      if (posts.length === 0) {
        throw new ApiError(404, 'BOARD_POST_NOT_FOUND', '삭제되었거나 존재하지 않는 공지·게시물입니다.');
      }
      const post = posts[0];
      if (Number(post.isAuthor) !== 1) {
        let allowed = true;
        try {
          user.require('시스템 관리자');
        } catch (e) {
          allowed = false;
        }
        if (!allowed) {
          throw new ApiError(422, 'READER_VIEW_NOT_ALLOWED', '작성자이거나 열람자 확인 권한이 있어야 조회할 수 있습니다.');
        }
      }
      const params = {
        postId: boardPostId,
        scope: post.scope,
        authorDeptId: String(post.authorDeptId),
        readStatus,
      };
      const totals = await db.query(`SELECT COUNT(*) AS "total" ${FROM_WHERE}`, params);
      const items = await db.query(
        `SELECT e.employee_id AS "employeeId",
                e.name AS "employeeName",
                d.name AS "departmentName",
                l.read_at AS "readAt",
                CASE WHEN l.post_read_log_id IS NULL THEN '안읽음' ELSE '읽음' END AS "readStatus"
         ${FROM_WHERE}
         ORDER BY d.name, e.name, e.employee_id
         LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { ...params, size: String(size), offset: String(page * size) },
      );
      return { items, page, size, total: Number(totals[0].total) };
    });
  }
}
