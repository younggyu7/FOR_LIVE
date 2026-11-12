import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 목록 크기 기본값과 최대값
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Controller('api/v1')
export class FnSfr01005Controller {
  @Get('/management-cost-reports')
  async listManagementCostReports(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.queryOf(req.query);

    const startDate = data['startDate'];
    const endDate = data['endDate'];
    if (
      typeof startDate !== 'string' ||
      typeof endDate !== 'string' ||
      startDate === '' ||
      endDate === ''
    ) {
      throw new ApiError(422, 'INVALID_PERIOD', '조회 기간을 입력해 주세요.');
    }
    if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '날짜는 YYYY-MM-DD 형식으로 입력해 주세요.');
    }

    const optionalId = (name: string): string | null => {
      const raw = data[name];
      if (raw === undefined || raw === null || raw === '') {
        return null;
      }
      const text = String(raw);
      if (!/^\d+$/.test(text)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '조회 조건의 ID는 숫자여야 합니다.');
      }
      return text;
    };
    const projectId = optionalId('projectId');
    const departmentId = optionalId('departmentId');
    // 회계단위는 전표·분개 라인과 연결된 컬럼이 없어 집계 조건으로 쓰지 않는다 (TODO 참고). 형식만 검사한다.
    optionalId('accountingUnitId');

    const rawPage = data['page'];
    const pageNo =
      rawPage === undefined || rawPage === null || rawPage === '' ? 0 : Number(rawPage);
    if (!Number.isInteger(pageNo) || pageNo < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
    }
    const rawSize = data['size'];
    const sizeNo =
      rawSize === undefined || rawSize === null || rawSize === ''
        ? DEFAULT_SIZE
        : Number(rawSize);
    if (!Number.isInteger(sizeNo) || sizeNo < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
    }
    const size = Math.min(sizeNo, MAX_SIZE);

    return transaction(async (db) => {
      const periodRows = await db.query(
        'SELECT (CAST(:startDate AS date) > CAST(:endDate AS date)) AS "invalid"',
        { startDate, endDate },
      );
      if (periodRows[0] && periodRows[0]['invalid'] === true) {
        throw new ApiError(422, 'INVALID_PERIOD', '시작일은 종료일보다 늦을 수 없습니다.');
      }

      // 가정: 비용 계정 분개 라인의 차변-대변 합계, 전표 상태는 구분하지 않고 전표 일자로 기간을 거른다
      const from = `
        FROM journal_entry_line l
        JOIN journal_entry j ON j.journal_entry_id = l.journal_entry_id
        JOIN account_subject s ON s.account_subject_id = l.account_subject_id
        LEFT JOIN project p ON p.project_id = l.project_id
        LEFT JOIN department d ON d.department_id = p.department_id
        WHERE s.category = '비용'
          AND j.entry_date >= CAST(:startDate AS date)
          AND j.entry_date <= CAST(:endDate AS date)
          AND (CAST(:projectId AS bigint) IS NULL OR p.project_id = CAST(:projectId AS bigint))
          AND (CAST(:departmentId AS bigint) IS NULL OR d.department_id = CAST(:departmentId AS bigint))
      `;
      const groupBy = `
        GROUP BY s.account_subject_id, s.name, p.project_id, p.name, d.department_id, d.name
      `;
      const params = { startDate, endDate, projectId, departmentId };

      const items = await db.query(
        `
        SELECT s.name AS "accountSubjectName",
               p.name AS "projectName",
               d.name AS "departmentName",
               CAST(SUM(l.debit_amount - l.credit_amount) AS numeric) AS "costAmount"
        ${from}
        ${groupBy}
        ORDER BY d.name, p.name, s.name
        LIMIT :limit OFFSET :offset
        `,
        { ...params, limit: size, offset: pageNo * size },
      );

      const totalRows = await db.query(
        `
        SELECT COUNT(*) AS "total" FROM (
          SELECT s.account_subject_id
          ${from}
          ${groupBy}
        ) g
        `,
        params,
      );
      const total = Number(totalRows[0]['total']);

      return {
        items: items.map((row) => ({
          accountSubjectName: row['accountSubjectName'],
          projectName: row['projectName'],
          departmentName: row['departmentName'],
          costAmount: Number(row['costAmount']),
        })),
        page: pageNo,
        size,
        total,
      };
    });
  }
}
