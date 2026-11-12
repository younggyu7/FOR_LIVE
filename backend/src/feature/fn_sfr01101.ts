import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

type Db = Parameters<Parameters<typeof transaction>[0]>[0];

const ROLE = '자산 담당자';

function isNumeric(v: unknown): boolean {
  if (typeof v === 'number') return Number.isFinite(v);
  return typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim());
}

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function blank(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function amountOf(v: unknown): string {
  if (!isNumeric(v) || Number(v) < 0) {
    throw new ApiError(422, 'INVALID_ACQUISITION_AMOUNT', '취득원가는 0 이상의 숫자여야 합니다.');
  }
  return String(v).trim();
}

function monthsOf(v: unknown): string {
  if (!isNumeric(v) || !Number.isInteger(Number(v)) || Number(v) <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '내용연수(월)는 1 이상의 정수여야 합니다.');
  }
  return String(v).trim();
}

function idOf(v: unknown, label: string): string {
  if (!isNumeric(v) || !Number.isInteger(Number(v)) || Number(v) <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + ' 값이 올바르지 않습니다.');
  }
  return String(v).trim();
}

function requiredText(v: unknown, label: string, max: number): string {
  const s = text(v);
  if (s === '') {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '을(를) 입력해 주세요.');
  }
  if (s.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) ' + max + '자 이하여야 합니다.');
  }
  return s;
}

async function ensureAccountSubject(db: Db, id: string): Promise<void> {
  const rows = await db.query('SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:id AS bigint)', { id });
  if (rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', '계정과목을 찾을 수 없습니다.');
  }
}

async function ensureProject(db: Db, id: string): Promise<void> {
  const rows = await db.query('SELECT project_id FROM project WHERE project_id = CAST(:id AS bigint)', { id });
  if (rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
  }
}

async function ensurePartner(db: Db, id: string): Promise<void> {
  const rows = await db.query('SELECT partner_id FROM partner WHERE partner_id = CAST(:id AS bigint)', { id });
  if (rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', '거래처를 찾을 수 없습니다.');
  }
}

const SELECT_ASSET =
  'SELECT asset_id AS "assetId", asset_code AS "assetCode", asset_no AS "assetNo", asset_name AS "assetName", ' +
  'is_depreciable AS "isDepreciable", depreciation_method AS "depreciationMethod", ' +
  'useful_life_months AS "usefulLifeMonths", acquisition_amount AS "acquisitionAmount", ' +
  'account_subject_id AS "accountSubjectId", project_id AS "projectId", partner_id AS "partnerId" ' +
  'FROM asset WHERE asset_id = CAST(:assetId AS bigint)';

@Controller('api/v1')
export class FnSfr01101Controller {
  @Post('/assets')
  @HttpCode(200)
  async createAsset(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      const assetCode = requiredText(data['assetCode'], '자산코드', 50);
      const assetNo = requiredText(data['assetNo'], '자산번호', 50);
      const assetName = requiredText(data['assetName'], '자산명', 200);
      if (typeof data['isDepreciable'] !== 'boolean') {
        throw new ApiError(400, 'VALIDATION_FAILED', '상각 여부를 입력해 주세요.');
      }
      const isDepreciable = data['isDepreciable'] as boolean;
      const method = requiredText(data['depreciationMethod'], '상각 방법', 30);
      if (blank(data['usefulLifeMonths'])) {
        throw new ApiError(400, 'VALIDATION_FAILED', '내용연수(월)를 입력해 주세요.');
      }
      const months = monthsOf(data['usefulLifeMonths']);
      if (blank(data['acquisitionAmount'])) {
        throw new ApiError(400, 'VALIDATION_FAILED', '취득원가를 입력해 주세요.');
      }
      const amount = amountOf(data['acquisitionAmount']);
      const acquisitionDate = text(data['acquisitionDate']);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(acquisitionDate)) {
        throw new ApiError(400, 'VALIDATION_FAILED', '취득일을 YYYY-MM-DD 형식으로 입력해 주세요.');
      }
      // 가정: 감가상각 정보의 계정과목이 필수이므로 등록 시 계정과목을 필수로 본다.
      if (blank(data['accountSubjectId'])) {
        throw new ApiError(400, 'VALIDATION_FAILED', '계정과목을 선택해 주세요.');
      }
      const accountSubjectId = idOf(data['accountSubjectId'], '계정과목');
      const projectId = blank(data['projectId']) ? null : idOf(data['projectId'], '프로젝트');
      const partnerId = blank(data['partnerId']) ? null : idOf(data['partnerId'], '거래처');
      let salvage: string | null = null;
      if (!blank(data['salvageValue'])) {
        if (!isNumeric(data['salvageValue']) || Number(data['salvageValue']) < 0 || Number(data['salvageValue']) > Number(amount)) {
          throw new ApiError(400, 'VALIDATION_FAILED', '잔존가액은 0 이상이고 취득원가를 넘을 수 없습니다.');
        }
        salvage = String(data['salvageValue']).trim();
      }

      const dup = await db.query('SELECT asset_id FROM asset WHERE asset_code = :assetCode', { assetCode });
      if (dup.length > 0) {
        throw new ApiError(409, 'ASSET_CODE_DUPLICATED', '이미 등록된 고정자산 코드입니다.');
      }
      await ensureAccountSubject(db, accountSubjectId);
      if (projectId !== null) await ensureProject(db, projectId);
      if (partnerId !== null) await ensurePartner(db, partnerId);

      const rows = await db.query(
        'INSERT INTO asset (asset_code, asset_no, asset_name, project_id, account_subject_id, partner_id, ' +
          'is_depreciable, depreciation_method, useful_life_months, acquisition_amount, created_at, updated_at) ' +
          'VALUES (:assetCode, :assetNo, :assetName, CAST(:projectId AS bigint), CAST(:accountSubjectId AS bigint), ' +
          'CAST(:partnerId AS bigint), :isDepreciable, :method, CAST(:months AS integer), CAST(:amount AS numeric), now(), now()) ' +
          'RETURNING asset_id AS "assetId", asset_code AS "assetCode"',
        { assetCode, assetNo, assetName, projectId, accountSubjectId, partnerId, isDepreciable, method, months, amount },
      );
      const created = rows[0];
      // 가정: 감가상각 정보는 요청의 취득원가·상각 방법·내용연수·계정과목을 그대로 쓴다.
      await db.execute(
        'INSERT INTO asset_depreciation (asset_id, account_subject_id, acquisition_date, acquisition_cost, ' +
          'depreciation_method, useful_life_months, salvage_value, created_at, updated_at) ' +
          'VALUES (CAST(:assetId AS bigint), CAST(:accountSubjectId AS bigint), CAST(:acquisitionDate AS date), ' +
          'CAST(:amount AS numeric), :method, CAST(:months AS integer), CAST(:salvage AS numeric), now(), now())',
        { assetId: created.assetId, accountSubjectId, acquisitionDate, amount, method, months, salvage },
      );
      return { assetId: created.assetId, assetCode: created.assetCode };
    });
  }

  @Get('/assets/:assetId')
  async getAsset(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const assetId = req.params['assetId'];
    return transaction(async (db) => {
      if (!/^\d+$/.test(assetId)) {
        throw new ApiError(404, 'ASSET_NOT_FOUND', '고정자산을 찾을 수 없습니다.');
      }
      const rows = await db.query(SELECT_ASSET, { assetId });
      if (rows.length === 0) {
        throw new ApiError(404, 'ASSET_NOT_FOUND', '고정자산을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }

  @Patch('/assets/:assetId')
  @HttpCode(200)
  async updateAsset(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const assetId = req.params['assetId'];
    return transaction(async (db) => {
      if (!/^\d+$/.test(assetId)) {
        throw new ApiError(404, 'ASSET_NOT_FOUND', '고정자산을 찾을 수 없습니다.');
      }
      const found = await db.query(SELECT_ASSET + ' FOR UPDATE', { assetId });
      if (found.length === 0) {
        throw new ApiError(404, 'ASSET_NOT_FOUND', '고정자산을 찾을 수 없습니다.');
      }
      const before = found[0] as Record<string, unknown>;

      const params: Record<string, unknown> = { assetId };
      const sets: string[] = [];
      const depSets: string[] = [];
      const changes: Record<string, { before: unknown; after: unknown }> = {};
      const record = (key: string, value: unknown) => {
        params[key] = value;
        changes[key] = { before: before[key], after: value };
      };

      if (!blank(data['assetName'])) {
        record('assetName', requiredText(data['assetName'], '자산명', 200));
        sets.push('asset_name = :assetName');
      }
      if (data['isDepreciable'] !== undefined && data['isDepreciable'] !== null) {
        if (typeof data['isDepreciable'] !== 'boolean') {
          throw new ApiError(400, 'VALIDATION_FAILED', '상각 여부 형식이 올바르지 않습니다.');
        }
        record('isDepreciable', data['isDepreciable']);
        sets.push('is_depreciable = :isDepreciable');
      }
      if (!blank(data['depreciationMethod'])) {
        record('depreciationMethod', requiredText(data['depreciationMethod'], '상각 방법', 30));
        sets.push('depreciation_method = :depreciationMethod');
        depSets.push('depreciation_method = :depreciationMethod');
      }
      if (!blank(data['usefulLifeMonths'])) {
        record('usefulLifeMonths', monthsOf(data['usefulLifeMonths']));
        sets.push('useful_life_months = CAST(:usefulLifeMonths AS integer)');
        depSets.push('useful_life_months = CAST(:usefulLifeMonths AS integer)');
      }
      if (!blank(data['acquisitionAmount'])) {
        record('acquisitionAmount', amountOf(data['acquisitionAmount']));
        sets.push('acquisition_amount = CAST(:acquisitionAmount AS numeric)');
        depSets.push('acquisition_cost = CAST(:acquisitionAmount AS numeric)');
      } else if (data['acquisitionAmount'] === '') {
        amountOf(data['acquisitionAmount']);
      }
      if (!blank(data['accountSubjectId'])) {
        const id = idOf(data['accountSubjectId'], '계정과목');
        await ensureAccountSubject(db, id);
        record('accountSubjectId', id);
        sets.push('account_subject_id = CAST(:accountSubjectId AS bigint)');
        depSets.push('account_subject_id = CAST(:accountSubjectId AS bigint)');
      }
      if (!blank(data['projectId'])) {
        const id = idOf(data['projectId'], '프로젝트');
        await ensureProject(db, id);
        record('projectId', id);
        sets.push('project_id = CAST(:projectId AS bigint)');
      }
      if (!blank(data['partnerId'])) {
        const id = idOf(data['partnerId'], '거래처');
        await ensurePartner(db, id);
        record('partnerId', id);
        sets.push('partner_id = CAST(:partnerId AS bigint)');
      }
      if (sets.length === 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '수정할 항목이 없습니다.');
      }

      await db.execute(
        'UPDATE asset SET ' + sets.join(', ') + ', updated_at = now() WHERE asset_id = CAST(:assetId AS bigint)',
        params,
      );
      if (depSets.length > 0) {
        // 가정: 감가상각 정보에도 같은 값(취득원가·상각 방법·내용연수·계정과목)을 맞춘다.
        await db.execute(
          'UPDATE asset_depreciation SET ' + depSets.join(', ') + ', updated_at = now() WHERE asset_id = CAST(:assetId AS bigint)',
          params,
        );
      }
      await db.execute(
        'INSERT INTO change_history (changer_id, target_type, target_id, changed_at, change_content, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :targetType, CAST(:assetId AS bigint), now(), :content, now(), now())',
        { userId: user.id, targetType: 'asset', assetId, content: JSON.stringify(changes) },
      );
      return { assetId: before['assetId'] };
    });
  }
}
