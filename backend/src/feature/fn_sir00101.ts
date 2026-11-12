import { Controller, HttpCode, Post, Req } from '@nestjs/common';
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
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function optionalText(value: unknown, max: number, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || value.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
  return value;
}

function optionalDate(value: unknown, label: string): string | null {
  const text = optionalText(value, 10, label);
  if (text !== null && !DATE_PATTERN.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) YYYY-MM-DD 형식이어야 합니다.');
  }
  return text;
}

@Controller('api/v1')
export class FnSir00101Controller {
  @Post('/link-logs/sync')
  @HttpCode(200)
  async syncExternalLink(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자', '예산·회계 담당자');
    const data = checks.inputOf(req.body);

    const linkTarget = data['linkTarget'];
    if (typeof linkTarget !== 'string' || !LINK_TARGETS.includes(linkTarget)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연계 대상을 선택해 주세요.');
    }
    const linkType = optionalText(data['linkType'], 100, '연계 구분');
    const requestSummary = optionalText(data['requestSummary'], 1000, '요청 조건');
    const startDate = optionalDate(data['startDate'], '연계 기간 시작일');
    const endDate = optionalDate(data['endDate'], '연계 기간 종료일');

    if ((startDate === null) !== (endDate === null)) {
      throw new ApiError(422, 'INVALID_LINK_PERIOD', '연계 기간은 시작일과 종료일을 함께 입력해 주세요.');
    }

    let summary = requestSummary;
    if (startDate !== null && endDate !== null) {
      summary = ((requestSummary ?? '') + ' [기간 ' + startDate + '~' + endDate + ']').trim();
      if (summary.length > 1000) {
        throw new ApiError(400, 'VALIDATION_FAILED', '요청 조건이 너무 깁니다.');
      }
    }

    return transaction(async (db) => {
      if (startDate !== null && endDate !== null) {
        const checkRows = await db.query(
          'SELECT (CAST(:startDate AS date) <= CAST(:endDate AS date)) AS "ok"',
          { startDate, endDate },
        );
        if (!checkRows[0] || checkRows[0]['ok'] !== true) {
          throw new ApiError(422, 'INVALID_LINK_PERIOD', '연계 기간이 올바르지 않습니다. 종료일은 시작일 이후여야 합니다.');
        }
      }

      const running = await db.query(
        "SELECT link_log_id AS \"linkLogId\" FROM link_log WHERE link_target = :linkTarget AND status = 'REQUESTED'",
        { linkTarget },
      );
      if (running.length > 0) {
        throw new ApiError(409, 'LINK_ALREADY_IN_PROGRESS', '동일 대상의 연계가 이미 진행 중입니다.');
      }

      // 가정: 상태는 REQUESTED로 시작한다 (BEHAVIOR.md 값의 출처).
      const rows = await db.query(
        'INSERT INTO link_log (requester_id, link_target, link_type, status, requested_at, request_summary, created_at, updated_at) ' +
          "VALUES (CAST(:userId AS bigint), :linkTarget, :linkType, 'REQUESTED', now(), :summary, now(), now()) " +
          'RETURNING link_log_id AS "linkLogId", status AS "status"',
        { userId: user.id, linkTarget, linkType, summary },
      );
      return rows[0];
    });
  }
}
