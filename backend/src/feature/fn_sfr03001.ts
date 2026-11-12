import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

@Controller('api/v1')
export class FnSfr03001Controller {
  @Post('/approval-documents/:approvalDocumentId/submit')
  @HttpCode(200)
  async submitApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const id = req.params['approvalDocumentId'];
    if (!/^[0-9]+$/.test(id)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '문서 ID 형식이 올바르지 않습니다.');
    }
    const raw = data['approverIds'];
    if (raw !== undefined && raw !== null && !Array.isArray(raw)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재선 형식이 올바르지 않습니다.');
    }
    const approverIds: number[] = [];
    for (const item of (raw ?? []) as unknown[]) {
      const n = Number(item);
      if (item === '' || item === null || !Number.isInteger(n) || n <= 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '결재자 ID는 숫자여야 합니다.');
      }
      approverIds.push(n);
    }
    return transaction(async (db) => {
      const docs = await db.query(
        `SELECT approval_document_id AS "approvalDocumentId",
                approval_status AS "approvalStatus",
                title AS "title",
                body AS "body"
           FROM approval_document
          WHERE approval_document_id = CAST(:id AS bigint)
            FOR UPDATE`,
        { id },
      );
      if (docs.length === 0) {
        throw new ApiError(404, 'APPROVAL_DOCUMENT_NOT_FOUND', '대상 문서를 찾을 수 없습니다.');
      }
      const doc = docs[0] as Record<string, unknown>;
      if (doc['approvalStatus'] !== '기안') {
        throw new ApiError(409, 'APPROVAL_DOCUMENT_NOT_DRAFT', '기안 상태의 문서만 상신할 수 있습니다.');
      }
      const title = typeof doc['title'] === 'string' ? doc['title'].trim() : '';
      const body = typeof doc['body'] === 'string' ? doc['body'].trim() : '';
      if (title === '') {
        throw new ApiError(422, 'REQUIRED_FIELD_MISSING', '제목을 입력해 주세요.');
      }
      if (body === '') {
        throw new ApiError(422, 'REQUIRED_FIELD_MISSING', '본문을 입력해 주세요.');
      }
      if (approverIds.length === 0) {
        throw new ApiError(422, 'REQUIRED_FIELD_MISSING', '결재선을 지정해 주세요.');
      }
      for (const approverId of approverIds) {
        const found = await db.query(
          `SELECT employee_id AS "employeeId"
             FROM employee
            WHERE employee_id = CAST(:approverId AS bigint)`,
          { approverId },
        );
        if (found.length === 0) {
          throw new ApiError(400, 'VALIDATION_FAILED', '존재하지 않는 결재자가 있습니다.');
        }
      }
      const rows = await db.query(
        `UPDATE approval_document
            SET approval_status = '결재대기',
                submitted_at = now(),
                updated_at = now()
          WHERE approval_document_id = CAST(:id AS bigint)
        RETURNING approval_document_id AS "approvalDocumentId",
                  approval_status AS "approvalStatus",
                  submitted_at AS "submittedAt"`,
        { id },
      );
      return rows[0];
    });
  }
}
