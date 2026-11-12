import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '예산관리 기준정보' (SFR-002) 화면. 업무: 프로젝트 등록·관리, 하위사업 등록·관리, 예산과목 등록·관리, 거래처 등록·관리(일반·금융), 거래처 계좌 등록·관리, 신용카드 등록·관리, 기준정보 환경설정
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
