import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const USE_STATUS = ['사용', '미사용'];
// 가정: 암호화는 운영 DB 설정에서 한다. 이 코드는 계좌번호 컬럼 값을 그대로 읽고 쓴다.

function isId(v: unknown): boolean {
  return /^\d+$/.test(String(v ?? ''));
}

function needText(v: unknown, max: number, label: string): string {
  if (typeof v !== 'string' || v.trim() === '' || v.trim().length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값을 확인해 주세요.');
  }
  return v.trim();
}

function optText(v: unknown, max: number, label: string): string | null {
  if (v === undefined || v === null) {
    return null;
  }
  return needText(v, max, label);
}

function optStatus(v: unknown): string | null {
  if (v === undefined || v === null) {
    return null;
  }
  if (typeof v !== 'string' || !USE_STATUS.includes(v)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
  }
  return v;
}

@Controller('api/v1')
export class FnSfr00205Controller {
  @Get('/partner-accounts')
  async listPartnerAccounts(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    if (!isId(query['partnerId'])) {
      throw new ApiError(400, 'VALIDATION_FAILED', '거래처를 선택해 주세요.');
    }
    const pageRaw = query['page'] === undefined || query['page'] === '' ? '0' : String(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? '20' : String(query['size']);
    if (!isId(pageRaw) || !isId(sizeRaw) || Number(sizeRaw) < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 크기가 올바르지 않습니다.');
    }
    const page = Number(pageRaw);
    const size = Math.min(Number(sizeRaw), 200);
    return transaction(async (db) => {
      const params = { partnerId: String(query['partnerId']), limit: size, offset: page * size };
      const items = await db.query(
        'SELECT partner_account_id AS "partnerAccountId", partner_id AS "partnerId", bank_name AS "bankName", account_holder AS "accountHolder", use_status AS "useStatus" FROM partner_account WHERE partner_id = CAST(:partnerId AS bigint) ORDER BY partner_account_id LIMIT :limit OFFSET :offset',
        params,
      );
      const counted = await db.query(
        'SELECT COUNT(*) AS "total" FROM partner_account WHERE partner_id = CAST(:partnerId AS bigint)',
        { partnerId: params.partnerId },
      );
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }

  @Post('/partner-accounts')
  @HttpCode(200)
  async createPartnerAccount(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    if (!isId(data['partnerId'])) {
      throw new ApiError(400, 'VALIDATION_FAILED', '거래처를 선택해 주세요.');
    }
    const partnerId = String(data['partnerId']);
    const bankName = needText(data['bankName'], 100, '은행');
    const accountNumber = needText(data['accountNumber'], 500, '계좌번호');
    const accountHolder = needText(data['accountHolder'], 100, '예금주');
    const useStatus = optStatus(data['useStatus']) ?? '사용';
    return transaction(async (db) => {
      const partners = await db.query(
        'SELECT partner_id FROM partner WHERE partner_id = CAST(:partnerId AS bigint)',
        { partnerId },
      );
      if (partners.length === 0) {
        throw new ApiError(404, 'PARTNER_NOT_FOUND', '거래처를 찾을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT partner_account_id FROM partner_account WHERE partner_id = CAST(:partnerId AS bigint) AND bank_name = :bankName AND account_number_enc = :accountNumber',
        { partnerId, bankName, accountNumber },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PARTNER_ACCOUNT_DUPLICATED', '같은 거래처에 동일한 계좌가 이미 있습니다.');
      }
      const rows = await db.query(
        'INSERT INTO partner_account (partner_id, bank_name, account_number_enc, account_holder, use_status, created_at, updated_at) VALUES (CAST(:partnerId AS bigint), :bankName, :accountNumber, :accountHolder, :useStatus, now(), now()) RETURNING partner_account_id AS "partnerAccountId"',
        { partnerId, bankName, accountNumber, accountHolder, useStatus },
      );
      return { partnerAccountId: Number(rows[0]['partnerAccountId']) };
    });
  }

  @Patch('/partner-accounts/:partnerAccountId')
  @HttpCode(200)
  async updatePartnerAccount(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['partnerAccountId'];
    if (!isId(id)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '계좌 ID가 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const bankName = optText(data['bankName'], 100, '은행');
    const accountNumber = optText(data['accountNumber'], 500, '계좌번호');
    const accountHolder = optText(data['accountHolder'], 100, '예금주');
    const useStatus = optStatus(data['useStatus']);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT partner_id AS "partnerId", bank_name AS "bankName", account_number_enc AS "accountNumber" FROM partner_account WHERE partner_account_id = CAST(:id AS bigint)',
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PARTNER_ACCOUNT_NOT_FOUND', '계좌를 찾을 수 없습니다.');
      }
      const finalBank = bankName ?? String(found[0]['bankName']);
      const finalNumber = accountNumber ?? String(found[0]['accountNumber']);
      const dup = await db.query(
        'SELECT partner_account_id FROM partner_account WHERE partner_id = CAST(:partnerId AS bigint) AND bank_name = :bankName AND account_number_enc = :accountNumber AND partner_account_id <> CAST(:id AS bigint)',
        { partnerId: String(found[0]['partnerId']), bankName: finalBank, accountNumber: finalNumber, id },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PARTNER_ACCOUNT_DUPLICATED', '같은 거래처에 동일한 계좌가 이미 있습니다.');
      }
      await db.execute(
        'UPDATE partner_account SET bank_name = :bankName, account_number_enc = :accountNumber, account_holder = COALESCE(:accountHolder, account_holder), use_status = COALESCE(:useStatus, use_status), updated_at = now() WHERE partner_account_id = CAST(:id AS bigint)',
        { bankName: finalBank, accountNumber: finalNumber, accountHolder, useStatus, id },
      );
      return { partnerAccountId: Number(id) };
    });
  }

  @Delete('/partner-accounts/:partnerAccountId')
  @HttpCode(200)
  async deletePartnerAccount(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['partnerAccountId'];
    if (!isId(id)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '계좌 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const count = await db.execute(
        'DELETE FROM partner_account WHERE partner_account_id = CAST(:id AS bigint)',
        { id },
      );
      if (count === 0) {
        throw new ApiError(404, 'PARTNER_ACCOUNT_NOT_FOUND', '계좌를 찾을 수 없습니다.');
      }
      return {};
    });
  }
}
