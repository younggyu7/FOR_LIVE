import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 연간 입력은 월별 급여 지급일을 해당 월 1일로 본다 (입력에 지급일이 없다).
const PAY_DAY = 1;

const TARGETS = ['PARTNER', 'PERSONNEL_RECORD', 'ANNUAL_LEAVE', 'PAYROLL', 'ASSET', 'ATTENDANCE', 'CARRYOVER', 'COMMUTE_RECORD', 'EDUCATION_ATTENDEE', 'DAILY_WORKER_PAYMENT'];
const MODES = ['EXCLUDE_ERROR', 'CANCEL_ALL'];

interface MonthEntry {
  month: number;
  amount: number;
}

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function numberOf(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return Number(value);
  }
  return NaN;
}

@Controller('api/v1')
export class FnSfr02109Controller {
  @Post('/payrolls/annual-bulk')
  @HttpCode(200)
  async bulkCreateAnnualPayrolls(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const year = numberOf(data['attributionYear']);
    if (!Number.isInteger(year) || year < 1900 || year > 2200) {
      throw invalid('귀속 연도를 올바르게 입력해 주세요.');
    }
    const rawItems = data['items'];
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw invalid('임직원별 월별 급여 금액을 한 건 이상 입력해 주세요.');
    }
    const byEmployee = new Map<number, MonthEntry[]>();
    const seen = new Set<string>();
    for (const raw of rawItems) {
      if (typeof raw !== 'object' || raw === null) {
        throw invalid('급여 입력 형식이 올바르지 않습니다.');
      }
      const row = raw as Record<string, unknown>;
      const employeeId = numberOf(row['employeeId']);
      const month = numberOf(row['month']);
      const amount = numberOf(row['amount']);
      if (!Number.isInteger(employeeId) || employeeId <= 0) {
        throw invalid('임직원을 선택해 주세요.');
      }
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw invalid('월은 1부터 12 사이로 입력해 주세요.');
      }
      if (!Number.isFinite(amount) || amount < 0) {
        throw invalid('금액은 0 이상의 숫자로 입력해 주세요.');
      }
      const key = employeeId + '-' + month;
      if (seen.has(key)) {
        throw invalid('같은 임직원의 같은 월이 중복되어 있습니다.');
      }
      seen.add(key);
      const list = byEmployee.get(employeeId) ?? [];
      list.push({ month, amount });
      byEmployee.set(employeeId, list);
    }
    return transaction(async (db) => {
      for (const employeeId of byEmployee.keys()) {
        const found = await db.query(
          'SELECT employee_id AS "employeeId" FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
          { employeeId },
        );
        if (found.length === 0) {
          throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
        }
      }
      const items: Record<string, unknown>[] = [];
      let errorCount = 0;
      for (const [employeeId, entries] of byEmployee) {
        let annualAmount = 0;
        let appliedCount = 0;
        const errors: string[] = [];
        for (const entry of entries) {
          const params = { employeeId, year, month: entry.month, day: PAY_DAY };
          const existing = await db.query(
            'SELECT payroll_id AS "payrollId", closing_status AS "closingStatus" FROM payroll WHERE employee_id = CAST(:employeeId AS bigint) AND pay_date = make_date(CAST(:year AS integer), CAST(:month AS integer), CAST(:day AS integer))',
            params,
          );
          if (existing.length > 0 && existing[0]['closingStatus'] === '마감') {
            errors.push(entry.month + '월: 마감된 기간이라 반영하지 않았습니다. 마감을 취소한 뒤 다시 입력해 주세요.');
            errorCount += 1;
            continue;
          }
          if (existing.length > 0) {
            await db.execute(
              'UPDATE payroll SET updated_at = now() WHERE payroll_id = CAST(:payrollId AS bigint)',
              { payrollId: existing[0]['payrollId'] },
            );
          } else {
            await db.query(
              'INSERT INTO payroll (employee_id, pay_date, closing_status, created_at, updated_at) VALUES (CAST(:employeeId AS bigint), make_date(CAST(:year AS integer), CAST(:month AS integer), CAST(:day AS integer)), \'신청\', now(), now()) RETURNING payroll_id AS "payrollId"',
              params,
            );
          }
          annualAmount += entry.amount;
          appliedCount += 1;
        }
        items.push({ employeeId, attributionYear: year, annualAmount, appliedCount, errors });
      }
      return { items, errorCount };
    });
  }

  @Post('/upload-histories')
  @HttpCode(200)
  async createUploadHistory(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const targetBusiness = data['targetBusiness'];
    const fileName = data['fileName'];
    const file = data['file'];
    const processMode = data['processMode'];
    if (typeof targetBusiness !== 'string' || !TARGETS.includes(targetBusiness)) {
      throw invalid('업로드 대상 업무를 올바르게 선택해 주세요.');
    }
    if (typeof fileName !== 'string' || fileName.trim() === '' || fileName.length > 255) {
      throw invalid('파일명을 255자 이내로 입력해 주세요.');
    }
    if (typeof file !== 'string' || file.trim() === '') {
      throw invalid('업로드 엑셀 파일을 입력해 주세요.');
    }
    let mode: string | null = null;
    if (processMode !== undefined && processMode !== null && processMode !== '') {
      if (typeof processMode !== 'string' || !MODES.includes(processMode)) {
        throw invalid('오류 처리 방식을 올바르게 선택해 주세요.');
      }
      mode = processMode;
    }
    return transaction(async (db) => {
      const rows = await db.query(
        'INSERT INTO upload_history (uploader_id, target_business, file_name, uploaded_at, process_mode, created_at, updated_at) VALUES (CAST(:userId AS bigint), :targetBusiness, :fileName, now(), :processMode, now(), now()) RETURNING upload_history_id AS "uploadHistoryId", total_count AS "totalCount", success_count AS "successCount", error_count AS "errorCount", error_detail AS "errorDetail"',
        { userId: user.id, targetBusiness, fileName, processMode: mode },
      );
      return rows[0];
    });
  }
}
