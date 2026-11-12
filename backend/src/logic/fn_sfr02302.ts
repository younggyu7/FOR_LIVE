// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-023-02 국세청 원천세 전자파일 신고 (TASK-059)
 *
 * - [확정] AC-FN-SFR-023-02-4 전자파일은 국세청 신고 규격에 맞춰 생성한다.
 * - [확정] AC-FN-SFR-023-02-5 전자신고 결과(접수 성공·실패)는 신고서에 기록한다.
 * - [확정] AC-FN-SFR-023-02-6 국세청 연계는 시스템 성능에 부하를 주지 않도록 처리한다.
 * - [공통] AC-FN-SFR-023-02-7 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 * - [공통] AC-FN-SFR-023-02-8 외부 시스템(국세청, 카드사, 은행 CMS, 세무회계사무소, e나라도움) 연계는 시스템 성능에 부하를 주지 않도록 처리하고 연계 실패 시 사용자에게 오류 메시지를 표시한다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /tax-filings/{taxFilingId}/submit — 신고서를 국세청 전자파일로 생성해 신고하고 접수 결과를 저장한다 */
export async function submitTaxFiling(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole submitTaxFiling>
  return crud();
  // </hole>
}
