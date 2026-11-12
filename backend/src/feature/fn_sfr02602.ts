import { Controller, Post, Put, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const USE_STATUSES = ['사용', '미사용'];

function textOf(value: unknown, max: number, label: string): string {
  if (typeof value !== 'string' || value.trim() === '' || value.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값을 확인해 주세요.');
  }
  return value;
}

function useStatusOf(value: unknown): string {
  if (typeof value !== 'string' || !USE_STATUSES.includes(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
  }
  return value;
}

function orderOf(value: unknown, required: boolean): string | null {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ApiError(400, 'VALIDATION_FAILED', '표시순서를 입력해 주세요.');
    }
    return null;
  }
  const n = Number(value);
  if ((typeof value !== 'number' && typeof value !== 'string') || !Number.isInteger(n) || Math.abs(n) > 2147483647) {
    throw new ApiError(400, 'VALIDATION_FAILED', '표시순서는 정수여야 합니다.');
  }
  return String(n);
}

@Controller('api/v1')
export class FnSfr02602Controller {
  @Post('/menus')
  @HttpCode(200)
  async createMenu(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    const name = textOf(data['name'], 100, '메뉴명');
    const module = textOf(data['module'], 100, '연결 모듈');
    const useStatus = useStatusOf(data['useStatus']);
    const displayOrder = orderOf(data['displayOrder'], false);
    // TODO: 연결 모듈 존재 확인(422 MENU_MODULE_INVALID)은 모듈 목록 출처가 없어 구현하지 못함
    return transaction(async (db) => {
      const dup = await db.query(
        'SELECT menu_id FROM menu WHERE module = :module AND name = :name',
        { module, name },
      );
      if (dup.length > 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '같은 연결 모듈에 같은 이름의 메뉴가 이미 있습니다.');
      }
      // 가정: 표시순서 미입력 시 마지막 순서 + 1
      const rows = await db.query(
        'INSERT INTO menu (name, module, use_status, display_order, created_at, updated_at) ' +
          'VALUES (:name, :module, :useStatus, ' +
          'COALESCE(CAST(:displayOrder AS integer), (SELECT COALESCE(MAX(display_order), 0) + 1 FROM menu)), now(), now()) ' +
          'RETURNING menu_id AS "menuId"',
        { name, module, useStatus, displayOrder },
      );
      return rows[0];
    });
  }

  @Put('/menus/:menuId')
  async updateMenu(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const menuId = req.params['menuId'];
    if (!/^[0-9]{1,18}$/.test(menuId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '메뉴 ID 형식이 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const name = textOf(data['name'], 100, '메뉴명');
    const module = textOf(data['module'], 100, '연결 모듈');
    const useStatus = useStatusOf(data['useStatus']);
    const displayOrder = orderOf(data['displayOrder'], true);
    // TODO: 연결 모듈 존재 확인(422 MENU_MODULE_INVALID)은 모듈 목록 출처가 없어 구현하지 못함
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT menu_id FROM menu WHERE menu_id = CAST(:menuId AS bigint)',
        { menuId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'MENU_NOT_FOUND', '메뉴를 찾을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT menu_id FROM menu WHERE module = :module AND name = :name AND menu_id <> CAST(:menuId AS bigint)',
        { module, name, menuId },
      );
      if (dup.length > 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '같은 연결 모듈에 같은 이름의 메뉴가 이미 있습니다.');
      }
      const rows = await db.query(
        'UPDATE menu SET name = :name, module = :module, use_status = :useStatus, ' +
          'display_order = CAST(:displayOrder AS integer), updated_at = now() ' +
          'WHERE menu_id = CAST(:menuId AS bigint) RETURNING menu_id AS "menuId"',
        { name, module, useStatus, displayOrder, menuId },
      );
      return rows[0];
    });
  }
}
