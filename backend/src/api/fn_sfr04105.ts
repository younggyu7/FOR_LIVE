// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-041-05 웹 오피스 문서 공유 및 권한 설정 */
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr04105';

const T_OFFICE_DOCUMENT = new Table('office_document', 'office_document_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_SHARE_OFFICE_DOCUMENT: Col[] = [];

@Controller('api/v1')
export class FnSfr04105Controller {
  /** POST /office-documents/{officeDocumentId}/share — 문서를 그룹웨어 사용자에게 쪽지 또는 이메일로 공유하고 사용자별 권한을 설정한다 */
  @Post('/office-documents/:officeDocumentId/share')
  @HttpCode(200)
  async shareOfficeDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    data['officeDocumentId'] = req.params['officeDocumentId'];
    checks.required(data, 'shareMethod', 'targets');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.shareOfficeDocument(data, new Ctx(db, user), () => notImplemented('shareOfficeDocument')));
  }
}
