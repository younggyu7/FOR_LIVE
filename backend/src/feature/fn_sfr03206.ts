import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidDateText(text: string): boolean {
  const match = DATE_PATTERN.exec(text);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const lastDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= lastDays[month - 1];
}

@Controller('api/v1')
export class FnSfr03206Controller {
  @Get('/severance-simulations')
  async getSeveranceSimulation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const resignationDate = query['resignationDate'];
    if (typeof resignationDate !== 'string' || resignationDate === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '퇴직 예정일을 입력해 주세요.');
    }
    if (!isValidDateText(resignationDate)) {
      throw new ApiError(422, 'INVALID_RESIGNATION_DATE', '퇴직 예정일이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      // 본인의 인사기록만 조회한다 (조회 범위는 개인)
      const rows = await db.query(
        `SELECT to_char(hire_date, 'YYYY-MM-DD') AS "hireDate",
                CAST(CAST(:resignationDate AS date) - hire_date AS integer) AS "serviceDays"
           FROM personnel_record
          WHERE employee_id = CAST(:userId AS bigint)`,
        { resignationDate, userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '인사기록을 찾을 수 없습니다.');
      }
      const record = rows[0] as Record<string, unknown>;
      const serviceDays = Number(record['serviceDays']);
      if (serviceDays < 0) {
        throw new ApiError(422, 'INVALID_RESIGNATION_DATE', '퇴직 예정일은 입사일 이후여야 합니다.');
      }
      // 열람 이력 기록 (결과는 저장하지 않는다)
      await db.execute(
        `INSERT INTO personal_info_access_log
           (employee_id, target_employee_id, target_info_type, access_type, accessed_at, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), CAST(:userId AS bigint), :infoType, :accessType, now(), now(), now())`,
        { userId: user.id, infoType: '퇴직금', accessType: '조회' },
      );
      // TODO: 평균임금 산출 근거(급여 금액은 암호문이며 복호화 수단이 입력에 없음)가 없어 예상 퇴직금은 0으로 둔다.
      return {
        hireDate: record['hireDate'],
        estimatedSeverancePay: 0,
      };
    });
  }
}
