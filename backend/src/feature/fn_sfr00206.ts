import { Controller, Get, Post, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const CARD_TYPES = ['법인', '개인', '사업용'];

// 가정: 암호화는 운영 DB 설정에서 한다. 이 코드는 card_number_enc 컬럼 값을 그대로 읽고 쓴다.
// 가정: 카드번호 끝 4자리는 숫자만 남긴 카드번호의 마지막 4자리다.

function fail(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function optText(v: unknown, max: number, label: string): string | null {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  if (typeof v !== 'string' || v.length > max) {
    throw fail(label + ' 형식이 올바르지 않습니다.');
  }
  return v;
}

function idOf(v: unknown, label: string): string {
  const n = Number(v);
  if (v === undefined || v === null || v === '' || !Number.isInteger(n) || n <= 0) {
    throw fail(label + '을(를) 올바르게 입력해 주세요.');
  }
  return String(n);
}

function pagingOf(q: Record<string, unknown>): { page: number; size: number } {
  let page = 0;
  let size = 20;
  if (q['page'] !== undefined && q['page'] !== '') {
    page = Number(q['page']);
    if (!Number.isInteger(page) || page < 0) {
      throw fail('page 값이 올바르지 않습니다.');
    }
  }
  if (q['size'] !== undefined && q['size'] !== '') {
    size = Number(q['size']);
    if (!Number.isInteger(size) || size < 1) {
      throw fail('size 값이 올바르지 않습니다.');
    }
  }
  if (size > 200) {
    size = 200;
  }
  return { page, size };
}

@Controller('api/v1')
export class FnSfr00206Controller {
  @Get('/credit-cards')
  async listCreditCards(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const { page, size } = pagingOf(q);
    let cardType: string | null = null;
    if (q['cardType'] !== undefined && q['cardType'] !== '') {
      if (typeof q['cardType'] !== 'string' || !CARD_TYPES.includes(q['cardType'])) {
        throw fail('카드 유형은 법인·개인·사업용 중 하나여야 합니다.');
      }
      cardType = q['cardType'];
    }
    return transaction(async (db) => {
      const params = { cardType, size, offset: page * size };
      const rows = await db.query(
        `SELECT credit_card_id AS "creditCardId",
                card_type AS "cardType",
                card_number_last4 AS "cardNumberLast4",
                card_name AS "cardName",
                issuer_name AS "issuerName",
                to_char(expiry_date, 'YYYY-MM-DD') AS "expiryDate"
           FROM credit_card
          WHERE (CAST(:cardType AS varchar) IS NULL OR card_type = CAST(:cardType AS varchar))
          ORDER BY credit_card_id DESC
          LIMIT :size OFFSET :offset`,
        params,
      );
      const cnt = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM credit_card
          WHERE (CAST(:cardType AS varchar) IS NULL OR card_type = CAST(:cardType AS varchar))`,
        { cardType },
      );
      return { items: rows, page, size, total: Number(cnt[0].total) };
    });
  }

  @Post('/credit-cards')
  @HttpCode(200)
  async createCreditCard(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const cardType = data['cardType'];
    if (typeof cardType !== 'string' || !CARD_TYPES.includes(cardType)) {
      throw fail('카드 유형은 법인·개인·사업용 중 하나여야 합니다.');
    }
    const cardNumber = data['cardNumber'];
    if (typeof cardNumber !== 'string' || cardNumber.trim() === '' || cardNumber.length > 100) {
      throw fail('카드번호를 입력해 주세요.');
    }
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 4) {
      throw fail('카드번호 형식이 올바르지 않습니다.');
    }
    const last4 = digits.slice(-4);
    const cardName = optText(data['cardName'], 100, '카드명');
    const issuerName = optText(data['issuerName'], 100, '카드사명');
    let expiryDate: string | null = null;
    if (data['expiryDate'] !== undefined && data['expiryDate'] !== null && data['expiryDate'] !== '') {
      if (typeof data['expiryDate'] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data['expiryDate'])) {
        throw fail('유효기간 만료일은 YYYY-MM-DD 형식이어야 합니다.');
      }
      expiryDate = data['expiryDate'];
    }
    return transaction(async (db) => {
      const dup = await db.query(
        'SELECT credit_card_id FROM credit_card WHERE card_number_enc = :cardNumber',
        { cardNumber },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'CREDIT_CARD_DUPLICATED', '이미 등록된 카드번호입니다.');
      }
      const rows = await db.query(
        `INSERT INTO credit_card
           (card_type, card_number_enc, card_number_last4, card_name, issuer_name, expiry_date, created_at, updated_at)
         VALUES
           (:cardType, :cardNumber, :last4, :cardName, :issuerName, CAST(:expiryDate AS date), now(), now())
         RETURNING credit_card_id AS "creditCardId"`,
        { cardType, cardNumber, last4, cardName, issuerName, expiryDate },
      );
      return { creditCardId: Number(rows[0].creditCardId) };
    });
  }

  @Get('/credit-card-permissions')
  async listCreditCardPermissions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const creditCardId = idOf(q['creditCardId'], '신용카드');
    const { page, size } = pagingOf(q);
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT credit_card_permission_id AS "creditCardPermissionId",
                credit_card_id AS "creditCardId",
                employee_id AS "employeeId"
           FROM credit_card_permission
          WHERE credit_card_id = CAST(:creditCardId AS bigint)
          ORDER BY credit_card_permission_id
          LIMIT :size OFFSET :offset`,
        { creditCardId, size, offset: page * size },
      );
      const cnt = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM credit_card_permission
          WHERE credit_card_id = CAST(:creditCardId AS bigint)`,
        { creditCardId },
      );
      return { items: rows, page, size, total: Number(cnt[0].total) };
    });
  }

  @Post('/credit-card-permissions')
  @HttpCode(200)
  async createCreditCardPermission(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const creditCardId = idOf(data['creditCardId'], '신용카드');
    const employeeId = idOf(data['employeeId'], '임직원');
    return transaction(async (db) => {
      const card = await db.query(
        'SELECT credit_card_id FROM credit_card WHERE credit_card_id = CAST(:creditCardId AS bigint)',
        { creditCardId },
      );
      if (card.length === 0) {
        throw new ApiError(404, 'CREDIT_CARD_NOT_FOUND', '신용카드를 찾을 수 없습니다.');
      }
      const emp = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      if (emp.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
      }
      const dup = await db.query(
        `SELECT credit_card_permission_id FROM credit_card_permission
          WHERE credit_card_id = CAST(:creditCardId AS bigint)
            AND employee_id = CAST(:employeeId AS bigint)`,
        { creditCardId, employeeId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'CREDIT_CARD_PERMISSION_DUPLICATED', '이미 권한이 설정되어 있습니다.');
      }
      const rows = await db.query(
        `INSERT INTO credit_card_permission (credit_card_id, employee_id, created_at, updated_at)
         VALUES (CAST(:creditCardId AS bigint), CAST(:employeeId AS bigint), now(), now())
         RETURNING credit_card_permission_id AS "creditCardPermissionId"`,
        { creditCardId, employeeId },
      );
      return { creditCardPermissionId: Number(rows[0].creditCardPermissionId) };
    });
  }

  @Delete('/credit-card-permissions/:creditCardPermissionId')
  async deleteCreditCardPermission(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const permissionId = idOf(req.params['creditCardPermissionId'], '권한 ID');
    return transaction(async (db) => {
      const count = await db.execute(
        'DELETE FROM credit_card_permission WHERE credit_card_permission_id = CAST(:permissionId AS bigint)',
        { permissionId },
      );
      if (count === 0) {
        throw new ApiError(404, 'CREDIT_CARD_PERMISSION_NOT_FOUND', '권한 설정을 찾을 수 없습니다.');
      }
      return {};
    });
  }
}
