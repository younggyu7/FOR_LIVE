// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-004-04 원인행위 등록 및 관리 (TASK-188)
 *
 * - [확정] AC-FN-SFR-004-04-4 원인행위는 프로젝트·예산과목 기준정보를 사용한다.
 * - [확정] AC-FN-SFR-004-04-5 원인행위 금액은 해당 예산과목의 예산잔액 범위를 기준으로 관리한다.
 * - [확정] AC-FN-SFR-004-04-6 승인·확정된 원인행위는 정해진 절차로만 변경하고 이력을 남긴다.
 * - [공통] AC-FN-SFR-004-04-7 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-004-04-8 기안·신청 후 승인된 건은 임의 수정·삭제할 수 없으며 변경하려면 승인 취소·회수·마감 취소 등 정해진 절차를 거치고, 변경 이력(일시·수정자·내용)을 남긴다.
 * - [공통] AC-FN-SFR-004-04-9 ERP 모듈 간 연계(예산 통제, 자동전표, 자산 등록, 급여 전표, 고정자산)는 동일한 프로젝트·예산과목·계정과목·거래처 기준정보를 사용한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /budget-commitments — 원인행위를 등록한다 */
export async function createBudgetCommitment(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole createBudgetCommitment>
  return crud();
  // </hole>
}

/** GET /budget-commitments — 원인행위 목록을 조회한다 */
export async function listBudgetCommitments(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole listBudgetCommitments>
  return crud();
  // </hole>
}

/** PUT /budget-commitments/{budgetCommitmentId} — 원인행위를 수정한다 */
export async function updateBudgetCommitment(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole updateBudgetCommitment>
  return crud();
  // </hole>
}

/** POST /budget-commitments/{budgetCommitmentId}/cancel — 원인행위를 취소한다 */
export async function cancelBudgetCommitment(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole cancelBudgetCommitment>
  return crud();
  // </hole>
}
