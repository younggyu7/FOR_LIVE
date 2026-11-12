import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 가정: 항목별 조회의 기간 기준일은 심사일자로 한다.
// 가정: 지역별·품단계는 schema.sql에 해당 컬럼이 없어 지원하지 않는다 (null).
const CRITERIA: Record<string, { group: string; date: string } | null> = {
  '심사일자': { group: `to_char(r.review_date, 'YYYY-MM-DD')`, date: 'r.review_date' },
  '결의일자': { group: `to_char(r.resolution_date, 'YYYY-MM-DD')`, date: 'r.resolution_date' },
  '항목별': { group: 'p.fee_type', date: 'r.review_date' },
  '지역별': null,
  '품단계': null,
};

// 가정: 추가 조건(condition)은 수수료 구분(fee_type) 값으로만 거른다.
const FEE_TYPES = ['REVIEW', 'REISSUE'];

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

@Controller('api/v1')
export class FnSfr04204Controller {
  @Get('/fee-records/review-status')
  async getReviewStatus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);

    const criteria = text(query['criteria']);
    const fromDate = text(query['fromDate']);
    const toDate = text(query['toDate']);
    const condition = text(query['condition']);

    if (!criteria || !Object.prototype.hasOwnProperty.call(CRITERIA, criteria)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 기준을 선택해 주세요.');
    }
    if (!fromDate || !toDate || !DATE_PATTERN.test(fromDate) || !DATE_PATTERN.test(toDate)) {
      throw new ApiError(422, 'INVALID_PERIOD', '조회 시작일과 종료일을 모두 입력해 주세요.');
    }
    // YYYY-MM-DD 형식은 글자 순서가 날짜 순서와 같다.
    if (fromDate > toDate) {
      throw new ApiError(422, 'INVALID_PERIOD', '조회 시작일은 종료일보다 늦을 수 없습니다.');
    }
    if (condition && !FEE_TYPES.includes(condition)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '추가 조건은 REVIEW 또는 REISSUE 중 하나여야 합니다.');
    }
    const spec = CRITERIA[criteria];
    if (!spec) {
      throw new ApiError(400, 'VALIDATION_FAILED', '지역별·품단계 기준은 아직 지원하지 않습니다.');
    }

    const pageRaw = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기 형식이 올바르지 않습니다.');
    }
    const page = pageRaw;
    const size = Math.min(sizeRaw, MAX_SIZE);

    return transaction(async (db) => {
      const grouped = `
        SELECT ${spec.group} AS group_key,
               COUNT(*) AS review_count,
               COALESCE(SUM(r.amount), 0) AS fee_amount
          FROM fee_record r
          JOIN fee_unit_price p ON p.fee_unit_price_id = r.fee_unit_price_id
         WHERE ${spec.date} BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date)
           AND (CAST(:condition AS varchar) IS NULL OR p.fee_type = CAST(:condition AS varchar))
         GROUP BY 1`;
      const params = {
        fromDate,
        toDate,
        condition: condition || null,
      };

      const totalRows = await db.query(
        `SELECT COUNT(*) AS total FROM (${grouped}) g`,
        params,
      );
      const total = Number(totalRows[0]?.total ?? 0);

      const items = await db.query(
        `SELECT g.group_key AS "groupKey",
                CAST(g.review_count AS integer) AS "reviewCount",
                CAST(g.fee_amount AS numeric) AS "feeAmount"
           FROM (${grouped}) g
          ORDER BY g.group_key
          LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)`,
        { ...params, limit: size, offset: page * size },
      );

      return {
        items: items.map((row: any) => ({
          groupKey: row.groupKey,
          reviewCount: Number(row.reviewCount),
          feeAmount: Number(row.feeAmount),
        })),
        page,
        size,
        total,
      };
    });
  }
}
