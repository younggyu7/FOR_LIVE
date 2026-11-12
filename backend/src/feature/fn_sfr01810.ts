import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 결재 양식은 사용 중인 양식 중 이름에 이 글자가 들어간 것을 먼저 고른다.
const FORM_NAME_KEYWORD = '%출장%';
// 가정: 상신된 문서의 최초 상태
const SUBMITTED_STATUS = '결재대기';

@Controller('api/v1')
export class FnSfr01810Controller {
  @Post('/attendance-requests/:attendanceRequestId/submit')
  @HttpCode(200)
  async submitAttendanceRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    checks.inputOf(req.body ?? {});
    const idText = req.params['attendanceRequestId'];
    if (typeof idText !== 'string' || !/^\d+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '근태 신청 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT attendance_request_id AS "attendanceRequestId",
                attendance_type AS "attendanceType",
                start_date::text AS "startDate",
                end_date::text AS "endDate",
                reason AS "reason",
                approval_status AS "approvalStatus",
                approval_document_id AS "approvalDocumentId"
           FROM attendance_request
          WHERE attendance_request_id = CAST(:id AS bigint)
            AND employee_id = CAST(:userId AS bigint)
          FOR UPDATE`,
        { id: idText, userId: user.id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'ATTENDANCE_REQUEST_NOT_FOUND', '근태 신청을 찾을 수 없습니다.');
      }
      const row = found[0];
      if (row.approvalStatus !== '신청' || row.approvalDocumentId !== null) {
        throw new ApiError(409, 'ATTENDANCE_REQUEST_ALREADY_SUBMITTED', '이미 상신했거나 승인된 신청입니다.');
      }
      const forms = await db.query(
        `SELECT approval_form_id AS "approvalFormId"
           FROM approval_form
          WHERE use_status = '사용'
          ORDER BY (form_name LIKE :keyword) DESC, approval_form_id
          LIMIT 1`,
        { keyword: FORM_NAME_KEYWORD },
      );
      if (forms.length === 0) {
        throw new ApiError(409, 'INVALID_STATE', '사용 중인 결재 양식이 설정되어 있지 않습니다.');
      }
      const title = `근태 신청(${row.attendanceType}) ${row.startDate} ~ ${row.endDate}`;
      const created = await db.query(
        `INSERT INTO approval_document
           (document_no, approval_form_id, drafter_id, title, body,
            approval_status, submitted_at, created_at, updated_at)
         VALUES
           (CONCAT('ATT-', CAST(:id AS text)), CAST(:formId AS bigint), CAST(:userId AS bigint),
            :title, :body, :status, now(), now(), now())
         RETURNING approval_document_id AS "approvalDocumentId"`,
        {
          id: idText,
          formId: String(forms[0].approvalFormId),
          userId: user.id,
          title,
          body: row.reason ?? null,
          status: SUBMITTED_STATUS,
        },
      );
      const approvalDocumentId = created[0].approvalDocumentId;
      await db.execute(
        `UPDATE attendance_request
            SET approval_document_id = CAST(:docId AS bigint),
                updated_at = now()
          WHERE attendance_request_id = CAST(:id AS bigint)`,
        { docId: String(approvalDocumentId), id: idText },
      );
      return { approvalDocumentId };
    });
  }
}
