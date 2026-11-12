import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

@Controller('api/v1')
export class FnSfr03212Controller {
  @Post('/expense-resolutions/:expenseResolutionId/submit')
  @HttpCode(200)
  async submitExpenseResolution(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    void data;
    const idText = req.params['expenseResolutionId'];
    if (!/^\d+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '결의서 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT expense_resolution_id AS "expenseResolutionId",
                requisition_id AS "requisitionId",
                project_id AS "projectId",
                budget_account_id AS "budgetAccountId",
                department_id AS "departmentId",
                resolution_amount AS "resolutionAmount",
                status AS "status"
           FROM expense_resolution
          WHERE expense_resolution_id = CAST(:id AS bigint)
            FOR UPDATE`,
        { id: idText },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'EXPENSE_RESOLUTION_NOT_FOUND', '결의서를 찾을 수 없습니다.');
      }
      const row = rows[0];
      if (row.status !== '기안') {
        throw new ApiError(409, 'EXPENSE_RESOLUTION_INVALID_STATUS', '기안 상태의 결의서만 상신할 수 있습니다.');
      }
      if (
        row.projectId == null ||
        row.budgetAccountId == null ||
        row.departmentId == null ||
        row.resolutionAmount == null
      ) {
        throw new ApiError(422, 'BUDGET_LIMIT_EXCEEDED', '필수 값이 누락되어 상신할 수 없습니다.');
      }
      // 연계 품의서가 있으면 품의 범위 내에서 결의한다 (결정)
      if (row.requisitionId != null) {
        const reqs = await db.query(
          `SELECT requisition_amount AS "requisitionAmount"
             FROM requisition
            WHERE requisition_id = CAST(:reqId AS bigint)`,
          { reqId: String(row.requisitionId) },
        );
        if (reqs.length === 0) {
          throw new ApiError(422, 'BUDGET_LIMIT_EXCEEDED', '연계 품의서를 찾을 수 없습니다.');
        }
        if (Number(row.resolutionAmount) > Number(reqs[0].requisitionAmount)) {
          throw new ApiError(422, 'BUDGET_LIMIT_EXCEEDED', '결의 금액이 품의 금액을 초과했습니다.');
        }
      }
      // 가정: 결재 양식은 사용 중인 양식 중 가장 먼저 등록된 것을 쓴다
      const forms = await db.query(
        `SELECT approval_form_id AS "approvalFormId"
           FROM approval_form
          WHERE use_status = '사용'
          ORDER BY approval_form_id
          LIMIT 1`,
        {},
      );
      if (forms.length === 0) {
        throw new ApiError(422, 'BUDGET_LIMIT_EXCEEDED', '사용 중인 결재 양식이 없어 상신할 수 없습니다.');
      }
      // 가정: 문서번호는 ER-결의서ID-상신시각 으로 채번한다
      const docs = await db.query(
        `INSERT INTO approval_document
           (document_no, approval_form_id, drafter_id, title, approval_status, submitted_at, created_at, updated_at)
         VALUES
           ('ER-' || :id || '-' || to_char(now(), 'YYYYMMDDHH24MISSMS'),
            CAST(:formId AS bigint),
            CAST(:userId AS bigint),
            '지출결의서 ' || :id,
            '결재대기', now(), now(), now())
         RETURNING approval_document_id AS "approvalDocumentId"`,
        { id: idText, formId: String(forms[0].approvalFormId), userId: user.id },
      );
      const updated = await db.query(
        `UPDATE expense_resolution
            SET status = '결재대기',
                approval_document_id = CAST(:docId AS bigint),
                updated_at = now()
          WHERE expense_resolution_id = CAST(:id AS bigint)
            AND status = '기안'
          RETURNING expense_resolution_id AS "expenseResolutionId",
                    approval_document_id AS "approvalDocumentId",
                    status AS "status"`,
        { docId: String(docs[0].approvalDocumentId), id: idText },
      );
      return updated[0];
    });
  }
}
