import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '근태 담당자';
// 가정: 등록 시 사용 여부 기본값은 '사용'
const DEFAULT_USE_YN = '사용';
const TYPES = ['기본근태', '근무시간', '시간외근무'];
const USE_YNS = ['사용', '미사용'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function opt(v: unknown): string | null {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  return String(v);
}

function checkDate(v: string | null, label: string): void {
  if (v !== null && !DATE_RE.test(v)) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 형식이 올바르지 않습니다.');
  }
}

function checkLength(v: string | null, max: number, label: string): void {
  if (v !== null && v.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) ' + max + '자 이하여야 합니다.');
  }
}

function checkUseYn(v: string | null): void {
  if (v !== null && !USE_YNS.includes(v)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
  }
}

function checkRange(start: string | null, end: string | null): void {
  if (start !== null && end !== null && end < start) {
    throw new ApiError(400, 'VALIDATION_FAILED', '적용 종료일은 시작일 이후여야 합니다.');
  }
}

@Controller('api/v1')
export class FnSfr01701Controller {
  @Get('/attendance-standards')
  async listAttendanceStandards(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const standardType = opt(q['standardType']);
    const useYn = opt(q['useYn']);
    if (standardType !== null && !TYPES.includes(standardType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '기준 구분이 올바르지 않습니다.');
    }
    checkUseYn(useYn);
    const pageRaw = opt(q['page']);
    const sizeRaw = opt(q['size']);
    const page = pageRaw === null ? 0 : Number(pageRaw);
    const size = sizeRaw === null ? 20 : Number(sizeRaw);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
    }
    const limit = Math.min(size, 200);
    return transaction(async (db) => {
      const params = { standardType, useYn, limit, offset: page * limit };
      const where =
        'WHERE (CAST(:standardType AS text) IS NULL OR standard_type = CAST(:standardType AS text)) ' +
        'AND (CAST(:useYn AS text) IS NULL OR use_yn = CAST(:useYn AS text))';
      const items = await db.query(
        'SELECT attendance_standard_id AS "attendanceStandardId", standard_type AS "standardType", ' +
          'item_name AS "itemName", standard_value AS "standardValue", unit AS "unit", use_yn AS "useYn", ' +
          'apply_start_date AS "applyStartDate", apply_end_date AS "applyEndDate" ' +
          'FROM attendance_standard ' + where +
          ' ORDER BY attendance_standard_id DESC LIMIT :limit OFFSET :offset',
        params,
      );
      const totals = await db.query(
        'SELECT COUNT(*) AS "total" FROM attendance_standard ' + where,
        { standardType, useYn },
      );
      return { items, page, size: limit, total: Number(totals[0].total) };
    });
  }

  @Post('/attendance-standards')
  @HttpCode(200)
  async createAttendanceStandard(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const standardType = opt(data['standardType']);
    const itemName = opt(data['itemName']);
    if (standardType === null || itemName === null || itemName.trim() === '') {
      throw new ApiError(422, 'ATTENDANCE_STANDARD_REQUIRED_MISSING', '기준 구분과 기준 항목명을 입력해 주세요.');
    }
    if (!TYPES.includes(standardType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '기준 구분이 올바르지 않습니다.');
    }
    const standardValue = opt(data['standardValue']);
    const unit = opt(data['unit']);
    const useYn = opt(data['useYn']) ?? DEFAULT_USE_YN;
    const applyStartDate = opt(data['applyStartDate']);
    const applyEndDate = opt(data['applyEndDate']);
    checkLength(itemName, 100, '기준 항목명');
    checkLength(standardValue, 200, '기준 값');
    checkLength(unit, 30, '단위');
    checkUseYn(useYn);
    checkDate(applyStartDate, '적용 시작일');
    checkDate(applyEndDate, '적용 종료일');
    checkRange(applyStartDate, applyEndDate);
    // TODO: 마감된 기간 판정 근거(마감 테이블)가 입력에 없어 ATTENDANCE_PERIOD_CLOSED 검사는 구현하지 못했다.
    return transaction(async (db) => {
      const rows = await db.query(
        'INSERT INTO attendance_standard (standard_type, item_name, standard_value, unit, use_yn, ' +
          'apply_start_date, apply_end_date, created_at, updated_at) ' +
          'VALUES (:standardType, :itemName, :standardValue, :unit, :useYn, ' +
          'CAST(:applyStartDate AS date), CAST(:applyEndDate AS date), now(), now()) ' +
          'RETURNING attendance_standard_id AS "attendanceStandardId"',
        { standardType, itemName, standardValue, unit, useYn, applyStartDate, applyEndDate },
      );
      const id = Number(rows[0].attendanceStandardId);
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, ' +
          'change_content, created_at, updated_at) ' +
          "VALUES (CAST(:userId AS bigint), 'attendance_standard', :id, '등록', now(), :content, now(), now())",
        { userId: user.id, id, content: '기준정보 등록: ' + standardType + ' / ' + itemName },
      );
      return { attendanceStandardId: id };
    });
  }

  @Patch('/attendance-standards/:attendanceStandardId')
  async updateAttendanceStandard(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['attendanceStandardId'];
    if (!/^\d+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '기준정보 ID가 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const itemName = opt(data['itemName']);
    if (data['itemName'] !== undefined && (itemName === null || itemName.trim() === '')) {
      throw new ApiError(422, 'ATTENDANCE_STANDARD_REQUIRED_MISSING', '기준 항목명을 입력해 주세요.');
    }
    const standardValue = opt(data['standardValue']);
    const unit = opt(data['unit']);
    const useYn = opt(data['useYn']);
    const applyStartDate = opt(data['applyStartDate']);
    const applyEndDate = opt(data['applyEndDate']);
    checkLength(itemName, 100, '기준 항목명');
    checkLength(standardValue, 200, '기준 값');
    checkLength(unit, 30, '단위');
    checkUseYn(useYn);
    checkDate(applyStartDate, '적용 시작일');
    checkDate(applyEndDate, '적용 종료일');
    checkRange(applyStartDate, applyEndDate);
    // TODO: 마감된 기간 판정 근거가 없어 ATTENDANCE_PERIOD_CLOSED 검사는 구현하지 못했다.
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT attendance_standard_id FROM attendance_standard WHERE attendance_standard_id = CAST(:id AS bigint)',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'ATTENDANCE_STANDARD_NOT_FOUND', '기준정보를 찾을 수 없습니다.');
      }
      await db.execute(
        'UPDATE attendance_standard SET ' +
          'item_name = COALESCE(CAST(:itemName AS varchar), item_name), ' +
          'standard_value = COALESCE(CAST(:standardValue AS varchar), standard_value), ' +
          'unit = COALESCE(CAST(:unit AS varchar), unit), ' +
          'use_yn = COALESCE(CAST(:useYn AS varchar), use_yn), ' +
          'apply_start_date = COALESCE(CAST(:applyStartDate AS date), apply_start_date), ' +
          'apply_end_date = COALESCE(CAST(:applyEndDate AS date), apply_end_date), ' +
          'updated_at = now() WHERE attendance_standard_id = CAST(:id AS bigint)',
        { id: idText, itemName, standardValue, unit, useYn, applyStartDate, applyEndDate },
      );
      const changed = Object.keys(data).join(', ');
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, ' +
          'change_content, created_at, updated_at) ' +
          "VALUES (CAST(:userId AS bigint), 'attendance_standard', CAST(:id AS bigint), '수정', now(), :content, now(), now())",
        { userId: user.id, id: idText, content: '기준정보 수정 항목: ' + changed },
      );
      return { attendanceStandardId: Number(idText) };
    });
  }

  @Delete('/attendance-standards/:attendanceStandardId')
  async deleteAttendanceStandard(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['attendanceStandardId'];
    if (!/^\d+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '기준정보 ID가 올바르지 않습니다.');
    }
    // TODO: 마감된 기간 판정 근거가 없어 ATTENDANCE_PERIOD_CLOSED 검사는 구현하지 못했다.
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT standard_type AS "standardType", item_name AS "itemName" FROM attendance_standard ' +
          'WHERE attendance_standard_id = CAST(:id AS bigint)',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'ATTENDANCE_STANDARD_NOT_FOUND', '기준정보를 찾을 수 없습니다.');
      }
      await db.execute(
        'DELETE FROM attendance_standard WHERE attendance_standard_id = CAST(:id AS bigint)',
        { id: idText },
      );
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, ' +
          'change_content, created_at, updated_at) ' +
          "VALUES (CAST(:userId AS bigint), 'attendance_standard', CAST(:id AS bigint), '삭제', now(), :content, now(), now())",
        {
          userId: user.id,
          id: idText,
          content: '기준정보 삭제: ' + found[0].standardType + ' / ' + found[0].itemName,
        },
      );
      return {};
    });
  }
}
