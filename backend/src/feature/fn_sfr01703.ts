import { Controller, Get, Post, Put, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '근태 담당자';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const STANDARD_MAX = 200;
const CHANGE_TARGET = 'employee_attendance_setting';
const CHANGE_TYPE = '설정 변경';

function validation(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function requiredId(value: unknown, label: string): number {
  const text = String(value ?? '').trim();
  if (!/^\d+$/.test(text)) {
    throw validation(label + ' 값이 올바르지 않습니다.');
  }
  return Number(text);
}

function optionalText(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || value.length > STANDARD_MAX) {
    throw validation(label + ' 값이 올바르지 않습니다.');
  }
  return value;
}

function optionalDate(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw validation(label + ' 값이 올바르지 않습니다.');
  }
  return value;
}

async function ensureEmployee(db: any, employeeId: number): Promise<void> {
  const rows = await db.query(
    'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
    { employeeId },
  );
  if (rows.length === 0) {
    throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
  }
}

// 미사용 근태항목 적용 불가 규칙은 (확인 필요) 표시가 남아 있으나 승인된 규칙이므로 구현한다 (가정)
async function ensureUsableItem(db: any, attendanceItemId: number): Promise<void> {
  const rows = await db.query(
    'SELECT use_yn AS "useYn" FROM attendance_item WHERE attendance_item_id = CAST(:itemId AS bigint)',
    { itemId: attendanceItemId },
  );
  if (rows.length === 0) {
    throw new ApiError(404, 'ATTENDANCE_ITEM_NOT_FOUND', '근태항목을 찾을 수 없습니다.');
  }
  if (rows[0].useYn === '미사용') {
    throw new ApiError(422, 'ATTENDANCE_ITEM_UNUSED', '미사용 근태항목은 적용할 수 없습니다.');
  }
}

async function writeHistory(db: any, userId: string | null, targetId: number, content: string): Promise<void> {
  await db.execute(
    'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) ' +
      'VALUES (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), :changeType, now(), :content, now(), now())',
    {
      userId,
      targetType: CHANGE_TARGET,
      targetId,
      changeType: CHANGE_TYPE,
      content,
    },
  );
}

// TODO(AC-FN-SFR-017-03-4): 마감 기간을 알 수 있는 테이블이 없어 ATTENDANCE_PERIOD_CLOSED 검사는 구현하지 못했다.
// TODO(AC-FN-SFR-017-03-7): 근태 담당자의 조회 범위(전체/부서/개인) 출처가 없어 범위 제한은 구현하지 못했다.
@Controller('api/v1')
export class FnSfr01703Controller {
  @Get('/employee-attendance-settings')
  async listEmployeeAttendanceSettings(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const page = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? 20 : Number(query['size']);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw validation('page 또는 size 값이 올바르지 않습니다.');
    }
    const size = Math.min(sizeRaw, 200);
    const hasEmployee = query['employeeId'] !== undefined && query['employeeId'] !== '';
    const employeeId = hasEmployee ? requiredId(query['employeeId'], '임직원') : null;
    return transaction(async (db) => {
      if (employeeId !== null) {
        await ensureEmployee(db, employeeId);
      }
      const params = { employeeId, limit: size, offset: page * size };
      const where = 'WHERE (CAST(:employeeId AS bigint) IS NULL OR employee_id = CAST(:employeeId AS bigint))';
      const items = await db.query(
        'SELECT employee_attendance_setting_id AS "employeeAttendanceSettingId", ' +
          'employee_id AS "employeeId", ' +
          'attendance_item_id AS "attendanceItemId", ' +
          'apply_standard AS "applyStandard", ' +
          'apply_start_date AS "applyStartDate", ' +
          'apply_end_date AS "applyEndDate" ' +
          'FROM employee_attendance_setting ' +
          where +
          ' ORDER BY employee_attendance_setting_id DESC ' +
          'LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)',
        params,
      );
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM employee_attendance_setting ' + where,
        { employeeId },
      );
      return { items, page, size, total: Number(counts[0].total) };
    });
  }

  @Post('/employee-attendance-settings')
  @HttpCode(200)
  async createEmployeeAttendanceSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const employeeId = requiredId(data['employeeId'], '임직원');
    const attendanceItemId = requiredId(data['attendanceItemId'], '근태항목');
    const applyStandard = optionalText(data['applyStandard'], '적용 근태 기준');
    const applyStartDate = optionalDate(data['applyStartDate'], '적용 시작일');
    return transaction(async (db) => {
      await ensureEmployee(db, employeeId);
      await ensureUsableItem(db, attendanceItemId);
      // 적용 시작일 미입력 시 당일 (가정)
      const rows = await db.query(
        'INSERT INTO employee_attendance_setting ' +
          '(employee_id, attendance_item_id, apply_start_date, apply_standard, created_at, updated_at) ' +
          'VALUES (CAST(:employeeId AS bigint), CAST(:itemId AS bigint), ' +
          'COALESCE(CAST(:startDate AS date), CAST(now() AS date)), :standard, now(), now()) ' +
          'RETURNING employee_attendance_setting_id AS "employeeAttendanceSettingId", ' +
          'apply_start_date::text AS "applyStartDate"',
        {
          employeeId,
          itemId: attendanceItemId,
          startDate: applyStartDate,
          standard: applyStandard,
        },
      );
      const created = rows[0];
      const content =
        '등록: 임직원 ' + employeeId +
        ', 근태항목 ' + attendanceItemId +
        ', 적용 근태 기준 ' + (applyStandard ?? '-') +
        ', 적용 시작일 ' + created.applyStartDate;
      await writeHistory(db, user.id, Number(created.employeeAttendanceSettingId), content);
      return { employeeAttendanceSettingId: Number(created.employeeAttendanceSettingId) };
    });
  }

  @Put('/employee-attendance-settings/:employeeAttendanceSettingId')
  async updateEmployeeAttendanceSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const settingId = requiredId(req.params['employeeAttendanceSettingId'], '설정 ID');
    const data = checks.inputOf(req.body);
    const attendanceItemId = requiredId(data['attendanceItemId'], '근태항목');
    const applyStandard = optionalText(data['applyStandard'], '적용 근태 기준');
    const applyStartDate = optionalDate(data['applyStartDate'], '적용 시작일');
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT attendance_item_id AS "attendanceItemId", apply_standard AS "applyStandard", ' +
          'apply_start_date::text AS "applyStartDate" ' +
          'FROM employee_attendance_setting ' +
          'WHERE employee_attendance_setting_id = CAST(:settingId AS bigint)',
        { settingId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_ATTENDANCE_SETTING_NOT_FOUND', '근태 적용 설정을 찾을 수 없습니다.');
      }
      const before = found[0];
      await ensureUsableItem(db, attendanceItemId);
      await db.execute(
        'UPDATE employee_attendance_setting SET ' +
          'attendance_item_id = CAST(:itemId AS bigint), ' +
          'apply_standard = :standard, ' +
          'apply_start_date = COALESCE(CAST(:startDate AS date), apply_start_date), ' +
          'updated_at = now() ' +
          'WHERE employee_attendance_setting_id = CAST(:settingId AS bigint)',
        {
          itemId: attendanceItemId,
          standard: applyStandard,
          startDate: applyStartDate,
          settingId,
        },
      );
      const content =
        '변경 전: 근태항목 ' + before.attendanceItemId +
        ', 적용 근태 기준 ' + (before.applyStandard ?? '-') +
        ', 적용 시작일 ' + before.applyStartDate +
        ' / 변경 후: 근태항목 ' + attendanceItemId +
        ', 적용 근태 기준 ' + (applyStandard ?? '-') +
        ', 적용 시작일 ' + (applyStartDate ?? before.applyStartDate);
      await writeHistory(db, user.id, settingId, content);
      return { employeeAttendanceSettingId: settingId };
    });
  }
}
