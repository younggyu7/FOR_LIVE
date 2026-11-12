import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 임직원 현황 메뉴 이름. menu_permission 조회에 쓴다.
const MENU_NAME = '임직원 현황';
// 가정: 열람 이력에 남기는 고정값.
const ACCESS_INFO_TYPE = '임직원 현황';
const ACCESS_TYPE = '조회';
// 가정: 휴직 현황은 발령 구분이 '휴직'인 인사발령으로 본다.
const LEAVE_APPOINTMENT_TYPE = '휴직';

const STATUS_TYPES = ['입·퇴사', '휴직', '근속연수', '가족', '학력·경력'];
const SCOPE_RANK: Record<string, number> = { '전체': 0, '부서': 1, '개인': 2 };
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Controller('api/v1')
export class FnSfr01403Controller {
  @Get('/personnel-status')
  async listPersonnelStatus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const q = checks.queryOf(req.query);

    const statusType = String(q['statusType'] ?? '').trim();
    const startDate = String(q['startDate'] ?? '').trim();
    const endDate = String(q['endDate'] ?? '').trim();
    const viewScope = String(q['viewScope'] ?? '').trim();
    const employmentStatus = String(q['employmentStatus'] ?? '').trim();
    const departmentId = String(q['departmentId'] ?? '').trim();
    const pageRaw = String(q['page'] ?? '').trim();
    const sizeRaw = String(q['size'] ?? '').trim();

    if (statusType === '') {
      throw new ApiError(422, 'STATUS_TYPE_REQUIRED', '현황 구분을 선택해 주세요.');
    }
    if (!STATUS_TYPES.includes(statusType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '현황 구분이 올바르지 않습니다.');
    }
    if (startDate !== '' && !DATE_PATTERN.test(startDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 시작일 형식이 올바르지 않습니다.');
    }
    if (endDate !== '' && !DATE_PATTERN.test(endDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 종료일 형식이 올바르지 않습니다.');
    }
    if (viewScope !== '' && SCOPE_RANK[viewScope] === undefined) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 범위가 올바르지 않습니다.');
    }
    if (employmentStatus !== '' && employmentStatus !== '재직자' && employmentStatus !== '퇴직자') {
      throw new ApiError(400, 'VALIDATION_FAILED', '재직 구분이 올바르지 않습니다.');
    }
    if (departmentId !== '' && !/^\d+$/.test(departmentId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '주부서가 올바르지 않습니다.');
    }
    if (pageRaw !== '' && !/^\d+$/.test(pageRaw)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
    }
    if (sizeRaw !== '' && !/^\d+$/.test(sizeRaw)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
    }
    const page = pageRaw === '' ? 0 : Number(pageRaw);
    const size = sizeRaw === '' ? 20 : Math.min(Math.max(Number(sizeRaw), 1), 200);

    return transaction(async (db) => {
      if (startDate !== '' && endDate !== '') {
        const periodRows = await db.query(
          'SELECT CAST(:startDate AS date) > CAST(:endDate AS date) AS "invalid"',
          { startDate, endDate },
        );
        if (periodRows[0] && periodRows[0]['invalid'] === true) {
          throw new ApiError(422, 'INVALID_PERIOD', '조회 시작일은 종료일보다 늦을 수 없습니다.');
        }
      }

      const permRows = await db.query(
        [
          'SELECT mp.view_scope AS "viewScope"',
          'FROM menu_permission mp',
          'JOIN menu m ON m.menu_id = mp.menu_id',
          'WHERE mp.employee_id = CAST(:userId AS bigint)',
          'AND m.name = :menuName',
        ].join(' '),
        { userId: user.id, menuName: MENU_NAME },
      );
      if (permRows.length === 0) {
        throw new ApiError(403, 'FORBIDDEN', '임직원 현황을 조회할 권한이 없습니다.');
      }
      const permitted = String(permRows[0]['viewScope']);
      let scope = permitted;
      if (viewScope !== '' && SCOPE_RANK[viewScope] > SCOPE_RANK[permitted]) {
        scope = viewScope;
      }

      const params: Record<string, unknown> = { userId: user.id };
      const joins: string[] = [];
      const where: string[] = ['1 = 1'];
      let apptCols = 'CAST(NULL AS varchar) AS "appointmentType", CAST(NULL AS date) AS "appointmentDate"';
      let famCols = 'CAST(NULL AS varchar) AS "familyRelationship"';
      let dateCol = '';

      if (statusType === '입·퇴사') {
        dateCol = employmentStatus === '퇴직자' ? 'pr.resignation_date' : 'pr.hire_date';
      } else if (statusType === '근속연수') {
        dateCol = 'pr.hire_date';
      } else if (statusType === '휴직') {
        joins.push('JOIN personnel_appointment pa ON pa.employee_id = e.employee_id');
        where.push('pa.appointment_type = :leaveType');
        params['leaveType'] = LEAVE_APPOINTMENT_TYPE;
        apptCols = 'pa.appointment_type AS "appointmentType", pa.appointment_date AS "appointmentDate"';
        dateCol = 'pa.appointment_date';
      } else if (statusType === '가족') {
        joins.push('JOIN employee_family ef ON ef.employee_id = e.employee_id');
        famCols = 'ef.relationship AS "familyRelationship"';
      } else {
        // 학력·경력은 저장 테이블이 없어 결과가 없다.
        where.push('1 = 0');
      }

      if (dateCol !== '' && startDate !== '') {
        where.push(dateCol + ' >= CAST(:startDate AS date)');
        params['startDate'] = startDate;
      }
      if (dateCol !== '' && endDate !== '') {
        where.push(dateCol + ' <= CAST(:endDate AS date)');
        params['endDate'] = endDate;
      }
      if (employmentStatus !== '') {
        where.push('pr.employment_status = :employmentStatus');
        params['employmentStatus'] = employmentStatus;
      }
      if (departmentId !== '') {
        where.push('e.department_id = CAST(:departmentId AS bigint)');
        params['departmentId'] = departmentId;
      }
      if (scope === '부서') {
        where.push('e.department_id = (SELECT me.department_id FROM employee me WHERE me.employee_id = CAST(:userId AS bigint))');
      } else if (scope === '개인') {
        where.push('e.employee_id = CAST(:userId AS bigint)');
      }

      const columns = [
        'e.employee_id AS "employeeId"',
        'e.employee_no AS "employeeNo"',
        'e.name AS "employeeName"',
        'd.name AS "departmentName"',
        'pr.hire_date AS "hireDate"',
        'pr.resignation_date AS "resignationDate"',
        'pr.employment_status AS "employmentStatus"',
        apptCols,
        famCols,
        'CAST(EXTRACT(YEAR FROM age(CURRENT_DATE, pr.hire_date)) AS integer) AS "serviceYears"',
      ].join(', ');
      const fromSql = 'FROM employee e JOIN department d ON d.department_id = e.department_id JOIN personnel_record pr ON pr.employee_id = e.employee_id';
      const joinSql = joins.join(' ');
      const whereSql = where.join(' AND ');

      const countRows = await db.query(
        ['SELECT COUNT(*) AS "total"', fromSql, joinSql, 'WHERE', whereSql].join(' '),
        params,
      );
      const total = Number(countRows[0]['total']);

      const listParams: Record<string, unknown> = { ...params, limit: size, offset: page * size };
      const items = await db.query(
        [
          'SELECT',
          columns,
          fromSql,
          joinSql,
          'WHERE',
          whereSql,
          'ORDER BY e.employee_no, e.employee_id',
          'LIMIT :limit OFFSET :offset',
        ].join(' '),
        listParams,
      );

      await db.execute(
        [
          'INSERT INTO personal_info_access_log',
          '(employee_id, target_employee_id, target_info_type, access_type, accessed_at, access_ip, created_at, updated_at)',
          'VALUES (CAST(:userId AS bigint), NULL, :infoType, :accessType, now(), NULL, now(), now())',
        ].join(' '),
        { userId: user.id, infoType: ACCESS_INFO_TYPE, accessType: ACCESS_TYPE },
      );

      return { items, page, size, total };
    });
  }
}
