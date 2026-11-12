import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 지정 권한은 해당 문서의 기안자만 가진다 (스키마에 완료 문서 권한자 정보가 없다).
const COMPLETED_STATUS = '완료';
const TARGET_TYPE = 'approval_document';
const CHANGE_TYPE = '보안문서 지정';

@Controller('api/v1')
export class FnSfr02907Controller {
  @Post('/approval-documents/:approvalDocumentId/designate-security')
  @HttpCode(200)
  async designateSecurityApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const idText = req.params['approvalDocumentId'];
    if (typeof idText !== 'string' || !/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재 문서 ID가 올바르지 않습니다.');
    }
    const changeContent = data['changeContent'];
    if (typeof changeContent !== 'string' || changeContent.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '변경 내용을 입력해 주세요.');
    }
    const rawReason = data['changeReason'];
    if (rawReason !== undefined && rawReason !== null && typeof rawReason !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '변경 사유 형식이 올바르지 않습니다.');
    }
    const changeReason = typeof rawReason === 'string' && rawReason !== '' ? rawReason : null;
    if (changeReason !== null && changeReason.length > 500) {
      throw new ApiError(400, 'VALIDATION_FAILED', '변경 사유는 500자 이하로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const docs = await db.query(
        `SELECT approval_document_id AS "approvalDocumentId",
                drafter_id AS "drafterId",
                approval_status AS "approvalStatus"
           FROM approval_document
          WHERE approval_document_id = CAST(:id AS bigint)`,
        { id: idText },
      );
      if (docs.length === 0) {
        throw new ApiError(404, 'APPROVAL_DOCUMENT_NOT_FOUND', '대상 결재 문서를 찾을 수 없습니다.');
      }
      const doc = docs[0];
      if (String(doc['drafterId']) !== String(user.id)) {
        throw new ApiError(422, 'SECURITY_DESIGNATION_NOT_ALLOWED', '보안문서를 지정할 권한이 없습니다.');
      }
      if (doc['approvalStatus'] !== COMPLETED_STATUS) {
        throw new ApiError(409, 'APPROVAL_DOCUMENT_NOT_COMPLETED', '결재가 완료된 문서만 보안문서로 지정할 수 있습니다.');
      }
      await db.query(
        `INSERT INTO change_history (
           changer_id, target_type, target_id, change_type,
           changed_at, change_content, change_reason, created_at, updated_at
         ) VALUES (
           CAST(:userId AS bigint), :targetType, CAST(:id AS bigint), :changeType,
           now(), :changeContent, :changeReason, now(), now()
         )
         RETURNING change_history_id AS "changeHistoryId"`,
        {
          userId: user.id,
          targetType: TARGET_TYPE,
          id: idText,
          changeType: CHANGE_TYPE,
          changeContent,
          changeReason,
        },
      );
      return {
        approvalDocumentId: Number(doc['approvalDocumentId']),
        securityDesignated: true,
      };
    });
  }
}
