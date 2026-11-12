// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-013-01 인사발령 신청 검토·승인 (TASK-123)
 *
 * - [확정] AC-FN-SFR-013-01-5 승인 처리 상태는 신청, 마감, 마감 취소, 승인, 승인 취소, 반려 값을 사용한다.
 * - [확정] AC-FN-SFR-013-01-6 신청 상태의 건만 검토하여 승인 또는 반려할 수 있다.
 * - [확정] AC-FN-SFR-013-01-7 반려 시 반려 사유를 필수로 입력한다.
 * - [확정] AC-FN-SFR-013-01-8 승인된 신청 건은 임의 수정·삭제할 수 없고 승인 취소 등 정해진 절차를 통해서만 변경하며 변경 이력(일시·수정자·내용)을 남긴다.
 * - [확정] AC-FN-SFR-013-01-9 승인 결과는 전자결재 연계(S3)를 통해 신청 상태에 반영하며 결재 연계 사용 여부는 환경설정에 따른다.
 * - [확정] AC-FN-SFR-013-01-10 승인 또는 반려 결과는 설정된 알림 채널로 신청자에게 통합알림으로 발송한다.
 * - [공통] AC-FN-SFR-013-01-11 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-013-01-12 승인·마감·확정이 필요한 업무는 전자결재와 연계하며, 결재 결과(승인·반려 등)를 해당 업무 상태에 반영하고 결재 연계 사용 여부는 환경설정에 따른다.
 * - [공통] AC-FN-SFR-013-01-13 업무 이벤트(결재 요청·승인·반려, 예약 승인, 신규 게시물 등) 알림은 통합알림으로 연계하고 알림 채널은 설정된 채널로 발송하며, 알림에서 해당 메뉴·문서로 바로가기와 읽음 상태 구분을 제공한다.
 * - [공통] AC-FN-SFR-013-01-14 기안·신청 후 승인된 건은 임의 수정·삭제할 수 없으며 변경하려면 승인 취소·회수·마감 취소 등 정해진 절차를 거치고, 변경 이력(일시·수정자·내용)을 남긴다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /personnel-appointments/{personnelAppointmentId}/approve — 인사발령 신청 승인 */
export async function approvePersonnelAppointment(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole approvePersonnelAppointment>
  return crud();
  // </hole>
}

/** POST /personnel-appointments/{personnelAppointmentId}/reject — 인사발령 신청 반려 */
export async function rejectPersonnelAppointment(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole rejectPersonnelAppointment>
  return crud();
  // </hole>
}
