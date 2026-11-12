import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const VIEW_SCOPES = ['전체', '부서', '개인'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function idOf(value: unknown, label: string): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const text = String(value);
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
  return Number(text);
}

function dateOf(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
  return text;
}

const FROM_WHERE = `
  FROM education_attendee a
  JOIN education_session s ON s.education_session_id = a.education_session_id
  JOIN education_course c ON c.education_course_id = s.education_course_id
  JOIN employee e ON e.employee_id = a.employee_id
  JOIN department d ON d.department_id = e.department_id
  LEFT JOIN education_application ap
    ON ap.education_session_id = a.education_session_id
   AND ap.employee_id = a.employee_id
  LEFT JOIN education_evaluation ev ON ev.education_attendee_id = a.education_attendee_id
  WHERE (CAST(:startDate AS date) IS NULL OR s.end_date >= CAST(:startDate AS date))
    AND (CAST(:endDate AS date) IS NULL OR s.start_date <= CAST(:endDate AS date))
    AND (CAST(:courseId AS bigint) IS NULL OR s.education_course_id = CAST(:courseId AS bigint))
    AND (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint))
    AND (CAST(:employeeId AS bigint) IS NULL OR a.employee_id = CAST(:employeeId AS bigint))
    AND (CAST(:ownDept AS boolean) = false
         OR e.department_id = (SELECT department_id FROM employee WHERE employee_id = CAST(:userId AS bigint)))
`;

@Controller('api/v1')
export class FnSfr01505Controller {
  @Get('/education-status')
  async listEducationStatus(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '인사 담당자');
    const query = checks.queryOf(req.query);

    // 가정: 인사 담당자 역할 보유 여부로 조회 범위(전체/부서)를 넓힌다. 일반 임직원은 개인 범위만 조회한다.
    let isHr = true;
    try {
      user.require('인사 담당자');
    } catch (e) {
      isHr = false;
    }

    const viewScope = query['viewScope'] === undefined || query['viewScope'] === null || query['viewScope'] === ''
      ? '전체'
      : String(query['viewScope']);
    if (!VIEW_SCOPES.includes(viewScope)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 범위가 올바르지 않습니다.');
    }

    const startDate = dateOf(query['startDate'], '교육 기간 시작일');
    const endDate = dateOf(query['endDate'], '교육 기간 종료일');
    const courseId = idOf(query['educationCourseId'], '교육과정');
    const departmentId = idOf(query['departmentId'], '주부서');
    let employeeId = idOf(query['employeeId'], '임직원');

    const pageValue = query['page'] === undefined || query['page'] === '' ? '0' : String(query['page']);
    const sizeValue = query['size'] === undefined || query['size'] === '' ? String(DEFAULT_SIZE) : String(query['size']);
    if (!/^\d+$/.test(pageValue) || !/^\d+$/.test(sizeValue) || Number(sizeValue) < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '페이지 값이 올바르지 않습니다.');
    }
    const page = Number(pageValue);
    const size = Math.min(Number(sizeValue), MAX_SIZE);

    // 일반 임직원 또는 개인 범위: 본인 이력만
    const personal = !isHr || viewScope === '개인';
    if (personal) {
      employeeId = Number(user.id);
    }
    // 부서 범위: 부서를 고르지 않으면 본인 주부서
    const ownDept = isHr && viewScope === '부서' && departmentId === null;

    return transaction(async (db) => {
      const params = {
        startDate,
        endDate,
        courseId,
        departmentId,
        employeeId,
        ownDept,
        userId: user.id,
      };
      const counts = await db.query('SELECT COUNT(*) AS "total" ' + FROM_WHERE, params);
      const items = await db.query(
        `SELECT c.education_course_id AS "educationCourseId",
          c.course_name AS "courseName",
          s.education_session_id AS "educationSessionId",
          s.session_no AS "sessionNo",
          to_char(s.start_date, 'YYYY-MM-DD') AS "startDate",
          to_char(s.end_date, 'YYYY-MM-DD') AS "endDate",
          e.name AS "employeeName",
          d.name AS "departmentName",
          ap.status AS "applicationStatus",
          ev.completed AS "completed",
          CAST(ev.score AS double precision) AS "score"
        ` + FROM_WHERE + `
        ORDER BY s.start_date DESC, c.education_course_id, s.session_no, e.name
        LIMIT :limit OFFSET :offset`,
        { ...params, limit: size, offset: page * size },
      );
      return {
        items,
        page,
        size,
        total: Number(counts[0]['total']),
      };
    });
  }
}
