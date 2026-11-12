import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 연계 대상은 국세청 홈택스 고정값 (BEHAVIOR.md 값의 출처)
const LINK_TARGET = 'NTS_HOMETAX';
const DIRECTIONS = ['ISSUE', 'RECEIVE'];
const TAX_TYPES = ['TAXABLE', 'EXEMPT'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function invalid(message: string): ApiError {
  return new ApiError(422, 'TAX_INVOICE_INVALID_INPUT', message);
}

@Controller('api/v1')
export class FnSfr00802Controller {
  @Post('/tax-invoices')
  @HttpCode(200)
  async createTaxInvoice(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);

    const direction = data['direction'];
    if (typeof direction !== 'string' || !DIRECTIONS.includes(direction)) {
      throw invalid('발행/수취 구분을 확인해 주세요.');
    }
    const taxType = data['taxType'];
    if (typeof taxType !== 'string' || !TAX_TYPES.includes(taxType)) {
      throw invalid('과세·면세 구분을 확인해 주세요.');
    }
    const partnerId = data['partnerId'];
    if (typeof partnerId !== 'number' || !Number.isInteger(partnerId)) {
      throw invalid('거래처를 선택해 주세요.');
    }
    const issueDate = data['issueDate'];
    if (typeof issueDate !== 'string' || !DATE_PATTERN.test(issueDate)) {
      throw invalid('작성일자를 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    const supplyAmount = data['supplyAmount'];
    if (typeof supplyAmount !== 'number' || !Number.isFinite(supplyAmount) || supplyAmount < 0) {
      throw invalid('공급가액을 0 이상의 숫자로 입력해 주세요.');
    }
    const taxAmount = data['taxAmount'];
    if (typeof taxAmount !== 'number' || !Number.isFinite(taxAmount) || taxAmount < 0) {
      throw invalid('세액을 0 이상의 숫자로 입력해 주세요.');
    }
    const rawItem = data['itemDescription'];
    if (rawItem !== undefined && rawItem !== null && typeof rawItem !== 'string') {
      throw invalid('품목 형식이 올바르지 않습니다.');
    }
    const itemDescription = typeof rawItem === 'string' && rawItem !== '' ? rawItem : null;
    if (itemDescription !== null && itemDescription.length > 500) {
      throw invalid('품목은 500자 이하로 입력해 주세요.');
    }

    return transaction(async (db) => {
      const partners = await db.query(
        'SELECT partner_id FROM partner WHERE partner_id = CAST(:partnerId AS bigint)',
        { partnerId },
      );
      if (partners.length === 0) {
        throw new ApiError(404, 'PARTNER_NOT_FOUND', '거래처 기준정보가 존재하지 않습니다.');
      }

      const invoices = await db.query(
        `INSERT INTO tax_invoice (
          partner_id, direction, tax_type, issue_date, supply_amount, tax_amount,
          issue_status, journal_status, item_description, created_at, updated_at
        ) VALUES (
          CAST(:partnerId AS bigint), :direction, :taxType, CAST(:issueDate AS date),
          CAST(:supplyAmount AS numeric), CAST(:taxAmount AS numeric),
          'NOT_ISSUED', 'UNPROCESSED', :itemDescription, now(), now()
        )
        RETURNING tax_invoice_id AS "taxInvoiceId", issue_status AS "issueStatus", approval_number AS "approvalNumber"`,
        { partnerId, direction, taxType, issueDate, supplyAmount, taxAmount, itemDescription },
      );

      const logs = await db.query(
        `INSERT INTO link_log (
          requester_id, link_target, status, requested_at, created_at, updated_at
        ) VALUES (
          CAST(:userId AS bigint), :linkTarget, 'REQUESTED', now(), now(), now()
        )
        RETURNING status AS "linkStatus", failure_reason AS "failureReason"`,
        { userId: user.id, linkTarget: LINK_TARGET },
      );

      // TODO: 외부 발행 시스템 호출과 회신 반영은 입력에 호출 방법이 없어 구현하지 못했다.
      return {
        taxInvoiceId: invoices[0].taxInvoiceId,
        issueStatus: invoices[0].issueStatus,
        approvalNumber: invoices[0].approvalNumber,
        linkStatus: logs[0].linkStatus,
        failureReason: logs[0].failureReason,
      };
    });
  }
}
