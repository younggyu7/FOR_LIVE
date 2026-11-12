// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-032-04 근무시간 동의 및 근태집계 현황 조회 */
import { Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr03204';

const T_ATTENDANCE_REQUEST = new Table('attendance_request', 'attendance_request_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_CONSENT_ATTENDANCE_REQUEST: Col[] = [
  col('approvalStatus', 'attendance_request.approval_status', 'varchar'),
];
const OUT_LIST_ATTENDANCE_SUMMARIES: Col[] = [
  col('attendanceType', 'attendance_request.attendance_type', 'varchar'),
  col('approvalStatus', 'attendance_request.approval_status', 'varchar'),
];
const FILTER_LIST_ATTENDANCE_SUMMARIES: Col[] = [];

@Controller('api/v1')
export class FnSfr03204Controller {
  /** POST /attendance-requests/{attendanceRequestId}/consent — 근무시간 동의 */
  @Post('/attendance-requests/:attendanceRequestId/consent')
  @HttpCode(200)
  async consentAttendanceRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    data['attendanceRequestId'] = req.params['attendanceRequestId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.consentAttendanceRequest(data, new Ctx(db, user), () => notImplemented('consentAttendanceRequest')));
  }

  /** GET /attendance-summaries — 기간별 근태 유형별 집계 현황 조회 */
  @Get('/attendance-summaries')
  async listAttendanceSummaries(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listAttendanceSummaries(data, new Ctx(db, user), () => db.page(T_ATTENDANCE_REQUEST, OUT_LIST_ATTENDANCE_SUMMARIES, FILTER_LIST_ATTENDANCE_SUMMARIES, data)));
  }
}
