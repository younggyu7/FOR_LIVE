import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '전자결재' (SFR-029) 화면. 업무: 결재양식 및 결재 프로세스 관리, 전자결재 문서 관리, 겸직 사용자 업무환경 및 결재 알림, 긴급결재 및 보안문서 설정, 결재 관련 알림 발송
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
