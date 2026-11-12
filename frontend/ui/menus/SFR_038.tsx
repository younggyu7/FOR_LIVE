import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '시스템 통계' (SFR-038) 화면. 업무: 로그인 내역 통계 조회, 메뉴 사용 내역 조회, 서버 사용 용량 현황 조회, 메뉴별 사용 통계 시각화 조회
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
