import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function requiredDate(value: unknown, label: string): string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return value;
}

function optionalAmount(value: unknown, label: string): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 0 이상의 숫자로 입력해 주세요.');
  }
  return value;
}

@Controller('api/v1')
export class FnSfr02114Controller {
  @Post('/income-certificates')
  @HttpCode(200)
  async createIncomeCertificate(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const employeeId = data['employeeId'];
    if (typeof employeeId !== 'number' || !Number.isInteger(employeeId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '임직원을 선택해 주세요.');
    }
    const periodStart = requiredDate(data['periodStart'], '귀속 시작일');
    const periodEnd = requiredDate(data['periodEnd'], '귀속 종료일');
    if (periodEnd < periodStart) {
      throw new ApiError(400, 'VALIDATION_FAILED', '귀속 종료일은 귀속 시작일 이후여야 합니다.');
    }
    const totalPaymentAmount = optionalAmount(data['totalPaymentAmount'], '총지급액');
    const withheldTaxAmount = optionalAmount(data['withheldTaxAmount'], '원천징수세액');

    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      if (employees.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '임직원을 찾을 수 없습니다.');
      }
      const severances = await db.query(
        'SELECT severance_calculation_id FROM severance_calculation WHERE employee_id = CAST(:employeeId AS bigint) LIMIT 1',
        { employeeId },
      );
      if (severances.length === 0) {
        throw new ApiError(404, 'SEVERANCE_CALCULATION_NOT_FOUND', '해당 임직원의 퇴직금 산정이 없습니다.');
      }
      // 가정: 주민등록번호(암호문)는 대상 임직원의 인사기록카드 값을 그대로 복사한다.
      const records = await db.query(
        'SELECT resident_number_enc AS "residentNumberEnc" FROM personnel_record WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      const residentNumberEnc = records.length > 0 ? records[0]['residentNumberEnc'] : null;
      const rows = await db.query(
        'INSERT INTO income_certificate (employee_id, certificate_category, document_type, period_start, period_end, total_payment_amount, withheld_tax_amount, resident_number_enc, issued_at, created_at, updated_at) ' +
          'VALUES (CAST(:employeeId AS bigint), \'RETIREMENT_INCOME\', \'WITHHOLDING_RECEIPT\', CAST(:periodStart AS date), CAST(:periodEnd AS date), CAST(:totalPaymentAmount AS numeric), CAST(:withheldTaxAmount AS numeric), :residentNumberEnc, now(), now(), now()) ' +
          'RETURNING income_certificate_id AS "incomeCertificateId", issued_at AS "issuedAt"',
        { employeeId, periodStart, periodEnd, totalPaymentAmount, withheldTaxAmount, residentNumberEnc },
      );
      // 개인정보(주민번호) 이용 이력을 기록한다.
      await db.execute(
        'INSERT INTO personal_info_access_log (employee_id, target_employee_id, target_info_type, access_type, accessed_at, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), CAST(:employeeId AS bigint), \'주민번호\', \'원천징수영수증 생성\', now(), now(), now())',
        { userId: user.id, employeeId },
      );
      return rows[0];
    });
  }
}
