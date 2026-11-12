import { Controller, Get, Post, Patch, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 신규 자산품목의 자산 등록 연계 여부 초기값
const ASSET_LINKED_INITIAL = false;
// 승인된 구매품의로 보는 상태
const APPROVED_STATUSES = ['승인', '완료'];

function invalid(message: string): never {
  throw new ApiError(400, 'VALIDATION_FAILED', message);
}

function isNum(v: unknown): boolean {
  if (typeof v === 'number') {
    return Number.isFinite(v);
  }
  return typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v));
}

function has(v: unknown): boolean {
  return v !== undefined && v !== null && v !== '';
}

function checkId(v: unknown, label: string): number {
  if (!isNum(v) || !Number.isInteger(Number(v)) || Number(v) <= 0) {
    invalid(label + ' 값이 올바르지 않습니다.');
  }
  return Number(v);
}

function checkName(v: unknown): string {
  if (typeof v !== 'string' || v.trim() === '' || v.length > 200) {
    invalid('자산품목명을 200자 이내로 입력해 주세요.');
  }
  return (v as string).trim();
}

function checkQuantity(v: unknown): number {
  if (!isNum(v) || !Number.isInteger(Number(v)) || Number(v) <= 0) {
    invalid('수량은 1 이상의 정수로 입력해 주세요.');
  }
  return Number(v);
}

function checkAmount(v: unknown): number {
  if (!isNum(v) || Number(v) < 0) {
    invalid('금액은 0 이상의 숫자로 입력해 주세요.');
  }
  return Number(v);
}

function checkCategory(v: unknown): string {
  if (typeof v !== 'string' || v.length > 100) {
    invalid('자산 분류는 100자 이내의 글자로 입력해 주세요.');
  }
  return v as string;
}

function checkBool(v: unknown): boolean {
  if (typeof v !== 'boolean') {
    invalid('검수 필요 여부를 선택해 주세요.');
  }
  return v as boolean;
}

@Controller('api/v1')
export class FnSfr02403Controller {
  @Post('/purchase-asset-items')
  @HttpCode(200)
  async createPurchaseAssetItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '자산 담당자');
    const data = checks.inputOf(req.body);
    const requisitionId = checkId(data['requisitionId'], '품의서');
    const itemName = checkName(data['itemName']);
    const quantity = checkQuantity(data['quantity']);
    const amount = checkAmount(data['amount']);
    const inspectionRequired = checkBool(data['inspectionRequired']);
    const assetCategory = has(data['assetCategory']) ? checkCategory(data['assetCategory']) : null;
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT status FROM requisition WHERE requisition_id = CAST(:requisitionId AS bigint)',
        { requisitionId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'REQUISITION_NOT_FOUND', '구매품의서를 찾을 수 없습니다.');
      }
      if (APPROVED_STATUSES.includes(String(found[0]['status']))) {
        throw new ApiError(409, 'REQUISITION_ALREADY_APPROVED', '승인된 구매품의에는 자산품목을 등록할 수 없습니다. 승인 취소 절차를 먼저 진행해 주세요.');
      }
      const rows = await db.query(
        'INSERT INTO purchase_asset_item (requisition_id, item_name, quantity, amount, asset_category, inspection_required, asset_linked, created_at, updated_at) '
          + 'VALUES (CAST(:requisitionId AS bigint), :itemName, CAST(:quantity AS integer), CAST(:amount AS numeric), :assetCategory, CAST(:inspectionRequired AS boolean), CAST(:assetLinked AS boolean), now(), now()) '
          + 'RETURNING purchase_asset_item_id AS "purchaseAssetItemId", asset_linked AS "assetLinked"',
        { requisitionId, itemName, quantity, amount, assetCategory, inspectionRequired, assetLinked: ASSET_LINKED_INITIAL },
      );
      return rows[0];
    });
  }

  @Patch('/purchase-asset-items/:purchaseAssetItemId')
  async updatePurchaseAssetItem(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '자산 담당자');
    const id = checkId(req.params['purchaseAssetItemId'], '자산품목');
    const data = checks.inputOf(req.body);
    const itemName = has(data['itemName']) ? checkName(data['itemName']) : null;
    const quantity = has(data['quantity']) ? checkQuantity(data['quantity']) : null;
    const amount = has(data['amount']) ? checkAmount(data['amount']) : null;
    const assetCategory = has(data['assetCategory']) ? checkCategory(data['assetCategory']) : null;
    const inspectionRequired = has(data['inspectionRequired']) ? checkBool(data['inspectionRequired']) : null;
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT r.status AS status FROM purchase_asset_item p JOIN requisition r ON r.requisition_id = p.requisition_id '
          + 'WHERE p.purchase_asset_item_id = CAST(:id AS bigint)',
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PURCHASE_ASSET_ITEM_NOT_FOUND', '자산품목을 찾을 수 없습니다.');
      }
      if (APPROVED_STATUSES.includes(String(found[0]['status']))) {
        throw new ApiError(409, 'REQUISITION_ALREADY_APPROVED', '승인된 구매품의의 자산품목은 수정할 수 없습니다. 승인 취소 절차를 먼저 진행해 주세요.');
      }
      const rows = await db.query(
        'UPDATE purchase_asset_item SET '
          + 'item_name = COALESCE(CAST(:itemName AS varchar), item_name), '
          + 'quantity = COALESCE(CAST(:quantity AS integer), quantity), '
          + 'amount = COALESCE(CAST(:amount AS numeric), amount), '
          + 'asset_category = COALESCE(CAST(:assetCategory AS varchar), asset_category), '
          + 'inspection_required = COALESCE(CAST(:inspectionRequired AS boolean), inspection_required), '
          + 'updated_at = now() '
          + 'WHERE purchase_asset_item_id = CAST(:id AS bigint) '
          + 'RETURNING purchase_asset_item_id AS "purchaseAssetItemId", item_name AS "itemName", quantity AS "quantity", amount AS "amount", inspection_required AS "inspectionRequired"',
        { id, itemName, quantity, amount, assetCategory, inspectionRequired },
      );
      return rows[0];
    });
  }

  @Get('/purchase-asset-items')
  async listPurchaseAssetItems(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '자산 담당자');
    const query = checks.queryOf(req.query);
    const requisitionId = has(query['requisitionId']) ? checkId(query['requisitionId'], '품의서') : null;
    let page = 0;
    if (has(query['page'])) {
      if (!isNum(query['page']) || Number(query['page']) < 0 || !Number.isInteger(Number(query['page']))) {
        invalid('page 값이 올바르지 않습니다.');
      }
      page = Number(query['page']);
    }
    let size = 20;
    if (has(query['size'])) {
      if (!isNum(query['size']) || Number(query['size']) < 1 || !Number.isInteger(Number(query['size']))) {
        invalid('size 값이 올바르지 않습니다.');
      }
      size = Math.min(Number(query['size']), 200);
    }
    const offset = page * size;
    return transaction(async (db) => {
      const where = 'WHERE (CAST(:requisitionId AS bigint) IS NULL OR requisition_id = CAST(:requisitionId AS bigint))';
      const counted = await db.query(
        'SELECT COUNT(*) AS "total" FROM purchase_asset_item ' + where,
        { requisitionId },
      );
      const items = await db.query(
        'SELECT purchase_asset_item_id AS "purchaseAssetItemId", item_name AS "itemName", quantity AS "quantity", amount AS "amount", '
          + 'inspection_required AS "inspectionRequired", inspection_completed AS "inspectionCompleted", asset_linked AS "assetLinked", linked_at AS "linkedAt" '
          + 'FROM purchase_asset_item ' + where
          + ' ORDER BY purchase_asset_item_id DESC LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { requisitionId, size, offset },
      );
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }
}
