// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-025-05 자산실사 처리 및 현황 조회 (TASK-221)
 *
 * - [확정] AC-FN-SFR-025-05-4 실사 처리는 기존 외부 자산실사 시스템과 연계한다.
 * - [확정] AC-FN-SFR-025-05-5 승인된 실사계획의 대상만 외부 시스템과 연계한다.
 * - [확정] AC-FN-SFR-025-05-6 실사 결과와 자산 현재 정보가 다르면 상시 자산변동 처리로 반영한다.
 * - [확정] AC-FN-SFR-025-05-7 연계는 시스템 성능에 부하를 주지 않도록 처리한다.
 * - [확정] AC-FN-SFR-025-05-8 조회는 권한 범위로 한정한다.
 * - [공통] AC-FN-SFR-025-05-9 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-025-05-10 외부 시스템(국세청, 카드사, 은행 CMS, 세무회계사무소, e나라도움) 연계는 시스템 성능에 부하를 주지 않도록 처리하고 연계 실패 시 사용자에게 오류 메시지를 표시한다.
 * - [공통] AC-FN-SFR-025-05-11 조회 화면은 필요한 항목에서 엑셀 다운로드를 제공하며 대상 데이터는 조회 권한 범위로 한정한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /asset-inspection-plans/{assetInspectionPlanId}/link — 승인된 실사계획의 대상을 외부 자산실사 시스템과 연계한다 */
export async function linkAssetInspectionPlan(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole linkAssetInspectionPlan>
  return crud();
  // </hole>
}

/** POST /asset-inspection-items/receive — 외부 자산실사 시스템이 실사 결과를 전송해 저장한다 */
export async function receiveAssetInspectionResults(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole receiveAssetInspectionResults>
  return crud();
  // </hole>
}
