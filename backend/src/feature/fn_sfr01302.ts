import { Controller, HttpCode, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 상태 전환표(신청→승인, 승인→마감·승인 취소, 마감→마감 취소)
const TRANSITIONS: Record<string, string[]> = {
  '신청': ['승인'],
  '승인': ['마감', '승인 취소'],
  '마감': ['마감 취소'],
};
const STATUSES = ['신청', '승인', '반려', '마감', '마감 취소', '승인 취소'];

function isId(v: unknown): boolean {
  return (typeof v === 'number' || typeof v === 'string') && /^[0-9]+$/.test(String(v));
}

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

@Controller('api/v1')
export class FnSfr01302Controller {
  @Post('/personnel-appointments')
  @HttpCode(200)
  async createPersonnelAppointment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    const appointmentType = text(data['appointmentType']);
    const appointmentDate = text(data['appointmentDate']);
    const positionAfter = text(data['positionAfter']);
    if (!isId(data['employeeId']) || !appointmentType || !appointmentDate || !isId(data['departmentId'])) {
      throw new ApiError(422, 'INVALID_APPOINTMENT_INPUT', '대상 임직원, 발령 구분, 발령일자, 발령 후 부서를 모두 입력해 주세요.');
    }
    if (appointmentType.length > 50 || positionAfter.length > 100 || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      throw new ApiError(422, 'INVALID_APPOINTMENT_INPUT', '입력값의 형식이나 길이가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT pr.employee_id AS "employeeId" FROM personnel_record pr WHERE pr.employee_id = CAST(:employeeId AS bigint)',
        { employeeId: String(data['employeeId']) },
      );
      if (employees.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '인사기록카드에 없는 임직원입니다.');
      }
      const departments = await db.query(
        'SELECT department_id AS "departmentId" FROM department WHERE department_id = CAST(:departmentId AS bigint)',
        { departmentId: String(data['departmentId']) },
      );
      if (departments.length === 0) {
        throw new ApiError(422, 'INVALID_APPOINTMENT_INPUT', '발령 후 부서를 찾을 수 없습니다.');
      }
      const rows = await db.query(
        'INSERT INTO personnel_appointment (employee_id, department_id, appointment_type, appointment_date, position_after, status, created_at, updated_at) '
        + "VALUES (CAST(:employeeId AS bigint), CAST(:departmentId AS bigint), :appointmentType, CAST(:appointmentDate AS date), :positionAfter, '신청', now(), now()) "
        + 'RETURNING personnel_appointment_id AS "personnelAppointmentId", status AS "status"',
        {
          employeeId: String(data['employeeId']),
          departmentId: String(data['departmentId']),
          appointmentType,
          appointmentDate,
          positionAfter: positionAfter === '' ? null : positionAfter,
        },
      );
      // 인사정보 접근 이력 기록
      await db.execute(
        'INSERT INTO personal_info_access_log (employee_id, target_employee_id, target_info_type, access_type, accessed_at, created_at, updated_at) '
        + "VALUES (CAST(:userId AS bigint), CAST(:employeeId AS bigint), '인사정보', '등록', now(), now(), now())",
        { userId: user.id, employeeId: String(data['employeeId']) },
      );
      return rows[0];
    });
  }

  @Patch('/personnel-appointments/:personnelAppointmentId/status')
  async updatePersonnelAppointmentStatus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    const id = req.params['personnelAppointmentId'];
    const status = text(data['status']);
    if (!isId(id) || !STATUSES.includes(status)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '발령 상태 값이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT status AS "status" FROM personnel_appointment WHERE personnel_appointment_id = CAST(:id AS bigint)',
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PERSONNEL_APPOINTMENT_NOT_FOUND', '발령 대상자를 찾을 수 없습니다.');
      }
      const current = String(found[0]['status']);
      const allowed = TRANSITIONS[current] ?? [];
      if (!allowed.includes(status)) {
        throw new ApiError(409, 'APPOINTMENT_ALREADY_PROCESSED', '현재 상태에서는 변경할 수 없습니다. 정해진 절차를 이용해 주세요.');
      }
      const rows = await db.query(
        'UPDATE personnel_appointment SET status = :status, processed_by = CAST(:userId AS bigint), processed_at = now(), updated_at = now() '
        + 'WHERE personnel_appointment_id = CAST(:id AS bigint) '
        + 'RETURNING personnel_appointment_id AS "personnelAppointmentId", status AS "status"',
        { status, userId: user.id, id },
      );
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) '
        + "VALUES (CAST(:userId AS bigint), 'personnel_appointment', CAST(:id AS bigint), '발령상태 변경', now(), :content, now(), now())",
        { userId: user.id, id, content: '발령 상태: ' + current + ' → ' + status },
      );
      return rows[0];
    });
  }
}
