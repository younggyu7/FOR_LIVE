// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-013-01 인사발령 신청 검토·승인 */
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, NOW, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr01301';

const T_PERSONNEL_APPOINTMENT = new Table('personnel_appointment', 'personnel_appointment_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_APPROVE_PERSONNEL_APPOINTMENT: Col[] = [
  col('personnelAppointmentId', 'personnel_appointment.personnel_appointment_id', 'bigint'),
  col('status', 'personnel_appointment.status', 'varchar'),
];
const STAMP_APPROVE_PERSONNEL_APPOINTMENT: Col[] = [
  col('processedBy', 'processed_by', 'bigint'),
  col('processedAt', 'processed_at', 'timestamptz'),
];
const OUT_REJECT_PERSONNEL_APPOINTMENT: Col[] = [
  col('personnelAppointmentId', 'personnel_appointment.personnel_appointment_id', 'bigint'),
  col('status', 'personnel_appointment.status', 'varchar'),
];
const STAMP_REJECT_PERSONNEL_APPOINTMENT: Col[] = [
  col('processedBy', 'processed_by', 'bigint'),
  col('processedAt', 'processed_at', 'timestamptz'),
];

@Controller('api/v1')
export class FnSfr01301Controller {
  /** POST /personnel-appointments/{personnelAppointmentId}/approve — 인사발령 신청 승인 */
  @Post('/personnel-appointments/:personnelAppointmentId/approve')
  @HttpCode(200)
  async approvePersonnelAppointment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    data['personnelAppointmentId'] = req.params['personnelAppointmentId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.approvePersonnelAppointment(data, new Ctx(db, user), () => db.move(T_PERSONNEL_APPOINTMENT, 'status', ['신청'], '승인', data['personnelAppointmentId'], OUT_APPROVE_PERSONNEL_APPOINTMENT, STAMP_APPROVE_PERSONNEL_APPOINTMENT, { 'processedBy': user.id, 'processedAt': NOW })));
  }

  /** POST /personnel-appointments/{personnelAppointmentId}/reject — 인사발령 신청 반려 */
  @Post('/personnel-appointments/:personnelAppointmentId/reject')
  @HttpCode(200)
  async rejectPersonnelAppointment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    data['personnelAppointmentId'] = req.params['personnelAppointmentId'];
    checks.required(data, 'rejectReason');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.rejectPersonnelAppointment(data, new Ctx(db, user), () => db.move(T_PERSONNEL_APPOINTMENT, 'status', ['신청'], '반려', data['personnelAppointmentId'], OUT_REJECT_PERSONNEL_APPOINTMENT, STAMP_REJECT_PERSONNEL_APPOINTMENT, { 'processedBy': user.id, 'processedAt': NOW })));
  }
}
