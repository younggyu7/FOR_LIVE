import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '급여 담당자';
// 가정: 열람 이력의 대상 정보 구분 고정값
const ACCESS_TARGET_TYPE = '일용직 주민등록번호';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function missing(): ApiError {
  return new ApiError(422, 'REQUIRED_FIELD_MISSING', '필수 값을 입력해 주세요.');
}

function numberOf(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) {
    return Number(v);
  }
  return null;
}

@Controller('api/v1')
export class FnSfr02104Controller {
  @Post('/daily-workers')
  @HttpCode(200)
  async createDailyWorker(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const name = data['name'];
    const rrn = data['residentRegistrationNo'];
    const wageRaw = data['dailyWage'];
    if (isBlank(name) || isBlank(rrn) || isBlank(wageRaw)) {
      throw missing();
    }
    if (typeof name !== 'string' || name.trim().length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', '성명은 100자 이하의 글자로 입력해 주세요.');
    }
    if (typeof rrn !== 'string' || rrn.trim().length > 50) {
      throw new ApiError(400, 'VALIDATION_FAILED', '주민등록번호 형식이 올바르지 않습니다.');
    }
    const wage = numberOf(wageRaw);
    if (wage === null || wage < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '일급은 0 이상의 숫자로 입력해 주세요.');
    }
    return transaction(async (db) => {
      // 가정: 주민등록번호는 DB 설정 app.pii_key 의 키로 암호화해 저장한다 (키는 코드에 두지 않는다)
      const rows = await db.query(
        [
          'INSERT INTO daily_worker',
          '(name, resident_registration_no_enc, daily_wage, created_at, updated_at)',
          "VALUES (:name, encode(pgp_sym_encrypt(:rrn, current_setting('app.pii_key')), 'base64'),",
          'CAST(:wage AS numeric), now(), now())',
          'RETURNING daily_worker_id AS "dailyWorkerId"',
        ].join(' '),
        { name: name.trim(), rrn: rrn.trim(), wage: wage },
      );
      return rows[0];
    });
  }

  @Get('/daily-workers')
  async listDailyWorkers(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    let page = 0;
    if (!isBlank(q['page'])) {
      const p = numberOf(q['page']);
      if (p === null || !Number.isInteger(p) || p < 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', 'page는 0 이상의 정수여야 합니다.');
      }
      page = p;
    }
    let size = DEFAULT_SIZE;
    if (!isBlank(q['size'])) {
      const s = numberOf(q['size']);
      if (s === null || !Number.isInteger(s) || s < 1) {
        throw new ApiError(400, 'VALIDATION_FAILED', 'size는 1 이상의 정수여야 합니다.');
      }
      size = Math.min(s, MAX_SIZE);
    }
    const nameRaw = q['name'];
    const name = typeof nameRaw === 'string' && nameRaw.trim() !== '' ? nameRaw.trim() : null;
    return transaction(async (db) => {
      const where = "WHERE (CAST(:name AS text) IS NULL OR name ILIKE '%' || CAST(:name AS text) || '%')";
      const items = await db.query(
        [
          'SELECT daily_worker_id AS "dailyWorkerId", name, daily_wage AS "dailyWage"',
          'FROM daily_worker',
          where,
          'ORDER BY daily_worker_id DESC',
          'LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        ].join(' '),
        { name: name, size: size, offset: page * size },
      );
      const counts = await db.query(
        'SELECT COUNT(*) AS total FROM daily_worker ' + where,
        { name: name },
      );
      // 주민등록번호 열람·접근 이력 기록
      await db.execute(
        [
          'INSERT INTO personal_info_access_log',
          '(employee_id, target_info_type, accessed_at, created_at, updated_at)',
          'VALUES (CAST(:userId AS bigint), :targetType, now(), now(), now())',
        ].join(' '),
        { userId: user.id, targetType: ACCESS_TARGET_TYPE },
      );
      return { items: items, page: page, size: size, total: Number(counts[0].total) };
    });
  }

  @Post('/daily-worker-payments')
  @HttpCode(200)
  async createDailyWorkerPayment(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const idRaw = data['dailyWorkerId'];
    const dateRaw = data['paymentDate'];
    const daysRaw = data['workDays'];
    if (isBlank(idRaw) || isBlank(dateRaw) || isBlank(daysRaw)) {
      throw missing();
    }
    const workerId = numberOf(idRaw);
    if (workerId === null || !Number.isInteger(workerId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '일용직 사원 ID가 올바르지 않습니다.');
    }
    if (typeof dateRaw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateRaw.trim())) {
      throw new ApiError(400, 'VALIDATION_FAILED', '지급일은 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    const workDays = numberOf(daysRaw);
    if (workDays === null || !Number.isInteger(workDays) || workDays <= 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '근무일수는 1 이상의 정수로 입력해 주세요.');
    }
    const paymentDate = dateRaw.trim();
    return transaction(async (db) => {
      const workers = await db.query(
        'SELECT daily_worker_id FROM daily_worker WHERE daily_worker_id = CAST(:workerId AS bigint)',
        { workerId: workerId },
      );
      if (workers.length === 0) {
        throw new ApiError(404, 'DAILY_WORKER_NOT_FOUND', '일용직 사원을 찾을 수 없습니다.');
      }
      const dup = await db.query(
        [
          'SELECT daily_worker_payment_id FROM daily_worker_payment',
          'WHERE daily_worker_id = CAST(:workerId AS bigint)',
          'AND payment_date = CAST(:paymentDate AS date)',
        ].join(' '),
        { workerId: workerId, paymentDate: paymentDate },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'INVALID_STATE', '같은 지급일에 이미 등록된 급여가 있습니다.');
      }
      // 가정: 지급액 = 일급 × 근무일수
      const rows = await db.query(
        [
          'INSERT INTO daily_worker_payment',
          '(daily_worker_id, payment_date, work_days, payment_amount, created_at, updated_at)',
          'SELECT daily_worker_id, CAST(:paymentDate AS date), :workDays,',
          'daily_wage * CAST(:workDays AS numeric), now(), now()',
          'FROM daily_worker WHERE daily_worker_id = CAST(:workerId AS bigint)',
          'RETURNING daily_worker_payment_id AS "dailyWorkerPaymentId"',
        ].join(' '),
        { workerId: workerId, paymentDate: paymentDate, workDays: workDays },
      );
      return rows[0];
    });
  }
}
