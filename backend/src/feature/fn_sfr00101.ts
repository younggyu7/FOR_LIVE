import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ADMIN_ROLE = '시스템 관리자';
const VIEW_SCOPES = ['전체', '부서', '개인'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function idOf(value: unknown, label: string): string {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return String(value);
  }
  if (typeof value === 'string' && /^[0-9]+$/.test(value)) {
    return value;
  }
  throw invalid(label + ' 값이 올바르지 않습니다.');
}

function optionalIdOf(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return idOf(value, label);
}

function numberOf(value: unknown, fallback: number, label: string): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw invalid(label + ' 값이 올바르지 않습니다.');
  }
  return n;
}

function viewScopeOf(value: unknown): string {
  if (typeof value !== 'string' || value === '') {
    throw invalid('조회 범위를 입력해 주세요.');
  }
  if (!VIEW_SCOPES.includes(value)) {
    throw invalid('조회 범위는 전체, 부서, 개인 중 하나여야 합니다.');
  }
  return value;
}

@Controller('api/v1')
export class FnSfr00101Controller {
  @Get('/menu-permissions')
  async listMenuPermissions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ADMIN_ROLE);
    const query = checks.queryOf(req.query);
    const employeeId = optionalIdOf(query['employeeId'], '임직원');
    const moduleValue = query['module'];
    if (moduleValue !== undefined && moduleValue !== null && typeof moduleValue !== 'string') {
      throw invalid('대상 시스템 구분 값이 올바르지 않습니다.');
    }
    const moduleName = moduleValue === undefined || moduleValue === '' ? null : moduleValue;
    const page = numberOf(query['page'], 0, '쪽 번호');
    const requested = numberOf(query['size'], DEFAULT_SIZE, '쪽 크기');
    const size = Math.min(Math.max(requested, 1), MAX_SIZE);
    return transaction(async (db) => {
      const filter = {
        employeeId,
        moduleName,
      };
      const where = `
        WHERE (CAST(:employeeId AS bigint) IS NULL OR mp.employee_id = CAST(:employeeId AS bigint))
          AND (CAST(:moduleName AS varchar) IS NULL OR m.module = CAST(:moduleName AS varchar))`;
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
         FROM menu_permission mp
         JOIN menu m ON m.menu_id = mp.menu_id` + where,
        filter,
      );
      const total = Number(counts[0]['total']);
      const items = await db.query(
        `SELECT mp.menu_permission_id AS "menuPermissionId",
                mp.employee_id AS "employeeId",
                mp.menu_id AS "menuId",
                mp.view_scope AS "viewScope"
         FROM menu_permission mp
         JOIN menu m ON m.menu_id = mp.menu_id` + where + `
         ORDER BY mp.menu_permission_id
         LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { ...filter, size, offset: page * size },
      );
      return { items, page, size, total };
    });
  }

  @Post('/menu-permissions')
  @HttpCode(200)
  async createMenuPermission(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ADMIN_ROLE);
    const data = checks.inputOf(req.body);
    const employeeId = idOf(data['employeeId'], '임직원');
    const menuId = idOf(data['menuId'], '메뉴');
    const viewScope = viewScopeOf(data['viewScope']);
    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      const menus = await db.query(
        'SELECT menu_id FROM menu WHERE menu_id = CAST(:menuId AS bigint)',
        { menuId },
      );
      if (employees.length === 0 || menus.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_OR_MENU_NOT_FOUND', '대상 임직원 또는 메뉴를 찾을 수 없습니다.');
      }
      const duplicated = await db.query(
        `SELECT menu_permission_id FROM menu_permission
         WHERE employee_id = CAST(:employeeId AS bigint) AND menu_id = CAST(:menuId AS bigint)`,
        { employeeId, menuId },
      );
      if (duplicated.length > 0) {
        throw new ApiError(409, 'MENU_PERMISSION_DUPLICATED', '이미 같은 임직원·메뉴의 권한이 있습니다.');
      }
      const rows = await db.query(
        `INSERT INTO menu_permission (employee_id, menu_id, view_scope, created_at, updated_at)
         VALUES (CAST(:employeeId AS bigint), CAST(:menuId AS bigint), :viewScope, now(), now())
         RETURNING menu_permission_id AS "menuPermissionId",
                   employee_id AS "employeeId",
                   menu_id AS "menuId",
                   view_scope AS "viewScope"`,
        { employeeId, menuId, viewScope },
      );
      return rows[0];
    });
  }

  @Patch('/menu-permissions/:menuPermissionId')
  async updateMenuPermission(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ADMIN_ROLE);
    const menuPermissionId = idOf(req.params['menuPermissionId'], '메뉴 사용 권한');
    const data = checks.inputOf(req.body);
    const viewScope = viewScopeOf(data['viewScope']);
    return transaction(async (db) => {
      const rows = await db.query(
        `UPDATE menu_permission
         SET view_scope = :viewScope, updated_at = now()
         WHERE menu_permission_id = CAST(:menuPermissionId AS bigint)
         RETURNING menu_permission_id AS "menuPermissionId",
                   view_scope AS "viewScope"`,
        { menuPermissionId, viewScope },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'MENU_PERMISSION_NOT_FOUND', '메뉴 사용 권한을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }

  @Delete('/menu-permissions/:menuPermissionId')
  async deleteMenuPermission(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ADMIN_ROLE);
    const menuPermissionId = idOf(req.params['menuPermissionId'], '메뉴 사용 권한');
    return transaction(async (db) => {
      const count = await db.execute(
        'DELETE FROM menu_permission WHERE menu_permission_id = CAST(:menuPermissionId AS bigint)',
        { menuPermissionId },
      );
      if (count === 0) {
        throw new ApiError(404, 'MENU_PERMISSION_NOT_FOUND', '메뉴 사용 권한을 찾을 수 없습니다.');
      }
      return {};
    });
  }
}
