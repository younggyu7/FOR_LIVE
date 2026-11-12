import { Controller, Get, Post, Put, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 관련계정·관리항목은 별도 엔티티가 없어 이 기능에서는 계정과목(설명·비고)만 다룬다.
const ROLE = '예산·회계 담당자';
const CATEGORIES = ['자산', '부채', '자본', '수익', '비용'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalText(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_FAILED', '설명과 비고는 글자로 입력해 주세요.');
  }
  return value;
}

function subjectOf(data: Record<string, unknown>) {
  const category = text(data['category']);
  const code = text(data['code']);
  const name = text(data['name']);
  if (!category) {
    throw new ApiError(400, 'VALIDATION_FAILED', '계정 구분을 선택해 주세요.');
  }
  if (!CATEGORIES.includes(category)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '계정 구분은 자산, 부채, 자본, 수익, 비용 중에서 골라 주세요.');
  }
  if (!code) {
    throw new ApiError(400, 'VALIDATION_FAILED', '계정과목 코드를 입력해 주세요.');
  }
  if (code.length > 20) {
    throw new ApiError(400, 'VALIDATION_FAILED', '계정과목 코드는 20자 이하로 입력해 주세요.');
  }
  if (!name) {
    throw new ApiError(400, 'VALIDATION_FAILED', '계정과목 명칭을 입력해 주세요.');
  }
  if (name.length > 200) {
    throw new ApiError(400, 'VALIDATION_FAILED', '계정과목 명칭은 200자 이하로 입력해 주세요.');
  }
  return {
    category,
    code,
    name,
    description: optionalText(data['description']),
    remark: optionalText(data['remark']),
  };
}

@Controller('api/v1')
export class FnSfr00601Controller {
  @Get('/account-subjects')
  async listAccountSubjects(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const pageRaw = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const page = pageRaw;
    const size = Math.min(sizeRaw, MAX_SIZE);
    const category = text(query['category']);
    if (category && !CATEGORIES.includes(category)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '계정 구분이 올바르지 않습니다.');
    }
    const keyword = text(query['keyword']);
    const params = {
      category: category || null,
      keyword: keyword ? '%' + keyword + '%' : null,
      size,
      offset: page * size,
    };
    const where = `WHERE (CAST(:category AS varchar) IS NULL OR category = CAST(:category AS varchar))
      AND (CAST(:keyword AS varchar) IS NULL OR code ILIKE CAST(:keyword AS varchar) OR name ILIKE CAST(:keyword AS varchar))`;
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT account_subject_id AS "accountSubjectId",
          code AS "code",
          name AS "name",
          category AS "category",
          description AS "description",
          remark AS "remark"
        FROM account_subject
        ${where}
        ORDER BY code
        LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        params,
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total" FROM account_subject ${where}`,
        { category: params.category, keyword: params.keyword },
      );
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }

  @Post('/account-subjects')
  @HttpCode(200)
  async createAccountSubject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const subject = subjectOf(data);
    return transaction(async (db) => {
      const same = await db.query(
        'SELECT account_subject_id FROM account_subject WHERE code = :code',
        { code: subject.code },
      );
      if (same.length > 0) {
        throw new ApiError(409, 'ACCOUNT_SUBJECT_CODE_DUPLICATED', '이미 존재하는 계정과목 코드입니다.');
      }
      const rows = await db.query(
        `INSERT INTO account_subject (code, name, category, description, remark, created_at, updated_at)
        VALUES (:code, :name, :category, :description, :remark, now(), now())
        RETURNING account_subject_id AS "accountSubjectId"`,
        subject,
      );
      return { accountSubjectId: Number(rows[0]['accountSubjectId']) };
    });
  }

  @Put('/account-subjects/:accountSubjectId')
  async updateAccountSubject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['accountSubjectId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '계정과목 ID가 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const subject = subjectOf(data);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:id AS bigint)',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'ACCOUNT_SUBJECT_NOT_FOUND', '계정과목을 찾을 수 없습니다.');
      }
      const same = await db.query(
        'SELECT account_subject_id FROM account_subject WHERE code = :code AND account_subject_id <> CAST(:id AS bigint)',
        { code: subject.code, id: idText },
      );
      if (same.length > 0) {
        throw new ApiError(409, 'ACCOUNT_SUBJECT_CODE_DUPLICATED', '이미 존재하는 계정과목 코드입니다.');
      }
      await db.execute(
        `UPDATE account_subject
        SET code = :code, name = :name, category = :category,
          description = :description, remark = :remark, updated_at = now()
        WHERE account_subject_id = CAST(:id AS bigint)`,
        { ...subject, id: idText },
      );
      return { accountSubjectId: Number(idText) };
    });
  }
}
