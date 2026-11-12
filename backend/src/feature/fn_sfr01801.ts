import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ATTENDANCE_TYPES = ['연차', '반차', '보상휴가', '병가', '예비군', '출장', '외근', '교육'];
const APPROVAL_STATUSES = ['신청', '마감', '마감 취소', '승인', '승인 취소', '반려'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 취소된 신청은 허용 상태값 중 '승인 취소'로 기록한다 (취소 전용 상태값이 스키마에 없음).
const CANCELLED_STATUS = '승인 취소';

@Controller('api/v1')
export class FnSfr01801Controller {
  @Get('/attendance-requests')
  async listAttendanceRequests(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const query = checks.queryOf(req.query);
    const attendanceType = typeof query['attendanceType'] === 'string' ? query['attendanceType'] : '';
    const approvalStatus = typeof query['approvalStatus'] === 'string' ? query['approvalStatus'] : '';
    if (attendanceType !== '' && !ATTENDANCE_TYPES.includes(attendanceType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '근태 유형이 올바르지 않습니다.');
    }
    if (approvalStatus !== '' && !APPROVAL_STATUSES.includes(approvalStatus)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '승인 처리 상태가 올바르지 않습니다.');
    }
    const pageText = query['page'] === undefined || query['page'] === '' ? '0' : String(query['page']);
    const sizeText = query['size'] === undefined || query['size'] === '' ? String(DEFAULT_SIZE) : String(query['size']);
    if (!/^\d+$/.test(pageText) || !/^\d+$/.test(sizeText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 숫자여야 합니다.');
    }
    const page = Number(pageText);
    const size = Math.min(Math.max(Number(sizeText), 1), MAX_SIZE);
    return transaction(async (db) => {
      const filter = {
        attendanceType: attendanceType === '' ? null : attendanceType,
        approvalStatus: approvalStatus === '' ? null : approvalStatus,
      };
      const where = `WHERE (CAST(:attendanceType AS text) IS NULL OR attendance_type = CAST(:attendanceType AS text))
          AND (CAST(:approvalStatus AS text) IS NULL OR approval_status = CAST(:approvalStatus AS text))`;
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM attendance_request ${where}`,
        filter,
      );
      const items = await db.query(
        `SELECT attendance_request_id AS "attendanceRequestId",
          attendance_type AS "attendanceType",
          start_date AS "startDate",
          end_date AS "endDate",
          reason AS "reason",
          changed_work_time AS "changedWorkTime",
          approval_status AS "approvalStatus"
        FROM attendance_request
        ${where}
        ORDER BY attendance_request_id DESC
        LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { ...filter, size, offset: page * size },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/attendance-requests')
  @HttpCode(200)
  async createAttendanceRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const data = checks.inputOf(req.body);
    const attendanceType = typeof data['attendanceType'] === 'string' ? data['attendanceType'] : '';
    const startDate = typeof data['startDate'] === 'string' ? data['startDate'] : '';
    const endDate = typeof data['endDate'] === 'string' ? data['endDate'] : '';
    const reason = typeof data['reason'] === 'string' && data['reason'] !== '' ? data['reason'] : null;
    const changedWorkTime =
      typeof data['changedWorkTime'] === 'string' && data['changedWorkTime'] !== '' ? data['changedWorkTime'] : null;
    if (attendanceType === '' || startDate === '' || endDate === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '근태 유형, 시작일, 종료일은 필수입니다.');
    }
    if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '날짜는 YYYY-MM-DD 형식이어야 합니다.');
    }
    if ((reason !== null && reason.length > 1000) || (changedWorkTime !== null && changedWorkTime.length > 100)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사유는 1000자, 변경 근무시간은 100자 이내로 입력해 주세요.');
    }
    if (!ATTENDANCE_TYPES.includes(attendanceType)) {
      throw new ApiError(422, 'ATTENDANCE_VALIDATION_FAILED', '사용할 수 없는 근태 유형입니다.');
    }
    if (endDate < startDate) {
      throw new ApiError(422, 'ATTENDANCE_VALIDATION_FAILED', '종료일은 시작일보다 빠를 수 없습니다.');
    }
    return transaction(async (db) => {
      const closed = await db.query(
        `SELECT COUNT(*) AS "cnt" FROM attendance_request
        WHERE employee_id = CAST(:userId AS bigint)
          AND approval_status = '마감'
          AND start_date <= CAST(:endDate AS date)
          AND end_date >= CAST(:startDate AS date)`,
        { userId: user.id, startDate, endDate },
      );
      if (Number(closed[0]['cnt']) > 0) {
        throw new ApiError(409, 'ATTENDANCE_PERIOD_CLOSED', '마감된 기간에는 근태를 신청할 수 없습니다.');
      }
      // 가정: 결재 상신은 사용 중인 첫 결재양식으로 만든다. 사용 중인 양식이 없으면 결재 연계 없이 저장한다.
      const forms = await db.query(
        `SELECT approval_form_id AS "formId" FROM approval_form
        WHERE use_status = '사용'
        ORDER BY approval_form_id
        LIMIT 1`,
        {},
      );
      let approvalDocumentId: number | null = null;
      if (forms.length > 0) {
        const docs = await db.query(
          `INSERT INTO approval_document
            (document_no, approval_form_id, drafter_id, title, body, approval_status, submitted_at, created_at, updated_at)
          VALUES
            ('ATT-' || replace(CAST(gen_random_uuid() AS text), '-', ''),
             CAST(:formId AS bigint), CAST(:userId AS bigint), :title, :body, '결재대기', now(), now(), now())
          RETURNING approval_document_id AS "approvalDocumentId"`,
          {
            formId: forms[0]['formId'],
            userId: user.id,
            title: attendanceType + ' 신청',
            body: reason,
          },
        );
        approvalDocumentId = Number(docs[0]['approvalDocumentId']);
      }
      const rows = await db.query(
        `INSERT INTO attendance_request
          (employee_id, approval_document_id, attendance_type, start_date, end_date, reason, changed_work_time,
           approval_status, created_at, updated_at)
        VALUES
          (CAST(:userId AS bigint), CAST(:approvalDocumentId AS bigint), :attendanceType,
           CAST(:startDate AS date), CAST(:endDate AS date), :reason, :changedWorkTime,
           '신청', now(), now())
        RETURNING attendance_request_id AS "attendanceRequestId", approval_status AS "approvalStatus"`,
        {
          userId: user.id,
          approvalDocumentId,
          attendanceType,
          startDate,
          endDate,
          reason,
          changedWorkTime,
        },
      );
      return rows[0];
    });
  }

  @Post('/attendance-requests/:attendanceRequestId/cancel')
  @HttpCode(200)
  async cancelAttendanceRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const requestId = req.params['attendanceRequestId'];
    if (!/^\d+$/.test(requestId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '근태 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT attendance_request_id AS "attendanceRequestId",
          approval_document_id AS "approvalDocumentId",
          approval_status AS "approvalStatus"
        FROM attendance_request
        WHERE attendance_request_id = CAST(:requestId AS bigint)`,
        { requestId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'ATTENDANCE_REQUEST_NOT_FOUND', '근태 신청을 찾을 수 없습니다.');
      }
      const current = String(found[0]['approvalStatus']);
      if (current === '승인') {
        throw new ApiError(409, 'ATTENDANCE_REQUEST_APPROVED', '승인된 신청은 직접 취소할 수 없습니다. 승인 취소 절차를 진행해 주세요.');
      }
      if (current === '마감') {
        throw new ApiError(409, 'ATTENDANCE_PERIOD_CLOSED', '마감된 기간의 신청은 취소할 수 없습니다.');
      }
      if (current !== '신청') {
        throw new ApiError(409, 'INVALID_STATE', '신청 상태인 건만 취소할 수 있습니다.');
      }
      const rows = await db.query(
        `UPDATE attendance_request
        SET approval_status = :cancelled, updated_at = now()
        WHERE attendance_request_id = CAST(:requestId AS bigint)
        RETURNING attendance_request_id AS "attendanceRequestId", approval_status AS "approvalStatus"`,
        { requestId, cancelled: CANCELLED_STATUS },
      );
      if (found[0]['approvalDocumentId'] !== null) {
        await db.execute(
          `UPDATE approval_document
          SET approval_status = '회수', updated_at = now()
          WHERE approval_document_id = CAST(:documentId AS bigint)
            AND approval_status = '결재대기'`,
          { documentId: found[0]['approvalDocumentId'] },
        );
      }
      await db.execute(
        `INSERT INTO change_history
          (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
        VALUES
          (CAST(:userId AS bigint), 'attendance_request', CAST(:requestId AS bigint), '신청 취소', now(),
           :content, now(), now())`,
        { userId: user.id, requestId, content: '승인 처리 상태: 신청 → ' + CANCELLED_STATUS },
      );
      return rows[0];
    });
  }
}
