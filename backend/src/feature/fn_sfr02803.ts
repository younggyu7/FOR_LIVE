import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

@Controller('api/v1')
export class FnSfr02803Controller {
  @Get('/notifications/:notificationId')
  async getNotification(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const notificationId = req.params['notificationId'];
    if (typeof notificationId !== 'string' || !/^\d+$/.test(notificationId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '알림 번호가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      // 본인에게 수신된 알림만 읽음으로 바꾸고 바로 읽어 온다
      const rows = await db.query(
        `UPDATE notification
            SET read_status = '읽음',
                read_at = COALESCE(read_at, now()),
                updated_at = now()
          WHERE notification_id = CAST(:notificationId AS bigint)
            AND recipient_id = CAST(:userId AS bigint)
        RETURNING notification_id AS "notificationId",
                  title AS "title",
                  content AS "content",
                  read_status AS "readStatus",
                  read_at AS "readAt",
                  event_type AS "eventType",
                  target_type AS "targetType",
                  target_id AS "targetId",
                  created_at AS "createdAt"`,
        { notificationId, userId: user.id },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', '알림을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }
}
