// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-037-03 인증기기 승인·관리 */
import { Controller, Delete, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, NOW, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr03703';

const T_AUTH_DEVICE = new Table('auth_device', 'auth_device_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LIST_AUTH_DEVICES: Col[] = [
  col('authDeviceId', 'auth_device.auth_device_id', 'bigint'),
  col('employeeId', 'auth_device.employee_id', 'bigint'),
  col('deviceName', 'auth_device.device_name', 'varchar'),
  col('deviceIdentifier', 'auth_device.device_identifier', 'varchar'),
  col('approvalStatus', 'auth_device.approval_status', 'varchar'),
  col('useStatus', 'auth_device.use_status', 'varchar'),
];
const FILTER_LIST_AUTH_DEVICES: Col[] = [
  col('approvalStatus', 'auth_device.approval_status', 'varchar'),
  col('employeeId', 'auth_device.employee_id', 'bigint'),
];
const OUT_CREATE_AUTH_DEVICE: Col[] = [
  col('authDeviceId', 'auth_device.auth_device_id', 'bigint'),
  col('approvalStatus', 'auth_device.approval_status', 'varchar'),
];
const IN_CREATE_AUTH_DEVICE: Col[] = [
  col('deviceIdentifier', 'device_identifier', 'varchar'),
  col('deviceName', 'device_name', 'varchar'),
  col('employeeId', 'employee_id', 'bigint'),
];
const OUT_APPROVE_AUTH_DEVICE: Col[] = [
  col('authDeviceId', 'auth_device.auth_device_id', 'bigint'),
  col('approvalStatus', 'auth_device.approval_status', 'varchar'),
];
const STAMP_APPROVE_AUTH_DEVICE: Col[] = [
  col('useStatus', 'use_status', 'varchar'),
  col('approverId', 'approver_id', 'bigint'),
  col('processedAt', 'processed_at', 'timestamptz'),
];
const OUT_REJECT_AUTH_DEVICE: Col[] = [
  col('authDeviceId', 'auth_device.auth_device_id', 'bigint'),
  col('approvalStatus', 'auth_device.approval_status', 'varchar'),
];
const STAMP_REJECT_AUTH_DEVICE: Col[] = [
  col('approverId', 'approver_id', 'bigint'),
  col('processedAt', 'processed_at', 'timestamptz'),
];
const OUT_DEACTIVATE_AUTH_DEVICE: Col[] = [
  col('authDeviceId', 'auth_device.auth_device_id', 'bigint'),
  col('useStatus', 'auth_device.use_status', 'varchar'),
];
const STAMP_DEACTIVATE_AUTH_DEVICE: Col[] = [
  col('useStatus', 'use_status', 'varchar'),
  col('approverId', 'approver_id', 'bigint'),
  col('processedAt', 'processed_at', 'timestamptz'),
];
const OUT_DELETE_AUTH_DEVICE: Col[] = [];

@Controller('api/v1')
export class FnSfr03703Controller {
  /** GET /auth-devices — 인증기기 목록 조회 */
  @Get('/auth-devices')
  async listAuthDevices(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자', '임직원');
    const data = checks.queryOf(req.query);
    checks.oneOf(data, 'approvalStatus', '신청', '승인', '반려');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listAuthDevices(data, new Ctx(db, user), () => db.page(T_AUTH_DEVICE, OUT_LIST_AUTH_DEVICES, FILTER_LIST_AUTH_DEVICES, data)));
  }

  /** POST /auth-devices — 인증기기 등록 요청 */
  @Post('/auth-devices')
  @HttpCode(200)
  async createAuthDevice(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    if (data['employeeId'] == null) {
      data['employeeId'] = user.id;
    }
    checks.required(data, 'deviceIdentifier');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createAuthDevice(data, new Ctx(db, user), () => db.insert(T_AUTH_DEVICE, IN_CREATE_AUTH_DEVICE, OUT_CREATE_AUTH_DEVICE, data, { 'otp_enabled': true, 'approval_status': '신청', 'use_status': '미사용' })));
  }

  /** POST /auth-devices/{authDeviceId}/approve — 인증기기 승인 */
  @Post('/auth-devices/:authDeviceId/approve')
  @HttpCode(200)
  async approveAuthDevice(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    data['authDeviceId'] = req.params['authDeviceId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.approveAuthDevice(data, new Ctx(db, user), () => db.move(T_AUTH_DEVICE, 'approval_status', ['신청'], '승인', data['authDeviceId'], OUT_APPROVE_AUTH_DEVICE, STAMP_APPROVE_AUTH_DEVICE, { 'useStatus': '사용', 'approverId': user.id, 'processedAt': NOW })));
  }

  /** POST /auth-devices/{authDeviceId}/reject — 인증기기 반려 */
  @Post('/auth-devices/:authDeviceId/reject')
  @HttpCode(200)
  async rejectAuthDevice(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    data['authDeviceId'] = req.params['authDeviceId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.rejectAuthDevice(data, new Ctx(db, user), () => db.move(T_AUTH_DEVICE, 'approval_status', ['신청'], '반려', data['authDeviceId'], OUT_REJECT_AUTH_DEVICE, STAMP_REJECT_AUTH_DEVICE, { 'approverId': user.id, 'processedAt': NOW })));
  }

  /** POST /auth-devices/{authDeviceId}/deactivate — 승인된 인증기기 사용중지 */
  @Post('/auth-devices/:authDeviceId/deactivate')
  @HttpCode(200)
  async deactivateAuthDevice(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    data['authDeviceId'] = req.params['authDeviceId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.deactivateAuthDevice(data, new Ctx(db, user), () => notImplemented('deactivateAuthDevice')));
  }

  /** DELETE /auth-devices/{authDeviceId} — 인증기기 삭제 */
  @Delete('/auth-devices/:authDeviceId')
  async deleteAuthDevice(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.queryOf(req.query);
    data['authDeviceId'] = req.params['authDeviceId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.deleteAuthDevice(data, new Ctx(db, user), () => db.delete(T_AUTH_DEVICE, data['authDeviceId'])));
  }
}
