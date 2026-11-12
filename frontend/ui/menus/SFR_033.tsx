import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '자원예약관리' (SFR-033) 화면. 업무: 자원 예약 현황 조회, 자원 예약 관리, 자원 분류·목록 및 설정 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
