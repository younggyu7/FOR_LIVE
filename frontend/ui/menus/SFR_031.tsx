import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '전자결재 문서관리' (SFR-031) 화면. 업무: 결재문서 공통관리 설정, 전자결재 문서 인수인계, 문서 수정이력 관리, 첨부파일 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
