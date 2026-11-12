import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '자원 담당자';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

type Params = Record<string, unknown>;
type Db = {
  query(sql: string, params?: Params): Promise<any[]>;
  execute(sql: string, params?: Params): Promise<number>;
};

function bad(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function blank(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function textOf(v: unknown, label: string, max: number, required: boolean): string | null {
  if (blank(v)) {
    if (required) throw bad(label + ' 값을 입력해 주세요.');
    return null;
  }
  if (typeof v !== 'string' || v.trim() === '') throw bad(label + ' 형식이 올바르지 않습니다.');
  if (v.length > max) throw bad(label + '은(는) ' + max + '자 이하로 입력해 주세요.');
  return v;
}

function intOf(v: unknown, label: string, required: boolean, nonNegative: boolean): string | null {
  if (blank(v)) {
    if (required) throw bad(label + ' 값을 입력해 주세요.');
    return null;
  }
  let s: string;
  if (typeof v === 'number' && Number.isInteger(v)) {
    s = String(v);
  } else if (typeof v === 'string' && /^-?\d+$/.test(v.trim())) {
    s = v.trim();
  } else {
    throw bad(label + '은(는) 정수여야 합니다.');
  }
  if (nonNegative && s.startsWith('-')) throw bad(label + '은(는) 0 이상이어야 합니다.');
  return s;
}

function enumOf(v: unknown, label: string, allowed: string[], required: boolean): string | null {
  if (blank(v)) {
    if (required) throw bad(label + ' 값을 선택해 주세요.');
    return null;
  }
  if (typeof v !== 'string' || !allowed.includes(v)) throw bad(label + ' 값이 올바르지 않습니다.');
  return v;
}

type AttrIn = { name: string; value: string; sortOrder: string };
type PermIn = { departmentId: string | null; employeeId: string | null };

function parseAttrs(v: unknown): AttrIn[] | null {
  if (v === undefined || v === null) return null;
  if (!Array.isArray(v)) throw bad('자원 속성 형식이 올바르지 않습니다.');
  const seen = new Set<string>();
  return v.map((raw, i) => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw bad('자원 속성 형식이 올바르지 않습니다.');
    const o = raw as Params;
    const name = textOf(o['attributeName'], '속성명', 100, true) as string;
    const value = textOf(o['attributeValue'], '속성값', 500, true) as string;
    const sort = intOf(o['sortOrder'], '속성 정렬 순서', false, true);
    if (seen.has(name)) throw bad('속성명이 중복되었습니다: ' + name);
    seen.add(name);
    return { name, value, sortOrder: sort === null ? String(i) : sort };
  });
}

function parsePerms(v: unknown): PermIn[] | null {
  if (v === undefined || v === null) return null;
  if (!Array.isArray(v)) throw bad('사용 권한 형식이 올바르지 않습니다.');
  return v.map((raw) => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw bad('사용 권한 형식이 올바르지 않습니다.');
    const o = raw as Params;
    const departmentId = intOf(o['departmentId'], '부서 ID', false, false);
    const employeeId = intOf(o['employeeId'], '임직원 ID', false, false);
    if ((departmentId === null) === (employeeId === null)) {
      throw bad('사용 권한은 부서 또는 임직원 중 하나만 지정해 주세요.');
    }
    return { departmentId, employeeId };
  });
}

async function requireEmployee(db: Db, id: string): Promise<void> {
  const rows = await db.query('SELECT employee_id FROM employee WHERE employee_id = CAST(:id AS bigint)', { id });
  if (rows.length === 0) throw bad('존재하지 않는 임직원입니다.');
}

async function checkPerms(db: Db, perms: PermIn[]): Promise<void> {
  for (const p of perms) {
    if (p.employeeId !== null) {
      await requireEmployee(db, p.employeeId);
    } else {
      const rows = await db.query(
        'SELECT department_id FROM department WHERE department_id = CAST(:id AS bigint)',
        { id: p.departmentId },
      );
      if (rows.length === 0) throw bad('존재하지 않는 부서입니다.');
    }
  }
}

async function replaceChildren(db: Db, resourceId: string, attrs: AttrIn[] | null, perms: PermIn[] | null): Promise<void> {
  if (attrs !== null) {
    await db.execute('DELETE FROM resource_attribute WHERE resource_id = CAST(:resourceId AS bigint)', { resourceId });
    for (const a of attrs) {
      await db.execute(
        'INSERT INTO resource_attribute (resource_id, attribute_name, attribute_value, sort_order, created_at, updated_at) ' +
          'VALUES (CAST(:resourceId AS bigint), :name, :value, CAST(:sortOrder AS integer), now(), now())',
        { resourceId, name: a.name, value: a.value, sortOrder: a.sortOrder },
      );
    }
  }
  if (perms !== null) {
    await db.execute('DELETE FROM resource_permission WHERE resource_id = CAST(:resourceId AS bigint)', { resourceId });
    for (const p of perms) {
      await db.execute(
        'INSERT INTO resource_permission (resource_id, department_id, employee_id, created_at, updated_at) ' +
          'VALUES (CAST(:resourceId AS bigint), CAST(:departmentId AS bigint), CAST(:employeeId AS bigint), now(), now())',
        { resourceId, departmentId: p.departmentId, employeeId: p.employeeId },
      );
    }
  }
}

async function requireCategory(db: Db, id: string): Promise<void> {
  const rows = await db.query(
    'SELECT resource_category_id FROM resource_category WHERE resource_category_id = CAST(:id AS bigint)',
    { id },
  );
  if (rows.length === 0) {
    throw new ApiError(404, 'RESOURCE_CATEGORY_NOT_FOUND', '자원 분류를 찾을 수 없습니다.');
  }
}

function pathId(v: string | undefined, label: string): string {
  const id = intOf(v, label, true, true);
  return id as string;
}

const APPROVAL = ['사용', '미사용'];
const SCOPE = ['전체', '부서', '개인'];

@Controller('api/v1')
export class FnSfr03303Controller {
  @Get('/resource-categories')
  async listResourceCategories(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    const pageIn = intOf(q['page'], 'page', false, true);
    const sizeIn = intOf(q['size'], 'size', false, true);
    const page = pageIn === null ? 0 : Number(pageIn);
    let size = sizeIn === null ? DEFAULT_SIZE : Number(sizeIn);
    if (size < 1) throw bad('size는 1 이상이어야 합니다.');
    if (size > MAX_SIZE) size = MAX_SIZE;
    return transaction(async (db: Db) => {
      const items = await db.query(
        'SELECT resource_category_id AS "resourceCategoryId", name AS "name", sort_order AS "sortOrder" ' +
          'FROM resource_category ORDER BY sort_order, resource_category_id ' +
          'LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { size: String(size), offset: String(page * size) },
      );
      const cnt = await db.query('SELECT COUNT(*) AS "total" FROM resource_category', {});
      return { items, page, size, total: Number(cnt[0].total) };
    });
  }

  @Post('/resource-categories')
  @HttpCode(200)
  async createResourceCategory(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const name = textOf(data['name'], '분류명', 100, true);
    const sortOrder = intOf(data['sortOrder'], '정렬 순서', true, true);
    return transaction(async (db: Db) => {
      const rows = await db.query(
        'INSERT INTO resource_category (name, sort_order, created_at, updated_at) ' +
          'VALUES (:name, CAST(:sortOrder AS integer), now(), now()) ' +
          'RETURNING resource_category_id AS "resourceCategoryId"',
        { name, sortOrder },
      );
      return rows[0];
    });
  }

  @Patch('/resource-categories/:resourceCategoryId')
  async updateResourceCategory(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req.params['resourceCategoryId'], '자원 분류 ID');
    const data = checks.inputOf(req.body);
    const name = textOf(data['name'], '분류명', 100, false);
    const sortOrder = intOf(data['sortOrder'], '정렬 순서', false, true);
    return transaction(async (db: Db) => {
      await requireCategory(db, id);
      const rows = await db.query(
        'UPDATE resource_category SET name = COALESCE(CAST(:name AS varchar), name), ' +
          'sort_order = COALESCE(CAST(:sortOrder AS integer), sort_order), updated_at = now() ' +
          'WHERE resource_category_id = CAST(:id AS bigint) ' +
          'RETURNING resource_category_id AS "resourceCategoryId"',
        { id, name, sortOrder },
      );
      return rows[0];
    });
  }

  @Delete('/resource-categories/:resourceCategoryId')
  async deleteResourceCategory(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req.params['resourceCategoryId'], '자원 분류 ID');
    return transaction(async (db: Db) => {
      await requireCategory(db, id);
      // 가정: 하위 자원이 남아 있으면 외래키 오류 전에 거절한다 (예약 존재 확인은 todos 참고)
      const children = await db.query(
        'SELECT COUNT(*) AS "cnt" FROM resource WHERE resource_category_id = CAST(:id AS bigint)',
        { id },
      );
      if (Number(children[0].cnt) > 0) {
        throw new ApiError(409, 'INVALID_STATE', '하위 자원이 있는 분류는 삭제할 수 없습니다. 자원을 먼저 삭제해 주세요.');
      }
      await db.execute('DELETE FROM resource_category WHERE resource_category_id = CAST(:id AS bigint)', { id });
      return {};
    });
  }

  @Post('/resources')
  @HttpCode(200)
  async createResource(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const categoryId = intOf(data['resourceCategoryId'], '자원 분류', true, false) as string;
    const name = textOf(data['name'], '자원명', 100, true) as string;
    const approval = enumOf(data['approvalRequired'], '승인절차 사용 여부', APPROVAL, true);
    const managerId = intOf(data['managerId'], '담당자', false, false);
    const scope = enumOf(data['visibilityScope'], '공개범위', SCOPE, true);
    const description = data['description'] === undefined || data['description'] === null ? null : String(data['description']);
    const attrs = parseAttrs(data['attributes']);
    const perms = parsePerms(data['permissions']);
    return transaction(async (db: Db) => {
      await requireCategory(db, categoryId);
      if (managerId !== null) await requireEmployee(db, managerId);
      if (perms !== null) await checkPerms(db, perms);
      const dup = await db.query(
        'SELECT resource_id FROM resource WHERE resource_category_id = CAST(:categoryId AS bigint) AND name = :name',
        { categoryId, name },
      );
      if (dup.length > 0) throw bad('같은 분류에 같은 이름의 자원이 이미 있습니다.');
      const rows = await db.query(
        'INSERT INTO resource (resource_category_id, manager_id, name, approval_required, visibility_scope, description, created_at, updated_at) ' +
          'VALUES (CAST(:categoryId AS bigint), CAST(:managerId AS bigint), :name, :approval, :scope, :description, now(), now()) ' +
          'RETURNING resource_id AS "resourceId"',
        { categoryId, managerId, name, approval, scope, description },
      );
      const resourceId = String(rows[0].resourceId);
      await replaceChildren(db, resourceId, attrs, perms);
      return rows[0];
    });
  }

  @Patch('/resources/:resourceId')
  async updateResource(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req.params['resourceId'], '자원 ID');
    const data = checks.inputOf(req.body);
    const categoryId = intOf(data['resourceCategoryId'], '자원 분류', false, false);
    const name = textOf(data['name'], '자원명', 100, false);
    const approval = enumOf(data['approvalRequired'], '승인절차 사용 여부', APPROVAL, false);
    const managerId = intOf(data['managerId'], '담당자', false, false);
    const scope = enumOf(data['visibilityScope'], '공개범위', SCOPE, false);
    const description = data['description'] === undefined || data['description'] === null ? null : String(data['description']);
    const attrs = parseAttrs(data['attributes']);
    const perms = parsePerms(data['permissions']);
    return transaction(async (db: Db) => {
      const cur = await db.query(
        'SELECT resource_category_id AS "categoryId", name AS "name" FROM resource WHERE resource_id = CAST(:id AS bigint)',
        { id },
      );
      if (cur.length === 0) throw new ApiError(404, 'RESOURCE_NOT_FOUND', '자원을 찾을 수 없습니다.');
      if (categoryId !== null) await requireCategory(db, categoryId);
      if (managerId !== null) await requireEmployee(db, managerId);
      if (perms !== null) await checkPerms(db, perms);
      const nextCategory = categoryId === null ? String(cur[0].categoryId) : categoryId;
      const nextName = name === null ? String(cur[0].name) : name;
      const dup = await db.query(
        'SELECT resource_id FROM resource WHERE resource_category_id = CAST(:categoryId AS bigint) AND name = :name AND resource_id <> CAST(:id AS bigint)',
        { categoryId: nextCategory, name: nextName, id },
      );
      if (dup.length > 0) throw bad('같은 분류에 같은 이름의 자원이 이미 있습니다.');
      const rows = await db.query(
        'UPDATE resource SET resource_category_id = CAST(:categoryId AS bigint), name = :name, ' +
          'approval_required = COALESCE(CAST(:approval AS varchar), approval_required), ' +
          'manager_id = COALESCE(CAST(:managerId AS bigint), manager_id), ' +
          'visibility_scope = COALESCE(CAST(:scope AS varchar), visibility_scope), ' +
          'description = COALESCE(CAST(:description AS text), description), updated_at = now() ' +
          'WHERE resource_id = CAST(:id AS bigint) RETURNING resource_id AS "resourceId"',
        { id, categoryId: nextCategory, name: nextName, approval, managerId, scope, description },
      );
      await replaceChildren(db, id, attrs, perms);
      return rows[0];
    });
  }

  @Delete('/resources/:resourceId')
  async deleteResource(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req.params['resourceId'], '자원 ID');
    return transaction(async (db: Db) => {
      const cur = await db.query('SELECT resource_id FROM resource WHERE resource_id = CAST(:id AS bigint)', { id });
      if (cur.length === 0) throw new ApiError(404, 'RESOURCE_NOT_FOUND', '자원을 찾을 수 없습니다.');
      await db.execute('DELETE FROM resource_attribute WHERE resource_id = CAST(:id AS bigint)', { id });
      await db.execute('DELETE FROM resource_permission WHERE resource_id = CAST(:id AS bigint)', { id });
      await db.execute('DELETE FROM resource WHERE resource_id = CAST(:id AS bigint)', { id });
      return {};
    });
  }
}
