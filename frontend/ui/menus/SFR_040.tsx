import { DefaultMenuPage } from '../menu'
import type { MenuProps } from '../menu'

// 메뉴 '모바일 그룹웨어' (SFR-040) 화면. 업무: 임직원 관리, 모바일 메뉴 신규 건수 조회, 모바일 메일 작성·받은편지함 조회, 모바일 공지·게시글 조회, 모바일 일정·자원예약 조회, 모바일 결재문서 승인·반려, 전자결재 문서 관리, 모바일 통합검색
// 이 메뉴의 화면을 바꾸려면 이 파일을 고친다 (화면 작업 묶음). props.screens는 지금 업무의 화면들, props.screen은 주소가 가리키는 기능 화면.
export default function Menu(props: MenuProps) {
  return <DefaultMenuPage {...props} />
}
