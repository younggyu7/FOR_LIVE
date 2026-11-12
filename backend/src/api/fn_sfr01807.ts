// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-018-07 근태 확정 관리 */
import { Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, NOW, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr01807';

const T_ATTENDANCE_CLOSING = new Table('attendance_closing', 'attendance_closing_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_PREVIEW_ATTENDANCE_CLOSING: Col[] = [];
const FILTER_PREVIEW_ATTENDANCE_CLOSING: Col[] = [
  col('closingUnit', 'attendance_closing.closing_unit', 'varchar'),
  col('closingDate', 'attendance_closing.closing_date', 'date'),
];
const OUT_CREATE_ATTENDANCE_CLOSING: Col[] = [
  col('attendanceClosingId', 'attendance_closing.attendance_closing_id', 'bigint'),
  col('status', 'attendance_closing.status', 'varchar'),
  col('closedAt', 'attendance_closing.closed_at', 'timestamptz'),
];
const IN_CREATE_ATTENDANCE_CLOSING: Col[] = [
  col('closingUnit', 'closing_unit', 'varchar'),
  col('closingDate', 'closing_date', 'date'),
];
const OUT_CANCEL_ATTENDANCE_CLOSING: Col[] = [
  col('attendanceClosingId', 'attendance_closing.attendance_closing_id', 'bigint'),
  col('status', 'attendance_closing.status', 'varchar'),
  col('cancelledAt', 'attendance_closing.cancelled_at', 'timestamptz'),
];
const STAMP_CANCEL_ATTENDANCE_CLOSING: Col[] = [
  col('cancelledAt', 'cancelled_at', 'timestamptz'),
];

@Controller('api/v1')
export class FnSfr01807Controller {
  /** GET /attendance-closings/preview — 마감 대상 기간의 근태 결과를 집계하여 미리 본다 */
  @Get('/attendance-closings/preview')
  async previewAttendanceClosing(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.queryOf(req.query);
    checks.oneOf(data, 'closingUnit', '일', '월');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.previewAttendanceClosing(data, new Ctx(db, user), () => db.first(T_ATTENDANCE_CLOSING, OUT_PREVIEW_ATTENDANCE_CLOSING, FILTER_PREVIEW_ATTENDANCE_CLOSING, data)));
  }

  /** POST /attendance-closings — 일 또는 월 단위 근태 마감을 실행한다 */
  @Post('/attendance-closings')
  @HttpCode(200)
  async createAttendanceClosing(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.inputOf(req.body);
    checks.required(data, 'closingUnit', 'closingDate');
    checks.oneOf(data, 'closingUnit', '일', '월');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createAttendanceClosing(data, new Ctx(db, user), () => db.insert(T_ATTENDANCE_CLOSING, IN_CREATE_ATTENDANCE_CLOSING, OUT_CREATE_ATTENDANCE_CLOSING, data, { 'status': '마감' })));
  }

  /** POST /attendance-closings/{attendanceClosingId}/cancel — 근태 마감을 취소한다 */
  @Post('/attendance-closings/:attendanceClosingId/cancel')
  @HttpCode(200)
  async cancelAttendanceClosing(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.inputOf(req.body);
    data['attendanceClosingId'] = req.params['attendanceClosingId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.cancelAttendanceClosing(data, new Ctx(db, user), () => db.set(T_ATTENDANCE_CLOSING, 'status', '마감 취소', data['attendanceClosingId'], OUT_CANCEL_ATTENDANCE_CLOSING, STAMP_CANCEL_ATTENDANCE_CLOSING, { 'cancelledAt': NOW })));
  }
}
