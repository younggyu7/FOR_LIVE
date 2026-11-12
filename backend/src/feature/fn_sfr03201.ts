import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 열람 이력의 대상 정보 구분과 접근 유형은 코드 체계가 확정되지 않아 고정값으로 둔다.
const TARGET_INFO_TYPE = '인사기록카드';
const ACCESS_TYPE = '조회';

@Controller('api/v1')
export class FnSfr03201Controller {
  @Get('/personnel-records/me')
  async getMyPersonnelRecord(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT
           pr.personnel_record_id AS "personnelRecordId",
           e.employee_no AS "employeeNo",
           e.name AS "name",
           pr.hire_date AS "hireDate",
           pr.recruitment_type AS "recruitmentType",
           pr.recruitment_note AS "recruitmentNote",
           pr.address_enc AS "address",
           pr.veteran_info AS "veteranInfo",
           pr.military_service_info AS "militaryServiceInfo",
           pr.employment_status AS "employmentStatus",
           pr.resignation_date AS "resignationDate"
         FROM personnel_record pr
         JOIN employee e ON e.employee_id = pr.employee_id
         WHERE pr.employee_id = CAST(:userId AS bigint)`,
        { userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'PERSONNEL_RECORD_NOT_FOUND', '본인의 인사기록카드가 없습니다.');
      }
      await db.execute(
        `INSERT INTO personal_info_access_log
           (employee_id, target_employee_id, target_info_type, access_type, accessed_at, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), CAST(:userId AS bigint), :targetInfoType, :accessType, now(), now(), now())`,
        { userId: user.id, targetInfoType: TARGET_INFO_TYPE, accessType: ACCESS_TYPE },
      );
      return rows[0];
    });
  }
}
