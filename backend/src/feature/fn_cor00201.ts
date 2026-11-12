import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const INTEGER_PATTERN = /^\d+$/;

const FROM_WHERE = `
  FROM personal_info_access_log l
  JOIN employee e ON e.employee_id = l.employee_id
  WHERE (CAST(:startDate AS date) IS NULL OR l.accessed_at >= CAST(:startDate AS date))
    AND (CAST(:endDate AS date) IS NULL OR l.accessed_at < CAST(:endDate AS date) + 1)
    AND (CAST(:employeeId AS bigint) IS NULL OR l.employee_id = CAST(:employeeId AS bigint))
    AND (CAST(:targetInfoType AS varchar) IS NULL OR l.target_info_type = CAST(:targetInfoType AS varchar))
    AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))
`;

function textOf(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

@Controller('api/v1')
export class FnCor00201Controller {
  @Get('/personal-info-access-logs/statistics')
  async getPersonalInfoAccessStatistics(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const query = checks.queryOf(req.query);

    const startDate = textOf(query['startDate']);
    const endDate = textOf(query['endDate']);
    const employeeId = textOf(query['employeeId']);
    const targetInfoType = textOf(query['targetInfoType']);
    const departmentId = textOf(query['departmentId']);
    const pageText = textOf(query['page']);
    const sizeText = textOf(query['size']);

    if (startDate !== '' && !DATE_PATTERN.test(startDate)) {
      throw invalid('조회 시작일 형식이 올바르지 않습니다.');
    }
    if (endDate !== '' && !DATE_PATTERN.test(endDate)) {
      throw invalid('조회 종료일 형식이 올바르지 않습니다.');
    }
    if (employeeId !== '' && !INTEGER_PATTERN.test(employeeId)) {
      throw invalid('열람자 값이 올바르지 않습니다.');
    }
    if (departmentId !== '' && !INTEGER_PATTERN.test(departmentId)) {
      throw invalid('열람자 소속 부서 값이 올바르지 않습니다.');
    }
    if (targetInfoType.length > 50) {
      throw invalid('열람 대상 정보 구분은 50자 이하여야 합니다.');
    }
    if (pageText !== '' && !INTEGER_PATTERN.test(pageText)) {
      throw invalid('page 값이 올바르지 않습니다.');
    }
    if (sizeText !== '' && (!INTEGER_PATTERN.test(sizeText) || Number(sizeText) < 1)) {
      throw invalid('size 값이 올바르지 않습니다.');
    }

    const page = pageText === '' ? 0 : Number(pageText);
    const size = sizeText === '' ? DEFAULT_SIZE : Math.min(Number(sizeText), MAX_SIZE);

    const filterParams = {
      startDate: startDate === '' ? null : startDate,
      endDate: endDate === '' ? null : endDate,
      employeeId: employeeId === '' ? null : employeeId,
      targetInfoType: targetInfoType === '' ? null : targetInfoType,
      departmentId: departmentId === '' ? null : departmentId,
    };

    return transaction(async (db) => {
      if (startDate !== '' && endDate !== '') {
        const periodRows = await db.query(
          'SELECT CAST(:endDate AS date) < CAST(:startDate AS date) AS "reversed"',
          { startDate, endDate },
        );
        if (periodRows[0] && periodRows[0]['reversed'] === true) {
          throw new ApiError(422, 'INVALID_SEARCH_PERIOD', '종료일이 시작일보다 앞서 조회할 수 없습니다.');
        }
      }

      const sumRows = await db.query(
        `SELECT COUNT(*) AS "totalCount" ${FROM_WHERE}`,
        filterParams,
      );
      const totalCount = Number(sumRows[0] ? sumRows[0]['totalCount'] : 0);

      const groupRows = await db.query(
        `SELECT COUNT(*) AS "total" FROM (
           SELECT 1 ${FROM_WHERE}
           GROUP BY l.employee_id, e.department_id, l.target_info_type
         ) g`,
        filterParams,
      );
      const total = Number(groupRows[0] ? groupRows[0]['total'] : 0);

      const rows = await db.query(
        `SELECT l.employee_id AS "employeeId",
                e.department_id AS "departmentId",
                l.target_info_type AS "targetInfoType",
                COUNT(*) AS "count"
         ${FROM_WHERE}
         GROUP BY l.employee_id, e.department_id, l.target_info_type
         ORDER BY COUNT(*) DESC, l.employee_id, l.target_info_type
         LIMIT :limit OFFSET :offset`,
        { ...filterParams, limit: size, offset: page * size },
      );

      const items = rows.map((row: Record<string, unknown>) => ({
        totalCount,
        employeeId: Number(row['employeeId']),
        departmentId: Number(row['departmentId']),
        targetInfoType: row['targetInfoType'],
        count: Number(row['count']),
      }));

      return { items, page, size, total };
    });
  }
}
