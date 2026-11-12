import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '그룹웨어 포털 공통' (SFR-027) 화면. 업무: 다중 업무 화면 전환, 포털 위젯 표시, 최근 사용 메뉴 이력 조회 및 이동, 포털 개인화 및 메뉴 구성 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
