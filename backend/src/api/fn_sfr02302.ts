// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-023-02 국세청 원천세 전자파일 신고 */
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr02302';

const T_TAX_FILING = new Table('tax_filing', 'tax_filing_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_SUBMIT_TAX_FILING: Col[] = [
  col('taxFilingId', 'tax_filing.tax_filing_id', 'bigint'),
  col('filingStatus', 'tax_filing.filing_status', 'varchar'),
  col('filedAt', 'tax_filing.filed_at', 'timestamptz'),
  col('resultMessage', 'tax_filing.result_message', 'varchar'),
  col('receiptNumber', 'tax_filing.receipt_number', 'varchar'),
];
const STAMP_SUBMIT_TAX_FILING: Col[] = [
  col('filingStatus', 'filing_status', 'varchar'),
  col('filedAt', 'filed_at', 'timestamptz'),
];

@Controller('api/v1')
export class FnSfr02302Controller {
  /** POST /tax-filings/{taxFilingId}/submit — 신고서를 국세청 전자파일로 생성해 신고하고 접수 결과를 저장한다 */
  @Post('/tax-filings/:taxFilingId/submit')
  @HttpCode(200)
  async submitTaxFiling(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    data['taxFilingId'] = req.params['taxFilingId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.submitTaxFiling(data, new Ctx(db, user), () => notImplemented('submitTaxFiling')));
  }
}
