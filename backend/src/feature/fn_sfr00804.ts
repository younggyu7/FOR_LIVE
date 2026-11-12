import { Controller, HttpCode, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 변경 이력의 대상 유형 고정값
const HISTORY_TARGET_TYPE = 'tax_invoice';
// 가정: 변경 이력의 변경 구분 값
const HISTORY_CHANGE_TYPE = '일괄 변경';
const ISSUE_STATUSES = ['NOT_ISSUED', 'ISSUED'];

@Controller('api/v1')
export class FnSfr00804Controller {
  @Patch('/tax-invoices/issue-status')
  async updateTaxInvoiceIssueStatuses(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    const rawIds = data['taxInvoiceIds'];
    if (!Array.isArray(rawIds)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '세금계산서 ID 목록 형식이 올바르지 않습니다.');
    }
    if (rawIds.length === 0) {
      throw new ApiError(422, 'TAX_INVOICE_NOT_SELECTED', '변경할 세금계산서를 선택해 주세요.');
    }
    const ids: string[] = [];
    for (const raw of rawIds) {
      const text = typeof raw === 'number' || typeof raw === 'string' ? String(raw) : '';
      if (!/^[0-9]+$/.test(text)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '세금계산서 ID는 숫자여야 합니다.');
      }
      if (!ids.includes(text)) {
        ids.push(text);
      }
    }
    const issueStatus = data['issueStatus'];
    if (typeof issueStatus !== 'string' || !ISSUE_STATUSES.includes(issueStatus)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '발행 여부는 NOT_ISSUED 또는 ISSUED여야 합니다.');
    }
    return transaction(async (db) => {
      const results: Record<string, unknown>[] = [];
      for (const id of ids) {
        const rows = await db.query(
          'SELECT tax_invoice_id AS "taxInvoiceId", issue_status AS "issueStatus", journal_status AS "journalStatus" '
            + 'FROM tax_invoice WHERE tax_invoice_id = CAST(:id AS bigint) FOR UPDATE',
          { id },
        );
        if (rows.length === 0) {
          results.push({
            taxInvoiceId: Number(id),
            success: false,
            code: 'TAX_INVOICE_NOT_FOUND',
            message: '대상 세금계산서가 존재하지 않습니다.',
          });
          continue;
        }
        const current = rows[0];
        if (current.journalStatus === 'PROCESSED') {
          results.push({
            taxInvoiceId: Number(id),
            success: false,
            code: 'TAX_INVOICE_ALREADY_PROCESSED',
            message: '전표처리 완료된 건이라 변경할 수 없습니다.',
          });
          continue;
        }
        await db.execute(
          'UPDATE tax_invoice SET issue_status = :issueStatus, updated_at = now() '
            + 'WHERE tax_invoice_id = CAST(:id AS bigint)',
          { id, issueStatus },
        );
        // 가정: 변경 내용은 발행 여부의 변경 전후 값
        const content = '발행 여부: ' + String(current.issueStatus) + ' -> ' + issueStatus;
        await db.execute(
          'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) '
            + 'VALUES (CAST(:userId AS bigint), :targetType, CAST(:id AS bigint), :changeType, now(), :content, now(), now())',
          {
            userId: user.id,
            targetType: HISTORY_TARGET_TYPE,
            id,
            changeType: HISTORY_CHANGE_TYPE,
            content,
          },
        );
        results.push({
          taxInvoiceId: Number(id),
          success: true,
          issueStatus,
          message: '변경했습니다.',
        });
      }
      return { results };
    });
  }
}
