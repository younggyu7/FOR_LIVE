import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

@Controller('api/v1')
export class FnSfr02702Controller {
  @Post('/menus/:menuId/open')
  @HttpCode(200)
  async openMenu(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const menuId = req.params['menuId'];
    if (!/^[0-9]{1,18}$/.test(menuId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '메뉴 ID 형식이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT menu_id AS "menuId", name AS "name", module AS "module"
           FROM menu
          WHERE menu_id = CAST(:menuId AS bigint)
            AND use_status = '사용'`,
        { menuId },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'MENU_NOT_FOUND', '메뉴가 없거나 사용하지 않는 메뉴입니다.');
      }
      // 메뉴별 사용 권한(422 MENU_PERMISSION_DENIED)은 통합 권한관리(공통 P1)가 맡는다.
      return rows[0];
    });
  }
}
