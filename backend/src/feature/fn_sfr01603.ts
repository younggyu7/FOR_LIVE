import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 용도·부수를 보내지 않으면 아래 기본값을 쓴다 (certificate_request.purpose·copies는 NOT NULL).
const DEFAULT_PURPOSE = '미기재';
const DEFAULT_COPIES = 1;
// 가정: 일련번호 자릿수가 비어 있으면 4자리로 채번한다.
const DEFAULT_DIGITS = 4;

function idOf(raw: unknown): string {
  const text = typeof raw === 'string' ? raw : '';
  if (!/^[0-9]+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '신청 번호 형식이 올바르지 않습니다.');
  }
  return text;
}

@Controller('api/v1')
export class FnSfr01603Controller {
  @Post('/certificate-requests')
  @HttpCode(200)
  async createCertificateRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const typeId = data['certificateTypeId'];
    if (typeof typeId !== 'number' || !Number.isInteger(typeId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '증명서 종류를 선택해 주세요.');
    }
    let purpose = DEFAULT_PURPOSE;
    if (data['purpose'] !== undefined && data['purpose'] !== null && data['purpose'] !== '') {
      if (typeof data['purpose'] !== 'string' || data['purpose'].length > 200) {
        throw new ApiError(400, 'VALIDATION_FAILED', '용도는 200자 이하의 글자로 입력해 주세요.');
      }
      purpose = data['purpose'];
    }
    let copies = DEFAULT_COPIES;
    if (data['copies'] !== undefined && data['copies'] !== null && data['copies'] !== '') {
      const value = data['copies'];
      if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '부수는 1 이상의 정수로 입력해 주세요.');
      }
      copies = value;
    }
    return transaction(async (db) => {
      const types = await db.query(
        'SELECT use_yn AS "useYn" FROM certificate_type WHERE certificate_type_id = CAST(:typeId AS bigint)',
        { typeId },
      );
      if (types.length === 0) {
        throw new ApiError(404, 'CERTIFICATE_TYPE_NOT_FOUND', '증명서 종류를 찾을 수 없습니다.');
      }
      if (types[0]['useYn'] !== '사용') {
        throw new ApiError(422, 'CERTIFICATE_TYPE_NOT_IN_USE', '사용 중이지 않은 증명서 양식은 신청할 수 없습니다.');
      }
      const rows = await db.query(
        `INSERT INTO certificate_request
          (certificate_type_id, employee_id, purpose, copies, status, created_at, updated_at)
         VALUES
          (CAST(:typeId AS bigint), CAST(:userId AS bigint), :purpose, CAST(:copies AS integer), '신청', now(), now())
         RETURNING certificate_request_id AS "certificateRequestId", status`,
        { typeId, userId: user.id, purpose, copies },
      );
      return rows[0];
    });
  }

  @Post('/certificate-requests/:certificateRequestId/approve')
  @HttpCode(200)
  async approveCertificateRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const requestId = idOf(req.params['certificateRequestId']);
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT status, certificate_type_id AS "certificateTypeId"
           FROM certificate_request
          WHERE certificate_request_id = CAST(:requestId AS bigint)
            FOR UPDATE`,
        { requestId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'CERTIFICATE_REQUEST_NOT_FOUND', '증명서 신청 건을 찾을 수 없습니다.');
      }
      if (found[0]['status'] !== '신청') {
        throw new ApiError(409, 'CERTIFICATE_REQUEST_ALREADY_PROCESSED', '이미 승인 또는 반려된 신청 건입니다.');
      }
      const typeId = found[0]['certificateTypeId'];
      await db.execute(
        `UPDATE certificate_type
            SET last_sequence = COALESCE(last_sequence, 0) + 1, updated_at = now()
          WHERE certificate_type_id = CAST(:typeId AS bigint)`,
        { typeId },
      );
      const numbers = await db.query(
        `SELECT CONCAT(COALESCE(numbering_prefix, ''), to_char(now(), 'YYYY'),
                       lpad(CAST(last_sequence AS text), COALESCE(numbering_digits, :digits), '0')) AS "issueNumber"
           FROM certificate_type
          WHERE certificate_type_id = CAST(:typeId AS bigint)`,
        { typeId, digits: DEFAULT_DIGITS },
      );
      const issueNumber = numbers[0]['issueNumber'];
      await db.execute(
        `UPDATE certificate_request
            SET status = '승인', issue_number = :issueNumber, updated_at = now()
          WHERE certificate_request_id = CAST(:requestId AS bigint)`,
        { requestId, issueNumber },
      );
      return { status: '승인', issueNumber };
    });
  }

  @Post('/certificate-requests/:certificateRequestId/reject')
  @HttpCode(200)
  async rejectCertificateRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const requestId = idOf(req.params['certificateRequestId']);
    const data = checks.inputOf(req.body);
    const reason = data['rejectReason'];
    if (typeof reason !== 'string' || reason.trim() === '') {
      throw new ApiError(422, 'REJECT_REASON_REQUIRED', '반려 사유를 입력해 주세요.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT status FROM certificate_request
          WHERE certificate_request_id = CAST(:requestId AS bigint)
            FOR UPDATE`,
        { requestId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'CERTIFICATE_REQUEST_NOT_FOUND', '증명서 신청 건을 찾을 수 없습니다.');
      }
      if (found[0]['status'] !== '신청') {
        throw new ApiError(409, 'CERTIFICATE_REQUEST_ALREADY_PROCESSED', '이미 승인 또는 반려된 신청 건입니다.');
      }
      await db.execute(
        `UPDATE certificate_request
            SET status = '반려', reject_reason = :reason, updated_at = now()
          WHERE certificate_request_id = CAST(:requestId AS bigint)`,
        { requestId, reason },
      );
      return { status: '반려' };
    });
  }
}
