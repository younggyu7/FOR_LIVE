import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const TARGETS = ['제목', '내용', '첨부파일 제목', '첨부파일 내용'];
// 가정: 목록 크기 기본값과 최대값
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function intOf(v: unknown, fallback: number, min: number): number {
  if (v === undefined || v === null || v === '') {
    return fallback;
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n < min) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 크기가 올바르지 않습니다.');
  }
  return n;
}

function hit(column: string): string {
  return 'strpos(lower(' + column + '), lower(:keyword)) > 0';
}

@Controller('api/v1')
export class FnSfr02603Controller {
  @Get('/search-results')
  async searchGroupware(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const q = checks.queryOf(req.query);
    const keyword = text(q['keyword']);
    if (!keyword) {
      throw new ApiError(422, 'SEARCH_KEYWORD_REQUIRED', '검색어를 입력해 주세요.');
    }
    const target = text(q['searchTarget']);
    if (target && !TARGETS.includes(target)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '검색 대상이 올바르지 않습니다.');
    }
    // 검색 대상 선택이 없으면 전체 대상에서 검색한다
    const all = target === '';
    const inTitle = all || target === '제목';
    const inContent = all || target === '내용';
    const inAttTitle = all || target === '첨부파일 제목';
    const page = intOf(q['page'], 0, 0);
    const size = Math.min(intOf(q['size'], DEFAULT_SIZE, 1), MAX_SIZE);

    const uid = 'CAST(:userId AS bigint)';
    const parts: string[] = [];

    // 가정: 전자결재 문서는 기안자 본인 것만 조회 범위로 본다
    const docConds: string[] = [];
    if (inTitle) docConds.push(hit('d.title'));
    if (inContent) docConds.push(hit('d.body'));
    if (docConds.length > 0) {
      parts.push(
        'SELECT d.title AS "title", \'전자결재\' AS "resultType", \'본문\' AS "matchLocation", d.approval_document_id AS "targetId" '
        + 'FROM approval_document d WHERE (' + docConds.join(' OR ') + ') AND d.drafter_id = ' + uid,
      );
    }

    // 가정: 게시물은 공개범위 전체, 본인 작성, 같은 부서(부서 공개)만 조회 범위로 본다
    const postConds: string[] = [];
    if (inTitle) postConds.push(hit('p.title'));
    if (inContent) postConds.push(hit('p.content'));
    if (postConds.length > 0) {
      parts.push(
        'SELECT p.title AS "title", \'게시물\' AS "resultType", \'본문\' AS "matchLocation", p.board_post_id AS "targetId" '
        + 'FROM board_post p WHERE (' + postConds.join(' OR ') + ') AND (p.visibility_scope = \'전체\' OR p.author_id = ' + uid
        + ' OR (p.visibility_scope = \'부서\' AND EXISTS (SELECT 1 FROM employee ae WHERE ae.employee_id = p.author_id '
        + 'AND ae.department_id = (SELECT me.department_id FROM employee me WHERE me.employee_id = ' + uid + '))))',
      );
    }

    // 가정: 첨부파일은 업로더 본인이거나 본인이 기안한 결재문서의 첨부만 조회 범위로 본다
    if (inAttTitle) {
      parts.push(
        'SELECT a.file_name AS "title", \'첨부파일\' AS "resultType", \'첨부\' AS "matchLocation", a.attachment_id AS "targetId" '
        + 'FROM attachment a WHERE ' + hit('a.file_name') + ' AND (a.uploader_id = ' + uid
        + ' OR (a.target_type = \'APPROVAL_DOCUMENT\' AND EXISTS (SELECT 1 FROM approval_document d2 '
        + 'WHERE d2.approval_document_id = a.target_id AND d2.drafter_id = ' + uid + ')))',
      );
    }

    // TODO: 첨부파일 내용은 schema.sql에 검색할 컬럼이 없어 검색하지 못한다
    if (parts.length === 0) {
      return { items: [], page, size, total: 0 };
    }
    const union = parts.join(' UNION ALL ');

    return transaction(async (db) => {
      const params = { keyword, userId: user.id, size, offset: page * size };
      const counted = await db.query('SELECT COUNT(*) AS "total" FROM (' + union + ') r', params);
      const total = Number(counted[0]?.total ?? 0);
      const items = await db.query(
        'SELECT r."title", r."resultType", r."matchLocation", r."targetId" FROM (' + union + ') r '
        + 'ORDER BY r."resultType", r."targetId" DESC LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        params,
      );
      return { items, page, size, total };
    });
  }
}
