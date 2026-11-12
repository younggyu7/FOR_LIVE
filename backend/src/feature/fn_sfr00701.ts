import { Controller, Get, Post, Put, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const ROLE = '예산·회계 담당자';
const DEFAULT_USE_STATUS = '사용'; // 가정: 신규 등록 시 사용으로 시작

function text(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return String(value);
}

function parseSetting(data: Record<string, unknown>) {
  const evidenceType = text(data['evidenceType']);
  const evidenceItemName = text(data['evidenceItemName']);
  const rawSubject = data['accountSubjectId'];
  if (!evidenceType || !evidenceItemName || rawSubject === undefined || rawSubject === null || rawSubject === '') {
    throw new ApiError(422, 'REQUIRED_SETTING_MISSING', '증빙유형, 증빙항목명, 자동분개 계정과목은 반드시 입력해야 합니다.');
  }
  if (typeof data['collectEnabled'] !== 'boolean' || typeof data['autoJournalEnabled'] !== 'boolean') {
    throw new ApiError(422, 'REQUIRED_SETTING_MISSING', '자료수집 사용 여부와 자동분개 사용 여부를 지정해야 합니다.');
  }
  const accountSubjectId = Number(rawSubject);
  if (!Number.isInteger(accountSubjectId) || accountSubjectId <= 0) {
    throw new ApiError(400, 'VALIDATION_FAILED', '분개 계정과목 형식이 올바르지 않습니다.');
  }
  if (evidenceType.length > 50 || evidenceItemName.length > 200) {
    throw new ApiError(400, 'VALIDATION_FAILED', '증빙유형 또는 증빙항목명이 너무 깁니다.');
  }
  const collectCondition = text(data['collectCondition']);
  const journalCondition = text(data['journalCondition']);
  if ((collectCondition && collectCondition.length > 1000) || (journalCondition && journalCondition.length > 1000)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '조건은 1000자 이하로 입력해야 합니다.');
  }
  const useStatus = text(data['useStatus']);
  if (useStatus !== null && useStatus !== '사용' && useStatus !== '미사용') {
    throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
  }
  return {
    evidenceType,
    evidenceItemName,
    collectEnabled: data['collectEnabled'],
    autoJournalEnabled: data['autoJournalEnabled'],
    collectCondition,
    journalCondition,
    accountSubjectId,
    useStatus,
  };
}

@Controller('api/v1')
export class FnSfr00701Controller {
  @Get('/auto-journal-settings')
  async listAutoJournalSettings(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const query = checks.queryOf(req.query);
    const page = query['page'] === undefined || query['page'] === '' ? 0 : Number(query['page']);
    const sizeRaw = query['size'] === undefined || query['size'] === '' ? 20 : Number(query['size']);
    if (!Number.isInteger(page) || page < 0 || !Number.isInteger(sizeRaw) || sizeRaw < 1) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호 또는 크기가 올바르지 않습니다.');
    }
    const size = Math.min(sizeRaw, 200);
    const useStatus = text(query['useStatus']);
    if (useStatus !== null && useStatus !== '사용' && useStatus !== '미사용') {
      throw new ApiError(400, 'VALIDATION_FAILED', '사용 여부는 사용 또는 미사용이어야 합니다.');
    }
    const filterParams = {
      evidenceType: text(query['evidenceType']),
      useStatus,
    };
    return transaction(async (db) => {
      const items = await db.query(
        'SELECT auto_journal_setting_id AS "autoJournalSettingId", ' +
          'evidence_type AS "evidenceType", ' +
          'evidence_item_name AS "evidenceItemName", ' +
          'collect_enabled AS "collectEnabled", ' +
          'auto_journal_enabled AS "autoJournalEnabled", ' +
          'collect_condition AS "collectCondition", ' +
          'journal_condition AS "journalCondition", ' +
          'account_subject_id AS "accountSubjectId", ' +
          'use_status AS "useStatus" ' +
          'FROM auto_journal_setting ' +
          'WHERE (CAST(:evidenceType AS varchar) IS NULL OR evidence_type = CAST(:evidenceType AS varchar)) ' +
          'AND (CAST(:useStatus AS varchar) IS NULL OR use_status = CAST(:useStatus AS varchar)) ' +
          'ORDER BY auto_journal_setting_id ' +
          'LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { ...filterParams, size, offset: page * size },
      );
      const counted = await db.query(
        'SELECT COUNT(*) AS "total" ' +
          'FROM auto_journal_setting ' +
          'WHERE (CAST(:evidenceType AS varchar) IS NULL OR evidence_type = CAST(:evidenceType AS varchar)) ' +
          'AND (CAST(:useStatus AS varchar) IS NULL OR use_status = CAST(:useStatus AS varchar))',
        filterParams,
      );
      return { items, page, size, total: Number(counted[0]['total']) };
    });
  }

  @Post('/auto-journal-settings')
  @HttpCode(200)
  async createAutoJournalSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    const input = parseSetting(data);
    return transaction(async (db) => {
      const subjects = await db.query(
        'SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:accountSubjectId AS bigint)',
        { accountSubjectId: input.accountSubjectId },
      );
      if (subjects.length === 0) {
        throw new ApiError(404, 'ACCOUNT_SUBJECT_NOT_FOUND', '지정한 계정과목이 존재하지 않습니다.');
      }
      const rows = await db.query(
        'INSERT INTO auto_journal_setting ' +
          '(evidence_type, evidence_item_name, collect_enabled, auto_journal_enabled, ' +
          'collect_condition, journal_condition, account_subject_id, use_status, created_at, updated_at) ' +
          'VALUES (:evidenceType, :evidenceItemName, :collectEnabled, :autoJournalEnabled, ' +
          ':collectCondition, :journalCondition, CAST(:accountSubjectId AS bigint), :useStatus, now(), now()) ' +
          'RETURNING auto_journal_setting_id AS "autoJournalSettingId"',
        { ...input, useStatus: input.useStatus ?? DEFAULT_USE_STATUS },
      );
      return { autoJournalSettingId: Number(rows[0]['autoJournalSettingId']) };
    });
  }

  @Put('/auto-journal-settings/:autoJournalSettingId')
  async updateAutoJournalSetting(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const idText = req.params['autoJournalSettingId'];
    if (!/^[0-9]+$/.test(idText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '설정 번호 형식이 올바르지 않습니다.');
    }
    const data = checks.inputOf(req.body);
    const input = parseSetting(data);
    return transaction(async (db) => {
      const found = await db.query(
        'SELECT auto_journal_setting_id FROM auto_journal_setting WHERE auto_journal_setting_id = CAST(:id AS bigint)',
        { id: idText },
      );
      if (found.length === 0) {
        throw new ApiError(404, 'AUTO_JOURNAL_SETTING_NOT_FOUND', '수정할 설정이 존재하지 않습니다.');
      }
      const subjects = await db.query(
        'SELECT account_subject_id FROM account_subject WHERE account_subject_id = CAST(:accountSubjectId AS bigint)',
        { accountSubjectId: input.accountSubjectId },
      );
      if (subjects.length === 0) {
        throw new ApiError(404, 'ACCOUNT_SUBJECT_NOT_FOUND', '지정한 계정과목이 존재하지 않습니다.');
      }
      await db.execute(
        'UPDATE auto_journal_setting SET ' +
          'evidence_type = :evidenceType, ' +
          'evidence_item_name = :evidenceItemName, ' +
          'collect_enabled = :collectEnabled, ' +
          'auto_journal_enabled = :autoJournalEnabled, ' +
          'collect_condition = :collectCondition, ' +
          'journal_condition = :journalCondition, ' +
          'account_subject_id = CAST(:accountSubjectId AS bigint), ' +
          'use_status = COALESCE(CAST(:useStatus AS varchar), use_status), ' +
          'updated_at = now() ' +
          'WHERE auto_journal_setting_id = CAST(:id AS bigint)',
        { ...input, id: idText },
      );
      return { autoJournalSettingId: Number(idText) };
    });
  }
}
