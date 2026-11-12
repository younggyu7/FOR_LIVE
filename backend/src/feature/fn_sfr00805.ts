import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const LEDGER_TYPES = [
  '분개장',
  '일계표',
  '월계표',
  '총계정원장',
  '현금출납장',
  '계정별 원장',
  '주요계정 증감 현황',
  '계정별 변동추이',
  '관리항목 상세 원장',
];
const MANAGEMENT_LEDGER = '관리항목 상세 원장';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function textOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function wholeNumber(value: unknown, label: string): number | null {
  const text = textOf(value);
  if (text === '') {
    return null;
  }
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
  return Number(text);
}

@Controller('api/v1')
export class FnSfr00805Controller {
  @Get('/account-ledgers')
  async listAccountLedgers(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const fromDate = textOf(query['fromDate']);
    const toDate = textOf(query['toDate']);
    const ledgerType = textOf(query['ledgerType']);
    if (!DATE_PATTERN.test(fromDate) || !DATE_PATTERN.test(toDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 기간을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    if (!LEDGER_TYPES.includes(ledgerType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '장부 종류를 선택해 주세요.');
    }
    const accountSubjectId = wholeNumber(query['accountSubjectId'], '계정과목');
    const managementItemId = wholeNumber(query['managementItemId'], '관리항목');
    const page = wholeNumber(query['page'], '페이지') ?? 0;
    let size = wholeNumber(query['size'], '크기') ?? DEFAULT_SIZE;
    if (size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '크기는 1 이상이어야 합니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    if (ledgerType === MANAGEMENT_LEDGER && managementItemId === null) {
      throw new ApiError(422, 'MANAGEMENT_ITEM_REQUIRED', '관리항목 상세 원장은 관리항목을 지정해야 조회할 수 있습니다.');
    }

    return transaction(async (db) => {
      const period = await db.query(
        'SELECT CAST(:fromDate AS date) > CAST(:toDate AS date) AS "invalid"',
        { fromDate, toDate },
      );
      if (period[0] && period[0].invalid) {
        throw new ApiError(422, 'INVALID_PERIOD', '조회 시작일은 종료일보다 늦을 수 없습니다.');
      }

      const params: Record<string, unknown> = { fromDate, toDate };
      let joinManagement = '';
      let itemColumn = 'CAST(NULL AS varchar)';
      let accountCondition = '';
      if (managementItemId !== null) {
        joinManagement =
          'JOIN journal_line_management_value v ON v.journal_entry_line_id = l.journal_entry_line_id ' +
          'AND v.management_item_id = CAST(:managementItemId AS bigint)';
        itemColumn = 'v.item_value';
        params['managementItemId'] = managementItemId;
      }
      if (accountSubjectId !== null) {
        accountCondition = 'AND l.account_subject_id = CAST(:accountSubjectId AS bigint)';
        params['accountSubjectId'] = accountSubjectId;
      }
      const fromWhere =
        'FROM journal_entry_line l ' +
        'JOIN journal_entry e ON e.journal_entry_id = l.journal_entry_id ' +
        joinManagement +
        ' WHERE e.entry_date >= CAST(:fromDate AS date) AND e.entry_date <= CAST(:toDate AS date) ' +
        accountCondition;

      const counted = await db.query('SELECT COUNT(*) AS "total" ' + fromWhere, params);
      const total = Number(counted[0].total);

      // 가정: 잔액은 조회 기간 내 (차변 - 대변) 누계이며 전표 일자·전표·라인 순서로 쌓는다.
      // 가정: 장부 종류별 별도 집계 없이 모든 종류를 같은 전표 라인 목록으로 조회한다.
      const items = await db.query(
        'SELECT e.entry_date AS "entryDate", ' +
          'l.account_subject_id AS "accountSubjectId", ' +
          'l.debit_amount AS "debitAmount", ' +
          'l.credit_amount AS "creditAmount", ' +
          itemColumn +
          ' AS "itemValue", ' +
          'SUM(l.debit_amount - l.credit_amount) OVER (ORDER BY e.entry_date, e.journal_entry_id, l.line_no, l.journal_entry_line_id) AS "balance" ' +
          fromWhere +
          ' ORDER BY e.entry_date, e.journal_entry_id, l.line_no, l.journal_entry_line_id ' +
          'LIMIT :size OFFSET :offset',
        { ...params, size, offset: page * size },
      );
      return { items, page, size, total };
    });
  }
}
