import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const STATUSES = ['MATCHED', 'UNMATCHED'];
const DATE_TIME_FORMAT = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

@Controller('api/v1')
export class FnSfr00103Controller {
  @Post('/rfid-scan-logs')
  @HttpCode(200)
  async createRfidScanLog(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자산 담당자');
    const data = checks.inputOf(req.body);
    const tagValue = data['tagValue'];
    const scannedAt = data['scannedAt'];
    if (typeof tagValue !== 'string' || tagValue.trim() === '' || tagValue.length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'RFID 태그 식별값을 100자 이내로 입력해 주세요.');
    }
    if (typeof scannedAt !== 'string' || !DATE_TIME_FORMAT.test(scannedAt.trim())) {
      throw new ApiError(400, 'VALIDATION_FAILED', '스캔 일시를 올바른 형식으로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const assets = await db.query(
        'SELECT asset_id AS "assetId", asset_name AS "assetName" FROM asset WHERE rfid_tag_value = :tagValue',
        { tagValue },
      );
      const asset = assets.length > 0 ? assets[0] : null;
      const matchStatus = asset ? 'MATCHED' : 'UNMATCHED';
      const rows = await db.query(
        'INSERT INTO rfid_scan_log (asset_id, tag_value, scanned_at, match_status, created_at, updated_at) ' +
          'VALUES (CAST(:assetId AS bigint), :tagValue, CAST(:scannedAt AS timestamptz), :matchStatus, now(), now()) ' +
          'RETURNING rfid_scan_log_id AS "rfidScanLogId", asset_id AS "assetId", match_status AS "matchStatus"',
        {
          assetId: asset ? asset.assetId : null,
          tagValue,
          scannedAt: scannedAt.trim(),
          matchStatus,
        },
      );
      return {
        rfidScanLogId: rows[0].rfidScanLogId,
        assetId: rows[0].assetId ?? null,
        matchStatus: rows[0].matchStatus,
        assetName: asset ? asset.assetName : null,
      };
    });
  }

  @Get('/rfid-scan-logs')
  async listRfidScanLogs(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자산 담당자');
    const query = checks.queryOf(req.query);
    const pageText = query['page'];
    const sizeText = query['size'];
    const page = pageText === undefined || pageText === '' ? 0 : Number(pageText);
    const size = sizeText === undefined || sizeText === '' ? DEFAULT_SIZE : Number(sizeText);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기를 올바르게 입력해 주세요.');
    }
    const pageSize = Math.min(size, MAX_SIZE);
    const matchStatus = query['matchStatus'];
    const scannedFrom = query['scannedFrom'];
    const scannedTo = query['scannedTo'];
    const params: Record<string, unknown> = {};
    let where = ' WHERE 1 = 1';
    if (matchStatus !== undefined && matchStatus !== '') {
      if (typeof matchStatus !== 'string' || !STATUSES.includes(matchStatus)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '매칭 여부 값이 올바르지 않습니다.');
      }
      where += ' AND match_status = :matchStatus';
      params['matchStatus'] = matchStatus;
    }
    if (scannedFrom !== undefined && scannedFrom !== '') {
      if (typeof scannedFrom !== 'string' || !DATE_TIME_FORMAT.test(scannedFrom)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '스캔 시작 일시 형식이 올바르지 않습니다.');
      }
      where += ' AND scanned_at >= CAST(:scannedFrom AS timestamptz)';
      params['scannedFrom'] = scannedFrom;
    }
    if (scannedTo !== undefined && scannedTo !== '') {
      if (typeof scannedTo !== 'string' || !DATE_TIME_FORMAT.test(scannedTo)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '스캔 종료 일시 형식이 올바르지 않습니다.');
      }
      where += ' AND scanned_at <= CAST(:scannedTo AS timestamptz)';
      params['scannedTo'] = scannedTo;
    }
    return transaction(async (db) => {
      const counts = await db.query(
        'SELECT CAST(COUNT(*) AS integer) AS "total" FROM rfid_scan_log' + where,
        params,
      );
      const items = await db.query(
        'SELECT rfid_scan_log_id AS "rfidScanLogId", tag_value AS "tagValue", scanned_at AS "scannedAt", ' +
          'match_status AS "matchStatus", asset_id AS "assetId" FROM rfid_scan_log' +
          where +
          ' ORDER BY scanned_at DESC, rfid_scan_log_id DESC LIMIT :limit OFFSET :offset',
        { ...params, limit: pageSize, offset: page * pageSize },
      );
      return { items, page, size: pageSize, total: counts[0].total };
    });
  }
}
