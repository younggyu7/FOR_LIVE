import { Controller, Delete, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ATTENDANCE_TYPES = ['연차', '반차', '보상휴가', '병가', '예비군', '출장', '외근', '교육'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// 승인된 건과 마감된 기간의 건은 수정·삭제할 수 없다 (공통 P8·P9는 공통 모듈이 맡지만 API 표의 409 거절은 여기서 한다)
const LOCKED_STATUSES = ['승인', '마감'];

@Controller('api/v1')
export class FnSfr03203Controller {
  @Put('/attendance-requests/:attendanceRequestId')
  async updateAttendanceRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const id = String(req.params['attendanceRequestId']);
    const attendanceType = typeof data['attendanceType'] === 'string' ? data['attendanceType'] : '';
    const startDate = typeof data['startDate'] === 'string' ? data['startDate'] : '';
    const endDate = typeof data['endDate'] === 'string' ? data['endDate'] : '';
    const reason = data['reason'] === undefined || data['reason'] === null || data['reason'] === '' ? null : data['reason'];
    const changedWorkTime = data['changedWorkTime'] === undefined || data['changedWorkTime'] === null || data['changedWorkTime'] === '' ? null : data['changedWorkTime'];
    if (!ATTENDANCE_TYPES.includes(attendanceType)) {
      throw new ApiError(422, 'ATTENDANCE_REQUEST_INVALID', '근태 유형을 올바르게 선택해 주세요.');
    }
    if (!DATE_PATTERN.test(startDate)) {
      throw new ApiError(422, 'ATTENDANCE_REQUEST_INVALID', '시작일을 입력해 주세요.');
    }
    if (!DATE_PATTERN.test(endDate)) {
      throw new ApiError(422, 'ATTENDANCE_REQUEST_INVALID', '종료일을 입력해 주세요.');
    }
    if (reason !== null && (typeof reason !== 'string' || reason.length > 1000)) {
      throw new ApiError(422, 'ATTENDANCE_REQUEST_INVALID', '사유는 1000자 이내의 글자로 입력해 주세요.');
    }
    if (changedWorkTime !== null && (typeof changedWorkTime !== 'string' || changedWorkTime.length > 100)) {
      throw new ApiError(422, 'ATTENDANCE_REQUEST_INVALID', '변경 근무시간은 100자 이내의 글자로 입력해 주세요.');
    }
    return transaction(async (db) => {
      if (!/^\d+$/.test(id)) {
        throw new ApiError(404, 'ATTENDANCE_REQUEST_NOT_FOUND', '근태 신청 건을 찾을 수 없습니다.');
      }
      const rows = await db.query(
        `SELECT approval_status AS "approvalStatus"
           FROM attendance_request
          WHERE attendance_request_id = CAST(:id AS bigint)
            AND employee_id = CAST(:userId AS bigint)
            FOR UPDATE`,
        { id, userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'ATTENDANCE_REQUEST_NOT_FOUND', '근태 신청 건을 찾을 수 없습니다.');
      }
      if (LOCKED_STATUSES.includes(String(rows[0]['approvalStatus']))) {
        throw new ApiError(409, 'ATTENDANCE_REQUEST_LOCKED', '승인되었거나 마감된 건은 수정할 수 없습니다. 승인 취소·회수 또는 마감 취소 후 변경해 주세요.');
      }
      const cmp = await db.query(
        `SELECT (CAST(:endDate AS date) < CAST(:startDate AS date)) AS "reversed"`,
        { startDate, endDate },
      );
      if (cmp[0]['reversed'] === true) {
        throw new ApiError(422, 'ATTENDANCE_REQUEST_INVALID', '종료일은 시작일보다 빠를 수 없습니다.');
      }
      // TODO: 잔여 일수 검사(LEAVE_BALANCE_INSUFFICIENT)는 잔여 일수 테이블이 입력에 없어 구현하지 못했다
      const updated = await db.query(
        `UPDATE attendance_request
            SET attendance_type = :attendanceType,
                start_date = CAST(:startDate AS date),
                end_date = CAST(:endDate AS date),
                reason = :reason,
                changed_work_time = :changedWorkTime,
                updated_at = now()
          WHERE attendance_request_id = CAST(:id AS bigint)
          RETURNING attendance_request_id AS "attendanceRequestId",
                    approval_status AS "approvalStatus"`,
        { id, attendanceType, startDate, endDate, reason, changedWorkTime },
      );
      return updated[0];
    });
  }

  @Delete('/attendance-requests/:attendanceRequestId')
  async deleteAttendanceRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const id = String(req.params['attendanceRequestId']);
    return transaction(async (db) => {
      if (!/^\d+$/.test(id)) {
        throw new ApiError(404, 'ATTENDANCE_REQUEST_NOT_FOUND', '근태 신청 건을 찾을 수 없습니다.');
      }
      const rows = await db.query(
        `SELECT approval_status AS "approvalStatus"
           FROM attendance_request
          WHERE attendance_request_id = CAST(:id AS bigint)
            AND employee_id = CAST(:userId AS bigint)
            FOR UPDATE`,
        { id, userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'ATTENDANCE_REQUEST_NOT_FOUND', '근태 신청 건을 찾을 수 없습니다.');
      }
      if (LOCKED_STATUSES.includes(String(rows[0]['approvalStatus']))) {
        throw new ApiError(409, 'ATTENDANCE_REQUEST_LOCKED', '승인되었거나 마감된 건은 삭제할 수 없습니다. 승인 취소·회수 또는 마감 취소 후 변경해 주세요.');
      }
      await db.execute(
        `DELETE FROM attendance_request
          WHERE attendance_request_id = CAST(:id AS bigint)`,
        { id },
      );
      return {};
    });
  }
}
