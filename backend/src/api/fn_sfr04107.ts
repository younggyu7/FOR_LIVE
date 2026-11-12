// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-041-07 웹 오피스 ECM 연계 통합 관리 */
import { Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr04107';

const T_OFFICE_DOCUMENT = new Table('office_document', 'office_document_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LINK_OFFICE_DOCUMENT_TO_ECM: Col[] = [
  col('ecmDocumentId', 'office_document.ecm_document_id', 'varchar'),
];
const OUT_LIST_ECM_DOCUMENTS: Col[] = [
  col('officeDocumentId', 'office_document.office_document_id', 'bigint'),
  col('title', 'office_document.title', 'varchar'),
  col('ecmDocumentId', 'office_document.ecm_document_id', 'varchar'),
  col('authorId', 'office_document.author_id', 'bigint'),
];
const FILTER_LIST_ECM_DOCUMENTS: Col[] = [];

@Controller('api/v1')
export class FnSfr04107Controller {
  /** POST /office-documents/{officeDocumentId}/link-ecm — 웹 오피스 문서를 기존 ECM에 연계 저장한다 */
  @Post('/office-documents/:officeDocumentId/link-ecm')
  @HttpCode(200)
  async linkOfficeDocumentToEcm(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    data['officeDocumentId'] = req.params['officeDocumentId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.linkOfficeDocumentToEcm(data, new Ctx(db, user), () => notImplemented('linkOfficeDocumentToEcm')));
  }

  /** GET /ecm-documents — ECM의 작성·공유·공유받은 문서 목록을 조회한다 */
  @Get('/ecm-documents')
  async listEcmDocuments(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.queryOf(req.query);
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listEcmDocuments(data, new Ctx(db, user), () => db.page(T_OFFICE_DOCUMENT, OUT_LIST_ECM_DOCUMENTS, FILTER_LIST_ECM_DOCUMENTS, data)));
  }
}
