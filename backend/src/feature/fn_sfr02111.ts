import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ACTIVE_VALUES = ['사용', '미사용'];

function fail(message: string): never {
  throw new ApiError(400, 'VALIDATION_FAILED', message);
}

function isNum(v: unknown): boolean {
  if (typeof v === 'number') {
    return Number.isFinite(v);
  }
  return typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v));
}

function isId(v: unknown): boolean {
  return isNum(v) && Number.isInteger(Number(v)) && Number(v) > 0;
}

function isText(v: unknown, max: number): boolean {
  return typeof v === 'string' && v.trim() !== '' && v.length <= max;
}

@Controller('api/v1')
export class FnSfr02111Controller {
  @Post('/salary-steps')
  @HttpCode(200)
  async createSalaryStep(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    if (!isText(data['stepGrade'], 20)) {
      fail('호봉 등급을 20자 이내로 입력해 주세요.');
    }
    if (!isNum(data['amount']) || Number(data['amount']) < 0) {
      fail('호봉별 금액은 0 이상의 숫자로 입력해 주세요.');
    }
    if (!ACTIVE_VALUES.includes(String(data['isActive']))) {
      fail('사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    return transaction(async (db) => {
      const dup = await db.query(
        'SELECT salary_step_id FROM salary_step WHERE step_grade = :stepGrade',
        { stepGrade: data['stepGrade'] },
      );
      if (dup.length > 0) {
        fail('이미 등록된 호봉 등급입니다.');
      }
      const rows = await db.query(
        'INSERT INTO salary_step (step_grade, amount, is_active, created_at, updated_at) ' +
          'VALUES (:stepGrade, CAST(:amount AS numeric), :isActive, now(), now()) ' +
          'RETURNING salary_step_id AS "salaryStepId", step_grade AS "stepGrade", amount AS "amount"',
        {
          stepGrade: data['stepGrade'],
          amount: String(data['amount']),
          isActive: data['isActive'],
        },
      );
      return rows[0];
    });
  }

  @Patch('/salary-steps/:salaryStepId')
  async updateSalaryStep(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const salaryStepId = req.params['salaryStepId'];
    const data = checks.inputOf(req.body);
    const stepGrade = data['stepGrade'] ?? null;
    const amount = data['amount'] ?? null;
    const isActive = data['isActive'] ?? null;
    if (!isId(salaryStepId)) {
      fail('호봉테이블 ID가 올바르지 않습니다.');
    }
    if (stepGrade !== null && !isText(stepGrade, 20)) {
      fail('호봉 등급을 20자 이내로 입력해 주세요.');
    }
    if (amount !== null && (!isNum(amount) || Number(amount) < 0)) {
      fail('호봉별 금액은 0 이상의 숫자로 입력해 주세요.');
    }
    if (isActive !== null && !ACTIVE_VALUES.includes(String(isActive))) {
      fail('사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT step_grade AS "stepGrade", amount AS "amount", is_active AS "isActive" ' +
          'FROM salary_step WHERE salary_step_id = CAST(:id AS bigint)',
        { id: salaryStepId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'SALARY_STEP_NOT_FOUND', '호봉을 찾을 수 없습니다.');
      }
      const before = found[0];
      if (stepGrade !== null && stepGrade !== before.stepGrade) {
        const dup = await db.query(
          'SELECT salary_step_id FROM salary_step WHERE step_grade = :stepGrade ' +
            'AND salary_step_id <> CAST(:id AS bigint)',
          { stepGrade, id: salaryStepId },
        );
        if (dup.length > 0) {
          fail('이미 등록된 호봉 등급입니다.');
        }
      }
      const changes: string[] = [];
      if (stepGrade !== null && stepGrade !== before.stepGrade) {
        changes.push('호봉 등급: ' + before.stepGrade + ' → ' + stepGrade);
      }
      if (amount !== null && Number(amount) !== Number(before.amount)) {
        changes.push('호봉별 금액: ' + before.amount + ' → ' + Number(amount));
      }
      if (isActive !== null && isActive !== before.isActive) {
        changes.push('사용 여부: ' + before.isActive + ' → ' + isActive);
      }
      const rows = await db.query(
        'UPDATE salary_step SET ' +
          'step_grade = COALESCE(CAST(:stepGrade AS varchar), step_grade), ' +
          'amount = COALESCE(CAST(:amount AS numeric), amount), ' +
          'is_active = COALESCE(CAST(:isActive AS varchar), is_active), ' +
          'updated_at = now() ' +
          'WHERE salary_step_id = CAST(:id AS bigint) ' +
          'RETURNING salary_step_id AS "salaryStepId", step_grade AS "stepGrade", amount AS "amount"',
        {
          stepGrade,
          amount: amount === null ? null : String(amount),
          isActive,
          id: salaryStepId,
        },
      );
      // 호봉테이블 변경 이력을 남긴다 (대상 유형 salary_step은 가정)
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, changed_at, change_content, created_at, updated_at) ' +
          "VALUES (CAST(:userId AS bigint), 'salary_step', CAST(:id AS bigint), now(), :content, now(), now())",
        {
          userId: user.id,
          id: salaryStepId,
          content: changes.length > 0 ? changes.join(', ') : '변경 사항 없음',
        },
      );
      return rows[0];
    });
  }

  @Get('/salary-steps')
  async listSalarySteps(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const q = checks.queryOf(req.query);
    const isActive = q['isActive'] ? String(q['isActive']) : null;
    if (isActive !== null && !ACTIVE_VALUES.includes(isActive)) {
      fail('사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    const page = Math.max(Math.floor(Number(q['page'] ?? 0)) || 0, 0);
    const size = Math.min(Math.max(Math.floor(Number(q['size'] ?? 20)) || 20, 1), 200);
    return transaction(async (db) => {
      const totalRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM salary_step ' +
          'WHERE (CAST(:isActive AS varchar) IS NULL OR is_active = CAST(:isActive AS varchar))',
        { isActive },
      );
      const items = await db.query(
        'SELECT salary_step_id AS "salaryStepId", step_grade AS "stepGrade", ' +
          'amount AS "amount", is_active AS "isActive" FROM salary_step ' +
          'WHERE (CAST(:isActive AS varchar) IS NULL OR is_active = CAST(:isActive AS varchar)) ' +
          'ORDER BY step_grade LIMIT :size OFFSET :offset',
        { isActive, size, offset: page * size },
      );
      return { items, page, size, total: Number(totalRows[0].total) };
    });
  }

  @Post('/employee-wages')
  @HttpCode(200)
  async createEmployeeWage(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    if (!isId(data['employeeId'])) {
      fail('임직원을 선택해 주세요.');
    }
    if (!isId(data['salaryStepId'])) {
      fail('호봉을 선택해 주세요.');
    }
    const date = data['effectiveDate'];
    if (typeof date !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
      fail('적용일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    if (typeof data['wageAmount'] !== 'string' || data['wageAmount'].trim() === '') {
      fail('책정임금을 입력해 주세요.');
    }
    return transaction(async (db) => {
      const emp = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId: data['employeeId'] },
      );
      if (emp.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
      }
      const step = await db.query(
        'SELECT salary_step_id FROM salary_step WHERE salary_step_id = CAST(:salaryStepId AS bigint)',
        { salaryStepId: data['salaryStepId'] },
      );
      if (step.length === 0) {
        throw new ApiError(
          422,
          'SALARY_STEP_NOT_REGISTERED',
          '호봉테이블에 등록되지 않은 호봉입니다.',
        );
      }
      const dup = await db.query(
        'SELECT employee_wage_id FROM employee_wage ' +
          'WHERE employee_id = CAST(:employeeId AS bigint) AND effective_date = CAST(:effectiveDate AS date)',
        { employeeId: data['employeeId'], effectiveDate: date },
      );
      if (dup.length > 0) {
        fail('같은 적용일에 이미 지정된 호봉이 있습니다.');
      }
      // 가정: wageAmount는 호출 쪽에서 이미 암호화한 문자열이므로 그대로 저장한다
      const rows = await db.query(
        'INSERT INTO employee_wage (employee_id, salary_step_id, effective_date, wage_amount_enc, created_at, updated_at) ' +
          'VALUES (CAST(:employeeId AS bigint), CAST(:salaryStepId AS bigint), CAST(:effectiveDate AS date), :wageAmount, now(), now()) ' +
          'RETURNING employee_wage_id AS "employeeWageId", employee_id AS "employeeId", salary_step_id AS "salaryStepId"',
        {
          employeeId: data['employeeId'],
          salaryStepId: data['salaryStepId'],
          effectiveDate: date,
          wageAmount: data['wageAmount'],
        },
      );
      return rows[0];
    });
  }
}
