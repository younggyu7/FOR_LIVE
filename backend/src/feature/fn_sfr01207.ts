import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 알림 기본 채널은 포털
const NOTIFY_CHANNEL = '포털';
// 가정: 알림 이벤트 유형·변경 구분 문구
const NOTIFY_EVENT_TYPE = '휴직단축근무검토';
const CHANGE_TYPE = '휴직·단축근무 승인';
const STATUSES = ['신청', '승인', '반려'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function bad(): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', '요청 값이 올바르지 않습니다.');
}

function optText(v: unknown): string | undefined {
  if (v === undefined || v === null || v === '') {
    return undefined;
  }
  if (typeof v !== 'string') {
    throw bad();
  }
  return v;
}

function optId(v: unknown): string | undefined {
  if (v === undefined || v === null || v === '') {
    return undefined;
  }
  const s = String(v);
  if (!/^\d+$/.test(s)) {
    throw bad();
  }
  return s;
}

@Controller('api/v1')
export class FnSfr01207Controller {
  @Get('/leave-of-absence-requests')
  async listLeaveOfAbsenceRequests(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자', '임직원');
    const q = checks.queryOf(req.query);
    const status = optText(q['status']);
    if (status !== undefined && !STATUSES.includes(status)) {
      throw bad();
    }
    const employeeId = optId(q['employeeId']);
    const pageRaw = q['page'] === undefined || q['page'] === '' ? 0 : Number(q['page']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0) {
      throw bad();
    }
    const sizeRaw = q['size'] === undefined || q['size'] === '' ? 20 : Number(q['size']);
    if (!Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw bad();
    }
    const size = Math.min(sizeRaw, 200);
    const page = pageRaw;
    return transaction(async (db) => {
      const filter = `
        FROM leave_of_absence_request
        WHERE (CAST(:status AS text) IS NULL OR status = :status)
          AND (CAST(:employeeId AS bigint) IS NULL OR employee_id = CAST(:employeeId AS bigint))`;
      const params = { status: status ?? null, employeeId: employeeId ?? null };
      const items = await db.query(
        `SELECT leave_of_absence_request_id AS "leaveOfAbsenceRequestId",
          employee_id AS "employeeId",
          request_type AS "requestType",
          start_date AS "startDate",
          end_date AS "endDate",
          reason AS "reason",
          status AS "status",
          reject_reason AS "rejectReason"` +
          filter +
          ` ORDER BY leave_of_absence_request_id DESC
          LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { ...params, size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"` + filter,
        params,
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/leave-of-absence-requests')
  @HttpCode(200)
  async createLeaveOfAbsenceRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const requestType = optText(data['requestType']);
    const startDate = optText(data['startDate']);
    const endDate = optText(data['endDate']);
    const reason = optText(data['reason']);
    if (requestType === undefined || requestType.length > 50) {
      throw bad();
    }
    if (startDate === undefined || endDate === undefined) {
      throw bad();
    }
    if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
      throw bad();
    }
    return transaction(async (db) => {
      const check = await db.query(
        `SELECT (CAST(:endDate AS date) < CAST(:startDate AS date)) AS "invalid"`,
        { startDate, endDate },
      );
      if (check[0]['invalid'] === true) {
        throw new ApiError(422, 'INVALID_DATE_RANGE', '종료일은 시작일보다 빠를 수 없습니다.');
      }
      const rows = await db.query(
        `INSERT INTO leave_of_absence_request
          (employee_id, request_type, start_date, end_date, reason, status, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), :requestType, CAST(:startDate AS date),
           CAST(:endDate AS date), :reason, '신청', now(), now())
         RETURNING leave_of_absence_request_id AS "leaveOfAbsenceRequestId", status AS "status"`,
        { userId: user.id, requestType, startDate, endDate, reason: reason ?? null },
      );
      return rows[0];
    });
  }

  @Post('/leave-of-absence-requests/:leaveOfAbsenceRequestId/review')
  @HttpCode(200)
  async reviewLeaveOfAbsenceRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const id = req.params['leaveOfAbsenceRequestId'];
    if (!/^\d+$/.test(id)) {
      throw bad();
    }
    const data = checks.inputOf(req.body);
    const status = optText(data['status']);
    const rejectReason = optText(data['rejectReason']);
    if (status !== '승인' && status !== '반려') {
      throw bad();
    }
    if (status === '반려' && rejectReason === undefined) {
      throw bad();
    }
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT employee_id AS "employeeId", status AS "status",
           request_type AS "requestType",
           CAST(start_date AS text) AS "startDate",
           CAST(end_date AS text) AS "endDate"
         FROM leave_of_absence_request
         WHERE leave_of_absence_request_id = CAST(:id AS bigint)
         FOR UPDATE`,
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'LEAVE_OF_ABSENCE_REQUEST_NOT_FOUND', '휴직·단축근무 신청을 찾을 수 없습니다.');
      }
      const row = found[0];
      if (row['status'] !== '신청') {
        throw new ApiError(
          409,
          'LEAVE_OF_ABSENCE_REQUEST_ALREADY_PROCESSED',
          '이미 ' + String(row['status']) + ' 처리된 신청입니다.',
        );
      }
      let appliedPersonnelRecordId: number | null = null;
      if (status === '승인') {
        const records = await db.query(
          `SELECT personnel_record_id AS "personnelRecordId"
           FROM personnel_record
           WHERE employee_id = CAST(:employeeId AS bigint)`,
          { employeeId: String(row['employeeId']) },
        );
        if (records.length === 0) {
          throw new ApiError(404, 'PERSONNEL_RECORD_NOT_FOUND', '신청자의 인사기록카드를 찾을 수 없습니다.');
        }
        appliedPersonnelRecordId = Number(records[0]['personnelRecordId']);
      }
      const updated = await db.query(
        `UPDATE leave_of_absence_request
         SET status = :status,
           reject_reason = :rejectReason,
           reviewer_id = CAST(:userId AS bigint),
           reviewed_at = now(),
           updated_at = now()
         WHERE leave_of_absence_request_id = CAST(:id AS bigint)
         RETURNING status AS "status", reviewed_at AS "reviewedAt"`,
        { status, rejectReason: status === '반려' ? rejectReason : null, userId: user.id, id },
      );
      if (appliedPersonnelRecordId !== null) {
        // 가정: 인사기록카드에는 휴직 상태 컬럼이 없어 수정 시각만 갱신하고 변경 이력에 승인 내용을 남긴다
        await db.execute(
          `UPDATE personnel_record SET updated_at = now()
           WHERE personnel_record_id = CAST(:recordId AS bigint)`,
          { recordId: String(appliedPersonnelRecordId) },
        );
        const content = '승인된 ' + String(row['requestType']) + ' ' + String(row['startDate']) + ' ~ ' + String(row['endDate']);
        await db.execute(
          `INSERT INTO change_history
            (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
           VALUES (CAST(:userId AS bigint), 'personnel_record', CAST(:recordId AS bigint),
             :changeType, now(), :content, now(), now())`,
          { userId: user.id, recordId: String(appliedPersonnelRecordId), changeType: CHANGE_TYPE, content },
        );
      }
      const title = status === '승인'
        ? '휴직·단축근무 신청이 승인되었습니다.'
        : '휴직·단축근무 신청이 반려되었습니다.';
      await db.execute(
        `INSERT INTO notification
          (recipient_id, channel, title, content, read_status, event_type, target_type, target_id, created_at, updated_at)
         VALUES (CAST(:recipientId AS bigint), :channel, :title, :content, '안읽음', :eventType,
           'leave_of_absence_request', CAST(:id AS bigint), now(), now())`,
        {
          recipientId: String(row['employeeId']),
          channel: NOTIFY_CHANNEL,
          title,
          content: status === '반려' ? rejectReason : null,
          eventType: NOTIFY_EVENT_TYPE,
          id,
        },
      );
      return {
        status: updated[0]['status'],
        reviewedAt: updated[0]['reviewedAt'],
        appliedPersonnelRecordId,
      };
    });
  }
}
