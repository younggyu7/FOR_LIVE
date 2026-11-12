import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 조회 유형 값은 명세에 코드가 없어 화면에 보이는 한국어 이름 그대로 쓴다.
const LEDGER_TYPES = [
  '관리항목 원장',
  '관리내역',
  '멀티 관리내역',
  '적요별 원장',
  '품의내역별 원장',
  '증빙별 원장',
  '프로젝트별 계정내역',
];
const MULTI_TYPE = '멀티 관리내역';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const INT_RE = /^\d+$/;

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function idList(v: unknown): string[] {
  const raw: string[] = Array.isArray(v)
    ? v.map((x) => String(x))
    : typeof v === 'string'
      ? v.split(',')
      : [];
  return raw.map((x) => x.trim()).filter((x) => x !== '');
}

function validation(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

@Controller('api/v1')
export class FnSfr00807Controller {
  @Get('/management-item-ledgers')
  async listManagementItemLedgers(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const q = checks.queryOf(req.query);

    const ledgerType = text(q['ledgerType']);
    if (!LEDGER_TYPES.includes(ledgerType)) {
      throw validation('조회 유형을 선택해 주세요.');
    }
    const startDate = text(q['startDate']);
    const endDate = text(q['endDate']);
    if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
      throw validation('조회 시작일과 종료일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }

    const itemIds = idList(q['managementItemIds']);
    if (itemIds.some((x) => !INT_RE.test(x))) {
      throw validation('관리항목 ID는 숫자여야 합니다.');
    }
    const uniqueItemIds = Array.from(new Set(itemIds));
    if (ledgerType === MULTI_TYPE && uniqueItemIds.length < 2) {
      throw validation('멀티 관리내역은 관리항목을 둘 이상 선택해 주세요.');
    }

    const projectId = text(q['projectId']);
    if (projectId !== '' && !INT_RE.test(projectId)) {
      throw validation('프로젝트 ID는 숫자여야 합니다.');
    }
    const accountSubjectId = text(q['accountSubjectId']);
    if (accountSubjectId !== '' && !INT_RE.test(accountSubjectId)) {
      throw validation('계정과목 ID는 숫자여야 합니다.');
    }

    const pageText = text(q['page']);
    const sizeText = text(q['size']);
    if ((pageText !== '' && !INT_RE.test(pageText)) || (sizeText !== '' && !INT_RE.test(sizeText))) {
      throw validation('page와 size는 0 이상의 숫자여야 합니다.');
    }
    const page = pageText === '' ? 0 : Number(pageText);
    const size = Math.min(MAX_SIZE, sizeText === '' ? DEFAULT_SIZE : Math.max(1, Number(sizeText)));

    return transaction(async (db) => {
      const params: Record<string, unknown> = {
        startDate,
        endDate,
        limit: size,
        offset: page * size,
      };

      const periodRows = await db.query(
        'SELECT CAST(:startDate AS date) > CAST(:endDate AS date) AS "invalid"',
        { startDate, endDate },
      );
      if (periodRows[0] && periodRows[0].invalid) {
        throw new ApiError(422, 'INVALID_PERIOD', '조회 기간이 올바르지 않습니다. 시작일이 종료일보다 늦을 수 없습니다.');
      }

      let where =
        ' WHERE e.entry_date >= CAST(:startDate AS date) AND e.entry_date <= CAST(:endDate AS date)';
      if (projectId !== '') {
        where += ' AND l.project_id = CAST(:projectId AS bigint)';
        params['projectId'] = projectId;
      }
      if (accountSubjectId !== '') {
        where += ' AND l.account_subject_id = CAST(:accountSubjectId AS bigint)';
        params['accountSubjectId'] = accountSubjectId;
      }
      if (uniqueItemIds.length > 0) {
        const holders: string[] = [];
        uniqueItemIds.forEach((id, i) => {
          params['itemId' + i] = id;
          holders.push('CAST(:itemId' + i + ' AS bigint)');
        });
        const inList = holders.join(', ');
        where += ' AND v.management_item_id IN (' + inList + ')';
        if (ledgerType === MULTI_TYPE) {
          // 멀티 관리내역: 선택한 관리항목 값을 모두 가진 분개 라인만 조합해 조회한다.
          where +=
            ' AND l.journal_entry_line_id IN (' +
            'SELECT mv.journal_entry_line_id FROM journal_line_management_value mv' +
            ' WHERE mv.management_item_id IN (' + inList + ')' +
            ' GROUP BY mv.journal_entry_line_id' +
            ' HAVING COUNT(DISTINCT mv.management_item_id) = ' + uniqueItemIds.length + ')';
        }
      }

      let orderBy = ' ORDER BY e.entry_date, l.journal_entry_line_id, v.management_item_id';
      if (ledgerType === '적요별 원장') {
        orderBy = ' ORDER BY l.summary, e.entry_date, l.journal_entry_line_id';
      } else if (ledgerType === '프로젝트별 계정내역') {
        orderBy = ' ORDER BY l.project_id, l.account_subject_id, e.entry_date, l.journal_entry_line_id';
      }

      const from =
        ' FROM journal_entry_line l' +
        ' JOIN journal_entry e ON e.journal_entry_id = l.journal_entry_id' +
        ' LEFT JOIN journal_line_management_value v ON v.journal_entry_line_id = l.journal_entry_line_id';

      // 가정: balance는 같은 관리항목 안에서 차변 합계 - 대변 합계이다.
      const items = await db.query(
        'SELECT l.journal_entry_line_id AS "entryLineId",' +
          ' l.account_subject_id AS "accountSubjectId",' +
          ' l.project_id AS "projectId",' +
          ' l.summary AS "summary",' +
          ' l.debit_amount AS "debitAmount",' +
          ' l.credit_amount AS "creditAmount",' +
          ' v.management_item_id AS "managementItemId",' +
          ' v.item_value AS "itemValue",' +
          ' SUM(l.debit_amount - l.credit_amount) OVER (PARTITION BY v.management_item_id) AS "balance"' +
          from +
          where +
          orderBy +
          ' LIMIT :limit OFFSET :offset',
        params,
      );

      const countParams: Record<string, unknown> = { ...params };
      delete countParams['limit'];
      delete countParams['offset'];
      const countRows = await db.query('SELECT COUNT(*) AS "total"' + from + where, countParams);
      const total = Number(countRows[0] ? countRows[0].total : 0);

      return { items, page, size, total };
    });
  }
}
