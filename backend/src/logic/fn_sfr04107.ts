// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-041-07 웹 오피스 ECM 연계 통합 관리 (TASK-181)
 *
 * - [확정] AC-FN-SFR-041-07-4 연계 대상 ECM은 신규 구축이 아닌 기존 운영 중인 ECM이다.
 * - [확정] AC-FN-SFR-041-07-5 웹 오피스 작성 문서는 ECM과 연계되어 통합 관리된다.
 * - [확정] AC-FN-SFR-041-07-6 ECM 내 작성 문서, 공유 문서, 공유받은 문서를 조회·관리할 수 있다.
 * - [확정] AC-FN-SFR-041-07-7 ECM 연계 조회·관리 결과는 조회자의 사용 권한 범위로 한정한다.
 * - [확정] AC-FN-SFR-041-07-8 ECM 문서 내용은 통합검색 대상에 포함된다.
 * - [공통] AC-FN-SFR-041-07-9 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-041-07-10 첨부파일은 ECM 등 문서관리 저장소에 저장하고 권한에 따라 다운로드를 제한하며 HWP·Word·Excel·PPT는 다운로드 없이 미리보기를 제공하고 첨부 내용은 통합검색 대상에 포함한다.
 * - [공통] AC-FN-SFR-041-07-11 통합검색, 조직원 검색, 메시지 검색은 조회자의 권한 범위 안의 결과만 보여준다.
 * - [공통] AC-FN-SFR-041-07-12 외부 시스템(국세청, 카드사, 은행 CMS, 세무회계사무소, e나라도움) 연계는 시스템 성능에 부하를 주지 않도록 처리하고 연계 실패 시 사용자에게 오류 메시지를 표시한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /office-documents/{officeDocumentId}/link-ecm — 웹 오피스 문서를 기존 ECM에 연계 저장한다 */
export async function linkOfficeDocumentToEcm(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole linkOfficeDocumentToEcm>
  return crud();
  // </hole>
}

/** GET /ecm-documents — ECM의 작성·공유·공유받은 문서 목록을 조회한다 */
export async function listEcmDocuments(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listEcmDocuments>
  return crud();
  // </hole>
}
