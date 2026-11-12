import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const ROOM_NAME_MAX = 200;

function parseId(value: unknown): string | null {
  const text = String(value ?? '').trim();
  if (!/^[0-9]+$/.test(text)) {
    return null;
  }
  return text;
}

function parseRoomName(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '' || value.length > ROOM_NAME_MAX) {
    throw new ApiError(400, 'VALIDATION_FAILED', '대화방 이름은 1자 이상 200자 이하로 입력해 주세요.');
  }
  return value.trim();
}

@Controller('api/v1')
export class FnSfr03601Controller {
  @Get('/messenger-rooms')
  async listMessengerRooms(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const pageText = String(query['page'] ?? '0');
    const sizeText = String(query['size'] ?? DEFAULT_SIZE);
    if (!/^[0-9]+$/.test(pageText) || !/^[0-9]+$/.test(sizeText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 숫자로 입력해 주세요.');
    }
    const page = Number(pageText);
    const size = Math.min(Math.max(Number(sizeText), 1), MAX_SIZE);
    return transaction(async (db) => {
      const params = { userId: user.id, limit: size, offset: page * size };
      const items = await db.query(
        `SELECT r.messenger_room_id AS "messengerRoomId",
                r.room_name AS "roomName",
                r.creator_id AS "creatorId"
           FROM messenger_room r
          WHERE EXISTS (
                SELECT 1 FROM messenger_room_member m
                 WHERE m.messenger_room_id = r.messenger_room_id
                   AND m.employee_id = CAST(:userId AS bigint))
          ORDER BY r.messenger_room_id DESC
          LIMIT :limit OFFSET :offset`,
        params,
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM messenger_room r
          WHERE EXISTS (
                SELECT 1 FROM messenger_room_member m
                 WHERE m.messenger_room_id = r.messenger_room_id
                   AND m.employee_id = CAST(:userId AS bigint))`,
        { userId: user.id },
      );
      return { items, page, size, total: Number(counted[0].total) };
    });
  }

  @Post('/messenger-rooms')
  @HttpCode(200)
  async createMessengerRoom(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const roomName = parseRoomName(data['roomName']);
    const rawIds = data['memberIds'];
    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '참여 임직원을 한 명 이상 선택해 주세요.');
    }
    const memberIds: string[] = [];
    for (const raw of rawIds) {
      const id = parseId(raw);
      if (id === null) {
        throw new ApiError(400, 'VALIDATION_FAILED', '참여 임직원 ID가 올바르지 않습니다.');
      }
      if (!memberIds.includes(id)) {
        memberIds.push(id);
      }
    }
    // 생성자도 참여자로 포함한다 (가정)
    if (!memberIds.includes(String(user.id))) {
      memberIds.push(String(user.id));
    }
    return transaction(async (db) => {
      for (const id of memberIds) {
        const found = await db.query(
          `SELECT employee_id FROM employee WHERE employee_id = CAST(:id AS bigint)`,
          { id },
        );
        if (found.length === 0) {
          throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '선택한 참여자를 임직원 목록에서 찾을 수 없습니다.');
        }
      }
      const rooms = await db.query(
        `INSERT INTO messenger_room (creator_id, room_name, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), :roomName, now(), now())
         RETURNING messenger_room_id AS "messengerRoomId", room_name AS "roomName"`,
        { userId: user.id, roomName },
      );
      const room = rooms[0];
      for (const id of memberIds) {
        await db.execute(
          `INSERT INTO messenger_room_member (messenger_room_id, employee_id, created_at, updated_at)
           VALUES (CAST(:roomId AS bigint), CAST(:id AS bigint), now(), now())`,
          { roomId: String(room.messengerRoomId), id },
        );
      }
      return room;
    });
  }

  @Patch('/messenger-rooms/:messengerRoomId')
  async updateMessengerRoom(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const roomId = parseId(req.params['messengerRoomId']);
    if (roomId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '대화방 ID가 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const roomName = parseRoomName(data['roomName']);
    return transaction(async (db) => {
      const rooms = await db.query(
        `SELECT creator_id AS "creatorId" FROM messenger_room WHERE messenger_room_id = CAST(:roomId AS bigint)`,
        { roomId },
      );
      if (rooms.length === 0) {
        throw new ApiError(404, 'MESSENGER_ROOM_NOT_FOUND', '대화방을 찾을 수 없습니다.');
      }
      if (String(rooms[0].creatorId) !== String(user.id)) {
        throw new ApiError(422, 'ROOM_MANAGE_NOT_ALLOWED', '대화방 생성자만 대화방을 변경할 수 있습니다.');
      }
      const updated = await db.query(
        `UPDATE messenger_room
            SET room_name = :roomName, updated_at = now()
          WHERE messenger_room_id = CAST(:roomId AS bigint)
          RETURNING messenger_room_id AS "messengerRoomId", room_name AS "roomName"`,
        { roomId, roomName },
      );
      return updated[0];
    });
  }

  @Delete('/messenger-rooms/:messengerRoomId')
  async deleteMessengerRoom(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const roomId = parseId(req.params['messengerRoomId']);
    if (roomId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '대화방 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rooms = await db.query(
        `SELECT creator_id AS "creatorId" FROM messenger_room WHERE messenger_room_id = CAST(:roomId AS bigint)`,
        { roomId },
      );
      if (rooms.length === 0) {
        throw new ApiError(404, 'MESSENGER_ROOM_NOT_FOUND', '대화방을 찾을 수 없습니다.');
      }
      if (String(rooms[0].creatorId) !== String(user.id)) {
        throw new ApiError(422, 'ROOM_MANAGE_NOT_ALLOWED', '대화방 생성자만 대화방을 삭제할 수 있습니다.');
      }
      await db.execute(
        `DELETE FROM messenger_room_member WHERE messenger_room_id = CAST(:roomId AS bigint)`,
        { roomId },
      );
      await db.execute(
        `DELETE FROM messenger_room WHERE messenger_room_id = CAST(:roomId AS bigint)`,
        { roomId },
      );
      return {};
    });
  }
}
