// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-032-04 근무시간 동의 및 근태집계 현황 조회 (TASK-157)
 *
 * - [확정] AC-FN-SFR-032-04-4 조회 범위는 개인이며 본인 데이터만 조회·동의할 수 있다
 * - [확정] AC-FN-SFR-032-04-5 근무시간 동의는 동의 일시와 함께 근태 데이터에 보관한다
 * - [확정] AC-FN-SFR-032-04-6 동의 후 승인 처리는 승인 처리 상태 값을 따르며 승인된 건은 마감 취소 등 정해진 절차 없이 변경할 수 없다
 * - [확정] AC-FN-SFR-032-04-7 마감된 기간의 근태 데이터는 마감 취소 전에는 수정할 수 없다
 * - [공통] AC-FN-SFR-032-04-8 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-032-04-9 기안·신청 후 승인된 건은 임의 수정·삭제할 수 없으며 변경하려면 승인 취소·회수·마감 취소 등 정해진 절차를 거치고, 변경 이력(일시·수정자·내용)을 남긴다.
 * - [공통] AC-FN-SFR-032-04-10 급여·예산·근태 등 마감된 기간의 데이터는 마감 취소 전에는 수정할 수 없다.
 * - [공통] AC-FN-SFR-032-04-11 조회 화면은 필요한 항목에서 엑셀 다운로드를 제공하며 대상 데이터는 조회 권한 범위로 한정한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /attendance-requests/{attendanceRequestId}/consent — 근무시간 동의 */
export async function consentAttendanceRequest(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole consentAttendanceRequest>
  return crud();
  // </hole>
}

/** GET /attendance-summaries — 기간별 근태 유형별 집계 현황 조회 */
export async function listAttendanceSummaries(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listAttendanceSummaries>
  return crud();
  // </hole>
}
