import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 조회 권한 범위를 판정하는 메뉴 이름 (menu.name)
const MENU_NAME = '인사발령 이력·현황';
// 가정: 처리된 발령 이력은 승인·마감 상태의 발령이다 (SQL의 상태 조건)
// 가정: 승진현황 이외의 보고서 종류는 조건에 맞는 전체 이력을 대상으로 한다
const PROMOTION_REPORT = '승진현황';
const PROMOTION_TYPE = '승진';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const SCOPE_RANK: Record<string, number> = { 개인: 1, 부서: 2, 전체: 3 };
const EMPLOYMENT_STATUSES = ['재직자', '퇴직자'];
// 가정: 열람 이력에 남기는 대상 정보 구분과 접근 유형
const INFO_TYPE = '인사발령 이력';
const ACCESS_VIEW = '조회';
const ACCESS_REPORT = '보고서 생성';

type Row = Record<string, unknown>;
type Db = {
  query(sql: string, params?: Row): Promise<any[]>;
  execute(sql: string, params?: Row): Promise<number>;
};

const FROM_SQL =
  ' FROM personnel_appointment pa' +
  ' JOIN employee e ON e.employee_id = pa.employee_id' +
  ' LEFT JOIN personnel_record pr ON pr.employee_id = pa.employee_id';

const SELECT_SQL =
  'SELECT pa.personnel_appointment_id AS "personnelAppointmentId",' +
  ' pa.employee_id AS "employeeId",' +
  ' pa.appointment_type AS "appointmentType",' +
  " to_char(pa.appointment_date, 'YYYY-MM-DD') AS \"appointmentDate\"," +
  ' pa.department_id AS "departmentId",' +
  ' pa.position_after AS "positionAfter"';

const ORDER_SQL = ' ORDER BY pa.appointment_date DESC, pa.personnel_appointment_id DESC';

function textOf(v: unknown): string | null {
  if (v === undefined || v === null) {
    return null;
  }
  const s = String(v).trim();
  return s === '' ? null : s;
}

function userIdOf(id: unknown): string {
  const s = textOf(id);
  if (s === null) {
    throw new ApiError(401, 'UNAUTHORIZED', '인증이 필요합니다.');
  }
  return s;
}

function dateOf(v: unknown, name: string): string | null {
  const s = textOf(v);
  if (s === null) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new ApiError(400, 'VALIDATION_FAILED', name + ' 형식이 올바르지 않습니다.');
  }
  return s;
}

function idOf(v: unknown, name: string): string | null {
  const s = textOf(v);
  if (s === null) {
    return null;
  }
  if (!/^\d+$/.test(s)) {
    throw new ApiError(400, 'VALIDATION_FAILED', name + ' 값이 올바르지 않습니다.');
  }
  return s;
}

function intOf(v: unknown, name: string, def: number, min: number, max: number): number {
  const s = textOf(v);
  if (s === null) {
    return def;
  }
  if (!/^\d+$/.test(s)) {
    throw new ApiError(400, 'VALIDATION_FAILED', name + ' 값이 올바르지 않습니다.');
  }
  const n = Number(s);
  if (n < min || n > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', name + ' 값이 올바르지 않습니다.');
  }
  return n;
}

// 조회자의 권한 범위 안에서만 조회하도록 조건을 만든다
async function buildWhere(
  db: Db,
  userId: string,
  q: Row,
): Promise<{ where: string; params: Row; employeeId: string | null }> {
  const perm = await db.query(
    'SELECT mp.view_scope AS "viewScope" FROM menu_permission mp' +
      ' JOIN menu m ON m.menu_id = mp.menu_id' +
      ' WHERE mp.employee_id = CAST(:userId AS bigint) AND m.name = :menuName',
    { userId, menuName: MENU_NAME },
  );
  if (perm.length === 0) {
    throw new ApiError(403, 'FORBIDDEN', '인사발령 이력·현황을 조회할 권한이 없습니다.');
  }
  const permitted = String(perm[0]['viewScope']);
  const requested = textOf(q['viewScope']) ?? permitted;
  if (SCOPE_RANK[requested] === undefined) {
    throw new ApiError(400, 'VALIDATION_FAILED', '조회 범위 값이 올바르지 않습니다.');
  }
  if (SCOPE_RANK[requested] > (SCOPE_RANK[permitted] ?? 0)) {
    throw new ApiError(422, 'VIEW_SCOPE_NOT_ALLOWED', '조회 권한이 없는 범위입니다.');
  }
  const conds: string[] = ["pa.status IN ('승인', '마감')"];
  const params: Row = { userId };
  if (requested === '부서') {
    conds.push(
      'pa.employee_id IN (SELECT s.employee_id FROM employee s WHERE s.department_id =' +
        ' (SELECT u.department_id FROM employee u WHERE u.employee_id = CAST(:userId AS bigint)))',
    );
  } else if (requested === '개인') {
    conds.push('pa.employee_id = CAST(:userId AS bigint)');
  }
  const startDate = dateOf(q['startDate'], '시작일');
  if (startDate !== null) {
    conds.push('pa.appointment_date >= CAST(:startDate AS date)');
    params['startDate'] = startDate;
  }
  const endDate = dateOf(q['endDate'], '종료일');
  if (endDate !== null) {
    conds.push('pa.appointment_date <= CAST(:endDate AS date)');
    params['endDate'] = endDate;
  }
  const departmentId = idOf(q['departmentId'], '부서');
  if (departmentId !== null) {
    conds.push('pa.department_id = CAST(:departmentId AS bigint)');
    params['departmentId'] = departmentId;
  }
  const employeeId = idOf(q['employeeId'], '임직원');
  if (employeeId !== null) {
    conds.push('pa.employee_id = CAST(:employeeId AS bigint)');
    params['employeeId'] = employeeId;
  }
  const appointmentType = textOf(q['appointmentType']);
  if (appointmentType !== null) {
    conds.push('pa.appointment_type = :appointmentType');
    params['appointmentType'] = appointmentType;
  }
  const employmentStatus = textOf(q['employmentStatus']);
  if (employmentStatus !== null) {
    if (!EMPLOYMENT_STATUSES.includes(employmentStatus)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '재직 구분 값이 올바르지 않습니다.');
    }
    conds.push('pr.employment_status = :employmentStatus');
    params['employmentStatus'] = employmentStatus;
  }
  return { where: ' WHERE ' + conds.join(' AND '), params, employeeId };
}

// 개인정보 열람·접근 이력을 남긴다
async function logAccess(
  db: Db,
  userId: string,
  targetId: string | null,
  accessType: string,
  ip: string | null,
): Promise<void> {
  await db.execute(
    'INSERT INTO personal_info_access_log (employee_id, target_employee_id, target_info_type,' +
      ' access_type, accessed_at, access_ip, created_at, updated_at)' +
      ' VALUES (CAST(:userId AS bigint), CAST(:targetId AS bigint), :infoType, :accessType,' +
      ' now(), :ip, now(), now())',
    { userId, targetId, infoType: INFO_TYPE, accessType, ip },
  );
}

@Controller('api/v1')
export class FnSfr01304Controller {
  @Get('/personnel-appointment-histories')
  async listPersonnelAppointmentHistories(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자', '임직원');
    const userId = userIdOf(user.id);
    const q = checks.queryOf(req.query);
    const page = intOf(q['page'], 'page', 0, 0, 1000000);
    const size = intOf(q['size'], 'size', DEFAULT_SIZE, 1, MAX_SIZE);
    const ip = req.ip ? String(req.ip).slice(0, 45) : null;
    return transaction(async (db) => {
      const f = await buildWhere(db, userId, q);
      const items = await db.query(
        SELECT_SQL + FROM_SQL + f.where + ORDER_SQL +
          ' LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { ...f.params, size, offset: page * size },
      );
      const counted = await db.query(
        'SELECT CAST(COUNT(*) AS integer) AS "total"' + FROM_SQL + f.where,
        f.params,
      );
      await logAccess(db, userId, f.employeeId, ACCESS_VIEW, ip);
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }

  @Get('/personnel-appointment-histories/summary')
  async getPersonnelAppointmentSummary(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자', '임직원');
    const userId = userIdOf(user.id);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      const f = await buildWhere(db, userId, q);
      const items = await db.query(
        'SELECT pa.appointment_type AS "appointmentType", CAST(COUNT(*) AS integer) AS "count"' +
          FROM_SQL + f.where +
          ' GROUP BY pa.appointment_type ORDER BY pa.appointment_type',
        f.params,
      );
      return { items, page: 0, size: items.length, total: items.length };
    });
  }

  @Post('/personnel-appointment-reports')
  @HttpCode(200)
  async createPersonnelAppointmentReport(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const userId = userIdOf(user.id);
    const data = checks.inputOf(req.body);
    const reportType = textOf(data['reportType']);
    if (reportType === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '보고서 종류를 입력해 주세요.');
    }
    const q: Row = { ...data };
    if (reportType === PROMOTION_REPORT) {
      q['appointmentType'] = PROMOTION_TYPE;
    }
    const ip = req.ip ? String(req.ip).slice(0, 45) : null;
    return transaction(async (db) => {
      const f = await buildWhere(db, userId, q);
      const items = await db.query(SELECT_SQL + FROM_SQL + f.where + ORDER_SQL, f.params);
      if (items.length === 0) {
        throw new ApiError(422, 'NO_REPORT_DATA', '조건에 해당하는 이력이 없어 보고서를 생성하지 않았습니다.');
      }
      await logAccess(db, userId, f.employeeId, ACCESS_REPORT, ip);
      return { reportType, items };
    });
  }
}
