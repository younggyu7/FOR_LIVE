import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 지급공제항목 등록 시 사용 여부 기본값
const DEFAULT_USE_YN = '사용';
// 가정: 개인정보 열람 이력에 남기는 대상 정보 구분
const TARGET_INFO_TYPE = '원천징수세액 조정 신청';
const ITEM_TYPES = ['지급', '공제'];
const USE_YNS = ['사용', '미사용'];

function text(v: unknown): string | null {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  if (typeof v !== 'string') {
    throw new ApiError(400, 'VALIDATION_FAILED', '문자열 형식이 올바르지 않습니다.');
  }
  return v;
}

function numText(v: unknown, label: string): string | null {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  const ok = (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)));
  if (!ok) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 숫자여야 합니다.');
  }
  return String(v);
}

function intText(v: unknown, label: string): string | null {
  const n = numText(v, label);
  if (n !== null && !Number.isInteger(Number(n))) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 정수여야 합니다.');
  }
  return n;
}

function pageOf(q: Record<string, unknown>): { page: number; size: number } {
  const p = intText(q['page'], 'page');
  const s = intText(q['size'], 'size');
  const page = p === null ? 0 : Math.max(0, Number(p));
  const size = s === null ? 20 : Math.min(200, Math.max(1, Number(s)));
  return { page, size };
}

@Controller('api/v1')
export class FnSfr02003Controller {
  @Get('/payroll-items')
  async listPayrollItems(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const q = checks.queryOf(req.query);
    const itemType = text(q['itemType']);
    if (itemType !== null && !ITEM_TYPES.includes(itemType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '지급공제 구분이 올바르지 않습니다.');
    }
    const { page, size } = pageOf(q);
    return transaction(async (db) => {
      const params = { itemType, size, offset: page * size };
      const rows = await db.query(
        'SELECT payroll_item_id AS "payrollItemId", item_type AS "itemType", item_name AS "itemName", use_yn AS "useYn" ' +
        'FROM payroll_item WHERE (CAST(:itemType AS text) IS NULL OR item_type = :itemType) ' +
        'ORDER BY payroll_item_id LIMIT :size OFFSET :offset',
        params,
      );
      const cnt = await db.query(
        'SELECT COUNT(*) AS "total" FROM payroll_item WHERE (CAST(:itemType AS text) IS NULL OR item_type = :itemType)',
        { itemType },
      );
      return { items: rows, page, size, total: Number(cnt[0].total) };
    });
  }

  @Post('/payroll-items')
  @HttpCode(200)
  async createPayrollItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const itemType = text(data['itemType']);
    const itemName = text(data['itemName']);
    const useYn = text(data['useYn']) ?? DEFAULT_USE_YN;
    if (itemType === null || !ITEM_TYPES.includes(itemType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '지급공제 구분은 지급 또는 공제여야 합니다.');
    }
    if (itemName === null || itemName.length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', '항목명은 필수이며 100자 이하여야 합니다.');
    }
    if (!USE_YNS.includes(useYn)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        'INSERT INTO payroll_item (item_type, item_name, use_yn, created_at, updated_at) ' +
        'VALUES (:itemType, :itemName, :useYn, now(), now()) RETURNING payroll_item_id AS "payrollItemId"',
        { itemType, itemName, useYn },
      );
      return { payrollItemId: Number(rows[0].payrollItemId) };
    });
  }

  @Patch('/payroll-items/:payrollItemId')
  async updatePayrollItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const idText = intText(req.params['payrollItemId'], 'payrollItemId');
    const itemName = text(data['itemName']);
    const useYn = text(data['useYn']);
    if (itemName !== null && itemName.length > 100) {
      throw new ApiError(400, 'VALIDATION_FAILED', '항목명은 100자 이하여야 합니다.');
    }
    if (useYn !== null && !USE_YNS.includes(useYn)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부가 올바르지 않습니다.');
    }
    if (itemName === null && useYn === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '수정할 값을 입력해 주세요.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT item_name AS "itemName", use_yn AS "useYn" FROM payroll_item WHERE payroll_item_id = CAST(:id AS bigint)',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PAYROLL_ITEM_NOT_FOUND', '지급공제항목을 찾을 수 없습니다.');
      }
      await db.execute(
        'UPDATE payroll_item SET item_name = COALESCE(:itemName, item_name), use_yn = COALESCE(:useYn, use_yn), updated_at = now() ' +
        'WHERE payroll_item_id = CAST(:id AS bigint)',
        { id: idText, itemName, useYn },
      );
      const content = '항목명: ' + found[0].itemName + ' → ' + (itemName ?? found[0].itemName) + ', 사용 여부: ' + found[0].useYn + ' → ' + (useYn ?? found[0].useYn);
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) ' +
        'VALUES (CAST(:userId AS bigint), :targetType, CAST(:id AS bigint), :changeType, now(), :content, now(), now())',
        { userId: user.id, targetType: 'payroll_item', id: idText, changeType: '설정 변경', content },
      );
      return { payrollItemId: Number(idText) };
    });
  }

  @Post('/withholding-adjustment-requests')
  @HttpCode(200)
  async createWithholdingAdjustmentRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자', '임직원');
    const data = checks.inputOf(req.body);
    const employeeId = intText(data['employeeId'], '신청 임직원');
    const taxYear = intText(data['taxYear'], '조정 대상 연도');
    const rate = numText(data['adjustmentRate'], '조정 세율');
    const amount = numText(data['adjustmentAmount'], '조정 금액');
    const reason = text(data['reason']);
    if (employeeId === null || taxYear === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '신청 임직원과 조정 대상 연도는 필수입니다.');
    }
    if (rate !== null && Number(rate) < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조정 세율은 0 이상이어야 합니다.');
    }
    // 가정: 조정 금액 암호화 모듈이 허용된 import에 없어 평문은 저장하지 않는다 (todos 참고)
    void amount;
    return transaction(async (db) => {
      const emp = await db.query('SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)', { employeeId });
      if (emp.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '신청 대상 임직원을 찾을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT withholding_adjustment_request_id FROM withholding_adjustment_request ' +
        'WHERE employee_id = CAST(:employeeId AS bigint) AND tax_year = CAST(:taxYear AS integer)',
        { employeeId, taxYear },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'WITHHOLDING_REQUEST_DUPLICATED', '동일 임직원·연도의 신청이 이미 있습니다.');
      }
      const rows = await db.query(
        'INSERT INTO withholding_adjustment_request (employee_id, tax_year, adjustment_rate, reason, approval_status, created_at, updated_at) ' +
        'VALUES (CAST(:employeeId AS bigint), CAST(:taxYear AS integer), CAST(:rate AS numeric), :reason, :status, now(), now()) ' +
        'RETURNING withholding_adjustment_request_id AS "withholdingAdjustmentRequestId", approval_status AS "approvalStatus"',
        { employeeId, taxYear, rate, reason, status: '신청' },
      );
      await db.execute(
        'INSERT INTO personal_info_access_log (employee_id, target_employee_id, target_info_type, access_type, accessed_at, created_at, updated_at) ' +
        'VALUES (CAST(:userId AS bigint), CAST(:employeeId AS bigint), :infoType, :accessType, now(), now(), now())',
        { userId: user.id, employeeId, infoType: TARGET_INFO_TYPE, accessType: '등록' },
      );
      return {
        withholdingAdjustmentRequestId: Number(rows[0].withholdingAdjustmentRequestId),
        approvalStatus: rows[0].approvalStatus,
      };
    });
  }

  @Get('/withholding-adjustment-requests')
  async listWithholdingAdjustmentRequests(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자', '임직원');
    const q = checks.queryOf(req.query);
    const taxYear = intText(q['taxYear'], '조정 대상 연도');
    const employeeId = intText(q['employeeId'], '신청 임직원');
    const { page, size } = pageOf(q);
    return transaction(async (db) => {
      const where =
        'WHERE (CAST(:taxYear AS integer) IS NULL OR tax_year = CAST(:taxYear AS integer)) ' +
        'AND (CAST(:employeeId AS bigint) IS NULL OR employee_id = CAST(:employeeId AS bigint))';
      const rows = await db.query(
        'SELECT withholding_adjustment_request_id AS "withholdingAdjustmentRequestId", employee_id AS "employeeId", tax_year AS "taxYear", ' +
        'adjustment_rate AS "adjustmentRate", reason AS "reason", approval_status AS "approvalStatus" ' +
        'FROM withholding_adjustment_request ' + where + ' ORDER BY withholding_adjustment_request_id DESC LIMIT :size OFFSET :offset',
        { taxYear, employeeId, size, offset: page * size },
      );
      const cnt = await db.query('SELECT COUNT(*) AS "total" FROM withholding_adjustment_request ' + where, { taxYear, employeeId });
      await db.execute(
        'INSERT INTO personal_info_access_log (employee_id, target_employee_id, target_info_type, access_type, accessed_at, created_at, updated_at) ' +
        'VALUES (CAST(:userId AS bigint), CAST(:employeeId AS bigint), :infoType, :accessType, now(), now(), now())',
        { userId: user.id, employeeId, infoType: TARGET_INFO_TYPE, accessType: '조회' },
      );
      return {
        items: rows.map((r: any) => ({ ...r, adjustmentRate: r.adjustmentRate === null ? null : Number(r.adjustmentRate) })),
        page,
        size,
        total: Number(cnt[0].total),
      };
    });
  }

  @Patch('/withholding-adjustment-requests/:withholdingAdjustmentRequestId')
  async updateWithholdingAdjustmentRequest(@Req() req: Request) {
    const user = currentUser(req);
    user.require('급여 담당자');
    const data = checks.inputOf(req.body);
    const idText = intText(req.params['withholdingAdjustmentRequestId'], 'withholdingAdjustmentRequestId');
    const rate = numText(data['adjustmentRate'], '조정 세율');
    const reason = text(data['reason']);
    if (rate !== null && Number(rate) < 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조정 세율은 0 이상이어야 합니다.');
    }
    if (rate === null && reason === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '수정할 값을 입력해 주세요.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT approval_status AS "approvalStatus", adjustment_rate AS "adjustmentRate", reason AS "reason" ' +
        'FROM withholding_adjustment_request WHERE withholding_adjustment_request_id = CAST(:id AS bigint)',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'WITHHOLDING_REQUEST_NOT_FOUND', '조정 신청을 찾을 수 없습니다.');
      }
      if (found[0].approvalStatus === '승인') {
        throw new ApiError(409, 'WITHHOLDING_REQUEST_APPROVED', '승인된 신청은 수정할 수 없습니다. 승인 취소 후 수정해 주세요.');
      }
      // 가정: 마감 상태인 신청은 마감된 급여 기간의 데이터로 본다
      if (found[0].approvalStatus === '마감') {
        throw new ApiError(409, 'PAYROLL_PERIOD_CLOSED', '마감된 데이터입니다. 마감 취소 후 수정해 주세요.');
      }
      await db.execute(
        'UPDATE withholding_adjustment_request SET adjustment_rate = COALESCE(CAST(:rate AS numeric), adjustment_rate), ' +
        'reason = COALESCE(:reason, reason), updated_at = now() WHERE withholding_adjustment_request_id = CAST(:id AS bigint)',
        { id: idText, rate, reason },
      );
      const content = '조정 세율: ' + found[0].adjustmentRate + ' → ' + (rate ?? found[0].adjustmentRate) + ', 사유 수정: ' + (reason !== null ? '예' : '아니오');
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) ' +
        'VALUES (CAST(:userId AS bigint), :targetType, CAST(:id AS bigint), :changeType, now(), :content, now(), now())',
        { userId: user.id, targetType: 'withholding_adjustment_request', id: idText, changeType: '신청 수정', content },
      );
      return { withholdingAdjustmentRequestId: Number(idText) };
    });
  }
}
