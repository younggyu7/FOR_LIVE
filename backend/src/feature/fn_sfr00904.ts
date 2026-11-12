import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 조회 범위는 전체/부서/개인 세 가지다.
const SCOPES = ['전체', '부서', '개인'];
// 가정: 자금일보 결재 문서는 제목이 '자금일보'로 시작하고 생성일이 기준 일자인 문서다.
const REPORT_TITLE_PREFIX = '자금일보%';

@Controller('api/v1')
export class FnSfr00904Controller {
  @Get('/daily-fund-reports')
  async listDailyFundReports(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const query = checks.queryOf(req.query);
    const rawDate = query['reportDate'];
    const reportDate = typeof rawDate === 'string' ? rawDate.trim() : '';
    if (!reportDate) {
      throw new ApiError(422, 'FUND_REPORT_DATE_REQUIRED', '조회 일자를 입력해 주세요.');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    const rawScope = query['scope'];
    const scope = rawScope === undefined || rawScope === null || rawScope === '' ? '전체' : String(rawScope);
    if (!SCOPES.includes(scope)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 범위는 전체, 부서, 개인 중 하나여야 합니다.');
    }
    const rawPage = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const rawSize = query['size'] === undefined || query['size'] === '' ? 20 : Number(query['size']);
    if (!Number.isInteger(rawPage) || rawPage < 0 || !Number.isInteger(rawSize) || rawSize < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const page = rawPage;
    const size = Math.min(rawSize, 200);

    return transaction(async (db) => {
      let scopeWhere = '';
      if (scope === '개인') {
        scopeWhere = 'AND d.drafter_id = CAST(:userId AS bigint)';
      } else if (scope === '부서') {
        scopeWhere = 'AND e.department_id = (SELECT department_id FROM employee WHERE employee_id = CAST(:userId AS bigint))';
      }
      const from = `FROM approval_document d
        JOIN employee e ON e.employee_id = d.drafter_id
        WHERE CAST(d.created_at AS date) = CAST(:reportDate AS date)
          AND d.title LIKE :titlePrefix
          ${scopeWhere}`;
      const params = {
        reportDate,
        titlePrefix: REPORT_TITLE_PREFIX,
        userId: user.id,
        limit: size,
        offset: page * size,
      };
      const counted = await db.query(`SELECT COUNT(*) AS "total" ${from}`, params);
      const total = Number(counted[0]?.['total'] ?? 0);
      const rows = await db.query(
        `SELECT CAST(:reportDate AS date) AS "reportDate",
          d.approval_status AS "approvalStatus"
        ${from}
        ORDER BY d.approval_document_id
        LIMIT :limit OFFSET :offset`,
        params,
      );
      // TODO: 입출금·잔액 집계 테이블이 schema.sql에 없어 금액 필드는 null로 둔다.
      const items = rows.map((row: any) => ({
        reportDate,
        previousBalance: null,
        depositAmount: null,
        withdrawalAmount: null,
        currentBalance: null,
        approvalStatus: row.approvalStatus,
      }));
      return { items, page, size, total };
    });
  }
}
