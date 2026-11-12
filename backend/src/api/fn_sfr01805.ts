// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-018-05 근태 현황 및 집계 조회 */
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr01805';

const T_COMMUTE_RECORD = new Table('commute_record', 'commute_record_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_DEPARTMENT = new Table('department', 'department_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LIST_DAILY_ATTENDANCE_STATUS: Col[] = [
  col('employeeName', 'j1.name', 'varchar'),
  col('workDate', 'commute_record.work_date', 'date'),
  col('checkInAt', 'commute_record.check_in_at', 'timestamptz'),
  col('checkOutAt', 'commute_record.check_out_at', 'timestamptz'),
];
const V_LIST_DAILY_ATTENDANCE_STATUS = T_COMMUTE_RECORD.withJoins('LEFT JOIN employee j1 ON j1.employee_id = commute_record.employee_id');
const FILTER_LIST_DAILY_ATTENDANCE_STATUS: Col[] = [];
const OUT_LIST_MONTHLY_ATTENDANCE_STATUS: Col[] = [
  col('departmentName', 'department.name', 'varchar'),
];
const FILTER_LIST_MONTHLY_ATTENDANCE_STATUS: Col[] = [];
const OUT_LIST_ATTENDANCE_SUMMARY: Col[] = [];
const FILTER_LIST_ATTENDANCE_SUMMARY: Col[] = [];

@Controller('api/v1')
export class FnSfr01805Controller {
  /** GET /attendance-status/daily — 권한 범위 내 일별 근태 현황을 조회한다 */
  @Get('/attendance-status/daily')
  async listDailyAttendanceStatus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listDailyAttendanceStatus(data, new Ctx(db, user), () => db.page(V_LIST_DAILY_ATTENDANCE_STATUS, OUT_LIST_DAILY_ATTENDANCE_STATUS, FILTER_LIST_DAILY_ATTENDANCE_STATUS, data)));
  }

  /** GET /attendance-status/monthly — 권한 범위 내 월별 근태 현황을 조회한다 */
  @Get('/attendance-status/monthly')
  async listMonthlyAttendanceStatus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listMonthlyAttendanceStatus(data, new Ctx(db, user), () => db.page(T_DEPARTMENT, OUT_LIST_MONTHLY_ATTENDANCE_STATUS, FILTER_LIST_MONTHLY_ATTENDANCE_STATUS, data)));
  }

  /** GET /attendance-status/summary — 권한 범위 내 근태 유형별 집계를 조회한다 */
  @Get('/attendance-status/summary')
  async listAttendanceSummary(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listAttendanceSummary(data, new Ctx(db, user), () => db.page(T_DEPARTMENT, OUT_LIST_ATTENDANCE_SUMMARY, FILTER_LIST_ATTENDANCE_SUMMARY, data)));
  }
}
