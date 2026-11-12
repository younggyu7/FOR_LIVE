import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '급여관리' (SFR-021) 화면. 업무: 급여 관리, 책정임금 일괄 변경 및 현황 조회, 일용직 사원 및 급여정보 관리, 퇴직금 산정 관리, 급여 시뮬레이션, 급여 지급일 등록 및 급여 대상 관리, 연말정산용 연간 급여 일괄 입력, 급여 전표처리, 호봉테이블 및 임직원 호봉 현황 관리, 일용직 급여 일괄 입력 및 이체 현황 조회, 일용근로소득 지급명세서·원천징수영수증 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
