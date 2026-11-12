import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 쪽 크기 기본값과 최대값
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

@Controller('api/v1')
export class FnSir00301Controller {
  @Get('/help-contents')
  async listHelpContents(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '시스템 관리자');
    const q = checks.queryOf(req.query);

    const page = q['page'] === undefined || q['page'] === '' ? 0 : Number(q['page']);
    if (!Number.isInteger(page) || page < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호는 0 이상의 정수여야 합니다.');
    }
    const sizeRaw = q['size'] === undefined || q['size'] === '' ? DEFAULT_SIZE : Number(q['size']);
    if (!Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기는 1 이상의 정수여야 합니다.');
    }
    const size = Math.min(sizeRaw, MAX_SIZE);

    const hasMenu = q['menuId'] !== undefined && q['menuId'] !== null && q['menuId'] !== '';
    let menuId: number | null = null;
    if (hasMenu) {
      menuId = Number(q['menuId']);
      if (!Number.isInteger(menuId)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '메뉴 값이 올바르지 않습니다.');
      }
    }
    const keywordRaw = q['keyword'];
    const keyword = typeof keywordRaw === 'string' ? keywordRaw.trim() : '';
    const hasKeyword = keyword !== '';

    return transaction(async (db) => {
      // 사용 권한이 있는 메뉴의 사용 중인 도움말만 조회한다.
      let where = "h.use_yn = '사용' AND h.menu_id IN (SELECT mp.menu_id FROM menu_permission mp WHERE mp.employee_id = CAST(:userId AS bigint))";
      const params: Record<string, unknown> = { userId: user.id };
      if (menuId !== null) {
        where += ' AND h.menu_id = CAST(:menuId AS bigint)';
        params['menuId'] = menuId;
      }
      if (hasKeyword) {
        where += ' AND (h.title ILIKE :pattern OR h.content ILIKE :pattern)';
        params['pattern'] = '%' + keyword + '%';
      }

      const countRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM help_content h WHERE ' + where,
        params,
      );
      const total = Number(countRows[0]['total']);

      // 기능을 지정했는데 도움말이 없으면 준비되지 않은 것으로 안내한다.
      if (total === 0 && menuId !== null && !hasKeyword) {
        throw new ApiError(404, 'HELP_CONTENT_NOT_FOUND', '해당 기능의 도움말이 아직 준비되지 않았습니다.');
      }

      const items = await db.query(
        'SELECT h.help_content_id AS "helpContentId", h.menu_id AS "menuId", h.title AS "title", h.content AS "content" '
          + 'FROM help_content h WHERE ' + where
          + ' ORDER BY h.menu_id, h.help_content_id LIMIT :limit OFFSET :offset',
        { ...params, limit: size, offset: page * size },
      );

      return { items, page, size, total };
    });
  }
}
