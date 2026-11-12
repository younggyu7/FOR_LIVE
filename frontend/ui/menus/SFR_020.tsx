import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '급여관리 기준정보' (SFR-020) 화면. 업무: 급여 기초코드 관리, 급여 기준 및 계정과목 설정
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
