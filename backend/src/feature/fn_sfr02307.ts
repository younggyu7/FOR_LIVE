import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

@Controller('api/v1')
export class FnSfr02307Controller {
  @Get('/withholding-ledgers')
  async listWithholdingLedgers(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const query = checks.queryOf(req.query);
    const targetYear = String(query['targetYear'] ?? '').trim();
    const employeeId = String(query['employeeId'] ?? '').trim();
    if (!/^\d{4}$/.test(targetYear)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '정산 대상 연도를 4자리 숫자로 입력해 주세요.');
    }
    if (!/^\d+$/.test(employeeId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '임직원을 선택해 주세요.');
    }
    const pageText = String(query['page'] ?? '0').trim();
    const sizeText = String(query['size'] ?? '').trim();
    if (!/^\d+$/.test(pageText) || (sizeText !== '' && !/^\d+$/.test(sizeText))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 숫자로 입력해 주세요.');
    }
    const page = Number(pageText);
    let size = sizeText === '' ? DEFAULT_SIZE : Number(sizeText);
    if (size < 1) {
      size = DEFAULT_SIZE;
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    return transaction(async (db) => {
      const results = await db.query(
        'SELECT year_end_result_id FROM year_end_result WHERE employee_id = CAST(:employeeId AS bigint) AND target_year = CAST(:targetYear AS integer)',
        { employeeId, targetYear },
      );
      if (results.length === 0) {
        throw new ApiError(404, 'YEAR_END_RESULT_NOT_FOUND', '연말정산 결과가 없어 원천징수부를 생성할 수 없습니다.');
      }
      const params = { employeeId, targetYear, size, offset: page * size };
      const where =
        'FROM payroll p JOIN year_end_result y ON y.employee_id = p.employee_id AND y.target_year = CAST(:targetYear AS integer) ' +
        'WHERE p.employee_id = CAST(:employeeId AS bigint) ' +
        'AND p.pay_date >= make_date(CAST(:targetYear AS integer), 1, 1) ' +
        'AND p.pay_date < make_date(CAST(:targetYear AS integer) + 1, 1, 1)';
      const items = await db.query(
        'SELECT p.pay_date AS "payDate", p.total_payment_amount_enc AS "totalPaymentAmount", ' +
          'p.total_deduction_amount_enc AS "totalDeductionAmount", y.determined_tax_amount AS "determinedTaxAmount" ' +
          where +
          ' ORDER BY p.pay_date LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        params,
      );
      const counts = await db.query('SELECT COUNT(*) AS "total" ' + where, params);
      const total = Number(counts[0]?.['total'] ?? 0);
      return { items, page, size, total };
    });
  }
}
