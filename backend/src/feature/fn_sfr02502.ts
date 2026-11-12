import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function textOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function intOf(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '숫자 형식이 올바르지 않습니다.');
  }
  return n;
}

function dateOf(value: unknown): string | null {
  const text = textOf(value);
  if (text === '') {
    return null;
  }
  if (!DATE_PATTERN.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '날짜는 YYYY-MM-DD 형식이어야 합니다.');
  }
  return text;
}

@Controller('api/v1')
export class FnSfr02502Controller {
  @Post('/asset-changes')
  @HttpCode(200)
  async createAssetChange(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자산 담당자');
    const data = checks.inputOf(req.body);
    const assetId = intOf(data['assetId']);
    const changeType = textOf(data['changeType']);
    const changeDate = dateOf(data['changeDate']);
    const changeContent = textOf(data['changeContent']);
    if (assetId === null || changeType === '' || changeDate === null || changeContent === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '자산, 변동 유형, 변동 일자, 변동 내용을 모두 입력해 주세요.');
    }
    if (changeType.length > 50) {
      throw new ApiError(400, 'VALIDATION_FAILED', '변동 유형은 50자 이하로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const assets = await db.query(
        'SELECT asset_id FROM asset WHERE asset_id = CAST(:assetId AS bigint)',
        { assetId },
      );
      if (assets.length === 0) {
        throw new ApiError(404, 'ASSET_NOT_FOUND', '대상 자산을 찾을 수 없습니다.');
      }
      // 변동 이력(일시·변경자·내용)을 남긴다. 상시 변동 여부는 고정값 false (가정)
      const rows = await db.query(
        `INSERT INTO asset_change
           (asset_id, change_type, change_date, change_content, is_regular_change, changed_by_id, created_at, updated_at)
         VALUES
           (CAST(:assetId AS bigint), :changeType, CAST(:changeDate AS date), :changeContent, false, CAST(:userId AS bigint), now(), now())
         RETURNING asset_change_id AS "assetChangeId"`,
        { assetId, changeType, changeDate, changeContent, userId: user.id },
      );
      return rows[0];
    });
  }

  @Get('/asset-changes')
  async listAssetChanges(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자산 담당자');
    const q = checks.queryOf(req.query);
    const pageNo = intOf(q['page']) ?? 0;
    const sizeIn = intOf(q['size']) ?? DEFAULT_SIZE;
    if (pageNo < 0 || sizeIn < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const size = Math.min(sizeIn, MAX_SIZE);
    const filters = {
      dateFrom: dateOf(q['changeDateFrom']),
      dateTo: dateOf(q['changeDateTo']),
      assetId: intOf(q['assetId']),
      changeType: textOf(q['changeType']) || null,
    };
    const where = `(CAST(:dateFrom AS date) IS NULL OR change_date >= CAST(:dateFrom AS date))
      AND (CAST(:dateTo AS date) IS NULL OR change_date <= CAST(:dateTo AS date))
      AND (CAST(:assetId AS bigint) IS NULL OR asset_id = CAST(:assetId AS bigint))
      AND (CAST(:changeType AS varchar) IS NULL OR change_type = CAST(:changeType AS varchar))`;
    return transaction(async (db) => {
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM asset_change WHERE ${where}`,
        filters,
      );
      const items = await db.query(
        `SELECT asset_change_id AS "assetChangeId",
                asset_id AS "assetId",
                change_type AS "changeType",
                change_date AS "changeDate",
                change_content AS "changeContent",
                changed_by_id AS "changedById"
           FROM asset_change
          WHERE ${where}
          ORDER BY change_date DESC, asset_change_id DESC
          LIMIT :limit OFFSET :offset`,
        { ...filters, limit: size, offset: pageNo * size },
      );
      return { items, page: pageNo, size, total: Number(counts[0]['total']) };
    });
  }
}
