// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-036-02 메시지·파일 실시간 송수신 (TASK-207)
 *
 * - [확정] AC-FN-SFR-036-02-4 메시지는 그룹 대화방의 모든 참여자에게 전송된다.
 * - [확정] AC-FN-SFR-036-02-5 수신자가 메시지를 확인하면 발신자에게 읽음 상태(읽음/안읽음)를 표시한다.
 * - [확정] AC-FN-SFR-036-02-6 답장은 원본 메시지를 연결하여 표시한다.
 * - [확정] AC-FN-SFR-036-02-7 메시지와 파일을 다른 대화방 또는 사용자에게 전달할 수 있다.
 * - [확정] AC-FN-SFR-036-02-8 폴더를 드래그 앤 드롭하면 폴더 단위로 전송한다.
 * - [확정] AC-FN-SFR-036-02-9 폴더 전송 시 폴더 구조를 유지하여 전달한다.
 * - [공통] AC-FN-SFR-036-02-10 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-036-02-11 첨부파일은 ECM 등 문서관리 저장소에 저장하고 권한에 따라 다운로드를 제한하며 HWP·Word·Excel·PPT는 다운로드 없이 미리보기를 제공하고 첨부 내용은 통합검색 대상에 포함한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /messenger-messages — 대화방에 메시지·파일 전송 */
export async function createMessengerMessage(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createMessengerMessage>
  return crud();
  // </hole>
}

/** POST /messenger-messages/{messengerMessageId}/forward — 메시지를 다른 대화방 또는 사용자에게 전달 */
export async function forwardMessengerMessage(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole forwardMessengerMessage>
  return crud();
  // </hole>
}

/** GET /messenger-message-recipients — 메시지 수신자별 읽음 상태 조회 */
export async function listMessengerMessageRecipients(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listMessengerMessageRecipients>
  return crud();
  // </hole>
}

/** POST /messenger-messages/{messengerMessageId}/read — 메시지 읽음 처리 */
export async function readMessengerMessage(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole readMessengerMessage>
  return crud();
  // </hole>
}
