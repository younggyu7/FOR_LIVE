import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 변환 가능한 파일 형식은 HWP·Word 등 제공 대상 형식으로 한정한다 (목록은 가정).
const SUPPORTED_EXTENSIONS = ['hwp', 'hwpx', 'doc', 'docx', 'rtf', 'odt', 'txt'];

// 가정: file 객체는 { name: 파일 이름, content: 추출된 본문 글자 } 형태로 받는다.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

@Controller('api/v1')
export class FnSfr03002Controller {
  @Post('/approval-forms/convert')
  @HttpCode(200)
  async convertApprovalFormFile(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    const file = data['file'];
    if (file === null || typeof file !== 'object' || Array.isArray(file)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '변환할 파일을 보내 주세요.');
    }
    const fileRow = file as Record<string, unknown>;
    const name = fileRow['name'];
    if (typeof name !== 'string' || name.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '파일 이름이 필요합니다.');
    }
    const dot = name.lastIndexOf('.');
    const extension = dot >= 0 ? name.substring(dot + 1).toLowerCase() : '';
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      throw new ApiError(422, 'UNSUPPORTED_FILE_TYPE', '지원하지 않는 파일 형식입니다. HWP·Word 등 제공 대상 형식의 파일을 올려 주세요.');
    }
    const content = fileRow['content'];
    if (typeof content !== 'string' || content.trim() === '') {
      throw new ApiError(422, 'FORM_CONVERSION_FAILED', '파일을 양식으로 변환하지 못했습니다. 파일 내용을 확인해 주세요.');
    }
    const paragraphs = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .map((line) => '<p>' + escapeHtml(line) + '</p>');
    if (paragraphs.length === 0) {
      throw new ApiError(422, 'FORM_CONVERSION_FAILED', '파일을 양식으로 변환하지 못했습니다. 파일 내용을 확인해 주세요.');
    }
    return {
      formBody: paragraphs.join('\n'),
      converted: true,
    };
  }
}
