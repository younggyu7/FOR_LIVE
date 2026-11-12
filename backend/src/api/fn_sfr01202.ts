// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-012-02 인사정보 변경 신청 검토·승인 */
import { Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, NOW, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr01202';

const T_PERSONNEL_CHANGE_REQUEST = new Table('personnel_change_request', 'personnel_change_request_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LIST_PERSONNEL_CHANGE_REQUESTS: Col[] = [
  col('employeeId', 'personnel_change_request.employee_id', 'bigint'),
  col('changeItem', 'personnel_change_request.change_item', 'varchar'),
  col('requestReason', 'personnel_change_request.request_reason', 'text'),
  col('status', 'personnel_change_request.status', 'varchar'),
  col('rejectReason', 'personnel_change_request.reject_reason', 'text'),
];
const FILTER_LIST_PERSONNEL_CHANGE_REQUESTS: Col[] = [
  col('status', 'personnel_change_request.status', 'varchar'),
  col('employeeId', 'personnel_change_request.employee_id', 'bigint'),
];
const OUT_CREATE_PERSONNEL_CHANGE_REQUEST: Col[] = [
  col('status', 'personnel_change_request.status', 'varchar'),
];
const IN_CREATE_PERSONNEL_CHANGE_REQUEST: Col[] = [
  col('changeItem', 'change_item', 'varchar'),
  col('requestReason', 'request_reason', 'text'),
  col('employeeId', 'employee_id', 'bigint'),
  col('afterValueEnc', 'after_value_enc', 'text'),
];
const OUT_REVIEW_PERSONNEL_CHANGE_REQUEST: Col[] = [
  col('status', 'personnel_change_request.status', 'varchar'),
  col('reviewedAt', 'personnel_change_request.reviewed_at', 'timestamptz'),
  col('rejectReason', 'personnel_change_request.reject_reason', 'text'),
];
const STAMP_REVIEW_PERSONNEL_CHANGE_REQUEST: Col[] = [
  col('reviewerId', 'reviewer_id', 'bigint'),
  col('reviewedAt', 'reviewed_at', 'timestamptz'),
];

@Controller('api/v1')
export class FnSfr01202Controller {
  /** GET /personnel-change-requests — 인사정보 변경 신청 목록 조회(변경 전후 내용 포함) */
  @Get('/personnel-change-requests')
  async listPersonnelChangeRequests(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자', '임직원');
    const data = checks.queryOf(req.query);
    checks.oneOf(data, 'status', '신청', '승인', '반려');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listPersonnelChangeRequests(data, new Ctx(db, user), () => db.page(T_PERSONNEL_CHANGE_REQUEST, OUT_LIST_PERSONNEL_CHANGE_REQUESTS, FILTER_LIST_PERSONNEL_CHANGE_REQUESTS, data)));
  }

  /** POST /personnel-change-requests — 임직원이 인사정보 변경을 신청 */
  @Post('/personnel-change-requests')
  @HttpCode(200)
  async createPersonnelChangeRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    if (data['employeeId'] == null) {
      data['employeeId'] = user.id;
    }
    checks.required(data, 'changeItem', 'afterValue');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createPersonnelChangeRequest(data, new Ctx(db, user), () => db.insert(T_PERSONNEL_CHANGE_REQUEST, IN_CREATE_PERSONNEL_CHANGE_REQUEST, OUT_CREATE_PERSONNEL_CHANGE_REQUEST, data, { 'status': '신청' }, 'createPersonnelChangeRequest', 'afterValueEnc')));
  }

  /** POST /personnel-change-requests/{personnelChangeRequestId}/review — 인사 담당자가 변경 신청을 승인 또는 반려 */
  @Post('/personnel-change-requests/:personnelChangeRequestId/review')
  @HttpCode(200)
  async reviewPersonnelChangeRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    data['personnelChangeRequestId'] = req.params['personnelChangeRequestId'];
    checks.required(data, 'status');
    checks.oneOf(data, 'status', '신청', '승인', '반려');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.reviewPersonnelChangeRequest(data, new Ctx(db, user), () => db.moveTo(T_PERSONNEL_CHANGE_REQUEST, 'status', { '승인': ['신청'], '반려': ['신청'] }, data['status'], data['personnelChangeRequestId'], OUT_REVIEW_PERSONNEL_CHANGE_REQUEST, STAMP_REVIEW_PERSONNEL_CHANGE_REQUEST, { 'reviewerId': user.id, 'reviewedAt': NOW })));
  }
}
