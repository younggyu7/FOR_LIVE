import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 문서에 붙이는 첨부의 업무 대상 유형 코드
const TARGET_APPROVAL_DOCUMENT = 'APPROVAL_DOCUMENT';
const TARGET_APPROVAL_FORM = 'APPROVAL_FORM';

@Controller('api/v1')
export class FnSfr02909Controller {
  @Post('/attachments')
  @HttpCode(200)
  async createAttachment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const fileName = typeof data['file'] === 'string' ? data['file'].trim() : '';
    if (fileName === '' || fileName.length > 255) {
      throw new ApiError(400, 'VALIDATION_FAILED', '업로드 파일을 255자 이내로 입력해 주세요.');
    }
    const rawType = data['targetType'];
    if (rawType !== undefined && rawType !== null && rawType !== '' && (typeof rawType !== 'string' || rawType.length > 50)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '업무 대상 유형은 50자 이내 글자여야 합니다.');
    }
    const targetType = typeof rawType === 'string' && rawType !== '' ? rawType : null;
    const rawId = data['targetId'];
    let targetId: string | null = null;
    if (rawId !== undefined && rawId !== null && rawId !== '') {
      if (typeof rawId === 'boolean' || !Number.isInteger(Number(rawId))) {
        throw new ApiError(400, 'VALIDATION_FAILED', '업무 대상 ID는 정수여야 합니다.');
      }
      targetId = String(Number(rawId));
    }
    if (targetType !== null && targetId === null && (targetType === TARGET_APPROVAL_DOCUMENT || targetType === TARGET_APPROVAL_FORM)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '업무 대상 ID를 입력해 주세요.');
    }
    // 가정: 파일 본문은 공통 모듈(ECM)이 저장하므로 여기서는 원본 파일명과 확장자만 기록한다.
    const dot = fileName.lastIndexOf('.');
    const extension = dot >= 0 && dot < fileName.length - 1 ? fileName.slice(dot + 1).toLowerCase().slice(0, 20) : null;
    return transaction(async (db) => {
      if (targetType === TARGET_APPROVAL_DOCUMENT) {
        const found = await db.query(
          'SELECT approval_document_id FROM approval_document WHERE approval_document_id = CAST(:targetId AS bigint)',
          { targetId },
        );
        if (found.length === 0) {
          throw new ApiError(404, 'APPROVAL_DOCUMENT_NOT_FOUND', '첨부할 결재문서를 찾을 수 없습니다.');
        }
      }
      const rows = await db.query(
        'INSERT INTO attachment (uploader_id, file_name, file_extension, target_type, target_id, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :fileName, :extension, :targetType, CAST(:targetId AS bigint), now(), now()) ' +
          'RETURNING attachment_id AS "attachmentId", file_name AS "fileName"',
        { userId: user.id, fileName, extension, targetType, targetId },
      );
      return rows[0];
    });
  }
}
