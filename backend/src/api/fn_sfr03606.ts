// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-036-06 그룹웨어 모듈 이벤트 실시간 알림 및 바로가기 */
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr03606';

const T_NOTIFICATION = new Table('notification', 'notification_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_CREATE_NOTIFICATION: Col[] = [
  col('notificationId', 'notification.notification_id', 'bigint'),
];
const IN_CREATE_NOTIFICATION: Col[] = [
  col('recipientId', 'recipient_id', 'bigint'),
  col('title', 'title', 'varchar'),
  col('eventType', 'event_type', 'varchar'),
  col('targetType', 'target_type', 'varchar'),
  col('targetId', 'target_id', 'bigint'),
  col('channel', 'channel', 'varchar'),
];

@Controller('api/v1')
export class FnSfr03606Controller {
  /** POST /notifications — 그룹웨어 모듈 이벤트 알림 생성 */
  @Post('/notifications')
  @HttpCode(200)
  async createNotification(@Req() req: Request) {
    const user = currentUser(req);
    user.requireLogin();
    const data = checks.inputOf(req.body);
    checks.required(data, 'recipientId', 'title', 'eventType', 'targetType', 'targetId', 'channel');
    checks.oneOf(data, 'channel', '포털', '메신저', '모바일', '대화방', '메일');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createNotification(data, new Ctx(db, user), () => db.insert(T_NOTIFICATION, IN_CREATE_NOTIFICATION, OUT_CREATE_NOTIFICATION, data, { 'read_status': '안읽음' })));
  }
}
