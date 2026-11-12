import { Controller, Get, Patch, Delete, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// shareType 값은 BEHAVIOR.md에서 개발 담당자가 정하도록 한 결정 사항이다.
const SHARE_MY = '내 문서';
const SHARE_GIVEN = '공유한 문서';
const SHARE_RECEIVED = '공유받은 문서';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function notFound(): ApiError {
  return new ApiError(404, 'OFFICE_DOCUMENT_NOT_FOUND', '문서를 찾을 수 없습니다.');
}

function wholeNumber(value: unknown, fallback: number, name: string): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw invalid(name + ' 값이 올바르지 않습니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr04106Controller {
  @Get('/office-documents')
  async listOfficeDocuments(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const q = checks.queryOf(req.query);
    const boxType = String(q['boxType'] ?? '');
    if (boxType !== 'MY' && boxType !== 'SHARED') {
      throw invalid('문서함 구분을 선택해 주세요.');
    }
    const page = wholeNumber(q['page'], 0, '쪽 번호');
    let size = wholeNumber(q['size'], DEFAULT_SIZE, '쪽 크기');
    if (size < 1) {
      throw invalid('쪽 크기가 올바르지 않습니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    const params: Record<string, unknown> = { userId: user.id };
    let where = '';
    const title = String(q['title'] ?? '').trim();
    if (title !== '') {
      params['title'] = '%' + title + '%';
      where += ' AND d.title LIKE :title';
    }
    const createdFrom = String(q['createdFrom'] ?? '').trim();
    if (createdFrom !== '') {
      if (!DATE_PATTERN.test(createdFrom)) {
        throw invalid('작성일 시작일 형식이 올바르지 않습니다.');
      }
      params['createdFrom'] = createdFrom;
      where += ' AND d.created_at >= CAST(:createdFrom AS date)';
    }
    const createdTo = String(q['createdTo'] ?? '').trim();
    if (createdTo !== '') {
      if (!DATE_PATTERN.test(createdTo)) {
        throw invalid('작성일 종료일 형식이 올바르지 않습니다.');
      }
      params['createdTo'] = createdTo;
      where += ' AND d.created_at < CAST(:createdTo AS date) + 1';
    }
    const columns =
      'd.office_document_id AS "officeDocumentId", d.title AS "title", d.author_id AS "authorId", d.created_at AS "createdAt"';
    let union: string;
    if (boxType === 'MY') {
      params['shareMy'] = SHARE_MY;
      union =
        'SELECT ' + columns + ', false AS "canEdit", CAST(:shareMy AS text) AS "shareType"' +
        ' FROM office_document d WHERE d.author_id = CAST(:userId AS bigint)' + where;
    } else {
      params['shareGiven'] = SHARE_GIVEN;
      params['shareReceived'] = SHARE_RECEIVED;
      union =
        'SELECT ' + columns + ', false AS "canEdit", CAST(:shareGiven AS text) AS "shareType"' +
        ' FROM office_document d WHERE d.author_id = CAST(:userId AS bigint)' +
        ' AND EXISTS (SELECT 1 FROM office_document_share x WHERE x.office_document_id = d.office_document_id)' +
        where +
        ' UNION ALL ' +
        'SELECT ' + columns + ', s.can_edit AS "canEdit", CAST(:shareReceived AS text) AS "shareType"' +
        ' FROM office_document d JOIN office_document_share s ON s.office_document_id = d.office_document_id' +
        ' WHERE s.employee_id = CAST(:userId AS bigint)' + where;
    }
    return transaction(async (db) => {
      const totalRows = await db.query('SELECT COUNT(*) AS "total" FROM (' + union + ') t', params);
      const total = Number(totalRows[0]['total']);
      const items = await db.query(
        'SELECT * FROM (' + union + ') t ORDER BY t."createdAt" DESC, t."officeDocumentId" DESC LIMIT :size OFFSET :offset',
        { ...params, size, offset: page * size },
      );
      return { items, page, size, total };
    });
  }

  @Get('/office-documents/:officeDocumentId')
  async getOfficeDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const id = req.params['officeDocumentId'];
    return transaction(async (db) => {
      const rows = await db.query(
        'SELECT office_document_id AS "officeDocumentId", title AS "title", body AS "body", author_id AS "authorId"' +
          ' FROM office_document WHERE office_document_id = CAST(:id AS bigint)',
        { id },
      );
      if (rows.length === 0) {
        throw notFound();
      }
      const doc = rows[0];
      if (String(doc['authorId']) !== String(user.id)) {
        const shares = await db.query(
          'SELECT 1 AS "ok" FROM office_document_share WHERE office_document_id = CAST(:id AS bigint)' +
            ' AND employee_id = CAST(:userId AS bigint)',
          { id, userId: user.id },
        );
        if (shares.length === 0) {
          throw new ApiError(403, 'FORBIDDEN', '열람 권한이 없는 문서입니다.');
        }
      }
      return doc;
    });
  }

  @Patch('/office-documents/:officeDocumentId')
  async updateOfficeDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const id = req.params['officeDocumentId'];
    const data = checks.inputOf(req.body);
    const hasTitle = data['title'] !== undefined && data['title'] !== null;
    const hasBody = data['body'] !== undefined && data['body'] !== null;
    let title: string | null = null;
    let body: string | null = null;
    if (hasTitle) {
      if (typeof data['title'] !== 'string' || data['title'].trim() === '' || data['title'].length > 300) {
        throw invalid('문서 제목은 1자 이상 300자 이하로 입력해 주세요.');
      }
      title = data['title'];
    }
    if (hasBody) {
      if (typeof data['body'] !== 'string') {
        throw invalid('문서 본문 형식이 올바르지 않습니다.');
      }
      body = data['body'];
    }
    return transaction(async (db) => {
      const docs = await db.query(
        'SELECT author_id AS "authorId" FROM office_document WHERE office_document_id = CAST(:id AS bigint)',
        { id },
      );
      if (docs.length === 0) {
        throw notFound();
      }
      if (String(docs[0]['authorId']) !== String(user.id)) {
        const shares = await db.query(
          'SELECT can_edit AS "canEdit" FROM office_document_share WHERE office_document_id = CAST(:id AS bigint)' +
            ' AND employee_id = CAST(:userId AS bigint)',
          { id, userId: user.id },
        );
        if (shares.length === 0) {
          throw new ApiError(403, 'FORBIDDEN', '열람 권한이 없는 문서입니다.');
        }
        if (shares[0]['canEdit'] !== true) {
          throw new ApiError(422, 'DOCUMENT_EDIT_NOT_ALLOWED', '수정 권한이 없는 문서입니다. 열람만 할 수 있습니다.');
        }
      }
      const rows = await db.query(
        'UPDATE office_document SET' +
          ' title = CASE WHEN CAST(:hasTitle AS boolean) THEN CAST(:title AS varchar) ELSE title END,' +
          ' body = CASE WHEN CAST(:hasBody AS boolean) THEN CAST(:body AS text) ELSE body END,' +
          ' updated_at = now()' +
          ' WHERE office_document_id = CAST(:id AS bigint)' +
          ' RETURNING office_document_id AS "officeDocumentId"',
        { id, hasTitle, title, hasBody, body },
      );
      return rows[0];
    });
  }

  @Delete('/office-documents/:officeDocumentId')
  async deleteOfficeDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const id = req.params['officeDocumentId'];
    return transaction(async (db) => {
      const docs = await db.query(
        'SELECT author_id AS "authorId" FROM office_document WHERE office_document_id = CAST(:id AS bigint)',
        { id },
      );
      if (docs.length === 0) {
        throw notFound();
      }
      if (String(docs[0]['authorId']) !== String(user.id)) {
        throw new ApiError(422, 'DOCUMENT_DELETE_NOT_ALLOWED', '작성자만 문서를 삭제할 수 있습니다.');
      }
      await db.execute('DELETE FROM office_document_share WHERE office_document_id = CAST(:id AS bigint)', { id });
      await db.execute('DELETE FROM office_document WHERE office_document_id = CAST(:id AS bigint)', { id });
      return {};
    });
  }
}
