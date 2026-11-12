// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-022-01 사회보험 취득·상실 대상자 등록 및 신고서 관리 (TASK-143)
 *
 * - [확정] AC-FN-SFR-022-01-5 취득·상실 대상자는 인사기록카드에 등록된 임직원 중에서 등록한다.
 * - [확정] AC-FN-SFR-022-01-6 신고서는 시스템 내에서 작성·출력하고 이력을 관리하는 범위로 한정하며 4대보험 기관(EDI 등)으로의 전자 신고 연계는 하지 않는다.
 * - [확정] AC-FN-SFR-022-01-7 신고서에 포함되는 주민번호 등 고유식별정보는 암호화하여 저장한다.
 * - [확정] AC-FN-SFR-022-01-8 신고서 작성 시 대상자 인사정보를 자동 반영한다.
 * - [확정] AC-FN-SFR-022-01-9 상실 사유는 자격상실 신고에서만 입력한다.
 * - [공통] AC-FN-SFR-022-01-10 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-022-01-11 인사·급여·주민번호 등 개인정보와 고유식별정보는 암호화 저장하며, 개인정보 열람·접근 이력을 기록하고 조회 화면을 제공한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /social-insurance-enrollments — 사회보험 취득·상실 대상자를 등록한다 */
export async function createSocialInsuranceEnrollment(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createSocialInsuranceEnrollment>
  return crud();
  // </hole>
}

/** GET /social-insurance-enrollments — 취득·상실 대상자 목록을 조회한다 */
export async function listSocialInsuranceEnrollments(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listSocialInsuranceEnrollments>
  return crud();
  // </hole>
}

/** POST /social-insurance-reports — 사회보험 신고서를 생성한다 */
export async function createSocialInsuranceReport(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createSocialInsuranceReport>
  return crud();
  // </hole>
}

/** GET /social-insurance-reports — 신고서 이력을 조회한다 */
export async function listSocialInsuranceReports(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listSocialInsuranceReports>
  return crud();
  // </hole>
}

/** POST /social-insurance-reports/{socialInsuranceReportId}/print — 신고서를 출력 처리한다 */
export async function printSocialInsuranceReport(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole printSocialInsuranceReport>
  return crud();
  // </hole>
}
