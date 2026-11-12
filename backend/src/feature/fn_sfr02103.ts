// 가정: 암호화는 운영 DB 설정에서 한다. 이 코드는 wage_amount_enc 컬럼 값을 그대로 읽고 쓴다.
// 가정: 변경 비율은 퍼센트 값이다 (5 = 5% 인상). 변경 금액과 변경 비율은 둘 중 하나만 받는다.
// 가정: 적용일 이전(같은 날 포함)의 책정임금이 없는 임직원은 변경 기준이 없어 건너뛴다.
import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isPresent(v: unknown): boolean {
  return v !== undefined && v !== null && v !== '';
}

function toInt(v: unknown): number | null {
  if (!isPresent(v)) {
    return null;
  }
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

@Controller('api/v1')
export class FnSfr02103Controller {
  @Post('/employee-wages/bulk-update')
  @HttpCode(200)
  async bulkUpdateEmployeeWages(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);

    const rawIds = data['employeeIds'];
    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '변경할 임직원을 선택해 주세요.');
    }
    const idSet = new Set<number>();
    for (const raw of rawIds) {
      if (typeof raw !== 'number' || !Number.isInteger(raw) || raw <= 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '임직원 ID 형식이 올바르지 않습니다.');
      }
      idSet.add(raw);
    }
    const ids = Array.from(idSet);

    const effectiveDate = data['effectiveDate'];
    if (typeof effectiveDate !== 'string' || !DATE_PATTERN.test(effectiveDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '변경 효력일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }

    const hasAmount = isPresent(data['changeAmount']);
    const hasRate = isPresent(data['changeRate']);
    if (hasAmount === hasRate) {
      throw new ApiError(422, 'INVALID_WAGE_CHANGE_VALUE', '변경 금액 또는 변경 비율 중 하나만 입력해 주세요.');
    }
    const changeValue = hasAmount ? data['changeAmount'] : data['changeRate'];
    if (typeof changeValue !== 'number' || !Number.isFinite(changeValue)) {
      throw new ApiError(422, 'INVALID_WAGE_CHANGE_VALUE', '변경 값은 숫자여야 합니다.');
    }
    if (!hasAmount && changeValue <= -100) {
      throw new ApiError(422, 'INVALID_WAGE_CHANGE_VALUE', '변경 비율은 -100%보다 커야 합니다.');
    }

    const expression = hasAmount
      ? 'CAST(:base AS numeric) + CAST(:change AS numeric)'
      : 'CAST(:base AS numeric) * (1 + CAST(:change AS numeric) / 100)';

    return transaction(async (db) => {
      for (const id of ids) {
        const found = await db.query(
          'SELECT employee_id AS "employeeId" FROM employee WHERE employee_id = CAST(:id AS bigint)',
          { id: String(id) },
        );
        if (found.length === 0) {
          throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '대상 임직원을 찾을 수 없습니다.');
        }
      }

      let updatedCount = 0;
      for (const id of ids) {
        const bases = await db.query(
          'SELECT wage_amount_enc AS "wage", salary_step_id AS "step" FROM employee_wage WHERE employee_id = CAST(:id AS bigint) AND effective_date <= CAST(:d AS date) ORDER BY effective_date DESC LIMIT 1',
          { id: String(id), d: effectiveDate },
        );
        if (bases.length === 0) {
          continue;
        }
        const before = String(bases[0]['wage']);
        const step = bases[0]['step'] === null || bases[0]['step'] === undefined ? null : String(bases[0]['step']);
        if (!Number.isFinite(Number(before))) {
          throw new ApiError(422, 'INVALID_WAGE_CHANGE_VALUE', '현재 책정임금 값이 숫자가 아니어서 변경할 수 없습니다.');
        }

        const calc = await db.query(
          'SELECT CAST(round(' + expression + ', 2) AS text) AS "value"',
          { base: before, change: String(changeValue) },
        );
        const after = String(calc[0]['value']);
        if (Number(after) < 0) {
          throw new ApiError(422, 'INVALID_WAGE_CHANGE_VALUE', '변경 후 책정임금이 0보다 작아질 수 없습니다.');
        }

        const saved = await db.query(
          'INSERT INTO employee_wage (employee_id, salary_step_id, effective_date, wage_amount_enc, created_at, updated_at) VALUES (CAST(:id AS bigint), CAST(:step AS bigint), CAST(:d AS date), :value, now(), now()) ON CONFLICT (employee_id, effective_date) DO UPDATE SET wage_amount_enc = EXCLUDED.wage_amount_enc, updated_at = now() RETURNING employee_wage_id AS "employeeWageId"',
          { id: String(id), step, d: effectiveDate, value: after },
        );

        await db.execute(
          'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) VALUES (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), :changeType, now(), :content, now(), now())',
          {
            userId: user.id,
            targetType: 'employee_wage',
            targetId: String(saved[0]['employeeWageId']),
            changeType: '일괄 변경',
            content: '책정임금 변경 (적용일 ' + effectiveDate + '): ' + before + ' -> ' + after,
          },
        );
        updatedCount += 1;
      }
      return { updatedCount };
    });
  }

  @Get('/employee-wages')
  async listEmployeeWages(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const q = checks.queryOf(req.query);

    let page = 0;
    if (isPresent(q['page'])) {
      const p = toInt(q['page']);
      if (p === null || p < 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
      }
      page = p;
    }
    let size = DEFAULT_SIZE;
    if (isPresent(q['size'])) {
      const s = toInt(q['size']);
      if (s === null || s < 1) {
        throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
      }
      size = Math.min(s, MAX_SIZE);
    }
    let departmentId: string | null = null;
    if (isPresent(q['departmentId'])) {
      const d = toInt(q['departmentId']);
      if (d === null) {
        throw new ApiError(400, 'VALIDATION_FAILED', '부서 조건이 올바르지 않습니다.');
      }
      departmentId = String(d);
    }

    return transaction(async (db) => {
      // 책정임금은 급여 개인정보라 열람 이력을 남긴다.
      await db.execute(
        'INSERT INTO personal_info_access_log (employee_id, target_info_type, access_type, accessed_at, created_at, updated_at) VALUES (CAST(:userId AS bigint), :infoType, :accessType, now(), now(), now())',
        { userId: user.id, infoType: '책정임금', accessType: '열람' },
      );

      // 임직원별로 적용일이 가장 최근인 책정임금 한 건씩 보인다.
      const from =
        ' FROM employee_wage w JOIN employee e ON e.employee_id = w.employee_id' +
        ' WHERE (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))' +
        ' AND NOT EXISTS (SELECT 1 FROM employee_wage w2 WHERE w2.employee_id = w.employee_id AND w2.effective_date > w.effective_date)';

      const totalRows = await db.query('SELECT COUNT(*) AS "total"' + from, { departmentId });
      const items = await db.query(
        'SELECT w.employee_id AS "employeeId", e.name AS "employeeName", w.effective_date AS "effectiveDate", w.wage_amount_enc AS "wageAmountEnc"' +
          from +
          ' ORDER BY e.name, w.employee_id LIMIT :size OFFSET :offset',
        { departmentId, size, offset: page * size },
      );
      return { items, page, size, total: Number(totalRows[0]['total']) };
    });
  }
}
