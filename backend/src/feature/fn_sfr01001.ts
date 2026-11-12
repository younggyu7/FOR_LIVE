import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function fail(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function isNumeric(v: unknown): boolean {
  if (typeof v === 'number') {
    return Number.isFinite(v);
  }
  if (typeof v === 'string') {
    return v.trim() !== '' && Number.isFinite(Number(v));
  }
  return false;
}

function isId(v: unknown): boolean {
  return isNumeric(v) && Number.isInteger(Number(v)) && Number(v) > 0;
}

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

@Controller('api/v1')
export class FnSfr01001Controller {
  @Get('/closing-data')
  async listClosingData(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const closingPeriod = query['closingPeriod'];
    const accountingUnitId = query['accountingUnitId'];
    if (typeof closingPeriod !== 'string' || !PERIOD_PATTERN.test(closingPeriod)) {
      throw fail('결산 기간을 YYYY-MM 형식으로 입력해 주세요.');
    }
    if (!isId(accountingUnitId)) {
      throw fail('회계단위를 선택해 주세요.');
    }
    const pageRaw = isBlank(query['page']) ? 0 : Number(query['page']);
    const sizeRaw = isBlank(query['size']) ? 20 : Number(query['size']);
    if (!Number.isInteger(pageRaw) || pageRaw < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw fail('쪽 번호와 쪽 크기가 올바르지 않습니다.');
    }
    const page = pageRaw;
    const size = Math.min(sizeRaw, 200);
    return transaction(async (db) => {
      const params = {
        closingPeriod,
        accountingUnitId: String(accountingUnitId),
        limit: size,
        offset: page * size,
      };
      const items = await db.query(
        `SELECT closing_data_id AS "closingDataId",
                closing_period AS "closingPeriod",
                accounting_unit_id AS "accountingUnitId",
                account_subject_id AS "accountSubjectId",
                project_id AS "projectId",
                department_id AS "departmentId",
                closing_amount AS "closingAmount"
           FROM closing_data
          WHERE closing_period = :closingPeriod
            AND accounting_unit_id = CAST(:accountingUnitId AS bigint)
          ORDER BY closing_data_id
          LIMIT :limit OFFSET :offset`,
        params,
      );
      const counts = await db.query(
        `SELECT COUNT(*) AS "total"
           FROM closing_data
          WHERE closing_period = :closingPeriod
            AND accounting_unit_id = CAST(:accountingUnitId AS bigint)`,
        { closingPeriod, accountingUnitId: String(accountingUnitId) },
      );
      return { items, page, size, total: Number(counts[0]['total']) };
    });
  }

  @Post('/closing-data')
  @HttpCode(200)
  async createClosingData(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const closingPeriod = data['closingPeriod'];
    if (typeof closingPeriod !== 'string' || !PERIOD_PATTERN.test(closingPeriod)) {
      throw fail('결산 기간을 YYYY-MM 형식으로 입력해 주세요.');
    }
    if (!isId(data['accountingUnitId'])) {
      throw fail('회계단위를 선택해 주세요.');
    }
    if (!isId(data['accountSubjectId'])) {
      throw fail('계정과목을 선택해 주세요.');
    }
    if (!isBlank(data['projectId']) && !isId(data['projectId'])) {
      throw fail('프로젝트가 올바르지 않습니다.');
    }
    if (!isBlank(data['departmentId']) && !isId(data['departmentId'])) {
      throw fail('부서가 올바르지 않습니다.');
    }
    if (!isNumeric(data['closingAmount'])) {
      throw fail('결산 금액을 숫자로 입력해 주세요.');
    }
    const params = {
      closingPeriod,
      accountingUnitId: String(data['accountingUnitId']),
      accountSubjectId: String(data['accountSubjectId']),
      projectId: isBlank(data['projectId']) ? null : String(data['projectId']),
      departmentId: isBlank(data['departmentId']) ? null : String(data['departmentId']),
      closingAmount: String(data['closingAmount']),
    };
    return transaction(async (db) => {
      const units = await db.query(
        'SELECT accounting_unit_id FROM accounting_unit WHERE accounting_unit_id = CAST(:id AS bigint)',
        { id: params.accountingUnitId },
      );
      if (units.length === 0) {
        throw fail('존재하지 않는 회계단위입니다.');
      }
      const subjects = await db.query(
        'SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:id AS bigint)',
        { id: params.accountSubjectId },
      );
      if (subjects.length === 0) {
        throw fail('존재하지 않는 계정과목입니다.');
      }
      if (params.projectId !== null) {
        const projects = await db.query(
          'SELECT project_id FROM project WHERE project_id = CAST(:id AS bigint)',
          { id: params.projectId },
        );
        if (projects.length === 0) {
          throw fail('존재하지 않는 프로젝트입니다.');
        }
      }
      if (params.departmentId !== null) {
        const departments = await db.query(
          'SELECT department_id FROM department WHERE department_id = CAST(:id AS bigint)',
          { id: params.departmentId },
        );
        if (departments.length === 0) {
          throw fail('존재하지 않는 부서입니다.');
        }
      }
      // TODO: 마감된 기간 확인(422 CLOSING_PERIOD_CLOSED)은 마감 상태의 출처가 없어 구현하지 못했다.
      const rows = await db.query(
        `INSERT INTO closing_data
           (accounting_unit_id, account_subject_id, project_id, department_id,
            closing_period, closing_amount, created_at, updated_at)
         VALUES
           (CAST(:accountingUnitId AS bigint), CAST(:accountSubjectId AS bigint),
            CAST(:projectId AS bigint), CAST(:departmentId AS bigint),
            :closingPeriod, CAST(:closingAmount AS numeric), now(), now())
         RETURNING closing_data_id AS "closingDataId"`,
        params,
      );
      return { closingDataId: Number(rows[0]['closingDataId']) };
    });
  }

  @Patch('/closing-data/:closingDataId')
  async updateClosingData(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['closingDataId'];
    if (!isId(idText)) {
      throw fail('결산자료 ID가 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const sets: string[] = [];
    const params: Record<string, unknown> = { closingDataId: idText };
    if ('accountSubjectId' in data) {
      if (!isId(data['accountSubjectId'])) {
        throw fail('계정과목이 올바르지 않습니다.');
      }
      sets.push('account_subject_id = CAST(:accountSubjectId AS bigint)');
      params['accountSubjectId'] = String(data['accountSubjectId']);
    }
    if ('projectId' in data) {
      if (!isBlank(data['projectId']) && !isId(data['projectId'])) {
        throw fail('프로젝트가 올바르지 않습니다.');
      }
      sets.push('project_id = CAST(:projectId AS bigint)');
      params['projectId'] = isBlank(data['projectId']) ? null : String(data['projectId']);
    }
    if ('departmentId' in data) {
      if (!isBlank(data['departmentId']) && !isId(data['departmentId'])) {
        throw fail('부서가 올바르지 않습니다.');
      }
      sets.push('department_id = CAST(:departmentId AS bigint)');
      params['departmentId'] = isBlank(data['departmentId']) ? null : String(data['departmentId']);
    }
    if ('closingAmount' in data) {
      if (!isNumeric(data['closingAmount'])) {
        throw fail('결산 금액을 숫자로 입력해 주세요.');
      }
      sets.push('closing_amount = CAST(:closingAmount AS numeric)');
      params['closingAmount'] = String(data['closingAmount']);
    }
    if (sets.length === 0) {
      throw fail('수정할 값을 입력해 주세요.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT closing_data_id FROM closing_data WHERE closing_data_id = CAST(:closingDataId AS bigint)',
        { closingDataId: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'CLOSING_DATA_NOT_FOUND', '대상 결산자료를 찾을 수 없습니다.');
      }
      if (params['accountSubjectId'] !== undefined) {
        const subjects = await db.query(
          'SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:id AS bigint)',
          { id: params['accountSubjectId'] },
        );
        if (subjects.length === 0) {
          throw fail('존재하지 않는 계정과목입니다.');
        }
      }
      if (params['projectId'] !== undefined && params['projectId'] !== null) {
        const projects = await db.query(
          'SELECT project_id FROM project WHERE project_id = CAST(:id AS bigint)',
          { id: params['projectId'] },
        );
        if (projects.length === 0) {
          throw fail('존재하지 않는 프로젝트입니다.');
        }
      }
      if (params['departmentId'] !== undefined && params['departmentId'] !== null) {
        const departments = await db.query(
          'SELECT department_id FROM department WHERE department_id = CAST(:id AS bigint)',
          { id: params['departmentId'] },
        );
        if (departments.length === 0) {
          throw fail('존재하지 않는 부서입니다.');
        }
      }
      // TODO: 마감된 기간 확인(409 CLOSING_PERIOD_CLOSED)은 마감 상태의 출처가 없어 구현하지 못했다.
      await db.execute(
        `UPDATE closing_data SET ${sets.join(', ')}, updated_at = now() WHERE closing_data_id = CAST(:closingDataId AS bigint)`,
        params,
      );
      return { closingDataId: Number(idText) };
    });
  }

  @Delete('/closing-data/:closingDataId')
  async deleteClosingData(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['closingDataId'];
    if (!isId(idText)) {
      throw fail('결산자료 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT closing_data_id FROM closing_data WHERE closing_data_id = CAST(:closingDataId AS bigint)',
        { closingDataId: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'CLOSING_DATA_NOT_FOUND', '대상 결산자료를 찾을 수 없습니다.');
      }
      // TODO: 마감된 기간 확인(409 CLOSING_PERIOD_CLOSED)은 마감 상태의 출처가 없어 구현하지 못했다.
      await db.execute(
        'DELETE FROM closing_data WHERE closing_data_id = CAST(:closingDataId AS bigint)',
        { closingDataId: idText },
      );
      return {};
    });
  }
}
