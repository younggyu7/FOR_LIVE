import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '자산관리' (SFR-025) 화면. 업무: 자산 정보 등록·관리, 자산 변동현황 등록·조회, 자산 QR·바코드 출력·관리, 자산실사 계획 관리, 자산 기초환경설정 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
