import { Controller, Get, HttpCode, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '급여 담당자';
// 가정: 퇴직기준은 system_setting의 분류 '퇴직금', 키 'SEVERANCE_BASIS' 한 행에 저장한다.
const SETTING_CATEGORY = '퇴직금';
const SETTING_KEY = 'SEVERANCE_BASIS';
const SETTING_NAME = '퇴직 기준';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function validationFailed(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function wholeNumber(value: unknown, name: string): string {
  const text = String(value ?? '').trim();
  if (!/^\d+$/.test(text)) {
    throw validationFailed(name + ' 값이 올바르지 않습니다.');
  }
  return text;
}

@Controller('api/v1')
export class FnSfr02105Controller {
  @Put('/severance-settings')
  async updateSeveranceSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const value = data['settingValue'];
    if (typeof value !== 'string') {
      throw validationFailed('퇴직 기준 값을 입력해 주세요.');
    }
    const settingValue = value.trim();
    // 가정: 비어 있거나 1000자를 넘는 값은 유효하지 않은 퇴직 기준으로 본다.
    if (settingValue.length === 0 || settingValue.length > 1000) {
      throw new ApiError(422, 'INVALID_SEVERANCE_BASIS', '퇴직 기준 값이 유효하지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `INSERT INTO system_setting (category, setting_key, setting_name, setting_value, created_at, updated_at)
         VALUES (:category, :settingKey, :settingName, :settingValue, now(), now())
         ON CONFLICT (category, setting_key)
         DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = now()
         RETURNING setting_value AS "settingValue"`,
        {
          category: SETTING_CATEGORY,
          settingKey: SETTING_KEY,
          settingName: SETTING_NAME,
          settingValue: settingValue,
        },
      );
      return rows[0];
    });
  }

  @Post('/severance-calculations')
  @HttpCode(200)
  async createSeveranceCalculation(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const employeeId = wholeNumber(data['employeeId'], '퇴직 임직원 ID');
    const retirementDate = String(data['retirementDate'] ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(retirementDate)) {
      throw validationFailed('퇴직일은 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId: employeeId },
      );
      if (employees.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '대상 임직원을 찾을 수 없습니다.');
      }
      const settings = await db.query(
        'SELECT setting_value AS "settingValue" FROM system_setting WHERE category = :category AND setting_key = :settingKey',
        { category: SETTING_CATEGORY, settingKey: SETTING_KEY },
      );
      const basis = settings.length > 0 ? String(settings[0].settingValue ?? '').trim() : '';
      if (basis.length === 0) {
        throw new ApiError(422, 'SEVERANCE_BASIS_NOT_SET', '퇴직기준이 설정되지 않았습니다. 먼저 퇴직기준을 설정해 주세요.');
      }
      // 가정: 산정액·추계액은 암호화 모듈과 평균임금 출처가 정해질 때까지 비워 두고, 적용한 퇴직기준만 기록한다.
      const rows = await db.query(
        `INSERT INTO severance_calculation (employee_id, retirement_date, severance_amount_enc, estimated_amount_enc, retirement_basis, created_at, updated_at)
         VALUES (CAST(:employeeId AS bigint), CAST(:retirementDate AS date), NULL, NULL, :basis, now(), now())
         RETURNING severance_calculation_id AS "severanceCalculationId",
                   severance_amount_enc AS "severanceAmountEnc",
                   estimated_amount_enc AS "estimatedAmountEnc"`,
        { employeeId: employeeId, retirementDate: retirementDate, basis: basis.substring(0, 500) },
      );
      return rows[0];
    });
  }

  @Get('/severance-calculations')
  async listSeveranceCalculations(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const pageText = String(query['page'] ?? '0').trim() || '0';
    const sizeText = String(query['size'] ?? '').trim() || String(DEFAULT_SIZE);
    const page = Number(wholeNumber(pageText, 'page'));
    const size = Math.min(Math.max(Number(wholeNumber(sizeText, 'size')), 1), MAX_SIZE);
    const employeeText = String(query['employeeId'] ?? '').trim();
    const employeeId = employeeText === '' ? null : wholeNumber(employeeText, '대상 임직원');
    return transaction(async (db) => {
      const params = { employeeId: employeeId, size: size, offset: page * size };
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM severance_calculation
         WHERE (CAST(:employeeId AS bigint) IS NULL OR employee_id = CAST(:employeeId AS bigint))`,
        { employeeId: employeeId },
      );
      const items = await db.query(
        `SELECT severance_calculation_id AS "severanceCalculationId",
                employee_id AS "employeeId",
                retirement_date AS "retirementDate",
                severance_amount_enc AS "severanceAmountEnc",
                estimated_amount_enc AS "estimatedAmountEnc"
         FROM severance_calculation
         WHERE (CAST(:employeeId AS bigint) IS NULL OR employee_id = CAST(:employeeId AS bigint))
         ORDER BY severance_calculation_id DESC
         LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        params,
      );
      return { items: items, page: page, size: size, total: Number(counts[0].total) };
    });
  }
}
