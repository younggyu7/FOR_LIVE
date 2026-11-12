import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 과세 집계 금액은 지급항목별 금액·과세 구분의 출처가 없어 0으로 둔다.
const TAXABLE_TOTAL_PLACEHOLDER = 0;
// 가정: 마감·승인된 급여는 다시 계산하거나 마감할 수 없다.
const LOCKED_STATUSES = "('마감', '승인')";

function payDateOf(data: Record<string, unknown>): string {
  const value = data['payDate'];
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '급여 지급일을 YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return value;
}

function pageOf(query: Record<string, unknown>): { page: number; size: number } {
  const page = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
  const size = query['size'] === undefined || query['size'] === '' ? 20 : Number(query['size']);
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 쪽 크기가 올바르지 않습니다.');
  }
  return { page, size: Math.min(size, 200) };
}

@Controller('api/v1')
export class FnSfr02101Controller {
  @Post('/payrolls/calculate')
  @HttpCode(200)
  async calculatePayrolls(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const payDate = payDateOf(data);
    const { page, size } = pageOf(checks.queryOf(req.query));
    return transaction(async (db) => {
      const locked = await db.query(
        `SELECT 1 AS found FROM payroll
          WHERE pay_date = CAST(:payDate AS date)
            AND closing_status IN ${LOCKED_STATUSES}
          LIMIT 1`,
        { payDate },
      );
      if (locked.length > 0) {
        throw new ApiError(409, 'PAYROLL_ALREADY_CLOSED', '이미 마감된 기간입니다. 마감을 취소한 뒤 다시 계산해 주세요.');
      }
      const targets = await db.query(
        `SELECT employee_id AS "employeeId" FROM employee WHERE employment_status = '재직자'`,
        {},
      );
      if (targets.length === 0) {
        throw new ApiError(422, 'NO_PAYROLL_TARGET', '급여 대상이 없는 지급일입니다.');
      }
      await db.execute(
        `INSERT INTO payroll (employee_id, pay_date, closing_status, created_at, updated_at)
         SELECT e.employee_id, CAST(:payDate AS date), '신청', now(), now()
           FROM employee e
          WHERE e.employment_status = '재직자'
         ON CONFLICT (employee_id, pay_date)
         DO UPDATE SET closing_status = '신청', updated_at = now()`,
        { payDate },
      );
      const items = await db.query(
        `SELECT p.payroll_id AS "payrollId",
                p.employee_id AS "employeeId",
                to_char(p.pay_date, 'YYYY-MM-DD') AS "payDate",
                p.closing_status AS "closingStatus",
                CAST(:taxable AS numeric) AS "taxableTotal"
           FROM payroll p
          WHERE p.pay_date = CAST(:payDate AS date)
          ORDER BY p.payroll_id
          LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        { payDate, taxable: TAXABLE_TOTAL_PLACEHOLDER, size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS total FROM payroll WHERE pay_date = CAST(:payDate AS date)`,
        { payDate },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/payrolls/close')
  @HttpCode(200)
  async closePayrolls(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const payDate = payDateOf(data);
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT closing_status AS "closingStatus" FROM payroll
          WHERE pay_date = CAST(:payDate AS date)`,
        { payDate },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'PAYROLL_NOT_FOUND', '해당 지급일의 계산된 급여가 없습니다.');
      }
      const locked = rows.filter((row) => row['closingStatus'] === '마감' || row['closingStatus'] === '승인');
      if (locked.length > 0) {
        throw new ApiError(409, 'PAYROLL_ALREADY_CLOSED', '이미 마감된 급여입니다.');
      }
      // 가정: 신청·마감 취소 상태의 급여만 마감할 수 있다.
      await db.execute(
        `UPDATE payroll
            SET closing_status = '마감', updated_at = now()
          WHERE pay_date = CAST(:payDate AS date)
            AND closing_status IN ('신청', '마감 취소')`,
        { payDate },
      );
      return { closingStatus: '마감' };
    });
  }

  @Post('/payrolls/cancel-close')
  @HttpCode(200)
  async cancelClosePayrolls(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const payDate = payDateOf(data);
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT payroll_id AS "payrollId" FROM payroll
          WHERE pay_date = CAST(:payDate AS date)`,
        { payDate },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'PAYROLL_NOT_FOUND', '해당 지급일의 급여가 없습니다.');
      }
      const changed = await db.execute(
        `UPDATE payroll
            SET closing_status = '마감 취소', updated_at = now()
          WHERE pay_date = CAST(:payDate AS date)
            AND closing_status = '마감'`,
        { payDate },
      );
      if (changed === 0) {
        throw new ApiError(409, 'PAYROLL_NOT_CLOSED', '마감 상태가 아닌 급여입니다.');
      }
      return { closingStatus: '마감 취소' };
    });
  }
}
