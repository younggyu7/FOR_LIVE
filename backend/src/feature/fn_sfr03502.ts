import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 목록 크기 기본값과 최대값
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 문항 제목·선택지 최대 길이는 schema.sql 컬럼 길이와 같다
const TITLE_MAX = 500;
const OPTION_MAX = 500;

const QUESTION_TYPES = ['선택형', '주관식'];
const ANSWER_MODES = ['단답', '다답'];

function toId(value: unknown): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  if (!Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '설문을 올바르게 선택해 주세요.');
  }
  return n;
}

function toNonNegativeInt(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 0 이상의 정수여야 합니다.');
  }
  return n;
}

@Controller('api/v1')
export class FnSfr03502Controller {
  @Post('/survey-questions')
  @HttpCode(200)
  async createSurveyQuestion(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const surveyId = toId(data['surveyId']);
    const questionType = data['questionType'];
    if (typeof questionType !== 'string' || !QUESTION_TYPES.includes(questionType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '문항 유형은 선택형 또는 주관식이어야 합니다.');
    }
    const rawMode = data['answerMode'];
    if (rawMode !== undefined && rawMode !== null && rawMode !== '' && (typeof rawMode !== 'string' || !ANSWER_MODES.includes(rawMode))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '응답 방식은 단답 또는 다답이어야 합니다.');
    }
    if (typeof data['otherOpinionEnabled'] !== 'boolean') {
      throw new ApiError(400, 'VALIDATION_FAILED', '기타 의견 입력 여부를 선택해 주세요.');
    }
    const otherOpinionEnabled = data['otherOpinionEnabled'] as boolean;
    const rawTitle = data['title'];
    if (rawTitle !== undefined && rawTitle !== null && typeof rawTitle !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '문항 제목은 글자여야 합니다.');
    }
    const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
    if (title === '') {
      throw new ApiError(422, 'SURVEY_QUESTION_INVALID', '문항 제목을 입력해 주세요.');
    }
    if (title.length > TITLE_MAX) {
      throw new ApiError(400, 'VALIDATION_FAILED', '문항 제목은 500자 이하로 입력해 주세요.');
    }
    const rawOptions = data['optionTexts'];
    if (rawOptions !== undefined && rawOptions !== null && !Array.isArray(rawOptions)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '선택지 목록 형식이 올바르지 않습니다.');
    }
    const isChoice = questionType === '선택형';
    let optionTexts: string[] = [];
    let answerMode: string | null = null;
    if (isChoice) {
      if (typeof rawMode !== 'string' || !ANSWER_MODES.includes(rawMode)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '선택형 문항은 응답 방식을 선택해야 합니다.');
      }
      answerMode = rawMode;
      const list = (rawOptions ?? []) as unknown[];
      for (const item of list) {
        if (typeof item !== 'string') {
          throw new ApiError(400, 'VALIDATION_FAILED', '선택지는 글자여야 합니다.');
        }
      }
      optionTexts = (list as string[]).map((t) => t.trim()).filter((t) => t !== '');
      if (optionTexts.length < 1) {
        throw new ApiError(422, 'SURVEY_QUESTION_INVALID', '선택형 문항은 선택지를 1개 이상 입력해야 합니다.');
      }
      if (optionTexts.some((t) => t.length > OPTION_MAX)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '선택지는 500자 이하로 입력해 주세요.');
      }
      if (new Set(optionTexts).size !== optionTexts.length) {
        throw new ApiError(422, 'SURVEY_QUESTION_INVALID', '같은 선택지를 중복해서 입력할 수 없습니다.');
      }
    }
    // 가정: 주관식은 응답 방식과 선택지를 저장하지 않는다 (answer_mode NULL)
    return transaction(async (db) => {
      const surveys = await db.query(
        'SELECT survey_id FROM survey WHERE survey_id = CAST(:surveyId AS bigint)',
        { surveyId },
      );
      if (surveys.length === 0) {
        throw new ApiError(404, 'SURVEY_NOT_FOUND', '대상 설문이 존재하지 않습니다.');
      }
      // 가정: 문항 순서는 등록순 (현재 최대 순서 + 1)
      const rows = await db.query(
        'INSERT INTO survey_question (survey_id, title, question_type, answer_mode, other_opinion_enabled, sort_order, created_at, updated_at) '
          + 'VALUES (CAST(:surveyId AS bigint), :title, :questionType, :answerMode, :otherOpinionEnabled, '
          + '(SELECT COALESCE(MAX(sort_order), -1) + 1 FROM survey_question WHERE survey_id = CAST(:surveyId AS bigint)), now(), now()) '
          + 'RETURNING survey_question_id AS "surveyQuestionId"',
        { surveyId, title, questionType, answerMode, otherOpinionEnabled },
      );
      const surveyQuestionId = Number(rows[0]['surveyQuestionId']);
      for (let i = 0; i < optionTexts.length; i++) {
        await db.execute(
          'INSERT INTO survey_option (survey_question_id, option_text, sort_order, created_at, updated_at) '
            + 'VALUES (CAST(:questionId AS bigint), :optionText, :sortOrder, now(), now())',
          { questionId: surveyQuestionId, optionText: optionTexts[i], sortOrder: i },
        );
      }
      return { surveyQuestionId };
    });
  }

  @Get('/survey-questions')
  async listSurveyQuestions(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const query = checks.queryOf(req.query);
    const surveyId = toId(query['surveyId']);
    const page = toNonNegativeInt(query['page'], 0);
    const size = Math.min(toNonNegativeInt(query['size'], DEFAULT_SIZE) || DEFAULT_SIZE, MAX_SIZE);
    return transaction(async (db) => {
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM survey_question WHERE survey_id = CAST(:surveyId AS bigint)',
        { surveyId },
      );
      const total = Number(counts[0]['total']);
      const items = await db.query(
        'SELECT survey_question_id AS "surveyQuestionId", title AS "title", question_type AS "questionType", '
          + 'answer_mode AS "answerMode", other_opinion_enabled AS "otherOpinionEnabled" '
          + 'FROM survey_question WHERE survey_id = CAST(:surveyId AS bigint) '
          + 'ORDER BY sort_order, survey_question_id LIMIT :size OFFSET :offset',
        { surveyId, size, offset: page * size },
      );
      // 선택지는 문항마다 표시 순서대로 붙인다 (값의 출처: 개발 담당자 결정)
      const result = [];
      for (const item of items) {
        const options = await db.query(
          'SELECT survey_option_id AS "surveyOptionId", option_text AS "optionText", sort_order AS "sortOrder" '
            + 'FROM survey_option WHERE survey_question_id = CAST(:questionId AS bigint) '
            + 'ORDER BY sort_order, survey_option_id',
          { questionId: item['surveyQuestionId'] },
        );
        result.push({ ...item, options });
      }
      return { items: result, page, size, total };
    });
  }
}
