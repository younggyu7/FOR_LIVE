// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-029-04 일괄기안·연속결재·재기안 (TASK-151)
 *
 * - [확정] AC-FN-SFR-029-04-3 일괄기안은 선택한 여러 문서를 각각 별도 결재문서로 기안한다.
 * - [확정] AC-FN-SFR-029-04-4 연속결재는 결재자에게 결재대기 문서를 연속으로 열어 처리하게 한다.
 * - [확정] AC-FN-SFR-029-04-5 재기안은 기작성 문서의 내용을 불러와 새 문서로 기안한다.
 * - [공통] AC-FN-SFR-029-04-6 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-029-04-7 기안·신청 후 승인된 건은 임의 수정·삭제할 수 없으며 변경하려면 승인 취소·회수·마감 취소 등 정해진 절차를 거치고, 변경 이력(일시·수정자·내용)을 남긴다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /approval-documents — 전자결재 문서를 기안한다 */
export async function createApprovalDocument(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createApprovalDocument>
  return crud();
  // </hole>
}

/** POST /approval-documents/batch-draft — 선택한 여러 문서를 각각 별도 결재문서로 일괄 기안한다 */
export async function batchDraftApprovalDocuments(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole batchDraftApprovalDocuments>
  return crud();
  // </hole>
}

/** POST /approval-documents/{approvalDocumentId}/redraft — 기작성 문서를 기반으로 새 문서로 재기안한다 */
export async function redraftApprovalDocument(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole redraftApprovalDocument>
  return crud();
  // </hole>
}
