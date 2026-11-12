import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 변경 가능한 인사정보 항목은 personnel_record의 암호화되지 않은 컬럼으로 한정한다.
// 암호화 컬럼(주민등록번호·주소)은 일괄 변경 대상에서 제외한다.
interface ItemSpec {
  column: string;
  cast: string;
  kind: 'date' | 'text' | 'status';
  max: number;
}

const ITEMS: Record<string, ItemSpec> = {
  hireDate: { column: 'hire_date', cast: 'CAST(:value AS date)', kind: 'date', max: 10 },
  recruitmentType: { column: 'recruitment_type', cast: ':value', kind: 'text', max: 50 },
  recruitmentNote: { column: 'recruitment_note', cast: ':value', kind: 'text', max: 2000 },
  veteranInfo: { column: 'veteran_info', cast: ':value', kind: 'text', max: 200 },
  militaryServiceInfo: { column: 'military_service_info', cast: ':value', kind: 'text', max: 200 },
  employmentStatus: { column: 'employment_status', cast: ':value', kind: 'status', max: 20 },
  resignationDate: { column: 'resignation_date', cast: 'CAST(:value AS date)', kind: 'date', max: 10 },
};

const STATUS_VALUES = ['재직자', '퇴직자'];
const CHANGE_TYPE = '일괄 변경';
const TARGET_TYPE = 'personnel_record';

function daysIn(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isDateText(text: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) {
    return false;
  }
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < 1 || month < 1 || month > 12) {
    return false;
  }
  return day >= 1 && day <= daysIn(year, month);
}

interface Failure {
  employeeId: number;
  reason: string;
}

@Controller('api/v1')
export class FnSfr01203Controller {
  @Post('/personnel-records/bulk-update')
  @HttpCode(200)
  async bulkUpdatePersonnelRecords(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);

    const rawIds = data['employeeIds'];
    if (!Array.isArray(rawIds) || rawIds.length === 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '변경할 임직원을 한 명 이상 선택해 주세요.');
    }
    const ids: number[] = [];
    for (const raw of rawIds) {
      const n = Number(raw);
      if (raw === null || raw === '' || !Number.isInteger(n) || n <= 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '임직원 ID 형식이 올바르지 않습니다.');
      }
      if (!ids.includes(n)) {
        ids.push(n);
      }
    }

    const changeItem = data['changeItem'];
    const changeValue = data['changeValue'];
    if (typeof changeItem !== 'string' || changeItem === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '변경할 인사정보 항목을 선택해 주세요.');
    }
    if (typeof changeValue !== 'string' || changeValue.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '적용할 값을 입력해 주세요.');
    }
    if (!Object.prototype.hasOwnProperty.call(ITEMS, changeItem)) {
      throw new ApiError(422, 'INVALID_CHANGE_ITEM', '변경할 수 없는 인사정보 항목입니다.');
    }
    const spec = ITEMS[changeItem];
    const value = changeValue.trim();
    if (value.length > spec.max) {
      throw new ApiError(422, 'INVALID_CHANGE_VALUE', '변경 값이 너무 깁니다. 변경을 중단했습니다.');
    }
    if (spec.kind === 'date' && !isDateText(value)) {
      throw new ApiError(422, 'INVALID_CHANGE_VALUE', '날짜는 YYYY-MM-DD 형식으로 입력해 주세요. 변경을 중단했습니다.');
    }
    if (spec.kind === 'status' && !STATUS_VALUES.includes(value)) {
      throw new ApiError(422, 'INVALID_CHANGE_VALUE', '재직 구분은 재직자 또는 퇴직자여야 합니다. 변경을 중단했습니다.');
    }

    return transaction(async (db) => {
      let successCount = 0;
      const failures: Failure[] = [];

      for (const employeeId of ids) {
        const rows = (await db.query(
          `SELECT personnel_record_id AS "personnelRecordId",
                  to_char(hire_date, 'YYYY-MM-DD') AS "hireDate",
                  to_char(resignation_date, 'YYYY-MM-DD') AS "resignationDate",
                  CAST(${spec.column} AS text) AS "oldValue"
             FROM personnel_record
            WHERE employee_id = CAST(:employeeId AS bigint)`,
          { employeeId },
        )) as Array<Record<string, unknown>>;

        if (rows.length === 0) {
          failures.push({ employeeId, reason: '인사기록카드가 없습니다.' });
          continue;
        }
        const row = rows[0];
        const hireDate = row['hireDate'] === null ? '' : String(row['hireDate']);
        const resignationDate = row['resignationDate'] === null ? '' : String(row['resignationDate']);
        const oldValue = row['oldValue'] === null ? '(없음)' : String(row['oldValue']);

        if (changeItem === 'hireDate' && resignationDate !== '' && value > resignationDate) {
          failures.push({ employeeId, reason: '입사일이 퇴사일보다 늦을 수 없습니다.' });
          continue;
        }
        if (changeItem === 'resignationDate' && value < hireDate) {
          failures.push({ employeeId, reason: '퇴사일이 입사일보다 빠를 수 없습니다.' });
          continue;
        }
        if (changeItem === 'employmentStatus' && value === '퇴직자' && resignationDate === '') {
          failures.push({ employeeId, reason: '퇴사일이 없어 퇴직자로 바꿀 수 없습니다.' });
          continue;
        }

        await db.execute(
          `UPDATE personnel_record
              SET ${spec.column} = ${spec.cast}, updated_at = now()
            WHERE personnel_record_id = CAST(:recordId AS bigint)`,
          { recordId: row['personnelRecordId'], value },
        );
        if (changeItem === 'employmentStatus') {
          await db.execute(
            `UPDATE employee SET employment_status = :value, updated_at = now()
              WHERE employee_id = CAST(:employeeId AS bigint)`,
            { employeeId, value },
          );
        }
        await db.execute(
          `INSERT INTO change_history
             (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
           VALUES
             (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), :changeType, now(), :content, now(), now())`,
          {
            userId: user.id,
            targetType: TARGET_TYPE,
            targetId: row['personnelRecordId'],
            changeType: CHANGE_TYPE,
            content: `${changeItem}: ${oldValue} -> ${value}`,
          },
        );
        successCount += 1;
      }

      return { successCount, failureCount: failures.length, failures };
    });
  }
}
