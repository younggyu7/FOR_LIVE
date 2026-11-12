import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 숫자 ID 검사: 양의 정수만 허용하고 문자열로 돌려준다.
function idOf(value: unknown, label: string): string {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return String(value);
  }
  if (typeof value === 'string' && /^[0-9]+$/.test(value.trim()) && value.trim() !== '0') {
    return value.trim();
  }
  throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
}

@Controller('api/v1')
export class FnSfr00407Controller {
  @Post('/account-transfer-resolutions')
  @HttpCode(200)
  async createAccountTransferResolution(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    const expenseResolutionId = idOf(data['expenseResolutionId'], '원 결의서');
    const partnerAccountId = idOf(data['partnerAccountId'], '대체 거래처 계좌');
    const rawReason = data['transferReason'];
    if (rawReason !== undefined && rawReason !== null && typeof rawReason !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '대체 사유 형식이 올바르지 않습니다.');
    }
    const transferReason = typeof rawReason === 'string' ? rawReason.trim() : '';
    if (transferReason === '') {
      throw new ApiError(422, 'TRANSFER_REASON_REQUIRED', '대체 사유를 입력해 주세요.');
    }
    return transaction(async (db) => {
      const resolutions = await db.query(
        'SELECT expense_resolution_id AS "expenseResolutionId" FROM expense_resolution WHERE expense_resolution_id = CAST(:expenseResolutionId AS bigint)',
        { expenseResolutionId },
      );
      if (resolutions.length === 0) {
        throw new ApiError(404, 'EXPENSE_RESOLUTION_NOT_FOUND', '원 결의서를 찾을 수 없습니다.');
      }
      const accounts = await db.query(
        'SELECT partner_account_id AS "partnerAccountId", use_status AS "useStatus" FROM partner_account WHERE partner_account_id = CAST(:partnerAccountId AS bigint)',
        { partnerAccountId },
      );
      if (accounts.length === 0) {
        throw new ApiError(404, 'PARTNER_ACCOUNT_NOT_FOUND', '대체 계좌를 찾을 수 없습니다.');
      }
      if (accounts[0]['useStatus'] !== '사용') {
        throw new ApiError(400, 'VALIDATION_FAILED', '미사용 계좌는 대체 계좌로 선택할 수 없습니다.');
      }
      const rows = await db.query(
        'INSERT INTO account_transfer_resolution (expense_resolution_id, partner_account_id, transfer_reason, processor_id, processed_at, created_at, updated_at) ' +
          'VALUES (CAST(:expenseResolutionId AS bigint), CAST(:partnerAccountId AS bigint), :transferReason, CAST(:userId AS bigint), now(), now(), now()) ' +
          'RETURNING account_transfer_resolution_id AS "accountTransferResolutionId", processed_at AS "processedAt"',
        { expenseResolutionId, partnerAccountId, transferReason, userId: user.id },
      );
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, change_reason, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), :changeType, now(), :changeContent, :changeReason, now(), now())',
        {
          userId: user.id,
          targetType: 'expense_resolution',
          targetId: expenseResolutionId,
          changeType: '계좌 대체',
          changeContent: '은행계좌 대체: 거래처 계좌 ID ' + partnerAccountId + '(으)로 대체',
          changeReason: transferReason.slice(0, 500),
        },
      );
      return rows[0];
    });
  }
}
