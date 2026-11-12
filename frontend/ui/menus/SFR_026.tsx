import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '그룹웨어 시스템 공통' (SFR-026) 화면. 업무: 메뉴 사용 권한 관리, 단일 포털 기반 통합 운영 및 시스템 설정 관리, 통합업무포털 구성 및 개인화, 첨부파일 문서 미리보기
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
