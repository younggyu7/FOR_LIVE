import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 보험 종류별 공제 항목은 payroll_item.item_name에 아래 말이 들어 있는 공제 항목으로 본다.
const ITEM_KEYWORD: Record<string, string> = {
  NATIONAL_PENSION: '국민연금',
  HEALTH: '건강보험',
  EMPLOYMENT: '고용보험',
  INDUSTRIAL_ACCIDENT: '산재보험',
};
// 가정: 열람 이력의 열람 대상 정보 구분 고정값
const TARGET_INFO_TYPE = '사회보험 공제내역';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function nonNegativeInt(value: unknown, fallback: number, name: string): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const text = String(value);
  if (!/^\d{1,9}$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', name + ' 값이 올바르지 않습니다.');
  }
  return Number(text);
}

const FROM_SQL = `
  FROM payroll p
  JOIN employee e ON e.employee_id = p.employee_id
  JOIN payroll_detail d ON d.payroll_id = p.payroll_id
  JOIN payroll_item i ON i.payroll_item_id = d.payroll_item_id
  LEFT JOIN LATERAL (
    SELECT g2.grade, g2.standard_monthly_amount
    FROM social_insurance_grade g2
    WHERE g2.employee_id = p.employee_id
      AND g2.insurance_type = :insuranceType
      AND g2.apply_start_month <= :payMonth
    ORDER BY g2.apply_start_month DESC
    LIMIT 1
  ) g ON true
  WHERE i.item_type = '공제'
    AND i.item_name LIKE :itemPattern
    AND to_char(p.pay_date, 'YYYYMM') = :payMonth
    AND (CAST(:employeeId AS bigint) IS NULL OR p.employee_id = CAST(:employeeId AS bigint))
`;

@Controller('api/v1')
export class FnSfr02203Controller {
  @Get('/social-insurance-deductions')
  async listSocialInsuranceDeductions(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.queryOf(req.query);

    const insuranceType = String(data['insuranceType'] ?? '');
    if (!Object.prototype.hasOwnProperty.call(ITEM_KEYWORD, insuranceType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '보험 종류를 선택해 주세요.');
    }
    const payMonth = String(data['payMonth'] ?? '');
    if (!/^\d{4}(0[1-9]|1[0-2])$/.test(payMonth)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '대상 기간은 YYYYMM 형식으로 입력해 주세요.');
    }
    const rawEmployeeId = data['employeeId'];
    let employeeId: string | null = null;
    if (rawEmployeeId !== undefined && rawEmployeeId !== null && rawEmployeeId !== '') {
      employeeId = String(rawEmployeeId);
      if (!/^\d{1,18}$/.test(employeeId)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '임직원 ID가 올바르지 않습니다.');
      }
    }
    const page = nonNegativeInt(data['page'], 0, '쪽 번호');
    let size = nonNegativeInt(data['size'], DEFAULT_SIZE, '쪽 크기');
    if (size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }

    return transaction(async (db) => {
      const filterParams = {
        insuranceType,
        payMonth,
        itemPattern: '%' + ITEM_KEYWORD[insuranceType] + '%',
        employeeId,
      };

      const summary = await db.query(
        `SELECT COUNT(*) AS "total", COALESCE(SUM(d.amount), 0) AS "totalDeductionAmount" ` + FROM_SQL,
        filterParams,
      );
      const total = Number(summary[0]['total']);
      const totalDeductionAmount = Number(summary[0]['totalDeductionAmount']);

      const rows = await db.query(
        `SELECT p.employee_id AS "employeeId",
                e.name AS "employeeName",
                g.grade AS "grade",
                g.standard_monthly_amount AS "standardMonthlyAmount",
                d.amount AS "deductionAmount",
                p.closing_status AS "closingStatus" ` +
          FROM_SQL +
          ` ORDER BY e.name, p.employee_id, d.payroll_detail_id
            LIMIT :size OFFSET :offset`,
        { ...filterParams, size, offset: page * size },
      );

      // 개인정보 열람 이력 기록
      await db.execute(
        `INSERT INTO personal_info_access_log
           (employee_id, target_employee_id, target_info_type, accessed_at, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), CAST(:employeeId AS bigint), :targetInfoType, now(), now(), now())`,
        { userId: user.id, employeeId, targetInfoType: TARGET_INFO_TYPE },
      );

      return {
        items: rows.map((row) => ({ ...row, totalDeductionAmount })),
        page,
        size,
        total,
        totalDeductionAmount,
      };
    });
  }
}
