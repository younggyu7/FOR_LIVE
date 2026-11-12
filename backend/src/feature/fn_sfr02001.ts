import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 코드 구분은 schema.sql·API 표의 7가지를 허용한다 (확인 필요: 업무 규칙은 5가지).
const CATEGORIES = ['근로소득', '퇴직소득', '소득공제', '농특세', '지방소득세', '사회보험정산', '학자금상환'];
const USE_VALUES = ['사용', '미사용'];
// 가정: 등록 시 사용 여부 기본값
const DEFAULT_USE_YN = '사용';
const ROLE = '급여 담당자';

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function text(value: unknown, label: string, max: number, required: boolean): string | null {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw invalid(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (typeof value !== 'string') {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  if (value.trim() === '' && required) {
    throw invalid(label + '을(를) 입력해 주세요.');
  }
  if (value.length > max) {
    throw invalid(label + '은(는) ' + max + '자 이하로 입력해 주세요.');
  }
  return value;
}

function whole(value: unknown, fallback: number, label: string): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const s = String(value);
  if (!/^\d+$/.test(s)) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  return Number(s);
}

@Controller('api/v1')
export class FnSfr02001Controller {
  @Get('/payroll-codes')
  async listPayrollCodes(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const category = text(query['codeCategory'], '코드구분', 30, false);
    if (category !== null && !CATEGORIES.includes(category)) {
      throw invalid('코드구분이 허용된 값이 아닙니다.');
    }
    const page = whole(query['page'], 0, '쪽');
    const size = Math.min(Math.max(whole(query['size'], 20, '크기'), 1), 200);
    return transaction(async (db) => {
      const params = { category, limit: size, offset: page * size };
      const rows = await db.query(
        'SELECT payroll_code_id AS "payrollCodeId", code_category AS "codeCategory", code AS "code", ' +
          'code_name AS "codeName", use_yn AS "useYn", remark AS "remark" ' +
          'FROM payroll_code ' +
          'WHERE (CAST(:category AS text) IS NULL OR code_category = CAST(:category AS text)) ' +
          'ORDER BY code_category, code LIMIT :limit OFFSET :offset',
        params,
      );
      const counts = await db.query(
        'SELECT COUNT(*) AS "total" FROM payroll_code ' +
          'WHERE (CAST(:category AS text) IS NULL OR code_category = CAST(:category AS text))',
        { category },
      );
      return { items: rows, page, size, total: Number(counts[0].total) };
    });
  }

  @Post('/payroll-codes')
  @HttpCode(200)
  async createPayrollCode(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const category = text(data['codeCategory'], '코드구분', 30, true) as string;
    const code = text(data['code'], '코드', 20, true) as string;
    const codeName = text(data['codeName'], '코드명', 100, true) as string;
    const useYn = text(data['useYn'], '사용 여부', 10, false) ?? DEFAULT_USE_YN;
    const remark = text(data['remark'], '비고', 500, false);
    if (!CATEGORIES.includes(category)) {
      throw new ApiError(422, 'INVALID_PAYROLL_CODE_CATEGORY', '코드 구분이 허용된 값이 아닙니다.');
    }
    if (!USE_VALUES.includes(useYn)) {
      throw invalid('사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    return transaction(async (db) => {
      const dup = await db.query(
        'SELECT payroll_code_id FROM payroll_code WHERE code_category = :category AND code = :code',
        { category, code },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PAYROLL_CODE_DUPLICATED', '같은 코드 구분에 이미 등록된 코드입니다.');
      }
      const rows = await db.query(
        'INSERT INTO payroll_code (code_category, code, code_name, use_yn, remark, created_at, updated_at) ' +
          'VALUES (:category, :code, :codeName, :useYn, :remark, now(), now()) ' +
          'RETURNING payroll_code_id AS "payrollCodeId"',
        { category, code, codeName, useYn, remark },
      );
      return { payrollCodeId: Number(rows[0].payrollCodeId) };
    });
  }

  @Patch('/payroll-codes/:payrollCodeId')
  async updatePayrollCode(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['payrollCodeId'];
    if (!/^\d+$/.test(idText)) {
      throw invalid('급여 기초코드 ID 형식이 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const codeName = text(data['codeName'], '코드명', 100, false);
    const useYn = text(data['useYn'], '사용 여부', 10, false);
    const hasRemark = Object.prototype.hasOwnProperty.call(data, 'remark');
    const remark = text(data['remark'], '비고', 500, false);
    if (useYn !== null && !USE_VALUES.includes(useYn)) {
      throw invalid('사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT code_name AS "codeName", use_yn AS "useYn", remark AS "remark" ' +
          'FROM payroll_code WHERE payroll_code_id = CAST(:id AS bigint)',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PAYROLL_CODE_NOT_FOUND', '대상 코드를 찾을 수 없습니다.');
      }
      const old = found[0];
      const nextName = codeName ?? old.codeName;
      const nextUse = useYn ?? old.useYn;
      const nextRemark = hasRemark ? remark : old.remark;
      await db.execute(
        'UPDATE payroll_code SET code_name = :codeName, use_yn = :useYn, remark = :remark, updated_at = now() ' +
          'WHERE payroll_code_id = CAST(:id AS bigint)',
        { id: idText, codeName: nextName, useYn: nextUse, remark: nextRemark },
      );
      const content =
        '코드명: ' + old.codeName + ' → ' + nextName +
        ', 사용 여부: ' + old.useYn + ' → ' + nextUse +
        ', 비고: ' + (old.remark ?? '') + ' → ' + (nextRemark ?? '');
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :targetType, CAST(:id AS bigint), :changeType, now(), :content, now(), now())',
        { userId: user.id, targetType: 'payroll_code', id: idText, changeType: '설정 변경', content },
      );
      return { payrollCodeId: Number(idText), useYn: nextUse };
    });
  }
}
