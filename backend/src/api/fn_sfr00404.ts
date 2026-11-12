// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-004-04 원인행위 등록 및 관리 */
import { Controller, Get, HttpCode, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr00404';

const T_BUDGET_COMMITMENT = new Table('budget_commitment', 'budget_commitment_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_CREATE_BUDGET_COMMITMENT: Col[] = [
  col('budgetCommitmentId', 'budget_commitment.budget_commitment_id', 'bigint'),
  col('approvalStatus', 'budget_commitment.approval_status', 'varchar'),
];
const IN_CREATE_BUDGET_COMMITMENT: Col[] = [
  col('name', 'name', 'varchar'),
  col('projectId', 'project_id', 'bigint'),
  col('budgetAccountId', 'budget_account_id', 'bigint'),
  col('partnerId', 'partner_id', 'bigint'),
  col('amount', 'amount', 'numeric'),
];
const OUT_LIST_BUDGET_COMMITMENTS: Col[] = [
  col('budgetCommitmentId', 'budget_commitment.budget_commitment_id', 'bigint'),
  col('name', 'budget_commitment.name', 'varchar'),
  col('projectId', 'budget_commitment.project_id', 'bigint'),
  col('budgetAccountId', 'budget_commitment.budget_account_id', 'bigint'),
  col('partnerId', 'budget_commitment.partner_id', 'bigint'),
  col('amount', 'budget_commitment.amount', 'numeric'),
  col('approvalStatus', 'budget_commitment.approval_status', 'varchar'),
];
const FILTER_LIST_BUDGET_COMMITMENTS: Col[] = [
  col('projectId', 'budget_commitment.project_id', 'bigint'),
  col('budgetAccountId', 'budget_commitment.budget_account_id', 'bigint'),
];
const OUT_UPDATE_BUDGET_COMMITMENT: Col[] = [
  col('budgetCommitmentId', 'budget_commitment.budget_commitment_id', 'bigint'),
];
const IN_UPDATE_BUDGET_COMMITMENT: Col[] = [
  col('name', 'name', 'varchar'),
  col('projectId', 'project_id', 'bigint'),
  col('budgetAccountId', 'budget_account_id', 'bigint'),
  col('partnerId', 'partner_id', 'bigint'),
  col('amount', 'amount', 'numeric'),
];
const OUT_CANCEL_BUDGET_COMMITMENT: Col[] = [
  col('approvalStatus', 'budget_commitment.approval_status', 'varchar'),
];

@Controller('api/v1')
export class FnSfr00404Controller {
  /** POST /budget-commitments — 원인행위를 등록한다 */
  @Post('/budget-commitments')
  @HttpCode(200)
  async createBudgetCommitment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    checks.required(data, 'name', 'projectId', 'budgetAccountId', 'amount');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createBudgetCommitment(data, new Ctx(db, user), () => db.insert(T_BUDGET_COMMITMENT, IN_CREATE_BUDGET_COMMITMENT, OUT_CREATE_BUDGET_COMMITMENT, data, { 'approval_status': '신청' })));
  }

  /** GET /budget-commitments — 원인행위 목록을 조회한다 */
  @Get('/budget-commitments')
  async listBudgetCommitments(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listBudgetCommitments(data, new Ctx(db, user), () => db.page(T_BUDGET_COMMITMENT, OUT_LIST_BUDGET_COMMITMENTS, FILTER_LIST_BUDGET_COMMITMENTS, data)));
  }

  /** PUT /budget-commitments/{budgetCommitmentId} — 원인행위를 수정한다 */
  @Put('/budget-commitments/:budgetCommitmentId')
  async updateBudgetCommitment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    data['budgetCommitmentId'] = req.params['budgetCommitmentId'];
    checks.required(data, 'name', 'projectId', 'budgetAccountId', 'amount');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.updateBudgetCommitment(data, new Ctx(db, user), () => db.update(T_BUDGET_COMMITMENT, IN_UPDATE_BUDGET_COMMITMENT, OUT_UPDATE_BUDGET_COMMITMENT, data['budgetCommitmentId'], data)));
  }

  /** POST /budget-commitments/{budgetCommitmentId}/cancel — 원인행위를 취소한다 */
  @Post('/budget-commitments/:budgetCommitmentId/cancel')
  @HttpCode(200)
  async cancelBudgetCommitment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    data['budgetCommitmentId'] = req.params['budgetCommitmentId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.cancelBudgetCommitment(data, new Ctx(db, user), () => db.set(T_BUDGET_COMMITMENT, 'approval_status', '승인 취소', data['budgetCommitmentId'], OUT_CANCEL_BUDGET_COMMITMENT)));
  }
}
