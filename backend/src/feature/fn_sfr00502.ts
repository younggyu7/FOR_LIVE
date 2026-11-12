import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 현황 조회 메뉴 이름. 메뉴 사용 권한(menu_permission)의 조회 범위를 이 메뉴 기준으로 읽는다.
const MENU_NAME = '결의서 현황 및 예실 조회';
const STATUS_TYPES = [
  '품의서·원인행위·결의서 현황',
  '지출결의서 현황',
  '예실 대비 현황',
  '프로젝트별 예산 구성비',
  '예산과목 원장',
  '자금예산서',
  '추가경정자금예산서',
  '자금계산서',
];
const RESOLUTION_TYPES = ['품의서·원인행위·결의서 현황', '지출결의서 현황'];
const PROGRESS_STATUSES = ['기안', '결재대기', '승인', '보류', '반려', '회수', '재기안', '완료'];
const VIEW_FORMS = ['기본', '상세'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 조회 권한 범위: 전체 / 부서(내 부서 주관 프로젝트) / 개인(내가 담당자인 프로젝트)
const SCOPE_SQL = [
  "(CAST(:scope AS varchar) = '전체'",
  "OR (CAST(:scope AS varchar) = '부서' AND p.department_id = (SELECT e.department_id FROM employee e WHERE e.employee_id = CAST(:userId AS bigint)))",
  "OR (CAST(:scope AS varchar) = '개인' AND p.manager_id = CAST(:userId AS bigint)))",
].join('\n');

// 품의서·원인행위·결의서 현황, 지출결의서 현황
const RESOLUTION_SQL = [
  'SELECT er.project_id AS "projectId",',
  '  er.budget_account_id AS "budgetAccountId",',
  '  COALESCE(rq.requisition_amount, 0) AS "requisitionAmount",',
  '  COALESCE((SELECT SUM(bc.amount) FROM budget_commitment bc',
  '    WHERE bc.project_id = er.project_id',
  '    AND bc.budget_account_id = er.budget_account_id',
  "    AND bc.approval_status = '승인'), 0) AS \"commitmentAmount\",",
  '  er.resolution_amount AS "resolutionAmount",',
  '  er.status AS "status"',
  'FROM expense_resolution er',
  'JOIN project p ON p.project_id = er.project_id',
  'LEFT JOIN requisition rq ON rq.requisition_id = er.requisition_id',
  'WHERE CAST(er.created_at AS date) BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date)',
  'AND (CAST(:projectId AS bigint) IS NULL OR er.project_id = CAST(:projectId AS bigint))',
  'AND (CAST(:budgetAccountId AS bigint) IS NULL OR er.budget_account_id = CAST(:budgetAccountId AS bigint))',
  'AND (CAST(:progressStatus AS varchar) IS NULL OR er.status = CAST(:progressStatus AS varchar))',
  'AND ' + SCOPE_SQL,
].join('\n');

// 예실 대비, 구성비, 예산과목 원장, 자금예산서, 자금계산서
const BUDGET_SQL = [
  'SELECT t.*,',
  '  t."budgetAmount" + t."adjustmentAmount" - t."resolutionAmount" AS "balance"',
  'FROM (',
  '  SELECT bm.project_id AS "projectId",',
  '    bm.budget_account_id AS "budgetAccountId",',
  '    SUM(bm.requested_amount) AS "budgetAmount",',
  '    COALESCE((SELECT SUM(be.execution_amount) FROM budget_execution be',
  '      JOIN budget_main b2 ON b2.budget_main_id = be.budget_main_id',
  '      WHERE b2.project_id = bm.project_id',
  '      AND b2.budget_account_id = bm.budget_account_id',
  '      AND b2.requested_date BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date)), 0) AS "executionAmount",',
  '    COALESCE((SELECT SUM(adj.adjustment_amount) FROM budget_adjustment adj',
  '      WHERE adj.project_id = bm.project_id',
  '      AND adj.budget_account_id = bm.budget_account_id',
  "      AND adj.approval_status = '승인'",
  '      AND CAST(adj.created_at AS date) BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date)), 0) AS "adjustmentAmount",',
  '    COALESCE((SELECT SUM(er2.resolution_amount) FROM expense_resolution er2',
  '      WHERE er2.project_id = bm.project_id',
  '      AND er2.budget_account_id = bm.budget_account_id',
  "      AND er2.status IN ('승인', '완료')",
  '      AND CAST(er2.created_at AS date) BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date)), 0) AS "resolutionAmount",',
  '    COALESCE((SELECT SUM(rq2.requisition_amount) FROM requisition rq2',
  '      WHERE rq2.project_id = bm.project_id',
  '      AND rq2.budget_account_id = bm.budget_account_id',
  "      AND rq2.status IN ('승인', '완료')",
  '      AND CAST(rq2.created_at AS date) BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date)), 0) AS "requisitionAmount",',
  '    COALESCE((SELECT SUM(bc2.amount) FROM budget_commitment bc2',
  '      WHERE bc2.project_id = bm.project_id',
  '      AND bc2.budget_account_id = bm.budget_account_id',
  "      AND bc2.approval_status = '승인'",
  '      AND CAST(bc2.created_at AS date) BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date)), 0) AS "commitmentAmount",',
  '    COALESCE(SUM(bm.requested_amount) * 100 / NULLIF(SUM(SUM(bm.requested_amount)) OVER (PARTITION BY bm.project_id), 0), 0) AS "ratio"',
  '  FROM budget_main bm',
  '  JOIN project p ON p.project_id = bm.project_id',
  '  WHERE bm.requested_date BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date)',
  '  AND (CAST(:projectId AS bigint) IS NULL OR bm.project_id = CAST(:projectId AS bigint))',
  '  AND (CAST(:budgetAccountId AS bigint) IS NULL OR bm.budget_account_id = CAST(:budgetAccountId AS bigint))',
  "  AND (CAST(:onlyApproved AS boolean) = false OR bm.approval_status = '승인')",
  '  AND ' + SCOPE_SQL,
  '  GROUP BY bm.project_id, bm.budget_account_id',
  ') t',
].join('\n');

// 추가경정자금예산서: 승인된 추경예산 조정
const ADJUSTMENT_SQL = [
  'SELECT adj.project_id AS "projectId",',
  '  adj.budget_account_id AS "budgetAccountId",',
  '  SUM(adj.adjustment_amount) AS "adjustmentAmount"',
  'FROM budget_adjustment adj',
  'JOIN project p ON p.project_id = adj.project_id',
  "WHERE adj.adjustment_type = '추경예산'",
  "AND adj.approval_status = '승인'",
  'AND CAST(adj.created_at AS date) BETWEEN CAST(:fromDate AS date) AND CAST(:toDate AS date)',
  'AND (CAST(:projectId AS bigint) IS NULL OR adj.project_id = CAST(:projectId AS bigint))',
  'AND (CAST(:budgetAccountId AS bigint) IS NULL OR adj.budget_account_id = CAST(:budgetAccountId AS bigint))',
  'AND ' + SCOPE_SQL,
  'GROUP BY adj.project_id, adj.budget_account_id',
].join('\n');

function textOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalInt(value: unknown, name: string): number | null {
  const text = textOf(value);
  if (text === '') {
    return null;
  }
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', name + ' 값이 올바르지 않습니다.');
  }
  return Number(text);
}

function requiredDate(value: unknown, label: string): string {
  const text = textOf(value);
  if (text === '') {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '을(를) 입력해 주세요.');
  }
  if (!DATE_PATTERN.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식은 YYYY-MM-DD 입니다.');
  }
  return text;
}

@Controller('api/v1')
export class FnSfr00502Controller {
  @Get('/budget-status')
  async listBudgetStatus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const q = checks.queryOf(req.query);
    const statusType = textOf(q['statusType']);
    if (statusType === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 항목을 선택해 주세요.');
    }
    if (!STATUS_TYPES.includes(statusType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 항목이 올바르지 않습니다.');
    }
    const fromDate = requiredDate(q['fromDate'], '조회 시작일');
    const toDate = requiredDate(q['toDate'], '조회 종료일');
    if (fromDate > toDate) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 시작일은 종료일보다 늦을 수 없습니다.');
    }
    const projectId = optionalInt(q['projectId'], '프로젝트');
    const budgetAccountId = optionalInt(q['budgetAccountId'], '예산과목');
    const progressText = textOf(q['progressStatus']);
    if (progressText !== '' && !PROGRESS_STATUSES.includes(progressText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '진행상태가 올바르지 않습니다.');
    }
    const viewForm = textOf(q['viewForm']);
    if (viewForm !== '' && !VIEW_FORMS.includes(viewForm)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '보기 구분이 올바르지 않습니다.');
    }
    const pageText = textOf(q['page']);
    const sizeText = textOf(q['size']);
    if ((pageText !== '' && !/^\d+$/.test(pageText)) || (sizeText !== '' && !/^\d+$/.test(sizeText))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호나 크기가 올바르지 않습니다.');
    }
    const page = pageText === '' ? 0 : Number(pageText);
    const requestedSize = sizeText === '' ? DEFAULT_SIZE : Number(sizeText);
    const size = Math.min(Math.max(requestedSize, 1), MAX_SIZE);

    return transaction(async (db) => {
      const permissions = await db.query(
        [
          'SELECT mp.view_scope AS "scope"',
          'FROM menu_permission mp',
          'JOIN menu m ON m.menu_id = mp.menu_id',
          'WHERE mp.employee_id = CAST(:userId AS bigint)',
          'AND m.name = :menuName',
          "AND m.use_status = '사용'",
        ].join('\n'),
        { userId: user.id, menuName: MENU_NAME },
      );
      if (permissions.length === 0) {
        throw new ApiError(403, 'FORBIDDEN', '이 메뉴를 조회할 권한이 없습니다.');
      }
      const params: Record<string, unknown> = {
        fromDate,
        toDate,
        projectId,
        budgetAccountId,
        scope: permissions[0]['scope'],
        userId: user.id,
      };
      let sql = BUDGET_SQL;
      if (RESOLUTION_TYPES.includes(statusType)) {
        sql = RESOLUTION_SQL;
        params['progressStatus'] = progressText === '' ? null : progressText;
      } else if (statusType === '추가경정자금예산서') {
        sql = ADJUSTMENT_SQL;
      } else {
        // 가정: 자금예산서·자금계산서는 승인된 본예산만 집계한다.
        const onlyApproved = statusType === '자금예산서' || statusType === '자금계산서';
        params['onlyApproved'] = onlyApproved;
      }
      const totalRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM (' + sql + ') q',
        params,
      );
      const total = Number(totalRows[0]['total']);
      const rows = await db.query(
        'SELECT * FROM (' + sql + ') q ORDER BY "projectId", "budgetAccountId" LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { ...params, size, offset: page * size },
      );
      // 가정: 예실 대비 현황의 '기본'은 품의·원인행위 금액을 빼고, '상세'는 모두 보인다.
      const items = rows.map((row: Record<string, unknown>) => {
        const item = { ...row };
        if (statusType === '예실 대비 현황' && viewForm !== '상세') {
          delete item['requisitionAmount'];
          delete item['commitmentAmount'];
        }
        return item;
      });
      return { items, page, size, total };
    });
  }
}
