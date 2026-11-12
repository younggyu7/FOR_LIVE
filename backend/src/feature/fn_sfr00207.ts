import { Controller, Get, HttpCode, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const MAX_VALUE_LENGTH = 1000;

@Controller('api/v1')
export class FnSfr00207Controller {
  @Get('/system-settings')
  async listSystemSettings(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자', '시스템 관리자');
    const query = checks.queryOf(req.query);
    const page = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const size = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(page) || page < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '페이지 번호가 올바르지 않습니다.');
    }
    if (!Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '페이지 크기가 올바르지 않습니다.');
    }
    const limit = Math.min(size, MAX_SIZE);
    const category = query['category'] === undefined || query['category'] === '' ? null : String(query['category']);
    if (category !== null && category.length > 50) {
      throw new ApiError(400, 'VALIDATION_FAILED', '설정 분류는 50자 이하로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const totals = await db.query(
        'SELECT COUNT(*) AS "total" FROM system_setting WHERE (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS varchar))',
        { category },
      );
      const items = await db.query(
        'SELECT system_setting_id AS "systemSettingId", category AS "category", setting_key AS "settingKey", setting_name AS "settingName", setting_value AS "settingValue" '
          + 'FROM system_setting '
          + 'WHERE (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS varchar)) '
          + 'ORDER BY category, setting_key '
          + 'LIMIT :limit OFFSET :offset',
        { category, limit, offset: page * limit },
      );
      return { items, page, size: limit, total: Number(totals[0]['total']) };
    });
  }

  @Patch('/system-settings/:systemSettingId')
  @HttpCode(200)
  async updateSystemSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자', '시스템 관리자');
    const data = checks.inputOf(req.body);
    const systemSettingId = req.params['systemSettingId'];
    if (!/^\d+$/.test(systemSettingId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '환경설정 ID가 올바르지 않습니다.');
    }
    const settingValue = data['settingValue'];
    if (typeof settingValue !== 'string' || settingValue.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '설정 값을 입력해 주세요.');
    }
    if (settingValue.length > MAX_VALUE_LENGTH) {
      throw new ApiError(400, 'VALIDATION_FAILED', '설정 값은 1000자 이하로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT system_setting_id AS "systemSettingId" FROM system_setting WHERE system_setting_id = CAST(:id AS bigint)',
        { id: systemSettingId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'SYSTEM_SETTING_NOT_FOUND', '설정 항목을 찾을 수 없습니다.');
      }
      // TODO(질문): 항목별 허용값 목록이 입력에 없어 INVALID_SETTING_VALUE 검증은 구현하지 못했다.
      const rows = await db.query(
        'UPDATE system_setting SET setting_value = :settingValue, updated_at = now() '
          + 'WHERE system_setting_id = CAST(:id AS bigint) '
          + 'RETURNING system_setting_id AS "systemSettingId", setting_value AS "settingValue"',
        { id: systemSettingId, settingValue },
      );
      return rows[0];
    });
  }
}
