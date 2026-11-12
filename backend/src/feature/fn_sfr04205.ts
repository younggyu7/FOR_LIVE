import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

type Db = Parameters<Parameters<typeof transaction>[0]>[0];

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 가정: 재발급 내역은 수수료 구분 REISSUE 단가를 쓴 등록 건이고, 조회 기간은 결의일자 기준이다.
// 가정: 집계 기준(groupKey)은 현행 소스 분석 전이라 결의일자의 연-월(YYYY-MM)로 묶는다.
const REISSUE_FROM_WHERE = `
  FROM fee_record r
  JOIN fee_unit_price p ON p.fee_unit_price_id = r.fee_unit_price_id
  WHERE p.fee_type = 'REISSUE'
    AND r.resolution_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date)`;

function readPeriod(query: Record<string, unknown>): { startDate: string; endDate: string } {
  const startDate = String(query['startDate'] ?? '');
  const endDate = String(query['endDate'] ?? '');
  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '조회 시작일과 종료일을 YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return { startDate, endDate };
}

function readPaging(query: Record<string, unknown>): { page: number; size: number } {
  const rawPage = String(query['page'] ?? '');
  const rawSize = String(query['size'] ?? '');
  if (rawPage !== '' && !/^\d+$/.test(rawPage)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
  }
  if (rawSize !== '' && !/^\d+$/.test(rawSize)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
  }
  const page = rawPage === '' ? 0 : Number(rawPage);
  let size = rawSize === '' ? DEFAULT_SIZE : Number(rawSize);
  if (size < 1) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기는 1 이상이어야 합니다.');
  }
  if (size > MAX_SIZE) {
    size = MAX_SIZE;
  }
  return { page, size };
}

async function assertPeriod(db: Db, startDate: string, endDate: string): Promise<void> {
  const rows = await db.query(
    'SELECT CAST(:endDate AS date) < CAST(:startDate AS date) AS "invalid"',
    { startDate, endDate },
  );
  if (rows[0] && rows[0]['invalid'] === true) {
    throw new ApiError(422, 'INVALID_SEARCH_PERIOD', '조회 기간이 올바르지 않습니다. 종료일은 시작일보다 앞seen 수 없습니다.'.replace('앞seen', '앞设'));
  }
}

@Controller('api/v1')
export class FnSfr04205Controller {
  @Get('/fee-records')
  async listReissueFeeRecords(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const { startDate, endDate } = readPeriod(query);
    const { page, size } = readPaging(query);
    return transaction(async (db) => {
      await assertPeriod(db, startDate, endDate);
      const params = { startDate, endDate, size, offset: page * size };
      const items = await db.query(
        `SELECT r.fee_record_id AS "feeRecordId",
                to_char(r.review_date, 'YYYY-MM-DD') AS "reviewDate",
                to_char(r.resolution_date, 'YYYY-MM-DD') AS "resolutionDate",
                r.quantity AS "quantity",
                r.amount AS "amount",
                r.is_offline AS "isOffline",
                p.unit_price AS "unitPrice"
         ${REISSUE_FROM_WHERE}
         ORDER BY r.resolution_date DESC, r.fee_record_id DESC
         LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        params,
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total" ${REISSUE_FROM_WHERE}`,
        { startDate, endDate },
      );
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }

  @Get('/fee-records/summary')
  async getReissueFeeRecordSummary(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const { startDate, endDate } = readPeriod(query);
    const { page, size } = readPaging(query);
    return transaction(async (db) => {
      await assertPeriod(db, startDate, endDate);
      const params = { startDate, endDate, size, offset: page * size };
      const items = await db.query(
        `SELECT to_char(r.resolution_date, 'YYYY-MM') AS "groupKey",
                SUM(r.quantity) AS "totalQuantity",
                SUM(r.amount) AS "totalAmount"
         ${REISSUE_FROM_WHERE}
         GROUP BY to_char(r.resolution_date, 'YYYY-MM')
         ORDER BY to_char(r.resolution_date, 'YYYY-MM') DESC
         LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        params,
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total" FROM (
           SELECT 1 ${REISSUE_FROM_WHERE}
           GROUP BY to_char(r.resolution_date, 'YYYY-MM')
         ) g`,
        { startDate, endDate },
      );
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }
}
