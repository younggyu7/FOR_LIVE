import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 내부 연계 대상 시스템은 Tcon과 WTA 사이버연수원으로 한정한다.
const ALLOWED_TARGETS = ['Tcon', 'WTA 사이버연수원'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function text(v: unknown): string {
  if (v === null || v === undefined) {
    return '';
  }
  return String(v).trim();
}

function isId(v: string): boolean {
  return /^[0-9]+$/.test(v);
}

@Controller('api/v1')
export class FnSir00201Controller {
  @Post('/interface-standards')
  @HttpCode(200)
  async createInterfaceStandard(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    const apiClientId = text(data['apiClientId']);
    const interfaceItems = text(data['interfaceItems']);
    const linkMethod = text(data['linkMethod']);
    const standardVersion = text(data['standardVersion']);
    const missing: string[] = [];
    if (apiClientId === '') {
      missing.push('연계 대상 시스템');
    }
    if (interfaceItems === '') {
      missing.push('연계 정보 항목');
    }
    if (linkMethod === '') {
      missing.push('연계 방식');
    }
    if (standardVersion === '') {
      missing.push('표준 버전');
    }
    if (missing.length > 0) {
      throw new ApiError(422, 'INTERFACE_STANDARD_REQUIRED_MISSING', '필수 정의 항목이 누락되었습니다: ' + missing.join(', '));
    }
    if (!isId(apiClientId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연계 대상 시스템 ID는 숫자여야 합니다.');
    }
    if (linkMethod.length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연계 방식은 100자 이하로 입력해 주세요.');
    }
    if (standardVersion.length > 20) {
      throw new ApiError(400, 'VALIDATION_FAILED', '표준 버전은 20자 이하로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const clients = await db.query(
        'SELECT name AS "name" FROM api_client WHERE api_client_id = CAST(:apiClientId AS bigint)',
        { apiClientId },
      );
      if (clients.length === 0) {
        throw new ApiError(404, 'API_CLIENT_NOT_FOUND', '연계 대상 시스템이 등록되어 있지 않습니다.');
      }
      if (!ALLOWED_TARGETS.includes(String(clients[0]['name']))) {
        throw new ApiError(422, 'INTERFACE_TARGET_OUT_OF_SCOPE', '연계 대상은 Tcon 또는 WTA 사이버연수원이어야 합니다.');
      }
      const dup = await db.query(
        'SELECT interface_standard_id AS "id" FROM interface_standard WHERE api_client_id = CAST(:apiClientId AS bigint) AND standard_version = :standardVersion AND link_method = :linkMethod',
        { apiClientId, standardVersion, linkMethod },
      );
      if (dup.length > 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '같은 시스템·버전·연계 방식의 표준이 이미 등록되어 있습니다.');
      }
      const rows = await db.query(
        'INSERT INTO interface_standard (api_client_id, interface_items, link_method, standard_version, created_at, updated_at) ' +
          'VALUES (CAST(:apiClientId AS bigint), :interfaceItems, :linkMethod, :standardVersion, now(), now()) ' +
          'RETURNING interface_standard_id AS "interfaceStandardId", api_client_id AS "apiClientId", standard_version AS "standardVersion"',
        { apiClientId, interfaceItems, linkMethod, standardVersion },
      );
      // 가정: 등록이 끝나면 registered는 항상 true
      return { ...rows[0], registered: true };
    });
  }

  @Get('/interface-standards')
  async listInterfaceStandards(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const query = checks.queryOf(req.query);
    const apiClientIdText = text(query['apiClientId']);
    if (apiClientIdText !== '' && !isId(apiClientIdText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연계 시스템 ID는 숫자여야 합니다.');
    }
    const pageText = text(query['page']);
    const sizeText = text(query['size']);
    if ((pageText !== '' && !isId(pageText)) || (sizeText !== '' && !isId(sizeText))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 숫자여야 합니다.');
    }
    const page = pageText === '' ? 0 : Number(pageText);
    let size = sizeText === '' ? DEFAULT_SIZE : Number(sizeText);
    if (size < 1) {
      size = DEFAULT_SIZE;
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    const apiClientId = apiClientIdText === '' ? null : apiClientIdText;
    return transaction(async (db) => {
      const where = 'WHERE (CAST(:apiClientId AS bigint) IS NULL OR api_client_id = CAST(:apiClientId AS bigint))';
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM interface_standard ' + where,
        { apiClientId },
      );
      const items = await db.query(
        'SELECT interface_standard_id AS "interfaceStandardId", api_client_id AS "apiClientId", interface_items AS "interfaceItems", link_method AS "linkMethod", standard_version AS "standardVersion" ' +
          'FROM interface_standard ' + where + ' ORDER BY interface_standard_id DESC LIMIT :size OFFSET :offset',
        { apiClientId, size, offset: page * size },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }
}
