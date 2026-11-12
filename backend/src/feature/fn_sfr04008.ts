import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 첨부파일의 업무 대상 유형 코드. BEHAVIOR.md는 '결재문서', schema.sql 제약은 'APPROVAL_DOCUMENT'를 쓰므로 둘 다 허용한다.
const ATTACHMENT_TARGET_TYPES = ['APPROVAL_DOCUMENT', '결재문서'];

@Controller('api/v1')
export class FnSfr04008Controller {
  @Get('/approval-documents/:approvalDocumentId')
  async getApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const rawId = req.params['approvalDocumentId'];
    if (typeof rawId !== 'string' || !/^[0-9]{1,18}$/.test(rawId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재문서 ID 형식이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      // 본인이 상신한 문서만 조회한다.
      const docs = await db.query(
        `SELECT title AS "title",
                body AS "body",
                approval_status AS "approvalStatus"
           FROM approval_document
          WHERE approval_document_id = CAST(:id AS bigint)
            AND drafter_id = CAST(:userId AS bigint)`,
        { id: rawId, userId: user.id },
      );
      if (docs.length === 0) {
        throw new ApiError(404, 'APPROVAL_DOCUMENT_NOT_FOUND', '결재문서를 찾을 수 없습니다.');
      }
      const approvalLines = await db.query(
        `SELECT approval_line_id AS "approvalLineId",
                employee_id AS "employeeId",
                approval_order AS "approvalOrder",
                approval_status AS "approvalStatus",
                opinion AS "opinion",
                processed_at AS "processedAt"
           FROM approval_line
          WHERE approval_document_id = CAST(:id AS bigint)
          ORDER BY approval_order`,
        { id: rawId },
      );
      const attachments = await db.query(
        `SELECT attachment_id AS "attachmentId",
                file_name AS "fileName",
                file_extension AS "fileExtension",
                file_size AS "fileSize"
           FROM attachment
          WHERE target_type IN (:type1, :type2)
            AND target_id = CAST(:id AS bigint)
          ORDER BY attachment_id`,
        { type1: ATTACHMENT_TARGET_TYPES[0], type2: ATTACHMENT_TARGET_TYPES[1], id: rawId },
      );
      return {
        title: docs[0].title,
        body: docs[0].body,
        approvalStatus: docs[0].approvalStatus,
        approvalLines,
        attachments,
      };
    });
  }
}
