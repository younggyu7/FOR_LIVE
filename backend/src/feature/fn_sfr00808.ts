import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 연령 구간 기준은 system_setting(분류 '연령구간', 키 'bucket_days')에 쉼표로 구분한 일수로 둔다.
const AGING_CATEGORY = '연령구간';
const AGING_KEY = 'bucket_days';
const DEFAULT_BUCKET_DAYS = '30,60,90';
// 가정: 채권 라인은 '자산' 계정의 차변 금액, 채무 라인은 '부채' 계정의 대변 금액이다.
// 가정: 반려·승인 취소된 전표는 잔액에서 제외한다.
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

type Db = {
  query(sql: string, params: Record<string, unknown>): Promise<any[]>;
};

interface Filter {
  baseDate: string;
  partnerId: number | null;
  accountSubjectId: number | null;
}

interface LineBalance {
  partnerId: number;
  days: number;
  balance: number;
}

const RECEIVABLE_SQL =
  'SELECT journal_entry_line.partner_id AS "partnerId", ' +
  'CAST(CAST(:baseDate AS date) - journal_entry.entry_date AS integer) AS "days", ' +
  'journal_entry_line.debit_amount - COALESCE(SUM(journal_settlement.settlement_amount), 0) AS "balance" ' +
  'FROM journal_entry_line ' +
  'JOIN journal_entry ON journal_entry.journal_entry_id = journal_entry_line.journal_entry_id ' +
  'JOIN account_subject ON account_subject.account_subject_id = journal_entry_line.account_subject_id ' +
  'LEFT JOIN journal_settlement ON journal_settlement.receivable_line_id = journal_entry_line.journal_entry_line_id ' +
  "WHERE account_subject.category = '자산' " +
  'AND journal_entry_line.debit_amount > 0 ' +
  'AND journal_entry_line.partner_id IS NOT NULL ' +
  'AND journal_entry.entry_date <= CAST(:baseDate AS date) ' +
  "AND journal_entry.status NOT IN ('반려', '승인 취소') " +
  'AND (CAST(:partnerId AS bigint) IS NULL OR journal_entry_line.partner_id = CAST(:partnerId AS bigint)) ' +
  'AND (CAST(:accountSubjectId AS bigint) IS NULL OR journal_entry_line.account_subject_id = CAST(:accountSubjectId AS bigint)) ' +
  'GROUP BY journal_entry_line.journal_entry_line_id, journal_entry_line.partner_id, journal_entry.entry_date, journal_entry_line.debit_amount';

const PAYABLE_SQL =
  'SELECT journal_entry_line.partner_id AS "partnerId", ' +
  'CAST(CAST(:baseDate AS date) - journal_entry.entry_date AS integer) AS "days", ' +
  'journal_entry_line.credit_amount - COALESCE(SUM(journal_settlement.settlement_amount), 0) AS "balance" ' +
  'FROM journal_entry_line ' +
  'JOIN journal_entry ON journal_entry.journal_entry_id = journal_entry_line.journal_entry_id ' +
  'JOIN account_subject ON account_subject.account_subject_id = journal_entry_line.account_subject_id ' +
  'LEFT JOIN journal_settlement ON journal_settlement.payable_line_id = journal_entry_line.journal_entry_line_id ' +
  "WHERE account_subject.category = '부채' " +
  'AND journal_entry_line.credit_amount > 0 ' +
  'AND journal_entry_line.partner_id IS NOT NULL ' +
  'AND journal_entry.entry_date <= CAST(:baseDate AS date) ' +
  "AND journal_entry.status NOT IN ('반려', '승인 취소') " +
  'AND (CAST(:partnerId AS bigint) IS NULL OR journal_entry_line.partner_id = CAST(:partnerId AS bigint)) ' +
  'AND (CAST(:accountSubjectId AS bigint) IS NULL OR journal_entry_line.account_subject_id = CAST(:accountSubjectId AS bigint)) ' +
  'GROUP BY journal_entry_line.journal_entry_line_id, journal_entry_line.partner_id, journal_entry.entry_date, journal_entry_line.credit_amount';

function optionalId(value: unknown, label: string): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
  return n;
}

function readFilter(query: Record<string, unknown>): Filter {
  const baseDate = query['baseDate'];
  if (typeof baseDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(baseDate)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '기준일자를 YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return {
    baseDate,
    partnerId: optionalId(query['partnerId'], '거래처'),
    accountSubjectId: optionalId(query['accountSubjectId'], '계정과목'),
  };
}

function readPaging(query: Record<string, unknown>): { page: number; size: number } {
  const rawPage = query['page'];
  const rawSize = query['size'];
  const page = rawPage === undefined || rawPage === '' ? 0 : Number(rawPage);
  const size = rawSize === undefined || rawSize === '' ? DEFAULT_SIZE : Number(rawSize);
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 쪽 크기가 올바르지 않습니다.');
  }
  return { page, size: Math.min(size, MAX_SIZE) };
}

async function loadLines(db: Db, sql: string, filter: Filter): Promise<LineBalance[]> {
  const rows = await db.query(sql, {
    baseDate: filter.baseDate,
    partnerId: filter.partnerId,
    accountSubjectId: filter.accountSubjectId,
  });
  return rows
    .map((row) => ({
      partnerId: Number(row.partnerId),
      days: Number(row.days),
      balance: Number(row.balance),
    }))
    .filter((line) => line.balance > 0);
}

async function loadBucketDays(db: Db): Promise<number[]> {
  const rows = await db.query(
    'SELECT setting_value AS "value" FROM system_setting WHERE category = :category AND setting_key = :settingKey',
    { category: AGING_CATEGORY, settingKey: AGING_KEY },
  );
  const parse = (text: string): number[] =>
    text
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((n) => Number.isInteger(n) && n > 0)
      .sort((a, b) => a - b);
  const raw = rows.length > 0 && typeof rows[0].value === 'string' ? (rows[0].value as string) : '';
  const days = parse(raw);
  return days.length > 0 ? days : parse(DEFAULT_BUCKET_DAYS);
}

function bucketIndex(days: number, limits: number[]): number {
  for (let i = 0; i < limits.length; i += 1) {
    if (days <= limits[i]) {
      return i;
    }
  }
  return limits.length;
}

function bucketLabel(index: number, limits: number[]): string {
  if (index >= limits.length) {
    return limits[limits.length - 1] + '일 초과';
  }
  const from = index === 0 ? 0 : limits[index - 1] + 1;
  return from + '~' + limits[index] + '일';
}

function slice<T>(all: T[], page: number, size: number) {
  return {
    items: all.slice(page * size, page * size + size),
    page,
    size,
    total: all.length,
  };
}

@Controller('api/v1')
export class FnSfr00808Controller {
  @Get('/receivable-aging')
  async listReceivableAging(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const filter = readFilter(query);
    const paging = readPaging(query);
    return transaction(async (db) => {
      const limits = await loadBucketDays(db);
      const lines = await loadLines(db, RECEIVABLE_SQL, filter);
      const sums = new Map<string, { partnerId: number; index: number; balance: number }>();
      for (const line of lines) {
        const index = bucketIndex(line.days, limits);
        const key = line.partnerId + '|' + index;
        const found = sums.get(key);
        if (found) {
          found.balance += line.balance;
        } else {
          sums.set(key, { partnerId: line.partnerId, index, balance: line.balance });
        }
      }
      const all = Array.from(sums.values())
        .sort((a, b) => a.partnerId - b.partnerId || a.index - b.index)
        .map((entry) => ({
          partnerId: entry.partnerId,
          bucket: bucketLabel(entry.index, limits),
          balance: entry.balance,
        }));
      return slice(all, paging.page, paging.size);
    });
  }

  @Get('/partner-balances')
  async listPartnerBalances(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const filter = readFilter(query);
    const paging = readPaging(query);
    return transaction(async (db) => {
      const receivables = await loadLines(db, RECEIVABLE_SQL, filter);
      const payables = await loadLines(db, PAYABLE_SQL, filter);
      const sums = new Map<number, { partnerId: number; receivableBalance: number; payableBalance: number }>();
      const entryOf = (partnerId: number) => {
        let found = sums.get(partnerId);
        if (!found) {
          found = { partnerId, receivableBalance: 0, payableBalance: 0 };
          sums.set(partnerId, found);
        }
        return found;
      };
      for (const line of receivables) {
        entryOf(line.partnerId).receivableBalance += line.balance;
      }
      for (const line of payables) {
        entryOf(line.partnerId).payableBalance += line.balance;
      }
      const all = Array.from(sums.values()).sort((a, b) => a.partnerId - b.partnerId);
      return slice(all, paging.page, paging.size);
    });
  }
}
