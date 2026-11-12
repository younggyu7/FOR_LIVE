// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-031-05 첨부파일 관리 */
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr03105';

const T_ATTACHMENT = new Table('attachment', 'attachment_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LIST_ATTACHMENTS: Col[] = [
  col('attachmentId', 'attachment.attachment_id', 'bigint'),
  col('fileName', 'attachment.file_name', 'varchar'),
  col('fileExtension', 'attachment.file_extension', 'varchar'),
  col('fileSize', 'attachment.file_size', 'bigint'),
];
const FILTER_LIST_ATTACHMENTS: Col[] = [
  col('targetType', 'attachment.target_type', 'varchar'),
  col('targetId', 'attachment.target_id', 'bigint'),
];
const OUT_DOWNLOAD_ATTACHMENT: Col[] = [];

@Controller('api/v1')
export class FnSfr03105Controller {
  /** GET /attachments — 문서의 첨부파일 목록 조회 */
  @Get('/attachments')
  async listAttachments(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listAttachments(data, new Ctx(db, user), () => db.page(T_ATTACHMENT, OUT_LIST_ATTACHMENTS, FILTER_LIST_ATTACHMENTS, data)));
  }

  /** GET /attachments/{attachmentId}/download — 권한이 있는 경우 첨부파일 다운로드 */
  @Get('/attachments/:attachmentId/download')
  async downloadAttachment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.queryOf(req.query);
    data['attachmentId'] = req.params['attachmentId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.downloadAttachment(data, new Ctx(db, user), () => db.one(T_ATTACHMENT, OUT_DOWNLOAD_ATTACHMENT, data['attachmentId'])));
  }
}
