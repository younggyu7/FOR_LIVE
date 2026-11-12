import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const FEE_TYPES = ['REVIEW', 'REISSUE'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PRICE_PATTERN = /^\d{1,16}(\.\d{1,2})?$/;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

type StrRow = Record<string, string | null>;

function invalid(message: string): ApiError {
  return new ApiError(422, 'INVALID_FEE_UNIT_PRICE', message);
}

function priceOf(value: unknown): string {
  const text = typeof value === 'number' ? String(value) : value;
  if (typeof text !== 'string' || !PRICE_PATTERN.test(text.trim())) {
    throw invalid('단가는 0 이상의 숫자(소수 둘째 자리까지)로 입력해 주세요.');
  }
  return text.trim();
}

function dateOf(value: unknown, label: string): string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw invalid(label + '은(는) YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return value;
}

function optionalDate(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return dateOf(value, label);
}

function intOf(value: unknown, fallback: number, min: number, max: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < min) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 올바른 정수여야 합니다.');
  }
  return Math.min(n, max);
}

@Controller('api/v1')
export class FnSfr04201Controller {
  @Get('/fee-unit-prices')
  async listFeeUnitPrices(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const feeTypeRaw = query['feeType'];
    let feeType: string | null = null;
    if (feeTypeRaw !== undefined && feeTypeRaw !== null && feeTypeRaw !== '') {
      if (typeof feeTypeRaw !== 'string' || !FEE_TYPES.includes(feeTypeRaw)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '수수료 구분이 올바르지 않습니다.');
      }
      feeType = feeTypeRaw;
    }
    const page = intOf(query['page'], 0, 0, 1000000);
    const size = intOf(query['size'], DEFAULT_SIZE, 1, MAX_SIZE);
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT fee_unit_price_id AS "feeUnitPriceId",
                fee_type AS "feeType",
                unit_price AS "unitPrice",
                effective_from AS "effectiveFrom",
                effective_to AS "effectiveTo"
           FROM fee_unit_price
          WHERE (CAST(:feeType AS varchar) IS NULL OR fee_type = CAST(:feeType AS varchar))
          ORDER BY fee_type, effective_from DESC, fee_unit_price_id DESC
          LIMIT :size OFFSET :offset`,
        { feeType, size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM fee_unit_price
          WHERE (CAST(:feeType AS varchar) IS NULL OR fee_type = CAST(:feeType AS varchar))`,
        { feeType },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/fee-unit-prices')
  @HttpCode(200)
  async createFeeUnitPrice(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const feeType = data['feeType'];
    if (typeof feeType !== 'string' || !FEE_TYPES.includes(feeType)) {
      throw invalid('수수료 구분은 REVIEW 또는 REISSUE여야 합니다.');
    }
    const unitPrice = priceOf(data['unitPrice']);
    const effectiveFrom = dateOf(data['effectiveFrom'], '적용 시작일');
    const effectiveTo = optionalDate(data['effectiveTo'], '적용 종료일');
    if (effectiveTo !== null && effectiveTo < effectiveFrom) {
      throw invalid('적용 종료일은 적용 시작일보다 빠를 수 없습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `INSERT INTO fee_unit_price (fee_type, unit_price, effective_from, effective_to, created_at, updated_at)
         VALUES (:feeType, CAST(:unitPrice AS numeric), CAST(:effectiveFrom AS date), CAST(:effectiveTo AS date), now(), now())
         RETURNING fee_unit_price_id AS "feeUnitPriceId"`,
        { feeType, unitPrice, effectiveFrom, effectiveTo },
      );
      return { feeUnitPriceId: Number(rows[0]['feeUnitPriceId']) };
    });
  }

  @Patch('/fee-unit-prices/:feeUnitPriceId')
  async updateFeeUnitPrice(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const idText = req.params['feeUnitPriceId'];
    if (typeof idText !== 'string' || !/^\d+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '수수료 단가 ID가 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const hasPrice = data['unitPrice'] !== undefined && data['unitPrice'] !== null && data['unitPrice'] !== '';
    const hasFrom = data['effectiveFrom'] !== undefined && data['effectiveFrom'] !== null && data['effectiveFrom'] !== '';
    const hasTo = Object.prototype.hasOwnProperty.call(data, 'effectiveTo');
    const newPrice = hasPrice ? priceOf(data['unitPrice']) : null;
    const newFrom = hasFrom ? dateOf(data['effectiveFrom'], '적용 시작일') : null;
    const newTo = hasTo ? optionalDate(data['effectiveTo'], '적용 종료일') : null;
    return transaction(async (db) => {
      const rows = (await db.query(
        `SELECT CAST(unit_price AS text) AS "unitPrice",
                CAST(effective_from AS text) AS "effectiveFrom",
                CAST(effective_to AS text) AS "effectiveTo"
           FROM fee_unit_price
          WHERE fee_unit_price_id = CAST(:id AS bigint)
          FOR UPDATE`,
        { id: idText },
      )) as StrRow[];
      if (rows.length === 0) {
        throw new ApiError(404, 'FEE_UNIT_PRICE_NOT_FOUND', '수수료 단가를 찾을 수 없습니다.');
      }
      const before = rows[0];
      const finalFrom = newFrom !== null ? newFrom : (before['effectiveFrom'] as string);
      const finalTo = hasTo ? newTo : before['effectiveTo'];
      if (finalTo !== null && finalTo < finalFrom) {
        throw invalid('적용 종료일은 적용 시작일보다 빠를 수 없습니다.');
      }
      const changes: string[] = [];
      if (newPrice !== null && Number(newPrice) !== Number(before['unitPrice'])) {
        changes.push('단가: ' + before['unitPrice'] + ' -> ' + newPrice);
      }
      if (finalFrom !== before['effectiveFrom']) {
        changes.push('적용 시작일: ' + before['effectiveFrom'] + ' -> ' + finalFrom);
      }
      if (finalTo !== before['effectiveTo']) {
        changes.push('적용 종료일: ' + (before['effectiveTo'] ?? '없음') + ' -> ' + (finalTo ?? '없음'));
      }
      const content = changes.length > 0 ? changes.join('; ') : '변경된 값 없음';
      await db.execute(
        `UPDATE fee_unit_price
            SET unit_price = COALESCE(CAST(:unitPrice AS numeric), unit_price),
                effective_from = CAST(:effectiveFrom AS date),
                effective_to = CAST(:effectiveTo AS date),
                updated_at = now()
          WHERE fee_unit_price_id = CAST(:id AS bigint)`,
        { unitPrice: newPrice, effectiveFrom: finalFrom, effectiveTo: finalTo, id: idText },
      );
      // 가정: 변경 이력은 수정 전후 값 비교 문장으로 남긴다.
      await db.execute(
        `INSERT INTO change_history (changer_id, target_type, target_id, changed_at, change_content, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), 'fee_unit_price', CAST(:id AS bigint), now(), :content, now(), now())`,
        { userId: user.id, id: idText, content },
      );
      return { feeUnitPriceId: Number(idText) };
    });
  }
}
