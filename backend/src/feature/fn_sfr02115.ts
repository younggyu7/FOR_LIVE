import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 열람 이력의 대상 정보 구분 고정값
const ACCESS_INFO_TYPE = '급여';

type Db = {
  query: (sql: string, params?: Record<string, unknown>) => Promise<any[]>;
  execute: (sql: string, params?: Record<string, unknown>) => Promise<number>;
};

function filterOf(q: Record<string, unknown>) {
  const payDate = typeof q['payDate'] === 'string' ? q['payDate'] : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payDate)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '급여 지급일을 YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  const dept = q['departmentId'];
  let departmentId: string | null = null;
  if (dept !== undefined && dept !== null && dept !== '') {
    if (!/^\d+$/.test(String(dept))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '주부서는 숫자 ID여야 합니다.');
    }
    departmentId = String(dept);
  }
  return { payDate, departmentId };
}

async function logAccess(db: Db, userId: string | null, targetEmployeeId: string | null) {
  await db.execute(
    `INSERT INTO personal_info_access_log
       (employee_id, target_employee_id, target_info_type, accessed_at, created_at, updated_at)
     VALUES
       (CAST(:userId AS bigint), CAST(:targetEmployeeId AS bigint), :infoType, now(), now(), now())`,
    { userId, targetEmployeeId, infoType: ACCESS_INFO_TYPE },
  );
}

@Controller('api/v1')
export class FnSfr02115Controller {
  @Get('/payrolls')
  async listPayrolls(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const { payDate, departmentId } = filterOf(q);
    const page = q['page'] === undefined || q['page'] === '' ? 0 : Number(q['page']);
    const size = q['size'] === undefined || q['size'] === '' ? DEFAULT_SIZE : Number(q['size']);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const limit = Math.min(size, MAX_SIZE);
    return transaction(async (db: Db) => {
      const params = { payDate, departmentId };
      const items = await db.query(
        `SELECT p.payroll_id AS "payrollId",
                p.employee_id AS "employeeId",
                e.name AS "employeeName",
                p.pay_date AS "payDate",
                p.total_payment_amount_enc AS "totalPaymentAmountEnc",
                p.total_deduction_amount_enc AS "totalDeductionAmountEnc",
                p.net_pay_amount_enc AS "netPayAmountEnc",
                p.closing_status AS "closingStatus"
           FROM payroll p
           JOIN employee e ON e.employee_id = p.employee_id
          WHERE p.pay_date = CAST(:payDate AS date)
            AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))
          ORDER BY e.name, p.payroll_id
          LIMIT CAST(:limit AS int) OFFSET CAST(:offset AS int)`,
        { ...params, limit, offset: page * limit },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM payroll p
           JOIN employee e ON e.employee_id = p.employee_id
          WHERE p.pay_date = CAST(:payDate AS date)
            AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))`,
        params,
      );
      await logAccess(db, user.id, null);
      return { items, page, size: limit, total: Number(counts[0].total) };
    });
  }

  // 주의: 고정 경로 summary를 :payrollId보다 먼저 선언한다
  @Get('/payrolls/summary')
  async getPayrollSummary(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const { payDate, departmentId } = filterOf(q);
    return transaction(async (db: Db) => {
      const params = { payDate, departmentId };
      const counts = await db.query(
        `SELECT COUNT(*) AS "employeeCount"
           FROM payroll p
           JOIN employee e ON e.employee_id = p.employee_id
          WHERE p.pay_date = CAST(:payDate AS date)
            AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))`,
        params,
      );
      // 가정: 암호문 복호화 수단이 없어 payroll_detail 금액을 항목 구분(지급·공제)별로 합산한다
      const sums = await db.query(
        `SELECT COALESCE(SUM(CASE WHEN i.item_type = '지급' THEN d.amount END), 0) AS "totalPaymentAmount",
                COALESCE(SUM(CASE WHEN i.item_type = '공제' THEN d.amount END), 0) AS "totalDeductionAmount"
           FROM payroll p
           JOIN employee e ON e.employee_id = p.employee_id
           JOIN payroll_detail d ON d.payroll_id = p.payroll_id
           JOIN payroll_item i ON i.payroll_item_id = d.payroll_item_id
          WHERE p.pay_date = CAST(:payDate AS date)
            AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))`,
        params,
      );
      await logAccess(db, user.id, null);
      const totalPaymentAmount = Number(sums[0].totalPaymentAmount);
      const totalDeductionAmount = Number(sums[0].totalDeductionAmount);
      return {
        employeeCount: Number(counts[0].employeeCount),
        totalPaymentAmount,
        totalDeductionAmount,
        netPayAmount: totalPaymentAmount - totalDeductionAmount,
      };
    });
  }

  @Get('/payrolls/:payrollId')
  async getPayroll(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자', '임직원');
    // 급여 담당자가 아니면 임직원이므로 본인 급여명세만 조회한다
    let isStaff = true;
    try {
      user.require('급여 담당자');
    } catch {
      isStaff = false;
    }
    const payrollId = req.params['payrollId'];
    if (!/^\d+$/.test(payrollId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '급여 ID가 올바르지 않습니다.');
    }
    return transaction(async (db: Db) => {
      const rows = await db.query(
        `SELECT p.payroll_id AS "payrollId",
                p.employee_id AS "employeeId",
                p.pay_date AS "payDate",
                p.total_payment_amount_enc AS "totalPaymentAmountEnc",
                p.total_deduction_amount_enc AS "totalDeductionAmountEnc",
                p.net_pay_amount_enc AS "netPayAmountEnc"
           FROM payroll p
          WHERE p.payroll_id = CAST(:payrollId AS bigint)
            AND (:isStaff = 'Y' OR p.employee_id = CAST(:userId AS bigint))`,
        { payrollId, isStaff: isStaff ? 'Y' : 'N', userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'PAYROLL_NOT_FOUND', '급여를 찾을 수 없거나 조회 권한 범위 밖입니다.');
      }
      const details = await db.query(
        `SELECT payroll_item_id AS "payrollItemId", amount AS "amount"
           FROM payroll_detail
          WHERE payroll_id = CAST(:payrollId AS bigint)
          ORDER BY payroll_item_id`,
        { payrollId },
      );
      await logAccess(db, user.id, String(rows[0].employeeId));
      const head = rows[0];
      return {
        payrollId: Number(head.payrollId),
        payDate: head.payDate,
        totalPaymentAmountEnc: head.totalPaymentAmountEnc,
        totalDeductionAmountEnc: head.totalDeductionAmountEnc,
        netPayAmountEnc: head.netPayAmountEnc,
        details: details.map((d: any) => ({ payrollItemId: Number(d.payrollItemId), amount: Number(d.amount) })),
      };
    });
  }
}
