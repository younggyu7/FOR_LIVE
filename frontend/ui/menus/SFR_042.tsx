import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '커스터마이징 개발' (SFR-042) 화면. 업무: 수수료 단가 관리, 심사수수료·재발급 수수료 등록
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
