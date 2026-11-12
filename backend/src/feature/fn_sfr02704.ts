import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 표시할 최근 이력 건수 (결정: 최근 사용 순 최대 20건)
const RECENT_LIMIT = 20;
const MAX_SIZE = 200;
const ENVIRONMENTS = ['웹', '모바일'];

@Controller('api/v1')
export class FnSfr02704Controller {
  @Get('/menu-usage-logs')
  async listMenuUsageLogs(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const pageRaw = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? 20 : Number(query['size']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기를 올바르게 입력해 주세요.');
    }
    const page = pageRaw;
    const size = Math.min(sizeRaw, MAX_SIZE);
    return transaction(async (db) => {
      // 본인의 이력만, 최근 순 최대 20건 안에서 쪽을 나눈다
      const recent = `SELECT menu_usage_log_id, menu_id, used_at
        FROM menu_usage_log
        WHERE employee_id = CAST(:userId AS bigint)
        ORDER BY used_at DESC, menu_usage_log_id DESC
        LIMIT ${RECENT_LIMIT}`;
      const items = await db.query(
        `SELECT l.menu_id AS "menuId", l.used_at AS "usedAt", m.name AS "menuName"
         FROM (${recent}) l
         JOIN menu m ON m.menu_id = l.menu_id
         ORDER BY l.used_at DESC, l.menu_usage_log_id DESC
         LIMIT :size OFFSET :offset`,
        { userId: user.id, size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM (${recent}) t`,
        { userId: user.id },
      );
      const total = Number(counts[0]?.total ?? 0);
      return { items, page, size, total };
    });
  }

  @Post('/menu-usage-logs')
  @HttpCode(200)
  async createMenuUsageLog(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const menuIdText = String(data['menuId'] ?? '').trim();
    if (!/^[0-9]+$/.test(menuIdText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '메뉴 ID를 숫자로 입력해 주세요.');
    }
    const environment = data['usageEnvironment'];
    if (typeof environment !== 'string' || !ENVIRONMENTS.includes(environment)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 환경은 웹 또는 모바일이어야 합니다.');
    }
    // 가정: 접속 IP는 요청의 접속 IP, IPv6 수용 길이 45
    const accessIp = String(req.ip ?? '알 수 없음').slice(0, 45);
    return transaction(async (db) => {
      const menus = await db.query(
        'SELECT menu_id FROM menu WHERE menu_id = CAST(:menuId AS bigint)',
        { menuId: menuIdText },
      );
      if (menus.length === 0) {
        throw new ApiError(404, 'MENU_NOT_FOUND', '메뉴를 찾을 수 없습니다.');
      }
      await db.query(
        `INSERT INTO menu_usage_log
           (employee_id, menu_id, used_at, access_ip, usage_environment, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), CAST(:menuId AS bigint), now(), :accessIp, :environment, now(), now())
         RETURNING menu_usage_log_id`,
        { userId: user.id, menuId: menuIdText, accessIp, environment },
      );
      return {};
    });
  }
}
