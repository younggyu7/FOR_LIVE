import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 메뉴 사용 권한을 찾을 때 쓰는 메뉴 이름
const MENU_NAME = '예산장부 조회';
const ROLE = '예산·회계 담당자';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const LEDGER_TYPES = ['예산일계표', '월계표', '수입·지출부', '자금출납장', '은행이체명세서', '지출원인행위부', '수입징수부', '세출·세입총괄표'];
const CASH_SCOPES = ['전체', '금융기관별', '프로젝트별', '결의 담당자별'];
const VIEW_FORMS = ['상세', '총괄'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 가정: 전표 기반 장부는 전표 분개 라인, 지출원인행위부·은행이체명세서는 승인·완료된 결의서를 기준으로 한다.
const JOURNAL_FROM = ` FROM journal_entry_line l JOIN journal_entry je ON je.journal_entry_id = l.journal_entry_id JOIN expense_resolution er ON er.expense_resolution_id = je.expense_resolution_id LEFT JOIN approval_document ad ON ad.approval_document_id = er.approval_document_id LEFT JOIN budget_account ba ON ba.budget_account_id = l.budget_account_id `;
const JOURNAL_WHERE = ` WHERE je.entry_date >= CAST(:fromDate AS date) AND je.entry_date <= CAST(:toDate AS date)`;
const RESOLUTION_FROM = ` FROM expense_resolution er LEFT JOIN approval_document ad ON ad.approval_document_id = er.approval_document_id LEFT JOIN partner p ON p.partner_id = er.partner_id `;
const RESOLUTION_WHERE = ` WHERE er.status IN ('승인', '완료') AND er.created_at >= CAST(:fromDate AS date) AND er.created_at < CAST(:toDate AS date) + 1`;
const BANK_TRANSFER_WHERE = ` AND er.partner_id IS NOT NULL AND EXISTS (SELECT 1 FROM partner_account pa WHERE pa.partner_id = er.partner_id AND pa.use_status = '사용')`;
const SCOPE_DEPARTMENT = ` AND er.department_id = (SELECT e.department_id FROM employee e WHERE e.employee_id = CAST(:userId AS bigint))`;
const SCOPE_PERSON = ` AND ad.drafter_id = CAST(:userId AS bigint)`;

function bad(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function textOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function idOf(value: unknown, label: string): number | null {
  const text = textOf(value);
  if (text === '') {
    return null;
  }
  const num = Number(text);
  if (!Number.isInteger(num) || num <= 0) {
    throw bad(label + ' 형식이 올바르지 않습니다.');
  }
  return num;
}

function dateOf(value: unknown, label: string): string {
  const text = textOf(value);
  if (text === '') {
    throw bad(label + '을(를) 입력해 주세요.');
  }
  if (!DATE_PATTERN.test(text)) {
    throw bad(label + ' 형식은 YYYY-MM-DD여야 합니다.');
  }
  return text;
}

function numberOf(value: unknown, fallback: number, label: string): number {
  const text = textOf(value);
  if (text === '') {
    return fallback;
  }
  const num = Number(text);
  if (!Number.isInteger(num)) {
    throw bad(label + ' 형식이 올바르지 않습니다.');
  }
  return num;
}

@Controller('api/v1')
export class FnSfr00501Controller {
  @Get('/budget-ledgers')
  async listBudgetLedgers(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const ledgerType = textOf(q['ledgerType']);
    if (ledgerType === '') {
      throw bad('장부 종류를 선택해 주세요.');
    }
    if (!LEDGER_TYPES.includes(ledgerType)) {
      throw bad('장부 종류가 올바르지 않습니다.');
    }
    const fromDate = dateOf(q['fromDate'], '조회 시작일');
    const toDate = dateOf(q['toDate'], '조회 종료일');
    if (fromDate > toDate) {
      throw bad('조회 시작일은 종료일보다 늦을 수 없습니다.');
    }
    const cashScope = textOf(q['cashBookScope']) || '전체';
    if (!CASH_SCOPES.includes(cashScope)) {
      throw bad('자금출납장 조회 구분이 올바르지 않습니다.');
    }
    const viewForm = textOf(q['viewForm']) || '상세';
    if (!VIEW_FORMS.includes(viewForm)) {
      throw bad('조회 형태는 상세 또는 총괄이어야 합니다.');
    }
    const partnerId = idOf(q['partnerId'], '금융거래처');
    const projectId = idOf(q['projectId'], '프로젝트');
    const resolverId = idOf(q['resolverId'], '결의 담당자');
    const pageNo = numberOf(q['page'], 0, '페이지');
    const size = numberOf(q['size'], DEFAULT_SIZE, '페이지 크기');
    if (pageNo < 0 || size < 1) {
      throw bad('페이지 값이 올바르지 않습니다.');
    }
    const pageSize = Math.min(size, MAX_SIZE);
    const isCashBook = ledgerType === '자금출납장';
    if (isCashBook && cashScope === '금융기관별' && partnerId === null) {
      throw bad('금융거래처를 선택해 주세요.');
    }
    if (isCashBook && cashScope === '프로젝트별' && projectId === null) {
      throw bad('프로젝트를 선택해 주세요.');
    }
    if (isCashBook && cashScope === '결의 담당자별' && resolverId === null) {
      throw bad('결의 담당자를 선택해 주세요.');
    }

    return transaction(async (db) => {
      const permissions = await db.query(
        `SELECT mp.view_scope AS "viewScope" FROM menu_permission mp JOIN menu m ON m.menu_id = mp.menu_id WHERE mp.employee_id = CAST(:userId AS bigint) AND m.name = :menuName AND m.use_status = '사용'`,
        { userId: user.id, menuName: MENU_NAME },
      );
      if (permissions.length === 0) {
        throw new ApiError(403, 'FORBIDDEN', '예산장부 조회 권한이 없습니다.');
      }
      const viewScope = String(permissions[0]['viewScope']);
      const params: Record<string, unknown> = { fromDate, toDate };
      let scopeSql = '';
      if (viewScope === '부서') {
        scopeSql = SCOPE_DEPARTMENT;
        params['userId'] = user.id;
      } else if (viewScope === '개인') {
        scopeSql = SCOPE_PERSON;
        params['userId'] = user.id;
      }

      const isResolution = ledgerType === '지출원인행위부' || ledgerType === '은행이체명세서';
      const hasViewForm = isResolution || ledgerType === '수입징수부';
      const summarize = hasViewForm && viewForm === '총괄';
      let inner: string;

      if (isResolution) {
        let where = RESOLUTION_WHERE;
        if (ledgerType === '은행이체명세서') {
          where = where + BANK_TRANSFER_WHERE;
        }
        where = where + scopeSql;
        if (summarize) {
          inner = `SELECT CAST(er.created_at AS date) AS "entryDate", '일자별 합계' AS summary, 0 AS "debitAmount", 0 AS "creditAmount", SUM(er.resolution_amount) AS "resolutionAmount", SUM(SUM(er.resolution_amount)) OVER () AS "totalAmount"` + RESOLUTION_FROM + where + ` GROUP BY CAST(er.created_at AS date) ORDER BY 1`;
        } else {
          inner = `SELECT CAST(er.created_at AS date) AS "entryDate", COALESCE(p.name, er.resolution_method) AS summary, 0 AS "debitAmount", 0 AS "creditAmount", er.resolution_amount AS "resolutionAmount", SUM(er.resolution_amount) OVER () AS "totalAmount"` + RESOLUTION_FROM + where + ` ORDER BY 1, er.expense_resolution_id`;
        }
      } else {
        let where = JOURNAL_WHERE + scopeSql;
        if (ledgerType === '수입징수부') {
          where = where + ` AND ba.income_expense_type = '수입'`;
        }
        if (isCashBook) {
          if (cashScope === '금융기관별') {
            const partners = await db.query(`SELECT partner_id FROM partner WHERE partner_id = CAST(:partnerId AS bigint) AND partner_type = '금융'`, { partnerId });
            if (partners.length === 0) {
              throw new ApiError(404, 'NOT_FOUND', '금융거래처를 찾을 수 없습니다.');
            }
            where = where + ` AND l.partner_id = CAST(:partnerId AS bigint)`;
            params['partnerId'] = partnerId;
          } else if (cashScope === '프로젝트별') {
            const projects = await db.query(`SELECT project_id FROM project WHERE project_id = CAST(:projectId AS bigint)`, { projectId });
            if (projects.length === 0) {
              throw new ApiError(404, 'NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
            }
            where = where + ` AND l.project_id = CAST(:projectId AS bigint)`;
            params['projectId'] = projectId;
          } else if (cashScope === '결의 담당자별') {
            const employees = await db.query(`SELECT employee_id FROM employee WHERE employee_id = CAST(:resolverId AS bigint)`, { resolverId });
            if (employees.length === 0) {
              throw new ApiError(404, 'NOT_FOUND', '결의 담당자를 찾을 수 없습니다.');
            }
            // 가정: 결의 담당자는 결의서의 전자결재 기안자로 본다.
            where = where + ` AND ad.drafter_id = CAST(:resolverId AS bigint)`;
            params['resolverId'] = resolverId;
          }
        }
        let groupKind = '';
        if (ledgerType === '예산일계표') {
          groupKind = 'day';
        } else if (ledgerType === '월계표') {
          groupKind = 'month';
        } else if (ledgerType === '세출·세입총괄표') {
          groupKind = 'budget';
        } else if (summarize) {
          groupKind = 'day';
        }
        if (groupKind === '') {
          inner = `SELECT je.entry_date AS "entryDate", COALESCE(l.summary, je.summary) AS summary, l.debit_amount AS "debitAmount", l.credit_amount AS "creditAmount", er.resolution_amount AS "resolutionAmount", SUM(GREATEST(l.debit_amount, l.credit_amount)) OVER () AS "totalAmount"` + JOURNAL_FROM + where + ` ORDER BY 1, l.journal_entry_line_id`;
        } else {
          let head: string;
          let group: string;
          if (groupKind === 'day') {
            head = `je.entry_date AS "entryDate", '일계' AS summary`;
            group = ` GROUP BY je.entry_date`;
          } else if (groupKind === 'month') {
            head = `CAST(date_trunc('month', je.entry_date) AS date) AS "entryDate", '월계' AS summary`;
            group = ` GROUP BY date_trunc('month', je.entry_date)`;
          } else {
            head = `MIN(je.entry_date) AS "entryDate", COALESCE(ba.name, '미지정 예산과목') AS summary`;
            group = ` GROUP BY ba.name`;
          }
          inner = 'SELECT ' + head + `, SUM(l.debit_amount) AS "debitAmount", SUM(l.credit_amount) AS "creditAmount", 0 AS "resolutionAmount", SUM(SUM(GREATEST(l.debit_amount, l.credit_amount))) OVER () AS "totalAmount"` + JOURNAL_FROM + where + group + ` ORDER BY 1, 2`;
        }
      }

      const counts = await db.query('SELECT COUNT(*) AS "total" FROM (' + inner + ') t', params);
      const total = counts.length > 0 ? Number(counts[0]['total']) : 0;
      const items = await db.query(inner + ' LIMIT :size OFFSET :offset', {
        ...params,
        size: pageSize,
        offset: pageNo * pageSize,
      });
      return { items, page: pageNo, size: pageSize, total };
    });
  }
}
