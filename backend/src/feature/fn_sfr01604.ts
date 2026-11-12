import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 접근 이력의 열람 대상 정보 구분 고정값
const TARGET_INFO_TYPE = '증명서 발급 정보';
// 가정: 접근 이력의 접근 유형 고정값
const ACCESS_TYPE = '조회';
const STATUSES = ['신청', '승인', '반려'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^\d+$/;

function text(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

@Controller('api/v1')
export class FnSfr01604Controller {
  @Get('/certificate-requests')
  async listCertificateRequests(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const query = checks.queryOf(req.query);

    const issuedFrom = text(query['issuedFrom']);
    const issuedTo = text(query['issuedTo']);
    const certificateTypeId = text(query['certificateTypeId']);
    const employeeId = text(query['employeeId']);
    const status = text(query['status']);
    const pageText = text(query['page']);
    const sizeText = text(query['size']);

    if (issuedFrom !== '' && !DATE_PATTERN.test(issuedFrom)) {
      throw invalid('발급 일자 시작은 YYYY-MM-DD 형식이어야 합니다.');
    }
    if (issuedTo !== '' && !DATE_PATTERN.test(issuedTo)) {
      throw invalid('발급 일자 종료는 YYYY-MM-DD 형식이어야 합니다.');
    }
    if (certificateTypeId !== '' && !ID_PATTERN.test(certificateTypeId)) {
      throw invalid('증명서 종류 ID는 숫자여야 합니다.');
    }
    if (employeeId !== '' && !ID_PATTERN.test(employeeId)) {
      throw invalid('신청자 ID는 숫자여야 합니다.');
    }
    if (status !== '' && !STATUSES.includes(status)) {
      throw invalid('처리 상태는 신청, 승인, 반려 중 하나여야 합니다.');
    }
    if (pageText !== '' && !ID_PATTERN.test(pageText)) {
      throw invalid('page는 0 이상의 숫자여야 합니다.');
    }
    if (sizeText !== '' && !ID_PATTERN.test(sizeText)) {
      throw invalid('size는 1 이상의 숫자여야 합니다.');
    }

    const page = pageText === '' ? 0 : Number(pageText);
    let size = sizeText === '' ? 20 : Number(sizeText);
    if (size < 1) {
      throw invalid('size는 1 이상의 숫자여야 합니다.');
    }
    if (size > 200) {
      size = 200;
    }

    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (issuedFrom !== '') {
      conditions.push("cr.status = '승인' AND cr.updated_at >= CAST(:issuedFrom AS date)");
      params['issuedFrom'] = issuedFrom;
    }
    if (issuedTo !== '') {
      conditions.push("cr.status = '승인' AND cr.updated_at < CAST(:issuedTo AS date) + 1");
      params['issuedTo'] = issuedTo;
    }
    if (certificateTypeId !== '') {
      conditions.push('cr.certificate_type_id = CAST(:certificateTypeId AS bigint)');
      params['certificateTypeId'] = certificateTypeId;
    }
    if (employeeId !== '') {
      conditions.push('cr.employee_id = CAST(:employeeId AS bigint)');
      params['employeeId'] = employeeId;
    }
    if (status !== '') {
      conditions.push('cr.status = :status');
      params['status'] = status;
    }
    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    return transaction(async (db) => {
      const countRows = await db.query(
        'SELECT COUNT(*) AS "total" FROM certificate_request cr ' +
          'JOIN certificate_type ct ON ct.certificate_type_id = cr.certificate_type_id ' +
          'JOIN employee e ON e.employee_id = cr.employee_id ' +
          where,
        params,
      );
      const total = Number(countRows[0]['total']);

      const items = await db.query(
        'SELECT cr.issue_number AS "issueNumber", ' +
          'ct.name AS "certificateTypeName", ' +
          'e.name AS "employeeName", ' +
          'cr.created_at AS "createdAt", ' +
          'cr.status AS "status", ' +
          "CASE WHEN cr.status = '승인' THEN cr.updated_at END AS \"issuedDate\" " +
          'FROM certificate_request cr ' +
          'JOIN certificate_type ct ON ct.certificate_type_id = cr.certificate_type_id ' +
          'JOIN employee e ON e.employee_id = cr.employee_id ' +
          where +
          ' ORDER BY cr.created_at DESC, cr.certificate_request_id DESC ' +
          'LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
        { ...params, size, offset: page * size },
      );

      // 증명서 발급 정보에는 개인정보가 포함되므로 접근 이력을 기록한다.
      await db.execute(
        'INSERT INTO personal_info_access_log ' +
          '(employee_id, target_info_type, access_type, accessed_at, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :targetInfoType, :accessType, now(), now(), now())',
        { userId: user.id, targetInfoType: TARGET_INFO_TYPE, accessType: ACCESS_TYPE },
      );

      return { items, page, size, total };
    });
  }
}
