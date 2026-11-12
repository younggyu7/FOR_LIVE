import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const SUBJECT_TYPES = ['INFLOW', 'OUTFLOW'];
const USE_STATUSES = ['사용', '미사용'];

function has(v: unknown): boolean {
  return v !== undefined && v !== null && v !== '';
}

function isInt(v: unknown): boolean {
  if (typeof v === 'number') {
    return Number.isInteger(v);
  }
  if (typeof v === 'string') {
    return /^-?\d+$/.test(v.trim());
  }
  return false;
}

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function textOf(v: unknown, label: string, max: number, required: boolean): string | null {
  if (!has(v)) {
    if (required) {
      throw invalid(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (typeof v !== 'string' || v.trim() === '' || v.length > max) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  return v.trim();
}

function enumOf(v: unknown, label: string, allowed: string[], required: boolean): string | null {
  if (!has(v)) {
    if (required) {
      throw invalid(label + '을(를) 선택해 주세요.');
    }
    return null;
  }
  if (typeof v !== 'string' || !allowed.includes(v)) {
    throw invalid(label + ' 값이 올바르지 않습니다.');
  }
  return v;
}

function idOf(v: unknown, label: string, required: boolean): string | null {
  if (!has(v)) {
    if (required) {
      throw invalid(label + '을(를) 선택해 주세요.');
    }
    return null;
  }
  if (!isInt(v)) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  return String(v).trim();
}

function paging(q: Record<string, unknown>): { page: number; size: number } {
  let page = 0;
  let size = DEFAULT_SIZE;
  if (has(q['page'])) {
    if (!isInt(q['page']) || Number(q['page']) < 0) {
      throw invalid('page 값이 올바르지 않습니다.');
    }
    page = Number(q['page']);
  }
  if (has(q['size'])) {
    if (!isInt(q['size']) || Number(q['size']) < 1) {
      throw invalid('size 값이 올바르지 않습니다.');
    }
    size = Math.min(Number(q['size']), MAX_SIZE);
  }
  return { page, size };
}

function pathId(req: Request, name: string): string {
  const v = req.params[name];
  if (typeof v !== 'string' || !/^\d+$/.test(v)) {
    throw invalid(name + ' 값이 올바르지 않습니다.');
  }
  return v;
}

@Controller('api/v1')
export class FnSfr00901Controller {
  @Get('/fund-subjects')
  async listFundSubjects(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const useStatus = enumOf(q['useStatus'], '사용 여부', USE_STATUSES, false);
    const { page, size } = paging(q);
    return transaction(async (db) => {
      const where = 'WHERE (CAST(:useStatus AS text) IS NULL OR use_status = CAST(:useStatus AS text))';
      const items = await db.query(
        'SELECT fund_subject_id AS "fundSubjectId", name AS "name", subject_type AS "subjectType", use_status AS "useStatus", account_subject_id AS "accountSubjectId" FROM fund_subject ' + where + ' ORDER BY fund_subject_id LIMIT :size OFFSET :offset',
        { useStatus, size, offset: page * size },
      );
      const counts = await db.query('SELECT COUNT(*) AS "total" FROM fund_subject ' + where, { useStatus });
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/fund-subjects')
  @HttpCode(200)
  async createFundSubject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const name = textOf(data['name'], '자금과목명', 100, true);
    const subjectType = enumOf(data['subjectType'], '자금과목 구분', SUBJECT_TYPES, true);
    const useStatus = enumOf(data['useStatus'], '사용 여부', USE_STATUSES, true);
    const accountSubjectId = idOf(data['accountSubjectId'], '연결 계정과목', false);
    return transaction(async (db) => {
      const dup = await db.query('SELECT fund_subject_id FROM fund_subject WHERE name = :name', { name });
      if (dup.length > 0) {
        throw new ApiError(409, 'FUND_SUBJECT_DUPLICATED', '이미 존재하는 자금과목명입니다.');
      }
      if (accountSubjectId !== null) {
        const acc = await db.query('SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:accountSubjectId AS bigint)', { accountSubjectId });
        if (acc.length === 0) {
          throw new ApiError(404, 'ACCOUNT_SUBJECT_NOT_FOUND', '연결할 계정과목을 찾을 수 없습니다.');
        }
      }
      const rows = await db.query(
        'INSERT INTO fund_subject (name, subject_type, use_status, account_subject_id, created_at, updated_at) VALUES (:name, :subjectType, :useStatus, CAST(:accountSubjectId AS bigint), now(), now()) RETURNING fund_subject_id AS "fundSubjectId"',
        { name, subjectType, useStatus, accountSubjectId },
      );
      return { fundSubjectId: Number(rows[0]['fundSubjectId']) };
    });
  }

  @Patch('/fund-subjects/:fundSubjectId')
  async updateFundSubject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req, 'fundSubjectId');
    const data = checks.inputOf(req.body);
    const name = textOf(data['name'], '자금과목명', 100, false);
    const subjectType = enumOf(data['subjectType'], '자금과목 구분', SUBJECT_TYPES, false);
    const useStatus = enumOf(data['useStatus'], '사용 여부', USE_STATUSES, false);
    const accountSubjectId = idOf(data['accountSubjectId'], '연결 계정과목', false);
    return transaction(async (db) => {
      const found = await db.query('SELECT fund_subject_id FROM fund_subject WHERE fund_subject_id = CAST(:id AS bigint)', { id });
      if (found.length === 0) {
        throw new ApiError(404, 'FUND_SUBJECT_NOT_FOUND', '자금과목을 찾을 수 없습니다.');
      }
      if (name !== null) {
        const dup = await db.query('SELECT fund_subject_id FROM fund_subject WHERE name = :name AND fund_subject_id <> CAST(:id AS bigint)', { name, id });
        if (dup.length > 0) {
          throw new ApiError(409, 'FUND_SUBJECT_DUPLICATED', '이미 존재하는 자금과목명입니다.');
        }
      }
      if (accountSubjectId !== null) {
        const acc = await db.query('SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:accountSubjectId AS bigint)', { accountSubjectId });
        if (acc.length === 0) {
          throw new ApiError(404, 'ACCOUNT_SUBJECT_NOT_FOUND', '연결할 계정과목을 찾을 수 없습니다.');
        }
      }
      const rows = await db.query(
        'UPDATE fund_subject SET name = COALESCE(CAST(:name AS varchar), name), subject_type = COALESCE(CAST(:subjectType AS varchar), subject_type), use_status = COALESCE(CAST(:useStatus AS varchar), use_status), account_subject_id = COALESCE(CAST(:accountSubjectId AS bigint), account_subject_id), updated_at = now() WHERE fund_subject_id = CAST(:id AS bigint) RETURNING fund_subject_id AS "fundSubjectId"',
        { id, name, subjectType, useStatus, accountSubjectId },
      );
      return { fundSubjectId: Number(rows[0]['fundSubjectId']) };
    });
  }

  @Get('/fund-pl-form-items')
  async listFundPlFormItems(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const { page, size } = paging(q);
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT fund_pl_form_item_id AS "fundPlFormItemId", fund_subject_id AS "fundSubjectId", sort_order AS "sortOrder", item_name AS "itemName" FROM fund_pl_form_item ORDER BY sort_order, fund_pl_form_item_id LIMIT :size OFFSET :offset',
        { size, offset: page * size },
      );
      const counts = await db.query('SELECT COUNT(*) AS "total" FROM fund_pl_form_item', {});
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/fund-pl-form-items')
  @HttpCode(200)
  async createFundPlFormItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const fundSubjectId = idOf(data['fundSubjectId'], '자금과목', true);
    const sortOrder = idOf(data['sortOrder'], '순서', true);
    if (Number(sortOrder) <= 0) {
      throw invalid('순서는 1 이상이어야 합니다.');
    }
    const itemName = textOf(data['itemName'], '항목명', 100, false);
    return transaction(async (db) => {
      const sub = await db.query('SELECT fund_subject_id FROM fund_subject WHERE fund_subject_id = CAST(:fundSubjectId AS bigint)', { fundSubjectId });
      if (sub.length === 0) {
        throw new ApiError(404, 'FUND_SUBJECT_NOT_FOUND', '자금과목을 찾을 수 없습니다.');
      }
      const rows = await db.query(
        'INSERT INTO fund_pl_form_item (fund_subject_id, sort_order, item_name, created_at, updated_at) VALUES (CAST(:fundSubjectId AS bigint), CAST(:sortOrder AS integer), :itemName, now(), now()) RETURNING fund_pl_form_item_id AS "fundPlFormItemId"',
        { fundSubjectId, sortOrder, itemName },
      );
      return { fundPlFormItemId: Number(rows[0]['fundPlFormItemId']) };
    });
  }

  @Patch('/fund-pl-form-items/:fundPlFormItemId')
  async updateFundPlFormItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req, 'fundPlFormItemId');
    const data = checks.inputOf(req.body);
    const fundSubjectId = idOf(data['fundSubjectId'], '자금과목', false);
    const sortOrder = idOf(data['sortOrder'], '순서', false);
    if (sortOrder !== null && Number(sortOrder) <= 0) {
      throw invalid('순서는 1 이상이어야 합니다.');
    }
    const itemName = textOf(data['itemName'], '항목명', 100, false);
    return transaction(async (db) => {
      const found = await db.query('SELECT fund_pl_form_item_id FROM fund_pl_form_item WHERE fund_pl_form_item_id = CAST(:id AS bigint)', { id });
      if (found.length === 0) {
        throw new ApiError(404, 'FUND_PL_FORM_ITEM_NOT_FOUND', '양식 항목을 찾을 수 없습니다.');
      }
      if (fundSubjectId !== null) {
        const sub = await db.query('SELECT fund_subject_id FROM fund_subject WHERE fund_subject_id = CAST(:fundSubjectId AS bigint)', { fundSubjectId });
        if (sub.length === 0) {
          throw new ApiError(404, 'FUND_SUBJECT_NOT_FOUND', '자금과목을 찾을 수 없습니다.');
        }
      }
      const rows = await db.query(
        'UPDATE fund_pl_form_item SET fund_subject_id = COALESCE(CAST(:fundSubjectId AS bigint), fund_subject_id), sort_order = COALESCE(CAST(:sortOrder AS integer), sort_order), item_name = COALESCE(CAST(:itemName AS varchar), item_name), updated_at = now() WHERE fund_pl_form_item_id = CAST(:id AS bigint) RETURNING fund_pl_form_item_id AS "fundPlFormItemId"',
        { id, fundSubjectId, sortOrder, itemName },
      );
      return { fundPlFormItemId: Number(rows[0]['fundPlFormItemId']) };
    });
  }

  @Delete('/fund-pl-form-items/:fundPlFormItemId')
  async deleteFundPlFormItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req, 'fundPlFormItemId');
    return transaction(async (db) => {
      const count = await db.execute('DELETE FROM fund_pl_form_item WHERE fund_pl_form_item_id = CAST(:id AS bigint)', { id });
      if (count === 0) {
        throw new ApiError(404, 'FUND_PL_FORM_ITEM_NOT_FOUND', '양식 항목을 찾을 수 없습니다.');
      }
      return {};
    });
  }
}
