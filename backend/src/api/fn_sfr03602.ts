// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-036-02 메시지·파일 실시간 송수신 */
import { Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, NOW, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr03602';

const T_MESSENGER_MESSAGE = new Table('messenger_message', 'messenger_message_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_MESSENGER_MESSAGE_RECIPIENT = new Table('messenger_message_recipient', 'messenger_message_recipient_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_CREATE_MESSENGER_MESSAGE: Col[] = [
  col('messengerMessageId', 'messenger_message.messenger_message_id', 'bigint'),
  col('sentAt', 'messenger_message.sent_at', 'timestamptz'),
];
const IN_CREATE_MESSENGER_MESSAGE: Col[] = [
  col('messengerRoomId', 'messenger_room_id', 'bigint'),
  col('content', 'content', 'text'),
  col('replyToMessageId', 'reply_to_message_id', 'bigint'),
  col('senderId', 'sender_id', 'bigint'),
];
const OUT_FORWARD_MESSENGER_MESSAGE: Col[] = [
  col('messengerMessageId', 'messenger_message.messenger_message_id', 'bigint'),
];
const STAMP_FORWARD_MESSENGER_MESSAGE: Col[] = [
  col('senderId', 'sender_id', 'bigint'),
  col('messageType', 'message_type', 'varchar'),
  col('sentAt', 'sent_at', 'timestamptz'),
];
const OUT_LIST_MESSENGER_MESSAGE_RECIPIENTS: Col[] = [
  col('recipientId', 'messenger_message_recipient.recipient_id', 'bigint'),
  col('readStatus', 'messenger_message_recipient.read_status', 'varchar'),
  col('readAt', 'messenger_message_recipient.read_at', 'timestamptz'),
];
const FILTER_LIST_MESSENGER_MESSAGE_RECIPIENTS: Col[] = [
  col('messengerMessageId', 'messenger_message_recipient.messenger_message_id', 'bigint'),
];
const OUT_READ_MESSENGER_MESSAGE: Col[] = [
  col('readStatus', 'messenger_message_recipient.read_status', 'varchar'),
];

@Controller('api/v1')
export class FnSfr03602Controller {
  /** POST /messenger-messages — 대화방에 메시지·파일 전송 */
  @Post('/messenger-messages')
  @HttpCode(200)
  async createMessengerMessage(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    if (data['senderId'] == null) {
      data['senderId'] = user.id;
    }
    checks.required(data, 'messengerRoomId', 'content');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createMessengerMessage(data, new Ctx(db, user), () => db.insert(T_MESSENGER_MESSAGE, IN_CREATE_MESSENGER_MESSAGE, OUT_CREATE_MESSENGER_MESSAGE, data, { 'message_type': 'CHAT', 'sent_at': NOW })));
  }

  /** POST /messenger-messages/{messengerMessageId}/forward — 메시지를 다른 대화방 또는 사용자에게 전달 */
  @Post('/messenger-messages/:messengerMessageId/forward')
  @HttpCode(200)
  async forwardMessengerMessage(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    data['messengerMessageId'] = req.params['messengerMessageId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.forwardMessengerMessage(data, new Ctx(db, user), () => notImplemented('forwardMessengerMessage')));
  }

  /** GET /messenger-message-recipients — 메시지 수신자별 읽음 상태 조회 */
  @Get('/messenger-message-recipients')
  async listMessengerMessageRecipients(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listMessengerMessageRecipients(data, new Ctx(db, user), () => db.page(T_MESSENGER_MESSAGE_RECIPIENT, OUT_LIST_MESSENGER_MESSAGE_RECIPIENTS, FILTER_LIST_MESSENGER_MESSAGE_RECIPIENTS, data)));
  }

  /** POST /messenger-messages/{messengerMessageId}/read — 메시지 읽음 처리 */
  @Post('/messenger-messages/:messengerMessageId/read')
  @HttpCode(200)
  async readMessengerMessage(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    data['messengerMessageId'] = req.params['messengerMessageId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.readMessengerMessage(data, new Ctx(db, user), () => notImplemented('readMessengerMessage')));
  }
}
