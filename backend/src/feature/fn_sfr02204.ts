import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const INSURANCE_TYPES = ['NATIONAL_PENSION', 'HEALTH', 'EMPLOYMENT', 'INDUSTRIAL_ACCIDENT'];

@Controller('api/v1')
export class FnSfr02204Controller {
  @Post('/social-insurance-grades/change')
  @HttpCode(200)
  async changeSocialInsuranceGrade(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);

    const employeeId = data['employeeId'];
    if (typeof employeeId !== 'number' || !Number.isInteger(employeeId) || employeeId <= 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '임직원을 선택해 주세요.');
    }
    const insuranceType = data['insuranceType'];
    if (typeof insuranceType !== 'string' || !INSURANCE_TYPES.includes(insuranceType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '보험 종류를 올바르게 선택해 주세요.');
    }
    const gradeRaw = data['grade'];
    const grade = typeof gradeRaw === 'string' ? gradeRaw.trim() : '';
    if (grade.length === 0 || grade.length > 20) {
      throw new ApiError(400, 'VALIDATION_FAILED', '등급을 20자 이내로 입력해 주세요.');
    }
    const monthRaw = data['applyStartMonth'];
    const applyStartMonth = typeof monthRaw === 'string' ? monthRaw.trim() : '';
    if (!/^\d{4}(0[1-9]|1[0-2])$/.test(applyStartMonth)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '적용 시작월을 YYYYMM 형식으로 입력해 주세요.');
    }

    return transaction(async (db) => {
      // 대상 임직원·보험 종류의 현재 행(적용 시작월이 가장 늦은 행)
      const latest = await db.query(
        `SELECT grade AS "grade"
           FROM social_insurance_grade
          WHERE employee_id = CAST(:employeeId AS bigint)
            AND insurance_type = :insuranceType
          ORDER BY apply_start_month DESC
          LIMIT 1`,
        { employeeId, insuranceType },
      );
      if (latest.length === 0) {
        throw new ApiError(404, 'SOCIAL_INSURANCE_GRADE_NOT_FOUND', '해당 임직원에 이 보험 종류의 등급이 등록되어 있지 않습니다.');
      }
      const previousGrade = String(latest[0]['grade']);
      // 가정: 변경 내용은 '변경 전 등급 → 변경 후 등급, 적용 시작월' 형식으로 만든다.
      const changeContent = `${previousGrade} → ${grade}, 적용 시작월 ${applyStartMonth}`;

      const same = await db.query(
        `SELECT social_insurance_grade_id AS "id"
           FROM social_insurance_grade
          WHERE employee_id = CAST(:employeeId AS bigint)
            AND insurance_type = :insuranceType
            AND apply_start_month = :applyStartMonth`,
        { employeeId, insuranceType, applyStartMonth },
      );

      const params = {
        employeeId,
        insuranceType,
        applyStartMonth,
        grade,
        changeContent,
        userId: user.id,
      };
      let rows;
      if (same.length > 0) {
        rows = await db.query(
          `UPDATE social_insurance_grade
              SET grade = :grade,
                  changed_by_id = CAST(:userId AS bigint),
                  changed_at = now(),
                  change_content = :changeContent,
                  updated_at = now()
            WHERE employee_id = CAST(:employeeId AS bigint)
              AND insurance_type = :insuranceType
              AND apply_start_month = :applyStartMonth
        RETURNING social_insurance_grade_id AS "id",
                  employee_id AS "employeeId",
                  insurance_type AS "insuranceType",
                  grade AS "grade",
                  apply_start_month AS "applyStartMonth",
                  changed_at AS "changedAt",
                  changed_by_id AS "changedById",
                  change_content AS "changeContent"`,
          params,
        );
      } else {
        rows = await db.query(
          `INSERT INTO social_insurance_grade
                  (employee_id, insurance_type, apply_start_month, grade,
                   changed_by_id, changed_at, change_content, created_at, updated_at)
           VALUES (CAST(:employeeId AS bigint), :insuranceType, :applyStartMonth, :grade,
                   CAST(:userId AS bigint), now(), :changeContent, now(), now())
        RETURNING social_insurance_grade_id AS "id",
                  employee_id AS "employeeId",
                  insurance_type AS "insuranceType",
                  grade AS "grade",
                  apply_start_month AS "applyStartMonth",
                  changed_at AS "changedAt",
                  changed_by_id AS "changedById",
                  change_content AS "changeContent"`,
          params,
        );
      }
      const row = rows[0];

      // 변경 이력 기록 (target_type은 가정 고정값)
      await db.execute(
        `INSERT INTO change_history
                (changer_id, target_type, target_id, changed_at, change_content, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), 'social_insurance_grade', CAST(:targetId AS bigint),
                 now(), :changeContent, now(), now())`,
        { userId: user.id, targetId: row['id'], changeContent },
      );

      return {
        employeeId: row['employeeId'],
        insuranceType: row['insuranceType'],
        previousGrade,
        grade: row['grade'],
        applyStartMonth: row['applyStartMonth'],
        changedAt: row['changedAt'],
        changedById: row['changedById'],
        changeContent: row['changeContent'],
      };
    });
  }
}
