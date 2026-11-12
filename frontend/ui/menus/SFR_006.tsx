import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '회계관리 기준정보' (SFR-006) 화면. 업무: 계정과목 관리, 거래처·계좌·카드·프로젝트 기준정보 관리, 계정별 초기이월 등록 및 마감, 엑셀 일괄 업로드
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
