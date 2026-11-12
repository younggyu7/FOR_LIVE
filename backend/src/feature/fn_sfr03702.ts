import { Controller, Get, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 200;
const ADMIN_ROLE = '시스템 관리자';
// 가정: 설정 변경 이력의 대상 유형은 고정값 auth_setting
const HISTORY_TARGET_TYPE = 'auth_setting';

function optionalId(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '인증 대상 임직원 ID 형식이 올바르지 않습니다.');
  }
  return n;
}

function intOrDefault(value: unknown, fallback: number, min: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < min) {
    throw new ApiError(400, 'VALIDATION_FAILED', '조회 쪽 정보 형식이 올바르지 않습니다.');
  }
  return n;
}

function targetLabel(value: unknown): string {
  if (value === true) {
    return '대상';
  }
  if (value === false) {
    return '비대상';
  }
  return '미지정';
}

@Controller('api/v1')
export class FnSfr03702Controller {
  @Get('/auth-settings')
  async listAuthSettings(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ADMIN_ROLE);
    const q = checks.queryOf(req.query);
    const employeeId = optionalId(q['employeeId']);
    const page = intOrDefault(q['page'], 0, 0);
    const size = Math.min(intOrDefault(q['size'], DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    return transaction(async (db) => {
      const params = { employeeId, limit: size, offset: page * size };
      const items = await db.query(
        `SELECT auth_setting_id AS "authSettingId",
                employee_id AS "employeeId",
                allowed_device_count AS "allowedDeviceCount"
           FROM auth_setting
          WHERE CAST(:employeeId AS bigint) IS NULL
             OR employee_id = CAST(:employeeId AS bigint)
          ORDER BY auth_setting_id
          LIMIT :limit OFFSET :offset`,
        params,
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM auth_setting
          WHERE CAST(:employeeId AS bigint) IS NULL
             OR employee_id = CAST(:employeeId AS bigint)`,
        { employeeId },
      );
      return { items, page, size, total: Number(counts[0].total) };
    });
  }

  @Put('/auth-settings')
  async saveAuthSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ADMIN_ROLE);
    const data = checks.inputOf(req.body);
    const employeeId = optionalId(data['employeeId']);
    const twoFactorRequired = data['twoFactorRequired'];
    if (typeof twoFactorRequired !== 'boolean') {
      throw new ApiError(400, 'VALIDATION_FAILED', '2차 인증 대상 여부를 선택해 주세요.');
    }
    const count = data['allowedDeviceCount'];
    if (count === undefined || count === null || count === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '허용 인증기기 수를 입력해 주세요.');
    }
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
      throw new ApiError(422, 'INVALID_ALLOWED_DEVICE_COUNT', '허용 인증기기 수는 0 이상의 정수여야 합니다.');
    }
    return transaction(async (db) => {
      let previousTwoFactor: unknown = null;
      if (employeeId !== null) {
        const employees = await db.query(
          `SELECT two_factor_required AS "twoFactorRequired"
             FROM employee
            WHERE employee_id = CAST(:employeeId AS bigint)`,
          { employeeId },
        );
        if (employees.length === 0) {
          throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '대상 임직원을 찾을 수 없습니다.');
        }
        previousTwoFactor = employees[0].twoFactorRequired;
      }
      const existing = await db.query(
        `SELECT auth_setting_id AS "authSettingId",
                allowed_device_count AS "allowedDeviceCount"
           FROM auth_setting
          WHERE employee_id IS NOT DISTINCT FROM CAST(:employeeId AS bigint)
          ORDER BY auth_setting_id
          LIMIT 1`,
        { employeeId },
      );
      let authSettingId: number;
      let previousCount: unknown = null;
      if (existing.length > 0) {
        authSettingId = Number(existing[0].authSettingId);
        previousCount = existing[0].allowedDeviceCount;
        await db.execute(
          `UPDATE auth_setting
              SET allowed_device_count = CAST(:count AS integer),
                  updated_at = now()
            WHERE auth_setting_id = CAST(:authSettingId AS bigint)`,
          { count, authSettingId },
        );
      } else {
        const inserted = await db.query(
          `INSERT INTO auth_setting (employee_id, allowed_device_count, created_at, updated_at)
           VALUES (CAST(:employeeId AS bigint), CAST(:count AS integer), now(), now())
           RETURNING auth_setting_id AS "authSettingId"`,
          { employeeId, count },
        );
        authSettingId = Number(inserted[0].authSettingId);
      }
      if (employeeId !== null) {
        await db.execute(
          `UPDATE employee
              SET two_factor_required = :twoFactorRequired,
                  updated_at = now()
            WHERE employee_id = CAST(:employeeId AS bigint)`,
          { twoFactorRequired, employeeId },
        );
      }
      const content =
        '인증 대상: ' + targetLabel(previousTwoFactor) + ' → ' + targetLabel(twoFactorRequired) +
        ', 허용 인증기기 수: ' + (previousCount === null ? '없음' : String(previousCount)) + ' → ' + String(count);
      await db.execute(
        `INSERT INTO change_history
           (changer_id, target_type, target_id, changed_at, change_content, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), now(), :content, now(), now())`,
        {
          userId: user.id,
          targetType: HISTORY_TARGET_TYPE,
          targetId: authSettingId,
          content,
        },
      );
      return { authSettingId, allowedDeviceCount: count };
    });
  }
}
