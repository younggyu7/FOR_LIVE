import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const CYCLES = ['월', '분기', '연'];
const USE_STATUSES = ['사용', '미사용'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

const SELECT_COLUMNS = `
  fixed_fund_id AS "fixedFundId",
  fund_subject_id AS "fundSubjectId",
  partner_id AS "partnerId",
  amount AS "amount",
  cycle AS "cycle",
  CAST(start_date AS text) AS "startDate",
  CAST(end_date AS text) AS "endDate",
  use_status AS "useStatus"
`;

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function isNumeric(v: unknown): boolean {
  if (typeof v === 'number') return Number.isFinite(v);
  if (typeof v === 'string') return v.trim() !== '' && Number.isFinite(Number(v));
  return false;
}

function isId(v: unknown): boolean {
  return isNumeric(v) && Number.isInteger(Number(v)) && Number(v) > 0;
}

function isDateText(v: unknown): boolean {
  return typeof v === 'string' && DATE_RE.test(v);
}

@Controller('api/v1')
export class FnSfr00902Controller {
  @Get('/fixed-funds')
  async listFixedFunds(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const page = isBlank(query['page']) ? 0 : Number(query['page']);
    const size = isBlank(query['size']) ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(page) || page < 0) throw invalid('쪽 번호가 올바르지 않습니다.');
    if (!Number.isInteger(size) || size < 1) throw invalid('쪽 크기가 올바르지 않습니다.');
    const limit = Math.min(size, MAX_SIZE);
    const fundSubjectId = query['fundSubjectId'];
    const useStatus = query['useStatus'];
    if (!isBlank(fundSubjectId) && !isId(fundSubjectId)) throw invalid('자금과목 값이 올바르지 않습니다.');
    if (!isBlank(useStatus) && !USE_STATUSES.includes(String(useStatus))) throw invalid('사용 여부 값이 올바르지 않습니다.');
    const params = {
      fundSubjectId: isBlank(fundSubjectId) ? null : String(fundSubjectId),
      useStatus: isBlank(useStatus) ? null : String(useStatus),
      limit,
      offset: page * limit,
    };
    const where = `
      WHERE (CAST(:fundSubjectId AS bigint) IS NULL OR fund_subject_id = CAST(:fundSubjectId AS bigint))
        AND (CAST(:useStatus AS text) IS NULL OR use_status = CAST(:useStatus AS text))
    `;
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT ${''}` + SELECT_COLUMNS + ` FROM fixed_fund ` + where +
          ` ORDER BY fixed_fund_id DESC LIMIT CAST(:limit AS integer) OFFSET CAST(:offset AS integer)`,
        params,
      );
      const totals = await db.query(
        `SELECT COUNT(*) AS "total" FROM fixed_fund ` + where,
        { fundSubjectId: params.fundSubjectId, useStatus: params.useStatus },
      );
      return { items, page, size: limit, total: Number(totals[0].total) };
    });
  }

  @Post('/fixed-funds')
  @HttpCode(200)
  async createFixedFund(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    if (!isId(data['fundSubjectId'])) throw invalid('자금과목을 선택해 주세요.');
    if (!isNumeric(data['amount']) || Number(data['amount']) <= 0) throw invalid('금액은 0보다 큰 숫자로 입력해 주세요.');
    if (!CYCLES.includes(String(data['cycle']))) throw invalid('발생 주기를 선택해 주세요.');
    if (!isDateText(data['startDate'])) throw invalid('적용 시작일을 입력해 주세요.');
    if (!USE_STATUSES.includes(String(data['useStatus']))) throw invalid('사용 여부를 선택해 주세요.');
    if (!isBlank(data['partnerId']) && !isId(data['partnerId'])) throw invalid('거래처 값이 올바르지 않습니다.');
    if (!isBlank(data['endDate']) && !isDateText(data['endDate'])) throw invalid('적용 종료일 형식이 올바르지 않습니다.');
    const params = {
      fundSubjectId: String(data['fundSubjectId']),
      partnerId: isBlank(data['partnerId']) ? null : String(data['partnerId']),
      amount: String(data['amount']),
      cycle: String(data['cycle']),
      startDate: String(data['startDate']),
      endDate: isBlank(data['endDate']) ? null : String(data['endDate']),
      useStatus: String(data['useStatus']),
    };
    return transaction(async (db) => {
      const subjects = await db.query(
        `SELECT fund_subject_id FROM fund_subject WHERE fund_subject_id = CAST(:fundSubjectId AS bigint)`,
        { fundSubjectId: params.fundSubjectId },
      );
      if (subjects.length === 0) throw new ApiError(404, 'FUND_SUBJECT_NOT_FOUND', '자금과목을 찾을 수 없습니다.');
      if (params.partnerId !== null) {
        const partners = await db.query(
          `SELECT partner_id FROM partner WHERE partner_id = CAST(:partnerId AS bigint)`,
          { partnerId: params.partnerId },
        );
        if (partners.length === 0) throw new ApiError(404, 'PARTNER_NOT_FOUND', '거래처를 찾을 수 없습니다.');
      }
      if (params.endDate !== null) {
        const checkRows = await db.query(
          `SELECT (CAST(:endDate AS date) < CAST(:startDate AS date)) AS "bad"`,
          { endDate: params.endDate, startDate: params.startDate },
        );
        if (checkRows[0].bad) throw new ApiError(422, 'INVALID_DATE_RANGE', '적용 종료일은 적용 시작일보다 앞설 수 없습니다.');
      }
      const rows = await db.query(
        `INSERT INTO fixed_fund (fund_subject_id, partner_id, amount, cycle, start_date, end_date, use_status, created_at, updated_at)
         VALUES (CAST(:fundSubjectId AS bigint), CAST(:partnerId AS bigint), CAST(:amount AS numeric), :cycle,
                 CAST(:startDate AS date), CAST(:endDate AS date), :useStatus, now(), now())
         RETURNING fixed_fund_id AS "fixedFundId"`,
        params,
      );
      return { fixedFundId: Number(rows[0].fixedFundId) };
    });
  }

  @Patch('/fixed-funds/:fixedFundId')
  async updateFixedFund(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['fixedFundId'];
    if (!isId(idText)) throw new ApiError(404, 'FIXED_FUND_NOT_FOUND', '고정자금을 찾을 수 없습니다.');
    const data = checks.inputOf(req.body);
    if ('fundSubjectId' in data && !isId(data['fundSubjectId'])) throw invalid('자금과목 값이 올바르지 않습니다.');
    if ('partnerId' in data && !isBlank(data['partnerId']) && !isId(data['partnerId'])) throw invalid('거래처 값이 올바르지 않습니다.');
    if ('amount' in data && (!isNumeric(data['amount']) || Number(data['amount']) <= 0)) throw invalid('금액은 0보다 큰 숫자로 입력해 주세요.');
    if ('cycle' in data && !CYCLES.includes(String(data['cycle']))) throw invalid('발생 주기 값이 올바르지 않습니다.');
    if ('startDate' in data && !isDateText(data['startDate'])) throw invalid('적용 시작일 형식이 올바르지 않습니다.');
    if ('endDate' in data && !isBlank(data['endDate']) && !isDateText(data['endDate'])) throw invalid('적용 종료일 형식이 올바르지 않습니다.');
    if ('useStatus' in data && !USE_STATUSES.includes(String(data['useStatus']))) throw invalid('사용 여부 값이 올바르지 않습니다.');
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT fund_subject_id AS "fundSubjectId", partner_id AS "partnerId", CAST(amount AS text) AS "amount",
                cycle AS "cycle", CAST(start_date AS text) AS "startDate", CAST(end_date AS text) AS "endDate",
                use_status AS "useStatus"
         FROM fixed_fund WHERE fixed_fund_id = CAST(:id AS bigint)`,
        { id: String(idText) },
      );
      if (found.length === 0) throw new ApiError(404, 'FIXED_FUND_NOT_FOUND', '고정자금을 찾을 수 없습니다.');
      const old = found[0];
      const pick = (key: string, fallback: unknown) => {
        if (!(key in data)) return fallback === null || fallback === undefined ? null : String(fallback);
        return isBlank(data[key]) ? null : String(data[key]);
      };
      const params = {
        id: String(idText),
        fundSubjectId: pick('fundSubjectId', old.fundSubjectId),
        partnerId: pick('partnerId', old.partnerId),
        amount: pick('amount', old.amount),
        cycle: pick('cycle', old.cycle),
        startDate: pick('startDate', old.startDate),
        endDate: pick('endDate', old.endDate),
        useStatus: pick('useStatus', old.useStatus),
      };
      if ('fundSubjectId' in data) {
        const subjects = await db.query(
          `SELECT fund_subject_id FROM fund_subject WHERE fund_subject_id = CAST(:fundSubjectId AS bigint)`,
          { fundSubjectId: params.fundSubjectId },
        );
        if (subjects.length === 0) throw new ApiError(404, 'FUND_SUBJECT_NOT_FOUND', '자금과목을 찾을 수 없습니다.');
      }
      if ('partnerId' in data && params.partnerId !== null) {
        const partners = await db.query(
          `SELECT partner_id FROM partner WHERE partner_id = CAST(:partnerId AS bigint)`,
          { partnerId: params.partnerId },
        );
        if (partners.length === 0) throw new ApiError(404, 'PARTNER_NOT_FOUND', '거래처를 찾을 수 없습니다.');
      }
      if (params.endDate !== null) {
        const checkRows = await db.query(
          `SELECT (CAST(:endDate AS date) < CAST(:startDate AS date)) AS "bad"`,
          { endDate: params.endDate, startDate: params.startDate },
        );
        if (checkRows[0].bad) throw new ApiError(422, 'INVALID_DATE_RANGE', '적용 종료일은 적용 시작일보다 앞설 수 없습니다.');
      }
      await db.execute(
        `UPDATE fixed_fund SET
           fund_subject_id = CAST(:fundSubjectId AS bigint),
           partner_id = CAST(:partnerId AS bigint),
           amount = CAST(:amount AS numeric),
           cycle = :cycle,
           start_date = CAST(:startDate AS date),
           end_date = CAST(:endDate AS date),
           use_status = :useStatus,
           updated_at = now()
         WHERE fixed_fund_id = CAST(:id AS bigint)`,
        params,
      );
      return { fixedFundId: Number(idText) };
    });
  }

  @Delete('/fixed-funds/:fixedFundId')
  async deleteFixedFund(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['fixedFundId'];
    if (!isId(idText)) throw new ApiError(404, 'FIXED_FUND_NOT_FOUND', '고정자금을 찾을 수 없습니다.');
    return transaction(async (db) => {
      const count = await db.execute(
        `DELETE FROM fixed_fund WHERE fixed_fund_id = CAST(:id AS bigint)`,
        { id: String(idText) },
      );
      if (count === 0) throw new ApiError(404, 'FIXED_FUND_NOT_FOUND', '고정자금을 찾을 수 없습니다.');
      return {};
    });
  }
}
