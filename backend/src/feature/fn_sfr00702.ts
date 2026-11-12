import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const TAX_TYPES = ['TAXABLE', 'EXEMPT'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function textOf(value: unknown): string | null {
  if (typeof value === 'string' && value !== '') {
    return value;
  }
  return null;
}

function dateOf(value: unknown, label: string, required: boolean): string | null {
  const text = textOf(value);
  if (text === null) {
    if (required) {
      throw invalid(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (!DATE_RE.test(text)) {
    throw invalid(label + ' 형식이 올바르지 않습니다. (YYYY-MM-DD)');
  }
  return text;
}

function taxTypeOf(value: unknown): string | null {
  const text = textOf(value);
  if (text !== null && !TAX_TYPES.includes(text)) {
    throw invalid('과세·면세 구분이 올바르지 않습니다.');
  }
  return text;
}

function numberOf(value: unknown, label: string): number {
  const ok = (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) && Number.isFinite(Number(value));
  if (!ok) {
    throw invalid(label + '은(는) 숫자여야 합니다.');
  }
  return Number(value);
}

function idOf(value: unknown, label: string): number {
  const n = numberOf(value, label);
  if (!Number.isInteger(n) || n <= 0) {
    throw invalid(label + '이(가) 올바르지 않습니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr00702Controller {
  @Post('/tax-invoices/collect')
  @HttpCode(200)
  async collectTaxInvoices(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const startDate = dateOf(data['startDate'], '수집 기간 시작일', true);
    const endDate = dateOf(data['endDate'], '수집 기간 종료일', true);
    const taxType = taxTypeOf(data['taxType']);
    if (startDate !== null && endDate !== null && startDate > endDate) {
      throw invalid('수집 기간 종료일은 시작일보다 빠를 수 없습니다.');
    }
    return transaction(async (db) => {
      // 가정: 홈택스 연계 호출 모듈이 없어 연계 요청 이력(REQUESTED)만 남기고, 수집 건수는 기간 내 저장된 세금계산서 수로 센다.
      await db.query(
        `INSERT INTO link_log (requester_id, link_target, link_type, status, requested_at, request_summary, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), 'NTS_HOMETAX', '수집', 'REQUESTED', now(), :summary, now(), now())
         RETURNING link_log_id AS "linkLogId"`,
        {
          userId: user.id,
          summary: '기간 ' + startDate + ' ~ ' + endDate + (taxType ? ' / ' + taxType : ''),
        },
      );
      const rows = await db.query(
        `SELECT COUNT(*) AS "count"
           FROM tax_invoice
          WHERE issue_date >= CAST(:startDate AS date)
            AND issue_date <= CAST(:endDate AS date)
            AND (CAST(:taxType AS varchar) IS NULL OR tax_type = CAST(:taxType AS varchar))`,
        { startDate, endDate, taxType },
      );
      return { collectedCount: Number(rows[0]['count']) };
    });
  }

  @Get('/tax-invoices')
  async listTaxInvoices(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const startDate = dateOf(query['startDate'], '조회 기간 시작일', false);
    const endDate = dateOf(query['endDate'], '조회 기간 종료일', false);
    const taxType = taxTypeOf(query['taxType']);
    const pageRaw = textOf(query['page']);
    const sizeRaw = textOf(query['size']);
    let page = pageRaw === null ? 0 : numberOf(pageRaw, 'page');
    let size = sizeRaw === null ? 20 : numberOf(sizeRaw, 'size');
    if (!Number.isInteger(page) || page < 0) {
      page = 0;
    }
    if (!Number.isInteger(size) || size < 1) {
      size = 20;
    }
    if (size > 200) {
      size = 200;
    }
    return transaction(async (db) => {
      const where = `(CAST(:startDate AS date) IS NULL OR issue_date >= CAST(:startDate AS date))
        AND (CAST(:endDate AS date) IS NULL OR issue_date <= CAST(:endDate AS date))
        AND (CAST(:taxType AS varchar) IS NULL OR tax_type = CAST(:taxType AS varchar))`;
      const totalRows = await db.query(
        'SELECT COUNT(*) AS "count" FROM tax_invoice WHERE ' + where,
        { startDate, endDate, taxType },
      );
      const items = await db.query(
        `SELECT tax_invoice_id AS "taxInvoiceId",
                partner_id AS "partnerId",
                direction AS "direction",
                tax_type AS "taxType",
                issue_date AS "issueDate",
                supply_amount AS "supplyAmount",
                tax_amount AS "taxAmount",
                approval_number AS "approvalNumber",
                journal_status AS "journalStatus",
                expense_resolution_id AS "expenseResolutionId"
           FROM tax_invoice
          WHERE ` + where + `
          ORDER BY issue_date DESC, tax_invoice_id DESC
          LIMIT :limit OFFSET :offset`,
        { startDate, endDate, taxType, limit: size, offset: page * size },
      );
      return { items, page, size, total: Number(totalRows[0]['count']) };
    });
  }

  @Post('/expense-resolutions/from-tax-invoice')
  @HttpCode(200)
  async createExpenseResolutionFromTaxInvoice(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const taxInvoiceId = idOf(data['taxInvoiceId'], '전자세금계산서 ID');
    const projectId = idOf(data['projectId'], '프로젝트');
    const budgetAccountId = idOf(data['budgetAccountId'], '예산과목');
    const departmentId = idOf(data['departmentId'], '결의부서');
    const resolutionAmount = numberOf(data['resolutionAmount'], '결의 금액');
    if (resolutionAmount <= 0) {
      throw invalid('결의 금액은 0보다 커야 합니다.');
    }
    return transaction(async (db) => {
      const invoices = await db.query(
        `SELECT partner_id AS "partnerId", expense_resolution_id AS "expenseResolutionId"
           FROM tax_invoice
          WHERE tax_invoice_id = :taxInvoiceId
            FOR UPDATE`,
        { taxInvoiceId },
      );
      if (invoices.length === 0) {
        throw new ApiError(404, 'TAX_INVOICE_NOT_FOUND', '선택한 전자세금계산서를 찾을 수 없습니다.');
      }
      if (invoices[0]['expenseResolutionId'] !== null && invoices[0]['expenseResolutionId'] !== undefined) {
        throw new ApiError(409, 'EXPENSE_RESOLUTION_ALREADY_CREATED', '이미 결의서가 작성된 전자세금계산서입니다.');
      }
      const projects = await db.query('SELECT project_id FROM project WHERE project_id = :id', { id: projectId });
      if (projects.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      const accounts = await db.query('SELECT budget_account_id FROM budget_account WHERE budget_account_id = :id', { id: budgetAccountId });
      if (accounts.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '예산과목을 찾을 수 없습니다.');
      }
      const departments = await db.query('SELECT department_id FROM department WHERE department_id = :id', { id: departmentId });
      if (departments.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '결의부서를 찾을 수 없습니다.');
      }
      const created = await db.query(
        `INSERT INTO expense_resolution
           (project_id, budget_account_id, partner_id, department_id, resolution_method, resolution_amount, status, created_at, updated_at)
         VALUES
           (CAST(:projectId AS bigint), CAST(:budgetAccountId AS bigint), CAST(:partnerId AS bigint), CAST(:departmentId AS bigint),
            '세금계산서', CAST(:amount AS numeric), '기안', now(), now())
         RETURNING expense_resolution_id AS "expenseResolutionId", status AS "status"`,
        {
          projectId,
          budgetAccountId,
          partnerId: invoices[0]['partnerId'],
          departmentId,
          amount: resolutionAmount,
        },
      );
      await db.execute(
        `UPDATE tax_invoice
            SET expense_resolution_id = CAST(:resolutionId AS bigint), updated_at = now()
          WHERE tax_invoice_id = :taxInvoiceId`,
        { resolutionId: created[0]['expenseResolutionId'], taxInvoiceId },
      );
      return {
        expenseResolutionId: Number(created[0]['expenseResolutionId']),
        status: created[0]['status'],
      };
    });
  }
}
