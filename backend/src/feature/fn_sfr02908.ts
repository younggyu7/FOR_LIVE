import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

@Controller('api/v1')
export class FnSfr02908Controller {
  @Post('/notifications/:notificationId/read')
  @HttpCode(200)
  async readNotification2(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const notificationId = req.params['notificationId'];
    if (!/^[0-9]+$/.test(notificationId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '알림 ID 형식이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `UPDATE notification
            SET read_status = '읽음',
                read_at = COALESCE(read_at, now()),
                updated_at = now()
          WHERE notification_id = CAST(:notificationId AS bigint)
            AND recipient_id = CAST(:userId AS bigint)
        RETURNING notification_id AS "notificationId",
                  read_status AS "readStatus",
                  read_at AS "readAt"`,
        { notificationId, userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', '알림을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }
}
