import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

@Controller('api/v1')
export class FnSir00203Controller {
  @Post('/approval-linked-forms')
  @HttpCode(200)
  async createApprovalLinkedForm(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    const approvalFormId = data['approvalFormId'];
    if (typeof approvalFormId !== 'number' || !Number.isInteger(approvalFormId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재양식을 선택해 주세요.');
    }
    return transaction(async (db) => {
      const forms = await db.query(
        'SELECT approval_form_id FROM approval_form WHERE approval_form_id = CAST(:approvalFormId AS bigint)',
        { approvalFormId },
      );
      if (forms.length === 0) {
        throw new ApiError(404, 'APPROVAL_FORM_NOT_FOUND', '결재양식을 찾을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT approval_linked_form_id FROM approval_linked_form WHERE approval_form_id = CAST(:approvalFormId AS bigint)',
        { approvalFormId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'APPROVAL_LINKED_FORM_DUPLICATED', '이미 등록된 연동결재 양식입니다.');
      }
      const rows = await db.query(
        'INSERT INTO approval_linked_form (approval_form_id, created_at, updated_at) '
          + 'VALUES (CAST(:approvalFormId AS bigint), now(), now()) '
          + 'RETURNING approval_linked_form_id AS "approvalLinkedFormId", approval_form_id AS "approvalFormId"',
        { approvalFormId },
      );
      return rows[0];
    });
  }
}
