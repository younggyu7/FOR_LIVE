// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-012-02 인사정보 변경 신청 검토·승인 (TASK-030)
 *
 * - [확정] AC-FN-SFR-012-02-4 변경 신청 건은 승인 또는 반려할 수 있다.
 * - [확정] AC-FN-SFR-012-02-5 승인된 건은 인사정보에 반영하고 변경 이력을 남긴다.
 * - [확정] AC-FN-SFR-012-02-6 승인 처리 상태는 신청, 승인, 반려 값을 사용한다.
 * - [확정] AC-FN-SFR-012-02-7 반려 시 사유 입력 여부는 반려 사유를 필수로 한다.
 * - [확정] AC-FN-SFR-012-02-8 승인된 건은 임의 수정·삭제할 수 없다.
 * - [공통] AC-FN-SFR-012-02-9 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-012-02-10 승인·마감·확정이 필요한 업무는 전자결재와 연계하며, 결재 결과(승인·반려 등)를 해당 업무 상태에 반영하고 결재 연계 사용 여부는 환경설정에 따른다.
 * - [공통] AC-FN-SFR-012-02-11 업무 이벤트(결재 요청·승인·반려, 예약 승인, 신규 게시물 등) 알림은 통합알림으로 연계하고 알림 채널은 설정된 채널로 발송하며, 알림에서 해당 메뉴·문서로 바로가기와 읽음 상태 구분을 제공한다.
 * - [공통] AC-FN-SFR-012-02-12 기안·신청 후 승인된 건은 임의 수정·삭제할 수 없으며 변경하려면 승인 취소·회수·마감 취소 등 정해진 절차를 거치고, 변경 이력(일시·수정자·내용)을 남긴다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /personnel-change-requests — 인사정보 변경 신청 목록 조회(변경 전후 내용 포함) */
export async function listPersonnelChangeRequests(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listPersonnelChangeRequests>
  return crud();
  // </hole>
}

/** POST /personnel-change-requests — 임직원이 인사정보 변경을 신청 */
export async function createPersonnelChangeRequest(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createPersonnelChangeRequest>
  return crud();
  // </hole>
}

/** POST /personnel-change-requests/{personnelChangeRequestId}/review — 인사 담당자가 변경 신청을 승인 또는 반려 */
export async function reviewPersonnelChangeRequest(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole reviewPersonnelChangeRequest>
  return crud();
  // </hole>
}
