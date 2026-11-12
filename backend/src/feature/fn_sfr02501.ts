import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function textOf(value: unknown, max: number, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || value.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${label} 형식이 올바르지 않습니다.`);
  }
  return value;
}

function integerOf(value: unknown, fallback: number, label: string): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${label} 형식이 올바르지 않습니다.`);
  }
  return n;
}

@Controller('api/v1')
export class FnSfr02501Controller {
  @Get('/assets')
  async listAssets(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자산 담당자');
    const query = checks.queryOf(req.query);
    const assetCode = textOf(query['assetCode'], 50, '자산코드');
    const assetName = textOf(query['assetName'], 200, '자산명');
    const assetType = textOf(query['assetType'], 50, '자산 유형');
    const page = integerOf(query['page'], 0, '페이지');
    let size = integerOf(query['size'], DEFAULT_SIZE, '크기');
    if (page < 0 || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '페이지와 크기는 올바른 값이어야 합니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    return transaction(async (db) => {
      const conditions: string[] = [];
      const params: Record<string, unknown> = {};
      if (assetCode !== null) {
        conditions.push('asset_code = :assetCode');
        params['assetCode'] = assetCode;
      }
      if (assetName !== null) {
        conditions.push("asset_name ILIKE '%' || :assetName || '%'");
        params['assetName'] = assetName;
      }
      if (assetType !== null) {
        conditions.push('asset_type = :assetType');
        params['assetType'] = assetType;
      }
      const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      const countRows = await db.query(
        'SELECT CAST(COUNT(*) AS integer) AS "total" FROM asset ' + where,
        params,
      );
      const total = Number(countRows[0]['total']);
      const items = await db.query(
        'SELECT asset_id AS "assetId", asset_code AS "assetCode", asset_no AS "assetNo", ' +
          'asset_name AS "assetName", asset_type AS "assetType", asset_category AS "assetCategory", ' +
          'location AS "location", manager_id AS "managerId", is_depreciable AS "isDepreciable" ' +
          'FROM asset ' +
          where +
          ' ORDER BY asset_id DESC LIMIT :size OFFSET :offset',
        { ...params, size, offset: page * size },
      );
      return { items, page, size, total };
    });
  }
}
