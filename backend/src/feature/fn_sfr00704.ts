import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function intOf(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isInteger(n) ? n : null;
}

function amountOf(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function dateOf(v: unknown, label: string): string {
  if (typeof v !== 'string' || !DATE_PATTERN.test(v)) {
    throw invalid(label + '을(를) YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return v;
}

function pagingOf(query: Record<string, unknown>): { page: number; size: number } {
  const rawPage = query['page'] === undefined || query['page'] === '' ? 0 : intOf(query['page']);
  const rawSize = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : intOf(query['size']);
  if (rawPage === null || rawPage < 0) {
    throw invalid('page는 0 이상의 정수여야 합니다.');
  }
  if (rawSize === null || rawSize < 1) {
    throw invalid('size는 1 이상의 정수여야 합니다.');
  }
  return { page: rawPage, size: Math.min(rawSize, MAX_SIZE) };
}

@Controller('api/v1')
export class FnSfr00704Controller {
  @Post('/card-approvals/collect')
  @HttpCode(200)
  async collectCardApprovals(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    const creditCardId = intOf(data['creditCardId']);
    if (creditCardId === null) {
      throw invalid('신용카드를 선택해 주세요.');
    }
    const startDate = dateOf(data['startDate'], '수집 기간 시작일');
    const endDate = dateOf(data['endDate'], '수집 기간 종료일');
    return transaction(async (db) => {
      const cards = await db.query(
        'SELECT credit_card_id FROM credit_card WHERE credit_card_id = CAST(:creditCardId AS bigint)',
        { creditCardId },
      );
      if (cards.length === 0) {
        throw new ApiError(404, 'CREDIT_CARD_NOT_FOUND', '등록되어 있지 않은 신용카드입니다.');
      }
      // 가정: 카드사 연계 호출 수단이 입력에 없어 연계 요청 이력만 남기고, 저장되어 있는 승인내역 건수를 센다.
      await db.execute(
        'INSERT INTO link_log (requester_id, link_target, link_type, status, requested_at, request_summary, created_at, updated_at) ' +
          "VALUES (CAST(:userId AS bigint), 'CARD_COMPANY', '승인내역 수집', 'REQUESTED', now(), :summary, now(), now())",
        {
          userId: user.id,
          summary: '카드 ' + creditCardId + ' / ' + startDate + ' ~ ' + endDate,
        },
      );
      const counted = await db.query(
        'SELECT COUNT(*) AS "count" FROM card_approval ' +
          'WHERE credit_card_id = CAST(:creditCardId AS bigint) ' +
          'AND approved_at >= CAST(:startDate AS date) ' +
          'AND approved_at < CAST(:endDate AS date) + 1',
        { creditCardId, startDate, endDate },
      );
      return { collectedCount: Number(counted[0]['count']) };
    });
  }

  @Get('/card-approvals')
  async listCardApprovals(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const startDate = dateOf(query['startDate'], '조회 기간 시작일');
    const endDate = dateOf(query['endDate'], '조회 기간 종료일');
    let creditCardId: number | null = null;
    if (query['creditCardId'] !== undefined && query['creditCardId'] !== '') {
      creditCardId = intOf(query['creditCardId']);
      if (creditCardId === null) {
        throw invalid('신용카드 ID는 정수여야 합니다.');
      }
    }
    const { page, size } = pagingOf(query);
    return transaction(async (db) => {
      const where =
        'WHERE (CAST(:creditCardId AS bigint) IS NULL OR credit_card_id = CAST(:creditCardId AS bigint)) ' +
        'AND approved_at >= CAST(:startDate AS date) ' +
        'AND approved_at < CAST(:endDate AS date) + 1';
      const base = { creditCardId, startDate, endDate };
      const totalRows = await db.query('SELECT COUNT(*) AS "total" FROM card_approval ' + where, base);
      const items = await db.query(
        'SELECT card_approval_id AS "cardApprovalId", credit_card_id AS "creditCardId", ' +
          'approval_no AS "approvalNo", approved_at AS "approvedAt", ' +
          'approval_amount AS "approvalAmount", vat_amount AS "vatAmount", ' +
          'merchant_name AS "merchantName", expense_resolution_id AS "expenseResolutionId" ' +
          'FROM card_approval ' +
          where +
          ' ORDER BY approved_at DESC, card_approval_id DESC LIMIT :size OFFSET :offset',
        { ...base, size, offset: page * size },
      );
      return { items, page, size, total: Number(totalRows[0]['total']) };
    });
  }

  @Get('/cash-receipts')
  async listCashReceipts(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const startDate = dateOf(query['startDate'], '조회 기간 시작일');
    const endDate = dateOf(query['endDate'], '조회 기간 종료일');
    const { page, size } = pagingOf(query);
    return transaction(async (db) => {
      const where =
        'WHERE issued_at >= CAST(:startDate AS date) AND issued_at < CAST(:endDate AS date) + 1';
      const base = { startDate, endDate };
      const totalRows = await db.query('SELECT COUNT(*) AS "total" FROM cash_receipt ' + where, base);
      const items = await db.query(
        'SELECT cash_receipt_id AS "cashReceiptId", approval_no AS "approvalNo", ' +
          'issued_at AS "issuedAt", supply_amount AS "supplyAmount", vat_amount AS "vatAmount", ' +
          'total_amount AS "totalAmount", merchant_name AS "merchantName", ' +
          'expense_resolution_id AS "expenseResolutionId" ' +
          'FROM cash_receipt ' +
          where +
          ' ORDER BY issued_at DESC, cash_receipt_id DESC LIMIT :size OFFSET :offset',
        { ...base, size, offset: page * size },
      );
      return { items, page, size, total: Number(totalRows[0]['total']) };
    });
  }

  @Post('/expense-resolutions/from-card-or-cash-receipt')
  @HttpCode(200)
  async createExpenseResolutionFromCardOrCashReceipt(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자');
    const data = checks.inputOf(req.body);
    const hasCard = data['cardApprovalId'] !== undefined && data['cardApprovalId'] !== null && data['cardApprovalId'] !== '';
    const hasCash = data['cashReceiptId'] !== undefined && data['cashReceiptId'] !== null && data['cashReceiptId'] !== '';
    if (hasCard === hasCash) {
      throw invalid('카드 승인내역 또는 현금영수증 중 하나만 선택해 주세요.');
    }
    const sourceId = intOf(hasCard ? data['cardApprovalId'] : data['cashReceiptId']);
    if (sourceId === null) {
      throw invalid('선택한 건의 ID가 올바르지 않습니다.');
    }
    const projectId = intOf(data['projectId']);
    const budgetAccountId = intOf(data['budgetAccountId']);
    const departmentId = intOf(data['departmentId']);
    if (projectId === null) {
      throw invalid('프로젝트를 선택해 주세요.');
    }
    if (budgetAccountId === null) {
      throw invalid('예산과목을 선택해 주세요.');
    }
    if (departmentId === null) {
      throw invalid('결의부서를 선택해 주세요.');
    }
    const resolutionAmount = amountOf(data['resolutionAmount']);
    if (resolutionAmount === null || resolutionAmount <= 0) {
      throw invalid('결의 금액은 0보다 큰 숫자여야 합니다.');
    }
    return transaction(async (db) => {
      const sources = hasCard
        ? await db.query(
            'SELECT expense_resolution_id AS "expenseResolutionId" FROM card_approval ' +
              'WHERE card_approval_id = CAST(:id AS bigint) FOR UPDATE',
            { id: sourceId },
          )
        : await db.query(
            'SELECT expense_resolution_id AS "expenseResolutionId" FROM cash_receipt ' +
              'WHERE cash_receipt_id = CAST(:id AS bigint) FOR UPDATE',
            { id: sourceId },
          );
      if (sources.length === 0) {
        throw new ApiError(404, 'RESOLUTION_SOURCE_NOT_FOUND', '선택한 승인내역 또는 현금영수증이 존재하지 않습니다.');
      }
      if (sources[0]['expenseResolutionId'] !== null) {
        throw new ApiError(409, 'EXPENSE_RESOLUTION_ALREADY_CREATED', '이미 결의서가 작성된 건입니다.');
      }
      const projects = await db.query(
        'SELECT project_id FROM project WHERE project_id = CAST(:id AS bigint)',
        { id: projectId },
      );
      if (projects.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '선택한 프로젝트를 찾을 수 없습니다.');
      }
      const accounts = await db.query(
        'SELECT budget_account_id FROM budget_account WHERE budget_account_id = CAST(:id AS bigint)',
        { id: budgetAccountId },
      );
      if (accounts.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '선택한 예산과목을 찾을 수 없습니다.');
      }
      const departments = await db.query(
        'SELECT department_id FROM department WHERE department_id = CAST(:id AS bigint)',
        { id: departmentId },
      );
      if (departments.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '선택한 결의부서를 찾을 수 없습니다.');
      }
      // 가정: 결의 방식은 카드사용내역, 초기 상태는 기안 (BEHAVIOR.md 값의 출처)
      const created = await db.query(
        'INSERT INTO expense_resolution (project_id, budget_account_id, department_id, resolution_method, resolution_amount, status, created_at, updated_at) ' +
          "VALUES (CAST(:projectId AS bigint), CAST(:budgetAccountId AS bigint), CAST(:departmentId AS bigint), '카드사용내역', CAST(:amount AS numeric), '기안', now(), now()) " +
          'RETURNING expense_resolution_id AS "expenseResolutionId", status AS "status"',
        { projectId, budgetAccountId, departmentId, amount: resolutionAmount },
      );
      const resolutionId = created[0]['expenseResolutionId'];
      if (hasCard) {
        await db.execute(
          'UPDATE card_approval SET expense_resolution_id = CAST(:resolutionId AS bigint), updated_at = now() ' +
            'WHERE card_approval_id = CAST(:id AS bigint)',
          { resolutionId, id: sourceId },
        );
      } else {
        await db.execute(
          'UPDATE cash_receipt SET expense_resolution_id = CAST(:resolutionId AS bigint), updated_at = now() ' +
            'WHERE cash_receipt_id = CAST(:id AS bigint)',
          { resolutionId, id: sourceId },
        );
      }
      return { expenseResolutionId: resolutionId, status: created[0]['status'] };
    });
  }
}
