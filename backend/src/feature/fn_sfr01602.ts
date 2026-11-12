import { Controller, Get, HttpCode, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const RESET_CYCLES = ['연', '없음'];

@Controller('api/v1')
export class FnSfr01602Controller {
  @Get('/certificate-types/numbering')
  async listCertificateNumberings(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const query = checks.queryOf(req.query);
    const pageNo = Number(query['page'] ?? 0);
    const sizeNo = Number(query['size'] ?? 20);
    if (!Number.isInteger(pageNo) || pageNo < 0 || !Number.isInteger(sizeNo) || sizeNo < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const page = pageNo;
    const size = Math.min(sizeNo, 200);
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT certificate_type_id AS "certificateTypeId",
                name AS "name",
                numbering_prefix AS "numberingPrefix",
                numbering_digits AS "numberingDigits",
                numbering_reset_cycle AS "numberingResetCycle",
                last_sequence AS "lastSequence"
           FROM certificate_type
          ORDER BY certificate_type_id
          LIMIT :size OFFSET :offset`,
        { size, offset: page * size },
      );
      const counts = await db.query('SELECT COUNT(*) AS "total" FROM certificate_type', {});
      return { items, page, size, total: Number(counts[0].total) };
    });
  }

  @Put('/certificate-types/:certificateTypeId/numbering')
  @HttpCode(200)
  async updateCertificateNumbering(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    const idText = req.params['certificateTypeId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(404, 'CERTIFICATE_TYPE_NOT_FOUND', '증명서 종류를 찾을 수 없습니다.');
    }
    const prefix = data['numberingPrefix'];
    const digits = data['numberingDigits'];
    const cycle = data['numberingResetCycle'];
    const invalid = () => new ApiError(422, 'INVALID_NUMBERING_RULE', '채번 규칙이 누락되었거나 형식에 맞지 않습니다.');
    if (typeof prefix !== 'string' || prefix.trim() === '' || prefix.length > 20) {
      throw invalid();
    }
    const digitsOk =
      (typeof digits === 'number' && Number.isInteger(digits) && digits > 0) ||
      (typeof digits === 'string' && /^[0-9]+$/.test(digits) && Number(digits) > 0);
    if (!digitsOk || Number(digits) > 2147483647) {
      throw invalid();
    }
    if (typeof cycle !== 'string' || !RESET_CYCLES.includes(cycle)) {
      throw invalid();
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT certificate_type_id FROM certificate_type WHERE certificate_type_id = CAST(:id AS bigint)',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'CERTIFICATE_TYPE_NOT_FOUND', '증명서 종류를 찾을 수 없습니다.');
      }
      const rows = await db.query(
        `UPDATE certificate_type
            SET numbering_prefix = :prefix,
                numbering_digits = CAST(:digits AS integer),
                numbering_reset_cycle = :cycle,
                updated_at = now()
          WHERE certificate_type_id = CAST(:id AS bigint)
          RETURNING certificate_type_id AS "certificateTypeId"`,
        { id: idText, prefix: prefix.trim(), digits: String(digits), cycle },
      );
      return rows[0];
    });
  }
}
