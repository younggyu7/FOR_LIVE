import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 미사용 연차 수당의 1일 단가. 입력 스펙에 단가·통상임금의 출처가 없어 0으로 두고 설정으로 바꾼다.
const DAILY_ALLOWANCE_RATE = 0;

@Controller('api/v1')
export class FnSfr01903Controller {
  @Post('/annual-leaves/:annualLeaveId/adjust')
  @HttpCode(200)
  async adjustAnnualLeave(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.inputOf(req.body);
    const idText = req.params['annualLeaveId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연차 ID 형식이 올바르지 않습니다.');
    }
    const rawDays = data['adjustDays'];
    const days = typeof rawDays === 'number' ? rawDays : typeof rawDays === 'string' && rawDays.trim() !== '' ? Number(rawDays) : NaN;
    if (!Number.isFinite(days)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조정 일수는 숫자로 입력해 주세요.');
    }
    const reason = typeof data['changeReason'] === 'string' ? data['changeReason'].trim() : '';
    if (reason === '' || reason.length > 500) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조정 사유를 500자 이내로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT annual_leave_id AS "annualLeaveId",
                is_confirmed AS "isConfirmed",
                COALESCE(remaining_days, 0) AS "beforeDays",
                COALESCE(remaining_days, 0) + CAST(:days AS numeric) AS "afterDays"
           FROM annual_leave
          WHERE annual_leave_id = CAST(:id AS bigint)
            FOR UPDATE`,
        { id: idText, days: String(days) },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'ANNUAL_LEAVE_NOT_FOUND', '연차를 찾을 수 없습니다.');
      }
      const row = rows[0];
      if (row.isConfirmed !== true) {
        throw new ApiError(409, 'INVALID_STATE', '확정된 연차만 조정할 수 있습니다.');
      }
      if (Number(row.afterDays) < 0) {
        throw new ApiError(422, 'REMAINING_DAYS_NEGATIVE', '조정 후 잔여 일수가 음수가 되어 조정할 수 없습니다.');
      }
      await db.execute(
        `UPDATE annual_leave
            SET remaining_days = CAST(:after AS numeric),
                updated_at = now()
          WHERE annual_leave_id = CAST(:id AS bigint)`,
        { id: idText, after: String(row.afterDays) },
      );
      const content = `잔여일수 ${row.beforeDays}일 -> ${row.afterDays}일 (조정 ${days}일)`;
      await db.execute(
        `INSERT INTO change_history
           (changer_id, target_type, target_id, changed_at, change_content, change_reason, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), 'annual_leave', CAST(:id AS bigint), now(), :content, :reason, now(), now())`,
        { userId: user.id, id: idText, content, reason },
      );
      return { remainingDays: Number(row.afterDays) };
    });
  }

  @Post('/annual-leave-settlements')
  @HttpCode(200)
  async createAnnualLeaveSettlement(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const data = checks.inputOf(req.body);
    const rawId = data['annualLeaveId'];
    const idText = String(rawId ?? '').trim();
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연차를 선택해 주세요.');
    }
    const baseDate = typeof data['settlementBaseDate'] === 'string' ? data['settlementBaseDate'].trim() : '';
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(baseDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '정산기준일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const leaves = await db.query(
        `SELECT is_confirmed AS "isConfirmed"
           FROM annual_leave
          WHERE annual_leave_id = CAST(:id AS bigint)
            FOR UPDATE`,
        { id: idText },
      );
      if (leaves.length === 0) {
        throw new ApiError(404, 'ANNUAL_LEAVE_NOT_FOUND', '연차를 찾을 수 없습니다.');
      }
      if (leaves[0].isConfirmed !== true) {
        throw new ApiError(409, 'INVALID_STATE', '확정된 연차만 정산할 수 있습니다.');
      }
      const dup = await db.query(
        `SELECT annual_leave_settlement_id AS "annualLeaveSettlementId"
           FROM annual_leave_settlement
          WHERE annual_leave_id = CAST(:id AS bigint)
            AND settlement_base_date = CAST(:baseDate AS date)`,
        { id: idText, baseDate },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'SETTLEMENT_ALREADY_EXISTS', '이미 정산된 연차입니다.');
      }
      // 가정: 미사용 일수는 잔여일수(음수면 0), 수당은 미사용 일수 x 1일 단가.
      const rows = await db.query(
        `INSERT INTO annual_leave_settlement
           (annual_leave_id, settlement_base_date, unused_days, unused_allowance, settled_at, created_at, updated_at)
         SELECT a.annual_leave_id,
                CAST(:baseDate AS date),
                GREATEST(COALESCE(a.remaining_days, 0), 0),
                GREATEST(COALESCE(a.remaining_days, 0), 0) * CAST(:rate AS numeric),
                now(), now(), now()
           FROM annual_leave a
          WHERE a.annual_leave_id = CAST(:id AS bigint)
         RETURNING annual_leave_settlement_id AS "annualLeaveSettlementId",
                   unused_days AS "unusedDays",
                   unused_allowance AS "unusedAllowance"`,
        { id: idText, baseDate, rate: String(DAILY_ALLOWANCE_RATE) },
      );
      return {
        annualLeaveSettlementId: Number(rows[0].annualLeaveSettlementId),
        unusedDays: Number(rows[0].unusedDays),
        unusedAllowance: Number(rows[0].unusedAllowance),
      };
    });
  }
}
