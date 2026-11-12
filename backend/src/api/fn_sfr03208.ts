// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-032-08 지출품의서 작성 및 결재 연계 */
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr03208';

const T_REQUISITION = new Table('requisition', 'requisition_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_SUBMIT_REQUISITION: Col[] = [
  col('status', 'requisition.status', 'varchar'),
  col('approvalDocumentId', 'requisition.approval_document_id', 'bigint'),
];

@Controller('api/v1')
export class FnSfr03208Controller {
  /** POST /requisitions/{requisitionId}/submit — 품의서를 상신하고 S3 전자결재를 연계한다 */
  @Post('/requisitions/:requisitionId/submit')
  @HttpCode(200)
  async submitRequisition(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    data['requisitionId'] = req.params['requisitionId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.submitRequisition(data, new Ctx(db, user), () => db.move(T_REQUISITION, 'status', ['기안'], '결재대기', data['requisitionId'], OUT_SUBMIT_REQUISITION)));
  }
}
