import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '전자결재 기안기' (SFR-030) 화면. 업무: 전자결재 문서 관리, 기존 문서 파일 기반 결재양식 편집·변환
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
