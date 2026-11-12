import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '메신저' (SFR-036) 화면. 업무: 실시간 채팅 대화방 이용 및 개인 대화방 관리, 메시지·파일 실시간 송수신, 메신저 메시지 관리, 알림 관리, 그룹웨어·조직도 연계
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
