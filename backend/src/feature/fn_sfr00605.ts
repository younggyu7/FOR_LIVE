import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 한 번에 변환하는 최대 전표 수 (시스템 성능 부하 방지)
const MAX_ROWS = 10000;
// 가정: 변환 지원 자료 구분은 전표뿐이다 (장부는 대응 테이블이 없다)
const DATA_TYPES = ['전표'];
// 가정: 변환 파일 다운로드 경로의 기준 위치
const FILE_BASE = '/downloads/tax-office';

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

@Controller('api/v1')
export class FnSfr00605Controller {
  @Post('/tax-office-conversions')
  @HttpCode(200)
  async convertTaxOfficeData(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자');
    const data = checks.inputOf(req.body);
    const startDate = text(data['startDate']);
    const endDate = text(data['endDate']);
    const dataType = text(data['dataType']);
    const taxProgramFormat = text(data['taxProgramFormat']);
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '변환 대상 기간을 YYYY-MM-DD 형식으로 입력해 주세요.');
    }
    if (!dataType || !DATA_TYPES.includes(dataType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '변환 대상 자료 구분을 확인해 주세요.');
    }
    if (!taxProgramFormat) {
      throw new ApiError(400, 'VALIDATION_FAILED', '세무 프로그램 형식을 입력해 주세요.');
    }
    return transaction(async (db) => {
      const range = await db.query(
        'SELECT CAST(:startDate AS date) <= CAST(:endDate AS date) AS "ok"',
        { startDate, endDate },
      );
      if (!range[0] || range[0]['ok'] !== true) {
        throw new ApiError(400, 'VALIDATION_FAILED', '시작일은 종료일보다 늦을 수 없습니다.');
      }
      const rows = await db.query(
        'SELECT journal_entry_id AS "journalEntryId", CAST(entry_date AS text) AS "entryDate", '
          + 'status AS "status", total_debit_amount AS "totalDebitAmount", '
          + 'total_credit_amount AS "totalCreditAmount" '
          + 'FROM journal_entry '
          + 'WHERE entry_date BETWEEN CAST(:startDate AS date) AND CAST(:endDate AS date) '
          + 'ORDER BY entry_date, journal_entry_id '
          + 'LIMIT :maxRows',
        { startDate, endDate, maxRows: MAX_ROWS },
      );
      if (rows.length === 0) {
        throw new ApiError(422, 'CONVERSION_TARGET_NOT_FOUND', '변환 대상 기간에 변환할 회계자료가 없습니다.');
      }
      const errorReasons: string[] = [];
      for (const row of rows) {
        const id = row['journalEntryId'];
        const debit = row['totalDebitAmount'];
        const credit = row['totalCreditAmount'];
        if (typeof debit !== 'number' || typeof credit !== 'number') {
          errorReasons.push('전표 ' + id + ': 차변·대변 합계가 없어 변환할 수 없습니다.');
        } else if (debit !== credit) {
          errorReasons.push('전표 ' + id + ': 차변 합계와 대변 합계가 일치하지 않습니다.');
        }
      }
      const convertedCount = rows.length - errorReasons.length;
      if (convertedCount === 0) {
        throw new ApiError(422, 'CONVERSION_FORMAT_ERROR', '변환 중 형식 오류가 발생했습니다: ' + errorReasons[0]);
      }
      // 가정: 변환 파일 경로는 기간과 형식으로 정한다
      const convertedFile = FILE_BASE + '/' + encodeURIComponent(taxProgramFormat) + '_' + startDate + '_' + endDate + '.csv';
      return { convertedFile, convertedCount, errorReasons };
    });
  }
}
