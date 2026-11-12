import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function intOf(raw: unknown, fallback: number, min: number, label: string): number {
  if (raw === undefined || raw === null || raw === '') {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSir00302Controller {
  @Get('/error-messages')
  async listErrorMessages(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const q = checks.queryOf(req.query);
    const page = intOf(q['page'], 0, 0, '쪽 번호');
    const size = Math.min(intOf(q['size'], DEFAULT_SIZE, 1, '쪽 크기'), MAX_SIZE);
    const rawCode = q['errorCode'];
    let errorCode: string | null = null;
    if (rawCode !== undefined && rawCode !== null && rawCode !== '') {
      if (typeof rawCode !== 'string' || rawCode.length > 50) {
        throw new ApiError(400, 'VALIDATION_FAILED', '에러 코드는 50자 이하 문자열이어야 합니다.');
      }
      errorCode = rawCode;
    }
    return transaction(async (db) => {
      const where = errorCode === null ? '' : ' WHERE error_code = :errorCode';
      const filter: Record<string, unknown> = errorCode === null ? {} : { errorCode };
      const countRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM error_message' + where,
        filter,
      );
      const total = Number(countRows[0]['total']);
      const items = await db.query(
        'SELECT error_code AS "errorCode", message AS "message", action_guide AS "actionGuide"'
          + ' FROM error_message' + where
          + ' ORDER BY error_code LIMIT :size OFFSET :offset',
        { ...filter, size, offset: page * size },
      );
      return { items, page, size, total };
    });
  }
}
