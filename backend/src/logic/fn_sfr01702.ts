// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-017-02 근태항목 관리 (TASK-038)
 *
 * - [확정] AC-FN-SFR-017-02-5 연차, 반차, 보상휴가, 병가, 예비군 근태항목을 관리할 수 있다.
 * - [확정] AC-FN-SFR-017-02-6 미사용으로 설정된 근태항목은 근태 신청에서 선택할 수 없다.
 * - [확정] AC-FN-SFR-017-02-7 이미 사용된 근태항목은 삭제하지 않고 미사용 처리한다.
 * - [확정] AC-FN-SFR-017-02-8 근태항목 변경 이력(일시·수정자·내용)을 남긴다.
 * - [공통] AC-FN-SFR-017-02-9 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-017-02-10 기안·신청 후 승인된 건은 임의 수정·삭제할 수 없으며 변경하려면 승인 취소·회수·마감 취소 등 정해진 절차를 거치고, 변경 이력(일시·수정자·내용)을 남긴다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /attendance-items — 근태항목 목록 조회 */
export async function listAttendanceItems(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listAttendanceItems>
  return crud();
  // </hole>
}

/** POST /attendance-items — 근태항목 등록 */
export async function createAttendanceItem(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createAttendanceItem>
  return crud();
  // </hole>
}

/** PATCH /attendance-items/{attendanceItemId} — 근태항목 수정·사용 여부 설정 */
export async function updateAttendanceItem(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole updateAttendanceItem>
  return crud();
  // </hole>
}

/** DELETE /attendance-items/{attendanceItemId} — 근태항목 삭제 */
export async function deleteAttendanceItem(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole deleteAttendanceItem>
  return crud();
  // </hole>
}
