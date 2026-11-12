// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-018-05 근태 현황 및 집계 조회 (TASK-136)
 *
 * - [확정] AC-FN-SFR-018-05-3 조회 범위는 권한에 따라 전체/부서/개인으로 제한된다
 * - [확정] AC-FN-SFR-018-05-4 기간·부서·사원 기준으로 검색할 수 있다
 * - [확정] AC-FN-SFR-018-05-5 엑셀 다운로드는 조회 결과 엑셀 다운로드 공통 기능(S1)을 이용한다
 * - [공통] AC-FN-SFR-018-05-6 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-018-05-7 조회 화면은 필요한 항목에서 엑셀 다운로드를 제공하며 대상 데이터는 조회 권한 범위로 한정한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /attendance-status/daily — 권한 범위 내 일별 근태 현황을 조회한다 */
export async function listDailyAttendanceStatus(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listDailyAttendanceStatus>
  return crud();
  // </hole>
}

/** GET /attendance-status/monthly — 권한 범위 내 월별 근태 현황을 조회한다 */
export async function listMonthlyAttendanceStatus(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listMonthlyAttendanceStatus>
  return crud();
  // </hole>
}

/** GET /attendance-status/summary — 권한 범위 내 근태 유형별 집계를 조회한다 */
export async function listAttendanceSummary(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listAttendanceSummary>
  return crud();
  // </hole>
}
