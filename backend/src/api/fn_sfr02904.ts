// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-029-04 일괄기안·연속결재·재기안 */
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, NOW, Table, autoNo, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr02904';

const T_APPROVAL_DOCUMENT = new Table('approval_document', 'approval_document_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_CREATE_APPROVAL_DOCUMENT: Col[] = [
  col('approvalDocumentId', 'approval_document.approval_document_id', 'bigint'),
  col('documentNo', 'approval_document.document_no', 'varchar'),
  col('approvalStatus', 'approval_document.approval_status', 'varchar'),
];
const IN_CREATE_APPROVAL_DOCUMENT: Col[] = [
  col('approvalFormId', 'approval_form_id', 'bigint'),
  col('title', 'title', 'varchar'),
  col('body', 'body', 'text'),
  col('drafterId', 'drafter_id', 'bigint'),
];
const OUT_REDRAFT_APPROVAL_DOCUMENT: Col[] = [
  col('approvalDocumentId', 'approval_document.approval_document_id', 'bigint'),
  col('documentNo', 'approval_document.document_no', 'varchar'),
  col('approvalStatus', 'approval_document.approval_status', 'varchar'),
];
const STAMP_REDRAFT_APPROVAL_DOCUMENT: Col[] = [
  col('drafterId', 'drafter_id', 'bigint'),
  col('submittedAt', 'submitted_at', 'timestamptz'),
];

@Controller('api/v1')
export class FnSfr02904Controller {
  /** POST /approval-documents — 전자결재 문서를 기안한다 */
  @Post('/approval-documents')
  @HttpCode(200)
  async createApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    if (data['drafterId'] == null) {
      data['drafterId'] = user.id;
    }
    checks.required(data, 'approvalFormId', 'title');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createApprovalDocument(data, new Ctx(db, user), () => db.insert(T_APPROVAL_DOCUMENT, IN_CREATE_APPROVAL_DOCUMENT, OUT_CREATE_APPROVAL_DOCUMENT, data, { 'document_no': autoNo(50), 'approval_status': '기안' })));
  }

  /** POST /approval-documents/batch-draft — 선택한 여러 문서를 각각 별도 결재문서로 일괄 기안한다 */
  @Post('/approval-documents/batch-draft')
  @HttpCode(200)
  async batchDraftApprovalDocuments(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    checks.required(data, 'documents');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.batchDraftApprovalDocuments(data, new Ctx(db, user), () => notImplemented('batchDraftApprovalDocuments')));
  }

  /** POST /approval-documents/{approvalDocumentId}/redraft — 기작성 문서를 기반으로 새 문서로 재기안한다 */
  @Post('/approval-documents/:approvalDocumentId/redraft')
  @HttpCode(200)
  async redraftApprovalDocument(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    data['approvalDocumentId'] = req.params['approvalDocumentId'];
    checks.required(data, 'title');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.redraftApprovalDocument(data, new Ctx(db, user), () => db.move(T_APPROVAL_DOCUMENT, 'approval_status', ['반려', '회수'], '재기안', data['approvalDocumentId'], OUT_REDRAFT_APPROVAL_DOCUMENT, STAMP_REDRAFT_APPROVAL_DOCUMENT, { 'drafterId': user.id, 'submittedAt': NOW })));
  }
}
