// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-018-07 근태 확정 관리 (TASK-138)
 *
 * - [확정] AC-FN-SFR-018-07-4 일별 마감 및 근태 결과 집계 후 월 마감을 수행한다
 * - [확정] AC-FN-SFR-018-07-5 마감된 기간 데이터는 마감 취소 전에는 수정할 수 없다
 * - [확정] AC-FN-SFR-018-07-6 마감 승인 필요 시 전자결재 연계 상신 공통 기능(S3)을 이용하며 연계 사용 여부는 환경설정에 따른다
 * - [확정] AC-FN-SFR-018-07-7 일괄 업로드는 엑셀 일괄 업로드 공통 기능(S2)을 이용한다
 * - [공통] AC-FN-SFR-018-07-8 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-018-07-9 승인·마감·확정이 필요한 업무는 전자결재와 연계하며, 결재 결과(승인·반려 등)를 해당 업무 상태에 반영하고 결재 연계 사용 여부는 환경설정에 따른다.
 * - [공통] AC-FN-SFR-018-07-10 급여·예산·근태 등 마감된 기간의 데이터는 마감 취소 전에는 수정할 수 없다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /attendance-closings/preview — 마감 대상 기간의 근태 결과를 집계하여 미리 본다 */
export async function previewAttendanceClosing(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole previewAttendanceClosing>
  return crud();
  // </hole>
}

/** POST /attendance-closings — 일 또는 월 단위 근태 마감을 실행한다 */
export async function createAttendanceClosing(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createAttendanceClosing>
  return crud();
  // </hole>
}

/** POST /attendance-closings/{attendanceClosingId}/cancel — 근태 마감을 취소한다 */
export async function cancelAttendanceClosing(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole cancelAttendanceClosing>
  return crud();
  // </hole>
}
