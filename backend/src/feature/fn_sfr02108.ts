import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '급여 담당자';
const PAYROLL_TYPES = ['REGULAR', 'DAILY', 'SEVERANCE'];
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function requirePayDate(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    throw new ApiError(422, 'PAY_DATE_REQUIRED', '지급일을 입력해 주세요.');
  }
  if (typeof value !== 'string' || !DATE_FORMAT.test(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '지급일은 YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return value;
}

function toInt(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 0 이상의 정수여야 합니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr02108Controller {
  @Post('/payroll-runs')
  @HttpCode(200)
  async createPayrollRun(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const payDate = requirePayDate(data['payDate']);
    const payrollType = data['payrollType'];
    if (typeof payrollType !== 'string' || !PAYROLL_TYPES.includes(payrollType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '급여구분을 선택해 주세요.');
    }
    return transaction(async (db) => {
      const dup = await db.query(
        `SELECT payroll_run_id FROM payroll_run WHERE pay_date = CAST(:payDate AS date) AND payroll_type = :payrollType`,
        { payDate, payrollType },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PAYROLL_RUN_DUPLICATE', '같은 지급일과 급여구분의 지급일이 이미 있습니다.');
      }
      const rows = await db.query(
        `INSERT INTO payroll_run (pay_date, payroll_type, is_closed, journal_status, created_at, updated_at)
         VALUES (CAST(:payDate AS date), :payrollType, false, 'UNPROCESSED', now(), now())
         RETURNING payroll_run_id AS "payrollRunId", to_char(pay_date, 'YYYY-MM-DD') AS "payDate", payroll_type AS "payrollType", is_closed AS "isClosed"`,
        { payDate, payrollType },
      );
      return rows[0];
    });
  }

  @Get('/payroll-runs')
  async listPayrollRuns(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const page = toInt(query['page'], 0);
    const size = Math.min(toInt(query['size'], DEFAULT_SIZE), MAX_SIZE);
    let payDate: string | null = null;
    if (query['payDate']) {
      payDate = requirePayDate(query['payDate']);
    }
    let payrollType: string | null = null;
    if (query['payrollType']) {
      payrollType = String(query['payrollType']);
      if (!PAYROLL_TYPES.includes(payrollType)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '급여구분이 올바르지 않습니다.');
      }
    }
    return transaction(async (db) => {
      const params = { payDate, payrollType, limit: size, offset: page * size };
      const where = `(CAST(:payDate AS date) IS NULL OR r.pay_date = CAST(:payDate AS date))
         AND (CAST(:payrollType AS varchar) IS NULL OR r.payroll_type = CAST(:payrollType AS varchar))`;
      const items = await db.query(
        `SELECT r.payroll_run_id AS "payrollRunId", to_char(r.pay_date, 'YYYY-MM-DD') AS "payDate",
                r.payroll_type AS "payrollType", r.is_closed AS "isClosed",
                (SELECT COUNT(*) FROM payroll p WHERE p.pay_date = r.pay_date) AS "targetCount"
         FROM payroll_run r
         WHERE ${where}
         ORDER BY r.pay_date DESC, r.payroll_run_id DESC
         LIMIT :limit OFFSET :offset`,
        params,
      );
      const totals = await db.query(
        `SELECT COUNT(*) AS "total" FROM payroll_run r WHERE ${where}`,
        params,
      );
      return { items, page, size, total: Number(totals[0]['total']) };
    });
  }

  @Patch('/payroll-runs/:payrollRunId')
  @HttpCode(200)
  async updatePayrollRun(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const payrollRunId = req.params['payrollRunId'];
    const data = checks.inputOf(req.body);
    const payDate = requirePayDate(data['payDate']);
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT payroll_run_id, is_closed, payroll_type FROM payroll_run WHERE payroll_run_id = CAST(:id AS bigint)`,
        { id: payrollRunId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PAYROLL_RUN_NOT_FOUND', '급여 지급일을 찾을 수 없습니다.');
      }
      if (found[0]['is_closed']) {
        throw new ApiError(409, 'PAYROLL_RUN_CLOSED', '마감된 지급일은 수정할 수 없습니다. 마감을 취소한 뒤 수정해 주세요.');
      }
      const dup = await db.query(
        `SELECT payroll_run_id FROM payroll_run
         WHERE pay_date = CAST(:payDate AS date) AND payroll_type = :payrollType AND payroll_run_id <> CAST(:id AS bigint)`,
        { payDate, payrollType: found[0]['payroll_type'], id: payrollRunId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PAYROLL_RUN_DUPLICATE', '같은 지급일과 급여구분의 지급일이 이미 있습니다.');
      }
      const rows = await db.query(
        `UPDATE payroll_run SET pay_date = CAST(:payDate AS date), updated_at = now()
         WHERE payroll_run_id = CAST(:id AS bigint)
         RETURNING payroll_run_id AS "payrollRunId", to_char(pay_date, 'YYYY-MM-DD') AS "payDate"`,
        { payDate, id: payrollRunId },
      );
      return rows[0];
    });
  }

  @Post('/payrolls')
  @HttpCode(200)
  async createPayroll(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const payDate = requirePayDate(data['payDate']);
    const employeeId = data['employeeId'];
    if (typeof employeeId !== 'number' || !Number.isInteger(employeeId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '임직원을 선택해 주세요.');
    }
    return transaction(async (db) => {
      const emp = await db.query(
        `SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)`,
        { employeeId },
      );
      if (emp.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
      }
      const closed = await db.query(
        `SELECT payroll_run_id FROM payroll_run WHERE pay_date = CAST(:payDate AS date) AND is_closed = true`,
        { payDate },
      );
      if (closed.length > 0) {
        throw new ApiError(409, 'PAYROLL_PERIOD_CLOSED', '마감된 기간의 대상자는 지정할 수 없습니다. 마감을 취소한 뒤 지정해 주세요.');
      }
      const dup = await db.query(
        `SELECT payroll_id FROM payroll WHERE employee_id = CAST(:employeeId AS bigint) AND pay_date = CAST(:payDate AS date)`,
        { employeeId, payDate },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PAYROLL_DUPLICATE', '이미 해당 지급일의 급여 대상으로 지정된 임직원입니다.');
      }
      // 가정: 급여 생성 시 마감 상태는 '신청'
      const rows = await db.query(
        `INSERT INTO payroll (employee_id, pay_date, closing_status, created_at, updated_at)
         VALUES (CAST(:employeeId AS bigint), CAST(:payDate AS date), '신청', now(), now())
         RETURNING payroll_id AS "payrollId", employee_id AS "employeeId", to_char(pay_date, 'YYYY-MM-DD') AS "payDate"`,
        { employeeId, payDate },
      );
      return rows[0];
    });
  }

  @Delete('/payrolls/:payrollId')
  @HttpCode(200)
  async deletePayroll(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const payrollId = req.params['payrollId'];
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT payroll_id, to_char(pay_date, 'YYYY-MM-DD') AS "payDate" FROM payroll WHERE payroll_id = CAST(:id AS bigint)`,
        { id: payrollId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PAYROLL_NOT_FOUND', '급여 대상을 찾을 수 없습니다.');
      }
      const closed = await db.query(
        `SELECT payroll_run_id FROM payroll_run WHERE pay_date = CAST(:payDate AS date) AND is_closed = true`,
        { payDate: found[0]['payDate'] },
      );
      if (closed.length > 0) {
        throw new ApiError(409, 'PAYROLL_PERIOD_CLOSED', '마감된 기간의 대상자는 제외할 수 없습니다. 마감을 취소한 뒤 제외해 주세요.');
      }
      await db.execute(`DELETE FROM payroll WHERE payroll_id = CAST(:id AS bigint)`, { id: payrollId });
      return {};
    });
  }
}
