import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '예산편성 관리' (SFR-003) 화면. 업무: 본예산 관리, 예산조정 신청 및 마감, 예산 폐쇄기간 및 이월 관리
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
