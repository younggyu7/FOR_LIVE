import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const BOX_TYPE_PERSONAL = '개인문서함';
const BOX_TYPE_DEPARTMENT = '부서문서함';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const COMPLETED_STATUS = '완료';
const ATTACHMENT_TARGET_TYPE = 'APPROVAL_DOCUMENT'; // 가정: 첨부파일은 업무 대상 유형 APPROVAL_DOCUMENT + 문서 ID로 연결된다
const DEPARTMENT_OF_USER = '(SELECT e.department_id FROM employee e WHERE e.employee_id = CAST(:userId AS bigint))';

function optionalText(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return String(value);
}

function optionalDate(value: unknown): string | null {
  const text = optionalText(value);
  if (text !== null && !DATE_PATTERN.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '날짜는 YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return text;
}

@Controller('api/v1')
export class FnSfr04009Controller {
  @Get('/document-box-items')
  async listDocumentBoxItems(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const boxType = optionalText(query['boxType']);
    if (boxType === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '문서함 구분을 선택해 주세요.');
    }
    if (boxType !== BOX_TYPE_PERSONAL && boxType !== BOX_TYPE_DEPARTMENT) {
      throw new ApiError(422, 'INVALID_BOX_TYPE', '문서함 구분은 개인문서함 또는 부서문서함이어야 합니다.');
    }
    const title = optionalText(query['title']);
    const completedFrom = optionalDate(query['completedFrom']);
    const completedTo = optionalDate(query['completedTo']);
    const page = Number(optionalText(query['page']) ?? 0);
    const size = Number(optionalText(query['size']) ?? DEFAULT_SIZE);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const limit = Math.min(size, MAX_SIZE);
    // 개인문서함은 본인 소유 문서함, 부서문서함은 소속 부서 문서함만 조회한다
    const scopeSql = boxType === BOX_TYPE_PERSONAL
      ? 'b.employee_id = CAST(:userId AS bigint)'
      : 'b.department_id = ' + DEPARTMENT_OF_USER;
    const whereSql = `
      FROM document_box_item i
      JOIN document_box b ON b.document_box_id = i.document_box_id
      JOIN approval_document d ON d.approval_document_id = i.approval_document_id
      WHERE ${scopeSql}
        AND d.approval_status = :completedStatus
        AND (CAST(:title AS text) IS NULL OR d.title ILIKE ('%' || CAST(:title AS text) || '%'))
        AND (CAST(:completedFrom AS text) IS NULL OR d.completed_at >= CAST(:completedFrom AS date))
        AND (CAST(:completedTo AS text) IS NULL OR d.completed_at < CAST(:completedTo AS date) + 1)`;
    const params = {
      userId: user.id,
      completedStatus: COMPLETED_STATUS,
      title,
      completedFrom,
      completedTo,
    };
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT i.document_box_item_id AS "documentBoxItemId",
          d.approval_document_id AS "approvalDocumentId",
          d.title AS "title",
          d.approval_status AS "approvalStatus",
          d.completed_at AS "completedAt"
        ${whereSql}
        ORDER BY d.completed_at DESC, i.document_box_item_id DESC
        LIMIT :limit OFFSET :offset`,
        { ...params, limit, offset: page * limit },
      );
      const counts = await db.query(`SELECT COUNT(*) AS "total" ${whereSql}`, params);
      return { items, page, size: limit, total: Number(counts[0]['total']) };
    });
  }

  @Get('/document-box-items/:documentBoxItemId')
  async getDocumentBoxItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const documentBoxItemId = req.params['documentBoxItemId'];
    if (!/^\d+$/.test(documentBoxItemId)) {
      throw new ApiError(404, 'DOCUMENT_BOX_ITEM_NOT_FOUND', '문서함 문서를 찾을 수 없습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT d.approval_document_id AS "approvalDocumentId",
          d.title AS "title",
          d.body AS "body",
          d.approval_status AS "approvalStatus",
          d.completed_at AS "completedAt"
        FROM document_box_item i
        JOIN document_box b ON b.document_box_id = i.document_box_id
        JOIN approval_document d ON d.approval_document_id = i.approval_document_id
        WHERE i.document_box_item_id = CAST(:documentBoxItemId AS bigint)
          AND d.approval_status = :completedStatus
          AND (b.employee_id = CAST(:userId AS bigint) OR b.department_id = ${DEPARTMENT_OF_USER})`,
        { documentBoxItemId, userId: user.id, completedStatus: COMPLETED_STATUS },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'DOCUMENT_BOX_ITEM_NOT_FOUND', '문서함 문서를 찾을 수 없거나 접근할 수 없습니다.');
      }
      const document = rows[0];
      const approvalLines = await db.query(
        `SELECT approval_line_id AS "approvalLineId",
          employee_id AS "employeeId",
          approval_order AS "approvalOrder",
          approval_status AS "approvalStatus",
          opinion AS "opinion",
          processed_at AS "processedAt"
        FROM approval_line
        WHERE approval_document_id = CAST(:approvalDocumentId AS bigint)
        ORDER BY approval_order`,
        { approvalDocumentId: document['approvalDocumentId'] },
      );
      // 가정: 첨부파일은 업무 대상 유형 APPROVAL_DOCUMENT + 문서 ID로 연결된 행이다 (다운로드 제한은 공통 모듈이 맡는다)
      const attachments = await db.query(
        `SELECT attachment_id AS "attachmentId",
          file_name AS "fileName",
          file_extension AS "fileExtension",
          file_size AS "fileSize"
        FROM attachment
        WHERE target_type = :targetType
          AND target_id = CAST(:approvalDocumentId AS bigint)
        ORDER BY attachment_id`,
        { targetType: ATTACHMENT_TARGET_TYPE, approvalDocumentId: document['approvalDocumentId'] },
      );
      return { ...document, approvalLines, attachments };
    });
  }
}
