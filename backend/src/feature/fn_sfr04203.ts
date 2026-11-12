import { Controller, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const MAX_INT32 = 2147483647;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function invalid(message: string): ApiError {
  return new ApiError(422, 'INVALID_FEE_RECORD', message);
}

function isIntegerValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value);
  }
  if (typeof value === 'string') {
    return /^\d+$/.test(value.trim());
  }
  return false;
}

function optionalDate(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw invalid(label + ' 형식이 올바르지 않습니다. YYYY-MM-DD로 입력해 주세요.');
  }
  return value;
}

@Controller('api/v1')
export class FnSfr04203Controller {
  @Post('/fee-records')
  @HttpCode(200)
  async createFeeRecord(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);

    if (!isIntegerValue(data['feeUnitPriceId']) || Number(data['feeUnitPriceId']) <= 0) {
      throw invalid('수수료 단가를 선택해 주세요.');
    }
    if (!isIntegerValue(data['quantity']) || Number(data['quantity']) <= 0 || Number(data['quantity']) > MAX_INT32) {
      throw invalid('수량은 1 이상의 정수로 입력해 주세요.');
    }
    if (typeof data['isOffline'] !== 'boolean') {
      throw invalid('오프라인 여부를 선택해 주세요.');
    }
    const reviewDate = optionalDate(data['reviewDate'], '심사일자');
    const resolutionDate = optionalDate(data['resolutionDate'], '결의일자');
    const params = {
      feeUnitPriceId: String(data['feeUnitPriceId']).trim(),
      quantity: String(data['quantity']).trim(),
      isOffline: data['isOffline'],
      reviewDate,
      resolutionDate,
    };

    return transaction(async (db) => {
      const prices = await db.query(
        'SELECT fee_unit_price_id FROM fee_unit_price WHERE fee_unit_price_id = CAST(:feeUnitPriceId AS bigint)',
        { feeUnitPriceId: params.feeUnitPriceId },
      );
      if (prices.length === 0) {
        throw new ApiError(404, 'FEE_UNIT_PRICE_NOT_FOUND', '적용할 수수료 단가가 등록되어 있지 않습니다.');
      }

      // 금액 = 선택한 단가 행의 단가 × 수량 (SQL에서 계산)
      const rows = await db.query(
        'INSERT INTO fee_record (fee_unit_price_id, review_date, resolution_date, quantity, amount, is_offline, created_at, updated_at) '
          + 'SELECT p.fee_unit_price_id, CAST(:reviewDate AS date), CAST(:resolutionDate AS date), CAST(:quantity AS integer), '
          + 'p.unit_price * CAST(:quantity AS integer), CAST(:isOffline AS boolean), now(), now() '
          + 'FROM fee_unit_price p WHERE p.fee_unit_price_id = CAST(:feeUnitPriceId AS bigint) '
          + 'RETURNING fee_record_id AS "feeRecordId", quantity AS "quantity", amount AS "amount", is_offline AS "isOffline"',
        params,
      );
      const row = rows[0];
      return {
        feeRecordId: Number(row['feeRecordId']),
        quantity: Number(row['quantity']),
        amount: Number(row['amount']),
        isOffline: row['isOffline'],
      };
    });
  }
}
