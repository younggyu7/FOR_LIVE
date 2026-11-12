// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-013-03 인사발령 처리 및 발령공고 자동 게시 (TASK-125)
 *
 * - [확정] AC-FN-SFR-013-03-5 승인된 인사발령 건만 처리할 수 있다.
 * - [확정] AC-FN-SFR-013-03-6 인사발령 처리 시 발령 내용(부서·직위 등)을 인사기록카드에 반영하고 발령일자 기준 효력을 적용한다.
 * - [확정] AC-FN-SFR-013-03-7 인사발령 처리 내역은 그룹웨어 내 공지·게시판에 발령공고로 자동 게시한다. (결정 Q-009)
 * - [확정] AC-FN-SFR-013-03-8 발령공고 게시에 따라 신규 게시물 알림을 통합알림으로 연계한다.
 * - [확정] AC-FN-SFR-013-03-9 발령공고 게시 내용에는 공고 목적에 필요한 항목만 포함하고 민감한 개인정보는 제외한다.
 * - [확정] AC-FN-SFR-013-03-10 처리 완료된 인사발령은 임의 수정·삭제할 수 없으며 변경 이력을 남긴다.
 * - [확정] AC-FN-SFR-013-03-11 발령공고 게시 실패 시에도 인사발령 처리 결과는 유지하고 게시를 재시도할 수 있다.
 * - [공통] AC-FN-SFR-013-03-12 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-013-03-13 업무 이벤트(결재 요청·승인·반려, 예약 승인, 신규 게시물 등) 알림은 통합알림으로 연계하고 알림 채널은 설정된 채널로 발송하며, 알림에서 해당 메뉴·문서로 바로가기와 읽음 상태 구분을 제공한다.
 * - [공통] AC-FN-SFR-013-03-14 인사·급여·주민번호 등 개인정보와 고유식별정보는 암호화 저장하며, 개인정보 열람·접근 이력을 기록하고 조회 화면을 제공한다.
 * - [공통] AC-FN-SFR-013-03-15 기안·신청 후 승인된 건은 임의 수정·삭제할 수 없으며 변경하려면 승인 취소·회수·마감 취소 등 정해진 절차를 거치고, 변경 이력(일시·수정자·내용)을 남긴다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /personnel-appointments/{personnelAppointmentId}/process — 승인된 인사발령 처리 및 발령공고 게시 */
export async function processPersonnelAppointment(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole processPersonnelAppointment>
  return crud();
  // </hole>
}

/** POST /personnel-appointments/{personnelAppointmentId}/repost-announcement — 발령공고 재게시 */
export async function repostAppointmentAnnouncement(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole repostAppointmentAnnouncement>
  return crud();
  // </hole>
}
