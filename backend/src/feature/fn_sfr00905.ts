import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 기본 쪽 크기와 최대 쪽 크기
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

// 가정: 조회 범위 값
const SCOPES = ['전체', '부서', '개인'];

// 가정: 현황 종류 코드 (명세에 코드 목록이 없어 정함)
const TYPE_PLAN_VS_ACTUAL = 'PLAN_VS_ACTUAL';
const TYPE_FUND_PL = 'FUND_PL';
const TYPE_JOURNAL = 'JOURNAL';
const TYPE_BILL = 'BILL';
const TYPE_DEPOSIT_SAVINGS = 'DEPOSIT_SAVINGS';
const TYPE_SECURITIES = 'SECURITIES';
const TYPE_FOREIGN_CURRENCY = 'FOREIGN_CURRENCY';

function text(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t === '' ? null : t;
}

function isDate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function idOf(v: unknown, name: string): number | null {
  const t = text(v);
  if (t === null) return null;
  const n = Number(t);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', name + ' 값이 올바르지 않습니다.');
  }
  return n;
}

// 가정: 금융자산 유형별 현황은 조회 기간과 겹치는 발행·만기 기간의 금융자산 액면을 보여 준다
function instrumentBase(types: string): string {
  return [
    'SELECT instrument_name AS item_name,',
    'COALESCE(face_amount, 0) AS amount,',
    '0 AS plan_amount,',
    '0 AS actual_amount,',
    '0 AS sort_key',
    'FROM financial_instrument',
    'WHERE instrument_type IN (' + types + ')',
    'AND COALESCE(issue_date, CAST(:startDate AS date)) <= CAST(:endDate AS date)',
    'AND COALESCE(maturity_date, CAST(:endDate AS date)) >= CAST(:startDate AS date)',
    'AND (CAST(:partnerId AS bigint) IS NULL OR partner_id = CAST(:partnerId AS bigint))',
  ].join(' ');
}

// 가정: 일일자금 및 분개현황은 기간 내 전표(차변 합계)를 결의서의 거래처와 함께 보여 준다
const JOURNAL_BASE = [
  "SELECT COALESCE(j.summary, '전표 ' || j.journal_entry_id) AS item_name,",
  'COALESCE(j.total_debit_amount, 0) AS amount,',
  '0 AS plan_amount,',
  'COALESCE(j.total_debit_amount, 0) AS actual_amount,',
  '0 AS sort_key',
  'FROM journal_entry j',
  'JOIN expense_resolution r ON r.expense_resolution_id = j.expense_resolution_id',
  'WHERE j.entry_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)',
  'AND (CAST(:partnerId AS bigint) IS NULL OR r.partner_id = CAST(:partnerId AS bigint))',
].join(' ');

// 가정: 계획 금액은 수입 계획 - 지출 계획, 조회 기간과 겹치는 계획 행을 합산
const PLAN_BASE = [
  'SELECT s.name AS item_name,',
  'COALESCE(SUM(COALESCE(p.income_amount, 0) - COALESCE(p.expense_amount, 0)), 0) AS amount,',
  'COALESCE(SUM(COALESCE(p.income_amount, 0) - COALESCE(p.expense_amount, 0)), 0) AS plan_amount,',
  '0 AS actual_amount,',
  '0 AS sort_key',
  'FROM fund_plan p',
  'JOIN fund_subject s ON s.fund_subject_id = p.fund_subject_id',
  'WHERE p.plan_start_date <= CAST(:endDate AS date)',
  'AND p.plan_end_date >= CAST(:startDate AS date)',
  'GROUP BY s.fund_subject_id, s.name',
].join(' ');

// 자금손익현황은 설정된 자금 손익 양식 항목 순서대로 표시한다
const FUND_PL_BASE = [
  'SELECT COALESCE(i.item_name, s.name) AS item_name,',
  'COALESCE(SUM(COALESCE(p.income_amount, 0) - COALESCE(p.expense_amount, 0)), 0) AS amount,',
  'COALESCE(SUM(COALESCE(p.income_amount, 0) - COALESCE(p.expense_amount, 0)), 0) AS plan_amount,',
  '0 AS actual_amount,',
  'i.sort_order AS sort_key',
  'FROM fund_pl_form_item i',
  'JOIN fund_subject s ON s.fund_subject_id = i.fund_subject_id',
  'LEFT JOIN fund_plan p ON p.fund_subject_id = i.fund_subject_id',
  'AND p.plan_start_date <= CAST(:endDate AS date)',
  'AND p.plan_end_date >= CAST(:startDate AS date)',
  'GROUP BY i.fund_pl_form_item_id, i.item_name, s.name, i.sort_order',
].join(' ');

function baseOf(statusType: string): string {
  switch (statusType) {
    case TYPE_PLAN_VS_ACTUAL:
      return PLAN_BASE;
    case TYPE_FUND_PL:
      return FUND_PL_BASE;
    case TYPE_JOURNAL:
      return JOURNAL_BASE;
    case TYPE_BILL:
      return instrumentBase("'BILL'");
    case TYPE_DEPOSIT_SAVINGS:
      return instrumentBase("'DEPOSIT', 'SAVINGS'");
    case TYPE_SECURITIES:
      return instrumentBase("'SECURITIES'");
    case TYPE_FOREIGN_CURRENCY:
      return instrumentBase("'FOREIGN_CURRENCY'");
    default:
      throw new ApiError(400, 'VALIDATION_FAILED', '지원하지 않는 현황 종류입니다.');
  }
}

@Controller('api/v1')
export class FnSfr00905Controller {
  @Get('/fund-statuses')
  async listFundStatuses(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const q = checks.queryOf(req.query);

    const statusType = text(q['statusType']);
    const startDate = text(q['startDate']);
    const endDate = text(q['endDate']);
    if (statusType === null || startDate === null || endDate === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '현황 종류와 조회 기간을 입력해 주세요.');
    }
    if (!isDate(startDate) || !isDate(endDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 기간은 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    if (startDate > endDate) {
      throw new ApiError(422, 'INVALID_DATE_RANGE', '조회 시작일은 종료일보다 늦을 수 없습니다.');
    }
    const scope = text(q['scope']);
    if (scope !== null && !SCOPES.includes(scope)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 범위가 올바르지 않습니다.');
    }
    const partnerId = idOf(q['partnerId'], '거래처');
    const partnerAccountId = idOf(q['partnerAccountId'], '거래처 계좌');

    const pageText = text(q['page']);
    const sizeText = text(q['size']);
    const page = pageText === null ? 0 : Number(pageText);
    const size = sizeText === null ? DEFAULT_SIZE : Number(sizeText);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const pageSize = Math.min(size, MAX_SIZE);
    const base = baseOf(statusType);

    return transaction(async (db) => {
      let effectivePartnerId: number | null = partnerId;
      if (partnerAccountId !== null) {
        const accounts = await db.query(
          'SELECT partner_id AS "partnerId" FROM partner_account WHERE partner_account_id = CAST(:accountId AS bigint)',
          { accountId: partnerAccountId },
        );
        if (accounts.length === 0) {
          throw new ApiError(404, 'NOT_FOUND', '거래처 계좌를 찾을 수 없습니다.');
        }
        const owner = Number(accounts[0]['partnerId']);
        if (partnerId !== null && partnerId !== owner) {
          throw new ApiError(400, 'VALIDATION_FAILED', '거래처와 거래처 계좌가 맞지 않습니다.');
        }
        effectivePartnerId = owner;
      }
      if (effectivePartnerId !== null) {
        const partners = await db.query(
          'SELECT partner_id FROM partner WHERE partner_id = CAST(:partnerId AS bigint)',
          { partnerId: effectivePartnerId },
        );
        if (partners.length === 0) {
          throw new ApiError(404, 'NOT_FOUND', '거래처를 찾을 수 없습니다.');
        }
      }

      const params = { startDate, endDate, partnerId: effectivePartnerId };
      const totals = await db.query(
        'SELECT COUNT(*) AS "total", COALESCE(SUM(amount), 0) AS "totalAmount" FROM (' + base + ') t',
        params,
      );
      const total = Number(totals[0]['total']);
      const totalAmount = Number(totals[0]['totalAmount']);

      const rows = await db.query(
        [
          'SELECT item_name AS "itemName",',
          'amount AS "amount",',
          'plan_amount AS "planAmount",',
          'actual_amount AS "actualAmount",',
          'actual_amount - plan_amount AS "differenceAmount"',
          'FROM (' + base + ') t',
          'ORDER BY sort_key, item_name',
          'LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)',
        ].join(' '),
        { ...params, limit: pageSize, offset: page * pageSize },
      );

      const items = rows.map((row) => ({
        itemName: row['itemName'],
        amount: Number(row['amount']),
        totalAmount,
        planAmount: Number(row['planAmount']),
        actualAmount: Number(row['actualAmount']),
        differenceAmount: Number(row['differenceAmount']),
      }));
      return { items, page, size: pageSize, total };
    });
  }
}
