import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 미리보기를 제공하는 형식: HWP, Word, Excel, PPT (AC-FN-SFR-026-05-4)
const PREVIEW_EXTENSIONS = ['hwp', 'hwpx', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

// 가정: ECM 저장소에서 파일을 읽어 변환하는 모듈이 입력에 없어 변환 결과를 얻지 못한다.
// 변환기가 연결되면 이 함수만 바꾼다. 결과가 없으면 변환 실패로 본다.
async function convertPreview(ecmRef: string, extension: string): Promise<string | null> {
  return null;
}

@Controller('api/v1')
export class FnSfr02605Controller {
  @Get('/attachments/:attachmentId/preview')
  async getAttachmentPreview(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const rawId = req.params['attachmentId'];
    if (!/^[0-9]+$/.test(rawId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '첨부파일 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        `SELECT attachment_id AS "attachmentId",
                file_name AS "fileName",
                file_extension AS "fileExtension",
                ecm_ref AS "ecmRef"
           FROM attachment
          WHERE attachment_id = CAST(:attachmentId AS bigint)`,
        { attachmentId: rawId },
      );
      if (rows.length === 0 || !rows[0].ecmRef) {
        throw new ApiError(404, 'ATTACHMENT_NOT_FOUND', '첨부파일을 찾을 수 없습니다.');
      }
      const row = rows[0];
      const extension = String(row.fileExtension ?? '').replace('.', '').toLowerCase();
      if (!PREVIEW_EXTENSIONS.includes(extension)) {
        throw new ApiError(422, 'PREVIEW_NOT_SUPPORTED', '미리보기를 지원하지 않는 형식입니다.');
      }
      const previewContent = await convertPreview(String(row.ecmRef), extension);
      if (previewContent === null) {
        throw new ApiError(422, 'PREVIEW_NOT_SUPPORTED', '미리보기로 변환하지 못했습니다.');
      }
      return {
        attachmentId: row.attachmentId,
        fileName: row.fileName,
        fileExtension: row.fileExtension,
        previewContent,
      };
    });
  }
}
