import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 문서 종류는 원천징수영수증 고정, 구분은 퇴직소득 고정.
const CERTIFICATE_CATEGORY = 'RETIREMENT_INCOME';
const DOCUMENT_TYPE = 'WITHHOLDING_RECEIPT';

@Controller('api/v1')
export class FnSfr02305Controller {
  @Post('/income-certificates/generate-retirement')
  @HttpCode(200)
  async generateRetirementIncomeCertificate(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const employeeId = data['employeeId'];
    if (typeof employeeId !== 'number' || !Number.isInteger(employeeId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '임직원을 선택해 주세요.');
    }
    return transaction(async (db) => {
      const employees = await db.query(
        `SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)`,
        { employeeId },
      );
      if (employees.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
      }
      // 대상 퇴직자의 가장 최근 퇴직금 산정 행을 기준으로 한다.
      const severances = await db.query(
        `SELECT severance_calculation_id AS "severanceCalculationId"
           FROM severance_calculation
          WHERE employee_id = CAST(:employeeId AS bigint)
          ORDER BY retirement_date DESC, severance_calculation_id DESC
          LIMIT 1`,
        { employeeId },
      );
      if (severances.length === 0) {
        throw new ApiError(
          422,
          'RETIREMENT_INCOME_DATA_NOT_FOUND',
          '퇴직소득 데이터가 없어 원천징수영수증을 생성할 수 없습니다.',
        );
      }
      // 가정: 귀속 시작일은 입사일 정보가 없어 퇴직일로 둔다. 귀속 종료일은 퇴직일이다.
      // TODO: 총지급액(퇴직금 산정액 복호화)과 원천징수세액은 복호화 모듈이 없어 비워 둔다.
      const rows = await db.query(
        `INSERT INTO income_certificate (
           employee_id, certificate_category, document_type,
           period_start, period_end,
           total_payment_amount, withheld_tax_amount,
           resident_number_enc, issued_at, created_at, updated_at
         )
         SELECT e.employee_id, :category, :documentType,
                s.retirement_date, s.retirement_date,
                NULL, NULL,
                e.resident_no_enc, now(), now(), now()
           FROM severance_calculation s
           JOIN employee e ON e.employee_id = s.employee_id
          WHERE s.severance_calculation_id = CAST(:severanceCalculationId AS bigint)
         RETURNING income_certificate_id AS "incomeCertificateId",
                   employee_id AS "employeeId",
                   document_type AS "documentType",
                   to_char(period_start, 'YYYY-MM-DD') AS "periodStart",
                   to_char(period_end, 'YYYY-MM-DD') AS "periodEnd",
                   total_payment_amount AS "totalPaymentAmount",
                   withheld_tax_amount AS "withheldTaxAmount"`,
        {
          category: CERTIFICATE_CATEGORY,
          documentType: DOCUMENT_TYPE,
          severanceCalculationId: severances[0]['severanceCalculationId'],
        },
      );
      return rows[0];
    });
  }
}
