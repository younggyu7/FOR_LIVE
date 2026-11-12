import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const POST_TYPES = ['공지', '게시글'];
const SCOPES = ['전체', '부서', '개인'];

function missingField(): ApiError {
  return new ApiError(422, 'BOARD_POST_REQUIRED_FIELD_MISSING', '구분·분류·제목·내용·공개범위를 모두 입력해 주세요.');
}

function periodInvalid(): ApiError {
  return new ApiError(422, 'BOARD_POST_PERIOD_INVALID', '시작일은 종료일보다 늦을 수 없습니다. 기간을 다시 확인해 주세요.');
}

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function textOf(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function dateOf(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw invalid('날짜는 YYYY-MM-DD 형식으로 입력해 주세요.');
  }
  return value;
}

function idsOf(value: unknown, label: string): number[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw invalid(label + ' 목록 형식이 올바르지 않습니다.');
  }
  const ids: number[] = [];
  for (const item of value) {
    const n = typeof item === 'number' ? item : Number(item);
    if (!Number.isInteger(n) || n <= 0) {
      throw invalid(label + '에 올바르지 않은 값이 있습니다.');
    }
    if (!ids.includes(n)) {
      ids.push(n);
    }
  }
  return ids;
}

@Controller('api/v1')
export class FnSfr03401Controller {
  @Post('/board-posts')
  @HttpCode(200)
  async createBoardPost(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '시스템 관리자');
    const data = checks.inputOf(req.body);

    const postType = textOf(data['postType']);
    const category = textOf(data['category']);
    const title = textOf(data['title']);
    const content = textOf(data['content']);
    const scope = textOf(data['visibilityScope']);
    if (!postType || !category || !title || !content || !scope) {
      throw missingField();
    }
    if (!POST_TYPES.includes(postType)) {
      throw invalid('구분은 공지 또는 게시글이어야 합니다.');
    }
    if (!SCOPES.includes(scope)) {
      throw invalid('공개범위는 전체, 부서, 개인 중 하나여야 합니다.');
    }
    if (category.length > 100) {
      throw invalid('분류는 100자 이내로 입력해 주세요.');
    }
    if (title.length > 300) {
      throw invalid('제목은 300자 이내로 입력해 주세요.');
    }

    const popupStart = dateOf(data['popupStartDate']);
    const popupEnd = dateOf(data['popupEndDate']);
    const pinStart = dateOf(data['pinStartDate']);
    const pinEnd = dateOf(data['pinEndDate']);
    // 가정: 시작일을 설정하면 종료일도 필요하다 (schema 설명). 한쪽만 있으면 기간 오류로 거절한다.
    if ((popupStart === null) !== (popupEnd === null)) {
      throw periodInvalid();
    }
    if ((pinStart === null) !== (pinEnd === null)) {
      throw periodInvalid();
    }

    const departmentIds = idsOf(data['audienceDepartmentIds'], '대상 부서');
    const employeeIds = idsOf(data['audienceEmployeeIds'], '대상 임직원');
    const attachmentIds = idsOf(data['attachmentIds'], '첨부파일');
    if (scope === '부서' && departmentIds.length === 0) {
      throw invalid('공개범위가 부서이면 대상 부서를 하나 이상 지정해 주세요.');
    }
    if (scope === '개인' && employeeIds.length === 0) {
      throw invalid('공개범위가 개인이면 대상 임직원을 하나 이상 지정해 주세요.');
    }

    return transaction(async (db) => {
      const check = await db.query(
        'SELECT (CAST(:popupStart AS date) > CAST(:popupEnd AS date)) AS "popupBad", ' +
          '(CAST(:pinStart AS date) > CAST(:pinEnd AS date)) AS "pinBad"',
        { popupStart, popupEnd, pinStart, pinEnd },
      );
      if (check[0]['popupBad'] === true || check[0]['pinBad'] === true) {
        throw periodInvalid();
      }

      if (scope === '부서') {
        for (const id of departmentIds) {
          const rows = await db.query(
            'SELECT department_id AS "departmentId" FROM department WHERE department_id = CAST(:id AS bigint)',
            { id },
          );
          if (rows.length === 0) {
            throw new ApiError(404, 'NOT_FOUND', '대상 부서를 찾을 수 없습니다.');
          }
        }
      }
      if (scope === '개인') {
        for (const id of employeeIds) {
          const rows = await db.query(
            'SELECT employee_id AS "employeeId" FROM employee WHERE employee_id = CAST(:id AS bigint)',
            { id },
          );
          if (rows.length === 0) {
            throw new ApiError(404, 'NOT_FOUND', '대상 임직원을 찾을 수 없습니다.');
          }
        }
      }
      for (const id of attachmentIds) {
        const rows = await db.query(
          'SELECT attachment_id AS "attachmentId" FROM attachment WHERE attachment_id = CAST(:id AS bigint)',
          { id },
        );
        if (rows.length === 0) {
          throw new ApiError(404, 'NOT_FOUND', '첨부파일을 찾을 수 없습니다.');
        }
      }

      const inserted = await db.query(
        'INSERT INTO board_post (author_id, post_type, category, title, content, visibility_scope, ' +
          'popup_start_date, popup_end_date, pin_start_date, pin_end_date, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :postType, :category, :title, :content, :scope, ' +
          'CAST(:popupStart AS date), CAST(:popupEnd AS date), CAST(:pinStart AS date), CAST(:pinEnd AS date), now(), now()) ' +
          'RETURNING board_post_id AS "boardPostId"',
        { userId: user.id, postType, category, title, content, scope, popupStart, popupEnd, pinStart, pinEnd },
      );
      const boardPostId = Number(inserted[0]['boardPostId']);

      if (scope === '부서') {
        for (const id of departmentIds) {
          await db.execute(
            'INSERT INTO post_audience (board_post_id, department_id, created_at, updated_at) ' +
              'VALUES (CAST(:postId AS bigint), CAST(:id AS bigint), now(), now())',
            { postId: boardPostId, id },
          );
        }
      }
      if (scope === '개인') {
        for (const id of employeeIds) {
          await db.execute(
            'INSERT INTO post_audience (board_post_id, employee_id, created_at, updated_at) ' +
              'VALUES (CAST(:postId AS bigint), CAST(:id AS bigint), now(), now())',
            { postId: boardPostId, id },
          );
        }
      }
      for (const id of attachmentIds) {
        await db.execute(
          'UPDATE attachment SET target_type = :targetType, target_id = CAST(:postId AS bigint), updated_at = now() ' +
            'WHERE attachment_id = CAST(:id AS bigint)',
          { targetType: 'BOARD_POST', postId: boardPostId, id },
        );
      }

      // 가정: 등록 완료 여부는 고정값 true
      return { boardPostId, registered: true };
    });
  }
}
