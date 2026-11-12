import { Controller, Delete, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const STATUSES = ['기안', '결재대기', '승인', '보류', '반려', '회수', '재기안', '완료'];
const PROCESS_STATUSES = ['승인', '보류', '반려'];

function intOf(value: unknown, fallback: number, min: number, max: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const text = String(value);
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 숫자로 입력해 주세요.');
  }
  const num = Number(text);
  if (num < min || num > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호 또는 크기가 허용 범위를 벗어났습니다.');
  }
  return num;
}

function idOf(req: Request): string {
  const id = req.params['approvalDocumentId'];
  if (typeof id !== 'string' || !/^\d+$/.test(id)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '전자결재 문서 ID 형식이 올바르지 않습니다.');
  }
  return id;
}

@Controller('api/v1')
export class FnSfr02902Controller {
  @Get('/approval-documents')
  async listApprovalDocuments(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const statusValue = query['approvalStatus'];
    let approvalStatus: string | null = null;
    if (statusValue !== undefined && statusValue !== '') {
      if (typeof statusValue !== 'string' || !STATUSES.includes(statusValue)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '진행 상태 값이 올바르지 않습니다.');
      }
      approvalStatus = statusValue;
    }
    const pendingValue = query['pendingOnly'];
    if (pendingValue !== undefined && pendingValue !== '' && pendingValue !== 'true' && pendingValue !== 'false') {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재예정 조회 값이 올바르지 않습니다.');
    }
    const pendingOnly = pendingValue === 'true';
    const page = intOf(query['page'], 0, 0, 1000000);
    const size = intOf(query['size'], DEFAULT_SIZE, 1, MAX_SIZE);
    return transaction(async (db) => {
      // 조회 권한 범위: 본인이 기안했거나 결재선에 포함된 문서만 본다
      const where: string[] = [
        '(d.drafter_id = CAST(:userId AS bigint) OR EXISTS (SELECT 1 FROM approval_line m WHERE m.approval_document_id = d.approval_document_id AND m.employee_id = CAST(:userId AS bigint)))',
      ];
      const params: Record<string, unknown> = { userId: user.id };
      if (approvalStatus !== null) {
        where.push('d.approval_status = :approvalStatus');
        params['approvalStatus'] = approvalStatus;
      }
      if (pendingOnly) {
        where.push(
          "d.approval_status = '결재대기' AND EXISTS (SELECT 1 FROM approval_line l WHERE l.approval_document_id = d.approval_document_id AND l.employee_id = CAST(:userId AS bigint) AND l.approval_status = '결재대기' AND NOT EXISTS (SELECT 1 FROM approval_line p WHERE p.approval_document_id = l.approval_document_id AND p.approval_order < l.approval_order AND p.approval_status <> '승인'))",
        );
      }
      const whereSql = where.join(' AND ');
      const counts = await db.query('SELECT COUNT(*) AS "total" FROM approval_document d WHERE ' + whereSql, params);
      const total = Number(counts[0]['total']);
      const items = await db.query(
        'SELECT d.approval_document_id AS "approvalDocumentId", d.document_no AS "documentNo", d.title AS "title", d.approval_status AS "approvalStatus", d.submitted_at AS "submittedAt" FROM approval_document d WHERE ' +
          whereSql +
          ' ORDER BY d.approval_document_id DESC LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { ...params, size, offset: page * size },
      );
      return { items, page, size, total };
    });
  }

  @Post('/approval-documents/:approvalDocumentId/process')
  @HttpCode(200)
  async processApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const id = idOf(req);
    const data = checks.inputOf(req.body);
    const decision = data['approvalStatus'];
    if (typeof decision !== 'string' || !PROCESS_STATUSES.includes(decision)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '승인, 보류, 반려 중 하나를 선택해 주세요.');
    }
    const opinionValue = data['opinion'];
    if (opinionValue !== undefined && opinionValue !== null && typeof opinionValue !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '결재 의견은 글자로 입력해 주세요.');
    }
    const opinion = typeof opinionValue === 'string' && opinionValue !== '' ? opinionValue : null;
    return transaction(async (db) => {
      const docs = await db.query(
        'SELECT approval_status AS "approvalStatus" FROM approval_document WHERE approval_document_id = CAST(:id AS bigint) FOR UPDATE',
        { id },
      );
      if (docs.length === 0) {
        throw new ApiError(404, 'APPROVAL_DOCUMENT_NOT_FOUND', '결재 문서를 찾을 수 없습니다.');
      }
      if (docs[0]['approvalStatus'] !== '결재대기') {
        throw new ApiError(409, 'NOT_APPROVER_TURN', '결재를 처리할 수 있는 상태의 문서가 아닙니다.');
      }
      // 본인 결재 차례: 본인 줄이 결재대기이고 앞 순서가 모두 승인된 경우
      const lines = await db.query(
        "SELECT l.approval_line_id AS \"lineId\" FROM approval_line l WHERE l.approval_document_id = CAST(:id AS bigint) AND l.employee_id = CAST(:userId AS bigint) AND l.approval_status = '결재대기' AND NOT EXISTS (SELECT 1 FROM approval_line p WHERE p.approval_document_id = l.approval_document_id AND p.approval_order < l.approval_order AND p.approval_status <> '승인') ORDER BY l.approval_order LIMIT 1",
        { id, userId: user.id },
      );
      if (lines.length === 0) {
        throw new ApiError(409, 'NOT_APPROVER_TURN', '본인의 결재 차례가 아니거나 결재자가 아닙니다.');
      }
      await db.execute(
        'UPDATE approval_line SET approval_status = :decision, opinion = :opinion, processed_at = now(), updated_at = now() WHERE approval_line_id = CAST(:lineId AS bigint)',
        { decision, opinion, lineId: lines[0]['lineId'] },
      );
      // 가정: 승인이면 다음 결재자에게 넘기고 마지막 승인이면 완료, 보류·반려는 문서 상태도 같은 값으로 바꾼다
      let nextStatus = decision;
      if (decision === '승인') {
        const rest = await db.query(
          "SELECT COUNT(*) AS \"cnt\" FROM approval_line WHERE approval_document_id = CAST(:id AS bigint) AND approval_status <> '승인'",
          { id },
        );
        nextStatus = Number(rest[0]['cnt']) > 0 ? '결재대기' : '완료';
      }
      await db.execute(
        "UPDATE approval_document SET approval_status = CAST(:nextStatus AS text), completed_at = CASE WHEN CAST(:nextStatus AS text) = '완료' THEN now() ELSE completed_at END, updated_at = now() WHERE approval_document_id = CAST(:id AS bigint)",
        { nextStatus, id },
      );
      return { approvalStatus: nextStatus };
    });
  }

  @Post('/approval-documents/:approvalDocumentId/withdraw')
  @HttpCode(200)
  async withdrawApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const id = idOf(req);
    return transaction(async (db) => {
      const docs = await db.query(
        'SELECT approval_status AS "approvalStatus", drafter_id AS "drafterId" FROM approval_document WHERE approval_document_id = CAST(:id AS bigint) FOR UPDATE',
        { id },
      );
      if (docs.length === 0) {
        throw new ApiError(404, 'APPROVAL_DOCUMENT_NOT_FOUND', '결재 문서를 찾을 수 없습니다.');
      }
      if (String(docs[0]['drafterId']) !== String(user.id)) {
        throw new ApiError(409, 'WITHDRAW_NOT_ALLOWED', '기안자만 문서를 회수할 수 있습니다.');
      }
      if (docs[0]['approvalStatus'] !== '결재대기') {
        throw new ApiError(409, 'WITHDRAW_NOT_ALLOWED', '이미 처리되어 회수할 수 없는 문서입니다.');
      }
      const rows = await db.query(
        "UPDATE approval_document SET approval_status = '회수', updated_at = now() WHERE approval_document_id = CAST(:id AS bigint) RETURNING approval_status AS \"approvalStatus\"",
        { id },
      );
      return { approvalStatus: rows[0]['approvalStatus'] };
    });
  }

  @Delete('/approval-documents/:approvalDocumentId')
  async deleteApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const id = idOf(req);
    return transaction(async (db) => {
      const docs = await db.query(
        'SELECT approval_status AS "approvalStatus", drafter_id AS "drafterId" FROM approval_document WHERE approval_document_id = CAST(:id AS bigint) FOR UPDATE',
        { id },
      );
      if (docs.length === 0) {
        throw new ApiError(404, 'APPROVAL_DOCUMENT_NOT_FOUND', '결재 문서를 찾을 수 없습니다.');
      }
      if (docs[0]['approvalStatus'] !== '반려' && docs[0]['approvalStatus'] !== '회수') {
        throw new ApiError(409, 'DELETE_NOT_ALLOWED', '반려 또는 회수된 문서만 삭제할 수 있습니다.');
      }
      // 가정: 삭제는 기안자 본인만 할 수 있다
      if (String(docs[0]['drafterId']) !== String(user.id)) {
        throw new ApiError(409, 'DELETE_NOT_ALLOWED', '기안자만 문서를 삭제할 수 있습니다.');
      }
      await db.execute('DELETE FROM approval_line WHERE approval_document_id = CAST(:id AS bigint)', { id });
      await db.execute('DELETE FROM approval_document WHERE approval_document_id = CAST(:id AS bigint)', { id });
      return {};
    });
  }
}
