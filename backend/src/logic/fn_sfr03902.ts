// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-039-02 조직원 검색 및 활동 내역 조회 (TASK-095)
 *
 * - [확정] AC-FN-SFR-039-02-4 조회자의 권한 범위 내 조직원만 검색되며 프로필과 활동 내역도 권한 범위 내 항목만 표시한다
 * - [확정] AC-FN-SFR-039-02-5 업무활동 내역에는 전자결재와 게시판 등의 활동이 포함되며 조회자가 열람 권한이 없는 문서·게시물은 제외한다
 * - [확정] AC-FN-SFR-039-02-6 프로필 중 개인정보 조회 시 접근 이력을 기록한다
 * - [공통] AC-FN-SFR-039-02-7 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-039-02-8 통합검색, 조직원 검색, 메시지 검색은 조회자의 권한 범위 안의 결과만 보여준다.
 * - [공통] AC-FN-SFR-039-02-9 인사·급여·주민번호 등 개인정보와 고유식별정보는 암호화 저장하며, 개인정보 열람·접근 이력을 기록하고 조회 화면을 제공한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /employees/{employeeId}/activities — 조직원의 전자결재·게시판 업무활동 내역을 권한 범위 내에서 조회한다 */
export async function listEmployeeActivities(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listEmployeeActivities>
  return crud();
  // </hole>
}
