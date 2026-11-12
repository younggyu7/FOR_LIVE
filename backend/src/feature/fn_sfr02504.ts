import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '자산 담당자';
// 가정: 신청 시 초기 상태 (BEHAVIOR.md 값의 출처)
const INITIAL_APPROVAL = '신청';
const INITIAL_PROGRESS = '진행';
const DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

function bad(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function textOf(v: unknown, label: string, required: boolean, max: number): string | null {
  if (isEmpty(v)) {
    if (required) {
      throw bad(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (typeof v !== 'string' || v.trim() === '') {
    throw bad(label + ' 형식이 올바르지 않습니다.');
  }
  if (max > 0 && v.length > max) {
    throw bad(label + '은(는) ' + max + '자 이하로 입력해 주세요.');
  }
  return v;
}

function dateOf(v: unknown, label: string, required: boolean): string | null {
  if (isEmpty(v)) {
    if (required) {
      throw bad(label + '을(를) 입력해 주세요.');
    }
    return null;
  }
  if (typeof v !== 'string' || !DATE_RE.test(v)) {
    throw bad(label + ' 형식이 올바르지 않습니다. (YYYY-MM-DD)');
  }
  return v;
}

function managerOf(v: unknown): string | null {
  if (isEmpty(v)) {
    return null;
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) {
    throw bad('실사 담당자 ID 형식이 올바르지 않습니다.');
  }
  return String(n);
}

function intParam(v: unknown, fallback: number, label: string): number {
  if (isEmpty(v)) {
    return fallback;
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) {
    throw bad(label + ' 형식이 올바르지 않습니다.');
  }
  return n;
}

function planIdOf(req: Request): string {
  const id = req.params['assetInspectionPlanId'];
  if (typeof id !== 'string' || !/^[0-9]+$/.test(id)) {
    throw new ApiError(404, 'INSPECTION_PLAN_NOT_FOUND', '실사계획을 찾을 수 없습니다.');
  }
  return id;
}

async function loadPlan(db: any, id: string): Promise<Record<string, unknown>> {
  const rows = await db.query(
    'SELECT approval_status AS "approvalStatus", progress_status AS "progressStatus" FROM asset_inspection_plan WHERE asset_inspection_plan_id = CAST(:id AS bigint)',
    { id },
  );
  if (!rows.length) {
    throw new ApiError(404, 'INSPECTION_PLAN_NOT_FOUND', '실사계획을 찾을 수 없습니다.');
  }
  return rows[0] as Record<string, unknown>;
}

async function ensureEmployee(db: any, managerId: string | null | undefined): Promise<void> {
  if (managerId === null || managerId === undefined) {
    return;
  }
  const rows = await db.query(
    'SELECT employee_id FROM employee WHERE employee_id = CAST(:managerId AS bigint)',
    { managerId },
  );
  if (!rows.length) {
    throw bad('존재하지 않는 실사 담당자입니다.');
  }
}

function periodError(): ApiError {
  return new ApiError(422, 'INVALID_INSPECTION_PERIOD', '실사 종료일은 시작일보다 늦어야 합니다.');
}

@Controller('api/v1')
export class FnSfr02504Controller {
  @Post('/asset-inspection-plans')
  @HttpCode(200)
  async createAssetInspectionPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const inspectionType = textOf(data['inspectionType'], '실사 유형', true, 50);
    const startDate = dateOf(data['startDate'], '실사 시작일', true);
    const endDate = dateOf(data['endDate'], '실사 종료일', true);
    const targetScope = textOf(data['targetScope'], '실사 대상 범위', true, 0);
    // 가정: 담당자를 입력하지 않으면 작성한 사용자를 실사 담당자로 한다
    const managerId: string = managerOf(data['managerId']) ?? String(user.id);
    return transaction(async (db) => {
      const periodRows = await db.query(
        'SELECT (CAST(:endDate AS date) > CAST(:startDate AS date)) AS "ok"',
        { startDate, endDate },
      );
      if (!(periodRows[0] as Record<string, unknown>)['ok']) {
        throw periodError();
      }
      await ensureEmployee(db, managerId);
      const rows = await db.query(
        'INSERT INTO asset_inspection_plan (manager_id, inspection_type, start_date, end_date, target_scope, approval_status, progress_status, created_at, updated_at) ' +
          'VALUES (CAST(:managerId AS bigint), :inspectionType, CAST(:startDate AS date), CAST(:endDate AS date), :targetScope, :approvalStatus, :progressStatus, now(), now()) ' +
          'RETURNING asset_inspection_plan_id AS "assetInspectionPlanId", approval_status AS "approvalStatus"',
        {
          managerId,
          inspectionType,
          startDate,
          endDate,
          targetScope,
          approvalStatus: INITIAL_APPROVAL,
          progressStatus: INITIAL_PROGRESS,
        },
      );
      return rows[0];
    });
  }

  @Patch('/asset-inspection-plans/:assetInspectionPlanId')
  async updateAssetInspectionPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = planIdOf(req);
    const data = checks.inputOf(req.body);
    const inspectionType = textOf(data['inspectionType'], '실사 유형', false, 50);
    const startDate = dateOf(data['startDate'], '실사 시작일', false);
    const endDate = dateOf(data['endDate'], '실사 종료일', false);
    const targetScope = textOf(data['targetScope'], '실사 대상 범위', false, 0);
    const managerId = managerOf(data['managerId']);
    return transaction(async (db) => {
      const plan = await loadPlan(db, id);
      if (plan['approvalStatus'] === '승인') {
        throw new ApiError(409, 'INSPECTION_PLAN_APPROVED', '승인된 계획은 수정할 수 없습니다. 승인을 취소한 뒤 수정해 주세요.');
      }
      const periodRows = await db.query(
        'SELECT (COALESCE(CAST(:endDate AS date), end_date) > COALESCE(CAST(:startDate AS date), start_date)) AS "ok" ' +
          'FROM asset_inspection_plan WHERE asset_inspection_plan_id = CAST(:id AS bigint)',
        { id, startDate, endDate },
      );
      if (!(periodRows[0] as Record<string, unknown>)['ok']) {
        throw periodError();
      }
      await ensureEmployee(db, managerId);
      await db.execute(
        'UPDATE asset_inspection_plan SET ' +
          'inspection_type = COALESCE(CAST(:inspectionType AS varchar), inspection_type), ' +
          'start_date = COALESCE(CAST(:startDate AS date), start_date), ' +
          'end_date = COALESCE(CAST(:endDate AS date), end_date), ' +
          'target_scope = COALESCE(CAST(:targetScope AS text), target_scope), ' +
          'manager_id = COALESCE(CAST(:managerId AS bigint), manager_id), ' +
          'updated_at = now() ' +
          'WHERE asset_inspection_plan_id = CAST(:id AS bigint)',
        { id, inspectionType, startDate, endDate, targetScope, managerId },
      );
      return { assetInspectionPlanId: Number(id) };
    });
  }

  @Delete('/asset-inspection-plans/:assetInspectionPlanId')
  async deleteAssetInspectionPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = planIdOf(req);
    return transaction(async (db) => {
      const plan = await loadPlan(db, id);
      if (plan['approvalStatus'] === '승인') {
        throw new ApiError(409, 'INSPECTION_PLAN_APPROVED', '승인된 계획은 삭제할 수 없습니다. 승인을 취소한 뒤 삭제해 주세요.');
      }
      if (plan['progressStatus'] !== '진행') {
        throw new ApiError(409, 'INSPECTION_NOT_IN_PROGRESS', '진행 중인 실사만 삭제할 수 있습니다.');
      }
      await db.execute(
        'DELETE FROM asset_inspection_plan WHERE asset_inspection_plan_id = CAST(:id AS bigint)',
        { id },
      );
      return {};
    });
  }

  @Post('/asset-inspection-plans/:assetInspectionPlanId/cancel-approval')
  @HttpCode(200)
  async cancelApprovalAssetInspectionPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = planIdOf(req);
    return transaction(async (db) => {
      const plan = await loadPlan(db, id);
      if (plan['approvalStatus'] !== '승인') {
        throw new ApiError(409, 'INSPECTION_PLAN_NOT_APPROVED', '승인 상태인 계획만 승인을 취소할 수 있습니다.');
      }
      const rows = await db.query(
        'UPDATE asset_inspection_plan SET approval_status = :status, updated_at = now() ' +
          'WHERE asset_inspection_plan_id = CAST(:id AS bigint) RETURNING approval_status AS "approvalStatus"',
        { id, status: '승인 취소' },
      );
      return rows[0];
    });
  }

  @Post('/asset-inspection-plans/:assetInspectionPlanId/cancel')
  @HttpCode(200)
  async cancelAssetInspectionPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = planIdOf(req);
    return transaction(async (db) => {
      const plan = await loadPlan(db, id);
      if (plan['progressStatus'] !== '진행') {
        throw new ApiError(409, 'INSPECTION_NOT_IN_PROGRESS', '진행 중인 실사만 취소할 수 있습니다.');
      }
      const rows = await db.query(
        'UPDATE asset_inspection_plan SET progress_status = :status, updated_at = now() ' +
          'WHERE asset_inspection_plan_id = CAST(:id AS bigint) RETURNING progress_status AS "progressStatus"',
        { id, status: '취소' },
      );
      return rows[0];
    });
  }

  @Post('/asset-inspection-plans/:assetInspectionPlanId/complete')
  @HttpCode(200)
  async completeAssetInspectionPlan(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = planIdOf(req);
    return transaction(async (db) => {
      const plan = await loadPlan(db, id);
      if (plan['progressStatus'] !== '진행') {
        throw new ApiError(409, 'INSPECTION_NOT_IN_PROGRESS', '진행 중인 실사만 완료할 수 있습니다.');
      }
      const rows = await db.query(
        'UPDATE asset_inspection_plan SET progress_status = :status, updated_at = now() ' +
          'WHERE asset_inspection_plan_id = CAST(:id AS bigint) RETURNING progress_status AS "progressStatus"',
        { id, status: '완료' },
      );
      return rows[0];
    });
  }

  @Get('/asset-inspection-plans')
  async listAssetInspectionPlans(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const page = intParam(query['page'], 0, 'page');
    const size = Math.min(intParam(query['size'], 20, 'size'), 200);
    if (size < 1) {
      throw bad('size 형식이 올바르지 않습니다.');
    }
    const inspectionType = textOf(query['inspectionType'], '실사 유형', false, 50);
    const approvalStatus = textOf(query['approvalStatus'], '승인 처리 상태', false, 20);
    const progressStatus = textOf(query['progressStatus'], '진행 상태', false, 20);
    const where =
      'WHERE (CAST(:inspectionType AS varchar) IS NULL OR inspection_type = CAST(:inspectionType AS varchar)) ' +
      'AND (CAST(:approvalStatus AS varchar) IS NULL OR approval_status = CAST(:approvalStatus AS varchar)) ' +
      'AND (CAST(:progressStatus AS varchar) IS NULL OR progress_status = CAST(:progressStatus AS varchar))';
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT asset_inspection_plan_id AS "assetInspectionPlanId", inspection_type AS "inspectionType", ' +
          "to_char(start_date, 'YYYY-MM-DD') AS \"startDate\", to_char(end_date, 'YYYY-MM-DD') AS \"endDate\", " +
          'approval_status AS "approvalStatus", progress_status AS "progressStatus" ' +
          'FROM asset_inspection_plan ' +
          where +
          ' ORDER BY asset_inspection_plan_id DESC LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { inspectionType, approvalStatus, progressStatus, size, offset: page * size },
      );
      const totals = await db.query(
        'SELECT COUNT(*) AS "total" FROM asset_inspection_plan ' + where,
        { inspectionType, approvalStatus, progressStatus },
      );
      return {
        items,
        page,
        size,
        total: Number((totals[0] as Record<string, unknown>)['total']),
      };
    });
  }
}
