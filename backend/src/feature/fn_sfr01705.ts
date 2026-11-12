import { Controller, Get, Post, Put, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '근태 담당자';
const USE_YN = ['사용', '미사용'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function isIpv4(v: string): boolean {
  const parts = v.split('.');
  if (parts.length !== 4) {
    return false;
  }
  return parts.every((p) => /^[0-9]{1,3}$/.test(p) && Number(p) <= 255);
}

function isIpv6(v: string): boolean {
  if (!/^[0-9a-fA-F:]+$/.test(v)) {
    return false;
  }
  if (v.includes(':::')) {
    return false;
  }
  const halves = v.split('::');
  if (halves.length > 2) {
    return false;
  }
  const groups = v.split(':').filter((g) => g !== '');
  if (!groups.every((g) => g.length <= 4)) {
    return false;
  }
  if (halves.length === 2) {
    return groups.length < 8;
  }
  return groups.length === 8 && !v.startsWith(':') && !v.endsWith(':');
}

function intOf(v: unknown, def: number): number {
  if (v === undefined || v === null || v === '') {
    return def;
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 0 이상의 정수여야 합니다.');
  }
  return n;
}

function pathId(req: Request): string {
  const raw = req.params['allowedIpId'];
  if (typeof raw !== 'string' || !/^[0-9]{1,18}$/.test(raw)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '접근 허용 IP ID 형식이 올바르지 않습니다.');
  }
  return raw;
}

function readBody(data: Record<string, unknown>): { ipAddress: string; description: string | null; useYn: string } {
  const ip = data['ipAddress'];
  if (typeof ip !== 'string' || ip.trim() === '') {
    throw new ApiError(400, 'VALIDATION_FAILED', '허용 IP 주소를 입력해 주세요.');
  }
  const ipAddress = ip.trim();
  if (ipAddress.length > 45) {
    throw new ApiError(400, 'VALIDATION_FAILED', '허용 IP 주소는 45자 이하여야 합니다.');
  }
  const desc = data['description'];
  if (desc !== undefined && desc !== null && typeof desc !== 'string') {
    throw new ApiError(400, 'VALIDATION_FAILED', '설명은 글자여야 합니다.');
  }
  const description = typeof desc === 'string' && desc.trim() !== '' ? desc.trim() : null;
  if (description !== null && description.length > 200) {
    throw new ApiError(400, 'VALIDATION_FAILED', '설명은 200자 이하여야 합니다.');
  }
  const useYn = data['useYn'];
  if (typeof useYn !== 'string' || !USE_YN.includes(useYn)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
  }
  if (!isIpv4(ipAddress) && !isIpv6(ipAddress)) {
    throw new ApiError(422, 'INVALID_IP_FORMAT', 'IP 형식이 올바르지 않습니다.');
  }
  return { ipAddress, description, useYn };
}

@Controller('api/v1')
export class FnSfr01705Controller {
  @Get('/allowed-ips')
  async listAllowedIps(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const useYnRaw = query['useYn'];
    let useYn: string | null = null;
    if (useYnRaw !== undefined && useYnRaw !== null && useYnRaw !== '') {
      if (typeof useYnRaw !== 'string' || !USE_YN.includes(useYnRaw)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
      }
      useYn = useYnRaw;
    }
    const page = intOf(query['page'], 0);
    const size = Math.min(Math.max(intOf(query['size'], DEFAULT_SIZE), 1), MAX_SIZE);
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT allowed_ip_id AS "allowedIpId",
                ip_address AS "ipAddress",
                description AS "description",
                use_yn AS "useYn"
           FROM allowed_ip
          WHERE (CAST(:useYn AS varchar) IS NULL OR use_yn = CAST(:useYn AS varchar))
          ORDER BY allowed_ip_id
          LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        { useYn, size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM allowed_ip
          WHERE (CAST(:useYn AS varchar) IS NULL OR use_yn = CAST(:useYn AS varchar))`,
        { useYn },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/allowed-ips')
  @HttpCode(200)
  async createAllowedIp(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const body = readBody(data);
    return transaction(async (db) => {
      const dup = await db.query(
        'SELECT allowed_ip_id FROM allowed_ip WHERE ip_address = :ipAddress',
        { ipAddress: body.ipAddress },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'ALLOWED_IP_DUPLICATED', '이미 등록된 IP입니다.');
      }
      const rows = await db.query(
        `INSERT INTO allowed_ip (ip_address, description, use_yn, created_at, updated_at)
         VALUES (:ipAddress, :description, :useYn, now(), now())
         RETURNING allowed_ip_id AS "allowedIpId"`,
        { ipAddress: body.ipAddress, description: body.description, useYn: body.useYn },
      );
      const allowedIpId = Number(rows[0]['allowedIpId']);
      const content = `허용 IP 등록: ${body.ipAddress}, 설명: ${body.description ?? '-'}, 사용 여부: ${body.useYn}`;
      await db.execute(
        `INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), 'allowed_ip', CAST(:targetId AS bigint), '등록', now(), :content, now(), now())`,
        { userId: user.id, targetId: allowedIpId, content },
      );
      return { allowedIpId };
    });
  }

  @Put('/allowed-ips/:allowedIpId')
  async updateAllowedIp(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req);
    const data = checks.inputOf(req.body);
    const body = readBody(data);
    return transaction(async (db) => {
      const before = await db.query(
        `SELECT ip_address AS "ipAddress", description AS "description", use_yn AS "useYn"
           FROM allowed_ip WHERE allowed_ip_id = CAST(:id AS bigint)`,
        { id },
      );
      if (before.length === 0) {
        throw new ApiError(404, 'ALLOWED_IP_NOT_FOUND', '접근 허용 IP를 찾을 수 없습니다.');
      }
      const dup = await db.query(
        `SELECT allowed_ip_id FROM allowed_ip
          WHERE ip_address = :ipAddress AND allowed_ip_id <> CAST(:id AS bigint)`,
        { ipAddress: body.ipAddress, id },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'ALLOWED_IP_DUPLICATED', '이미 등록된 IP입니다.');
      }
      await db.execute(
        `UPDATE allowed_ip
            SET ip_address = :ipAddress, description = :description, use_yn = :useYn, updated_at = now()
          WHERE allowed_ip_id = CAST(:id AS bigint)`,
        { ipAddress: body.ipAddress, description: body.description, useYn: body.useYn, id },
      );
      const old = before[0];
      const content = `변경 전: ${old['ipAddress']}, 설명: ${old['description'] ?? '-'}, 사용 여부: ${old['useYn']} → 변경 후: ${body.ipAddress}, 설명: ${body.description ?? '-'}, 사용 여부: ${body.useYn}`;
      await db.execute(
        `INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), 'allowed_ip', CAST(:id AS bigint), '수정', now(), :content, now(), now())`,
        { userId: user.id, id, content },
      );
      return { allowedIpId: Number(id) };
    });
  }

  @Delete('/allowed-ips/:allowedIpId')
  async deleteAllowedIp(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req);
    return transaction(async (db) => {
      const before = await db.query(
        `SELECT ip_address AS "ipAddress", description AS "description", use_yn AS "useYn"
           FROM allowed_ip WHERE allowed_ip_id = CAST(:id AS bigint)`,
        { id },
      );
      if (before.length === 0) {
        throw new ApiError(404, 'ALLOWED_IP_NOT_FOUND', '접근 허용 IP를 찾을 수 없습니다.');
      }
      await db.execute(
        'DELETE FROM allowed_ip WHERE allowed_ip_id = CAST(:id AS bigint)',
        { id },
      );
      const old = before[0];
      const content = `허용 IP 삭제: ${old['ipAddress']}, 설명: ${old['description'] ?? '-'}, 사용 여부: ${old['useYn']}`;
      await db.execute(
        `INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
         VALUES (CAST(:userId AS bigint), 'allowed_ip', CAST(:id AS bigint), '삭제', now(), :content, now(), now())`,
        { userId: user.id, id, content },
      );
      return {};
    });
  }
}
