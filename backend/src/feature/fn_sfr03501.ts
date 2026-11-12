import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const STATUSES = ['진행 전', '진행 중', '종료'];
const CHANNELS = ['메신저', '모바일', '대화방', '메일', '포털'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PERIOD_MESSAGE = '설문 제목과 기간을 확인해 주세요. 종료일은 시작일보다 빠를 수 없습니다.';

@Controller('api/v1')
export class FnSfr03501Controller {
  @Post('/surveys')
  @HttpCode(200)
  async createSurvey(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);

    const title = typeof data.title === 'string' ? data.title.trim() : '';
    const startDate = typeof data.startDate === 'string' ? data.startDate.trim() : '';
    const endDate = typeof data.endDate === 'string' ? data.endDate.trim() : '';
    if (title === '' || title.length > 200 || !DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
      throw new ApiError(422, 'SURVEY_PERIOD_INVALID', PERIOD_MESSAGE);
    }

    const content = typeof data.content === 'string' && data.content !== '' ? data.content : null;
    if (data.content !== undefined && data.content !== null && typeof data.content !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '설문 내용 형식이 올바르지 않습니다.');
    }
    if (typeof data.status !== 'string' || !STATUSES.includes(data.status)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '진행상태는 진행 전, 진행 중, 종료 중에서 선택해 주세요.');
    }
    if (
      typeof data.commentEnabled !== 'boolean' ||
      typeof data.resultPublic !== 'boolean' ||
      typeof data.participantPublic !== 'boolean'
    ) {
      throw new ApiError(400, 'VALIDATION_FAILED', '댓글 사용, 결과 공개, 참여자 정보 공개 여부를 설정해 주세요.');
    }
    let channel: string | null = null;
    if (data.notificationChannel !== undefined && data.notificationChannel !== null && data.notificationChannel !== '') {
      if (typeof data.notificationChannel !== 'string' || !CHANNELS.includes(data.notificationChannel)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '알림 채널은 메신저, 모바일, 대화방, 메일, 포털 중에서 선택해 주세요.');
      }
      channel = data.notificationChannel;
    }
    if (!Array.isArray(data.targetEmployeeIds) || data.targetEmployeeIds.length === 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '설문 대상 임직원을 한 명 이상 지정해 주세요.');
    }
    const targetIds: number[] = [];
    for (const raw of data.targetEmployeeIds) {
      if (typeof raw !== 'number' || !Number.isInteger(raw) || raw <= 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '설문 대상 임직원 ID 형식이 올바르지 않습니다.');
      }
      if (!targetIds.includes(raw)) {
        targetIds.push(raw);
      }
    }

    return transaction(async (db) => {
      const checkRows = await db.query(
        'SELECT CAST(:endDate AS date) >= CAST(:startDate AS date) AS ok',
        { startDate, endDate },
      );
      if (checkRows.length === 0 || checkRows[0].ok !== true) {
        throw new ApiError(422, 'SURVEY_PERIOD_INVALID', PERIOD_MESSAGE);
      }

      for (const employeeId of targetIds) {
        const found = await db.query(
          'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
          { employeeId },
        );
        if (found.length === 0) {
          throw new ApiError(404, 'NOT_FOUND', '설문 대상 임직원을 찾을 수 없습니다.');
        }
      }

      const rows = await db.query(
        'INSERT INTO survey (title, content, creator_id, start_date, end_date, status, comment_enabled, result_public, participant_public, notification_channel, created_at, updated_at) ' +
          'VALUES (:title, :content, CAST(:userId AS bigint), CAST(:startDate AS date), CAST(:endDate AS date), :status, :commentEnabled, :resultPublic, :participantPublic, :channel, now(), now()) ' +
          'RETURNING survey_id AS "surveyId"',
        {
          title,
          content,
          userId: user.id,
          startDate,
          endDate,
          status: data.status,
          commentEnabled: data.commentEnabled,
          resultPublic: data.resultPublic,
          participantPublic: data.participantPublic,
          channel,
        },
      );
      const surveyId = rows[0].surveyId;

      for (const employeeId of targetIds) {
        await db.execute(
          'INSERT INTO survey_target (survey_id, employee_id, created_at, updated_at) ' +
            'VALUES (CAST(:surveyId AS bigint), CAST(:employeeId AS bigint), now(), now())',
          { surveyId, employeeId },
        );
      }

      // 설문 알림 발송은 통합알림(공통 P3)이 맡는다. 여기서는 선택한 채널만 설문에 저장한다.
      return { surveyId };
    });
  }
}
