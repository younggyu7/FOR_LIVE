// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-017-02 근태항목 관리 */
import { Controller, Delete, Get, HttpCode, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr01702';

const T_ATTENDANCE_ITEM = new Table('attendance_item', 'attendance_item_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LIST_ATTENDANCE_ITEMS: Col[] = [
  col('attendanceItemId', 'attendance_item.attendance_item_id', 'bigint'),
  col('name', 'attendance_item.name', 'varchar'),
  col('useYn', 'attendance_item.use_yn', 'varchar'),
  col('deductYn', 'attendance_item.deduct_yn', 'boolean'),
];
const FILTER_LIST_ATTENDANCE_ITEMS: Col[] = [
  col('useYn', 'attendance_item.use_yn', 'varchar'),
];
const OUT_CREATE_ATTENDANCE_ITEM: Col[] = [
  col('attendanceItemId', 'attendance_item.attendance_item_id', 'bigint'),
];
const IN_CREATE_ATTENDANCE_ITEM: Col[] = [
  col('name', 'name', 'varchar'),
  col('useYn', 'use_yn', 'varchar'),
  col('deductYn', 'deduct_yn', 'boolean'),
];
const OUT_UPDATE_ATTENDANCE_ITEM: Col[] = [
  col('attendanceItemId', 'attendance_item.attendance_item_id', 'bigint'),
];
const IN_UPDATE_ATTENDANCE_ITEM: Col[] = [
  col('name', 'name', 'varchar'),
  col('useYn', 'use_yn', 'varchar'),
  col('deductYn', 'deduct_yn', 'boolean'),
];
const OUT_DELETE_ATTENDANCE_ITEM: Col[] = [];

@Controller('api/v1')
export class FnSfr01702Controller {
  /** GET /attendance-items — 근태항목 목록 조회 */
  @Get('/attendance-items')
  async listAttendanceItems(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.queryOf(req.query);
    checks.oneOf(data, 'useYn', '사용', '미사용');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listAttendanceItems(data, new Ctx(db, user), () => db.page(T_ATTENDANCE_ITEM, OUT_LIST_ATTENDANCE_ITEMS, FILTER_LIST_ATTENDANCE_ITEMS, data)));
  }

  /** POST /attendance-items — 근태항목 등록 */
  @Post('/attendance-items')
  @HttpCode(200)
  async createAttendanceItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.inputOf(req.body);
    checks.required(data, 'name', 'useYn');
    checks.oneOf(data, 'useYn', '사용', '미사용');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createAttendanceItem(data, new Ctx(db, user), () => db.insert(T_ATTENDANCE_ITEM, IN_CREATE_ATTENDANCE_ITEM, OUT_CREATE_ATTENDANCE_ITEM, data, {})));
  }

  /** PATCH /attendance-items/{attendanceItemId} — 근태항목 수정·사용 여부 설정 */
  @Patch('/attendance-items/:attendanceItemId')
  async updateAttendanceItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.inputOf(req.body);
    data['attendanceItemId'] = req.params['attendanceItemId'];
    checks.oneOf(data, 'useYn', '사용', '미사용');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.updateAttendanceItem(data, new Ctx(db, user), () => db.update(T_ATTENDANCE_ITEM, IN_UPDATE_ATTENDANCE_ITEM, OUT_UPDATE_ATTENDANCE_ITEM, data['attendanceItemId'], data)));
  }

  /** DELETE /attendance-items/{attendanceItemId} — 근태항목 삭제 */
  @Delete('/attendance-items/:attendanceItemId')
  async deleteAttendanceItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.queryOf(req.query);
    data['attendanceItemId'] = req.params['attendanceItemId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.deleteAttendanceItem(data, new Ctx(db, user), () => db.delete(T_ATTENDANCE_ITEM, data['attendanceItemId'])));
  }
}
