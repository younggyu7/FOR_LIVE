import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '구매관리' (SFR-024) 화면. 업무: 품의서 관리, 구매품의 자산품목 관리 및 자산 등록 연계
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
