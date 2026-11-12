import { Controller, Get, Post, Put, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const WIDGET_TYPES = ['결재양식', '결재함', '일정캘린더', '통합알림', '퀵링크', '나의정보'];
const USE_VALUES = ['사용', '미사용'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function bad(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function paging(q: Record<string, unknown>): { page: number; size: number } {
  const rawPage = Number(q['page'] ?? 0);
  const rawSize = Number(q['size'] ?? 20);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 0;
  let size = Number.isFinite(rawSize) && rawSize > 0 ? Math.floor(rawSize) : 20;
  if (size > 200) {
    size = 200;
  }
  return { page, size };
}

function isInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v);
}

@Controller('api/v1')
export class FnSfr02604Controller {
  @Get('/portal-widget-settings')
  async listPortalWidgetSettings(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const { page, size } = paging(q);
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT portal_widget_setting_id AS "portalWidgetSettingId", widget_type AS "widgetType", visible_yn AS "visibleYn", display_order AS "displayOrder" FROM portal_widget_setting WHERE employee_id = CAST(:userId AS bigint) ORDER BY display_order, portal_widget_setting_id LIMIT :size OFFSET :offset',
        { userId: user.id, size, offset: page * size },
      );
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM portal_widget_setting WHERE employee_id = CAST(:userId AS bigint)',
        { userId: user.id },
      );
      return { items, page, size, total: Number(counts[0].total) };
    });
  }

  @Post('/portal-widget-settings')
  @HttpCode(200)
  async createPortalWidgetSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const widgetType = data['widgetType'];
    const visibleYn = data['visibleYn'];
    const displayOrder = data['displayOrder'];
    if (typeof widgetType !== 'string' || !WIDGET_TYPES.includes(widgetType)) {
      throw bad('위젯 종류를 확인해 주세요.');
    }
    if (typeof visibleYn !== 'boolean') {
      throw bad('표시 여부를 확인해 주세요.');
    }
    if (!isInt(displayOrder) || displayOrder < 1) {
      throw bad('배치 순서는 1 이상의 정수여야 합니다.');
    }
    return transaction(async (db) => {
      const dup = await db.query(
        'SELECT portal_widget_setting_id FROM portal_widget_setting WHERE employee_id = CAST(:userId AS bigint) AND widget_type = :widgetType',
        { userId: user.id, widgetType },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PORTAL_WIDGET_SETTING_DUPLICATED', '같은 위젯 설정이 이미 있습니다.');
      }
      const rows = await db.query(
        'INSERT INTO portal_widget_setting (employee_id, widget_type, visible_yn, display_order, created_at, updated_at) VALUES (CAST(:userId AS bigint), :widgetType, :visibleYn, :displayOrder, now(), now()) RETURNING portal_widget_setting_id AS "portalWidgetSettingId"',
        { userId: user.id, widgetType, visibleYn, displayOrder },
      );
      return { portalWidgetSettingId: Number(rows[0].portalWidgetSettingId) };
    });
  }

  @Put('/portal-widget-settings/:portalWidgetSettingId')
  async updatePortalWidgetSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const id = req.params['portalWidgetSettingId'];
    const visibleYn = data['visibleYn'];
    const displayOrder = data['displayOrder'];
    if (typeof visibleYn !== 'boolean') {
      throw bad('표시 여부를 확인해 주세요.');
    }
    if (!isInt(displayOrder) || displayOrder < 1) {
      throw bad('배치 순서는 1 이상의 정수여야 합니다.');
    }
    if (typeof id !== 'string' || !/^\d+$/.test(id)) {
      throw new ApiError(404, 'PORTAL_WIDGET_SETTING_NOT_FOUND', '설정을 찾을 수 없습니다.');
    }
    return transaction(async (db) => {
      const changed = await db.execute(
        'UPDATE portal_widget_setting SET visible_yn = :visibleYn, display_order = :displayOrder, updated_at = now() WHERE portal_widget_setting_id = CAST(:id AS bigint) AND employee_id = CAST(:userId AS bigint)',
        { id, userId: user.id, visibleYn, displayOrder },
      );
      if (changed === 0) {
        throw new ApiError(404, 'PORTAL_WIDGET_SETTING_NOT_FOUND', '설정이 없거나 본인 설정이 아닙니다.');
      }
      return { portalWidgetSettingId: Number(id) };
    });
  }

  @Get('/portal-banners')
  async listPortalBanners(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자', '임직원');
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const { page, size } = paging(q);
    const useYn = q['useYn'];
    if (useYn !== undefined && useYn !== null && useYn !== '' && (typeof useYn !== 'string' || !USE_VALUES.includes(useYn))) {
      throw bad('사용 여부를 확인해 주세요.');
    }
    const filtered = typeof useYn === 'string' && useYn !== '';
    return transaction(async (db) => {
      const where = filtered ? ' WHERE use_yn = :useYn' : '';
      const params: Record<string, unknown> = { size, offset: page * size };
      if (filtered) {
        params['useYn'] = useYn;
      }
      const items = await db.query(
        'SELECT portal_banner_id AS "portalBannerId", title AS "title", image_url AS "imageUrl", link_url AS "linkUrl", display_order AS "displayOrder" FROM portal_banner' + where + ' ORDER BY display_order, portal_banner_id LIMIT :size OFFSET :offset',
        params,
      );
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM portal_banner' + where,
        filtered ? { useYn } : {},
      );
      return { items, page, size, total: Number(counts[0].total) };
    });
  }

  @Post('/portal-banners')
  @HttpCode(200)
  async createPortalBanner(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const title = data['title'];
    const displayOrder = data['displayOrder'];
    const useYn = data['useYn'];
    const imageUrl = data['imageUrl'] === undefined || data['imageUrl'] === '' ? null : data['imageUrl'];
    const linkUrl = data['linkUrl'] === undefined || data['linkUrl'] === '' ? null : data['linkUrl'];
    const startDate = data['startDate'] === undefined || data['startDate'] === '' ? null : data['startDate'];
    const endDate = data['endDate'] === undefined || data['endDate'] === '' ? null : data['endDate'];
    if (typeof title !== 'string' || title.trim() === '' || title.length > 200) {
      throw bad('배너 제목을 200자 이내로 입력해 주세요.');
    }
    if (!isInt(displayOrder)) {
      throw bad('표시 순서는 정수여야 합니다.');
    }
    if (typeof useYn !== 'string' || !USE_VALUES.includes(useYn)) {
      throw bad('사용 여부를 확인해 주세요.');
    }
    if (imageUrl !== null && (typeof imageUrl !== 'string' || imageUrl.length > 500)) {
      throw bad('이미지 경로를 확인해 주세요.');
    }
    if (linkUrl !== null && (typeof linkUrl !== 'string' || linkUrl.length > 500)) {
      throw bad('링크 URL을 확인해 주세요.');
    }
    if (startDate !== null && (typeof startDate !== 'string' || !DATE_RE.test(startDate))) {
      throw bad('게시 시작일 형식을 확인해 주세요.');
    }
    if (endDate !== null && (typeof endDate !== 'string' || !DATE_RE.test(endDate))) {
      throw bad('게시 종료일 형식을 확인해 주세요.');
    }
    if (startDate !== null && endDate !== null && (endDate as string) < (startDate as string)) {
      throw bad('게시 종료일은 시작일보다 빠를 수 없습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        'INSERT INTO portal_banner (title, image_url, link_url, display_order, start_date, end_date, use_yn, created_at, updated_at) VALUES (:title, :imageUrl, :linkUrl, :displayOrder, CAST(:startDate AS date), CAST(:endDate AS date), :useYn, now(), now()) RETURNING portal_banner_id AS "portalBannerId"',
        { title, imageUrl, linkUrl, displayOrder, startDate, endDate, useYn },
      );
      return { portalBannerId: Number(rows[0].portalBannerId) };
    });
  }

  @Get('/personal-menus')
  async listPersonalMenus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const { page, size } = paging(q);
    // 가정: 사용 권한이 있고 사용 중인 메뉴만 개인 메뉴로 보인다.
    const scope = ' FROM personal_menu pm JOIN menu m ON m.menu_id = pm.menu_id WHERE pm.employee_id = CAST(:userId AS bigint) AND m.use_status = \'사용\' AND EXISTS (SELECT 1 FROM menu_permission mp WHERE mp.employee_id = pm.employee_id AND mp.menu_id = pm.menu_id)';
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT pm.personal_menu_id AS "personalMenuId", pm.menu_id AS "menuId", pm.sort_order AS "sortOrder"' + scope + ' ORDER BY pm.sort_order, pm.personal_menu_id LIMIT :size OFFSET :offset',
        { userId: user.id, size, offset: page * size },
      );
      const counts = await db.query('SELECT COUNT(*) AS "total"' + scope, { userId: user.id });
      return { items, page, size, total: Number(counts[0].total) };
    });
  }
}
