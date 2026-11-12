import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ATTENDANCE_TYPES = ['연차', '반차', '보상휴가', '병가', '예비군', '출장', '외근', '교육'];

// 가정: 근태 담당자가 조정한 건의 승인 처리 상태는 고정값 '승인'이다.
const ADJUSTED_STATUS = '승인';
// 가정: 조정은 하루 단위이므로 종료일은 조정 일자와 같다.

@Controller('api/v1')
export class FnSfr01804Controller {
  @Post('/attendance-requests/adjust')
  @HttpCode(200)
  async adjustAttendance(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.inputOf(req.body);

    const employeeIdText = String(data.employeeId ?? '').trim();
    if (!/^\d+$/.test(employeeIdText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '대상 임직원을 선택해 주세요.');
    }
    const adjustDate = String(data.adjustDate ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(adjustDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조정 일자를 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    const attendanceType = String(data.attendanceType ?? '').trim();
    if (!ATTENDANCE_TYPES.includes(attendanceType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '근태 유형을 올바르게 선택해 주세요.');
    }
    const reason = String(data.reason ?? '').trim();
    if (reason === '' || reason.length > 1000) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사유를 1000자 이내로 입력해 주세요.');
    }
    const changedWorkTimeText = String(data.changedWorkTime ?? '').trim();
    if (changedWorkTimeText.length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', '변경 근무시간은 100자 이내로 입력해 주세요.');
    }
    const changedWorkTime = changedWorkTimeText === '' ? null : changedWorkTimeText;

    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId: employeeIdText },
      );
      if (employees.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '대상 임직원을 찾을 수 없습니다.');
      }

      const closedCommute = await db.query(
        'SELECT commute_record_id FROM commute_record '
          + 'WHERE employee_id = CAST(:employeeId AS bigint) '
          + 'AND work_date = CAST(:adjustDate AS date) AND is_closed = true',
        { employeeId: employeeIdText, adjustDate },
      );
      const closedRequest = await db.query(
        'SELECT attendance_request_id FROM attendance_request '
          + 'WHERE employee_id = CAST(:employeeId AS bigint) '
          + "AND approval_status = '마감' "
          + 'AND start_date <= CAST(:adjustDate AS date) AND end_date >= CAST(:adjustDate AS date)',
        { employeeId: employeeIdText, adjustDate },
      );
      if (closedCommute.length > 0 || closedRequest.length > 0) {
        throw new ApiError(409, 'ATTENDANCE_DATE_CLOSED', '마감된 일자는 마감을 취소하기 전에는 조정할 수 없습니다.');
      }

      const rows = await db.query(
        'INSERT INTO attendance_request '
          + '(employee_id, attendance_type, start_date, end_date, reason, changed_work_time, approval_status, created_at, updated_at) '
          + 'VALUES (CAST(:employeeId AS bigint), :attendanceType, CAST(:adjustDate AS date), CAST(:adjustDate AS date), '
          + ':reason, :changedWorkTime, :approvalStatus, now(), now()) '
          + 'RETURNING attendance_request_id AS "attendanceRequestId", '
          + 'attendance_type AS "attendanceType", '
          + 'changed_work_time AS "changedWorkTime", '
          + 'created_at AS "adjustedAt"',
        {
          employeeId: employeeIdText,
          adjustDate,
          attendanceType,
          reason,
          changedWorkTime,
          approvalStatus: ADJUSTED_STATUS,
        },
      );
      return rows[0];
    });
  }
}
