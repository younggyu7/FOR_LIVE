// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-008-01 전표 입력·관리 */
import { Controller, Get, HttpCode, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr00801';

const T_JOURNAL_ENTRY = new Table('journal_entry', 'journal_entry_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_GET_JOURNAL_ENTRY: Col[] = [
  col('journalEntryId', 'journal_entry.journal_entry_id', 'bigint'),
  col('entryDate', 'journal_entry.entry_date', 'date'),
  col('status', 'journal_entry.status', 'varchar'),
  col('totalDebitAmount', 'journal_entry.total_debit_amount', 'numeric'),
  col('totalCreditAmount', 'journal_entry.total_credit_amount', 'numeric'),
  col('summary', 'journal_entry.summary', 'varchar'),
  col('evidenceDetail', 'journal_entry.evidence_detail', 'varchar'),
];
const OUT_UPDATE_JOURNAL_ENTRY: Col[] = [
  col('journalEntryId', 'journal_entry.journal_entry_id', 'bigint'),
  col('status', 'journal_entry.status', 'varchar'),
];
const IN_UPDATE_JOURNAL_ENTRY: Col[] = [
  col('summary', 'summary', 'varchar'),
  col('evidenceDetail', 'evidence_detail', 'varchar'),
];
const OUT_CANCEL_JOURNAL_ENTRY_APPROVAL: Col[] = [
  col('journalEntryId', 'journal_entry.journal_entry_id', 'bigint'),
  col('status', 'journal_entry.status', 'varchar'),
];
const OUT_UPDATE_JOURNAL_ENTRY_EVIDENCE_DETAILS: Col[] = [];
const OUT_PRINT_JOURNAL_ENTRY: Col[] = [
  col('journalEntryId', 'journal_entry.journal_entry_id', 'bigint'),
  col('entryDate', 'journal_entry.entry_date', 'date'),
];

@Controller('api/v1')
export class FnSfr00801Controller {
  /** GET /journal-entries/{journalEntryId} — 전표와 분개 내역을 조회한다 */
  @Get('/journal-entries/:journalEntryId')
  async getJournalEntry(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.queryOf(req.query);
    data['journalEntryId'] = req.params['journalEntryId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.getJournalEntry(data, new Ctx(db, user), () => db.one(T_JOURNAL_ENTRY, OUT_GET_JOURNAL_ENTRY, data['journalEntryId'])));
  }

  /** PATCH /journal-entries/{journalEntryId} — 전표의 관리항목·적요·증빙내역을 수정한다 */
  @Patch('/journal-entries/:journalEntryId')
  async updateJournalEntry(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    data['journalEntryId'] = req.params['journalEntryId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.updateJournalEntry(data, new Ctx(db, user), () => db.update(T_JOURNAL_ENTRY, IN_UPDATE_JOURNAL_ENTRY, OUT_UPDATE_JOURNAL_ENTRY, data['journalEntryId'], data)));
  }

  /** POST /journal-entries/{journalEntryId}/cancel-approval — 승인된 전표의 승인을 해제한다 */
  @Post('/journal-entries/:journalEntryId/cancel-approval')
  @HttpCode(200)
  async cancelJournalEntryApproval(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    data['journalEntryId'] = req.params['journalEntryId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.cancelJournalEntryApproval(data, new Ctx(db, user), () => db.set(T_JOURNAL_ENTRY, 'status', '마감 취소', data['journalEntryId'], OUT_CANCEL_JOURNAL_ENTRY_APPROVAL)));
  }

  /** PATCH /journal-entries/evidence-details — 선택한 전표들의 증빙내역을 일괄 변경한다 */
  @Patch('/journal-entries/evidence-details')
  async updateJournalEntryEvidenceDetails(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    checks.required(data, 'evidenceDetail');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.updateJournalEntryEvidenceDetails(data, new Ctx(db, user), () => notImplemented('updateJournalEntryEvidenceDetails')));
  }

  /** GET /journal-entries/{journalEntryId}/print — 전표 출력물을 조회한다 */
  @Get('/journal-entries/:journalEntryId/print')
  async printJournalEntry(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.queryOf(req.query);
    data['journalEntryId'] = req.params['journalEntryId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.printJournalEntry(data, new Ctx(db, user), () => db.one(T_JOURNAL_ENTRY, OUT_PRINT_JOURNAL_ENTRY, data['journalEntryId'])));
  }
}
