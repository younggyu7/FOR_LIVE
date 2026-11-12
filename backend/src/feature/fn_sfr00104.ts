import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const LINK_TARGETS = [
  'E_NARA_DOUM',
  'NTS_HOMETAX',
  'NTS_EFILING',
  'BANK_CMS',
  'CARD_COMPANY',
  'LEGACY_ERP',
  'ASSET_INSPECTION',
  'COMMUTE_SYSTEM',
  'ECM',
];
const LINK_STATUSES = ['REQUESTED', 'SUCCESS', 'FAILED'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

@Controller('api/v1')
export class FnSfr00104Controller {
  @Post('/link-logs')
  @HttpCode(200)
  async createLinkLog(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자', '시스템 관리자');
    const data = checks.inputOf(req.body);
    const linkTarget = typeof data['linkTarget'] === 'string' ? data['linkTarget'].trim() : '';
    if (!linkTarget) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연계 대상을 선택해 주세요.');
    }
    const linkType = typeof data['linkType'] === 'string' ? data['linkType'].trim() : '';
    if (!linkType || linkType.length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연계 구분을 100자 이내로 입력해 주세요.');
    }
    const rawSummary = data['requestSummary'];
    let requestSummary: string | null = null;
    if (rawSummary !== undefined && rawSummary !== null && rawSummary !== '') {
      if (typeof rawSummary !== 'string' || rawSummary.length > 1000) {
        throw new ApiError(400, 'VALIDATION_FAILED', '요청 조건은 1000자 이내로 입력해 주세요.');
      }
      requestSummary = rawSummary;
    }
    if (!LINK_TARGETS.includes(linkTarget)) {
      throw new ApiError(422, 'INVALID_LINK_REQUEST', '연계 대상 또는 요청 구분이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      // 가정: 연계 결과(SUCCESS/FAILED)는 외부 연계 모듈이 완료 후 반영한다. 요청 시점에는 REQUESTED로 기록한다.
      const rows = await db.query(
        `INSERT INTO link_log (requester_id, link_target, link_type, status, requested_at, request_summary, processed_count, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), :linkTarget, :linkType, 'REQUESTED', now(), :requestSummary, 0, now(), now())
         RETURNING link_log_id AS "linkLogId", status AS "status", failure_reason AS "failureReason", processed_count AS "processedCount"`,
        { userId: user.id, linkTarget, linkType, requestSummary },
      );
      return rows[0];
    });
  }

  @Get('/link-logs')
  async listLinkLogs(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자', '시스템 관리자');
    const query = checks.queryOf(req.query);
    const linkTargetRaw = query['linkTarget'];
    const statusRaw = query['status'];
    const linkTarget = linkTargetRaw === undefined || linkTargetRaw === null || linkTargetRaw === '' ? null : String(linkTargetRaw);
    const status = statusRaw === undefined || statusRaw === null || statusRaw === '' ? null : String(statusRaw);
    if (linkTarget !== null && !LINK_TARGETS.includes(linkTarget)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연계 대상 값이 올바르지 않습니다.');
    }
    if (status !== null && !LINK_STATUSES.includes(status)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연계 상태 값이 올바르지 않습니다.');
    }
    const pageRaw = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const page = pageRaw;
    const size = Math.min(sizeRaw, MAX_SIZE);
    return transaction(async (db) => {
      const where = `WHERE (CAST(:linkTarget AS text) IS NULL OR link_target = CAST(:linkTarget AS text))
         AND (CAST(:status AS text) IS NULL OR status = CAST(:status AS text))`;
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM link_log ${where}`,
        { linkTarget, status },
      );
      const items = await db.query(
        `SELECT link_log_id AS "linkLogId",
                link_target AS "linkTarget",
                link_type AS "linkType",
                status AS "status",
                requested_at AS "requestedAt",
                completed_at AS "completedAt",
                failure_reason AS "failureReason"
           FROM link_log ${where}
          ORDER BY requested_at DESC, link_log_id DESC
          LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        { linkTarget, status, size, offset: page * size },
      );
      return { items, page, size, total: Number(counts[0].total) };
    });
  }
}
