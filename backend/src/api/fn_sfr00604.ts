// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-006-04 계정별 초기이월 등록 및 마감 */
import { Controller, Delete, Get, HttpCode, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr00604';

const T_ACCOUNT_CARRYOVER = new Table('account_carryover', 'account_carryover_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LIST_ACCOUNT_CARRYOVERS: Col[] = [
  col('accountCarryoverId', 'account_carryover.account_carryover_id', 'bigint'),
  col('fiscalYear', 'account_carryover.fiscal_year', 'integer'),
  col('accountSubjectId', 'account_carryover.account_subject_id', 'bigint'),
  col('partnerId', 'account_carryover.partner_id', 'bigint'),
  col('carryoverAmount', 'account_carryover.carryover_amount', 'numeric'),
  col('closingStatus', 'account_carryover.closing_status', 'varchar'),
];
const FILTER_LIST_ACCOUNT_CARRYOVERS: Col[] = [
  col('fiscalYear', 'account_carryover.fiscal_year', 'integer'),
];
const OUT_CREATE_ACCOUNT_CARRYOVER: Col[] = [
  col('accountCarryoverId', 'account_carryover.account_carryover_id', 'bigint'),
];
const IN_CREATE_ACCOUNT_CARRYOVER: Col[] = [
  col('fiscalYear', 'fiscal_year', 'integer'),
  col('accountSubjectId', 'account_subject_id', 'bigint'),
  col('partnerId', 'partner_id', 'bigint'),
  col('carryoverAmount', 'carryover_amount', 'numeric'),
];
const OUT_UPDATE_ACCOUNT_CARRYOVER: Col[] = [
  col('accountCarryoverId', 'account_carryover.account_carryover_id', 'bigint'),
];
const IN_UPDATE_ACCOUNT_CARRYOVER: Col[] = [
  col('accountSubjectId', 'account_subject_id', 'bigint'),
  col('partnerId', 'partner_id', 'bigint'),
  col('carryoverAmount', 'carryover_amount', 'numeric'),
];
const OUT_DELETE_ACCOUNT_CARRYOVER: Col[] = [];
const OUT_CLOSE_ACCOUNT_CARRYOVER: Col[] = [
  col('closingStatus', 'account_carryover.closing_status', 'varchar'),
];
const OUT_CANCEL_CLOSE_ACCOUNT_CARRYOVER: Col[] = [
  col('closingStatus', 'account_carryover.closing_status', 'varchar'),
];

@Controller('api/v1')
export class FnSfr00604Controller {
  /** GET /account-carryovers — 계정별 이월내역 목록을 조회한다 */
  @Get('/account-carryovers')
  async listAccountCarryovers(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listAccountCarryovers(data, new Ctx(db, user), () => db.page(T_ACCOUNT_CARRYOVER, OUT_LIST_ACCOUNT_CARRYOVERS, FILTER_LIST_ACCOUNT_CARRYOVERS, data)));
  }

  /** POST /account-carryovers — 계정별 이월내역을 등록한다 */
  @Post('/account-carryovers')
  @HttpCode(200)
  async createAccountCarryover(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    checks.required(data, 'fiscalYear', 'accountSubjectId', 'carryoverAmount');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createAccountCarryover(data, new Ctx(db, user), () => db.insert(T_ACCOUNT_CARRYOVER, IN_CREATE_ACCOUNT_CARRYOVER, OUT_CREATE_ACCOUNT_CARRYOVER, data, { 'closing_status': '미마감' })));
  }

  /** PUT /account-carryovers/{accountCarryoverId} — 계정별 이월내역을 수정한다 */
  @Put('/account-carryovers/:accountCarryoverId')
  async updateAccountCarryover(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    data['accountCarryoverId'] = req.params['accountCarryoverId'];
    checks.required(data, 'accountSubjectId', 'carryoverAmount');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.updateAccountCarryover(data, new Ctx(db, user), () => db.update(T_ACCOUNT_CARRYOVER, IN_UPDATE_ACCOUNT_CARRYOVER, OUT_UPDATE_ACCOUNT_CARRYOVER, data['accountCarryoverId'], data)));
  }

  /** DELETE /account-carryovers/{accountCarryoverId} — 계정별 이월내역을 삭제한다 */
  @Delete('/account-carryovers/:accountCarryoverId')
  async deleteAccountCarryover(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.queryOf(req.query);
    data['accountCarryoverId'] = req.params['accountCarryoverId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.deleteAccountCarryover(data, new Ctx(db, user), () => db.delete(T_ACCOUNT_CARRYOVER, data['accountCarryoverId'])));
  }

  /** POST /account-carryovers/{accountCarryoverId}/close — 이월내역을 마감한다 */
  @Post('/account-carryovers/:accountCarryoverId/close')
  @HttpCode(200)
  async closeAccountCarryover(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    data['accountCarryoverId'] = req.params['accountCarryoverId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.closeAccountCarryover(data, new Ctx(db, user), () => db.move(T_ACCOUNT_CARRYOVER, 'closing_status', ['미마감'], '마감', data['accountCarryoverId'], OUT_CLOSE_ACCOUNT_CARRYOVER)));
  }

  /** POST /account-carryovers/{accountCarryoverId}/cancel-close — 이월내역 마감을 취소한다 */
  @Post('/account-carryovers/:accountCarryoverId/cancel-close')
  @HttpCode(200)
  async cancelCloseAccountCarryover(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    data['accountCarryoverId'] = req.params['accountCarryoverId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.cancelCloseAccountCarryover(data, new Ctx(db, user), () => db.move(T_ACCOUNT_CARRYOVER, 'closing_status', ['마감'], '미마감', data['accountCarryoverId'], OUT_CANCEL_CLOSE_ACCOUNT_CARRYOVER)));
  }
}
