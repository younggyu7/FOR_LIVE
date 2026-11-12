import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 일괄 등록 파일은 첫 줄이 아래 머리글인 탭 또는 쉼표 구분 텍스트이고, 한 번에 최대 1000행이다.
const BULK_HEADER = ['projectId', 'budgetAccountId', 'partnerId', 'departmentId', 'resolutionMethod', 'resolutionAmount'];
const BULK_MAX_ROWS = 1000;
const METHODS = ['카드사용내역', '세금계산서', '통장거래내역', '직접입력'];
const TYPES = ['수입', '지출'];

function idParam(source: Record<string, unknown>, name: string): string | null {
  const value = source[name];
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const text = String(value).trim();
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', name + ' 값이 올바르지 않습니다.');
  }
  return text;
}

@Controller('api/v1')
export class FnSfr00406Controller {
  @Get('/expense-resolutions')
  async listExpenseResolutions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const page = Number(idParam(q, 'page') ?? '0');
    const size = Math.min(Number(idParam(q, 'size') ?? String(DEFAULT_SIZE)), MAX_SIZE);
    if (size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기는 1 이상이어야 합니다.');
    }
    const params: Record<string, unknown> = {};
    let where = ' WHERE 1 = 1';
    const type = q['incomeExpenseType'];
    if (type !== undefined && type !== null && type !== '') {
      if (!TYPES.includes(String(type))) {
        throw new ApiError(400, 'VALIDATION_FAILED', '거래 유형은 수입 또는 지출이어야 합니다.');
      }
      where += ' AND ba.income_expense_type = :incomeExpenseType';
      params.incomeExpenseType = String(type);
    }
    const projectId = idParam(q, 'projectId');
    if (projectId !== null) {
      where += ' AND er.project_id = CAST(:projectId AS bigint)';
      params.projectId = projectId;
    }
    const departmentId = idParam(q, 'departmentId');
    if (departmentId !== null) {
      where += ' AND er.department_id = CAST(:departmentId AS bigint)';
      params.departmentId = departmentId;
    }
    // 가정: 작성자는 연결된 전자결재 문서의 기안자(approval_document.drafter_id)다.
    const drafterId = idParam(q, 'drafterId');
    if (drafterId !== null) {
      where += ' AND ad.drafter_id = CAST(:drafterId AS bigint)';
      params.drafterId = drafterId;
    }
    const budgetAccountId = idParam(q, 'budgetAccountId');
    if (budgetAccountId !== null) {
      where += ' AND er.budget_account_id = CAST(:budgetAccountId AS bigint)';
      params.budgetAccountId = budgetAccountId;
    }
    const from =
      ' FROM expense_resolution er' +
      ' JOIN budget_account ba ON ba.budget_account_id = er.budget_account_id' +
      ' LEFT JOIN approval_document ad ON ad.approval_document_id = er.approval_document_id';
    return transaction(async (db) => {
      const counted = await db.query('SELECT COUNT(*) AS "total"' + from + where, params);
      const items = await db.query(
        'SELECT er.expense_resolution_id AS "expenseResolutionId",' +
          ' er.project_id AS "projectId",' +
          ' er.budget_account_id AS "budgetAccountId",' +
          ' er.department_id AS "departmentId",' +
          ' er.resolution_amount AS "resolutionAmount",' +
          ' er.status AS "status"' +
          from +
          where +
          ' ORDER BY er.expense_resolution_id DESC' +
          ' LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)',
        { ...params, size: size, offset: page * size },
      );
      return { items: items, page: page, size: size, total: Number(counted[0].total) };
    });
  }

  @Post('/expense-resolutions/bulk-import')
  @HttpCode(200)
  async bulkImportExpenseResolutions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const file = data['file'];
    if (typeof file !== 'string' || file.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '지출내역 파일을 입력해 주세요.');
    }
    const lines = file.replace(/^\uFEFF/, '').split(/\r?\n/);
    const split = (line: string): string[] => (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim());
    const header = split(lines[0]);
    if (header.length !== BULK_HEADER.length || header.some((h, i) => h !== BULK_HEADER[i])) {
      throw new ApiError(422, 'INVALID_EXCEL_FORMAT', '양식 형식이 맞지 않습니다. 머리글을 확인해 주세요.');
    }
    const body = lines.slice(1).map((text, i) => ({ no: i + 2, text: text }));
    const rows = body.filter((r) => r.text.trim() !== '');
    if (rows.length === 0) {
      throw new ApiError(422, 'INVALID_EXCEL_FORMAT', '등록할 내역이 없습니다.');
    }
    if (rows.length > BULK_MAX_ROWS) {
      throw new ApiError(422, 'INVALID_EXCEL_FORMAT', '한 번에 ' + BULK_MAX_ROWS + '행까지 등록할 수 있습니다.');
    }
    return transaction(async (db) => {
      const errors: { row: number; reason: string }[] = [];
      let successCount = 0;
      const exists = async (table: string, column: string, id: string): Promise<boolean> => {
        const found = await db.query(
          'SELECT 1 AS "ok" FROM ' + table + ' WHERE ' + column + ' = CAST(:id AS bigint)',
          { id: id },
        );
        return found.length > 0;
      };
      for (const row of rows) {
        const cells = split(row.text);
        if (cells.length !== BULK_HEADER.length) {
          errors.push({ row: row.no, reason: '열 개수가 맞지 않습니다.' });
          continue;
        }
        const [projectId, budgetAccountId, partnerId, departmentId, method, amount] = cells;
        const missing = cells.some((c) => c === '');
        if (missing) {
          errors.push({ row: row.no, reason: '필수값이 누락되었습니다.' });
          continue;
        }
        if (![projectId, budgetAccountId, partnerId, departmentId].every((v) => /^\d+$/.test(v))) {
          errors.push({ row: row.no, reason: '프로젝트·예산과목·거래처·결의부서는 숫자여야 합니다.' });
          continue;
        }
        if (!METHODS.includes(method)) {
          errors.push({ row: row.no, reason: '결의 방식이 올바르지 않습니다.' });
          continue;
        }
        if (!/^\d{1,16}(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
          errors.push({ row: row.no, reason: '결의 금액은 0보다 큰 숫자여야 합니다.' });
          continue;
        }
        if (!(await exists('project', 'project_id', projectId))) {
          errors.push({ row: row.no, reason: '프로젝트를 찾을 수 없습니다.' });
          continue;
        }
        if (!(await exists('budget_account', 'budget_account_id', budgetAccountId))) {
          errors.push({ row: row.no, reason: '예산과목을 찾을 수 없습니다.' });
          continue;
        }
        if (!(await exists('partner', 'partner_id', partnerId))) {
          errors.push({ row: row.no, reason: '거래처를 찾을 수 없습니다.' });
          continue;
        }
        if (!(await exists('department', 'department_id', departmentId))) {
          errors.push({ row: row.no, reason: '결의부서를 찾을 수 없습니다.' });
          continue;
        }
        // 오류 건 제외 후 정상 건만 반영한다 (가정: 공통 P4 추천안). 초기 상태는 기안.
        await db.query(
          'INSERT INTO expense_resolution (project_id, budget_account_id, partner_id, department_id,' +
            ' resolution_method, resolution_amount, status, created_at, updated_at)' +
            ' VALUES (CAST(:projectId AS bigint), CAST(:budgetAccountId AS bigint), CAST(:partnerId AS bigint),' +
            ' CAST(:departmentId AS bigint), :method, CAST(:amount AS numeric), :status, now(), now())' +
            ' RETURNING expense_resolution_id AS "expenseResolutionId"',
          {
            projectId: projectId,
            budgetAccountId: budgetAccountId,
            partnerId: partnerId,
            departmentId: departmentId,
            method: method,
            amount: amount,
            status: '기안',
          },
        );
        successCount += 1;
      }
      return { successCount: successCount, errors: errors };
    });
  }
}
