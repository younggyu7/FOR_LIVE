import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: size 기본 20, 최대 200
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 재무상태표에는 자산·부채·자본 계정만 포함한다
const BALANCE_SHEET_CATEGORIES = ['자산', '부채', '자본'];

function optionalId(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const text = String(value);
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '는 숫자여야 합니다.');
  }
  return text;
}

function optionalInt(value: unknown, label: string, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const text = String(value);
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '는 0 이상의 정수여야 합니다.');
  }
  return Number(text);
}

@Controller('api/v1')
export class FnSfr01003Controller {
  @Get('/management-balance-sheets')
  async listManagementBalanceSheets(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const baseDate = typeof query['baseDate'] === 'string' ? query['baseDate'].trim() : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(baseDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 기준일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    // TODO(질문): 전표·분개 라인에는 회계단위 연결 컬럼이 없어 accountingUnitId로 집계를 나눌 수 없다. 값 검사만 한다.
    const accountingUnitId = optionalId(query['accountingUnitId'], '회계단위');
    const projectId = optionalId(query['projectId'], '프로젝트 ID');
    const departmentId = optionalId(query['departmentId'], '부서 ID');
    const page = optionalInt(query['page'], 'page', 0);
    const size = Math.min(MAX_SIZE, Math.max(1, optionalInt(query['size'], 'size', DEFAULT_SIZE)));

    return transaction(async (db) => {
      const params = {
        baseDate,
        projectId,
        departmentId,
        categories: BALANCE_SHEET_CATEGORIES,
        limit: size,
        offset: page * size,
      };
      // 프로젝트·부서 기준은 분개 라인의 프로젝트와 그 프로젝트의 부서를 쓴다
      const base = `
        FROM journal_entry_line l
        JOIN journal_entry e ON e.journal_entry_id = l.journal_entry_id
        JOIN account_subject a ON a.account_subject_id = l.account_subject_id
        LEFT JOIN project p ON p.project_id = l.project_id
        WHERE e.entry_date <= CAST(:baseDate AS date)
          AND a.category = ANY(CAST(:categories AS text[]))
          AND (CAST(:projectId AS bigint) IS NULL OR l.project_id = CAST(:projectId AS bigint))
          AND (CAST(:departmentId AS bigint) IS NULL OR p.department_id = CAST(:departmentId AS bigint))
      `;
      const items = await db.query(
        `SELECT a.account_subject_id AS "accountSubjectId",
                a.name AS "accountSubjectName",
                a.category AS "category",
                CAST(SUM(l.debit_amount - l.credit_amount) AS numeric) AS "amount"
         ${base}
         GROUP BY a.account_subject_id, a.name, a.category
         ORDER BY a.code
         LIMIT :limit OFFSET :offset`,
        params,
      );
      const totalRows = await db.query(
        `SELECT COUNT(*) AS "total" FROM (
           SELECT a.account_subject_id
           ${base}
           GROUP BY a.account_subject_id
         ) t`,
        params,
      );
      const total = Number(totalRows[0]?.['total'] ?? 0);
      return { items, page, size, total };
    });
  }
}
