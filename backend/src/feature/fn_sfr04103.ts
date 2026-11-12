import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 지원 확장자는 한글(HWP, HWPX)과 Word(DOC, DOCX)이다.
const SUPPORTED_EXTENSIONS = ['hwp', 'hwpx', 'doc', 'docx'];
// 가정: 문서 제목 길이는 300이다 (office_document.title).
const MAX_TITLE_LENGTH = 300;
// 가정: 변환 결과 고정값
const RESULT_SUCCESS = '성공';

@Controller('api/v1')
export class FnSfr04103Controller {
  @Post('/office-documents/convert')
  @HttpCode(200)
  async convertOfficeDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const file = data['file'];
    if (typeof file !== 'string' || file.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '변환할 파일을 입력해 주세요.');
    }
    const fileName = file.trim();
    const dot = fileName.lastIndexOf('.');
    const extension = dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : '';
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      throw new ApiError(422, 'UNSUPPORTED_FILE_TYPE', '지원하지 않는 파일 형식입니다. 한글(HWP)과 Word 파일만 변환할 수 있습니다.');
    }
    // 가정: 제목은 업로드 파일명에서 확장자를 뺀 값이다.
    const title = fileName.slice(0, dot).trim();
    if (title === '' || title.length > MAX_TITLE_LENGTH) {
      throw new ApiError(400, 'VALIDATION_FAILED', '파일 이름은 1자 이상 300자 이하여야 합니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `INSERT INTO office_document (title, author_id, created_at, updated_at)
         VALUES (:title, CAST(:userId AS bigint), now(), now())
         RETURNING office_document_id AS "officeDocumentId", title, body`,
        { title, userId: user.id },
      );
      const row = rows[0];
      return {
        officeDocumentId: row.officeDocumentId,
        title: row.title,
        body: row.body,
        result: RESULT_SUCCESS,
      };
    });
  }
}
