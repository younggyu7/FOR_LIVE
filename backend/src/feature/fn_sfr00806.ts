import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 집계 단위를 보내지 않으면 월별로 묶는다.
const DEFAULT_UNIT = '월별';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^\d+$/;

// 가정: 거래처가 지정된 분개 라인만 거래처별 장부 대상이다. 전표 상태로는 거르지 않는다.
const FROM_WHERE = `
  FROM journal_entry_line l
  JOIN journal_entry e ON e.journal_entry_id = l.journal_entry_id
  WHERE l.partner_id IS NOT NULL
    AND e.entry_date >= CAST(:fromDate AS date)
    AND e.entry_date <= CAST(:toDate AS date)
    AND (CAST(:partnerId AS bigint) IS NULL OR l.partner_id = CAST(:partnerId AS bigint))
    AND (CAST(:accountSubjectId AS bigint) IS NULL OR l.account_subject_id = CAST(:accountSubjectId AS bigint))
`;

@Controller('api/v1')
export class FnSfr00806Controller {
  @Get('/partner-ledgers')
  async listPartnerLedgers(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const q = checks.queryOf(req.query);

    const text = (v: unknown): string => (v === undefined || v === null ? '' : String(v).trim());

    const fromDate = text(q['fromDate']);
    const toDate = text(q['toDate']);
    if (!DATE_PATTERN.test(fromDate) || !DATE_PATTERN.test(toDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 시작일과 종료일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }

    const partnerIdText = text(q['partnerId']);
    if (partnerIdText !== '' && !ID_PATTERN.test(partnerIdText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '거래처 ID는 숫자여야 합니다.');
    }
    const accountIdText = text(q['accountSubjectId']);
    if (accountIdText !== '' && !ID_PATTERN.test(accountIdText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '계정과목 ID는 숫자여야 합니다.');
    }

    const unit = text(q['aggregationUnit']) || DEFAULT_UNIT;
    if (unit !== '일별' && unit !== '월별') {
      throw new ApiError(400, 'VALIDATION_FAILED', '집계 단위는 일별 또는 월별이어야 합니다.');
    }
    const periodFormat = unit === '일별' ? 'YYYY-MM-DD' : 'YYYY-MM';

    const pageText = text(q['page']);
    const sizeText = text(q['size']);
    if ((pageText !== '' && !ID_PATTERN.test(pageText)) || (sizeText !== '' && !ID_PATTERN.test(sizeText))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 숫자여야 합니다.');
    }
    const page = pageText === '' ? 0 : Number(pageText);
    let size = sizeText === '' ? DEFAULT_SIZE : Number(sizeText);
    if (size < 1) {
      size = DEFAULT_SIZE;
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }

    return transaction(async (db) => {
      const period = await db.query(
        'SELECT CAST(:fromDate AS date) > CAST(:toDate AS date) AS "invalid"',
        { fromDate, toDate },
      );
      if (period[0] && period[0]['invalid'] === true) {
        throw new ApiError(422, 'INVALID_PERIOD', '조회 시작일이 종료일보다 늦을 수 없습니다.');
      }

      const params = {
        fromDate,
        toDate,
        partnerId: partnerIdText === '' ? null : partnerIdText,
        accountSubjectId: accountIdText === '' ? null : accountIdText,
        periodFormat,
      };

      const countRows = await db.query(
        `SELECT COUNT(*) AS "total" FROM (
          SELECT 1 ${FROM_WHERE}
          GROUP BY l.partner_id, l.account_subject_id, to_char(e.entry_date, :periodFormat)
        ) t`,
        params,
      );
      const total = Number(countRows[0] ? countRows[0]['total'] : 0);

      // 가정: 잔액은 거래처별로 구간 순서에 따른 (차변 - 대변) 누계다.
      const items = await db.query(
        `SELECT g.partner_id AS "partnerId",
                g.account_subject_id AS "accountSubjectId",
                g.debit_amount AS "debitAmount",
                g.credit_amount AS "creditAmount",
                SUM(g.debit_amount - g.credit_amount) OVER (
                  PARTITION BY g.partner_id
                  ORDER BY g.period, g.account_subject_id
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS "balance",
                g.period AS "aggregationPeriod"
         FROM (
           SELECT l.partner_id,
                  l.account_subject_id,
                  to_char(e.entry_date, :periodFormat) AS period,
                  SUM(l.debit_amount) AS debit_amount,
                  SUM(l.credit_amount) AS credit_amount
           ${FROM_WHERE}
           GROUP BY l.partner_id, l.account_subject_id, to_char(e.entry_date, :periodFormat)
         ) g
         ORDER BY g.partner_id, g.period, g.account_subject_id
         LIMIT :limit OFFSET :offset`,
        { ...params, limit: size, offset: page * size },
      );

      return { items, page, size, total };
    });
  }
}
