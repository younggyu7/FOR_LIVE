import { Controller, HttpCode, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const USE_VALUES = ['사용', '미사용'];

function idOf(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '경로의 ID 형식이 올바르지 않습니다.');
  }
  return value;
}

@Controller('api/v1')
export class FnSfr01802Controller {
  @Put('/system-settings/:systemSettingId')
  @HttpCode(200)
  async updateSystemSetting2(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const id = idOf(req, 'systemSettingId');
    const data = checks.inputOf(req.body);
    const settingValue = data['settingValue'];
    const description = data['description'];
    if (settingValue === undefined || settingValue === null || (typeof settingValue === 'string' && settingValue.trim() === '')) {
      throw new ApiError(422, 'SETTING_VALUE_REQUIRED', '설정 값을 입력해 주세요.');
    }
    if (typeof settingValue !== 'string' || settingValue.length > 1000) {
      throw new ApiError(400, 'VALIDATION_FAILED', '설정 값은 1000자 이하의 문자열이어야 합니다.');
    }
    if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 500)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '설명은 500자 이하의 문자열이어야 합니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `UPDATE system_setting
            SET setting_value = :settingValue,
                description = COALESCE(CAST(:description AS varchar), description),
                updated_at = now()
          WHERE system_setting_id = CAST(:id AS bigint)
      RETURNING system_setting_id AS "systemSettingId"`,
        { id, settingValue, description: description ?? null },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'SYSTEM_SETTING_NOT_FOUND', '설정을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }

  @Put('/attendance-items/:attendanceItemId')
  @HttpCode(200)
  async updateAttendanceItem2(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const id = idOf(req, 'attendanceItemId');
    const data = checks.inputOf(req.body);
    const useYn = data['useYn'];
    if (typeof useYn !== 'string' || !USE_VALUES.includes(useYn)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `UPDATE attendance_item
            SET use_yn = :useYn,
                updated_at = now()
          WHERE attendance_item_id = CAST(:id AS bigint)
      RETURNING attendance_item_id AS "attendanceItemId", use_yn AS "useYn"`,
        { id, useYn },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'ATTENDANCE_ITEM_NOT_FOUND', '근태항목을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }

  @Put('/approval-forms/:approvalFormId')
  @HttpCode(200)
  async updateApprovalForm(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const id = idOf(req, 'approvalFormId');
    const data = checks.inputOf(req.body);
    const formBody = data['formBody'];
    const useStatus = data['useStatus'];
    if (typeof useStatus !== 'string' || !USE_VALUES.includes(useStatus)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    if (formBody !== undefined && formBody !== null && typeof formBody !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '양식 본문은 문자열이어야 합니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `UPDATE approval_form
            SET form_body = COALESCE(CAST(:formBody AS text), form_body),
                use_status = :useStatus,
                updated_at = now()
          WHERE approval_form_id = CAST(:id AS bigint)
      RETURNING approval_form_id AS "approvalFormId"`,
        { id, formBody: formBody ?? null, useStatus },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'APPROVAL_FORM_NOT_FOUND', '결재양식을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }
}
