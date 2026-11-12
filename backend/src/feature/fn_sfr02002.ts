import { Controller, Get, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const ACTIVE_VALUES = ['사용', '미사용'];

function isIntegerValue(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isInteger(value);
  }
  if (typeof value === 'string') {
    return /^[0-9]+$/.test(value.trim());
  }
  return false;
}

@Controller('api/v1')
export class FnSfr02002Controller {
  @Get('/payroll-account-mappings')
  async listPayrollAccountMappings(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const query = checks.queryOf(req.query);
    const rawPage = Math.floor(Number(String(query['page'] ?? '0')));
    const rawSize = Math.floor(Number(String(query['size'] ?? DEFAULT_SIZE)));
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 0;
    const size = Number.isFinite(rawSize) && rawSize > 0 ? Math.min(rawSize, MAX_SIZE) : DEFAULT_SIZE;
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT payroll_account_mapping_id AS "payrollAccountMappingId",
                payroll_type AS "payrollType",
                account_subject_id AS "accountSubjectId",
                is_active AS "isActive"
           FROM payroll_account_mapping
          ORDER BY payroll_account_mapping_id
          LIMIT :size OFFSET :offset`,
        { size, offset: page * size },
      );
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM payroll_account_mapping',
        {},
      );
      const total = Number(counts[0]['total']);
      return { items, page, size, total };
    });
  }

  @Put('/payroll-account-mappings/:payrollAccountMappingId')
  async updatePayrollAccountMapping(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const mappingId = req.params['payrollAccountMappingId'];
    const accountSubjectId = data['accountSubjectId'];
    const isActive = data['isActive'];
    if (!isIntegerValue(accountSubjectId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '계정과목을 선택해 주세요.');
    }
    if (typeof isActive !== 'string' || !ACTIVE_VALUES.includes(isActive)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    if (!isIntegerValue(mappingId)) {
      throw new ApiError(404, 'PAYROLL_ACCOUNT_MAPPING_NOT_FOUND', '급여 전표 계정 설정을 찾을 수 없습니다.');
    }
    const subjectParam = String(accountSubjectId).trim();
    return transaction(async (db) => {
      const current = await db.query(
        `SELECT payroll_type AS "payrollType",
                account_subject_id AS "accountSubjectId",
                is_active AS "isActive"
           FROM payroll_account_mapping
          WHERE payroll_account_mapping_id = CAST(:id AS bigint)`,
        { id: mappingId },
      );
      if (current.length === 0) {
        throw new ApiError(404, 'PAYROLL_ACCOUNT_MAPPING_NOT_FOUND', '급여 전표 계정 설정을 찾을 수 없습니다.');
      }
      const subjects = await db.query(
        'SELECT account_subject_id AS "accountSubjectId" FROM account_subject WHERE account_subject_id = CAST(:subjectId AS bigint)',
        { subjectId: subjectParam },
      );
      if (subjects.length === 0) {
        throw new ApiError(422, 'INVALID_ACCOUNT_SUBJECT', '등록되지 않았거나 사용할 수 없는 계정과목입니다.');
      }
      const duplicated = await db.query(
        `SELECT payroll_account_mapping_id AS "id"
           FROM payroll_account_mapping
          WHERE payroll_type = :payrollType
            AND account_subject_id = CAST(:subjectId AS bigint)
            AND payroll_account_mapping_id <> CAST(:id AS bigint)`,
        { payrollType: current[0]['payrollType'], subjectId: subjectParam, id: mappingId },
      );
      if (duplicated.length > 0) {
        throw new ApiError(422, 'INVALID_ACCOUNT_SUBJECT', '같은 급여 구분에 이미 설정된 계정과목입니다.');
      }
      const rows = await db.query(
        `UPDATE payroll_account_mapping
            SET account_subject_id = CAST(:subjectId AS bigint),
                is_active = :isActive,
                updated_at = now()
          WHERE payroll_account_mapping_id = CAST(:id AS bigint)
          RETURNING payroll_account_mapping_id AS "payrollAccountMappingId"`,
        { subjectId: subjectParam, isActive, id: mappingId },
      );
      const content =
        '급여 구분 ' + String(current[0]['payrollType']) +
        ': 계정과목 ' + String(current[0]['accountSubjectId']) + ' → ' + subjectParam +
        ', 사용 여부 ' + String(current[0]['isActive']) + ' → ' + isActive;
      await db.execute(
        `INSERT INTO change_history
           (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at)
         VALUES
           (CAST(:userId AS bigint), 'payroll_account_mapping', CAST(:id AS bigint), '설정 변경', now(), :content, now(), now())`,
        { userId: user.id, id: mappingId, content },
      );
      return rows[0];
    });
  }

  // TODO(질문): 급여 마감 기간(409 PAYROLL_PERIOD_CLOSED) 차단은 설정이 어느 급여 기간에 속하는지 스키마에 출처가 없어 구현하지 못했다.
}
