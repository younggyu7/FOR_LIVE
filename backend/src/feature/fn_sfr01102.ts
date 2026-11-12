import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const REPORT_TYPES = ['감가상각비 현황', '고정자산 명세서', '변동 현황', '관리대장', '미상각자산 감가상각 명세서'];
const BASIS_VALUES = ['전체', '월별'];
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

// 가정: 감가상각비는 정액법으로 계산한다. (취득원가 - 잔존가액) / 내용연수(개월)을 취득월부터 월 단위로 상각한다.
// 가정: 전체 기준은 기준월 말까지의 누적 상각액, 월별 기준은 기준월 한 달의 상각액이다.
// 가정: 증감 금액은 조회 기간 중 취득한 자산의 취득원가다.
// 가정: 조회 기준월이 없으면 현재 월을 기준으로 한다. 기간은 YYYY-MM 또는 YYYY-MM~YYYY-MM 형식이다.
const END_DATE =
  `CAST(date_trunc('month', COALESCE(CAST(:toMonth AS date), CURRENT_DATE)) + interval '1 month' - interval '1 day' AS date)`;
const START_DATE =
  `CAST(date_trunc('month', COALESCE(CAST(:fromMonth AS date), CAST(:toMonth AS date), CURRENT_DATE)) AS date)`;
const ELAPSED =
  `((date_part('year', ` + END_DATE + `) - date_part('year', asset_depreciation.acquisition_date)) * 12` +
  ` + date_part('month', ` + END_DATE + `) - date_part('month', asset_depreciation.acquisition_date) + 1)`;
const MONTHLY =
  `((asset_depreciation.acquisition_cost - COALESCE(asset_depreciation.salvage_value, 0)) / asset_depreciation.useful_life_months)`;
const DEPRECIATION =
  `ROUND(CASE WHEN CAST(:basis AS text) = '월별'` +
  ` THEN (CASE WHEN ` + ELAPSED + ` BETWEEN 1 AND asset_depreciation.useful_life_months THEN ` + MONTHLY + ` ELSE 0 END)` +
  ` ELSE ` + MONTHLY + ` * GREATEST(0, LEAST(` + ELAPSED + `, asset_depreciation.useful_life_months)) END, 2)`;
const CHANGE =
  `(CASE WHEN asset_depreciation.acquisition_date BETWEEN ` + START_DATE + ` AND ` + END_DATE +
  ` THEN asset_depreciation.acquisition_cost ELSE 0 END)`;
const FROM_PART =
  `FROM asset JOIN asset_depreciation ON asset_depreciation.asset_id = asset.asset_id `;
const WHERE_PART =
  `WHERE (CAST(:assetCode AS text) IS NULL OR asset.asset_code = CAST(:assetCode AS text))` +
  ` AND (CAST(:accountSubjectId AS bigint) IS NULL OR asset.account_subject_id = CAST(:accountSubjectId AS bigint))` +
  ` AND (CAST(:reportType AS text) <> '변동 현황' OR ` + CHANGE + ` <> 0)` +
  ` AND (CAST(:reportType AS text) <> '미상각자산 감가상각 명세서' OR ` + ELAPSED + ` < asset_depreciation.useful_life_months) `;

@Controller('api/v1')
export class FnSfr01102Controller {
  @Get('/asset-reports')
  async listAssetReports(@Req() req: Request) {
    const user = currentUser(req);
    user.require('자산 담당자', '예산·회계 담당자');
    const q = checks.queryOf(req.query);

    const reportType = String(q['reportType'] ?? '').trim();
    if (reportType === '' || !REPORT_TYPES.includes(reportType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 유형을 올바르게 선택해 주세요.');
    }

    const basisText = String(q['basis'] ?? '').trim();
    if (basisText !== '' && !BASIS_VALUES.includes(basisText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '감가상각비 현황 기준은 전체 또는 월별이어야 합니다.');
    }
    const basis = basisText === '' ? '전체' : basisText;

    let fromMonth: string | null = null;
    let toMonth: string | null = null;
    const baseMonth = String(q['baseMonth'] ?? '').trim();
    if (baseMonth !== '') {
      const m = /^(\d{4}-(?:0[1-9]|1[0-2]))(?:~(\d{4}-(?:0[1-9]|1[0-2])))?$/.exec(baseMonth);
      if (!m) {
        throw new ApiError(422, 'INVALID_PERIOD_FORMAT', '조회 기간 형식이 올바르지 않습니다. YYYY-MM 또는 YYYY-MM~YYYY-MM으로 입력해 주세요.');
      }
      const first = m[1];
      const last = m[2] ?? m[1];
      if (first > last) {
        throw new ApiError(422, 'INVALID_PERIOD_FORMAT', '조회 기간의 시작이 끝보다 늦을 수 없습니다.');
      }
      fromMonth = first + '-01';
      toMonth = last + '-01';
    }

    const assetCodeText = String(q['assetCode'] ?? '').trim();
    const assetCode = assetCodeText === '' ? null : assetCodeText;

    const subjectText = String(q['accountSubjectId'] ?? '').trim();
    if (subjectText !== '' && !/^\d+$/.test(subjectText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '계정과목이 올바르지 않습니다.');
    }
    const accountSubjectId = subjectText === '' ? null : subjectText;

    const pageText = String(q['page'] ?? '').trim();
    const sizeText = String(q['size'] ?? '').trim();
    if ((pageText !== '' && !/^\d+$/.test(pageText)) || (sizeText !== '' && !/^\d+$/.test(sizeText))) {
      throw new ApiError(400, 'VALIDATION_FAILED', '쪽 번호와 크기는 0 이상의 숫자여야 합니다.');
    }
    const page = pageText === '' ? 0 : Number(pageText);
    let size = sizeText === '' ? DEFAULT_SIZE : Number(sizeText);
    if (size < 1) {
      size = DEFAULT_SIZE;
    }
    if (size > MAX_SIZE) {
      size = MAX_SIZE;
    }

    return transaction(async (db) => {
      const filterParams = { reportType, fromMonth, toMonth, assetCode, accountSubjectId };
      const items = await db.query(
        `SELECT asset.asset_code AS "assetCode",` +
          ` asset.asset_name AS "assetName",` +
          ` asset.account_subject_id AS "accountSubjectId",` +
          ` asset_depreciation.acquisition_date AS "acquisitionDate",` +
          ` asset_depreciation.acquisition_cost AS "acquisitionCost",` +
          ` asset_depreciation.depreciation_method AS "depreciationMethod",` +
          ` asset_depreciation.useful_life_months AS "usefulLifeMonths",` +
          ` ` + DEPRECIATION + ` AS "depreciationAmount",` +
          ` ` + CHANGE + ` AS "changeAmount" ` +
          FROM_PART +
          WHERE_PART +
          `ORDER BY asset.asset_code, asset.asset_id LIMIT :size OFFSET :offset`,
        { ...filterParams, basis, size, offset: page * size },
      );
      const counted = await db.query(
        `SELECT COUNT(*) AS "total" ` + FROM_PART + WHERE_PART,
        filterParams,
      );
      const total = Number(counted[0]?.total ?? 0);
      return { items, page, size, total };
    });
  }
}
