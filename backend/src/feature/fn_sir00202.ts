import { Controller, HttpCode, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: interface_items는 쉼표 또는 줄바꿈으로 구분한 연계 정보 항목 이름 목록이다.
const ITEM_SEPARATOR = /[,\n]/;
const USE_YN_VALUES = ['사용', '미사용'];

interface Failure {
  status: number;
  code: string;
  message: string;
}

interface Outcome {
  failure: Failure | null;
  responseData: Record<string, unknown> | null;
}

@Controller('api/v1')
export class FnSir00202Controller {
  @Post('/interface-standards/invoke')
  @HttpCode(200)
  async invokeStandardInterface(@Req() req: Request) {
    const user = currentUser(req);
    user.require('로그인 사용자');
    const data = checks.inputOf(req.body);
    const identifier = data['requestSystemIdentifier'];
    const requestData = data['requestData'];
    if (typeof identifier !== 'string' || identifier.trim() === '' || identifier.length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', '요청 시스템 식별자를 100자 이내로 입력해 주세요.');
    }
    if (requestData === undefined || requestData === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '요청 데이터를 입력해 주세요.');
    }
    const startedAt = Date.now();
    const outcome: Outcome = await transaction(async (db) => {
      const writeLog = async (clientId: number | null, standardId: number | null, failure: Failure | null) => {
        await db.execute(
          'INSERT INTO api_call_log (api_client_id, interface_standard_id, called_at, request_system_identifier, result_status, http_status_code, error_code, error_message, response_ms, created_at, updated_at) '
            + 'VALUES (CAST(:clientId AS bigint), CAST(:standardId AS bigint), now(), :identifier, :resultStatus, CAST(:httpStatus AS integer), :errorCode, :errorMessage, CAST(:responseMs AS integer), now(), now())',
          {
            clientId,
            standardId,
            identifier,
            resultStatus: failure ? '실패' : '성공',
            httpStatus: failure ? failure.status : 200,
            errorCode: failure ? failure.code : null,
            errorMessage: failure ? failure.message : null,
            responseMs: Date.now() - startedAt,
          },
        );
      };

      const clients = await db.query(
        'SELECT api_client_id AS "apiClientId", use_yn AS "useYn" FROM api_client WHERE client_code = :code',
        { code: identifier },
      );
      if (clients.length === 0) {
        const failure = { status: 404, code: 'API_CLIENT_NOT_FOUND', message: '등록되지 않은 시스템입니다.' };
        await writeLog(null, null, failure);
        return { failure, responseData: null };
      }
      const clientId = Number(clients[0].apiClientId);
      if (clients[0].useYn !== '사용') {
        const failure = { status: 409, code: 'API_CLIENT_DISABLED', message: 'API 사용이 중지된 시스템입니다.' };
        await writeLog(clientId, null, failure);
        return { failure, responseData: null };
      }

      const standards = await db.query(
        'SELECT interface_standard_id AS "interfaceStandardId", interface_items AS "interfaceItems", link_method AS "linkMethod", standard_version AS "standardVersion" '
          + 'FROM interface_standard WHERE api_client_id = CAST(:clientId AS bigint) '
          + 'ORDER BY standard_version DESC, interface_standard_id DESC LIMIT 1',
        { clientId },
      );
      if (standards.length === 0) {
        const failure = { status: 422, code: 'INVALID_REQUEST_FORMAT', message: '이 시스템에 적용할 연계 표준이 없어 처리할 수 없습니다.' };
        await writeLog(clientId, null, failure);
        return { failure, responseData: null };
      }
      const standard = standards[0];
      const standardId = Number(standard.interfaceStandardId);

      const items: string[] = String(standard.interfaceItems)
        .split(ITEM_SEPARATOR)
        .map((item) => item.trim())
        .filter((item) => item !== '');
      const body = requestData as Record<string, unknown>;
      if (typeof requestData !== 'object' || Array.isArray(requestData)) {
        const failure = { status: 422, code: 'INVALID_REQUEST_FORMAT', message: '요청 데이터는 객체 형식이어야 합니다.' };
        await writeLog(clientId, standardId, failure);
        return { failure, responseData: null };
      }
      const missing = items.filter((item) => body[item] === undefined || body[item] === null);
      if (missing.length > 0) {
        const failure = {
          status: 422,
          code: 'INVALID_REQUEST_FORMAT',
          message: '표준 형식에 맞지 않습니다. 누락된 항목: ' + missing.join(', '),
        };
        await writeLog(clientId, standardId, failure);
        return { failure, responseData: null };
      }

      let responseData: Record<string, unknown>;
      try {
        // 응답 내용은 개발 담당자가 정한다(결정): 적용한 표준 정보와 접수한 항목 값을 표준 형식으로 돌려준다.
        const accepted: Record<string, unknown> = {};
        for (const item of items) {
          accepted[item] = body[item];
        }
        responseData = {
          standardVersion: standard.standardVersion,
          linkMethod: standard.linkMethod,
          items: accepted,
        };
      } catch (e) {
        const failure = { status: 502, code: 'INTERFACE_PROCESSING_FAILED', message: '연계 처리 중 오류가 발생했습니다.' };
        await writeLog(clientId, standardId, failure);
        return { failure, responseData: null };
      }
      await writeLog(clientId, standardId, null);
      return { failure: null, responseData };
    });
    if (outcome.failure) {
      throw new ApiError(outcome.failure.status, outcome.failure.code, outcome.failure.message);
    }
    return { responseData: outcome.responseData };
  }

  @Patch('/api-clients/:apiClientId')
  async updateApiClientUsage(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    const idText = req.params['apiClientId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '연계 시스템 ID가 올바르지 않습니다.');
    }
    const useYn = data['useYn'];
    if (typeof useYn !== 'string' || !USE_YN_VALUES.includes(useYn)) {
      throw new ApiError(400, 'VALIDATION_FAILED', 'API 사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        'UPDATE api_client SET use_yn = :useYn, updated_at = now() WHERE api_client_id = CAST(:id AS bigint) '
          + 'RETURNING api_client_id AS "apiClientId", use_yn AS "useYn"',
        { id: idText, useYn },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'API_CLIENT_NOT_FOUND', '연계 시스템을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }
}
