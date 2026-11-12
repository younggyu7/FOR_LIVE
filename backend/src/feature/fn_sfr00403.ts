import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const STATUSES = ['기안', '결재대기', '승인', '보류', '반려', '회수', '재기안', '완료'];

@Controller('api/v1')
export class FnSfr00403Controller {
  @Get('/approval-items')
  async listApprovalItems(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자', '임직원');
    const query = checks.queryOf(req.query);
    const page = query['page'] ? Number(query['page']) : 0;
    const sizeRaw = query['size'] ? Number(query['size']) : 20;
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 크기가 올바르지 않습니다.');
    }
    const size = Math.min(sizeRaw, 200);
    const projectId = query['projectId'] ? String(query['projectId']) : null;
    if (projectId !== null && !/^[0-9]+$/.test(projectId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '프로젝트 값이 올바르지 않습니다.');
    }
    const status = query['status'] ? String(query['status']) : null;
    if (status !== null && !STATUSES.includes(status)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '진행 상태 값이 올바르지 않습니다.');
    }
    const fromDate = query['fromDate'] ? String(query['fromDate']) : null;
    const toDate = query['toDate'] ? String(query['toDate']) : null;
    return transaction(async (db) => {
      const where = `
        (CAST(:fromDate AS date) IS NULL OR er.created_at >= CAST(:fromDate AS date))
        AND (CAST(:toDate AS date) IS NULL OR er.created_at < CAST(:toDate AS date) + 1)
        AND (CAST(:projectId AS bigint) IS NULL OR er.project_id = CAST(:projectId AS bigint))
        AND (CAST(:status AS varchar) IS NULL OR er.status = CAST(:status AS varchar))
      `;
      const filterParams = { fromDate, toDate, projectId, status };
      const items = await db.query(
        `SELECT er.expense_resolution_id AS "expenseResolutionId",
                er.requisition_id AS "requisitionId",
                er.project_id AS "projectId",
                er.status AS "status"
           FROM expense_resolution er
          WHERE ${where}
          ORDER BY er.expense_resolution_id DESC
          LIMIT :limit OFFSET :offset`,
        { ...filterParams, limit: size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM expense_resolution er WHERE ${where}`,
        filterParams,
      );
      const total = Number(counts[0]['total']);
      return { items, page, size, total };
    });
  }

  @Post('/expense-resolutions/:expenseResolutionId/approve')
  @HttpCode(200)
  async approveExpenseResolution(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자', '임직원');
    const id = req.params['expenseResolutionId'];
    if (!/^[0-9]+$/.test(id)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결의서 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT status AS "status" FROM expense_resolution WHERE expense_resolution_id = CAST(:id AS bigint)`,
        { id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'EXPENSE_RESOLUTION_NOT_FOUND', '결의서를 찾을 수 없습니다.');
      }
      if (rows[0]['status'] !== '결재대기') {
        throw new ApiError(409, 'APPROVAL_NOT_ALLOWED_STATUS', '결재대기 상태의 결의서만 승인할 수 있습니다.');
      }
      const changed = await db.execute(
        `UPDATE expense_resolution
            SET status = '승인', updated_at = now()
          WHERE expense_resolution_id = CAST(:id AS bigint) AND status = '결재대기'`,
        { id },
      );
      if (changed === 0) {
        throw new ApiError(409, 'APPROVAL_NOT_ALLOWED_STATUS', '결재대기 상태의 결의서만 승인할 수 있습니다.');
      }
      await db.execute(
        `INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), 'expense_resolution', CAST(:id AS bigint), '승인', now(), :content, now(), now())`,
        { userId: user.id, id, content: '상태 변경: 결재대기 → 승인' },
      );
      return { status: '승인' };
    });
  }

  @Post('/requisitions/:requisitionId/approve')
  @HttpCode(200)
  async approveRequisition(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자', '임직원');
    const id = req.params['requisitionId'];
    if (!/^[0-9]+$/.test(id)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '품의서 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT status AS "status" FROM requisition WHERE requisition_id = CAST(:id AS bigint)`,
        { id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'REQUISITION_NOT_FOUND', '품의서를 찾을 수 없습니다.');
      }
      if (rows[0]['status'] !== '결재대기') {
        throw new ApiError(409, 'APPROVAL_NOT_ALLOWED_STATUS', '결재대기 상태의 품의서만 승인할 수 있습니다.');
      }
      const changed = await db.execute(
        `UPDATE requisition
            SET status = '승인', updated_at = now()
          WHERE requisition_id = CAST(:id AS bigint) AND status = '결재대기'`,
        { id },
      );
      if (changed === 0) {
        throw new ApiError(409, 'APPROVAL_NOT_ALLOWED_STATUS', '결재대기 상태의 품의서만 승인할 수 있습니다.');
      }
      return { status: '승인' };
    });
  }
}
