import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 메뉴 이름이 검색 카테고리 이름(전자결재, 게시판, 일정, 문서함)과 같고, 그 메뉴의 view_scope로 조회 범위를 정한다.
// 가정: 첨부파일의 업무 대상 유형은 APPROVAL_DOCUMENT, BOARD_POST 이다.
// 가정: 첨부파일은 파일명으로 검색한다 (파일 본문은 DB에 없다).
const CATEGORIES = ['전자결재', '게시판', '일정', '문서함'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

const APPROVAL_DOC_SQL = `
SELECT CAST('전자결재' AS text) AS category, d.approval_document_id AS "targetId", d.title AS title, CAST(NULL AS bigint) AS "attachmentId", CAST(NULL AS varchar) AS "fileName"
FROM approval_document d
JOIN employee dr ON dr.employee_id = d.drafter_id
WHERE (d.title ILIKE :kw OR d.body ILIKE :kw)
AND EXISTS (SELECT 1 FROM menu_permission mp JOIN menu m ON m.menu_id = mp.menu_id JOIN employee me ON me.employee_id = mp.employee_id WHERE mp.employee_id = CAST(:userId AS bigint) AND m.name = '전자결재' AND m.use_status = '사용' AND (mp.view_scope = '전체' OR (mp.view_scope = '부서' AND dr.department_id = me.department_id) OR (mp.view_scope = '개인' AND d.drafter_id = me.employee_id)))`;

const APPROVAL_FILE_SQL = `
SELECT CAST('전자결재' AS text) AS category, d.approval_document_id AS "targetId", d.title AS title, a.attachment_id AS "attachmentId", a.file_name AS "fileName"
FROM attachment a
JOIN approval_document d ON a.target_type = 'APPROVAL_DOCUMENT' AND a.target_id = d.approval_document_id
JOIN employee dr ON dr.employee_id = d.drafter_id
WHERE a.file_name ILIKE :kw
AND EXISTS (SELECT 1 FROM menu_permission mp JOIN menu m ON m.menu_id = mp.menu_id JOIN employee me ON me.employee_id = mp.employee_id WHERE mp.employee_id = CAST(:userId AS bigint) AND m.name = '전자결재' AND m.use_status = '사용' AND (mp.view_scope = '전체' OR (mp.view_scope = '부서' AND dr.department_id = me.department_id) OR (mp.view_scope = '개인' AND d.drafter_id = me.employee_id)))`;

const BOARD_POST_SQL = `
SELECT CAST('게시판' AS text) AS category, p.board_post_id AS "targetId", p.title AS title, CAST(NULL AS bigint) AS "attachmentId", CAST(NULL AS varchar) AS "fileName"
FROM board_post p
JOIN employee au ON au.employee_id = p.author_id
WHERE (p.title ILIKE :kw OR p.content ILIKE :kw)
AND EXISTS (SELECT 1 FROM menu_permission mp JOIN menu m ON m.menu_id = mp.menu_id JOIN employee me ON me.employee_id = mp.employee_id WHERE mp.employee_id = CAST(:userId AS bigint) AND m.name = '게시판' AND m.use_status = '사용' AND (mp.view_scope = '전체' OR (mp.view_scope = '부서' AND au.department_id = me.department_id) OR (mp.view_scope = '개인' AND p.author_id = me.employee_id)))`;

const BOARD_FILE_SQL = `
SELECT CAST('게시판' AS text) AS category, p.board_post_id AS "targetId", p.title AS title, a.attachment_id AS "attachmentId", a.file_name AS "fileName"
FROM attachment a
JOIN board_post p ON a.target_type = 'BOARD_POST' AND a.target_id = p.board_post_id
JOIN employee au ON au.employee_id = p.author_id
WHERE a.file_name ILIKE :kw
AND EXISTS (SELECT 1 FROM menu_permission mp JOIN menu m ON m.menu_id = mp.menu_id JOIN employee me ON me.employee_id = mp.employee_id WHERE mp.employee_id = CAST(:userId AS bigint) AND m.name = '게시판' AND m.use_status = '사용' AND (mp.view_scope = '전체' OR (mp.view_scope = '부서' AND au.department_id = me.department_id) OR (mp.view_scope = '개인' AND p.author_id = me.employee_id)))`;

const SCHEDULE_SQL = `
SELECT CAST('일정' AS text) AS category, s.schedule_id AS "targetId", s.title AS title, CAST(NULL AS bigint) AS "attachmentId", CAST(NULL AS varchar) AS "fileName"
FROM schedule s
JOIN employee ow ON ow.employee_id = s.owner_id
WHERE (s.title ILIKE :kw OR s.content ILIKE :kw OR s.location ILIKE :kw)
AND EXISTS (SELECT 1 FROM menu_permission mp JOIN menu m ON m.menu_id = mp.menu_id JOIN employee me ON me.employee_id = mp.employee_id WHERE mp.employee_id = CAST(:userId AS bigint) AND m.name = '일정' AND m.use_status = '사용' AND (mp.view_scope = '전체' OR (mp.view_scope = '부서' AND ow.department_id = me.department_id) OR (mp.view_scope = '개인' AND s.owner_id = me.employee_id)))`;

const DOCUMENT_BOX_SQL = `
SELECT CAST('문서함' AS text) AS category, b.document_box_id AS "targetId", b.name AS title, CAST(NULL AS bigint) AS "attachmentId", CAST(NULL AS varchar) AS "fileName"
FROM document_box b
LEFT JOIN employee bo ON bo.employee_id = b.employee_id
WHERE b.name ILIKE :kw
AND EXISTS (SELECT 1 FROM menu_permission mp JOIN menu m ON m.menu_id = mp.menu_id JOIN employee me ON me.employee_id = mp.employee_id WHERE mp.employee_id = CAST(:userId AS bigint) AND m.name = '문서함' AND m.use_status = '사용' AND (mp.view_scope = '전체' OR (mp.view_scope = '부서' AND COALESCE(b.department_id, bo.department_id) = me.department_id) OR (mp.view_scope = '개인' AND b.employee_id = me.employee_id)))`;

const UNION_SQL = [APPROVAL_DOC_SQL, APPROVAL_FILE_SQL, BOARD_POST_SQL, BOARD_FILE_SQL, SCHEDULE_SQL, DOCUMENT_BOX_SQL].join('\nUNION ALL');

const LIST_SQL = 'SELECT r.category AS category, COUNT(*) OVER (PARTITION BY r.category) AS "categoryCount", r."targetId" AS "targetId", r.title AS title, r."attachmentId" AS "attachmentId", r."fileName" AS "fileName" FROM (' + UNION_SQL + ') r WHERE (CAST(:category AS text) IS NULL OR r.category = CAST(:category AS text)) ORDER BY r.category, r."targetId" DESC, r."attachmentId" LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)';

const COUNT_SQL = 'SELECT COUNT(*) AS total FROM (' + UNION_SQL + ') r WHERE (CAST(:category AS text) IS NULL OR r.category = CAST(:category AS text))';

function intOf(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '숫자 형식이 올바르지 않습니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr03901Controller {
  @Get('/integrated-searches')
  async searchIntegrated(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const q = checks.queryOf(req.query);
    const keyword = typeof q['keyword'] === 'string' ? q['keyword'].trim() : '';
    if (!keyword) {
      throw new ApiError(422, 'SEARCH_KEYWORD_REQUIRED', '검색어를 입력해 주세요.');
    }
    const categoryRaw = q['category'];
    let category: string | null = null;
    if (categoryRaw !== undefined && categoryRaw !== null && categoryRaw !== '') {
      if (typeof categoryRaw !== 'string' || !CATEGORIES.includes(categoryRaw)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '검색 카테고리가 올바르지 않습니다.');
      }
      category = categoryRaw;
    }
    const page = intOf(q['page'], 0);
    const size = intOf(q['size'], DEFAULT_SIZE);
    if (page < 0 || size < 1 || size > MAX_SIZE) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호 또는 크기가 올바르지 않습니다.');
    }
    const kw = '%' + keyword.replace(/[\\%_]/g, '\\$&') + '%';
    return transaction(async (db) => {
      const rows = await db.query(LIST_SQL, {
        kw,
        userId: user.id,
        category,
        size,
        offset: page * size,
      });
      const totals = await db.query(COUNT_SQL, {
        kw,
        userId: user.id,
        category,
      });
      const items = rows.map((row: any) => ({
        category: row.category,
        categoryCount: Number(row.categoryCount),
        targetId: Number(row.targetId),
        title: row.title,
        attachmentId: row.attachmentId === null ? null : Number(row.attachmentId),
        fileName: row.fileName,
      }));
      const total = totals.length > 0 ? Number((totals[0] as any).total) : 0;
      return { items, page, size, total };
    });
  }
}
