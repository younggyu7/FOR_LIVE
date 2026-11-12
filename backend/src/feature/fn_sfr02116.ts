import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 급여 개인정보 열람 이력의 대상 정보 구분 고정값
const TARGET_INFO_TYPE = '급여';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function requireDate(value: unknown, label: string): string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '을(를) YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return value;
}

function optionalInt(value: unknown, label: string): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 정수여야 합니다.');
  }
  return num;
}

@Controller('api/v1')
export class FnSfr02116Controller {
  @Get('/payroll-analyses')
  async listPayrollAnalyses(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const query = checks.queryOf(req.query);
    const payDateFrom = requireDate(query['payDateFrom'], '분석 기간 시작일');
    const payDateTo = requireDate(query['payDateTo'], '분석 기간 종료일');
    const departmentId = optionalInt(query['departmentId'], '주부서');
    const page = optionalInt(query['page'], '페이지');
    const sizeValue = optionalInt(query['size'], '크기');
    if ((page !== null && page < 0) || (sizeValue !== null && sizeValue < 1)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '페이지와 크기를 올바르게 입력해 주세요.');
    }
    const pageNo = page ?? 0;
    const size = Math.min(sizeValue ?? DEFAULT_SIZE, MAX_SIZE);

    return transaction(async (db) => {
      const where =
        ' FROM payroll p' +
        ' JOIN employee e ON e.employee_id = p.employee_id' +
        ' JOIN department d ON d.department_id = e.department_id' +
        ' WHERE p.pay_date >= CAST(:payDateFrom AS date)' +
        ' AND p.pay_date <= CAST(:payDateTo AS date)' +
        ' AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))';
      const filter = { payDateFrom, payDateTo, departmentId };

      const countRows = await db.query('SELECT COUNT(*) AS "total"' + where, filter);
      const total = Number(countRows[0]['total']);

      const items = await db.query(
        'SELECT p.employee_id AS "employeeId",' +
          ' e.name AS "employeeName",' +
          ' d.name AS "departmentName",' +
          ' p.pay_date AS "payDate",' +
          ' p.total_payment_amount_enc AS "totalPaymentAmountEnc",' +
          ' CAST(NULL AS numeric) AS "changeAmount"' +
          where +
          ' ORDER BY p.pay_date DESC, p.employee_id' +
          ' LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { ...filter, size, offset: pageNo * size },
      );

      // 급여 개인정보 열람 이력 기록
      await db.execute(
        'INSERT INTO personal_info_access_log' +
          ' (employee_id, target_info_type, accessed_at, created_at, updated_at)' +
          ' VALUES (CAST(:userId AS bigint), :targetInfoType, now(), now(), now())',
        { userId: user.id, targetInfoType: TARGET_INFO_TYPE },
      );

      return { items, page: pageNo, size, total };
    });
  }
}
