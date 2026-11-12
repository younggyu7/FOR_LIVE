import { Controller, Delete, HttpCode, Patch, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const WIDGET_TYPES = ['결재양식', '결재함', '일정캘린더', '통합알림', '퀵링크', '나의정보'];

function intOf(value: unknown, min: number, label: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값을 올바르게 입력해 주세요.');
  }
  return value;
}

function idOf(value: unknown): string {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '개인 메뉴 구성 ID가 올바르지 않습니다.');
  }
  return value;
}

@Controller('api/v1')
export class FnSfr02705Controller {
  @Put('/portal-widget-settings')
  async updatePortalWidgetSettings(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const widgetType = data['widgetType'];
    if (typeof widgetType !== 'string' || !WIDGET_TYPES.includes(widgetType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '위젯 종류를 올바르게 선택해 주세요.');
    }
    if (typeof data['visibleYn'] !== 'boolean') {
      throw new ApiError(400, 'VALIDATION_FAILED', '표시 여부를 선택해 주세요.');
    }
    const visibleYn = data['visibleYn'];
    const displayOrder = intOf(data['displayOrder'], 1, '배치 순서');
    return transaction(async (db) => {
      const rows = await db.query(
        `INSERT INTO portal_widget_setting (employee_id, widget_type, visible_yn, display_order, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), :widgetType, :visibleYn, :displayOrder, now(), now())
         ON CONFLICT (employee_id, widget_type)
         DO UPDATE SET visible_yn = EXCLUDED.visible_yn, display_order = EXCLUDED.display_order, updated_at = now()
         RETURNING widget_type AS "widgetType", visible_yn AS "visibleYn", display_order AS "displayOrder"`,
        { userId: user.id, widgetType, visibleYn, displayOrder },
      );
      return rows[0];
    });
  }

  @Post('/personal-menus')
  @HttpCode(200)
  async createPersonalMenu(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const menuId = intOf(data['menuId'], 1, '메뉴');
    const sortOrder = intOf(data['sortOrder'], 0, '메뉴 구성 순서');
    return transaction(async (db) => {
      const menus = await db.query(
        'SELECT menu_id FROM menu WHERE menu_id = CAST(:menuId AS bigint)',
        { menuId },
      );
      if (menus.length === 0) {
        throw new ApiError(404, 'MENU_NOT_FOUND', '메뉴를 찾을 수 없습니다.');
      }
      const perms = await db.query(
        'SELECT menu_permission_id FROM menu_permission WHERE employee_id = CAST(:userId AS bigint) AND menu_id = CAST(:menuId AS bigint)',
        { userId: user.id, menuId },
      );
      if (perms.length === 0) {
        throw new ApiError(422, 'MENU_PERMISSION_DENIED', '사용 권한이 없는 메뉴는 추가할 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT personal_menu_id FROM personal_menu WHERE employee_id = CAST(:userId AS bigint) AND menu_id = CAST(:menuId AS bigint)',
        { userId: user.id, menuId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PERSONAL_MENU_DUPLICATED', '이미 개인 메뉴에 추가된 메뉴입니다.');
      }
      const rows = await db.query(
        `INSERT INTO personal_menu (employee_id, menu_id, sort_order, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), CAST(:menuId AS bigint), :sortOrder, now(), now())
         RETURNING personal_menu_id AS "personalMenuId"`,
        { userId: user.id, menuId, sortOrder },
      );
      return rows[0];
    });
  }

  @Patch('/personal-menus/:personalMenuId')
  async updatePersonalMenu(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const personalMenuId = idOf(req.params['personalMenuId']);
    const data = checks.inputOf(req.body);
    const sortOrder = intOf(data['sortOrder'], 0, '메뉴 구성 순서');
    return transaction(async (db) => {
      const rows = await db.query(
        `UPDATE personal_menu SET sort_order = :sortOrder, updated_at = now()
         WHERE personal_menu_id = CAST(:personalMenuId AS bigint) AND employee_id = CAST(:userId AS bigint)
         RETURNING personal_menu_id AS "personalMenuId", sort_order AS "sortOrder"`,
        { sortOrder, personalMenuId, userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'PERSONAL_MENU_NOT_FOUND', '본인의 개인 메뉴를 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }

  @Delete('/personal-menus/:personalMenuId')
  async deletePersonalMenu(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const personalMenuId = idOf(req.params['personalMenuId']);
    return transaction(async (db) => {
      const count = await db.execute(
        'DELETE FROM personal_menu WHERE personal_menu_id = CAST(:personalMenuId AS bigint) AND employee_id = CAST(:userId AS bigint)',
        { personalMenuId, userId: user.id },
      );
      if (count === 0) {
        throw new ApiError(404, 'PERSONAL_MENU_NOT_FOUND', '본인의 개인 메뉴를 찾을 수 없습니다.');
      }
      return {};
    });
  }
}
