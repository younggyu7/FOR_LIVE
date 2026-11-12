// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-006-04 계정별 초기이월 등록 및 마감 (TASK-190)
 *
 * - [확정] AC-FN-SFR-006-04-5 이월내역은 계정과목별로 등록하고 마감할 수 있다.
 * - [확정] AC-FN-SFR-006-04-6 마감된 이월내역은 마감 취소 전에는 수정할 수 없다.
 * - [확정] AC-FN-SFR-006-04-7 대상 정보의 엑셀 일괄 업로드는 공통 기능 S2를 사용하며 이 기능에서 다시 정의하지 않는다.
 * - [확정] AC-FN-SFR-006-04-8 이월내역은 동일한 계정과목·거래처·프로젝트 기준정보를 사용한다.
 * - [공통] AC-FN-SFR-006-04-9 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-006-04-10 급여·예산·근태 등 마감된 기간의 데이터는 마감 취소 전에는 수정할 수 없다.
 * - [공통] AC-FN-SFR-006-04-11 ERP 모듈 간 연계(예산 통제, 자동전표, 자산 등록, 급여 전표, 고정자산)는 동일한 프로젝트·예산과목·계정과목·거래처 기준정보를 사용한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** GET /account-carryovers — 계정별 이월내역 목록을 조회한다 */
export async function listAccountCarryovers(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listAccountCarryovers>
  return crud();
  // </hole>
}

/** POST /account-carryovers — 계정별 이월내역을 등록한다 */
export async function createAccountCarryover(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createAccountCarryover>
  return crud();
  // </hole>
}

/** PUT /account-carryovers/{accountCarryoverId} — 계정별 이월내역을 수정한다 */
export async function updateAccountCarryover(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole updateAccountCarryover>
  return crud();
  // </hole>
}

/** DELETE /account-carryovers/{accountCarryoverId} — 계정별 이월내역을 삭제한다 */
export async function deleteAccountCarryover(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole deleteAccountCarryover>
  return crud();
  // </hole>
}

/** POST /account-carryovers/{accountCarryoverId}/close — 이월내역을 마감한다 */
export async function closeAccountCarryover(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole closeAccountCarryover>
  return crud();
  // </hole>
}

/** POST /account-carryovers/{accountCarryoverId}/cancel-close — 이월내역 마감을 취소한다 */
export async function cancelCloseAccountCarryover(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole cancelCloseAccountCarryover>
  return crud();
  // </hole>
}
