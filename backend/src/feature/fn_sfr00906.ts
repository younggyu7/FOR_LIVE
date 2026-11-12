import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const LOAN_TYPES = ['BORROWING', 'LENDING'];

function text(v: unknown): string {
  return v === undefined || v === null ? '' : String(v).trim();
}

function dateOf(v: unknown, label: string): string {
  const s = text(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${label}을(를) YYYY-MM-DD 형식으로 입력해 주세요.`);
  }
  return s;
}

function optionalId(v: unknown, label: string): string | null {
  const s = text(v);
  if (s === '') {
    return null;
  }
  if (!/^\d+$/.test(s)) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${label}은(는) 숫자여야 합니다.`);
  }
  return s;
}

function pageOf(q: Record<string, unknown>): { page: number; size: number } {
  const pageText = text(q['page']);
  const sizeText = text(q['size']);
  const page = pageText === '' ? 0 : Number(pageText);
  const size = sizeText === '' ? DEFAULT_SIZE : Number(sizeText);
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 쪽 크기를 확인해 주세요.');
  }
  return { page, size: Math.min(size, MAX_SIZE) };
}

function checkRange(startDate: string, endDate: string): void {
  // YYYY-MM-DD 형식은 글자 순서가 날짜 순서와 같다.
  if (startDate > endDate) {
    throw new ApiError(422, 'INVALID_DATE_RANGE', '조회 시작일이 종료일보다 늦을 수 없습니다.');
  }
}

@Controller('api/v1')
export class FnSfr00906Controller {
  @Get('/loan-statements')
  async listLoanStatements(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const startDate = dateOf(q['startDate'], '조회 시작일');
    const endDate = dateOf(q['endDate'], '조회 종료일');
    checkRange(startDate, endDate);
    const loanType = text(q['loanType']);
    if (!LOAN_TYPES.includes(loanType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '구분을 선택해 주세요.');
    }
    const partnerId = optionalId(q['partnerId'], '거래처');
    const { page, size } = pageOf(q);
    return transaction(async (db) => {
      const params = {
        startDate,
        endDate,
        loanType,
        partnerId,
        limit: size,
        offset: page * size,
      };
      const counted = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM loan l
          WHERE l.loan_type = :loanType
            AND l.loan_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)
            AND (CAST(:partnerId AS bigint) IS NULL OR l.partner_id = CAST(:partnerId AS bigint))`,
        params,
      );
      // 가정: 상환 합계는 기간 내 REPAYMENT 거래 금액 합계, 잔액은 원금 - 상환 합계
      const rows = await db.query(
        `SELECT s."loanId", s."partnerId", s."principalAmount", s."voucherStatus", s."repaidAmount",
                s."principalAmount" - s."repaidAmount" AS "balance"
           FROM (
                 SELECT l.loan_id AS "loanId",
                        l.partner_id AS "partnerId",
                        l.principal_amount AS "principalAmount",
                        l.voucher_status AS "voucherStatus",
                        COALESCE((SELECT SUM(t.amount)
                                    FROM loan_transaction t
                                   WHERE t.loan_id = l.loan_id
                                     AND t.transaction_type = 'REPAYMENT'
                                     AND t.transaction_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)), 0) AS "repaidAmount"
                   FROM loan l
                  WHERE l.loan_type = :loanType
                    AND l.loan_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)
                    AND (CAST(:partnerId AS bigint) IS NULL OR l.partner_id = CAST(:partnerId AS bigint))
                  ORDER BY l.loan_id DESC
                  LIMIT :limit OFFSET :offset
                ) s
          ORDER BY s."loanId" DESC`,
        params,
      );
      return { items: rows, page, size, total: Number(counted[0]['total']) };
    });
  }

  @Post('/loans/:loanId/process-voucher')
  @HttpCode(200)
  async processLoanVoucher(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const loanId = optionalId(req.params['loanId'], '차입금·대여금 ID');
    if (loanId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '차입금·대여금 ID가 필요합니다.');
    }
    return transaction(async (db) => {
      const loans = await db.query(
        `SELECT loan_id AS "loanId",
                partner_id AS "partnerId",
                account_subject_id AS "accountSubjectId",
                principal_amount AS "principalAmount",
                CAST(loan_date AS text) AS "loanDate",
                voucher_status AS "voucherStatus"
           FROM loan
          WHERE loan_id = CAST(:loanId AS bigint)
            FOR UPDATE`,
        { loanId },
      );
      if (loans.length === 0) {
        throw new ApiError(404, 'LOAN_NOT_FOUND', '대상 차입금·대여금을 찾을 수 없습니다.');
      }
      const loan = loans[0];
      if (loan['voucherStatus'] !== '미처리') {
        throw new ApiError(409, 'LOAN_ALREADY_PROCESSED', '이미 전표처리된 건입니다.');
      }
      const subjects = await db.query(
        'SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:id AS bigint)',
        { id: String(loan['accountSubjectId']) },
      );
      const partners = await db.query(
        'SELECT partner_id FROM partner WHERE partner_id = CAST(:id AS bigint)',
        { id: String(loan['partnerId']) },
      );
      // 가정: 전표의 결의서(expense_resolution_id)는 같은 거래처의 가장 최근 결의서로 정한다. 없으면 전표를 만들 수 없다.
      const resolutions = await db.query(
        `SELECT expense_resolution_id AS "expenseResolutionId"
           FROM expense_resolution
          WHERE partner_id = CAST(:partnerId AS bigint)
          ORDER BY expense_resolution_id DESC
          LIMIT 1`,
        { partnerId: String(loan['partnerId']) },
      );
      if (subjects.length === 0 || partners.length === 0 || resolutions.length === 0) {
        throw new ApiError(422, 'VOUCHER_MAPPING_MISSING', '전표 생성에 필요한 계정과목·거래처 정보가 없습니다.');
      }
      // 가정: 전표 일자는 현재 일자, 상태는 '신청'
      const entries = await db.query(
        `INSERT INTO journal_entry
                (expense_resolution_id, entry_date, status, total_debit_amount, total_credit_amount, summary, created_at, updated_at)
         VALUES (CAST(:resolutionId AS bigint), CAST(now() AS date), '신청', CAST(:amount AS numeric), CAST(:amount AS numeric), '차입금·대여금 전표처리', now(), now())
         RETURNING journal_entry_id AS "journalEntryId"`,
        {
          resolutionId: String(resolutions[0]['expenseResolutionId']),
          amount: String(loan['principalAmount']),
        },
      );
      const journalEntryId = Number(entries[0]['journalEntryId']);
      const linked = await db.execute(
        `UPDATE loan_transaction
            SET journal_entry_id = CAST(:journalEntryId AS bigint), updated_at = now()
          WHERE loan_id = CAST(:loanId AS bigint)
            AND transaction_type = 'OCCURRENCE'
            AND journal_entry_id IS NULL`,
        { journalEntryId: String(journalEntryId), loanId },
      );
      if (linked === 0) {
        await db.execute(
          `INSERT INTO loan_transaction
                  (loan_id, journal_entry_id, transaction_type, transaction_date, amount, balance_after, memo, created_at, updated_at)
           VALUES (CAST(:loanId AS bigint), CAST(:journalEntryId AS bigint), 'OCCURRENCE', CAST(:loanDate AS date),
                   CAST(:amount AS numeric), CAST(:amount AS numeric), '전표처리', now(), now())`,
          {
            loanId,
            journalEntryId: String(journalEntryId),
            loanDate: String(loan['loanDate']),
            amount: String(loan['principalAmount']),
          },
        );
      }
      await db.execute(
        `UPDATE loan
            SET voucher_status = '처리완료', updated_at = now()
          WHERE loan_id = CAST(:loanId AS bigint)`,
        { loanId },
      );
      return { journalEntryId, voucherStatus: '처리완료' };
    });
  }

  @Get('/loan-transactions')
  async listLoanTransactions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const startDate = dateOf(q['startDate'], '조회 시작일');
    const endDate = dateOf(q['endDate'], '조회 종료일');
    checkRange(startDate, endDate);
    const loanId = optionalId(q['loanId'], '차입금·대여금');
    const partnerId = optionalId(q['partnerId'], '거래처');
    const loanTypeText = text(q['loanType']);
    if (loanTypeText !== '' && !LOAN_TYPES.includes(loanTypeText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '구분 값이 올바르지 않습니다.');
    }
    const loanType = loanTypeText === '' ? null : loanTypeText;
    const { page, size } = pageOf(q);
    return transaction(async (db) => {
      const params = {
        startDate,
        endDate,
        loanId,
        partnerId,
        loanType,
        limit: size,
        offset: page * size,
      };
      const where = `t.transaction_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)
            AND (CAST(:loanId AS bigint) IS NULL OR t.loan_id = CAST(:loanId AS bigint))
            AND (CAST(:partnerId AS bigint) IS NULL OR l.partner_id = CAST(:partnerId AS bigint))
            AND (CAST(:loanType AS text) IS NULL OR l.loan_type = CAST(:loanType AS text))`;
      const counted = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM loan_transaction t
           JOIN loan l ON l.loan_id = t.loan_id
          WHERE ${where}`,
        params,
      );
      const rows = await db.query(
        `SELECT t.loan_transaction_id AS "loanTransactionId",
                t.transaction_type AS "transactionType",
                t.transaction_date AS "transactionDate",
                t.amount AS "amount",
                t.balance_after AS "balanceAfter",
                t.memo AS "memo"
           FROM loan_transaction t
           JOIN loan l ON l.loan_id = t.loan_id
          WHERE ${where}
          ORDER BY t.transaction_date, t.loan_transaction_id
          LIMIT :limit OFFSET :offset`,
        params,
      );
      return { items: rows, page, size, total: Number(counted[0]['total']) };
    });
  }
}
