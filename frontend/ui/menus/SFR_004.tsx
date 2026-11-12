import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '예산집행 관리' (SFR-004) 화면. 업무: 품의서 입력 및 승인, 결의서 관리, 원인행위 등록 및 관리, 자금집행 정보 및 전표 관리, 은행계좌 대체 및 대체결의 처리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
