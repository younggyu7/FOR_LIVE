// 업무 로직 자리. // <hole> 안만 채운다 (사람이 고친다. 사람이 고친 파일은 다시 생성해도 덮어쓰지 않는다).
/**
 * FN-SFR-041-05 웹 오피스 문서 공유 및 권한 설정 (TASK-179)
 *
 * - [확정] AC-FN-SFR-041-05-5 문서는 쪽지 및 이메일로 공유할 수 있다.
 * - [확정] AC-FN-SFR-041-05-6 공유 시 사용자별로 열람 권한과 수정 권한을 구분하여 설정한다.
 * - [확정] AC-FN-SFR-041-05-7 수정 권한은 해당 문서를 수정할 수 있는 권한이며 열람 권한 없이는 수정 권한을 부여할 수 없다.
 * - [확정] AC-FN-SFR-041-05-8 공유받은 사용자는 부여된 권한 범위 내에서만 문서에 접근할 수 있다.
 * - [확정] AC-FN-SFR-041-05-9 공유 완료 시 공유받은 문서가 대상자의 공유 문서함에 반영된다.
 * - [확정] AC-FN-SFR-041-05-10 공유 대상은 그룹웨어 사용자로 한정한다.
 * - [공통] AC-FN-SFR-041-05-11 ERP와 그룹웨어의 메뉴·기능·데이터 접근은 통합 권한관리의 사용 권한에 따라 허용하며, 권한 없는 사용자는 해당 메뉴·데이터에 접근할 수 없다.
 */
import type { Ctx } from '../common/ctx';
import type { Data } from '../common/db';

/** POST /office-documents/{officeDocumentId}/share — 문서를 그룹웨어 사용자에게 쪽지 또는 이메일로 공유하고 사용자별 권한을 설정한다 */
export async function shareOfficeDocument(data: Data, ctx: Ctx, crud: () => Promise<unknown>): Promise<unknown> {
  // <hole shareOfficeDocument>
  return crud();
  // </hole>
}
