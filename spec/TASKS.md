# TASKS — 작업 목록

> 프로젝트: **회사1** · 설계 버전: **v3.1.1** · spec-format v2  
> 개발 AI에게 줄 작업 순서다. 작업 하나 = 기능 하나. 읽는 순서와 작업 규칙은 `AGENTS.md`.

## 1. 진행 규칙

- 1차(MVP): 근거 요구사항에 MUST(또는 우선순위 근거 없음)가 있는 기능. 2차: 모두 SHOULD·COULD인 기능.
- 선행 작업이 끝난 뒤 시작한다. 같은 단계 안에서는 부모 테이블을 쓰는 작업이 먼저다.
- '일부 보류'는 고객 답을 기다리는 규칙만 `TODO(질문 ID)`로 두고 나머지를 구현한다.

## 2. 작업 목록

| 작업 | 이름 | 단계 | 선행 작업 | 상태 |
|---|---|---|---|---|
| TASK-001 | 프로젝트 뼈대 | 1차 | - | 진행 가능 |
| TASK-002 | DB 생성 | 1차 | TASK-001 | 진행 가능 |
| TASK-003 | 인증·권한 | 1차 | TASK-002 | 진행 가능 |
| TASK-004 | 공통 규칙·코드값 | 1차 | TASK-002 | 진행 가능 |
| TASK-005 | 계정과목·관련계정·관리항목 관리 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-006 | 재무제표 양식·자동분개 유형 설정 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-007 | 증명서 양식 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-008 | 증명서별 채번 관리 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-009 | 연차 생성 기준 환경설정 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-010 | 단일 포털 기반 통합 운영 및 시스템 설정 관리 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-011 | 다중 업무 화면 전환 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-012 | 결재양식 및 결재 프로세스 관리 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-013 | 기존 문서 파일 기반 결재양식 편집·변환 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-014 | 결재문서 공통관리 설정 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-015 | 서버 사용 용량 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-016 | 오류 에러 메시지 표시 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-017 | ERP 업무 모듈 이용 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-018 | 예산과목 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-005 | 진행 가능 |
| TASK-019 | 임직원 인사정보 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-020 | 그룹웨어·조직도 연계 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-021 | 2차 인증 로그인 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-022 | 심사현황 조회 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-023 | 재발급 내역현황·집계 조회 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-024 | 통합 사용 권한 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-010 | 진행 가능 |
| TASK-025 | 그룹웨어 통합 업무 환경 이용 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-026 | 신용카드 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-027 | 기준정보 환경설정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-028 | 자금과목 및 자금 손익 양식 설정 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-029 | 자금일보 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-030 | 인사정보 변경 신청 검토·승인 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-031 | 인사정보 일괄 변경 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-032 | 기초 인적사항 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-033 | 인사정보·인사기록카드 엑셀 업로드 후속 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-034 | 인사정보 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-010 | 진행 가능 |
| TASK-035 | 인사기록 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-010 | 진행 가능 |
| TASK-036 | 고과 및 상벌현황 조회 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-037 | 근태 기준정보 및 시간외근무 기준 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-038 | 근태항목 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-039 | 임직원별 근태 적용 설정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-040 | 출퇴근 체크 유형 설정 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-041 | 시스템 접근 허용 IP 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-042 | 출퇴근 기록 및 연동 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-043 | 연차 생성 및 확정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-044 | 연차 변경이력 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-009 | 진행 가능 |
| TASK-045 | 급여 기초코드 및 세금 코드 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-046 | 급여 기준 및 계정과목 설정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-047 | 급여 계산·과세 집계 및 마감 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-048 | 책정임금 일괄 변경 및 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-049 | 일용직 사원 및 급여정보 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-050 | 퇴직기준 설정 및 퇴직금 산정·추계액 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-051 | 급여 시뮬레이션 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-052 | 연말정산용 연간 급여 일괄 입력 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-053 | 호봉테이블 및 임직원 호봉 현황 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-054 | 일용근로소득 지급명세서·원천징수영수증 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-055 | 퇴직금 산정 현황 및 퇴직소득 원천징수영수증 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-049 | 진행 가능 |
| TASK-056 | 급여통계 및 급여분석 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-057 | 사회보험 등급 변경 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-058 | 원천세 신고 기준정보 설정 및 신고서 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-059 | 국세청 원천세 전자파일 신고 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-060 | 지방세 전자신고 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-061 | 일용근로소득 지급명세서 및 영수증 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-062 | 퇴직소득 원천징수영수증 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-049 | 진행 가능 |
| TASK-063 | 근로소득 원천징수부 및 영수증 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-049 | 진행 가능 |
| TASK-064 | 소득자료 제출집계표 및 지급명세서 전산매체 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-049 | 진행 가능 |
| TASK-065 | 간이지급명세서 작성 및 전자신고 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-066 | 통합 사용 권한 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010 | 진행 가능 |
| TASK-067 | 그룹웨어 통합검색 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012 | 진행 가능 |
| TASK-068 | 통합업무포털 구성 및 개인화 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-069 | 첨부파일 문서 미리보기 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-070 | 포털 위젯 표시 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-010 | 진행 가능 |
| TASK-071 | 최근 사용 메뉴 이력 조회 및 이동 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-072 | 포털 개인화 및 메뉴 구성 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-073 | 알림 및 @멘션 통합 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-074 | 알림 바로가기 및 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-075 | 알림 읽음 처리 및 상태 표시 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-076 | 결재 처리 및 문서 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-077 | 겸직 사용자 업무환경 및 결재 알림 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-078 | 문서번호 자동 채번 | 1차 | TASK-002, TASK-003, TASK-012, TASK-017, TASK-014 | 진행 가능 |
| TASK-079 | 긴급결재 및 보안문서 설정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-080 | 결재 관련 알림 발송 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-081 | 결재문서 작성 및 서명 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-082 | 웹 기안기 결재 상신 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-083 | 문서 수정이력 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-084 | 첨부파일 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-085 | 본인 인사정보 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-010 | 진행 가능 |
| TASK-086 | 급여명세서 및 퇴직금 시뮬레이션 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-087 | 그룹웨어 모듈 이벤트 실시간 알림 및 바로가기 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010 | 진행 가능 |
| TASK-088 | 게시판 게시물 메신저 알림 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-089 | 인증 대상·허용 인증기기 수 설정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-010 | 진행 가능 |
| TASK-090 | 인증기기 승인·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-010 | 진행 가능 |
| TASK-091 | 로그인 내역 통계 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-092 | 메뉴 사용 내역 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-093 | 메뉴별 사용 통계 시각화 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-094 | 그룹웨어 정보 통합검색 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012, TASK-014 | 진행 가능 |
| TASK-095 | 조직원 검색 및 활동 내역 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-010, TASK-012 | 진행 가능 |
| TASK-096 | 모바일 로그인·로그아웃 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-097 | 모바일 공지·게시글 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010 | 진행 가능 |
| TASK-098 | 모바일 조직도 조회·검색 | 1차 | TASK-002, TASK-003, TASK-004, TASK-010 | 진행 가능 |
| TASK-099 | 모바일 상신 문서 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012 | 진행 가능 |
| TASK-100 | 모바일 통합검색 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012 | 진행 가능 |
| TASK-101 | 웹 오피스 문서 작성 및 편집 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-102 | 한글·Word 양식 문서 변환 및 편집 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-101 | 진행 가능 |
| TASK-103 | 심사수수료·재발급 수수료 단가 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-104 | 심사수수료·재발급 수수료 등록 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-105 | AI 문서 유형 자동 분류 및 담당 부서 자동 배분 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-106 | AI 기안문 작성 지원 및 문구 추천 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-107 | 개인정보 열람 이력 통계 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-108 | 내부 단위시스템 연계 인터페이스 표준 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010 | 진행 가능 |
| TASK-109 | 표준 연계 API 제공 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-110 | 전자결재 양식 연동결재 지원 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-111 | 사용자 기능 온라인 도움말 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-112 | 프로젝트 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017 | 진행 가능 |
| TASK-113 | 거래처 등록·관리(일반·금융) | 1차 | TASK-002, TASK-003, TASK-004, TASK-027 | 진행 가능 |
| TASK-114 | 본예산 신청 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-018, TASK-017 | 진행 가능 |
| TASK-115 | 본예산 마감·승인 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-018, TASK-017 | 진행 가능 |
| TASK-116 | 예산조정 신청 및 마감 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-018 | 진행 가능 |
| TASK-117 | 품의서 입력 및 승인 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-018, TASK-017, TASK-029 | 진행 가능 |
| TASK-118 | 거래처·계좌·카드·프로젝트 기준정보 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017 | 진행 가능 |
| TASK-119 | 자동전표 증빙항목 및 자료수집·자동분개 설정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027 | 진행 가능 |
| TASK-120 | 결산자료 입력·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-121 | 인사기록카드 상세정보 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-029 | 진행 가능 |
| TASK-122 | 휴직·단축근무 신청 검토·승인 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-012 | 진행 가능 |
| TASK-123 | 인사발령 신청 검토·승인 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-010, TASK-012 | 진행 가능 |
| TASK-124 | 인사발령 대상자 등록 및 발령상태 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-029 | 진행 가능 |
| TASK-125 | 인사발령 처리 및 발령공고 자동 게시 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-029 | 진행 가능 |
| TASK-126 | 인사발령 이력·현황 조회 및 보고서 생성 | 1차 | TASK-002, TASK-003, TASK-004, TASK-010, TASK-029 | 진행 가능 |
| TASK-127 | 임직원 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-010, TASK-029 | 진행 가능 |
| TASK-128 | 교육과정 및 대상자 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-129 | 교육신청 및 승인 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-012, TASK-128 | 진행 가능 |
| TASK-130 | 증명서 신청 검토·승인 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-012 | 진행 가능 |
| TASK-131 | 증명서 관리대장 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-029 | 진행 가능 |
| TASK-132 | 근태스케줄(연차계획·연차촉진·출퇴근 연동) 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-038, TASK-029, TASK-030 | 진행 가능 |
| TASK-133 | 근태 신청 및 결재 연계 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-029 | 진행 가능 |
| TASK-134 | 근태 설정 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-029 | 진행 가능 |
| TASK-135 | 근태 조정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-029 | 진행 가능 |
| TASK-136 | 근태 현황 및 집계 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-029 | 진행 가능 |
| TASK-137 | 근무시간 집계 및 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-029 | 진행 가능 |
| TASK-138 | 근태 확정 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-139 | 연차조정 및 정산 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-009 | 진행 가능 |
| TASK-140 | 월별 연차계획·연차사용촉진 운영 및 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-012, TASK-009 | 진행 가능 |
| TASK-141 | 사회보험 코드·환경 및 공제항목 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-012 | 진행 가능 |
| TASK-142 | 급여대장·급여명세·급여현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-141 | 진행 가능 |
| TASK-143 | 사회보험 취득·상실 대상자 등록 및 신고서 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014 | 진행 가능 |
| TASK-144 | 사회보험 보수총액·고용산재·이직확인·근로내용확인 신고서 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-143 | 진행 가능 |
| TASK-145 | 사회보험 공제내역서 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-141 | 진행 가능 |
| TASK-146 | 연말정산 항목 관리 및 자료 입력 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-067 | 진행 가능 |
| TASK-147 | 연말정산 납부세액 분납 및 현황 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-148 | 구매품의서 작성 및 예산 통제 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-018, TASK-017, TASK-029 | 진행 가능 |
| TASK-149 | 구매품의 조회 및 승인 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005, TASK-012 | 진행 가능 |
| TASK-150 | 메뉴별 알림 연계 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012 | 진행 가능 |
| TASK-151 | 일괄기안·연속결재·재기안 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-152 | 한글웹기안기 웹기안 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-153 | 전자결재 문서 인수인계 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012 | 진행 가능 |
| TASK-154 | 완료문서 보관 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-014 | 진행 가능 |
| TASK-155 | 증명서 신청 및 발급 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-012 | 진행 가능 |
| TASK-156 | 근태신청 및 근무변경 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-029 | 진행 가능 |
| TASK-157 | 근무시간 동의 및 근태집계 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-029 | 진행 가능 |
| TASK-158 | 월별 연차계획 작성 및 연차촉진 확인 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-009 | 진행 가능 |
| TASK-159 | 개인 연말정산 자료 입력 및 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-146 | 진행 가능 |
| TASK-160 | 지출품의서 작성 및 결재 연계 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005, TASK-012 | 진행 가능 |
| TASK-161 | 자원 예약 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-014 | 진행 가능 |
| TASK-162 | 자원 예약 등록 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-161, TASK-014 | 진행 가능 |
| TASK-163 | 자원 분류·목록 및 설정 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-014 | 진행 가능 |
| TASK-164 | 자원 예약 승인 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-161 | 진행 가능 |
| TASK-165 | 자원 예약 알림 발송 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-161 | 진행 가능 |
| TASK-166 | 공지·게시물 등록 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010 | 진행 가능 |
| TASK-167 | 공지·게시물 열람자 확인 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-168 | 공지·게시물 분류별·최근 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-169 | 설문조사 등록 및 공개·대상·알림 설정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-170 | 실시간 채팅 대화방 이용 및 개인 대화방 관리 | 1차 | TASK-002, TASK-003, TASK-004 | 진행 가능 |
| TASK-171 | 알림 이력 조회 및 메신저 메시지 통합 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-170 | 진행 가능 |
| TASK-172 | 메신저 메시지 검색 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-170 | 진행 가능 |
| TASK-173 | 메신저 데이터 서버 통합 저장 및 단말기 변경 시 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-170 | 진행 가능 |
| TASK-174 | 모바일 메뉴 신규 건수 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-012 | 진행 가능 |
| TASK-175 | 모바일 메일 작성·받은편지함 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010 | 진행 가능 |
| TASK-176 | 모바일 일정·자원예약 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-161 | 진행 가능 |
| TASK-177 | 모바일 결재문서 승인·반려 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012 | 진행 가능 |
| TASK-178 | 모바일 문서함 완료문서 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-179 | 웹 오피스 문서 공유 및 권한 설정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-170, TASK-017, TASK-101 | 진행 가능 |
| TASK-180 | 내 문서함 및 공유 문서함 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-101 | 진행 가능 |
| TASK-181 | 웹 오피스 ECM 연계 통합 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-101 | 진행 가능 |
| TASK-182 | 하위사업 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-017, TASK-014 | 진행 가능 |
| TASK-183 | 거래처 계좌 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-113 | 진행 가능 |
| TASK-184 | 실행예산 편성·신청 및 마감 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-114 | 진행 가능 |
| TASK-185 | 예산 폐쇄기간 및 이월 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005, TASK-117, TASK-113, TASK-029 | 진행 가능 |
| TASK-186 | 결의서 입력 및 승인 | 1차 | TASK-002, TASK-003, TASK-004, TASK-117, TASK-027, TASK-018, TASK-113, TASK-014, TASK-029 | 진행 가능 |
| TASK-187 | 품의·결의 정보 조회 및 승인 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-027, TASK-018, TASK-113, TASK-014 | 진행 가능 |
| TASK-188 | 원인행위 등록 및 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005 | 진행 가능 |
| TASK-189 | 수입·지출 등록 및 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-005, TASK-117, TASK-029 | 진행 가능 |
| TASK-190 | 계정별 초기이월 등록 및 마감 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027 | 진행 가능 |
| TASK-191 | 엑셀 일괄 업로드 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-027, TASK-029, TASK-005, TASK-009 | 진행 가능 |
| TASK-192 | 고정자금 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005 | 진행 가능 |
| TASK-193 | 자금수지계획 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-005, TASK-113, TASK-027, TASK-018 | 진행 가능 |
| TASK-194 | 교육평가 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-128, TASK-017 | 진행 가능 |
| TASK-195 | 교육현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-128, TASK-029 | 진행 가능 |
| TASK-196 | 연차 설정 및 신청 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-009 | 진행 가능 |
| TASK-197 | 출장 및 외근 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017 | 진행 가능 |
| TASK-198 | 연차 발생 및 사용 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-029 | 진행 가능 |
| TASK-199 | 연차 총괄현황 및 월별 사용 연차 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-029, TASK-009 | 진행 가능 |
| TASK-200 | 일용직 급여 일괄 입력 및 이체 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-113 | 진행 가능 |
| TASK-201 | 자산 정보 등록·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113 | 진행 가능 |
| TASK-202 | 자산실사 계획 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-027, TASK-005, TASK-113 | 진행 가능 |
| TASK-203 | 자산 기초환경설정 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113 | 진행 가능 |
| TASK-204 | 예산정보 조회 및 예산 통제 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005, TASK-114, TASK-029, TASK-113 | 진행 가능 |
| TASK-205 | 지출결의서 작성 및 결재 연계 | 1차 | TASK-002, TASK-003, TASK-004, TASK-117, TASK-027, TASK-018, TASK-113, TASK-014, TASK-029 | 진행 가능 |
| TASK-206 | 설문항목 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017 | 진행 가능 |
| TASK-207 | 메시지·파일 실시간 송수신 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-170 | 진행 가능 |
| TASK-208 | 쪽지·파일 일괄 전송 | 1차 | TASK-002, TASK-003, TASK-004, TASK-170 | 진행 가능 |
| TASK-209 | RFID 기반 자산 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113 | 진행 가능 |
| TASK-210 | e나라도움 연동 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-185 | 진행 가능 |
| TASK-211 | 자금집행 정보 및 전표 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-185 | 진행 가능 |
| TASK-212 | 은행계좌 대체 및 대체결의 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-113, TASK-185, TASK-017 | 진행 가능 |
| TASK-213 | 결의서 현황 및 예실 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-014, TASK-005, TASK-029, TASK-113 | 진행 가능 |
| TASK-214 | 세무회계사무소 연계 자료 변환 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-185 | 진행 가능 |
| TASK-215 | 자금현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-185, TASK-028 | 진행 가능 |
| TASK-216 | 고정자산 정보 등록·수정 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017 | 진행 가능 |
| TASK-217 | 고정자산 현황·명세 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-113 | 진행 가능 |
| TASK-218 | 구매품의 자산품목 관리 및 자산 등록 연계 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-029 | 진행 가능 |
| TASK-219 | 자산 변동현황 등록·조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-027, TASK-005, TASK-113 | 진행 가능 |
| TASK-220 | 자산 QR·바코드 출력·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113 | 진행 가능 |
| TASK-221 | 자산실사 처리 및 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113, TASK-029 | 진행 가능 |
| TASK-222 | ERP 연계 예산 반영 및 자동전표 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-114, TASK-117, TASK-029 | 진행 가능 |
| TASK-223 | 설문 응답 입력 | 1차 | TASK-002, TASK-003, TASK-004, TASK-169, TASK-017, TASK-206 | 진행 가능 |
| TASK-224 | 예산·회계·인사 데이터 분석 및 질의응답 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-114, TASK-185 | 진행 가능 |
| TASK-225 | 예산장부 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-014, TASK-005, TASK-114, TASK-117, TASK-029 | 진행 가능 |
| TASK-226 | 전자세금계산서 수집·대사 검증 및 결의서 작성 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-117, TASK-018, TASK-014, TASK-029, TASK-017 | 진행 가능 |
| TASK-227 | 카드 승인내역 및 현금영수증 결의서 작성 | 1차 | TASK-002, TASK-003, TASK-004, TASK-117, TASK-027, TASK-018, TASK-113, TASK-014, TASK-029, TASK-017 | 진행 가능 |
| TASK-228 | 전표 입력·관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-185, TASK-005, TASK-113, TASK-027, TASK-018 | 진행 가능 |
| TASK-229 | 전자세금계산서 발행 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-017, TASK-185, TASK-210 | 진행 가능 |
| TASK-230 | 전자세금계산서 검증·전표처리·현황조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-185 | 진행 가능 |
| TASK-231 | 세금계산서 발행여부 일괄 변경 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-113, TASK-185, TASK-210 | 진행 가능 |
| TASK-232 | 거래처별 장부 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-210, TASK-018 | 진행 가능 |
| TASK-233 | 차입금·대여금 명세서 전표처리 및 원장 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-185 | 진행 가능 |
| TASK-234 | 주요 재무제표 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-185, TASK-113, TASK-027, TASK-018, TASK-014 | 진행 가능 |
| TASK-235 | 관리용 재무상태표 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-185, TASK-113, TASK-018 | 진행 가능 |
| TASK-236 | 관리용 손익계산서 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-185, TASK-113, TASK-018 | 진행 가능 |
| TASK-237 | 관리용 원가보고서 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-185, TASK-113, TASK-018 | 진행 가능 |
| TASK-238 | 부가가치세 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-185 | 진행 가능 |
| TASK-239 | 급여이체 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-113, TASK-210 | 진행 가능 |
| TASK-240 | 급여명세서 발송 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-210 | 진행 가능 |
| TASK-241 | 급여 지급일 등록 및 급여 대상 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-210 | 진행 가능 |
| TASK-242 | 급여 전표처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-185, TASK-017 | 진행 가능 |
| TASK-243 | 지출결의 및 증빙자료 현황 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-027, TASK-018, TASK-029, TASK-113, TASK-014, TASK-210 | 진행 가능 |
| TASK-244 | 외부 금융·결재 시스템 API 연계 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-012, TASK-017, TASK-117, TASK-018, TASK-014, TASK-210 | 진행 가능 |
| TASK-245 | 은행계좌 거래내역 조회·자동전표 및 반제 처리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-185, TASK-017, TASK-225 | 진행 가능 |
| TASK-246 | 계정별 장부 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-185, TASK-113, TASK-027, TASK-018 | 진행 가능 |
| TASK-247 | 관리항목별 장부 조회 | 1차 | TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-018, TASK-029, TASK-210, TASK-113 | 진행 가능 |
| TASK-248 | 채권·채무 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-210, TASK-018, TASK-017 | 진행 가능 |
| TASK-249 | 전표 반제 관리 | 1차 | TASK-002, TASK-003, TASK-004, TASK-027, TASK-210, TASK-018, TASK-017 | 진행 가능 |

## 3. 작업 상세

### TASK-001 · 프로젝트 뼈대 (1차)

- 근거: ARCHITECTURE.md 2절, API.md 1절
- 선행 작업: 없음
- 만들 것: 기술 스택 TypeScript · NestJS · PostgreSQL 16 · Next.js 14 · React 18 · TypeScript (확정 — 기능 명세에서 고름 TQ-001)으로 프로젝트 생성; 공통 오류 응답 `{code, message}`·설정 파일·테스트 실행 환경
- 완료 기준: 빌드와 빈 테스트 실행 성공
- 상태: 진행 가능

### TASK-002 · DB 생성 (1차)

- 근거: DATABASE.md
- 선행 작업: TASK-001
- 만들 것: `schema.sql` 적용 (테이블 167개); 마이그레이션 도구에 등록
- 완료 기준: `DATABASE.md` 4절 업무 제약이 실제로 막는지 테스트 통과
- 상태: 진행 가능

### TASK-003 · 인증·권한 (1차)

- 근거: ARCHITECTURE.md 5절
- 선행 작업: TASK-002
- 만들 것: 사용자 역할: 임직원(그룹웨어와 ERP 업무를 사용하며 본인 업무를 신청·기안·조회하고 문서마다 데이터로 정해지는 결재자·작성자·신청자·열람자가 되는 일반 사용자), 시스템 관리자(권한·메뉴·포털·인증기기·접근 허용 IP 등 시스템 설정과 사용 통계를 관리), 예산·회계 담당자(예산 편성·마감·조정, 품의·결의, 전표, 장부, 결산, 자금, 부가세 업무를 처리, 가정), 인사 담당자(인사정보, 인사발령, 교육, 증명서 발급, 휴직·단축근무 승인 업무를 처리, 가정), 근태 담당자(근태 기준정보 설정, 근태조정·마감, 연차 생성·정산·계획을 관리, 가정), 급여 담당자(급여 계산·마감·이체·전표처리, 퇴직금, 사회보험, 원천세, 연말정산 업무를 처리, 가정), 자산 담당자(구매품의 자산품목, 자산 등록, 자산실사, 고정자산 업무를 처리, 가정), 자원 담당자(자원 분류·목록을 관리하고 자원 예약 신청을 승인·반려, 가정); 자동 실행·연계 주체 (사용자 역할 아님 — 시스템 계정·연계 인증): 시스템(AI 데이터 분석), 시스템(AI 문서 처리), 시스템(ERP 연계), 시스템(RFID 리더기 연계), 시스템(결재문서 보관 처리), 시스템(메뉴 이력 기록), 시스템(메신저 서버), 시스템(문서번호 채번), 시스템(발령공고 게시), 시스템(알림 발송), 시스템(알림 스케줄러), 시스템(알림), 시스템(연차 발생 스케줄러), 시스템(오류 처리), 시스템(외부 연계 처리기), 시스템(자산 등록 연계), 시스템(자원 알림), 시스템(조직도 동기화), 시스템(통합알림), 외부 시스템(ECM), 외부 시스템(Tcon), 외부 시스템(WTA 사이버연수원), 외부 시스템(e나라도움), 외부 시스템(국세청 또는 외부 전자세금계산서 발행 시스템), 외부 시스템(국세청 전자세금계산서), 외부 시스템(국세청 홈택스), 외부 시스템(국세청), 외부 시스템(금융기관 API), 외부 시스템(기존 ERP), 외부 시스템(세무회계사무소), 외부 시스템(은행 CMS), 외부 시스템(자산실사 시스템), 외부 시스템(주거래은행 CMS), 외부 시스템(출퇴근 연동 시스템), 외부 시스템(카드사); Bearer 토큰 인증, API별 권한 확인 (API.md 권한); 비밀번호 등 `*_hash` 컬럼 해시 저장
- 완료 기준: 보안 요구사항 수용 기준 (AC-SFR-044-05-*, AC-COR-002-03-*, AC-COR-002-04-*) 확인; 권한 없는 호출은 403
- 상태: 진행 가능

### TASK-004 · 공통 규칙·코드값 (1차)

- 근거: DECISIONS.md
- 선행 작업: TASK-002
- 만들 것: 공통 규칙 P1 ~ P13 (DECISIONS.md); 코드값 11종: 승인 처리 상태, 전자결재 처리 상태, 예산 조정 구분, 예산 통제 주기, 조회 범위, 재직 구분, 알림 채널, 로그인 구분, 읽음 상태, 근태 유형, 사용 여부
- 완료 기준: 공통 규칙을 쓰는 기능의 '규칙 (공통)' 수용 기준이 통과
- 상태: 진행 가능

### TASK-005 · 계정과목·관련계정·관리항목 관리 (1차)

- 근거: 기능 FN-SFR-006-01 · 요구사항 SFR-006-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /account-subjects` (`listAccountSubjects`); API `POST /account-subjects` (`createAccountSubject`); API `PUT /account-subjects/{accountSubjectId}` (`updateAccountSubject`); 테이블: account_subject
- 완료 기준: AC-FN-SFR-006-01-1 ~ AC-FN-SFR-006-01-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-006 · 재무제표 양식·자동분개 유형 설정 (1차)

- 근거: 기능 FN-SFR-006-02 · 요구사항 SFR-006-02
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: 배치·자동 실행: 재무제표 양식과 자동분개 유형을 저장할 전용 테이블이 데이터 모델에 없어 근거 있는 API를 설계할 수 없다.; 테이블: account_subject
- 완료 기준: AC-FN-SFR-006-02-1 ~ AC-FN-SFR-006-02-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-007 · 증명서 양식 등록·관리 (1차)

- 근거: 기능 FN-SFR-016-01 · 요구사항 SFR-016-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /certificate-types` (`listCertificateTypes`); API `POST /certificate-types` (`createCertificateType`); API `PATCH /certificate-types/{certificateTypeId}` (`updateCertificateType`); 테이블: certificate_type
- 완료 기준: AC-FN-SFR-016-01-1 ~ AC-FN-SFR-016-01-7 (7개) 테스트 통과
- 상태: 진행 가능

### TASK-008 · 증명서별 채번 관리 (1차)

- 근거: 기능 FN-SFR-016-02 · 요구사항 SFR-016-02
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /certificate-types/numbering` (`listCertificateNumberings`); API `PUT /certificate-types/{certificateTypeId}/numbering` (`updateCertificateNumbering`); 테이블: certificate_type
- 완료 기준: AC-FN-SFR-016-02-1 ~ AC-FN-SFR-016-02-8 (8개) 테스트 통과
- 상태: 진행 가능

### TASK-009 · 연차 생성 기준 환경설정 (1차)

- 근거: 기능 FN-SFR-019-01 · 요구사항 SFR-019-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /leave-grant-rules` (`listLeaveGrantRules` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /leave-grant-rules` (`createLeaveGrantRule`); API `PUT /leave-grant-rules/{leaveGrantRuleId}` (`updateLeaveGrantRule2`); API `DELETE /leave-grant-rules/{leaveGrantRuleId}` (`deleteLeaveGrantRule`); 테이블: leave_grant_rule
- 완료 기준: AC-FN-SFR-019-01-1 ~ AC-FN-SFR-019-01-8 (8개) 테스트 통과
- 상태: 진행 가능

### TASK-010 · 단일 포털 기반 통합 운영 및 시스템 설정 관리 (1차)

- 근거: 기능 FN-SFR-026-02 · 요구사항 SFR-026-02
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /menus` (`listMenus` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /menus` (`createMenu`); API `PUT /menus/{menuId}` (`updateMenu`); 테이블: menu
- 완료 기준: AC-FN-SFR-026-02-1 ~ AC-FN-SFR-026-02-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-011 · 다중 업무 화면 전환 (1차)

- 근거: 기능 FN-SFR-027-02 · 요구사항 SFR-027-02
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /menus` (`listMenus` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /menus/{menuId}/open` (`openMenu`); 테이블: menu
- 완료 기준: AC-FN-SFR-027-02-1 ~ AC-FN-SFR-027-02-8 (8개) 테스트 통과
- 상태: 진행 가능

### TASK-012 · 결재양식 및 결재 프로세스 관리 (1차)

- 근거: 기능 FN-SFR-029-01 · 요구사항 SFR-029-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /approval-forms` (`listApprovalForms`); API `POST /approval-forms` (`createApprovalForm`); API `PUT /approval-forms/{approvalFormId}` (`updateApprovalForm` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: approval_form
- 완료 기준: AC-FN-SFR-029-01-1 ~ AC-FN-SFR-029-01-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-013 · 기존 문서 파일 기반 결재양식 편집·변환 (1차)

- 근거: 기능 FN-SFR-030-02 · 요구사항 SFR-030-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `POST /approval-forms/convert` (`convertApprovalFormFile`); API `POST /approval-forms` (`createApprovalForm` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: approval_form
- 완료 기준: AC-FN-SFR-030-02-1 ~ AC-FN-SFR-030-02-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-014 · 결재문서 공통관리 설정 (1차)

- 근거: 기능 FN-SFR-031-01 · 요구사항 SFR-031-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /departments` (`listDepartments`); API `PATCH /departments/{departmentId}` (`updateDepartment`); 테이블: department
- 완료 기준: AC-FN-SFR-031-01-1 ~ AC-FN-SFR-031-01-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-015 · 서버 사용 용량 현황 조회 (1차)

- 근거: 기능 FN-SFR-038-03 · 요구사항 SFR-038-03
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /server-capacities` (`getServerCapacity`); 테이블: 없음
- 완료 기준: AC-FN-SFR-038-03-1 ~ AC-FN-SFR-038-03-7 (7개) 테스트 통과
- 상태: 진행 가능

### TASK-016 · 오류 에러 메시지 표시 (1차)

- 근거: 기능 FN-SIR-003-02 · 요구사항 SIR-003-02
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /error-messages` (`listErrorMessages`); 테이블: error_message
- 완료 기준: AC-FN-SIR-003-02-1 ~ AC-FN-SIR-003-02-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-017 · ERP 업무 모듈 이용 (1차)

- 근거: 기능 FN-SFR-001-06 · 요구사항 SFR-001-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `GET /menus` (`listMenus` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, menu
- 완료 기준: AC-FN-SFR-001-06-1 ~ AC-FN-SFR-001-06-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-018 · 예산과목 등록·관리 (1차)

- 근거: 기능 FN-SFR-002-03 · 요구사항 SFR-002-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-005
- 만들 것: API `GET /budget-accounts` (`listBudgetAccounts`); API `POST /budget-accounts` (`createBudgetAccount`); API `PATCH /budget-accounts/{budgetAccountId}` (`updateBudgetAccount`); API `DELETE /budget-accounts/{budgetAccountId}` (`deleteBudgetAccount`); 테이블: budget_account
- 완료 기준: AC-FN-SFR-002-03-1 ~ AC-FN-SFR-002-03-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-019 · 임직원 인사정보 등록·관리 (1차)

- 근거: 기능 FN-SFR-012-01 · 요구사항 SFR-012-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /employees` (`createEmployee`); API `PATCH /employees/{employeeId}` (`updateEmployee`); API `GET /employees` (`listEmployees`); 테이블: employee
- 완료 기준: AC-FN-SFR-012-01-1 ~ AC-FN-SFR-012-01-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-020 · 그룹웨어·조직도 연계 (1차)

- 근거: 기능 FN-SFR-036-09 · 요구사항 SFR-036-06
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /departments` (`listDepartments` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /employees` (`listEmployees` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, department
- 완료 기준: AC-FN-SFR-036-09-1 ~ AC-FN-SFR-036-09-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-021 · 2차 인증 로그인 (1차)

- 근거: 기능 FN-SFR-037-01 · 요구사항 SFR-037-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /auth/login` (`login`); 테이블: employee
- 완료 기준: AC-FN-SFR-037-01-1 ~ AC-FN-SFR-037-01-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-022 · 심사현황 조회 (1차)

- 근거: 기능 FN-SFR-042-04 · 요구사항 SFR-042-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /fee-records/review-status` (`getReviewStatus`); 테이블: fee_unit_price, fee_record
- 완료 기준: AC-FN-SFR-042-04-1 ~ AC-FN-SFR-042-04-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-023 · 재발급 내역현황·집계 조회 (1차)

- 근거: 기능 FN-SFR-042-05 · 요구사항 SFR-042-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /fee-records` (`listReissueFeeRecords`); API `GET /fee-records/summary` (`getReissueFeeRecordSummary`); 테이블: fee_unit_price, fee_record
- 완료 기준: AC-FN-SFR-042-05-1 ~ AC-FN-SFR-042-05-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-024 · 통합 사용 권한 관리 (1차)

- 근거: 기능 FN-SFR-001-01 · 요구사항 SFR-001-08
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-010
- 만들 것: API `GET /menu-permissions` (`listMenuPermissions`); API `POST /menu-permissions` (`createMenuPermission`); API `PATCH /menu-permissions/{menuPermissionId}` (`updateMenuPermission`); API `DELETE /menu-permissions/{menuPermissionId}` (`deleteMenuPermission`); 테이블: employee, department, menu_permission
- 완료 기준: AC-FN-SFR-001-01-1 ~ AC-FN-SFR-001-01-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-025 · 그룹웨어 통합 업무 환경 이용 (1차)

- 근거: 기능 FN-SFR-001-05 · 요구사항 SFR-001-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `GET /menus` (`listMenus`); 테이블: employee, menu, menu_permission
- 완료 기준: AC-FN-SFR-001-05-1 ~ AC-FN-SFR-001-05-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-026 · 신용카드 등록·관리 (1차)

- 근거: 기능 FN-SFR-002-06 · 요구사항 SFR-002-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /credit-cards` (`listCreditCards`); API `POST /credit-cards` (`createCreditCard`); API `GET /credit-card-permissions` (`listCreditCardPermissions`); API `POST /credit-card-permissions` (`createCreditCardPermission`); API `DELETE /credit-card-permissions/{creditCardPermissionId}` (`deleteCreditCardPermission`); 테이블: credit_card, credit_card_permission
- 완료 기준: AC-FN-SFR-002-06-1 ~ AC-FN-SFR-002-06-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-027 · 기준정보 환경설정 (1차)

- 근거: 기능 FN-SFR-002-07 · 요구사항 SFR-002-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /system-settings` (`listSystemSettings`); API `PATCH /system-settings/{systemSettingId}` (`updateSystemSetting`); 테이블: department, project, system_setting
- 완료 기준: AC-FN-SFR-002-07-1 ~ AC-FN-SFR-002-07-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-028 · 자금과목 및 자금 손익 양식 설정 (1차)

- 근거: 기능 FN-SFR-009-01 · 요구사항 SFR-009-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /fund-subjects` (`listFundSubjects`); API `POST /fund-subjects` (`createFundSubject`); API `PATCH /fund-subjects/{fundSubjectId}` (`updateFundSubject`); API `GET /fund-pl-form-items` (`listFundPlFormItems`); API `POST /fund-pl-form-items` (`createFundPlFormItem`); API `PATCH /fund-pl-form-items/{fundPlFormItemId}` (`updateFundPlFormItem`); API `DELETE /fund-pl-form-items/{fundPlFormItemId}` (`deleteFundPlFormItem`); 테이블: account_subject, fund_subject, fund_pl_form_item
- 완료 기준: AC-FN-SFR-009-01-1 ~ AC-FN-SFR-009-01-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-029 · 자금일보 조회 (1차)

- 근거: 기능 FN-SFR-009-04 · 요구사항 SFR-009-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `GET /daily-fund-reports` (`listDailyFundReports`); 테이블: approval_document
- 완료 기준: AC-FN-SFR-009-04-1 ~ AC-FN-SFR-009-04-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-030 · 인사정보 변경 신청 검토·승인 (1차)

- 근거: 기능 FN-SFR-012-02 · 요구사항 SFR-012-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `GET /personnel-change-requests` (`listPersonnelChangeRequests`); API `POST /personnel-change-requests` (`createPersonnelChangeRequest`); API `POST /personnel-change-requests/{personnelChangeRequestId}/review` (`reviewPersonnelChangeRequest`); 테이블: approval_document, notification, change_history, personnel_record, personnel_change_request
- 완료 기준: AC-FN-SFR-012-02-1 ~ AC-FN-SFR-012-02-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-031 · 인사정보 일괄 변경 (1차)

- 근거: 기능 FN-SFR-012-03 · 요구사항 SFR-012-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /personnel-records/bulk-update` (`bulkUpdatePersonnelRecords`); 테이블: employee, change_history, personnel_record
- 완료 기준: AC-FN-SFR-012-03-1 ~ AC-FN-SFR-012-03-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-032 · 기초 인적사항 등록·관리 (1차)

- 근거: 기능 FN-SFR-012-04 · 요구사항 SFR-012-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `GET /personnel-records` (`listPersonnelRecords`); API `POST /personnel-records` (`createPersonnelRecord`); API `PATCH /personnel-records/{personnelRecordId}` (`updatePersonnelRecord`); 테이블: employee, personal_info_access_log, change_history, personnel_record
- 완료 기준: AC-FN-SFR-012-04-1 ~ AC-FN-SFR-012-04-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-033 · 인사정보·인사기록카드 엑셀 업로드 후속 처리 (1차)

- 근거: 기능 FN-SFR-012-06 · 요구사항 SFR-012-03, SFR-012-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /upload-histories/personnel-records` (`uploadPersonnelRecords`); 테이블: employee, upload_history, change_history, personnel_record
- 완료 기준: AC-FN-SFR-012-06-1 ~ AC-FN-SFR-012-06-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-034 · 인사정보 현황 조회 (1차)

- 근거: 기능 FN-SFR-014-01 · 요구사항 SFR-014-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-010
- 만들 것: API `GET /personnel-records` (`listPersonnelRecords` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, department, menu_permission, personal_info_access_log, personnel_record
- 완료 기준: AC-FN-SFR-014-01-1 ~ AC-FN-SFR-014-01-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-035 · 인사기록 현황 조회 (1차)

- 근거: 기능 FN-SFR-014-02 · 요구사항 SFR-014-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-010
- 만들 것: API `GET /personnel-record-items` (`listPersonnelRecordItems`); 테이블: employee, department, menu_permission, personal_info_access_log, personnel_record, employee_family, employee_education, employee_career, employee_license, employee_language, employee_evaluation, employee_reward_penalty, employee_business_trip
- 완료 기준: AC-FN-SFR-014-02-1 ~ AC-FN-SFR-014-02-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-036 · 고과 및 상벌현황 조회 (1차)

- 근거: 기능 FN-SFR-015-01 · 요구사항 SFR-015-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /employee-evaluations` (`listEmployeeEvaluations` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /employee-reward-penalties` (`listEmployeeRewardPenalties` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, department, personal_info_access_log, personnel_record, employee_evaluation, employee_reward_penalty
- 완료 기준: AC-FN-SFR-015-01-1 ~ AC-FN-SFR-015-01-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-037 · 근태 기준정보 및 시간외근무 기준 관리 (1차)

- 근거: 기능 FN-SFR-017-01 · 요구사항 SFR-017-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /attendance-standards` (`listAttendanceStandards`); API `POST /attendance-standards` (`createAttendanceStandard`); API `PATCH /attendance-standards/{attendanceStandardId}` (`updateAttendanceStandard`); API `DELETE /attendance-standards/{attendanceStandardId}` (`deleteAttendanceStandard`); 테이블: change_history, attendance_standard
- 완료 기준: AC-FN-SFR-017-01-1 ~ AC-FN-SFR-017-01-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-038 · 근태항목 관리 (1차)

- 근거: 기능 FN-SFR-017-02 · 요구사항 SFR-017-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /attendance-items` (`listAttendanceItems`); API `POST /attendance-items` (`createAttendanceItem`); API `PATCH /attendance-items/{attendanceItemId}` (`updateAttendanceItem`); API `DELETE /attendance-items/{attendanceItemId}` (`deleteAttendanceItem`); 테이블: change_history, attendance_item
- 완료 기준: AC-FN-SFR-017-02-1 ~ AC-FN-SFR-017-02-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-039 · 임직원별 근태 적용 설정 (1차)

- 근거: 기능 FN-SFR-017-03 · 요구사항 SFR-017-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `GET /employee-attendance-settings` (`listEmployeeAttendanceSettings`); API `POST /employee-attendance-settings` (`createEmployeeAttendanceSetting`); API `PUT /employee-attendance-settings/{employeeAttendanceSettingId}` (`updateEmployeeAttendanceSetting`); 테이블: employee, change_history, attendance_item, employee_attendance_setting
- 완료 기준: AC-FN-SFR-017-03-1 ~ AC-FN-SFR-017-03-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-040 · 출퇴근 체크 유형 설정 (1차)

- 근거: 기능 FN-SFR-017-04 · 요구사항 SFR-017-04
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /commute-check-settings` (`listCommuteCheckSettings`); API `POST /commute-check-settings` (`createCommuteCheckSetting`); API `PUT /commute-check-settings/{commuteCheckSettingId}` (`updateCommuteCheckSetting`); 테이블: employee, department, change_history, commute_check_setting
- 완료 기준: AC-FN-SFR-017-04-1 ~ AC-FN-SFR-017-04-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-041 · 시스템 접근 허용 IP 관리 (1차)

- 근거: 기능 FN-SFR-017-05 · 요구사항 SFR-017-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /allowed-ips` (`listAllowedIps`); API `POST /allowed-ips` (`createAllowedIp`); API `PUT /allowed-ips/{allowedIpId}` (`updateAllowedIp`); API `DELETE /allowed-ips/{allowedIpId}` (`deleteAllowedIp`); 테이블: change_history, allowed_ip
- 완료 기준: AC-FN-SFR-017-05-1 ~ AC-FN-SFR-017-05-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-042 · 출퇴근 기록 및 연동 관리 (1차)

- 근거: 기능 FN-SFR-018-03 · 요구사항 SFR-018-04, SFR-018-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /commute-records` (`createCommuteRecord`); API `POST /commute-records/receive-linked` (`receiveLinkedCommuteRecords`); API `GET /commute-records` (`listCommuteRecords`); API `PATCH /commute-records/{commuteRecordId}` (`updateCommuteRecord`); 테이블: system_setting, link_log, commute_record
- 완료 기준: AC-FN-SFR-018-03-1 ~ AC-FN-SFR-018-03-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-043 · 연차 생성 및 확정 (1차)

- 근거: 기능 FN-SFR-019-02 · 요구사항 SFR-019-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /annual-leaves/generate` (`generateAnnualLeaves`); API `POST /annual-leaves/confirm` (`confirmAnnualLeaves`); API `PUT /annual-leaves/{annualLeaveId}` (`updateAnnualLeave`); API `DELETE /annual-leaves/{annualLeaveId}` (`deleteAnnualLeave`); 테이블: employee, change_history, leave_grant_rule, annual_leave
- 완료 기준: AC-FN-SFR-019-02-1 ~ AC-FN-SFR-019-02-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-044 · 연차 변경이력 조회 (1차)

- 근거: 기능 FN-SFR-019-04 · 요구사항 SFR-019-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-009
- 만들 것: API `GET /change-histories` (`listChangeHistories`); 테이블: change_history, annual_leave
- 완료 기준: AC-FN-SFR-019-04-1 ~ AC-FN-SFR-019-04-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-045 · 급여 기초코드 및 세금 코드 관리 (1차)

- 근거: 기능 FN-SFR-020-01 · 요구사항 SFR-020-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /payroll-codes` (`listPayrollCodes`); API `POST /payroll-codes` (`createPayrollCode`); API `PATCH /payroll-codes/{payrollCodeId}` (`updatePayrollCode`); 테이블: change_history, payroll_code
- 완료 기준: AC-FN-SFR-020-01-1 ~ AC-FN-SFR-020-01-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-046 · 급여 기준 및 계정과목 설정 (1차)

- 근거: 기능 FN-SFR-020-02 · 요구사항 SFR-020-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /payroll-account-mappings` (`listPayrollAccountMappings`); API `PUT /payroll-account-mappings/{payrollAccountMappingId}` (`updatePayrollAccountMapping`); API `GET /system-settings` (`listSystemSettings` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PATCH /system-settings/{systemSettingId}` (`updateSystemSetting` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: account_subject, system_setting, change_history, payroll_account_mapping
- 완료 기준: AC-FN-SFR-020-02-1 ~ AC-FN-SFR-020-02-17 (17개) 테스트 통과
- 상태: 진행 가능

### TASK-047 · 급여 계산·과세 집계 및 마감 (1차)

- 근거: 기능 FN-SFR-021-01 · 요구사항 SFR-021-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /payrolls/calculate` (`calculatePayrolls`); API `POST /payrolls/close` (`closePayrolls`); API `POST /payrolls/cancel-close` (`cancelClosePayrolls`); 테이블: employee, payroll
- 완료 기준: AC-FN-SFR-021-01-1 ~ AC-FN-SFR-021-01-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-048 · 책정임금 일괄 변경 및 현황 조회 (1차)

- 근거: 기능 FN-SFR-021-03 · 요구사항 SFR-021-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /employee-wages/bulk-update` (`bulkUpdateEmployeeWages`); API `GET /employee-wages` (`listEmployeeWages`); 테이블: employee, payroll, personal_info_access_log, change_history, employee_wage
- 완료 기준: AC-FN-SFR-021-03-1 ~ AC-FN-SFR-021-03-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-049 · 일용직 사원 및 급여정보 관리 (1차)

- 근거: 기능 FN-SFR-021-04 · 요구사항 SFR-021-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /daily-workers` (`createDailyWorker`); API `GET /daily-workers` (`listDailyWorkers`); API `POST /daily-worker-payments` (`createDailyWorkerPayment`); 테이블: employee, payroll, personal_info_access_log, daily_worker, daily_worker_payment
- 완료 기준: AC-FN-SFR-021-04-1 ~ AC-FN-SFR-021-04-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-050 · 퇴직기준 설정 및 퇴직금 산정·추계액 관리 (1차)

- 근거: 기능 FN-SFR-021-05 · 요구사항 SFR-021-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `PUT /severance-settings` (`updateSeveranceSetting`); API `POST /severance-calculations` (`createSeveranceCalculation`); API `GET /severance-calculations` (`listSeveranceCalculations`); 테이블: employee, payroll, system_setting, personnel_record, severance_calculation
- 완료 기준: AC-FN-SFR-021-05-1 ~ AC-FN-SFR-021-05-8 (8개) 테스트 통과
- 상태: 진행 가능

### TASK-051 · 급여 시뮬레이션 (1차)

- 근거: 기능 FN-SFR-021-07 · 요구사항 SFR-021-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /payroll-simulations` (`simulatePayroll`); 테이블: employee, payroll, personal_info_access_log
- 완료 기준: AC-FN-SFR-021-07-1 ~ AC-FN-SFR-021-07-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-052 · 연말정산용 연간 급여 일괄 입력 (1차)

- 근거: 기능 FN-SFR-021-09 · 요구사항 SFR-021-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /payrolls/annual-bulk` (`bulkCreateAnnualPayrolls`); API `POST /upload-histories` (`createUploadHistory`); 테이블: employee, payroll, upload_history
- 완료 기준: AC-FN-SFR-021-09-1 ~ AC-FN-SFR-021-09-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-053 · 호봉테이블 및 임직원 호봉 현황 관리 (1차)

- 근거: 기능 FN-SFR-021-11 · 요구사항 SFR-021-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /salary-steps` (`createSalaryStep`); API `PATCH /salary-steps/{salaryStepId}` (`updateSalaryStep`); API `GET /salary-steps` (`listSalarySteps`); API `POST /employee-wages` (`createEmployeeWage`); API `GET /employee-wages` (`listEmployeeWages` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, change_history, salary_step, employee_wage
- 완료 기준: AC-FN-SFR-021-11-1 ~ AC-FN-SFR-021-11-8 (8개) 테스트 통과
- 상태: 진행 가능

### TASK-054 · 일용근로소득 지급명세서·원천징수영수증 관리 (1차)

- 근거: 기능 FN-SFR-021-13 · 요구사항 SFR-021-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /income-certificates/generate` (`generateIncomeCertificates`); API `GET /income-certificates` (`listIncomeCertificates`); 테이블: employee, payroll, personal_info_access_log, daily_worker, daily_worker_payment, income_certificate
- 완료 기준: AC-FN-SFR-021-13-1 ~ AC-FN-SFR-021-13-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-055 · 퇴직금 산정 현황 및 퇴직소득 원천징수영수증 관리 (1차)

- 근거: 기능 FN-SFR-021-14 · 요구사항 SFR-021-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-049
- 만들 것: API `GET /severance-calculations` (`listSeveranceCalculations` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /income-certificates` (`listIncomeCertificates` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /income-certificates` (`createIncomeCertificate`); 테이블: employee, payroll, personal_info_access_log, severance_calculation, income_certificate
- 완료 기준: AC-FN-SFR-021-14-1 ~ AC-FN-SFR-021-14-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-056 · 급여통계 및 급여분석 현황 조회 (1차)

- 근거: 기능 FN-SFR-021-16 · 요구사항 SFR-021-07
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /payroll-analyses` (`listPayrollAnalyses`); 테이블: employee, department, project, payroll
- 완료 기준: AC-FN-SFR-021-16-1 ~ AC-FN-SFR-021-16-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-057 · 사회보험 등급 변경 관리 (1차)

- 근거: 기능 FN-SFR-022-04 · 요구사항 SFR-022-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /social-insurance-grades/change` (`changeSocialInsuranceGrade`); API `GET /change-histories` (`listChangeHistories` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, change_history, social_insurance_grade
- 완료 기준: AC-FN-SFR-022-04-1 ~ AC-FN-SFR-022-04-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-058 · 원천세 신고 기준정보 설정 및 신고서 관리 (1차)

- 근거: 기능 FN-SFR-023-01 · 요구사항 SFR-023-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /system-settings` (`listSystemSettings` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /system-settings/{systemSettingId}` (`updateSystemSetting2` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /tax-filings/generate` (`generateTaxFiling`); API `GET /tax-filings` (`listTaxFilings`); API `PUT /tax-filings/{taxFilingId}` (`updateTaxFiling`); 테이블: payroll, system_setting, tax_filing
- 완료 기준: AC-FN-SFR-023-01-1 ~ AC-FN-SFR-023-01-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-059 · 국세청 원천세 전자파일 신고 (1차)

- 근거: 기능 FN-SFR-023-02 · 요구사항 SFR-023-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /tax-filings/{taxFilingId}/submit` (`submitTaxFiling`); 테이블: link_log, tax_filing
- 완료 기준: AC-FN-SFR-023-02-1 ~ AC-FN-SFR-023-02-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-060 · 지방세 전자신고 (1차)

- 근거: 기능 FN-SFR-023-03 · 요구사항 SFR-023-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /tax-filings/generate-local` (`generateLocalTaxFiling`); API `POST /tax-filings/{taxFilingId}/submit` (`submitTaxFiling` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: payroll, link_log, tax_filing
- 완료 기준: AC-FN-SFR-023-03-1 ~ AC-FN-SFR-023-03-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-061 · 일용근로소득 지급명세서 및 영수증 관리 (1차)

- 근거: 기능 FN-SFR-023-04 · 요구사항 SFR-023-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /income-certificates/generate-daily` (`generateDailyIncomeCertificates`); API `GET /income-certificates` (`listIncomeCertificates` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /income-certificates/{incomeCertificateId}` (`updateIncomeCertificate`); 테이블: daily_worker, daily_worker_payment, income_certificate
- 완료 기준: AC-FN-SFR-023-04-1 ~ AC-FN-SFR-023-04-8 (8개) 테스트 통과
- 상태: 진행 가능

### TASK-062 · 퇴직소득 원천징수영수증 관리 (1차)

- 근거: 기능 FN-SFR-023-05 · 요구사항 SFR-023-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-049
- 만들 것: API `POST /income-certificates/generate-retirement` (`generateRetirementIncomeCertificate`); API `GET /income-certificates` (`listIncomeCertificates` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /income-certificates/{incomeCertificateId}` (`updateIncomeCertificate` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: severance_calculation, income_certificate
- 완료 기준: AC-FN-SFR-023-05-1 ~ AC-FN-SFR-023-05-8 (8개) 테스트 통과
- 상태: 진행 가능

### TASK-063 · 근로소득 원천징수부 및 영수증 관리 (1차)

- 근거: 기능 FN-SFR-023-07 · 요구사항 SFR-023-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-049
- 만들 것: API `GET /withholding-ledgers` (`listWithholdingLedgers`); API `GET /income-certificates` (`listIncomeCertificates` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: payroll, income_certificate, year_end_result
- 완료 기준: AC-FN-SFR-023-07-1 ~ AC-FN-SFR-023-07-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-064 · 소득자료 제출집계표 및 지급명세서 전산매체 관리 (1차)

- 근거: 기능 FN-SFR-023-09 · 요구사항 SFR-023-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-049
- 만들 것: API `POST /tax-filings/submission-summaries` (`createSubmissionSummary`); API `POST /tax-filings/{taxFilingId}/generate-media` (`generatePaymentMediaFile`); 테이블: tax_filing, income_certificate
- 완료 기준: AC-FN-SFR-023-09-1 ~ AC-FN-SFR-023-09-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-065 · 간이지급명세서 작성 및 전자신고 (1차)

- 근거: 기능 FN-SFR-023-10 · 요구사항 SFR-023-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /tax-filings/simplified-payments` (`createSimplifiedPaymentStatement`); API `POST /tax-filings/{taxFilingId}/file` (`fileSimplifiedPaymentStatement`); 테이블: link_log, tax_filing
- 완료 기준: AC-FN-SFR-023-10-1 ~ AC-FN-SFR-023-10-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-066 · 통합 사용 권한 관리 (1차)

- 근거: 기능 FN-SFR-026-01 · 요구사항 SFR-026-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010
- 만들 것: API `GET /menu-permissions` (`listMenuPermissions` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /menu-permissions` (`createMenuPermission` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /menu-permissions/{menuPermissionId}` (`updateMenuPermission2`); 테이블: menu_permission
- 완료 기준: AC-FN-SFR-026-01-1 ~ AC-FN-SFR-026-01-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-067 · 그룹웨어 통합검색 (1차)

- 근거: 기능 FN-SFR-026-03 · 요구사항 SFR-026-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012
- 만들 것: API `GET /search-results` (`searchGroupware`); 테이블: menu_permission, approval_document, attachment, board_post
- 완료 기준: AC-FN-SFR-026-03-1 ~ AC-FN-SFR-026-03-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-068 · 통합업무포털 구성 및 개인화 (1차)

- 근거: 기능 FN-SFR-026-04 · 요구사항 SFR-026-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `GET /portal-widget-settings` (`listPortalWidgetSettings`); API `POST /portal-widget-settings` (`createPortalWidgetSetting`); API `PUT /portal-widget-settings/{portalWidgetSettingId}` (`updatePortalWidgetSetting`); API `GET /portal-banners` (`listPortalBanners`); API `POST /portal-banners` (`createPortalBanner`); API `GET /personal-menus` (`listPersonalMenus`); 테이블: employee, menu, menu_permission, portal_widget_setting, portal_banner, personal_menu
- 완료 기준: AC-FN-SFR-026-04-1 ~ AC-FN-SFR-026-04-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-069 · 첨부파일 문서 미리보기 (1차)

- 근거: 기능 FN-SFR-026-05 · 요구사항 SFR-026-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /attachments/{attachmentId}/preview` (`getAttachmentPreview`); 테이블: attachment
- 완료 기준: AC-FN-SFR-026-05-1 ~ AC-FN-SFR-026-05-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-070 · 포털 위젯 표시 (1차)

- 근거: 기능 FN-SFR-027-03 · 요구사항 SFR-027-01, SFR-027-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-010
- 만들 것: API `GET /portal` (`getPortal`); 테이블: employee, menu_permission, approval_document, approval_form, notification, schedule, portal_widget_setting, portal_banner, quick_link
- 완료 기준: AC-FN-SFR-027-03-1 ~ AC-FN-SFR-027-03-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-071 · 최근 사용 메뉴 이력 조회 및 이동 (1차)

- 근거: 기능 FN-SFR-027-04 · 요구사항 SFR-027-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `GET /menu-usage-logs` (`listMenuUsageLogs`); API `POST /menu-usage-logs` (`createMenuUsageLog`); API `POST /menus/{menuId}/open` (`openMenu` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, menu, menu_permission, menu_usage_log
- 완료 기준: AC-FN-SFR-027-04-1 ~ AC-FN-SFR-027-04-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-072 · 포털 개인화 및 메뉴 구성 관리 (1차)

- 근거: 기능 FN-SFR-027-05 · 요구사항 SFR-027-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `PUT /portal-widget-settings` (`updatePortalWidgetSettings`); API `GET /portal-banners` (`listPortalBanners` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /personal-menus` (`listPersonalMenus` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /personal-menus` (`createPersonalMenu`); API `PATCH /personal-menus/{personalMenuId}` (`updatePersonalMenu`); API `DELETE /personal-menus/{personalMenuId}` (`deletePersonalMenu`); 테이블: employee, menu, menu_permission, portal_widget_setting, portal_banner, personal_menu
- 완료 기준: AC-FN-SFR-027-05-1 ~ AC-FN-SFR-027-05-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-073 · 알림 및 @멘션 통합 관리 (1차)

- 근거: 기능 FN-SFR-028-01 · 요구사항 SFR-028-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /notifications` (`listNotifications`); API `POST /notifications/mentions` (`createMentionNotifications`); API `PATCH /notifications/{notificationId}/read` (`readNotification`); 테이블: notification
- 완료 기준: AC-FN-SFR-028-01-1 ~ AC-FN-SFR-028-01-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-074 · 알림 바로가기 및 조회 (1차)

- 근거: 기능 FN-SFR-028-03 · 요구사항 SFR-028-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /notifications` (`listNotifications` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /notifications/{notificationId}` (`getNotification`); 테이블: notification
- 완료 기준: AC-FN-SFR-028-03-1 ~ AC-FN-SFR-028-03-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-075 · 알림 읽음 처리 및 상태 표시 (1차)

- 근거: 기능 FN-SFR-028-04 · 요구사항 SFR-028-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /notifications/read-all` (`readAllNotifications`); 테이블: notification
- 완료 기준: AC-FN-SFR-028-04-1 ~ AC-FN-SFR-028-04-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-076 · 결재 처리 및 문서 조회 (1차)

- 근거: 기능 FN-SFR-029-02 · 요구사항 SFR-029-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `GET /approval-documents` (`listApprovalDocuments`); API `POST /approval-documents/{approvalDocumentId}/process` (`processApprovalDocument`); API `POST /approval-documents/{approvalDocumentId}/withdraw` (`withdrawApprovalDocument`); API `DELETE /approval-documents/{approvalDocumentId}` (`deleteApprovalDocument`); 테이블: approval_document
- 완료 기준: AC-FN-SFR-029-02-1 ~ AC-FN-SFR-029-02-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-077 · 겸직 사용자 업무환경 및 결재 알림 (1차)

- 근거: 기능 FN-SFR-029-05 · 요구사항 SFR-029-04
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /employee-departments` (`listEmployeeDepartments`); API `GET /notifications` (`listNotifications` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, department, notification, employee_department
- 완료 기준: AC-FN-SFR-029-05-1 ~ AC-FN-SFR-029-05-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-078 · 문서번호 자동 채번 (1차)

- 근거: 기능 FN-SFR-029-06 · 요구사항 SFR-029-05
- 선행 작업: TASK-002, TASK-003, TASK-012, TASK-017, TASK-014
- 만들 것: 배치·자동 실행: 기안 시점에 시스템이 내부적으로 문서번호를 채번하는 처리이며 별도 HTTP 호출 대상이 아니다(기안 상신 API에서 처리).; 테이블: approval_document, document_numbering_rule
- 완료 기준: AC-FN-SFR-029-06-1 ~ AC-FN-SFR-029-06-6 (6개) 테스트 통과
- 상태: 진행 가능

### TASK-079 · 긴급결재 및 보안문서 설정 (1차)

- 근거: 기능 FN-SFR-029-07 · 요구사항 SFR-029-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `POST /approval-documents/{approvalDocumentId}/designate-security` (`designateSecurityApprovalDocument`); 테이블: approval_document, change_history
- 완료 기준: AC-FN-SFR-029-07-1 ~ AC-FN-SFR-029-07-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-080 · 결재 관련 알림 발송 (1차)

- 근거: 기능 FN-SFR-029-08 · 요구사항 SFR-029-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `GET /notifications` (`listNotifications` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /notifications/{notificationId}/read` (`readNotification2`); 테이블: approval_document, notification
- 완료 기준: AC-FN-SFR-029-08-1 ~ AC-FN-SFR-029-08-6 (6개) 테스트 통과
- 상태: 진행 가능

### TASK-081 · 결재문서 작성 및 서명 (1차)

- 근거: 기능 FN-SFR-029-09 · 요구사항 SFR-029-08
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /approval-documents` (`createApprovalDocument` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /attachments` (`createAttachment`); 테이블: approval_document, approval_form, attachment
- 완료 기준: AC-FN-SFR-029-09-1 ~ AC-FN-SFR-029-09-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-082 · 웹 기안기 결재 상신 (1차)

- 근거: 기능 FN-SFR-030-01 · 요구사항 SFR-030-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `POST /approval-documents` (`createApprovalDocument` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /approval-documents/{approvalDocumentId}/submit` (`submitApprovalDocument`); 테이블: approval_document
- 완료 기준: AC-FN-SFR-030-01-1 ~ AC-FN-SFR-030-01-17 (17개) 테스트 통과
- 상태: 진행 가능

### TASK-083 · 문서 수정이력 관리 (1차)

- 근거: 기능 FN-SFR-031-04 · 요구사항 SFR-031-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `GET /change-histories` (`listChangeHistories` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: approval_document, change_history
- 완료 기준: AC-FN-SFR-031-04-1 ~ AC-FN-SFR-031-04-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-084 · 첨부파일 관리 (1차)

- 근거: 기능 FN-SFR-031-05 · 요구사항 SFR-031-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /attachments` (`createAttachment` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /attachments` (`listAttachments`); API `GET /attachments/{attachmentId}/download` (`downloadAttachment`); API `GET /attachments/{attachmentId}/preview` (`getAttachmentPreview` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: attachment
- 완료 기준: AC-FN-SFR-031-05-1 ~ AC-FN-SFR-031-05-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-085 · 본인 인사정보 조회 (1차)

- 근거: 기능 FN-SFR-032-01 · 요구사항 SFR-032-01, SFR-032-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-010
- 만들 것: API `GET /personnel-records/me` (`getMyPersonnelRecord`); 테이블: employee, menu_permission, personal_info_access_log, personnel_record
- 완료 기준: AC-FN-SFR-032-01-1 ~ AC-FN-SFR-032-01-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-086 · 급여명세서 및 퇴직금 시뮬레이션 조회 (1차)

- 근거: 기능 FN-SFR-032-06 · 요구사항 SFR-032-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `GET /payrolls` (`listPayrolls` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /severance-simulations` (`getSeveranceSimulation`); 테이블: employee, payroll, personal_info_access_log, personnel_record
- 완료 기준: AC-FN-SFR-032-06-1 ~ AC-FN-SFR-032-06-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-087 · 그룹웨어 모듈 이벤트 실시간 알림 및 바로가기 (1차)

- 근거: 기능 FN-SFR-036-06 · 요구사항 SFR-036-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010
- 만들 것: API `POST /notifications` (`createNotification`); API `POST /notifications/{notificationId}/read` (`readNotification2` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: menu_permission, notification
- 완료 기준: AC-FN-SFR-036-06-1 ~ AC-FN-SFR-036-06-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-088 · 게시판 게시물 메신저 알림 (1차)

- 근거: 기능 FN-SFR-036-08 · 요구사항 SFR-036-10
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /notifications` (`listNotifications` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /notifications/{notificationId}/read` (`readNotification2` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /board-posts/{boardPostId}` (`getBoardPost` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: notification, board_post
- 완료 기준: AC-FN-SFR-036-08-1 ~ AC-FN-SFR-036-08-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-089 · 인증 대상·허용 인증기기 수 설정 (1차)

- 근거: 기능 FN-SFR-037-02 · 요구사항 SFR-037-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-010
- 만들 것: API `GET /auth-settings` (`listAuthSettings`); API `PUT /auth-settings` (`saveAuthSetting`); 테이블: employee, menu_permission, change_history, auth_setting, auth_device
- 완료 기준: AC-FN-SFR-037-02-1 ~ AC-FN-SFR-037-02-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-090 · 인증기기 승인·관리 (1차)

- 근거: 기능 FN-SFR-037-03 · 요구사항 SFR-037-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-010
- 만들 것: API `GET /auth-devices` (`listAuthDevices`); API `POST /auth-devices` (`createAuthDevice`); API `POST /auth-devices/{authDeviceId}/approve` (`approveAuthDevice`); API `POST /auth-devices/{authDeviceId}/reject` (`rejectAuthDevice`); API `POST /auth-devices/{authDeviceId}/deactivate` (`deactivateAuthDevice`); API `DELETE /auth-devices/{authDeviceId}` (`deleteAuthDevice`); 테이블: employee, menu_permission, notification, change_history, auth_setting, auth_device
- 완료 기준: AC-FN-SFR-037-03-1 ~ AC-FN-SFR-037-03-18 (18개) 테스트 통과
- 상태: 진행 가능

### TASK-091 · 로그인 내역 통계 조회 (1차)

- 근거: 기능 FN-SFR-038-01 · 요구사항 SFR-038-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `GET /login-histories` (`listLoginHistories`); 테이블: employee, login_history
- 완료 기준: AC-FN-SFR-038-01-1 ~ AC-FN-SFR-038-01-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-092 · 메뉴 사용 내역 조회 (1차)

- 근거: 기능 FN-SFR-038-02 · 요구사항 SFR-038-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `GET /menu-usage-logs` (`listMenuUsageLogs` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, menu, menu_permission, menu_usage_log
- 완료 기준: AC-FN-SFR-038-02-1 ~ AC-FN-SFR-038-02-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-093 · 메뉴별 사용 통계 시각화 조회 (1차)

- 근거: 기능 FN-SFR-038-04 · 요구사항 SFR-038-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /menu-usage-statistics` (`listMenuUsageStatistics`); 테이블: menu, menu_permission, menu_usage_log
- 완료 기준: AC-FN-SFR-038-04-1 ~ AC-FN-SFR-038-04-7 (7개) 테스트 통과
- 상태: 진행 가능

### TASK-094 · 그룹웨어 정보 통합검색 (1차)

- 근거: 기능 FN-SFR-039-01 · 요구사항 SFR-039-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012, TASK-014
- 만들 것: API `GET /integrated-searches` (`searchIntegrated`); 테이블: menu_permission, approval_document, attachment, schedule, board_post, document_box
- 완료 기준: AC-FN-SFR-039-01-1 ~ AC-FN-SFR-039-01-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-095 · 조직원 검색 및 활동 내역 조회 (1차)

- 근거: 기능 FN-SFR-039-02 · 요구사항 SFR-039-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-010, TASK-012
- 만들 것: API `GET /employees` (`listEmployees` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /employees/{employeeId}/activities` (`listEmployeeActivities`); 테이블: employee, department, menu_permission, approval_document, personal_info_access_log, personnel_record, board_post
- 완료 기준: AC-FN-SFR-039-02-1 ~ AC-FN-SFR-039-02-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-096 · 모바일 로그인·로그아웃 (1차)

- 근거: 기능 FN-SFR-040-01 · 요구사항 SFR-040-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /auth/mobile-login` (`loginMobile`); API `POST /auth/mobile-logout` (`logoutMobile`); 테이블: employee, login_history, auth_device
- 완료 기준: AC-FN-SFR-040-01-1 ~ AC-FN-SFR-040-01-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-097 · 모바일 공지·게시글 조회 (1차)

- 근거: 기능 FN-SFR-040-04 · 요구사항 SFR-040-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010
- 만들 것: API `GET /board-posts` (`listBoardPosts` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /board-posts/{boardPostId}` (`getBoardPost` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: menu_permission, attachment, board_post
- 완료 기준: AC-FN-SFR-040-04-1 ~ AC-FN-SFR-040-04-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-098 · 모바일 조직도 조회·검색 (1차)

- 근거: 기능 FN-SFR-040-05 · 요구사항 SFR-040-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-010
- 만들 것: API `GET /employees` (`listEmployees` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, department, menu_permission
- 완료 기준: AC-FN-SFR-040-05-1 ~ AC-FN-SFR-040-05-7 (7개) 테스트 통과
- 상태: 진행 가능

### TASK-099 · 모바일 상신 문서 조회 (1차)

- 근거: 기능 FN-SFR-040-08 · 요구사항 SFR-040-08
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012
- 만들 것: API `GET /approval-documents` (`listApprovalDocuments` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /approval-documents/{approvalDocumentId}` (`getApprovalDocument`); 테이블: menu_permission, approval_document, attachment
- 완료 기준: AC-FN-SFR-040-08-1 ~ AC-FN-SFR-040-08-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-100 · 모바일 통합검색 (1차)

- 근거: 기능 FN-SFR-040-10 · 요구사항 SFR-040-10
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012
- 만들 것: API `GET /search` (`searchIntegrated2`); 테이블: menu_permission, approval_document, attachment, board_post
- 완료 기준: AC-FN-SFR-040-10-1 ~ AC-FN-SFR-040-10-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-101 · 웹 오피스 문서 작성 및 편집 (1차)

- 근거: 기능 FN-SFR-041-01 · 요구사항 SFR-041-01, SFR-041-04, SFR-041-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /office-templates` (`listOfficeTemplates`); API `POST /office-documents` (`createOfficeDocument`); 테이블: office_template, office_document
- 완료 기준: AC-FN-SFR-041-01-1 ~ AC-FN-SFR-041-01-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-102 · 한글·Word 양식 문서 변환 및 편집 (1차)

- 근거: 기능 FN-SFR-041-03 · 요구사항 SFR-041-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-101
- 만들 것: API `POST /office-documents/convert` (`convertOfficeDocument`); 테이블: attachment, office_document
- 완료 기준: AC-FN-SFR-041-03-1 ~ AC-FN-SFR-041-03-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-103 · 심사수수료·재발급 수수료 단가 관리 (1차)

- 근거: 기능 FN-SFR-042-01 · 요구사항 SFR-042-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /fee-unit-prices` (`listFeeUnitPrices`); API `POST /fee-unit-prices` (`createFeeUnitPrice`); API `PATCH /fee-unit-prices/{feeUnitPriceId}` (`updateFeeUnitPrice`); 테이블: change_history, fee_unit_price
- 완료 기준: AC-FN-SFR-042-01-1 ~ AC-FN-SFR-042-01-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-104 · 심사수수료·재발급 수수료 등록 (1차)

- 근거: 기능 FN-SFR-042-03 · 요구사항 SFR-042-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /fee-records` (`createFeeRecord`); 테이블: change_history, fee_unit_price, fee_record
- 완료 기준: AC-FN-SFR-042-03-1 ~ AC-FN-SFR-042-03-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-105 · AI 문서 유형 자동 분류 및 담당 부서 자동 배분 (1차)

- 근거: 기능 FN-SFR-044-01 · 요구사항 SFR-044-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: 배치·자동 실행: 문서 등록 시 시스템(AI 문서 처리)이 자동으로 수행하는 내부 처리이며 HTTP 호출을 받는 기능이 없음; 테이블: department, approval_document, notification, attachment, document_dispatch_rule
- 완료 기준: AC-FN-SFR-044-01-1 ~ AC-FN-SFR-044-01-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-106 · AI 기안문 작성 지원 및 문구 추천 (1차)

- 근거: 기능 FN-SFR-044-02 · 요구사항 SFR-044-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /approval-documents/draft-assist` (`generateApprovalDocumentDraft`); API `POST /approval-documents/phrase-suggestions` (`suggestApprovalDocumentPhrases`); 테이블: approval_document, approval_form
- 완료 기준: AC-FN-SFR-044-02-1 ~ AC-FN-SFR-044-02-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-107 · 개인정보 열람 이력 통계 조회 (1차)

- 근거: 기능 FN-COR-002-01 · 요구사항 COR-002-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /personal-info-access-logs/statistics` (`getPersonalInfoAccessStatistics`); 테이블: personal_info_access_log
- 완료 기준: AC-FN-COR-002-01-1 ~ AC-FN-COR-002-01-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-108 · 내부 단위시스템 연계 인터페이스 표준 관리 (1차)

- 근거: 기능 FN-SIR-002-01 · 요구사항 SIR-002-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010
- 만들 것: API `POST /interface-standards` (`createInterfaceStandard`); API `GET /interface-standards` (`listInterfaceStandards`); 테이블: menu_permission, api_client, interface_standard
- 완료 기준: AC-FN-SIR-002-01-1 ~ AC-FN-SIR-002-01-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-109 · 표준 연계 API 제공 (1차)

- 근거: 기능 FN-SIR-002-02 · 요구사항 SIR-002-02
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `POST /interface-standards/invoke` (`invokeStandardInterface`); API `PATCH /api-clients/{apiClientId}` (`updateApiClientUsage`); 테이블: api_client, interface_standard, api_call_log
- 완료 기준: AC-FN-SIR-002-02-1 ~ AC-FN-SIR-002-02-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-110 · 전자결재 양식 연동결재 지원 (1차)

- 근거: 기능 FN-SIR-002-03 · 요구사항 SIR-002-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /approval-documents` (`createApprovalDocument` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /approval-linked-forms` (`createApprovalLinkedForm`); 테이블: approval_document, approval_form, notification, approval_linked_form
- 완료 기준: AC-FN-SIR-002-03-1 ~ AC-FN-SIR-002-03-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-111 · 사용자 기능 온라인 도움말 조회 (1차)

- 근거: 기능 FN-SIR-003-01 · 요구사항 SIR-003-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /help-contents` (`listHelpContents`); 테이블: menu, menu_permission, help_content
- 완료 기준: AC-FN-SIR-003-01-1 ~ AC-FN-SIR-003-01-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-112 · 프로젝트 등록·관리 (1차)

- 근거: 기능 FN-SFR-002-01 · 요구사항 SFR-002-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017
- 만들 것: API `GET /projects` (`listProjects`); API `POST /projects` (`createProject`); API `PATCH /projects/{projectId}` (`updateProject`); API `DELETE /projects/{projectId}` (`deleteProject`); API `GET /project-permissions` (`listProjectPermissions`); API `POST /project-permissions` (`createProjectPermission`); API `DELETE /project-permissions/{projectPermissionId}` (`deleteProjectPermission`); 테이블: project, project_permission
- 완료 기준: AC-FN-SFR-002-01-1 ~ AC-FN-SFR-002-01-17 (17개) 테스트 통과
- 상태: 진행 가능

### TASK-113 · 거래처 등록·관리(일반·금융) (1차)

- 근거: 기능 FN-SFR-002-04 · 요구사항 SFR-002-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027
- 만들 것: API `GET /partners` (`listPartners`); API `POST /partners` (`createPartner`); API `PATCH /partners/{partnerId}` (`updatePartner`); 테이블: partner
- 완료 기준: AC-FN-SFR-002-04-1 ~ AC-FN-SFR-002-04-18 (18개) 테스트 통과
- 상태: 진행 가능

### TASK-114 · 본예산 신청 (1차)

- 근거: 기능 FN-SFR-003-01 · 요구사항 SFR-003-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-018, TASK-017
- 만들 것: API `GET /budget-mains` (`listBudgetMains`); API `POST /budget-mains` (`createBudgetMain`); 테이블: budget_main
- 완료 기준: AC-FN-SFR-003-01-1 ~ AC-FN-SFR-003-01-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-115 · 본예산 마감·승인 처리 (1차)

- 근거: 기능 FN-SFR-003-02 · 요구사항 SFR-003-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-018, TASK-017
- 만들 것: API `POST /budget-mains/{budgetMainId}/close` (`closeBudgetMain`); API `POST /budget-mains/{budgetMainId}/cancel-close` (`cancelCloseBudgetMain`); API `POST /budget-mains/{budgetMainId}/approve` (`approveBudgetMain`); API `POST /budget-mains/{budgetMainId}/cancel-approval` (`cancelApprovalBudgetMain`); 테이블: budget_main
- 완료 기준: AC-FN-SFR-003-02-1 ~ AC-FN-SFR-003-02-23 (23개) 테스트 통과
- 상태: 진행 가능

### TASK-116 · 예산조정 신청 및 마감 (1차)

- 근거: 기능 FN-SFR-003-05 · 요구사항 SFR-003-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-018
- 만들 것: API `GET /budget-accounts/execution-status` (`listBudgetAccountExecutionStatus`); API `POST /budget-adjustments` (`createBudgetAdjustment`); API `POST /budget-adjustments/{budgetAdjustmentId}/close` (`closeBudgetAdjustment`); 테이블: budget_adjustment
- 완료 기준: AC-FN-SFR-003-05-1 ~ AC-FN-SFR-003-05-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-117 · 품의서 입력 및 승인 (1차)

- 근거: 기능 FN-SFR-004-01 · 요구사항 SFR-004-01, SFR-004-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-018, TASK-017, TASK-029
- 만들 것: API `GET /budget-accounts/execution-status` (`listBudgetAccountExecutionStatus` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /requisitions` (`createRequisition`); API `GET /requisitions/{requisitionId}` (`getRequisition`); 테이블: requisition
- 완료 기준: AC-FN-SFR-004-01-1 ~ AC-FN-SFR-004-01-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-118 · 거래처·계좌·카드·프로젝트 기준정보 관리 (1차)

- 근거: 기능 FN-SFR-006-03 · 요구사항 SFR-006-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017
- 만들 것: API `GET /partners` (`listPartners` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /partners` (`createPartner` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /partners/{partnerId}` (`updatePartner2`); API `GET /partner-accounts` (`listPartnerAccounts` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /partner-accounts` (`createPartnerAccount` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /projects` (`listProjects` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /projects` (`createProject` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /projects/{projectId}` (`updateProject2`); 테이블: project, partner
- 완료 기준: AC-FN-SFR-006-03-1 ~ AC-FN-SFR-006-03-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-119 · 자동전표 증빙항목 및 자료수집·자동분개 설정 (1차)

- 근거: 기능 FN-SFR-007-01 · 요구사항 SFR-007-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027
- 만들 것: API `GET /auto-journal-settings` (`listAutoJournalSettings`); API `POST /auto-journal-settings` (`createAutoJournalSetting`); API `PUT /auto-journal-settings/{autoJournalSettingId}` (`updateAutoJournalSetting`); 테이블: account_subject, partner, auto_journal_setting
- 완료 기준: AC-FN-SFR-007-01-1 ~ AC-FN-SFR-007-01-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-120 · 결산자료 입력·관리 (1차)

- 근거: 기능 FN-SFR-010-01 · 요구사항 SFR-010-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /closing-data` (`listClosingData`); API `POST /closing-data` (`createClosingData`); API `PATCH /closing-data/{closingDataId}` (`updateClosingData`); API `DELETE /closing-data/{closingDataId}` (`deleteClosingData`); 테이블: department, project, account_subject, accounting_unit, closing_data
- 완료 기준: AC-FN-SFR-010-01-1 ~ AC-FN-SFR-010-01-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-121 · 인사기록카드 상세정보 관리 (1차)

- 근거: 기능 FN-SFR-012-05 · 요구사항 SFR-012-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-029
- 만들 것: API `GET /employee-families` (`listEmployeeFamilies`); API `POST /employee-families` (`createEmployeeFamily`); API `PATCH /employee-families/{employeeFamilyId}` (`updateEmployeeFamily`); API `DELETE /employee-families/{employeeFamilyId}` (`deleteEmployeeFamily`); API `GET /employee-educations` (`listEmployeeEducations`); API `POST /employee-educations` (`createEmployeeEducation`); API `PATCH /employee-educations/{employeeEducationId}` (`updateEmployeeEducation`); API `DELETE /employee-educations/{employeeEducationId}` (`deleteEmployeeEducation`); API `GET /employee-careers` (`listEmployeeCareers`); API `POST /employee-careers` (`createEmployeeCareer`); API `PATCH /employee-careers/{employeeCareerId}` (`updateEmployeeCareer`); API `DELETE /employee-careers/{employeeCareerId}` (`deleteEmployeeCareer`); API `GET /employee-licenses` (`listEmployeeLicenses`); API `POST /employee-licenses` (`createEmployeeLicense`); API `PATCH /employee-licenses/{employeeLicenseId}` (`updateEmployeeLicense`); API `DELETE /employee-licenses/{employeeLicenseId}` (`deleteEmployeeLicense`); API `GET /employee-languages` (`listEmployeeLanguages`); API `POST /employee-languages` (`createEmployeeLanguage`); API `PATCH /employee-languages/{employeeLanguageId}` (`updateEmployeeLanguage`); API `DELETE /employee-languages/{employeeLanguageId}` (`deleteEmployeeLanguage`); API `GET /employee-evaluations` (`listEmployeeEvaluations`); API `POST /employee-evaluations` (`createEmployeeEvaluation`); API `PATCH /employee-evaluations/{employeeEvaluationId}` (`updateEmployeeEvaluation`); API `DELETE /employee-evaluations/{employeeEvaluationId}` (`deleteEmployeeEvaluation`); API `GET /employee-reward-penalties` (`listEmployeeRewardPenalties`); API `POST /employee-reward-penalties` (`createEmployeeRewardPenalty`); API `PATCH /employee-reward-penalties/{employeeRewardPenaltyId}` (`updateEmployeeRewardPenalty`); API `DELETE /employee-reward-penalties/{employeeRewardPenaltyId}` (`deleteEmployeeRewardPenalty`); API `GET /employee-business-trips` (`listEmployeeBusinessTrips`); API `POST /employee-business-trips` (`createEmployeeBusinessTrip`); API `PATCH /employee-business-trips/{employeeBusinessTripId}` (`updateEmployeeBusinessTrip`); API `DELETE /employee-business-trips/{employeeBusinessTripId}` (`deleteEmployeeBusinessTrip`); API `GET /personnel-appointments` (`listPersonnelAppointments`); API `GET /education-attendees` (`listEducationAttendees`); 테이블: employee, change_history, personnel_record, employee_family, employee_education, employee_career, employee_license, employee_language, employee_evaluation, employee_reward_penalty, employee_business_trip, personnel_appointment, education_attendee
- 완료 기준: AC-FN-SFR-012-05-1 ~ AC-FN-SFR-012-05-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-122 · 휴직·단축근무 신청 검토·승인 (1차)

- 근거: 기능 FN-SFR-012-07 · 요구사항 SFR-012-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-012
- 만들 것: API `GET /leave-of-absence-requests` (`listLeaveOfAbsenceRequests`); API `POST /leave-of-absence-requests` (`createLeaveOfAbsenceRequest`); API `POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review` (`reviewLeaveOfAbsenceRequest`); 테이블: employee, approval_document, notification, change_history, personnel_record, leave_of_absence_request
- 완료 기준: AC-FN-SFR-012-07-1 ~ AC-FN-SFR-012-07-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-123 · 인사발령 신청 검토·승인 (1차)

- 근거: 기능 FN-SFR-013-01 · 요구사항 SFR-013-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-010, TASK-012
- 만들 것: API `GET /personnel-appointments` (`listPersonnelAppointments` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /personnel-appointments/{personnelAppointmentId}/approve` (`approvePersonnelAppointment`); API `POST /personnel-appointments/{personnelAppointmentId}/reject` (`rejectPersonnelAppointment`); 테이블: employee, menu_permission, approval_document, notification, change_history, personnel_appointment
- 완료 기준: AC-FN-SFR-013-01-1 ~ AC-FN-SFR-013-01-19 (19개) 테스트 통과
- 상태: 진행 가능

### TASK-124 · 인사발령 대상자 등록 및 발령상태 관리 (1차)

- 근거: 기능 FN-SFR-013-02 · 요구사항 SFR-013-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-029
- 만들 것: API `POST /personnel-appointments` (`createPersonnelAppointment`); API `PATCH /personnel-appointments/{personnelAppointmentId}/status` (`updatePersonnelAppointmentStatus`); 테이블: employee, department, personal_info_access_log, change_history, personnel_record, personnel_appointment
- 완료 기준: AC-FN-SFR-013-02-1 ~ AC-FN-SFR-013-02-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-125 · 인사발령 처리 및 발령공고 자동 게시 (1차)

- 근거: 기능 FN-SFR-013-03 · 요구사항 SFR-013-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-029
- 만들 것: API `POST /personnel-appointments/{personnelAppointmentId}/process` (`processPersonnelAppointment`); API `POST /personnel-appointments/{personnelAppointmentId}/repost-announcement` (`repostAppointmentAnnouncement`); 테이블: department, notification, personal_info_access_log, change_history, personnel_record, personnel_appointment, board_post
- 완료 기준: AC-FN-SFR-013-03-1 ~ AC-FN-SFR-013-03-17 (17개) 테스트 통과
- 상태: 진행 가능

### TASK-126 · 인사발령 이력·현황 조회 및 보고서 생성 (1차)

- 근거: 기능 FN-SFR-013-04 · 요구사항 SFR-013-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-010, TASK-029
- 만들 것: API `GET /personnel-appointment-histories` (`listPersonnelAppointmentHistories`); API `GET /personnel-appointment-histories/summary` (`getPersonnelAppointmentSummary`); API `POST /personnel-appointment-reports` (`createPersonnelAppointmentReport`); 테이블: employee, department, menu_permission, personal_info_access_log, personnel_record, personnel_appointment
- 완료 기준: AC-FN-SFR-013-04-1 ~ AC-FN-SFR-013-04-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-127 · 임직원 현황 조회 (1차)

- 근거: 기능 FN-SFR-014-03 · 요구사항 SFR-014-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-010, TASK-029
- 만들 것: API `GET /personnel-status` (`listPersonnelStatus`); 테이블: employee, department, menu_permission, personal_info_access_log, personnel_record, employee_family, personnel_appointment
- 완료 기준: AC-FN-SFR-014-03-1 ~ AC-FN-SFR-014-03-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-128 · 교육과정 및 대상자 관리 (1차)

- 근거: 기능 FN-SFR-015-02 · 요구사항 SFR-015-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /education-courses` (`createEducationCourse`); API `PATCH /education-courses/{educationCourseId}` (`updateEducationCourse`); API `POST /education-sessions` (`createEducationSession`); API `GET /education-attendees` (`listEducationAttendees` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /education-attendees` (`createEducationAttendee`); API `DELETE /education-attendees/{educationAttendeeId}` (`deleteEducationAttendee`); API `POST /education-result-reports` (`createEducationResultReport`); 테이블: employee, change_history, education_code, education_course, education_session, education_attendee, education_result_report
- 완료 기준: AC-FN-SFR-015-02-1 ~ AC-FN-SFR-015-02-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-129 · 교육신청 및 승인 처리 (1차)

- 근거: 기능 FN-SFR-015-03 · 요구사항 SFR-015-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-012, TASK-128
- 만들 것: API `POST /education-applications` (`createEducationApplication`); API `POST /education-applications/{educationApplicationId}/approve` (`approveEducationApplication`); API `POST /education-applications/{educationApplicationId}/reject` (`rejectEducationApplication`); API `POST /education-applications/{educationApplicationId}/cancel-approval` (`cancelEducationApplicationApproval`); API `DELETE /education-applications/{educationApplicationId}` (`deleteEducationApplication`); 테이블: employee, approval_document, notification, change_history, education_session, education_attendee, education_application
- 완료 기준: AC-FN-SFR-015-03-1 ~ AC-FN-SFR-015-03-20 (20개) 테스트 통과
- 상태: 진행 가능

### TASK-130 · 증명서 신청 검토·승인 (1차)

- 근거: 기능 FN-SFR-016-03 · 요구사항 SFR-016-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-012
- 만들 것: API `POST /certificate-requests` (`createCertificateRequest`); API `POST /certificate-requests/{certificateRequestId}/approve` (`approveCertificateRequest`); API `POST /certificate-requests/{certificateRequestId}/reject` (`rejectCertificateRequest`); 테이블: employee, approval_document, notification, change_history, certificate_type, certificate_request
- 완료 기준: AC-FN-SFR-016-03-1 ~ AC-FN-SFR-016-03-18 (18개) 테스트 통과
- 상태: 진행 가능

### TASK-131 · 증명서 관리대장 조회 (1차)

- 근거: 기능 FN-SFR-016-04 · 요구사항 SFR-016-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-029
- 만들 것: API `GET /certificate-requests` (`listCertificateRequests`); 테이블: employee, personal_info_access_log, certificate_type, certificate_request
- 완료 기준: AC-FN-SFR-016-04-1 ~ AC-FN-SFR-016-04-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-132 · 근태스케줄(연차계획·연차촉진·출퇴근 연동) 관리 (1차)

- 근거: 기능 FN-SFR-017-06 · 요구사항 SFR-017-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-038, TASK-029, TASK-030
- 만들 것: API `GET /annual-leave-plans` (`listAnnualLeavePlans`); API `POST /annual-leave-plans` (`createAnnualLeavePlan`); API `PUT /annual-leave-plans/{annualLeavePlanId}` (`updateAnnualLeavePlan`); API `GET /leave-promotions` (`listLeavePromotions`); API `POST /leave-promotions` (`createLeavePromotion`); 테이블: employee, change_history, employee_attendance_setting, annual_leave_plan, leave_promotion
- 완료 기준: AC-FN-SFR-017-06-1 ~ AC-FN-SFR-017-06-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-133 · 근태 신청 및 결재 연계 (1차)

- 근거: 기능 FN-SFR-018-01 · 요구사항 SFR-018-02, SFR-018-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-029
- 만들 것: API `GET /attendance-requests` (`listAttendanceRequests`); API `POST /attendance-requests` (`createAttendanceRequest`); API `POST /attendance-requests/{attendanceRequestId}/cancel` (`cancelAttendanceRequest`); 테이블: attendance_request
- 완료 기준: AC-FN-SFR-018-01-1 ~ AC-FN-SFR-018-01-20 (20개) 테스트 통과
- 상태: 진행 가능

### TASK-134 · 근태 설정 관리 (1차)

- 근거: 기능 FN-SFR-018-02 · 요구사항 SFR-018-05, SFR-018-09
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-029
- 만들 것: API `GET /system-settings` (`listSystemSettings` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /system-settings/{systemSettingId}` (`updateSystemSetting2`); API `PUT /attendance-items/{attendanceItemId}` (`updateAttendanceItem2`); API `PUT /approval-forms/{approvalFormId}` (`updateApprovalForm`); 테이블: approval_form, attendance_request, system_setting, attendance_item
- 완료 기준: AC-FN-SFR-018-02-1 ~ AC-FN-SFR-018-02-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-135 · 근태 조정 (1차)

- 근거: 기능 FN-SFR-018-04 · 요구사항 SFR-018-06, SFR-018-09
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-029
- 만들 것: API `POST /attendance-requests/adjust` (`adjustAttendance`); 테이블: attendance_request, commute_record
- 완료 기준: AC-FN-SFR-018-04-1 ~ AC-FN-SFR-018-04-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-136 · 근태 현황 및 집계 조회 (1차)

- 근거: 기능 FN-SFR-018-05 · 요구사항 SFR-018-03, SFR-018-09
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-029
- 만들 것: API `GET /attendance-status/daily` (`listDailyAttendanceStatus`); API `GET /attendance-status/monthly` (`listMonthlyAttendanceStatus`); API `GET /attendance-status/summary` (`listAttendanceSummary`); 테이블: employee, department, attendance_request, commute_record
- 완료 기준: AC-FN-SFR-018-05-1 ~ AC-FN-SFR-018-05-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-137 · 근무시간 집계 및 현황 조회 (1차)

- 근거: 기능 FN-SFR-018-06 · 요구사항 SFR-018-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-029
- 만들 것: API `GET /work-hours/weekly` (`listWeeklyWorkHours`); API `GET /work-hours/type-summary` (`listAttendanceTypeSummary`); 테이블: attendance_request, system_setting, commute_record
- 완료 기준: AC-FN-SFR-018-06-1 ~ AC-FN-SFR-018-06-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-138 · 근태 확정 관리 (1차)

- 근거: 기능 FN-SFR-018-07 · 요구사항 SFR-018-08
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `GET /attendance-closings/preview` (`previewAttendanceClosing`); API `POST /attendance-closings` (`createAttendanceClosing`); API `POST /attendance-closings/{attendanceClosingId}/cancel` (`cancelAttendanceClosing`); 테이블: approval_document, attendance_request, commute_record, attendance_closing
- 완료 기준: AC-FN-SFR-018-07-1 ~ AC-FN-SFR-018-07-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-139 · 연차조정 및 정산 (1차)

- 근거: 기능 FN-SFR-019-03 · 요구사항 SFR-019-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-009
- 만들 것: API `POST /annual-leaves/{annualLeaveId}/adjust` (`adjustAnnualLeave`); API `POST /annual-leave-settlements` (`createAnnualLeaveSettlement`); 테이블: employee, change_history, annual_leave, annual_leave_settlement
- 완료 기준: AC-FN-SFR-019-03-1 ~ AC-FN-SFR-019-03-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-140 · 월별 연차계획·연차사용촉진 운영 및 현황 조회 (1차)

- 근거: 기능 FN-SFR-019-06 · 요구사항 SFR-019-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-012, TASK-009
- 만들 것: API `POST /annual-leave-plans` (`createAnnualLeavePlan` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /leave-promotions` (`createLeavePromotion` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /leave-promotions` (`listLeavePromotions` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, approval_document, notification, annual_leave_plan, leave_promotion, annual_leave
- 완료 기준: AC-FN-SFR-019-06-1 ~ AC-FN-SFR-019-06-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-141 · 사회보험 코드·환경 및 공제항목 관리 (1차)

- 근거: 기능 FN-SFR-020-03 · 요구사항 SFR-020-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-012
- 만들 것: API `GET /payroll-codes` (`listPayrollCodes` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /payroll-codes` (`createPayrollCode` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PATCH /payroll-codes/{payrollCodeId}` (`updatePayrollCode` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /payroll-items` (`listPayrollItems`); API `POST /payroll-items` (`createPayrollItem`); API `PATCH /payroll-items/{payrollItemId}` (`updatePayrollItem`); API `GET /system-settings` (`listSystemSettings` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PATCH /system-settings/{systemSettingId}` (`updateSystemSetting` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /withholding-adjustment-requests` (`createWithholdingAdjustmentRequest`); API `GET /withholding-adjustment-requests` (`listWithholdingAdjustmentRequests`); API `PATCH /withholding-adjustment-requests/{withholdingAdjustmentRequestId}` (`updateWithholdingAdjustmentRequest`); 테이블: employee, approval_document, personal_info_access_log, system_setting, change_history, payroll_code, payroll_item, withholding_adjustment_request
- 완료 기준: AC-FN-SFR-020-03-1 ~ AC-FN-SFR-020-03-20 (20개) 테스트 통과
- 상태: 진행 가능

### TASK-142 · 급여대장·급여명세·급여현황 조회 (1차)

- 근거: 기능 FN-SFR-021-15 · 요구사항 SFR-021-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-141
- 만들 것: API `GET /payrolls` (`listPayrolls`); API `GET /payrolls/{payrollId}` (`getPayroll`); API `GET /payrolls/summary` (`getPayrollSummary`); 테이블: employee, payroll, personal_info_access_log, payroll_detail
- 완료 기준: AC-FN-SFR-021-15-1 ~ AC-FN-SFR-021-15-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-143 · 사회보험 취득·상실 대상자 등록 및 신고서 관리 (1차)

- 근거: 기능 FN-SFR-022-01 · 요구사항 SFR-022-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014
- 만들 것: API `POST /social-insurance-enrollments` (`createSocialInsuranceEnrollment`); API `GET /social-insurance-enrollments` (`listSocialInsuranceEnrollments`); API `POST /social-insurance-reports` (`createSocialInsuranceReport`); API `GET /social-insurance-reports` (`listSocialInsuranceReports`); API `POST /social-insurance-reports/{socialInsuranceReportId}/print` (`printSocialInsuranceReport`); 테이블: employee, personnel_record, social_insurance_enrollment, social_insurance_report
- 완료 기준: AC-FN-SFR-022-01-1 ~ AC-FN-SFR-022-01-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-144 · 사회보험 보수총액·고용산재·이직확인·근로내용확인 신고서 관리 (1차)

- 근거: 기능 FN-SFR-022-02 · 요구사항 SFR-022-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-143
- 만들 것: API `POST /social-insurance-reports` (`createSocialInsuranceReport` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /social-insurance-reports` (`listSocialInsuranceReports` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /social-insurance-reports/{socialInsuranceReportId}/print` (`printSocialInsuranceReport` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, payroll, personal_info_access_log, personnel_record, social_insurance_report
- 완료 기준: AC-FN-SFR-022-02-1 ~ AC-FN-SFR-022-02-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-145 · 사회보험 공제내역서 관리 (1차)

- 근거: 기능 FN-SFR-022-03 · 요구사항 SFR-022-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-141
- 만들 것: API `GET /social-insurance-deductions` (`listSocialInsuranceDeductions`); 테이블: employee, payroll, personal_info_access_log, payroll_detail, social_insurance_grade
- 완료 기준: AC-FN-SFR-022-03-1 ~ AC-FN-SFR-022-03-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-146 · 연말정산 항목 관리 및 자료 입력 (1차)

- 근거: 기능 FN-SFR-023-06 · 요구사항 SFR-023-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-067
- 만들 것: API `POST /year-end-items` (`createYearEndItem`); API `PUT /year-end-items/{yearEndItemId}` (`updateYearEndItem`); API `POST /year-end-data` (`createYearEndData`); API `PUT /year-end-data/{yearEndDataId}` (`updateYearEndData`); 테이블: year_end_item, year_end_data, year_end_result
- 완료 기준: AC-FN-SFR-023-06-1 ~ AC-FN-SFR-023-06-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-147 · 연말정산 납부세액 분납 및 현황 관리 (1차)

- 근거: 기능 FN-SFR-023-08 · 요구사항 SFR-023-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /year-end-installments` (`createYearEndInstallment`); API `GET /year-end-installments` (`listYearEndInstallments`); API `GET /year-end-results` (`listYearEndResults`); 테이블: year_end_result, year_end_installment
- 완료 기준: AC-FN-SFR-023-08-1 ~ AC-FN-SFR-023-08-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-148 · 구매품의서 작성 및 예산 통제 (1차)

- 근거: 기능 FN-SFR-024-01 · 요구사항 SFR-024-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-018, TASK-017, TASK-029
- 만들 것: API `POST /requisitions` (`createRequisition` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /requisitions/{requisitionId}` (`updateRequisition`); API `DELETE /requisitions/{requisitionId}` (`deleteRequisition`); API `GET /requisitions/budget-status` (`listRequisitionBudgetStatus`); 테이블: requisition
- 완료 기준: AC-FN-SFR-024-01-1 ~ AC-FN-SFR-024-01-18 (18개) 테스트 통과
- 상태: 진행 가능

### TASK-149 · 구매품의 조회 및 승인 처리 (1차)

- 근거: 기능 FN-SFR-024-02 · 요구사항 SFR-024-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005, TASK-012
- 만들 것: API `GET /requisitions` (`listRequisitions`); API `GET /requisitions/{requisitionId}` (`getRequisition` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /requisitions/{requisitionId}/approve` (`approveRequisition` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /requisitions/{requisitionId}/reject` (`rejectRequisition`); 테이블: project, budget_account, approval_document, notification, requisition
- 완료 기준: AC-FN-SFR-024-02-1 ~ AC-FN-SFR-024-02-20 (20개) 테스트 통과
- 상태: 진행 가능

### TASK-150 · 메뉴별 알림 연계 (1차)

- 근거: 기능 FN-SFR-028-02 · 요구사항 SFR-028-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012
- 만들 것: 배치·자동 실행: 각 메뉴의 업무 이벤트 발생 시 시스템 내부에서 수신 대상자 확인, 통합알림 생성, 채널 발송이 자동으로 처리되며 HTTP 호출을 받는 기능이 아니다.; 테이블: menu_permission, approval_document, notification, attendance_request, resource_reservation, schedule, board_post, messenger_message
- 완료 기준: AC-FN-SFR-028-02-1 ~ AC-FN-SFR-028-02-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-151 · 일괄기안·연속결재·재기안 (1차)

- 근거: 기능 FN-SFR-029-04 · 요구사항 SFR-029-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `POST /approval-documents` (`createApprovalDocument`); API `POST /approval-documents/batch-draft` (`batchDraftApprovalDocuments`); API `POST /approval-documents/{approvalDocumentId}/redraft` (`redraftApprovalDocument`); 테이블: approval_document, approval_line
- 완료 기준: AC-FN-SFR-029-04-1 ~ AC-FN-SFR-029-04-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-152 · 한글웹기안기 웹기안 (1차)

- 근거: 기능 FN-SFR-030-03 · 요구사항 SFR-030-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /approval-documents` (`createApprovalDocument` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: approval_document, approval_form, approval_line
- 완료 기준: AC-FN-SFR-030-03-1 ~ AC-FN-SFR-030-03-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-153 · 전자결재 문서 인수인계 (1차)

- 근거: 기능 FN-SFR-031-02 · 요구사항 SFR-031-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012
- 만들 것: API `POST /approval-handovers` (`createApprovalHandover`); 테이블: employee, department, approval_document, change_history, personnel_appointment, approval_handover
- 완료 기준: AC-FN-SFR-031-02-1 ~ AC-FN-SFR-031-02-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-154 · 완료문서 보관 (1차)

- 근거: 기능 FN-SFR-031-03 · 요구사항 SFR-031-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-014
- 만들 것: 배치·자동 실행: 완료 시점에 시스템이 자동 실행하는 내부 처리(문서함 이관·PDF 변환·첨부 등록)로 HTTP 호출이 필요 없다; 테이블: approval_document, approval_form, attachment, document_box, document_box_item
- 완료 기준: AC-FN-SFR-031-03-1 ~ AC-FN-SFR-031-03-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-155 · 증명서 신청 및 발급 (1차)

- 근거: 기능 FN-SFR-032-02 · 요구사항 SFR-032-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-012
- 만들 것: API `POST /certificate-requests` (`createCertificateRequest` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /certificate-requests` (`listCertificateRequests` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, approval_document, notification, personal_info_access_log, certificate_type, certificate_request
- 완료 기준: AC-FN-SFR-032-02-1 ~ AC-FN-SFR-032-02-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-156 · 근태신청 및 근무변경 관리 (1차)

- 근거: 기능 FN-SFR-032-03 · 요구사항 SFR-032-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-029
- 만들 것: API `POST /attendance-requests` (`createAttendanceRequest` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /attendance-requests` (`listAttendanceRequests` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /attendance-requests/{attendanceRequestId}` (`updateAttendanceRequest`); API `DELETE /attendance-requests/{attendanceRequestId}` (`deleteAttendanceRequest`); 테이블: attendance_request
- 완료 기준: AC-FN-SFR-032-03-1 ~ AC-FN-SFR-032-03-19 (19개) 테스트 통과
- 상태: 진행 가능

### TASK-157 · 근무시간 동의 및 근태집계 현황 조회 (1차)

- 근거: 기능 FN-SFR-032-04 · 요구사항 SFR-032-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-029
- 만들 것: API `POST /attendance-requests/{attendanceRequestId}/consent` (`consentAttendanceRequest`); API `GET /attendance-summaries` (`listAttendanceSummaries`); 테이블: employee, attendance_request
- 완료 기준: AC-FN-SFR-032-04-1 ~ AC-FN-SFR-032-04-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-158 · 월별 연차계획 작성 및 연차촉진 확인 (1차)

- 근거: 기능 FN-SFR-032-05 · 요구사항 SFR-032-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-009
- 만들 것: API `POST /annual-leave-plans` (`createAnnualLeavePlan` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /annual-leave-plans` (`listAnnualLeavePlans` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /annual-leave-plans/{annualLeavePlanId}` (`updateAnnualLeavePlan` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /leave-promotions` (`listLeavePromotions` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: approval_document, notification, attendance_request, annual_leave_plan, leave_promotion, annual_leave
- 완료 기준: AC-FN-SFR-032-05-1 ~ AC-FN-SFR-032-05-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-159 · 개인 연말정산 자료 입력 및 관리 (1차)

- 근거: 기능 FN-SFR-032-07 · 요구사항 SFR-032-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-146
- 만들 것: API `GET /year-end-data` (`listYearEndData`); API `POST /year-end-data` (`createYearEndData` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PATCH /year-end-data/{yearEndDataId}` (`updateYearEndData2`); API `POST /year-end-data/{yearEndDataId}/submit` (`submitYearEndData`); 테이블: employee, attachment, personal_info_access_log, personnel_record, year_end_data
- 완료 기준: AC-FN-SFR-032-07-1 ~ AC-FN-SFR-032-07-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-160 · 지출품의서 작성 및 결재 연계 (1차)

- 근거: 기능 FN-SFR-032-08 · 요구사항 SFR-032-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005, TASK-012
- 만들 것: API `POST /requisitions` (`createRequisition` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /requisitions/{requisitionId}/submit` (`submitRequisition`); 테이블: project, budget_account, approval_document, notification, attachment, requisition
- 완료 기준: AC-FN-SFR-032-08-1 ~ AC-FN-SFR-032-08-19 (19개) 테스트 통과
- 상태: 진행 가능

### TASK-161 · 자원 예약 현황 조회 (1차)

- 근거: 기능 FN-SFR-033-01 · 요구사항 SFR-033-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-014
- 만들 것: API `GET /resources` (`listResources`); API `GET /resource-reservations` (`listResourceReservations`); API `GET /resource-reservations/{resourceReservationId}` (`getResourceReservation`); 테이블: menu_permission, attachment, resource_category, resource, resource_attribute, resource_permission, resource_reservation
- 완료 기준: AC-FN-SFR-033-01-1 ~ AC-FN-SFR-033-01-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-162 · 자원 예약 등록 (1차)

- 근거: 기능 FN-SFR-033-02 · 요구사항 SFR-033-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-161, TASK-014
- 만들 것: API `POST /resource-reservations` (`createResourceReservation`); 테이블: attachment, resource, resource_permission, resource_reservation
- 완료 기준: AC-FN-SFR-033-02-1 ~ AC-FN-SFR-033-02-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-163 · 자원 분류·목록 및 설정 관리 (1차)

- 근거: 기능 FN-SFR-033-03 · 요구사항 SFR-033-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-014
- 만들 것: API `GET /resource-categories` (`listResourceCategories`); API `POST /resource-categories` (`createResourceCategory`); API `PATCH /resource-categories/{resourceCategoryId}` (`updateResourceCategory`); API `DELETE /resource-categories/{resourceCategoryId}` (`deleteResourceCategory`); API `POST /resources` (`createResource`); API `PATCH /resources/{resourceId}` (`updateResource`); API `DELETE /resources/{resourceId}` (`deleteResource`); 테이블: resource_category, resource, resource_attribute, resource_permission
- 완료 기준: AC-FN-SFR-033-03-1 ~ AC-FN-SFR-033-03-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-164 · 자원 예약 승인 처리 (1차)

- 근거: 기능 FN-SFR-033-05 · 요구사항 SFR-033-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-161
- 만들 것: API `POST /resource-reservations/{resourceReservationId}/approve` (`approveResourceReservation`); API `POST /resource-reservations/{resourceReservationId}/reject` (`rejectResourceReservation`); API `POST /resource-reservations/{resourceReservationId}/cancel-approval` (`cancelApprovalResourceReservation`); API `POST /resource-reservations/{resourceReservationId}/cancel` (`cancelResourceReservation`); API `DELETE /resource-reservations/{resourceReservationId}` (`deleteResourceReservation`); 테이블: change_history, resource, resource_reservation
- 완료 기준: AC-FN-SFR-033-05-1 ~ AC-FN-SFR-033-05-24 (24개) 테스트 통과
- 상태: 진행 가능

### TASK-165 · 자원 예약 알림 발송 (1차)

- 근거: 기능 FN-SFR-033-06 · 요구사항 SFR-033-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-161
- 만들 것: 배치·자동 실행: 예약 등록·승인 이벤트 발생 시 시스템이 통합알림으로 자동 발송하는 내부 처리이며 직접 호출되는 API가 없다.; 테이블: notification, resource_reservation
- 완료 기준: AC-FN-SFR-033-06-1 ~ AC-FN-SFR-033-06-8 (8개) 테스트 통과
- 상태: 진행 가능

### TASK-166 · 공지·게시물 등록 (1차)

- 근거: 기능 FN-SFR-034-01 · 요구사항 SFR-034-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010
- 만들 것: API `POST /board-posts` (`createBoardPost`); 테이블: department, menu_permission, notification, attachment, board_post, post_audience
- 완료 기준: AC-FN-SFR-034-01-1 ~ AC-FN-SFR-034-01-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-167 · 공지·게시물 열람자 확인 (1차)

- 근거: 기능 FN-SFR-034-02 · 요구사항 SFR-034-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /board-posts/{boardPostId}/readers` (`listBoardPostReaders`); 테이블: employee, department, board_post, post_read_log
- 완료 기준: AC-FN-SFR-034-02-1 ~ AC-FN-SFR-034-02-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-168 · 공지·게시물 분류별·최근 조회 (1차)

- 근거: 기능 FN-SFR-034-03 · 요구사항 SFR-034-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `GET /board-posts` (`listBoardPosts`); API `GET /board-posts/{boardPostId}` (`getBoardPost`); 테이블: notification, board_post, post_read_log
- 완료 기준: AC-FN-SFR-034-03-1 ~ AC-FN-SFR-034-03-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-169 · 설문조사 등록 및 공개·대상·알림 설정 (1차)

- 근거: 기능 FN-SFR-035-01 · 요구사항 SFR-035-01, SFR-035-02, SFR-035-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /surveys` (`createSurvey`); 테이블: notification, survey, survey_target
- 완료 기준: AC-FN-SFR-035-01-1 ~ AC-FN-SFR-035-01-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-170 · 실시간 채팅 대화방 이용 및 개인 대화방 관리 (1차)

- 근거: 기능 FN-SFR-036-01 · 요구사항 SFR-036-01
- 선행 작업: TASK-002, TASK-003, TASK-004
- 만들 것: API `GET /messenger-rooms` (`listMessengerRooms`); API `POST /messenger-rooms` (`createMessengerRoom`); API `PATCH /messenger-rooms/{messengerRoomId}` (`updateMessengerRoom`); API `DELETE /messenger-rooms/{messengerRoomId}` (`deleteMessengerRoom`); 테이블: employee, department, messenger_room, messenger_room_member
- 완료 기준: AC-FN-SFR-036-01-1 ~ AC-FN-SFR-036-01-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-171 · 알림 이력 조회 및 메신저 메시지 통합 관리 (1차)

- 근거: 기능 FN-SFR-036-04 · 요구사항 SFR-036-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-170
- 만들 것: API `GET /messenger-messages` (`listMessengerMessages`); API `DELETE /messenger-messages/{messengerMessageId}` (`deleteMessengerMessage`); API `GET /notifications` (`listNotifications` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `DELETE /notifications/{notificationId}` (`deleteNotification`); 테이블: notification, attachment, messenger_message
- 완료 기준: AC-FN-SFR-036-04-1 ~ AC-FN-SFR-036-04-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-172 · 메신저 메시지 검색 (1차)

- 근거: 기능 FN-SFR-036-05 · 요구사항 SFR-036-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-170
- 만들 것: API `GET /messenger-messages/search` (`searchMessengerMessages`); 테이블: employee, attachment, messenger_message
- 완료 기준: AC-FN-SFR-036-05-1 ~ AC-FN-SFR-036-05-7 (7개) 테스트 통과
- 상태: 진행 가능

### TASK-173 · 메신저 데이터 서버 통합 저장 및 단말기 변경 시 조회 (1차)

- 근거: 기능 FN-SFR-036-07 · 요구사항 SFR-036-08
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-170
- 만들 것: API `GET /messenger-messages` (`listMessengerMessages` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /messenger-messages` (`createMessengerMessage` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /attachments` (`listAttachments` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /attachments` (`createAttachment` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: employee, attachment, messenger_message, auth_device
- 완료 기준: AC-FN-SFR-036-07-1 ~ AC-FN-SFR-036-07-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-174 · 모바일 메뉴 신규 건수 조회 (1차)

- 근거: 기능 FN-SFR-040-02 · 요구사항 SFR-040-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-012
- 만들 것: API `GET /mobile/menu-badges` (`listMobileMenuBadges`); 테이블: menu, menu_permission, approval_document, notification, board_post, mail_recipient
- 완료 기준: AC-FN-SFR-040-02-1 ~ AC-FN-SFR-040-02-7 (7개) 테스트 통과
- 상태: 진행 가능

### TASK-175 · 모바일 메일 작성·받은편지함 조회 (1차)

- 근거: 기능 FN-SFR-040-03 · 요구사항 SFR-040-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010
- 만들 것: API `GET /mail-messages/inbox` (`listInboxMailMessages`); API `POST /mail-messages` (`createMailMessage`); 테이블: menu_permission, attachment, mail_message, mail_recipient
- 완료 기준: AC-FN-SFR-040-03-1 ~ AC-FN-SFR-040-03-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-176 · 모바일 일정·자원예약 조회 (1차)

- 근거: 기능 FN-SFR-040-06 · 요구사항 SFR-040-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-161
- 만들 것: API `GET /schedules` (`listSchedules`); API `GET /resource-reservations` (`listResourceReservations` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: menu_permission, resource_reservation, schedule
- 완료 기준: AC-FN-SFR-040-06-1 ~ AC-FN-SFR-040-06-8 (8개) 테스트 통과
- 상태: 진행 가능

### TASK-177 · 모바일 결재문서 승인·반려 (1차)

- 근거: 기능 FN-SFR-040-07 · 요구사항 SFR-040-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-012
- 만들 것: API `POST /approval-documents/{approvalDocumentId}/approve` (`approveApprovalDocument`); API `POST /approval-documents/{approvalDocumentId}/reject` (`rejectApprovalDocument`); 테이블: menu_permission, approval_document, notification, approval_line
- 완료 기준: AC-FN-SFR-040-07-1 ~ AC-FN-SFR-040-07-20 (20개) 테스트 통과
- 상태: 진행 가능

### TASK-178 · 모바일 문서함 완료문서 조회 (1차)

- 근거: 기능 FN-SFR-040-09 · 요구사항 SFR-040-09
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `GET /document-box-items` (`listDocumentBoxItems`); API `GET /document-box-items/{documentBoxItemId}` (`getDocumentBoxItem`); 테이블: department, approval_document, attachment, document_box, document_box_item
- 완료 기준: AC-FN-SFR-040-09-1 ~ AC-FN-SFR-040-09-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-179 · 웹 오피스 문서 공유 및 권한 설정 (1차)

- 근거: 기능 FN-SFR-041-05 · 요구사항 SFR-041-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-170, TASK-017, TASK-101
- 만들 것: API `POST /office-documents/{officeDocumentId}/share` (`shareOfficeDocument`); 테이블: messenger_message, office_document, office_document_share
- 완료 기준: AC-FN-SFR-041-05-1 ~ AC-FN-SFR-041-05-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-180 · 내 문서함 및 공유 문서함 관리 (1차)

- 근거: 기능 FN-SFR-041-06 · 요구사항 SFR-041-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-101
- 만들 것: API `GET /office-documents` (`listOfficeDocuments`); API `GET /office-documents/{officeDocumentId}` (`getOfficeDocument`); API `PATCH /office-documents/{officeDocumentId}` (`updateOfficeDocument`); API `DELETE /office-documents/{officeDocumentId}` (`deleteOfficeDocument`); 테이블: office_document, office_document_share
- 완료 기준: AC-FN-SFR-041-06-1 ~ AC-FN-SFR-041-06-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-181 · 웹 오피스 ECM 연계 통합 관리 (1차)

- 근거: 기능 FN-SFR-041-07 · 요구사항 SFR-041-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-101
- 만들 것: API `POST /office-documents/{officeDocumentId}/link-ecm` (`linkOfficeDocumentToEcm`); API `GET /ecm-documents` (`listEcmDocuments`); 테이블: attachment, link_log, office_document, office_document_share
- 완료 기준: AC-FN-SFR-041-07-1 ~ AC-FN-SFR-041-07-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-182 · 하위사업 등록·관리 (1차)

- 근거: 기능 FN-SFR-002-02 · 요구사항 SFR-002-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-017, TASK-014
- 만들 것: API `GET /sub-projects` (`listSubProjects`); API `POST /sub-projects` (`createSubProject`); API `PATCH /sub-projects/{subProjectId}` (`updateSubProject`); API `DELETE /sub-projects/{subProjectId}` (`deleteSubProject`); API `GET /sub-project-permissions` (`listSubProjectPermissions`); API `POST /sub-project-permissions` (`createSubProjectPermission`); API `DELETE /sub-project-permissions/{subProjectPermissionId}` (`deleteSubProjectPermission`); 테이블: sub_project, sub_project_permission
- 완료 기준: AC-FN-SFR-002-02-1 ~ AC-FN-SFR-002-02-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-183 · 거래처 계좌 등록·관리 (1차)

- 근거: 기능 FN-SFR-002-05 · 요구사항 SFR-002-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-113
- 만들 것: API `GET /partner-accounts` (`listPartnerAccounts`); API `POST /partner-accounts` (`createPartnerAccount`); API `PATCH /partner-accounts/{partnerAccountId}` (`updatePartnerAccount`); API `DELETE /partner-accounts/{partnerAccountId}` (`deletePartnerAccount`); 테이블: partner_account
- 완료 기준: AC-FN-SFR-002-05-1 ~ AC-FN-SFR-002-05-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-184 · 실행예산 편성·신청 및 마감 처리 (1차)

- 근거: 기능 FN-SFR-003-03 · 요구사항 SFR-003-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-114
- 만들 것: API `GET /budget-executions` (`listBudgetExecutions`); API `POST /budget-executions` (`createBudgetExecution`); API `POST /budget-executions/{budgetExecutionId}/close` (`closeBudgetExecution`); API `POST /budget-executions/{budgetExecutionId}/cancel-close` (`cancelCloseBudgetExecution`); API `POST /budget-executions/{budgetExecutionId}/approve` (`approveBudgetExecution`); API `POST /budget-executions/{budgetExecutionId}/cancel-approval` (`cancelApprovalBudgetExecution`); 테이블: budget_execution
- 완료 기준: AC-FN-SFR-003-03-1 ~ AC-FN-SFR-003-03-23 (23개) 테스트 통과
- 상태: 진행 가능

### TASK-185 · 예산 폐쇄기간 및 이월 관리 (1차)

- 근거: 기능 FN-SFR-003-06 · 요구사항 SFR-003-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005, TASK-117, TASK-113, TASK-029
- 만들 것: API `GET /budget-closing-periods` (`listBudgetClosingPeriods`); API `POST /budget-closing-periods` (`createBudgetClosingPeriod`); API `GET /budget-carryovers` (`listBudgetCarryovers`); API `POST /budget-carryovers` (`createBudgetCarryover`); API `PATCH /budget-carryovers/{budgetCarryoverId}` (`updateBudgetCarryover`); 테이블: project, budget_account, budget_adjustment, expense_resolution, budget_closing_period, budget_carryover
- 완료 기준: AC-FN-SFR-003-06-1 ~ AC-FN-SFR-003-06-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-186 · 결의서 입력 및 승인 (1차)

- 근거: 기능 FN-SFR-004-02 · 요구사항 SFR-004-02, SFR-004-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-117, TASK-027, TASK-018, TASK-113, TASK-014, TASK-029
- 만들 것: API `POST /expense-resolutions` (`createExpenseResolution`); API `PUT /expense-resolutions/{expenseResolutionId}` (`updateExpenseResolution`); API `GET /budget-statuses` (`listBudgetStatuses`); 테이블: expense_resolution
- 완료 기준: AC-FN-SFR-004-02-1 ~ AC-FN-SFR-004-02-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-187 · 품의·결의 정보 조회 및 승인 처리 (1차)

- 근거: 기능 FN-SFR-004-03 · 요구사항 SFR-004-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-027, TASK-018, TASK-113, TASK-014
- 만들 것: API `GET /approval-items` (`listApprovalItems`); API `POST /expense-resolutions/{expenseResolutionId}/approve` (`approveExpenseResolution`); API `POST /requisitions/{requisitionId}/approve` (`approveRequisition`); 테이블: approval_document, requisition, expense_resolution, change_history
- 완료 기준: AC-FN-SFR-004-03-1 ~ AC-FN-SFR-004-03-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-188 · 원인행위 등록 및 관리 (1차)

- 근거: 기능 FN-SFR-004-04 · 요구사항 SFR-004-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005
- 만들 것: API `POST /budget-commitments` (`createBudgetCommitment`); API `GET /budget-commitments` (`listBudgetCommitments`); API `PUT /budget-commitments/{budgetCommitmentId}` (`updateBudgetCommitment`); API `POST /budget-commitments/{budgetCommitmentId}/cancel` (`cancelBudgetCommitment`); 테이블: project, budget_account, partner, budget_commitment
- 완료 기준: AC-FN-SFR-004-04-1 ~ AC-FN-SFR-004-04-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-189 · 수입·지출 등록 및 조회 (1차)

- 근거: 기능 FN-SFR-004-06 · 요구사항 SFR-004-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-005, TASK-117, TASK-029
- 만들 것: API `POST /expense-resolutions` (`createExpenseResolution` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /expense-resolutions` (`listExpenseResolutions`); API `POST /expense-resolutions/bulk-import` (`bulkImportExpenseResolutions`); 테이블: employee, department, project, budget_account, partner, expense_resolution
- 완료 기준: AC-FN-SFR-004-06-1 ~ AC-FN-SFR-004-06-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-190 · 계정별 초기이월 등록 및 마감 (1차)

- 근거: 기능 FN-SFR-006-04 · 요구사항 SFR-006-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027
- 만들 것: API `GET /account-carryovers` (`listAccountCarryovers`); API `POST /account-carryovers` (`createAccountCarryover`); API `PUT /account-carryovers/{accountCarryoverId}` (`updateAccountCarryover`); API `DELETE /account-carryovers/{accountCarryoverId}` (`deleteAccountCarryover`); API `POST /account-carryovers/{accountCarryoverId}/close` (`closeAccountCarryover`); API `POST /account-carryovers/{accountCarryoverId}/cancel-close` (`cancelCloseAccountCarryover`); 테이블: account_subject, partner, account_carryover
- 완료 기준: AC-FN-SFR-006-04-1 ~ AC-FN-SFR-006-04-17 (17개) 테스트 통과
- 상태: 진행 가능

### TASK-191 · 엑셀 일괄 업로드 (1차)

- 근거: 기능 FN-SFR-006-06 · 요구사항 SFR-002-04, SFR-006-03, SFR-006-04, SFR-012-03, SFR-012-06, SFR-019-02, SFR-021-01, SFR-021-04, SFR-025-02, SFR-018-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-027, TASK-029, TASK-005, TASK-009
- 만들 것: API `POST /excel-uploads` (`uploadExcelData`); 테이블: menu_permission, partner, attendance_request, payroll, asset, account_carryover, upload_history, change_history, personnel_record, annual_leave
- 완료 기준: AC-FN-SFR-006-06-1 ~ AC-FN-SFR-006-06-42 (42개) 테스트 통과
- 상태: 진행 가능

### TASK-192 · 고정자금 등록·관리 (1차)

- 근거: 기능 FN-SFR-009-02 · 요구사항 SFR-009-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005
- 만들 것: API `GET /fixed-funds` (`listFixedFunds`); API `POST /fixed-funds` (`createFixedFund`); API `PATCH /fixed-funds/{fixedFundId}` (`updateFixedFund`); API `DELETE /fixed-funds/{fixedFundId}` (`deleteFixedFund`); 테이블: project, budget_account, partner, fund_subject, fixed_fund
- 완료 기준: AC-FN-SFR-009-02-1 ~ AC-FN-SFR-009-02-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-193 · 자금수지계획 등록·관리 (1차)

- 근거: 기능 FN-SFR-009-03 · 요구사항 SFR-009-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-005, TASK-113, TASK-027, TASK-018
- 만들 것: API `GET /fund-plans` (`listFundPlans`); API `POST /fund-plans` (`createFundPlan`); API `PATCH /fund-plans/{fundPlanId}` (`updateFundPlan`); API `DELETE /fund-plans/{fundPlanId}` (`deleteFundPlan`); 테이블: fund_subject, fixed_fund, fund_plan
- 완료 기준: AC-FN-SFR-009-03-1 ~ AC-FN-SFR-009-03-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-194 · 교육평가 관리 (1차)

- 근거: 기능 FN-SFR-015-04 · 요구사항 SFR-015-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-128, TASK-017
- 만들 것: API `GET /education-evaluations` (`listEducationEvaluations`); API `POST /education-evaluations` (`createEducationEvaluation`); API `PATCH /education-evaluations/{educationEvaluationId}` (`updateEducationEvaluation`); 테이블: education_session, education_attendee, education_evaluation
- 완료 기준: AC-FN-SFR-015-04-1 ~ AC-FN-SFR-015-04-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-195 · 교육현황 조회 (1차)

- 근거: 기능 FN-SFR-015-05 · 요구사항 SFR-015-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-128, TASK-029
- 만들 것: API `GET /education-status` (`listEducationStatus`); 테이블: employee, department, education_course, education_session, education_attendee, education_application, education_evaluation
- 완료 기준: AC-FN-SFR-015-05-1 ~ AC-FN-SFR-015-05-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-196 · 연차 설정 및 신청 관리 (1차)

- 근거: 기능 FN-SFR-018-08 · 요구사항 SFR-018-10
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-009
- 만들 것: API `GET /annual-leaves` (`listAnnualLeaves`); API `GET /leave-usages` (`listLeaveUsages`); API `POST /attendance-requests` (`createAttendanceRequest` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /annual-leave-plans` (`listAnnualLeavePlans` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /leave-grant-rules` (`listLeaveGrantRules`); API `PATCH /leave-grant-rules/{leaveGrantRuleId}` (`updateLeaveGrantRule`); 테이블: approval_document, attendance_request, annual_leave_plan, annual_leave, leave_usage
- 완료 기준: AC-FN-SFR-018-08-1 ~ AC-FN-SFR-018-08-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-197 · 출장 및 외근 관리 (1차)

- 근거: 기능 FN-SFR-018-10 · 요구사항 SFR-018-11
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017
- 만들 것: API `POST /attendance-requests` (`createAttendanceRequest` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /attendance-requests/{attendanceRequestId}/submit` (`submitAttendanceRequest`); API `GET /attendance-requests` (`listAttendanceRequests` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: approval_document, attendance_request, attendance_trip_traveler
- 완료 기준: AC-FN-SFR-018-10-1 ~ AC-FN-SFR-018-10-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-198 · 연차 발생 및 사용 관리 (1차)

- 근거: 기능 FN-SFR-018-12 · 요구사항 SFR-018-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-029
- 만들 것: 배치·자동 실행: 스케줄러의 연차 발생과 근태 승인 시 사용 내역 기록은 시스템 내부 처리이며, 발생·사용 내역 확인은 연차 조회 API로 충족된다.; 테이블: attendance_request, personnel_record, leave_grant_rule, annual_leave, leave_usage
- 완료 기준: AC-FN-SFR-018-12-1 ~ AC-FN-SFR-018-12-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-199 · 연차 총괄현황 및 월별 사용 연차 조회 (1차)

- 근거: 기능 FN-SFR-019-05 · 요구사항 SFR-019-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-029, TASK-009
- 만들 것: API `GET /annual-leaves/summary` (`listAnnualLeaveSummaries`); 테이블: employee, department, attendance_request, annual_leave, leave_usage
- 완료 기준: AC-FN-SFR-019-05-1 ~ AC-FN-SFR-019-05-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-200 · 일용직 급여 일괄 입력 및 이체 현황 조회 (1차)

- 근거: 기능 FN-SFR-021-12 · 요구사항 SFR-021-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-113
- 만들 것: API `POST /daily-worker-payments` (`createDailyWorkerPayment` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /daily-worker-payments/bulk` (`bulkCreateDailyWorkerPayments`); API `GET /daily-worker-payments` (`listDailyWorkerPayments`); 테이블: employee, partner_account, payroll, personal_info_access_log, upload_history, daily_worker, daily_worker_payment
- 완료 기준: AC-FN-SFR-021-12-1 ~ AC-FN-SFR-021-12-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-201 · 자산 정보 등록·관리 (1차)

- 근거: 기능 FN-SFR-025-01 · 요구사항 SFR-025-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113
- 만들 것: API `POST /assets` (`createAsset` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PATCH /assets/{assetId}` (`updateAsset` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /assets` (`listAssets`); 테이블: asset
- 완료 기준: AC-FN-SFR-025-01-1 ~ AC-FN-SFR-025-01-17 (17개) 테스트 통과
- 상태: 진행 가능

### TASK-202 · 자산실사 계획 관리 (1차)

- 근거: 기능 FN-SFR-025-04 · 요구사항 SFR-025-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-027, TASK-005, TASK-113
- 만들 것: API `POST /asset-inspection-plans` (`createAssetInspectionPlan`); API `PATCH /asset-inspection-plans/{assetInspectionPlanId}` (`updateAssetInspectionPlan`); API `DELETE /asset-inspection-plans/{assetInspectionPlanId}` (`deleteAssetInspectionPlan`); API `POST /asset-inspection-plans/{assetInspectionPlanId}/cancel-approval` (`cancelApprovalAssetInspectionPlan`); API `POST /asset-inspection-plans/{assetInspectionPlanId}/cancel` (`cancelAssetInspectionPlan`); API `POST /asset-inspection-plans/{assetInspectionPlanId}/complete` (`completeAssetInspectionPlan`); API `GET /asset-inspection-plans` (`listAssetInspectionPlans`); 테이블: approval_document, asset, asset_inspection_plan
- 완료 기준: AC-FN-SFR-025-04-1 ~ AC-FN-SFR-025-04-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-203 · 자산 기초환경설정 관리 (1차)

- 근거: 기능 FN-SFR-025-06 · 요구사항 SFR-025-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113
- 만들 것: API `GET /system-settings` (`listSystemSettings` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `PUT /system-settings/{systemSettingId}` (`updateSystemSetting2` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: asset, system_setting
- 완료 기준: AC-FN-SFR-025-06-1 ~ AC-FN-SFR-025-06-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-204 · 예산정보 조회 및 예산 통제 (1차)

- 근거: 기능 FN-SFR-032-10 · 요구사항 SFR-032-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-005, TASK-114, TASK-029, TASK-113
- 만들 것: API `GET /budget-controls` (`getBudgetControl`); 테이블: project, budget_account, budget_execution, budget_adjustment, requisition, expense_resolution
- 완료 기준: AC-FN-SFR-032-10-1 ~ AC-FN-SFR-032-10-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-205 · 지출결의서 작성 및 결재 연계 (1차)

- 근거: 기능 FN-SFR-032-12 · 요구사항 SFR-032-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-117, TASK-027, TASK-018, TASK-113, TASK-014, TASK-029
- 만들 것: API `POST /expense-resolutions` (`createExpenseResolution` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /expense-resolutions/{expenseResolutionId}/submit` (`submitExpenseResolution`); 테이블: expense_resolution
- 완료 기준: AC-FN-SFR-032-12-1 ~ AC-FN-SFR-032-12-22 (22개) 테스트 통과
- 상태: 진행 가능

### TASK-206 · 설문항목 관리 (1차)

- 근거: 기능 FN-SFR-035-02 · 요구사항 SFR-035-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017
- 만들 것: API `POST /survey-questions` (`createSurveyQuestion`); API `GET /survey-questions` (`listSurveyQuestions`); 테이블: survey, survey_question, survey_option
- 완료 기준: AC-FN-SFR-035-02-1 ~ AC-FN-SFR-035-02-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-207 · 메시지·파일 실시간 송수신 (1차)

- 근거: 기능 FN-SFR-036-02 · 요구사항 SFR-036-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-170
- 만들 것: API `POST /messenger-messages` (`createMessengerMessage`); API `POST /messenger-messages/{messengerMessageId}/forward` (`forwardMessengerMessage`); API `GET /messenger-message-recipients` (`listMessengerMessageRecipients`); API `POST /messenger-messages/{messengerMessageId}/read` (`readMessengerMessage`); 테이블: employee, attachment, messenger_message, messenger_message_recipient
- 완료 기준: AC-FN-SFR-036-02-1 ~ AC-FN-SFR-036-02-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-208 · 쪽지·파일 일괄 전송 (1차)

- 근거: 기능 FN-SFR-036-03 · 요구사항 SFR-036-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-170
- 만들 것: API `POST /messenger-messages/send-notes` (`sendMessengerNotes`); 테이블: employee, department, attachment, messenger_message, messenger_message_recipient
- 완료 기준: AC-FN-SFR-036-03-1 ~ AC-FN-SFR-036-03-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-209 · RFID 기반 자산 관리 (1차)

- 근거: 기능 FN-SFR-001-03 · 요구사항 SFR-001-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113
- 만들 것: API `POST /rfid-scan-logs` (`createRfidScanLog`); API `GET /rfid-scan-logs` (`listRfidScanLogs`); 테이블: asset, rfid_scan_log
- 완료 기준: AC-FN-SFR-001-03-1 ~ AC-FN-SFR-001-03-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-210 · e나라도움 연동 (1차)

- 근거: 기능 FN-SFR-001-04 · 요구사항 SFR-001-03, SFR-001-11
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-185
- 만들 것: API `POST /link-logs` (`createLinkLog`); API `GET /link-logs` (`listLinkLogs`); 테이블: project, budget_account, account_subject, partner, journal_entry, link_log
- 완료 기준: AC-FN-SFR-001-04-1 ~ AC-FN-SFR-001-04-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-211 · 자금집행 정보 및 전표 관리 (1차)

- 근거: 기능 FN-SFR-004-05 · 요구사항 SFR-004-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-185
- 만들 것: API `POST /journal-entries` (`createJournalEntry`); API `GET /journal-entries` (`listJournalEntries`); API `POST /journal-entries/{journalEntryId}/cancel` (`cancelJournalEntry`); 테이블: journal_entry
- 완료 기준: AC-FN-SFR-004-05-1 ~ AC-FN-SFR-004-05-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-212 · 은행계좌 대체 및 대체결의 처리 (1차)

- 근거: 기능 FN-SFR-004-07 · 요구사항 SFR-004-08
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-113, TASK-185, TASK-017
- 만들 것: API `GET /partner-accounts` (`listPartnerAccounts` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /account-transfer-resolutions` (`createAccountTransferResolution`); 테이블: partner_account, account_transfer_resolution
- 완료 기준: AC-FN-SFR-004-07-1 ~ AC-FN-SFR-004-07-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-213 · 결의서 현황 및 예실 조회 (1차)

- 근거: 기능 FN-SFR-005-02 · 요구사항 SFR-005-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-014, TASK-005, TASK-029, TASK-113
- 만들 것: API `GET /budget-status` (`listBudgetStatus`); 테이블: menu_permission, project, budget_account, budget_main, budget_execution, budget_adjustment, requisition, expense_resolution, journal_entry, budget_commitment
- 완료 기준: AC-FN-SFR-005-02-1 ~ AC-FN-SFR-005-02-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-214 · 세무회계사무소 연계 자료 변환 (1차)

- 근거: 기능 FN-SFR-006-05 · 요구사항 SFR-006-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-185
- 만들 것: API `POST /tax-office-conversions` (`convertTaxOfficeData`); 테이블: account_subject, partner, journal_entry
- 완료 기준: AC-FN-SFR-006-05-1 ~ AC-FN-SFR-006-05-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-215 · 자금현황 조회 (1차)

- 근거: 기능 FN-SFR-009-05 · 요구사항 SFR-009-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-185, TASK-028
- 만들 것: API `GET /fund-statuses` (`listFundStatuses`); 테이블: partner, partner_account, journal_entry, fund_pl_form_item, fund_plan, financial_instrument
- 완료 기준: AC-FN-SFR-009-05-1 ~ AC-FN-SFR-009-05-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-216 · 고정자산 정보 등록·수정 (1차)

- 근거: 기능 FN-SFR-011-01 · 요구사항 SFR-011-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017
- 만들 것: API `POST /assets` (`createAsset`); API `GET /assets/{assetId}` (`getAsset`); API `PATCH /assets/{assetId}` (`updateAsset`); 테이블: project, account_subject, partner, asset, change_history, asset_depreciation
- 완료 기준: AC-FN-SFR-011-01-1 ~ AC-FN-SFR-011-01-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-217 · 고정자산 현황·명세 조회 (1차)

- 근거: 기능 FN-SFR-011-02 · 요구사항 SFR-011-02, SFR-011-03, SFR-011-04, SFR-011-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-113
- 만들 것: API `GET /asset-reports` (`listAssetReports`); 테이블: account_subject, asset, asset_depreciation
- 완료 기준: AC-FN-SFR-011-02-1 ~ AC-FN-SFR-011-02-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-218 · 구매품의 자산품목 관리 및 자산 등록 연계 (1차)

- 근거: 기능 FN-SFR-024-03 · 요구사항 SFR-024-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-029
- 만들 것: API `POST /purchase-asset-items` (`createPurchaseAssetItem`); API `PATCH /purchase-asset-items/{purchaseAssetItemId}` (`updatePurchaseAssetItem`); API `GET /purchase-asset-items` (`listPurchaseAssetItems`); 테이블: project, budget_account, account_subject, partner, notification, requisition, asset, purchase_asset_item
- 완료 기준: AC-FN-SFR-024-03-1 ~ AC-FN-SFR-024-03-18 (18개) 테스트 통과
- 상태: 진행 가능

### TASK-219 · 자산 변동현황 등록·조회 (1차)

- 근거: 기능 FN-SFR-025-02 · 요구사항 SFR-025-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-012, TASK-017, TASK-027, TASK-005, TASK-113
- 만들 것: API `POST /asset-changes` (`createAssetChange`); API `GET /asset-changes` (`listAssetChanges`); 테이블: approval_document, asset, asset_change
- 완료 기준: AC-FN-SFR-025-02-1 ~ AC-FN-SFR-025-02-13 (13개) 테스트 통과
- 상태: 진행 가능

### TASK-220 · 자산 QR·바코드 출력·관리 (1차)

- 근거: 기능 FN-SFR-025-03 · 요구사항 SFR-025-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113
- 만들 것: API `POST /asset-print-logs` (`printAssetCodes`); API `GET /asset-print-logs` (`listAssetPrintLogs`); 테이블: asset, asset_print_log
- 완료 기준: AC-FN-SFR-025-03-1 ~ AC-FN-SFR-025-03-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-221 · 자산실사 처리 및 현황 조회 (1차)

- 근거: 기능 FN-SFR-025-05 · 요구사항 SFR-025-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-027, TASK-005, TASK-113, TASK-029
- 만들 것: API `POST /asset-inspection-plans/{assetInspectionPlanId}/link` (`linkAssetInspectionPlan`); API `POST /asset-inspection-items/receive` (`receiveAssetInspectionResults`); API `GET /asset-inspection-plans` (`listAssetInspectionPlans` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /asset-changes` (`createAssetChange` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /asset-inspection-plans/{assetInspectionPlanId}/complete` (`completeAssetInspectionPlan` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: asset, link_log, asset_change, asset_inspection_plan, asset_inspection_item
- 완료 기준: AC-FN-SFR-025-05-1 ~ AC-FN-SFR-025-05-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-222 · ERP 연계 예산 반영 및 자동전표 처리 (1차)

- 근거: 기능 FN-SFR-032-11 · 요구사항 SFR-032-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-114, TASK-117, TASK-029
- 만들 것: API `POST /expense-resolutions/{expenseResolutionId}/reflect-budget` (`reflectExpenseResolutionBudget`); 테이블: project, budget_account, account_subject, partner, budget_execution, expense_resolution, journal_entry, link_log
- 완료 기준: AC-FN-SFR-032-11-1 ~ AC-FN-SFR-032-11-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-223 · 설문 응답 입력 (1차)

- 근거: 기능 FN-SFR-035-03 · 요구사항 SFR-035-04, SFR-035-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-169, TASK-017, TASK-206
- 만들 것: API `POST /surveys/{surveyId}/responses` (`submitSurveyResponses`); 테이블: survey_target, survey_question, survey_response, survey_response_option, survey_comment
- 완료 기준: AC-FN-SFR-035-03-1 ~ AC-FN-SFR-035-03-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-224 · 예산·회계·인사 데이터 분석 및 질의응답 (1차)

- 근거: 기능 FN-SFR-044-03 · 요구사항 SFR-044-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-114, TASK-185
- 만들 것: API `POST /data-analysis/queries` (`queryDataAnalysis`); 테이블: menu_permission, budget_account, account_subject, budget_execution, journal_entry, personal_info_access_log, personnel_record
- 완료 기준: AC-FN-SFR-044-03-1 ~ AC-FN-SFR-044-03-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-225 · 예산장부 조회 (1차)

- 근거: 기능 FN-SFR-005-01 · 요구사항 SFR-005-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-014, TASK-005, TASK-114, TASK-117, TASK-029
- 만들 것: API `GET /budget-ledgers` (`listBudgetLedgers`); 테이블: menu_permission, project, budget_account, partner, partner_account, budget_execution, expense_resolution, journal_entry, journal_entry_line
- 완료 기준: AC-FN-SFR-005-01-1 ~ AC-FN-SFR-005-01-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-226 · 전자세금계산서 수집·대사 검증 및 결의서 작성 (1차)

- 근거: 기능 FN-SFR-007-02 · 요구사항 SFR-007-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-117, TASK-018, TASK-014, TASK-029, TASK-017
- 만들 것: API `POST /tax-invoices/collect` (`collectTaxInvoices`); API `GET /tax-invoices` (`listTaxInvoices`); API `POST /expense-resolutions/from-tax-invoice` (`createExpenseResolutionFromTaxInvoice`); 테이블: account_subject, partner, expense_resolution, journal_entry, link_log, tax_invoice
- 완료 기준: AC-FN-SFR-007-02-1 ~ AC-FN-SFR-007-02-19 (19개) 테스트 통과
- 상태: 진행 가능

### TASK-227 · 카드 승인내역 및 현금영수증 결의서 작성 (1차)

- 근거: 기능 FN-SFR-007-04 · 요구사항 SFR-007-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-117, TASK-027, TASK-018, TASK-113, TASK-014, TASK-029, TASK-017
- 만들 것: API `POST /card-approvals/collect` (`collectCardApprovals`); API `GET /card-approvals` (`listCardApprovals`); API `GET /cash-receipts` (`listCashReceipts`); API `POST /expense-resolutions/from-card-or-cash-receipt` (`createExpenseResolutionFromCardOrCashReceipt`); 테이블: credit_card, expense_resolution, journal_entry, link_log, card_approval, cash_receipt
- 완료 기준: AC-FN-SFR-007-04-1 ~ AC-FN-SFR-007-04-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-228 · 전표 입력·관리 (1차)

- 근거: 기능 FN-SFR-008-01 · 요구사항 SFR-008-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-185, TASK-005, TASK-113, TASK-027, TASK-018
- 만들 것: API `POST /journal-entries` (`createJournalEntry` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `GET /journal-entries/{journalEntryId}` (`getJournalEntry`); API `PATCH /journal-entries/{journalEntryId}` (`updateJournalEntry`); API `POST /journal-entries/{journalEntryId}/cancel-approval` (`cancelJournalEntryApproval`); API `PATCH /journal-entries/evidence-details` (`updateJournalEntryEvidenceDetails`); API `GET /journal-entries/{journalEntryId}/print` (`printJournalEntry`); 테이블: journal_entry, journal_entry_line
- 완료 기준: AC-FN-SFR-008-01-1 ~ AC-FN-SFR-008-01-18 (18개) 테스트 통과
- 상태: 진행 가능

### TASK-229 · 전자세금계산서 발행 (1차)

- 근거: 기능 FN-SFR-008-02 · 요구사항 SFR-008-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-017, TASK-185, TASK-210
- 만들 것: API `POST /tax-invoices` (`createTaxInvoice`); 테이블: partner, link_log, tax_invoice
- 완료 기준: AC-FN-SFR-008-02-1 ~ AC-FN-SFR-008-02-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-230 · 전자세금계산서 검증·전표처리·현황조회 (1차)

- 근거: 기능 FN-SFR-008-03 · 요구사항 SFR-008-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-185
- 만들 것: API `GET /tax-invoices` (`listTaxInvoices` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); API `POST /tax-invoices/validate` (`validateTaxInvoices`); API `POST /tax-invoices/create-journal-entries` (`createJournalEntriesFromTaxInvoices`); 테이블: account_subject, partner, journal_entry, tax_invoice
- 완료 기준: AC-FN-SFR-008-03-1 ~ AC-FN-SFR-008-03-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-231 · 세금계산서 발행여부 일괄 변경 (1차)

- 근거: 기능 FN-SFR-008-04 · 요구사항 SFR-008-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-113, TASK-185, TASK-210
- 만들 것: API `PATCH /tax-invoices/issue-status` (`updateTaxInvoiceIssueStatuses`); 테이블: change_history, tax_invoice
- 완료 기준: AC-FN-SFR-008-04-1 ~ AC-FN-SFR-008-04-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-232 · 거래처별 장부 조회 (1차)

- 근거: 기능 FN-SFR-008-06 · 요구사항 SFR-008-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-210, TASK-018
- 만들 것: API `GET /partner-ledgers` (`listPartnerLedgers`); 테이블: account_subject, partner, journal_entry_line
- 완료 기준: AC-FN-SFR-008-06-1 ~ AC-FN-SFR-008-06-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-233 · 차입금·대여금 명세서 전표처리 및 원장 조회 (1차)

- 근거: 기능 FN-SFR-009-06 · 요구사항 SFR-009-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-185
- 만들 것: API `GET /loan-statements` (`listLoanStatements`); API `POST /loans/{loanId}/process-voucher` (`processLoanVoucher`); API `GET /loan-transactions` (`listLoanTransactions`); 테이블: account_subject, partner, journal_entry, loan, loan_transaction
- 완료 기준: AC-FN-SFR-009-06-1 ~ AC-FN-SFR-009-06-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-234 · 주요 재무제표 조회 (1차)

- 근거: 기능 FN-SFR-010-02 · 요구사항 SFR-010-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-185, TASK-113, TASK-027, TASK-018, TASK-014
- 만들 것: API `GET /financial-statements` (`listFinancialStatements`); 테이블: account_subject, journal_entry, journal_entry_line, accounting_unit, closing_data
- 완료 기준: AC-FN-SFR-010-02-1 ~ AC-FN-SFR-010-02-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-235 · 관리용 재무상태표 조회 (1차)

- 근거: 기능 FN-SFR-010-03 · 요구사항 SFR-010-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-185, TASK-113, TASK-018
- 만들 것: API `GET /management-balance-sheets` (`listManagementBalanceSheets`); 테이블: department, project, account_subject, journal_entry, journal_entry_line, accounting_unit
- 완료 기준: AC-FN-SFR-010-03-1 ~ AC-FN-SFR-010-03-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-236 · 관리용 손익계산서 조회 (1차)

- 근거: 기능 FN-SFR-010-04 · 요구사항 SFR-010-04
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-185, TASK-113, TASK-018
- 만들 것: API `GET /management-income-statements` (`listManagementIncomeStatements`); 테이블: department, project, account_subject, journal_entry, journal_entry_line, accounting_unit, management_item, allocation_rule
- 완료 기준: AC-FN-SFR-010-04-1 ~ AC-FN-SFR-010-04-14 (14개) 테스트 통과
- 상태: 진행 가능

### TASK-237 · 관리용 원가보고서 조회 (1차)

- 근거: 기능 FN-SFR-010-05 · 요구사항 SFR-010-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-185, TASK-113, TASK-018
- 만들 것: API `GET /management-cost-reports` (`listManagementCostReports`); 테이블: department, project, account_subject, journal_entry, journal_entry_line, accounting_unit
- 완료 기준: AC-FN-SFR-010-05-1 ~ AC-FN-SFR-010-05-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-238 · 부가가치세 관리 (1차)

- 근거: 기능 FN-SFR-010-06 · 요구사항 SFR-010-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-185
- 만들 것: API `GET /vat-forms` (`listVatForms`); API `POST /vat-forms` (`createVatForm`); API `PATCH /vat-forms/{vatFormId}` (`updateVatForm`); 테이블: partner, journal_entry, tax_invoice, vat_form
- 완료 기준: AC-FN-SFR-010-06-1 ~ AC-FN-SFR-010-06-12 (12개) 테스트 통과
- 상태: 진행 가능

### TASK-239 · 급여이체 현황 조회 (1차)

- 근거: 기능 FN-SFR-021-02 · 요구사항 SFR-021-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-113, TASK-210
- 만들 것: API `GET /payroll-transfers` (`listPayrollTransfers`); 테이블: employee, partner_account, payroll, personal_info_access_log, payroll_run
- 완료 기준: AC-FN-SFR-021-02-1 ~ AC-FN-SFR-021-02-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-240 · 급여명세서 발송 (1차)

- 근거: 기능 FN-SFR-021-06 · 요구사항 SFR-021-06
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-210
- 만들 것: API `POST /payslips/send` (`sendPayslips`); 테이블: notification, payroll, payroll_run
- 완료 기준: AC-FN-SFR-021-06-1 ~ AC-FN-SFR-021-06-9 (9개) 테스트 통과
- 상태: 진행 가능

### TASK-241 · 급여 지급일 등록 및 급여 대상 관리 (1차)

- 근거: 기능 FN-SFR-021-08 · 요구사항 SFR-021-01
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-210
- 만들 것: API `POST /payroll-runs` (`createPayrollRun`); API `GET /payroll-runs` (`listPayrollRuns`); API `PATCH /payroll-runs/{payrollRunId}` (`updatePayrollRun`); API `POST /payrolls` (`createPayroll`); API `DELETE /payrolls/{payrollId}` (`deletePayroll`); 테이블: employee, payroll, personnel_record, payroll_run
- 완료 기준: AC-FN-SFR-021-08-1 ~ AC-FN-SFR-021-08-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-242 · 급여 전표처리 (1차)

- 근거: 기능 FN-SFR-021-10 · 요구사항 SFR-021-02
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-185, TASK-017
- 만들 것: API `POST /payroll-runs/{payrollRunId}/create-journal-entry` (`createPayrollJournalEntry`); 테이블: account_subject, journal_entry, payroll, payroll_account_mapping, payroll_run
- 완료 기준: AC-FN-SFR-021-10-1 ~ AC-FN-SFR-021-10-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-243 · 지출결의 및 증빙자료 현황 조회 (1차)

- 근거: 기능 FN-SFR-032-09 · 요구사항 SFR-032-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-017, TASK-010, TASK-027, TASK-018, TASK-029, TASK-113, TASK-014, TASK-210
- 만들 것: API `GET /expense-resolutions` (`listExpenseResolutions` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: menu_permission, credit_card, attachment, requisition, expense_resolution, tax_invoice
- 완료 기준: AC-FN-SFR-032-09-1 ~ AC-FN-SFR-032-09-10 (10개) 테스트 통과
- 상태: 진행 가능

### TASK-244 · 외부 금융·결재 시스템 API 연계 (1차)

- 근거: 기능 FN-SIR-001-01 · 요구사항 SIR-001-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-012, TASK-017, TASK-117, TASK-018, TASK-014, TASK-210
- 만들 것: API `POST /link-logs/sync` (`syncExternalLink`); API `GET /link-logs` (`listLinkLogs` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: partner, partner_account, credit_card, approval_document, expense_resolution, link_log, tax_invoice
- 완료 기준: AC-FN-SIR-001-01-1 ~ AC-FN-SIR-001-01-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-245 · 은행계좌 거래내역 조회·자동전표 및 반제 처리 (1차)

- 근거: 기능 FN-SFR-007-03 · 요구사항 SFR-007-03
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-185, TASK-017, TASK-225
- 만들 것: API `POST /bank-transactions/collect` (`collectBankTransactions`); API `GET /bank-transactions` (`listBankTransactions`); API `POST /journal-settlements` (`createJournalSettlement`); 테이블: account_subject, partner, partner_account, journal_entry, link_log, bank_transaction, journal_settlement
- 완료 기준: AC-FN-SFR-007-03-1 ~ AC-FN-SFR-007-03-16 (16개) 테스트 통과
- 상태: 진행 가능

### TASK-246 · 계정별 장부 조회 (1차)

- 근거: 기능 FN-SFR-008-05 · 요구사항 SFR-008-05
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-185, TASK-113, TASK-027, TASK-018
- 만들 것: API `GET /account-ledgers` (`listAccountLedgers`); 테이블: account_subject, journal_entry, journal_entry_line, management_item, journal_line_management_value
- 완료 기준: AC-FN-SFR-008-05-1 ~ AC-FN-SFR-008-05-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-247 · 관리항목별 장부 조회 (1차)

- 근거: 기능 FN-SFR-008-07 · 요구사항 SFR-008-07
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-014, TASK-017, TASK-018, TASK-029, TASK-210, TASK-113
- 만들 것: API `GET /management-item-ledgers` (`listManagementItemLedgers`); 테이블: project, account_subject, attachment, requisition, journal_entry_line, management_item, journal_line_management_value
- 완료 기준: AC-FN-SFR-008-07-1 ~ AC-FN-SFR-008-07-11 (11개) 테스트 통과
- 상태: 진행 가능

### TASK-248 · 채권·채무 관리 (1차)

- 근거: 기능 FN-SFR-008-08 · 요구사항 SFR-008-08
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-210, TASK-018, TASK-017
- 만들 것: API `GET /receivable-aging` (`listReceivableAging`); API `GET /partner-balances` (`listPartnerBalances`); API `POST /journal-settlements` (`createJournalSettlement` — 다른 기능과 함께 쓰는 API, 먼저 하는 작업에서 한 번만 만든다); 테이블: account_subject, partner, journal_entry_line, system_setting, journal_settlement
- 완료 기준: AC-FN-SFR-008-08-1 ~ AC-FN-SFR-008-08-15 (15개) 테스트 통과
- 상태: 진행 가능

### TASK-249 · 전표 반제 관리 (1차)

- 근거: 기능 FN-SFR-008-09 · 요구사항 SFR-008-09
- 선행 작업: TASK-002, TASK-003, TASK-004, TASK-027, TASK-210, TASK-018, TASK-017
- 만들 것: API `GET /journal-settlements` (`listJournalSettlements`); API `GET /settlement-aging` (`listSettlementAging`); 테이블: account_subject, partner, journal_entry_line, journal_settlement
- 완료 기준: AC-FN-SFR-008-09-1 ~ AC-FN-SFR-008-09-10 (10개) 테스트 통과
- 상태: 진행 가능
