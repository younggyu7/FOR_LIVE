import { Controller, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const VIEW_SCOPES = ['전체', '부서', '개인'];

@Controller('api/v1')
export class FnSfr02601Controller {
  @Put('/menu-permissions/:menuPermissionId')
  async updateMenuPermission2(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    const id = req.params['menuPermissionId'];
    if (typeof id !== 'string' || !/^[0-9]+$/.test(id)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '메뉴 사용 권한 ID 형식이 올바르지 않습니다.');
    }
    const viewScope = data['viewScope'];
    if (typeof viewScope !== 'string' || !VIEW_SCOPES.includes(viewScope)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 범위는 전체, 부서, 개인 중에서 선택해 주세요.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `UPDATE menu_permission
         SET view_scope = :viewScope, updated_at = now()
         WHERE menu_permission_id = CAST(:id AS bigint)
         RETURNING menu_permission_id AS "menuPermissionId", view_scope AS "viewScope"`,
        { viewScope, id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'MENU_PERMISSION_NOT_FOUND', '메뉴 사용 권한을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }
}
