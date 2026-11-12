import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '자동전표처리' (SFR-007) 화면. 업무: 자동전표 증빙항목 및 자료수집·자동분개 설정, 전자세금계산서 수집·대사 검증 및 결의서 작성, 은행계좌 거래내역 조회·자동전표 및 반제 처리, 카드 승인내역 및 현금영수증 결의서 작성
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
