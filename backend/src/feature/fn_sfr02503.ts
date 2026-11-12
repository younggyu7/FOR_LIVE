import { Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const PRINT_FORMATS = ['QR', 'BARCODE'];

@Controller('api/v1')
export class FnSfr02503Controller {
  @Post('/asset-print-logs')
  @HttpCode(200)
  async printAssetCodes(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자산 담당자');
    const data = checks.inputOf(req.body);
    const assetIdRaw = data['assetId'];
    if (assetIdRaw === undefined || assetIdRaw === null || !/^\d+$/.test(String(assetIdRaw))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '자산을 선택해 주세요.');
    }
    const printFormat = String(data['printFormat'] ?? '');
    if (!PRINT_FORMATS.includes(printFormat)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '출력 형식은 QR 또는 BARCODE여야 합니다.');
    }
    const assetId = String(assetIdRaw);
    return transaction(async (db) => {
      const assets = await db.query(
        'SELECT asset_no AS "assetNo" FROM asset WHERE asset_id = CAST(:assetId AS bigint)',
        { assetId },
      );
      if (assets.length === 0) {
        throw new ApiError(404, 'ASSET_NOT_FOUND', '대상 자산번호를 찾을 수 없습니다.');
      }
      const assetNumber = String(assets[0]['assetNo']);
      const rows = await db.query(
        `INSERT INTO asset_print_log (asset_id, printed_by_id, asset_number, print_format, printed_at, created_at, updated_at)
         VALUES (CAST(:assetId AS bigint), CAST(:userId AS bigint), :assetNumber, :printFormat, now(), now(), now())
         RETURNING asset_print_log_id AS "assetPrintLogId"`,
        { assetId, userId: user.id, assetNumber, printFormat },
      );
      return {
        assetPrintLogId: Number(rows[0]['assetPrintLogId']),
        label: { format: printFormat, value: assetNumber },
      };
    });
  }

  @Get('/asset-print-logs')
  async listAssetPrintLogs(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자산 담당자');
    const query = checks.queryOf(req.query);
    const pageRaw = query['page'];
    const sizeRaw = query['size'];
    const page = pageRaw === undefined || pageRaw === '' ? 0 : Number(pageRaw);
    let size = sizeRaw === undefined || sizeRaw === '' ? 20 : Number(sizeRaw);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '페이지 값이 올바르지 않습니다.');
    }
    if (size > 200) {
      size = 200;
    }
    const assetIdRaw = query['assetId'];
    let assetId: string | null = null;
    if (assetIdRaw !== undefined && assetIdRaw !== null && assetIdRaw !== '') {
      if (!/^\d+$/.test(String(assetIdRaw))) {
        throw new ApiError(400, 'VALIDATION_FAILED', '자산 ID가 올바르지 않습니다.');
      }
      assetId = String(assetIdRaw);
    }
    return transaction(async (db) => {
      const where = '(CAST(:assetId AS bigint) IS NULL OR asset_id = CAST(:assetId AS bigint))';
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM asset_print_log WHERE ' + where,
        { assetId },
      );
      const items = await db.query(
        `SELECT asset_print_log_id AS "assetPrintLogId",
                asset_id AS "assetId",
                asset_number AS "assetNumber",
                print_format AS "printFormat",
                printed_at AS "printedAt"
           FROM asset_print_log
          WHERE ${where}
          ORDER BY printed_at DESC, asset_print_log_id DESC
          LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { assetId, size, offset: page * size },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }
}
