import { Controller, Delete, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ID_PATTERN = /^\d+$/;

function idOf(value: unknown, label: string): string {
  const text = String(value ?? '');
  if (!ID_PATTERN.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return text;
}

@Controller('api/v1')
export class FnSfr01503Controller {
  @Post('/education-applications')
  @HttpCode(200)
  async createEducationApplication(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const sessionId = idOf(data['educationSessionId'], '교육차수');
    const reason = data['applicationReason'] == null ? null : String(data['applicationReason']);
    return transaction(async (db) => {
      const sessions = await db.query(
        'SELECT education_session_id FROM education_session WHERE education_session_id = CAST(:sessionId AS bigint)',
        { sessionId },
      );
      if (sessions.length === 0) {
        throw new ApiError(404, 'EDUCATION_SESSION_NOT_FOUND', '교육 차수를 찾을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT education_application_id FROM education_application WHERE education_session_id = CAST(:sessionId AS bigint) AND employee_id = CAST(:userId AS bigint)',
        { sessionId, userId: user.id },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'EDUCATION_APPLICATION_DUPLICATED', '이미 해당 차수에 신청하셨습니다.');
      }
      const rows = await db.query(
        `INSERT INTO education_application (education_session_id, employee_id, status, application_reason, created_at, updated_at)
         VALUES (CAST(:sessionId AS bigint), CAST(:userId AS bigint), '신청', :reason, now(), now())
         RETURNING education_application_id AS "educationApplicationId", status AS "status"`,
        { sessionId, userId: user.id, reason },
      );
      return rows[0];
    });
  }

  @Post('/education-applications/:educationApplicationId/approve')
  @HttpCode(200)
  async approveEducationApplication(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const id = idOf(req.params['educationApplicationId'], '교육신청');
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT education_session_id AS "sessionId", employee_id AS "employeeId", status AS "status"
         FROM education_application WHERE education_application_id = CAST(:id AS bigint) FOR UPDATE`,
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EDUCATION_APPLICATION_NOT_FOUND', '교육신청을 찾을 수 없습니다.');
      }
      const current = found[0];
      if (current.status !== '신청') {
        throw new ApiError(409, 'EDUCATION_APPLICATION_STATE_CONFLICT', '신청 상태의 건만 승인할 수 있습니다.');
      }
      const rows = await db.query(
        `UPDATE education_application SET status = '승인', updated_at = now()
         WHERE education_application_id = CAST(:id AS bigint)
         RETURNING education_application_id AS "educationApplicationId", status AS "status"`,
        { id },
      );
      await db.execute(
        `INSERT INTO education_attendee (education_session_id, employee_id, created_at, updated_at)
         VALUES (CAST(:sessionId AS bigint), CAST(:employeeId AS bigint), now(), now())
         ON CONFLICT (education_session_id, employee_id) DO NOTHING`,
        { sessionId: String(current.sessionId), employeeId: String(current.employeeId) },
      );
      await db.execute(
        `INSERT INTO notification (recipient_id, channel, title, content, read_status, event_type, target_type, target_id, created_at, updated_at)
         VALUES (CAST(:recipientId AS bigint), '포털', :title, :content, '안읽음', 'EDUCATION_APPROVED', 'EDUCATION_APPLICATION', CAST(:id AS bigint), now(), now())`,
        {
          recipientId: String(current.employeeId),
          title: '교육신청이 승인되었습니다.',
          content: '신청하신 교육이 승인되어 교육대상자로 반영되었습니다.',
          id,
        },
      );
      return rows[0];
    });
  }

  @Post('/education-applications/:educationApplicationId/reject')
  @HttpCode(200)
  async rejectEducationApplication(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const id = idOf(req.params['educationApplicationId'], '교육신청');
    const data = checks.inputOf(req.body);
    const rejectReason = data['rejectReason'] == null ? '' : String(data['rejectReason']).trim();
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT employee_id AS "employeeId", status AS "status"
         FROM education_application WHERE education_application_id = CAST(:id AS bigint) FOR UPDATE`,
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EDUCATION_APPLICATION_NOT_FOUND', '교육신청을 찾을 수 없습니다.');
      }
      const current = found[0];
      if (current.status !== '신청') {
        throw new ApiError(409, 'EDUCATION_APPLICATION_STATE_CONFLICT', '신청 상태의 건만 반려할 수 있습니다.');
      }
      if (rejectReason === '') {
        throw new ApiError(422, 'REJECT_REASON_REQUIRED', '반려 사유를 입력해 주세요.');
      }
      const rows = await db.query(
        `UPDATE education_application SET status = '반려', reject_reason = :rejectReason, updated_at = now()
         WHERE education_application_id = CAST(:id AS bigint)
         RETURNING education_application_id AS "educationApplicationId", status AS "status"`,
        { id, rejectReason },
      );
      await db.execute(
        `INSERT INTO notification (recipient_id, channel, title, content, read_status, event_type, target_type, target_id, created_at, updated_at)
         VALUES (CAST(:recipientId AS bigint), '포털', :title, :content, '안읽음', 'EDUCATION_REJECTED', 'EDUCATION_APPLICATION', CAST(:id AS bigint), now(), now())`,
        {
          recipientId: String(current.employeeId),
          title: '교육신청이 반려되었습니다.',
          content: rejectReason,
          id,
        },
      );
      return rows[0];
    });
  }

  @Post('/education-applications/:educationApplicationId/cancel-approval')
  @HttpCode(200)
  async cancelEducationApplicationApproval(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const id = idOf(req.params['educationApplicationId'], '교육신청');
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT status AS "status"
         FROM education_application WHERE education_application_id = CAST(:id AS bigint) FOR UPDATE`,
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EDUCATION_APPLICATION_NOT_FOUND', '교육신청을 찾을 수 없습니다.');
      }
      if (found[0].status !== '승인') {
        throw new ApiError(409, 'EDUCATION_APPLICATION_STATE_CONFLICT', '승인 상태의 건만 승인 취소할 수 있습니다.');
      }
      const rows = await db.query(
        `UPDATE education_application SET status = '승인 취소', updated_at = now()
         WHERE education_application_id = CAST(:id AS bigint)
         RETURNING education_application_id AS "educationApplicationId", status AS "status"`,
        { id },
      );
      await db.execute(
        `INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), 'education_application', CAST(:id AS bigint), '승인 취소', now(), :content, now(), now())`,
        { userId: user.id, id, content: '교육신청 상태 변경: 승인 -> 승인 취소' },
      );
      return rows[0];
    });
  }

  @Delete('/education-applications/:educationApplicationId')
  async deleteEducationApplication(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const id = idOf(req.params['educationApplicationId'], '교육신청');
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT status AS "status"
         FROM education_application WHERE education_application_id = CAST(:id AS bigint) FOR UPDATE`,
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EDUCATION_APPLICATION_NOT_FOUND', '교육신청을 찾을 수 없습니다.');
      }
      if (found[0].status === '승인') {
        throw new ApiError(409, 'EDUCATION_APPLICATION_APPROVED', '승인된 신청은 삭제할 수 없습니다. 승인 취소 절차를 거쳐 주세요.');
      }
      await db.execute(
        'DELETE FROM education_application WHERE education_application_id = CAST(:id AS bigint)',
        { id },
      );
      return {};
    });
  }
}
