import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '온라인 도움말' (SIR-003) 화면. 업무: 사용자 기능 온라인 도움말 조회, 오류 에러 메시지 표시
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
