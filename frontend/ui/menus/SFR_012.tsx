import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '인사정보 관리' (SFR-012) 화면. 업무: 임직원 관리, 인사정보 변경 신청 검토·승인, 기초 인적사항 등록·관리, 인사기록카드 상세정보 관리, 인사정보·인사기록카드 엑셀 업로드 후속 처리, 휴직·단축근무 신청 검토·승인
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
