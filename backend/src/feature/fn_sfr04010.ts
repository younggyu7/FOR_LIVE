import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 검색 대상 구분 값과 결과 구분(areaType) 이름은 개발 담당자가 정했다.
const TARGET_AREA = '업무영역';
const TARGET_ATTACHMENT = '첨부파일';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

@Controller('api/v1')
export class FnSfr04010Controller {
  @Get('/search')
  async searchIntegrated2(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const keyword = String(query['keyword'] ?? '').trim();
    if (keyword === '') {
      throw new ApiError(422, 'SEARCH_KEYWORD_REQUIRED', '검색어를 입력해 주세요.');
    }
    const target = String(query['searchTarget'] ?? '').trim();
    if (target !== '' && target !== TARGET_AREA && target !== TARGET_ATTACHMENT) {
      throw new ApiError(400, 'VALIDATION_FAILED', '검색 대상은 업무영역 또는 첨부파일이어야 합니다.');
    }
    const page = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    let size = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 크기가 올바르지 않습니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    const params = {
      userId: user.id,
      pattern: '%' + keyword + '%',
      includeArea: target === '' || target === TARGET_AREA,
      includeAttachment: target === '' || target === TARGET_ATTACHMENT,
    };
    // 조회자 권한 범위: 전자결재는 본인 기안 문서, 게시물은 전체 공개·본인 작성·같은 부서 공개, 첨부는 본인 업로드 또는 본인 기안 문서의 첨부 (가정)
    const found = `
      SELECT '전자결재'::text AS area_type, d.approval_document_id AS target_id, d.title AS title,
             NULL::text AS attachment_name, d.created_at AS created_at
        FROM approval_document d
       WHERE CAST(:includeArea AS boolean)
         AND d.drafter_id = CAST(:userId AS bigint)
         AND (d.title ILIKE :pattern OR d.body ILIKE :pattern)
      UNION ALL
      SELECT '게시판'::text, b.board_post_id, b.title, NULL::text, b.created_at
        FROM board_post b
        JOIN employee w ON w.employee_id = b.author_id
       WHERE CAST(:includeArea AS boolean)
         AND (b.title ILIKE :pattern OR b.content ILIKE :pattern)
         AND (b.visibility_scope = '전체'
              OR b.author_id = CAST(:userId AS bigint)
              OR (b.visibility_scope = '부서'
                  AND w.department_id = (SELECT m.department_id FROM employee m WHERE m.employee_id = CAST(:userId AS bigint))))
      UNION ALL
      SELECT '첨부파일'::text, COALESCE(a.target_id, a.attachment_id), a.file_name, a.file_name::text, a.created_at
        FROM attachment a
       WHERE CAST(:includeAttachment AS boolean)
         AND a.file_name ILIKE :pattern
         AND (a.uploader_id = CAST(:userId AS bigint)
              OR (a.target_type = 'APPROVAL_DOCUMENT'
                  AND EXISTS (SELECT 1 FROM approval_document x
                               WHERE x.approval_document_id = a.target_id
                                 AND x.drafter_id = CAST(:userId AS bigint))))
    `;
    return transaction(async (db) => {
      const totals = await db.query(
        `SELECT COUNT(*) AS total FROM (${found}) f`,
        params,
      );
      const items = await db.query(
        `SELECT area_type AS "areaType", target_id AS "targetId", title, attachment_name AS "attachmentName"
           FROM (${found}) f
          ORDER BY created_at DESC, target_id
          LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { ...params, size, offset: page * size },
      );
      return { items, page, size, total: Number(totals[0]['total']) };
    });
  }
}
