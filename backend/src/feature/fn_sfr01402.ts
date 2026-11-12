import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 인사기록 현황 메뉴 권한은 menu.name 이 이 값인 메뉴의 menu_permission 으로 판단한다.
const MENU_NAME = '인사기록 현황';
// 가정: 열람 이력의 접근 유형 값
const ACCESS_TYPE = '열람';
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
const SCOPE_RANK: Record<string, number> = { '개인': 1, '부서': 2, '전체': 3 };

// 가정: 항목 구분 이름은 인사기록 항목명 그대로이며, 암호화(*_enc) 컬럼은 내보내지 않는다.
const ITEM_TYPES: Record<string, { table: string; columns: string }> = {
  '출장': {
    table: 'employee_business_trip',
    columns: 't.employee_id AS "employeeId", t.destination AS "destination", CAST(t.start_date AS text) AS "startDate", CAST(t.end_date AS text) AS "endDate", t.purpose AS "purpose", t.remark AS "remark"',
  },
  '자격·면허': {
    table: 'employee_license',
    columns: 't.employee_id AS "employeeId", t.license_name AS "licenseName", t.issuing_organization AS "issuingOrganization", CAST(t.acquired_date AS text) AS "acquiredDate", CAST(t.expiry_date AS text) AS "expiryDate"',
  },
  '외국어': {
    table: 'employee_language',
    columns: 't.employee_id AS "employeeId", t.language_name AS "languageName", t.test_name AS "testName", t.score AS "score", t.grade AS "grade", CAST(t.test_date AS text) AS "testDate", CAST(t.expiry_date AS text) AS "expiryDate"',
  },
  '학력': {
    table: 'employee_education',
    columns: 't.employee_id AS "employeeId", t.school_name AS "schoolName", t.major AS "major", t.degree AS "degree", CAST(t.admission_date AS text) AS "admissionDate", CAST(t.graduation_date AS text) AS "graduationDate", t.graduation_status AS "graduationStatus"',
  },
  '경력': {
    table: 'employee_career',
    columns: 't.employee_id AS "employeeId", t.company_name AS "companyName", t.department_name AS "departmentName", t.position_title AS "positionTitle", t.job_description AS "jobDescription", CAST(t.start_date AS text) AS "startDate", CAST(t.end_date AS text) AS "endDate"',
  },
  '인사고과': {
    table: 'employee_evaluation',
    columns: 't.employee_id AS "employeeId", CAST(t.period_start_date AS text) AS "periodStartDate", CAST(t.period_end_date AS text) AS "periodEndDate", t.evaluation_grade AS "evaluationGrade", t.evaluation_score AS "evaluationScore", t.evaluator_name AS "evaluatorName", t.comment AS "comment"',
  },
  '상벌': {
    table: 'employee_reward_penalty',
    columns: 't.employee_id AS "employeeId", t.reward_penalty_type AS "rewardPenaltyType", t.title AS "title", CAST(t.awarded_date AS text) AS "awardedDate", t.issuer AS "issuer", t.content AS "content"',
  },
  '가족': {
    table: 'employee_family',
    columns: 't.employee_id AS "employeeId", t.relationship AS "relationship", t.is_dependent AS "isDependent"',
  },
};

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function intOf(v: unknown, fallback: number): number {
  const s = text(v);
  if (s === '') {
    return fallback;
  }
  if (!/^\d+$/.test(s)) {
    throw new ApiError(400, 'VALIDATION_FAILED', '숫자 형식이 올바르지 않습니다.');
  }
  return Number(s);
}

@Controller('api/v1')
export class FnSfr01402Controller {
  @Get('/personnel-record-items')
  async listPersonnelRecordItems(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const q = checks.queryOf(req.query);
    const itemType = text(q['itemType']);
    if (itemType === '') {
      throw new ApiError(422, 'ITEM_TYPE_REQUIRED', '인사기록 항목을 선택해 주세요.');
    }
    const def = ITEM_TYPES[itemType];
    if (!def) {
      throw new ApiError(400, 'VALIDATION_FAILED', '알 수 없는 인사기록 항목입니다.');
    }
    const requestedScope = text(q['viewScope']);
    if (requestedScope !== '' && !SCOPE_RANK[requestedScope]) {
      throw new ApiError(400, 'VALIDATION_FAILED', '조회 범위 값이 올바르지 않습니다.');
    }
    const employmentStatus = text(q['employmentStatus']);
    if (employmentStatus !== '' && employmentStatus !== '재직자' && employmentStatus !== '퇴직자') {
      throw new ApiError(400, 'VALIDATION_FAILED', '재직 구분 값이 올바르지 않습니다.');
    }
    const departmentIdText = text(q['departmentId']);
    if (departmentIdText !== '' && !/^\d+$/.test(departmentIdText)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '부서 값이 올바르지 않습니다.');
    }
    const keyword = text(q['keyword']);
    const page = intOf(q['page'], 0);
    const size = Math.min(Math.max(intOf(q['size'], DEFAULT_SIZE), 1), MAX_SIZE);

    return transaction(async (db) => {
      const granted = await db.query(
        'SELECT mp.view_scope AS "viewScope" FROM menu_permission mp JOIN menu m ON m.menu_id = mp.menu_id WHERE mp.employee_id = CAST(:userId AS bigint) AND m.name = :menuName AND m.use_status = :useStatus',
        { userId: user.id, menuName: MENU_NAME, useStatus: '사용' },
      );
      if (granted.length === 0) {
        throw new ApiError(403, 'FORBIDDEN', '인사기록 현황 메뉴를 사용할 권한이 없습니다.');
      }
      const grantedScope = String(granted[0]['viewScope']);
      const scope = requestedScope !== '' ? requestedScope : grantedScope;
      if (SCOPE_RANK[scope] > SCOPE_RANK[grantedScope]) {
        throw new ApiError(422, 'VIEW_SCOPE_NOT_ALLOWED', '권한 범위를 벗어난 조회 범위입니다.');
      }

      const where: string[] = ['EXISTS (SELECT 1 FROM ' + def.table + ' x WHERE x.employee_id = e.employee_id)'];
      const params: Record<string, unknown> = {};
      if (scope === '부서') {
        where.push('e.department_id = (SELECT u.department_id FROM employee u WHERE u.employee_id = CAST(:userId AS bigint))');
        params['userId'] = user.id;
      } else if (scope === '개인') {
        where.push('e.employee_id = CAST(:userId AS bigint)');
        params['userId'] = user.id;
      }
      if (employmentStatus !== '') {
        where.push('pr.employment_status = :employmentStatus');
        params['employmentStatus'] = employmentStatus;
      }
      if (departmentIdText !== '') {
        where.push('e.department_id = CAST(:departmentId AS bigint)');
        params['departmentId'] = departmentIdText;
      }
      if (keyword !== '') {
        where.push("(e.name ILIKE '%' || :keyword || '%' OR e.employee_no ILIKE '%' || :keyword || '%')");
        params['keyword'] = keyword;
      }
      const from = 'FROM employee e LEFT JOIN personnel_record pr ON pr.employee_id = e.employee_id WHERE ' + where.join(' AND ');

      const countRows = await db.query('SELECT COUNT(*) AS "total" ' + from, params);
      const total = Number(countRows[0]['total']);
      const listParams = { ...params, size, offset: page * size };
      const pageSql = 'SELECT e.employee_id ' + from + ' ORDER BY e.employee_id LIMIT :size OFFSET :offset';

      const employees = await db.query(
        'SELECT e.employee_id AS "employeeId", e.name AS "employeeName" ' + from + ' ORDER BY e.employee_id LIMIT :size OFFSET :offset',
        listParams,
      );
      const records = await db.query(
        'SELECT ' + def.columns + ' FROM ' + def.table + ' t WHERE t.employee_id IN (' + pageSql + ') ORDER BY t.employee_id, 1',
        listParams,
      );
      const byEmployee = new Map<string, Record<string, unknown>[]>();
      for (const r of records) {
        const key = String(r['employeeId']);
        const list = byEmployee.get(key) ?? [];
        const { employeeId: _ignore, ...rest } = r as Record<string, unknown>;
        list.push(rest);
        byEmployee.set(key, list);
      }
      const items = employees.map((e: Record<string, unknown>) => ({
        employeeId: Number(e['employeeId']),
        employeeName: e['employeeName'],
        items: byEmployee.get(String(e['employeeId'])) ?? [],
      }));

      // 개인정보 열람 이력: 조회된 임직원마다 한 건씩 기록한다.
      for (const e of items) {
        await db.execute(
          'INSERT INTO personal_info_access_log (employee_id, target_employee_id, target_info_type, access_type, accessed_at, access_ip, created_at, updated_at) VALUES (CAST(:userId AS bigint), CAST(:targetId AS bigint), :infoType, :accessType, now(), :ip, now(), now())',
          { userId: user.id, targetId: e.employeeId, infoType: itemType, accessType: ACCESS_TYPE, ip: req.ip ?? null },
        );
      }

      return { items, page, size, total };
    });
  }
}
