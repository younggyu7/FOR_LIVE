import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 반려 사유를 저장할 컬럼이 스키마에 없어 사유는 검사만 하고 저장하지 않는다.
// 가정: 반려 알림·변경 이력은 공통 모듈이 맡는다.
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function text(v: unknown): string | null {
  if (v === undefined || v === null) {
    return null;
  }
  const s = String(v).trim();
  return s === '' ? null : s;
}

function intOrNull(v: unknown, name: string): string | null {
  const s = text(v);
  if (s === null) {
    return null;
  }
  if (!/^-?\d+$/.test(s)) {
    throw new ApiError(400, 'VALIDATION_FAILED', name + ' 값이 올바르지 않습니다.');
  }
  return s;
}

@Controller('api/v1')
export class FnSfr02402Controller {
  @Get('/requisitions')
  async listRequisitions(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자', '시스템 관리자');
    const q = checks.queryOf(req.query);
    const projectId = intOrNull(q['projectId'], '프로젝트');
    const budgetAccountId = intOrNull(q['budgetAccountId'], '예산과목');
    const createdFrom = text(q['createdFrom']);
    const createdTo = text(q['createdTo']);
    const status = text(q['status']);
    const pageRaw = text(q['page']);
    const sizeRaw = text(q['size']);
    const page = pageRaw === null ? 0 : Number(pageRaw);
    let size = sizeRaw === null ? DEFAULT_SIZE : Number(sizeRaw);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 크기가 올바르지 않습니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    const params = {
      projectId,
      budgetAccountId,
      createdFrom,
      createdTo,
      status,
      limit: size,
      offset: page * size,
    };
    const where = `WHERE (CAST(:projectId AS bigint) IS NULL OR project_id = CAST(:projectId AS bigint))
      AND (CAST(:budgetAccountId AS bigint) IS NULL OR budget_account_id = CAST(:budgetAccountId AS bigint))
      AND (CAST(:createdFrom AS date) IS NULL OR created_at >= CAST(:createdFrom AS date))
      AND (CAST(:createdTo AS date) IS NULL OR created_at < CAST(:createdTo AS date) + 1)
      AND (CAST(:status AS varchar) IS NULL OR status = CAST(:status AS varchar))`;
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT requisition_id AS "requisitionId",
          project_id AS "projectId",
          budget_account_id AS "budgetAccountId",
          title AS "title",
          requisition_amount AS "requisitionAmount",
          status AS "status",
          created_at AS "createdAt"
        FROM requisition
        ${where}
        ORDER BY requisition_id DESC
        LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)`,
        params,
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total" FROM requisition ${where}`,
        {
          projectId,
          budgetAccountId,
          createdFrom,
          createdTo,
          status,
        },
      );
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }

  @Post('/requisitions/:requisitionId/reject')
  @HttpCode(200)
  async rejectRequisition(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자', '시스템 관리자');
    const data = checks.inputOf(req.body);
    const requisitionId = req.params['requisitionId'];
    if (!/^\d+$/.test(requisitionId)) {
      throw new ApiError(404, 'REQUISITION_NOT_FOUND', '구매품의를 찾을 수 없습니다.');
    }
    const reason = text(data['rejectReason']);
    return transaction(async (db) => {
      const rows = await db.query(
        'SELECT status AS "status" FROM requisition WHERE requisition_id = CAST(:requisitionId AS bigint)',
        { requisitionId },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'REQUISITION_NOT_FOUND', '구매품의를 찾을 수 없습니다.');
      }
      if (rows[0]['status'] !== '결재대기') {
        throw new ApiError(409, 'REQUISITION_STATUS_MISMATCH', '결재대기 상태의 구매품의만 반려할 수 있습니다.');
      }
      if (reason === null) {
        throw new ApiError(422, 'REJECT_REASON_REQUIRED', '반려 사유를 입력해 주세요.');
      }
      const updated = await db.query(
        `UPDATE requisition
        SET status = '반려', updated_at = now()
        WHERE requisition_id = CAST(:requisitionId AS bigint) AND status = '결재대기'
        RETURNING status AS "status"`,
        { requisitionId },
      );
      if (updated.length === 0) {
        throw new ApiError(409, 'REQUISITION_STATUS_MISMATCH', '결재대기 상태의 구매품의만 반려할 수 있습니다.');
      }
      return { status: updated[0]['status'] };
    });
  }
}
