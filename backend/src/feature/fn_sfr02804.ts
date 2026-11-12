import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

@Controller('api/v1')
export class FnSfr02804Controller {
  @Post('/notifications/read-all')
  @HttpCode(200)
  async readAllNotifications(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    return transaction(async (db) => {
      // 요청한 본인의 안읽음 알림에만 적용한다.
      const readCount = await db.execute(
        `UPDATE notification
            SET read_status = '읽음',
                read_at = now(),
                updated_at = now()
          WHERE recipient_id = CAST(:userId AS bigint)
            AND read_status = '안읽음'`,
        { userId: user.id },
      );
      if (readCount === 0) {
        throw new ApiError(409, 'NO_UNREAD_NOTIFICATIONS', '읽음 처리할 안읽음 알림이 없습니다.');
      }
      return { readCount };
    });
  }
}
