import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: AI는 외부로 반출하지 않고 서버 내부 규칙(양식 본문 + 요청 내용 조합)으로 초안·문구를 만든다.
// 가정: 추천 문구 최대 개수
const MAX_PHRASES = 5;
// 가정: 본문이 없을 때 쓰는 기본 추천 문구
const DEFAULT_PHRASES = [
  '위와 같이 결재를 요청드리오니 검토 후 승인하여 주시기 바랍니다.',
  '관련 내용을 아래와 같이 보고드립니다.',
  '자세한 내용은 첨부 자료를 참고하여 주시기 바랍니다.',
];

@Controller('api/v1')
export class FnSfr04402Controller {
  @Post('/approval-documents/draft-assist')
  @HttpCode(200)
  async generateApprovalDocumentDraft(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const formId = Number(data['approvalFormId']);
    if (data['approvalFormId'] === undefined || data['approvalFormId'] === null || data['approvalFormId'] === '' || !Number.isInteger(formId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재양식을 선택해 주세요.');
    }
    const requestContent = data['requestContent'];
    if (requestContent !== undefined && requestContent !== null && typeof requestContent !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '작성 요청 내용 형식이 올바르지 않습니다.');
    }
    const content = typeof requestContent === 'string' ? requestContent.trim() : '';
    if (content === '') {
      throw new ApiError(422, 'REQUEST_CONTENT_EMPTY', '작성 요청 내용을 입력해 주세요.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        'SELECT form_name AS "formName", form_body AS "formBody" FROM approval_form WHERE approval_form_id = CAST(:formId AS bigint)',
        { formId },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'APPROVAL_FORM_NOT_FOUND', '선택한 결재양식을 찾을 수 없습니다.');
      }
      const form = rows[0] as { formName: string; formBody: string | null };
      const lines = content.split(/\r?\n/).map((s: string) => s.trim()).filter((s: string) => s !== '');
      const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const parts: string[] = [];
      parts.push('<h3>' + escape(form.formName) + '</h3>');
      parts.push('<p>' + escape(lines[0]) + '</p>');
      for (const line of lines.slice(1)) {
        parts.push('<p>' + escape(line) + '</p>');
      }
      parts.push('<p>위와 같이 결재를 요청드리오니 검토 후 승인하여 주시기 바랍니다.</p>');
      return { draftBody: parts.join('\n') };
    });
  }

  @Post('/approval-documents/phrase-suggestions')
  @HttpCode(200)
  async suggestApprovalDocumentPhrases(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const formId = Number(data['approvalFormId']);
    if (data['approvalFormId'] === undefined || data['approvalFormId'] === null || data['approvalFormId'] === '' || !Number.isInteger(formId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재양식을 선택해 주세요.');
    }
    const bodyValue = data['body'];
    if (bodyValue !== undefined && bodyValue !== null && typeof bodyValue !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '문서 본문 형식이 올바르지 않습니다.');
    }
    const body = typeof bodyValue === 'string' ? bodyValue : '';
    return transaction(async (db) => {
      const rows = await db.query(
        'SELECT form_name AS "formName" FROM approval_form WHERE approval_form_id = CAST(:formId AS bigint)',
        { formId },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'APPROVAL_FORM_NOT_FOUND', '선택한 결재양식을 찾을 수 없습니다.');
      }
      const form = rows[0] as { formName: string };
      const phrases: string[] = [];
      const text = body.replace(/<[^>]*>/g, ' ').trim();
      if (text !== '') {
        const first = text.split(/\s+/).slice(0, 8).join(' ');
        phrases.push('"' + first + '" 관련하여 아래와 같이 보고드립니다.');
        phrases.push('위 내용에 대해 검토 후 승인하여 주시기 바랍니다.');
      }
      phrases.push(form.formName + ' 건으로 결재를 요청드립니다.');
      for (const p of DEFAULT_PHRASES) {
        if (!phrases.includes(p)) {
          phrases.push(p);
        }
      }
      return { phrases: phrases.slice(0, MAX_PHRASES) };
    });
  }
}
