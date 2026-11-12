import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 서버 모니터링 연동 방식이 정해지지 않아 전체 용량 기본값을 상수로 둔다 (단위: GB).
const DEFAULT_TOTAL_CAPACITY = 1000;
// 가정: 모니터링 정보가 없으면 사용 용량 기본값은 0으로 본다 (단위: GB).
const DEFAULT_USED_CAPACITY = 0;

@Controller('api/v1')
export class FnSfr03803Controller {
  @Get('/server-capacities')
  async getServerCapacity(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    checks.queryOf(req.query);
    return transaction(async (db) => {
      // 가정: 외부 모니터링 연동이 명세에 없어 기본값을 돌려준다.
      const totalCapacity = DEFAULT_TOTAL_CAPACITY;
      const usedCapacity = DEFAULT_USED_CAPACITY;
      if (usedCapacity > totalCapacity) {
        throw new ApiError(409, 'INVALID_STATE', '사용 용량이 전체 용량보다 클 수 없습니다.');
      }
      return {
        totalCapacity,
        usedCapacity,
        remainingCapacity: totalCapacity - usedCapacity,
      };
    });
  }
}
