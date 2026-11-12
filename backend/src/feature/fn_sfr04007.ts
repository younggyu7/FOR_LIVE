import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 알림 채널은 개발 담당자가 정한다. 모바일 결재 기능이므로 '모바일'로 둔다.
const NOTIFY_CHANNEL = '모바일';

interface Db {
  query: (sql: string, params?: Record<string, unknown>) => Promise<any[]>;
  execute: (sql: string, params?: Record<string, unknown>) => Promise<number>;
}

function idOf(raw: unknown): string {
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '결재문서 ID가 올바르지 않습니다.');
  }
  return raw;
}

// 의견이 없으면 빈 문자열을 돌려주고, 저장할 때 NULLIF로 NULL이 된다.
function opinionOf(data: Record<string, unknown>): string {
  const value = data['opinion'];
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_FAILED', '의견은 글자로 입력해 주세요.');
  }
  return value;
}

async function notify(
  db: Db,
  recipientId: unknown,
  title: string,
  content: string,
  eventType: string,
  documentId: string,
): Promise<void> {
  await db.query(
    `INSERT INTO notification (recipient_id, channel, title, content, read_status, event_type, target_type, target_id, created_at, updated_at)
     VALUES (CAST(:recipientId AS bigint), :channel, :title, :content, '안읽음', :eventType, 'APPROVAL_DOCUMENT', CAST(:documentId AS bigint), now(), now())
     RETURNING notification_id AS "notificationId"`,
    { recipientId: String(recipientId), channel: NOTIFY_CHANNEL, title, content, eventType, documentId },
  );
}

async function decide(
  db: Db,
  documentId: string,
  userId: string,
  opinion: string,
  approve: boolean,
): Promise<{ approvalStatus: string }> {
  const docs = await db.query(
    `SELECT approval_document_id AS "approvalDocumentId", drafter_id AS "drafterId", title, approval_status AS "approvalStatus"
     FROM approval_document
     WHERE approval_document_id = CAST(:documentId AS bigint)
     FOR UPDATE`,
    { documentId },
  );
  if (docs.length === 0) {
    throw new ApiError(404, 'APPROVAL_DOCUMENT_NOT_FOUND', '결재문서를 찾을 수 없습니다.');
  }
  const doc = docs[0];
  if (doc.approvalStatus !== '결재대기') {
    throw new ApiError(409, 'APPROVAL_STATUS_MISMATCH', '결재대기 상태의 문서만 처리할 수 있습니다.');
  }
  const pending = await db.query(
    `SELECT approval_line_id AS "approvalLineId", employee_id AS "employeeId", approval_order AS "approvalOrder"
     FROM approval_line
     WHERE approval_document_id = CAST(:documentId AS bigint) AND approval_status = '결재대기'
     ORDER BY approval_order
     LIMIT 1
     FOR UPDATE`,
    { documentId },
  );
  if (pending.length === 0 || String(pending[0].employeeId) !== userId) {
    throw new ApiError(409, 'APPROVAL_STATUS_MISMATCH', '본인의 결재 차례가 아닙니다.');
  }
  const line = pending[0];
  await db.execute(
    `UPDATE approval_line
     SET approval_status = :lineStatus, opinion = NULLIF(:opinion, ''), processed_at = now(), updated_at = now()
     WHERE approval_line_id = CAST(:lineId AS bigint)`,
    { lineStatus: approve ? '승인' : '반려', opinion, lineId: String(line.approvalLineId) },
  );

  if (!approve) {
    await db.execute(
      `UPDATE approval_document SET approval_status = '반려', updated_at = now()
       WHERE approval_document_id = CAST(:documentId AS bigint)`,
      { documentId },
    );
    await notify(db, doc.drafterId, '결재 반려', `'${doc.title}' 문서가 반려되었습니다.`, 'APPROVAL_REJECTED', documentId);
    return { approvalStatus: '반려' };
  }

  const next = await db.query(
    `SELECT employee_id AS "employeeId"
     FROM approval_line
     WHERE approval_document_id = CAST(:documentId AS bigint)
       AND approval_status = '결재대기'
       AND approval_order > CAST(:order AS integer)
     ORDER BY approval_order
     LIMIT 1`,
    { documentId, order: String(line.approvalOrder) },
  );
  if (next.length > 0) {
    // 다음 결재자에게 이동 (문서는 결재대기 유지)
    await notify(db, next[0].employeeId, '결재 요청', `'${doc.title}' 문서의 결재 차례입니다.`, 'APPROVAL_REQUESTED', documentId);
    return { approvalStatus: '결재대기' };
  }
  await db.execute(
    `UPDATE approval_document SET approval_status = '완료', completed_at = now(), updated_at = now()
     WHERE approval_document_id = CAST(:documentId AS bigint)`,
    { documentId },
  );
  await notify(db, doc.drafterId, '결재 완료', `'${doc.title}' 문서의 결재가 완료되었습니다.`, 'APPROVAL_APPROVED', documentId);
  return { approvalStatus: '완료' };
}

@Controller('api/v1')
export class FnSfr04007Controller {
  @Post('/approval-documents/:approvalDocumentId/approve')
  @HttpCode(200)
  async approveApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const documentId = idOf(req.params['approvalDocumentId']);
    const opinion = opinionOf(data);
    const userId: string = String(user.id);
    return transaction(async (db) => {
      return decide(db, documentId, userId, opinion, true);
    });
  }

  @Post('/approval-documents/:approvalDocumentId/reject')
  @HttpCode(200)
  async rejectApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const documentId = idOf(req.params['approvalDocumentId']);
    const opinion = opinionOf(data);
    const userId: string = String(user.id);
    return transaction(async (db) => {
      return decide(db, documentId, userId, opinion, false);
    });
  }
}
