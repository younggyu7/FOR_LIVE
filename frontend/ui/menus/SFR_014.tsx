import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '인사보고서 관리' (SFR-014) 화면. 업무: 인사기록카드 관리, 인사기록 현황 조회
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
