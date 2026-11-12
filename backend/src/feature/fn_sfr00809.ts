import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 페이지 크기 기본값과 최대값
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 결정: 연령 구간 (경과 일수 기준)
const BUCKETS: [number, string][] = [
  [30, '0~30일'],
  [60, '31~60일'],
  [90, '61~90일'],
];
const LAST_BUCKET = '91일 이상';
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

function text(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

function pagingOf(query: Record<string, unknown>): { page: number; size: number } {
  const pageText = text(query['page']);
  const sizeText = text(query['size']);
  let page = 0;
  let size = DEFAULT_SIZE;
  if (pageText !== '') {
    page = Number(pageText);
    if (!Number.isInteger(page) || page < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'page는 0 이상의 정수여야 합니다.');
    }
  }
  if (sizeText !== '') {
    size = Number(sizeText);
    if (!Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'size는 1 이상의 정수여야 합니다.');
    }
  }
  if (size > MAX_SIZE) {
    size = MAX_SIZE;
  }
  return { page, size };
}

function idOf(query: Record<string, unknown>, name: string, label: string): string {
  const value = text(query[name]);
  if (value === '') {
    return '';
  }
  if (!/^\d+$/.test(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '는 숫자여야 합니다.');
  }
  return value;
}

function periodOf(query: Record<string, unknown>): { startDate: string; endDate: string } {
  const startDate = text(query['startDate']);
  const endDate = text(query['endDate']);
  if (startDate === '' || endDate === '') {
    throw new ApiError(400, 'VALIDATION_FAILED', '조회 시작일과 종료일을 입력해 주세요.');
  }
  if (!DATE_FORMAT.test(startDate) || !DATE_FORMAT.test(endDate) || startDate > endDate) {
    throw new ApiError(422, 'INVALID_PERIOD', '조회 기간이 올바르지 않습니다.');
  }
  return { startDate, endDate };
}

function bucketOf(ageDays: number): string {
  for (const [limit, name] of BUCKETS) {
    if (ageDays <= limit) {
      return name;
    }
  }
  return LAST_BUCKET;
}

@Controller('api/v1')
export class FnSfr00809Controller {
  @Get('/journal-settlements')
  async listJournalSettlements(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const period = periodOf(query);
    const partnerId = idOf(query, 'partnerId', '거래처 ID');
    const paging = pagingOf(query);
    return transaction(async (db) => {
      const params: Record<string, unknown> = {
        startDate: period.startDate,
        endDate: period.endDate,
        size: paging.size,
        offset: paging.page * paging.size,
      };
      let where = ' WHERE CAST(settled_at AS date) BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date) ';
      if (partnerId !== '') {
        where = where + ' AND partner_id = CAST(:partnerId AS bigint) ';
        params['partnerId'] = partnerId;
      }
      const items = await db.query(
        ' SELECT journal_settlement_id AS "journalSettlementId", receivable_line_id AS "receivableLineId", '
          + ' payable_line_id AS "payableLineId", partner_id AS "partnerId", '
          + ' settlement_amount AS "settlementAmount", settled_at AS "settledAt" '
          + ' FROM journal_settlement '
          + where
          + ' ORDER BY settled_at DESC, journal_settlement_id DESC '
          + ' LIMIT :size OFFSET :offset ',
        params,
      );
      const counted = await db.query(
        ' SELECT COUNT(*) AS "total" FROM journal_settlement ' + where,
        params,
      );
      const total = Number(counted[0]['total']);
      return { items, page: paging.page, size: paging.size, total };
    });
  }

  @Get('/settlement-aging')
  async listSettlementAging(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const period = periodOf(query);
    const baseText = text(query['baseDate']);
    if (baseText !== '' && !DATE_FORMAT.test(baseText)) {
      throw new ApiError(422, 'INVALID_PERIOD', '연령분석 기준일이 올바르지 않습니다.');
    }
    // 가정: 기준일이 없으면 조회 종료일을 기준일로 쓴다
    const baseDate = baseText === '' ? period.endDate : baseText;
    const accountSubjectId = idOf(query, 'accountSubjectId', '계정과목 ID');
    const partnerId = idOf(query, 'partnerId', '거래처 ID');
    const paging = pagingOf(query);
    return transaction(async (db) => {
      const params: Record<string, unknown> = {
        startDate: period.startDate,
        endDate: period.endDate,
        baseDate,
      };
      let where = ' WHERE e.entry_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date) ';
      if (accountSubjectId !== '') {
        where = where + ' AND l.account_subject_id = CAST(:accountSubjectId AS bigint) ';
        params['accountSubjectId'] = accountSubjectId;
      }
      if (partnerId !== '') {
        where = where + ' AND l.partner_id = CAST(:partnerId AS bigint) ';
        params['partnerId'] = partnerId;
      }
      // 가정: 잔액 = 전표 라인 금액(차변+대변) - 반제 금액 합계
      const lines = await db.query(
        ' SELECT l.journal_entry_line_id AS "lineId", l.account_subject_id AS "accountSubjectId", '
          + ' (CAST(:baseDate AS date) - e.entry_date) AS "ageDays", '
          + ' (l.debit_amount + l.credit_amount - COALESCE(SUM(s.settlement_amount), 0)) AS "balance" '
          + ' FROM journal_entry_line l '
          + ' JOIN journal_entry e ON e.journal_entry_id = l.journal_entry_id '
          + ' LEFT JOIN journal_settlement s ON s.receivable_line_id = l.journal_entry_line_id '
          + ' OR s.payable_line_id = l.journal_entry_line_id '
          + where
          + ' GROUP BY l.journal_entry_line_id, l.account_subject_id, e.entry_date, l.debit_amount, l.credit_amount ',
        params,
      );
      const sums = new Map<string, { accountSubjectId: number; bucket: string; balance: number }>();
      for (const line of lines) {
        const balance = Number(line['balance']);
        if (!(balance > 0)) {
          continue;
        }
        const accountId = Number(line['accountSubjectId']);
        const bucket = bucketOf(Number(line['ageDays']));
        const key = accountId + '|' + bucket;
        const found = sums.get(key);
        if (found) {
          found.balance = found.balance + balance;
        } else {
          sums.set(key, { accountSubjectId: accountId, bucket, balance });
        }
      }
      const order = BUCKETS.map((b) => b[1]).concat([LAST_BUCKET]);
      const all = Array.from(sums.values()).sort((a, b) => {
        if (a.accountSubjectId !== b.accountSubjectId) {
          return a.accountSubjectId - b.accountSubjectId;
        }
        return order.indexOf(a.bucket) - order.indexOf(b.bucket);
      });
      const start = paging.page * paging.size;
      const items = all.slice(start, start + paging.size);
      return { items, page: paging.page, size: paging.size, total: all.length };
    });
  }
}
