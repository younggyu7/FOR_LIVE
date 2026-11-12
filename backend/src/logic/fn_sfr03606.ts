// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-036-06 그룹웨어 모듈 이벤트 실시간 알림 및 바로가기 (TASK-087)
 *
 * - [확정] AC-FN-SFR-036-06-4 실시간 알림 대상은 그룹웨어 내 모듈의 이벤트로 한정한다.
 * - [확정] AC-FN-SFR-036-06-5 알림은 설정된 알림 채널로 발송한다.
 * - [확정] AC-FN-SFR-036-06-6 알림에서 해당 메뉴·문서로 바로가기를 제공하고 읽음/안읽음을 구분한다.
 * - [확정] AC-FN-SFR-036-06-7 바로가기 이동 시 사용 권한이 없으면 접근할 수 없다.
 * - [공통] AC-FN-SFR-036-06-8 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-036-06-9 업무 이벤트(결재 요청·승인·반려, 예약 승인, 신규 게시물 등) 알림은 통합알림으로 연계하고 알림 채널은 설정된 채널로 발송하며, 알림에서 해당 메뉴·문서로 바로가기와 읽음 상태 구분을 제공한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /notifications — 그룹웨어 모듈 이벤트 알림 생성 */
export async function createNotification(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createNotification>
  return crud();
  // </hole>
}
