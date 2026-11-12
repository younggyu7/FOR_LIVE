import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '근태관리' (SFR-018) 화면. 업무: 근태 관리, 근태 설정 관리, 출퇴근 기록 관리, 근무시간 집계 및 현황 조회, 근태 확정 관리, 연차 설정 및 신청 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
