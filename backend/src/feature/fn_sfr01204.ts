import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 개인정보 열람 이력의 대상 정보 구분 고정값
const ACCESS_INFO_TYPE = '기초 인적사항';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// [요청 필드, 컬럼, 이름표, 최대 길이(0이면 제한 없음)]
const TEXT_FIELDS: [string, string, string, number][] = [
  ['recruitmentType', 'recruitment_type', '채용 구분', 50],
  ['recruitmentNote', 'recruitment_note', '채용 정보 비고', 0],
  ['address', 'address_enc', '주소', 1000],
  ['veteranInfo', 'veteran_info', '보훈 정보', 200],
  ['militaryServiceInfo', 'military_service_info', '병역 정보', 200],
];

function missing(label: string): ApiError {
  return new ApiError(422, 'REQUIRED_FIELD_MISSING', label + ' 항목을 입력해 주세요.');
}

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function toId(v: unknown, label: string): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return n;
}

function toDate(v: unknown, label: string): string {
  if (typeof v !== 'string' || !DATE_PATTERN.test(v)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) YYYY-MM-DD 형식이어야 합니다.');
  }
  return v;
}

// 키가 없으면 undefined, 빈 값이면 null
function optText(data: Record<string, unknown>, key: string, label: string, max: number): string | null | undefined {
  if (!(key in data)) {
    return undefined;
  }
  const v = data[key];
  if (v === null || v === '') {
    return null;
  }
  if (typeof v !== 'string') {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  if (max > 0 && v.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) ' + max + '자 이하여야 합니다.');
  }
  return v;
}

@Controller('api/v1')
export class FnSfr01204Controller {
  @Get('/personnel-records')
  async listPersonnelRecords(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const query = checks.queryOf(req.query);
    const page = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    let size = query['size'] === undefined || query['size'] === '' ? DEFAULT_SIZE : Number(query['size']);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 쪽 크기가 올바르지 않습니다.');
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    const filterEmployee = isBlank(query['employeeId']) ? null : toId(query['employeeId'], '임직원');
    return transaction(async (db) => {
      const params = {
        employeeId: filterEmployee,
        limit: size,
        offset: page * size,
      };
      const where = '(CAST(:employeeId AS bigint) IS NULL OR employee_id = CAST(:employeeId AS bigint))';
      const totalRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM personnel_record WHERE ' + where,
        { employeeId: filterEmployee },
      );
      const items = await db.query(
        'SELECT personnel_record_id AS "personnelRecordId", employee_id AS "employeeId", '
          + 'to_char(hire_date, \'YYYY-MM-DD\') AS "hireDate", recruitment_type AS "recruitmentType", '
          + 'recruitment_note AS "recruitmentNote", address_enc AS "address", '
          + 'veteran_info AS "veteranInfo", military_service_info AS "militaryServiceInfo" '
          + 'FROM personnel_record WHERE ' + where
          + ' ORDER BY personnel_record_id LIMIT :limit OFFSET :offset',
        params,
      );
      // 열람 이력: 열람자는 현재 사용자, 시각은 now()
      await db.execute(
        'INSERT INTO personal_info_access_log (employee_id, target_employee_id, target_info_type, accessed_at, created_at, updated_at) '
          + 'VALUES (CAST(:userId AS bigint), CAST(:targetEmployeeId AS bigint), :infoType, now(), now(), now())',
        { userId: user.id, targetEmployeeId: filterEmployee, infoType: ACCESS_INFO_TYPE },
      );
      return { items, page, size, total: Number(totalRows[0]['total']) };
    });
  }

  @Post('/personnel-records')
  @HttpCode(200)
  async createPersonnelRecord(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    if (isBlank(data['employeeId'])) {
      throw missing('임직원');
    }
    if (isBlank(data['hireDate'])) {
      throw missing('입사일');
    }
    if (isBlank(data['recruitmentType'])) {
      throw missing('채용 구분');
    }
    const employeeId = toId(data['employeeId'], '임직원');
    const hireDate = toDate(data['hireDate'], '입사일');
    const texts: Record<string, string | null> = {};
    for (const [key, , label, max] of TEXT_FIELDS) {
      const v = optText(data, key, label, max);
      texts[key] = v === undefined ? null : v;
    }
    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT employment_status AS "employmentStatus" FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      if (employees.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '대상 임직원을 찾을 수 없습니다.');
      }
      const exists = await db.query(
        'SELECT personnel_record_id AS "personnelRecordId" FROM personnel_record WHERE employee_id = CAST(:employeeId AS bigint)',
        { employeeId },
      );
      if (exists.length > 0) {
        throw new ApiError(409, 'PERSONNEL_RECORD_ALREADY_EXISTS', '해당 임직원의 인사기록카드가 이미 있습니다.');
      }
      // 가정: 재직 구분은 대상 임직원의 값을 따른다. 퇴직자는 퇴사일 출처가 없어 등록하지 않는다.
      const status = String(employees[0]['employmentStatus']);
      if (status !== '재직자') {
        throw new ApiError(409, 'INVALID_STATE', '재직자만 인사기록카드를 등록할 수 있습니다.');
      }
      const rows = await db.query(
        'INSERT INTO personnel_record (employee_id, hire_date, recruitment_type, recruitment_note, address_enc, '
          + 'veteran_info, military_service_info, employment_status, created_at, updated_at) '
          + 'VALUES (CAST(:employeeId AS bigint), CAST(:hireDate AS date), :recruitmentType, :recruitmentNote, :address, '
          + ':veteranInfo, :militaryServiceInfo, :status, now(), now()) '
          + 'RETURNING personnel_record_id AS "personnelRecordId"',
        {
          employeeId,
          hireDate,
          recruitmentType: texts['recruitmentType'],
          recruitmentNote: texts['recruitmentNote'],
          address: texts['address'],
          veteranInfo: texts['veteranInfo'],
          militaryServiceInfo: texts['militaryServiceInfo'],
          status,
        },
      );
      const personnelRecordId = Number(rows[0]['personnelRecordId']);
      // 가정: 변경 내용에는 개인정보 값을 남기지 않고 항목 이름만 적는다.
      const entered = ['입사일', '채용 구분'];
      for (const [key, , label] of TEXT_FIELDS) {
        if (texts[key] !== null) {
          entered.push(label);
        }
      }
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, changed_at, change_content, created_at, updated_at) '
          + 'VALUES (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), now(), :content, now(), now())',
        {
          userId: user.id,
          targetType: 'personnel_record',
          targetId: personnelRecordId,
          content: '등록: ' + entered.join(', '),
        },
      );
      return { personnelRecordId };
    });
  }

  @Patch('/personnel-records/:personnelRecordId')
  async updatePersonnelRecord(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const id = toId(req.params['personnelRecordId'], '인사기록카드');
    const data = checks.inputOf(req.body);
    const sets: string[] = [];
    const params: Record<string, unknown> = { id };
    const after: Record<string, string | null> = {};
    if ('hireDate' in data) {
      if (isBlank(data['hireDate'])) {
        throw missing('입사일');
      }
      params['hireDate'] = toDate(data['hireDate'], '입사일');
      after['hireDate'] = String(params['hireDate']);
      sets.push('hire_date = CAST(:hireDate AS date)');
    }
    for (const [key, column, label, max] of TEXT_FIELDS) {
      const v = optText(data, key, label, max);
      if (v === undefined) {
        continue;
      }
      if (key === 'recruitmentType' && v === null) {
        throw missing(label);
      }
      params[key] = v;
      after[key] = v;
      sets.push(column + ' = :' + key);
    }
    if (sets.length === 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '수정할 항목이 없습니다.');
    }
    return transaction(async (db) => {
      const befores = await db.query(
        'SELECT to_char(hire_date, \'YYYY-MM-DD\') AS "hireDate", recruitment_type AS "recruitmentType", '
          + 'recruitment_note AS "recruitmentNote", address_enc AS "address", '
          + 'veteran_info AS "veteranInfo", military_service_info AS "militaryServiceInfo" '
          + 'FROM personnel_record WHERE personnel_record_id = CAST(:id AS bigint) FOR UPDATE',
        { id },
      );
      if (befores.length === 0) {
        throw new ApiError(404, 'PERSONNEL_RECORD_NOT_FOUND', '인사기록카드를 찾을 수 없습니다.');
      }
      const before = befores[0];
      const labels: Record<string, string> = { hireDate: '입사일' };
      for (const [key, , label] of TEXT_FIELDS) {
        labels[key] = label;
      }
      const changes: string[] = [];
      for (const key of Object.keys(after)) {
        const oldValue = before[key] === null || before[key] === undefined ? null : String(before[key]);
        const newValue = after[key];
        if (oldValue === newValue) {
          continue;
        }
        if (key === 'address') {
          // 개인정보(주소)는 값을 남기지 않는다.
          changes.push(labels[key] + ': 변경됨');
        } else {
          changes.push(labels[key] + ': ' + (oldValue ?? '(없음)') + ' → ' + (newValue ?? '(없음)'));
        }
      }
      await db.execute(
        'UPDATE personnel_record SET ' + sets.join(', ') + ', updated_at = now() WHERE personnel_record_id = CAST(:id AS bigint)',
        params,
      );
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, changed_at, change_content, created_at, updated_at) '
          + 'VALUES (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), now(), :content, now(), now())',
        {
          userId: user.id,
          targetType: 'personnel_record',
          targetId: id,
          content: changes.length > 0 ? changes.join('; ') : '변경 없음',
        },
      );
      return { personnelRecordId: id };
    });
  }
}
