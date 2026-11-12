import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 열람 이력의 열람 대상 정보 구분 고정값
const TARGET_INFO_TYPE = '급여이체 계좌정보';
// 가정: 열람 이력의 접근 유형
const ACCESS_TYPE = '조회';

@Controller('api/v1')
export class FnSfr02102Controller {
  @Get('/payroll-transfers')
  async listPayrollTransfers(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const q = checks.queryOf(req.query);

    const payDateRaw = q['payDate'];
    let payDate: string | null = null;
    if (payDateRaw !== undefined && payDateRaw !== null && payDateRaw !== '') {
      if (typeof payDateRaw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payDateRaw)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '지급일 형식이 올바르지 않습니다.');
      }
      payDate = payDateRaw;
    }

    const deptRaw = q['departmentId'];
    let departmentId: string | null = null;
    if (deptRaw !== undefined && deptRaw !== null && deptRaw !== '') {
      if (!/^\d+$/.test(String(deptRaw))) {
        throw new ApiError(400, 'VALIDATION_FAILED', '부서 값이 올바르지 않습니다.');
      }
      departmentId = String(deptRaw);
    }

    const pageRaw = q['page'];
    const page = pageRaw === undefined || pageRaw === '' ? 0 : Number(pageRaw);
    if (!Number.isInteger(page) || page < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
    }
    const sizeRaw = q['size'];
    let size = sizeRaw === undefined || sizeRaw === '' ? 20 : Number(sizeRaw);
    if (!Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
    }
    if (size > 200) {
      size = 200;
    }

    return transaction(async (db) => {
      const filterParams = { payDate, departmentId };
      const where = `
        FROM payroll p
        JOIN employee e ON e.employee_id = p.employee_id
        WHERE (CAST(:payDate AS date) IS NULL OR p.pay_date = CAST(:payDate AS date))
          AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))`;

      const countRows = await db.query(`SELECT COUNT(*) AS "total" ${where}`, filterParams);
      const total = Number(countRows[0]['total']);
      if (total === 0) {
        throw new ApiError(404, 'PAYROLL_NOT_FOUND', '계산된 급여가 없습니다.');
      }

      const rows = await db.query(
        `SELECT e.employee_id AS "employeeId",
                e.employee_no AS "employeeNo",
                e.name AS "employeeName",
                p.pay_date AS "payDate",
                p.net_pay_amount_enc AS "netPayAmountEnc"
         ${where}
         ORDER BY p.pay_date DESC, e.employee_no
         LIMIT :limit OFFSET :offset`,
        { ...filterParams, limit: size, offset: page * size },
      );

      // 개인정보 열람 이력 기록 (열람자=현재 사용자, 열람 시각=now())
      for (const row of rows) {
        await db.execute(
          `INSERT INTO personal_info_access_log
             (employee_id, target_employee_id, target_info_type, access_type, accessed_at, created_at, updated_at)
           VALUES (CAST(:userId AS bigint), CAST(:targetId AS bigint), :infoType, :accessType, now(), now(), now())`,
          {
            userId: user.id,
            targetId: String(row['employeeId']),
            infoType: TARGET_INFO_TYPE,
            accessType: ACCESS_TYPE,
          },
        );
      }

      // 은행명·계좌번호: 임직원과 계좌를 잇는 컬럼이 schema.sql에 없어 값을 채우지 못한다 (TODO)
      const items = rows.map((row) => ({
        employeeNo: row['employeeNo'],
        employeeName: row['employeeName'],
        payDate: row['payDate'],
        netPayAmountEnc: row['netPayAmountEnc'],
        bankName: null,
        accountNumber: null,
      }));

      return { items, page, size, total };
    });
  }
}
