import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '결산 및 재무제표 관리' (SFR-010) 화면. 업무: 결산자료 입력·관리, 계정과목 관리, 프로젝트 관리, 부가가치세 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
