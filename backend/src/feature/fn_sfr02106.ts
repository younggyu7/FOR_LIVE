import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 급여명세서 통합알림의 채널은 기본 채널인 포털로 보낸다.
const PAYSLIP_CHANNEL = '포털';
// 가정: 알림 이벤트·바로가기 대상 유형 코드
const PAYSLIP_EVENT_TYPE = 'PAYSLIP';
const PAYSLIP_TARGET_TYPE = 'PAYROLL';

@Controller('api/v1')
export class FnSfr02106Controller {
  @Post('/payslips/send')
  @HttpCode(200)
  async sendPayslips(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);

    const payDate = data['payDate'];
    if (typeof payDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '지급일을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }

    const rawIds = data['employeeIds'];
    const ids: string[] = [];
    if (rawIds !== undefined && rawIds !== null) {
      if (!Array.isArray(rawIds)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '수신 임직원 목록 형식이 올바르지 않습니다.');
      }
      for (const raw of rawIds) {
        const n = typeof raw === 'number' || typeof raw === 'string' ? Number(raw) : NaN;
        if (raw === '' || !Number.isInteger(n) || n <= 0) {
          throw new ApiError(400, 'VALIDATION_FAILED', '수신 임직원 ID는 양의 정수여야 합니다.');
        }
        if (!ids.includes(String(n))) {
          ids.push(String(n));
        }
      }
    }
    const filterByIds = ids.length > 0;

    return transaction(async (db) => {
      let payrollSql =
        'SELECT payroll_id AS "payrollId", employee_id AS "employeeId" ' +
        'FROM payroll WHERE pay_date = CAST(:payDate AS date)';
      const payrollParams: Record<string, unknown> = { payDate };
      if (filterByIds) {
        payrollSql +=
          ' AND employee_id IN (SELECT CAST(value AS bigint) FROM json_array_elements_text(CAST(:ids AS json)))';
        payrollParams['ids'] = JSON.stringify(ids);
      }
      payrollSql += ' ORDER BY payroll_id';
      const payrolls = (await db.query(payrollSql, payrollParams)) as Array<Record<string, unknown>>;
      if (payrolls.length === 0) {
        throw new ApiError(404, 'PAYROLL_NOT_FOUND', '발송 대상 급여가 없습니다.');
      }

      // 가정: 해당 지급일의 급여 지급일(payroll_run)이 모두 마감 상태여야 발송할 수 있다.
      const runs = (await db.query(
        'SELECT is_closed AS "isClosed" FROM payroll_run WHERE pay_date = CAST(:payDate AS date)',
        { payDate },
      )) as Array<Record<string, unknown>>;
      if (runs.length === 0 || runs.some((r) => r['isClosed'] !== true)) {
        throw new ApiError(409, 'PAYROLL_NOT_CLOSED', '마감되지 않은 급여는 발송할 수 없습니다.');
      }

      let successCount = 0;
      const failures: Array<{ employeeId: number; reason: string }> = [];
      const found = new Set<string>();

      for (const p of payrolls) {
        found.add(String(p['employeeId']));
        await db.execute(
          'INSERT INTO notification (recipient_id, channel, title, content, read_status, event_type, target_type, target_id, created_at, updated_at) ' +
            'VALUES (CAST(:recipientId AS bigint), :channel, :title, :content, \'안읽음\', :eventType, :targetType, CAST(:targetId AS bigint), now(), now())',
          {
            recipientId: String(p['employeeId']),
            channel: PAYSLIP_CHANNEL,
            title: '급여명세서 발송 안내',
            content: payDate + ' 지급분 급여명세서가 발송되었습니다.',
            eventType: PAYSLIP_EVENT_TYPE,
            targetType: PAYSLIP_TARGET_TYPE,
            targetId: String(p['payrollId']),
          },
        );
        successCount += 1;
      }

      for (const id of ids) {
        if (!found.has(id)) {
          failures.push({ employeeId: Number(id), reason: '해당 지급일의 급여가 없습니다.' });
        }
      }

      return {
        successCount,
        failureCount: failures.length,
        failures,
      };
    });
  }
}
