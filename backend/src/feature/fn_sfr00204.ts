import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

type Body = Record<string, unknown>;

const ROLE = '예산·회계 담당자';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 사업자등록번호는 하이픈 제외 10자리 숫자 문자열이다 (schema.sql 컬럼 설명).
const BIZ_NO_FORMAT = /^\d{10}$/;
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const PARTNER_TYPES = ['일반', '금융'];

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function textOf(data: Body, key: string, label: string, max: number, required: boolean): string | null {
  const v = data[key];
  if (v === undefined || v === null || v === '') {
    if (required) {
      throw invalid(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (typeof v !== 'string') {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  if (v.length > max) {
    throw invalid(label + '은(는) ' + max + '자 이내로 입력해 주세요.');
  }
  return v;
}

function dateOf(data: Body, key: string, label: string): string | null {
  const v = textOf(data, key, label, 10, false);
  if (v !== null && !DATE_FORMAT.test(v)) {
    throw invalid(label + '은(는) YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return v;
}

function bizNoOf(data: Body, required: boolean): string | null {
  const v = textOf(data, 'businessRegNo', '사업자등록번호', 10, required);
  if (v !== null && !BIZ_NO_FORMAT.test(v)) {
    throw invalid('사업자등록번호는 하이픈 없이 숫자 10자리로 입력해 주세요.');
  }
  return v;
}

function flagOf(data: Body, key: string): boolean | null {
  const v = data[key];
  if (v === undefined || v === null || v === '') {
    return null;
  }
  if (typeof v !== 'boolean') {
    throw invalid('세금계산서 여부 형식이 올바르지 않습니다.');
  }
  return v;
}

function idOf(value: unknown, label: string): string {
  const s = value === undefined || value === null ? '' : String(value);
  if (!/^\d+$/.test(s)) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  return s;
}

// TODO(질문): 금융거래처 계좌정보(계좌번호 암호화 저장) 컬럼·테이블이 schema.sql에 없어 구현하지 못했다.
@Controller('api/v1')
export class FnSfr00204Controller {
  @Get('/partners')
  async listPartners(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query) as Body;
    const partnerType = textOf(query, 'partnerType', '거래처 유형', 10, false);
    if (partnerType !== null && !PARTNER_TYPES.includes(partnerType)) {
      throw invalid('거래처 유형은 일반 또는 금융이어야 합니다.');
    }
    const projectId = query['projectId'] === undefined || query['projectId'] === '' ? null : idOf(query['projectId'], '프로젝트');
    const keyword = textOf(query, 'keyword', '검색어', 200, false);
    const pageRaw = query['page'] === undefined || query['page'] === '' ? '0' : String(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? String(DEFAULT_SIZE) : String(query['size']);
    if (!/^\d+$/.test(pageRaw) || !/^\d+$/.test(sizeRaw)) {
      throw invalid('page·size 형식이 올바르지 않습니다.');
    }
    const page = Number(pageRaw);
    const size = Math.min(Math.max(Number(sizeRaw), 1), MAX_SIZE);
    return transaction(async (db) => {
      const params = {
        partnerType,
        projectId,
        keyword,
        size,
        offset: page * size,
      };
      const where = `
        WHERE (CAST(:partnerType AS text) IS NULL OR partner_type = CAST(:partnerType AS text))
          AND (CAST(:projectId AS bigint) IS NULL OR project_id = CAST(:projectId AS bigint))
          AND (CAST(:keyword AS text) IS NULL
               OR name ILIKE '%' || CAST(:keyword AS text) || '%'
               OR code ILIKE '%' || CAST(:keyword AS text) || '%')`;
      const items = await db.query(
        `SELECT partner_id AS "partnerId",
                code AS "code",
                partner_type AS "partnerType",
                name AS "name",
                short_name AS "shortName",
                business_reg_no AS "businessRegNo",
                representative AS "representative",
                trade_start_date AS "tradeStartDate",
                trade_end_date AS "tradeEndDate"
           FROM partner` + where + `
          ORDER BY partner_id DESC
          LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        params,
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total" FROM partner` + where,
        { partnerType, projectId, keyword },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/partners')
  @HttpCode(200)
  async createPartner(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Body;
    const partnerType = textOf(data, 'partnerType', '거래처 유형', 10, true);
    if (partnerType === null || !PARTNER_TYPES.includes(partnerType)) {
      throw invalid('거래처 유형은 일반 또는 금융이어야 합니다.');
    }
    const name = textOf(data, 'name', '거래처 명칭', 200, true);
    const shortName = textOf(data, 'shortName', '약칭', 100, false);
    const code = textOf(data, 'code', '거래처 코드', 20, true);
    const businessRegNo = bizNoOf(data, true);
    const representative = textOf(data, 'representative', '대표자', 100, true);
    const projectId = idOf(data['projectId'], '프로젝트');
    const category = textOf(data, 'category', '거래처 분류', 100, false);
    const region = textOf(data, 'region', '지역', 100, false);
    const taxInvoiceYn = flagOf(data, 'taxInvoiceYn');
    const tradeStartDate = dateOf(data, 'tradeStartDate', '거래 시작일');
    const tradeEndDate = dateOf(data, 'tradeEndDate', '거래 종료일');
    const contactPerson = textOf(data, 'contactPerson', '거래처 담당자', 100, false);
    return transaction(async (db) => {
      const projects = await db.query(
        'SELECT project_id FROM project WHERE project_id = CAST(:projectId AS bigint)',
        { projectId },
      );
      if (projects.length === 0) {
        throw new ApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      const dups = await db.query('SELECT partner_id FROM partner WHERE code = :code', { code });
      if (dups.length > 0) {
        throw new ApiError(409, 'PARTNER_CODE_DUPLICATED', '이미 사용 중인 거래처 코드입니다.');
      }
      const periods = await db.query(
        `SELECT (CAST(:tradeEndDate AS date) < CAST(:tradeStartDate AS date)) AS "bad"`,
        { tradeStartDate, tradeEndDate },
      );
      if (periods[0]['bad'] === true) {
        throw new ApiError(422, 'INVALID_TRADE_PERIOD', '거래 종료일은 거래 시작일보다 빠를 수 없습니다.');
      }
      const rows = await db.query(
        `INSERT INTO partner (
           project_id, code, partner_type, name, short_name, business_reg_no, representative,
           category, region, tax_invoice_yn, contact_person, trade_start_date, trade_end_date,
           created_at, updated_at)
         VALUES (
           CAST(:projectId AS bigint), :code, :partnerType, :name, :shortName, :businessRegNo, :representative,
           :category, :region, CAST(:taxInvoiceYn AS boolean), :contactPerson,
           CAST(:tradeStartDate AS date), CAST(:tradeEndDate AS date),
           now(), now())
         RETURNING partner_id AS "partnerId"`,
        {
          projectId,
          code,
          partnerType,
          name,
          shortName,
          businessRegNo,
          representative,
          category,
          region,
          taxInvoiceYn,
          contactPerson,
          tradeStartDate,
          tradeEndDate,
        },
      );
      return { partnerId: Number(rows[0]['partnerId']) };
    });
  }

  @Patch('/partners/:partnerId')
  async updatePartner(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const partnerId = idOf(req.params['partnerId'], '거래처 ID');
    const data = checks.inputOf(req.body) as Body;
    const name = textOf(data, 'name', '거래처 명칭', 200, false);
    const shortName = textOf(data, 'shortName', '약칭', 100, false);
    const code = textOf(data, 'code', '거래처 코드', 20, false);
    const businessRegNo = bizNoOf(data, false);
    const representative = textOf(data, 'representative', '대표자', 100, false);
    const category = textOf(data, 'category', '거래처 분류', 100, false);
    const region = textOf(data, 'region', '지역', 100, false);
    const taxInvoiceYn = flagOf(data, 'taxInvoiceYn');
    const tradeStartDate = dateOf(data, 'tradeStartDate', '거래 시작일');
    const tradeEndDate = dateOf(data, 'tradeEndDate', '거래 종료일');
    const contactPerson = textOf(data, 'contactPerson', '거래처 담당자', 100, false);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT partner_id FROM partner WHERE partner_id = CAST(:partnerId AS bigint)',
        { partnerId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PARTNER_NOT_FOUND', '거래처를 찾을 수 없습니다.');
      }
      if (code !== null) {
        const dups = await db.query(
          'SELECT partner_id FROM partner WHERE code = :code AND partner_id <> CAST(:partnerId AS bigint)',
          { code, partnerId },
        );
        if (dups.length > 0) {
          throw new ApiError(409, 'PARTNER_CODE_DUPLICATED', '이미 사용 중인 거래처 코드입니다.');
        }
      }
      const periods = await db.query(
        `SELECT (COALESCE(CAST(:tradeEndDate AS date), trade_end_date)
                 < COALESCE(CAST(:tradeStartDate AS date), trade_start_date)) AS "bad"
           FROM partner WHERE partner_id = CAST(:partnerId AS bigint)`,
        { tradeStartDate, tradeEndDate, partnerId },
      );
      if (periods[0]['bad'] === true) {
        throw new ApiError(422, 'INVALID_TRADE_PERIOD', '거래 종료일은 거래 시작일보다 빠를 수 없습니다.');
      }
      await db.execute(
        `UPDATE partner SET
           name = COALESCE(:name, name),
           short_name = COALESCE(:shortName, short_name),
           code = COALESCE(:code, code),
           business_reg_no = COALESCE(:businessRegNo, business_reg_no),
           representative = COALESCE(:representative, representative),
           category = COALESCE(:category, category),
           region = COALESCE(:region, region),
           tax_invoice_yn = COALESCE(CAST(:taxInvoiceYn AS boolean), tax_invoice_yn),
           trade_start_date = COALESCE(CAST(:tradeStartDate AS date), trade_start_date),
           trade_end_date = COALESCE(CAST(:tradeEndDate AS date), trade_end_date),
           contact_person = COALESCE(:contactPerson, contact_person),
           updated_at = now()
         WHERE partner_id = CAST(:partnerId AS bigint)`,
        {
          partnerId,
          name,
          shortName,
          code,
          businessRegNo,
          representative,
          category,
          region,
          taxInvoiceYn,
          tradeStartDate,
          tradeEndDate,
          contactPerson,
        },
      );
      return { partnerId: Number(partnerId) };
    });
  }
}
