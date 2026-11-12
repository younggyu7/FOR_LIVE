import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '자금관리' (SFR-009) 화면. 업무: 자금과목 및 자금 손익 양식 설정, 고정자금 등록·관리, 자금수지계획 등록·관리, 자금일보 조회, 자금현황 조회, 차입금·대여금 명세서 전표처리 및 원장 조회
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
