import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 연동 사용 여부는 system_setting(분류 '근태', 키 'COMMUTE_LINK_ENABLED', 값 'true')으로 판단한다.
const LINK_CATEGORY = '근태';
const LINK_KEY = 'COMMUTE_LINK_ENABLED';
const LINK_ENABLED_VALUE = 'true';
// 가정: 목록 크기 기본값과 최대값
const SIZE_DEFAULT = 20;
const SIZE_MAX = 200;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;
const ID_RE = /^\d+$/;

function fail(message: string): never {
  throw new ApiError(400, 'VALIDATION_FAILED', message);
}

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function dateOf(v: unknown, label: string, required: boolean): string | null {
  if (isEmpty(v)) {
    if (required) {
      fail(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (typeof v !== 'string' || !DATE_RE.test(v)) {
    fail(label + ' 형식이 올바르지 않습니다.');
  }
  return v as string;
}

function timeOf(v: unknown, label: string): string | null {
  if (isEmpty(v)) {
    return null;
  }
  if (typeof v !== 'string' || !DATETIME_RE.test(v)) {
    fail(label + ' 형식이 올바르지 않습니다.');
  }
  return v as string;
}

function idOf(v: unknown, label: string, required: boolean): string | null {
  if (isEmpty(v)) {
    if (required) {
      fail(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  const text = String(v);
  if (!ID_RE.test(text)) {
    fail(label + ' 형식이 올바르지 않습니다.');
  }
  return text;
}

function intOf(v: unknown, fallback: number): number {
  if (isEmpty(v)) {
    return fallback;
  }
  const text = String(v);
  if (!ID_RE.test(text)) {
    fail('page, size는 0 이상의 숫자여야 합니다.');
  }
  return Number(text);
}

@Controller('api/v1')
export class FnSfr01803Controller {
  @Post('/commute-records')
  @HttpCode(200)
  async createCommuteRecord(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const workDate = dateOf(data['workDate'], '근무일자', true);
    const checkInAt = timeOf(data['checkInAt'], '출근시각');
    const checkOutAt = timeOf(data['checkOutAt'], '퇴근시각');
    return transaction(async (db) => {
      if (checkInAt !== null && checkOutAt !== null) {
        const cmp = await db.query(
          'SELECT (CAST(:checkOutAt AS timestamptz) >= CAST(:checkInAt AS timestamptz)) AS ok',
          { checkInAt, checkOutAt },
        );
        if (cmp[0]['ok'] === false) {
          fail('퇴근시각은 출근시각 이후여야 합니다.');
        }
      }
      const exist = await db.query(
        `SELECT is_closed AS "isClosed"
           FROM commute_record
          WHERE employee_id = CAST(:userId AS bigint)
            AND work_date = CAST(:workDate AS date)`,
        { userId: user.id, workDate },
      );
      if (exist.length > 0) {
        if (exist[0]['isClosed'] === true) {
          throw new ApiError(409, 'COMMUTE_RECORD_CLOSED', '마감된 일자의 출퇴근 기록입니다.');
        }
        throw new ApiError(409, 'COMMUTE_RECORD_DUPLICATED', '같은 일자의 출퇴근 기록이 이미 있습니다.');
      }
      const rows = await db.query(
        `INSERT INTO commute_record
           (employee_id, work_date, check_in_at, check_out_at, is_linked, is_closed, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), CAST(:workDate AS date), CAST(:checkInAt AS timestamptz),
            CAST(:checkOutAt AS timestamptz), false, false, now(), now())
         RETURNING commute_record_id AS "commuteRecordId",
                   work_date AS "workDate",
                   check_in_at AS "checkInAt",
                   check_out_at AS "checkOutAt"`,
        { userId: user.id, workDate, checkInAt, checkOutAt },
      );
      return rows[0];
    });
  }

  @Post('/commute-records/receive-linked')
  @HttpCode(200)
  async receiveLinkedCommuteRecords(@Req() req: Request) {
    const user = currentUser(req);
    user.require('로그인 사용자');
    const data = checks.inputOf(req.body);
    const employeeId = idOf(data['employeeId'], '임직원', true);
    const workDate = dateOf(data['workDate'], '근무일자', true);
    const checkInAt = timeOf(data['checkInAt'], '출근시각');
    const checkOutAt = timeOf(data['checkOutAt'], '퇴근시각');
    return transaction(async (db) => {
      const setting = await db.query(
        `SELECT setting_value AS "value"
           FROM system_setting
          WHERE category = :category AND setting_key = :settingKey`,
        { category: LINK_CATEGORY, settingKey: LINK_KEY },
      );
      if (setting.length === 0 || setting[0]['value'] !== LINK_ENABLED_VALUE) {
        throw new ApiError(422, 'COMMUTE_LINK_DISABLED', '근태 설정에서 출퇴근 연동을 사용하지 않습니다.');
      }
      const emp = await db.query(
        'SELECT employee_id AS "employeeId" FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      if (emp.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
      }
      if (checkInAt !== null && checkOutAt !== null) {
        const cmp = await db.query(
          'SELECT (CAST(:checkOutAt AS timestamptz) >= CAST(:checkInAt AS timestamptz)) AS ok',
          { checkInAt, checkOutAt },
        );
        if (cmp[0]['ok'] === false) {
          fail('퇴근시각은 출근시각 이후여야 합니다.');
        }
      }
      const exist = await db.query(
        `SELECT commute_record_id AS "commuteRecordId", is_closed AS "isClosed"
           FROM commute_record
          WHERE employee_id = CAST(:employeeId AS bigint)
            AND work_date = CAST(:workDate AS date)`,
        { employeeId, workDate },
      );
      let commuteRecordId: number;
      if (exist.length > 0) {
        if (exist[0]['isClosed'] === true) {
          throw new ApiError(409, 'COMMUTE_RECORD_CLOSED', '마감된 일자의 출퇴근 기록입니다.');
        }
        commuteRecordId = exist[0]['commuteRecordId'] as number;
        await db.execute(
          `UPDATE commute_record
              SET check_in_at = COALESCE(CAST(:checkInAt AS timestamptz), check_in_at),
                  check_out_at = COALESCE(CAST(:checkOutAt AS timestamptz), check_out_at),
                  is_linked = true,
                  updated_at = now()
            WHERE commute_record_id = CAST(:commuteRecordId AS bigint)`,
          { checkInAt, checkOutAt, commuteRecordId },
        );
      } else {
        const rows = await db.query(
          `INSERT INTO commute_record
             (employee_id, work_date, check_in_at, check_out_at, is_linked, is_closed, created_at, updated_at)
           VALUES
             (CAST(:employeeId AS bigint), CAST(:workDate AS date), CAST(:checkInAt AS timestamptz),
              CAST(:checkOutAt AS timestamptz), true, false, now(), now())
           RETURNING commute_record_id AS "commuteRecordId"`,
          { employeeId, workDate, checkInAt, checkOutAt },
        );
        commuteRecordId = rows[0]['commuteRecordId'] as number;
      }
      // 결정: 수신·저장이 끝난 건이므로 연계 이력은 SUCCESS로 남긴다.
      const logs = await db.query(
        `INSERT INTO link_log
           (requester_id, link_target, status, requested_at, completed_at, request_summary, processed_count, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), 'COMMUTE_SYSTEM', 'SUCCESS', now(), now(), :summary, 1, now(), now())
         RETURNING link_log_id AS "linkLogId", status AS "status"`,
        { userId: user.id, summary: '출퇴근 수신 ' + workDate },
      );
      return {
        commuteRecordId,
        linkLogId: logs[0]['linkLogId'],
        status: logs[0]['status'],
      };
    });
  }

  @Get('/commute-records')
  async listCommuteRecords(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '근태 담당자');
    const q = checks.queryOf(req.query);
    const employeeId = idOf(q['employeeId'], '임직원', false);
    const startDate = dateOf(q['startDate'], '조회 시작일', false);
    const endDate = dateOf(q['endDate'], '조회 종료일', false);
    const page = intOf(q['page'], 0);
    const size = Math.min(Math.max(intOf(q['size'], SIZE_DEFAULT), 1), SIZE_MAX);
    return transaction(async (db) => {
      const where = `(CAST(:employeeId AS bigint) IS NULL OR employee_id = CAST(:employeeId AS bigint))
          AND (CAST(:startDate AS date) IS NULL OR work_date >= CAST(:startDate AS date))
          AND (CAST(:endDate AS date) IS NULL OR work_date <= CAST(:endDate AS date))`;
      const filter = { employeeId, startDate, endDate };
      const count = await db.query(
        'SELECT COUNT(*) AS "total" FROM commute_record WHERE ' + where,
        filter,
      );
      const items = await db.query(
        `SELECT commute_record_id AS "commuteRecordId",
                employee_id AS "employeeId",
                work_date AS "workDate",
                check_in_at AS "checkInAt",
                check_out_at AS "checkOutAt",
                is_linked AS "isLinked",
                is_closed AS "isClosed"
           FROM commute_record
          WHERE ${where}
          ORDER BY work_date DESC, commute_record_id DESC
          LIMIT :size OFFSET :offset`,
        { ...filter, size, offset: page * size },
      );
      return { items, page, size, total: Number(count[0]['total']) };
    });
  }

  @Patch('/commute-records/:commuteRecordId')
  async updateCommuteRecord(@Req() req: Request) {
    const user = currentUser(req);
    user.require('근태 담당자');
    const commuteRecordId = idOf(req.params['commuteRecordId'], '출퇴근 기록 ID', true);
    const data = checks.inputOf(req.body);
    const checkInAt = timeOf(data['checkInAt'], '출근시각');
    const checkOutAt = timeOf(data['checkOutAt'], '퇴근시각');
    return transaction(async (db) => {
      const exist = await db.query(
        `SELECT is_closed AS "isClosed"
           FROM commute_record
          WHERE commute_record_id = CAST(:commuteRecordId AS bigint)`,
        { commuteRecordId },
      );
      if (exist.length === 0) {
        throw new ApiError(404, 'COMMUTE_RECORD_NOT_FOUND', '출퇴근 기록을 찾을 수 없습니다.');
      }
      if (exist[0]['isClosed'] === true) {
        throw new ApiError(409, 'COMMUTE_RECORD_CLOSED', '마감된 일자의 기록은 수정할 수 없습니다.');
      }
      const cmp = await db.query(
        `SELECT (COALESCE(CAST(:checkOutAt AS timestamptz), check_out_at)
                 >= COALESCE(CAST(:checkInAt AS timestamptz), check_in_at)) AS ok
           FROM commute_record
          WHERE commute_record_id = CAST(:commuteRecordId AS bigint)`,
        { checkInAt, checkOutAt, commuteRecordId },
      );
      if (cmp[0]['ok'] === false) {
        fail('퇴근시각은 출근시각 이후여야 합니다.');
      }
      const rows = await db.query(
        `UPDATE commute_record
            SET check_in_at = COALESCE(CAST(:checkInAt AS timestamptz), check_in_at),
                check_out_at = COALESCE(CAST(:checkOutAt AS timestamptz), check_out_at),
                updated_at = now()
          WHERE commute_record_id = CAST(:commuteRecordId AS bigint)
          RETURNING commute_record_id AS "commuteRecordId",
                    check_in_at AS "checkInAt",
                    check_out_at AS "checkOutAt"`,
        { checkInAt, checkOutAt, commuteRecordId },
      );
      return rows[0];
    });
  }
}
