import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '급여 담당자';
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 200;

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function numberOf(v: unknown): number {
  if (typeof v === 'number') {
    return v;
  }
  if (typeof v === 'string' && v.trim() !== '') {
    return Number(v);
  }
  return NaN;
}

function intOf(v: unknown, label: string): number {
  const n = numberOf(v);
  if (!Number.isInteger(n)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return n;
}

function pagingOf(query: Record<string, unknown>): { page: number; size: number } {
  const page = isBlank(query['page']) ? 0 : intOf(query['page'], '페이지');
  const size = isBlank(query['size']) ? DEFAULT_PAGE_SIZE : intOf(query['size'], '페이지 크기');
  if (page < 0 || size < 1) {
    throw new ApiError(400, 'VALIDATION_FAILED', '페이지 값이 올바르지 않습니다.');
  }
  return { page, size: Math.min(size, MAX_PAGE_SIZE) };
}

@Controller('api/v1')
export class FnSfr02308Controller {
  @Post('/year-end-installments')
  @HttpCode(200)
  async createYearEndInstallment(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);

    if (isBlank(data['yearEndResultId']) || isBlank(data['installmentNo']) || isBlank(data['installmentAmount'])) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연말정산 결과, 분납 회차, 분납 금액은 꼭 입력해야 합니다.');
    }
    const resultId = intOf(data['yearEndResultId'], '연말정산 결과');
    const installmentNo = intOf(data['installmentNo'], '분납 회차');
    const amount = numberOf(data['installmentAmount']);
    if (installmentNo < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '분납 회차는 1 이상이어야 합니다.');
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '분납 금액은 0보다 큰 숫자여야 합니다.');
    }
    const dueDate = isBlank(data['dueDate']) ? null : String(data['dueDate']);

    return transaction(async (db) => {
      const results = await db.query(
        'SELECT payable_tax_amount AS "payable", closing_status AS "closingStatus" '
          + 'FROM year_end_result WHERE year_end_result_id = CAST(:resultId AS bigint) FOR UPDATE',
        { resultId },
      );
      if (results.length === 0) {
        throw new ApiError(404, 'YEAR_END_RESULT_NOT_FOUND', '연말정산 결과를 찾을 수 없습니다.');
      }
      const result = results[0];

      // 가정: 마감된 정산 결과는 수정할 수 없다 (schema.sql 마감 상태 설명).
      if (result['closingStatus'] === '마감') {
        throw new ApiError(409, 'INVALID_STATE', '마감된 정산 결과에는 분납을 입력할 수 없습니다.');
      }

      const dup = await db.query(
        'SELECT year_end_installment_id AS "id" FROM year_end_installment '
          + 'WHERE year_end_result_id = CAST(:resultId AS bigint) AND installment_no = CAST(:installmentNo AS integer)',
        { resultId, installmentNo },
      );
      if (dup.length > 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '이미 입력된 분납 회차입니다.');
      }

      const sums = await db.query(
        'SELECT COALESCE(SUM(installment_amount), 0) AS "total" FROM year_end_installment '
          + 'WHERE year_end_result_id = CAST(:resultId AS bigint)',
        { resultId },
      );

      // 가정: 회차를 한 건씩 입력하므로 합계가 납부세액을 넘으면 불일치로 거절한다.
      // 분납 횟수 한도는 관련 법령 기준을 따르며 여기서는 검사하지 않는다 (가정).
      const payable = result['payable'] === null || result['payable'] === undefined ? 0 : Number(result['payable']);
      const total = Number(sums[0]['total']) + amount;
      if (Math.round(total * 100) > Math.round(payable * 100)) {
        throw new ApiError(422, 'INSTALLMENT_SUM_MISMATCH', '분납액 합계가 납부세액과 일치하지 않습니다.');
      }

      const rows = await db.query(
        'INSERT INTO year_end_installment '
          + '(year_end_result_id, installment_no, installment_amount, due_date, created_at, updated_at) '
          + 'VALUES (CAST(:resultId AS bigint), CAST(:installmentNo AS integer), CAST(:amount AS numeric), '
          + 'CAST(:dueDate AS date), now(), now()) '
          + 'RETURNING year_end_installment_id AS "yearEndInstallmentId"',
        { resultId, installmentNo, amount, dueDate },
      );
      return rows[0];
    });
  }

  @Get('/year-end-installments')
  async listYearEndInstallments(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const { page, size } = pagingOf(query);
    const resultId = isBlank(query['yearEndResultId']) ? null : intOf(query['yearEndResultId'], '연말정산 결과');

    return transaction(async (db) => {
      const params = { resultId, limit: size, offset: page * size };
      const items = await db.query(
        'SELECT year_end_installment_id AS "yearEndInstallmentId", installment_no AS "installmentNo", '
          + 'installment_amount AS "installmentAmount", due_date AS "dueDate" '
          + 'FROM year_end_installment '
          + 'WHERE (CAST(:resultId AS bigint) IS NULL OR year_end_result_id = CAST(:resultId AS bigint)) '
          + 'ORDER BY year_end_result_id, installment_no LIMIT :limit OFFSET :offset',
        params,
      );
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM year_end_installment '
          + 'WHERE (CAST(:resultId AS bigint) IS NULL OR year_end_result_id = CAST(:resultId AS bigint))',
        { resultId },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Get('/year-end-results')
  async listYearEndResults(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const { page, size } = pagingOf(query);
    const targetYear = isBlank(query['targetYear']) ? null : intOf(query['targetYear'], '정산 대상 연도');
    const departmentId = isBlank(query['departmentId']) ? null : intOf(query['departmentId'], '부서');

    return transaction(async (db) => {
      const where = 'WHERE (CAST(:targetYear AS integer) IS NULL OR r.target_year = CAST(:targetYear AS integer)) '
        + 'AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint)) ';
      const items = await db.query(
        'SELECT r.year_end_result_id AS "yearEndResultId", r.employee_id AS "employeeId", '
          + 'r.target_year AS "targetYear", r.payable_tax_amount AS "payableTaxAmount", '
          + 'r.closing_status AS "closingStatus" '
          + 'FROM year_end_result r JOIN employee e ON e.employee_id = r.employee_id '
          + where
          + 'ORDER BY r.target_year DESC, r.year_end_result_id LIMIT :limit OFFSET :offset',
        { targetYear, departmentId, limit: size, offset: page * size },
      );
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM year_end_result r JOIN employee e ON e.employee_id = r.employee_id ' + where,
        { targetYear, departmentId },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }
}
