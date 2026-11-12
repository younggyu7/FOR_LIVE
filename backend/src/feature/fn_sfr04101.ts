import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const CHART_TYPES = ['BAR', 'LINE', 'PIE'];

function blank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

@Controller('api/v1')
export class FnSfr04101Controller {
  @Get('/office-templates')
  async listOfficeTemplates(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    let page = 0;
    if (!blank(query['page'])) {
      page = Number(query['page']);
      if (!Number.isInteger(page) || page < 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호는 0 이상의 정수여야 합니다.');
      }
    }
    let size = DEFAULT_SIZE;
    if (!blank(query['size'])) {
      size = Number(query['size']);
      if (!Number.isInteger(size) || size < 1) {
        throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기는 1 이상의 정수여야 합니다.');
      }
      size = Math.min(size, MAX_SIZE);
    }
    return transaction(async (db) => {
      const counts = await db.query('SELECT COUNT(*) AS "total" FROM office_template', {});
      const items = await db.query(
        'SELECT office_template_id AS "officeTemplateId", name AS "name", template_type AS "templateType", body_content AS "bodyContent" '
          + 'FROM office_template ORDER BY office_template_id LIMIT :size OFFSET :offset',
        { size, offset: page * size },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/office-documents')
  @HttpCode(200)
  async createOfficeDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);

    const title = typeof data['title'] === 'string' ? data['title'].trim() : '';
    if (title === '' || title.length > 300) {
      throw new ApiError(400, 'VALIDATION_FAILED', '문서 제목은 1자 이상 300자 이하로 입력해 주세요.');
    }

    let templateId: number | null = null;
    if (!blank(data['officeTemplateId'])) {
      templateId = Number(data['officeTemplateId']);
      if (!Number.isInteger(templateId)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '템플릿 값이 올바르지 않습니다.');
      }
    }

    let body: string | null = null;
    if (!blank(data['body'])) {
      if (typeof data['body'] !== 'string') {
        throw new ApiError(400, 'VALIDATION_FAILED', '문서 본문은 글자여야 합니다.');
      }
      body = data['body'];
    }

    let chartType: string | null = null;
    if (!blank(data['chartType'])) {
      if (typeof data['chartType'] !== 'string' || !CHART_TYPES.includes(data['chartType'])) {
        throw new ApiError(400, 'VALIDATION_FAILED', '차트 유형은 막대형·선형·원형 중에서 골라 주세요.');
      }
      chartType = data['chartType'];
    }

    let chartData: string | null = null;
    if (data['chartData'] !== undefined && data['chartData'] !== null) {
      if (typeof data['chartData'] !== 'object') {
        throw new ApiError(400, 'VALIDATION_FAILED', '차트 데이터 형식이 올바르지 않습니다.');
      }
      chartData = JSON.stringify(data['chartData']);
    }
    if (chartType !== null && chartData === null) {
      throw new ApiError(422, 'CHART_DATA_REQUIRED', '차트 유형을 선택했으니 차트 데이터를 입력해 주세요.');
    }

    return transaction(async (db) => {
      if (templateId !== null) {
        const found = await db.query(
          'SELECT body_content AS "bodyContent" FROM office_template WHERE office_template_id = CAST(:templateId AS bigint)',
          { templateId: String(templateId) },
        );
        if (found.length === 0) {
          throw new ApiError(404, 'OFFICE_TEMPLATE_NOT_FOUND', '선택한 템플릿을 찾을 수 없습니다.');
        }
        // 템플릿을 고르고 본문을 비워 두면 템플릿 양식 본문으로 새 문서를 만든다.
        if (body === null) {
          body = (found[0]['bodyContent'] as string | null) ?? null;
        }
      }
      const rows = await db.query(
        'INSERT INTO office_document (title, author_id, office_template_id, body, chart_type, chart_data, created_at, updated_at) '
          + 'VALUES (:title, CAST(:userId AS bigint), CAST(:templateId AS bigint), CAST(:body AS text), CAST(:chartType AS varchar), CAST(:chartData AS jsonb), now(), now()) '
          + 'RETURNING office_document_id AS "officeDocumentId", title AS "title", chart_type AS "chartType", chart_data AS "chartData"',
        {
          title,
          userId: user.id,
          templateId: templateId === null ? null : String(templateId),
          body,
          chartType,
          chartData,
        },
      );
      return rows[0];
    });
  }
}
