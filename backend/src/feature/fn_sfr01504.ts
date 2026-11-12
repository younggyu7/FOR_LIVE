import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function parseId(value: unknown, label: string): string {
  const text = String(value ?? '').trim();
  if (!/^\d+$/.test(text)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return text;
}

function parseScore(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const num = Number(value);
  if (typeof value === 'boolean' || !Number.isFinite(num) || num < 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '점수는 0 이상의 숫자여야 합니다.');
  }
  return String(num);
}

function parseCompleted(value: unknown): boolean | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'boolean') {
    throw new ApiError(400, 'VALIDATION_FAILED', '수료 여부는 true 또는 false여야 합니다.');
  }
  return value;
}

function parseItem(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ApiError(422, 'EVALUATION_ITEM_REQUIRED', '평가 항목을 입력해 주세요.');
  }
  if (value.length > 200) {
    throw new ApiError(400, 'VALIDATION_FAILED', '평가 항목은 200자 이하여야 합니다.');
  }
  return value.trim();
}

@Controller('api/v1')
export class FnSfr01504Controller {
  @Get('/education-evaluations')
  async listEducationEvaluations(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '인사 담당자');
    const query = checks.queryOf(req.query);
    const sessionId = parseId(query['educationSessionId'], '교육 차수 ID');
    const pageNum = Number(query['page']);
    const page = Number.isInteger(pageNum) && pageNum >= 0 ? pageNum : 0;
    const sizeNum = Number(query['size']);
    let size = Number.isInteger(sizeNum) && sizeNum >= 1 ? sizeNum : DEFAULT_SIZE;
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT ev.education_evaluation_id AS "educationEvaluationId",
                ev.education_attendee_id AS "educationAttendeeId",
                e.name AS "employeeName",
                ev.evaluation_item AS "evaluationItem",
                ev.score AS "score",
                ev.completed AS "completed",
                ev.evaluated_at AS "evaluatedAt"
           FROM education_evaluation ev
           JOIN education_attendee a ON a.education_attendee_id = ev.education_attendee_id
           JOIN employee e ON e.employee_id = a.employee_id
          WHERE a.education_session_id = CAST(:sessionId AS bigint)
          ORDER BY ev.education_evaluation_id
          LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { sessionId, size, offset: page * size },
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM education_evaluation ev
           JOIN education_attendee a ON a.education_attendee_id = ev.education_attendee_id
          WHERE a.education_session_id = CAST(:sessionId AS bigint)`,
        { sessionId },
      );
      const total = Number(counts[0]['total']);
      return { items, page, size, total };
    });
  }

  @Post('/education-evaluations')
  @HttpCode(200)
  async createEducationEvaluation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    const attendeeId = parseId(data['educationAttendeeId'], '교육대상자 ID');
    const item = parseItem(data['evaluationItem']);
    const score = parseScore(data['score']);
    const completed = parseCompleted(data['completed']);
    return transaction(async (db) => {
      const attendees = await db.query(
        `SELECT (s.end_date < CURRENT_DATE) AS "ended"
           FROM education_attendee a
           JOIN education_session s ON s.education_session_id = a.education_session_id
          WHERE a.education_attendee_id = CAST(:attendeeId AS bigint)`,
        { attendeeId },
      );
      if (attendees.length === 0) {
        throw new ApiError(404, 'EDUCATION_ATTENDEE_NOT_FOUND', '교육대상자로 등록되지 않은 임직원입니다.');
      }
      if (attendees[0]['ended'] !== true) {
        throw new ApiError(422, 'EDUCATION_NOT_ENDED', '교육이 종료된 뒤에 평가를 등록할 수 있습니다.');
      }
      const duplicates = await db.query(
        `SELECT education_evaluation_id
           FROM education_evaluation
          WHERE education_attendee_id = CAST(:attendeeId AS bigint)
            AND evaluation_item = :item`,
        { attendeeId, item },
      );
      if (duplicates.length > 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '같은 평가 항목이 이미 등록되어 있습니다.');
      }
      const rows = await db.query(
        `INSERT INTO education_evaluation
           (education_attendee_id, evaluation_item, score, completed, evaluated_at, created_at, updated_at)
         VALUES
           (CAST(:attendeeId AS bigint), :item, CAST(:score AS numeric), CAST(:completed AS boolean), now(), now(), now())
         RETURNING education_evaluation_id AS "educationEvaluationId",
                   education_attendee_id AS "educationAttendeeId",
                   evaluation_item AS "evaluationItem",
                   score AS "score",
                   completed AS "completed"`,
        { attendeeId, item, score, completed },
      );
      return rows[0];
    });
  }

  @Patch('/education-evaluations/:educationEvaluationId')
  async updateEducationEvaluation(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    const evaluationId = parseId(req.params['educationEvaluationId'], '교육평가 ID');
    const hasItem = data['evaluationItem'] !== undefined && data['evaluationItem'] !== null;
    const item = hasItem ? parseItem(data['evaluationItem']) : null;
    const score = parseScore(data['score']);
    const completed = parseCompleted(data['completed']);
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT education_evaluation_id
           FROM education_evaluation
          WHERE education_evaluation_id = CAST(:evaluationId AS bigint)`,
        { evaluationId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'EDUCATION_EVALUATION_NOT_FOUND', '교육평가를 찾을 수 없습니다.');
      }
      const rows = await db.query(
        `UPDATE education_evaluation
            SET evaluation_item = COALESCE(CAST(:item AS varchar), evaluation_item),
                score = COALESCE(CAST(:score AS numeric), score),
                completed = COALESCE(CAST(:completed AS boolean), completed),
                evaluated_at = now(),
                updated_at = now()
          WHERE education_evaluation_id = CAST(:evaluationId AS bigint)
          RETURNING education_evaluation_id AS "educationEvaluationId",
                    evaluation_item AS "evaluationItem",
                    score AS "score",
                    completed AS "completed"`,
        { evaluationId, item, score, completed },
      );
      return rows[0];
    });
  }
}
