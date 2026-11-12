import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 인수 대상은 재직자여야 유효하다. 퇴직자에게는 인수인계할 수 없다.
const VALID_TARGET_STATUS = '재직자';

function idOf(value: unknown, label: string): string {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return String(value);
  }
  if (typeof value === 'string' && /^[0-9]+$/.test(value.trim()) && value.trim() !== '0') {
    return value.trim();
  }
  throw new ApiError(400, 'VALIDATION_FAILED', `${label}를 확인해 주세요.`);
}

function textOf(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ApiError(400, 'VALIDATION_FAILED', `${label}을(를) 입력해 주세요.`);
  }
  if (value.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${label}은(는) ${max}자 이하로 입력해 주세요.`);
  }
  return value;
}

@Controller('api/v1')
export class FnSfr03102Controller {
  @Post('/approval-handovers')
  @HttpCode(200)
  async createApprovalHandover(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    const fromId = idOf(data['fromEmployeeId'], '인계자');
    const toId = idOf(data['toEmployeeId'], '인수자');
    const reason = textOf(data['reason'], '인수인계 사유', 500);
    const documentScope = textOf(data['documentScope'], '문서 범위', 1000);

    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT employee_id AS "employeeId", employment_status AS "employmentStatus" FROM employee WHERE employee_id IN (CAST(:fromId AS bigint), CAST(:toId AS bigint))',
        { fromId, toId },
      );
      const from = employees.find((e: any) => String(e.employeeId) === fromId);
      const to = employees.find((e: any) => String(e.employeeId) === toId);
      if (!from || !to) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '인계자 또는 인수자를 찾을 수 없습니다.');
      }
      if (fromId === toId) {
        throw new ApiError(422, 'INVALID_HANDOVER_TARGET', '인계자와 인수자는 서로 달라야 합니다.');
      }
      if (to.employmentStatus !== VALID_TARGET_STATUS) {
        throw new ApiError(422, 'INVALID_HANDOVER_TARGET', '퇴직자에게는 문서를 인수인계할 수 없습니다.');
      }

      const created = await db.query(
        'INSERT INTO approval_handover (from_employee_id, to_employee_id, reason, document_scope, handed_over_at, handled_by_id, created_at, updated_at) VALUES (CAST(:fromId AS bigint), CAST(:toId AS bigint), :reason, :documentScope, now(), CAST(:userId AS bigint), now(), now()) RETURNING approval_handover_id AS "approvalHandoverId"',
        { fromId, toId, reason, documentScope, userId: user.id },
      );
      const approvalHandoverId = created[0].approvalHandoverId;

      // 가정: 문서 범위는 자유 입력 설명이라 조건으로 해석하지 않고, 인계자가 기안한 문서를 이관한다.
      // 결재가 확정된 문서(승인·완료)는 임의로 수정하지 않으므로 이관에서 제외한다.
      const handedOverCount = await db.execute(
        "UPDATE approval_document SET drafter_id = CAST(:toId AS bigint), updated_at = now() WHERE drafter_id = CAST(:fromId AS bigint) AND approval_status NOT IN ('승인', '완료')",
        { fromId, toId },
      );

      const changeContent = `결재문서 인수인계: 인계자 ${fromId} → 인수자 ${toId}, 이관 ${handedOverCount}건, 문서 범위: ${documentScope}`;
      await db.execute(
        "INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, change_reason, created_at, updated_at) VALUES (CAST(:userId AS bigint), 'approval_handover', CAST(:targetId AS bigint), '인수인계', now(), :changeContent, :reason, now(), now())",
        { userId: user.id, targetId: String(approvalHandoverId), changeContent, reason },
      );

      return { approvalHandoverId, handedOverCount };
    });
  }
}
