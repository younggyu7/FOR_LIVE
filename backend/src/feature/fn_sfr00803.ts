import { Controller, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 과세 세액은 공급가액의 10%이며 반올림 오차 1원까지 허용한다.
const TAX_RATE = 0.1;
const TAX_TOLERANCE = 1;

interface InvoiceRow {
  taxInvoiceId: number;
  partnerId: number | null;
  expenseResolutionId: number | null;
  direction: string | null;
  taxType: string | null;
  issueDate: string | null;
  supplyAmount: number | null;
  taxAmount: number | null;
  approvalNumber: string | null;
  journalStatus: string;
  partnerFound: boolean;
}

const INVOICE_SQL = `SELECT t.tax_invoice_id AS "taxInvoiceId",
  t.partner_id AS "partnerId",
  t.expense_resolution_id AS "expenseResolutionId",
  t.direction AS "direction",
  t.tax_type AS "taxType",
  CAST(t.issue_date AS text) AS "issueDate",
  t.supply_amount AS "supplyAmount",
  t.tax_amount AS "taxAmount",
  t.approval_number AS "approvalNumber",
  t.journal_status AS "journalStatus",
  (p.partner_id IS NOT NULL) AS "partnerFound"
FROM tax_invoice t
LEFT JOIN partner p ON p.partner_id = t.partner_id
WHERE t.tax_invoice_id = CAST(:id AS bigint)`;

function idsOf(data: Record<string, unknown>): number[] {
  const raw = data['taxInvoiceIds'];
  if (raw === undefined || raw === null) {
    throw new ApiError(422, 'TAX_INVOICE_NOT_SELECTED', '대상 세금계산서를 선택해 주세요.');
  }
  if (!Array.isArray(raw)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '세금계산서 ID 목록 형식이 올바르지 않습니다.');
  }
  if (raw.length === 0) {
    throw new ApiError(422, 'TAX_INVOICE_NOT_SELECTED', '대상 세금계산서를 선택해 주세요.');
  }
  const ids: number[] = [];
  for (const v of raw) {
    const n = typeof v === 'number' ? v : Number(v);
    if (typeof v === 'boolean' || v === null || v === '' || !Number.isInteger(n) || n <= 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '세금계산서 ID는 양의 정수여야 합니다.');
    }
    if (!ids.includes(n)) {
      ids.push(n);
    }
  }
  return ids;
}

// 검증 항목: 필수 항목과 금액 정합성 (결정)
function problemsOf(row: InvoiceRow): string[] {
  const problems: string[] = [];
  if (!row.partnerFound) {
    problems.push('거래처가 없습니다.');
  }
  if (!row.direction) {
    problems.push('발행/수취 구분이 없습니다.');
  }
  if (!row.taxType) {
    problems.push('과세·면세 구분이 없습니다.');
  }
  if (!row.issueDate) {
    problems.push('작성일자가 없습니다.');
  }
  if (!row.approvalNumber) {
    problems.push('국세청 승인번호가 없습니다.');
  }
  const supply = Number(row.supplyAmount);
  const tax = Number(row.taxAmount);
  if (row.supplyAmount === null || !Number.isFinite(supply) || supply < 0) {
    problems.push('공급가액이 올바르지 않습니다.');
  } else if (row.taxAmount === null || !Number.isFinite(tax) || tax < 0) {
    problems.push('세액이 올바르지 않습니다.');
  } else if (row.taxType === 'EXEMPT' && tax !== 0) {
    problems.push('면세 세금계산서의 세액은 0이어야 합니다.');
  } else if (row.taxType === 'TAXABLE' && Math.abs(tax - Math.round(supply * TAX_RATE)) > TAX_TOLERANCE) {
    problems.push('세액이 공급가액의 10%와 맞지 않습니다.');
  }
  // 전표는 결의서가 있어야 만들 수 있다.
  if (row.expenseResolutionId === null) {
    problems.push('연결된 결의서가 없어 전표를 만들 수 없습니다.');
  }
  return problems;
}

@Controller('api/v1')
export class FnSfr00803Controller {
  @Post('/tax-invoices/validate')
  @HttpCode(200)
  async validateTaxInvoices(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    const ids = idsOf(data);
    return transaction(async (db) => {
      const results: Record<string, unknown>[] = [];
      for (const id of ids) {
        const rows = (await db.query(INVOICE_SQL, { id })) as InvoiceRow[];
        if (rows.length === 0) {
          throw new ApiError(404, 'TAX_INVOICE_NOT_FOUND', '세금계산서를 찾을 수 없습니다.');
        }
        const problems = problemsOf(rows[0]);
        results.push({
          taxInvoiceId: id,
          valid: problems.length === 0,
          errors: problems,
        });
      }
      return { results };
    });
  }

  @Post('/tax-invoices/create-journal-entries')
  @HttpCode(200)
  async createJournalEntriesFromTaxInvoices(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    const ids = idsOf(data);
    return transaction(async (db) => {
      const results: Record<string, unknown>[] = [];
      for (const id of ids) {
        const rows = (await db.query(INVOICE_SQL, { id })) as InvoiceRow[];
        if (rows.length === 0) {
          throw new ApiError(404, 'TAX_INVOICE_NOT_FOUND', '세금계산서를 찾을 수 없습니다.');
        }
        const row = rows[0];
        if (row.journalStatus !== 'UNPROCESSED') {
          throw new ApiError(409, 'TAX_INVOICE_ALREADY_PROCESSED', '이미 전표처리된 세금계산서입니다.');
        }
        const problems = problemsOf(row);
        if (problems.length > 0) {
          throw new ApiError(422, 'TAX_INVOICE_VALIDATION_FAILED', '검증 오류가 있어 전표처리할 수 없습니다: ' + problems.join(' '));
        }
        const total = Number(row.supplyAmount) + Number(row.taxAmount);
        const created = (await db.query(
          `INSERT INTO journal_entry (expense_resolution_id, entry_date, status, total_debit_amount, total_credit_amount, summary, created_at, updated_at)
           VALUES (CAST(:resolutionId AS bigint), CAST(:entryDate AS date), '신청', CAST(:total AS numeric), CAST(:total AS numeric), :summary, now(), now())
           RETURNING journal_entry_id AS "journalEntryId"`,
          {
            resolutionId: row.expenseResolutionId,
            entryDate: row.issueDate,
            total: total,
            summary: '전자세금계산서 전표처리 ' + (row.approvalNumber ?? ''),
          },
        )) as { journalEntryId: number }[];
        const journalEntryId = created[0].journalEntryId;
        const changed = await db.execute(
          `UPDATE tax_invoice
           SET journal_status = 'PROCESSED', journal_entry_id = CAST(:journalEntryId AS bigint), updated_at = now()
           WHERE tax_invoice_id = CAST(:id AS bigint) AND journal_status = 'UNPROCESSED'`,
          { id, journalEntryId },
        );
        if (changed !== 1) {
          throw new ApiError(409, 'TAX_INVOICE_ALREADY_PROCESSED', '이미 전표처리된 세금계산서입니다.');
        }
        results.push({
          taxInvoiceId: id,
          journalEntryId,
          status: 'SUCCESS',
        });
      }
      return { results };
    });
  }
}
