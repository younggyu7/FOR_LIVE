// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-032-07 개인 연말정산 자료 입력 및 관리 */
import { Controller, Get, HttpCode, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr03207';

const T_YEAR_END_DATA = new Table('year_end_data', 'year_end_data_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LIST_YEAR_END_DATA: Col[] = [
  col('yearEndDataId', 'year_end_data.year_end_data_id', 'bigint'),
  col('yearEndItemId', 'year_end_data.year_end_item_id', 'bigint'),
  col('targetYear', 'year_end_data.target_year', 'integer'),
  col('amount', 'year_end_data.amount', 'numeric'),
  col('closingStatus', 'year_end_data.closing_status', 'varchar'),
  col('attachmentId', 'year_end_data.attachment_id', 'bigint'),
  col('remark', 'year_end_data.remark', 'varchar'),
];
const FILTER_LIST_YEAR_END_DATA: Col[] = [
  col('targetYear', 'year_end_data.target_year', 'integer'),
];
const OUT_UPDATE_YEAR_END_DATA2: Col[] = [
  col('yearEndDataId', 'year_end_data.year_end_data_id', 'bigint'),
  col('closingStatus', 'year_end_data.closing_status', 'varchar'),
];
const IN_UPDATE_YEAR_END_DATA2: Col[] = [
  col('amount', 'amount', 'numeric'),
  col('attachmentId', 'attachment_id', 'bigint'),
  col('remark', 'remark', 'varchar'),
];
const OUT_SUBMIT_YEAR_END_DATA: Col[] = [
  col('closingStatus', 'year_end_data.closing_status', 'varchar'),
];
const STAMP_SUBMIT_YEAR_END_DATA: Col[] = [
  col('closingStatus', 'closing_status', 'varchar'),
];

@Controller('api/v1')
export class FnSfr03207Controller {
  /** GET /year-end-data — 본인의 연말정산 자료를 조회한다 */
  @Get('/year-end-data')
  async listYearEndData(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listYearEndData(data, new Ctx(db, user), () => db.page(T_YEAR_END_DATA, OUT_LIST_YEAR_END_DATA, FILTER_LIST_YEAR_END_DATA, data)));
  }

  /** PATCH /year-end-data/{yearEndDataId} — 본인의 연말정산 자료를 수정한다 */
  @Patch('/year-end-data/:yearEndDataId')
  async updateYearEndData2(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    data['yearEndDataId'] = req.params['yearEndDataId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.updateYearEndData2(data, new Ctx(db, user), () => db.update(T_YEAR_END_DATA, IN_UPDATE_YEAR_END_DATA2, OUT_UPDATE_YEAR_END_DATA2, data['yearEndDataId'], data)));
  }

  /** POST /year-end-data/{yearEndDataId}/submit — 연말정산 자료를 제출한다 */
  @Post('/year-end-data/:yearEndDataId/submit')
  @HttpCode(200)
  async submitYearEndData(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    data['yearEndDataId'] = req.params['yearEndDataId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.submitYearEndData(data, new Ctx(db, user), () => notImplemented('submitYearEndData')));
  }
}
