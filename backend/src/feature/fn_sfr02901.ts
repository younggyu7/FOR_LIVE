import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 등록 때 사용 여부를 보내지 않으면 '사용'으로 저장한다.
const DEFAULT_USE_STATUS = '사용';
const USE_STATUSES = ['사용', '미사용'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function intOf(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 정수여야 합니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr02901Controller {
  @Get('/approval-forms')
  async listApprovalForms(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const query = checks.queryOf(req.query);
    const page = intOf(query['page'], 0);
    const size = intOf(query['size'], DEFAULT_SIZE);
    if (page < 0 || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const pageSize = Math.min(size, MAX_SIZE);
    const rawStatus = query['useStatus'];
    let useStatus: string | null = null;
    if (rawStatus !== undefined && rawStatus !== null && rawStatus !== '') {
      if (typeof rawStatus !== 'string' || !USE_STATUSES.includes(rawStatus)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
      }
      useStatus = rawStatus;
    }
    return transaction(async (db) => {
      const params = {
        useStatus,
        limit: pageSize,
        offset: page * pageSize,
      };
      const items = await db.query(
        `SELECT approval_form_id AS "approvalFormId",
                form_name AS "formName",
                use_status AS "useStatus"
           FROM approval_form
          WHERE (CAST(:useStatus AS text) IS NULL OR use_status = CAST(:useStatus AS text))
          ORDER BY approval_form_id DESC
          LIMIT :limit OFFSET :offset`,
        params,
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM approval_form
          WHERE (CAST(:useStatus AS text) IS NULL OR use_status = CAST(:useStatus AS text))`,
        { useStatus },
      );
      return { items, page, size: pageSize, total: Number(counts[0]['total']) };
    });
  }

  @Post('/approval-forms')
  @HttpCode(200)
  async createApprovalForm(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    const formName = data['formName'];
    if (typeof formName !== 'string' || formName.trim() === '') {
      throw new ApiError(422, 'REQUIRED_FIELD_MISSING', '결재양식명을 입력해 주세요.');
    }
    if (formName.length > 200) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재양식명은 200자 이하여야 합니다.');
    }
    const formBody = data['formBody'];
    if (formBody !== undefined && formBody !== null && typeof formBody !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '양식 본문은 글자여야 합니다.');
    }
    const rule = data['approvalProcessRule'];
    if (rule !== undefined && rule !== null && typeof rule !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재 프로세스 규칙은 글자여야 합니다.');
    }
    let useStatus = DEFAULT_USE_STATUS;
    const rawStatus = data['useStatus'];
    if (rawStatus !== undefined && rawStatus !== null && rawStatus !== '') {
      if (typeof rawStatus !== 'string' || !USE_STATUSES.includes(rawStatus)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
      }
      useStatus = rawStatus;
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `INSERT INTO approval_form
           (form_name, form_body, approval_process_rule, use_status, created_at, updated_at)
         VALUES (:formName, :formBody, :rule, :useStatus, now(), now())
         RETURNING approval_form_id AS "approvalFormId",
                   form_name AS "formName",
                   use_status AS "useStatus"`,
        {
          formName: formName.trim(),
          formBody: typeof formBody === 'string' ? formBody : null,
          rule: typeof rule === 'string' ? rule : null,
          useStatus,
        },
      );
      return rows[0];
    });
  }
}
