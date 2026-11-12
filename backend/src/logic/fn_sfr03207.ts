// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-032-07 개인 연말정산 자료 입력 및 관리 (TASK-159)
 *
 * - [확정] AC-FN-SFR-032-07-4 본인의 연말정산 자료만 입력·수정할 수 있다
 * - [확정] AC-FN-SFR-032-07-5 입력 기간이 종료되었거나 급여 담당자가 마감한 자료는 마감 취소 전에는 수정할 수 없다
 * - [확정] AC-FN-SFR-032-07-6 제출 완료 자료의 변경은 정해진 절차를 거치며 변경 이력을 남긴다
 * - [확정] AC-FN-SFR-032-07-7 주민번호 등 고유식별정보는 암호화 저장한다
 * - [확정] AC-FN-SFR-032-07-8 증빙 첨부파일은 문서관리 저장소에 저장하고 권한에 따라 다운로드를 제한한다
 * - [공통] AC-FN-SFR-032-07-9 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-032-07-10 첨부파일은 ECM 등 문서관리 저장소에 저장하고 권한에 따라 다운로드를 제한하며 HWP·Word·Excel·PPT는 다운로드 없이 미리보기를 제공하고 첨부 내용은 통합검색 대상에 포함한다.
 * - [공통] AC-FN-SFR-032-07-11 인사·급여·주민번호 등 개인정보와 고유식별정보는 암호화 저장하며, 개인정보 열람·접근 이력을 기록하고 조회 화면을 제공한다.
 * - [공통] AC-FN-SFR-032-07-12 기안·신청 후 승인된 건은 임의 수정·삭제할 수 없으며 변경하려면 승인 취소·회수·마감 취소 등 정해진 절차를 거치고, 변경 이력(일시·수정자·내용)을 남긴다.
 * - [공통] AC-FN-SFR-032-07-13 급여·예산·근태 등 마감된 기간의 데이터는 마감 취소 전에는 수정할 수 없다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /year-end-data — 본인의 연말정산 자료를 조회한다 */
export async function listYearEndData(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listYearEndData>
  return crud();
  // </hole>
}

/** PATCH /year-end-data/{yearEndDataId} — 본인의 연말정산 자료를 수정한다 */
export async function updateYearEndData2(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole updateYearEndData2>
  return crud();
  // </hole>
}

/** POST /year-end-data/{yearEndDataId}/submit — 연말정산 자료를 제출한다 */
export async function submitYearEndData(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole submitYearEndData>
  return crud();
  // </hole>
}
