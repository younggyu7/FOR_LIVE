import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 열람 대상 정보 구분 고정값
const TARGET_INFO_TYPE = '급여';
// 가정: 목록 최대 크기
const MAX_SIZE = 200;
const DEFAULT_SIZE = 20;

const INVALID_MESSAGE = '시뮬레이션 조건값이 유효하지 않습니다.';

// 대상 임직원 조건 (재직자, 부서, 임직원 ID 목록)
const TARGET_WHERE = `
  WHERE e.employment_status = '재직자'
    AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))
    AND (CAST(:idList AS bigint[]) IS NULL OR e.employee_id = ANY(CAST(:idList AS bigint[])))
`;

// 가정: 현재 급여 = 가장 최근 지급일 급여의 실지급액.
// 암호 해독 모듈이 없어 숫자 형태의 값만 현재 급여로 읽고 그 밖에는 0으로 본다.
const PAY_SQL = `
  SELECT e.employee_id AS employee_id,
    CASE WHEN latest.net_pay_amount_enc ~ '^[0-9]+(\\.[0-9]+)?$'
      THEN CAST(latest.net_pay_amount_enc AS numeric) ELSE 0 END AS current_pay
  FROM employee e
  LEFT JOIN (
    SELECT DISTINCT ON (employee_id) employee_id, net_pay_amount_enc
    FROM payroll
    ORDER BY employee_id, pay_date DESC
  ) latest ON latest.employee_id = e.employee_id
  ${TARGET_WHERE}
`;

@Controller('api/v1')
export class FnSfr02107Controller {
  @Post('/payroll-simulations')
  @HttpCode(200)
  async simulatePayroll(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const query = checks.queryOf(req.query);

    const rate = data['raiseRate'];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= -1) {
      throw new ApiError(422, 'INVALID_SIMULATION_CONDITION', INVALID_MESSAGE);
    }

    let departmentId: number | null = null;
    const rawDept = data['departmentId'];
    if (rawDept !== undefined && rawDept !== null && rawDept !== '') {
      if (typeof rawDept !== 'number' || !Number.isInteger(rawDept)) {
        throw new ApiError(422, 'INVALID_SIMULATION_CONDITION', INVALID_MESSAGE);
      }
      departmentId = rawDept;
    }

    let idList: string | null = null;
    const rawIds = data['employeeIds'];
    if (rawIds !== undefined && rawIds !== null) {
      if (!Array.isArray(rawIds)) {
        throw new ApiError(422, 'INVALID_SIMULATION_CONDITION', INVALID_MESSAGE);
      }
      for (const v of rawIds) {
        if (typeof v !== 'number' || !Number.isInteger(v)) {
          throw new ApiError(422, 'INVALID_SIMULATION_CONDITION', INVALID_MESSAGE);
        }
      }
      if (rawIds.length > 0) {
        idList = '{' + rawIds.join(',') + '}';
      }
    }

    const pageNo = Math.max(0, Math.floor(Number(String(query['page'] ?? '0'))) || 0);
    const sizeRaw = Math.floor(Number(String(query['size'] ?? DEFAULT_SIZE))) || DEFAULT_SIZE;
    const size = Math.min(Math.max(sizeRaw, 1), MAX_SIZE);

    return transaction(async (db) => {
      const base = {
        departmentId: departmentId,
        idList: idList,
        rate: String(rate),
      };

      const sums = await db.query(
        `SELECT COUNT(*) AS "total",
           COALESCE(SUM(pay.current_pay * (1 + CAST(:rate AS numeric))), 0) AS "totalLaborCost"
         FROM (${PAY_SQL}) pay`,
        base,
      );
      const total = Number(sums[0]['total']);
      const totalLaborCost = Number(sums[0]['totalLaborCost']);

      const rows = await db.query(
        `SELECT pay.employee_id AS "employeeId",
           pay.current_pay * (1 + CAST(:rate AS numeric)) AS "expectedPay"
         FROM (${PAY_SQL}) pay
         ORDER BY pay.employee_id
         LIMIT :limit OFFSET :offset`,
        { ...base, limit: size, offset: pageNo * size },
      );

      // 급여 개인정보 열람 이력 기록 (시뮬레이션 결과는 급여 데이터에 저장하지 않는다)
      await db.execute(
        `INSERT INTO personal_info_access_log
           (employee_id, target_employee_id, target_info_type, accessed_at, created_at, updated_at)
         SELECT CAST(:userId AS bigint), e.employee_id, :infoType, now(), now(), now()
         FROM employee e
         ${TARGET_WHERE}`,
        {
          userId: user.id,
          infoType: TARGET_INFO_TYPE,
          departmentId: departmentId,
          idList: idList,
        },
      );

      const items = rows.map((r: Record<string, unknown>) => ({
        employeeId: Number(r['employeeId']),
        expectedPay: Number(r['expectedPay']),
        totalLaborCost: totalLaborCost,
      }));
      return { items, page: pageNo, size, total };
    });
  }
}
