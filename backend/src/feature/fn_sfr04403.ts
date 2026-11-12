import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 분석 영역(예산/회계/인사)의 사용 권한은 menu.module 이 영역 이름과 같은 메뉴의 menu_permission 으로 확인한다.
const AREAS = ['예산', '회계', '인사'];
// 가정: 여러 메뉴 권한이 있으면 가장 넓은 조회 범위를 쓴다.
const SCOPE_RANK: Record<string, number> = { '개인': 1, '부서': 2, '전체': 3 };
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Controller('api/v1')
export class FnSfr04403Controller {
  @Post('/data-analysis/queries')
  @HttpCode(200)
  async queryDataAnalysis(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);

    const area = typeof data.analysisArea === 'string' ? data.analysisArea.trim() : '';
    if (!AREAS.includes(area)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '분석 대상 영역은 예산, 회계, 인사 중 하나여야 합니다.');
    }
    const question = typeof data.question === 'string' ? data.question.trim() : '';
    if (question === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '질의 내용을 입력해 주세요.');
    }
    const dateOf = (value: unknown, label: string): string | null => {
      if (value === undefined || value === null || value === '') {
        return null;
      }
      if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
        throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) YYYY-MM-DD 형식이어야 합니다.');
      }
      return value;
    };
    const idOf = (value: unknown, label: string): string | null => {
      if (value === undefined || value === null || value === '') {
        return null;
      }
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new ApiError(400, 'VALIDATION_FAILED', label + '은(는) 정수여야 합니다.');
      }
      return String(value);
    };
    const startDate = dateOf(data.startDate, '분석 기간 시작일');
    const endDate = dateOf(data.endDate, '분석 기간 종료일');
    const departmentId = idOf(data.departmentId, '부서');
    const projectId = idOf(data.projectId, '프로젝트');

    return transaction(async (db) => {
      // 질의자의 사용 권한 범위 확인 (권한이 없으면 분석하지 않는다)
      const grants = await db.query(
        'SELECT mp.view_scope AS "viewScope" FROM menu_permission mp JOIN menu m ON m.menu_id = mp.menu_id ' +
          'WHERE mp.employee_id = CAST(:userId AS bigint) AND m.module = :area AND m.use_status = \'사용\'',
        { userId: user.id, area },
      );
      let scope = '';
      for (const grant of grants) {
        const value = String(grant.viewScope);
        if ((SCOPE_RANK[value] ?? 0) > (SCOPE_RANK[scope] ?? 0)) {
          scope = value;
        }
      }
      if (scope === '') {
        throw new ApiError(403, 'FORBIDDEN', '해당 영역의 데이터에 접근할 권한이 없습니다.');
      }

      const params = { startDate, endDate, departmentId, projectId, userId: user.id, scope };
      let groups: Record<string, unknown>[] = [];

      if (area === '예산') {
        // 가정: 예산에는 부서 컬럼이 없어 부서 조건은 적용하지 않는다.
        groups = await db.query(
          'SELECT be.approval_status AS "status", COUNT(*) AS "count", COALESCE(SUM(be.execution_amount), 0) AS "amount" ' +
            'FROM budget_execution be JOIN budget_main bm ON bm.budget_main_id = be.budget_main_id ' +
            'WHERE (CAST(:projectId AS bigint) IS NULL OR bm.project_id = CAST(:projectId AS bigint)) ' +
            'AND (CAST(:startDate AS date) IS NULL OR bm.requested_date >= CAST(:startDate AS date)) ' +
            'AND (CAST(:endDate AS date) IS NULL OR bm.requested_date <= CAST(:endDate AS date)) ' +
            'GROUP BY be.approval_status ORDER BY be.approval_status',
          { projectId, startDate, endDate },
        );
      } else if (area === '회계') {
        groups = await db.query(
          'SELECT je.status AS "status", COUNT(*) AS "count", COALESCE(SUM(je.total_debit_amount), 0) AS "amount", ' +
            'COALESCE(SUM(je.total_credit_amount), 0) AS "creditAmount" ' +
            'FROM journal_entry je JOIN expense_resolution er ON er.expense_resolution_id = je.expense_resolution_id ' +
            'WHERE (CAST(:projectId AS bigint) IS NULL OR er.project_id = CAST(:projectId AS bigint)) ' +
            'AND (CAST(:departmentId AS bigint) IS NULL OR er.department_id = CAST(:departmentId AS bigint)) ' +
            'AND (CAST(:startDate AS date) IS NULL OR je.entry_date >= CAST(:startDate AS date)) ' +
            'AND (CAST(:endDate AS date) IS NULL OR je.entry_date <= CAST(:endDate AS date)) ' +
            'GROUP BY je.status ORDER BY je.status',
          { projectId, departmentId, startDate, endDate },
        );
      } else {
        // 인사: 조회 범위(전체/부서/개인) 안의 인사기록만 집계한다. 프로젝트 조건은 적용하지 않는다(가정).
        groups = await db.query(
          'SELECT pr.employment_status AS "status", COUNT(*) AS "count" ' +
            'FROM personnel_record pr JOIN employee e ON e.employee_id = pr.employee_id ' +
            'WHERE (CAST(:departmentId AS bigint) IS NULL OR e.department_id = CAST(:departmentId AS bigint)) ' +
            'AND (CAST(:startDate AS date) IS NULL OR pr.hire_date >= CAST(:startDate AS date)) ' +
            'AND (CAST(:endDate AS date) IS NULL OR pr.hire_date <= CAST(:endDate AS date)) ' +
            'AND (CAST(:scope AS text) = \'전체\' ' +
            'OR (CAST(:scope AS text) = \'부서\' AND e.department_id = (SELECT department_id FROM employee WHERE employee_id = CAST(:userId AS bigint))) ' +
            'OR (CAST(:scope AS text) = \'개인\' AND e.employee_id = CAST(:userId AS bigint))) ' +
            'GROUP BY pr.employment_status ORDER BY pr.employment_status',
          { departmentId, startDate, endDate, scope, userId: user.id },
        );
      }

      const totalCount = groups.reduce((sum, row) => sum + Number(row.count), 0);
      if (groups.length === 0 || totalCount === 0) {
        throw new ApiError(422, 'ANSWER_NOT_AVAILABLE', '질의에 해당하는 데이터가 없어 응답을 만들 수 없습니다.');
      }

      // 개인정보가 포함된 인사 데이터 조회는 열람·접근 이력으로 남긴다.
      if (area === '인사') {
        await db.execute(
          'INSERT INTO personal_info_access_log (employee_id, target_employee_id, target_info_type, access_type, accessed_at, access_ip, created_at, updated_at) ' +
            'VALUES (CAST(:userId AS bigint), NULL, :infoType, :accessType, now(), :ip, now(), now())',
          { userId: user.id, infoType: '인사기록', accessType: '분석 질의', ip: req.ip ?? null },
        );
      }

      // 질의 이력은 별도로 보관하지 않는다 (결정).
      // 분석 결과와 응답은 내부에서 집계한 값으로 만든다 (결정: 개발 담당자가 정함).
      const totalAmount = groups.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
      const parts = groups.map((row) => String(row.status) + ' ' + String(row.count) + '건');
      let answer = area + ' 데이터 총 ' + String(totalCount) + '건을 분석했습니다. 상태별: ' + parts.join(', ') + '.';
      if (area !== '인사') {
        answer += ' 금액 합계는 ' + String(totalAmount) + '원입니다.';
      }
      return {
        analysisResult: { analysisArea: area, viewScope: scope, totalCount, totalAmount, groups },
        answer,
      };
    });
  }
}
