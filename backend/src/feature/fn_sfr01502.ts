import { Controller, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '인사 담당자';

function idOf(v: unknown, label: string): number {
  if (typeof v === 'number' && Number.isInteger(v) && v > 0) return v;
  if (typeof v === 'string' && /^\d+$/.test(v) && Number(v) > 0) return Number(v);
  throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값을 확인해 주세요.');
}

function textOf(v: unknown, label: string, max: number, required: boolean): string | null {
  if (v === undefined || v === null || v === '') {
    if (required) throw new ApiError(400, 'VALIDATION_FAILED', label + '을(를) 입력해 주세요.');
    return null;
  }
  if (typeof v !== 'string' || v.trim() === '') {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값을 확인해 주세요.');
  }
  if (max > 0 && v.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) ' + max + '자 이하로 입력해 주세요.');
  }
  return v;
}

function dateOf(v: unknown, label: string): string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '을(를) YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return v;
}

async function assertCode(db: any, id: number, codeType: string): Promise<void> {
  const rows = await db.query(
    'SELECT 1 AS ok FROM education_code WHERE education_code_id = :id AND code_type = :codeType AND use_yn = CAST(:use AS varchar)',
    { id, codeType, use: '사용' },
  );
  if (rows.length === 0) {
    throw new ApiError(422, 'EDUCATION_CODE_INVALID', '교육유형 또는 교육방법이 기준정보에 없습니다.');
  }
}

@Controller('api/v1')
export class FnSfr01502Controller {
  @Post('/education-courses')
  @HttpCode(200)
  async createEducationCourse(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const courseName = textOf(data['courseName'], '교육과정명', 200, true);
    const typeId = idOf(data['educationTypeId'], '교육유형');
    const methodId = idOf(data['educationMethodId'], '교육방법');
    const description = textOf(data['description'], '과정 설명', 0, false);
    return transaction(async (db) => {
      await assertCode(db, typeId, 'EDU_TYPE');
      await assertCode(db, methodId, 'EDU_METHOD');
      const rows = await db.query(
        'INSERT INTO education_course (course_name, education_type_id, education_method_id, description, created_at, updated_at) ' +
          'VALUES (:courseName, :typeId, :methodId, :description, now(), now()) ' +
          'RETURNING education_course_id AS "educationCourseId", course_name AS "courseName", ' +
          'education_type_id AS "educationTypeId", education_method_id AS "educationMethodId"',
        { courseName, typeId, methodId, description },
      );
      return rows[0];
    });
  }

  @Patch('/education-courses/:educationCourseId')
  async updateEducationCourse(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const courseId = idOf(req.params['educationCourseId'], '교육과정');
    const data = checks.inputOf(req.body);
    const courseName = textOf(data['courseName'], '교육과정명', 200, false);
    const typeId = data['educationTypeId'] === undefined || data['educationTypeId'] === null ? null : idOf(data['educationTypeId'], '교육유형');
    const methodId = data['educationMethodId'] === undefined || data['educationMethodId'] === null ? null : idOf(data['educationMethodId'], '교육방법');
    const hasDescription = data['description'] !== undefined;
    const description = textOf(data['description'], '과정 설명', 0, false);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT education_course_id FROM education_course WHERE education_course_id = :courseId',
        { courseId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EDUCATION_COURSE_NOT_FOUND', '교육과정을 찾을 수 없습니다.');
      }
      if (typeId !== null) await assertCode(db, typeId, 'EDU_TYPE');
      if (methodId !== null) await assertCode(db, methodId, 'EDU_METHOD');
      const rows = await db.query(
        'UPDATE education_course SET ' +
          'course_name = COALESCE(CAST(:courseName AS varchar), course_name), ' +
          'education_type_id = COALESCE(CAST(:typeId AS bigint), education_type_id), ' +
          'education_method_id = COALESCE(CAST(:methodId AS bigint), education_method_id), ' +
          'description = CASE WHEN CAST(:hasDescription AS boolean) THEN CAST(:description AS text) ELSE description END, ' +
          'updated_at = now() ' +
          'WHERE education_course_id = :courseId ' +
          'RETURNING education_course_id AS "educationCourseId", course_name AS "courseName", ' +
          'education_type_id AS "educationTypeId", education_method_id AS "educationMethodId"',
        { courseName, typeId, methodId, hasDescription, description, courseId },
      );
      const changed = Object.keys(data)
        .filter((k) => ['courseName', 'educationTypeId', 'educationMethodId', 'description'].includes(k))
        .join(', ');
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :targetType, :courseId, :changeType, now(), :content, now(), now())',
        {
          userId: user.id,
          targetType: 'education_course',
          courseId,
          changeType: '수정',
          content: '교육과정 수정 항목: ' + changed,
        },
      );
      return rows[0];
    });
  }

  @Post('/education-sessions')
  @HttpCode(200)
  async createEducationSession(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const courseId = idOf(data['educationCourseId'], '교육과정');
    const sessionNo = idOf(data['sessionNo'], '차수');
    const startDate = dateOf(data['startDate'], '교육 시작일');
    const endDate = dateOf(data['endDate'], '교육 종료일');
    return transaction(async (db) => {
      const course = await db.query(
        'SELECT education_course_id FROM education_course WHERE education_course_id = :courseId',
        { courseId },
      );
      if (course.length === 0) {
        throw new ApiError(404, 'EDUCATION_COURSE_NOT_FOUND', '교육과정을 찾을 수 없습니다.');
      }
      const period = await db.query(
        'SELECT (CAST(:startDate AS date) > CAST(:endDate AS date)) AS "invalid"',
        { startDate, endDate },
      );
      if (period[0].invalid) {
        throw new ApiError(422, 'INVALID_PERIOD', '교육 시작일이 종료일보다 늦을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT 1 AS ok FROM education_session WHERE education_course_id = :courseId AND session_no = :sessionNo',
        { courseId, sessionNo },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'EDUCATION_SESSION_DUPLICATED', '같은 과정에 동일한 차수가 이미 있습니다.');
      }
      const rows = await db.query(
        'INSERT INTO education_session (education_course_id, session_no, start_date, end_date, created_at, updated_at) ' +
          'VALUES (:courseId, :sessionNo, CAST(:startDate AS date), CAST(:endDate AS date), now(), now()) ' +
          'RETURNING education_session_id AS "educationSessionId", education_course_id AS "educationCourseId", ' +
          'session_no AS "sessionNo", start_date AS "startDate", end_date AS "endDate"',
        { courseId, sessionNo, startDate, endDate },
      );
      return rows[0];
    });
  }

  @Post('/education-attendees')
  @HttpCode(200)
  async createEducationAttendee(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const sessionId = idOf(data['educationSessionId'], '교육차수');
    const employeeId = idOf(data['employeeId'], '임직원');
    return transaction(async (db) => {
      const employee = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = :employeeId',
        { employeeId },
      );
      if (employee.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원이 존재하지 않습니다.');
      }
      const session = await db.query(
        'SELECT education_session_id FROM education_session WHERE education_session_id = :sessionId',
        { sessionId },
      );
      if (session.length === 0) {
        throw new ApiError(404, 'EDUCATION_SESSION_NOT_FOUND', '교육 차수를 찾을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT 1 AS ok FROM education_attendee WHERE education_session_id = :sessionId AND employee_id = :employeeId',
        { sessionId, employeeId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'EDUCATION_ATTENDEE_DUPLICATED', '같은 차수에 이미 등록된 교육대상자입니다.');
      }
      const rows = await db.query(
        'INSERT INTO education_attendee (education_session_id, employee_id, created_at, updated_at) ' +
          'VALUES (:sessionId, :employeeId, now(), now()) ' +
          'RETURNING education_attendee_id AS "educationAttendeeId", education_session_id AS "educationSessionId", ' +
          'employee_id AS "employeeId"',
        { sessionId, employeeId },
      );
      return rows[0];
    });
  }

  @Delete('/education-attendees/:educationAttendeeId')
  async deleteEducationAttendee(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const attendeeId = idOf(req.params['educationAttendeeId'], '교육대상자');
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT education_session_id AS "sessionId", employee_id AS "employeeId" FROM education_attendee WHERE education_attendee_id = :attendeeId',
        { attendeeId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EDUCATION_ATTENDEE_NOT_FOUND', '교육대상자를 찾을 수 없습니다.');
      }
      await db.execute(
        'DELETE FROM education_attendee WHERE education_attendee_id = :attendeeId',
        { attendeeId },
      );
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :targetType, :attendeeId, :changeType, now(), :content, now(), now())',
        {
          userId: user.id,
          targetType: 'education_attendee',
          attendeeId,
          changeType: '삭제',
          content: '교육대상자 삭제: 교육차수 ' + found[0].sessionId + ', 임직원 ' + found[0].employeeId,
        },
      );
      return {};
    });
  }

  @Post('/education-result-reports')
  @HttpCode(200)
  async createEducationResultReport(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const sessionId = idOf(data['educationSessionId'], '교육차수');
    const title = textOf(data['title'], '보고 제목', 200, false);
    const reportContent = textOf(data['reportContent'], '결과보고 내용', 0, true);
    return transaction(async (db) => {
      const session = await db.query(
        'SELECT education_session_id FROM education_session WHERE education_session_id = :sessionId',
        { sessionId },
      );
      if (session.length === 0) {
        throw new ApiError(404, 'EDUCATION_SESSION_NOT_FOUND', '교육 차수를 찾을 수 없습니다.');
      }
      // 가정: 보고 일시는 등록 시각(now())으로 채운다.
      const rows = await db.query(
        'INSERT INTO education_result_report (education_session_id, title, report_content, reported_at, created_at, updated_at) ' +
          'VALUES (:sessionId, :title, :reportContent, now(), now(), now()) ' +
          'RETURNING education_result_report_id AS "educationResultReportId", education_session_id AS "educationSessionId", ' +
          'title AS "title", report_content AS "reportContent"',
        { sessionId, title, reportContent },
      );
      return rows[0];
    });
  }
}
