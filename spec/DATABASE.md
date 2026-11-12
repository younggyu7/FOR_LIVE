# DATABASE — 데이터베이스

> 프로젝트: **회사1** · 설계 버전: **v3.1.1** · spec-format v2  
> 테이블·관계·업무 제약을 정리한 문서다. 기준은 `schema.sql`이다. 읽는 순서와 작업 규칙은 `AGENTS.md`.

## 1. 원칙

- `schema.sql`을 그대로 실행해 만든다 (PostgreSQL 16 문법. DB 검증을 했으면 결과는 `db_validation.md`).
- 컬럼 상세(타입·길이·필수·설명)는 `erd.md` 테이블 정의서, 관계도는 `erd.mmd`.
- 기본키는 테이블마다 하나(대리키), 감사 컬럼(등록·수정 시각)은 시스템이 채운다.

## 2. 테이블

| 테이블 | 이름 | 종류 | 한 행의 의미 | 사용 기능 |
|---|---|---|---|---|
| employee | 임직원 | MASTER | 한 행=임직원 1명. 사번/로그인ID 기준. 사람 계정은 역할별로 나누지 않고 하나의 계정 체계 사용. 재직 구분(재직자/퇴직자) 속성. 주부서 N:1 필수(가정). | FN-SFR-001-01, FN-SFR-001-05, FN-SFR-001-06, FN-SFR-012-01, FN-SFR-021-01, FN-SFR-037-01, FN-SFR-036-09, FN-SFR-038-01, FN-SFR-004-06, FN-SFR-012-03, FN-SFR-012-04, FN-SFR-012-05, FN-SFR-012-06, FN-SFR-012-07, FN-SFR-013-01, FN-SFR-013-02, FN-SFR-013-04, FN-SFR-014-01, FN-SFR-014-02, FN-SFR-014-03, FN-SFR-015-01, FN-SFR-015-02, FN-SFR-015-03, FN-SFR-015-05, FN-SFR-016-03, FN-SFR-016-04, FN-SFR-017-03, FN-SFR-017-04, FN-SFR-017-06, FN-SFR-018-05, FN-SFR-019-02, FN-SFR-019-03, FN-SFR-019-05, FN-SFR-019-06, FN-SFR-020-03, FN-SFR-021-02, FN-SFR-021-03, FN-SFR-021-04, FN-SFR-021-05, FN-SFR-021-07, FN-SFR-021-08, FN-SFR-021-09, FN-SFR-021-11, FN-SFR-021-12, FN-SFR-021-13, FN-SFR-021-14, FN-SFR-021-15, FN-SFR-021-16, FN-SFR-022-01, FN-SFR-022-02, FN-SFR-022-03, FN-SFR-022-04, FN-SFR-026-04, FN-SFR-027-03, FN-SFR-027-04, FN-SFR-027-05, FN-SFR-029-05, FN-SFR-031-02, FN-SFR-032-01, FN-SFR-032-02, FN-SFR-032-04, FN-SFR-032-06, FN-SFR-032-07, FN-SFR-034-02, FN-SFR-036-01, FN-SFR-036-02, FN-SFR-036-03, FN-SFR-036-05, FN-SFR-036-07, FN-SFR-037-02, FN-SFR-037-03, FN-SFR-038-02, FN-SFR-039-02, FN-SFR-040-01, FN-SFR-040-05 |
| department | 부서 | MASTER | 한 행=부서 1개. 부서코드 기준. 상위부서 자기참조(선택). 부서 약칭 속성 포함. | FN-SFR-001-01, FN-SFR-031-01, FN-SFR-036-09, FN-SFR-002-07, FN-SFR-004-06, FN-SFR-010-01, FN-SFR-010-03, FN-SFR-010-04, FN-SFR-010-05, FN-SFR-013-02, FN-SFR-013-03, FN-SFR-013-04, FN-SFR-014-01, FN-SFR-014-02, FN-SFR-014-03, FN-SFR-015-01, FN-SFR-015-05, FN-SFR-017-04, FN-SFR-018-05, FN-SFR-019-05, FN-SFR-021-16, FN-SFR-029-05, FN-SFR-031-02, FN-SFR-034-01, FN-SFR-034-02, FN-SFR-036-01, FN-SFR-036-03, FN-SFR-039-02, FN-SFR-040-05, FN-SFR-040-09, FN-SFR-044-01 |
| menu | 메뉴 | MASTER | 한 행=시스템 메뉴 1개(ERP/그룹웨어). 메뉴명·연결 모듈·사용 여부(사용/미사용)·표시순서 속성. | FN-SFR-001-05, FN-SFR-001-06, FN-SFR-026-02, FN-SFR-027-02, FN-SFR-026-04, FN-SFR-027-04, FN-SFR-027-05, FN-SFR-038-02, FN-SFR-038-04, FN-SFR-040-02, FN-SIR-003-01 |
| menu_permission | 메뉴 사용 권한 | MAPPING | 한 행=(임직원, 메뉴) 권한 부여 1건. 조회 범위(전체/부서/개인) 속성. 임직원 N:1 필수, 메뉴 N:1 필수. 역할 구조는 확정하지 않음(가정). | FN-SFR-001-01, FN-SFR-026-01, FN-SFR-001-05, FN-SFR-005-01, FN-SFR-005-02, FN-SFR-006-06, FN-SFR-013-01, FN-SFR-013-04, FN-SFR-014-01, FN-SFR-014-02, FN-SFR-014-03, FN-SFR-026-03, FN-SFR-026-04, FN-SFR-027-03, FN-SFR-027-04, FN-SFR-027-05, FN-SFR-028-02, FN-SFR-032-01, FN-SFR-032-09, FN-SFR-033-01, FN-SFR-034-01, FN-SFR-036-06, FN-SFR-037-02, FN-SFR-037-03, FN-SFR-038-02, FN-SFR-038-04, FN-SFR-039-01, FN-SFR-039-02, FN-SFR-040-02, FN-SFR-040-03, FN-SFR-040-04, FN-SFR-040-05, FN-SFR-040-06, FN-SFR-040-07, FN-SFR-040-08, FN-SFR-040-10, FN-SFR-044-03, FN-SIR-002-01, FN-SIR-003-01 |
| project | 프로젝트 | MASTER | 한 행=프로젝트 1건. 프로젝트 코드 유일. 사업구분(고유목적사업/수익사업/공통사업), 유형(공통/직접사업), 시작·종료일, 주관부서·담당자 참조. | FN-SFR-002-01, FN-SFR-006-03, FN-SFR-001-04, FN-SFR-002-07, FN-SFR-003-06, FN-SFR-004-04, FN-SFR-004-06, FN-SFR-005-01, FN-SFR-005-02, FN-SFR-008-07, FN-SFR-009-02, FN-SFR-010-01, FN-SFR-010-03, FN-SFR-010-04, FN-SFR-010-05, FN-SFR-011-01, FN-SFR-021-16, FN-SFR-024-02, FN-SFR-024-03, FN-SFR-032-08, FN-SFR-032-10, FN-SFR-032-11 |
| sub_project | 하위사업 | MASTER | 한 행=하위사업 1건. 프로젝트 N:1 필수, 상위 하위사업 자기참조(다단계, 선택). 사용 여부 속성. | FN-SFR-002-02 |
| budget_account | 예산과목 | MASTER | 한 행=예산과목 1건. 수입·지출 유형, 상위 예산과목 자기참조, 통제 주기(월/분기/연), 전용 가능 여부, 사용기간. | FN-SFR-002-03, FN-SFR-001-04, FN-SFR-003-06, FN-SFR-004-04, FN-SFR-004-06, FN-SFR-005-01, FN-SFR-005-02, FN-SFR-009-02, FN-SFR-024-02, FN-SFR-024-03, FN-SFR-032-08, FN-SFR-032-10, FN-SFR-032-11, FN-SFR-044-03 |
| account_subject | 계정과목 | MASTER | 한 행=계정과목 1건. 코드 유일. 구분(자산/부채/자본/수익/비용). | FN-SFR-006-01, FN-SFR-006-02, FN-SFR-001-04, FN-SFR-006-04, FN-SFR-006-05, FN-SFR-007-01, FN-SFR-007-02, FN-SFR-007-03, FN-SFR-008-03, FN-SFR-008-05, FN-SFR-008-06, FN-SFR-008-07, FN-SFR-008-08, FN-SFR-008-09, FN-SFR-009-01, FN-SFR-009-06, FN-SFR-010-01, FN-SFR-010-02, FN-SFR-010-03, FN-SFR-010-04, FN-SFR-010-05, FN-SFR-011-01, FN-SFR-011-02, FN-SFR-020-02, FN-SFR-021-10, FN-SFR-024-03, FN-SFR-032-11, FN-SFR-044-03 |
| partner | 거래처 | MASTER | 한 행=거래처 1건. 거래처 코드 유일. 유형(일반/금융), 사업자등록번호, 거래 시작·종료일. | FN-SFR-002-04, FN-SFR-006-03, FN-SFR-001-04, FN-SFR-004-04, FN-SFR-004-06, FN-SFR-005-01, FN-SFR-006-04, FN-SFR-006-05, FN-SFR-006-06, FN-SFR-007-01, FN-SFR-007-02, FN-SFR-007-03, FN-SFR-008-02, FN-SFR-008-03, FN-SFR-008-06, FN-SFR-008-08, FN-SFR-008-09, FN-SFR-009-02, FN-SFR-009-05, FN-SFR-009-06, FN-SFR-010-06, FN-SFR-011-01, FN-SFR-024-03, FN-SFR-032-11, FN-SIR-001-01 |
| partner_account | 거래처 계좌 | MASTER | 한 행=거래처 계좌 1건. 거래처 N:1 필수. 계좌번호 암호화. 사용 여부. | FN-SFR-002-05, FN-SFR-004-07, FN-SFR-005-01, FN-SFR-007-03, FN-SFR-009-05, FN-SFR-021-02, FN-SFR-021-12, FN-SIR-001-01 |
| credit_card | 신용카드 | MASTER | 한 행=카드 1매. 카드유형(법인/개인/사업용), 카드번호 암호화. | FN-SFR-002-06, FN-SFR-007-04, FN-SFR-032-09, FN-SIR-001-01 |
| approval_document | 전자결재 문서 | TRANSACTION | 한 행=결재문서 1건. 문서번호 유일. 전자결재 처리 상태(기안/결재대기/승인/보류/반려/회수/재기안/완료). | FN-SFR-029-02, FN-SFR-030-01, FN-SFR-004-03, FN-SFR-009-04, FN-SFR-012-02, FN-SFR-012-07, FN-SFR-013-01, FN-SFR-015-03, FN-SFR-016-03, FN-SFR-018-07, FN-SFR-018-08, FN-SFR-018-10, FN-SFR-019-06, FN-SFR-020-03, FN-SFR-024-02, FN-SFR-025-02, FN-SFR-025-04, FN-SFR-026-03, FN-SFR-027-03, FN-SFR-028-02, FN-SFR-029-04, FN-SFR-029-06, FN-SFR-029-07, FN-SFR-029-08, FN-SFR-029-09, FN-SFR-030-03, FN-SFR-031-02, FN-SFR-031-03, FN-SFR-031-04, FN-SFR-032-02, FN-SFR-032-05, FN-SFR-032-08, FN-SFR-039-01, FN-SFR-039-02, FN-SFR-040-02, FN-SFR-040-07, FN-SFR-040-08, FN-SFR-040-09, FN-SFR-040-10, FN-SFR-044-01, FN-SFR-044-02, FN-SIR-001-01, FN-SIR-002-03 |
| approval_form | 결재양식 | MASTER | 한 행=결재양식 1건. 사용 여부. | FN-SFR-029-01, FN-SFR-030-02, FN-SFR-018-02, FN-SFR-027-03, FN-SFR-029-09, FN-SFR-030-03, FN-SFR-031-03, FN-SFR-044-02, FN-SIR-002-03 |
| notification | 알림 | TRANSACTION | 한 행=수신자별 알림 1건. 채널, 읽음 상태(읽음/안읽음), 바로가기 대상. | FN-SFR-028-01, FN-SFR-028-03, FN-SFR-028-04, FN-SFR-012-02, FN-SFR-012-07, FN-SFR-013-01, FN-SFR-013-03, FN-SFR-015-03, FN-SFR-016-03, FN-SFR-019-06, FN-SFR-021-06, FN-SFR-024-02, FN-SFR-024-03, FN-SFR-027-03, FN-SFR-028-02, FN-SFR-029-05, FN-SFR-029-08, FN-SFR-032-02, FN-SFR-032-05, FN-SFR-032-08, FN-SFR-033-06, FN-SFR-034-01, FN-SFR-034-03, FN-SFR-035-01, FN-SFR-036-04, FN-SFR-036-06, FN-SFR-036-08, FN-SFR-037-03, FN-SFR-040-02, FN-SFR-040-07, FN-SFR-044-01, FN-SIR-002-03 |
| attachment | 첨부파일 | TRANSACTION | 한 행=첨부파일 1건. ECM 저장 참조. 업무 대상은 유형+ID로 참조(가정). | FN-SFR-031-05, FN-SFR-026-05, FN-SFR-008-07, FN-SFR-026-03, FN-SFR-029-09, FN-SFR-031-03, FN-SFR-032-07, FN-SFR-032-08, FN-SFR-032-09, FN-SFR-033-01, FN-SFR-033-02, FN-SFR-034-01, FN-SFR-036-02, FN-SFR-036-03, FN-SFR-036-04, FN-SFR-036-05, FN-SFR-036-07, FN-SFR-039-01, FN-SFR-040-03, FN-SFR-040-04, FN-SFR-040-08, FN-SFR-040-09, FN-SFR-040-10, FN-SFR-041-03, FN-SFR-041-07, FN-SFR-044-01 |
| budget_main | 본예산 | TRANSACTION | 한 행=회계단위·기수·프로젝트·예산과목별 본예산 1건. 승인 처리 상태 속성. | FN-SFR-003-01, FN-SFR-003-02, FN-SFR-005-02 |
| budget_execution | 실행예산 | TRANSACTION | 한 행=월별 실행예산 1건. 본예산 기반. | FN-SFR-003-03, FN-SFR-005-01, FN-SFR-005-02, FN-SFR-032-10, FN-SFR-032-11, FN-SFR-044-03 |
| budget_adjustment | 예산조정 | TRANSACTION | 한 행=예산조정 1건. 구분(추경예산/전용/이용/예비비). | FN-SFR-003-05, FN-SFR-003-06, FN-SFR-005-02, FN-SFR-032-10 |
| requisition | 품의서 | TRANSACTION | 한 행=품의서 1건(지출/구매 구분 유형 속성). 프로젝트·예산과목 필수. | FN-SFR-004-01, FN-SFR-024-01, FN-SFR-004-03, FN-SFR-005-02, FN-SFR-008-07, FN-SFR-024-02, FN-SFR-024-03, FN-SFR-032-08, FN-SFR-032-09, FN-SFR-032-10 |
| expense_resolution | 결의서 | TRANSACTION | 한 행=결의서 1건. 품의서 선택 연결, 거래처·예산과목 참조. | FN-SFR-004-02, FN-SFR-032-12, FN-SFR-003-06, FN-SFR-004-03, FN-SFR-004-06, FN-SFR-005-01, FN-SFR-005-02, FN-SFR-007-02, FN-SFR-007-04, FN-SFR-032-09, FN-SFR-032-10, FN-SFR-032-11, FN-SIR-001-01 |
| journal_entry | 전표 | TRANSACTION | 한 행=전표 1건. 차대변 일치 필수. | FN-SFR-008-01, FN-SFR-004-05, FN-SFR-001-04, FN-SFR-005-01, FN-SFR-005-02, FN-SFR-006-05, FN-SFR-007-02, FN-SFR-007-03, FN-SFR-007-04, FN-SFR-008-03, FN-SFR-008-05, FN-SFR-009-05, FN-SFR-009-06, FN-SFR-010-02, FN-SFR-010-03, FN-SFR-010-04, FN-SFR-010-05, FN-SFR-010-06, FN-SFR-021-10, FN-SFR-032-11, FN-SFR-044-03 |
| journal_entry_line | 전표 분개 라인 | TRANSACTION | 한 행=전표의 분개 1줄. 계정과목·거래처·프로젝트·예산과목 참조. | FN-SFR-008-01, FN-SFR-005-01, FN-SFR-008-05, FN-SFR-008-06, FN-SFR-008-07, FN-SFR-008-08, FN-SFR-008-09, FN-SFR-010-02, FN-SFR-010-03, FN-SFR-010-04, FN-SFR-010-05 |
| attendance_request | 근태 | TRANSACTION | 한 행=근태 신청 1건. 근태 유형 속성, 승인 처리 상태. | FN-SFR-018-01, FN-SFR-032-03, FN-SFR-006-06, FN-SFR-018-02, FN-SFR-018-04, FN-SFR-018-05, FN-SFR-018-06, FN-SFR-018-07, FN-SFR-018-08, FN-SFR-018-10, FN-SFR-018-12, FN-SFR-019-05, FN-SFR-028-02, FN-SFR-032-04, FN-SFR-032-05 |
| payroll | 급여 | TRANSACTION | 한 행=임직원·지급일별 급여 1건. 암호화 저장. | FN-SFR-021-01, FN-SFR-006-06, FN-SFR-021-02, FN-SFR-021-03, FN-SFR-021-04, FN-SFR-021-05, FN-SFR-021-06, FN-SFR-021-07, FN-SFR-021-08, FN-SFR-021-09, FN-SFR-021-10, FN-SFR-021-12, FN-SFR-021-13, FN-SFR-021-14, FN-SFR-021-15, FN-SFR-021-16, FN-SFR-022-02, FN-SFR-022-03, FN-SFR-023-01, FN-SFR-023-03, FN-SFR-023-07, FN-SFR-032-06 |
| asset | 자산 | MASTER | 한 행=자산 1건. 자산코드·번호 유일. | FN-SFR-025-01, FN-SFR-001-03, FN-SFR-006-06, FN-SFR-011-01, FN-SFR-011-02, FN-SFR-024-03, FN-SFR-025-02, FN-SFR-025-03, FN-SFR-025-04, FN-SFR-025-05, FN-SFR-025-06 |
| personal_info_access_log | 개인정보 열람 이력 | HISTORY | 한 행=개인정보 열람·접근 1건. | FN-COR-002-01, FN-SFR-012-04, FN-SFR-013-02, FN-SFR-013-03, FN-SFR-013-04, FN-SFR-014-01, FN-SFR-014-02, FN-SFR-014-03, FN-SFR-015-01, FN-SFR-016-04, FN-SFR-020-03, FN-SFR-021-02, FN-SFR-021-03, FN-SFR-021-04, FN-SFR-021-07, FN-SFR-021-12, FN-SFR-021-13, FN-SFR-021-14, FN-SFR-021-15, FN-SFR-022-02, FN-SFR-022-03, FN-SFR-032-01, FN-SFR-032-02, FN-SFR-032-06, FN-SFR-032-07, FN-SFR-039-02, FN-SFR-044-03 |
| login_history | 로그인 내역 | HISTORY | 한 행=로그인 성공 1건. 로그인 구분(웹/메신저/모바일 앱). | FN-SFR-038-01, FN-SFR-040-01 |
| system_setting | 환경설정 | MASTER | 한 행=환경설정 항목 1개(분류+키+값). 예산·승인번호·전자결재 사용·근태·급여·자산·연령구간 등 설정. 변경은 이후 업무부터 적용. 설정 항목 구성은 (가정). | FN-SFR-002-07, FN-SFR-018-02, FN-SFR-018-03, FN-SFR-018-06, FN-SFR-008-08, FN-SFR-020-02, FN-SFR-020-03, FN-SFR-021-05, FN-SFR-023-01, FN-SFR-025-06 |
| accounting_unit | 회계단위 | MASTER | 한 행=회계단위 1개. 회계단위 코드 기준. 결산·재무제표 구분 기준. | FN-SFR-010-01, FN-SFR-010-02, FN-SFR-010-03, FN-SFR-010-04, FN-SFR-010-05 |
| budget_closing_period | 예산 폐쇄기간 | MASTER | 한 행=폐쇄기간 1건. 구분(결의서/출납), 시작일·종료일(종료일>=시작일). | FN-SFR-003-06 |
| budget_carryover | 예산 이월 | TRANSACTION | 한 행=프로젝트·예산과목별 이월 대상 금액 1건. 초기 이월 여부 구분 속성. 프로젝트 N:1 필수, 예산과목 N:1 필수. | FN-SFR-003-06 |
| account_carryover | 계정별 초기이월 | TRANSACTION | 한 행=회계연도·계정과목·거래처(·프로젝트)별 이월내역 1건. 이월 금액, 마감 여부. 계정과목 필수, 거래처·프로젝트 선택. | FN-SFR-006-04, FN-SFR-006-06 |
| upload_history | 엑셀 업로드 이력 | HISTORY | 한 행=엑셀 업로드 1회. 대상 업무, 처리 건수, 오류 내역, 업로더(임직원 필수). | FN-SFR-006-06, FN-SFR-012-06, FN-SFR-021-12, FN-SFR-021-09 |
| change_history | 변경 이력 | HISTORY | 한 행=업무 대상 변경 1건. 대상유형+대상ID(가정), 변경일시·수정자(임직원)·변경 내용. 승인 후 변경·마감 취소·설정 변경 이력 공통. | FN-SFR-004-03, FN-SFR-006-06, FN-SFR-008-04, FN-SFR-011-01, FN-SFR-012-02, FN-SFR-012-03, FN-SFR-012-04, FN-SFR-012-05, FN-SFR-012-06, FN-SFR-012-07, FN-SFR-013-01, FN-SFR-013-02, FN-SFR-013-03, FN-SFR-015-02, FN-SFR-015-03, FN-SFR-016-03, FN-SFR-017-01, FN-SFR-017-02, FN-SFR-017-03, FN-SFR-017-04, FN-SFR-017-05, FN-SFR-017-06, FN-SFR-019-02, FN-SFR-019-03, FN-SFR-019-04, FN-SFR-020-01, FN-SFR-020-02, FN-SFR-020-03, FN-SFR-021-03, FN-SFR-021-11, FN-SFR-022-04, FN-SFR-029-07, FN-SFR-031-02, FN-SFR-031-04, FN-SFR-033-05, FN-SFR-037-02, FN-SFR-037-03, FN-SFR-042-01, FN-SFR-042-03 |
| link_log | 외부 연계 이력 | HISTORY | 한 행=외부 시스템 연계 처리 1건. 연계 대상, 상태, 실패 사유. 요청자는 선택(자동 실행 시 없음). | FN-SFR-001-04, FN-SFR-007-02, FN-SFR-007-03, FN-SFR-007-04, FN-SFR-008-02, FN-SFR-018-03, FN-SFR-023-02, FN-SFR-023-03, FN-SFR-023-10, FN-SFR-025-05, FN-SFR-032-11, FN-SFR-041-07, FN-SIR-001-01 |
| auto_journal_setting | 자동전표 증빙설정 | MASTER | 한 행=증빙유형·증빙항목 1건. 자료수집·자동분개 설정, 사용 여부. 분개 계정과목 참조. | FN-SFR-007-01 |
| tax_invoice | 전자세금계산서 | TRANSACTION | 한 행=세금계산서 1건. 발행/수취, 과세·면세, 공급가액·세액, 발행 여부, 전표처리 상태. 거래처 필수, 결의서·전표 선택(중복 처리 불가). | FN-SFR-007-02, FN-SFR-008-02, FN-SFR-008-03, FN-SFR-008-04, FN-SFR-010-06, FN-SFR-032-09, FN-SIR-001-01 |
| bank_transaction | 은행계좌 거래내역 | TRANSACTION | 한 행=계좌 거래내역 1건. 예외 거래 여부, 전표처리 여부. 계좌 필수, 전표 선택. | FN-SFR-007-03 |
| card_approval | 신용카드 승인내역 | TRANSACTION | 한 행=카드 승인내역 1건. 카드 필수, 결의서·전표 선택(중복 작성 불가). | FN-SFR-007-04 |
| cash_receipt | 현금영수증 | TRANSACTION | 한 행=현금영수증 1건. 결의서·전표 선택(중복 작성 불가). | FN-SFR-007-04 |
| journal_settlement | 반제·상계 처리 | TRANSACTION | 한 행=채권 분개라인과 채무 분개라인 간 반제·상계 1건. 동일 거래처만, 금액<=잔액, 처리자·일시. | FN-SFR-007-03, FN-SFR-008-08, FN-SFR-008-09 |
| management_item | 관리항목 | CODE | 한 행=관리항목 정의 1개. 관리자가 관리하는 코드. | FN-SFR-008-05, FN-SFR-008-07, FN-SFR-010-04 |
| journal_line_management_value | 분개라인 관리항목값 | MAPPING | 한 행=분개라인·관리항목별 값 1건(N:M 해소). | FN-SFR-008-05, FN-SFR-008-07 |
| fund_subject | 자금과목 | MASTER | 한 행=자금과목 1개. 구분, 사용 여부(사용된 과목은 삭제 불가), 연결 계정과목. | FN-SFR-009-01, FN-SFR-009-02, FN-SFR-009-03 |
| fund_pl_form_item | 자금 손익 양식 항목 | MASTER | 한 행=자금 손익 양식 항목 1개(순서, 자금과목 구성). | FN-SFR-009-01, FN-SFR-009-05 |
| fixed_fund | 고정자금 | MASTER | 한 행=고정자금 1건. 금액, 발생 주기, 적용기간(종료>=시작), 사용 여부. | FN-SFR-009-02, FN-SFR-009-03 |
| fund_plan | 자금수지계획 | TRANSACTION | 한 행=계획기간·자금과목별 수입/지출 계획 1건. 마감 후 수정 불가. | FN-SFR-009-03, FN-SFR-009-05 |
| financial_instrument | 금융자산(어음·예적금·유가증권·외화) | MASTER | 한 행=어음/예·적금/유가증권/외화 1건. 유형 속성(가정), 금융거래처 선택. | FN-SFR-009-05 |
| loan | 차입금·대여금 | TRANSACTION | 한 행=차입/대여 1건. 구분, 거래처 필수, 계정과목, 전표처리 상태. | FN-SFR-009-06 |
| loan_transaction | 차입금·대여금 원장 | HISTORY | 한 행=차입금·대여금의 거래(원장) 1건. 전표 선택. | FN-SFR-009-06 |
| closing_data | 결산자료 | TRANSACTION | 한 행=결산기간·회계단위·계정과목(·프로젝트·부서)별 결산금액 1건. 마감 후 수정 불가. | FN-SFR-010-01, FN-SFR-010-02 |
| allocation_rule | 안분 설정 | MASTER | 한 행=손익 안분 기준 1건(비율·방식, 가정). | FN-SFR-010-04 |
| vat_form | 부가가치세 서식 | TRANSACTION | 한 행=과세기간·서식구분별 서식 1건. 서식구분(기본장부/주요/영세율첨부/업종별첨부/기타). 마감 후 수정 불가. | FN-SFR-010-06 |
| asset_depreciation | 고정자산 감가상각 정보 | MASTER | 한 행=자산 1건의 취득일·취득원가(>=0)·감가상각 정보(자산과 1:1, 자산 필수). | FN-SFR-011-01, FN-SFR-011-02 |
| budget_commitment | 원인행위 | TRANSACTION | 한 행=원인행위 1건. 명칭, 금액(예산잔액 범위), 프로젝트·예산과목 필수, 거래처 선택, 승인 상태. | FN-SFR-004-04, FN-SFR-005-02 |
| personnel_record | 인사기록카드 | MASTER | 한 행=임직원 1명의 인사기록(임직원과 1:1). 입사일, 채용·거주·보훈·병역·재직정보. 개인정보 암호화. | FN-SFR-006-06, FN-SFR-012-02, FN-SFR-012-03, FN-SFR-012-04, FN-SFR-012-05, FN-SFR-012-06, FN-SFR-012-07, FN-SFR-013-02, FN-SFR-013-03, FN-SFR-013-04, FN-SFR-014-01, FN-SFR-014-02, FN-SFR-014-03, FN-SFR-015-01, FN-SFR-018-12, FN-SFR-021-05, FN-SFR-021-08, FN-SFR-022-01, FN-SFR-022-02, FN-SFR-032-01, FN-SFR-032-06, FN-SFR-032-07, FN-SFR-039-02, FN-SFR-044-03 |
| employee_family | 가족 정보 | MASTER | 한 행=임직원 가족 1명. 부양가족 여부. 암호화. | FN-SFR-012-05, FN-SFR-014-02, FN-SFR-014-03 |
| employee_education | 학력 | MASTER | 한 행=임직원 학력 1건. | FN-SFR-012-05, FN-SFR-014-02 |
| employee_career | 경력 | MASTER | 한 행=임직원 경력 1건. | FN-SFR-012-05, FN-SFR-014-02 |
| employee_license | 자격·면허 | MASTER | 한 행=임직원 자격·면허 1건. | FN-SFR-012-05, FN-SFR-014-02 |
| employee_language | 외국어 | MASTER | 한 행=임직원 외국어 능력 1건. | FN-SFR-012-05, FN-SFR-014-02 |
| employee_evaluation | 인사고과 | MASTER | 한 행=임직원 인사고과 1건(대상기간별). | FN-SFR-012-05, FN-SFR-014-02, FN-SFR-015-01 |
| employee_reward_penalty | 상벌 | MASTER | 한 행=임직원 상벌 1건. | FN-SFR-012-05, FN-SFR-014-02, FN-SFR-015-01 |
| employee_business_trip | 인사기록 출장 | MASTER | 한 행=인사기록카드의 출장 기록 1건(근태 출장과 별도). | FN-SFR-012-05, FN-SFR-014-02 |
| personnel_change_request | 인사정보 변경 신청 | TRANSACTION | 한 행=변경 신청 1건. 상태(신청/승인/반려), 반려사유 필수. | FN-SFR-012-02 |
| leave_of_absence_request | 휴직·단축근무 신청 | TRANSACTION | 한 행=신청 1건. 구분, 기간(종료>=시작), 상태. | FN-SFR-012-07 |
| personnel_appointment | 인사발령 | TRANSACTION | 한 행=임직원 발령 1건. 구분, 발령일, 발령 후 부서·직위, 상태. 처리 후 이력으로 누적. | FN-SFR-012-05, FN-SFR-013-01, FN-SFR-013-02, FN-SFR-013-03, FN-SFR-013-04, FN-SFR-014-03, FN-SFR-031-02 |
| education_code | 교육 기준코드 | CODE | 한 행=교육유형/교육방법 코드. 관리자 관리. | FN-SFR-015-02 |
| education_course | 교육과정 | MASTER | 한 행=교육과정 1개. 교육유형·방법 지정. | FN-SFR-015-02, FN-SFR-015-05 |
| education_session | 교육차수 | MASTER | 한 행=과정의 차수 1건. 기간. | FN-SFR-015-02, FN-SFR-015-03, FN-SFR-015-04, FN-SFR-015-05 |
| education_attendee | 교육대상자 | MAPPING | 한 행=차수·임직원 1건. 동일 조합 유일. | FN-SFR-012-05, FN-SFR-015-02, FN-SFR-015-03, FN-SFR-015-04, FN-SFR-015-05 |
| education_application | 교육신청 | TRANSACTION | 한 행=차수·임직원 신청 1건. 상태(신청/승인/승인 취소/반려). 중복 신청 불가. | FN-SFR-015-03, FN-SFR-015-05 |
| education_result_report | 교육결과 보고 | TRANSACTION | 한 행=차수 결과보고 1건. | FN-SFR-015-02 |
| education_evaluation | 교육평가 | TRANSACTION | 한 행=교육대상자 평가 1건. 점수, 수료 여부. | FN-SFR-015-04, FN-SFR-015-05 |
| certificate_type | 증명서 종류 | MASTER | 한 행=증명서 양식 1종. 양식 본문, 사용 여부, 승인 필요 여부, 채번 규칙(종류별 독립). | FN-SFR-016-01, FN-SFR-016-02, FN-SFR-016-03, FN-SFR-016-04, FN-SFR-032-02 |
| certificate_request | 증명서 신청 | TRANSACTION | 한 행=신청 1건. 용도, 부수, 상태(신청/승인/반려), 발급번호(종류 내 유일). | FN-SFR-016-03, FN-SFR-016-04, FN-SFR-032-02 |
| attendance_item | 근태항목 | CODE | 한 행=근태항목 1개(연차/반차/보상휴가/병가/예비군 등). 사용 여부, 차감 여부. 사용된 항목은 미사용 처리. | FN-SFR-017-02, FN-SFR-017-03, FN-SFR-018-02 |
| attendance_standard | 근태·시간외근무 기준정보 | MASTER | 한 행=기준정보 1건(구분: 기본근태/근무시간/시간외근무, 항목·값은 담당자 정의). | FN-SFR-017-01 |
| employee_attendance_setting | 임직원별 근태 적용 설정 | MASTER | 한 행=임직원·근태항목·적용시작일 1건. 임직원·근태항목 필수. | FN-SFR-017-03, FN-SFR-017-06 |
| commute_check_setting | 출퇴근 체크 유형 설정 | MASTER | 한 행=적용단위(법인/부서/사원)별 체크유형. 부서·사원 단위는 대상 필수, 우선순위 사원>부서>법인. | FN-SFR-017-04 |
| allowed_ip | 접근 허용 IP | MASTER | 한 행=허용 IP 1개(유일). 사용 여부, 출퇴근 체크 한정. | FN-SFR-017-05 |
| annual_leave_plan | 월별 연차계획 | TRANSACTION | 한 행=임직원·계획월 연차계획 1건. 일자, 승인 상태. 합계<=잔여. | FN-SFR-017-06, FN-SFR-018-08, FN-SFR-019-06, FN-SFR-032-05 |
| leave_promotion | 연차사용촉진계획 | TRANSACTION | 한 행=대상 임직원별 촉진 1건. 촉진 구분·일정·통지. | FN-SFR-017-06, FN-SFR-019-06, FN-SFR-032-05 |
| commute_record | 출퇴근 기록 | TRANSACTION | 한 행=임직원·일자 출퇴근 1건. 출·퇴근시각, 연동 여부. 마감 후 수정 불가. | FN-SFR-018-03, FN-SFR-018-04, FN-SFR-018-05, FN-SFR-018-06, FN-SFR-018-07 |
| attendance_closing | 근태 마감 | TRANSACTION | 한 행=마감 단위(일/월) 1건. 마감·마감 취소 상태. 법인 공통(가정). | FN-SFR-018-07 |
| leave_grant_rule | 연차 생성 기준 | MASTER | 한 행=기준 1건(기본일수, 가산일수·조건, 사용 여부). 이후 생성분부터 적용. | FN-SFR-018-12, FN-SFR-019-01, FN-SFR-019-02 |
| annual_leave | 연차 | TRANSACTION | 한 행=임직원·기준연도 연차 1건. 생성일수, 확정 여부, 사용·잔여. | FN-SFR-006-06, FN-SFR-018-08, FN-SFR-018-12, FN-SFR-019-02, FN-SFR-019-03, FN-SFR-019-04, FN-SFR-019-05, FN-SFR-019-06, FN-SFR-032-05 |
| leave_usage | 연차 사용 내역 | HISTORY | 한 행=승인된 연차 근태의 차감 1건. | FN-SFR-018-08, FN-SFR-018-12, FN-SFR-019-05 |
| annual_leave_settlement | 연차 정산 | TRANSACTION | 한 행=연차 정산 1건. 정산기준일, 미사용 수당. | FN-SFR-019-03 |
| attendance_trip_traveler | 출장자·이동수단 | MAPPING | 한 행=출장 근태의 출장자 1명. 이동수단(가정). | FN-SFR-018-10 |
| payroll_code | 급여 기초코드 | CODE | 한 행=코드구분(근로소득/퇴직소득/소득공제/농특세/지방소득세/사회보험정산/학자금상환)별 코드 1개. 구분 내 유일, 사용 여부. | FN-SFR-020-01, FN-SFR-020-03 |
| payroll_item | 지급공제항목 | CODE | 한 행=지급 또는 공제 항목 1개. 사용 여부. | FN-SFR-020-03 |
| payroll_account_mapping | 급여 전표 계정 설정 | MAPPING | 한 행=급여구분별 전표처리 계정과목 1건. | FN-SFR-020-02, FN-SFR-021-10 |
| withholding_adjustment_request | 원천징수세액 조정 신청 | TRANSACTION | 한 행=신청 1건. 승인 상태, 개인정보 열람 이력 대상. | FN-SFR-020-03 |
| salary_step | 호봉테이블 | MASTER | 한 행=호봉 등급 1개와 금액. | FN-SFR-021-11 |
| employee_wage | 임직원 책정임금·호봉 | HISTORY | 한 행=임직원·적용일별 책정임금(암호화)과 호봉 1건. | FN-SFR-021-03, FN-SFR-021-11 |
| payroll_run | 급여 지급일 | TRANSACTION | 한 행=지급일·급여구분 1건. 마감 여부, 전표처리 상태. 급여는 지급일로 연결(가정). | FN-SFR-021-02, FN-SFR-021-06, FN-SFR-021-08, FN-SFR-021-10 |
| payroll_detail | 급여 항목 상세 | TRANSACTION | 한 행=급여 1건의 지급·공제항목별 금액. 암호화. | FN-SFR-021-15, FN-SFR-022-03 |
| daily_worker | 일용직 사원 | MASTER | 한 행=일용직 1명. 성명, 주민번호 암호화, 일급. | FN-SFR-021-04, FN-SFR-021-12, FN-SFR-021-13, FN-SFR-023-04 |
| daily_worker_payment | 일용직 급여 지급 | TRANSACTION | 한 행=일용직·지급일 1건. 근무일수, 지급액. | FN-SFR-021-04, FN-SFR-021-12, FN-SFR-021-13, FN-SFR-023-04 |
| severance_calculation | 퇴직금 산정 | TRANSACTION | 한 행=퇴직 임직원 1건의 산정 결과·추계액. 암호화. | FN-SFR-021-05, FN-SFR-021-14, FN-SFR-023-05 |
| social_insurance_enrollment | 사회보험 취득·상실 대상자 | TRANSACTION | 한 행=임직원·보험종류·신고구분 1건. 취득일/상실일, 상실사유(상실 시만). | FN-SFR-022-01 |
| social_insurance_grade | 사회보험 등급 | HISTORY | 한 행=임직원·보험종류·적용시작월별 등급 1건(변경 이력 누적). | FN-SFR-022-03, FN-SFR-022-04 |
| social_insurance_report | 사회보험 신고서 | TRANSACTION | 한 행=신고서 1건(종류·기간). 작성·출력 이력 관리, 전자신고 없음. | FN-SFR-022-01, FN-SFR-022-02 |
| tax_filing | 세무 신고서 | TRANSACTION | 한 행=신고서·명세서 1건. 유형(원천징수이행상황/학자금상환/지방세/간이지급명세서/제출집계표 등), 귀속·지급연월, 전자신고 결과(접수 성공·실패). | FN-SFR-023-01, FN-SFR-023-02, FN-SFR-023-03, FN-SFR-023-09, FN-SFR-023-10 |
| income_certificate | 소득 지급명세서·원천징수영수증 | TRANSACTION | 한 행=발급 문서 1건. 구분(일용근로/퇴직소득/근로소득), 귀속기간. 임직원 또는 일용직 중 하나 참조. | FN-SFR-021-13, FN-SFR-021-14, FN-SFR-023-04, FN-SFR-023-05, FN-SFR-023-07, FN-SFR-023-09 |
| year_end_item | 연말정산 항목 | CODE | 한 행=연말정산 공제 항목 1개. 급여 담당자 관리. | FN-SFR-023-06 |
| year_end_data | 연말정산 자료 | TRANSACTION | 한 행=임직원·연도·항목별 자료 1건. 마감 후 수정 불가. | FN-SFR-023-06, FN-SFR-032-07 |
| year_end_result | 연말정산 결과 | TRANSACTION | 한 행=임직원·연도 정산 결과 1건. 납부세액. | FN-SFR-023-06, FN-SFR-023-07, FN-SFR-023-08 |
| year_end_installment | 연말정산 분납 | TRANSACTION | 한 행=정산 결과의 분납 회차 1건. 분납합계=납부세액. | FN-SFR-023-08 |
| purchase_asset_item | 구매품의 자산품목 | TRANSACTION | 한 행=구매품의서의 자산품목 1건. 수량, 금액, 검수 여부, 자산 등록 연계 여부(중복 연계 불가). 품의서 필수, 자산 선택. | FN-SFR-024-03 |
| asset_change | 자산 변동 이력 | HISTORY | 한 행=자산 변동 1건. 변동유형·일자·내용. 상시 변동 포함. | FN-SFR-025-02, FN-SFR-025-05 |
| asset_print_log | QR·바코드 출력 이력 | HISTORY | 한 행=출력 1건. 자산번호 기준. | FN-SFR-025-03 |
| asset_inspection_plan | 자산실사 계획 | TRANSACTION | 한 행=실사계획 1건. 유형, 기간(종료>시작), 승인 상태, 진행 상태. | FN-SFR-025-04, FN-SFR-025-05 |
| asset_inspection_item | 자산실사 결과 | TRANSACTION | 한 행=실사계획·자산별 실사 결과 1건. | FN-SFR-025-05 |
| resource_category | 자원 분류 | MASTER | 한 행=자원 분류 1개. 정렬 순서. 예약 존재 시 삭제 제한. | FN-SFR-033-01, FN-SFR-033-03 |
| resource | 자원 | MASTER | 한 행=자원 1개. 승인절차 사용 여부, 공개범위. 분류 필수, 담당자(임직원) 선택. | FN-SFR-033-01, FN-SFR-033-02, FN-SFR-033-03, FN-SFR-033-05 |
| resource_attribute | 자원 속성 | MASTER | 한 행=자원의 속성 1건(검색 필터). | FN-SFR-033-01, FN-SFR-033-03 |
| resource_permission | 자원 사용 권한 | MAPPING | 한 행=자원별 사용 권한 범위 1건(부서 또는 임직원). | FN-SFR-033-01, FN-SFR-033-02, FN-SFR-033-03 |
| resource_reservation | 자원 예약 | TRANSACTION | 한 행=예약 1건. 기간(종료>=시작), 반복, 상태(신청/승인/반려/취소). 승인 예약과 시간 중복 불가. | FN-SFR-028-02, FN-SFR-033-01, FN-SFR-033-02, FN-SFR-033-05, FN-SFR-033-06, FN-SFR-040-06 |
| schedule | 일정 | TRANSACTION | 한 행=일정 1건. 소유 임직원 필수. | FN-SFR-027-03, FN-SFR-028-02, FN-SFR-039-01, FN-SFR-040-06 |
| board_post | 공지·게시물 | TRANSACTION | 한 행=게시물 1건. 구분·분류, 공개범위, 팝업·상단고정 기간(시작<=종료). 작성자 필수. | FN-SFR-013-03, FN-SFR-026-03, FN-SFR-028-02, FN-SFR-034-01, FN-SFR-034-02, FN-SFR-034-03, FN-SFR-036-08, FN-SFR-039-01, FN-SFR-039-02, FN-SFR-040-02, FN-SFR-040-04, FN-SFR-040-10 |
| post_audience | 게시물 공개범위 대상 | MAPPING | 한 행=게시물 공개 대상 1건(부서 또는 임직원). | FN-SFR-034-01 |
| post_read_log | 게시물 열람 이력 | HISTORY | 한 행=게시물·임직원 열람 1건(열람 일시). | FN-SFR-034-02, FN-SFR-034-03 |
| survey | 설문조사 | TRANSACTION | 한 행=설문 1건. 기간(종료>=시작), 상태(진행 전/진행 중/종료), 댓글·결과·참여자 공개 여부, 알림 채널. | FN-SFR-035-01, FN-SFR-035-02 |
| survey_target | 설문 대상 | MAPPING | 한 행=설문·임직원 1건. 설문당 1회 응답. | FN-SFR-035-01, FN-SFR-035-03 |
| survey_question | 설문항목 | MASTER | 한 행=설문 문항 1개. 유형(선택형/주관식), 단답/다답, 기타의견 여부. | FN-SFR-035-02, FN-SFR-035-03 |
| survey_option | 설문 선택지 | MASTER | 한 행=문항 선택지 1개. 선택형은 1개 이상. | FN-SFR-035-02 |
| survey_response | 설문 응답 | TRANSACTION | 한 행=문항·응답자별 응답 1건. 주관식, 기타의견. | FN-SFR-035-03 |
| survey_response_option | 설문 응답 선택지 | MAPPING | 한 행=응답에서 선택한 선택지 1건. | FN-SFR-035-03 |
| survey_comment | 설문 댓글 | TRANSACTION | 한 행=설문 댓글 1건. 댓글 사용 설문만. | FN-SFR-035-03 |
| messenger_room | 대화방 | MASTER | 한 행=대화방 1개. 생성자(임직원) 관리. | FN-SFR-036-01 |
| messenger_room_member | 대화방 참여자 | MAPPING | 한 행=대화방·임직원 1건. | FN-SFR-036-01 |
| messenger_message | 메신저 메시지 | TRANSACTION | 한 행=쪽지·대화 메시지 1건. 발신자 필수, 대화방 선택(쪽지는 없음), 답장 원본 참조. 서버 저장. | FN-SFR-028-02, FN-SFR-036-02, FN-SFR-036-03, FN-SFR-036-04, FN-SFR-036-05, FN-SFR-036-07, FN-SFR-041-05 |
| messenger_message_recipient | 메시지 수신자 | MAPPING | 한 행=메시지·수신자 1건. 읽음 상태. | FN-SFR-036-02, FN-SFR-036-03 |
| auth_setting | 인증 설정 | MASTER | 한 행=인증 대상 임직원별 허용 인증기기 수(0 이상). 대상 없음=기본 설정(가정). | FN-SFR-037-02, FN-SFR-037-03 |
| auth_device | 인증기기 | MASTER | 한 행=임직원 인증기기 1대. OTP 기준, 승인 상태, 사용 여부. | FN-SFR-036-07, FN-SFR-037-02, FN-SFR-037-03, FN-SFR-040-01 |
| menu_usage_log | 메뉴 사용 이력 | HISTORY | 한 행=메뉴 사용 1건. 일시, 접속 IP, 사용 환경(웹/모바일). | FN-SFR-027-04, FN-SFR-038-02, FN-SFR-038-04 |
| approval_line | 결재선 | TRANSACTION | 한 행=결재문서의 결재자 1명(순서, 결재 상태·의견). | FN-SFR-029-04, FN-SFR-030-03, FN-SFR-040-07 |
| document_numbering_rule | 문서번호 채번 기준 | MASTER | 한 행=기안 부서별 채번 기준 1건. 번호 유일. | FN-SFR-029-06 |
| approval_linked_form | 연동결재 대상 양식 | MAPPING | 한 행=연동결재 대상으로 등록한 결재양식 1건. | FN-SIR-002-03 |
| approval_handover | 결재문서 인수인계 | HISTORY | 한 행=인수인계 1건. 인계자·인수자(임직원), 사유, 문서 범위. | FN-SFR-031-02 |
| document_box | 문서함 | MASTER | 한 행=문서함 1개. 개인(임직원) 또는 부서 소유. | FN-SFR-031-03, FN-SFR-039-01, FN-SFR-040-09 |
| document_box_item | 문서함 문서 | MAPPING | 한 행=문서함·결재문서 1건. | FN-SFR-031-03, FN-SFR-040-09 |
| document_dispatch_rule | 문서유형별 담당부서 배분 기준 | MASTER | 한 행=문서유형별 담당 부서 1건(사전 설정). | FN-SFR-044-01 |
| office_template | 웹 오피스 템플릿 | MASTER | 한 행=템플릿 1개(보고서/기획서). | FN-SFR-041-01 |
| office_document | 웹 오피스 문서 | TRANSACTION | 한 행=문서 1건. 작성자 필수, 템플릿 선택, 차트 유형·데이터, ECM 참조. | FN-SFR-041-01, FN-SFR-041-03, FN-SFR-041-05, FN-SFR-041-06, FN-SFR-041-07 |
| office_document_share | 문서 공유 권한 | MAPPING | 한 행=문서·사용자 공유 1건. 열람/수정 권한(수정은 열람 전제). | FN-SFR-041-05, FN-SFR-041-06, FN-SFR-041-07 |
| fee_unit_price | 수수료 단가 | MASTER | 한 행=수수료구분(심사/재발급)별 단가·적용기간 1건. 변경은 이후 등록분부터. | FN-SFR-042-01, FN-SFR-042-03, FN-SFR-042-04, FN-SFR-042-05 |
| fee_record | 수수료 등록 | TRANSACTION | 한 행=심사/재발급 수수료 등록 1건. 심사·결의일자, 수량, 금액(단가 기준), 오프라인 여부. | FN-SFR-042-03, FN-SFR-042-04, FN-SFR-042-05 |
| api_client | 연계 시스템 | MASTER | 한 행=API 호출 허용 등록 시스템 1개(Tcon, WTA 사이버연수원). 미등록 호출 불가. | FN-SIR-002-01, FN-SIR-002-02 |
| interface_standard | 연계 인터페이스 표준 | MASTER | 한 행=대상 시스템별 표준 1건(연계 항목·방식·버전). | FN-SIR-002-01, FN-SIR-002-02 |
| api_call_log | API 호출 이력 | HISTORY | 한 행=API 호출 1건. 결과, 오류. | FN-SIR-002-02 |
| help_content | 도움말 | MASTER | 한 행=메뉴·기능별 도움말 1건. 사용자 매뉴얼과 일치. | FN-SIR-003-01 |
| error_message | 에러 메시지 | CODE | 한 행=에러 메시지 정의 1건(코드, 원인·조치 안내). 내부정보 미노출. | FN-SIR-003-02 |
| portal_widget_setting | 포털 위젯 설정 | MASTER | 한 행=임직원별 위젯 표시 여부·순서 1건. 미설정 시 기본 구성(가정). | FN-SFR-026-04, FN-SFR-027-03, FN-SFR-027-05 |
| portal_banner | 포털 배너 | MASTER | 한 행=배너 1개. | FN-SFR-026-04, FN-SFR-027-03, FN-SFR-027-05 |
| quick_link | 퀵링크 | MASTER | 한 행=임직원 퀵링크 1건. | FN-SFR-027-03 |
| personal_menu | 개인 메뉴 구성 | MAPPING | 한 행=임직원·메뉴·순서. 사용 권한 있는 메뉴만. | FN-SFR-026-04, FN-SFR-027-05 |
| employee_department | 겸직 부서 | MAPPING | 한 행=임직원·겸직 부서 1건(주부서는 employee). | FN-SFR-029-05 |
| mail_message | 메일 | TRANSACTION | 한 행=메일 1건. 발신자 필수, 제목·본문. | FN-SFR-040-03 |
| mail_recipient | 메일 수신자 | MAPPING | 한 행=메일·수신자 1건. 읽음 상태. | FN-SFR-040-02, FN-SFR-040-03 |
| credit_card_permission | 신용카드 조회 권한 | MAPPING | 한 행=(신용카드, 임직원) 조회 권한 1건. 카드 N:1 필수, 임직원 N:1 필수. 조합(credit_card_id, employee_id) 유일. 권한 대상은 임직원으로 한정(가정). | FN-SFR-002-06 |
| project_permission | 프로젝트 사용 권한 | MAPPING | 한 행=(프로젝트, 임직원 또는 부서) 사용 권한 1건. 프로젝트 N:1 필수. 대상은 임직원 또는 부서 중 하나만 지정(가정). 프로젝트·대상 조합 유일. | FN-SFR-002-01 |
| sub_project_permission | 하위사업 사용 권한 | MAPPING | 한 행=(하위사업, 임직원 또는 부서) 사용 권한 1건. 하위사업 N:1 필수. 대상은 임직원 또는 부서 중 하나만 지정(가정). 하위사업·대상 조합 유일. | FN-SFR-002-02 |
| account_transfer_resolution | 계좌 대체결의 | TRANSACTION | 한 행=원 결의서의 은행계좌 대체 1건. 원 결의서 N:1 필수, 대체 거래처 계좌 N:1 필수, 대체 사유 필수, 처리자(임직원) 필수·처리일시. 대체결의서는 expense_resolution으로 별도 선택 연결(가정). | FN-SFR-004-07 |
| rfid_scan_log | RFID 스캔 이력 | HISTORY | 한 행=RFID 태그 스캔 1건. 태그 식별값, 스캔일시, 매칭 여부 속성. 자산은 선택 참조(미매칭이면 NULL). 미매칭 태그 목록은 매칭 여부로 조회. | FN-SFR-001-03 |

## 3. 관계

| 자식 테이블.외래키 | 부모 테이블 | 관계 | 참여 |
|---|---|---|---|
| employee.department_id | department | 1:N | 필수 |
| department.parent_department_id | department | 1:N | 선택 |
| menu_permission.employee_id | employee | 1:N | 필수 |
| menu_permission.menu_id | menu | 1:N | 필수 |
| project.department_id | department | 1:N | 필수 |
| project.manager_id | employee | 1:N | 필수 |
| sub_project.project_id | project | 1:N | 필수 |
| sub_project.parent_sub_project_id | sub_project | 1:N | 선택 |
| budget_account.account_subject_id | account_subject | 1:N | 선택 |
| budget_account.parent_budget_account_id | budget_account | 1:N | 선택 |
| partner.project_id | project | 1:N | 필수 |
| partner_account.partner_id | partner | 1:N | 필수 |
| approval_document.approval_form_id | approval_form | 1:N | 필수 |
| approval_document.drafter_id | employee | 1:N | 필수 |
| notification.recipient_id | employee | 1:N | 필수 |
| attachment.uploader_id | employee | 1:N | 필수 |
| budget_main.project_id | project | 1:N | 필수 |
| budget_main.budget_account_id | budget_account | 1:N | 필수 |
| budget_main.requester_id | employee | 1:N | 필수 |
| budget_execution.budget_main_id | budget_main | 1:N | 필수 |
| budget_adjustment.project_id | project | 1:N | 필수 |
| budget_adjustment.budget_account_id | budget_account | 1:N | 필수 |
| budget_adjustment.target_budget_account_id | budget_account | 1:N | 선택 |
| requisition.project_id | project | 1:N | 필수 |
| requisition.budget_account_id | budget_account | 1:N | 필수 |
| requisition.drafter_id | employee | 1:N | 필수 |
| requisition.approval_document_id | approval_document | 1:N | 선택 |
| expense_resolution.requisition_id | requisition | 1:N | 선택 |
| expense_resolution.project_id | project | 1:N | 필수 |
| expense_resolution.budget_account_id | budget_account | 1:N | 필수 |
| expense_resolution.partner_id | partner | 1:N | 선택 |
| expense_resolution.department_id | department | 1:N | 필수 |
| expense_resolution.approval_document_id | approval_document | 1:N | 선택 |
| journal_entry.expense_resolution_id | expense_resolution | 1:N | 필수 |
| journal_entry_line.journal_entry_id | journal_entry | 1:N | 필수 |
| journal_entry_line.account_subject_id | account_subject | 1:N | 필수 |
| journal_entry_line.partner_id | partner | 1:N | 선택 |
| journal_entry_line.project_id | project | 1:N | 선택 |
| journal_entry_line.budget_account_id | budget_account | 1:N | 선택 |
| attendance_request.employee_id | employee | 1:N | 필수 |
| attendance_request.approval_document_id | approval_document | 1:N | 선택 |
| payroll.employee_id | employee | 1:N | 필수 |
| asset.manager_id | employee | 1:N | 선택 |
| asset.project_id | project | 1:N | 선택 |
| asset.account_subject_id | account_subject | 1:N | 선택 |
| asset.partner_id | partner | 1:N | 선택 |
| personal_info_access_log.employee_id | employee | 1:N | 필수 |
| personal_info_access_log.target_employee_id | employee | 1:N | 선택 |
| login_history.employee_id | employee | 1:N | 필수 |
| budget_carryover.project_id | project | 1:N | 필수 |
| budget_carryover.budget_account_id | budget_account | 1:N | 필수 |
| account_carryover.account_subject_id | account_subject | 1:N | 필수 |
| account_carryover.partner_id | partner | 1:N | 선택 |
| account_carryover.project_id | project | 1:N | 선택 |
| upload_history.uploader_id | employee | 1:N | 필수 |
| change_history.changer_id | employee | 1:N | 필수 |
| link_log.requester_id | employee | 1:N | 선택 |
| auto_journal_setting.account_subject_id | account_subject | 1:N | 필수 |
| tax_invoice.partner_id | partner | 1:N | 필수 |
| tax_invoice.expense_resolution_id | expense_resolution | 1:N | 선택 |
| tax_invoice.journal_entry_id | journal_entry | 1:N | 선택 |
| bank_transaction.partner_account_id | partner_account | 1:N | 필수 |
| bank_transaction.journal_entry_id | journal_entry | 1:N | 선택 |
| card_approval.credit_card_id | credit_card | 1:N | 필수 |
| card_approval.expense_resolution_id | expense_resolution | 1:N | 선택 |
| card_approval.journal_entry_id | journal_entry | 1:N | 선택 |
| cash_receipt.expense_resolution_id | expense_resolution | 1:N | 선택 |
| cash_receipt.journal_entry_id | journal_entry | 1:N | 선택 |
| journal_settlement.receivable_line_id | journal_entry_line | 1:N | 필수 |
| journal_settlement.payable_line_id | journal_entry_line | 1:N | 필수 |
| journal_settlement.partner_id | partner | 1:N | 필수 |
| journal_settlement.settled_by_id | employee | 1:N | 필수 |
| journal_line_management_value.journal_entry_line_id | journal_entry_line | 1:N | 필수 |
| journal_line_management_value.management_item_id | management_item | 1:N | 필수 |
| fund_subject.account_subject_id | account_subject | 1:N | 선택 |
| fund_pl_form_item.fund_subject_id | fund_subject | 1:N | 필수 |
| fixed_fund.fund_subject_id | fund_subject | 1:N | 필수 |
| fixed_fund.partner_id | partner | 1:N | 선택 |
| fixed_fund.project_id | project | 1:N | 선택 |
| fixed_fund.budget_account_id | budget_account | 1:N | 선택 |
| fund_plan.fund_subject_id | fund_subject | 1:N | 필수 |
| financial_instrument.partner_id | partner | 1:N | 선택 |
| loan.partner_id | partner | 1:N | 필수 |
| loan.account_subject_id | account_subject | 1:N | 필수 |
| loan_transaction.loan_id | loan | 1:N | 필수 |
| loan_transaction.journal_entry_id | journal_entry | 1:N | 선택 |
| closing_data.accounting_unit_id | accounting_unit | 1:N | 필수 |
| closing_data.account_subject_id | account_subject | 1:N | 필수 |
| closing_data.project_id | project | 1:N | 선택 |
| closing_data.department_id | department | 1:N | 선택 |
| allocation_rule.project_id | project | 1:N | 선택 |
| allocation_rule.department_id | department | 1:N | 선택 |
| asset_depreciation.asset_id | asset | 1:1 | 필수 |
| asset_depreciation.account_subject_id | account_subject | 1:N | 필수 |
| budget_commitment.project_id | project | 1:N | 필수 |
| budget_commitment.budget_account_id | budget_account | 1:N | 필수 |
| budget_commitment.partner_id | partner | 1:N | 선택 |
| personnel_record.employee_id | employee | 1:1 | 필수 |
| employee_family.employee_id | employee | 1:N | 필수 |
| employee_education.employee_id | employee | 1:N | 필수 |
| employee_career.employee_id | employee | 1:N | 필수 |
| employee_license.employee_id | employee | 1:N | 필수 |
| employee_language.employee_id | employee | 1:N | 필수 |
| employee_evaluation.employee_id | employee | 1:N | 필수 |
| employee_reward_penalty.employee_id | employee | 1:N | 필수 |
| employee_business_trip.employee_id | employee | 1:N | 필수 |
| personnel_change_request.employee_id | employee | 1:N | 필수 |
| personnel_change_request.reviewer_id | employee | 1:N | 선택 |
| leave_of_absence_request.employee_id | employee | 1:N | 필수 |
| leave_of_absence_request.approval_document_id | approval_document | 1:N | 선택 |
| leave_of_absence_request.reviewer_id | employee | 1:N | 선택 |
| personnel_appointment.employee_id | employee | 1:N | 필수 |
| personnel_appointment.department_id | department | 1:N | 필수 |
| personnel_appointment.approval_document_id | approval_document | 1:N | 선택 |
| personnel_appointment.processed_by | employee | 1:N | 선택 |
| education_course.education_type_id | education_code | 1:N | 필수 |
| education_course.education_method_id | education_code | 1:N | 필수 |
| education_session.education_course_id | education_course | 1:N | 필수 |
| education_attendee.education_session_id | education_session | 1:N | 필수 |
| education_attendee.employee_id | employee | 1:N | 필수 |
| education_application.education_session_id | education_session | 1:N | 필수 |
| education_application.employee_id | employee | 1:N | 필수 |
| education_application.approval_document_id | approval_document | 1:N | 선택 |
| education_result_report.education_session_id | education_session | 1:N | 필수 |
| education_evaluation.education_attendee_id | education_attendee | 1:N | 필수 |
| certificate_request.certificate_type_id | certificate_type | 1:N | 필수 |
| certificate_request.employee_id | employee | 1:N | 필수 |
| certificate_request.approval_document_id | approval_document | 1:N | 선택 |
| employee_attendance_setting.employee_id | employee | 1:N | 필수 |
| employee_attendance_setting.attendance_item_id | attendance_item | 1:N | 필수 |
| commute_check_setting.department_id | department | 1:N | 선택 |
| commute_check_setting.employee_id | employee | 1:N | 선택 |
| annual_leave_plan.employee_id | employee | 1:N | 필수 |
| annual_leave_plan.approval_document_id | approval_document | 1:N | 선택 |
| leave_promotion.employee_id | employee | 1:N | 필수 |
| leave_promotion.notification_id | notification | 1:N | 선택 |
| commute_record.employee_id | employee | 1:N | 필수 |
| attendance_closing.approval_document_id | approval_document | 1:N | 선택 |
| annual_leave.employee_id | employee | 1:N | 필수 |
| annual_leave.leave_grant_rule_id | leave_grant_rule | 1:N | 선택 |
| leave_usage.annual_leave_id | annual_leave | 1:N | 필수 |
| leave_usage.attendance_request_id | attendance_request | 1:N | 필수 |
| annual_leave_settlement.annual_leave_id | annual_leave | 1:N | 필수 |
| attendance_trip_traveler.attendance_request_id | attendance_request | 1:N | 필수 |
| attendance_trip_traveler.employee_id | employee | 1:N | 필수 |
| payroll_account_mapping.account_subject_id | account_subject | 1:N | 필수 |
| withholding_adjustment_request.employee_id | employee | 1:N | 필수 |
| withholding_adjustment_request.approval_document_id | approval_document | 1:N | 선택 |
| employee_wage.employee_id | employee | 1:N | 필수 |
| employee_wage.salary_step_id | salary_step | 1:N | 선택 |
| payroll_run.journal_entry_id | journal_entry | 1:N | 선택 |
| payroll_detail.payroll_id | payroll | 1:N | 필수 |
| payroll_detail.payroll_item_id | payroll_item | 1:N | 필수 |
| daily_worker_payment.daily_worker_id | daily_worker | 1:N | 필수 |
| severance_calculation.employee_id | employee | 1:N | 필수 |
| social_insurance_enrollment.employee_id | employee | 1:N | 필수 |
| social_insurance_grade.employee_id | employee | 1:N | 필수 |
| social_insurance_grade.changed_by_id | employee | 1:N | 선택 |
| social_insurance_report.employee_id | employee | 1:N | 선택 |
| social_insurance_report.social_insurance_enrollment_id | social_insurance_enrollment | 1:N | 선택 |
| social_insurance_report.created_by_id | employee | 1:N | 선택 |
| income_certificate.employee_id | employee | 1:N | 선택 |
| income_certificate.daily_worker_id | daily_worker | 1:N | 선택 |
| year_end_data.employee_id | employee | 1:N | 필수 |
| year_end_data.year_end_item_id | year_end_item | 1:N | 필수 |
| year_end_data.attachment_id | attachment | 1:N | 선택 |
| year_end_result.employee_id | employee | 1:N | 필수 |
| year_end_installment.year_end_result_id | year_end_result | 1:N | 필수 |
| purchase_asset_item.requisition_id | requisition | 1:N | 필수 |
| purchase_asset_item.asset_id | asset | 1:N | 선택 |
| asset_change.asset_id | asset | 1:N | 필수 |
| asset_change.approval_document_id | approval_document | 1:N | 선택 |
| asset_change.changed_by_id | employee | 1:N | 선택 |
| asset_print_log.asset_id | asset | 1:N | 필수 |
| asset_print_log.printed_by_id | employee | 1:N | 필수 |
| asset_inspection_plan.approval_document_id | approval_document | 1:N | 선택 |
| asset_inspection_plan.manager_id | employee | 1:N | 필수 |
| asset_inspection_item.asset_inspection_plan_id | asset_inspection_plan | 1:N | 필수 |
| asset_inspection_item.asset_id | asset | 1:N | 필수 |
| resource.resource_category_id | resource_category | 1:N | 필수 |
| resource.manager_id | employee | 1:N | 선택 |
| resource_attribute.resource_id | resource | 1:N | 필수 |
| resource_permission.resource_id | resource | 1:N | 필수 |
| resource_permission.department_id | department | 1:N | 선택 |
| resource_permission.employee_id | employee | 1:N | 선택 |
| resource_reservation.resource_id | resource | 1:N | 필수 |
| resource_reservation.reserver_id | employee | 1:N | 필수 |
| resource_reservation.user_id | employee | 1:N | 선택 |
| resource_reservation.processed_by | employee | 1:N | 선택 |
| schedule.owner_id | employee | 1:N | 필수 |
| board_post.author_id | employee | 1:N | 필수 |
| post_audience.board_post_id | board_post | 1:N | 필수 |
| post_audience.department_id | department | 1:N | 선택 |
| post_audience.employee_id | employee | 1:N | 선택 |
| post_read_log.board_post_id | board_post | 1:N | 필수 |
| post_read_log.employee_id | employee | 1:N | 필수 |
| survey.creator_id | employee | 1:N | 필수 |
| survey_target.survey_id | survey | 1:N | 필수 |
| survey_target.employee_id | employee | 1:N | 필수 |
| survey_question.survey_id | survey | 1:N | 필수 |
| survey_option.survey_question_id | survey_question | 1:N | 필수 |
| survey_response.survey_question_id | survey_question | 1:N | 필수 |
| survey_response.respondent_id | employee | 1:N | 필수 |
| survey_response_option.survey_response_id | survey_response | 1:N | 필수 |
| survey_response_option.survey_option_id | survey_option | 1:N | 필수 |
| survey_comment.survey_id | survey | 1:N | 필수 |
| survey_comment.author_id | employee | 1:N | 필수 |
| messenger_room.creator_id | employee | 1:N | 필수 |
| messenger_room_member.messenger_room_id | messenger_room | 1:N | 필수 |
| messenger_room_member.employee_id | employee | 1:N | 필수 |
| messenger_message.messenger_room_id | messenger_room | 1:N | 선택 |
| messenger_message.sender_id | employee | 1:N | 필수 |
| messenger_message.reply_to_message_id | messenger_message | 1:N | 선택 |
| messenger_message_recipient.messenger_message_id | messenger_message | 1:N | 필수 |
| messenger_message_recipient.recipient_id | employee | 1:N | 필수 |
| auth_setting.employee_id | employee | 1:N | 선택 |
| auth_device.employee_id | employee | 1:N | 필수 |
| auth_device.approver_id | employee | 1:N | 선택 |
| menu_usage_log.employee_id | employee | 1:N | 필수 |
| menu_usage_log.menu_id | menu | 1:N | 필수 |
| approval_line.approval_document_id | approval_document | 1:N | 필수 |
| approval_line.employee_id | employee | 1:N | 필수 |
| document_numbering_rule.department_id | department | 1:N | 필수 |
| approval_linked_form.approval_form_id | approval_form | 1:N | 필수 |
| approval_handover.from_employee_id | employee | 1:N | 필수 |
| approval_handover.to_employee_id | employee | 1:N | 필수 |
| approval_handover.handled_by_id | employee | 1:N | 필수 |
| document_box.employee_id | employee | 1:N | 선택 |
| document_box.department_id | department | 1:N | 선택 |
| document_box_item.document_box_id | document_box | 1:N | 필수 |
| document_box_item.approval_document_id | approval_document | 1:N | 필수 |
| document_dispatch_rule.department_id | department | 1:N | 필수 |
| office_document.author_id | employee | 1:N | 필수 |
| office_document.office_template_id | office_template | 1:N | 선택 |
| office_document_share.office_document_id | office_document | 1:N | 필수 |
| office_document_share.employee_id | employee | 1:N | 필수 |
| fee_record.fee_unit_price_id | fee_unit_price | 1:N | 필수 |
| interface_standard.api_client_id | api_client | 1:N | 필수 |
| api_call_log.api_client_id | api_client | 1:N | 선택 |
| api_call_log.interface_standard_id | interface_standard | 1:N | 선택 |
| help_content.menu_id | menu | 1:N | 필수 |
| portal_widget_setting.employee_id | employee | 1:N | 필수 |
| quick_link.employee_id | employee | 1:N | 필수 |
| personal_menu.employee_id | employee | 1:N | 필수 |
| personal_menu.menu_id | menu | 1:N | 필수 |
| employee_department.employee_id | employee | 1:N | 필수 |
| employee_department.department_id | department | 1:N | 필수 |
| mail_message.sender_id | employee | 1:N | 필수 |
| mail_recipient.mail_message_id | mail_message | 1:N | 필수 |
| mail_recipient.recipient_id | employee | 1:N | 필수 |
| credit_card_permission.credit_card_id | credit_card | 1:N | 필수 |
| credit_card_permission.employee_id | employee | 1:N | 필수 |
| project_permission.project_id | project | 1:N | 필수 |
| project_permission.employee_id | employee | 1:N | 선택 |
| project_permission.department_id | department | 1:N | 선택 |
| sub_project_permission.sub_project_id | sub_project | 1:N | 필수 |
| sub_project_permission.employee_id | employee | 1:N | 선택 |
| sub_project_permission.department_id | department | 1:N | 선택 |
| account_transfer_resolution.expense_resolution_id | expense_resolution | 1:N | 필수 |
| account_transfer_resolution.partner_account_id | partner_account | 1:N | 필수 |
| account_transfer_resolution.processor_id | employee | 1:N | 필수 |
| rfid_scan_log.asset_id | asset | 1:N | 선택 |

## 4. 업무 제약 (DDL에 들어간 것)

| 테이블 | 제약 | 내용 |
|---|---|---|
| employee | 허용값 | employment_status: 재직자, 퇴직자 |
| employee | 유일 | employee_no |
| department | 값 조건 | parent_department_id <> department_id |
| department | 유일 | department_code |
| menu | 조합 유일 | module, name |
| menu | 허용값 | use_status: 사용, 미사용 |
| menu_permission | 조합 유일 | employee_id, menu_id |
| menu_permission | 허용값 | view_scope: 전체, 부서, 개인 |
| project | 값 조건 | end_date >= start_date |
| project | 값 조건 | project_amount >= 0 |
| project | 허용값 | business_category: 고유목적사업, 수익사업, 공통사업 |
| project | 허용값 | project_type: 공통, 직접사업 |
| project | 유일 | project_code |
| sub_project | 조합 유일 | project_id, parent_sub_project_id, name |
| sub_project | 허용값 | use_status: 사용, 미사용 |
| budget_account | 값 조건 | use_end_date >= use_start_date |
| budget_account | 허용값 | income_expense_type: 수입, 지출 |
| budget_account | 허용값 | control_cycle: 월, 분기, 연 |
| account_subject | 허용값 | category: 자산, 부채, 자본, 수익, 비용 |
| account_subject | 유일 | code |
| partner | 값 조건 | trade_end_date >= trade_start_date |
| partner | 허용값 | partner_type: 일반, 금융 |
| partner | 유일 | code |
| partner_account | 조합 유일 | partner_id, bank_name, account_number_enc |
| partner_account | 허용값 | use_status: 사용, 미사용 |
| credit_card | 허용값 | card_type: 법인, 개인, 사업용 |
| approval_document | 조건부 필수 | approval_status이 결재대기, 승인, 보류, 반려, 완료이면 submitted_at 필수 |
| approval_document | 조건부 필수 | approval_status이 완료이면 completed_at 필수 |
| approval_document | 값 조건 | completed_at >= submitted_at |
| approval_document | 허용값 | approval_status: 기안, 결재대기, 승인, 보류, 반려, 회수, 재기안, 완료 |
| approval_document | 유일 | document_no |
| approval_form | 허용값 | use_status: 사용, 미사용 |
| notification | 조건부 필수 | read_status이 읽음이면 read_at 필수 |
| notification | 조건부 필수 | target_type이 APPROVAL_DOCUMENT이면 target_id 필수 |
| notification | 허용값 | channel: 포털, 메신저, 모바일, 대화방, 메일 |
| notification | 허용값 | read_status: 안읽음, 읽음 |
| attachment | 조건부 필수 | target_type이 APPROVAL_DOCUMENT, APPROVAL_FORM이면 target_id 필수 |
| attachment | 값 조건 | file_size >= 0 |
| budget_main | 조합 유일 | accounting_unit, fiscal_year, project_id, budget_account_id |
| budget_main | 값 조건 | requested_amount >= 0 |
| budget_main | 허용값 | approval_status: 신청, 마감, 마감 취소, 승인, 승인 취소, 반려 |
| budget_execution | 조합 유일 | budget_main_id, execution_month |
| budget_execution | 값 조건 | execution_month >= 1 |
| budget_execution | 값 조건 | execution_month <= 12 |
| budget_execution | 값 조건 | execution_amount >= 0 |
| budget_execution | 허용값 | approval_status: 신청, 마감, 마감 취소, 승인, 승인 취소, 반려 |
| budget_adjustment | 조건부 필수 | adjustment_type이 전용, 이용이면 target_budget_account_id 필수 |
| budget_adjustment | 값 조건 | adjustment_amount > 0 |
| budget_adjustment | 값 조건 | target_budget_account_id <> budget_account_id |
| budget_adjustment | 허용값 | adjustment_type: 추경예산, 전용, 이용, 예비비 |
| budget_adjustment | 허용값 | approval_status: 신청, 마감, 마감 취소, 승인, 승인 취소, 반려 |
| requisition | 값 조건 | requisition_amount > 0 |
| requisition | 허용값 | requisition_type: 지출, 구매 |
| requisition | 허용값 | status: 기안, 결재대기, 승인, 보류, 반려, 회수, 재기안, 완료 |
| expense_resolution | 값 조건 | resolution_amount > 0 |
| expense_resolution | 허용값 | resolution_method: 카드사용내역, 세금계산서, 통장거래내역, 직접입력 |
| expense_resolution | 허용값 | status: 기안, 결재대기, 승인, 보류, 반려, 회수, 재기안, 완료 |
| journal_entry | 값 조건 | total_debit_amount >= 0 |
| journal_entry | 값 조건 | total_credit_amount >= 0 |
| journal_entry | 허용값 | status: 신청, 마감, 마감 취소, 승인, 승인 취소, 반려 |
| journal_entry_line | 조합 유일 | journal_entry_id, line_no |
| journal_entry_line | 값 조건 | debit_amount >= 0 |
| journal_entry_line | 값 조건 | credit_amount >= 0 |
| attendance_request | 값 조건 | end_date >= start_date |
| attendance_request | 허용값 | attendance_type: 연차, 반차, 보상휴가, 병가, 예비군, 출장, 외근, 교육 |
| attendance_request | 허용값 | approval_status: 신청, 마감, 마감 취소, 승인, 승인 취소, 반려 |
| payroll | 조합 유일 | employee_id, pay_date |
| payroll | 허용값 | closing_status: 신청, 마감, 마감 취소, 승인, 승인 취소, 반려 |
| asset | 조합 유일 | asset_code, asset_no |
| asset | 조건부 필수 | is_depreciable이 true이면 depreciation_method 필수 |
| asset | 조건부 필수 | is_depreciable이 true이면 useful_life_months 필수 |
| asset | 조건부 필수 | is_depreciable이 true이면 acquisition_amount 필수 |
| asset | 값 조건 | acquisition_amount >= 0 |
| asset | 값 조건 | useful_life_months > 0 |
| asset | 유일 | rfid_tag_value |
| login_history | 허용값 | login_type: 웹, 메신저, 모바일 앱 |
| system_setting | 조합 유일 | category, setting_key |
| accounting_unit | 허용값 | use_yn: 사용, 미사용 |
| accounting_unit | 유일 | unit_code |
| budget_closing_period | 값 조건 | end_date >= start_date |
| budget_closing_period | 허용값 | closing_type: 결의서, 출납 |
| budget_carryover | 조합 유일 | project_id, budget_account_id, is_initial_carryover |
| budget_carryover | 값 조건 | carryover_amount >= 0 |
| account_carryover | 조합 유일 | fiscal_year, account_subject_id, partner_id, project_id |
| account_carryover | 허용값 | closing_status: 미마감, 마감 |
| upload_history | 값 조건 | total_count >= 0 |
| upload_history | 값 조건 | success_count >= 0 |
| upload_history | 값 조건 | error_count >= 0 |
| upload_history | 허용값 | target_business: PARTNER, PERSONNEL_RECORD, ANNUAL_LEAVE, PAYROLL, ASSET, ATTENDANCE, CARRYOVER, COMMUTE_RECORD, EDUCATION_ATTENDEE, DAILY_WORKER_PAYMENT |
| upload_history | 허용값 | process_mode: EXCLUDE_ERROR, CANCEL_ALL |
| link_log | 조건부 필수 | status이 FAILED이면 failure_reason 필수 |
| link_log | 조건부 필수 | status이 SUCCESS, FAILED이면 completed_at 필수 |
| link_log | 값 조건 | processed_count >= 0 |
| link_log | 값 조건 | completed_at >= requested_at |
| link_log | 허용값 | link_target: E_NARA_DOUM, NTS_HOMETAX, NTS_EFILING, BANK_CMS, CARD_COMPANY, LEGACY_ERP, ASSET_INSPECTION, COMMUTE_SYSTEM, ECM |
| link_log | 허용값 | status: REQUESTED, SUCCESS, FAILED |
| auto_journal_setting | 조합 유일 | evidence_type, evidence_item_name |
| auto_journal_setting | 허용값 | use_status: 사용, 미사용 |
| tax_invoice | 조건부 필수 | journal_status이 PROCESSED이면 journal_entry_id 필수 |
| tax_invoice | 값 조건 | supply_amount >= 0 |
| tax_invoice | 값 조건 | tax_amount >= 0 |
| tax_invoice | 허용값 | direction: ISSUE, RECEIVE |
| tax_invoice | 허용값 | tax_type: TAXABLE, EXEMPT |
| tax_invoice | 허용값 | issue_status: NOT_ISSUED, ISSUED |
| tax_invoice | 허용값 | journal_status: UNPROCESSED, PROCESSED |
| tax_invoice | 유일 | approval_number |
| bank_transaction | 조합 유일 | partner_account_id, external_transaction_no |
| bank_transaction | 값 조건 | deposit_amount >= 0 |
| bank_transaction | 값 조건 | withdrawal_amount >= 0 |
| card_approval | 조합 유일 | credit_card_id, approval_no, approved_at |
| cash_receipt | 조합 유일 | approval_no, issued_at |
| journal_settlement | 값 조건 | settlement_amount > 0 |
| journal_settlement | 값 조건 | payable_line_id <> receivable_line_id |
| management_item | 허용값 | value_type: TEXT, NUMBER, DATE, CODE |
| management_item | 허용값 | use_status: 사용, 미사용 |
| management_item | 유일 | code |
| journal_line_management_value | 조합 유일 | journal_entry_line_id, management_item_id |
| fund_subject | 허용값 | subject_type: INFLOW, OUTFLOW |
| fund_subject | 허용값 | use_status: 사용, 미사용 |
| fund_pl_form_item | 값 조건 | sort_order > 0 |
| fixed_fund | 값 조건 | amount > 0 |
| fixed_fund | 값 조건 | end_date >= start_date |
| fixed_fund | 허용값 | cycle: 월, 분기, 연 |
| fixed_fund | 허용값 | use_status: 사용, 미사용 |
| fund_plan | 조합 유일 | fund_subject_id, plan_start_date, plan_end_date |
| fund_plan | 값 조건 | plan_end_date >= plan_start_date |
| fund_plan | 값 조건 | income_amount >= 0 |
| fund_plan | 값 조건 | expense_amount >= 0 |
| fund_plan | 허용값 | closing_status: 마감 취소, 마감 |
| financial_instrument | 값 조건 | maturity_date >= issue_date |
| financial_instrument | 값 조건 | face_amount >= 0 |
| financial_instrument | 허용값 | instrument_type: BILL, DEPOSIT, SAVINGS, SECURITIES, FOREIGN_CURRENCY |
| financial_instrument | 허용값 | use_status: 사용, 미사용 |
| loan | 값 조건 | principal_amount > 0 |
| loan | 값 조건 | maturity_date >= loan_date |
| loan | 허용값 | loan_type: BORROWING, LENDING |
| loan | 허용값 | voucher_status: 미처리, 처리완료 |
| loan_transaction | 값 조건 | amount > 0 |
| loan_transaction | 허용값 | transaction_type: OCCURRENCE, REPAYMENT, INTEREST |
| closing_data | 조합 유일 | accounting_unit_id, account_subject_id, project_id, department_id, closing_period |
| allocation_rule | 조건부 필수 | allocation_method이 RATIO이면 allocation_ratio 필수 |
| allocation_rule | 조건부 필수 | allocation_method이 FIXED_AMOUNT이면 allocation_amount 필수 |
| allocation_rule | 값 조건 | allocation_ratio > 0 |
| allocation_rule | 값 조건 | allocation_ratio <= 100 |
| allocation_rule | 허용값 | allocation_method: RATIO, FIXED_AMOUNT |
| allocation_rule | 허용값 | use_status: 사용, 미사용 |
| vat_form | 조합 유일 | tax_period_start, tax_period_end, form_type |
| vat_form | 값 조건 | tax_period_end >= tax_period_start |
| vat_form | 허용값 | form_type: 기본장부, 주요, 영세율첨부, 업종별첨부, 기타 |
| asset_depreciation | 값 조건 | acquisition_cost >= 0 |
| asset_depreciation | 값 조건 | useful_life_months > 0 |
| asset_depreciation | 값 조건 | salvage_value >= 0 |
| asset_depreciation | 값 조건 | salvage_value <= acquisition_cost |
| asset_depreciation | 유일 | asset_id |
| budget_commitment | 값 조건 | amount > 0 |
| budget_commitment | 허용값 | approval_status: 신청, 승인, 승인 취소, 반려 |
| personnel_record | 조건부 필수 | employment_status이 퇴직자이면 resignation_date 필수 |
| personnel_record | 값 조건 | resignation_date >= hire_date |
| personnel_record | 허용값 | employment_status: 재직자, 퇴직자 |
| personnel_record | 유일 | employee_id |
| employee_education | 값 조건 | graduation_date >= admission_date |
| employee_career | 값 조건 | end_date >= start_date |
| employee_license | 값 조건 | expiry_date >= acquired_date |
| employee_language | 값 조건 | score >= 0 |
| employee_language | 값 조건 | expiry_date >= test_date |
| employee_evaluation | 조합 유일 | employee_id, period_start_date, period_end_date |
| employee_evaluation | 값 조건 | period_end_date >= period_start_date |
| employee_evaluation | 값 조건 | evaluation_score >= 0 |
| employee_business_trip | 값 조건 | end_date >= start_date |
| personnel_change_request | 조건부 필수 | status이 반려이면 reject_reason 필수 |
| personnel_change_request | 조건부 필수 | status이 승인, 반려이면 reviewer_id 필수 |
| personnel_change_request | 조건부 필수 | status이 승인, 반려이면 reviewed_at 필수 |
| personnel_change_request | 허용값 | status: 신청, 승인, 반려 |
| leave_of_absence_request | 조건부 필수 | status이 반려이면 reject_reason 필수 |
| leave_of_absence_request | 값 조건 | end_date >= start_date |
| leave_of_absence_request | 허용값 | status: 신청, 승인, 반려 |
| personnel_appointment | 조건부 필수 | status이 반려이면 reject_reason 필수 |
| personnel_appointment | 허용값 | status: 신청, 승인, 반려, 마감, 마감 취소, 승인 취소 |
| education_code | 조합 유일 | code_type, code |
| education_code | 허용값 | code_type: EDU_TYPE, EDU_METHOD |
| education_code | 허용값 | use_yn: 사용, 미사용 |
| education_session | 조합 유일 | education_course_id, session_no |
| education_session | 값 조건 | session_no > 0 |
| education_session | 값 조건 | end_date >= start_date |
| education_attendee | 조합 유일 | education_session_id, employee_id |
| education_application | 조합 유일 | education_session_id, employee_id |
| education_application | 조건부 필수 | status이 반려이면 reject_reason 필수 |
| education_application | 허용값 | status: 신청, 승인, 승인 취소, 반려 |
| education_evaluation | 조합 유일 | education_attendee_id, evaluation_item |
| education_evaluation | 값 조건 | score >= 0 |
| certificate_type | 값 조건 | numbering_digits > 0 |
| certificate_type | 허용값 | use_yn: 사용, 미사용 |
| certificate_type | 허용값 | numbering_reset_cycle: 연, 없음 |
| certificate_type | 유일 | name |
| certificate_request | 조합 유일 | certificate_type_id, issue_number |
| certificate_request | 조건부 필수 | status이 반려이면 reject_reason 필수 |
| certificate_request | 조건부 필수 | status이 승인이면 issue_number 필수 |
| certificate_request | 값 조건 | copies > 0 |
| certificate_request | 허용값 | status: 신청, 승인, 반려 |
| attendance_item | 허용값 | use_yn: 사용, 미사용 |
| attendance_item | 유일 | name |
| attendance_standard | 조합 유일 | standard_type, item_name, apply_start_date |
| attendance_standard | 값 조건 | apply_end_date >= apply_start_date |
| attendance_standard | 허용값 | standard_type: 기본근태, 근무시간, 시간외근무 |
| attendance_standard | 허용값 | use_yn: 사용, 미사용 |
| employee_attendance_setting | 조합 유일 | employee_id, attendance_item_id, apply_start_date |
| employee_attendance_setting | 값 조건 | apply_end_date >= apply_start_date |
| commute_check_setting | 조건부 필수 | apply_unit이 부서이면 department_id 필수 |
| commute_check_setting | 조건부 필수 | apply_unit이 사원이면 employee_id 필수 |
| commute_check_setting | 허용값 | apply_unit: 법인, 부서, 사원 |
| allowed_ip | 허용값 | use_yn: 사용, 미사용 |
| allowed_ip | 유일 | ip_address |
| annual_leave_plan | 조합 유일 | employee_id, plan_month |
| annual_leave_plan | 값 조건 | plan_days > 0 |
| annual_leave_plan | 허용값 | approval_status: 신청, 마감, 마감 취소, 승인, 승인 취소, 반려 |
| leave_promotion | 조합 유일 | employee_id, promotion_year, promotion_stage |
| commute_record | 조합 유일 | employee_id, work_date |
| commute_record | 값 조건 | check_out_at >= check_in_at |
| attendance_closing | 조합 유일 | closing_unit, closing_date |
| attendance_closing | 조건부 필수 | status이 마감 취소이면 cancelled_at 필수 |
| attendance_closing | 허용값 | closing_unit: 일, 월 |
| attendance_closing | 허용값 | status: 마감, 마감 취소 |
| leave_grant_rule | 값 조건 | base_days >= 0 |
| leave_grant_rule | 값 조건 | additional_days >= 0 |
| leave_grant_rule | 허용값 | use_status: 사용, 미사용 |
| annual_leave | 조합 유일 | employee_id, base_year |
| annual_leave | 조건부 필수 | is_confirmed이 true이면 confirmed_at 필수 |
| annual_leave | 값 조건 | granted_days >= 0 |
| annual_leave | 값 조건 | used_days >= 0 |
| leave_usage | 조합 유일 | attendance_request_id, annual_leave_id, used_date |
| leave_usage | 값 조건 | used_days > 0 |
| annual_leave_settlement | 조합 유일 | annual_leave_id, settlement_base_date |
| annual_leave_settlement | 값 조건 | unused_days >= 0 |
| annual_leave_settlement | 값 조건 | unused_allowance >= 0 |
| attendance_trip_traveler | 조합 유일 | attendance_request_id, employee_id |
| payroll_code | 조합 유일 | code_category, code |
| payroll_code | 허용값 | code_category: 근로소득, 퇴직소득, 소득공제, 농특세, 지방소득세, 사회보험정산, 학자금상환 |
| payroll_code | 허용값 | use_yn: 사용, 미사용 |
| payroll_item | 허용값 | item_type: 지급, 공제 |
| payroll_item | 허용값 | use_yn: 사용, 미사용 |
| payroll_account_mapping | 조합 유일 | payroll_type, account_subject_id |
| payroll_account_mapping | 허용값 | payroll_type: 상용직, 일용직, 퇴직금 |
| payroll_account_mapping | 허용값 | is_active: 사용, 미사용 |
| withholding_adjustment_request | 값 조건 | adjustment_rate >= 0 |
| withholding_adjustment_request | 허용값 | approval_status: 신청, 마감, 마감 취소, 승인, 승인 취소, 반려 |
| salary_step | 값 조건 | amount >= 0 |
| salary_step | 허용값 | is_active: 사용, 미사용 |
| salary_step | 유일 | step_grade |
| employee_wage | 조합 유일 | employee_id, effective_date |
| payroll_run | 조합 유일 | pay_date, payroll_type |
| payroll_run | 조건부 필수 | journal_status이 PROCESSED이면 journal_entry_id 필수 |
| payroll_run | 허용값 | payroll_type: REGULAR, DAILY, SEVERANCE |
| payroll_run | 허용값 | journal_status: UNPROCESSED, PROCESSED |
| payroll_detail | 조합 유일 | payroll_id, payroll_item_id |
| payroll_detail | 값 조건 | amount >= 0 |
| daily_worker | 값 조건 | daily_wage >= 0 |
| daily_worker_payment | 조합 유일 | daily_worker_id, payment_date |
| daily_worker_payment | 값 조건 | work_days > 0 |
| daily_worker_payment | 값 조건 | payment_amount >= 0 |
| social_insurance_enrollment | 조합 유일 | employee_id, insurance_type, report_type |
| social_insurance_enrollment | 조건부 필수 | report_type이 취득이면 acquisition_date 필수 |
| social_insurance_enrollment | 조건부 필수 | report_type이 상실이면 loss_date 필수 |
| social_insurance_enrollment | 조건부 필수 | report_type이 상실이면 loss_reason 필수 |
| social_insurance_enrollment | 허용값 | insurance_type: 국민연금, 건강보험, 고용보험, 산재보험 |
| social_insurance_enrollment | 허용값 | report_type: 취득, 상실 |
| social_insurance_grade | 조합 유일 | employee_id, insurance_type, apply_start_month |
| social_insurance_grade | 값 조건 | standard_monthly_amount >= 0 |
| social_insurance_grade | 허용값 | insurance_type: NATIONAL_PENSION, HEALTH, EMPLOYMENT, INDUSTRIAL_ACCIDENT |
| social_insurance_report | 조건부 필수 | report_type이 QUALIFICATION_ACQUISITION, QUALIFICATION_LOSS이면 event_date 필수 |
| social_insurance_report | 조건부 필수 | report_type이 QUALIFICATION_LOSS이면 loss_reason 필수 |
| social_insurance_report | 조건부 필수 | report_type이 QUALIFICATION_ACQUISITION, QUALIFICATION_LOSS이면 social_insurance_enrollment_id 필수 |
| social_insurance_report | 값 조건 | period_end >= period_start |
| social_insurance_report | 허용값 | report_type: QUALIFICATION_ACQUISITION, QUALIFICATION_LOSS, TOTAL_REMUNERATION, EMPLOYMENT_INDUSTRIAL, SEPARATION_CONFIRMATION, WORK_CONTENT_CONFIRMATION |
| social_insurance_report | 허용값 | insurance_type: NATIONAL_PENSION, HEALTH, EMPLOYMENT, INDUSTRIAL_ACCIDENT |
| tax_filing | 조건부 필수 | filing_status이 SUCCESS, FAILURE이면 filed_at 필수 |
| tax_filing | 허용값 | filing_type: WITHHOLDING_STATUS, TUITION_REPAYMENT, LOCAL_INCOME_TAX, RESIDENT_TAX_EMPLOYEE, SIMPLIFIED_PAYMENT, SUBMISSION_SUMMARY, PAYMENT_MEDIA |
| tax_filing | 허용값 | filing_status: DRAFT, SUCCESS, FAILURE |
| income_certificate | 정확히 하나만 | employee_id, daily_worker_id |
| income_certificate | 값 조건 | period_end >= period_start |
| income_certificate | 값 조건 | total_payment_amount >= 0 |
| income_certificate | 값 조건 | withheld_tax_amount >= 0 |
| income_certificate | 허용값 | certificate_category: DAILY_WAGE, RETIREMENT_INCOME, EARNED_INCOME |
| income_certificate | 허용값 | document_type: PAYMENT_STATEMENT, WITHHOLDING_RECEIPT |
| year_end_item | 값 조건 | limit_amount >= 0 |
| year_end_item | 허용값 | use_yn: 사용, 미사용 |
| year_end_item | 유일 | code |
| year_end_data | 조합 유일 | employee_id, year_end_item_id, target_year |
| year_end_data | 조건부 필수 | closing_status이 마감이면 closed_at 필수 |
| year_end_data | 허용값 | closing_status: 신청, 마감, 마감 취소 |
| year_end_result | 조합 유일 | employee_id, target_year |
| year_end_result | 허용값 | closing_status: 신청, 마감, 마감 취소 |
| year_end_installment | 조합 유일 | year_end_result_id, installment_no |
| year_end_installment | 값 조건 | installment_no >= 1 |
| year_end_installment | 값 조건 | installment_amount > 0 |
| purchase_asset_item | 조건부 필수 | asset_linked이 true이면 asset_id 필수 |
| purchase_asset_item | 값 조건 | quantity > 0 |
| purchase_asset_item | 값 조건 | amount >= 0 |
| asset_print_log | 허용값 | print_format: QR, BARCODE |
| asset_inspection_plan | 값 조건 | end_date > start_date |
| asset_inspection_plan | 허용값 | approval_status: 신청, 승인, 승인 취소, 반려 |
| asset_inspection_plan | 허용값 | progress_status: 진행, 완료, 취소 |
| asset_inspection_item | 조합 유일 | asset_inspection_plan_id, asset_id |
| resource_category | 값 조건 | sort_order >= 0 |
| resource | 조합 유일 | resource_category_id, name |
| resource | 허용값 | approval_required: 사용, 미사용 |
| resource | 허용값 | visibility_scope: 전체, 부서, 개인 |
| resource_attribute | 조합 유일 | resource_id, attribute_name |
| resource_attribute | 값 조건 | sort_order >= 0 |
| resource_permission | 정확히 하나만 | department_id, employee_id |
| resource_reservation | 조건부 필수 | status이 반려이면 reject_reason 필수 |
| resource_reservation | 값 조건 | end_at >= start_at |
| resource_reservation | 값 조건 | repeat_until >= start_at |
| resource_reservation | 허용값 | repeat_type: NONE, DAILY, WEEKLY, MONTHLY |
| resource_reservation | 허용값 | status: 신청, 승인, 반려, 취소 |
| schedule | 값 조건 | end_at >= start_at |
| board_post | 값 조건 | popup_end_date >= popup_start_date |
| board_post | 값 조건 | pin_end_date >= pin_start_date |
| board_post | 허용값 | post_type: 공지, 게시글 |
| board_post | 허용값 | visibility_scope: 전체, 부서, 개인 |
| post_audience | 조합 유일 | board_post_id, department_id |
| post_audience | 조합 유일 | board_post_id, employee_id |
| post_audience | 정확히 하나만 | department_id, employee_id |
| post_read_log | 조합 유일 | board_post_id, employee_id |
| survey | 값 조건 | end_date >= start_date |
| survey | 허용값 | status: 진행 전, 진행 중, 종료 |
| survey | 허용값 | notification_channel: 메신저, 모바일, 대화방, 메일, 포털 |
| survey_target | 조합 유일 | survey_id, employee_id |
| survey_question | 조건부 필수 | question_type이 선택형이면 answer_mode 필수 |
| survey_question | 허용값 | question_type: 선택형, 주관식 |
| survey_question | 허용값 | answer_mode: 단답, 다답 |
| survey_option | 조합 유일 | survey_question_id, option_text |
| survey_option | 값 조건 | sort_order >= 0 |
| survey_response | 조합 유일 | survey_question_id, respondent_id |
| survey_response_option | 조합 유일 | survey_response_id, survey_option_id |
| messenger_room_member | 조합 유일 | messenger_room_id, employee_id |
| messenger_message | 허용값 | message_type: CHAT, NOTE |
| messenger_message_recipient | 조합 유일 | messenger_message_id, recipient_id |
| messenger_message_recipient | 조건부 필수 | read_status이 읽음이면 read_at 필수 |
| messenger_message_recipient | 허용값 | read_status: 안읽음, 읽음 |
| auth_setting | 값 조건 | allowed_device_count >= 0 |
| auth_device | 조건부 필수 | approval_status이 반려이면 reject_reason 필수 |
| auth_device | 조건부 필수 | approval_status이 승인, 반려이면 approver_id 필수 |
| auth_device | 조건부 필수 | approval_status이 승인, 반려이면 processed_at 필수 |
| auth_device | 허용값 | approval_status: 신청, 승인, 반려 |
| auth_device | 허용값 | use_status: 사용, 미사용 |
| menu_usage_log | 허용값 | usage_environment: 웹, 모바일 |
| approval_line | 조합 유일 | approval_document_id, approval_order |
| approval_line | 조건부 필수 | approval_status이 승인, 보류, 반려이면 processed_at 필수 |
| approval_line | 값 조건 | approval_order > 0 |
| approval_line | 허용값 | approval_status: 결재대기, 승인, 보류, 반려 |
| document_numbering_rule | 값 조건 | last_sequence >= 0 |
| document_numbering_rule | 유일 | document_number |
| approval_handover | 값 조건 | to_employee_id <> from_employee_id |
| document_box | 정확히 하나만 | employee_id, department_id |
| document_box_item | 조합 유일 | document_box_id, approval_document_id |
| document_dispatch_rule | 조합 유일 | document_type, department_id |
| document_dispatch_rule | 값 조건 | confidence_threshold >= 0 |
| document_dispatch_rule | 값 조건 | confidence_threshold <= 1 |
| document_dispatch_rule | 허용값 | usage_status: 사용, 미사용 |
| office_template | 허용값 | template_type: REPORT, PROPOSAL |
| office_document | 조건부 필수 | chart_type이 BAR, LINE, PIE이면 chart_data 필수 |
| office_document | 허용값 | chart_type: BAR, LINE, PIE |
| office_document_share | 조합 유일 | office_document_id, employee_id |
| fee_unit_price | 값 조건 | unit_price >= 0 |
| fee_unit_price | 값 조건 | effective_to >= effective_from |
| fee_unit_price | 허용값 | fee_type: REVIEW, REISSUE |
| fee_record | 값 조건 | quantity > 0 |
| fee_record | 값 조건 | amount >= 0 |
| api_client | 허용값 | use_yn: 사용, 미사용 |
| api_client | 유일 | client_code |
| interface_standard | 조합 유일 | api_client_id, standard_version, link_method |
| api_call_log | 조건부 필수 | result_status이 실패이면 error_code 필수 |
| api_call_log | 값 조건 | response_ms >= 0 |
| api_call_log | 허용값 | result_status: 성공, 실패 |
| help_content | 조합 유일 | menu_id, title |
| help_content | 허용값 | use_yn: 사용, 미사용 |
| error_message | 허용값 | use_yn: 사용, 미사용 |
| error_message | 유일 | error_code |
| portal_widget_setting | 조합 유일 | employee_id, widget_type |
| portal_widget_setting | 값 조건 | display_order >= 1 |
| portal_widget_setting | 허용값 | widget_type: 결재양식, 결재함, 일정캘린더, 통합알림, 퀵링크, 나의정보 |
| portal_banner | 값 조건 | end_date >= start_date |
| portal_banner | 허용값 | use_yn: 사용, 미사용 |
| quick_link | 값 조건 | sort_order >= 0 |
| personal_menu | 조합 유일 | employee_id, menu_id |
| personal_menu | 값 조건 | sort_order >= 0 |
| employee_department | 조합 유일 | employee_id, department_id |
| mail_recipient | 조합 유일 | mail_message_id, recipient_id |
| mail_recipient | 조건부 필수 | read_status이 읽음이면 read_at 필수 |
| mail_recipient | 허용값 | read_status: 안읽음, 읽음 |
| credit_card_permission | 조합 유일 | credit_card_id, employee_id |
| project_permission | 조합 유일 | project_id, employee_id |
| project_permission | 조합 유일 | project_id, department_id |
| project_permission | 정확히 하나만 | employee_id, department_id |
| sub_project_permission | 조합 유일 | sub_project_id, employee_id |
| sub_project_permission | 조합 유일 | sub_project_id, department_id |
| sub_project_permission | 정확히 하나만 | employee_id, department_id |
| rfid_scan_log | 허용값 | match_status: MATCHED, UNMATCHED |

## 5. 보안 컬럼

| 테이블.컬럼 | 저장 방식 | 이름 |
|---|---|---|
| employee.password_hash | 단방향 해시 | 비밀번호 해시 |
| employee.resident_no_enc | 암호화 | 주민등록번호(암호화) |
| partner_account.account_number_enc | 암호화 | 계좌번호(암호화) |
| credit_card.card_number_enc | 암호화 | 카드번호(암호화) |
| attachment.file_hash | 단방향 해시 | 파일 해시 |
| payroll.total_payment_amount_enc | 암호화 | 총 지급액(암호문) |
| payroll.total_deduction_amount_enc | 암호화 | 총 공제액(암호문) |
| payroll.net_pay_amount_enc | 암호화 | 실지급액(암호문) |
| personnel_record.resident_number_enc | 암호화 | 주민등록번호(암호화) |
| personnel_record.address_enc | 암호화 | 주소(암호화) |
| employee_family.name_enc | 암호화 | 가족 성명(암호화) |
| employee_family.birth_date_enc | 암호화 | 생년월일(암호화) |
| employee_family.resident_number_enc | 암호화 | 주민등록번호(암호화) |
| employee_license.license_number_enc | 암호화 | 자격·면허번호(암호화) |
| personnel_change_request.before_value_enc | 암호화 | 변경 전 값(암호화) |
| personnel_change_request.after_value_enc | 암호화 | 변경 후 값(암호화) |
| withholding_adjustment_request.adjustment_amount_enc | 암호화 | 조정 금액(암호화) |
| employee_wage.wage_amount_enc | 암호화 | 책정임금(암호화) |
| daily_worker.resident_registration_no_enc | 암호화 | 주민등록번호(암호화) |
| severance_calculation.severance_amount_enc | 암호화 | 퇴직금 산정액(암호화) |
| severance_calculation.estimated_amount_enc | 암호화 | 퇴직금 추계액(암호화) |
| social_insurance_report.resident_number_enc | 암호화 | 주민등록번호(암호화) |
| income_certificate.resident_number_enc | 암호화 | 주민등록번호(암호화) |
