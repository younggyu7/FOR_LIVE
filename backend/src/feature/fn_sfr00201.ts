import { Controller, Delete, Get, HttpCode, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const BUSINESS_CATEGORIES = ['고유목적사업', '수익사업', '공통사업'];
const PROJECT_TYPES = ['공통', '직접사업'];
const DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const ID_PATTERN = /^[0-9]+$/;

type Body = Record<string, unknown>;

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function requiredText(data: Body, key: string, label: string, max: number): string {
  const value = data[key];
  if (isBlank(value)) {
    throw invalid(label + ' 항목을 입력해 주세요.');
  }
  if (typeof value !== 'string' || value.length > max) {
    throw invalid(label + ' 항목의 형식이 올바르지 않습니다.');
  }
  return value;
}

function optionalText(data: Body, key: string, label: string, max: number): string | null {
  const value = data[key];
  if (isBlank(value)) {
    return null;
  }
  if (typeof value !== 'string' || value.length > max) {
    throw invalid(label + ' 항목의 형식이 올바르지 않습니다.');
  }
  return value;
}

function optionalChoice(data: Body, key: string, label: string, choices: string[]): string | null {
  const value = data[key];
  if (isBlank(value)) {
    return null;
  }
  if (typeof value !== 'string' || !choices.includes(value)) {
    throw invalid(label + ' 항목은 ' + choices.join(', ') + ' 중 하나여야 합니다.');
  }
  return value;
}

function requiredChoice(data: Body, key: string, label: string, choices: string[]): string {
  if (isBlank(data[key])) {
    throw invalid(label + ' 항목을 선택해 주세요.');
  }
  return optionalChoice(data, key, label, choices) as string;
}

function optionalDate(data: Body, key: string, label: string): string | null {
  const value = data[key];
  if (isBlank(value)) {
    return null;
  }
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw invalid(label + ' 항목은 YYYY-MM-DD 형식이어야 합니다.');
  }
  return value;
}

function requiredDate(data: Body, key: string, label: string): string {
  if (isBlank(data[key])) {
    throw invalid(label + ' 항목을 입력해 주세요.');
  }
  return optionalDate(data, key, label) as string;
}

function optionalId(data: Body, key: string, label: string): number | null {
  const value = data[key];
  if (isBlank(value)) {
    return null;
  }
  const number = typeof value === 'number' ? value : typeof value === 'string' && ID_PATTERN.test(value) ? Number(value) : NaN;
  if (!Number.isInteger(number) || number <= 0) {
    throw invalid(label + ' 항목의 형식이 올바르지 않습니다.');
  }
  return number;
}

function requiredId(data: Body, key: string, label: string): number {
  if (isBlank(data[key])) {
    throw invalid(label + ' 항목을 선택해 주세요.');
  }
  return optionalId(data, key, label) as number;
}

function optionalAmount(data: Body): string | null {
  const value = data['projectAmount'];
  if (isBlank(value)) {
    return null;
  }
  const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(number) || number < 0) {
    throw invalid('프로젝트 금액은 0 이상의 숫자여야 합니다.');
  }
  return String(number);
}

function pathId(value: string | undefined, label: string): string {
  if (value === undefined || !ID_PATTERN.test(value)) {
    throw invalid(label + ' 값이 올바르지 않습니다.');
  }
  return value;
}

function pageOf(q: Body): { page: number; size: number } {
  const page = isBlank(q['page']) ? 0 : Number(q['page']);
  const rawSize = isBlank(q['size']) ? 20 : Number(q['size']);
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(rawSize) || rawSize < 1) {
    throw invalid('page 또는 size 값이 올바르지 않습니다.');
  }
  return { page, size: Math.min(rawSize, 200) };
}

@Controller('api/v1')
export class FnSfr00201Controller {
  @Get('/projects')
  async listProjects(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query) as Body;
    const { page, size } = pageOf(q);
    return transaction(async (db) => {
      const where: string[] = [];
      const params: Body = {};
      if (!isBlank(q['projectCode'])) {
        where.push("project_code ILIKE '%' || :projectCode || '%'");
        params['projectCode'] = String(q['projectCode']);
      }
      if (!isBlank(q['name'])) {
        where.push("name ILIKE '%' || :name || '%'");
        params['name'] = String(q['name']);
      }
      const whereSql = where.length > 0 ? ' WHERE ' + where.join(' AND ') : '';
      const counted = await db.query('SELECT COUNT(*) AS "total" FROM project' + whereSql, params);
      const rows = await db.query(
        'SELECT project_id AS "projectId", project_code AS "projectCode", name AS "name", '
          + 'business_category AS "businessCategory", project_type AS "projectType", '
          + 'to_char(start_date, \'YYYY-MM-DD\') AS "startDate", to_char(end_date, \'YYYY-MM-DD\') AS "endDate" '
          + 'FROM project' + whereSql + ' ORDER BY project_id DESC LIMIT :size OFFSET :offset',
        { ...params, size, offset: page * size },
      );
      return { items: rows, page, size, total: Number(counted[0].total) };
    });
  }

  @Post('/projects')
  @HttpCode(200)
  async createProject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Body;
    const projectCode = requiredText(data, 'projectCode', '프로젝트 코드', 50);
    const name = requiredText(data, 'name', '프로젝트 명칭', 200);
    const shortName = optionalText(data, 'shortName', '약칭', 50);
    const managedAccount = optionalText(data, 'managedAccount', '관리계좌', 500);
    const startDate = requiredDate(data, 'startDate', '시작일');
    const endDate = requiredDate(data, 'endDate', '종료일');
    const businessCategory = requiredChoice(data, 'businessCategory', '사업구분', BUSINESS_CATEGORIES);
    const projectType = requiredChoice(data, 'projectType', '프로젝트 유형', PROJECT_TYPES);
    const departmentId = requiredId(data, 'departmentId', '주관부서');
    const managerId = requiredId(data, 'managerId', '담당자');
    const projectAmount = optionalAmount(data);
    const purpose = optionalText(data, 'purpose', '목적 및 내용', 100000);
    return transaction(async (db) => {
      const period = await db.query(
        'SELECT (CAST(:endDate AS date) < CAST(:startDate AS date)) AS "bad"',
        { startDate, endDate },
      );
      if (period[0].bad) {
        throw new ApiError(422, 'INVALID_PROJECT_PERIOD', '종료일은 시작일보다 빠를 수 없습니다.');
      }
      const duplicated = await db.query('SELECT 1 AS "ok" FROM project WHERE project_code = :projectCode', { projectCode });
      if (duplicated.length > 0) {
        throw new ApiError(409, 'PROJECT_CODE_DUPLICATED', '이미 사용 중인 프로젝트 코드입니다.');
      }
      const department = await db.query('SELECT 1 AS "ok" FROM department WHERE department_id = CAST(:id AS bigint)', { id: departmentId });
      if (department.length === 0) {
        throw new ApiError(404, 'DEPARTMENT_NOT_FOUND', '주관부서를 찾을 수 없습니다.');
      }
      const manager = await db.query('SELECT 1 AS "ok" FROM employee WHERE employee_id = CAST(:id AS bigint)', { id: managerId });
      if (manager.length === 0) {
        throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '담당자를 찾을 수 없습니다.');
      }
      const rows = await db.query(
        'INSERT INTO project (project_code, name, short_name, managed_account, start_date, end_date, '
          + 'business_category, project_type, department_id, manager_id, project_amount, purpose, created_at, updated_at) '
          + 'VALUES (:projectCode, :name, :shortName, :managedAccount, CAST(:startDate AS date), CAST(:endDate AS date), '
          + ':businessCategory, :projectType, CAST(:departmentId AS bigint), CAST(:managerId AS bigint), '
          + 'CAST(:projectAmount AS numeric), :purpose, now(), now()) '
          + 'RETURNING project_id AS "projectId", project_code AS "projectCode", name AS "name"',
        {
          projectCode, name, shortName, managedAccount, startDate, endDate, businessCategory,
          projectType, departmentId, managerId, projectAmount, purpose,
        },
      );
      return rows[0];
    });
  }

  @Patch('/projects/:projectId')
  async updateProject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const projectId = pathId(req.params['projectId'], '프로젝트 ID');
    const data = checks.inputOf(req.body) as Body;
    const params = {
      projectId,
      name: optionalText(data, 'name', '프로젝트 명칭', 200),
      shortName: optionalText(data, 'shortName', '약칭', 50),
      managedAccount: optionalText(data, 'managedAccount', '관리계좌', 500),
      startDate: optionalDate(data, 'startDate', '시작일'),
      endDate: optionalDate(data, 'endDate', '종료일'),
      businessCategory: optionalChoice(data, 'businessCategory', '사업구분', BUSINESS_CATEGORIES),
      projectType: optionalChoice(data, 'projectType', '프로젝트 유형', PROJECT_TYPES),
      departmentId: optionalId(data, 'departmentId', '주관부서'),
      managerId: optionalId(data, 'managerId', '담당자'),
      projectAmount: optionalAmount(data),
      purpose: optionalText(data, 'purpose', '목적 및 내용', 100000),
    };
    return transaction(async (db) => {
      const current = await db.query(
        'SELECT (COALESCE(CAST(:endDate AS date), end_date) < COALESCE(CAST(:startDate AS date), start_date)) AS "bad" '
          + 'FROM project WHERE project_id = CAST(:projectId AS bigint)',
        { projectId, startDate: params.startDate, endDate: params.endDate },
      );
      if (current.length === 0) {
        throw new ApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      if (current[0].bad) {
        throw new ApiError(422, 'INVALID_PROJECT_PERIOD', '종료일은 시작일보다 빠를 수 없습니다.');
      }
      if (params.departmentId !== null) {
        const department = await db.query('SELECT 1 AS "ok" FROM department WHERE department_id = CAST(:id AS bigint)', { id: params.departmentId });
        if (department.length === 0) {
          throw new ApiError(404, 'DEPARTMENT_NOT_FOUND', '주관부서를 찾을 수 없습니다.');
        }
      }
      if (params.managerId !== null) {
        const manager = await db.query('SELECT 1 AS "ok" FROM employee WHERE employee_id = CAST(:id AS bigint)', { id: params.managerId });
        if (manager.length === 0) {
          throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '담당자를 찾을 수 없습니다.');
        }
      }
      const rows = await db.query(
        'UPDATE project SET '
          + 'name = COALESCE(CAST(:name AS varchar), name), '
          + 'short_name = COALESCE(CAST(:shortName AS varchar), short_name), '
          + 'managed_account = COALESCE(CAST(:managedAccount AS varchar), managed_account), '
          + 'start_date = COALESCE(CAST(:startDate AS date), start_date), '
          + 'end_date = COALESCE(CAST(:endDate AS date), end_date), '
          + 'business_category = COALESCE(CAST(:businessCategory AS varchar), business_category), '
          + 'project_type = COALESCE(CAST(:projectType AS varchar), project_type), '
          + 'department_id = COALESCE(CAST(:departmentId AS bigint), department_id), '
          + 'manager_id = COALESCE(CAST(:managerId AS bigint), manager_id), '
          + 'project_amount = COALESCE(CAST(:projectAmount AS numeric), project_amount), '
          + 'purpose = COALESCE(CAST(:purpose AS text), purpose), '
          + 'updated_at = now() '
          + 'WHERE project_id = CAST(:projectId AS bigint) '
          + 'RETURNING project_id AS "projectId", name AS "name"',
        params,
      );
      return rows[0];
    });
  }

  @Delete('/projects/:projectId')
  async deleteProject(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const projectId = pathId(req.params['projectId'], '프로젝트 ID');
    return transaction(async (db) => {
      const found = await db.query('SELECT 1 AS "ok" FROM project WHERE project_id = CAST(:projectId AS bigint)', { projectId });
      if (found.length === 0) {
        throw new ApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      // 가정: 프로젝트에 딸린 사용 권한 대상은 프로젝트와 함께 지운다.
      await db.execute('DELETE FROM project_permission WHERE project_id = CAST(:projectId AS bigint)', { projectId });
      await db.execute('DELETE FROM project WHERE project_id = CAST(:projectId AS bigint)', { projectId });
      return {};
    });
  }

  @Get('/project-permissions')
  async listProjectPermissions(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query) as Body;
    const projectId = requiredId(q, 'projectId', '프로젝트');
    const { page, size } = pageOf(q);
    return transaction(async (db) => {
      const counted = await db.query(
        'SELECT COUNT(*) AS "total" FROM project_permission WHERE project_id = CAST(:projectId AS bigint)',
        { projectId },
      );
      const rows = await db.query(
        'SELECT project_permission_id AS "projectPermissionId", project_id AS "projectId", '
          + 'employee_id AS "employeeId", department_id AS "departmentId" '
          + 'FROM project_permission WHERE project_id = CAST(:projectId AS bigint) '
          + 'ORDER BY project_permission_id LIMIT :size OFFSET :offset',
        { projectId, size, offset: page * size },
      );
      return { items: rows, page, size, total: Number(counted[0].total) };
    });
  }

  @Post('/project-permissions')
  @HttpCode(200)
  async createProjectPermission(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body) as Body;
    const projectId = requiredId(data, 'projectId', '프로젝트');
    const employeeId = optionalId(data, 'employeeId', '임직원');
    const departmentId = optionalId(data, 'departmentId', '부서');
    return transaction(async (db) => {
      const project = await db.query('SELECT 1 AS "ok" FROM project WHERE project_id = CAST(:projectId AS bigint)', { projectId });
      if (project.length === 0) {
        throw new ApiError(404, 'PROJECT_NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      // 가정: 대상은 임직원 또는 부서 중 하나만 지정한다.
      if ((employeeId === null) === (departmentId === null)) {
        throw new ApiError(422, 'PERMISSION_TARGET_REQUIRED', '임직원 또는 부서 중 하나만 대상으로 지정해 주세요.');
      }
      if (employeeId !== null) {
        const employee = await db.query('SELECT 1 AS "ok" FROM employee WHERE employee_id = CAST(:id AS bigint)', { id: employeeId });
        if (employee.length === 0) {
          throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
        }
      }
      if (departmentId !== null) {
        const department = await db.query('SELECT 1 AS "ok" FROM department WHERE department_id = CAST(:id AS bigint)', { id: departmentId });
        if (department.length === 0) {
          throw new ApiError(404, 'DEPARTMENT_NOT_FOUND', '부서를 찾을 수 없습니다.');
        }
      }
      const duplicated = await db.query(
        'SELECT 1 AS "ok" FROM project_permission WHERE project_id = CAST(:projectId AS bigint) '
          + 'AND (employee_id = CAST(:employeeId AS bigint) OR department_id = CAST(:departmentId AS bigint))',
        { projectId, employeeId, departmentId },
      );
      if (duplicated.length > 0) {
        throw new ApiError(409, 'PROJECT_PERMISSION_DUPLICATED', '이미 사용 권한이 설정된 대상입니다.');
      }
      const rows = await db.query(
        'INSERT INTO project_permission (project_id, employee_id, department_id, created_at, updated_at) '
          + 'VALUES (CAST(:projectId AS bigint), CAST(:employeeId AS bigint), CAST(:departmentId AS bigint), now(), now()) '
          + 'RETURNING project_permission_id AS "projectPermissionId"',
        { projectId, employeeId, departmentId },
      );
      return rows[0];
    });
  }

  @Delete('/project-permissions/:projectPermissionId')
  async deleteProjectPermission(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = pathId(req.params['projectPermissionId'], '프로젝트 사용 권한 ID');
    return transaction(async (db) => {
      const count = await db.execute(
        'DELETE FROM project_permission WHERE project_permission_id = CAST(:id AS bigint)',
        { id },
      );
      if (count === 0) {
        throw new ApiError(404, 'PROJECT_PERMISSION_NOT_FOUND', '사용 권한을 찾을 수 없습니다.');
      }
      return {};
    });
  }
}
