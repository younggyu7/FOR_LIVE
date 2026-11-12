import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';

async function changeStatus(budgetMainId: string, from: string, to: string, conflictMessage: string) {
  if (!/^[0-9]+$/.test(budgetMainId)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '본예산 ID가 올바르지 않습니다.');
  }
  return transaction(async (db) => {
    const found = await db.query(
      `SELECT approval_status AS "approvalStatus"
         FROM budget_main
        WHERE budget_main_id = CAST(:id AS bigint)
          FOR UPDATE`,
      { id: budgetMainId },
    );
    if (found.length === 0) {
      throw new ApiError(404, 'BUDGET_MAIN_NOT_FOUND', '본예산을 찾을 수 없습니다.');
    }
    if (found[0].approvalStatus !== from) {
      throw new ApiError(409, 'BUDGET_MAIN_STATUS_CONFLICT', conflictMessage);
    }
    const rows = await db.query(
      `UPDATE budget_main
          SET approval_status = :toStatus,
              updated_at = now()
        WHERE budget_main_id = CAST(:id AS bigint)
        RETURNING approval_status AS "approvalStatus"`,
      { id: budgetMainId, toStatus: to },
    );
    return { approvalStatus: rows[0].approvalStatus };
  });
}

@Controller('api/v1')
export class FnSfr00302Controller {
  @Post('/budget-mains/:budgetMainId/close')
  @HttpCode(200)
  async closeBudgetMain(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    return changeStatus(req.params['budgetMainId'], '신청', '마감', '신청 상태의 본예산만 마감할 수 있습니다.');
  }

  @Post('/budget-mains/:budgetMainId/cancel-close')
  @HttpCode(200)
  async cancelCloseBudgetMain(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    return changeStatus(req.params['budgetMainId'], '마감', '마감 취소', '마감 상태의 본예산만 마감 취소할 수 있습니다.');
  }

  @Post('/budget-mains/:budgetMainId/approve')
  @HttpCode(200)
  async approveBudgetMain(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    return changeStatus(req.params['budgetMainId'], '마감', '승인', '마감 상태의 본예산만 승인할 수 있습니다.');
  }

  @Post('/budget-mains/:budgetMainId/cancel-approval')
  @HttpCode(200)
  async cancelApprovalBudgetMain(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    return changeStatus(req.params['budgetMainId'], '승인', '승인 취소', '승인 상태의 본예산만 승인 취소할 수 있습니다.');
  }
}
