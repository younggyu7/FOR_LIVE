import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '사회보험 관리' (SFR-022) 화면. 업무: 사회보험 취득·상실 대상자 등록 및 신고서 관리, 사회보험 보수총액·고용산재·이직확인·근로내용확인 신고서 관리, 사회보험 공제내역서 관리, 사회보험 등급 변경 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
