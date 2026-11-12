import { Controller, Delete, HttpCode, Post, Put, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 사용 여부를 보내지 않으면 신규 기준은 사용으로 시작한다.
const DEFAULT_USE_STATUS = '사용';
const USE_STATUSES = ['사용', '미사용'];
const ROLE = '근태 담당자';

interface RuleInput {
  name: string;
  baseDays: string;
  additionalDays: string | null;
  additionalCondition: string | null;
  useStatus: string | null;
}

function invalidRule(): ApiError {
  return new ApiError(422, 'LEAVE_GRANT_RULE_INVALID', '기본 일수와 가산 일수는 0 이상의 숫자로 입력해 주세요.');
}

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function numberText(v: unknown): string | null {
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
    return String(v);
  }
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0) {
    return v.trim();
  }
  return null;
}

function parseRule(data: Record<string, unknown>): RuleInput {
  const name = typeof data['name'] === 'string' ? data['name'].trim() : '';
  if (name === '' || name.length > 100) {
    throw new ApiError(400, 'VALIDATION_FAILED', '기준명은 1자 이상 100자 이하로 입력해 주세요.');
  }
  const baseDays = numberText(data['baseDays']);
  if (baseDays === null) {
    throw invalidRule();
  }
  let additionalDays: string | null = null;
  if (!isEmpty(data['additionalDays'])) {
    additionalDays = numberText(data['additionalDays']);
    if (additionalDays === null) {
      throw invalidRule();
    }
  }
  let additionalCondition: string | null = null;
  if (!isEmpty(data['additionalCondition'])) {
    const cond = data['additionalCondition'];
    if (typeof cond !== 'string' || cond.length > 500) {
      throw new ApiError(400, 'VALIDATION_FAILED', '가산 조건은 500자 이하로 입력해 주세요.');
    }
    additionalCondition = cond;
  }
  let useStatus: string | null = null;
  if (!isEmpty(data['useStatus'])) {
    const status = data['useStatus'];
    if (typeof status !== 'string' || !USE_STATUSES.includes(status)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    useStatus = status;
  }
  return { name, baseDays, additionalDays, additionalCondition, useStatus };
}

function parseId(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === '' || !Number.isInteger(Number(raw))) {
    throw new ApiError(400, 'VALIDATION_FAILED', '연차 생성 기준 ID 형식이 올바르지 않습니다.');
  }
  return raw.trim();
}

@Controller('api/v1')
export class FnSfr01901Controller {
  @Post('/leave-grant-rules')
  @HttpCode(200)
  async createLeaveGrantRule(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const input = parseRule(data);
    return transaction(async (db) => {
      const rows = await db.query(
        `INSERT INTO leave_grant_rule
           (name, base_days, additional_days, additional_condition, use_status, created_at, updated_at)
         VALUES
           (:name, CAST(:baseDays AS numeric), CAST(:additionalDays AS numeric), :additionalCondition, :useStatus, now(), now())
         RETURNING leave_grant_rule_id AS "leaveGrantRuleId"`,
        {
          name: input.name,
          baseDays: input.baseDays,
          additionalDays: input.additionalDays,
          additionalCondition: input.additionalCondition,
          useStatus: input.useStatus ?? DEFAULT_USE_STATUS,
        },
      );
      return rows[0];
    });
  }

  @Put('/leave-grant-rules/:leaveGrantRuleId')
  async updateLeaveGrantRule2(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = parseId(req.params['leaveGrantRuleId']);
    const data = checks.inputOf(req.body);
    const input = parseRule(data);
    return transaction(async (db) => {
      const rows = await db.query(
        `UPDATE leave_grant_rule
            SET name = :name,
                base_days = CAST(:baseDays AS numeric),
                additional_days = CAST(:additionalDays AS numeric),
                additional_condition = :additionalCondition,
                use_status = COALESCE(CAST(:useStatus AS varchar), use_status),
                updated_at = now()
          WHERE leave_grant_rule_id = CAST(:id AS bigint)
         RETURNING leave_grant_rule_id AS "leaveGrantRuleId"`,
        {
          id,
          name: input.name,
          baseDays: input.baseDays,
          additionalDays: input.additionalDays,
          additionalCondition: input.additionalCondition,
          useStatus: input.useStatus,
        },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'LEAVE_GRANT_RULE_NOT_FOUND', '연차 생성 기준을 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }

  @Delete('/leave-grant-rules/:leaveGrantRuleId')
  async deleteLeaveGrantRule(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = parseId(req.params['leaveGrantRuleId']);
    return transaction(async (db) => {
      const count = await db.execute(
        `DELETE FROM leave_grant_rule WHERE leave_grant_rule_id = CAST(:id AS bigint)`,
        { id },
      );
      if (count === 0) {
        throw new ApiError(404, 'LEAVE_GRANT_RULE_NOT_FOUND', '연차 생성 기준을 찾을 수 없습니다.');
      }
      return {};
    });
  }
}
