import { Controller, HttpCode, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 연말정산 세액 계산 산식이 스펙에 없어 아래 상수와 단순 산식을 쓴다.
// 총급여 = '총급여' 분류 항목 금액 합계, 기납부세액 = '기납부세액' 분류 항목 금액 합계,
// 공제 합계 = 그 밖의 항목 금액 합계 (항목 한도액이 있으면 한도까지만 인정),
// 결정세액 = (총급여 - 공제 합계) x 세율 (0 미만이면 0), 납부세액 = 결정세액 - 기납부세액.
const SALARY_CATEGORY = '총급여';
const PAID_TAX_CATEGORY = '기납부세액';
const TAX_RATE = 0.06;

interface Db {
  query: (sql: string, params?: Record<string, unknown>) => Promise<any[]>;
}

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function requiredText(v: unknown, label: string, max: number): string {
  if (typeof v !== 'string' || v.trim() === '') {
    throw invalid(label + '을(를) 입력해 주세요.');
  }
  if (v.length > max) {
    throw invalid(label + '은(는) ' + max + '자 이하로 입력해 주세요.');
  }
  return v;
}

function optionalText(v: unknown, label: string, max: number): string | null {
  if (isBlank(v)) {
    return null;
  }
  if (typeof v !== 'string' || v.length > max) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  return v;
}

function optionalNumber(v: unknown, label: string): number | null {
  if (isBlank(v)) {
    return null;
  }
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw invalid(label + '은(는) 숫자여야 합니다.');
  }
  return v;
}

function optionalInt(v: unknown, label: string): number | null {
  const n = optionalNumber(v, label);
  if (n !== null && !Number.isInteger(n)) {
    throw invalid(label + '은(는) 정수여야 합니다.');
  }
  return n;
}

function requiredId(v: unknown, label: string): number {
  if (typeof v !== 'number' || !Number.isInteger(v) || v <= 0) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  return v;
}

function pathId(v: unknown, label: string): string {
  if (typeof v !== 'string' || !/^[0-9]+$/.test(v)) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  return v;
}

function parseItem(data: Record<string, unknown>) {
  const code = requiredText(data['code'], '항목 코드', 30);
  const name = requiredText(data['name'], '항목명', 100);
  const category = optionalText(data['category'], '항목 분류', 50);
  const limitAmount = optionalNumber(data['limitAmount'], '공제 한도액');
  if (limitAmount !== null && limitAmount < 0) {
    throw invalid('공제 한도액은 0 이상이어야 합니다.');
  }
  const sortOrder = optionalInt(data['sortOrder'], '정렬 순서');
  const useYn = data['useYn'];
  if (useYn !== '사용' && useYn !== '미사용') {
    throw invalid('사용 여부는 사용 또는 미사용이어야 합니다.');
  }
  return { code, name, category, limitAmount, sortOrder, useYn };
}

async function recalculate(db: Db, employeeId: string | number, targetYear: string | number) {
  const sums = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN i.category = :salaryCategory THEN COALESCE(d.amount, 0) END), 0) AS "salary",
       COALESCE(SUM(CASE WHEN i.category = :paidCategory THEN COALESCE(d.amount, 0) END), 0) AS "paid",
       COALESCE(SUM(CASE WHEN COALESCE(i.category, '') NOT IN (:salaryCategory, :paidCategory)
         THEN LEAST(COALESCE(d.amount, 0), COALESCE(i.limit_amount, COALESCE(d.amount, 0))) END), 0) AS "deduction"
     FROM year_end_data d
     JOIN year_end_item i ON i.year_end_item_id = d.year_end_item_id
     WHERE d.employee_id = CAST(:employeeId AS bigint)
       AND d.target_year = CAST(:targetYear AS integer)`,
    {
      salaryCategory: SALARY_CATEGORY,
      paidCategory: PAID_TAX_CATEGORY,
      employeeId: String(employeeId),
      targetYear: String(targetYear),
    },
  );
  const salary = Number(sums[0].salary);
  const paid = Number(sums[0].paid);
  const deduction = Number(sums[0].deduction);
  const determined = Math.max(Math.round((salary - deduction) * TAX_RATE), 0);
  const payable = determined - paid;
  const rows = await db.query(
    `INSERT INTO year_end_result
       (employee_id, target_year, total_salary_amount, determined_tax_amount, paid_tax_amount, payable_tax_amount, closing_status, created_at, updated_at)
     VALUES
       (CAST(:employeeId AS bigint), CAST(:targetYear AS integer), CAST(:salary AS numeric), CAST(:determined AS numeric),
        CAST(:paid AS numeric), CAST(:payable AS numeric), '신청', now(), now())
     ON CONFLICT (employee_id, target_year) DO UPDATE SET
       total_salary_amount = EXCLUDED.total_salary_amount,
       determined_tax_amount = EXCLUDED.determined_tax_amount,
       paid_tax_amount = EXCLUDED.paid_tax_amount,
       payable_tax_amount = EXCLUDED.payable_tax_amount,
       updated_at = now()
     RETURNING determined_tax_amount AS "determinedTaxAmount", paid_tax_amount AS "paidTaxAmount", payable_tax_amount AS "payableTaxAmount"`,
    {
      employeeId: String(employeeId),
      targetYear: String(targetYear),
      salary,
      determined,
      paid,
      payable,
    },
  );
  return rows[0];
}

@Controller('api/v1')
export class FnSfr02306Controller {
  @Post('/year-end-items')
  @HttpCode(200)
  async createYearEndItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const item = parseItem(data);
    return transaction(async (db) => {
      const dup = await db.query(
        'SELECT year_end_item_id FROM year_end_item WHERE code = :code',
        { code: item.code },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'YEAR_END_ITEM_CODE_DUPLICATED', '이미 등록된 항목 코드입니다.');
      }
      const rows = await db.query(
        `INSERT INTO year_end_item (code, name, category, limit_amount, sort_order, use_yn, created_at, updated_at)
         VALUES (:code, :name, :category, CAST(:limitAmount AS numeric), CAST(:sortOrder AS integer), :useYn, now(), now())
         RETURNING year_end_item_id AS "yearEndItemId"`,
        item,
      );
      return rows[0];
    });
  }

  @Put('/year-end-items/:yearEndItemId')
  async updateYearEndItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const yearEndItemId = pathId(req.params['yearEndItemId'], '연말정산 항목 ID');
    const data = checks.inputOf(req.body);
    const item = parseItem(data);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT year_end_item_id FROM year_end_item WHERE year_end_item_id = CAST(:yearEndItemId AS bigint)',
        { yearEndItemId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'YEAR_END_ITEM_NOT_FOUND', '연말정산 항목을 찾을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT year_end_item_id FROM year_end_item WHERE code = :code AND year_end_item_id <> CAST(:yearEndItemId AS bigint)',
        { code: item.code, yearEndItemId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'YEAR_END_ITEM_CODE_DUPLICATED', '이미 등록된 항목 코드입니다.');
      }
      const rows = await db.query(
        `UPDATE year_end_item SET
           code = :code, name = :name, category = :category,
           limit_amount = CAST(:limitAmount AS numeric), sort_order = CAST(:sortOrder AS integer),
           use_yn = :useYn, updated_at = now()
         WHERE year_end_item_id = CAST(:yearEndItemId AS bigint)
         RETURNING year_end_item_id AS "yearEndItemId"`,
        { ...item, yearEndItemId },
      );
      return rows[0];
    });
  }

  @Post('/year-end-data')
  @HttpCode(200)
  async createYearEndData(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const missing: string[] = [];
    if (isBlank(data['employeeId'])) {
      missing.push('임직원');
    }
    if (isBlank(data['yearEndItemId'])) {
      missing.push('연말정산 항목');
    }
    if (isBlank(data['targetYear'])) {
      missing.push('정산 대상 연도');
    }
    if (missing.length > 0) {
      throw new ApiError(422, 'YEAR_END_REQUIRED_DATA_MISSING', '필수 자료가 누락되었습니다: ' + missing.join(', '));
    }
    const employeeId = requiredId(data['employeeId'], '임직원');
    const yearEndItemId = requiredId(data['yearEndItemId'], '연말정산 항목');
    const targetYear = requiredId(data['targetYear'], '정산 대상 연도');
    if (targetYear < 1000 || targetYear > 9999) {
      throw invalid('정산 대상 연도는 4자리 연도여야 합니다.');
    }
    const amount = optionalNumber(data['amount'], '금액');
    const attachmentId = isBlank(data['attachmentId']) ? null : requiredId(data['attachmentId'], '증빙 첨부파일');
    const remark = optionalText(data['remark'], '비고', 500);
    return transaction(async (db) => {
      const employee = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      if (employee.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '대상자를 찾을 수 없습니다.');
      }
      const item = await db.query(
        'SELECT year_end_item_id FROM year_end_item WHERE year_end_item_id = CAST(:yearEndItemId AS bigint)',
        { yearEndItemId },
      );
      if (item.length === 0) {
        throw new ApiError(404, 'YEAR_END_ITEM_NOT_FOUND', '연말정산 항목을 찾을 수 없습니다.');
      }
      if (attachmentId !== null) {
        const file = await db.query(
          'SELECT attachment_id FROM attachment WHERE attachment_id = CAST(:attachmentId AS bigint)',
          { attachmentId },
        );
        if (file.length === 0) {
          throw new ApiError(404, 'ATTACHMENT_NOT_FOUND', '증빙 첨부파일을 찾을 수 없습니다.');
        }
      }
      const closed = await db.query(
        `SELECT 1 AS "closed" FROM year_end_result
         WHERE employee_id = CAST(:employeeId AS bigint) AND target_year = CAST(:targetYear AS integer) AND closing_status = '마감'
         UNION ALL
         SELECT 1 FROM year_end_data
         WHERE employee_id = CAST(:employeeId AS bigint) AND target_year = CAST(:targetYear AS integer) AND closing_status = '마감'`,
        { employeeId, targetYear },
      );
      if (closed.length > 0) {
        throw new ApiError(409, 'YEAR_END_CLOSED', '마감된 정산 데이터입니다. 마감 취소 후에 입력할 수 있습니다.');
      }
      const dup = await db.query(
        `SELECT year_end_data_id FROM year_end_data
         WHERE employee_id = CAST(:employeeId AS bigint) AND year_end_item_id = CAST(:yearEndItemId AS bigint)
           AND target_year = CAST(:targetYear AS integer)`,
        { employeeId, yearEndItemId, targetYear },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'INVALID_STATE', '같은 임직원·연도·항목의 자료가 이미 있습니다. 기존 자료를 수정해 주세요.');
      }
      const rows = await db.query(
        `INSERT INTO year_end_data
           (employee_id, year_end_item_id, target_year, amount, closing_status, attachment_id, remark, created_at, updated_at)
         VALUES
           (CAST(:employeeId AS bigint), CAST(:yearEndItemId AS bigint), CAST(:targetYear AS integer), CAST(:amount AS numeric),
            '신청', CAST(:attachmentId AS bigint), :remark, now(), now())
         RETURNING year_end_data_id AS "yearEndDataId"`,
        { employeeId, yearEndItemId, targetYear, amount, attachmentId, remark },
      );
      const result = await recalculate(db, employeeId, targetYear);
      return { yearEndDataId: rows[0].yearEndDataId, ...result };
    });
  }

  @Put('/year-end-data/:yearEndDataId')
  async updateYearEndData(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const yearEndDataId = pathId(req.params['yearEndDataId'], '연말정산 자료 ID');
    const data = checks.inputOf(req.body);
    const amount = optionalNumber(data['amount'], '금액');
    const attachmentId = isBlank(data['attachmentId']) ? null : requiredId(data['attachmentId'], '증빙 첨부파일');
    const remark = optionalText(data['remark'], '비고', 500);
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT employee_id AS "employeeId", target_year AS "targetYear", closing_status AS "closingStatus"
         FROM year_end_data WHERE year_end_data_id = CAST(:yearEndDataId AS bigint)`,
        { yearEndDataId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'YEAR_END_DATA_NOT_FOUND', '연말정산 자료를 찾을 수 없습니다.');
      }
      if (found[0].closingStatus === '마감') {
        throw new ApiError(409, 'YEAR_END_CLOSED', '마감된 정산 데이터는 마감 취소 전에는 수정할 수 없습니다.');
      }
      if (attachmentId !== null) {
        const file = await db.query(
          'SELECT attachment_id FROM attachment WHERE attachment_id = CAST(:attachmentId AS bigint)',
          { attachmentId },
        );
        if (file.length === 0) {
          throw new ApiError(404, 'ATTACHMENT_NOT_FOUND', '증빙 첨부파일을 찾을 수 없습니다.');
        }
      }
      const rows = await db.query(
        `UPDATE year_end_data SET
           amount = CAST(:amount AS numeric), attachment_id = CAST(:attachmentId AS bigint),
           remark = :remark, updated_at = now()
         WHERE year_end_data_id = CAST(:yearEndDataId AS bigint)
         RETURNING year_end_data_id AS "yearEndDataId"`,
        { amount, attachmentId, remark, yearEndDataId },
      );
      await recalculate(db, found[0].employeeId, found[0].targetYear);
      return rows[0];
    });
  }
}
