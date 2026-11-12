import { Controller, Get, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const ABBREVIATION_MAX = 50;

@Controller('api/v1')
export class FnSfr03101Controller {
  @Get('/departments')
  async listDepartments(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const query = checks.queryOf(req.query);
    let page = 0;
    if (query['page'] !== undefined && query['page'] !== '') {
      page = Number(query['page']);
      if (!Number.isInteger(page) || page < 0) {
        throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호가 올바르지 않습니다.');
      }
    }
    let size = DEFAULT_SIZE;
    if (query['size'] !== undefined && query['size'] !== '') {
      size = Number(query['size']);
      if (!Number.isInteger(size) || size < 1) {
        throw new ApiError(400, 'VALIDATION_FAILED', '쪽 크기가 올바르지 않습니다.');
      }
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }
    return transaction(async (db) => {
      const items = await db.query(
        `SELECT department_id AS "departmentId",
                department_code AS "departmentCode",
                name AS "name",
                abbreviation AS "abbreviation"
           FROM department
          ORDER BY department_id
          LIMIT CAST(:size AS int) OFFSET CAST(:offset AS int)`,
        { size: size, offset: page * size },
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total" FROM department`,
        {},
      );
      const total = Number(counted[0]['total']);
      return { items: items, page: page, size: size, total: total };
    });
  }

  @Patch('/departments/:departmentId')
  async updateDepartment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('시스템 관리자');
    const data = checks.inputOf(req.body);
    const departmentId = req.params['departmentId'];
    if (!/^[0-9]{1,18}$/.test(departmentId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '부서 ID가 올바르지 않습니다.');
    }
    const raw = data['abbreviation'];
    if (raw !== undefined && raw !== null && typeof raw !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', '부서 약칭은 글자로 입력해야 합니다.');
    }
    const abbreviation = typeof raw === 'string' ? raw.trim() : '';
    if (abbreviation === '') {
      throw new ApiError(422, 'ABBREVIATION_REQUIRED', '부서 약칭을 입력해 주세요.');
    }
    if (abbreviation.length > ABBREVIATION_MAX) {
      throw new ApiError(400, 'VALIDATION_FAILED', '부서 약칭은 50자 이하로 입력해 주세요.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        `SELECT department_id FROM department WHERE department_id = CAST(:id AS bigint)`,
        { id: departmentId },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'DEPARTMENT_NOT_FOUND', '부서를 찾을 수 없습니다.');
      }
      const rows = await db.query(
        `UPDATE department
            SET abbreviation = :abbreviation,
                updated_at = now()
          WHERE department_id = CAST(:id AS bigint)
          RETURNING department_id AS "departmentId", abbreviation AS "abbreviation"`,
        { id: departmentId, abbreviation: abbreviation },
      );
      return rows[0];
    });
  }
}
