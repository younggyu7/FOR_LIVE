import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const FORM_TYPES = ['기본장부', '주요', '영세율첨부', '업종별첨부', '기타'];
const DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 서식을 새로 만들 때 마감 여부는 false
const INITIAL_CLOSED = false;

function textOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function periodOf(source: Record<string, unknown>) {
  const start = textOf(source['taxPeriodStart']);
  const end = textOf(source['taxPeriodEnd']);
  const formType = textOf(source['formType']);
  if (!start || !end || !formType) {
    throw new ApiError(422, 'VAT_PERIOD_OR_FORM_TYPE_REQUIRED', '과세 기간과 서식 구분을 모두 입력해 주세요.');
  }
  if (!DATE_PATTERN.test(start) || !DATE_PATTERN.test(end)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '과세 기간은 YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  if (end < start) {
    throw new ApiError(400, 'VALIDATION_FAILED', '과세기간 종료일은 시작일보다 빠를 수 없습니다.');
  }
  if (!FORM_TYPES.includes(formType)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '서식 구분이 올바르지 않습니다.');
  }
  return { start, end, formType };
}

function wholeNumberOf(text: string, fallback: number, min: number): number {
  if (text === '') {
    return fallback;
  }
  const value = Number(text);
  if (!Number.isInteger(value) || value < min) {
    throw new ApiError(400, 'VALIDATION_FAILED', 'page와 size는 올바른 정수여야 합니다.');
  }
  return value;
}

@Controller('api/v1')
export class FnSfr01006Controller {
  @Get('/vat-forms')
  async listVatForms(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const period = periodOf(query);
    const page = wholeNumberOf(textOf(query['page']), 0, 0);
    const size = Math.min(wholeNumberOf(textOf(query['size']), DEFAULT_SIZE, 1), MAX_SIZE);
    return transaction(async (db) => {
      const params = {
        start: period.start,
        end: period.end,
        formType: period.formType,
      };
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM vat_form WHERE tax_period_start = CAST(:start AS date) AND tax_period_end = CAST(:end AS date) AND form_type = :formType',
        params,
      );
      const items = await db.query(
        'SELECT vat_form_id AS "vatFormId", tax_period_start AS "taxPeriodStart", tax_period_end AS "taxPeriodEnd", form_type AS "formType", form_content AS "formContent", is_closed AS "isClosed" FROM vat_form WHERE tax_period_start = CAST(:start AS date) AND tax_period_end = CAST(:end AS date) AND form_type = :formType ORDER BY vat_form_id LIMIT :size OFFSET :offset',
        { ...params, size, offset: page * size },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/vat-forms')
  @HttpCode(200)
  async createVatForm(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const period = periodOf(data);
    return transaction(async (db) => {
      const exists = await db.query(
        'SELECT vat_form_id AS "vatFormId" FROM vat_form WHERE tax_period_start = CAST(:start AS date) AND tax_period_end = CAST(:end AS date) AND form_type = :formType',
        { start: period.start, end: period.end, formType: period.formType },
      );
      if (exists.length > 0) {
        throw new ApiError(409, 'VAT_FORM_ALREADY_EXISTS', '같은 과세 기간과 서식 구분의 서식이 이미 있습니다.');
      }
      // 전자세금계산서: 과세 기간 내 매출(ISSUE)·매입(RECEIVE) 집계
      const invoices = await db.query(
        'SELECT direction AS "direction", tax_type AS "taxType", COUNT(*) AS "count", COALESCE(SUM(supply_amount), 0) AS "supplyAmount", COALESCE(SUM(tax_amount), 0) AS "taxAmount" FROM tax_invoice WHERE issue_date >= CAST(:start AS date) AND issue_date <= CAST(:end AS date) GROUP BY direction, tax_type ORDER BY direction, tax_type',
        { start: period.start, end: period.end },
      );
      // 전표: 과세 기간 내 전표 건수와 차변 합계
      const journals = await db.query(
        'SELECT COUNT(*) AS "count", COALESCE(SUM(total_debit_amount), 0) AS "totalDebitAmount" FROM journal_entry WHERE entry_date >= CAST(:start AS date) AND entry_date <= CAST(:end AS date)',
        { start: period.start, end: period.end },
      );
      const content = JSON.stringify({
        formType: period.formType,
        taxPeriodStart: period.start,
        taxPeriodEnd: period.end,
        taxInvoices: invoices,
        journalEntries: journals[0],
      });
      const rows = await db.query(
        'INSERT INTO vat_form (tax_period_start, tax_period_end, form_type, form_content, is_closed, created_at, updated_at) VALUES (CAST(:start AS date), CAST(:end AS date), :formType, :content, :isClosed, now(), now()) RETURNING vat_form_id AS "vatFormId", form_content AS "formContent"',
        {
          start: period.start,
          end: period.end,
          formType: period.formType,
          content,
          isClosed: INITIAL_CLOSED,
        },
      );
      return rows[0];
    });
  }

  @Patch('/vat-forms/:vatFormId')
  async updateVatForm(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const idText = req.params['vatFormId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '서식 ID가 올바르지 않습니다.');
    }
    const formContent = data['formContent'];
    if (typeof formContent !== 'string' || formContent.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '서식 입력 내용을 입력해 주세요.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT vat_form_id AS "vatFormId", is_closed AS "isClosed" FROM vat_form WHERE vat_form_id = CAST(:id AS bigint) FOR UPDATE',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'VAT_FORM_NOT_FOUND', '부가가치세 서식을 찾을 수 없습니다.');
      }
      if (found[0]['isClosed']) {
        throw new ApiError(409, 'VAT_PERIOD_CLOSED', '마감된 과세 기간의 서식입니다. 마감을 취소한 뒤 수정해 주세요.');
      }
      const rows = await db.query(
        'UPDATE vat_form SET form_content = :content, updated_at = now() WHERE vat_form_id = CAST(:id AS bigint) RETURNING vat_form_id AS "vatFormId", form_content AS "formContent"',
        { id: idText, content: formContent },
      );
      return rows[0];
    });
  }
}
