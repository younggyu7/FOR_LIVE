import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '전표 및 장부 관리' (SFR-008) 화면. 업무: 전표 입력·관리, 전자세금계산서 관리, 전표 분개 라인 관리, 전표 반제 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
