import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '급여 담당자';
// 가정: 일괄 입력에서 오류 건은 제외하고 정상 건만 반영한다 (EXCLUDE_ERROR).
const PROCESS_MODE = 'EXCLUDE_ERROR';
// 가정: 개인정보 열람 이력의 대상 정보 구분 고정값.
const ACCESS_TARGET_INFO_TYPE = '일용직 급여이체 계좌';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }
  return NaN;
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

@Controller('api/v1')
export class FnSfr02112Controller {
  @Post('/daily-worker-payments/bulk')
  @HttpCode(200)
  async bulkCreateDailyWorkerPayments(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const rawItems = data['items'];
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '일괄 입력할 급여 목록이 필요합니다.');
    }
    // 가정: 업로드 이력 ID는 엑셀 업로드일 때만 오는 선택 값으로 본다.
    let uploadHistoryId: number | null = null;
    if (!isBlank(data['uploadHistoryId'])) {
      const parsed = toNumber(data['uploadHistoryId']);
      if (!Number.isInteger(parsed)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '업로드 이력 ID 형식이 올바르지 않습니다.');
      }
      uploadHistoryId = parsed;
    }

    return transaction(async (db) => {
      if (uploadHistoryId !== null) {
        const history = await db.query(
          'SELECT upload_history_id FROM upload_history WHERE upload_history_id = CAST(:id AS bigint)',
          { id: uploadHistoryId },
        );
        if (history.length === 0) {
          throw new ApiError(404, 'NOT_FOUND', '업로드 이력을 찾을 수 없습니다.');
        }
      }

      const errors: { row: number; dailyWorkerId: unknown; code: string; reason: string }[] = [];
      let successCount = 0;

      for (let i = 0; i < rawItems.length; i += 1) {
        const raw: unknown = rawItems[i];
        const rowNo = i + 1;
        if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
          errors.push({ row: rowNo, dailyWorkerId: null, code: 'VALIDATION_FAILED', reason: '입력 형식이 올바르지 않습니다.' });
          continue;
        }
        const item = raw as Record<string, unknown>;
        const dailyWorkerId = toNumber(item['dailyWorkerId']);
        const workDays = toNumber(item['workDays']);
        const paymentAmount = toNumber(item['paymentAmount']);
        const paymentDate = item['paymentDate'];

        if (isBlank(item['dailyWorkerId']) || isBlank(paymentDate) || isBlank(item['workDays']) || isBlank(item['paymentAmount'])) {
          errors.push({ row: rowNo, dailyWorkerId: item['dailyWorkerId'] ?? null, code: 'REQUIRED_FIELD_MISSING', reason: '필수 값이 누락되었습니다.' });
          continue;
        }
        if (!Number.isInteger(dailyWorkerId)) {
          errors.push({ row: rowNo, dailyWorkerId: item['dailyWorkerId'], code: 'VALIDATION_FAILED', reason: '일용직 사원 ID는 정수여야 합니다.' });
          continue;
        }
        if (typeof paymentDate !== 'string' || !DATE_PATTERN.test(paymentDate)) {
          errors.push({ row: rowNo, dailyWorkerId, code: 'VALIDATION_FAILED', reason: '지급일은 YYYY-MM-DD 형식이어야 합니다.' });
          continue;
        }
        if (!Number.isInteger(workDays) || workDays <= 0) {
          errors.push({ row: rowNo, dailyWorkerId, code: 'VALIDATION_FAILED', reason: '근무일수는 1 이상의 정수여야 합니다.' });
          continue;
        }
        if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
          errors.push({ row: rowNo, dailyWorkerId, code: 'VALIDATION_FAILED', reason: '지급액은 0 이상의 숫자여야 합니다.' });
          continue;
        }

        const workers = await db.query(
          'SELECT daily_worker_id FROM daily_worker WHERE daily_worker_id = CAST(:dailyWorkerId AS bigint)',
          { dailyWorkerId },
        );
        if (workers.length === 0) {
          errors.push({ row: rowNo, dailyWorkerId, code: 'DAILY_WORKER_NOT_REGISTERED', reason: '등록되지 않은 일용직 사원이라 반영하지 않았습니다.' });
          continue;
        }

        const duplicated = await db.query(
          `SELECT daily_worker_payment_id
             FROM daily_worker_payment
            WHERE daily_worker_id = CAST(:dailyWorkerId AS bigint)
              AND payment_date = CAST(:paymentDate AS date)`,
          { dailyWorkerId, paymentDate },
        );
        if (duplicated.length > 0) {
          errors.push({ row: rowNo, dailyWorkerId, code: 'VALIDATION_FAILED', reason: '같은 지급일에 이미 등록된 급여입니다.' });
          continue;
        }

        await db.query(
          `INSERT INTO daily_worker_payment
             (daily_worker_id, payment_date, work_days, payment_amount, created_at, updated_at)
           VALUES
             (CAST(:dailyWorkerId AS bigint), CAST(:paymentDate AS date), CAST(:workDays AS integer),
              CAST(:paymentAmount AS numeric), now(), now())
           RETURNING daily_worker_payment_id AS "dailyWorkerPaymentId"`,
          { dailyWorkerId, paymentDate, workDays, paymentAmount },
        );
        successCount += 1;
      }

      if (uploadHistoryId !== null) {
        await db.execute(
          `UPDATE upload_history
              SET total_count = CAST(:total AS integer),
                  success_count = CAST(:success AS integer),
                  error_count = CAST(:error AS integer),
                  error_detail = :detail,
                  process_mode = :mode,
                  updated_at = now()
            WHERE upload_history_id = CAST(:id AS bigint)`,
          {
            id: uploadHistoryId,
            total: rawItems.length,
            success: successCount,
            error: errors.length,
            detail: errors.length > 0 ? JSON.stringify(errors) : null,
            mode: PROCESS_MODE,
          },
        );
      }

      return { successCount, errorCount: errors.length, errors };
    });
  }

  @Get('/daily-worker-payments')
  async listDailyWorkerPayments(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);

    const pageValue = isBlank(query['page']) ? 0 : toNumber(query['page']);
    if (!Number.isInteger(pageValue) || pageValue < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
    }
    const sizeValue = isBlank(query['size']) ? DEFAULT_SIZE : toNumber(query['size']);
    if (!Number.isInteger(sizeValue) || sizeValue < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
    }
    const size = Math.min(sizeValue, MAX_SIZE);
    const page = pageValue;

    let paymentDate: string | null = null;
    if (!isBlank(query['paymentDate'])) {
      const raw = query['paymentDate'];
      if (typeof raw !== 'string' || !DATE_PATTERN.test(raw)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '지급일은 YYYY-MM-DD 형식이어야 합니다.');
      }
      paymentDate = raw;
    }
    let dailyWorkerId: number | null = null;
    if (!isBlank(query['dailyWorkerId'])) {
      const parsed = toNumber(query['dailyWorkerId']);
      if (!Number.isInteger(parsed)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '일용직 사원 ID는 정수여야 합니다.');
      }
      dailyWorkerId = parsed;
    }

    return transaction(async (db) => {
      const filter = {
        paymentDate,
        dailyWorkerId,
      };
      const where = `
        WHERE (CAST(:paymentDate AS date) IS NULL OR p.payment_date = CAST(:paymentDate AS date))
          AND (CAST(:dailyWorkerId AS bigint) IS NULL OR p.daily_worker_id = CAST(:dailyWorkerId AS bigint))`;

      const totals = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM daily_worker_payment p
           JOIN daily_worker w ON w.daily_worker_id = p.daily_worker_id` + where,
        filter,
      );
      const total = Number(totals[0]['total']);

      // 은행·예금주·계좌번호: daily_worker와 partner_account를 잇는 컬럼이 schema.sql에 없어 비워 둔다 (todos 참고).
      const items = await db.query(
        `SELECT p.daily_worker_payment_id AS "dailyWorkerPaymentId",
                p.daily_worker_id AS "dailyWorkerId",
                w.name AS "name",
                p.payment_amount AS "paymentAmount",
                CAST(NULL AS varchar) AS "bankName",
                CAST(NULL AS varchar) AS "accountHolder",
                CAST(NULL AS varchar) AS "accountNumber"
           FROM daily_worker_payment p
           JOIN daily_worker w ON w.daily_worker_id = p.daily_worker_id` +
          where +
          `
          ORDER BY p.payment_date DESC, p.daily_worker_payment_id DESC
          LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)`,
        { ...filter, size, offset: page * size },
      );

      // 개인정보 열람 이력 기록 (공통 P7).
      await db.execute(
        `INSERT INTO personal_info_access_log
           (employee_id, target_info_type, accessed_at, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), :targetInfoType, now(), now(), now())`,
        { userId: user.id, targetInfoType: ACCESS_TARGET_INFO_TYPE },
      );

      return {
        items: items.map((row) => ({
          ...row,
          dailyWorkerPaymentId: Number(row['dailyWorkerPaymentId']),
          dailyWorkerId: Number(row['dailyWorkerId']),
          paymentAmount: Number(row['paymentAmount']),
        })),
        page,
        size,
        total,
      };
    });
  }
}
