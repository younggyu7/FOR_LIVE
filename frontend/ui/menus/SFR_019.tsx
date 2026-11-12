import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '연차관리' (SFR-019) 화면. 업무: 연차 생성 기준 환경설정, 연차 관리, 연차조정 및 정산, 연차 변경이력 조회, 월별 연차계획·연차사용촉진 운영 및 현황 조회
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
