import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '시스템 구성 요구사항' (SFR-001) 화면. 업무: 통합 사용 권한 관리, RFID 기반 자산 관리, e나라도움 연동, 메뉴 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
