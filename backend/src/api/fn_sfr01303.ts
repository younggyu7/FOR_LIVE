// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-013-03 인사발령 처리 및 발령공고 자동 게시 */
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr01303';

const T_PERSONNEL_APPOINTMENT = new Table('personnel_appointment', 'personnel_appointment_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_BOARD_POST = new Table('board_post', 'board_post_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_PROCESS_PERSONNEL_APPOINTMENT: Col[] = [
  col('personnelAppointmentId', 'personnel_appointment.personnel_appointment_id', 'bigint'),
  col('status', 'personnel_appointment.status', 'varchar'),
];
const STAMP_PROCESS_PERSONNEL_APPOINTMENT: Col[] = [
  col('processedBy', 'processed_by', 'bigint'),
  col('processedAt', 'processed_at', 'timestamptz'),
];
const OUT_REPOST_APPOINTMENT_ANNOUNCEMENT: Col[] = [
  col('boardPostId', 'board_post.board_post_id', 'bigint'),
];
const STAMP_REPOST_APPOINTMENT_ANNOUNCEMENT: Col[] = [
  col('authorId', 'author_id', 'bigint'),
  col('postType', 'post_type', 'varchar'),
  col('visibilityScope', 'visibility_scope', 'varchar'),
];

@Controller('api/v1')
export class FnSfr01303Controller {
  /** POST /personnel-appointments/{personnelAppointmentId}/process — 승인된 인사발령 처리 및 발령공고 게시 */
  @Post('/personnel-appointments/:personnelAppointmentId/process')
  @HttpCode(200)
  async processPersonnelAppointment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    data['personnelAppointmentId'] = req.params['personnelAppointmentId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.processPersonnelAppointment(data, new Ctx(db, user), () => notImplemented('processPersonnelAppointment')));
  }

  /** POST /personnel-appointments/{personnelAppointmentId}/repost-announcement — 발령공고 재게시 */
  @Post('/personnel-appointments/:personnelAppointmentId/repost-announcement')
  @HttpCode(200)
  async repostAppointmentAnnouncement(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    data['personnelAppointmentId'] = req.params['personnelAppointmentId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.repostAppointmentAnnouncement(data, new Ctx(db, user), () => notImplemented('repostAppointmentAnnouncement')));
  }
}
