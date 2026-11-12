import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 목록 size 기본값 20, 최대 200
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const VIEW_STATEMENT = '손익계산서';
const VIEW_ALLOCATION = '안분 현황';

// 가정: 집계 대상 전표는 반려·승인 취소 상태를 제외한다 (원문에 집계 대상 상태가 없음)
const STATEMENT_SQL = [
  'SELECT a.name AS "accountSubjectName", a.category AS "category",',
  'p.name AS "projectName", d.name AS "departmentName",',
  "COALESCE(SUM(CASE WHEN a.category = '수익' THEN l.credit_amount - l.debit_amount ELSE 0 END), 0) AS \"revenueAmount\",",
  "COALESCE(SUM(CASE WHEN a.category = '비용' THEN l.debit_amount - l.credit_amount ELSE 0 END), 0) AS \"expenseAmount\",",
  "COALESCE(SUM(CASE WHEN a.category = '수익' THEN l.credit_amount - l.debit_amount ELSE 0 END), 0)",
  "- COALESCE(SUM(CASE WHEN a.category = '비용' THEN l.debit_amount - l.credit_amount ELSE 0 END), 0) AS \"profitAmount\",",
  'CAST(NULL AS varchar) AS "allocationRuleName", CAST(NULL AS numeric) AS "allocatedAmount"',
  'FROM journal_entry_line l',
  'JOIN journal_entry j ON j.journal_entry_id = l.journal_entry_id',
  'JOIN account_subject a ON a.account_subject_id = l.account_subject_id',
  'LEFT JOIN project p ON p.project_id = l.project_id',
  'LEFT JOIN department d ON d.department_id = p.department_id',
  "WHERE a.category IN ('수익', '비용')",
  'AND j.entry_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)',
  "AND j.status NOT IN ('반려', '승인 취소')",
  'AND (CAST(:projectId AS bigint) IS NULL OR l.project_id = CAST(:projectId AS bigint))',
  'AND (CAST(:departmentId AS bigint) IS NULL OR p.department_id = CAST(:departmentId AS bigint))',
  'GROUP BY a.account_subject_id, a.name, a.category, p.project_id, p.name, d.department_id, d.name',
].join(' ');

const STATEMENT_ORDER = ' ORDER BY x."accountSubjectName", x."projectName", x."departmentName"';

// 안분 금액: 개발 담당자가 정한다 (결정).
// 비율(RATIO)은 안분 대상 범위의 기간 손익에 비율을 곱하고, 정액(FIXED_AMOUNT)은 설정한 안분 금액을 그대로 쓴다. 가정
const ALLOCATION_SQL = [
  'SELECT CAST(NULL AS varchar) AS "accountSubjectName", CAST(NULL AS varchar) AS "category",',
  'p.name AS "projectName", d.name AS "departmentName",',
  't.rev AS "revenueAmount", t.exp AS "expenseAmount", t.rev - t.exp AS "profitAmount",',
  'r.rule_name AS "allocationRuleName",',
  "CASE WHEN r.allocation_method = 'RATIO' THEN ROUND((t.rev - t.exp) * r.allocation_ratio / 100, 2)",
  'ELSE r.allocation_amount END AS "allocatedAmount"',
  'FROM allocation_rule r',
  'LEFT JOIN project p ON p.project_id = r.project_id',
  'LEFT JOIN department d ON d.department_id = r.department_id',
  'LEFT JOIN LATERAL (',
  "SELECT COALESCE(SUM(CASE WHEN a.category = '수익' THEN l.credit_amount - l.debit_amount ELSE 0 END), 0) AS rev,",
  "COALESCE(SUM(CASE WHEN a.category = '비용' THEN l.debit_amount - l.credit_amount ELSE 0 END), 0) AS exp",
  'FROM journal_entry_line l',
  'JOIN journal_entry j ON j.journal_entry_id = l.journal_entry_id',
  'JOIN account_subject a ON a.account_subject_id = l.account_subject_id',
  'LEFT JOIN project lp ON lp.project_id = l.project_id',
  'WHERE j.entry_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)',
  "AND j.status NOT IN ('반려', '승인 취소')",
  'AND (r.project_id IS NULL OR l.project_id = r.project_id)',
  'AND (r.department_id IS NULL OR lp.department_id = r.department_id)',
  ') t ON true',
  "WHERE r.use_status = '사용'",
  'AND (CAST(:projectId AS bigint) IS NULL OR r.project_id = CAST(:projectId AS bigint))',
  'AND (CAST(:departmentId AS bigint) IS NULL OR r.department_id = CAST(:departmentId AS bigint))',
].join(' ');

const ALLOCATION_ORDER = ' ORDER BY x."allocationRuleName"';

function textOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function idOf(value: unknown, label: string): string | null {
  const text = textOf(value);
  if (text === '') {
    return null;
  }
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
  return text;
}

function intOf(value: unknown, fallback: number, label: string): number {
  const text = textOf(value);
  if (text === '') {
    return fallback;
  }
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
  return Number(text);
}

@Controller('api/v1')
export class FnSfr01004Controller {
  @Get('/management-income-statements')
  async listManagementIncomeStatements(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const q = checks.queryOf(req.query);
    const viewType = textOf(q['viewType']);
    if (viewType !== VIEW_STATEMENT && viewType !== VIEW_ALLOCATION) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 구분을 선택해 주세요.');
    }
    const startDate = textOf(q['startDate']);
    const endDate = textOf(q['endDate']);
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
      throw new ApiError(422, 'INVALID_PERIOD', '조회 기간을 올바르게 입력해 주세요.');
    }
    const projectId = idOf(q['projectId'], '프로젝트');
    const departmentId = idOf(q['departmentId'], '부서');
    const page = intOf(q['page'], 0, '쪽 번호');
    let size = intOf(q['size'], DEFAULT_SIZE, '쪽 크기');
    if (size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기는 1 이상이어야 합니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    return transaction(async (db) => {
      const periodRows = await db.query(
        'SELECT CAST(:startDate AS date) > CAST(:endDate AS date) AS "invalid"',
        { startDate, endDate },
      );
      if (periodRows[0] && periodRows[0]['invalid'] === true) {
        throw new ApiError(422, 'INVALID_PERIOD', '시작일은 종료일보다 늦을 수 없습니다.');
      }
      const baseSql = viewType === VIEW_STATEMENT ? STATEMENT_SQL : ALLOCATION_SQL;
      const orderSql = viewType === VIEW_STATEMENT ? STATEMENT_ORDER : ALLOCATION_ORDER;
      const filterParams = { startDate, endDate, projectId, departmentId };
      const countRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM (' + baseSql + ') x',
        filterParams,
      );
      const items = await db.query(
        'SELECT x.* FROM (' + baseSql + ') x' + orderSql + ' LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { ...filterParams, size, offset: page * size },
      );
      const total = countRows[0] ? Number(countRows[0]['total']) : 0;
      return { items, page, size, total };
    });
  }
}
