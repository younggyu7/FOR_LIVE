import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '세무관리' (SFR-023) 화면. 업무: 원천세 신고 기준정보 설정 및 신고서 관리, 세무 신고서 관리, 소득 지급명세서·원천징수영수증 관리, 연말정산 항목 관리 및 자료 입력, 근로소득 원천징수부 및 영수증 관리, 연말정산 납부세액 분납 및 현황 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
