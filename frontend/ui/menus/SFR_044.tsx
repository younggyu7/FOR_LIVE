import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 'AI 기반 업무 지원 기능' (SFR-044) 화면. 업무: AI 기안문 작성 지원 및 문구 추천, 예산·회계·인사 데이터 분석 및 질의응답
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
