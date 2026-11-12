import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 목록 size 기본 20, 최대 200
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const USE_YN_VALUES = ['사용', '미사용'];
// 가정: 등록 시 사용 여부를 주지 않으면 '사용'
const DEFAULT_USE_YN = '사용';
// 가정: 승인 필요 여부 고정값 false (BEHAVIOR.md 값의 출처)
const DEFAULT_APPROVAL_REQUIRED = false;

function text(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, 'VALIDATION_FAILED', '문자열로 입력해 주세요.');
  }
  return value;
}

function checkUseYn(value: string | null): void {
  if (value !== null && !USE_YN_VALUES.includes(value)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
  }
}

function checkName(value: string | null): void {
  if (value !== null && value.length > 100) {
    throw new ApiError(400, 'VALIDATION_FAILED', '증명서 종류명은 100자 이하로 입력해 주세요.');
  }
}

@Controller('api/v1')
export class FnSfr01601Controller {
  @Get('/certificate-types')
  async listCertificateTypes(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const query = checks.queryOf(req.query);
    const useYn = text(query['useYn']);
    checkUseYn(useYn === '' ? null : useYn);
    const pageRaw = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호 또는 크기가 올바르지 않습니다.');
    }
    const page = pageRaw;
    const size = Math.min(sizeRaw, MAX_SIZE);
    return transaction(async (db) => {
      const params = {
        useYn: useYn === '' ? null : useYn,
        limit: size,
        offset: page * size,
      };
      const items = await db.query(
        `SELECT certificate_type_id AS "certificateTypeId",
                name AS "name",
                use_yn AS "useYn"
           FROM certificate_type
          WHERE (CAST(:useYn AS text) IS NULL OR use_yn = CAST(:useYn AS text))
          ORDER BY certificate_type_id DESC
          LIMIT :limit OFFSET :offset`,
        params,
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM certificate_type
          WHERE (CAST(:useYn AS text) IS NULL OR use_yn = CAST(:useYn AS text))`,
        { useYn: params.useYn },
      );
      return { items, page, size, total: Number(counts[0].total) };
    });
  }

  @Post('/certificate-types')
  @HttpCode(200)
  async createCertificateType(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    const name = text(data['name']);
    const formBody = text(data['formBody']);
    const useYnIn = text(data['useYn']);
    if (name === null || name.trim() === '' || formBody === null || formBody.trim() === '') {
      throw new ApiError(422, 'CERTIFICATE_TYPE_REQUIRED_MISSING', '증명서 종류명과 양식 본문을 입력해 주세요.');
    }
    checkName(name);
    const useYn = useYnIn === null || useYnIn === '' ? DEFAULT_USE_YN : useYnIn;
    checkUseYn(useYn);
    return transaction(async (db) => {
      const dup = await db.query(
        'SELECT certificate_type_id FROM certificate_type WHERE name = :name',
        { name },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'CERTIFICATE_TYPE_NAME_DUPLICATE', '이미 같은 이름의 증명서 양식이 있습니다.');
      }
      const rows = await db.query(
        `INSERT INTO certificate_type (name, form_body, use_yn, approval_required, created_at, updated_at)
         VALUES (:name, :formBody, :useYn, :approvalRequired, now(), now())
         RETURNING certificate_type_id AS "certificateTypeId"`,
        { name, formBody, useYn, approvalRequired: DEFAULT_APPROVAL_REQUIRED },
      );
      return { certificateTypeId: Number(rows[0].certificateTypeId) };
    });
  }

  @Patch('/certificate-types/:certificateTypeId')
  async updateCertificateType(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const idText = req.params['certificateTypeId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '증명서 종류 ID가 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const name = text(data['name']);
    const formBody = text(data['formBody']);
    const useYn = text(data['useYn']);
    if ((name !== null && name.trim() === '') || (formBody !== null && formBody.trim() === '')) {
      throw new ApiError(422, 'CERTIFICATE_TYPE_REQUIRED_MISSING', '증명서 종류명과 양식 본문은 비워 둘 수 없습니다.');
    }
    checkName(name);
    checkUseYn(useYn);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT certificate_type_id FROM certificate_type WHERE certificate_type_id = CAST(:id AS bigint)',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'CERTIFICATE_TYPE_NOT_FOUND', '증명서 양식을 찾을 수 없습니다.');
      }
      if (name !== null) {
        const dup = await db.query(
          'SELECT certificate_type_id FROM certificate_type WHERE name = :name AND certificate_type_id <> CAST(:id AS bigint)',
          { name, id: idText },
        );
        if (dup.length > 0) {
          throw new ApiError(409, 'CERTIFICATE_TYPE_NAME_DUPLICATE', '이미 같은 이름의 증명서 양식이 있습니다.');
        }
      }
      // 이미 발급된 증명서는 이 테이블을 수정해도 바뀌지 않는다 (발급 건은 별도 행)
      await db.execute(
        `UPDATE certificate_type
            SET name = COALESCE(:name, name),
                form_body = COALESCE(:formBody, form_body),
                use_yn = COALESCE(:useYn, use_yn),
                updated_at = now()
          WHERE certificate_type_id = CAST(:id AS bigint)`,
        { name, formBody, useYn, id: idText },
      );
      return { certificateTypeId: Number(idText) };
    });
  }
}
