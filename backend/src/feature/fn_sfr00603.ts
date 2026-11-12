import { Controller, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';

function text(v: unknown, name: string, max: number, required: boolean): string | null {
  if (v === undefined || v === null || v === '') {
    if (required) {
      throw new ApiError(400, 'VALIDATION_FAILED', `${name}은(는) 필수입니다.`);
    }
    return null;
  }
  if (typeof v !== 'string' || v.length > max) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${name} 형식이 올바르지 않습니다.`);
  }
  return v;
}

function oneOf(v: unknown, name: string, allowed: string[]): string {
  if (typeof v !== 'string' || !allowed.includes(v)) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${name} 값이 올바르지 않습니다.`);
  }
  return v;
}

function idOf(v: unknown, name: string): string {
  if (typeof v === 'number' && Number.isInteger(v) && v > 0) {
    return String(v);
  }
  if (typeof v === 'string' && /^[0-9]{1,18}$/.test(v)) {
    return v;
  }
  throw new ApiError(400, 'VALIDATION_FAILED', `${name} 값이 올바르지 않습니다.`);
}

function dateOf(v: unknown, name: string): string {
  if (typeof v !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(v)) {
    throw new ApiError(400, 'VALIDATION_FAILED', `${name}은(는) YYYY-MM-DD 형식이어야 합니다.`);
  }
  return v;
}

@Controller('api/v1')
export class FnSfr00603Controller {
  @Put('/partners/:partnerId')
  async updatePartner2(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const partnerId = idOf(req.params['partnerId'], '거래처 ID');
    const code = text(data['code'], '거래처 코드', 20, true);
    const partnerType = oneOf(data['partnerType'], '거래처 유형', ['일반', '금융']);
    const name = text(data['name'], '거래처 명칭', 200, true);
    const businessRegNo = text(data['businessRegNo'], '사업자등록번호', 10, false);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT partner_id FROM partner WHERE partner_id = CAST(:partnerId AS bigint)',
        { partnerId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PARTNER_NOT_FOUND', '대상 거래처를 찾을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT partner_id FROM partner WHERE code = :code AND partner_id <> CAST(:partnerId AS bigint)',
        { code, partnerId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PARTNER_CODE_DUPLICATED', '이미 사용 중인 거래처 코드입니다.');
      }
      const rows = await db.query(
        `UPDATE partner
            SET code = :code,
                partner_type = :partnerType,
                name = :name,
                business_reg_no = :businessRegNo,
                updated_at = now()
          WHERE partner_id = CAST(:partnerId AS bigint)
          RETURNING partner_id AS "partnerId"`,
        { code, partnerType, name, businessRegNo, partnerId },
      );
      return rows[0];
    });
  }

  @Put('/projects/:projectId')
  async updateProject2(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const projectId = idOf(req.params['projectId'], '프로젝트 ID');
    const projectCode = text(data['projectCode'], '프로젝트 코드', 50, true);
    const name = text(data['name'], '프로젝트 명칭', 200, true);
    const businessCategory = oneOf(data['businessCategory'], '사업구분', ['고유목적사업', '수익사업', '공통사업']);
    const projectType = oneOf(data['projectType'], '프로젝트 유형', ['공통', '직접사업']);
    const startDate = dateOf(data['startDate'], '시작일');
    const endDate = dateOf(data['endDate'], '종료일');
    const departmentId = idOf(data['departmentId'], '주관부서');
    const managerId = idOf(data['managerId'], '담당자');
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT project_id FROM project WHERE project_id = CAST(:projectId AS bigint)',
        { projectId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'PROJECT_NOT_FOUND', '대상 프로젝트를 찾을 수 없습니다.');
      }
      const period = await db.query(
        'SELECT (CAST(:endDate AS date) >= CAST(:startDate AS date)) AS ok',
        { startDate, endDate },
      );
      if (!period[0]['ok']) {
        throw new ApiError(400, 'VALIDATION_FAILED', '종료일은 시작일보다 빠를 수 없습니다.');
      }
      const dept = await db.query(
        'SELECT department_id FROM department WHERE department_id = CAST(:departmentId AS bigint)',
        { departmentId },
      );
      if (dept.length === 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '주관부서를 찾을 수 없습니다.');
      }
      const mgr = await db.query(
        'SELECT employee_id FROM employee WHERE employee_id = CAST(:managerId AS bigint)',
        { managerId },
      );
      if (mgr.length === 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '담당자를 찾을 수 없습니다.');
      }
      const dup = await db.query(
        'SELECT project_id FROM project WHERE project_code = :projectCode AND project_id <> CAST(:projectId AS bigint)',
        { projectCode, projectId },
      );
      if (dup.length > 0) {
        throw new ApiError(409, 'PROJECT_CODE_DUPLICATED', '이미 사용 중인 프로젝트 코드입니다.');
      }
      const rows = await db.query(
        `UPDATE project
            SET project_code = :projectCode,
                name = :name,
                business_category = :businessCategory,
                project_type = :projectType,
                start_date = CAST(:startDate AS date),
                end_date = CAST(:endDate AS date),
                department_id = CAST(:departmentId AS bigint),
                manager_id = CAST(:managerId AS bigint),
                updated_at = now()
          WHERE project_id = CAST(:projectId AS bigint)
          RETURNING project_id AS "projectId"`,
        { projectCode, name, businessCategory, projectType, startDate, endDate, departmentId, managerId, projectId },
      );
      return rows[0];
    });
  }
}
