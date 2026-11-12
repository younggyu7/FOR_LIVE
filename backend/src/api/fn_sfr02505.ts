// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-025-05 자산실사 처리 및 현황 조회 */
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr02505';

const T_LINK_LOG = new Table('link_log', 'link_log_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ASSET_INSPECTION_ITEM = new Table('asset_inspection_item', 'asset_inspection_item_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LINK_ASSET_INSPECTION_PLAN: Col[] = [
  col('linkStatus', 'link_log.status', 'varchar'),
  col('failureReason', 'link_log.failure_reason', 'text'),
];
const STAMP_LINK_ASSET_INSPECTION_PLAN: Col[] = [
  col('requesterId', 'requester_id', 'bigint'),
  col('linkTarget', 'link_target', 'varchar'),
  col('status', 'status', 'varchar'),
  col('requestedAt', 'requested_at', 'timestamptz'),
];
const OUT_RECEIVE_ASSET_INSPECTION_RESULTS: Col[] = [
  col('assetInspectionItemId', 'asset_inspection_item.asset_inspection_item_id', 'bigint'),
];

@Controller('api/v1')
export class FnSfr02505Controller {
  /** POST /asset-inspection-plans/{assetInspectionPlanId}/link — 승인된 실사계획의 대상을 외부 자산실사 시스템과 연계한다 */
  @Post('/asset-inspection-plans/:assetInspectionPlanId/link')
  @HttpCode(200)
  async linkAssetInspectionPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자산 담당자');
    const data = checks.inputOf(req.body);
    data['assetInspectionPlanId'] = req.params['assetInspectionPlanId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.linkAssetInspectionPlan(data, new Ctx(db, user), () => notImplemented('linkAssetInspectionPlan')));
  }

  /** POST /asset-inspection-items/receive — 외부 자산실사 시스템이 실사 결과를 전송해 저장한다 */
  @Post('/asset-inspection-items/receive')
  @HttpCode(200)
  async receiveAssetInspectionResults(@Req() req: Request) {
    const user = currentUser(req);
    user.requireLogin();
    const data = checks.inputOf(req.body);
    checks.required(data, 'assetInspectionPlanId', 'assetId');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.receiveAssetInspectionResults(data, new Ctx(db, user), () => notImplemented('receiveAssetInspectionResults')));
  }
}
