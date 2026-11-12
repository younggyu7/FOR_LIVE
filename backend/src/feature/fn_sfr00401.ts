import { Controller, Get, Post, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const REQUISITION_TYPES = ['지출', '구매'];

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === '';
}

@Controller('api/v1')
export class FnSfr00401Controller {
  @Post('/requisitions')
  @HttpCode(200)
  async createRequisition(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자');
    const data = checks.inputOf(req.body);
    const required = ['projectId', 'budgetAccountId', 'requisitionType', 'title', 'requisitionAmount'];
    const missing = required.filter((name) => isBlank(data[name]));
    if (missing.length > 0) {
      throw new ApiError(422, 'REQUISITION_REQUIRED_VALUE_MISSING', '필수 입력값이 누락되었습니다: ' + missing.join(', '));
    }
    const projectId = String(data['projectId']).trim();
    const budgetAccountId = String(data['budgetAccountId']).trim();
    if (!/^\d+$/.test(projectId) || !/^\d+$/.test(budgetAccountId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '프로젝트와 예산과목 값이 올바르지 않습니다.');
    }
    const requisitionType = String(data['requisitionType']);
    if (!REQUISITION_TYPES.includes(requisitionType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '품의 유형은 지출 또는 구매여야 합니다.');
    }
    const title = String(data['title']).trim();
    if (title.length > 200) {
      throw new ApiError(400, 'VALIDATION_FAILED', '품의 제목은 200자 이내로 입력해 주세요.');
    }
    const amountText = String(data['requisitionAmount']).trim();
    if (!/^\d+(\.\d+)?$/.test(amountText) || Number(amountText) <= 0) {
      throw new ApiError(400, 'VALIDATION_FAILED', '품의 금액은 0보다 큰 숫자로 입력해 주세요.');
    }
    const content = isBlank(data['content']) ? null : String(data['content']);
    return transaction(async (db) => {
      const projects = await db.query(
        'SELECT project_id FROM project WHERE project_id = CAST(:projectId AS bigint)',
        { projectId },
      );
      if (projects.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '프로젝트를 찾을 수 없습니다.');
      }
      const accounts = await db.query(
        'SELECT budget_account_id FROM budget_account WHERE budget_account_id = CAST(:budgetAccountId AS bigint)',
        { budgetAccountId },
      );
      if (accounts.length === 0) {
        throw new ApiError(404, 'NOT_FOUND', '예산과목을 찾을 수 없습니다.');
      }
      const rows = await db.query(
        'INSERT INTO requisition (project_id, budget_account_id, drafter_id, requisition_type, title, content, requisition_amount, status, created_at, updated_at) ' +
          'VALUES (CAST(:projectId AS bigint), CAST(:budgetAccountId AS bigint), CAST(:userId AS bigint), :requisitionType, :title, :content, CAST(:amount AS numeric), :status, now(), now()) ' +
          'RETURNING requisition_id AS "requisitionId", status AS "status"',
        {
          projectId,
          budgetAccountId,
          userId: user.id,
          requisitionType,
          title,
          content,
          amount: amountText,
          status: '기안',
        },
      );
      return rows[0];
    });
  }

  @Get('/requisitions/:requisitionId')
  async getRequisition(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원', '예산·회계 담당자');
    const requisitionId = req.params['requisitionId'];
    if (!/^\d+$/.test(requisitionId)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '품의서 ID가 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const rows = await db.query(
        'SELECT requisition_id AS "requisitionId", project_id AS "projectId", budget_account_id AS "budgetAccountId", ' +
          'title AS "title", content AS "content", requisition_amount AS "requisitionAmount", status AS "status" ' +
          'FROM requisition WHERE requisition_id = CAST(:requisitionId AS bigint)',
        { requisitionId },
      );
      if (rows.length === 0) {
        throw new ApiError(404, 'REQUISITION_NOT_FOUND', '품의서를 찾을 수 없습니다.');
      }
      return rows[0];
    });
  }
}
