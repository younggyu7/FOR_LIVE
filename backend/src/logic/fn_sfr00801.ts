// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-008-01 전표 입력·관리 (TASK-228)
 *
 * - [확정] AC-FN-SFR-008-01-5 전표의 계정과목·거래처·프로젝트·예산과목은 공통 기준정보만 사용한다.
 * - [확정] AC-FN-SFR-008-01-6 승인된 전표를 변경하려면 승인 해제 절차를 거쳐야 하며 변경 이력(일시·수정자·내용)을 남긴다.
 * - [확정] AC-FN-SFR-008-01-7 승인 해제는 승인된 전표에 대해서만 가능하다.
 * - [확정] AC-FN-SFR-008-01-8 증빙내역 일괄 변경은 선택한 전표 건에만 적용한다.
 * - [확정] AC-FN-SFR-008-01-9 마감된 기간의 전표는 마감 취소 전에는 수정할 수 없다.
 * - [확정] AC-FN-SFR-008-01-10 전표 승인 결과는 전자결재 연계 사용 시 결재 결과를 전표 상태에 반영한다.
 * - [확정] AC-FN-SFR-008-01-11 차변 합계와 대변 합계가 일치해야 전표를 저장할 수 있다.
 * - [공통] AC-FN-SFR-008-01-12 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-008-01-13 승인·마감·확정이 필요한 업무는 전자결재와 연계하며, 결재 결과(승인·반려 등)를 해당 업무 상태에 반영하고 결재 연계 사용 여부는 환경설정에 따른다.
 * - [공통] AC-FN-SFR-008-01-14 기안·신청 후 승인된 건은 임의 수정·삭제할 수 없으며 변경하려면 승인 취소·회수·마감 취소 등 정해진 절차를 거치고, 변경 이력(일시·수정자·내용)을 남긴다.
 * - [공통] AC-FN-SFR-008-01-15 급여·예산·근태 등 마감된 기간의 데이터는 마감 취소 전에는 수정할 수 없다.
 * - [공통] AC-FN-SFR-008-01-16 ERP 모듈 간 연계(예산 통제, 자동전표, 자산 등록, 급여 전표, 고정자산)는 동일한 프로젝트·예산과목·계정과목·거래처 기준정보를 사용한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /journal-entries/{journalEntryId} — 전표와 분개 내역을 조회한다 */
export async function getJournalEntry(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole getJournalEntry>
  return crud();
  // </hole>
}

/** PATCH /journal-entries/{journalEntryId} — 전표의 관리항목·적요·증빙내역을 수정한다 */
export async function updateJournalEntry(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole updateJournalEntry>
  return crud();
  // </hole>
}

/** POST /journal-entries/{journalEntryId}/cancel-approval — 승인된 전표의 승인을 해제한다 */
export async function cancelJournalEntryApproval(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole cancelJournalEntryApproval>
  return crud();
  // </hole>
}

/** PATCH /journal-entries/evidence-details — 선택한 전표들의 증빙내역을 일괄 변경한다 */
export async function updateJournalEntryEvidenceDetails(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole updateJournalEntryEvidenceDetails>
  return crud();
  // </hole>
}

/** GET /journal-entries/{journalEntryId}/print — 전표 출력물을 조회한다 */
export async function printJournalEntry(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole printJournalEntry>
  return crud();
  // </hole>
}
