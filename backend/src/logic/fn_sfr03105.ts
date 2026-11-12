// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-031-05 첨부파일 관리 (TASK-084)
 *
 * - [확정] AC-FN-SFR-031-05-5 첨부파일은 기존 ECM과 연계하여 자동 저장한다.
 * - [확정] AC-FN-SFR-031-05-6 첨부파일 중복 여부를 검증한다.
 * - [확정] AC-FN-SFR-031-05-7 다운로드는 권한에 따라 제한한다.
 * - [확정] AC-FN-SFR-031-05-8 HWP·Word·Excel·PPT는 다운로드 없이 미리보기를 제공한다.
 * - [확정] AC-FN-SFR-031-05-9 중복으로 판단된 파일의 처리 방식은 중복 안내 후 사용자가 선택한다 .
 * - [공통] AC-FN-SFR-031-05-10 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-031-05-11 첨부파일은 ECM 등 문서관리 저장소에 저장하고 권한에 따라 다운로드를 제한하며 HWP·Word·Excel·PPT는 다운로드 없이 미리보기를 제공하고 첨부 내용은 통합검색 대상에 포함한다.
 * - [공통] AC-FN-SFR-031-05-12 외부 시스템(국세청, 카드사, 은행 CMS, 세무회계사무소, e나라도움) 연계는 시스템 성능에 부하를 주지 않도록 처리하고 연계 실패 시 사용자에게 오류 메시지를 표시한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /attachments — 문서의 첨부파일 목록 조회 */
export async function listAttachments(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listAttachments>
  return crud();
  // </hole>
}

/** GET /attachments/{attachmentId}/download — 권한이 있는 경우 첨부파일 다운로드 */
export async function downloadAttachment(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole downloadAttachment>
  return crud();
  // </hole>
}
