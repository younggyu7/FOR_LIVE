import { Controller, Get, Post, Put, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '근태 담당자';
const APPLY_UNITS = ['법인', '부서', '사원'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 출퇴근 체크 유형의 허용값 목록이 명세에 없어 길이 50 이하의 비어 있지 않은 문자열이면 허용한다.
const CHECK_TYPE_MAX = 50;

interface Db {
  query(sql: string, params?: Record<string, unknown>): Promise<Record<string, unknown>[]>;
  execute(sql: string, params?: Record<string, unknown>): Promise<number>;
}

interface SettingInput {
  applyUnit: string;
  departmentId: number | null;
  employeeId: number | null;
  checkType: string;
}

function optionalId(value: unknown, label: string): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
  return n;
}

function parseInput(data: Record<string, unknown>): SettingInput {
  const applyUnit = data['applyUnit'];
  if (typeof applyUnit !== 'string' || !APPLY_UNITS.includes(applyUnit)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '적용 단위를 법인, 부서, 사원 중에서 선택해 주세요.');
  }
  const rawType = data['checkType'];
  const checkType = typeof rawType === 'string' ? rawType.trim() : '';
  if (checkType.length === 0 || checkType.length > CHECK_TYPE_MAX) {
    throw new ApiError(400, 'VALIDATION_FAILED', '출퇴근 체크 유형을 50자 이내로 입력해 주세요.');
  }
  let departmentId = optionalId(data['departmentId'], '대상 부서');
  let employeeId = optionalId(data['employeeId'], '대상 사원');
  if (applyUnit === '부서' && departmentId === null) {
    throw new ApiError(422, 'APPLY_TARGET_REQUIRED', '대상 부서를 선택해 주세요.');
  }
  if (applyUnit === '사원' && employeeId === null) {
    throw new ApiError(422, 'APPLY_TARGET_REQUIRED', '대상 사원을 선택해 주세요.');
  }
  if (applyUnit === '법인') {
    departmentId = null;
    employeeId = null;
  } else if (applyUnit === '부서') {
    employeeId = null;
  } else {
    departmentId = null;
  }
  return { applyUnit, departmentId, employeeId, checkType };
}

async function ensureTargets(db: Db, input: SettingInput): Promise<void> {
  if (input.departmentId !== null) {
    const rows = await db.query(
      'SELECT department_id FROM department WHERE department_id = CAST(:id AS bigint)',
      { id: input.departmentId },
    );
    if (rows.length === 0) {
      throw new ApiError(404, 'APPLY_TARGET_NOT_FOUND', '대상 부서를 찾을 수 없습니다.');
    }
  }
  if (input.employeeId !== null) {
    const rows = await db.query(
      'SELECT employee_id FROM employee WHERE employee_id = CAST(:id AS bigint)',
      { id: input.employeeId },
    );
    if (rows.length === 0) {
      throw new ApiError(404, 'APPLY_TARGET_NOT_FOUND', '대상 사원을 찾을 수 없습니다.');
    }
  }
}

function describe(source: object): string {
  const input = source as Record<string, unknown>;
  const dep = input['departmentId'] === null || input['departmentId'] === undefined ? '-' : String(input['departmentId']);
  const emp = input['employeeId'] === null || input['employeeId'] === undefined ? '-' : String(input['employeeId']);
  return '적용 단위=' + String(input['applyUnit']) + ', 대상 부서=' + dep + ', 대상 사원=' + emp + ', 체크 유형=' + String(input['checkType']);
}

function requireUserId(id: string | null | undefined): string {
  if (id === null || id === undefined || id === '') {
    throw new ApiError(401, 'UNAUTHORIZED', '인증이 필요합니다.');
  }
  return id;
}

async function writeHistory(db: Db, userId: string, targetId: number, changeType: string, content: string): Promise<void> {
  await db.execute(
    `INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
     VALUES (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), :changeType, now(), :content, now(), now())`,
    { userId, targetType: '출퇴근 체크 유형 설정', targetId, changeType, content },
  );
}

@Controller('api/v1')
export class FnSfr01704Controller {
  @Get('/commute-check-settings')
  async listCommuteCheckSettings(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const rawUnit = query['applyUnit'];
    let applyUnit: string | null = null;
    if (rawUnit !== undefined && rawUnit !== null && rawUnit !== '') {
      if (typeof rawUnit !== 'string' || !APPLY_UNITS.includes(rawUnit)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '적용 단위가 올바르지 않습니다.');
      }
      applyUnit = rawUnit;
    }
    const rawPage = query['page'];
    const rawSize = query['size'];
    const page = rawPage === undefined || rawPage === '' ? 0 : Number(rawPage);
    const size = rawSize === undefined || rawSize === '' ? DEFAULT_SIZE : Number(rawSize);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const limit = Math.min(size, MAX_SIZE);
    return transaction(async (db) => {
      const totalRows = await db.query(
        `SELECT COUNT(*) AS "total" FROM commute_check_setting
         WHERE (CAST(:applyUnit AS text) IS NULL OR apply_unit = CAST(:applyUnit AS text))`,
        { applyUnit },
      );
      const items = await db.query(
        `SELECT commute_check_setting_id AS "commuteCheckSettingId",
                apply_unit AS "applyUnit",
                department_id AS "departmentId",
                employee_id AS "employeeId",
                check_type AS "checkType"
         FROM commute_check_setting
         WHERE (CAST(:applyUnit AS text) IS NULL OR apply_unit = CAST(:applyUnit AS text))
         ORDER BY commute_check_setting_id
         LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)`,
        { applyUnit, limit, offset: page * limit },
      );
      return { items, page, size: limit, total: Number(totalRows[0]['total']) };
    });
  }

  @Post('/commute-check-settings')
  @HttpCode(200)
  async createCommuteCheckSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const userId = requireUserId(user.id);
    const data = checks.inputOf(req.body);
    const input = parseInput(data);
    return transaction(async (db) => {
      await ensureTargets(db, input);
      const rows = await db.query(
        `INSERT INTO commute_check_setting (apply_unit, department_id, employee_id, check_type, created_at, updated_at)
         VALUES (:applyUnit, CAST(:departmentId AS bigint), CAST(:employeeId AS bigint), :checkType, now(), now())
         RETURNING commute_check_setting_id AS "commuteCheckSettingId"`,
        { ...input },
      );
      const id = Number(rows[0]['commuteCheckSettingId']);
      await writeHistory(db, userId, id, '설정 등록', '등록: ' + describe(input));
      return { commuteCheckSettingId: id };
    });
  }

  @Put('/commute-check-settings/:commuteCheckSettingId')
  async updateCommuteCheckSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const userId = requireUserId(user.id);
    const idText = req.params['commuteCheckSettingId'];
    const id = Number(idText);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '설정 ID 형식이 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const input = parseInput(data);
    return transaction(async (db) => {
      const before = await db.query(
        `SELECT apply_unit AS "applyUnit", department_id AS "departmentId", employee_id AS "employeeId", check_type AS "checkType"
         FROM commute_check_setting
         WHERE commute_check_setting_id = CAST(:id AS bigint)`,
        { id },
      );
      if (before.length === 0) {
        throw new ApiError(404, 'COMMUTE_CHECK_SETTING_NOT_FOUND', '출퇴근 체크 유형 설정을 찾을 수 없습니다.');
      }
      await ensureTargets(db, input);
      await db.execute(
        `UPDATE commute_check_setting
         SET apply_unit = :applyUnit,
             department_id = CAST(:departmentId AS bigint),
             employee_id = CAST(:employeeId AS bigint),
             check_type = :checkType,
             updated_at = now()
         WHERE commute_check_setting_id = CAST(:id AS bigint)`,
        { ...input, id },
      );
      const content = '변경 전: ' + describe(before[0]) + ' → 변경 후: ' + describe(input);
      await writeHistory(db, userId, id, '설정 변경', content);
      return { commuteCheckSettingId: id };
    });
  }
}
