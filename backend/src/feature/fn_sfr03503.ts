import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: survey_question에는 필수 여부 컬럼이 없어 모든 문항을 필수로 본다.
// 선택형은 선택지 1개 이상, 주관식은 주관식 응답이 있어야 응답한 것으로 본다.

interface QuestionRow {
  questionId: number;
  questionType: string;
  answerMode: string | null;
  otherOpinionEnabled: boolean;
  title: string;
}

interface OptionRow {
  optionId: number;
  questionId: number;
}

interface AnswerIn {
  optionIds: number[];
  textAnswer: string | null;
  otherOpinion: string | null;
}

function badRequest(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function toId(value: unknown): number {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isInteger(n) || n <= 0) {
    throw badRequest('ID 형식이 올바르지 않습니다.');
  }
  return n;
}

function toText(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw badRequest('글자로 입력해야 하는 값이 올바르지 않습니다.');
  }
  const text = value.trim();
  return text === '' ? null : text;
}

@Controller('api/v1')
export class FnSfr03503Controller {
  @Post('/surveys/:surveyId/responses')
  @HttpCode(200)
  async submitSurveyResponses(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const surveyIdText = req.params['surveyId'];
    if (!/^\d+$/.test(surveyIdText)) {
      throw badRequest('설문 ID 형식이 올바르지 않습니다.');
    }
    if (!Array.isArray(data.answers)) {
      throw badRequest('문항별 응답을 입력해 주세요.');
    }
    const answerMap = new Map<number, AnswerIn>();
    for (const raw of data.answers as unknown[]) {
      if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw badRequest('문항별 응답 형식이 올바르지 않습니다.');
      }
      const item = raw as Record<string, unknown>;
      const questionId = toId(item.surveyQuestionId);
      if (answerMap.has(questionId)) {
        throw badRequest('같은 문항에 응답이 중복되었습니다.');
      }
      const rawOptions = item.surveyOptionIds === undefined || item.surveyOptionIds === null ? [] : item.surveyOptionIds;
      if (!Array.isArray(rawOptions)) {
        throw badRequest('선택지 형식이 올바르지 않습니다.');
      }
      const optionIds = (rawOptions as unknown[]).map(toId);
      if (new Set(optionIds).size !== optionIds.length) {
        throw badRequest('같은 선택지를 중복해서 고를 수 없습니다.');
      }
      answerMap.set(questionId, {
        optionIds,
        textAnswer: toText(item.textAnswer),
        otherOpinion: toText(item.otherOpinion),
      });
    }
    const comment = toText(data.comment);

    return transaction(async (db) => {
      const surveys = await db.query(
        `SELECT status, comment_enabled AS "commentEnabled",
                (CURRENT_DATE BETWEEN start_date AND end_date) AS "inPeriod"
           FROM survey
          WHERE survey_id = CAST(:surveyId AS bigint)`,
        { surveyId: surveyIdText },
      );
      if (surveys.length === 0) {
        throw new ApiError(404, 'SURVEY_NOT_FOUND', '설문을 찾을 수 없습니다.');
      }
      const survey = surveys[0] as { status: string; commentEnabled: boolean; inPeriod: boolean };

      const targets = await db.query(
        `SELECT survey_target_id AS "surveyTargetId"
           FROM survey_target
          WHERE survey_id = CAST(:surveyId AS bigint)
            AND employee_id = CAST(:userId AS bigint)`,
        { surveyId: surveyIdText, userId: user.id },
      );
      if (targets.length === 0) {
        throw new ApiError(422, 'SURVEY_NOT_ALLOWED', '설문 대상자가 아니어서 응답할 수 없습니다.');
      }
      if (survey.status !== '진행 중' || !survey.inPeriod) {
        throw new ApiError(422, 'SURVEY_NOT_ALLOWED', '진행 중이 아니거나 설문 기간이 아니어서 응답할 수 없습니다.');
      }

      // 설문당 1회 응답
      const done = await db.query(
        `SELECT r.survey_response_id AS "surveyResponseId"
           FROM survey_response r
           JOIN survey_question q ON q.survey_question_id = r.survey_question_id
          WHERE q.survey_id = CAST(:surveyId AS bigint)
            AND r.respondent_id = CAST(:userId AS bigint)`,
        { surveyId: surveyIdText, userId: user.id },
      );
      if (done.length > 0) {
        throw new ApiError(409, 'SURVEY_ALREADY_RESPONDED', '이미 응답한 설문입니다.');
      }

      if (comment !== null && !survey.commentEnabled) {
        throw new ApiError(422, 'SURVEY_COMMENT_DISABLED', '댓글을 사용하지 않는 설문입니다.');
      }

      const questions = (await db.query(
        `SELECT survey_question_id AS "questionId", title,
                question_type AS "questionType", answer_mode AS "answerMode",
                other_opinion_enabled AS "otherOpinionEnabled"
           FROM survey_question
          WHERE survey_id = CAST(:surveyId AS bigint)
          ORDER BY sort_order, survey_question_id`,
        { surveyId: surveyIdText },
      )) as QuestionRow[];
      const options = (await db.query(
        `SELECT o.survey_option_id AS "optionId", o.survey_question_id AS "questionId"
           FROM survey_option o
           JOIN survey_question q ON q.survey_question_id = o.survey_question_id
          WHERE q.survey_id = CAST(:surveyId AS bigint)`,
        { surveyId: surveyIdText },
      )) as OptionRow[];

      const questionById = new Map<number, QuestionRow>();
      for (const q of questions) {
        questionById.set(Number(q.questionId), q);
      }
      for (const questionId of answerMap.keys()) {
        if (!questionById.has(questionId)) {
          throw badRequest('이 설문에 없는 문항에 응답했습니다.');
        }
      }

      const missing: string[] = [];
      for (const q of questions) {
        const questionId = Number(q.questionId);
        const answer = answerMap.get(questionId);
        const choice = q.questionType === '선택형';
        const answered = answer !== undefined && (choice ? answer.optionIds.length > 0 : answer.textAnswer !== null);
        if (!answered) {
          missing.push(q.title);
        }
      }
      if (missing.length > 0) {
        throw new ApiError(422, 'SURVEY_REQUIRED_ANSWER_MISSING', `응답하지 않은 문항이 있습니다: ${missing.join(', ')}`);
      }

      for (const q of questions) {
        const questionId = Number(q.questionId);
        const answer = answerMap.get(questionId) as AnswerIn;
        if (q.questionType === '선택형') {
          if (answer.textAnswer !== null) {
            throw badRequest('선택형 문항에는 주관식 응답을 입력할 수 없습니다.');
          }
          if (q.answerMode === '단답' && answer.optionIds.length > 1) {
            throw badRequest('단답형 문항은 선택지를 하나만 고를 수 있습니다.');
          }
          for (const optionId of answer.optionIds) {
            const owned = options.some((o) => Number(o.optionId) === optionId && Number(o.questionId) === questionId);
            if (!owned) {
              throw badRequest('문항에 속하지 않는 선택지입니다.');
            }
          }
        } else if (answer.optionIds.length > 0) {
          throw badRequest('주관식 문항에는 선택지를 고를 수 없습니다.');
        }
        if (answer.otherOpinion !== null && !q.otherOpinionEnabled) {
          throw badRequest('기타 의견을 입력할 수 없는 문항입니다.');
        }
      }

      for (const q of questions) {
        const questionId = Number(q.questionId);
        const answer = answerMap.get(questionId) as AnswerIn;
        const inserted = await db.query(
          `INSERT INTO survey_response
             (survey_question_id, respondent_id, text_answer, other_opinion, submitted_at, created_at, updated_at)
           VALUES
             (CAST(:questionId AS bigint), CAST(:userId AS bigint), :textAnswer, :otherOpinion, now(), now(), now())
           RETURNING survey_response_id AS "surveyResponseId"`,
          {
            questionId,
            userId: user.id,
            textAnswer: answer.textAnswer,
            otherOpinion: answer.otherOpinion,
          },
        );
        const responseId = (inserted[0] as { surveyResponseId: number }).surveyResponseId;
        for (const optionId of answer.optionIds) {
          await db.execute(
            `INSERT INTO survey_response_option
               (survey_response_id, survey_option_id, created_at, updated_at)
             VALUES (CAST(:responseId AS bigint), CAST(:optionId AS bigint), now(), now())`,
            { responseId, optionId },
          );
        }
      }

      if (comment !== null) {
        await db.execute(
          `INSERT INTO survey_comment
             (survey_id, author_id, content, created_at, updated_at)
           VALUES (CAST(:surveyId AS bigint), CAST(:userId AS bigint), :content, now(), now())`,
          { surveyId: surveyIdText, userId: user.id, content: comment },
        );
      }

      // 가정: 응답 저장 여부는 고정값 true
      return { submitted: true };
    });
  }
}
