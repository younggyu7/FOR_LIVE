import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 목록 size 기본 20, 최대 200
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

const STATUSES = ['신청', '마감', '마감 취소', '승인', '승인 취소', '반려'];

const ENTRY_COLUMNS =
  'journal_entry_id AS "journalEntryId", ' +
  'expense_resolution_id AS "expenseResolutionId", ' +
  'entry_date AS "entryDate", ' +
  'status AS "status", ' +
  'total_debit_amount AS "totalDebitAmount", ' +
  'total_credit_amount AS "totalCreditAmount", ' +
  'summary AS "summary", ' +
  'evidence_detail AS "evidenceDetail"';

function toId(value: unknown, label: string): number {
  let n = NaN;
  if (typeof value === 'number') {
    n = value;
  } else if (typeof value === 'string' && value.trim() !== '') {
    n = Number(value);
  }
  if (!Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 양의 정수여야 합니다.');
  }
  return n;
}

function optText(value: unknown, label: string, max: number): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || value.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) ' + max + '자 이하의 글자여야 합니다.');
  }
  return value;
}

@Controller('api/v1')
export class FnSfr00405Controller {
  @Post('/journal-entries')
  @HttpCode(200)
  async createJournalEntry(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    const expenseResolutionId = toId(data['expenseResolutionId'], '결의서 ID');
    // 계정과목은 분개 라인 저장 테이블이 입력에 없어 형식만 검사한다
    toId(data['accountSubjectId'], '계정과목 ID');
    const summary = optText(data['summary'], '적요', 500);
    const evidenceDetail = optText(data['evidenceDetail'], '증빙내역', 1000);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT status AS "status", resolution_amount AS "amount" FROM expense_resolution' +
          ' WHERE expense_resolution_id = CAST(:id AS bigint)',
        { id: expenseResolutionId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EXPENSE_RESOLUTION_NOT_FOUND', '결의서를 찾을 수 없습니다.');
      }
      if (found[0]['status'] !== '승인') {
        throw new ApiError(409, 'EXPENSE_RESOLUTION_NOT_APPROVED', '승인된 결의서만 전표를 생성할 수 있습니다.');
      }
      const amount = found[0]['amount'];
      const rows = await db.query(
        'INSERT INTO journal_entry (expense_resolution_id, entry_date, status, total_debit_amount,' +
          ' total_credit_amount, summary, evidence_detail, created_at, updated_at)' +
          ' VALUES (CAST(:id AS bigint), CAST(now() AS date), :status, CAST(:amount AS numeric),' +
          ' CAST(:amount AS numeric), :summary, :evidence, now(), now())' +
          ' RETURNING journal_entry_id AS "journalEntryId", status AS "status",' +
          ' total_debit_amount AS "totalDebitAmount", total_credit_amount AS "totalCreditAmount"',
        {
          id: expenseResolutionId,
          status: '신청',
          amount: amount,
          summary: summary,
          evidence: evidenceDetail,
        },
      );
      return rows[0];
    });
  }

  @Get('/journal-entries')
  async listJournalEntries(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const q = checks.queryOf(req.query);
    const params: Record<string, unknown> = {};
    const conds: string[] = [];
    if (q['expenseResolutionId'] !== undefined && q['expenseResolutionId'] !== '') {
      params['resolutionId'] = toId(q['expenseResolutionId'], '결의서 ID');
      conds.push('expense_resolution_id = CAST(:resolutionId AS bigint)');
    }
    if (q['status'] !== undefined && q['status'] !== '') {
      const status = String(q['status']);
      if (!STATUSES.includes(status)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '전표 상태 값이 올바르지 않습니다.');
      }
      params['status'] = status;
      conds.push('status = :status');
    }
    const pageRaw = q['page'] === undefined || q['page'] === '' ? 0 : Number(q['page']);
    const sizeRaw = q['size'] === undefined || q['size'] === '' ? DEFAULT_SIZE : Number(q['size']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 크기가 올바르지 않습니다.');
    }
    const page = pageRaw;
    const size = Math.min(sizeRaw, MAX_SIZE);
    const where = conds.length > 0 ? ' WHERE ' + conds.join(' AND ') : '';
    return transaction(async (db) => {
      const countRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM journal_entry' + where,
        params,
      );
      const items = await db.query(
        'SELECT ' + ENTRY_COLUMNS + ' FROM journal_entry' + where +
          ' ORDER BY journal_entry_id DESC LIMIT :size OFFSET :offset',
        { ...params, size: size, offset: page * size },
      );
      return { items: items, page: page, size: size, total: Number(countRows[0]['total']) };
    });
  }

  @Post('/journal-entries/:journalEntryId/cancel')
  @HttpCode(200)
  async cancelJournalEntry(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const journalEntryId = toId(req.params['journalEntryId'], '전표 ID');
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT status AS "status" FROM journal_entry WHERE journal_entry_id = CAST(:id AS bigint)',
        { id: journalEntryId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'JOURNAL_ENTRY_NOT_FOUND', '전표를 찾을 수 없습니다.');
      }
      // 가정: 상태 '마감'인 전표를 마감된 기간의 전표로 본다
      if (found[0]['status'] === '마감') {
        throw new ApiError(409, 'PERIOD_CLOSED', '마감된 기간의 전표는 마감 취소 전에는 취소할 수 없습니다.');
      }
      // 가정: 이미 취소된 전표는 다시 취소할 수 없다
      if (found[0]['status'] === '승인 취소') {
        throw new ApiError(409, 'INVALID_STATE', '이미 취소된 전표입니다.');
      }
      const rows = await db.query(
        'UPDATE journal_entry SET status = :status, updated_at = now()' +
          ' WHERE journal_entry_id = CAST(:id AS bigint) RETURNING status AS "status"',
        { id: journalEntryId, status: '승인 취소' },
      );
      return rows[0];
    });
  }
}
