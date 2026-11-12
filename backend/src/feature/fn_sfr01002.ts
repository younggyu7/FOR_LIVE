import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 재무제표 종류별 집계 대상 계정 구분은 스펙에 없어 일반적인 회계 관행으로 정했다.
const ALL_CATEGORIES = ['자산', '부채', '자본', '수익', '비용'];
const STATEMENT_CATEGORIES: Record<string, string[]> = {
  '합계잔액시산표': ALL_CATEGORIES,
  '원가보고서': ['비용'],
  '손익계산서': ['수익', '비용'],
  '이익잉여금처분계산서': ['자본'],
  '재무상태표': ['자산', '부채', '자본'],
  '자본변동표': ['자본'],
  '현금흐름표': ['자산', '부채'],
  '결산부속명세서': ALL_CATEGORIES,
  '기간비용 현황': ['비용'],
};
// 가정: 전표는 '승인' 상태인 것만 집계한다. 회계단위 조건은 결산자료에만 적용한다.
const JOURNAL_STATUS = '승인';
const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const MAX_SIZE = 200;

const FROM_WHERE = `
  FROM account_subject a
  WHERE a.category IN (:c0, :c1, :c2, :c3, :c4)
    AND (
      EXISTS (
        SELECT 1
        FROM journal_entry_line l
        JOIN journal_entry j ON j.journal_entry_id = l.journal_entry_id
        WHERE l.account_subject_id = a.account_subject_id
          AND j.status = :journalStatus
          AND to_char(j.entry_date, 'YYYY-MM') BETWEEN :startPeriod AND :endPeriod
      )
      OR EXISTS (
        SELECT 1
        FROM closing_data c
        WHERE c.account_subject_id = a.account_subject_id
          AND c.closing_period BETWEEN :startPeriod AND :endPeriod
          AND (CAST(:unitId AS bigint) IS NULL OR c.accounting_unit_id = CAST(:unitId AS bigint))
      )
    )
`;

function text(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

function toInt(value: unknown, fallback: number): number {
  const raw = text(value);
  if (raw === '') {
    return fallback;
  }
  if (!/^\d+$/.test(raw)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 쪽 크기는 숫자여야 합니다.');
  }
  return Number(raw);
}

@Controller('api/v1')
export class FnSfr01002Controller {
  @Get('/financial-statements')
  async listFinancialStatements(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const statementType = text(query['statementType']);
    const startPeriod = text(query['startPeriod']);
    const endPeriod = text(query['endPeriod']);
    const unitRaw = text(query['accountingUnitId']);
    if (statementType === '' || startPeriod === '' || endPeriod === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '재무제표 종류와 조회 기간을 입력해 주세요.');
    }
    const categories = STATEMENT_CATEGORIES[statementType];
    if (!categories) {
      throw new ApiError(400, 'VALIDATION_FAILED', '지원하지 않는 재무제표 종류입니다.');
    }
    if (!PERIOD_PATTERN.test(startPeriod) || !PERIOD_PATTERN.test(endPeriod)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '회계기간은 YYYY-MM 형식으로 입력해 주세요.');
    }
    if (unitRaw !== '' && !/^\d+$/.test(unitRaw)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '회계단위가 올바르지 않습니다.');
    }
    if (startPeriod > endPeriod) {
      throw new ApiError(422, 'INVALID_PERIOD', '조회 시작 기간이 종료 기간보다 늦을 수 없습니다.');
    }
    const page = toInt(query['page'], 0);
    let size = toInt(query['size'], 20);
    if (size < 1) {
      size = 20;
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    const params: Record<string, unknown> = {
      c0: categories[0],
      c1: categories[1] ?? categories[0],
      c2: categories[2] ?? categories[0],
      c3: categories[3] ?? categories[0],
      c4: categories[4] ?? categories[0],
      journalStatus: JOURNAL_STATUS,
      startPeriod,
      endPeriod,
      unitId: unitRaw === '' ? null : unitRaw,
    };
    return transaction(async (db) => {
      const countRows = await db.query(
        `SELECT CAST(COUNT(*) AS integer) AS "total" ${FROM_WHERE}`,
        params,
      );
      const total = Number(countRows[0]?.total ?? 0);
      const items = await db.query(
        `SELECT
  a.account_subject_id AS "accountSubjectId",
  a.name AS "accountSubjectName",
  CAST(
    COALESCE((
      SELECT SUM(
        CASE WHEN a.category IN ('자산', '비용')
          THEN l2.debit_amount - l2.credit_amount
          ELSE l2.credit_amount - l2.debit_amount
        END
      )
      FROM journal_entry_line l2
      JOIN journal_entry j2 ON j2.journal_entry_id = l2.journal_entry_id
      WHERE l2.account_subject_id = a.account_subject_id
        AND j2.status = :journalStatus
        AND to_char(j2.entry_date, 'YYYY-MM') BETWEEN :startPeriod AND :endPeriod
    ), 0)
    + COALESCE((
      SELECT SUM(c2.closing_amount)
      FROM closing_data c2
      WHERE c2.account_subject_id = a.account_subject_id
        AND c2.closing_period BETWEEN :startPeriod AND :endPeriod
        AND (CAST(:unitId AS bigint) IS NULL OR c2.accounting_unit_id = CAST(:unitId AS bigint))
    ), 0)
    AS double precision
  ) AS "amount"
${FROM_WHERE}
ORDER BY a.code
LIMIT :limit OFFSET :offset`,
        { ...params, limit: size, offset: page * size },
      );
      return { items, page, size, total };
    });
  }
}
