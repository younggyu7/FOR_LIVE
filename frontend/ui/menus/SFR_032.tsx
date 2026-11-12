import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '임직원 업무 관리' (SFR-032) 화면. 업무: 본인 인사정보 조회, 증명서 신청 및 발급, 근태 관리, 월별 연차계획 작성 및 연차촉진 확인, 급여명세서 및 퇴직금 시뮬레이션 조회, 개인 연말정산 자료 입력 및 관리, 지출품의서 작성 및 결재 연계, 결의서 관리, 예산정보 조회 및 예산 통제, ERP 연계 예산 반영 및 자동전표 처리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
