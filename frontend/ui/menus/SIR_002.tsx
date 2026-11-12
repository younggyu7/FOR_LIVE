import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '내부 시스템 연계시스템 인터페이스' (SIR-002) 화면. 업무: 내부 단위시스템 연계 인터페이스 표준 관리, 표준 연계 API 제공, 전자결재 양식 연동결재 지원
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
