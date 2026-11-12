import { Controller, Delete, Get, HttpCode, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const STATUSES = ['사용', '미사용'];

function idOf(v: unknown): string | null {
  if (typeof v === 'number' && Number.isInteger(v) && v > 0) {
    return String(v);
  }
  if (typeof v === 'string' && /^[0-9]+$/.test(v)) {
    return v;
  }
  return null;
}

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function pagingOf(q: Record<string, unknown>): { page: number; size: number } {
  const rawPage = Number(q['page'] ?? 0);
  const rawSize = Number(q['size'] ?? 20);
  if (!Number.isInteger(rawPage) || rawPage < 0 || !Number.isInteger(rawSize) || rawSize < 1) {
    throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기가 올바르지 않습니다.');
  }
  return { page: rawPage, size: Math.min(rawSize, 200) };
}

function textOf(v: unknown, max: number, label: string): string {
  if (typeof v !== 'string' || v.trim() === '' || v.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', label + '을(를) ' + max + '자 이내로 입력해 주세요.');
  }
  return v;
}

@Controller('api/v1')
export class FnSfr00202Controller {
  @Get('/sub-projects')
  async listSubProjects(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const projectId = idOf(q['projectId']);
    if (projectId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '프로젝트를 선택해 주세요.');
    }
    const { page, size } = pagingOf(q);
    return transaction(async (db) => {
      const project = await db.query('SELECT project_id FROM project WHERE project_id = CAST(:projectId AS bigint)', { projectId });
      if (project.length === 0) {
        throw new ApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      const items = await db.query(
        'SELECT sub_project_id AS "subProjectId", project_id AS "projectId", parent_sub_project_id AS "parentSubProjectId", name, managed_account AS "managedAccount", use_status AS "useStatus" FROM sub_project WHERE project_id = CAST(:projectId AS bigint) ORDER BY sub_project_id LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { projectId, size, offset: page * size },
      );
      const counted = await db.query('SELECT COUNT(*) AS "total" FROM sub_project WHERE project_id = CAST(:projectId AS bigint)', { projectId });
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }

  @Post('/sub-projects')
  @HttpCode(200)
  async createSubProject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    if (isBlank(data['projectId']) || isBlank(data['name']) || isBlank(data['useStatus'])) {
      throw new ApiError(422, 'REQUIRED_VALUE_MISSING', '필수 값을 모두 입력해 주세요.');
    }
    const projectId = idOf(data['projectId']);
    if (projectId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '프로젝트 형식이 올바르지 않습니다.');
    }
    const name = textOf(data['name'], 200, '하위사업 명칭');
    if (typeof data['useStatus'] !== 'string' || !STATUSES.includes(data['useStatus'])) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    let parentId: string | null = null;
    if (!isBlank(data['parentSubProjectId'])) {
      parentId = idOf(data['parentSubProjectId']);
      if (parentId === null) {
        throw new ApiError(400, 'VALIDATION_FAILED', '상위 하위사업 형식이 올바르지 않습니다.');
      }
    }
    let account: string | null = null;
    if (!isBlank(data['managedAccount'])) {
      account = textOf(data['managedAccount'], 50, '관리계좌');
    }
    return transaction(async (db) => {
      const project = await db.query('SELECT project_id FROM project WHERE project_id = CAST(:projectId AS bigint)', { projectId });
      if (project.length === 0) {
        throw new ApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      if (parentId !== null) {
        const parent = await db.query(
          'SELECT sub_project_id FROM sub_project WHERE sub_project_id = CAST(:parentId AS bigint) AND project_id = CAST(:projectId AS bigint)',
          { parentId, projectId },
        );
        if (parent.length === 0) {
          throw new ApiError(404, 'PARENT_SUB_PROJECT_NOT_FOUND', '상위 하위사업을 찾을 수 없습니다.');
        }
      }
      const dup = await db.query(
        'SELECT sub_project_id FROM sub_project WHERE project_id = CAST(:projectId AS bigint) AND parent_sub_project_id IS NOT DISTINCT FROM CAST(:parentId AS bigint) AND name = :name',
        { projectId, parentId, name },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'DUPLICATE_SUB_PROJECT', '같은 단계에 같은 명칭의 하위사업이 이미 있습니다.');
      }
      const rows = await db.query(
        'INSERT INTO sub_project (project_id, parent_sub_project_id, name, managed_account, use_status, created_at, updated_at) VALUES (CAST(:projectId AS bigint), CAST(:parentId AS bigint), :name, :account, :useStatus, now(), now()) RETURNING sub_project_id AS "subProjectId"',
        { projectId, parentId, name, account, useStatus: data['useStatus'] },
      );
      return { subProjectId: Number(rows[0]['subProjectId']) };
    });
  }

  @Patch('/sub-projects/:subProjectId')
  async updateSubProject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const id = idOf(req.params['subProjectId']);
    if (id === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '하위사업 ID 형식이 올바르지 않습니다.');
    }
    let name: string | null = null;
    if (data['name'] !== undefined && data['name'] !== null) {
      name = textOf(data['name'], 200, '하위사업 명칭');
    }
    let account: string | null = null;
    if (!isBlank(data['managedAccount'])) {
      account = textOf(data['managedAccount'], 50, '관리계좌');
    }
    let useStatus: string | null = null;
    if (!isBlank(data['useStatus'])) {
      if (typeof data['useStatus'] !== 'string' || !STATUSES.includes(data['useStatus'])) {
        throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
      }
      useStatus = data['useStatus'];
    }
    const setParent = 'parentSubProjectId' in data;
    let parentId: string | null = null;
    if (setParent && !isBlank(data['parentSubProjectId'])) {
      parentId = idOf(data['parentSubProjectId']);
      if (parentId === null) {
        throw new ApiError(400, 'VALIDATION_FAILED', '상위 하위사업 형식이 올바르지 않습니다.');
      }
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT project_id AS "projectId", parent_sub_project_id AS "parentSubProjectId", name FROM sub_project WHERE sub_project_id = CAST(:id AS bigint)',
        { id },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'SUB_PROJECT_NOT_FOUND', '하위사업을 찾을 수 없습니다.');
      }
      const row = found[0];
      if (setParent && parentId !== null) {
        if (parentId === id) {
          throw new ApiError(422, 'INVALID_PARENT_SUB_PROJECT', '자기 자신을 상위 하위사업으로 지정할 수 없습니다.');
        }
        const parent = await db.query(
          'SELECT sub_project_id FROM sub_project WHERE sub_project_id = CAST(:parentId AS bigint) AND project_id = CAST(:projectId AS bigint)',
          { parentId, projectId: String(row['projectId']) },
        );
        if (parent.length === 0) {
          throw new ApiError(422, 'INVALID_PARENT_SUB_PROJECT', '같은 프로젝트의 하위사업만 상위로 지정할 수 있습니다.');
        }
        const loop = await db.query(
          'WITH RECURSIVE d AS (SELECT sub_project_id FROM sub_project WHERE parent_sub_project_id = CAST(:id AS bigint) UNION ALL SELECT s.sub_project_id FROM sub_project s JOIN d ON s.parent_sub_project_id = d.sub_project_id) SELECT sub_project_id FROM d WHERE sub_project_id = CAST(:parentId AS bigint)',
          { id, parentId },
        );
        if (loop.length > 0) {
          throw new ApiError(422, 'INVALID_PARENT_SUB_PROJECT', '하위 단계를 상위 하위사업으로 지정할 수 없습니다.');
        }
      }
      const nextName = name ?? String(row['name']);
      const nextParent = setParent ? parentId : (row['parentSubProjectId'] === null ? null : String(row['parentSubProjectId']));
      const dup = await db.query(
        'SELECT sub_project_id FROM sub_project WHERE project_id = CAST(:projectId AS bigint) AND parent_sub_project_id IS NOT DISTINCT FROM CAST(:parentId AS bigint) AND name = :name AND sub_project_id <> CAST(:id AS bigint)',
        { projectId: String(row['projectId']), parentId: nextParent, name: nextName, id },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'DUPLICATE_SUB_PROJECT', '같은 단계에 같은 명칭의 하위사업이 이미 있습니다.');
      }
      await db.execute(
        'UPDATE sub_project SET parent_sub_project_id = CASE WHEN :setParent THEN CAST(:parentId AS bigint) ELSE parent_sub_project_id END, name = COALESCE(:name, name), managed_account = COALESCE(:account, managed_account), use_status = COALESCE(:useStatus, use_status), updated_at = now() WHERE sub_project_id = CAST(:id AS bigint)',
        { setParent, parentId, name, account, useStatus, id },
      );
      return { subProjectId: Number(id) };
    });
  }

  @Delete('/sub-projects/:subProjectId')
  async deleteSubProject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = idOf(req.params['subProjectId']);
    if (id === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '하위사업 ID 형식이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const found = await db.query('SELECT sub_project_id FROM sub_project WHERE sub_project_id = CAST(:id AS bigint)', { id });
      if (found.length === 0) {
        throw new ApiError(404, 'SUB_PROJECT_NOT_FOUND', '하위사업을 찾을 수 없습니다.');
      }
      const children = await db.query('SELECT COUNT(*) AS "n" FROM sub_project WHERE parent_sub_project_id = CAST(:id AS bigint)', { id });
      if (Number(children[0]['n']) > 0) {
        throw new ApiError(409, 'SUB_PROJECT_HAS_CHILDREN', '하위 단계가 있어 삭제할 수 없습니다.');
      }
      // 가정: 사용 이력은 이 스펙에서 확인되는 사용 권한 설정이 있는 경우로 본다
      const used = await db.query('SELECT COUNT(*) AS "n" FROM sub_project_permission WHERE sub_project_id = CAST(:id AS bigint)', { id });
      if (Number(used[0]['n']) > 0) {
        throw new ApiError(409, 'SUB_PROJECT_IN_USE', '사용 이력이 있어 삭제할 수 없습니다.');
      }
      await db.execute('DELETE FROM sub_project WHERE sub_project_id = CAST(:id AS bigint)', { id });
      return {};
    });
  }

  @Get('/sub-project-permissions')
  async listSubProjectPermissions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query) as Record<string, unknown>;
    const subProjectId = idOf(q['subProjectId']);
    if (subProjectId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '하위사업을 선택해 주세요.');
    }
    const { page, size } = pagingOf(q);
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT sub_project_permission_id AS "subProjectPermissionId", sub_project_id AS "subProjectId", employee_id AS "employeeId", department_id AS "departmentId" FROM sub_project_permission WHERE sub_project_id = CAST(:subProjectId AS bigint) ORDER BY sub_project_permission_id LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { subProjectId, size, offset: page * size },
      );
      const counted = await db.query('SELECT COUNT(*) AS "total" FROM sub_project_permission WHERE sub_project_id = CAST(:subProjectId AS bigint)', { subProjectId });
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }

  @Post('/sub-project-permissions')
  @HttpCode(200)
  async createSubProjectPermission(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Record<string, unknown>;
    const subProjectId = idOf(data['subProjectId']);
    if (subProjectId === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '하위사업을 선택해 주세요.');
    }
    const hasEmployee = !isBlank(data['employeeId']);
    const hasDepartment = !isBlank(data['departmentId']);
    if (hasEmployee === hasDepartment) {
      throw new ApiError(422, 'PERMISSION_TARGET_REQUIRED', '임직원 또는 부서 중 하나만 지정해 주세요.');
    }
    const employeeId = hasEmployee ? idOf(data['employeeId']) : null;
    const departmentId = hasDepartment ? idOf(data['departmentId']) : null;
    if ((hasEmployee && employeeId === null) || (hasDepartment && departmentId === null)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '대상 형식이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const sub = await db.query('SELECT sub_project_id FROM sub_project WHERE sub_project_id = CAST(:subProjectId AS bigint)', { subProjectId });
      if (sub.length === 0) {
        throw new ApiError(404, 'SUB_PROJECT_NOT_FOUND', '하위사업을 찾을 수 없습니다.');
      }
      if (employeeId !== null) {
        const emp = await db.query('SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)', { employeeId });
        if (emp.length === 0) {
          throw new ApiError(400, 'VALIDATION_FAILED', '임직원을 찾을 수 없습니다.');
        }
      }
      if (departmentId !== null) {
        const dep = await db.query('SELECT department_id FROM department WHERE department_id = CAST(:departmentId AS bigint)', { departmentId });
        if (dep.length === 0) {
          throw new ApiError(400, 'VALIDATION_FAILED', '부서를 찾을 수 없습니다.');
        }
      }
      const dup = await db.query(
        'SELECT sub_project_permission_id FROM sub_project_permission WHERE sub_project_id = CAST(:subProjectId AS bigint) AND employee_id IS NOT DISTINCT FROM CAST(:employeeId AS bigint) AND department_id IS NOT DISTINCT FROM CAST(:departmentId AS bigint)',
        { subProjectId, employeeId, departmentId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'DUPLICATE_PERMISSION', '이미 설정된 사용 권한 대상입니다.');
      }
      const rows = await db.query(
        'INSERT INTO sub_project_permission (sub_project_id, employee_id, department_id, created_at, updated_at) VALUES (CAST(:subProjectId AS bigint), CAST(:employeeId AS bigint), CAST(:departmentId AS bigint), now(), now()) RETURNING sub_project_permission_id AS "subProjectPermissionId"',
        { subProjectId, employeeId, departmentId },
      );
      return { subProjectPermissionId: Number(rows[0]['subProjectPermissionId']) };
    });
  }

  @Delete('/sub-project-permissions/:subProjectPermissionId')
  async deleteSubProjectPermission(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = idOf(req.params['subProjectPermissionId']);
    if (id === null) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 권한 ID 형식이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const count = await db.execute('DELETE FROM sub_project_permission WHERE sub_project_permission_id = CAST(:id AS bigint)', { id });
      if (count === 0) {
        throw new ApiError(404, 'SUB_PROJECT_PERMISSION_NOT_FOUND', '권한 설정을 찾을 수 없습니다.');
      }
      return {};
    });
  }
}
