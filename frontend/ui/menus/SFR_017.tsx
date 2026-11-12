import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '근태관리 기준정보' (SFR-017) 화면. 업무: 근태 기준정보 및 시간외근무 기준 관리, 근태항목 관리, 임직원별 근태 적용 설정, 출퇴근 체크 유형 설정, 시스템 접근 허용 IP 관리, 근태스케줄(연차계획·연차촉진·출퇴근 연동) 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
