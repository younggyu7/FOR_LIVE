// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-037-03 인증기기 승인·관리 (TASK-090)
 *
 * - [확정] AC-FN-SFR-037-03-5 인증기기는 시스템 관리자가 승인한 이후에만 2차 인증 로그인에 사용할 수 있다.
 * - [확정] AC-FN-SFR-037-03-6 사용자별 승인된 기기 수는 설정된 허용 인증기기 수를 초과할 수 없다.
 * - [확정] AC-FN-SFR-037-03-7 사용 여부는 사용 / 미사용 값으로 관리하며 미사용 기기는 로그인에 사용할 수 없다.
 * - [확정] AC-FN-SFR-037-03-8 기기 등록 요청과 승인·반려 결과 알림은 통합알림 연계로 발송한다 .
 * - [확정] AC-FN-SFR-037-03-9 인증기기 승인·변경 이력(일시·처리자·내용)을 남긴다 .
 * - [확정] AC-FN-SFR-037-03-10 2차 인증 수단은 OTP이며 기기 승인은 OTP 사용 기기를 기준으로 한다.
 * - [공통] AC-FN-SFR-037-03-11 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-037-03-12 업무 이벤트(결재 요청·승인·반려, 예약 승인, 신규 게시물 등) 알림은 통합알림으로 연계하고 알림 채널은 설정된 채널로 발송하며, 알림에서 해당 메뉴·문서로 바로가기와 읽음 상태 구분을 제공한다.
 * - [공통] AC-FN-SFR-037-03-13 웹·메신저·모바일 앱 로그인은 2차 인증을 적용하며 승인된 인증기기만 허용 기기 수 범위 내에서 사용할 수 있다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /auth-devices — 인증기기 목록 조회 */
export async function listAuthDevices(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listAuthDevices>
  return crud();
  // </hole>
}

/** POST /auth-devices — 인증기기 등록 요청 */
export async function createAuthDevice(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createAuthDevice>
  return crud();
  // </hole>
}

/** POST /auth-devices/{authDeviceId}/approve — 인증기기 승인 */
export async function approveAuthDevice(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole approveAuthDevice>
  return crud();
  // </hole>
}

/** POST /auth-devices/{authDeviceId}/reject — 인증기기 반려 */
export async function rejectAuthDevice(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole rejectAuthDevice>
  return crud();
  // </hole>
}

/** POST /auth-devices/{authDeviceId}/deactivate — 승인된 인증기기 사용중지 */
export async function deactivateAuthDevice(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole deactivateAuthDevice>
  return crud();
  // </hole>
}

/** DELETE /auth-devices/{authDeviceId} — 인증기기 삭제 */
export async function deleteAuthDevice(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole deleteAuthDevice>
  return crud();
  // </hole>
}
