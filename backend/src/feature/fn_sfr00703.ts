import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toNum(v: unknown): number | null {
  if (typeof v === 'number') {
    return Number.isFinite(v) ? v : null;
  }
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return null;
}

function fail(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

@Controller('api/v1')
export class FnSfr00703Controller {
  @Post('/bank-transactions/collect')
  @HttpCode(200)
  async collectBankTransactions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const accountId = toNum(data['partnerAccountId']);
    const startDate = data['startDate'];
    const endDate = data['endDate'];
    if (accountId === null || !Number.isInteger(accountId)) {
      throw fail('거래처 계좌를 선택해 주세요.');
    }
    if (typeof startDate !== 'string' || !DATE_RE.test(startDate)) {
      throw fail('수집 기간 시작일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    if (typeof endDate !== 'string' || !DATE_RE.test(endDate)) {
      throw fail('수집 기간 종료일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const accounts = await db.query(
        'SELECT partner_account_id FROM partner_account WHERE partner_account_id = CAST(:accountId AS bigint)',
        { accountId },
      );
      if (accounts.length === 0) {
        throw new ApiError(404, 'PARTNER_ACCOUNT_NOT_FOUND', '계좌가 존재하지 않습니다.');
      }
      const order = await db.query(
        'SELECT (CAST(:startDate AS date) <= CAST(:endDate AS date)) AS ok',
        { startDate, endDate },
      );
      if (!order[0]['ok']) {
        throw fail('수집 기간 시작일이 종료일보다 늦을 수 없습니다.');
      }
      // 가정: 금융기관 API 호출 수단이 없어 이미 저장된 거래내역을 기간 기준으로 집계한다.
      const rows = await db.query(
        'SELECT COUNT(*) AS "collectedCount", ' +
          'COUNT(*) FILTER (WHERE is_journalized) AS "journalizedCount", ' +
          'COUNT(*) FILTER (WHERE is_exception) AS "exceptionCount" ' +
          'FROM bank_transaction ' +
          'WHERE partner_account_id = CAST(:accountId AS bigint) ' +
          'AND transaction_at >= CAST(:startDate AS date) ' +
          'AND transaction_at < CAST(:endDate AS date) + 1',
        { accountId, startDate, endDate },
      );
      return {
        collectedCount: Number(rows[0]['collectedCount']),
        journalizedCount: Number(rows[0]['journalizedCount']),
        exceptionCount: Number(rows[0]['exceptionCount']),
      };
    });
  }

  @Get('/bank-transactions')
  async listBankTransactions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const accountId = toNum(q['partnerAccountId']);
    const startDate = q['startDate'];
    const endDate = q['endDate'];
    if (accountId === null || !Number.isInteger(accountId)) {
      throw fail('거래처 계좌를 선택해 주세요.');
    }
    if (typeof startDate !== 'string' || !DATE_RE.test(startDate)) {
      throw fail('조회 기간 시작일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    if (typeof endDate !== 'string' || !DATE_RE.test(endDate)) {
      throw fail('조회 기간 종료일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    let isException: string | null = null;
    const rawException = q['isException'];
    if (rawException !== undefined && rawException !== null && rawException !== '') {
      if (rawException !== 'true' && rawException !== 'false') {
        throw fail('예외 거래 여부는 true 또는 false여야 합니다.');
      }
      isException = rawException;
    }
    const rawPage = q['page'] === undefined || q['page'] === '' ? 0 : toNum(q['page']);
    const rawSize = q['size'] === undefined || q['size'] === '' ? 20 : toNum(q['size']);
    if (rawPage === null || !Number.isInteger(rawPage) || rawPage < 0) {
      throw fail('page는 0 이상의 정수여야 합니다.');
    }
    if (rawSize === null || !Number.isInteger(rawSize) || rawSize < 1) {
      throw fail('size는 1 이상의 정수여야 합니다.');
    }
    const page = rawPage;
    const size = Math.min(rawSize, 200);
    const offset = page * size;
    return transaction(async (db) => {
      const where =
        'WHERE partner_account_id = CAST(:accountId AS bigint) ' +
        'AND transaction_at >= CAST(:startDate AS date) ' +
        'AND transaction_at < CAST(:endDate AS date) + 1 ' +
        'AND (CAST(:isException AS boolean) IS NULL OR is_exception = CAST(:isException AS boolean))';
      const counts = await db.query(
        'SELECT COUNT(*) AS total FROM bank_transaction ' + where,
        { accountId, startDate, endDate, isException },
      );
      const items = await db.query(
        'SELECT bank_transaction_id AS "bankTransactionId", ' +
          'transaction_at AS "transactionAt", ' +
          'deposit_amount AS "depositAmount", ' +
          'withdrawal_amount AS "withdrawalAmount", ' +
          'balance_amount AS "balanceAmount", ' +
          'summary AS "summary", ' +
          'counterparty_name AS "counterpartyName", ' +
          'is_exception AS "isException", ' +
          'is_journalized AS "isJournalized", ' +
          'journal_entry_id AS "journalEntryId" ' +
          'FROM bank_transaction ' + where +
          ' ORDER BY transaction_at DESC, bank_transaction_id DESC ' +
          'LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { accountId, startDate, endDate, isException, size, offset },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/journal-settlements')
  @HttpCode(200)
  async createJournalSettlement(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const bankTransactionId = toNum(data['bankTransactionId']);
    const receivableLineId = toNum(data['receivableLineId']);
    const payableLineId = toNum(data['payableLineId']);
    const partnerId = toNum(data['partnerId']);
    const settlementAmount = toNum(data['settlementAmount']);
    const rawMemo = data['memo'];
    if (bankTransactionId === null || !Number.isInteger(bankTransactionId)) {
      throw fail('반제할 예외 거래내역을 선택해 주세요.');
    }
    if (receivableLineId === null || !Number.isInteger(receivableLineId)) {
      throw fail('채권 분개라인을 선택해 주세요.');
    }
    if (payableLineId === null || !Number.isInteger(payableLineId)) {
      throw fail('채무 분개라인을 선택해 주세요.');
    }
    if (partnerId === null || !Number.isInteger(partnerId)) {
      throw fail('거래처를 선택해 주세요.');
    }
    if (settlementAmount === null || settlementAmount <= 0) {
      throw fail('반제·상계 금액은 0보다 큰 숫자여야 합니다.');
    }
    if (receivableLineId === payableLineId) {
      throw fail('채권 분개라인과 채무 분개라인은 서로 달라야 합니다.');
    }
    let memo: string | null = null;
    if (rawMemo !== undefined && rawMemo !== null && rawMemo !== '') {
      if (typeof rawMemo !== 'string' || rawMemo.length > 500) {
        throw fail('처리 내용은 500자 이하의 글자여야 합니다.');
      }
      memo = rawMemo;
    }
    return transaction(async (db) => {
      const txs = await db.query(
        'SELECT is_journalized AS "isJournalized" FROM bank_transaction ' +
          'WHERE bank_transaction_id = CAST(:bankTransactionId AS bigint) FOR UPDATE',
        { bankTransactionId },
      );
      if (txs.length === 0) {
        throw new ApiError(404, 'BANK_TRANSACTION_NOT_FOUND', '선택한 거래내역이 존재하지 않습니다.');
      }
      if (txs[0]['isJournalized']) {
        throw new ApiError(409, 'BANK_TRANSACTION_ALREADY_PROCESSED', '이미 전표 처리된 거래내역입니다.');
      }
      const partners = await db.query(
        'SELECT partner_id FROM partner WHERE partner_id = CAST(:partnerId AS bigint)',
        { partnerId },
      );
      if (partners.length === 0) {
        throw new ApiError(404, 'PARTNER_NOT_FOUND', '거래처가 존재하지 않습니다.');
      }
      const lines = await db.query(
        'SELECT journal_entry_line_id AS "lineId", partner_id AS "partnerId" FROM journal_entry_line ' +
          'WHERE journal_entry_line_id IN (CAST(:receivableLineId AS bigint), CAST(:payableLineId AS bigint))',
        { receivableLineId, payableLineId },
      );
      if (lines.length < 2) {
        throw new ApiError(404, 'JOURNAL_LINE_NOT_FOUND', '선택한 분개라인이 존재하지 않습니다.');
      }
      for (const line of lines) {
        if (Number(line['partnerId']) !== partnerId) {
          throw fail('채권·채무 분개라인의 거래처가 선택한 거래처와 같아야 합니다.');
        }
      }
      const rows = await db.query(
        'INSERT INTO journal_settlement (receivable_line_id, payable_line_id, partner_id, settled_by_id, settled_at, ' +
          'settlement_amount, memo, created_at, updated_at) ' +
          'VALUES (CAST(:receivableLineId AS bigint), CAST(:payableLineId AS bigint), CAST(:partnerId AS bigint), ' +
          'CAST(:userId AS bigint), now(), CAST(:settlementAmount AS numeric), :memo, now(), now()) ' +
          'RETURNING journal_settlement_id AS "journalSettlementId"',
        { receivableLineId, payableLineId, partnerId, userId: user.id, settlementAmount, memo },
      );
      await db.execute(
        'UPDATE bank_transaction SET is_journalized = true, updated_at = now() ' +
          'WHERE bank_transaction_id = CAST(:bankTransactionId AS bigint)',
        { bankTransactionId },
      );
      return { journalSettlementId: Number(rows[0]['journalSettlementId']) };
    });
  }
}
