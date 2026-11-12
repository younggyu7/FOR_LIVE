# API — 기능별 API

> 프로젝트: **회사1** · 설계 버전: **v3.1.1** · spec-format v2  
> 기능을 구현할 API다. 기계가 읽는 정의는 같은 내용의 `openapi.yaml`이다. 읽는 순서와 작업 규칙은 `AGENTS.md`.

## 1. 공통 규칙

- 기본 경로 `/api/v1` · JSON(UTF-8) · 인증 `Authorization: Bearer <토큰>` (`ARCHITECTURE.md` 보안)
- 목록 조회: 쿼리 `page`(0부터)·`size`(기본 20), 응답 `{items, page, size, total}`
- 오류 응답 `{code, message}`. 모든 API 공통 오류: 400 `VALIDATION_FAILED` (요청 형식·필수 값 오류), 401 `UNAUTHORIZED` (인증 필요), 403 `FORBIDDEN` (권한 없음), 500 `INTERNAL_ERROR` (서버 오류)
- 필드의 DB 컬럼은 `schema.sql` 이름이다. 타입·길이·허용값은 그 컬럼과 같다.

## 2. API 목록

| 메서드 | 경로 | operationId | 기능 | 권한 |
|---|---|---|---|---|
| GET | /menu-permissions | listMenuPermissions | FN-SFR-001-01 통합 사용 권한 관리 (함께 씀: FN-SFR-026-01) | 시스템 관리자 |
| POST | /menu-permissions | createMenuPermission | FN-SFR-001-01 통합 사용 권한 관리 (함께 씀: FN-SFR-026-01) | 시스템 관리자 |
| PATCH | /menu-permissions/{menuPermissionId} | updateMenuPermission | FN-SFR-001-01 통합 사용 권한 관리 | 시스템 관리자 |
| DELETE | /menu-permissions/{menuPermissionId} | deleteMenuPermission | FN-SFR-001-01 통합 사용 권한 관리 | 시스템 관리자 |
| POST | /rfid-scan-logs | createRfidScanLog | FN-SFR-001-03 RFID 기반 자산 관리 | 자산 담당자 |
| GET | /rfid-scan-logs | listRfidScanLogs | FN-SFR-001-03 RFID 기반 자산 관리 | 자산 담당자 |
| POST | /link-logs | createLinkLog | FN-SFR-001-04 e나라도움 연동 | 예산·회계 담당자, 시스템 관리자 |
| GET | /link-logs | listLinkLogs | FN-SFR-001-04 e나라도움 연동 (함께 씀: FN-SIR-001-01) | 예산·회계 담당자, 시스템 관리자 |
| GET | /menus | listMenus | FN-SFR-001-05 그룹웨어 통합 업무 환경 이용 (함께 씀: FN-SFR-001-06, FN-SFR-026-02, FN-SFR-027-02) | 임직원, 예산·회계 담당자, 인사 담당자, 근태 담당자, 급여 담당자, 자산 담당자 |
| GET | /projects | listProjects | FN-SFR-002-01 프로젝트 등록·관리 (함께 씀: FN-SFR-006-03) | 예산·회계 담당자 |
| POST | /projects | createProject | FN-SFR-002-01 프로젝트 등록·관리 (함께 씀: FN-SFR-006-03) | 예산·회계 담당자 |
| PATCH | /projects/{projectId} | updateProject | FN-SFR-002-01 프로젝트 등록·관리 | 예산·회계 담당자 |
| DELETE | /projects/{projectId} | deleteProject | FN-SFR-002-01 프로젝트 등록·관리 | 예산·회계 담당자 |
| GET | /project-permissions | listProjectPermissions | FN-SFR-002-01 프로젝트 등록·관리 | 예산·회계 담당자 |
| POST | /project-permissions | createProjectPermission | FN-SFR-002-01 프로젝트 등록·관리 | 예산·회계 담당자 |
| DELETE | /project-permissions/{projectPermissionId} | deleteProjectPermission | FN-SFR-002-01 프로젝트 등록·관리 | 예산·회계 담당자 |
| GET | /sub-projects | listSubProjects | FN-SFR-002-02 하위사업 등록·관리 | 예산·회계 담당자 |
| POST | /sub-projects | createSubProject | FN-SFR-002-02 하위사업 등록·관리 | 예산·회계 담당자 |
| PATCH | /sub-projects/{subProjectId} | updateSubProject | FN-SFR-002-02 하위사업 등록·관리 | 예산·회계 담당자 |
| DELETE | /sub-projects/{subProjectId} | deleteSubProject | FN-SFR-002-02 하위사업 등록·관리 | 예산·회계 담당자 |
| GET | /sub-project-permissions | listSubProjectPermissions | FN-SFR-002-02 하위사업 등록·관리 | 예산·회계 담당자 |
| POST | /sub-project-permissions | createSubProjectPermission | FN-SFR-002-02 하위사업 등록·관리 | 예산·회계 담당자 |
| DELETE | /sub-project-permissions/{subProjectPermissionId} | deleteSubProjectPermission | FN-SFR-002-02 하위사업 등록·관리 | 예산·회계 담당자 |
| GET | /budget-accounts | listBudgetAccounts | FN-SFR-002-03 예산과목 등록·관리 | 예산·회계 담당자 |
| POST | /budget-accounts | createBudgetAccount | FN-SFR-002-03 예산과목 등록·관리 | 예산·회계 담당자 |
| PATCH | /budget-accounts/{budgetAccountId} | updateBudgetAccount | FN-SFR-002-03 예산과목 등록·관리 | 예산·회계 담당자 |
| DELETE | /budget-accounts/{budgetAccountId} | deleteBudgetAccount | FN-SFR-002-03 예산과목 등록·관리 | 예산·회계 담당자 |
| GET | /partners | listPartners | FN-SFR-002-04 거래처 등록·관리(일반·금융) (함께 씀: FN-SFR-006-03) | 예산·회계 담당자 |
| POST | /partners | createPartner | FN-SFR-002-04 거래처 등록·관리(일반·금융) (함께 씀: FN-SFR-006-03) | 예산·회계 담당자 |
| PATCH | /partners/{partnerId} | updatePartner | FN-SFR-002-04 거래처 등록·관리(일반·금융) | 예산·회계 담당자 |
| GET | /partner-accounts | listPartnerAccounts | FN-SFR-002-05 거래처 계좌 등록·관리 (함께 씀: FN-SFR-004-07, FN-SFR-006-03) | 예산·회계 담당자 |
| POST | /partner-accounts | createPartnerAccount | FN-SFR-002-05 거래처 계좌 등록·관리 (함께 씀: FN-SFR-006-03) | 예산·회계 담당자 |
| PATCH | /partner-accounts/{partnerAccountId} | updatePartnerAccount | FN-SFR-002-05 거래처 계좌 등록·관리 | 예산·회계 담당자 |
| DELETE | /partner-accounts/{partnerAccountId} | deletePartnerAccount | FN-SFR-002-05 거래처 계좌 등록·관리 | 예산·회계 담당자 |
| GET | /credit-cards | listCreditCards | FN-SFR-002-06 신용카드 등록·관리 | 예산·회계 담당자 |
| POST | /credit-cards | createCreditCard | FN-SFR-002-06 신용카드 등록·관리 | 예산·회계 담당자 |
| GET | /credit-card-permissions | listCreditCardPermissions | FN-SFR-002-06 신용카드 등록·관리 | 예산·회계 담당자 |
| POST | /credit-card-permissions | createCreditCardPermission | FN-SFR-002-06 신용카드 등록·관리 | 예산·회계 담당자 |
| DELETE | /credit-card-permissions/{creditCardPermissionId} | deleteCreditCardPermission | FN-SFR-002-06 신용카드 등록·관리 | 예산·회계 담당자 |
| GET | /system-settings | listSystemSettings | FN-SFR-002-07 기준정보 환경설정 (함께 씀: FN-SFR-018-02, FN-SFR-020-02, FN-SFR-020-03, FN-SFR-023-01, FN-SFR-025-06) | 예산·회계 담당자, 시스템 관리자 |
| PATCH | /system-settings/{systemSettingId} | updateSystemSetting | FN-SFR-002-07 기준정보 환경설정 (함께 씀: FN-SFR-020-02, FN-SFR-020-03) | 예산·회계 담당자, 시스템 관리자 |
| GET | /budget-mains | listBudgetMains | FN-SFR-003-01 본예산 신청 | 예산·회계 담당자 |
| POST | /budget-mains | createBudgetMain | FN-SFR-003-01 본예산 신청 | 예산·회계 담당자 |
| POST | /budget-mains/{budgetMainId}/close | closeBudgetMain | FN-SFR-003-02 본예산 마감·승인 처리 | 예산·회계 담당자 |
| POST | /budget-mains/{budgetMainId}/cancel-close | cancelCloseBudgetMain | FN-SFR-003-02 본예산 마감·승인 처리 | 예산·회계 담당자 |
| POST | /budget-mains/{budgetMainId}/approve | approveBudgetMain | FN-SFR-003-02 본예산 마감·승인 처리 | 예산·회계 담당자 |
| POST | /budget-mains/{budgetMainId}/cancel-approval | cancelApprovalBudgetMain | FN-SFR-003-02 본예산 마감·승인 처리 | 예산·회계 담당자 |
| GET | /budget-executions | listBudgetExecutions | FN-SFR-003-03 실행예산 편성·신청 및 마감 처리 | 예산·회계 담당자 |
| POST | /budget-executions | createBudgetExecution | FN-SFR-003-03 실행예산 편성·신청 및 마감 처리 | 예산·회계 담당자 |
| POST | /budget-executions/{budgetExecutionId}/close | closeBudgetExecution | FN-SFR-003-03 실행예산 편성·신청 및 마감 처리 | 예산·회계 담당자 |
| POST | /budget-executions/{budgetExecutionId}/cancel-close | cancelCloseBudgetExecution | FN-SFR-003-03 실행예산 편성·신청 및 마감 처리 | 예산·회계 담당자 |
| POST | /budget-executions/{budgetExecutionId}/approve | approveBudgetExecution | FN-SFR-003-03 실행예산 편성·신청 및 마감 처리 | 예산·회계 담당자 |
| POST | /budget-executions/{budgetExecutionId}/cancel-approval | cancelApprovalBudgetExecution | FN-SFR-003-03 실행예산 편성·신청 및 마감 처리 | 예산·회계 담당자 |
| GET | /budget-accounts/execution-status | listBudgetAccountExecutionStatus | FN-SFR-003-05 예산조정 신청 및 마감 (함께 씀: FN-SFR-004-01) | 예산·회계 담당자 |
| POST | /budget-adjustments | createBudgetAdjustment | FN-SFR-003-05 예산조정 신청 및 마감 | 예산·회계 담당자 |
| POST | /budget-adjustments/{budgetAdjustmentId}/close | closeBudgetAdjustment | FN-SFR-003-05 예산조정 신청 및 마감 | 예산·회계 담당자 |
| GET | /budget-closing-periods | listBudgetClosingPeriods | FN-SFR-003-06 예산 폐쇄기간 및 이월 관리 | 예산·회계 담당자 |
| POST | /budget-closing-periods | createBudgetClosingPeriod | FN-SFR-003-06 예산 폐쇄기간 및 이월 관리 | 예산·회계 담당자 |
| GET | /budget-carryovers | listBudgetCarryovers | FN-SFR-003-06 예산 폐쇄기간 및 이월 관리 | 예산·회계 담당자 |
| POST | /budget-carryovers | createBudgetCarryover | FN-SFR-003-06 예산 폐쇄기간 및 이월 관리 | 예산·회계 담당자 |
| PATCH | /budget-carryovers/{budgetCarryoverId} | updateBudgetCarryover | FN-SFR-003-06 예산 폐쇄기간 및 이월 관리 | 예산·회계 담당자 |
| POST | /requisitions | createRequisition | FN-SFR-004-01 품의서 입력 및 승인 (함께 씀: FN-SFR-024-01, FN-SFR-032-08) | 임직원, 예산·회계 담당자 |
| GET | /requisitions/{requisitionId} | getRequisition | FN-SFR-004-01 품의서 입력 및 승인 (함께 씀: FN-SFR-024-02) | 임직원, 예산·회계 담당자 |
| POST | /expense-resolutions | createExpenseResolution | FN-SFR-004-02 결의서 입력 및 승인 (함께 씀: FN-SFR-004-06, FN-SFR-032-12) | 임직원, 예산·회계 담당자 |
| PUT | /expense-resolutions/{expenseResolutionId} | updateExpenseResolution | FN-SFR-004-02 결의서 입력 및 승인 | 임직원, 예산·회계 담당자 |
| GET | /budget-statuses | listBudgetStatuses | FN-SFR-004-02 결의서 입력 및 승인 | 임직원, 예산·회계 담당자 |
| GET | /approval-items | listApprovalItems | FN-SFR-004-03 품의·결의 정보 조회 및 승인 처리 | 예산·회계 담당자, 임직원 |
| POST | /expense-resolutions/{expenseResolutionId}/approve | approveExpenseResolution | FN-SFR-004-03 품의·결의 정보 조회 및 승인 처리 | 예산·회계 담당자, 임직원 |
| POST | /requisitions/{requisitionId}/approve | approveRequisition | FN-SFR-004-03 품의·결의 정보 조회 및 승인 처리 (함께 씀: FN-SFR-024-02) | 예산·회계 담당자, 임직원 |
| POST | /budget-commitments | createBudgetCommitment | FN-SFR-004-04 원인행위 등록 및 관리 | 예산·회계 담당자 |
| GET | /budget-commitments | listBudgetCommitments | FN-SFR-004-04 원인행위 등록 및 관리 | 예산·회계 담당자 |
| PUT | /budget-commitments/{budgetCommitmentId} | updateBudgetCommitment | FN-SFR-004-04 원인행위 등록 및 관리 | 예산·회계 담당자 |
| POST | /budget-commitments/{budgetCommitmentId}/cancel | cancelBudgetCommitment | FN-SFR-004-04 원인행위 등록 및 관리 | 예산·회계 담당자 |
| POST | /journal-entries | createJournalEntry | FN-SFR-004-05 자금집행 정보 및 전표 관리 (함께 씀: FN-SFR-008-01) | 예산·회계 담당자 |
| GET | /journal-entries | listJournalEntries | FN-SFR-004-05 자금집행 정보 및 전표 관리 | 예산·회계 담당자 |
| POST | /journal-entries/{journalEntryId}/cancel | cancelJournalEntry | FN-SFR-004-05 자금집행 정보 및 전표 관리 | 예산·회계 담당자 |
| GET | /expense-resolutions | listExpenseResolutions | FN-SFR-004-06 수입·지출 등록 및 조회 (함께 씀: FN-SFR-032-09) | 예산·회계 담당자 |
| POST | /expense-resolutions/bulk-import | bulkImportExpenseResolutions | FN-SFR-004-06 수입·지출 등록 및 조회 | 예산·회계 담당자 |
| POST | /account-transfer-resolutions | createAccountTransferResolution | FN-SFR-004-07 은행계좌 대체 및 대체결의 처리 | 예산·회계 담당자 |
| GET | /budget-ledgers | listBudgetLedgers | FN-SFR-005-01 예산장부 조회 | 예산·회계 담당자 |
| GET | /budget-status | listBudgetStatus | FN-SFR-005-02 결의서 현황 및 예실 조회 | 예산·회계 담당자 |
| GET | /account-subjects | listAccountSubjects | FN-SFR-006-01 계정과목·관련계정·관리항목 관리 | 예산·회계 담당자 |
| POST | /account-subjects | createAccountSubject | FN-SFR-006-01 계정과목·관련계정·관리항목 관리 | 예산·회계 담당자 |
| PUT | /account-subjects/{accountSubjectId} | updateAccountSubject | FN-SFR-006-01 계정과목·관련계정·관리항목 관리 | 예산·회계 담당자 |
| PUT | /partners/{partnerId} | updatePartner2 | FN-SFR-006-03 거래처·계좌·카드·프로젝트 기준정보 관리 | 예산·회계 담당자 |
| PUT | /projects/{projectId} | updateProject2 | FN-SFR-006-03 거래처·계좌·카드·프로젝트 기준정보 관리 | 예산·회계 담당자 |
| GET | /account-carryovers | listAccountCarryovers | FN-SFR-006-04 계정별 초기이월 등록 및 마감 | 예산·회계 담당자 |
| POST | /account-carryovers | createAccountCarryover | FN-SFR-006-04 계정별 초기이월 등록 및 마감 | 예산·회계 담당자 |
| PUT | /account-carryovers/{accountCarryoverId} | updateAccountCarryover | FN-SFR-006-04 계정별 초기이월 등록 및 마감 | 예산·회계 담당자 |
| DELETE | /account-carryovers/{accountCarryoverId} | deleteAccountCarryover | FN-SFR-006-04 계정별 초기이월 등록 및 마감 | 예산·회계 담당자 |
| POST | /account-carryovers/{accountCarryoverId}/close | closeAccountCarryover | FN-SFR-006-04 계정별 초기이월 등록 및 마감 | 예산·회계 담당자 |
| POST | /account-carryovers/{accountCarryoverId}/cancel-close | cancelCloseAccountCarryover | FN-SFR-006-04 계정별 초기이월 등록 및 마감 | 예산·회계 담당자 |
| POST | /tax-office-conversions | convertTaxOfficeData | FN-SFR-006-05 세무회계사무소 연계 자료 변환 | 예산·회계 담당자 |
| POST | /excel-uploads | uploadExcelData | FN-SFR-006-06 엑셀 일괄 업로드 | 예산·회계 담당자, 인사 담당자, 근태 담당자, 급여 담당자, 자산 담당자 |
| GET | /auto-journal-settings | listAutoJournalSettings | FN-SFR-007-01 자동전표 증빙항목 및 자료수집·자동분개 설정 | 예산·회계 담당자 |
| POST | /auto-journal-settings | createAutoJournalSetting | FN-SFR-007-01 자동전표 증빙항목 및 자료수집·자동분개 설정 | 예산·회계 담당자 |
| PUT | /auto-journal-settings/{autoJournalSettingId} | updateAutoJournalSetting | FN-SFR-007-01 자동전표 증빙항목 및 자료수집·자동분개 설정 | 예산·회계 담당자 |
| POST | /tax-invoices/collect | collectTaxInvoices | FN-SFR-007-02 전자세금계산서 수집·대사 검증 및 결의서 작성 | 예산·회계 담당자 |
| GET | /tax-invoices | listTaxInvoices | FN-SFR-007-02 전자세금계산서 수집·대사 검증 및 결의서 작성 (함께 씀: FN-SFR-008-03) | 예산·회계 담당자 |
| POST | /expense-resolutions/from-tax-invoice | createExpenseResolutionFromTaxInvoice | FN-SFR-007-02 전자세금계산서 수집·대사 검증 및 결의서 작성 | 예산·회계 담당자 |
| POST | /bank-transactions/collect | collectBankTransactions | FN-SFR-007-03 은행계좌 거래내역 조회·자동전표 및 반제 처리 | 예산·회계 담당자 |
| GET | /bank-transactions | listBankTransactions | FN-SFR-007-03 은행계좌 거래내역 조회·자동전표 및 반제 처리 | 예산·회계 담당자 |
| POST | /journal-settlements | createJournalSettlement | FN-SFR-007-03 은행계좌 거래내역 조회·자동전표 및 반제 처리 (함께 씀: FN-SFR-008-08) | 예산·회계 담당자 |
| POST | /card-approvals/collect | collectCardApprovals | FN-SFR-007-04 카드 승인내역 및 현금영수증 결의서 작성 | 예산·회계 담당자 |
| GET | /card-approvals | listCardApprovals | FN-SFR-007-04 카드 승인내역 및 현금영수증 결의서 작성 | 임직원, 예산·회계 담당자 |
| GET | /cash-receipts | listCashReceipts | FN-SFR-007-04 카드 승인내역 및 현금영수증 결의서 작성 | 임직원, 예산·회계 담당자 |
| POST | /expense-resolutions/from-card-or-cash-receipt | createExpenseResolutionFromCardOrCashReceipt | FN-SFR-007-04 카드 승인내역 및 현금영수증 결의서 작성 | 임직원, 예산·회계 담당자 |
| GET | /journal-entries/{journalEntryId} | getJournalEntry | FN-SFR-008-01 전표 입력·관리 | 예산·회계 담당자 |
| PATCH | /journal-entries/{journalEntryId} | updateJournalEntry | FN-SFR-008-01 전표 입력·관리 | 예산·회계 담당자 |
| POST | /journal-entries/{journalEntryId}/cancel-approval | cancelJournalEntryApproval | FN-SFR-008-01 전표 입력·관리 | 예산·회계 담당자 |
| PATCH | /journal-entries/evidence-details | updateJournalEntryEvidenceDetails | FN-SFR-008-01 전표 입력·관리 | 예산·회계 담당자 |
| GET | /journal-entries/{journalEntryId}/print | printJournalEntry | FN-SFR-008-01 전표 입력·관리 | 예산·회계 담당자 |
| POST | /tax-invoices | createTaxInvoice | FN-SFR-008-02 전자세금계산서 발행 | 예산·회계 담당자 |
| POST | /tax-invoices/validate | validateTaxInvoices | FN-SFR-008-03 전자세금계산서 검증·전표처리·현황조회 | 예산·회계 담당자 |
| POST | /tax-invoices/create-journal-entries | createJournalEntriesFromTaxInvoices | FN-SFR-008-03 전자세금계산서 검증·전표처리·현황조회 | 예산·회계 담당자 |
| PATCH | /tax-invoices/issue-status | updateTaxInvoiceIssueStatuses | FN-SFR-008-04 세금계산서 발행여부 일괄 변경 | 예산·회계 담당자 |
| GET | /account-ledgers | listAccountLedgers | FN-SFR-008-05 계정별 장부 조회 | 예산·회계 담당자 |
| GET | /partner-ledgers | listPartnerLedgers | FN-SFR-008-06 거래처별 장부 조회 | 예산·회계 담당자 |
| GET | /management-item-ledgers | listManagementItemLedgers | FN-SFR-008-07 관리항목별 장부 조회 | 예산·회계 담당자 |
| GET | /receivable-aging | listReceivableAging | FN-SFR-008-08 채권·채무 관리 | 예산·회계 담당자 |
| GET | /partner-balances | listPartnerBalances | FN-SFR-008-08 채권·채무 관리 | 예산·회계 담당자 |
| GET | /journal-settlements | listJournalSettlements | FN-SFR-008-09 전표 반제 관리 | 예산·회계 담당자 |
| GET | /settlement-aging | listSettlementAging | FN-SFR-008-09 전표 반제 관리 | 예산·회계 담당자 |
| GET | /fund-subjects | listFundSubjects | FN-SFR-009-01 자금과목 및 자금 손익 양식 설정 | 예산·회계 담당자 |
| POST | /fund-subjects | createFundSubject | FN-SFR-009-01 자금과목 및 자금 손익 양식 설정 | 예산·회계 담당자 |
| PATCH | /fund-subjects/{fundSubjectId} | updateFundSubject | FN-SFR-009-01 자금과목 및 자금 손익 양식 설정 | 예산·회계 담당자 |
| GET | /fund-pl-form-items | listFundPlFormItems | FN-SFR-009-01 자금과목 및 자금 손익 양식 설정 | 예산·회계 담당자 |
| POST | /fund-pl-form-items | createFundPlFormItem | FN-SFR-009-01 자금과목 및 자금 손익 양식 설정 | 예산·회계 담당자 |
| PATCH | /fund-pl-form-items/{fundPlFormItemId} | updateFundPlFormItem | FN-SFR-009-01 자금과목 및 자금 손익 양식 설정 | 예산·회계 담당자 |
| DELETE | /fund-pl-form-items/{fundPlFormItemId} | deleteFundPlFormItem | FN-SFR-009-01 자금과목 및 자금 손익 양식 설정 | 예산·회계 담당자 |
| GET | /fixed-funds | listFixedFunds | FN-SFR-009-02 고정자금 등록·관리 | 예산·회계 담당자 |
| POST | /fixed-funds | createFixedFund | FN-SFR-009-02 고정자금 등록·관리 | 예산·회계 담당자 |
| PATCH | /fixed-funds/{fixedFundId} | updateFixedFund | FN-SFR-009-02 고정자금 등록·관리 | 예산·회계 담당자 |
| DELETE | /fixed-funds/{fixedFundId} | deleteFixedFund | FN-SFR-009-02 고정자금 등록·관리 | 예산·회계 담당자 |
| GET | /fund-plans | listFundPlans | FN-SFR-009-03 자금수지계획 등록·관리 | 예산·회계 담당자 |
| POST | /fund-plans | createFundPlan | FN-SFR-009-03 자금수지계획 등록·관리 | 예산·회계 담당자 |
| PATCH | /fund-plans/{fundPlanId} | updateFundPlan | FN-SFR-009-03 자금수지계획 등록·관리 | 예산·회계 담당자 |
| DELETE | /fund-plans/{fundPlanId} | deleteFundPlan | FN-SFR-009-03 자금수지계획 등록·관리 | 예산·회계 담당자 |
| GET | /daily-fund-reports | listDailyFundReports | FN-SFR-009-04 자금일보 조회 | 예산·회계 담당자 |
| GET | /fund-statuses | listFundStatuses | FN-SFR-009-05 자금현황 조회 | 예산·회계 담당자 |
| GET | /loan-statements | listLoanStatements | FN-SFR-009-06 차입금·대여금 명세서 전표처리 및 원장 조회 | 예산·회계 담당자 |
| POST | /loans/{loanId}/process-voucher | processLoanVoucher | FN-SFR-009-06 차입금·대여금 명세서 전표처리 및 원장 조회 | 예산·회계 담당자 |
| GET | /loan-transactions | listLoanTransactions | FN-SFR-009-06 차입금·대여금 명세서 전표처리 및 원장 조회 | 예산·회계 담당자 |
| GET | /closing-data | listClosingData | FN-SFR-010-01 결산자료 입력·관리 | 예산·회계 담당자 |
| POST | /closing-data | createClosingData | FN-SFR-010-01 결산자료 입력·관리 | 예산·회계 담당자 |
| PATCH | /closing-data/{closingDataId} | updateClosingData | FN-SFR-010-01 결산자료 입력·관리 | 예산·회계 담당자 |
| DELETE | /closing-data/{closingDataId} | deleteClosingData | FN-SFR-010-01 결산자료 입력·관리 | 예산·회계 담당자 |
| GET | /financial-statements | listFinancialStatements | FN-SFR-010-02 주요 재무제표 조회 | 예산·회계 담당자 |
| GET | /management-balance-sheets | listManagementBalanceSheets | FN-SFR-010-03 관리용 재무상태표 조회 | 예산·회계 담당자 |
| GET | /management-income-statements | listManagementIncomeStatements | FN-SFR-010-04 관리용 손익계산서 조회 | 예산·회계 담당자 |
| GET | /management-cost-reports | listManagementCostReports | FN-SFR-010-05 관리용 원가보고서 조회 | 예산·회계 담당자 |
| GET | /vat-forms | listVatForms | FN-SFR-010-06 부가가치세 관리 | 예산·회계 담당자 |
| POST | /vat-forms | createVatForm | FN-SFR-010-06 부가가치세 관리 | 예산·회계 담당자 |
| PATCH | /vat-forms/{vatFormId} | updateVatForm | FN-SFR-010-06 부가가치세 관리 | 예산·회계 담당자 |
| POST | /assets | createAsset | FN-SFR-011-01 고정자산 정보 등록·수정 (함께 씀: FN-SFR-025-01) | 자산 담당자 |
| GET | /assets/{assetId} | getAsset | FN-SFR-011-01 고정자산 정보 등록·수정 | 자산 담당자 |
| PATCH | /assets/{assetId} | updateAsset | FN-SFR-011-01 고정자산 정보 등록·수정 (함께 씀: FN-SFR-025-01) | 자산 담당자 |
| GET | /asset-reports | listAssetReports | FN-SFR-011-02 고정자산 현황·명세 조회 | 자산 담당자, 예산·회계 담당자 |
| POST | /employees | createEmployee | FN-SFR-012-01 임직원 인사정보 등록·관리 | 인사 담당자 |
| PATCH | /employees/{employeeId} | updateEmployee | FN-SFR-012-01 임직원 인사정보 등록·관리 | 인사 담당자 |
| GET | /employees | listEmployees | FN-SFR-012-01 임직원 인사정보 등록·관리 (함께 씀: FN-SFR-036-09, FN-SFR-039-02, FN-SFR-040-05) | 인사 담당자 |
| GET | /personnel-change-requests | listPersonnelChangeRequests | FN-SFR-012-02 인사정보 변경 신청 검토·승인 | 인사 담당자, 임직원 |
| POST | /personnel-change-requests | createPersonnelChangeRequest | FN-SFR-012-02 인사정보 변경 신청 검토·승인 | 임직원 |
| POST | /personnel-change-requests/{personnelChangeRequestId}/review | reviewPersonnelChangeRequest | FN-SFR-012-02 인사정보 변경 신청 검토·승인 | 인사 담당자 |
| POST | /personnel-records/bulk-update | bulkUpdatePersonnelRecords | FN-SFR-012-03 인사정보 일괄 변경 | 인사 담당자 |
| GET | /personnel-records | listPersonnelRecords | FN-SFR-012-04 기초 인적사항 등록·관리 (함께 씀: FN-SFR-014-01) | 인사 담당자 |
| POST | /personnel-records | createPersonnelRecord | FN-SFR-012-04 기초 인적사항 등록·관리 | 인사 담당자 |
| PATCH | /personnel-records/{personnelRecordId} | updatePersonnelRecord | FN-SFR-012-04 기초 인적사항 등록·관리 | 인사 담당자 |
| GET | /employee-families | listEmployeeFamilies | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| POST | /employee-families | createEmployeeFamily | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| PATCH | /employee-families/{employeeFamilyId} | updateEmployeeFamily | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| DELETE | /employee-families/{employeeFamilyId} | deleteEmployeeFamily | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| GET | /employee-educations | listEmployeeEducations | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| POST | /employee-educations | createEmployeeEducation | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| PATCH | /employee-educations/{employeeEducationId} | updateEmployeeEducation | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| DELETE | /employee-educations/{employeeEducationId} | deleteEmployeeEducation | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| GET | /employee-careers | listEmployeeCareers | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| POST | /employee-careers | createEmployeeCareer | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| PATCH | /employee-careers/{employeeCareerId} | updateEmployeeCareer | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| DELETE | /employee-careers/{employeeCareerId} | deleteEmployeeCareer | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| GET | /employee-licenses | listEmployeeLicenses | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| POST | /employee-licenses | createEmployeeLicense | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| PATCH | /employee-licenses/{employeeLicenseId} | updateEmployeeLicense | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| DELETE | /employee-licenses/{employeeLicenseId} | deleteEmployeeLicense | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| GET | /employee-languages | listEmployeeLanguages | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| POST | /employee-languages | createEmployeeLanguage | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| PATCH | /employee-languages/{employeeLanguageId} | updateEmployeeLanguage | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| DELETE | /employee-languages/{employeeLanguageId} | deleteEmployeeLanguage | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| GET | /employee-evaluations | listEmployeeEvaluations | FN-SFR-012-05 인사기록카드 상세정보 관리 (함께 씀: FN-SFR-015-01) | 인사 담당자 |
| POST | /employee-evaluations | createEmployeeEvaluation | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| PATCH | /employee-evaluations/{employeeEvaluationId} | updateEmployeeEvaluation | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| DELETE | /employee-evaluations/{employeeEvaluationId} | deleteEmployeeEvaluation | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| GET | /employee-reward-penalties | listEmployeeRewardPenalties | FN-SFR-012-05 인사기록카드 상세정보 관리 (함께 씀: FN-SFR-015-01) | 인사 담당자 |
| POST | /employee-reward-penalties | createEmployeeRewardPenalty | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| PATCH | /employee-reward-penalties/{employeeRewardPenaltyId} | updateEmployeeRewardPenalty | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| DELETE | /employee-reward-penalties/{employeeRewardPenaltyId} | deleteEmployeeRewardPenalty | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| GET | /employee-business-trips | listEmployeeBusinessTrips | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| POST | /employee-business-trips | createEmployeeBusinessTrip | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| PATCH | /employee-business-trips/{employeeBusinessTripId} | updateEmployeeBusinessTrip | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| DELETE | /employee-business-trips/{employeeBusinessTripId} | deleteEmployeeBusinessTrip | FN-SFR-012-05 인사기록카드 상세정보 관리 | 인사 담당자 |
| GET | /personnel-appointments | listPersonnelAppointments | FN-SFR-012-05 인사기록카드 상세정보 관리 (함께 씀: FN-SFR-013-01) | 인사 담당자 |
| GET | /education-attendees | listEducationAttendees | FN-SFR-012-05 인사기록카드 상세정보 관리 (함께 씀: FN-SFR-015-02) | 인사 담당자 |
| POST | /upload-histories/personnel-records | uploadPersonnelRecords | FN-SFR-012-06 인사정보·인사기록카드 엑셀 업로드 후속 처리 | 인사 담당자 |
| GET | /leave-of-absence-requests | listLeaveOfAbsenceRequests | FN-SFR-012-07 휴직·단축근무 신청 검토·승인 | 인사 담당자, 임직원 |
| POST | /leave-of-absence-requests | createLeaveOfAbsenceRequest | FN-SFR-012-07 휴직·단축근무 신청 검토·승인 | 임직원 |
| POST | /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | reviewLeaveOfAbsenceRequest | FN-SFR-012-07 휴직·단축근무 신청 검토·승인 | 인사 담당자 |
| POST | /personnel-appointments/{personnelAppointmentId}/approve | approvePersonnelAppointment | FN-SFR-013-01 인사발령 신청 검토·승인 | 인사 담당자 |
| POST | /personnel-appointments/{personnelAppointmentId}/reject | rejectPersonnelAppointment | FN-SFR-013-01 인사발령 신청 검토·승인 | 인사 담당자 |
| POST | /personnel-appointments | createPersonnelAppointment | FN-SFR-013-02 인사발령 대상자 등록 및 발령상태 관리 | 인사 담당자 |
| PATCH | /personnel-appointments/{personnelAppointmentId}/status | updatePersonnelAppointmentStatus | FN-SFR-013-02 인사발령 대상자 등록 및 발령상태 관리 | 인사 담당자 |
| POST | /personnel-appointments/{personnelAppointmentId}/process | processPersonnelAppointment | FN-SFR-013-03 인사발령 처리 및 발령공고 자동 게시 | 인사 담당자 |
| POST | /personnel-appointments/{personnelAppointmentId}/repost-announcement | repostAppointmentAnnouncement | FN-SFR-013-03 인사발령 처리 및 발령공고 자동 게시 | 인사 담당자 |
| GET | /personnel-appointment-histories | listPersonnelAppointmentHistories | FN-SFR-013-04 인사발령 이력·현황 조회 및 보고서 생성 | 인사 담당자, 임직원 |
| GET | /personnel-appointment-histories/summary | getPersonnelAppointmentSummary | FN-SFR-013-04 인사발령 이력·현황 조회 및 보고서 생성 | 인사 담당자, 임직원 |
| POST | /personnel-appointment-reports | createPersonnelAppointmentReport | FN-SFR-013-04 인사발령 이력·현황 조회 및 보고서 생성 | 인사 담당자 |
| GET | /personnel-record-items | listPersonnelRecordItems | FN-SFR-014-02 인사기록 현황 조회 | 인사 담당자 |
| GET | /personnel-status | listPersonnelStatus | FN-SFR-014-03 임직원 현황 조회 | 인사 담당자 |
| POST | /education-courses | createEducationCourse | FN-SFR-015-02 교육과정 및 대상자 관리 | 인사 담당자 |
| PATCH | /education-courses/{educationCourseId} | updateEducationCourse | FN-SFR-015-02 교육과정 및 대상자 관리 | 인사 담당자 |
| POST | /education-sessions | createEducationSession | FN-SFR-015-02 교육과정 및 대상자 관리 | 인사 담당자 |
| POST | /education-attendees | createEducationAttendee | FN-SFR-015-02 교육과정 및 대상자 관리 | 인사 담당자 |
| DELETE | /education-attendees/{educationAttendeeId} | deleteEducationAttendee | FN-SFR-015-02 교육과정 및 대상자 관리 | 인사 담당자 |
| POST | /education-result-reports | createEducationResultReport | FN-SFR-015-02 교육과정 및 대상자 관리 | 인사 담당자 |
| POST | /education-applications | createEducationApplication | FN-SFR-015-03 교육신청 및 승인 처리 | 임직원 |
| POST | /education-applications/{educationApplicationId}/approve | approveEducationApplication | FN-SFR-015-03 교육신청 및 승인 처리 | 인사 담당자 |
| POST | /education-applications/{educationApplicationId}/reject | rejectEducationApplication | FN-SFR-015-03 교육신청 및 승인 처리 | 인사 담당자 |
| POST | /education-applications/{educationApplicationId}/cancel-approval | cancelEducationApplicationApproval | FN-SFR-015-03 교육신청 및 승인 처리 | 인사 담당자 |
| DELETE | /education-applications/{educationApplicationId} | deleteEducationApplication | FN-SFR-015-03 교육신청 및 승인 처리 | 임직원 |
| GET | /education-evaluations | listEducationEvaluations | FN-SFR-015-04 교육평가 관리 | 임직원, 인사 담당자 |
| POST | /education-evaluations | createEducationEvaluation | FN-SFR-015-04 교육평가 관리 | 인사 담당자 |
| PATCH | /education-evaluations/{educationEvaluationId} | updateEducationEvaluation | FN-SFR-015-04 교육평가 관리 | 인사 담당자 |
| GET | /education-status | listEducationStatus | FN-SFR-015-05 교육현황 조회 | 임직원, 인사 담당자 |
| GET | /certificate-types | listCertificateTypes | FN-SFR-016-01 증명서 양식 등록·관리 | 인사 담당자 |
| POST | /certificate-types | createCertificateType | FN-SFR-016-01 증명서 양식 등록·관리 | 인사 담당자 |
| PATCH | /certificate-types/{certificateTypeId} | updateCertificateType | FN-SFR-016-01 증명서 양식 등록·관리 | 인사 담당자 |
| GET | /certificate-types/numbering | listCertificateNumberings | FN-SFR-016-02 증명서별 채번 관리 | 인사 담당자 |
| PUT | /certificate-types/{certificateTypeId}/numbering | updateCertificateNumbering | FN-SFR-016-02 증명서별 채번 관리 | 인사 담당자 |
| POST | /certificate-requests | createCertificateRequest | FN-SFR-016-03 증명서 신청 검토·승인 (함께 씀: FN-SFR-032-02) | 임직원 |
| POST | /certificate-requests/{certificateRequestId}/approve | approveCertificateRequest | FN-SFR-016-03 증명서 신청 검토·승인 | 인사 담당자 |
| POST | /certificate-requests/{certificateRequestId}/reject | rejectCertificateRequest | FN-SFR-016-03 증명서 신청 검토·승인 | 인사 담당자 |
| GET | /certificate-requests | listCertificateRequests | FN-SFR-016-04 증명서 관리대장 조회 (함께 씀: FN-SFR-032-02) | 인사 담당자 |
| GET | /attendance-standards | listAttendanceStandards | FN-SFR-017-01 근태 기준정보 및 시간외근무 기준 관리 | 근태 담당자 |
| POST | /attendance-standards | createAttendanceStandard | FN-SFR-017-01 근태 기준정보 및 시간외근무 기준 관리 | 근태 담당자 |
| PATCH | /attendance-standards/{attendanceStandardId} | updateAttendanceStandard | FN-SFR-017-01 근태 기준정보 및 시간외근무 기준 관리 | 근태 담당자 |
| DELETE | /attendance-standards/{attendanceStandardId} | deleteAttendanceStandard | FN-SFR-017-01 근태 기준정보 및 시간외근무 기준 관리 | 근태 담당자 |
| GET | /attendance-items | listAttendanceItems | FN-SFR-017-02 근태항목 관리 | 근태 담당자 |
| POST | /attendance-items | createAttendanceItem | FN-SFR-017-02 근태항목 관리 | 근태 담당자 |
| PATCH | /attendance-items/{attendanceItemId} | updateAttendanceItem | FN-SFR-017-02 근태항목 관리 | 근태 담당자 |
| DELETE | /attendance-items/{attendanceItemId} | deleteAttendanceItem | FN-SFR-017-02 근태항목 관리 | 근태 담당자 |
| GET | /employee-attendance-settings | listEmployeeAttendanceSettings | FN-SFR-017-03 임직원별 근태 적용 설정 | 근태 담당자 |
| POST | /employee-attendance-settings | createEmployeeAttendanceSetting | FN-SFR-017-03 임직원별 근태 적용 설정 | 근태 담당자 |
| PUT | /employee-attendance-settings/{employeeAttendanceSettingId} | updateEmployeeAttendanceSetting | FN-SFR-017-03 임직원별 근태 적용 설정 | 근태 담당자 |
| GET | /commute-check-settings | listCommuteCheckSettings | FN-SFR-017-04 출퇴근 체크 유형 설정 | 근태 담당자 |
| POST | /commute-check-settings | createCommuteCheckSetting | FN-SFR-017-04 출퇴근 체크 유형 설정 | 근태 담당자 |
| PUT | /commute-check-settings/{commuteCheckSettingId} | updateCommuteCheckSetting | FN-SFR-017-04 출퇴근 체크 유형 설정 | 근태 담당자 |
| GET | /allowed-ips | listAllowedIps | FN-SFR-017-05 시스템 접근 허용 IP 관리 | 근태 담당자 |
| POST | /allowed-ips | createAllowedIp | FN-SFR-017-05 시스템 접근 허용 IP 관리 | 근태 담당자 |
| PUT | /allowed-ips/{allowedIpId} | updateAllowedIp | FN-SFR-017-05 시스템 접근 허용 IP 관리 | 근태 담당자 |
| DELETE | /allowed-ips/{allowedIpId} | deleteAllowedIp | FN-SFR-017-05 시스템 접근 허용 IP 관리 | 근태 담당자 |
| GET | /annual-leave-plans | listAnnualLeavePlans | FN-SFR-017-06 근태스케줄(연차계획·연차촉진·출퇴근 연동) 관리 (함께 씀: FN-SFR-018-08, FN-SFR-032-05) | 근태 담당자, 임직원 |
| POST | /annual-leave-plans | createAnnualLeavePlan | FN-SFR-017-06 근태스케줄(연차계획·연차촉진·출퇴근 연동) 관리 (함께 씀: FN-SFR-019-06, FN-SFR-032-05) | 근태 담당자, 임직원 |
| PUT | /annual-leave-plans/{annualLeavePlanId} | updateAnnualLeavePlan | FN-SFR-017-06 근태스케줄(연차계획·연차촉진·출퇴근 연동) 관리 (함께 씀: FN-SFR-032-05) | 근태 담당자, 임직원 |
| GET | /leave-promotions | listLeavePromotions | FN-SFR-017-06 근태스케줄(연차계획·연차촉진·출퇴근 연동) 관리 (함께 씀: FN-SFR-019-06, FN-SFR-032-05) | 근태 담당자 |
| POST | /leave-promotions | createLeavePromotion | FN-SFR-017-06 근태스케줄(연차계획·연차촉진·출퇴근 연동) 관리 (함께 씀: FN-SFR-019-06) | 근태 담당자 |
| GET | /attendance-requests | listAttendanceRequests | FN-SFR-018-01 근태 신청 및 결재 연계 (함께 씀: FN-SFR-018-10, FN-SFR-032-03) | 임직원, 근태 담당자 |
| POST | /attendance-requests | createAttendanceRequest | FN-SFR-018-01 근태 신청 및 결재 연계 (함께 씀: FN-SFR-018-08, FN-SFR-018-10, FN-SFR-032-03) | 임직원, 근태 담당자 |
| POST | /attendance-requests/{attendanceRequestId}/cancel | cancelAttendanceRequest | FN-SFR-018-01 근태 신청 및 결재 연계 | 임직원, 근태 담당자 |
| PUT | /system-settings/{systemSettingId} | updateSystemSetting2 | FN-SFR-018-02 근태 설정 관리 (함께 씀: FN-SFR-023-01, FN-SFR-025-06) | 근태 담당자 |
| PUT | /attendance-items/{attendanceItemId} | updateAttendanceItem2 | FN-SFR-018-02 근태 설정 관리 | 근태 담당자 |
| PUT | /approval-forms/{approvalFormId} | updateApprovalForm | FN-SFR-018-02 근태 설정 관리 (함께 씀: FN-SFR-029-01) | 근태 담당자 |
| POST | /commute-records | createCommuteRecord | FN-SFR-018-03 출퇴근 기록 및 연동 관리 | 임직원 |
| POST | /commute-records/receive-linked | receiveLinkedCommuteRecords | FN-SFR-018-03 출퇴근 기록 및 연동 관리 |  |
| GET | /commute-records | listCommuteRecords | FN-SFR-018-03 출퇴근 기록 및 연동 관리 | 임직원, 근태 담당자 |
| PATCH | /commute-records/{commuteRecordId} | updateCommuteRecord | FN-SFR-018-03 출퇴근 기록 및 연동 관리 | 근태 담당자 |
| POST | /attendance-requests/adjust | adjustAttendance | FN-SFR-018-04 근태 조정 | 근태 담당자 |
| GET | /attendance-status/daily | listDailyAttendanceStatus | FN-SFR-018-05 근태 현황 및 집계 조회 | 임직원, 근태 담당자 |
| GET | /attendance-status/monthly | listMonthlyAttendanceStatus | FN-SFR-018-05 근태 현황 및 집계 조회 | 임직원, 근태 담당자 |
| GET | /attendance-status/summary | listAttendanceSummary | FN-SFR-018-05 근태 현황 및 집계 조회 | 임직원, 근태 담당자 |
| GET | /work-hours/weekly | listWeeklyWorkHours | FN-SFR-018-06 근무시간 집계 및 현황 조회 | 임직원, 근태 담당자 |
| GET | /work-hours/type-summary | listAttendanceTypeSummary | FN-SFR-018-06 근무시간 집계 및 현황 조회 | 임직원, 근태 담당자 |
| GET | /attendance-closings/preview | previewAttendanceClosing | FN-SFR-018-07 근태 확정 관리 | 근태 담당자 |
| POST | /attendance-closings | createAttendanceClosing | FN-SFR-018-07 근태 확정 관리 | 근태 담당자 |
| POST | /attendance-closings/{attendanceClosingId}/cancel | cancelAttendanceClosing | FN-SFR-018-07 근태 확정 관리 | 근태 담당자 |
| GET | /annual-leaves | listAnnualLeaves | FN-SFR-018-08 연차 설정 및 신청 관리 | 임직원, 근태 담당자 |
| GET | /leave-usages | listLeaveUsages | FN-SFR-018-08 연차 설정 및 신청 관리 | 임직원, 근태 담당자 |
| GET | /leave-grant-rules | listLeaveGrantRules | FN-SFR-018-08 연차 설정 및 신청 관리 (함께 씀: FN-SFR-019-01) | 근태 담당자 |
| PATCH | /leave-grant-rules/{leaveGrantRuleId} | updateLeaveGrantRule | FN-SFR-018-08 연차 설정 및 신청 관리 | 근태 담당자 |
| POST | /attendance-requests/{attendanceRequestId}/submit | submitAttendanceRequest | FN-SFR-018-10 출장 및 외근 관리 | 임직원 |
| POST | /leave-grant-rules | createLeaveGrantRule | FN-SFR-019-01 연차 생성 기준 환경설정 | 근태 담당자 |
| PUT | /leave-grant-rules/{leaveGrantRuleId} | updateLeaveGrantRule2 | FN-SFR-019-01 연차 생성 기준 환경설정 | 근태 담당자 |
| DELETE | /leave-grant-rules/{leaveGrantRuleId} | deleteLeaveGrantRule | FN-SFR-019-01 연차 생성 기준 환경설정 | 근태 담당자 |
| POST | /annual-leaves/generate | generateAnnualLeaves | FN-SFR-019-02 연차 생성 및 확정 | 근태 담당자 |
| POST | /annual-leaves/confirm | confirmAnnualLeaves | FN-SFR-019-02 연차 생성 및 확정 | 근태 담당자 |
| PUT | /annual-leaves/{annualLeaveId} | updateAnnualLeave | FN-SFR-019-02 연차 생성 및 확정 | 근태 담당자 |
| DELETE | /annual-leaves/{annualLeaveId} | deleteAnnualLeave | FN-SFR-019-02 연차 생성 및 확정 | 근태 담당자 |
| POST | /annual-leaves/{annualLeaveId}/adjust | adjustAnnualLeave | FN-SFR-019-03 연차조정 및 정산 | 근태 담당자 |
| POST | /annual-leave-settlements | createAnnualLeaveSettlement | FN-SFR-019-03 연차조정 및 정산 | 근태 담당자 |
| GET | /change-histories | listChangeHistories | FN-SFR-019-04 연차 변경이력 조회 (함께 씀: FN-SFR-022-04, FN-SFR-031-04) | 근태 담당자 |
| GET | /annual-leaves/summary | listAnnualLeaveSummaries | FN-SFR-019-05 연차 총괄현황 및 월별 사용 연차 조회 | 임직원, 근태 담당자 |
| GET | /payroll-codes | listPayrollCodes | FN-SFR-020-01 급여 기초코드 및 세금 코드 관리 (함께 씀: FN-SFR-020-03) | 급여 담당자 |
| POST | /payroll-codes | createPayrollCode | FN-SFR-020-01 급여 기초코드 및 세금 코드 관리 (함께 씀: FN-SFR-020-03) | 급여 담당자 |
| PATCH | /payroll-codes/{payrollCodeId} | updatePayrollCode | FN-SFR-020-01 급여 기초코드 및 세금 코드 관리 (함께 씀: FN-SFR-020-03) | 급여 담당자 |
| GET | /payroll-account-mappings | listPayrollAccountMappings | FN-SFR-020-02 급여 기준 및 계정과목 설정 | 급여 담당자 |
| PUT | /payroll-account-mappings/{payrollAccountMappingId} | updatePayrollAccountMapping | FN-SFR-020-02 급여 기준 및 계정과목 설정 | 급여 담당자 |
| GET | /payroll-items | listPayrollItems | FN-SFR-020-03 사회보험 코드·환경 및 공제항목 관리 | 급여 담당자 |
| POST | /payroll-items | createPayrollItem | FN-SFR-020-03 사회보험 코드·환경 및 공제항목 관리 | 급여 담당자 |
| PATCH | /payroll-items/{payrollItemId} | updatePayrollItem | FN-SFR-020-03 사회보험 코드·환경 및 공제항목 관리 | 급여 담당자 |
| POST | /withholding-adjustment-requests | createWithholdingAdjustmentRequest | FN-SFR-020-03 사회보험 코드·환경 및 공제항목 관리 | 급여 담당자, 임직원 |
| GET | /withholding-adjustment-requests | listWithholdingAdjustmentRequests | FN-SFR-020-03 사회보험 코드·환경 및 공제항목 관리 | 급여 담당자, 임직원 |
| PATCH | /withholding-adjustment-requests/{withholdingAdjustmentRequestId} | updateWithholdingAdjustmentRequest | FN-SFR-020-03 사회보험 코드·환경 및 공제항목 관리 | 급여 담당자 |
| POST | /payrolls/calculate | calculatePayrolls | FN-SFR-021-01 급여 계산·과세 집계 및 마감 | 급여 담당자 |
| POST | /payrolls/close | closePayrolls | FN-SFR-021-01 급여 계산·과세 집계 및 마감 | 급여 담당자 |
| POST | /payrolls/cancel-close | cancelClosePayrolls | FN-SFR-021-01 급여 계산·과세 집계 및 마감 | 급여 담당자 |
| GET | /payroll-transfers | listPayrollTransfers | FN-SFR-021-02 급여이체 현황 조회 | 급여 담당자 |
| POST | /employee-wages/bulk-update | bulkUpdateEmployeeWages | FN-SFR-021-03 책정임금 일괄 변경 및 현황 조회 | 급여 담당자 |
| GET | /employee-wages | listEmployeeWages | FN-SFR-021-03 책정임금 일괄 변경 및 현황 조회 (함께 씀: FN-SFR-021-11) | 급여 담당자 |
| POST | /daily-workers | createDailyWorker | FN-SFR-021-04 일용직 사원 및 급여정보 관리 | 급여 담당자 |
| GET | /daily-workers | listDailyWorkers | FN-SFR-021-04 일용직 사원 및 급여정보 관리 | 급여 담당자 |
| POST | /daily-worker-payments | createDailyWorkerPayment | FN-SFR-021-04 일용직 사원 및 급여정보 관리 (함께 씀: FN-SFR-021-12) | 급여 담당자 |
| PUT | /severance-settings | updateSeveranceSetting | FN-SFR-021-05 퇴직기준 설정 및 퇴직금 산정·추계액 관리 | 급여 담당자 |
| POST | /severance-calculations | createSeveranceCalculation | FN-SFR-021-05 퇴직기준 설정 및 퇴직금 산정·추계액 관리 | 급여 담당자 |
| GET | /severance-calculations | listSeveranceCalculations | FN-SFR-021-05 퇴직기준 설정 및 퇴직금 산정·추계액 관리 (함께 씀: FN-SFR-021-14) | 급여 담당자 |
| POST | /payslips/send | sendPayslips | FN-SFR-021-06 급여명세서 발송 | 급여 담당자 |
| POST | /payroll-simulations | simulatePayroll | FN-SFR-021-07 급여 시뮬레이션 | 급여 담당자 |
| POST | /payroll-runs | createPayrollRun | FN-SFR-021-08 급여 지급일 등록 및 급여 대상 관리 | 급여 담당자 |
| GET | /payroll-runs | listPayrollRuns | FN-SFR-021-08 급여 지급일 등록 및 급여 대상 관리 | 급여 담당자 |
| PATCH | /payroll-runs/{payrollRunId} | updatePayrollRun | FN-SFR-021-08 급여 지급일 등록 및 급여 대상 관리 | 급여 담당자 |
| POST | /payrolls | createPayroll | FN-SFR-021-08 급여 지급일 등록 및 급여 대상 관리 | 급여 담당자 |
| DELETE | /payrolls/{payrollId} | deletePayroll | FN-SFR-021-08 급여 지급일 등록 및 급여 대상 관리 | 급여 담당자 |
| POST | /payrolls/annual-bulk | bulkCreateAnnualPayrolls | FN-SFR-021-09 연말정산용 연간 급여 일괄 입력 | 급여 담당자 |
| POST | /upload-histories | createUploadHistory | FN-SFR-021-09 연말정산용 연간 급여 일괄 입력 | 급여 담당자 |
| POST | /payroll-runs/{payrollRunId}/create-journal-entry | createPayrollJournalEntry | FN-SFR-021-10 급여 전표처리 | 급여 담당자 |
| POST | /salary-steps | createSalaryStep | FN-SFR-021-11 호봉테이블 및 임직원 호봉 현황 관리 | 급여 담당자 |
| PATCH | /salary-steps/{salaryStepId} | updateSalaryStep | FN-SFR-021-11 호봉테이블 및 임직원 호봉 현황 관리 | 급여 담당자 |
| GET | /salary-steps | listSalarySteps | FN-SFR-021-11 호봉테이블 및 임직원 호봉 현황 관리 | 급여 담당자 |
| POST | /employee-wages | createEmployeeWage | FN-SFR-021-11 호봉테이블 및 임직원 호봉 현황 관리 | 급여 담당자 |
| POST | /daily-worker-payments/bulk | bulkCreateDailyWorkerPayments | FN-SFR-021-12 일용직 급여 일괄 입력 및 이체 현황 조회 | 급여 담당자 |
| GET | /daily-worker-payments | listDailyWorkerPayments | FN-SFR-021-12 일용직 급여 일괄 입력 및 이체 현황 조회 | 급여 담당자 |
| POST | /income-certificates/generate | generateIncomeCertificates | FN-SFR-021-13 일용근로소득 지급명세서·원천징수영수증 관리 | 급여 담당자 |
| GET | /income-certificates | listIncomeCertificates | FN-SFR-021-13 일용근로소득 지급명세서·원천징수영수증 관리 (함께 씀: FN-SFR-021-14, FN-SFR-023-04, FN-SFR-023-05, FN-SFR-023-07) | 급여 담당자 |
| POST | /income-certificates | createIncomeCertificate | FN-SFR-021-14 퇴직금 산정 현황 및 퇴직소득 원천징수영수증 관리 | 급여 담당자 |
| GET | /payrolls | listPayrolls | FN-SFR-021-15 급여대장·급여명세·급여현황 조회 (함께 씀: FN-SFR-032-06) | 급여 담당자 |
| GET | /payrolls/{payrollId} | getPayroll | FN-SFR-021-15 급여대장·급여명세·급여현황 조회 | 급여 담당자, 임직원 |
| GET | /payrolls/summary | getPayrollSummary | FN-SFR-021-15 급여대장·급여명세·급여현황 조회 | 급여 담당자 |
| GET | /payroll-analyses | listPayrollAnalyses | FN-SFR-021-16 급여통계 및 급여분석 현황 조회 | 급여 담당자 |
| POST | /social-insurance-enrollments | createSocialInsuranceEnrollment | FN-SFR-022-01 사회보험 취득·상실 대상자 등록 및 신고서 관리 | 인사 담당자 |
| GET | /social-insurance-enrollments | listSocialInsuranceEnrollments | FN-SFR-022-01 사회보험 취득·상실 대상자 등록 및 신고서 관리 | 인사 담당자 |
| POST | /social-insurance-reports | createSocialInsuranceReport | FN-SFR-022-01 사회보험 취득·상실 대상자 등록 및 신고서 관리 (함께 씀: FN-SFR-022-02) | 인사 담당자 |
| GET | /social-insurance-reports | listSocialInsuranceReports | FN-SFR-022-01 사회보험 취득·상실 대상자 등록 및 신고서 관리 (함께 씀: FN-SFR-022-02) | 인사 담당자 |
| POST | /social-insurance-reports/{socialInsuranceReportId}/print | printSocialInsuranceReport | FN-SFR-022-01 사회보험 취득·상실 대상자 등록 및 신고서 관리 (함께 씀: FN-SFR-022-02) | 인사 담당자 |
| GET | /social-insurance-deductions | listSocialInsuranceDeductions | FN-SFR-022-03 사회보험 공제내역서 관리 | 급여 담당자 |
| POST | /social-insurance-grades/change | changeSocialInsuranceGrade | FN-SFR-022-04 사회보험 등급 변경 관리 | 인사 담당자 |
| POST | /tax-filings/generate | generateTaxFiling | FN-SFR-023-01 원천세 신고 기준정보 설정 및 신고서 관리 | 급여 담당자 |
| GET | /tax-filings | listTaxFilings | FN-SFR-023-01 원천세 신고 기준정보 설정 및 신고서 관리 | 급여 담당자 |
| PUT | /tax-filings/{taxFilingId} | updateTaxFiling | FN-SFR-023-01 원천세 신고 기준정보 설정 및 신고서 관리 | 급여 담당자 |
| POST | /tax-filings/{taxFilingId}/submit | submitTaxFiling | FN-SFR-023-02 국세청 원천세 전자파일 신고 (함께 씀: FN-SFR-023-03) | 급여 담당자 |
| POST | /tax-filings/generate-local | generateLocalTaxFiling | FN-SFR-023-03 지방세 전자신고 | 급여 담당자 |
| POST | /income-certificates/generate-daily | generateDailyIncomeCertificates | FN-SFR-023-04 일용근로소득 지급명세서 및 영수증 관리 | 급여 담당자 |
| PUT | /income-certificates/{incomeCertificateId} | updateIncomeCertificate | FN-SFR-023-04 일용근로소득 지급명세서 및 영수증 관리 (함께 씀: FN-SFR-023-05) | 급여 담당자 |
| POST | /income-certificates/generate-retirement | generateRetirementIncomeCertificate | FN-SFR-023-05 퇴직소득 원천징수영수증 관리 | 급여 담당자 |
| POST | /year-end-items | createYearEndItem | FN-SFR-023-06 연말정산 항목 관리 및 자료 입력 | 급여 담당자 |
| PUT | /year-end-items/{yearEndItemId} | updateYearEndItem | FN-SFR-023-06 연말정산 항목 관리 및 자료 입력 | 급여 담당자 |
| POST | /year-end-data | createYearEndData | FN-SFR-023-06 연말정산 항목 관리 및 자료 입력 (함께 씀: FN-SFR-032-07) | 급여 담당자 |
| PUT | /year-end-data/{yearEndDataId} | updateYearEndData | FN-SFR-023-06 연말정산 항목 관리 및 자료 입력 | 급여 담당자 |
| GET | /withholding-ledgers | listWithholdingLedgers | FN-SFR-023-07 근로소득 원천징수부 및 영수증 관리 | 급여 담당자 |
| POST | /year-end-installments | createYearEndInstallment | FN-SFR-023-08 연말정산 납부세액 분납 및 현황 관리 | 급여 담당자 |
| GET | /year-end-installments | listYearEndInstallments | FN-SFR-023-08 연말정산 납부세액 분납 및 현황 관리 | 급여 담당자 |
| GET | /year-end-results | listYearEndResults | FN-SFR-023-08 연말정산 납부세액 분납 및 현황 관리 | 급여 담당자 |
| POST | /tax-filings/submission-summaries | createSubmissionSummary | FN-SFR-023-09 소득자료 제출집계표 및 지급명세서 전산매체 관리 | 급여 담당자 |
| POST | /tax-filings/{taxFilingId}/generate-media | generatePaymentMediaFile | FN-SFR-023-09 소득자료 제출집계표 및 지급명세서 전산매체 관리 | 급여 담당자 |
| POST | /tax-filings/simplified-payments | createSimplifiedPaymentStatement | FN-SFR-023-10 간이지급명세서 작성 및 전자신고 | 급여 담당자 |
| POST | /tax-filings/{taxFilingId}/file | fileSimplifiedPaymentStatement | FN-SFR-023-10 간이지급명세서 작성 및 전자신고 | 급여 담당자 |
| PUT | /requisitions/{requisitionId} | updateRequisition | FN-SFR-024-01 구매품의서 작성 및 예산 통제 | 임직원 |
| DELETE | /requisitions/{requisitionId} | deleteRequisition | FN-SFR-024-01 구매품의서 작성 및 예산 통제 | 임직원 |
| GET | /requisitions/budget-status | listRequisitionBudgetStatus | FN-SFR-024-01 구매품의서 작성 및 예산 통제 | 임직원, 예산·회계 담당자 |
| GET | /requisitions | listRequisitions | FN-SFR-024-02 구매품의 조회 및 승인 처리 | 임직원, 예산·회계 담당자, 시스템 관리자 |
| POST | /requisitions/{requisitionId}/reject | rejectRequisition | FN-SFR-024-02 구매품의 조회 및 승인 처리 | 임직원, 예산·회계 담당자, 시스템 관리자 |
| POST | /purchase-asset-items | createPurchaseAssetItem | FN-SFR-024-03 구매품의 자산품목 관리 및 자산 등록 연계 | 임직원, 자산 담당자 |
| PATCH | /purchase-asset-items/{purchaseAssetItemId} | updatePurchaseAssetItem | FN-SFR-024-03 구매품의 자산품목 관리 및 자산 등록 연계 | 임직원, 자산 담당자 |
| GET | /purchase-asset-items | listPurchaseAssetItems | FN-SFR-024-03 구매품의 자산품목 관리 및 자산 등록 연계 | 임직원, 자산 담당자 |
| GET | /assets | listAssets | FN-SFR-025-01 자산 정보 등록·관리 | 자산 담당자 |
| POST | /asset-changes | createAssetChange | FN-SFR-025-02 자산 변동현황 등록·조회 (함께 씀: FN-SFR-025-05) | 자산 담당자 |
| GET | /asset-changes | listAssetChanges | FN-SFR-025-02 자산 변동현황 등록·조회 | 자산 담당자 |
| POST | /asset-print-logs | printAssetCodes | FN-SFR-025-03 자산 QR·바코드 출력·관리 | 자산 담당자 |
| GET | /asset-print-logs | listAssetPrintLogs | FN-SFR-025-03 자산 QR·바코드 출력·관리 | 자산 담당자 |
| POST | /asset-inspection-plans | createAssetInspectionPlan | FN-SFR-025-04 자산실사 계획 관리 | 자산 담당자 |
| PATCH | /asset-inspection-plans/{assetInspectionPlanId} | updateAssetInspectionPlan | FN-SFR-025-04 자산실사 계획 관리 | 자산 담당자 |
| DELETE | /asset-inspection-plans/{assetInspectionPlanId} | deleteAssetInspectionPlan | FN-SFR-025-04 자산실사 계획 관리 | 자산 담당자 |
| POST | /asset-inspection-plans/{assetInspectionPlanId}/cancel-approval | cancelApprovalAssetInspectionPlan | FN-SFR-025-04 자산실사 계획 관리 | 자산 담당자 |
| POST | /asset-inspection-plans/{assetInspectionPlanId}/cancel | cancelAssetInspectionPlan | FN-SFR-025-04 자산실사 계획 관리 | 자산 담당자 |
| POST | /asset-inspection-plans/{assetInspectionPlanId}/complete | completeAssetInspectionPlan | FN-SFR-025-04 자산실사 계획 관리 (함께 씀: FN-SFR-025-05) | 자산 담당자 |
| GET | /asset-inspection-plans | listAssetInspectionPlans | FN-SFR-025-04 자산실사 계획 관리 (함께 씀: FN-SFR-025-05) | 자산 담당자 |
| POST | /asset-inspection-plans/{assetInspectionPlanId}/link | linkAssetInspectionPlan | FN-SFR-025-05 자산실사 처리 및 현황 조회 | 자산 담당자 |
| POST | /asset-inspection-items/receive | receiveAssetInspectionResults | FN-SFR-025-05 자산실사 처리 및 현황 조회 |  |
| PUT | /menu-permissions/{menuPermissionId} | updateMenuPermission2 | FN-SFR-026-01 통합 사용 권한 관리 | 시스템 관리자 |
| POST | /menus | createMenu | FN-SFR-026-02 단일 포털 기반 통합 운영 및 시스템 설정 관리 | 시스템 관리자 |
| PUT | /menus/{menuId} | updateMenu | FN-SFR-026-02 단일 포털 기반 통합 운영 및 시스템 설정 관리 | 시스템 관리자 |
| GET | /search-results | searchGroupware | FN-SFR-026-03 그룹웨어 통합검색 | 임직원 |
| GET | /portal-widget-settings | listPortalWidgetSettings | FN-SFR-026-04 통합업무포털 구성 및 개인화 | 임직원 |
| POST | /portal-widget-settings | createPortalWidgetSetting | FN-SFR-026-04 통합업무포털 구성 및 개인화 | 임직원 |
| PUT | /portal-widget-settings/{portalWidgetSettingId} | updatePortalWidgetSetting | FN-SFR-026-04 통합업무포털 구성 및 개인화 | 임직원 |
| GET | /portal-banners | listPortalBanners | FN-SFR-026-04 통합업무포털 구성 및 개인화 (함께 씀: FN-SFR-027-05) | 시스템 관리자, 임직원 |
| POST | /portal-banners | createPortalBanner | FN-SFR-026-04 통합업무포털 구성 및 개인화 | 시스템 관리자 |
| GET | /personal-menus | listPersonalMenus | FN-SFR-026-04 통합업무포털 구성 및 개인화 (함께 씀: FN-SFR-027-05) | 임직원 |
| GET | /attachments/{attachmentId}/preview | getAttachmentPreview | FN-SFR-026-05 첨부파일 문서 미리보기 (함께 씀: FN-SFR-031-05) | 임직원 |
| POST | /menus/{menuId}/open | openMenu | FN-SFR-027-02 다중 업무 화면 전환 (함께 씀: FN-SFR-027-04) | 임직원 |
| GET | /portal | getPortal | FN-SFR-027-03 포털 위젯 표시 | 임직원 |
| GET | /menu-usage-logs | listMenuUsageLogs | FN-SFR-027-04 최근 사용 메뉴 이력 조회 및 이동 (함께 씀: FN-SFR-038-02) | 임직원 |
| POST | /menu-usage-logs | createMenuUsageLog | FN-SFR-027-04 최근 사용 메뉴 이력 조회 및 이동 | 임직원 |
| PUT | /portal-widget-settings | updatePortalWidgetSettings | FN-SFR-027-05 포털 개인화 및 메뉴 구성 관리 | 임직원 |
| POST | /personal-menus | createPersonalMenu | FN-SFR-027-05 포털 개인화 및 메뉴 구성 관리 | 임직원 |
| PATCH | /personal-menus/{personalMenuId} | updatePersonalMenu | FN-SFR-027-05 포털 개인화 및 메뉴 구성 관리 | 임직원 |
| DELETE | /personal-menus/{personalMenuId} | deletePersonalMenu | FN-SFR-027-05 포털 개인화 및 메뉴 구성 관리 | 임직원 |
| GET | /notifications | listNotifications | FN-SFR-028-01 알림 및 @멘션 통합 관리 (함께 씀: FN-SFR-028-03, FN-SFR-029-05, FN-SFR-029-08, FN-SFR-036-04, FN-SFR-036-08) | 임직원 |
| POST | /notifications/mentions | createMentionNotifications | FN-SFR-028-01 알림 및 @멘션 통합 관리 | 임직원 |
| PATCH | /notifications/{notificationId}/read | readNotification | FN-SFR-028-01 알림 및 @멘션 통합 관리 | 임직원 |
| GET | /notifications/{notificationId} | getNotification | FN-SFR-028-03 알림 바로가기 및 조회 | 임직원 |
| POST | /notifications/read-all | readAllNotifications | FN-SFR-028-04 알림 읽음 처리 및 상태 표시 | 임직원 |
| GET | /approval-forms | listApprovalForms | FN-SFR-029-01 결재양식 및 결재 프로세스 관리 | 시스템 관리자 |
| POST | /approval-forms | createApprovalForm | FN-SFR-029-01 결재양식 및 결재 프로세스 관리 (함께 씀: FN-SFR-030-02) | 시스템 관리자 |
| GET | /approval-documents | listApprovalDocuments | FN-SFR-029-02 결재 처리 및 문서 조회 (함께 씀: FN-SFR-040-08) | 임직원 |
| POST | /approval-documents/{approvalDocumentId}/process | processApprovalDocument | FN-SFR-029-02 결재 처리 및 문서 조회 | 임직원 |
| POST | /approval-documents/{approvalDocumentId}/withdraw | withdrawApprovalDocument | FN-SFR-029-02 결재 처리 및 문서 조회 | 임직원 |
| DELETE | /approval-documents/{approvalDocumentId} | deleteApprovalDocument | FN-SFR-029-02 결재 처리 및 문서 조회 | 임직원 |
| POST | /approval-documents | createApprovalDocument | FN-SFR-029-04 일괄기안·연속결재·재기안 (함께 씀: FN-SFR-029-09, FN-SFR-030-01, FN-SFR-030-03, FN-SIR-002-03) | 임직원 |
| POST | /approval-documents/batch-draft | batchDraftApprovalDocuments | FN-SFR-029-04 일괄기안·연속결재·재기안 | 임직원 |
| POST | /approval-documents/{approvalDocumentId}/redraft | redraftApprovalDocument | FN-SFR-029-04 일괄기안·연속결재·재기안 | 임직원 |
| GET | /employee-departments | listEmployeeDepartments | FN-SFR-029-05 겸직 사용자 업무환경 및 결재 알림 | 임직원 |
| POST | /approval-documents/{approvalDocumentId}/designate-security | designateSecurityApprovalDocument | FN-SFR-029-07 긴급결재 및 보안문서 설정 | 임직원 |
| POST | /notifications/{notificationId}/read | readNotification2 | FN-SFR-029-08 결재 관련 알림 발송 (함께 씀: FN-SFR-036-06, FN-SFR-036-08) | 임직원 |
| POST | /attachments | createAttachment | FN-SFR-029-09 결재문서 작성 및 서명 (함께 씀: FN-SFR-031-05, FN-SFR-036-07) | 임직원 |
| POST | /approval-documents/{approvalDocumentId}/submit | submitApprovalDocument | FN-SFR-030-01 웹 기안기 결재 상신 | 임직원 |
| POST | /approval-forms/convert | convertApprovalFormFile | FN-SFR-030-02 기존 문서 파일 기반 결재양식 편집·변환 | 시스템 관리자 |
| GET | /departments | listDepartments | FN-SFR-031-01 결재문서 공통관리 설정 (함께 씀: FN-SFR-036-09) | 시스템 관리자 |
| PATCH | /departments/{departmentId} | updateDepartment | FN-SFR-031-01 결재문서 공통관리 설정 | 시스템 관리자 |
| POST | /approval-handovers | createApprovalHandover | FN-SFR-031-02 전자결재 문서 인수인계 | 시스템 관리자 |
| GET | /attachments | listAttachments | FN-SFR-031-05 첨부파일 관리 (함께 씀: FN-SFR-036-07) | 임직원 |
| GET | /attachments/{attachmentId}/download | downloadAttachment | FN-SFR-031-05 첨부파일 관리 | 임직원 |
| GET | /personnel-records/me | getMyPersonnelRecord | FN-SFR-032-01 본인 인사정보 조회 | 임직원 |
| PUT | /attendance-requests/{attendanceRequestId} | updateAttendanceRequest | FN-SFR-032-03 근태신청 및 근무변경 관리 | 임직원 |
| DELETE | /attendance-requests/{attendanceRequestId} | deleteAttendanceRequest | FN-SFR-032-03 근태신청 및 근무변경 관리 | 임직원 |
| POST | /attendance-requests/{attendanceRequestId}/consent | consentAttendanceRequest | FN-SFR-032-04 근무시간 동의 및 근태집계 현황 조회 | 임직원 |
| GET | /attendance-summaries | listAttendanceSummaries | FN-SFR-032-04 근무시간 동의 및 근태집계 현황 조회 | 임직원 |
| GET | /severance-simulations | getSeveranceSimulation | FN-SFR-032-06 급여명세서 및 퇴직금 시뮬레이션 조회 | 임직원 |
| GET | /year-end-data | listYearEndData | FN-SFR-032-07 개인 연말정산 자료 입력 및 관리 | 임직원 |
| PATCH | /year-end-data/{yearEndDataId} | updateYearEndData2 | FN-SFR-032-07 개인 연말정산 자료 입력 및 관리 | 임직원 |
| POST | /year-end-data/{yearEndDataId}/submit | submitYearEndData | FN-SFR-032-07 개인 연말정산 자료 입력 및 관리 | 임직원 |
| POST | /requisitions/{requisitionId}/submit | submitRequisition | FN-SFR-032-08 지출품의서 작성 및 결재 연계 | 임직원 |
| GET | /budget-controls | getBudgetControl | FN-SFR-032-10 예산정보 조회 및 예산 통제 | 임직원, 예산·회계 담당자 |
| POST | /expense-resolutions/{expenseResolutionId}/reflect-budget | reflectExpenseResolutionBudget | FN-SFR-032-11 ERP 연계 예산 반영 및 자동전표 처리 |  |
| POST | /expense-resolutions/{expenseResolutionId}/submit | submitExpenseResolution | FN-SFR-032-12 지출결의서 작성 및 결재 연계 | 임직원 |
| GET | /resources | listResources | FN-SFR-033-01 자원 예약 현황 조회 | 임직원 |
| GET | /resource-reservations | listResourceReservations | FN-SFR-033-01 자원 예약 현황 조회 (함께 씀: FN-SFR-040-06) | 임직원 |
| GET | /resource-reservations/{resourceReservationId} | getResourceReservation | FN-SFR-033-01 자원 예약 현황 조회 | 임직원 |
| POST | /resource-reservations | createResourceReservation | FN-SFR-033-02 자원 예약 등록 | 임직원 |
| GET | /resource-categories | listResourceCategories | FN-SFR-033-03 자원 분류·목록 및 설정 관리 | 자원 담당자 |
| POST | /resource-categories | createResourceCategory | FN-SFR-033-03 자원 분류·목록 및 설정 관리 | 자원 담당자 |
| PATCH | /resource-categories/{resourceCategoryId} | updateResourceCategory | FN-SFR-033-03 자원 분류·목록 및 설정 관리 | 자원 담당자 |
| DELETE | /resource-categories/{resourceCategoryId} | deleteResourceCategory | FN-SFR-033-03 자원 분류·목록 및 설정 관리 | 자원 담당자 |
| POST | /resources | createResource | FN-SFR-033-03 자원 분류·목록 및 설정 관리 | 자원 담당자 |
| PATCH | /resources/{resourceId} | updateResource | FN-SFR-033-03 자원 분류·목록 및 설정 관리 | 자원 담당자 |
| DELETE | /resources/{resourceId} | deleteResource | FN-SFR-033-03 자원 분류·목록 및 설정 관리 | 자원 담당자 |
| POST | /resource-reservations/{resourceReservationId}/approve | approveResourceReservation | FN-SFR-033-05 자원 예약 승인 처리 | 자원 담당자 |
| POST | /resource-reservations/{resourceReservationId}/reject | rejectResourceReservation | FN-SFR-033-05 자원 예약 승인 처리 | 자원 담당자 |
| POST | /resource-reservations/{resourceReservationId}/cancel-approval | cancelApprovalResourceReservation | FN-SFR-033-05 자원 예약 승인 처리 | 자원 담당자 |
| POST | /resource-reservations/{resourceReservationId}/cancel | cancelResourceReservation | FN-SFR-033-05 자원 예약 승인 처리 | 자원 담당자, 임직원 |
| DELETE | /resource-reservations/{resourceReservationId} | deleteResourceReservation | FN-SFR-033-05 자원 예약 승인 처리 | 자원 담당자 |
| POST | /board-posts | createBoardPost | FN-SFR-034-01 공지·게시물 등록 | 임직원, 시스템 관리자 |
| GET | /board-posts/{boardPostId}/readers | listBoardPostReaders | FN-SFR-034-02 공지·게시물 열람자 확인 | 임직원, 시스템 관리자 |
| GET | /board-posts | listBoardPosts | FN-SFR-034-03 공지·게시물 분류별·최근 조회 (함께 씀: FN-SFR-040-04) | 임직원 |
| GET | /board-posts/{boardPostId} | getBoardPost | FN-SFR-034-03 공지·게시물 분류별·최근 조회 (함께 씀: FN-SFR-036-08, FN-SFR-040-04) | 임직원 |
| POST | /surveys | createSurvey | FN-SFR-035-01 설문조사 등록 및 공개·대상·알림 설정 | 임직원 |
| POST | /survey-questions | createSurveyQuestion | FN-SFR-035-02 설문항목 관리 | 임직원 |
| GET | /survey-questions | listSurveyQuestions | FN-SFR-035-02 설문항목 관리 | 임직원 |
| POST | /surveys/{surveyId}/responses | submitSurveyResponses | FN-SFR-035-03 설문 응답 입력 | 임직원 |
| GET | /messenger-rooms | listMessengerRooms | FN-SFR-036-01 실시간 채팅 대화방 이용 및 개인 대화방 관리 | 임직원 |
| POST | /messenger-rooms | createMessengerRoom | FN-SFR-036-01 실시간 채팅 대화방 이용 및 개인 대화방 관리 | 임직원 |
| PATCH | /messenger-rooms/{messengerRoomId} | updateMessengerRoom | FN-SFR-036-01 실시간 채팅 대화방 이용 및 개인 대화방 관리 | 임직원 |
| DELETE | /messenger-rooms/{messengerRoomId} | deleteMessengerRoom | FN-SFR-036-01 실시간 채팅 대화방 이용 및 개인 대화방 관리 | 임직원 |
| POST | /messenger-messages | createMessengerMessage | FN-SFR-036-02 메시지·파일 실시간 송수신 (함께 씀: FN-SFR-036-07) | 임직원 |
| POST | /messenger-messages/{messengerMessageId}/forward | forwardMessengerMessage | FN-SFR-036-02 메시지·파일 실시간 송수신 | 임직원 |
| GET | /messenger-message-recipients | listMessengerMessageRecipients | FN-SFR-036-02 메시지·파일 실시간 송수신 | 임직원 |
| POST | /messenger-messages/{messengerMessageId}/read | readMessengerMessage | FN-SFR-036-02 메시지·파일 실시간 송수신 | 임직원 |
| POST | /messenger-messages/send-notes | sendMessengerNotes | FN-SFR-036-03 쪽지·파일 일괄 전송 | 임직원 |
| GET | /messenger-messages | listMessengerMessages | FN-SFR-036-04 알림 이력 조회 및 메신저 메시지 통합 관리 (함께 씀: FN-SFR-036-07) | 임직원 |
| DELETE | /messenger-messages/{messengerMessageId} | deleteMessengerMessage | FN-SFR-036-04 알림 이력 조회 및 메신저 메시지 통합 관리 | 임직원 |
| DELETE | /notifications/{notificationId} | deleteNotification | FN-SFR-036-04 알림 이력 조회 및 메신저 메시지 통합 관리 | 임직원 |
| GET | /messenger-messages/search | searchMessengerMessages | FN-SFR-036-05 메신저 메시지 검색 | 임직원 |
| POST | /notifications | createNotification | FN-SFR-036-06 그룹웨어 모듈 이벤트 실시간 알림 및 바로가기 |  |
| POST | /auth/login | login | FN-SFR-037-01 2차 인증 로그인 | 임직원 |
| GET | /auth-settings | listAuthSettings | FN-SFR-037-02 인증 대상·허용 인증기기 수 설정 | 시스템 관리자 |
| PUT | /auth-settings | saveAuthSetting | FN-SFR-037-02 인증 대상·허용 인증기기 수 설정 | 시스템 관리자 |
| GET | /auth-devices | listAuthDevices | FN-SFR-037-03 인증기기 승인·관리 | 시스템 관리자, 임직원 |
| POST | /auth-devices | createAuthDevice | FN-SFR-037-03 인증기기 승인·관리 | 임직원 |
| POST | /auth-devices/{authDeviceId}/approve | approveAuthDevice | FN-SFR-037-03 인증기기 승인·관리 | 시스템 관리자 |
| POST | /auth-devices/{authDeviceId}/reject | rejectAuthDevice | FN-SFR-037-03 인증기기 승인·관리 | 시스템 관리자 |
| POST | /auth-devices/{authDeviceId}/deactivate | deactivateAuthDevice | FN-SFR-037-03 인증기기 승인·관리 | 시스템 관리자 |
| DELETE | /auth-devices/{authDeviceId} | deleteAuthDevice | FN-SFR-037-03 인증기기 승인·관리 | 시스템 관리자 |
| GET | /login-histories | listLoginHistories | FN-SFR-038-01 로그인 내역 통계 조회 | 시스템 관리자 |
| GET | /server-capacities | getServerCapacity | FN-SFR-038-03 서버 사용 용량 현황 조회 | 시스템 관리자 |
| GET | /menu-usage-statistics | listMenuUsageStatistics | FN-SFR-038-04 메뉴별 사용 통계 시각화 조회 | 시스템 관리자 |
| GET | /integrated-searches | searchIntegrated | FN-SFR-039-01 그룹웨어 정보 통합검색 | 임직원 |
| GET | /employees/{employeeId}/activities | listEmployeeActivities | FN-SFR-039-02 조직원 검색 및 활동 내역 조회 | 임직원 |
| POST | /auth/mobile-login | loginMobile | FN-SFR-040-01 모바일 로그인·로그아웃 | 임직원 |
| POST | /auth/mobile-logout | logoutMobile | FN-SFR-040-01 모바일 로그인·로그아웃 | 임직원 |
| GET | /mobile/menu-badges | listMobileMenuBadges | FN-SFR-040-02 모바일 메뉴 신규 건수 조회 | 임직원 |
| GET | /mail-messages/inbox | listInboxMailMessages | FN-SFR-040-03 모바일 메일 작성·받은편지함 조회 | 임직원 |
| POST | /mail-messages | createMailMessage | FN-SFR-040-03 모바일 메일 작성·받은편지함 조회 | 임직원 |
| GET | /schedules | listSchedules | FN-SFR-040-06 모바일 일정·자원예약 조회 | 임직원 |
| POST | /approval-documents/{approvalDocumentId}/approve | approveApprovalDocument | FN-SFR-040-07 모바일 결재문서 승인·반려 | 임직원 |
| POST | /approval-documents/{approvalDocumentId}/reject | rejectApprovalDocument | FN-SFR-040-07 모바일 결재문서 승인·반려 | 임직원 |
| GET | /approval-documents/{approvalDocumentId} | getApprovalDocument | FN-SFR-040-08 모바일 상신 문서 조회 | 임직원 |
| GET | /document-box-items | listDocumentBoxItems | FN-SFR-040-09 모바일 문서함 완료문서 조회 | 임직원 |
| GET | /document-box-items/{documentBoxItemId} | getDocumentBoxItem | FN-SFR-040-09 모바일 문서함 완료문서 조회 | 임직원 |
| GET | /search | searchIntegrated2 | FN-SFR-040-10 모바일 통합검색 | 임직원 |
| GET | /office-templates | listOfficeTemplates | FN-SFR-041-01 웹 오피스 문서 작성 및 편집 | 임직원 |
| POST | /office-documents | createOfficeDocument | FN-SFR-041-01 웹 오피스 문서 작성 및 편집 | 임직원 |
| POST | /office-documents/convert | convertOfficeDocument | FN-SFR-041-03 한글·Word 양식 문서 변환 및 편집 | 임직원 |
| POST | /office-documents/{officeDocumentId}/share | shareOfficeDocument | FN-SFR-041-05 웹 오피스 문서 공유 및 권한 설정 | 임직원 |
| GET | /office-documents | listOfficeDocuments | FN-SFR-041-06 내 문서함 및 공유 문서함 관리 | 임직원 |
| GET | /office-documents/{officeDocumentId} | getOfficeDocument | FN-SFR-041-06 내 문서함 및 공유 문서함 관리 | 임직원 |
| PATCH | /office-documents/{officeDocumentId} | updateOfficeDocument | FN-SFR-041-06 내 문서함 및 공유 문서함 관리 | 임직원 |
| DELETE | /office-documents/{officeDocumentId} | deleteOfficeDocument | FN-SFR-041-06 내 문서함 및 공유 문서함 관리 | 임직원 |
| POST | /office-documents/{officeDocumentId}/link-ecm | linkOfficeDocumentToEcm | FN-SFR-041-07 웹 오피스 ECM 연계 통합 관리 | 임직원 |
| GET | /ecm-documents | listEcmDocuments | FN-SFR-041-07 웹 오피스 ECM 연계 통합 관리 | 임직원 |
| GET | /fee-unit-prices | listFeeUnitPrices | FN-SFR-042-01 심사수수료·재발급 수수료 단가 관리 | 임직원 |
| POST | /fee-unit-prices | createFeeUnitPrice | FN-SFR-042-01 심사수수료·재발급 수수료 단가 관리 | 임직원 |
| PATCH | /fee-unit-prices/{feeUnitPriceId} | updateFeeUnitPrice | FN-SFR-042-01 심사수수료·재발급 수수료 단가 관리 | 임직원 |
| POST | /fee-records | createFeeRecord | FN-SFR-042-03 심사수수료·재발급 수수료 등록 | 임직원 |
| GET | /fee-records/review-status | getReviewStatus | FN-SFR-042-04 심사현황 조회 | 임직원 |
| GET | /fee-records | listReissueFeeRecords | FN-SFR-042-05 재발급 내역현황·집계 조회 | 임직원 |
| GET | /fee-records/summary | getReissueFeeRecordSummary | FN-SFR-042-05 재발급 내역현황·집계 조회 | 임직원 |
| POST | /approval-documents/draft-assist | generateApprovalDocumentDraft | FN-SFR-044-02 AI 기안문 작성 지원 및 문구 추천 | 임직원 |
| POST | /approval-documents/phrase-suggestions | suggestApprovalDocumentPhrases | FN-SFR-044-02 AI 기안문 작성 지원 및 문구 추천 | 임직원 |
| POST | /data-analysis/queries | queryDataAnalysis | FN-SFR-044-03 예산·회계·인사 데이터 분석 및 질의응답 | 임직원 |
| GET | /personal-info-access-logs/statistics | getPersonalInfoAccessStatistics | FN-COR-002-01 개인정보 열람 이력 통계 조회 | 시스템 관리자 |
| POST | /link-logs/sync | syncExternalLink | FN-SIR-001-01 외부 금융·결재 시스템 API 연계 | 시스템 관리자, 예산·회계 담당자 |
| POST | /interface-standards | createInterfaceStandard | FN-SIR-002-01 내부 단위시스템 연계 인터페이스 표준 관리 | 시스템 관리자 |
| GET | /interface-standards | listInterfaceStandards | FN-SIR-002-01 내부 단위시스템 연계 인터페이스 표준 관리 | 시스템 관리자 |
| POST | /interface-standards/invoke | invokeStandardInterface | FN-SIR-002-02 표준 연계 API 제공 |  |
| PATCH | /api-clients/{apiClientId} | updateApiClientUsage | FN-SIR-002-02 표준 연계 API 제공 | 시스템 관리자 |
| POST | /approval-linked-forms | createApprovalLinkedForm | FN-SIR-002-03 전자결재 양식 연동결재 지원 | 시스템 관리자 |
| GET | /help-contents | listHelpContents | FN-SIR-003-01 사용자 기능 온라인 도움말 조회 | 임직원, 시스템 관리자 |
| GET | /error-messages | listErrorMessages | FN-SIR-003-02 오류 에러 메시지 표시 | 임직원 |

## 3. 기능별 API

### FN-SFR-001-01 통합 사용 권한 관리

- 요구사항: SFR-001-08 · 테이블: employee, department, menu_permission

#### GET /menu-permissions — 임직원별 ERP·그룹웨어 통합 사용 권한 현황을 조회한다 (`listMenuPermissions`)

- 권한: 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | menu_permission.employee_id | 임직원 |
| module | string | 아니오 | - | 대상 시스템 구분(ERP 또는 그룹웨어) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuPermissionId | integer int64 | menu_permission.menu_permission_id | 메뉴 사용 권한 ID |
| employeeId | integer int64 | menu_permission.employee_id | 임직원 |
| menuId | integer int64 | menu_permission.menu_id | 메뉴 |
| viewScope | string(10) [전체\|부서\|개인] | menu_permission.view_scope | 조회 범위 |

오류: 공통 오류만 (1절)

#### POST /menu-permissions — 임직원에게 메뉴 사용 권한을 부여한다 (`createMenuPermission`)

- 권한: 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | menu_permission.employee_id | 임직원 |
| menuId | integer int64 | 예 | menu_permission.menu_id | 메뉴 |
| viewScope | string(10) [전체\|부서\|개인] | 예 | menu_permission.view_scope | 조회 범위 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuPermissionId | integer int64 | menu_permission.menu_permission_id | 메뉴 사용 권한 ID |
| employeeId | integer int64 | menu_permission.employee_id | 임직원 |
| menuId | integer int64 | menu_permission.menu_id | 메뉴 |
| viewScope | string(10) [전체\|부서\|개인] | menu_permission.view_scope | 조회 범위 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_OR_MENU_NOT_FOUND | 대상 임직원 또는 메뉴가 존재하지 않음 |
| 409 | MENU_PERMISSION_DUPLICATED | 동일 임직원·메뉴의 권한이 이미 존재함 |

#### PATCH /menu-permissions/{menuPermissionId} — 메뉴 사용 권한의 조회 범위를 변경한다 (`updateMenuPermission`)

- 권한: 시스템 관리자 · 경로 변수: menuPermissionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| viewScope | string(10) [전체\|부서\|개인] | 예 | menu_permission.view_scope | 조회 범위 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuPermissionId | integer int64 | menu_permission.menu_permission_id | 메뉴 사용 권한 ID |
| viewScope | string(10) [전체\|부서\|개인] | menu_permission.view_scope | 조회 범위 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MENU_PERMISSION_NOT_FOUND | 권한이 존재하지 않음 |

#### DELETE /menu-permissions/{menuPermissionId} — 메뉴 사용 권한을 회수한다 (`deleteMenuPermission`)

- 권한: 시스템 관리자 · 경로 변수: menuPermissionId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MENU_PERMISSION_NOT_FOUND | 권한이 존재하지 않음 |

### FN-SFR-001-03 RFID 기반 자산 관리

- 요구사항: SFR-001-04 · 테이블: asset, rfid_scan_log

#### POST /rfid-scan-logs — RFID 태그 식별값을 수신해 자산과 매칭하고 스캔 이력을 남긴다 (`createRfidScanLog`)

- 권한: 자산 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| tagValue | string(100) | 예 | rfid_scan_log.tag_value | RFID 태그 식별값 |
| scannedAt | string date-time | 예 | rfid_scan_log.scanned_at | 스캔 일시 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| rfidScanLogId | integer int64 | rfid_scan_log.rfid_scan_log_id | RFID 스캔 이력 ID |
| assetId | integer int64 | rfid_scan_log.asset_id | 자산 ID |
| matchStatus | string(20) [MATCHED\|UNMATCHED] | rfid_scan_log.match_status | 매칭 여부 |
| assetName | string(200) | asset.asset_name | 자산명 |

오류: 공통 오류만 (1절)

#### GET /rfid-scan-logs — 스캔 결과와 미매칭 태그 목록을 조회한다 (`listRfidScanLogs`)

- 권한: 자산 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| matchStatus | string(20) [MATCHED\|UNMATCHED] | 아니오 | rfid_scan_log.match_status | 매칭 여부 |
| scannedFrom | string | 아니오 | - | 스캔 시작 일시 |
| scannedTo | string | 아니오 | - | 스캔 종료 일시 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| rfidScanLogId | integer int64 | rfid_scan_log.rfid_scan_log_id | RFID 스캔 이력 ID |
| tagValue | string(100) | rfid_scan_log.tag_value | RFID 태그 식별값 |
| scannedAt | string date-time | rfid_scan_log.scanned_at | 스캔 일시 |
| matchStatus | string(20) [MATCHED\|UNMATCHED] | rfid_scan_log.match_status | 매칭 여부 |
| assetId | integer int64 | rfid_scan_log.asset_id | 자산 ID |

오류: 공통 오류만 (1절)

### FN-SFR-001-04 e나라도움 연동

- 요구사항: SFR-001-03, SFR-001-11 · 테이블: project, budget_account, account_subject, partner, journal_entry, link_log

#### POST /link-logs — e나라도움 연계를 요청하고 처리 결과를 기록한다 (`createLinkLog`)

- 권한: 예산·회계 담당자, 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| linkTarget | string(50) [E_NARA_DOUM\|NTS_HOMETAX\|NTS_EFILING\|BANK_CMS\|CARD_COMPANY\|LEGACY_ERP\|ASSET_INSPECTION\|COMMUTE_SYSTEM\|ECM] | 예 | link_log.link_target | 연계 대상 |
| linkType | string(100) | 예 | link_log.link_type | 연계 구분 |
| requestSummary | string(1000) | 아니오 | link_log.request_summary | 요청 조건 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| linkLogId | integer int64 | link_log.link_log_id | 외부 연계 이력 ID |
| status | string(20) [REQUESTED\|SUCCESS\|FAILED] | link_log.status | 연계 상태 |
| failureReason | string | link_log.failure_reason | 실패 사유 |
| processedCount | integer int32 | link_log.processed_count | 처리 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 502 | E_NARA_DOUM_LINK_FAILED | VPN 또는 e나라도움 연계가 실패함 |
| 422 | INVALID_LINK_REQUEST | 연계 대상 데이터나 요청 구분이 올바르지 않음 |

#### GET /link-logs — 외부 연계 이력을 조회한다 (`listLinkLogs`)

- 권한: 예산·회계 담당자, 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| linkTarget | string(50) [E_NARA_DOUM\|NTS_HOMETAX\|NTS_EFILING\|BANK_CMS\|CARD_COMPANY\|LEGACY_ERP\|ASSET_INSPECTION\|COMMUTE_SYSTEM\|ECM] | 아니오 | link_log.link_target | 연계 대상 |
| status | string(20) [REQUESTED\|SUCCESS\|FAILED] | 아니오 | link_log.status | 연계 상태 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| linkLogId | integer int64 | link_log.link_log_id | 외부 연계 이력 ID |
| linkTarget | string(50) [E_NARA_DOUM\|NTS_HOMETAX\|NTS_EFILING\|BANK_CMS\|CARD_COMPANY\|LEGACY_ERP\|ASSET_INSPECTION\|COMMUTE_SYSTEM\|ECM] | link_log.link_target | 연계 대상 |
| linkType | string(100) | link_log.link_type | 연계 구분 |
| status | string(20) [REQUESTED\|SUCCESS\|FAILED] | link_log.status | 연계 상태 |
| requestedAt | string date-time | link_log.requested_at | 요청 일시 |
| completedAt | string date-time | link_log.completed_at | 완료 일시 |
| failureReason | string | link_log.failure_reason | 실패 사유 |

오류: 공통 오류만 (1절)

### FN-SFR-001-05 그룹웨어 통합 업무 환경 이용

- 요구사항: SFR-001-01 · 테이블: employee, menu, menu_permission

#### GET /menus — 사용 권한 범위 안의 메뉴 목록을 조회한다 (`listMenus`)

- 권한: 임직원, 예산·회계 담당자, 인사 담당자, 근태 담당자, 급여 담당자, 자산 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| module | string(100) | 아니오 | menu.module | 연결 모듈 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuId | integer int64 | menu.menu_id | 메뉴 ID |
| name | string(100) | menu.name | 메뉴명 |
| module | string(100) | menu.module | 연결 모듈 |
| displayOrder | integer int32 | menu.display_order | 표시순서 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 현재 사용자의 임직원 정보가 없음 |

### FN-SFR-001-06 ERP 업무 모듈 이용

- 요구사항: SFR-001-02 · 테이블: employee, menu

#### GET /menus — 사용 권한 범위 안의 메뉴 목록을 조회한다 (`listMenus`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-002-01 프로젝트 등록·관리

- 요구사항: SFR-002-01 · 테이블: project, project_permission

#### GET /projects — 프로젝트 목록을 조회한다 (`listProjects`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectCode | string(50) | 아니오 | project.project_code | 프로젝트 코드 |
| name | string(200) | 아니오 | project.name | 프로젝트 명칭 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| projectId | integer int64 | project.project_id | 프로젝트 ID |
| projectCode | string(50) | project.project_code | 프로젝트 코드 |
| name | string(200) | project.name | 프로젝트 명칭 |
| businessCategory | string(20) [고유목적사업\|수익사업\|공통사업] | project.business_category | 사업구분 |
| projectType | string(20) [공통\|직접사업] | project.project_type | 프로젝트 유형 |
| startDate | string date | project.start_date | 시작일 |
| endDate | string date | project.end_date | 종료일 |

오류: 공통 오류만 (1절)

#### POST /projects — 프로젝트를 등록한다 (`createProject`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectCode | string(50) | 예 | project.project_code | 프로젝트 코드 |
| name | string(200) | 예 | project.name | 프로젝트 명칭 |
| shortName | string(50) | 아니오 | project.short_name | 약칭 |
| managedAccount | string(500) | 아니오 | project.managed_account | 관리계좌 |
| startDate | string date | 예 | project.start_date | 시작일 |
| endDate | string date | 예 | project.end_date | 종료일 |
| businessCategory | string(20) [고유목적사업\|수익사업\|공통사업] | 예 | project.business_category | 사업구분 |
| projectType | string(20) [공통\|직접사업] | 예 | project.project_type | 프로젝트 유형 |
| departmentId | integer int64 | 예 | project.department_id | 주관부서 |
| managerId | integer int64 | 예 | project.manager_id | 담당자 |
| projectAmount | number | 아니오 | project.project_amount | 프로젝트 금액 |
| purpose | string | 아니오 | project.purpose | 목적 및 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| projectId | integer int64 | project.project_id | 프로젝트 ID |
| projectCode | string(50) | project.project_code | 프로젝트 코드 |
| name | string(200) | project.name | 프로젝트 명칭 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | PROJECT_CODE_DUPLICATED | 프로젝트 코드가 이미 존재함 |
| 422 | INVALID_PROJECT_PERIOD | 종료일이 시작일보다 빠름 |

#### PATCH /projects/{projectId} — 프로젝트를 수정한다 (`updateProject`)

- 권한: 예산·회계 담당자 · 경로 변수: projectId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(200) | 아니오 | project.name | 프로젝트 명칭 |
| shortName | string(50) | 아니오 | project.short_name | 약칭 |
| managedAccount | string(500) | 아니오 | project.managed_account | 관리계좌 |
| startDate | string date | 아니오 | project.start_date | 시작일 |
| endDate | string date | 아니오 | project.end_date | 종료일 |
| businessCategory | string(20) [고유목적사업\|수익사업\|공통사업] | 아니오 | project.business_category | 사업구분 |
| projectType | string(20) [공통\|직접사업] | 아니오 | project.project_type | 프로젝트 유형 |
| departmentId | integer int64 | 아니오 | project.department_id | 주관부서 |
| managerId | integer int64 | 아니오 | project.manager_id | 담당자 |
| projectAmount | number | 아니오 | project.project_amount | 프로젝트 금액 |
| purpose | string | 아니오 | project.purpose | 목적 및 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| projectId | integer int64 | project.project_id | 프로젝트 ID |
| name | string(200) | project.name | 프로젝트 명칭 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PROJECT_NOT_FOUND | 프로젝트가 존재하지 않음 |
| 422 | INVALID_PROJECT_PERIOD | 종료일이 시작일보다 빠름 |

#### DELETE /projects/{projectId} — 프로젝트를 삭제한다 (`deleteProject`)

- 권한: 예산·회계 담당자 · 경로 변수: projectId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PROJECT_NOT_FOUND | 프로젝트가 존재하지 않음 |
| 409 | PROJECT_IN_USE | 다른 업무에서 사용 중인 프로젝트임 |

#### GET /project-permissions — 프로젝트별 사용 권한 목록을 조회한다 (`listProjectPermissions`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 예 | project_permission.project_id | 프로젝트 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| projectPermissionId | integer int64 | project_permission.project_permission_id | 프로젝트 사용 권한 ID |
| projectId | integer int64 | project_permission.project_id | 프로젝트 |
| employeeId | integer int64 | project_permission.employee_id | 임직원 |
| departmentId | integer int64 | project_permission.department_id | 부서 |

오류: 공통 오류만 (1절)

#### POST /project-permissions — 프로젝트 사용 권한 대상을 설정한다 (`createProjectPermission`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 예 | project_permission.project_id | 프로젝트 |
| employeeId | integer int64 | 아니오 | project_permission.employee_id | 임직원 |
| departmentId | integer int64 | 아니오 | project_permission.department_id | 부서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| projectPermissionId | integer int64 | project_permission.project_permission_id | 프로젝트 사용 권한 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PROJECT_NOT_FOUND | 프로젝트가 존재하지 않음 |
| 422 | PERMISSION_TARGET_REQUIRED | 임직원 또는 부서 대상이 지정되지 않음 |

#### DELETE /project-permissions/{projectPermissionId} — 프로젝트 사용 권한 대상을 삭제한다 (`deleteProjectPermission`)

- 권한: 예산·회계 담당자 · 경로 변수: projectPermissionId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PROJECT_PERMISSION_NOT_FOUND | 사용 권한이 존재하지 않음 |

### FN-SFR-002-02 하위사업 등록·관리

- 요구사항: SFR-002-02 · 테이블: sub_project, sub_project_permission

#### GET /sub-projects — 프로젝트 기준 다단계 하위사업 구조를 조회한다 (`listSubProjects`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 예 | sub_project.project_id | 프로젝트 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| subProjectId | integer int64 | sub_project.sub_project_id | 하위사업 ID |
| projectId | integer int64 | sub_project.project_id | 프로젝트 |
| parentSubProjectId | integer int64 | sub_project.parent_sub_project_id | 상위 하위사업 |
| name | string(200) | sub_project.name | 하위사업 명칭 |
| managedAccount | string(50) | sub_project.managed_account | 관리계좌 |
| useStatus | string(10) [사용\|미사용] | sub_project.use_status | 사용 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PROJECT_NOT_FOUND | 상위 프로젝트가 없음 |

#### POST /sub-projects — 하위사업을 등록한다 (`createSubProject`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 예 | sub_project.project_id | 프로젝트 |
| parentSubProjectId | integer int64 | 아니오 | sub_project.parent_sub_project_id | 상위 하위사업 |
| name | string(200) | 예 | sub_project.name | 하위사업 명칭 |
| managedAccount | string(50) | 아니오 | sub_project.managed_account | 관리계좌 |
| useStatus | string(10) [사용\|미사용] | 예 | sub_project.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| subProjectId | integer int64 | sub_project.sub_project_id | 하위사업 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PROJECT_NOT_FOUND | 상위 프로젝트가 없음 |
| 404 | PARENT_SUB_PROJECT_NOT_FOUND | 상위 하위사업이 없음 |
| 422 | REQUIRED_VALUE_MISSING | 필수값 누락 |

#### PATCH /sub-projects/{subProjectId} — 하위사업을 수정한다 (`updateSubProject`)

- 권한: 예산·회계 담당자 · 경로 변수: subProjectId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| parentSubProjectId | integer int64 | 아니오 | sub_project.parent_sub_project_id | 상위 하위사업 |
| name | string(200) | 아니오 | sub_project.name | 하위사업 명칭 |
| managedAccount | string(50) | 아니오 | sub_project.managed_account | 관리계좌 |
| useStatus | string(10) [사용\|미사용] | 아니오 | sub_project.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| subProjectId | integer int64 | sub_project.sub_project_id | 하위사업 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SUB_PROJECT_NOT_FOUND | 하위사업이 없음 |
| 422 | INVALID_PARENT_SUB_PROJECT | 상위 하위사업이 유효하지 않음 |

#### DELETE /sub-projects/{subProjectId} — 하위사업을 삭제한다 (`deleteSubProject`)

- 권한: 예산·회계 담당자 · 경로 변수: subProjectId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SUB_PROJECT_NOT_FOUND | 하위사업이 없음 |
| 409 | SUB_PROJECT_HAS_CHILDREN | 하위 단계가 존재함 |
| 409 | SUB_PROJECT_IN_USE | 사용 이력이 있음 |

#### GET /sub-project-permissions — 하위사업별 사용 권한을 조회한다 (`listSubProjectPermissions`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| subProjectId | integer int64 | 예 | sub_project_permission.sub_project_id | 하위사업 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| subProjectPermissionId | integer int64 | sub_project_permission.sub_project_permission_id | 하위사업 사용 권한 ID |
| subProjectId | integer int64 | sub_project_permission.sub_project_id | 하위사업 |
| employeeId | integer int64 | sub_project_permission.employee_id | 임직원 |
| departmentId | integer int64 | sub_project_permission.department_id | 부서 |

오류: 공통 오류만 (1절)

#### POST /sub-project-permissions — 하위사업 사용 권한 대상을 설정한다 (`createSubProjectPermission`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| subProjectId | integer int64 | 예 | sub_project_permission.sub_project_id | 하위사업 |
| employeeId | integer int64 | 아니오 | sub_project_permission.employee_id | 임직원 |
| departmentId | integer int64 | 아니오 | sub_project_permission.department_id | 부서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| subProjectPermissionId | integer int64 | sub_project_permission.sub_project_permission_id | 하위사업 사용 권한 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SUB_PROJECT_NOT_FOUND | 하위사업이 없음 |
| 422 | PERMISSION_TARGET_REQUIRED | 임직원 또는 부서가 지정되지 않음 |

#### DELETE /sub-project-permissions/{subProjectPermissionId} — 하위사업 사용 권한을 삭제한다 (`deleteSubProjectPermission`)

- 권한: 예산·회계 담당자 · 경로 변수: subProjectPermissionId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SUB_PROJECT_PERMISSION_NOT_FOUND | 권한 설정이 없음 |

### FN-SFR-002-03 예산과목 등록·관리

- 요구사항: SFR-002-03 · 테이블: budget_account

#### GET /budget-accounts — 그룹별 다단계 예산과목 체계를 조회한다 (`listBudgetAccounts`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| budgetGroup | string(100) | 아니오 | budget_account.budget_group | 예산과목 그룹 |
| incomeExpenseType | string(10) [수입\|지출] | 아니오 | budget_account.income_expense_type | 수입·지출 유형 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetAccountId | integer int64 | budget_account.budget_account_id | 예산과목 ID |
| accountSubjectId | integer int64 | budget_account.account_subject_id | 매핑 계정과목 |
| parentBudgetAccountId | integer int64 | budget_account.parent_budget_account_id | 상위 예산과목 |
| budgetGroup | string(100) | budget_account.budget_group | 예산과목 그룹 |
| name | string(200) | budget_account.name | 예산과목 명칭 |
| incomeExpenseType | string(10) [수입\|지출] | budget_account.income_expense_type | 수입·지출 유형 |
| controlCycle | string(10) [월\|분기\|연] | budget_account.control_cycle | 예산 통제 주기 |
| transferAllowed | boolean | budget_account.transfer_allowed | 예산 전용 가능 여부 |
| useStartDate | string date | budget_account.use_start_date | 사용 시작일 |
| useEndDate | string date | budget_account.use_end_date | 사용 종료일 |

오류: 공통 오류만 (1절)

#### POST /budget-accounts — 예산과목을 등록한다 (`createBudgetAccount`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| budgetGroup | string(100) | 예 | budget_account.budget_group | 예산과목 그룹 |
| incomeExpenseType | string(10) [수입\|지출] | 예 | budget_account.income_expense_type | 수입·지출 유형 |
| parentBudgetAccountId | integer int64 | 아니오 | budget_account.parent_budget_account_id | 상위 예산과목 |
| name | string(200) | 예 | budget_account.name | 예산과목 명칭 |
| controlCycle | string(10) [월\|분기\|연] | 예 | budget_account.control_cycle | 예산 통제 주기 |
| transferAllowed | boolean | 예 | budget_account.transfer_allowed | 예산 전용 가능 여부 |
| useStartDate | string date | 아니오 | budget_account.use_start_date | 사용 시작일 |
| useEndDate | string date | 아니오 | budget_account.use_end_date | 사용 종료일 |
| accountSubjectId | integer int64 | 예 | budget_account.account_subject_id | 매핑 계정과목 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetAccountId | integer int64 | budget_account.budget_account_id | 예산과목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_USE_PERIOD | 사용 종료일이 시작일보다 빠름 |
| 422 | INVALID_ACCOUNT_SUBJECT | 매핑할 계정과목이 없거나 유효하지 않음 |
| 404 | PARENT_BUDGET_ACCOUNT_NOT_FOUND | 상위 예산과목이 없음 |

#### PATCH /budget-accounts/{budgetAccountId} — 예산과목을 수정한다 (`updateBudgetAccount`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetAccountId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| budgetGroup | string(100) | 아니오 | budget_account.budget_group | 예산과목 그룹 |
| name | string(200) | 아니오 | budget_account.name | 예산과목 명칭 |
| controlCycle | string(10) [월\|분기\|연] | 아니오 | budget_account.control_cycle | 예산 통제 주기 |
| transferAllowed | boolean | 아니오 | budget_account.transfer_allowed | 예산 전용 가능 여부 |
| useStartDate | string date | 아니오 | budget_account.use_start_date | 사용 시작일 |
| useEndDate | string date | 아니오 | budget_account.use_end_date | 사용 종료일 |
| accountSubjectId | integer int64 | 아니오 | budget_account.account_subject_id | 매핑 계정과목 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetAccountId | integer int64 | budget_account.budget_account_id | 예산과목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_ACCOUNT_NOT_FOUND | 예산과목이 없음 |
| 422 | INVALID_USE_PERIOD | 사용 종료일이 시작일보다 빠름 |
| 422 | INVALID_ACCOUNT_SUBJECT | 매핑할 계정과목이 없거나 유효하지 않음 |

#### DELETE /budget-accounts/{budgetAccountId} — 예산과목을 삭제한다 (`deleteBudgetAccount`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetAccountId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_ACCOUNT_NOT_FOUND | 예산과목이 없음 |
| 409 | BUDGET_ACCOUNT_HAS_EXECUTION | 예산 집행 이력이 있음 |

### FN-SFR-002-04 거래처 등록·관리(일반·금융)

- 요구사항: SFR-002-04 · 테이블: partner

#### GET /partners — 거래처 목록을 조회한다 (`listPartners`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| partnerType | string(10) [일반\|금융] | 아니오 | partner.partner_type | 거래처 유형 |
| projectId | integer int64 | 아니오 | partner.project_id | 프로젝트 |
| keyword | string | 아니오 | - | 명칭·코드 검색어 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerId | integer int64 | partner.partner_id | 거래처 ID |
| code | string(20) | partner.code | 거래처 코드 |
| partnerType | string(10) [일반\|금융] | partner.partner_type | 거래처 유형 |
| name | string(200) | partner.name | 거래처 명칭 |
| shortName | string(100) | partner.short_name | 약칭 |
| businessRegNo | string(10) | partner.business_reg_no | 사업자등록번호 |
| representative | string(100) | partner.representative | 대표자 |
| tradeStartDate | string date | partner.trade_start_date | 거래 시작일 |
| tradeEndDate | string date | partner.trade_end_date | 거래 종료일 |

오류: 공통 오류만 (1절)

#### POST /partners — 거래처를 등록한다 (`createPartner`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| partnerType | string(10) [일반\|금융] | 예 | partner.partner_type | 거래처 유형 |
| name | string(200) | 예 | partner.name | 거래처 명칭 |
| shortName | string(100) | 아니오 | partner.short_name | 약칭 |
| code | string(20) | 예 | partner.code | 거래처 코드 |
| businessRegNo | string(10) | 예 | partner.business_reg_no | 사업자등록번호 |
| representative | string(100) | 예 | partner.representative | 대표자 |
| projectId | integer int64 | 예 | partner.project_id | 프로젝트 |
| category | string(100) | 아니오 | partner.category | 거래처 분류 |
| region | string(100) | 아니오 | partner.region | 지역 |
| taxInvoiceYn | boolean | 아니오 | partner.tax_invoice_yn | 세금계산서 여부 |
| tradeStartDate | string date | 아니오 | partner.trade_start_date | 거래 시작일 |
| tradeEndDate | string date | 아니오 | partner.trade_end_date | 거래 종료일 |
| contactPerson | string(100) | 아니오 | partner.contact_person | 거래처 담당자 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerId | integer int64 | partner.partner_id | 거래처 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | PARTNER_CODE_DUPLICATED | 거래처 코드가 중복됨 |
| 422 | INVALID_TRADE_PERIOD | 거래 종료일이 시작일보다 빠름 |
| 404 | PROJECT_NOT_FOUND | 프로젝트가 없음 |

#### PATCH /partners/{partnerId} — 거래처를 수정한다 (`updatePartner`)

- 권한: 예산·회계 담당자 · 경로 변수: partnerId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(200) | 아니오 | partner.name | 거래처 명칭 |
| shortName | string(100) | 아니오 | partner.short_name | 약칭 |
| code | string(20) | 아니오 | partner.code | 거래처 코드 |
| businessRegNo | string(10) | 아니오 | partner.business_reg_no | 사업자등록번호 |
| representative | string(100) | 아니오 | partner.representative | 대표자 |
| category | string(100) | 아니오 | partner.category | 거래처 분류 |
| region | string(100) | 아니오 | partner.region | 지역 |
| taxInvoiceYn | boolean | 아니오 | partner.tax_invoice_yn | 세금계산서 여부 |
| tradeStartDate | string date | 아니오 | partner.trade_start_date | 거래 시작일 |
| tradeEndDate | string date | 아니오 | partner.trade_end_date | 거래 종료일 |
| contactPerson | string(100) | 아니오 | partner.contact_person | 거래처 담당자 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerId | integer int64 | partner.partner_id | 거래처 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PARTNER_NOT_FOUND | 거래처가 없음 |
| 409 | PARTNER_CODE_DUPLICATED | 거래처 코드가 중복됨 |
| 422 | INVALID_TRADE_PERIOD | 거래 종료일이 시작일보다 빠름 |

### FN-SFR-002-05 거래처 계좌 등록·관리

- 요구사항: SFR-002-05 · 테이블: partner_account

#### GET /partner-accounts — 거래처별 계좌 목록을 조회한다 (`listPartnerAccounts`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| partnerId | integer int64 | 예 | partner_account.partner_id | 거래처 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerAccountId | integer int64 | partner_account.partner_account_id | 거래처 계좌 ID |
| partnerId | integer int64 | partner_account.partner_id | 거래처 |
| bankName | string(100) | partner_account.bank_name | 은행 |
| accountHolder | string(100) | partner_account.account_holder | 예금주 |
| useStatus | string(10) [사용\|미사용] | partner_account.use_status | 사용 여부 |

오류: 공통 오류만 (1절)

#### POST /partner-accounts — 거래처 계좌를 등록한다 (`createPartnerAccount`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| partnerId | integer int64 | 예 | partner_account.partner_id | 거래처 |
| bankName | string(100) | 예 | partner_account.bank_name | 은행 |
| accountNumber | string | 예 | - | 평문 계좌번호, 암호화하여 저장 |
| accountHolder | string(100) | 예 | partner_account.account_holder | 예금주 |
| useStatus | string(10) [사용\|미사용] | 아니오 | partner_account.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerAccountId | integer int64 | partner_account.partner_account_id | 거래처 계좌 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PARTNER_NOT_FOUND | 거래처가 없음 |
| 409 | PARTNER_ACCOUNT_DUPLICATED | 동일 거래처에 동일 계좌가 있음 |

#### PATCH /partner-accounts/{partnerAccountId} — 거래처 계좌를 수정하거나 사용 여부를 변경한다 (`updatePartnerAccount`)

- 권한: 예산·회계 담당자 · 경로 변수: partnerAccountId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| bankName | string(100) | 아니오 | partner_account.bank_name | 은행 |
| accountNumber | string | 아니오 | - | 평문 계좌번호, 암호화하여 저장 |
| accountHolder | string(100) | 아니오 | partner_account.account_holder | 예금주 |
| useStatus | string(10) [사용\|미사용] | 아니오 | partner_account.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerAccountId | integer int64 | partner_account.partner_account_id | 거래처 계좌 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PARTNER_ACCOUNT_NOT_FOUND | 계좌가 없음 |
| 409 | PARTNER_ACCOUNT_DUPLICATED | 동일 거래처에 동일 계좌가 있음 |

#### DELETE /partner-accounts/{partnerAccountId} — 거래처 계좌를 삭제한다 (`deletePartnerAccount`)

- 권한: 예산·회계 담당자 · 경로 변수: partnerAccountId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PARTNER_ACCOUNT_NOT_FOUND | 계좌가 없음 |

### FN-SFR-002-06 신용카드 등록·관리

- 요구사항: SFR-002-06 · 테이블: credit_card, credit_card_permission

#### GET /credit-cards — 조회 권한이 있는 신용카드 목록을 조회한다 (`listCreditCards`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| cardType | string(20) [법인\|개인\|사업용] | 아니오 | credit_card.card_type | 카드 유형 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| creditCardId | integer int64 | credit_card.credit_card_id | 신용카드 ID |
| cardType | string(20) [법인\|개인\|사업용] | credit_card.card_type | 카드 유형 |
| cardNumberLast4 | string(4) | credit_card.card_number_last4 | 카드번호 끝 4자리 |
| cardName | string(100) | credit_card.card_name | 카드명 |
| issuerName | string(100) | credit_card.issuer_name | 카드사명 |
| expiryDate | string date | credit_card.expiry_date | 유효기간 만료일 |

오류: 공통 오류만 (1절)

#### POST /credit-cards — 신용카드를 등록한다 (`createCreditCard`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| cardType | string(20) [법인\|개인\|사업용] | 예 | credit_card.card_type | 카드 유형 |
| cardNumber | string | 예 | - | 평문 카드번호, 암호화하여 저장 |
| cardName | string(100) | 아니오 | credit_card.card_name | 카드명 |
| issuerName | string(100) | 아니오 | credit_card.issuer_name | 카드사명 |
| expiryDate | string date | 아니오 | credit_card.expiry_date | 유효기간 만료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| creditCardId | integer int64 | credit_card.credit_card_id | 신용카드 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | CREDIT_CARD_DUPLICATED | 카드번호가 중복됨 |

#### GET /credit-card-permissions — 카드 조회 권한 현황을 조회한다 (`listCreditCardPermissions`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| creditCardId | integer int64 | 예 | credit_card_permission.credit_card_id | 신용카드 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| creditCardPermissionId | integer int64 | credit_card_permission.credit_card_permission_id | 신용카드 조회 권한 ID |
| creditCardId | integer int64 | credit_card_permission.credit_card_id | 신용카드 |
| employeeId | integer int64 | credit_card_permission.employee_id | 임직원 |

오류: 공통 오류만 (1절)

#### POST /credit-card-permissions — 카드 조회 권한 대상을 설정한다 (`createCreditCardPermission`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| creditCardId | integer int64 | 예 | credit_card_permission.credit_card_id | 신용카드 |
| employeeId | integer int64 | 예 | credit_card_permission.employee_id | 임직원 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| creditCardPermissionId | integer int64 | credit_card_permission.credit_card_permission_id | 신용카드 조회 권한 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | CREDIT_CARD_NOT_FOUND | 카드가 없음 |
| 409 | CREDIT_CARD_PERMISSION_DUPLICATED | 이미 권한이 설정됨 |

#### DELETE /credit-card-permissions/{creditCardPermissionId} — 카드 조회 권한을 삭제한다 (`deleteCreditCardPermission`)

- 권한: 예산·회계 담당자 · 경로 변수: creditCardPermissionId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | CREDIT_CARD_PERMISSION_NOT_FOUND | 권한 설정이 없음 |

### FN-SFR-002-07 기준정보 환경설정

- 요구사항: SFR-002-07 · 테이블: department, project, system_setting

#### GET /system-settings — 기준정보 환경설정 값을 조회한다 (`listSystemSettings`)

- 권한: 예산·회계 담당자, 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| category | string(50) | 아니오 | system_setting.category | 설정 분류 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| systemSettingId | integer int64 | system_setting.system_setting_id | 환경설정 ID |
| category | string(50) | system_setting.category | 설정 분류 |
| settingKey | string(100) | system_setting.setting_key | 설정 키 |
| settingName | string(200) | system_setting.setting_name | 설정 항목명 |
| settingValue | string(1000) | system_setting.setting_value | 설정 값 |

오류: 공통 오류만 (1절)

#### PATCH /system-settings/{systemSettingId} — 환경설정 값을 변경한다 (`updateSystemSetting`)

- 권한: 예산·회계 담당자, 시스템 관리자 · 경로 변수: systemSettingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| settingValue | string(1000) | 예 | system_setting.setting_value | 설정 값 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| systemSettingId | integer int64 | system_setting.system_setting_id | 환경설정 ID |
| settingValue | string(1000) | system_setting.setting_value | 설정 값 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SYSTEM_SETTING_NOT_FOUND | 설정 항목이 없음 |
| 422 | INVALID_SETTING_VALUE | 허용되지 않은 값을 선택함 |

### FN-SFR-003-01 본예산 신청

- 요구사항: SFR-003-01 · 테이블: budget_main

#### GET /budget-mains — 본예산 편성 대상 목록 조회 (`listBudgetMains`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| accountingUnit | string(50) | 아니오 | budget_main.accounting_unit | 회계단위 |
| fiscalYear | integer int32 | 아니오 | budget_main.fiscal_year | 기수(회계연도) |
| projectId | integer int64 | 아니오 | budget_main.project_id | 프로젝트 |
| budgetGroup | string(100) | 아니오 | budget_main.budget_group | 예산그룹 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetMainId | integer int64 | budget_main.budget_main_id | 본예산 ID |
| accountingUnit | string(50) | budget_main.accounting_unit | 회계단위 |
| fiscalYear | integer int32 | budget_main.fiscal_year | 기수(회계연도) |
| projectId | integer int64 | budget_main.project_id | 프로젝트 |
| budgetAccountId | integer int64 | budget_main.budget_account_id | 예산과목 |
| budgetGroup | string(100) | budget_main.budget_group | 예산그룹 |
| requestedAmount | number | budget_main.requested_amount | 신청금액 |
| requestedDate | string date | budget_main.requested_date | 신청일 |
| requesterId | integer int64 | budget_main.requester_id | 신청자 |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_main.approval_status | 승인 처리 상태 |

오류: 공통 오류만 (1절)

#### POST /budget-mains — 예산과목별 본예산 신청정보 저장 (`createBudgetMain`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| accountingUnit | string(50) | 예 | budget_main.accounting_unit | 회계단위 |
| fiscalYear | integer int32 | 예 | budget_main.fiscal_year | 기수(회계연도) |
| projectId | integer int64 | 예 | budget_main.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | budget_main.budget_account_id | 예산과목 |
| budgetGroup | string(100) | 아니오 | budget_main.budget_group | 예산그룹 |
| requestedAmount | number | 예 | budget_main.requested_amount | 신청금액 |
| requestedDate | string date | 예 | budget_main.requested_date | 신청일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetMainId | integer int64 | budget_main.budget_main_id | 본예산 ID |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_main.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | BUDGET_MAIN_REQUIRED_VALUE_MISSING | 금액, 신청일 등 필수 입력값이 누락된 경우 |

### FN-SFR-003-02 본예산 마감·승인 처리

- 요구사항: SFR-003-02 · 테이블: budget_main

#### POST /budget-mains/{budgetMainId}/close — 본예산 마감 처리 (`closeBudgetMain`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetMainId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_main.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_MAIN_NOT_FOUND | 본예산이 없는 경우 |
| 409 | BUDGET_MAIN_STATUS_CONFLICT | 신청 상태가 아닌 본예산을 마감하려는 경우 |

#### POST /budget-mains/{budgetMainId}/cancel-close — 본예산 마감 취소 (`cancelCloseBudgetMain`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetMainId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_main.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_MAIN_NOT_FOUND | 본예산이 없는 경우 |
| 409 | BUDGET_MAIN_STATUS_CONFLICT | 마감 상태가 아닌 본예산을 마감 취소하려는 경우 |

#### POST /budget-mains/{budgetMainId}/approve — 본예산 승인 처리 (`approveBudgetMain`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetMainId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_main.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_MAIN_NOT_FOUND | 본예산이 없는 경우 |
| 409 | BUDGET_MAIN_STATUS_CONFLICT | 마감 상태가 아닌 본예산을 승인하려는 경우 |

#### POST /budget-mains/{budgetMainId}/cancel-approval — 본예산 승인 취소 (`cancelApprovalBudgetMain`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetMainId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_main.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_MAIN_NOT_FOUND | 본예산이 없는 경우 |
| 409 | BUDGET_MAIN_STATUS_CONFLICT | 승인 상태가 아닌 본예산을 승인 취소하려는 경우 |

### FN-SFR-003-03 실행예산 편성·신청 및 마감 처리

- 요구사항: SFR-003-03 · 테이블: budget_execution

#### GET /budget-executions — 실행예산 신청 대상 목록 조회 (`listBudgetExecutions`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| accountingUnit | string(50) | 아니오 | budget_main.accounting_unit | 회계단위 |
| fiscalYear | integer int32 | 아니오 | budget_main.fiscal_year | 기수(회계연도) |
| budgetGroup | string(100) | 아니오 | budget_main.budget_group | 예산그룹 |
| budgetAccountId | integer int64 | 아니오 | budget_main.budget_account_id | 예산과목 |
| projectId | integer int64 | 아니오 | budget_main.project_id | 프로젝트 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetExecutionId | integer int64 | budget_execution.budget_execution_id | 실행예산 ID |
| budgetMainId | integer int64 | budget_execution.budget_main_id | 본예산 |
| executionMonth | integer int32 | budget_execution.execution_month | 편성월 |
| executionAmount | number | budget_execution.execution_amount | 실행예산 금액 |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_execution.approval_status | 승인 처리 상태 |

오류: 공통 오류만 (1절)

#### POST /budget-executions — 월별 실행예산 편성·신청 (`createBudgetExecution`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| budgetMainId | integer int64 | 예 | budget_execution.budget_main_id | 본예산 |
| executionMonth | integer int32 | 예 | budget_execution.execution_month | 편성월 |
| executionAmount | number | 예 | budget_execution.execution_amount | 실행예산 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetExecutionId | integer int64 | budget_execution.budget_execution_id | 실행예산 ID |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_execution.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_MAIN_NOT_FOUND | 기반 본예산이 없는 경우 |
| 409 | BUDGET_MAIN_NOT_APPROVED | 승인된 본예산이 아닌 경우 |
| 422 | EXECUTION_AMOUNT_EXCEEDS_BUDGET | 월별 금액이 본예산 범위를 초과한 경우 |

#### POST /budget-executions/{budgetExecutionId}/close — 실행예산 마감 (`closeBudgetExecution`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetExecutionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_execution.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_EXECUTION_NOT_FOUND | 실행예산이 없는 경우 |
| 409 | BUDGET_EXECUTION_STATUS_CONFLICT | 상태가 처리 조건과 맞지 않는 경우 |

#### POST /budget-executions/{budgetExecutionId}/cancel-close — 실행예산 마감 취소 (`cancelCloseBudgetExecution`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetExecutionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_execution.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_EXECUTION_NOT_FOUND | 실행예산이 없는 경우 |
| 409 | BUDGET_EXECUTION_STATUS_CONFLICT | 상태가 처리 조건과 맞지 않는 경우 |

#### POST /budget-executions/{budgetExecutionId}/approve — 실행예산 승인 (`approveBudgetExecution`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetExecutionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_execution.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_EXECUTION_NOT_FOUND | 실행예산이 없는 경우 |
| 409 | BUDGET_EXECUTION_STATUS_CONFLICT | 상태가 처리 조건과 맞지 않는 경우 |

#### POST /budget-executions/{budgetExecutionId}/cancel-approval — 실행예산 승인 취소 (`cancelApprovalBudgetExecution`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetExecutionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_execution.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_EXECUTION_NOT_FOUND | 실행예산이 없는 경우 |
| 409 | BUDGET_EXECUTION_STATUS_CONFLICT | 상태가 처리 조건과 맞지 않는 경우 |

### FN-SFR-003-05 예산조정 신청 및 마감

- 요구사항: SFR-003-04 · 테이블: budget_adjustment

#### GET /budget-accounts/execution-status — 예산과목별 집행액·잔액 조회 (`listBudgetAccountExecutionStatus`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer | 아니오 | - | 프로젝트 조건 |
| budgetAccountId | integer | 아니오 | - | 예산과목 조건 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetAccountId | integer int64 | budget_account.budget_account_id | 예산과목 ID |
| executedAmount | number | - | 예산과목별 집행액 |
| remainingAmount | number | - | 예산과목별 예산잔액 |

오류: 공통 오류만 (1절)

#### POST /budget-adjustments — 예산조정 신청 (`createBudgetAdjustment`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| adjustmentType | string(20) [추경예산\|전용\|이용\|예비비] | 예 | budget_adjustment.adjustment_type | 예산 조정 구분 |
| budgetAccountId | integer int64 | 예 | budget_adjustment.budget_account_id | 예산과목(출처) |
| targetBudgetAccountId | integer int64 | 아니오 | budget_adjustment.target_budget_account_id | 상대 예산과목 |
| adjustmentAmount | number | 예 | budget_adjustment.adjustment_amount | 조정 금액 |
| projectId | integer int64 | 예 | budget_adjustment.project_id | 프로젝트 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetAdjustmentId | integer int64 | budget_adjustment.budget_adjustment_id | 예산조정 ID |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_adjustment.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | BUDGET_ADJUSTMENT_REQUIRED_VALUE_MISSING | 조정 구분 또는 금액이 누락된 경우 |
| 422 | BUDGET_BALANCE_INSUFFICIENT | 전용·이용 시 대상 예산과목 잔액이 부족한 경우 |

#### POST /budget-adjustments/{budgetAdjustmentId}/close — 예산조정 마감 (`closeBudgetAdjustment`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetAdjustmentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | budget_adjustment.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_ADJUSTMENT_NOT_FOUND | 예산조정이 없는 경우 |
| 409 | BUDGET_ADJUSTMENT_STATUS_CONFLICT | 신청 상태가 아닌 예산조정을 마감하려는 경우 |

### FN-SFR-003-06 예산 폐쇄기간 및 이월 관리

- 요구사항: SFR-003-05 · 테이블: project, budget_account, budget_adjustment, expense_resolution, budget_closing_period, budget_carryover

#### GET /budget-closing-periods — 폐쇄기간 조회 (`listBudgetClosingPeriods`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| closingType | string(20) [결의서\|출납] | 아니오 | budget_closing_period.closing_type | 폐쇄 구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetClosingPeriodId | integer int64 | budget_closing_period.budget_closing_period_id | 예산 폐쇄기간 ID |
| closingType | string(20) [결의서\|출납] | budget_closing_period.closing_type | 폐쇄 구분 |
| startDate | string date | budget_closing_period.start_date | 시작일 |
| endDate | string date | budget_closing_period.end_date | 종료일 |

오류: 공통 오류만 (1절)

#### POST /budget-closing-periods — 결의서·출납 폐쇄기간 설정 (`createBudgetClosingPeriod`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| closingType | string(20) [결의서\|출납] | 예 | budget_closing_period.closing_type | 폐쇄 구분 |
| startDate | string date | 예 | budget_closing_period.start_date | 시작일 |
| endDate | string date | 예 | budget_closing_period.end_date | 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetClosingPeriodId | integer int64 | budget_closing_period.budget_closing_period_id | 예산 폐쇄기간 ID |
| closingType | string(20) [결의서\|출납] | budget_closing_period.closing_type | 폐쇄 구분 |
| startDate | string date | budget_closing_period.start_date | 시작일 |
| endDate | string date | budget_closing_period.end_date | 종료일 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | CLOSING_PERIOD_INVALID_RANGE | 종료일이 시작일보다 빠른 경우 |

#### GET /budget-carryovers — 이월 내역 조회 (`listBudgetCarryovers`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 아니오 | budget_carryover.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 아니오 | budget_carryover.budget_account_id | 예산과목 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetCarryoverId | integer int64 | budget_carryover.budget_carryover_id | 예산 이월 ID |
| projectId | integer int64 | budget_carryover.project_id | 프로젝트 |
| budgetAccountId | integer int64 | budget_carryover.budget_account_id | 예산과목 |
| carryoverAmount | number | budget_carryover.carryover_amount | 이월 대상 금액 |
| isInitialCarryover | boolean | budget_carryover.is_initial_carryover | 초기 이월 여부 |

오류: 공통 오류만 (1절)

#### POST /budget-carryovers — 이월 대상 금액·초기 이월 등록 (`createBudgetCarryover`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 예 | budget_carryover.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | budget_carryover.budget_account_id | 예산과목 |
| carryoverAmount | number | 예 | budget_carryover.carryover_amount | 이월 대상 금액 |
| isInitialCarryover | boolean | 예 | budget_carryover.is_initial_carryover | 초기 이월 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetCarryoverId | integer int64 | budget_carryover.budget_carryover_id | 예산 이월 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PROJECT_OR_BUDGET_ACCOUNT_NOT_FOUND | 프로젝트 또는 예산과목이 등록되어 있지 않은 경우 |

#### PATCH /budget-carryovers/{budgetCarryoverId} — 이월 내역 수정 (`updateBudgetCarryover`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetCarryoverId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| carryoverAmount | number | 아니오 | budget_carryover.carryover_amount | 이월 대상 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetCarryoverId | integer int64 | budget_carryover.budget_carryover_id | 예산 이월 ID |
| carryoverAmount | number | budget_carryover.carryover_amount | 이월 대상 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_CARRYOVER_NOT_FOUND | 이월 내역이 없는 경우 |
| 409 | CLOSED_PERIOD_DATA_LOCKED | 마감된 기간의 데이터를 마감 취소 전에 수정하려는 경우 |

### FN-SFR-004-01 품의서 입력 및 승인

- 요구사항: SFR-004-01, SFR-004-03 · 테이블: requisition

#### GET /budget-accounts/execution-status — 예산과목별 예산현황 조회 (`listBudgetAccountExecutionStatus`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /requisitions — 품의서 저장 (`createRequisition`)

- 권한: 임직원, 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 예 | requisition.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | requisition.budget_account_id | 예산과목 |
| requisitionType | string(20) [지출\|구매] | 예 | requisition.requisition_type | 품의 유형 |
| title | string(200) | 예 | requisition.title | 품의 제목 |
| content | string | 아니오 | requisition.content | 품의 내용 |
| requisitionAmount | number | 예 | requisition.requisition_amount | 품의 금액 |
| attachment | string | 아니오 | - | 첨부파일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| requisitionId | integer int64 | requisition.requisition_id | 품의서 ID |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | requisition.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUISITION_REQUIRED_VALUE_MISSING | 필수 입력값이 누락된 경우 |
| 422 | REQUISITION_AMOUNT_EXCEEDS_BALANCE | 품의 금액이 예산잔액을 초과하고 예산 통제 설정이 차단인 경우 |

#### GET /requisitions/{requisitionId} — 품의서 및 승인 상태 조회 (`getRequisition`)

- 권한: 임직원, 예산·회계 담당자 · 경로 변수: requisitionId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| requisitionId | integer int64 | requisition.requisition_id | 품의서 ID |
| projectId | integer int64 | requisition.project_id | 프로젝트 |
| budgetAccountId | integer int64 | requisition.budget_account_id | 예산과목 |
| title | string(200) | requisition.title | 품의 제목 |
| content | string | requisition.content | 품의 내용 |
| requisitionAmount | number | requisition.requisition_amount | 품의 금액 |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | requisition.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | REQUISITION_NOT_FOUND | 품의서가 없는 경우 |

### FN-SFR-004-02 결의서 입력 및 승인

- 요구사항: SFR-004-02, SFR-004-03 · 테이블: expense_resolution

#### POST /expense-resolutions — 결의서를 입력하고 저장한다 (`createExpenseResolution`)

- 권한: 임직원, 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| requisitionId | integer int64 | 아니오 | expense_resolution.requisition_id | 품의서 |
| projectId | integer int64 | 예 | expense_resolution.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | expense_resolution.budget_account_id | 예산과목 |
| partnerId | integer int64 | 예 | expense_resolution.partner_id | 거래처 |
| departmentId | integer int64 | 예 | expense_resolution.department_id | 결의부서 |
| resolutionMethod | string(20) [카드사용내역\|세금계산서\|통장거래내역\|직접입력] | 예 | expense_resolution.resolution_method | 결의 방식 |
| resolutionAmount | number | 예 | expense_resolution.resolution_amount | 결의 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| expenseResolutionId | integer int64 | expense_resolution.expense_resolution_id | 결의서 ID |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | expense_resolution.status | 진행 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수값이 누락된 경우 |
| 422 | BUDGET_BALANCE_EXCEEDED | 결의 금액이 예산잔액을 초과하고 예산 통제 설정이 차단인 경우 |
| 409 | PERIOD_CLOSED | 마감된 기간의 데이터인 경우 |

#### PUT /expense-resolutions/{expenseResolutionId} — 결의서를 수정한다 (`updateExpenseResolution`)

- 권한: 임직원, 예산·회계 담당자 · 경로 변수: expenseResolutionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| requisitionId | integer int64 | 아니오 | expense_resolution.requisition_id | 품의서 |
| projectId | integer int64 | 예 | expense_resolution.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | expense_resolution.budget_account_id | 예산과목 |
| partnerId | integer int64 | 예 | expense_resolution.partner_id | 거래처 |
| departmentId | integer int64 | 예 | expense_resolution.department_id | 결의부서 |
| resolutionMethod | string(20) [카드사용내역\|세금계산서\|통장거래내역\|직접입력] | 예 | expense_resolution.resolution_method | 결의 방식 |
| resolutionAmount | number | 예 | expense_resolution.resolution_amount | 결의 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| expenseResolutionId | integer int64 | expense_resolution.expense_resolution_id | 결의서 ID |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | expense_resolution.status | 진행 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EXPENSE_RESOLUTION_NOT_FOUND | 결의서가 없는 경우 |
| 409 | EXPENSE_RESOLUTION_APPROVED | 승인된 결의서를 임의 수정하려는 경우 |
| 409 | PERIOD_CLOSED | 마감된 기간의 데이터인 경우 |
| 422 | BUDGET_BALANCE_EXCEEDED | 결의 금액이 예산잔액을 초과하고 예산 통제 설정이 차단인 경우 |

#### GET /budget-statuses — 예산과목별 예산현황을 조회한다 (`listBudgetStatuses`)

- 권한: 임직원, 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| budgetAccountId | integer int64 | 아니오 | expense_resolution.budget_account_id | 예산과목 |
| projectId | integer int64 | 아니오 | expense_resolution.project_id | 프로젝트 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetAccountId | integer int64 | expense_resolution.budget_account_id | 예산과목 |
| executionBudgetAmount | number | - |  |
| carryoverBudgetAmount | number | - |  |
| totalBudgetAmount | number | - |  |
| executedAmount | number | - |  |
| budgetBalance | number | - |  |

오류: 공통 오류만 (1절)

### FN-SFR-004-03 품의·결의 정보 조회 및 승인 처리

- 요구사항: SFR-004-04 · 테이블: approval_document, requisition, expense_resolution, change_history

#### GET /approval-items — 권한 범위 내 품의·결의 목록을 조회한다 (`listApprovalItems`)

- 권한: 예산·회계 담당자, 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fromDate | string | 아니오 | - | 조회 시작일 |
| toDate | string | 아니오 | - | 조회 종료일 |
| projectId | integer int64 | 아니오 | expense_resolution.project_id | 프로젝트 |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | 아니오 | expense_resolution.status | 진행 상태 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| expenseResolutionId | integer int64 | expense_resolution.expense_resolution_id | 결의서 ID |
| requisitionId | integer int64 | requisition.requisition_id | 품의서 ID |
| projectId | integer int64 | expense_resolution.project_id | 프로젝트 |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | expense_resolution.status | 진행 상태 |

오류: 공통 오류만 (1절)

#### POST /expense-resolutions/{expenseResolutionId}/approve — 결의서를 승인 처리한다 (`approveExpenseResolution`)

- 권한: 예산·회계 담당자, 임직원 · 경로 변수: expenseResolutionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | expense_resolution.status | 진행 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EXPENSE_RESOLUTION_NOT_FOUND | 결의서가 없는 경우 |
| 409 | APPROVAL_NOT_ALLOWED_STATUS | 승인 불가 상태인 경우 |

#### POST /requisitions/{requisitionId}/approve — 품의서를 승인 처리한다 (`approveRequisition`)

- 권한: 예산·회계 담당자, 임직원 · 경로 변수: requisitionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | requisition.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | REQUISITION_NOT_FOUND | 품의서가 없는 경우 |
| 409 | APPROVAL_NOT_ALLOWED_STATUS | 승인 불가 상태인 경우 |

### FN-SFR-004-04 원인행위 등록 및 관리

- 요구사항: SFR-004-05 · 테이블: project, budget_account, partner, budget_commitment

#### POST /budget-commitments — 원인행위를 등록한다 (`createBudgetCommitment`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(200) | 예 | budget_commitment.name | 원인행위 명칭 |
| projectId | integer int64 | 예 | budget_commitment.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | budget_commitment.budget_account_id | 예산과목 |
| partnerId | integer int64 | 아니오 | budget_commitment.partner_id | 거래처 |
| amount | number | 예 | budget_commitment.amount | 원인행위 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetCommitmentId | integer int64 | budget_commitment.budget_commitment_id | 원인행위 ID |
| approvalStatus | string(20) [신청\|승인\|승인 취소\|반려] | budget_commitment.approval_status | 승인 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | BUDGET_BALANCE_EXCEEDED | 예산잔액이 부족하고 예산 통제 설정이 차단인 경우 |

#### GET /budget-commitments — 원인행위 목록을 조회한다 (`listBudgetCommitments`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 아니오 | budget_commitment.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 아니오 | budget_commitment.budget_account_id | 예산과목 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetCommitmentId | integer int64 | budget_commitment.budget_commitment_id | 원인행위 ID |
| name | string(200) | budget_commitment.name | 원인행위 명칭 |
| projectId | integer int64 | budget_commitment.project_id | 프로젝트 |
| budgetAccountId | integer int64 | budget_commitment.budget_account_id | 예산과목 |
| partnerId | integer int64 | budget_commitment.partner_id | 거래처 |
| amount | number | budget_commitment.amount | 원인행위 금액 |
| approvalStatus | string(20) [신청\|승인\|승인 취소\|반려] | budget_commitment.approval_status | 승인 상태 |

오류: 공통 오류만 (1절)

#### PUT /budget-commitments/{budgetCommitmentId} — 원인행위를 수정한다 (`updateBudgetCommitment`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetCommitmentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(200) | 예 | budget_commitment.name | 원인행위 명칭 |
| projectId | integer int64 | 예 | budget_commitment.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | budget_commitment.budget_account_id | 예산과목 |
| partnerId | integer int64 | 아니오 | budget_commitment.partner_id | 거래처 |
| amount | number | 예 | budget_commitment.amount | 원인행위 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| budgetCommitmentId | integer int64 | budget_commitment.budget_commitment_id | 원인행위 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_COMMITMENT_NOT_FOUND | 원인행위가 없는 경우 |
| 409 | BUDGET_COMMITMENT_APPROVED | 승인·확정된 원인행위를 임의 수정하려는 경우 |
| 422 | BUDGET_BALANCE_EXCEEDED | 예산잔액이 부족하고 예산 통제 설정이 차단인 경우 |

#### POST /budget-commitments/{budgetCommitmentId}/cancel — 원인행위를 취소한다 (`cancelBudgetCommitment`)

- 권한: 예산·회계 담당자 · 경로 변수: budgetCommitmentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|승인\|승인 취소\|반려] | budget_commitment.approval_status | 승인 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_COMMITMENT_NOT_FOUND | 원인행위가 없는 경우 |
| 409 | BUDGET_COMMITMENT_NOT_CANCELABLE | 취소할 수 없는 상태인 경우 |

### FN-SFR-004-05 자금집행 정보 및 전표 관리

- 요구사항: SFR-004-06 · 테이블: journal_entry

#### POST /journal-entries — 승인된 결의내역으로 분개를 생성하고 전표를 생성한다 (`createJournalEntry`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| expenseResolutionId | integer int64 | 예 | journal_entry.expense_resolution_id | 결의서 ID |
| accountSubjectId | integer | 예 | - | 분개에 사용할 계정과목 ID |
| summary | string(500) | 아니오 | journal_entry.summary | 적요 |
| evidenceDetail | string(1000) | 아니오 | journal_entry.evidence_detail | 증빙내역 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalEntryId | integer int64 | journal_entry.journal_entry_id | 전표 ID |
| status | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | journal_entry.status | 전표 상태 |
| totalDebitAmount | number | journal_entry.total_debit_amount | 차변 합계 |
| totalCreditAmount | number | journal_entry.total_credit_amount | 대변 합계 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EXPENSE_RESOLUTION_NOT_FOUND | 결의서가 없는 경우 |
| 409 | EXPENSE_RESOLUTION_NOT_APPROVED | 미승인 결의서인 경우 |
| 409 | PERIOD_CLOSED | 마감된 기간인 경우 |

#### GET /journal-entries — 전표 목록과 분개정보를 조회한다 (`listJournalEntries`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| expenseResolutionId | integer int64 | 아니오 | journal_entry.expense_resolution_id | 결의서 ID |
| status | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | 아니오 | journal_entry.status | 전표 상태 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalEntryId | integer int64 | journal_entry.journal_entry_id | 전표 ID |
| expenseResolutionId | integer int64 | journal_entry.expense_resolution_id | 결의서 ID |
| entryDate | string date | journal_entry.entry_date | 전표 일자 |
| status | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | journal_entry.status | 전표 상태 |
| totalDebitAmount | number | journal_entry.total_debit_amount | 차변 합계 |
| totalCreditAmount | number | journal_entry.total_credit_amount | 대변 합계 |
| summary | string(500) | journal_entry.summary | 적요 |
| evidenceDetail | string(1000) | journal_entry.evidence_detail | 증빙내역 |

오류: 공통 오류만 (1절)

#### POST /journal-entries/{journalEntryId}/cancel — 전표를 취소한다 (`cancelJournalEntry`)

- 권한: 예산·회계 담당자 · 경로 변수: journalEntryId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | journal_entry.status | 전표 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | JOURNAL_ENTRY_NOT_FOUND | 전표가 없는 경우 |
| 409 | PERIOD_CLOSED | 마감된 기간 전표인 경우 |

### FN-SFR-004-06 수입·지출 등록 및 조회

- 요구사항: SFR-004-07 · 테이블: employee, department, project, budget_account, partner, expense_resolution

#### POST /expense-resolutions — 수입·지출 거래를 등록한다 (`createExpenseResolution`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /expense-resolutions — 수입·지출 목록을 조건별로 조회한다 (`listExpenseResolutions`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| incomeExpenseType | string | 아니오 | - | 거래 유형(수입 또는 지출) |
| projectId | integer int64 | 아니오 | expense_resolution.project_id | 프로젝트 |
| departmentId | integer int64 | 아니오 | expense_resolution.department_id | 결의부서 |
| drafterId | integer | 아니오 | - | 작성자 ID |
| budgetAccountId | integer int64 | 아니오 | expense_resolution.budget_account_id | 예산과목 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| expenseResolutionId | integer int64 | expense_resolution.expense_resolution_id | 결의서 ID |
| projectId | integer int64 | expense_resolution.project_id | 프로젝트 |
| budgetAccountId | integer int64 | expense_resolution.budget_account_id | 예산과목 |
| departmentId | integer int64 | expense_resolution.department_id | 결의부서 |
| resolutionAmount | number | expense_resolution.resolution_amount | 결의 금액 |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | expense_resolution.status | 진행 상태 |

오류: 공통 오류만 (1절)

#### POST /expense-resolutions/bulk-import — 지출내역 엑셀 파일을 일괄 등록한다 (`bulkImportExpenseResolutions`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| file | string | 예 | - | 지출내역 엑셀 파일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| successCount | integer | - | 등록 건수 |
| errors | array | - | 오류 건과 사유 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_EXCEL_FORMAT | 양식 형식이 맞지 않는 경우 |

### FN-SFR-004-07 은행계좌 대체 및 대체결의 처리

- 요구사항: SFR-004-08 · 테이블: partner_account, account_transfer_resolution

#### GET /partner-accounts — 거래처 계좌 목록을 조회한다 (`listPartnerAccounts`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /account-transfer-resolutions — 계좌 대체를 등록하고 대체결의를 처리한다 (`createAccountTransferResolution`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| expenseResolutionId | integer int64 | 예 | account_transfer_resolution.expense_resolution_id | 원 결의서 |
| partnerAccountId | integer int64 | 예 | account_transfer_resolution.partner_account_id | 대체 거래처 계좌 |
| transferReason | string | 예 | account_transfer_resolution.transfer_reason | 대체 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountTransferResolutionId | integer int64 | account_transfer_resolution.account_transfer_resolution_id | 계좌 대체결의 ID |
| processedAt | string date-time | account_transfer_resolution.processed_at | 처리일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EXPENSE_RESOLUTION_NOT_FOUND | 원 결의서가 없는 경우 |
| 404 | PARTNER_ACCOUNT_NOT_FOUND | 대체 계좌가 없는 경우 |
| 422 | TRANSFER_REASON_REQUIRED | 대체 사유가 누락된 경우 |
| 409 | PERIOD_CLOSED | 마감된 기간 건인 경우 |

### FN-SFR-005-01 예산장부 조회

- 요구사항: SFR-005-01 · 테이블: menu_permission, project, budget_account, partner, partner_account, budget_execution, expense_resolution, journal_entry, journal_entry_line

#### GET /budget-ledgers — 예산장부(일계표·월계표·수입지출부·자금출납장 등)를 조회한다 (`listBudgetLedgers`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| ledgerType | string | 예 | - | 예산일계표, 월계표, 수입·지출부, 자금출납장, 은행이체명세서, 지출원인행위부, 수입징수부, 세출·세입총괄표 중 선택 |
| fromDate | string | 예 | - | 조회 시작일 |
| toDate | string | 예 | - | 조회 종료일 |
| cashBookScope | string | 아니오 | - | 자금출납장 조회 구분: 전체, 금융기관별, 프로젝트별, 결의 담당자별 |
| partnerId | integer int64 | 아니오 | partner.partner_id | 금융기관별 조회 대상 금융거래처 |
| projectId | integer int64 | 아니오 | project.project_id | 프로젝트별 조회 대상 |
| resolverId | integer | 아니오 | - | 결의 담당자별 조회 대상 담당자 |
| viewForm | string | 아니오 | - | 상세 또는 총괄 (은행이체명세서, 지출원인행위부, 수입징수부) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| entryDate | string date | journal_entry.entry_date | 전표 일자 |
| summary | string(500) | journal_entry.summary | 적요 |
| debitAmount | number | journal_entry_line.debit_amount | 차변 금액 |
| creditAmount | number | journal_entry_line.credit_amount | 대변 금액 |
| resolutionAmount | number | expense_resolution.resolution_amount | 결의 금액 |
| totalAmount | number | - | 총괄 조회 시 집계된 합계 금액 |

오류: 공통 오류만 (1절)

### FN-SFR-005-02 결의서 현황 및 예실 조회

- 요구사항: SFR-005-02 · 테이블: menu_permission, project, budget_account, budget_main, budget_execution, budget_adjustment, requisition, expense_resolution, journal_entry, budget_commitment

#### GET /budget-status — 결의서 현황, 예실 대비, 예산과목 원장, 자금예산서 등을 조회한다 (`listBudgetStatus`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| statusType | string | 예 | - | 품의서·원인행위·결의서 현황, 지출결의서 현황, 예실 대비 현황, 프로젝트별 예산 구성비, 예산과목 원장, 자금예산서, 추가경정자금예산서, 자금계산서 중 선택 |
| fromDate | string | 예 | - | 조회 시작일 또는 회계연도 시작 |
| toDate | string | 예 | - | 조회 종료일 또는 회계연도 종료 |
| projectId | integer int64 | 아니오 | project.project_id | 프로젝트별 조회 대상 |
| budgetAccountId | integer int64 | 아니오 | budget_account.budget_account_id | 과목별 조회 대상 예산과목 |
| progressStatus | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | 아니오 | expense_resolution.status | 진행상태 검색 조건(전자결재 처리 상태) |
| viewForm | string | 아니오 | - | 예실 대비 현황의 기본 또는 상세 구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| projectId | integer int64 | project.project_id | 프로젝트 ID |
| budgetAccountId | integer int64 | budget_account.budget_account_id | 예산과목 ID |
| requisitionAmount | number | requisition.requisition_amount | 품의 금액 |
| commitmentAmount | number | budget_commitment.amount | 원인행위 금액 |
| resolutionAmount | number | expense_resolution.resolution_amount | 결의 금액 |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | expense_resolution.status | 진행 상태 |
| budgetAmount | number | budget_main.requested_amount | 신청금액 |
| executionAmount | number | budget_execution.execution_amount | 실행예산 금액 |
| adjustmentAmount | number | budget_adjustment.adjustment_amount | 조정 금액 |
| ratio | number | - | 프로젝트 내 예산 항목별 구성 비율 |
| balance | number | - | 예산과목 원장 잔액 |

오류: 공통 오류만 (1절)

### FN-SFR-006-01 계정과목·관련계정·관리항목 관리

- 요구사항: SFR-006-01 · 테이블: account_subject

#### GET /account-subjects — 계정과목 목록을 조회한다 (`listAccountSubjects`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| category | string(10) [자산\|부채\|자본\|수익\|비용] | 아니오 | account_subject.category | 계정 구분 |
| keyword | string | 아니오 | - | 코드 또는 명칭 검색어 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountSubjectId | integer int64 | account_subject.account_subject_id | 계정과목 ID |
| code | string(20) | account_subject.code | 계정과목 코드 |
| name | string(200) | account_subject.name | 계정과목 명칭 |
| category | string(10) [자산\|부채\|자본\|수익\|비용] | account_subject.category | 계정 구분 |
| description | string | account_subject.description | 계정 설명 |
| remark | string | account_subject.remark | 계정 비고 |

오류: 공통 오류만 (1절)

#### POST /account-subjects — 계정과목을 등록한다 (`createAccountSubject`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| category | string(10) [자산\|부채\|자본\|수익\|비용] | 예 | account_subject.category | 계정 구분 |
| code | string(20) | 예 | account_subject.code | 계정과목 코드 |
| name | string(200) | 예 | account_subject.name | 계정과목 명칭 |
| description | string | 아니오 | account_subject.description | 계정 설명 |
| remark | string | 아니오 | account_subject.remark | 계정 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountSubjectId | integer int64 | account_subject.account_subject_id | 계정과목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | ACCOUNT_SUBJECT_CODE_DUPLICATED | 이미 존재하는 계정과목 코드로 등록한 경우 |

#### PUT /account-subjects/{accountSubjectId} — 계정과목을 수정한다 (`updateAccountSubject`)

- 권한: 예산·회계 담당자 · 경로 변수: accountSubjectId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| category | string(10) [자산\|부채\|자본\|수익\|비용] | 예 | account_subject.category | 계정 구분 |
| code | string(20) | 예 | account_subject.code | 계정과목 코드 |
| name | string(200) | 예 | account_subject.name | 계정과목 명칭 |
| description | string | 아니오 | account_subject.description | 계정 설명 |
| remark | string | 아니오 | account_subject.remark | 계정 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountSubjectId | integer int64 | account_subject.account_subject_id | 계정과목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ACCOUNT_SUBJECT_NOT_FOUND | 대상 계정과목이 없는 경우 |
| 409 | ACCOUNT_SUBJECT_CODE_DUPLICATED | 이미 존재하는 계정과목 코드로 수정한 경우 |

### FN-SFR-006-03 거래처·계좌·카드·프로젝트 기준정보 관리

- 요구사항: SFR-006-03 · 테이블: project, partner

#### GET /partners — 거래처 목록을 조회한다 (`listPartners`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /partners — 거래처를 등록한다 (`createPartner`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /partners/{partnerId} — 거래처를 수정한다 (`updatePartner2`)

- 권한: 예산·회계 담당자 · 경로 변수: partnerId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| code | string(20) | 예 | partner.code | 거래처 코드 |
| partnerType | string(10) [일반\|금융] | 예 | partner.partner_type | 거래처 유형 |
| name | string(200) | 예 | partner.name | 거래처 명칭 |
| businessRegNo | string(10) | 아니오 | partner.business_reg_no | 사업자등록번호 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerId | integer int64 | partner.partner_id | 거래처 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PARTNER_NOT_FOUND | 대상 거래처가 없는 경우 |
| 409 | PARTNER_CODE_DUPLICATED | 동일 코드의 거래처가 이미 존재하는 경우 |

#### GET /partner-accounts — 거래처 계좌 목록을 조회한다 (`listPartnerAccounts`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /partner-accounts — 거래처 계좌를 등록한다 (`createPartnerAccount`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /projects — 프로젝트 목록을 조회한다 (`listProjects`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /projects — 프로젝트를 등록한다 (`createProject`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /projects/{projectId} — 프로젝트를 수정한다 (`updateProject2`)

- 권한: 예산·회계 담당자 · 경로 변수: projectId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectCode | string(50) | 예 | project.project_code | 프로젝트 코드 |
| name | string(200) | 예 | project.name | 프로젝트 명칭 |
| businessCategory | string(20) [고유목적사업\|수익사업\|공통사업] | 예 | project.business_category | 사업구분 |
| projectType | string(20) [공통\|직접사업] | 예 | project.project_type | 프로젝트 유형 |
| startDate | string date | 예 | project.start_date | 시작일 |
| endDate | string date | 예 | project.end_date | 종료일 |
| departmentId | integer int64 | 예 | project.department_id | 주관부서 |
| managerId | integer int64 | 예 | project.manager_id | 담당자 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| projectId | integer int64 | project.project_id | 프로젝트 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PROJECT_NOT_FOUND | 대상 프로젝트가 없는 경우 |
| 409 | PROJECT_CODE_DUPLICATED | 동일 코드의 프로젝트가 이미 존재하는 경우 |

### FN-SFR-006-04 계정별 초기이월 등록 및 마감

- 요구사항: SFR-006-04 · 테이블: account_subject, partner, account_carryover

#### GET /account-carryovers — 계정별 이월내역 목록을 조회한다 (`listAccountCarryovers`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fiscalYear | integer int32 | 예 | account_carryover.fiscal_year | 회계연도 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountCarryoverId | integer int64 | account_carryover.account_carryover_id | 계정별 초기이월 ID |
| fiscalYear | integer int32 | account_carryover.fiscal_year | 회계연도 |
| accountSubjectId | integer int64 | account_carryover.account_subject_id | 계정과목 |
| partnerId | integer int64 | account_carryover.partner_id | 거래처 |
| carryoverAmount | number | account_carryover.carryover_amount | 이월 금액 |
| closingStatus | string(10) [미마감\|마감] | account_carryover.closing_status | 마감 여부 |

오류: 공통 오류만 (1절)

#### POST /account-carryovers — 계정별 이월내역을 등록한다 (`createAccountCarryover`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fiscalYear | integer int32 | 예 | account_carryover.fiscal_year | 회계연도 |
| accountSubjectId | integer int64 | 예 | account_carryover.account_subject_id | 계정과목 |
| partnerId | integer int64 | 아니오 | account_carryover.partner_id | 거래처 |
| carryoverAmount | number | 예 | account_carryover.carryover_amount | 이월 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountCarryoverId | integer int64 | account_carryover.account_carryover_id | 계정별 초기이월 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ACCOUNT_SUBJECT_NOT_FOUND | 미등록 계정과목인 경우 |

#### PUT /account-carryovers/{accountCarryoverId} — 계정별 이월내역을 수정한다 (`updateAccountCarryover`)

- 권한: 예산·회계 담당자 · 경로 변수: accountCarryoverId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| accountSubjectId | integer int64 | 예 | account_carryover.account_subject_id | 계정과목 |
| partnerId | integer int64 | 아니오 | account_carryover.partner_id | 거래처 |
| carryoverAmount | number | 예 | account_carryover.carryover_amount | 이월 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountCarryoverId | integer int64 | account_carryover.account_carryover_id | 계정별 초기이월 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ACCOUNT_CARRYOVER_NOT_FOUND | 대상 이월내역이 없는 경우 |
| 409 | ACCOUNT_CARRYOVER_CLOSED | 마감된 이월내역을 수정하려는 경우 |
| 404 | ACCOUNT_SUBJECT_NOT_FOUND | 미등록 계정과목인 경우 |

#### DELETE /account-carryovers/{accountCarryoverId} — 계정별 이월내역을 삭제한다 (`deleteAccountCarryover`)

- 권한: 예산·회계 담당자 · 경로 변수: accountCarryoverId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ACCOUNT_CARRYOVER_NOT_FOUND | 대상 이월내역이 없는 경우 |
| 409 | ACCOUNT_CARRYOVER_CLOSED | 마감된 이월내역을 삭제하려는 경우 |

#### POST /account-carryovers/{accountCarryoverId}/close — 이월내역을 마감한다 (`closeAccountCarryover`)

- 권한: 예산·회계 담당자 · 경로 변수: accountCarryoverId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| closingStatus | string(10) [미마감\|마감] | account_carryover.closing_status | 마감 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ACCOUNT_CARRYOVER_NOT_FOUND | 대상 이월내역이 없는 경우 |
| 409 | ACCOUNT_CARRYOVER_ALREADY_CLOSED | 이미 마감된 이월내역인 경우 |

#### POST /account-carryovers/{accountCarryoverId}/cancel-close — 이월내역 마감을 취소한다 (`cancelCloseAccountCarryover`)

- 권한: 예산·회계 담당자 · 경로 변수: accountCarryoverId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| closingStatus | string(10) [미마감\|마감] | account_carryover.closing_status | 마감 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ACCOUNT_CARRYOVER_NOT_FOUND | 대상 이월내역이 없는 경우 |
| 409 | ACCOUNT_CARRYOVER_NOT_CLOSED | 마감되지 않은 이월내역인 경우 |

### FN-SFR-006-05 세무회계사무소 연계 자료 변환

- 요구사항: SFR-006-05 · 테이블: account_subject, partner, journal_entry

#### POST /tax-office-conversions — 회계자료를 세무 프로그램 전용 형식으로 변환하여 파일과 결과를 제공한다 (`convertTaxOfficeData`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 변환 대상 기간 시작일 |
| endDate | string | 예 | - | 변환 대상 기간 종료일 |
| dataType | string | 예 | - | 변환 대상 자료 구분 (전표·장부 등) |
| taxProgramFormat | string | 예 | - | 대상 세무 프로그램 형식 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| convertedFile | string | - | 변환된 파일 다운로드 경로 |
| convertedCount | integer | - | 변환 건수 |
| errorReasons | array | - | 변환 오류 사유 목록 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | CONVERSION_TARGET_NOT_FOUND | 변환 대상 기간에 변환할 회계자료가 없는 경우 |
| 422 | CONVERSION_FORMAT_ERROR | 변환 중 형식 오류가 발생한 경우 |
| 502 | TAX_OFFICE_LINK_FAILED | 세무회계사무소 연계에 실패한 경우 |

### FN-SFR-006-06 엑셀 일괄 업로드

- 요구사항: SFR-002-04, SFR-006-03, SFR-006-04, SFR-012-03, SFR-012-06, SFR-019-02, SFR-021-01, SFR-021-04, SFR-025-02, SFR-018-06 · 테이블: menu_permission, partner, attendance_request, payroll, asset, account_carryover, upload_history, change_history, personnel_record, annual_leave

#### POST /excel-uploads — 엑셀 파일로 업무 데이터를 일괄 등록하고 결과를 제공한다 (`uploadExcelData`)

- 권한: 예산·회계 담당자, 인사 담당자, 근태 담당자, 급여 담당자, 자산 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| targetBusiness | string(50) [PARTNER\|PERSONNEL_RECORD\|ANNUAL_LEAVE\|PAYROLL\|ASSET\|ATTENDANCE\|CARRYOVER\|COMMUTE_RECORD\|EDUCATION_ATTENDEE\|DAILY_WORKER_PAYMENT] | 예 | upload_history.target_business | 업로드 대상 업무 |
| file | string | 예 | - | 양식에 맞춰 작성된 엑셀 파일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| uploadHistoryId | integer | - | 업로드 이력 ID |
| totalCount | integer int32 | upload_history.total_count | 전체 건수 |
| successCount | integer int32 | upload_history.success_count | 정상 반영 건수 |
| errorCount | integer int32 | upload_history.error_count | 오류 건수 |
| errorDetail | string | upload_history.error_detail | 오류 내역 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_UPLOAD_FORMAT | 양식 형식이 다르거나 파일을 읽을 수 없는 경우 |
| 409 | PERIOD_CLOSED_OR_APPROVED | 마감된 기간이나 승인된 건에 대한 변경이 포함된 경우 |

### FN-SFR-007-01 자동전표 증빙항목 및 자료수집·자동분개 설정

- 요구사항: SFR-007-01 · 테이블: account_subject, partner, auto_journal_setting

#### GET /auto-journal-settings — 자동전표 증빙설정 목록을 조회한다 (`listAutoJournalSettings`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| evidenceType | string(50) | 아니오 | auto_journal_setting.evidence_type | 증빙유형 |
| useStatus | string(10) [사용\|미사용] | 아니오 | auto_journal_setting.use_status | 사용 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| autoJournalSettingId | integer | - |  |
| evidenceType | string(50) | auto_journal_setting.evidence_type | 증빙유형 |
| evidenceItemName | string(200) | auto_journal_setting.evidence_item_name | 증빙항목명 |
| collectEnabled | boolean | auto_journal_setting.collect_enabled | 자료수집 사용 여부 |
| autoJournalEnabled | boolean | auto_journal_setting.auto_journal_enabled | 자동분개 사용 여부 |
| collectCondition | string(1000) | auto_journal_setting.collect_condition | 자료수집 조건 |
| journalCondition | string(1000) | auto_journal_setting.journal_condition | 자동분개 조건 |
| accountSubjectId | integer int64 | auto_journal_setting.account_subject_id | 분개 계정과목 |
| useStatus | string(10) [사용\|미사용] | auto_journal_setting.use_status | 사용 여부 |

오류: 공통 오류만 (1절)

#### POST /auto-journal-settings — 증빙항목별 자료수집·자동분개 설정을 등록한다 (`createAutoJournalSetting`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| evidenceType | string(50) | 예 | auto_journal_setting.evidence_type | 증빙유형 |
| evidenceItemName | string(200) | 예 | auto_journal_setting.evidence_item_name | 증빙항목명 |
| collectEnabled | boolean | 예 | auto_journal_setting.collect_enabled | 자료수집 사용 여부 |
| autoJournalEnabled | boolean | 예 | auto_journal_setting.auto_journal_enabled | 자동분개 사용 여부 |
| collectCondition | string(1000) | 아니오 | auto_journal_setting.collect_condition | 자료수집 조건 |
| journalCondition | string(1000) | 아니오 | auto_journal_setting.journal_condition | 자동분개 조건 |
| accountSubjectId | integer int64 | 예 | auto_journal_setting.account_subject_id | 분개 계정과목 |
| useStatus | string(10) [사용\|미사용] | 아니오 | auto_journal_setting.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| autoJournalSettingId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_SETTING_MISSING | 증빙유형·자동분개 계정과목 등 필수 설정값이 누락된 경우 |
| 404 | ACCOUNT_SUBJECT_NOT_FOUND | 지정한 계정과목이 존재하지 않는 경우 |

#### PUT /auto-journal-settings/{autoJournalSettingId} — 증빙항목별 자료수집·자동분개 설정을 수정한다 (`updateAutoJournalSetting`)

- 권한: 예산·회계 담당자 · 경로 변수: autoJournalSettingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| evidenceType | string(50) | 예 | auto_journal_setting.evidence_type | 증빙유형 |
| evidenceItemName | string(200) | 예 | auto_journal_setting.evidence_item_name | 증빙항목명 |
| collectEnabled | boolean | 예 | auto_journal_setting.collect_enabled | 자료수집 사용 여부 |
| autoJournalEnabled | boolean | 예 | auto_journal_setting.auto_journal_enabled | 자동분개 사용 여부 |
| collectCondition | string(1000) | 아니오 | auto_journal_setting.collect_condition | 자료수집 조건 |
| journalCondition | string(1000) | 아니오 | auto_journal_setting.journal_condition | 자동분개 조건 |
| accountSubjectId | integer int64 | 예 | auto_journal_setting.account_subject_id | 분개 계정과목 |
| useStatus | string(10) [사용\|미사용] | 아니오 | auto_journal_setting.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| autoJournalSettingId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | AUTO_JOURNAL_SETTING_NOT_FOUND | 수정할 설정이 존재하지 않는 경우 |
| 422 | REQUIRED_SETTING_MISSING | 필수 설정값이 누락된 경우 |

### FN-SFR-007-02 전자세금계산서 수집·대사 검증 및 결의서 작성

- 요구사항: SFR-007-02 · 테이블: account_subject, partner, expense_resolution, journal_entry, link_log, tax_invoice

#### POST /tax-invoices/collect — 홈택스 연계로 전자세금계산서를 수집한다 (`collectTaxInvoices`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 수집 기간 시작일 |
| endDate | string | 예 | - | 수집 기간 종료일 |
| taxType | string(20) [TAXABLE\|EXEMPT] | 아니오 | tax_invoice.tax_type | 과세·면세 구분 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| collectedCount | integer | - | 수집 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 502 | HOMETAX_LINK_FAILED | 홈택스 연계에 실패한 경우 |
| 409 | TAX_INVOICE_COLLECT_NOT_ENABLED | 전자세금계산서 자료수집 설정이 완료되지 않은 경우 |

#### GET /tax-invoices — 수집된 전자세금계산서와 대사 결과를 조회한다 (`listTaxInvoices`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 아니오 | - | 조회 기간 시작일 |
| endDate | string | 아니오 | - | 조회 기간 종료일 |
| taxType | string(20) [TAXABLE\|EXEMPT] | 아니오 | tax_invoice.tax_type | 과세·면세 구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| taxInvoiceId | integer | - |  |
| partnerId | integer int64 | tax_invoice.partner_id | 거래처 |
| direction | string(20) [ISSUE\|RECEIVE] | tax_invoice.direction | 발행/수취 구분 |
| taxType | string(20) [TAXABLE\|EXEMPT] | tax_invoice.tax_type | 과세·면세 구분 |
| issueDate | string date | tax_invoice.issue_date | 작성일자 |
| supplyAmount | number | tax_invoice.supply_amount | 공급가액 |
| taxAmount | number | tax_invoice.tax_amount | 세액 |
| approvalNumber | string(50) | tax_invoice.approval_number | 국세청 승인번호 |
| journalStatus | string(20) [UNPROCESSED\|PROCESSED] | tax_invoice.journal_status | 전표처리 상태 |
| expenseResolutionId | integer int64 | tax_invoice.expense_resolution_id | 결의서 |
| reconcileResult | string | - | 대사 결과 (일치·불일치) |

오류: 공통 오류만 (1절)

#### POST /expense-resolutions/from-tax-invoice — 선택한 전자세금계산서로 결의서를 작성한다 (`createExpenseResolutionFromTaxInvoice`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| taxInvoiceId | integer | 예 | - | 결의서 작성 대상 전자세금계산서 ID |
| projectId | integer int64 | 예 | expense_resolution.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | expense_resolution.budget_account_id | 예산과목 |
| departmentId | integer int64 | 예 | expense_resolution.department_id | 결의부서 |
| resolutionAmount | number | 예 | expense_resolution.resolution_amount | 결의 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| expenseResolutionId | integer | - |  |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | expense_resolution.status | 진행 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | TAX_INVOICE_NOT_FOUND | 선택한 전자세금계산서가 존재하지 않는 경우 |
| 409 | EXPENSE_RESOLUTION_ALREADY_CREATED | 이미 결의서가 작성된 건인 경우 |
| 422 | RECONCILE_MISMATCH_UNCONFIRMED | 대사 불일치 건의 사유 확인 전에 작성하려는 경우 |

### FN-SFR-007-03 은행계좌 거래내역 조회·자동전표 및 반제 처리

- 요구사항: SFR-007-03 · 테이블: account_subject, partner, partner_account, journal_entry, link_log, bank_transaction, journal_settlement

#### POST /bank-transactions/collect — 금융기관 API로 은행계좌 거래내역을 수집하고 자동전표를 처리한다 (`collectBankTransactions`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| partnerAccountId | integer int64 | 예 | bank_transaction.partner_account_id | 거래처 계좌 ID |
| startDate | string | 예 | - | 수집 기간 시작일 |
| endDate | string | 예 | - | 수집 기간 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| collectedCount | integer | - | 수집 건수 |
| journalizedCount | integer | - | 자동전표 처리 건수 |
| exceptionCount | integer | - | 예외 거래내역 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 502 | BANK_LINK_FAILED | 금융기관 API 연계에 실패한 경우 |
| 404 | PARTNER_ACCOUNT_NOT_FOUND | 계좌가 존재하지 않는 경우 |

#### GET /bank-transactions — 은행계좌 거래내역을 조회한다 (`listBankTransactions`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| partnerAccountId | integer int64 | 예 | bank_transaction.partner_account_id | 거래처 계좌 ID |
| startDate | string | 예 | - | 조회 기간 시작일 |
| endDate | string | 예 | - | 조회 기간 종료일 |
| isException | boolean | 아니오 | bank_transaction.is_exception | 예외 거래 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| bankTransactionId | integer | - |  |
| transactionAt | string date-time | bank_transaction.transaction_at | 거래일시 |
| depositAmount | number | bank_transaction.deposit_amount | 입금액 |
| withdrawalAmount | number | bank_transaction.withdrawal_amount | 출금액 |
| balanceAmount | number | bank_transaction.balance_amount | 거래 후 잔액 |
| summary | string(500) | bank_transaction.summary | 적요 |
| counterpartyName | string(200) | bank_transaction.counterparty_name | 거래상대 표시명 |
| isException | boolean | bank_transaction.is_exception | 예외 거래 여부 |
| isJournalized | boolean | bank_transaction.is_journalized | 전표처리 여부 |
| journalEntryId | integer int64 | bank_transaction.journal_entry_id | 전표 ID |

오류: 공통 오류만 (1절)

#### POST /journal-settlements — 예외 거래내역을 선택하여 채권·채무를 반제 처리한다 (`createJournalSettlement`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| bankTransactionId | integer | 예 | - | 반제할 예외 거래내역 ID |
| receivableLineId | integer int64 | 예 | journal_settlement.receivable_line_id | 채권 분개라인 ID |
| payableLineId | integer int64 | 예 | journal_settlement.payable_line_id | 채무 분개라인 ID |
| partnerId | integer int64 | 예 | journal_settlement.partner_id | 거래처 ID |
| settlementAmount | number | 예 | journal_settlement.settlement_amount | 반제·상계 금액 |
| memo | string(500) | 아니오 | journal_settlement.memo | 처리 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalSettlementId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BANK_TRANSACTION_NOT_FOUND | 선택한 거래내역이 존재하지 않는 경우 |
| 409 | BANK_TRANSACTION_ALREADY_PROCESSED | 이미 전표 처리된 거래내역인 경우 |

### FN-SFR-007-04 카드 승인내역 및 현금영수증 결의서 작성

- 요구사항: SFR-007-04 · 테이블: credit_card, expense_resolution, journal_entry, link_log, card_approval, cash_receipt

#### POST /card-approvals/collect — 카드사 연계로 신용카드 승인내역을 수집한다 (`collectCardApprovals`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| creditCardId | integer int64 | 예 | card_approval.credit_card_id | 신용카드 ID |
| startDate | string | 예 | - | 수집 기간 시작일 |
| endDate | string | 예 | - | 수집 기간 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| collectedCount | integer | - | 수집 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 502 | CARD_LINK_FAILED | 카드사 연계에 실패한 경우 |
| 404 | CREDIT_CARD_NOT_FOUND | 신용카드가 등록되어 있지 않은 경우 |

#### GET /card-approvals — 신용카드 승인내역을 조회한다 (`listCardApprovals`)

- 권한: 임직원, 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| creditCardId | integer int64 | 아니오 | card_approval.credit_card_id | 신용카드 ID |
| startDate | string | 예 | - | 조회 기간 시작일 |
| endDate | string | 예 | - | 조회 기간 종료일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| cardApprovalId | integer | - |  |
| creditCardId | integer int64 | card_approval.credit_card_id | 신용카드 ID |
| approvalNo | string(50) | card_approval.approval_no | 승인번호 |
| approvedAt | string date-time | card_approval.approved_at | 승인일시 |
| approvalAmount | number | card_approval.approval_amount | 승인금액 |
| vatAmount | number | card_approval.vat_amount | 부가세액 |
| merchantName | string(200) | card_approval.merchant_name | 가맹점명 |
| expenseResolutionId | integer int64 | card_approval.expense_resolution_id | 결의서 ID |

오류: 공통 오류만 (1절)

#### GET /cash-receipts — 현금영수증 내역을 조회한다 (`listCashReceipts`)

- 권한: 임직원, 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 기간 시작일 |
| endDate | string | 예 | - | 조회 기간 종료일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| cashReceiptId | integer | - |  |
| approvalNo | string(50) | cash_receipt.approval_no | 승인번호 |
| issuedAt | string date-time | cash_receipt.issued_at | 발행일시 |
| supplyAmount | number | cash_receipt.supply_amount | 공급가액 |
| vatAmount | number | cash_receipt.vat_amount | 부가세액 |
| totalAmount | number | cash_receipt.total_amount | 합계금액 |
| merchantName | string(200) | cash_receipt.merchant_name | 가맹점명 |
| expenseResolutionId | integer int64 | cash_receipt.expense_resolution_id | 결의서 ID |

오류: 공통 오류만 (1절)

#### POST /expense-resolutions/from-card-or-cash-receipt — 선택한 카드 승인내역 또는 현금영수증으로 결의서를 작성한다 (`createExpenseResolutionFromCardOrCashReceipt`)

- 권한: 임직원, 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| cardApprovalId | integer | 아니오 | - | 대상 카드 승인내역 ID |
| cashReceiptId | integer | 아니오 | - | 대상 현금영수증 ID |
| projectId | integer int64 | 예 | expense_resolution.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | expense_resolution.budget_account_id | 예산과목 |
| departmentId | integer int64 | 예 | expense_resolution.department_id | 결의부서 |
| resolutionAmount | number | 예 | expense_resolution.resolution_amount | 결의 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| expenseResolutionId | integer | - |  |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | expense_resolution.status | 진행 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOLUTION_SOURCE_NOT_FOUND | 선택한 승인내역 또는 현금영수증이 존재하지 않는 경우 |
| 409 | EXPENSE_RESOLUTION_ALREADY_CREATED | 이미 결의서가 작성된 건인 경우 |

### FN-SFR-008-01 전표 입력·관리

- 요구사항: SFR-008-01 · 테이블: journal_entry, journal_entry_line

#### POST /journal-entries — 전표와 분개 내역을 입력하여 저장한다 (`createJournalEntry`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /journal-entries/{journalEntryId} — 전표와 분개 내역을 조회한다 (`getJournalEntry`)

- 권한: 예산·회계 담당자 · 경로 변수: journalEntryId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalEntryId | integer int64 | journal_entry.journal_entry_id | 전표 ID |
| entryDate | string date | journal_entry.entry_date | 전표 일자 |
| status | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | journal_entry.status | 전표 상태 |
| totalDebitAmount | number | journal_entry.total_debit_amount | 차변 합계 |
| totalCreditAmount | number | journal_entry.total_credit_amount | 대변 합계 |
| summary | string(500) | journal_entry.summary | 적요 |
| evidenceDetail | string(1000) | journal_entry.evidence_detail | 증빙내역 |
| lines | array | - | 분개 라인 목록 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | JOURNAL_ENTRY_NOT_FOUND | 전표가 존재하지 않는다 |

#### PATCH /journal-entries/{journalEntryId} — 전표의 관리항목·적요·증빙내역을 수정한다 (`updateJournalEntry`)

- 권한: 예산·회계 담당자 · 경로 변수: journalEntryId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| summary | string(500) | 아니오 | journal_entry.summary | 적요 |
| evidenceDetail | string(1000) | 아니오 | journal_entry.evidence_detail | 증빙내역 |
| lines | array | 아니오 | - | 변경할 분개 라인 및 관리항목 값 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalEntryId | integer int64 | journal_entry.journal_entry_id | 전표 ID |
| status | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | journal_entry.status | 전표 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | JOURNAL_ENTRY_NOT_FOUND | 전표가 존재하지 않는다 |
| 409 | JOURNAL_ENTRY_APPROVED | 승인된 전표를 승인 해제 없이 수정한다 |
| 409 | JOURNAL_PERIOD_CLOSED | 마감된 기간의 전표를 수정한다 |
| 422 | JOURNAL_ENTRY_DEBIT_CREDIT_MISMATCH | 차변 합계와 대변 합계가 일치하지 않는다 |

#### POST /journal-entries/{journalEntryId}/cancel-approval — 승인된 전표의 승인을 해제한다 (`cancelJournalEntryApproval`)

- 권한: 예산·회계 담당자 · 경로 변수: journalEntryId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| changeReason | string(500) | 아니오 | change_history.change_reason | 변경 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalEntryId | integer int64 | journal_entry.journal_entry_id | 전표 ID |
| status | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | journal_entry.status | 전표 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | JOURNAL_ENTRY_NOT_FOUND | 전표가 존재하지 않는다 |
| 409 | JOURNAL_ENTRY_NOT_APPROVED | 승인 상태가 아닌 전표의 승인 해제를 시도한다 |
| 409 | JOURNAL_PERIOD_CLOSED | 마감된 기간의 전표다 |

#### PATCH /journal-entries/evidence-details — 선택한 전표들의 증빙내역을 일괄 변경한다 (`updateJournalEntryEvidenceDetails`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| journalEntryIds | array | 예 | - | 변경 대상 전표 ID 목록 |
| evidenceDetail | string(1000) | 예 | journal_entry.evidence_detail | 증빙내역 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| results | array | - | 전표별 변경 성공·실패 결과 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | JOURNAL_ENTRY_NOT_SELECTED | 변경 대상 전표를 선택하지 않았다 |
| 409 | JOURNAL_PERIOD_CLOSED | 마감된 기간의 전표가 포함된다 |

#### GET /journal-entries/{journalEntryId}/print — 전표 출력물을 조회한다 (`printJournalEntry`)

- 권한: 예산·회계 담당자 · 경로 변수: journalEntryId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalEntryId | integer int64 | journal_entry.journal_entry_id | 전표 ID |
| entryDate | string date | journal_entry.entry_date | 전표 일자 |
| printFile | string | - | 출력용 전표 문서 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | JOURNAL_ENTRY_NOT_FOUND | 전표가 존재하지 않는다 |

### FN-SFR-008-02 전자세금계산서 발행

- 요구사항: SFR-008-02 · 테이블: partner, link_log, tax_invoice

#### POST /tax-invoices — 전자세금계산서를 발행 요청한다 (`createTaxInvoice`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| direction | string(20) [ISSUE\|RECEIVE] | 예 | tax_invoice.direction | 발행/수취 구분 |
| partnerId | integer int64 | 예 | tax_invoice.partner_id | 거래처 |
| taxType | string(20) [TAXABLE\|EXEMPT] | 예 | tax_invoice.tax_type | 과세·면세 구분 |
| issueDate | string date | 예 | tax_invoice.issue_date | 작성일자 |
| supplyAmount | number | 예 | tax_invoice.supply_amount | 공급가액 |
| taxAmount | number | 예 | tax_invoice.tax_amount | 세액 |
| itemDescription | string(500) | 아니오 | tax_invoice.item_description | 품목 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| taxInvoiceId | integer int64 | tax_invoice.tax_invoice_id | 전자세금계산서 ID |
| issueStatus | string(20) [NOT_ISSUED\|ISSUED] | tax_invoice.issue_status | 발행 여부 |
| approvalNumber | string(50) | tax_invoice.approval_number | 국세청 승인번호 |
| linkStatus | string(20) [REQUESTED\|SUCCESS\|FAILED] | link_log.status | 연계 상태 |
| failureReason | string | link_log.failure_reason | 실패 사유 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PARTNER_NOT_FOUND | 거래처 기준정보가 존재하지 않는다 |
| 422 | TAX_INVOICE_INVALID_INPUT | 필수 입력값이 누락되었다 |
| 502 | TAX_INVOICE_LINK_FAILED | 외부 발행 시스템 연계에 실패하여 발행 완료로 처리하지 않는다 |

### FN-SFR-008-03 전자세금계산서 검증·전표처리·현황조회

- 요구사항: SFR-008-03 · 테이블: account_subject, partner, journal_entry, tax_invoice

#### GET /tax-invoices — 세금계산서 발행·수취 현황을 조회한다 (`listTaxInvoices`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /tax-invoices/validate — 선택한 세금계산서의 필수 항목과 금액 정합성을 검증한다 (`validateTaxInvoices`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| taxInvoiceIds | array | 예 | - | 검증 대상 세금계산서 ID 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| results | array | - | 건별 검증 결과와 오류 사유 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | TAX_INVOICE_NOT_FOUND | 대상 세금계산서가 존재하지 않는다 |
| 422 | TAX_INVOICE_NOT_SELECTED | 검증 대상을 선택하지 않았다 |

#### POST /tax-invoices/create-journal-entries — 검증된 세금계산서를 전표처리한다 (`createJournalEntriesFromTaxInvoices`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| taxInvoiceIds | array | 예 | - | 전표처리 대상 세금계산서 ID 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| results | array | - | 건별 생성 전표와 처리 결과 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | TAX_INVOICE_NOT_FOUND | 대상 세금계산서가 존재하지 않는다 |
| 409 | TAX_INVOICE_ALREADY_PROCESSED | 이미 전표처리된 세금계산서를 재처리한다 |
| 422 | TAX_INVOICE_VALIDATION_FAILED | 검증 오류가 있는 세금계산서다 |

### FN-SFR-008-04 세금계산서 발행여부 일괄 변경

- 요구사항: SFR-008-04 · 테이블: change_history, tax_invoice

#### PATCH /tax-invoices/issue-status — 선택한 세금계산서의 발행 여부를 일괄 변경한다 (`updateTaxInvoiceIssueStatuses`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| taxInvoiceIds | array | 예 | - | 변경 대상 세금계산서 ID 목록 |
| issueStatus | string(20) [NOT_ISSUED\|ISSUED] | 예 | tax_invoice.issue_status | 발행 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| results | array | - | 건별 변경 성공·실패 결과와 사유 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | TAX_INVOICE_NOT_SELECTED | 대상 세금계산서를 선택하지 않았다 |
| 409 | TAX_INVOICE_ALREADY_PROCESSED | 전표처리 완료된 건이라 변경할 수 없다 |
| 404 | TAX_INVOICE_NOT_FOUND | 대상 세금계산서가 존재하지 않는다 |

### FN-SFR-008-05 계정별 장부 조회

- 요구사항: SFR-008-05 · 테이블: account_subject, journal_entry, journal_entry_line, management_item, journal_line_management_value

#### GET /account-ledgers — 장부 종류별 계정 장부를 조회한다 (`listAccountLedgers`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fromDate | string | 예 | - | 조회 시작 일자 |
| toDate | string | 예 | - | 조회 종료 일자 |
| ledgerType | string | 예 | - | 분개장, 일계표, 월계표, 총계정원장, 현금출납장, 계정별 원장, 주요계정 증감 현황, 계정별 변동추이, 관리항목 상세 원장 중 하나 |
| accountSubjectId | integer int64 | 아니오 | journal_entry_line.account_subject_id | 계정과목 ID |
| managementItemId | integer int64 | 아니오 | journal_line_management_value.management_item_id | 관리항목 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| entryDate | string date | journal_entry.entry_date | 전표 일자 |
| accountSubjectId | integer int64 | journal_entry_line.account_subject_id | 계정과목 ID |
| debitAmount | number | journal_entry_line.debit_amount | 차변 금액 |
| creditAmount | number | journal_entry_line.credit_amount | 대변 금액 |
| itemValue | string(200) | journal_line_management_value.item_value | 관리항목 값 |
| balance | number | - | 집계 잔액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 시작일이 종료일보다 늦다 |
| 422 | MANAGEMENT_ITEM_REQUIRED | 관리항목 상세 원장 조회에 관리항목을 지정하지 않았다 |

### FN-SFR-008-06 거래처별 장부 조회

- 요구사항: SFR-008-06 · 테이블: account_subject, partner, journal_entry_line

#### GET /partner-ledgers — 거래처 원장·계정잔액·일월별 집계를 조회한다 (`listPartnerLedgers`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fromDate | string | 예 | - | 조회 시작 일자 |
| toDate | string | 예 | - | 조회 종료 일자 |
| partnerId | integer int64 | 아니오 | journal_entry_line.partner_id | 거래처 ID |
| accountSubjectId | integer int64 | 아니오 | journal_entry_line.account_subject_id | 계정과목 ID |
| aggregationUnit | string | 아니오 | - | 일별 또는 월별 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerId | integer int64 | journal_entry_line.partner_id | 거래처 ID |
| accountSubjectId | integer int64 | journal_entry_line.account_subject_id | 계정과목 ID |
| debitAmount | number | journal_entry_line.debit_amount | 차변 금액 |
| creditAmount | number | journal_entry_line.credit_amount | 대변 금액 |
| balance | number | - | 거래처별 잔액 |
| aggregationPeriod | string | - | 일 또는 월 집계 구간 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 시작일이 종료일보다 늦다 |

### FN-SFR-008-07 관리항목별 장부 조회

- 요구사항: SFR-008-07 · 테이블: project, account_subject, attachment, requisition, journal_entry_line, management_item, journal_line_management_value

#### GET /management-item-ledgers — 관리항목별 장부(원장·관리내역·멀티 관리내역·적요/품의/증빙별 원장·프로젝트별 계정내역)를 조회한다 (`listManagementItemLedgers`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| ledgerType | string | 예 | - | 조회 유형(관리항목 원장, 관리내역, 멀티 관리내역, 적요별·품의내역별·증빙별 원장, 프로젝트별 계정내역) |
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| managementItemIds | array | 아니오 | - | 관리항목 ID 목록(멀티 관리내역은 둘 이상) |
| projectId | integer int64 | 아니오 | journal_entry_line.project_id | 프로젝트 ID |
| accountSubjectId | integer int64 | 아니오 | journal_entry_line.account_subject_id | 계정과목 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| entryLineId | integer int64 | journal_entry_line.journal_entry_line_id | 전표 분개 라인 ID |
| accountSubjectId | integer int64 | journal_entry_line.account_subject_id | 계정과목 ID |
| projectId | integer int64 | journal_entry_line.project_id | 프로젝트 ID |
| summary | string(500) | journal_entry_line.summary | 적요 |
| debitAmount | number | journal_entry_line.debit_amount | 차변 금액 |
| creditAmount | number | journal_entry_line.credit_amount | 대변 금액 |
| managementItemId | integer int64 | journal_line_management_value.management_item_id | 관리항목 |
| itemValue | string(200) | journal_line_management_value.item_value | 관리항목 값 |
| balance | number | - | 집계 잔액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 기간이 올바르지 않음 |

### FN-SFR-008-08 채권·채무 관리

- 요구사항: SFR-008-08 · 테이블: account_subject, partner, journal_entry_line, system_setting, journal_settlement

#### GET /receivable-aging — 기준일자 기준 채권 연령분석을 조회한다 (`listReceivableAging`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| baseDate | string | 예 | - | 연령분석 기준일 |
| partnerId | integer int64 | 아니오 | journal_entry_line.partner_id | 거래처 ID |
| accountSubjectId | integer int64 | 아니오 | journal_entry_line.account_subject_id | 계정과목 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerId | integer int64 | journal_entry_line.partner_id | 거래처 ID |
| bucket | string | - | 연령 구간 |
| balance | number | - | 구간별 채권 잔액 |

오류: 공통 오류만 (1절)

#### GET /partner-balances — 거래처별 채권·채무 잔액을 조회한다 (`listPartnerBalances`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| baseDate | string | 예 | - | 잔액 기준일 |
| partnerId | integer int64 | 아니오 | journal_entry_line.partner_id | 거래처 ID |
| accountSubjectId | integer int64 | 아니오 | journal_entry_line.account_subject_id | 계정과목 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| partnerId | integer int64 | journal_entry_line.partner_id | 거래처 ID |
| receivableBalance | number | - | 채권 잔액 |
| payableBalance | number | - | 채무 잔액 |

오류: 공통 오류만 (1절)

#### POST /journal-settlements — 동일 거래처의 채권과 채무를 상계 처리한다 (`createJournalSettlement`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-008-09 전표 반제 관리

- 요구사항: SFR-008-09 · 테이블: account_subject, partner, journal_entry_line, journal_settlement

#### GET /journal-settlements — 전표 반제처리 현황을 조회한다 (`listJournalSettlements`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| partnerId | integer int64 | 아니오 | journal_settlement.partner_id | 거래처 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalSettlementId | integer int64 | journal_settlement.journal_settlement_id | 반제·상계 처리 ID |
| receivableLineId | integer int64 | journal_settlement.receivable_line_id | 채권 분개라인 ID |
| payableLineId | integer int64 | journal_settlement.payable_line_id | 채무 분개라인 ID |
| partnerId | integer int64 | journal_settlement.partner_id | 거래처 ID |
| settlementAmount | number | journal_settlement.settlement_amount | 반제·상계 금액 |
| settledAt | string date-time | journal_settlement.settled_at | 처리일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 기간이 올바르지 않음 |

#### GET /settlement-aging — 반제 기준 계정별 연령분석을 조회한다 (`listSettlementAging`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| baseDate | string | 아니오 | - | 연령분석 기준일 |
| accountSubjectId | integer int64 | 아니오 | journal_entry_line.account_subject_id | 계정과목 ID |
| partnerId | integer int64 | 아니오 | journal_entry_line.partner_id | 거래처 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountSubjectId | integer int64 | journal_entry_line.account_subject_id | 계정과목 ID |
| bucket | string | - | 연령 구간 |
| balance | number | - | 반제 기준 잔액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 기간이 올바르지 않음 |

### FN-SFR-009-01 자금과목 및 자금 손익 양식 설정

- 요구사항: SFR-009-01 · 테이블: account_subject, fund_subject, fund_pl_form_item

#### GET /fund-subjects — 자금과목 목록을 조회한다 (`listFundSubjects`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| useStatus | string(10) [사용\|미사용] | 아니오 | fund_subject.use_status | 사용 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fundSubjectId | integer int64 | fund_subject.fund_subject_id | 자금과목 ID |
| name | string(100) | fund_subject.name | 자금과목명 |
| subjectType | string(20) [INFLOW\|OUTFLOW] | fund_subject.subject_type | 자금과목 구분 |
| useStatus | string(10) [사용\|미사용] | fund_subject.use_status | 사용 여부 |
| accountSubjectId | integer int64 | fund_subject.account_subject_id | 연결 계정과목 |

오류: 공통 오류만 (1절)

#### POST /fund-subjects — 자금과목을 등록한다 (`createFundSubject`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 예 | fund_subject.name | 자금과목명 |
| subjectType | string(20) [INFLOW\|OUTFLOW] | 예 | fund_subject.subject_type | 자금과목 구분 |
| useStatus | string(10) [사용\|미사용] | 예 | fund_subject.use_status | 사용 여부 |
| accountSubjectId | integer int64 | 아니오 | fund_subject.account_subject_id | 연결 계정과목 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fundSubjectId | integer int64 | fund_subject.fund_subject_id | 자금과목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | FUND_SUBJECT_DUPLICATED | 이미 존재하는 자금과목명 |
| 404 | ACCOUNT_SUBJECT_NOT_FOUND | 연결할 계정과목이 없음 |

#### PATCH /fund-subjects/{fundSubjectId} — 자금과목을 수정하거나 사용 여부를 변경한다 (`updateFundSubject`)

- 권한: 예산·회계 담당자 · 경로 변수: fundSubjectId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 아니오 | fund_subject.name | 자금과목명 |
| subjectType | string(20) [INFLOW\|OUTFLOW] | 아니오 | fund_subject.subject_type | 자금과목 구분 |
| useStatus | string(10) [사용\|미사용] | 아니오 | fund_subject.use_status | 사용 여부 |
| accountSubjectId | integer int64 | 아니오 | fund_subject.account_subject_id | 연결 계정과목 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fundSubjectId | integer int64 | fund_subject.fund_subject_id | 자금과목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FUND_SUBJECT_NOT_FOUND | 자금과목이 없음 |
| 409 | FUND_SUBJECT_DUPLICATED | 이미 존재하는 자금과목명 |
| 404 | ACCOUNT_SUBJECT_NOT_FOUND | 연결할 계정과목이 없음 |

#### GET /fund-pl-form-items — 자금 손익 양식 구성을 조회한다 (`listFundPlFormItems`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fundPlFormItemId | integer int64 | fund_pl_form_item.fund_pl_form_item_id | 자금 손익 양식 항목 ID |
| fundSubjectId | integer int64 | fund_pl_form_item.fund_subject_id | 자금과목 |
| sortOrder | integer int32 | fund_pl_form_item.sort_order | 순서 |
| itemName | string(100) | fund_pl_form_item.item_name | 항목명 |

오류: 공통 오류만 (1절)

#### POST /fund-pl-form-items — 자금 손익 양식 항목을 추가한다 (`createFundPlFormItem`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fundSubjectId | integer int64 | 예 | fund_pl_form_item.fund_subject_id | 자금과목 |
| sortOrder | integer int32 | 예 | fund_pl_form_item.sort_order | 순서 |
| itemName | string(100) | 아니오 | fund_pl_form_item.item_name | 항목명 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fundPlFormItemId | integer int64 | fund_pl_form_item.fund_pl_form_item_id | 자금 손익 양식 항목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FUND_SUBJECT_NOT_FOUND | 자금과목이 없음 |

#### PATCH /fund-pl-form-items/{fundPlFormItemId} — 자금 손익 양식 항목을 수정한다 (`updateFundPlFormItem`)

- 권한: 예산·회계 담당자 · 경로 변수: fundPlFormItemId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fundSubjectId | integer int64 | 아니오 | fund_pl_form_item.fund_subject_id | 자금과목 |
| sortOrder | integer int32 | 아니오 | fund_pl_form_item.sort_order | 순서 |
| itemName | string(100) | 아니오 | fund_pl_form_item.item_name | 항목명 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fundPlFormItemId | integer int64 | fund_pl_form_item.fund_pl_form_item_id | 자금 손익 양식 항목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FUND_PL_FORM_ITEM_NOT_FOUND | 양식 항목이 없음 |
| 404 | FUND_SUBJECT_NOT_FOUND | 자금과목이 없음 |

#### DELETE /fund-pl-form-items/{fundPlFormItemId} — 자금 손익 양식 항목을 삭제한다 (`deleteFundPlFormItem`)

- 권한: 예산·회계 담당자 · 경로 변수: fundPlFormItemId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FUND_PL_FORM_ITEM_NOT_FOUND | 양식 항목이 없음 |

### FN-SFR-009-02 고정자금 등록·관리

- 요구사항: SFR-009-02 · 테이블: project, budget_account, partner, fund_subject, fixed_fund

#### GET /fixed-funds — 고정자금 목록을 조회한다 (`listFixedFunds`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fundSubjectId | integer int64 | 아니오 | fixed_fund.fund_subject_id | 자금과목 |
| useStatus | string(10) [사용\|미사용] | 아니오 | fixed_fund.use_status | 사용 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fixedFundId | integer int64 | fixed_fund.fixed_fund_id | 고정자금 ID |
| fundSubjectId | integer int64 | fixed_fund.fund_subject_id | 자금과목 |
| partnerId | integer int64 | fixed_fund.partner_id | 거래처 |
| amount | number | fixed_fund.amount | 금액 |
| cycle | string(20) [월\|분기\|연] | fixed_fund.cycle | 발생 주기 |
| startDate | string date | fixed_fund.start_date | 적용 시작일 |
| endDate | string date | fixed_fund.end_date | 적용 종료일 |
| useStatus | string(10) [사용\|미사용] | fixed_fund.use_status | 사용 여부 |

오류: 공통 오류만 (1절)

#### POST /fixed-funds — 고정자금을 등록한다 (`createFixedFund`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fundSubjectId | integer int64 | 예 | fixed_fund.fund_subject_id | 자금과목 |
| partnerId | integer int64 | 아니오 | fixed_fund.partner_id | 거래처 |
| amount | number | 예 | fixed_fund.amount | 금액 |
| cycle | string(20) [월\|분기\|연] | 예 | fixed_fund.cycle | 발생 주기 |
| startDate | string date | 예 | fixed_fund.start_date | 적용 시작일 |
| endDate | string date | 아니오 | fixed_fund.end_date | 적용 종료일 |
| useStatus | string(10) [사용\|미사용] | 예 | fixed_fund.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fixedFundId | integer int64 | fixed_fund.fixed_fund_id | 고정자금 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FUND_SUBJECT_NOT_FOUND | 자금과목이 없음 |
| 422 | INVALID_DATE_RANGE | 적용 종료일이 시작일보다 앞섬 |

#### PATCH /fixed-funds/{fixedFundId} — 고정자금을 수정하거나 사용 여부를 변경한다 (`updateFixedFund`)

- 권한: 예산·회계 담당자 · 경로 변수: fixedFundId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fundSubjectId | integer int64 | 아니오 | fixed_fund.fund_subject_id | 자금과목 |
| partnerId | integer int64 | 아니오 | fixed_fund.partner_id | 거래처 |
| amount | number | 아니오 | fixed_fund.amount | 금액 |
| cycle | string(20) [월\|분기\|연] | 아니오 | fixed_fund.cycle | 발생 주기 |
| startDate | string date | 아니오 | fixed_fund.start_date | 적용 시작일 |
| endDate | string date | 아니오 | fixed_fund.end_date | 적용 종료일 |
| useStatus | string(10) [사용\|미사용] | 아니오 | fixed_fund.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fixedFundId | integer int64 | fixed_fund.fixed_fund_id | 고정자금 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FIXED_FUND_NOT_FOUND | 고정자금이 없음 |
| 422 | INVALID_DATE_RANGE | 적용 종료일이 시작일보다 앞섬 |

#### DELETE /fixed-funds/{fixedFundId} — 고정자금을 삭제한다 (`deleteFixedFund`)

- 권한: 예산·회계 담당자 · 경로 변수: fixedFundId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FIXED_FUND_NOT_FOUND | 고정자금이 없음 |

### FN-SFR-009-03 자금수지계획 등록·관리

- 요구사항: SFR-009-03 · 테이블: fund_subject, fixed_fund, fund_plan

#### GET /fund-plans — 기간별 자금수지계획 목록을 조회한다 (`listFundPlans`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 아니오 | - | 계획 기간 시작 |
| endDate | string | 아니오 | - | 계획 기간 종료 |
| fundSubjectId | integer int64 | 아니오 | fund_plan.fund_subject_id | 자금과목 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fundPlanId | integer int64 | fund_plan.fund_plan_id | 자금수지계획 ID |
| fundSubjectId | integer int64 | fund_plan.fund_subject_id | 자금과목 |
| planStartDate | string date | fund_plan.plan_start_date | 계획 시작일 |
| planEndDate | string date | fund_plan.plan_end_date | 계획 종료일 |
| incomeAmount | number | fund_plan.income_amount | 수입 계획 금액 |
| expenseAmount | number | fund_plan.expense_amount | 지출 계획 금액 |
| remark | string | fund_plan.remark | 비고 |
| closingStatus | string(10) [마감 취소\|마감] | fund_plan.closing_status | 마감 상태 |
| balanceDifference | number | - | 수지 차액 |

오류: 공통 오류만 (1절)

#### POST /fund-plans — 자금수지계획을 등록한다 (`createFundPlan`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fundSubjectId | integer int64 | 예 | fund_plan.fund_subject_id | 자금과목 |
| planStartDate | string date | 예 | fund_plan.plan_start_date | 계획 시작일 |
| planEndDate | string date | 예 | fund_plan.plan_end_date | 계획 종료일 |
| incomeAmount | number | 아니오 | fund_plan.income_amount | 수입 계획 금액 |
| expenseAmount | number | 아니오 | fund_plan.expense_amount | 지출 계획 금액 |
| remark | string | 아니오 | fund_plan.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fundPlanId | integer int64 | fund_plan.fund_plan_id | 자금수지계획 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FUND_SUBJECT_NOT_FOUND | 자금과목이 없음 |
| 422 | INVALID_DATE_RANGE | 계획 종료일이 시작일보다 앞섬 |

#### PATCH /fund-plans/{fundPlanId} — 자금수지계획을 수정한다 (`updateFundPlan`)

- 권한: 예산·회계 담당자 · 경로 변수: fundPlanId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fundSubjectId | integer int64 | 아니오 | fund_plan.fund_subject_id | 자금과목 |
| planStartDate | string date | 아니오 | fund_plan.plan_start_date | 계획 시작일 |
| planEndDate | string date | 아니오 | fund_plan.plan_end_date | 계획 종료일 |
| incomeAmount | number | 아니오 | fund_plan.income_amount | 수입 계획 금액 |
| expenseAmount | number | 아니오 | fund_plan.expense_amount | 지출 계획 금액 |
| remark | string | 아니오 | fund_plan.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fundPlanId | integer int64 | fund_plan.fund_plan_id | 자금수지계획 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FUND_PLAN_NOT_FOUND | 자금수지계획이 없음 |
| 409 | FUND_PLAN_CLOSED | 마감된 기간의 계획을 수정함 |
| 422 | INVALID_DATE_RANGE | 계획 종료일이 시작일보다 앞섬 |

#### DELETE /fund-plans/{fundPlanId} — 자금수지계획을 삭제한다 (`deleteFundPlan`)

- 권한: 예산·회계 담당자 · 경로 변수: fundPlanId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FUND_PLAN_NOT_FOUND | 자금수지계획이 없음 |
| 409 | FUND_PLAN_CLOSED | 마감된 기간의 계획을 삭제함 |

### FN-SFR-009-04 자금일보 조회

- 요구사항: SFR-009-04 · 테이블: approval_document

#### GET /daily-fund-reports — 일자별 자금일보와 결재 상태를 조회한다 (`listDailyFundReports`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| reportDate | string | 예 | - | 자금일보 기준 일자 |
| scope | string | 아니오 | - | 조회 범위 (전체/부서/개인) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| reportDate | string | - | 자금일보 기준 일자 |
| previousBalance | number | - | 전일 잔액 |
| depositAmount | number | - | 입금 합계 |
| withdrawalAmount | number | - | 출금 합계 |
| currentBalance | number | - | 당일 잔액 |
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 전자결재 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | FUND_REPORT_DATE_REQUIRED | 조회 일자가 누락된 경우 |

### FN-SFR-009-05 자금현황 조회

- 요구사항: SFR-009-05 · 테이블: partner, partner_account, journal_entry, fund_pl_form_item, fund_plan, financial_instrument

#### GET /fund-statuses — 현황 종류별 자금현황을 조회한다 (`listFundStatuses`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| statusType | string | 예 | - | 현황 종류 |
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| scope | string | 아니오 | - | 조회 범위 (전체/부서/개인) |
| partnerId | integer int64 | 아니오 | partner.partner_id | 거래처 ID |
| partnerAccountId | integer int64 | 아니오 | partner_account.partner_account_id | 거래처 계좌 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| itemName | string | - | 현황 항목명 |
| amount | number | - | 항목 금액 |
| totalAmount | number | - | 합계 |
| planAmount | number | - | 자금수지계획 금액 |
| actualAmount | number | - | 실적 금액 |
| differenceAmount | number | - | 계획 대비 실적 차이 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_DATE_RANGE | 조회 시작일이 종료일보다 늦은 경우 |

### FN-SFR-009-06 차입금·대여금 명세서 전표처리 및 원장 조회

- 요구사항: SFR-009-06 · 테이블: account_subject, partner, journal_entry, loan, loan_transaction

#### GET /loan-statements — 차입금·대여금 명세서를 조회한다 (`listLoanStatements`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| loanType | string(20) [BORROWING\|LENDING] | 예 | loan.loan_type | 구분 |
| partnerId | integer int64 | 아니오 | loan.partner_id | 거래처 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| loanId | integer int64 | loan.loan_id | 차입금·대여금 ID |
| partnerId | integer int64 | loan.partner_id | 거래처 |
| principalAmount | number | loan.principal_amount | 원금 |
| voucherStatus | string(20) [미처리\|처리완료] | loan.voucher_status | 전표처리 상태 |
| repaidAmount | number | - | 상환 합계 |
| balance | number | - | 잔액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_DATE_RANGE | 조회 시작일이 종료일보다 늦은 경우 |

#### POST /loans/{loanId}/process-voucher — 차입금·대여금 건을 전표처리한다 (`processLoanVoucher`)

- 권한: 예산·회계 담당자 · 경로 변수: loanId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalEntryId | integer int64 | loan_transaction.journal_entry_id | 전표 |
| voucherStatus | string(20) [미처리\|처리완료] | loan.voucher_status | 전표처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | LOAN_NOT_FOUND | 대상 차입금·대여금이 없는 경우 |
| 409 | LOAN_ALREADY_PROCESSED | 이미 전표처리된 건인 경우 |
| 422 | VOUCHER_MAPPING_MISSING | 전표 생성에 필요한 계정과목·거래처가 없는 경우 |

#### GET /loan-transactions — 차입금·대여금 원장을 조회한다 (`listLoanTransactions`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| loanId | integer int64 | 아니오 | loan_transaction.loan_id | 차입금·대여금 |
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| loanType | string(20) [BORROWING\|LENDING] | 아니오 | loan.loan_type | 구분 |
| partnerId | integer int64 | 아니오 | loan.partner_id | 거래처 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| loanTransactionId | integer int64 | loan_transaction.loan_transaction_id | 차입금·대여금 원장 ID |
| transactionType | string(20) [OCCURRENCE\|REPAYMENT\|INTEREST] | loan_transaction.transaction_type | 거래 유형 |
| transactionDate | string date | loan_transaction.transaction_date | 거래일 |
| amount | number | loan_transaction.amount | 거래금액 |
| balanceAfter | number | loan_transaction.balance_after | 거래 후 잔액 |
| memo | string(500) | loan_transaction.memo | 적요 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_DATE_RANGE | 조회 시작일이 종료일보다 늦은 경우 |

### FN-SFR-010-01 결산자료 입력·관리

- 요구사항: SFR-010-01 · 테이블: department, project, account_subject, accounting_unit, closing_data

#### GET /closing-data — 결산자료 목록을 조회한다 (`listClosingData`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| closingPeriod | string(7) | 예 | closing_data.closing_period | 결산 기간 |
| accountingUnitId | integer int64 | 예 | closing_data.accounting_unit_id | 회계단위 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| closingDataId | integer int64 | closing_data.closing_data_id | 결산자료 ID |
| closingPeriod | string(7) | closing_data.closing_period | 결산 기간 |
| accountingUnitId | integer int64 | closing_data.accounting_unit_id | 회계단위 |
| accountSubjectId | integer int64 | closing_data.account_subject_id | 계정과목 |
| projectId | integer int64 | closing_data.project_id | 프로젝트 |
| departmentId | integer int64 | closing_data.department_id | 부서 |
| closingAmount | number | closing_data.closing_amount | 결산 금액 |

오류: 공통 오류만 (1절)

#### POST /closing-data — 결산자료를 등록한다 (`createClosingData`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| closingPeriod | string(7) | 예 | closing_data.closing_period | 결산 기간 |
| accountingUnitId | integer int64 | 예 | closing_data.accounting_unit_id | 회계단위 |
| accountSubjectId | integer int64 | 예 | closing_data.account_subject_id | 계정과목 |
| projectId | integer int64 | 아니오 | closing_data.project_id | 프로젝트 |
| departmentId | integer int64 | 아니오 | closing_data.department_id | 부서 |
| closingAmount | number | 예 | closing_data.closing_amount | 결산 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| closingDataId | integer int64 | closing_data.closing_data_id | 결산자료 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | CLOSING_PERIOD_CLOSED | 마감된 기간인 경우 |

#### PATCH /closing-data/{closingDataId} — 결산자료를 수정한다 (`updateClosingData`)

- 권한: 예산·회계 담당자 · 경로 변수: closingDataId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| accountSubjectId | integer int64 | 아니오 | closing_data.account_subject_id | 계정과목 |
| projectId | integer int64 | 아니오 | closing_data.project_id | 프로젝트 |
| departmentId | integer int64 | 아니오 | closing_data.department_id | 부서 |
| closingAmount | number | 아니오 | closing_data.closing_amount | 결산 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| closingDataId | integer int64 | closing_data.closing_data_id | 결산자료 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | CLOSING_DATA_NOT_FOUND | 대상 결산자료가 없는 경우 |
| 409 | CLOSING_PERIOD_CLOSED | 마감된 기간의 결산자료인 경우 |

#### DELETE /closing-data/{closingDataId} — 결산자료를 삭제한다 (`deleteClosingData`)

- 권한: 예산·회계 담당자 · 경로 변수: closingDataId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | CLOSING_DATA_NOT_FOUND | 대상 결산자료가 없는 경우 |
| 409 | CLOSING_PERIOD_CLOSED | 마감된 기간의 결산자료인 경우 |

### FN-SFR-010-02 주요 재무제표 조회

- 요구사항: SFR-010-02 · 테이블: account_subject, journal_entry, journal_entry_line, accounting_unit, closing_data

#### GET /financial-statements — 재무제표 종류별 계정과목 금액을 조회한다 (`listFinancialStatements`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| statementType | string | 예 | - | 재무제표 종류 |
| startPeriod | string | 예 | - | 조회 시작 회계기간 |
| endPeriod | string | 예 | - | 조회 종료 회계기간 |
| accountingUnitId | integer int64 | 아니오 | closing_data.accounting_unit_id | 회계단위 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountSubjectId | integer int64 | account_subject.account_subject_id | 계정과목 ID |
| accountSubjectName | string(200) | account_subject.name | 계정과목 명칭 |
| amount | number | - | 계정과목별 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 시작 기간이 종료 기간보다 늦은 경우 |

### FN-SFR-010-03 관리용 재무상태표 조회

- 요구사항: SFR-010-03 · 테이블: department, project, account_subject, journal_entry, journal_entry_line, accounting_unit

#### GET /management-balance-sheets — 관리용 재무상태표를 조회한다 (`listManagementBalanceSheets`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| baseDate | string | 예 | - | 조회 기준일 또는 기간 |
| accountingUnitId | integer int64 | 아니오 | closing_data.accounting_unit_id | 회계단위 |
| projectId | integer int64 | 아니오 | journal_entry_line.project_id | 프로젝트 ID |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountSubjectId | integer int64 | account_subject.account_subject_id | 계정과목 ID |
| accountSubjectName | string(200) | account_subject.name | 계정과목 명칭 |
| category | string(10) [자산\|부채\|자본\|수익\|비용] | account_subject.category | 계정 구분 |
| amount | number | - | 계정과목 금액 |

오류: 공통 오류만 (1절)

### FN-SFR-010-04 관리용 손익계산서 조회

- 요구사항: SFR-010-04 · 테이블: department, project, account_subject, journal_entry, journal_entry_line, accounting_unit, management_item, allocation_rule

#### GET /management-income-statements — 관리용 손익계산서 또는 안분 현황 조회 (`listManagementIncomeStatements`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| viewType | string | 예 | - | 조회 구분 (손익계산서 또는 안분 현황) |
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| accountingUnitId | integer int64 | 아니오 | accounting_unit.accounting_unit_id | 회계단위 ID |
| projectId | integer int64 | 아니오 | project.project_id | 프로젝트 ID |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 ID |
| managementItemId | integer int64 | 아니오 | management_item.management_item_id | 관리항목 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountSubjectName | string(200) | account_subject.name | 계정과목 명칭 |
| category | string(10) [자산\|부채\|자본\|수익\|비용] | account_subject.category | 계정 구분 |
| projectName | string(200) | project.name | 프로젝트 명칭 |
| departmentName | string(100) | department.name | 부서명 |
| revenueAmount | number | - | 수익 금액 |
| expenseAmount | number | - | 비용 금액 |
| profitAmount | number | - | 손익 금액 |
| allocationRuleName | string(200) | allocation_rule.rule_name | 안분 기준명 |
| allocatedAmount | number | - | 안분 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 기간이 누락되었거나 시작일이 종료일보다 늦음 |

### FN-SFR-010-05 관리용 원가보고서 조회

- 요구사항: SFR-010-05 · 테이블: department, project, account_subject, journal_entry, journal_entry_line, accounting_unit

#### GET /management-cost-reports — 관리용 원가보고서 조회 (`listManagementCostReports`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| accountingUnitId | integer int64 | 아니오 | accounting_unit.accounting_unit_id | 회계단위 ID |
| projectId | integer int64 | 아니오 | project.project_id | 프로젝트 ID |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accountSubjectName | string(200) | account_subject.name | 계정과목 명칭 |
| projectName | string(200) | project.name | 프로젝트 명칭 |
| departmentName | string(100) | department.name | 부서명 |
| costAmount | number | - | 원가 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 기간이 누락되었거나 시작일이 종료일보다 늦음 |

### FN-SFR-010-06 부가가치세 관리

- 요구사항: SFR-010-06 · 테이블: partner, journal_entry, tax_invoice, vat_form

#### GET /vat-forms — 과세 기간·서식 구분별 부가가치세 서식 조회 (`listVatForms`)

- 권한: 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| taxPeriodStart | string date | 예 | vat_form.tax_period_start | 과세기간 시작일 |
| taxPeriodEnd | string date | 예 | vat_form.tax_period_end | 과세기간 종료일 |
| formType | string(30) [기본장부\|주요\|영세율첨부\|업종별첨부\|기타] | 예 | vat_form.form_type | 서식구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| vatFormId | integer int64 | vat_form.vat_form_id | 부가가치세 서식 ID |
| taxPeriodStart | string date | vat_form.tax_period_start | 과세기간 시작일 |
| taxPeriodEnd | string date | vat_form.tax_period_end | 과세기간 종료일 |
| formType | string(30) [기본장부\|주요\|영세율첨부\|업종별첨부\|기타] | vat_form.form_type | 서식구분 |
| formContent | string | vat_form.form_content | 서식 입력 내용 |
| isClosed | boolean | vat_form.is_closed | 마감 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | VAT_PERIOD_OR_FORM_TYPE_REQUIRED | 과세 기간 또는 서식 구분이 누락됨 |

#### POST /vat-forms — 전표·전자세금계산서 집계로 부가가치세 서식 생성 (`createVatForm`)

- 권한: 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| taxPeriodStart | string date | 예 | vat_form.tax_period_start | 과세기간 시작일 |
| taxPeriodEnd | string date | 예 | vat_form.tax_period_end | 과세기간 종료일 |
| formType | string(30) [기본장부\|주요\|영세율첨부\|업종별첨부\|기타] | 예 | vat_form.form_type | 서식구분 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| vatFormId | integer int64 | vat_form.vat_form_id | 부가가치세 서식 ID |
| formContent | string | vat_form.form_content | 서식 입력 내용 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | VAT_PERIOD_OR_FORM_TYPE_REQUIRED | 과세 기간 또는 서식 구분이 누락됨 |
| 409 | VAT_FORM_ALREADY_EXISTS | 같은 과세 기간·서식 구분의 서식이 이미 존재함 |

#### PATCH /vat-forms/{vatFormId} — 부가가치세 서식 내용 수정 (`updateVatForm`)

- 권한: 예산·회계 담당자 · 경로 변수: vatFormId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| formContent | string | 예 | vat_form.form_content | 서식 입력 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| vatFormId | integer int64 | vat_form.vat_form_id | 부가가치세 서식 ID |
| formContent | string | vat_form.form_content | 서식 입력 내용 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | VAT_FORM_NOT_FOUND | 서식이 존재하지 않음 |
| 409 | VAT_PERIOD_CLOSED | 마감된 과세 기간의 서식을 수정하려 함 |

### FN-SFR-011-01 고정자산 정보 등록·수정

- 요구사항: SFR-011-01 · 테이블: project, account_subject, partner, asset, change_history, asset_depreciation

#### POST /assets — 고정자산 등록 (`createAsset`)

- 권한: 자산 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| assetCode | string(50) | 예 | asset.asset_code | 자산코드 |
| assetNo | string(50) | 예 | asset.asset_no | 자산번호 |
| assetName | string(200) | 예 | asset.asset_name | 자산명 |
| isDepreciable | boolean | 예 | asset.is_depreciable | 상각 여부 |
| depreciationMethod | string(30) | 예 | asset.depreciation_method | 상각 방법 |
| usefulLifeMonths | integer int32 | 예 | asset.useful_life_months | 내용연수(월) |
| acquisitionAmount | number | 예 | asset.acquisition_amount | 취득원가 |
| accountSubjectId | integer int64 | 아니오 | asset.account_subject_id | 계정과목 |
| projectId | integer int64 | 아니오 | asset.project_id | 프로젝트 |
| partnerId | integer int64 | 아니오 | asset.partner_id | 거래처 |
| acquisitionDate | string date | 예 | asset_depreciation.acquisition_date | 취득일 |
| salvageValue | number | 아니오 | asset_depreciation.salvage_value | 잔존가액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetId | integer int64 | asset.asset_id | 자산 ID |
| assetCode | string(50) | asset.asset_code | 자산코드 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | ASSET_CODE_DUPLICATED | 이미 존재하는 고정자산 코드로 등록 |
| 422 | INVALID_ACQUISITION_AMOUNT | 취득원가가 음수이거나 숫자가 아님 |

#### GET /assets/{assetId} — 고정자산 단건 조회 (`getAsset`)

- 권한: 자산 담당자 · 경로 변수: assetId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetId | integer int64 | asset.asset_id | 자산 ID |
| assetCode | string(50) | asset.asset_code | 자산코드 |
| assetNo | string(50) | asset.asset_no | 자산번호 |
| assetName | string(200) | asset.asset_name | 자산명 |
| isDepreciable | boolean | asset.is_depreciable | 상각 여부 |
| depreciationMethod | string(30) | asset.depreciation_method | 상각 방법 |
| usefulLifeMonths | integer int32 | asset.useful_life_months | 내용연수(월) |
| acquisitionAmount | number | asset.acquisition_amount | 취득원가 |
| accountSubjectId | integer int64 | asset.account_subject_id | 계정과목 |
| projectId | integer int64 | asset.project_id | 프로젝트 |
| partnerId | integer int64 | asset.partner_id | 거래처 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ASSET_NOT_FOUND | 고정자산이 존재하지 않음 |

#### PATCH /assets/{assetId} — 고정자산 정보 수정 (`updateAsset`)

- 권한: 자산 담당자 · 경로 변수: assetId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| assetName | string(200) | 아니오 | asset.asset_name | 자산명 |
| isDepreciable | boolean | 아니오 | asset.is_depreciable | 상각 여부 |
| depreciationMethod | string(30) | 아니오 | asset.depreciation_method | 상각 방법 |
| usefulLifeMonths | integer int32 | 아니오 | asset.useful_life_months | 내용연수(월) |
| acquisitionAmount | number | 아니오 | asset.acquisition_amount | 취득원가 |
| accountSubjectId | integer int64 | 아니오 | asset.account_subject_id | 계정과목 |
| projectId | integer int64 | 아니오 | asset.project_id | 프로젝트 |
| partnerId | integer int64 | 아니오 | asset.partner_id | 거래처 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetId | integer int64 | asset.asset_id | 자산 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ASSET_NOT_FOUND | 고정자산이 존재하지 않음 |
| 422 | INVALID_ACQUISITION_AMOUNT | 취득원가가 음수이거나 숫자가 아님 |

### FN-SFR-011-02 고정자산 현황·명세 조회

- 요구사항: SFR-011-02, SFR-011-03, SFR-011-04, SFR-011-05 · 테이블: account_subject, asset, asset_depreciation

#### GET /asset-reports — 고정자산 현황·명세 조회 (`listAssetReports`)

- 권한: 자산 담당자, 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| reportType | string | 예 | - | 조회 유형 (감가상각비 현황/고정자산 명세서/변동 현황/관리대장/미상각자산 감가상각 명세서) |
| basis | string | 아니오 | - | 감가상각비 현황 기준 (전체/월별) |
| baseMonth | string | 아니오 | - | 조회 기준월 또는 기간 |
| assetCode | string(50) | 아니오 | asset.asset_code | 자산코드 |
| accountSubjectId | integer int64 | 아니오 | asset.account_subject_id | 계정과목 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetCode | string(50) | asset.asset_code | 자산코드 |
| assetName | string(200) | asset.asset_name | 자산명 |
| accountSubjectId | integer int64 | asset.account_subject_id | 계정과목 |
| acquisitionDate | string date | asset_depreciation.acquisition_date | 취득일 |
| acquisitionCost | number | asset_depreciation.acquisition_cost | 취득원가 |
| depreciationMethod | string(50) | asset_depreciation.depreciation_method | 감가상각 방법 |
| usefulLifeMonths | integer int32 | asset_depreciation.useful_life_months | 내용연수(개월) |
| depreciationAmount | number | - | 감가상각비 |
| changeAmount | number | - | 기간 중 증감 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD_FORMAT | 조회 기간 형식이 올바르지 않음 |

### FN-SFR-012-01 임직원 인사정보 등록·관리

- 요구사항: SFR-012-01 · 테이블: employee

#### POST /employees — 임직원 인사정보 등록 (`createEmployee`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeNo | string(50) | 예 | employee.employee_no | 사번 |
| name | string(100) | 예 | employee.name | 임직원명 |
| departmentId | integer int64 | 예 | employee.department_id | 주부서 |
| employmentStatus | string(20) [재직자\|퇴직자] | 예 | employee.employment_status | 재직 구분 |
| email | string(255) | 아니오 | employee.email | 이메일 |
| mobilePhone | string(20) | 아니오 | employee.mobile_phone | 휴대전화번호 |
| residentNo | string | 아니오 | - | 주민등록번호 (암호화 저장) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | employee.employee_id | 임직원 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | EMPLOYEE_NO_DUPLICATED | 이미 존재하는 사번으로 등록 |

#### PATCH /employees/{employeeId} — 임직원 인사정보 수정 (`updateEmployee`)

- 권한: 인사 담당자 · 경로 변수: employeeId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 아니오 | employee.name | 임직원명 |
| departmentId | integer int64 | 아니오 | employee.department_id | 주부서 |
| employmentStatus | string(20) [재직자\|퇴직자] | 아니오 | employee.employment_status | 재직 구분 |
| email | string(255) | 아니오 | employee.email | 이메일 |
| mobilePhone | string(20) | 아니오 | employee.mobile_phone | 휴대전화번호 |
| residentNo | string | 아니오 | - | 주민등록번호 (암호화 저장) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | employee.employee_id | 임직원 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 임직원이 존재하지 않음 |

#### GET /employees — 재직 구분별 임직원 목록 조회 (`listEmployees`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employmentStatus | string(20) [재직자\|퇴직자] | 아니오 | employee.employment_status | 재직 구분 |
| departmentId | integer int64 | 아니오 | employee.department_id | 주부서 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | employee.employee_id | 임직원 ID |
| employeeNo | string(50) | employee.employee_no | 사번 |
| name | string(100) | employee.name | 임직원명 |
| departmentId | integer int64 | employee.department_id | 주부서 |
| employmentStatus | string(20) [재직자\|퇴직자] | employee.employment_status | 재직 구분 |
| email | string(255) | employee.email | 이메일 |
| mobilePhone | string(20) | employee.mobile_phone | 휴대전화번호 |

오류: 공통 오류만 (1절)

### FN-SFR-012-02 인사정보 변경 신청 검토·승인

- 요구사항: SFR-012-02 · 테이블: approval_document, notification, change_history, personnel_record, personnel_change_request

#### GET /personnel-change-requests — 인사정보 변경 신청 목록 조회(변경 전후 내용 포함) (`listPersonnelChangeRequests`)

- 권한: 인사 담당자, 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| status | string(20) [신청\|승인\|반려] | 아니오 | personnel_change_request.status | 승인 처리 상태 |
| employeeId | integer int64 | 아니오 | personnel_change_request.employee_id | 신청 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelChangeRequestId | integer | - |  |
| employeeId | integer int64 | personnel_change_request.employee_id | 신청 임직원 |
| changeItem | string(100) | personnel_change_request.change_item | 변경 항목 |
| beforeValue | string | personnel_change_request.before_value_enc | 변경 전 값(암호화) |
| afterValue | string | personnel_change_request.after_value_enc | 변경 후 값(암호화) |
| requestReason | string | personnel_change_request.request_reason | 신청 사유 |
| status | string(20) [신청\|승인\|반려] | personnel_change_request.status | 승인 처리 상태 |
| rejectReason | string | personnel_change_request.reject_reason | 반려 사유 |

오류: 공통 오류만 (1절)

#### POST /personnel-change-requests — 임직원이 인사정보 변경을 신청 (`createPersonnelChangeRequest`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| changeItem | string(100) | 예 | personnel_change_request.change_item | 변경 항목 |
| afterValue | string | 예 | personnel_change_request.after_value_enc | 변경 후 값(암호화) |
| requestReason | string | 아니오 | personnel_change_request.request_reason | 신청 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelChangeRequestId | integer | - |  |
| status | string(20) [신청\|승인\|반려] | personnel_change_request.status | 승인 처리 상태 |

오류: 공통 오류만 (1절)

#### POST /personnel-change-requests/{personnelChangeRequestId}/review — 인사 담당자가 변경 신청을 승인 또는 반려 (`reviewPersonnelChangeRequest`)

- 권한: 인사 담당자 · 경로 변수: personnelChangeRequestId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| status | string(20) [신청\|승인\|반려] | 예 | personnel_change_request.status | 승인 처리 상태 |
| rejectReason | string | 아니오 | personnel_change_request.reject_reason | 반려 시 필수 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [신청\|승인\|반려] | personnel_change_request.status | 승인 처리 상태 |
| reviewedAt | string date-time | personnel_change_request.reviewed_at | 검토 일시 |
| rejectReason | string | personnel_change_request.reject_reason | 반려 사유 |
| appliedPersonnelRecordId | integer | - | 승인 시 반영된 인사기록카드 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONNEL_CHANGE_REQUEST_NOT_FOUND | 신청 건이 없음 |
| 409 | PERSONNEL_CHANGE_REQUEST_ALREADY_PROCESSED | 이미 승인 또는 반려된 신청 건을 재처리함 |
| 422 | REJECT_REASON_REQUIRED | 반려인데 반려 사유가 없음 |

### FN-SFR-012-03 인사정보 일괄 변경

- 요구사항: SFR-012-03 · 테이블: employee, change_history, personnel_record

#### POST /personnel-records/bulk-update — 선택한 임직원의 인사정보를 일괄 변경하고 성공·실패 결과를 반환 (`bulkUpdatePersonnelRecords`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeIds | array | 예 | - | 변경 대상 임직원 ID 목록 |
| changeItem | string | 예 | - | 변경할 인사정보 항목 |
| changeValue | string | 예 | - | 적용할 값 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| successCount | integer | - |  |
| failureCount | integer | - |  |
| failures | array | - | 실패 건의 임직원 ID와 사유 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_CHANGE_VALUE | 변경 값이 형식에 맞지 않아 변경을 중단함 |
| 422 | INVALID_CHANGE_ITEM | 변경할 수 없는 인사정보 항목임 |

### FN-SFR-012-04 기초 인적사항 등록·관리

- 요구사항: SFR-012-04 · 테이블: employee, personal_info_access_log, change_history, personnel_record

#### GET /personnel-records — 기초 인적사항 조회 (`listPersonnelRecords`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | personnel_record.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelRecordId | integer | - |  |
| employeeId | integer int64 | personnel_record.employee_id | 임직원 |
| hireDate | string date | personnel_record.hire_date | 입사일 |
| recruitmentType | string(50) | personnel_record.recruitment_type | 채용 구분 |
| recruitmentNote | string | personnel_record.recruitment_note | 채용 정보 비고 |
| address | string(1000) | personnel_record.address_enc | 주소(암호화) |
| veteranInfo | string(200) | personnel_record.veteran_info | 보훈 정보 |
| militaryServiceInfo | string(200) | personnel_record.military_service_info | 병역 정보 |

오류: 공통 오류만 (1절)

#### POST /personnel-records — 기초 인적사항 등록 (`createPersonnelRecord`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | personnel_record.employee_id | 임직원 |
| hireDate | string date | 예 | personnel_record.hire_date | 입사일 |
| recruitmentType | string(50) | 예 | personnel_record.recruitment_type | 채용 구분 |
| recruitmentNote | string | 아니오 | personnel_record.recruitment_note | 채용 정보 비고 |
| address | string(1000) | 아니오 | personnel_record.address_enc | 주소(암호화) |
| veteranInfo | string(200) | 아니오 | personnel_record.veteran_info | 보훈 정보 |
| militaryServiceInfo | string(200) | 아니오 | personnel_record.military_service_info | 병역 정보 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelRecordId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 대상 임직원이 없음 |
| 409 | PERSONNEL_RECORD_ALREADY_EXISTS | 해당 임직원의 인사기록카드가 이미 있음 |
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

#### PATCH /personnel-records/{personnelRecordId} — 기초 인적사항 수정 (`updatePersonnelRecord`)

- 권한: 인사 담당자 · 경로 변수: personnelRecordId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| hireDate | string date | 아니오 | personnel_record.hire_date | 입사일 |
| recruitmentType | string(50) | 아니오 | personnel_record.recruitment_type | 채용 구분 |
| recruitmentNote | string | 아니오 | personnel_record.recruitment_note | 채용 정보 비고 |
| address | string(1000) | 아니오 | personnel_record.address_enc | 주소(암호화) |
| veteranInfo | string(200) | 아니오 | personnel_record.veteran_info | 보훈 정보 |
| militaryServiceInfo | string(200) | 아니오 | personnel_record.military_service_info | 병역 정보 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelRecordId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONNEL_RECORD_NOT_FOUND | 인사기록카드가 없음 |
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

### FN-SFR-012-05 인사기록카드 상세정보 관리

- 요구사항: SFR-012-05 · 테이블: employee, change_history, personnel_record, employee_family, employee_education, employee_career, employee_license, employee_language, employee_evaluation, employee_reward_penalty, employee_business_trip, personnel_appointment, education_attendee

#### GET /employee-families — 가족 정보 조회 (`listEmployeeFamilies`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_family.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeFamilyId | integer | - |  |
| name | string(500) | employee_family.name_enc | 가족 성명(암호화) |
| relationship | string(50) | employee_family.relationship | 관계 |
| birthDate | string(500) | employee_family.birth_date_enc | 생년월일(암호화) |
| isDependent | boolean | employee_family.is_dependent | 부양가족 여부 |

오류: 공통 오류만 (1절)

#### POST /employee-families — 가족 정보 등록(부양가족 여부 지정) (`createEmployeeFamily`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_family.employee_id | 임직원 |
| name | string(500) | 예 | employee_family.name_enc | 가족 성명(암호화) |
| relationship | string(50) | 예 | employee_family.relationship | 관계 |
| birthDate | string(500) | 아니오 | employee_family.birth_date_enc | 생년월일(암호화) |
| residentNumber | string(500) | 아니오 | employee_family.resident_number_enc | 주민등록번호(암호화) |
| isDependent | boolean | 예 | employee_family.is_dependent | 부양가족 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeFamilyId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

#### PATCH /employee-families/{employeeFamilyId} — 가족 정보 수정 (`updateEmployeeFamily`)

- 권한: 인사 담당자 · 경로 변수: employeeFamilyId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(500) | 아니오 | employee_family.name_enc | 가족 성명(암호화) |
| relationship | string(50) | 아니오 | employee_family.relationship | 관계 |
| birthDate | string(500) | 아니오 | employee_family.birth_date_enc | 생년월일(암호화) |
| residentNumber | string(500) | 아니오 | employee_family.resident_number_enc | 주민등록번호(암호화) |
| isDependent | boolean | 아니오 | employee_family.is_dependent | 부양가족 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeFamilyId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_FAMILY_NOT_FOUND | 가족 정보가 없음 |

#### DELETE /employee-families/{employeeFamilyId} — 가족 정보 삭제 (`deleteEmployeeFamily`)

- 권한: 인사 담당자 · 경로 변수: employeeFamilyId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_FAMILY_NOT_FOUND | 가족 정보가 없음 |

#### GET /employee-educations — 학력 조회 (`listEmployeeEducations`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_education.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeEducationId | integer | - |  |
| schoolName | string(200) | employee_education.school_name | 학교명 |
| major | string(200) | employee_education.major | 전공 |
| degree | string(100) | employee_education.degree | 학위 |
| admissionDate | string date | employee_education.admission_date | 입학일 |
| graduationDate | string date | employee_education.graduation_date | 졸업일 |
| graduationStatus | string(50) | employee_education.graduation_status | 졸업 구분 |

오류: 공통 오류만 (1절)

#### POST /employee-educations — 학력 등록 (`createEmployeeEducation`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_education.employee_id | 임직원 |
| schoolName | string(200) | 예 | employee_education.school_name | 학교명 |
| major | string(200) | 아니오 | employee_education.major | 전공 |
| degree | string(100) | 아니오 | employee_education.degree | 학위 |
| admissionDate | string date | 아니오 | employee_education.admission_date | 입학일 |
| graduationDate | string date | 아니오 | employee_education.graduation_date | 졸업일 |
| graduationStatus | string(50) | 아니오 | employee_education.graduation_status | 졸업 구분 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeEducationId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

#### PATCH /employee-educations/{employeeEducationId} — 학력 수정 (`updateEmployeeEducation`)

- 권한: 인사 담당자 · 경로 변수: employeeEducationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| schoolName | string(200) | 아니오 | employee_education.school_name | 학교명 |
| major | string(200) | 아니오 | employee_education.major | 전공 |
| degree | string(100) | 아니오 | employee_education.degree | 학위 |
| admissionDate | string date | 아니오 | employee_education.admission_date | 입학일 |
| graduationDate | string date | 아니오 | employee_education.graduation_date | 졸업일 |
| graduationStatus | string(50) | 아니오 | employee_education.graduation_status | 졸업 구분 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeEducationId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_EDUCATION_NOT_FOUND | 학력 정보가 없음 |

#### DELETE /employee-educations/{employeeEducationId} — 학력 삭제 (`deleteEmployeeEducation`)

- 권한: 인사 담당자 · 경로 변수: employeeEducationId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_EDUCATION_NOT_FOUND | 학력 정보가 없음 |

#### GET /employee-careers — 경력 조회 (`listEmployeeCareers`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_career.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeCareerId | integer | - |  |
| companyName | string(200) | employee_career.company_name | 근무처명 |
| departmentName | string(200) | employee_career.department_name | 근무부서 |
| positionTitle | string(100) | employee_career.position_title | 직위·직책 |
| jobDescription | string | employee_career.job_description | 담당업무 |
| startDate | string date | employee_career.start_date | 근무 시작일 |
| endDate | string date | employee_career.end_date | 근무 종료일 |

오류: 공통 오류만 (1절)

#### POST /employee-careers — 경력 등록 (`createEmployeeCareer`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_career.employee_id | 임직원 |
| companyName | string(200) | 예 | employee_career.company_name | 근무처명 |
| departmentName | string(200) | 아니오 | employee_career.department_name | 근무부서 |
| positionTitle | string(100) | 아니오 | employee_career.position_title | 직위·직책 |
| jobDescription | string | 아니오 | employee_career.job_description | 담당업무 |
| startDate | string date | 예 | employee_career.start_date | 근무 시작일 |
| endDate | string date | 아니오 | employee_career.end_date | 근무 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeCareerId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

#### PATCH /employee-careers/{employeeCareerId} — 경력 수정 (`updateEmployeeCareer`)

- 권한: 인사 담당자 · 경로 변수: employeeCareerId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| companyName | string(200) | 아니오 | employee_career.company_name | 근무처명 |
| departmentName | string(200) | 아니오 | employee_career.department_name | 근무부서 |
| positionTitle | string(100) | 아니오 | employee_career.position_title | 직위·직책 |
| jobDescription | string | 아니오 | employee_career.job_description | 담당업무 |
| startDate | string date | 아니오 | employee_career.start_date | 근무 시작일 |
| endDate | string date | 아니오 | employee_career.end_date | 근무 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeCareerId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_CAREER_NOT_FOUND | 경력 정보가 없음 |

#### DELETE /employee-careers/{employeeCareerId} — 경력 삭제 (`deleteEmployeeCareer`)

- 권한: 인사 담당자 · 경로 변수: employeeCareerId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_CAREER_NOT_FOUND | 경력 정보가 없음 |

#### GET /employee-licenses — 자격·면허 조회 (`listEmployeeLicenses`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_license.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeLicenseId | integer | - |  |
| licenseName | string(200) | employee_license.license_name | 자격·면허명 |
| issuingOrganization | string(200) | employee_license.issuing_organization | 발급기관 |
| acquiredDate | string date | employee_license.acquired_date | 취득일 |
| expiryDate | string date | employee_license.expiry_date | 만료일 |
| licenseNumber | string(500) | employee_license.license_number_enc | 자격·면허번호(암호화) |

오류: 공통 오류만 (1절)

#### POST /employee-licenses — 자격·면허 등록 (`createEmployeeLicense`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_license.employee_id | 임직원 |
| licenseName | string(200) | 예 | employee_license.license_name | 자격·면허명 |
| issuingOrganization | string(200) | 아니오 | employee_license.issuing_organization | 발급기관 |
| acquiredDate | string date | 아니오 | employee_license.acquired_date | 취득일 |
| expiryDate | string date | 아니오 | employee_license.expiry_date | 만료일 |
| licenseNumber | string(500) | 아니오 | employee_license.license_number_enc | 자격·면허번호(암호화) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeLicenseId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

#### PATCH /employee-licenses/{employeeLicenseId} — 자격·면허 수정 (`updateEmployeeLicense`)

- 권한: 인사 담당자 · 경로 변수: employeeLicenseId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| licenseName | string(200) | 아니오 | employee_license.license_name | 자격·면허명 |
| issuingOrganization | string(200) | 아니오 | employee_license.issuing_organization | 발급기관 |
| acquiredDate | string date | 아니오 | employee_license.acquired_date | 취득일 |
| expiryDate | string date | 아니오 | employee_license.expiry_date | 만료일 |
| licenseNumber | string(500) | 아니오 | employee_license.license_number_enc | 자격·면허번호(암호화) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeLicenseId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_LICENSE_NOT_FOUND | 자격·면허 정보가 없음 |

#### DELETE /employee-licenses/{employeeLicenseId} — 자격·면허 삭제 (`deleteEmployeeLicense`)

- 권한: 인사 담당자 · 경로 변수: employeeLicenseId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_LICENSE_NOT_FOUND | 자격·면허 정보가 없음 |

#### GET /employee-languages — 외국어 조회 (`listEmployeeLanguages`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_language.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeLanguageId | integer | - |  |
| languageName | string(100) | employee_language.language_name | 외국어명 |
| testName | string(200) | employee_language.test_name | 시험명 |
| score | number | employee_language.score | 점수 |
| grade | string(50) | employee_language.grade | 등급 |
| testDate | string date | employee_language.test_date | 취득일 |
| expiryDate | string date | employee_language.expiry_date | 유효기간 만료일 |

오류: 공통 오류만 (1절)

#### POST /employee-languages — 외국어 등록 (`createEmployeeLanguage`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_language.employee_id | 임직원 |
| languageName | string(100) | 예 | employee_language.language_name | 외국어명 |
| testName | string(200) | 아니오 | employee_language.test_name | 시험명 |
| score | number | 아니오 | employee_language.score | 점수 |
| grade | string(50) | 아니오 | employee_language.grade | 등급 |
| testDate | string date | 아니오 | employee_language.test_date | 취득일 |
| expiryDate | string date | 아니오 | employee_language.expiry_date | 유효기간 만료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeLanguageId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

#### PATCH /employee-languages/{employeeLanguageId} — 외국어 수정 (`updateEmployeeLanguage`)

- 권한: 인사 담당자 · 경로 변수: employeeLanguageId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| languageName | string(100) | 아니오 | employee_language.language_name | 외국어명 |
| testName | string(200) | 아니오 | employee_language.test_name | 시험명 |
| score | number | 아니오 | employee_language.score | 점수 |
| grade | string(50) | 아니오 | employee_language.grade | 등급 |
| testDate | string date | 아니오 | employee_language.test_date | 취득일 |
| expiryDate | string date | 아니오 | employee_language.expiry_date | 유효기간 만료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeLanguageId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_LANGUAGE_NOT_FOUND | 외국어 정보가 없음 |

#### DELETE /employee-languages/{employeeLanguageId} — 외국어 삭제 (`deleteEmployeeLanguage`)

- 권한: 인사 담당자 · 경로 변수: employeeLanguageId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_LANGUAGE_NOT_FOUND | 외국어 정보가 없음 |

#### GET /employee-evaluations — 인사고과 조회 (`listEmployeeEvaluations`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_evaluation.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeEvaluationId | integer | - |  |
| periodStartDate | string date | employee_evaluation.period_start_date | 대상기간 시작일 |
| periodEndDate | string date | employee_evaluation.period_end_date | 대상기간 종료일 |
| evaluationGrade | string(50) | employee_evaluation.evaluation_grade | 고과 등급 |
| evaluationScore | number | employee_evaluation.evaluation_score | 고과 점수 |
| evaluatorName | string(100) | employee_evaluation.evaluator_name | 평가자 |
| comment | string | employee_evaluation.comment | 평가 의견 |

오류: 공통 오류만 (1절)

#### POST /employee-evaluations — 인사고과 등록 (`createEmployeeEvaluation`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_evaluation.employee_id | 임직원 |
| periodStartDate | string date | 예 | employee_evaluation.period_start_date | 대상기간 시작일 |
| periodEndDate | string date | 예 | employee_evaluation.period_end_date | 대상기간 종료일 |
| evaluationGrade | string(50) | 아니오 | employee_evaluation.evaluation_grade | 고과 등급 |
| evaluationScore | number | 아니오 | employee_evaluation.evaluation_score | 고과 점수 |
| evaluatorName | string(100) | 아니오 | employee_evaluation.evaluator_name | 평가자 |
| comment | string | 아니오 | employee_evaluation.comment | 평가 의견 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeEvaluationId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

#### PATCH /employee-evaluations/{employeeEvaluationId} — 인사고과 수정 (`updateEmployeeEvaluation`)

- 권한: 인사 담당자 · 경로 변수: employeeEvaluationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| periodStartDate | string date | 아니오 | employee_evaluation.period_start_date | 대상기간 시작일 |
| periodEndDate | string date | 아니오 | employee_evaluation.period_end_date | 대상기간 종료일 |
| evaluationGrade | string(50) | 아니오 | employee_evaluation.evaluation_grade | 고과 등급 |
| evaluationScore | number | 아니오 | employee_evaluation.evaluation_score | 고과 점수 |
| evaluatorName | string(100) | 아니오 | employee_evaluation.evaluator_name | 평가자 |
| comment | string | 아니오 | employee_evaluation.comment | 평가 의견 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeEvaluationId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_EVALUATION_NOT_FOUND | 인사고과 정보가 없음 |

#### DELETE /employee-evaluations/{employeeEvaluationId} — 인사고과 삭제 (`deleteEmployeeEvaluation`)

- 권한: 인사 담당자 · 경로 변수: employeeEvaluationId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_EVALUATION_NOT_FOUND | 인사고과 정보가 없음 |

#### GET /employee-reward-penalties — 상벌 조회 (`listEmployeeRewardPenalties`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_reward_penalty.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeRewardPenaltyId | integer | - |  |
| rewardPenaltyType | string(50) | employee_reward_penalty.reward_penalty_type | 상벌 구분 |
| title | string(200) | employee_reward_penalty.title | 상벌명 |
| awardedDate | string date | employee_reward_penalty.awarded_date | 상벌 일자 |
| issuer | string(200) | employee_reward_penalty.issuer | 수여·시행 기관 |
| content | string | employee_reward_penalty.content | 상벌 내용 |

오류: 공통 오류만 (1절)

#### POST /employee-reward-penalties — 상벌 등록 (`createEmployeeRewardPenalty`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_reward_penalty.employee_id | 임직원 |
| rewardPenaltyType | string(50) | 예 | employee_reward_penalty.reward_penalty_type | 상벌 구분 |
| title | string(200) | 예 | employee_reward_penalty.title | 상벌명 |
| awardedDate | string date | 예 | employee_reward_penalty.awarded_date | 상벌 일자 |
| issuer | string(200) | 아니오 | employee_reward_penalty.issuer | 수여·시행 기관 |
| content | string | 아니오 | employee_reward_penalty.content | 상벌 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeRewardPenaltyId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

#### PATCH /employee-reward-penalties/{employeeRewardPenaltyId} — 상벌 수정 (`updateEmployeeRewardPenalty`)

- 권한: 인사 담당자 · 경로 변수: employeeRewardPenaltyId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| rewardPenaltyType | string(50) | 아니오 | employee_reward_penalty.reward_penalty_type | 상벌 구분 |
| title | string(200) | 아니오 | employee_reward_penalty.title | 상벌명 |
| awardedDate | string date | 아니오 | employee_reward_penalty.awarded_date | 상벌 일자 |
| issuer | string(200) | 아니오 | employee_reward_penalty.issuer | 수여·시행 기관 |
| content | string | 아니오 | employee_reward_penalty.content | 상벌 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeRewardPenaltyId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_REWARD_PENALTY_NOT_FOUND | 상벌 정보가 없음 |

#### DELETE /employee-reward-penalties/{employeeRewardPenaltyId} — 상벌 삭제 (`deleteEmployeeRewardPenalty`)

- 권한: 인사 담당자 · 경로 변수: employeeRewardPenaltyId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_REWARD_PENALTY_NOT_FOUND | 상벌 정보가 없음 |

#### GET /employee-business-trips — 인사기록 출장 조회 (`listEmployeeBusinessTrips`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_business_trip.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeBusinessTripId | integer | - |  |
| destination | string(200) | employee_business_trip.destination | 출장지 |
| startDate | string date | employee_business_trip.start_date | 출장 시작일 |
| endDate | string date | employee_business_trip.end_date | 출장 종료일 |
| purpose | string(500) | employee_business_trip.purpose | 출장 목적 |
| remark | string | employee_business_trip.remark | 비고 |

오류: 공통 오류만 (1절)

#### POST /employee-business-trips — 인사기록 출장 등록 (`createEmployeeBusinessTrip`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_business_trip.employee_id | 임직원 |
| destination | string(200) | 예 | employee_business_trip.destination | 출장지 |
| startDate | string date | 예 | employee_business_trip.start_date | 출장 시작일 |
| endDate | string date | 예 | employee_business_trip.end_date | 출장 종료일 |
| purpose | string(500) | 아니오 | employee_business_trip.purpose | 출장 목적 |
| remark | string | 아니오 | employee_business_trip.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeBusinessTripId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수 항목이 누락됨 |

#### PATCH /employee-business-trips/{employeeBusinessTripId} — 인사기록 출장 수정 (`updateEmployeeBusinessTrip`)

- 권한: 인사 담당자 · 경로 변수: employeeBusinessTripId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| destination | string(200) | 아니오 | employee_business_trip.destination | 출장지 |
| startDate | string date | 아니오 | employee_business_trip.start_date | 출장 시작일 |
| endDate | string date | 아니오 | employee_business_trip.end_date | 출장 종료일 |
| purpose | string(500) | 아니오 | employee_business_trip.purpose | 출장 목적 |
| remark | string | 아니오 | employee_business_trip.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeBusinessTripId | integer | - |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_BUSINESS_TRIP_NOT_FOUND | 출장 정보가 없음 |

#### DELETE /employee-business-trips/{employeeBusinessTripId} — 인사기록 출장 삭제 (`deleteEmployeeBusinessTrip`)

- 권한: 인사 담당자 · 경로 변수: employeeBusinessTripId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_BUSINESS_TRIP_NOT_FOUND | 출장 정보가 없음 |

#### GET /personnel-appointments — 인사발령 내역 조회 (`listPersonnelAppointments`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | personnel_appointment.employee_id | 발령 대상 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelAppointmentId | integer | - |  |
| departmentId | integer int64 | personnel_appointment.department_id | 발령 후 부서 |
| appointmentType | string(50) | personnel_appointment.appointment_type | 발령 구분 |
| appointmentDate | string date | personnel_appointment.appointment_date | 발령일자 |
| positionAfter | string(100) | personnel_appointment.position_after | 발령 후 직위·직책 |
| status | string(20) [신청\|승인\|반려\|마감\|마감 취소\|승인 취소] | personnel_appointment.status | 발령 상태 |

오류: 공통 오류만 (1절)

#### GET /education-attendees — 교육이수 내역 조회 (`listEducationAttendees`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | education_attendee.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationAttendeeId | integer | - |  |
| educationSessionId | integer int64 | education_attendee.education_session_id | 교육차수 |

오류: 공통 오류만 (1절)

### FN-SFR-012-06 인사정보·인사기록카드 엑셀 업로드 후속 처리

- 요구사항: SFR-012-03, SFR-012-06 · 테이블: employee, upload_history, change_history, personnel_record

#### POST /upload-histories/personnel-records — 인사정보·인사기록카드 엑셀을 검증하고 정상 건을 반영 (`uploadPersonnelRecords`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| file | string | 예 | - | 업로드 엑셀 파일 |
| uploadTarget | string | 예 | - | 업로드 대상 구분(인사정보 또는 인사기록카드) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| uploadHistoryId | integer | - |  |
| totalCount | integer int32 | upload_history.total_count | 전체 건수 |
| successCount | integer int32 | upload_history.success_count | 정상 반영 건수 |
| errorCount | integer int32 | upload_history.error_count | 오류 건수 |
| errorDetail | string | upload_history.error_detail | 오류 내역 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_UPLOAD_FORMAT | 양식 형식이 맞지 않음 |

### FN-SFR-012-07 휴직·단축근무 신청 검토·승인

- 요구사항: SFR-012-07 · 테이블: employee, approval_document, notification, change_history, personnel_record, leave_of_absence_request

#### GET /leave-of-absence-requests — 휴직·단축근무 신청 목록 조회 (`listLeaveOfAbsenceRequests`)

- 권한: 인사 담당자, 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| status | string(20) [신청\|승인\|반려] | 아니오 | leave_of_absence_request.status | 승인 처리 상태 |
| employeeId | integer int64 | 아니오 | leave_of_absence_request.employee_id | 신청 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| leaveOfAbsenceRequestId | integer | - |  |
| employeeId | integer int64 | leave_of_absence_request.employee_id | 신청 임직원 |
| requestType | string(50) | leave_of_absence_request.request_type | 신청 구분 |
| startDate | string date | leave_of_absence_request.start_date | 시작일 |
| endDate | string date | leave_of_absence_request.end_date | 종료일 |
| reason | string | leave_of_absence_request.reason | 신청 사유 |
| status | string(20) [신청\|승인\|반려] | leave_of_absence_request.status | 승인 처리 상태 |
| rejectReason | string | leave_of_absence_request.reject_reason | 반려 사유 |

오류: 공통 오류만 (1절)

#### POST /leave-of-absence-requests — 임직원이 휴직 또는 단축근무를 신청 (`createLeaveOfAbsenceRequest`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| requestType | string(50) | 예 | leave_of_absence_request.request_type | 신청 구분 |
| startDate | string date | 예 | leave_of_absence_request.start_date | 시작일 |
| endDate | string date | 예 | leave_of_absence_request.end_date | 종료일 |
| reason | string | 아니오 | leave_of_absence_request.reason | 신청 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| leaveOfAbsenceRequestId | integer | - |  |
| status | string(20) [신청\|승인\|반려] | leave_of_absence_request.status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_DATE_RANGE | 종료일이 시작일보다 빠름 |

#### POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review — 인사 담당자가 휴직·단축근무 신청을 승인 또는 반려 (`reviewLeaveOfAbsenceRequest`)

- 권한: 인사 담당자 · 경로 변수: leaveOfAbsenceRequestId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| status | string(20) [신청\|승인\|반려] | 예 | leave_of_absence_request.status | 승인 처리 상태 |
| rejectReason | string | 아니오 | leave_of_absence_request.reject_reason | 반려 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [신청\|승인\|반려] | leave_of_absence_request.status | 승인 처리 상태 |
| reviewedAt | string date-time | leave_of_absence_request.reviewed_at | 검토 일시 |
| appliedPersonnelRecordId | integer | - | 승인 시 재직정보가 반영된 인사기록카드 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | LEAVE_OF_ABSENCE_REQUEST_NOT_FOUND | 신청 건이 없음 |
| 409 | LEAVE_OF_ABSENCE_REQUEST_ALREADY_PROCESSED | 이미 승인 또는 반려된 신청을 재처리함 |

### FN-SFR-013-01 인사발령 신청 검토·승인

- 요구사항: SFR-013-01 · 테이블: employee, menu_permission, approval_document, notification, change_history, personnel_appointment

#### GET /personnel-appointments — 인사발령 신청내역 목록 조회 (`listPersonnelAppointments`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /personnel-appointments/{personnelAppointmentId}/approve — 인사발령 신청 승인 (`approvePersonnelAppointment`)

- 권한: 인사 담당자 · 경로 변수: personnelAppointmentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| reviewComment | string | 아니오 | - | 검토 의견 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelAppointmentId | integer int64 | personnel_appointment.personnel_appointment_id | 인사발령 ID |
| status | string(20) [신청\|승인\|반려\|마감\|마감 취소\|승인 취소] | personnel_appointment.status | 발령 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONNEL_APPOINTMENT_NOT_FOUND | 대상 인사발령 신청 건이 없음 |
| 409 | PERSONNEL_APPOINTMENT_STATUS_MISMATCH | 신청 상태가 아닌 건을 승인하려 함 |
| 502 | APPROVAL_LINK_FAILED | 전자결재 연계(S3) 결과 반영 실패 |

#### POST /personnel-appointments/{personnelAppointmentId}/reject — 인사발령 신청 반려 (`rejectPersonnelAppointment`)

- 권한: 인사 담당자 · 경로 변수: personnelAppointmentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| rejectReason | string | 예 | personnel_appointment.reject_reason | 반려 사유 |
| reviewComment | string | 아니오 | - | 검토 의견 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelAppointmentId | integer int64 | personnel_appointment.personnel_appointment_id | 인사발령 ID |
| status | string(20) [신청\|승인\|반려\|마감\|마감 취소\|승인 취소] | personnel_appointment.status | 발령 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONNEL_APPOINTMENT_NOT_FOUND | 대상 인사발령 신청 건이 없음 |
| 409 | PERSONNEL_APPOINTMENT_STATUS_MISMATCH | 신청 상태가 아닌 건을 반려하려 함 |
| 422 | REJECT_REASON_REQUIRED | 반려 사유 없이 반려를 시도함 |
| 502 | APPROVAL_LINK_FAILED | 전자결재 연계(S3) 결과 반영 실패 |

### FN-SFR-013-02 인사발령 대상자 등록 및 발령상태 관리

- 요구사항: SFR-013-02 · 테이블: employee, department, personal_info_access_log, change_history, personnel_record, personnel_appointment

#### POST /personnel-appointments — 인사발령 대상자 등록 (`createPersonnelAppointment`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | personnel_appointment.employee_id | 발령 대상 임직원 |
| appointmentType | string(50) | 예 | personnel_appointment.appointment_type | 발령 구분 |
| appointmentDate | string date | 예 | personnel_appointment.appointment_date | 발령일자 |
| departmentId | integer int64 | 예 | personnel_appointment.department_id | 발령 후 부서 |
| positionAfter | string(100) | 아니오 | personnel_appointment.position_after | 발령 후 직위·직책 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelAppointmentId | integer int64 | personnel_appointment.personnel_appointment_id | 인사발령 ID |
| status | string(20) [신청\|승인\|반려\|마감\|마감 취소\|승인 취소] | personnel_appointment.status | 발령 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 인사기록카드에 없는 임직원을 선택함 |
| 422 | INVALID_APPOINTMENT_INPUT | 필수 입력값 누락 또는 값 검증 실패 |

#### PATCH /personnel-appointments/{personnelAppointmentId}/status — 발령상태 변경 (`updatePersonnelAppointmentStatus`)

- 권한: 인사 담당자 · 경로 변수: personnelAppointmentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| status | string(20) [신청\|승인\|반려\|마감\|마감 취소\|승인 취소] | 예 | personnel_appointment.status | 발령 상태 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelAppointmentId | integer int64 | personnel_appointment.personnel_appointment_id | 인사발령 ID |
| status | string(20) [신청\|승인\|반려\|마감\|마감 취소\|승인 취소] | personnel_appointment.status | 발령 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONNEL_APPOINTMENT_NOT_FOUND | 대상자가 없음 |
| 409 | APPOINTMENT_ALREADY_PROCESSED | 발령 처리가 완료된 대상자를 수정하려 함 |

### FN-SFR-013-03 인사발령 처리 및 발령공고 자동 게시

- 요구사항: SFR-013-03 · 테이블: department, notification, personal_info_access_log, change_history, personnel_record, personnel_appointment, board_post

#### POST /personnel-appointments/{personnelAppointmentId}/process — 승인된 인사발령 처리 및 발령공고 게시 (`processPersonnelAppointment`)

- 권한: 인사 담당자 · 경로 변수: personnelAppointmentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| boardId | integer | 아니오 | - | 공고 게시 게시판 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelAppointmentId | integer int64 | personnel_appointment.personnel_appointment_id | 인사발령 ID |
| status | string(20) [신청\|승인\|반려\|마감\|마감 취소\|승인 취소] | personnel_appointment.status | 발령 상태 |
| boardPostId | integer int64 | board_post.board_post_id | 공지·게시물 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONNEL_APPOINTMENT_NOT_FOUND | 처리 대상 발령이 없음 |
| 409 | PERSONNEL_APPOINTMENT_STATUS_MISMATCH | 승인 상태가 아닌 건을 처리하려 함 |
| 502 | ANNOUNCEMENT_POST_FAILED | 발령공고 게시 실패(처리 결과는 유지) |

#### POST /personnel-appointments/{personnelAppointmentId}/repost-announcement — 발령공고 재게시 (`repostAppointmentAnnouncement`)

- 권한: 인사 담당자 · 경로 변수: personnelAppointmentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| boardId | integer | 아니오 | - | 공고 게시 게시판 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| boardPostId | integer int64 | board_post.board_post_id | 공지·게시물 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONNEL_APPOINTMENT_NOT_FOUND | 대상 발령이 없음 |
| 502 | ANNOUNCEMENT_POST_FAILED | 발령공고 게시 실패 |

### FN-SFR-013-04 인사발령 이력·현황 조회 및 보고서 생성

- 요구사항: SFR-013-04 · 테이블: employee, department, menu_permission, personal_info_access_log, personnel_record, personnel_appointment

#### GET /personnel-appointment-histories — 인사발령 이력 조회 (`listPersonnelAppointmentHistories`)

- 권한: 인사 담당자, 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 아니오 | - | 발령일자 조회 시작 |
| endDate | string | 아니오 | - | 발령일자 조회 종료 |
| viewScope | string(10) [전체\|부서\|개인] | 아니오 | menu_permission.view_scope | 조회 범위 |
| departmentId | integer int64 | 아니오 | personnel_appointment.department_id | 발령 후 부서 |
| employeeId | integer int64 | 아니오 | personnel_appointment.employee_id | 발령 대상 임직원 |
| appointmentType | string(50) | 아니오 | personnel_appointment.appointment_type | 발령 구분 |
| employmentStatus | string(20) [재직자\|퇴직자] | 아니오 | personnel_record.employment_status | 재직 구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelAppointmentId | integer int64 | personnel_appointment.personnel_appointment_id | 인사발령 ID |
| employeeId | integer int64 | personnel_appointment.employee_id | 발령 대상 임직원 |
| appointmentType | string(50) | personnel_appointment.appointment_type | 발령 구분 |
| appointmentDate | string date | personnel_appointment.appointment_date | 발령일자 |
| departmentId | integer int64 | personnel_appointment.department_id | 발령 후 부서 |
| positionAfter | string(100) | personnel_appointment.position_after | 발령 후 직위·직책 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | VIEW_SCOPE_NOT_ALLOWED | 권한 범위 밖 조회 범위를 지정함 |

#### GET /personnel-appointment-histories/summary — 발령 구분별 현황 집계 (`getPersonnelAppointmentSummary`)

- 권한: 인사 담당자, 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 아니오 | - |  |
| endDate | string | 아니오 | - |  |
| viewScope | string(10) [전체\|부서\|개인] | 아니오 | menu_permission.view_scope | 조회 범위 |
| departmentId | integer int64 | 아니오 | personnel_appointment.department_id | 발령 후 부서 |
| employeeId | integer int64 | 아니오 | personnel_appointment.employee_id | 발령 대상 임직원 |
| employmentStatus | string(20) [재직자\|퇴직자] | 아니오 | personnel_record.employment_status | 재직 구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| appointmentType | string(50) | personnel_appointment.appointment_type | 발령 구분 |
| count | integer | - | 발령 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | VIEW_SCOPE_NOT_ALLOWED | 권한 범위 밖 조회 범위를 지정함 |

#### POST /personnel-appointment-reports — 인사발령 현황 보고서 생성 (`createPersonnelAppointmentReport`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| reportType | string | 예 | - | 보고서 종류(승진현황 등) |
| startDate | string | 아니오 | - |  |
| endDate | string | 아니오 | - |  |
| viewScope | string(10) [전체\|부서\|개인] | 아니오 | menu_permission.view_scope | 조회 범위 |
| departmentId | integer int64 | 아니오 | personnel_appointment.department_id | 발령 후 부서 |
| employeeId | integer int64 | 아니오 | personnel_appointment.employee_id | 발령 대상 임직원 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| reportType | string | - |  |
| items | array | - | 보고서 대상 발령 이력 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | NO_REPORT_DATA | 조건에 해당하는 이력이 없어 보고서를 생성하지 않음 |

### FN-SFR-014-01 인사정보 현황 조회

- 요구사항: SFR-014-01 · 테이블: employee, department, menu_permission, personal_info_access_log, personnel_record

#### GET /personnel-records — 인사정보 현황 조회 (`listPersonnelRecords`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-014-02 인사기록 현황 조회

- 요구사항: SFR-014-02 · 테이블: employee, department, menu_permission, personal_info_access_log, personnel_record, employee_family, employee_education, employee_career, employee_license, employee_language, employee_evaluation, employee_reward_penalty, employee_business_trip

#### GET /personnel-record-items — 인사기록 항목별 현황 조회 (`listPersonnelRecordItems`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| itemType | string | 예 | - | 인사기록 항목(출장, 자격·면허, 외국어 등) |
| viewScope | string(10) [전체\|부서\|개인] | 아니오 | menu_permission.view_scope | 조회 범위 |
| employmentStatus | string(20) [재직자\|퇴직자] | 아니오 | personnel_record.employment_status | 재직 구분 |
| departmentId | integer int64 | 아니오 | employee.department_id | 주부서 |
| keyword | string | 아니오 | - | 임직원 이름 또는 사번 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | employee.employee_id | 임직원 ID |
| employeeName | string(100) | employee.name | 임직원명 |
| items | array | - | 선택 항목별 인사기록 내용 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | ITEM_TYPE_REQUIRED | 인사기록 항목을 선택하지 않고 조회함 |
| 422 | VIEW_SCOPE_NOT_ALLOWED | 조회 범위를 권한 범위 밖으로 지정함 |

### FN-SFR-014-03 임직원 현황 조회

- 요구사항: SFR-014-03 · 테이블: employee, department, menu_permission, personal_info_access_log, personnel_record, employee_family, personnel_appointment

#### GET /personnel-status — 임직원 입·퇴사, 휴직, 근속연수, 가족, 학력·경력 현황을 조회한다 (`listPersonnelStatus`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| statusType | string | 예 | - | 현황 구분 (입·퇴사/휴직/근속연수/가족/학력·경력) |
| startDate | string | 아니오 | - | 조회 시작일 |
| endDate | string | 아니오 | - | 조회 종료일 |
| viewScope | string | 아니오 | - | 조회 범위 (전체/부서/개인) |
| employmentStatus | string(20) [재직자\|퇴직자] | 아니오 | personnel_record.employment_status | 재직 구분 |
| departmentId | integer int64 | 아니오 | employee.department_id | 주부서 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | employee.employee_id | 임직원 ID |
| employeeNo | string(50) | employee.employee_no | 사번 |
| employeeName | string(100) | employee.name | 임직원명 |
| departmentName | string(100) | department.name | 부서명 |
| hireDate | string date | personnel_record.hire_date | 입사일 |
| resignationDate | string date | personnel_record.resignation_date | 퇴사일 |
| employmentStatus | string(20) [재직자\|퇴직자] | personnel_record.employment_status | 재직 구분 |
| appointmentType | string(50) | personnel_appointment.appointment_type | 발령 구분 |
| appointmentDate | string date | personnel_appointment.appointment_date | 발령일자 |
| familyRelationship | string(50) | employee_family.relationship | 관계 |
| serviceYears | number | - | 근속연수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 시작일이 종료일보다 늦은 경우 |
| 422 | STATUS_TYPE_REQUIRED | 현황 구분을 선택하지 않은 경우 |

### FN-SFR-015-01 고과 및 상벌현황 조회

- 요구사항: SFR-015-01 · 테이블: employee, department, personal_info_access_log, personnel_record, employee_evaluation, employee_reward_penalty

#### GET /employee-evaluations — 인사고과 현황을 조회한다 (`listEmployeeEvaluations`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /employee-reward-penalties — 상벌 현황을 조회한다 (`listEmployeeRewardPenalties`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-015-02 교육과정 및 대상자 관리

- 요구사항: SFR-015-02 · 테이블: employee, change_history, education_code, education_course, education_session, education_attendee, education_result_report

#### POST /education-courses — 교육과정을 등록한다 (`createEducationCourse`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| courseName | string(200) | 예 | education_course.course_name | 교육과정명 |
| educationTypeId | integer int64 | 예 | education_course.education_type_id | 교육유형 |
| educationMethodId | integer int64 | 예 | education_course.education_method_id | 교육방법 |
| description | string | 아니오 | education_course.description | 과정 설명 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationCourseId | integer int64 | education_course.education_course_id | 교육과정 ID |
| courseName | string(200) | education_course.course_name | 교육과정명 |
| educationTypeId | integer int64 | education_course.education_type_id | 교육유형 |
| educationMethodId | integer int64 | education_course.education_method_id | 교육방법 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | EDUCATION_CODE_INVALID | 교육유형 또는 교육방법이 기준정보에 없는 경우 |

#### PATCH /education-courses/{educationCourseId} — 교육과정을 수정한다 (`updateEducationCourse`)

- 권한: 인사 담당자 · 경로 변수: educationCourseId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| courseName | string(200) | 아니오 | education_course.course_name | 교육과정명 |
| educationTypeId | integer int64 | 아니오 | education_course.education_type_id | 교육유형 |
| educationMethodId | integer int64 | 아니오 | education_course.education_method_id | 교육방법 |
| description | string | 아니오 | education_course.description | 과정 설명 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationCourseId | integer int64 | education_course.education_course_id | 교육과정 ID |
| courseName | string(200) | education_course.course_name | 교육과정명 |
| educationTypeId | integer int64 | education_course.education_type_id | 교육유형 |
| educationMethodId | integer int64 | education_course.education_method_id | 교육방법 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_COURSE_NOT_FOUND | 교육과정이 없는 경우 |
| 422 | EDUCATION_CODE_INVALID | 교육유형 또는 교육방법이 기준정보에 없는 경우 |

#### POST /education-sessions — 교육과정 차수를 등록한다 (`createEducationSession`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| educationCourseId | integer int64 | 예 | education_session.education_course_id | 교육과정 |
| sessionNo | integer int32 | 예 | education_session.session_no | 차수 |
| startDate | string date | 예 | education_session.start_date | 교육 시작일 |
| endDate | string date | 예 | education_session.end_date | 교육 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationSessionId | integer int64 | education_session.education_session_id | 교육차수 ID |
| educationCourseId | integer int64 | education_session.education_course_id | 교육과정 |
| sessionNo | integer int32 | education_session.session_no | 차수 |
| startDate | string date | education_session.start_date | 교육 시작일 |
| endDate | string date | education_session.end_date | 교육 종료일 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_COURSE_NOT_FOUND | 교육과정이 없는 경우 |
| 409 | EDUCATION_SESSION_DUPLICATED | 같은 과정에 동일 차수가 이미 있는 경우 |
| 422 | INVALID_PERIOD | 시작일이 종료일보다 늦은 경우 |

#### GET /education-attendees — 차수별 교육대상자 목록을 조회한다 (`listEducationAttendees`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /education-attendees — 차수별 교육대상자를 등록한다 (`createEducationAttendee`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| educationSessionId | integer int64 | 예 | education_attendee.education_session_id | 교육차수 |
| employeeId | integer int64 | 예 | education_attendee.employee_id | 임직원 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationAttendeeId | integer int64 | education_attendee.education_attendee_id | 교육대상자 ID |
| educationSessionId | integer int64 | education_attendee.education_session_id | 교육차수 |
| employeeId | integer int64 | education_attendee.employee_id | 임직원 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 임직원이 존재하지 않는 경우 |
| 404 | EDUCATION_SESSION_NOT_FOUND | 교육 차수가 없는 경우 |
| 409 | EDUCATION_ATTENDEE_DUPLICATED | 같은 차수에 이미 등록된 경우 |

#### DELETE /education-attendees/{educationAttendeeId} — 교육대상자를 삭제한다 (`deleteEducationAttendee`)

- 권한: 인사 담당자 · 경로 변수: educationAttendeeId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_ATTENDEE_NOT_FOUND | 교육대상자가 없는 경우 |

#### POST /education-result-reports — 차수별 교육결과 보고를 등록한다 (`createEducationResultReport`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| educationSessionId | integer int64 | 예 | education_result_report.education_session_id | 교육차수 ID |
| title | string(200) | 아니오 | education_result_report.title | 보고 제목 |
| reportContent | string | 예 | education_result_report.report_content | 결과보고 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationResultReportId | integer int64 | education_result_report.education_result_report_id | 교육결과 보고 ID |
| educationSessionId | integer int64 | education_result_report.education_session_id | 교육차수 ID |
| title | string(200) | education_result_report.title | 보고 제목 |
| reportContent | string | education_result_report.report_content | 결과보고 내용 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_SESSION_NOT_FOUND | 교육 차수가 없는 경우 |

### FN-SFR-015-03 교육신청 및 승인 처리

- 요구사항: SFR-015-03 · 테이블: employee, approval_document, notification, change_history, education_session, education_attendee, education_application

#### POST /education-applications — 교육을 신청한다 (`createEducationApplication`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| educationSessionId | integer int64 | 예 | education_application.education_session_id | 교육차수 |
| applicationReason | string | 아니오 | education_application.application_reason | 신청 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationApplicationId | integer int64 | education_application.education_application_id | 교육신청 ID |
| status | string(20) [신청\|승인\|승인 취소\|반려] | education_application.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_SESSION_NOT_FOUND | 교육 차수가 없는 경우 |
| 409 | EDUCATION_APPLICATION_DUPLICATED | 동일 차수에 이미 신청한 경우 |

#### POST /education-applications/{educationApplicationId}/approve — 교육신청을 승인한다 (`approveEducationApplication`)

- 권한: 인사 담당자 · 경로 변수: educationApplicationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationApplicationId | integer int64 | education_application.education_application_id | 교육신청 ID |
| status | string(20) [신청\|승인\|승인 취소\|반려] | education_application.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_APPLICATION_NOT_FOUND | 신청이 없는 경우 |
| 409 | EDUCATION_APPLICATION_STATE_CONFLICT | 신청 상태가 아닌 건을 처리하는 경우 |

#### POST /education-applications/{educationApplicationId}/reject — 교육신청을 반려한다 (`rejectEducationApplication`)

- 권한: 인사 담당자 · 경로 변수: educationApplicationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| rejectReason | string | 예 | education_application.reject_reason | 반려 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationApplicationId | integer int64 | education_application.education_application_id | 교육신청 ID |
| status | string(20) [신청\|승인\|승인 취소\|반려] | education_application.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_APPLICATION_NOT_FOUND | 신청이 없는 경우 |
| 409 | EDUCATION_APPLICATION_STATE_CONFLICT | 신청 상태가 아닌 건을 처리하는 경우 |
| 422 | REJECT_REASON_REQUIRED | 반려 사유가 없는 경우 |

#### POST /education-applications/{educationApplicationId}/cancel-approval — 승인된 교육신청을 승인 취소한다 (`cancelEducationApplicationApproval`)

- 권한: 인사 담당자 · 경로 변수: educationApplicationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationApplicationId | integer int64 | education_application.education_application_id | 교육신청 ID |
| status | string(20) [신청\|승인\|승인 취소\|반려] | education_application.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_APPLICATION_NOT_FOUND | 신청이 없는 경우 |
| 409 | EDUCATION_APPLICATION_STATE_CONFLICT | 승인 상태가 아닌 건을 취소하는 경우 |

#### DELETE /education-applications/{educationApplicationId} — 교육신청을 삭제한다 (`deleteEducationApplication`)

- 권한: 임직원 · 경로 변수: educationApplicationId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_APPLICATION_NOT_FOUND | 신청이 없는 경우 |
| 409 | EDUCATION_APPLICATION_APPROVED | 승인된 신청을 삭제하려는 경우 (승인 취소 절차 필요) |

### FN-SFR-015-04 교육평가 관리

- 요구사항: SFR-015-04 · 테이블: education_session, education_attendee, education_evaluation

#### GET /education-evaluations — 교육평가 결과를 조회한다 (`listEducationEvaluations`)

- 권한: 임직원, 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| educationSessionId | integer | 예 | - | 교육 차수 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationEvaluationId | integer int64 | education_evaluation.education_evaluation_id | 교육평가 ID |
| educationAttendeeId | integer int64 | education_evaluation.education_attendee_id | 교육대상자 ID |
| employeeName | string(100) | employee.name | 임직원명 |
| evaluationItem | string(200) | education_evaluation.evaluation_item | 평가 항목 |
| score | number | education_evaluation.score | 점수 |
| completed | boolean | education_evaluation.completed | 수료 여부 |
| evaluatedAt | string date-time | education_evaluation.evaluated_at | 평가 일시 |

오류: 공통 오류만 (1절)

#### POST /education-evaluations — 교육평가를 등록한다 (`createEducationEvaluation`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| educationAttendeeId | integer int64 | 예 | education_evaluation.education_attendee_id | 교육대상자 ID |
| evaluationItem | string(200) | 예 | education_evaluation.evaluation_item | 평가 항목 |
| score | number | 아니오 | education_evaluation.score | 점수 |
| completed | boolean | 아니오 | education_evaluation.completed | 수료 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationEvaluationId | integer int64 | education_evaluation.education_evaluation_id | 교육평가 ID |
| educationAttendeeId | integer int64 | education_evaluation.education_attendee_id | 교육대상자 ID |
| evaluationItem | string(200) | education_evaluation.evaluation_item | 평가 항목 |
| score | number | education_evaluation.score | 점수 |
| completed | boolean | education_evaluation.completed | 수료 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_ATTENDEE_NOT_FOUND | 교육대상자로 등록되지 않은 경우 |
| 422 | EDUCATION_NOT_ENDED | 교육이 종료되지 않은 경우 |
| 422 | EVALUATION_ITEM_REQUIRED | 필수 평가 항목이 누락된 경우 |

#### PATCH /education-evaluations/{educationEvaluationId} — 교육평가를 수정한다 (`updateEducationEvaluation`)

- 권한: 인사 담당자 · 경로 변수: educationEvaluationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| evaluationItem | string(200) | 아니오 | education_evaluation.evaluation_item | 평가 항목 |
| score | number | 아니오 | education_evaluation.score | 점수 |
| completed | boolean | 아니오 | education_evaluation.completed | 수료 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationEvaluationId | integer int64 | education_evaluation.education_evaluation_id | 교육평가 ID |
| evaluationItem | string(200) | education_evaluation.evaluation_item | 평가 항목 |
| score | number | education_evaluation.score | 점수 |
| completed | boolean | education_evaluation.completed | 수료 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EDUCATION_EVALUATION_NOT_FOUND | 평가가 없는 경우 |
| 422 | EVALUATION_ITEM_REQUIRED | 필수 평가 항목이 누락된 경우 |

### FN-SFR-015-05 교육현황 조회

- 요구사항: SFR-015-05 · 테이블: employee, department, education_course, education_session, education_attendee, education_application, education_evaluation

#### GET /education-status — 교육과정·차수별 신청, 대상자, 수료, 평가 현황을 조회한다 (`listEducationStatus`)

- 권한: 임직원, 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| viewScope | string | 아니오 | - | 조회 범위 (전체/부서/개인) |
| startDate | string | 아니오 | - | 교육 기간 시작일 |
| endDate | string | 아니오 | - | 교육 기간 종료일 |
| educationCourseId | integer int64 | 아니오 | education_session.education_course_id | 교육과정 |
| departmentId | integer int64 | 아니오 | employee.department_id | 주부서 |
| employeeId | integer int64 | 아니오 | education_attendee.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| educationCourseId | integer int64 | education_course.education_course_id | 교육과정 ID |
| courseName | string(200) | education_course.course_name | 교육과정명 |
| educationSessionId | integer int64 | education_session.education_session_id | 교육차수 ID |
| sessionNo | integer int32 | education_session.session_no | 차수 |
| startDate | string date | education_session.start_date | 교육 시작일 |
| endDate | string date | education_session.end_date | 교육 종료일 |
| employeeName | string(100) | employee.name | 임직원명 |
| departmentName | string(100) | department.name | 부서명 |
| applicationStatus | string(20) [신청\|승인\|승인 취소\|반려] | education_application.status | 처리 상태 |
| completed | boolean | education_evaluation.completed | 수료 여부 |
| score | number | education_evaluation.score | 점수 |

오류: 공통 오류만 (1절)

### FN-SFR-016-01 증명서 양식 등록·관리

- 요구사항: SFR-016-01 · 테이블: certificate_type

#### GET /certificate-types — 증명서 양식 목록 조회 (`listCertificateTypes`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| useYn | string(10) [사용\|미사용] | 아니오 | certificate_type.use_yn | 사용 여부 조건 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| certificateTypeId | integer int64 | certificate_type.certificate_type_id | 증명서 종류 ID |
| name | string(100) | certificate_type.name | 증명서 종류명 |
| useYn | string(10) [사용\|미사용] | certificate_type.use_yn | 사용 여부 |

오류: 공통 오류만 (1절)

#### POST /certificate-types — 증명서 양식 등록 (`createCertificateType`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 예 | certificate_type.name | 증명서 종류명 |
| formBody | string | 예 | certificate_type.form_body | 양식 본문 |
| useYn | string(10) [사용\|미사용] | 아니오 | certificate_type.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| certificateTypeId | integer int64 | certificate_type.certificate_type_id | 증명서 종류 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | CERTIFICATE_TYPE_REQUIRED_MISSING | 종류명 또는 양식 본문이 누락된 경우 |

#### PATCH /certificate-types/{certificateTypeId} — 증명서 양식 수정·사용 여부 변경 (`updateCertificateType`)

- 권한: 인사 담당자 · 경로 변수: certificateTypeId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 아니오 | certificate_type.name | 증명서 종류명 |
| formBody | string | 아니오 | certificate_type.form_body | 양식 본문 |
| useYn | string(10) [사용\|미사용] | 아니오 | certificate_type.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| certificateTypeId | integer int64 | certificate_type.certificate_type_id | 증명서 종류 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | CERTIFICATE_TYPE_NOT_FOUND | 양식이 없는 경우 |
| 422 | CERTIFICATE_TYPE_REQUIRED_MISSING | 필수 입력값이 비어 있는 경우 |

### FN-SFR-016-02 증명서별 채번 관리

- 요구사항: SFR-016-02 · 테이블: certificate_type

#### GET /certificate-types/numbering — 증명서별 채번 설정 목록 조회 (`listCertificateNumberings`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| certificateTypeId | integer int64 | certificate_type.certificate_type_id | 증명서 종류 ID |
| name | string(100) | certificate_type.name | 증명서 종류명 |
| numberingPrefix | string(20) | certificate_type.numbering_prefix | 채번 접두어 |
| numberingDigits | integer int32 | certificate_type.numbering_digits | 채번 자릿수 |
| numberingResetCycle | string(10) [연\|없음] | certificate_type.numbering_reset_cycle | 채번 초기화 주기 |
| lastSequence | integer int32 | certificate_type.last_sequence | 마지막 일련번호 |

오류: 공통 오류만 (1절)

#### PUT /certificate-types/{certificateTypeId}/numbering — 증명서 종류별 채번 규칙 저장 (`updateCertificateNumbering`)

- 권한: 인사 담당자 · 경로 변수: certificateTypeId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| numberingPrefix | string(20) | 예 | certificate_type.numbering_prefix | 채번 접두어 |
| numberingDigits | integer int32 | 예 | certificate_type.numbering_digits | 채번 자릿수 |
| numberingResetCycle | string(10) [연\|없음] | 예 | certificate_type.numbering_reset_cycle | 채번 초기화 주기 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| certificateTypeId | integer int64 | certificate_type.certificate_type_id | 증명서 종류 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | CERTIFICATE_TYPE_NOT_FOUND | 증명서 종류가 없는 경우 |
| 422 | INVALID_NUMBERING_RULE | 채번 규칙이 누락되었거나 형식에 맞지 않는 경우 |

### FN-SFR-016-03 증명서 신청 검토·승인

- 요구사항: SFR-016-03 · 테이블: employee, approval_document, notification, change_history, certificate_type, certificate_request

#### POST /certificate-requests — 증명서 신청 (`createCertificateRequest`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| certificateTypeId | integer int64 | 예 | certificate_request.certificate_type_id | 증명서 종류 ID |
| purpose | string(200) | 아니오 | certificate_request.purpose | 용도 |
| copies | integer int32 | 아니오 | certificate_request.copies | 부수 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| certificateRequestId | integer int64 | certificate_request.certificate_request_id | 증명서 신청 ID |
| status | string(10) [신청\|승인\|반려] | certificate_request.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | CERTIFICATE_TYPE_NOT_FOUND | 증명서 종류가 없는 경우 |
| 422 | CERTIFICATE_TYPE_NOT_IN_USE | 미사용 양식을 신청한 경우 |

#### POST /certificate-requests/{certificateRequestId}/approve — 증명서 신청 승인 및 발급번호 부여 (`approveCertificateRequest`)

- 권한: 인사 담당자 · 경로 변수: certificateRequestId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(10) [신청\|승인\|반려] | certificate_request.status | 처리 상태 |
| issueNumber | string(50) | certificate_request.issue_number | 발급번호 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | CERTIFICATE_REQUEST_NOT_FOUND | 신청 건이 없는 경우 |
| 409 | CERTIFICATE_REQUEST_ALREADY_PROCESSED | 이미 승인·반려된 건인 경우 |

#### POST /certificate-requests/{certificateRequestId}/reject — 증명서 신청 반려 (`rejectCertificateRequest`)

- 권한: 인사 담당자 · 경로 변수: certificateRequestId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| rejectReason | string | 예 | certificate_request.reject_reason | 반려 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(10) [신청\|승인\|반려] | certificate_request.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | CERTIFICATE_REQUEST_NOT_FOUND | 신청 건이 없는 경우 |
| 409 | CERTIFICATE_REQUEST_ALREADY_PROCESSED | 이미 승인·반려된 건인 경우 |
| 422 | REJECT_REASON_REQUIRED | 반려 사유가 없는 경우 |

### FN-SFR-016-04 증명서 관리대장 조회

- 요구사항: SFR-016-04 · 테이블: employee, personal_info_access_log, certificate_type, certificate_request

#### GET /certificate-requests — 증명서 관리대장 조회 (`listCertificateRequests`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| issuedFrom | string | 아니오 | - | 발급 일자 시작 |
| issuedTo | string | 아니오 | - | 발급 일자 종료 |
| certificateTypeId | integer int64 | 아니오 | certificate_request.certificate_type_id | 증명서 종류 ID |
| employeeId | integer int64 | 아니오 | certificate_request.employee_id | 신청자 ID |
| status | string(10) [신청\|승인\|반려] | 아니오 | certificate_request.status | 처리 상태 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| issueNumber | string(50) | certificate_request.issue_number | 발급번호 |
| certificateTypeName | string(100) | certificate_type.name | 증명서 종류명 |
| employeeName | string(100) | employee.name | 임직원명 |
| createdAt | string date-time | certificate_request.created_at | 생성 일시 |
| status | string(10) [신청\|승인\|반려] | certificate_request.status | 처리 상태 |
| issuedDate | string | - | 발급일 |

오류: 공통 오류만 (1절)

### FN-SFR-017-01 근태 기준정보 및 시간외근무 기준 관리

- 요구사항: SFR-017-01 · 테이블: change_history, attendance_standard

#### GET /attendance-standards — 근태 기준정보 목록 조회 (`listAttendanceStandards`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| standardType | string(20) [기본근태\|근무시간\|시간외근무] | 아니오 | attendance_standard.standard_type | 기준 구분 |
| useYn | string(10) [사용\|미사용] | 아니오 | attendance_standard.use_yn | 사용 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceStandardId | integer int64 | attendance_standard.attendance_standard_id | 근태·시간외근무 기준정보 ID |
| standardType | string(20) [기본근태\|근무시간\|시간외근무] | attendance_standard.standard_type | 기준 구분 |
| itemName | string(100) | attendance_standard.item_name | 기준 항목명 |
| standardValue | string(200) | attendance_standard.standard_value | 기준 값 |
| unit | string(30) | attendance_standard.unit | 단위 |
| useYn | string(10) [사용\|미사용] | attendance_standard.use_yn | 사용 여부 |
| applyStartDate | string date | attendance_standard.apply_start_date | 적용 시작일 |
| applyEndDate | string date | attendance_standard.apply_end_date | 적용 종료일 |

오류: 공통 오류만 (1절)

#### POST /attendance-standards — 근태 기준정보 등록 (`createAttendanceStandard`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| standardType | string(20) [기본근태\|근무시간\|시간외근무] | 예 | attendance_standard.standard_type | 기준 구분 |
| itemName | string(100) | 예 | attendance_standard.item_name | 기준 항목명 |
| standardValue | string(200) | 아니오 | attendance_standard.standard_value | 기준 값 |
| unit | string(30) | 아니오 | attendance_standard.unit | 단위 |
| useYn | string(10) [사용\|미사용] | 아니오 | attendance_standard.use_yn | 사용 여부 |
| applyStartDate | string date | 아니오 | attendance_standard.apply_start_date | 적용 시작일 |
| applyEndDate | string date | 아니오 | attendance_standard.apply_end_date | 적용 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceStandardId | integer int64 | attendance_standard.attendance_standard_id | 근태·시간외근무 기준정보 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | ATTENDANCE_STANDARD_REQUIRED_MISSING | 필수 기준 값이 누락된 경우 |
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간에 적용되는 기준정보인 경우 |

#### PATCH /attendance-standards/{attendanceStandardId} — 근태 기준정보 수정 (`updateAttendanceStandard`)

- 권한: 근태 담당자 · 경로 변수: attendanceStandardId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| itemName | string(100) | 아니오 | attendance_standard.item_name | 기준 항목명 |
| standardValue | string(200) | 아니오 | attendance_standard.standard_value | 기준 값 |
| unit | string(30) | 아니오 | attendance_standard.unit | 단위 |
| useYn | string(10) [사용\|미사용] | 아니오 | attendance_standard.use_yn | 사용 여부 |
| applyStartDate | string date | 아니오 | attendance_standard.apply_start_date | 적용 시작일 |
| applyEndDate | string date | 아니오 | attendance_standard.apply_end_date | 적용 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceStandardId | integer int64 | attendance_standard.attendance_standard_id | 근태·시간외근무 기준정보 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_STANDARD_NOT_FOUND | 기준정보가 없는 경우 |
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간의 기준정보를 수정하는 경우 |
| 422 | ATTENDANCE_STANDARD_REQUIRED_MISSING | 필수 기준 값이 누락된 경우 |

#### DELETE /attendance-standards/{attendanceStandardId} — 근태 기준정보 삭제 (`deleteAttendanceStandard`)

- 권한: 근태 담당자 · 경로 변수: attendanceStandardId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_STANDARD_NOT_FOUND | 기준정보가 없는 경우 |
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간의 기준정보를 삭제하는 경우 |

### FN-SFR-017-02 근태항목 관리

- 요구사항: SFR-017-02 · 테이블: change_history, attendance_item

#### GET /attendance-items — 근태항목 목록 조회 (`listAttendanceItems`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| useYn | string(10) [사용\|미사용] | 아니오 | attendance_item.use_yn | 사용 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceItemId | integer int64 | attendance_item.attendance_item_id | 근태항목 ID |
| name | string(100) | attendance_item.name | 근태항목명 |
| useYn | string(10) [사용\|미사용] | attendance_item.use_yn | 사용 여부 |
| deductYn | boolean | attendance_item.deduct_yn | 차감 여부 |

오류: 공통 오류만 (1절)

#### POST /attendance-items — 근태항목 등록 (`createAttendanceItem`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 예 | attendance_item.name | 근태항목명 |
| useYn | string(10) [사용\|미사용] | 예 | attendance_item.use_yn | 사용 여부 |
| deductYn | boolean | 아니오 | attendance_item.deduct_yn | 차감 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceItemId | integer int64 | attendance_item.attendance_item_id | 근태항목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | ATTENDANCE_ITEM_DUPLICATED | 항목명이 중복된 경우 |
| 422 | ATTENDANCE_ITEM_REQUIRED_MISSING | 필수값이 누락된 경우 |

#### PATCH /attendance-items/{attendanceItemId} — 근태항목 수정·사용 여부 설정 (`updateAttendanceItem`)

- 권한: 근태 담당자 · 경로 변수: attendanceItemId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 아니오 | attendance_item.name | 근태항목명 |
| useYn | string(10) [사용\|미사용] | 아니오 | attendance_item.use_yn | 사용 여부 |
| deductYn | boolean | 아니오 | attendance_item.deduct_yn | 차감 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceItemId | integer int64 | attendance_item.attendance_item_id | 근태항목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_ITEM_NOT_FOUND | 근태항목이 없는 경우 |
| 409 | ATTENDANCE_ITEM_DUPLICATED | 항목명이 중복된 경우 |
| 422 | ATTENDANCE_ITEM_REQUIRED_MISSING | 필수값이 누락된 경우 |

#### DELETE /attendance-items/{attendanceItemId} — 근태항목 삭제 (`deleteAttendanceItem`)

- 권한: 근태 담당자 · 경로 변수: attendanceItemId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_ITEM_NOT_FOUND | 근태항목이 없는 경우 |
| 409 | ATTENDANCE_ITEM_IN_USE | 사용 이력이 있는 항목을 삭제하는 경우 |

### FN-SFR-017-03 임직원별 근태 적용 설정

- 요구사항: SFR-017-03 · 테이블: employee, change_history, attendance_item, employee_attendance_setting

#### GET /employee-attendance-settings — 임직원별 근태 적용 설정 목록 조회 (`listEmployeeAttendanceSettings`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | employee_attendance_setting.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeAttendanceSettingId | integer int64 | employee_attendance_setting.employee_attendance_setting_id | 임직원별 근태 적용 설정 ID |
| employeeId | integer int64 | employee_attendance_setting.employee_id | 임직원 |
| attendanceItemId | integer int64 | employee_attendance_setting.attendance_item_id | 근태항목 |
| applyStandard | string(200) | employee_attendance_setting.apply_standard | 적용 근태 기준 |
| applyStartDate | string date | employee_attendance_setting.apply_start_date | 적용 시작일 |
| applyEndDate | string date | employee_attendance_setting.apply_end_date | 적용 종료일 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 조회 대상 임직원이 없음 |

#### POST /employee-attendance-settings — 임직원별 근태 적용 설정 등록 (`createEmployeeAttendanceSetting`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_attendance_setting.employee_id | 임직원 |
| attendanceItemId | integer int64 | 예 | employee_attendance_setting.attendance_item_id | 근태항목 |
| applyStandard | string(200) | 아니오 | employee_attendance_setting.apply_standard | 적용 근태 기준 |
| applyStartDate | string date | 아니오 | employee_attendance_setting.apply_start_date | 적용 시작일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeAttendanceSettingId | integer int64 | employee_attendance_setting.employee_attendance_setting_id | 임직원별 근태 적용 설정 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 임직원이 없음 |
| 422 | ATTENDANCE_ITEM_UNUSED | 미사용 근태항목을 선택함 |
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간의 설정임 |

#### PUT /employee-attendance-settings/{employeeAttendanceSettingId} — 임직원별 근태 적용 설정 수정 (`updateEmployeeAttendanceSetting`)

- 권한: 근태 담당자 · 경로 변수: employeeAttendanceSettingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| attendanceItemId | integer int64 | 예 | employee_attendance_setting.attendance_item_id | 근태항목 |
| applyStandard | string(200) | 아니오 | employee_attendance_setting.apply_standard | 적용 근태 기준 |
| applyStartDate | string date | 아니오 | employee_attendance_setting.apply_start_date | 적용 시작일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeAttendanceSettingId | integer int64 | employee_attendance_setting.employee_attendance_setting_id | 임직원별 근태 적용 설정 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_ATTENDANCE_SETTING_NOT_FOUND | 설정이 없음 |
| 422 | ATTENDANCE_ITEM_UNUSED | 미사용 근태항목을 선택함 |
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간의 설정 수정 |

### FN-SFR-017-04 출퇴근 체크 유형 설정

- 요구사항: SFR-017-04 · 테이블: employee, department, change_history, commute_check_setting

#### GET /commute-check-settings — 출퇴근 체크 유형 설정 현황 조회 (`listCommuteCheckSettings`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| applyUnit | string(20) [법인\|부서\|사원] | 아니오 | commute_check_setting.apply_unit | 적용 단위 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| commuteCheckSettingId | integer int64 | commute_check_setting.commute_check_setting_id | 출퇴근 체크 유형 설정 ID |
| applyUnit | string(20) [법인\|부서\|사원] | commute_check_setting.apply_unit | 적용 단위 |
| departmentId | integer int64 | commute_check_setting.department_id | 대상 부서 |
| employeeId | integer int64 | commute_check_setting.employee_id | 대상 사원 |
| checkType | string(50) | commute_check_setting.check_type | 출퇴근 체크 유형 |

오류: 공통 오류만 (1절)

#### POST /commute-check-settings — 출퇴근 체크 유형 설정 등록 (`createCommuteCheckSetting`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| applyUnit | string(20) [법인\|부서\|사원] | 예 | commute_check_setting.apply_unit | 적용 단위 |
| departmentId | integer int64 | 아니오 | commute_check_setting.department_id | 대상 부서 |
| employeeId | integer int64 | 아니오 | commute_check_setting.employee_id | 대상 사원 |
| checkType | string(50) | 예 | commute_check_setting.check_type | 출퇴근 체크 유형 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| commuteCheckSettingId | integer int64 | commute_check_setting.commute_check_setting_id | 출퇴근 체크 유형 설정 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | APPLY_TARGET_REQUIRED | 부서·사원 단위에서 대상 누락 |
| 404 | APPLY_TARGET_NOT_FOUND | 대상 부서 또는 임직원이 없음 |

#### PUT /commute-check-settings/{commuteCheckSettingId} — 출퇴근 체크 유형 설정 수정 (`updateCommuteCheckSetting`)

- 권한: 근태 담당자 · 경로 변수: commuteCheckSettingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| applyUnit | string(20) [법인\|부서\|사원] | 예 | commute_check_setting.apply_unit | 적용 단위 |
| departmentId | integer int64 | 아니오 | commute_check_setting.department_id | 대상 부서 |
| employeeId | integer int64 | 아니오 | commute_check_setting.employee_id | 대상 사원 |
| checkType | string(50) | 예 | commute_check_setting.check_type | 출퇴근 체크 유형 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| commuteCheckSettingId | integer int64 | commute_check_setting.commute_check_setting_id | 출퇴근 체크 유형 설정 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | COMMUTE_CHECK_SETTING_NOT_FOUND | 설정이 없음 |
| 422 | APPLY_TARGET_REQUIRED | 부서·사원 단위에서 대상 누락 |

### FN-SFR-017-05 시스템 접근 허용 IP 관리

- 요구사항: SFR-017-05 · 테이블: change_history, allowed_ip

#### GET /allowed-ips — 접근 허용 IP 목록 조회 (`listAllowedIps`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| useYn | string(10) [사용\|미사용] | 아니오 | allowed_ip.use_yn | 사용 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| allowedIpId | integer int64 | allowed_ip.allowed_ip_id | 접근 허용 IP ID |
| ipAddress | string(45) | allowed_ip.ip_address | 허용 IP 주소 |
| description | string(200) | allowed_ip.description | 설명 |
| useYn | string(10) [사용\|미사용] | allowed_ip.use_yn | 사용 여부 |

오류: 공통 오류만 (1절)

#### POST /allowed-ips — 접근 허용 IP 등록 (`createAllowedIp`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| ipAddress | string(45) | 예 | allowed_ip.ip_address | 허용 IP 주소 |
| description | string(200) | 아니오 | allowed_ip.description | 설명 |
| useYn | string(10) [사용\|미사용] | 예 | allowed_ip.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| allowedIpId | integer int64 | allowed_ip.allowed_ip_id | 접근 허용 IP ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_IP_FORMAT | IP 형식 오류 |
| 409 | ALLOWED_IP_DUPLICATED | 이미 등록된 IP |

#### PUT /allowed-ips/{allowedIpId} — 접근 허용 IP 수정 (`updateAllowedIp`)

- 권한: 근태 담당자 · 경로 변수: allowedIpId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| ipAddress | string(45) | 예 | allowed_ip.ip_address | 허용 IP 주소 |
| description | string(200) | 아니오 | allowed_ip.description | 설명 |
| useYn | string(10) [사용\|미사용] | 예 | allowed_ip.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| allowedIpId | integer int64 | allowed_ip.allowed_ip_id | 접근 허용 IP ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ALLOWED_IP_NOT_FOUND | IP가 없음 |
| 422 | INVALID_IP_FORMAT | IP 형식 오류 |
| 409 | ALLOWED_IP_DUPLICATED | 이미 등록된 IP |

#### DELETE /allowed-ips/{allowedIpId} — 접근 허용 IP 삭제 (`deleteAllowedIp`)

- 권한: 근태 담당자 · 경로 변수: allowedIpId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ALLOWED_IP_NOT_FOUND | IP가 없음 |

### FN-SFR-017-06 근태스케줄(연차계획·연차촉진·출퇴근 연동) 관리

- 요구사항: SFR-017-06 · 테이블: employee, change_history, employee_attendance_setting, annual_leave_plan, leave_promotion

#### GET /annual-leave-plans — 월별 연차계획 현황 조회 (`listAnnualLeavePlans`)

- 권한: 근태 담당자, 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| planMonth | string(7) | 아니오 | annual_leave_plan.plan_month | 계획월 |
| employeeId | integer int64 | 아니오 | annual_leave_plan.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| annualLeavePlanId | integer int64 | annual_leave_plan.annual_leave_plan_id | 월별 연차계획 ID |
| employeeId | integer int64 | annual_leave_plan.employee_id | 임직원 |
| planMonth | string(7) | annual_leave_plan.plan_month | 계획월 |
| planDates | string date | annual_leave_plan.plan_dates | 계획 일자 |
| planDays | number | annual_leave_plan.plan_days | 계획 일수 합계 |
| approvalStatus | string(10) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | annual_leave_plan.approval_status | 승인 처리 상태 |

오류: 공통 오류만 (1절)

#### POST /annual-leave-plans — 월별 연차계획 등록 (`createAnnualLeavePlan`)

- 권한: 근태 담당자, 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | annual_leave_plan.employee_id | 임직원 |
| planMonth | string(7) | 예 | annual_leave_plan.plan_month | 계획월 |
| planDates | string date | 아니오 | annual_leave_plan.plan_dates | 계획 일자 |
| planDays | number | 예 | annual_leave_plan.plan_days | 계획 일수 합계 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| annualLeavePlanId | integer int64 | annual_leave_plan.annual_leave_plan_id | 월별 연차계획 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간임 |

#### PUT /annual-leave-plans/{annualLeavePlanId} — 월별 연차계획 수정 (`updateAnnualLeavePlan`)

- 권한: 근태 담당자, 임직원 · 경로 변수: annualLeavePlanId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| planDates | string date | 아니오 | annual_leave_plan.plan_dates | 계획 일자 |
| planDays | number | 예 | annual_leave_plan.plan_days | 계획 일수 합계 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| annualLeavePlanId | integer int64 | annual_leave_plan.annual_leave_plan_id | 월별 연차계획 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ANNUAL_LEAVE_PLAN_NOT_FOUND | 계획이 없음 |
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간임 |
| 409 | ANNUAL_LEAVE_PLAN_APPROVED | 승인된 계획은 직접 수정 불가 |

#### GET /leave-promotions — 연차촉진계획 현황 조회 (`listLeavePromotions`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| promotionYear | integer int32 | 아니오 | leave_promotion.promotion_year | 기준연도 |
| employeeId | integer int64 | 아니오 | leave_promotion.employee_id | 대상 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| leavePromotionId | integer int64 | leave_promotion.leave_promotion_id | 연차사용촉진계획 ID |
| employeeId | integer int64 | leave_promotion.employee_id | 대상 임직원 |
| promotionYear | integer int32 | leave_promotion.promotion_year | 기준연도 |
| promotionStage | string(50) | leave_promotion.promotion_stage | 촉진 구분 |
| scheduledDate | string date | leave_promotion.scheduled_date | 통지 예정일 |
| notifiedAt | string date-time | leave_promotion.notified_at | 통지 일시 |
| remainingDays | number | leave_promotion.remaining_days | 촉진 시점 잔여일수 |

오류: 공통 오류만 (1절)

#### POST /leave-promotions — 연차촉진 대상·일정 등록 (`createLeavePromotion`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | leave_promotion.employee_id | 대상 임직원 |
| promotionYear | integer int32 | 예 | leave_promotion.promotion_year | 기준연도 |
| promotionStage | string(50) | 예 | leave_promotion.promotion_stage | 촉진 구분 |
| scheduledDate | string date | 예 | leave_promotion.scheduled_date | 통지 예정일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| leavePromotionId | integer int64 | leave_promotion.leave_promotion_id | 연차사용촉진계획 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 대상 임직원이 없음 |

### FN-SFR-018-01 근태 신청 및 결재 연계

- 요구사항: SFR-018-02, SFR-018-05 · 테이블: attendance_request

#### GET /attendance-requests — 근태 신청 현황 조회 (`listAttendanceRequests`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | 아니오 | attendance_request.attendance_type | 근태 유형 |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | 아니오 | attendance_request.approval_status | 승인 처리 상태 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceRequestId | integer int64 | attendance_request.attendance_request_id | 근태 ID |
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | attendance_request.attendance_type | 근태 유형 |
| startDate | string date | attendance_request.start_date | 시작일 |
| endDate | string date | attendance_request.end_date | 종료일 |
| reason | string(1000) | attendance_request.reason | 사유 |
| changedWorkTime | string(100) | attendance_request.changed_work_time | 변경 근무시간 |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | attendance_request.approval_status | 승인 처리 상태 |

오류: 공통 오류만 (1절)

#### POST /attendance-requests — 근태 신청 (`createAttendanceRequest`)

- 권한: 임직원, 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | 예 | attendance_request.attendance_type | 근태 유형 |
| startDate | string date | 예 | attendance_request.start_date | 시작일 |
| endDate | string date | 예 | attendance_request.end_date | 종료일 |
| reason | string(1000) | 아니오 | attendance_request.reason | 사유 |
| changedWorkTime | string(100) | 아니오 | attendance_request.changed_work_time | 변경 근무시간 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceRequestId | integer int64 | attendance_request.attendance_request_id | 근태 ID |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | attendance_request.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | ATTENDANCE_VALIDATION_FAILED | 유형별 검증 기준 위반 또는 미사용 근태 유형 |
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간에 신청 |

#### POST /attendance-requests/{attendanceRequestId}/cancel — 근태 신청 취소 (`cancelAttendanceRequest`)

- 권한: 임직원, 근태 담당자 · 경로 변수: attendanceRequestId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceRequestId | integer int64 | attendance_request.attendance_request_id | 근태 ID |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | attendance_request.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_REQUEST_NOT_FOUND | 신청이 없음 |
| 409 | ATTENDANCE_REQUEST_APPROVED | 승인된 건은 직접 취소 불가, 승인 취소 절차 필요 |
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간임 |

### FN-SFR-018-02 근태 설정 관리

- 요구사항: SFR-018-05, SFR-018-09 · 테이블: approval_form, attendance_request, system_setting, attendance_item

#### GET /system-settings — 근태 설정 조회 (`listSystemSettings`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /system-settings/{systemSettingId} — 근태 설정값 수정 (`updateSystemSetting2`)

- 권한: 근태 담당자 · 경로 변수: systemSettingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| settingValue | string(1000) | 예 | system_setting.setting_value | 설정 값 |
| description | string(500) | 아니오 | system_setting.description | 설명 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| systemSettingId | integer int64 | system_setting.system_setting_id | 환경설정 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SYSTEM_SETTING_NOT_FOUND | 설정이 없음 |
| 422 | SETTING_VALUE_REQUIRED | 필수 설정값 누락 |

#### PUT /attendance-items/{attendanceItemId} — 근태 유형 사용 여부 수정 (`updateAttendanceItem2`)

- 권한: 근태 담당자 · 경로 변수: attendanceItemId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| useYn | string(10) [사용\|미사용] | 예 | attendance_item.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceItemId | integer int64 | attendance_item.attendance_item_id | 근태항목 ID |
| useYn | string(10) [사용\|미사용] | attendance_item.use_yn | 사용 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_ITEM_NOT_FOUND | 근태항목이 없음 |

#### PUT /approval-forms/{approvalFormId} — 근태 신청 양식 수정 (`updateApprovalForm`)

- 권한: 근태 담당자 · 경로 변수: approvalFormId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| formBody | string | 아니오 | approval_form.form_body | 양식 본문(HTML) |
| useStatus | string(10) [사용\|미사용] | 예 | approval_form.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalFormId | integer int64 | approval_form.approval_form_id | 결재양식 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_FORM_NOT_FOUND | 양식이 없음 |

### FN-SFR-018-03 출퇴근 기록 및 연동 관리

- 요구사항: SFR-018-04, SFR-018-06 · 테이블: system_setting, link_log, commute_record

#### POST /commute-records — 임직원이 출퇴근 기록을 등록한다 (`createCommuteRecord`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| workDate | string date | 예 | commute_record.work_date | 근무일자 |
| checkInAt | string date-time | 아니오 | commute_record.check_in_at | 출근시각 |
| checkOutAt | string date-time | 아니오 | commute_record.check_out_at | 퇴근시각 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| commuteRecordId | integer int64 | commute_record.commute_record_id | 출퇴근 기록 ID |
| workDate | string date | commute_record.work_date | 근무일자 |
| checkInAt | string date-time | commute_record.check_in_at | 출근시각 |
| checkOutAt | string date-time | commute_record.check_out_at | 퇴근시각 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | COMMUTE_RECORD_CLOSED | 대상 일자가 마감되어 있다 |
| 409 | COMMUTE_RECORD_DUPLICATED | 같은 사원과 일자의 기록이 이미 있다 |

#### POST /commute-records/receive-linked — 출퇴근 연동 시스템이 보낸 출퇴근 정보를 수신하여 저장한다 (`receiveLinkedCommuteRecords`)

- 권한: 로그인 사용자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | commute_record.employee_id | 임직원 |
| workDate | string date | 예 | commute_record.work_date | 근무일자 |
| checkInAt | string date-time | 아니오 | commute_record.check_in_at | 출근시각 |
| checkOutAt | string date-time | 아니오 | commute_record.check_out_at | 퇴근시각 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| commuteRecordId | integer int64 | commute_record.commute_record_id | 출퇴근 기록 ID |
| linkLogId | integer int64 | link_log.link_log_id | 외부 연계 이력 ID |
| status | string(20) [REQUESTED\|SUCCESS\|FAILED] | link_log.status | 연계 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | COMMUTE_RECORD_CLOSED | 대상 일자가 마감되어 있다 |
| 422 | COMMUTE_LINK_DISABLED | 근태 설정에서 연동 연계를 사용하지 않는다 |
| 502 | COMMUTE_LINK_FAILED | 연동 시스템 연계에 실패하여 기록을 반영하지 않는다 |

#### GET /commute-records — 일자별 출퇴근 기록을 조회한다 (`listCommuteRecords`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | commute_record.employee_id | 임직원 |
| startDate | string | 아니오 | - | 조회 시작일 |
| endDate | string | 아니오 | - | 조회 종료일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| commuteRecordId | integer int64 | commute_record.commute_record_id | 출퇴근 기록 ID |
| employeeId | integer int64 | commute_record.employee_id | 임직원 |
| workDate | string date | commute_record.work_date | 근무일자 |
| checkInAt | string date-time | commute_record.check_in_at | 출근시각 |
| checkOutAt | string date-time | commute_record.check_out_at | 퇴근시각 |
| isLinked | boolean | commute_record.is_linked | 연동 여부 |
| isClosed | boolean | commute_record.is_closed | 마감 여부 |

오류: 공통 오류만 (1절)

#### PATCH /commute-records/{commuteRecordId} — 출퇴근 기록을 수정한다 (`updateCommuteRecord`)

- 권한: 근태 담당자 · 경로 변수: commuteRecordId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| checkInAt | string date-time | 아니오 | commute_record.check_in_at | 출근시각 |
| checkOutAt | string date-time | 아니오 | commute_record.check_out_at | 퇴근시각 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| commuteRecordId | integer int64 | commute_record.commute_record_id | 출퇴근 기록 ID |
| checkInAt | string date-time | commute_record.check_in_at | 출근시각 |
| checkOutAt | string date-time | commute_record.check_out_at | 퇴근시각 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | COMMUTE_RECORD_NOT_FOUND | 출퇴근 기록이 없다 |
| 409 | COMMUTE_RECORD_CLOSED | 마감된 일자의 기록이다 |

### FN-SFR-018-04 근태 조정

- 요구사항: SFR-018-06, SFR-018-09 · 테이블: attendance_request, commute_record

#### POST /attendance-requests/adjust — 근태 담당자가 특정일 근태를 조정하고 이력을 남긴다 (`adjustAttendance`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | attendance_request.employee_id | 신청자 ID |
| adjustDate | string date | 예 | attendance_request.start_date | 시작일 |
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | 예 | attendance_request.attendance_type | 근태 유형 |
| changedWorkTime | string(100) | 아니오 | attendance_request.changed_work_time | 변경 근무시간 |
| reason | string(1000) | 예 | attendance_request.reason | 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceRequestId | integer int64 | attendance_request.attendance_request_id | 근태 ID |
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | attendance_request.attendance_type | 근태 유형 |
| changedWorkTime | string(100) | attendance_request.changed_work_time | 변경 근무시간 |
| adjustedAt | string | - | 조정 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | ATTENDANCE_DATE_CLOSED | 조정 대상 일자가 마감되어 있다 |
| 404 | EMPLOYEE_NOT_FOUND | 대상 임직원이 없다 |

### FN-SFR-018-05 근태 현황 및 집계 조회

- 요구사항: SFR-018-03, SFR-018-09 · 테이블: employee, department, attendance_request, commute_record

#### GET /attendance-status/daily — 권한 범위 내 일별 근태 현황을 조회한다 (`listDailyAttendanceStatus`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 ID |
| employeeId | integer int64 | 아니오 | employee.employee_id | 임직원 ID |
| scope | string | 예 | - | 조회 범위(전체/부서/개인) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeName | string(100) | employee.name | 임직원명 |
| departmentName | string(100) | department.name | 부서명 |
| workDate | string date | commute_record.work_date | 근무일자 |
| checkInAt | string date-time | commute_record.check_in_at | 출근시각 |
| checkOutAt | string date-time | commute_record.check_out_at | 퇴근시각 |
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | attendance_request.attendance_type | 근태 유형 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | SCOPE_NOT_PERMITTED | 조회 권한 범위 밖의 요청이다 |

#### GET /attendance-status/monthly — 권한 범위 내 월별 근태 현황을 조회한다 (`listMonthlyAttendanceStatus`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 ID |
| employeeId | integer int64 | 아니오 | employee.employee_id | 임직원 ID |
| scope | string | 예 | - | 조회 범위(전체/부서/개인) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeName | string(100) | employee.name | 임직원명 |
| departmentName | string(100) | department.name | 부서명 |
| month | string | - | 집계 월 |
| attendanceDays | number | - | 월 근태 일수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | SCOPE_NOT_PERMITTED | 조회 권한 범위 밖의 요청이다 |

#### GET /attendance-status/summary — 권한 범위 내 근태 유형별 집계를 조회한다 (`listAttendanceSummary`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 ID |
| employeeId | integer int64 | 아니오 | employee.employee_id | 임직원 ID |
| scope | string | 예 | - | 조회 범위(전체/부서/개인) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | attendance_request.attendance_type | 근태 유형 |
| count | integer | - | 유형별 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | SCOPE_NOT_PERMITTED | 조회 권한 범위 밖의 요청이다 |

### FN-SFR-018-06 근무시간 집계 및 현황 조회

- 요구사항: SFR-018-07 · 테이블: attendance_request, system_setting, commute_record

#### GET /work-hours/weekly — 주간 근무시간과 법정 기준시간 초과 여부, 데이터 누락 여부를 조회한다 (`listWeeklyWorkHours`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 주 단위 조회 시작일 |
| endDate | string | 예 | - | 주 단위 조회 종료일 |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 ID |
| employeeId | integer int64 | 아니오 | employee.employee_id | 임직원 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | commute_record.employee_id | 임직원 |
| weekStartDate | string | - | 주 시작일 |
| weeklyWorkHours | number | - | 주간 합계 근무시간 |
| isOverLimit | boolean | - | 법정 기준시간 초과 여부 |
| hasMissingRecord | boolean | - | 출퇴근 데이터 누락 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | SCOPE_NOT_PERMITTED | 조회 권한 범위 밖의 요청이다 |
| 422 | WORK_HOUR_LIMIT_NOT_CONFIGURED | 근태 설정에 법정 기준시간이 없다 |

#### GET /work-hours/type-summary — 근태 유형별 건수·일수 집계현황을 조회한다 (`listAttendanceTypeSummary`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 ID |
| employeeId | integer int64 | 아니오 | employee.employee_id | 임직원 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | attendance_request.attendance_type | 근태 유형 |
| count | integer | - | 유형별 건수 |
| days | number | - | 유형별 일수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | SCOPE_NOT_PERMITTED | 조회 권한 범위 밖의 요청이다 |

### FN-SFR-018-07 근태 확정 관리

- 요구사항: SFR-018-08 · 테이블: approval_document, attendance_request, commute_record, attendance_closing

#### GET /attendance-closings/preview — 마감 대상 기간의 근태 결과를 집계하여 미리 본다 (`previewAttendanceClosing`)

- 권한: 근태 담당자

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| closingUnit | string(10) [일\|월] | 예 | attendance_closing.closing_unit | 마감 단위 |
| closingDate | string date | 예 | attendance_closing.closing_date | 마감 대상 일자 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| unapprovedCount | integer | - | 미승인 근태 신청 건수 |
| recordCount | integer | - | 집계 대상 출퇴근 기록 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | ATTENDANCE_ALREADY_CLOSED | 이미 마감된 기간이다 |

#### POST /attendance-closings — 일 또는 월 단위 근태 마감을 실행한다 (`createAttendanceClosing`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| closingUnit | string(10) [일\|월] | 예 | attendance_closing.closing_unit | 마감 단위 |
| closingDate | string date | 예 | attendance_closing.closing_date | 마감 대상 일자 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceClosingId | integer int64 | attendance_closing.attendance_closing_id | 근태 마감 ID |
| status | string(20) [마감\|마감 취소] | attendance_closing.status | 마감 상태 |
| closedAt | string date-time | attendance_closing.closed_at | 마감 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | ATTENDANCE_ALREADY_CLOSED | 이미 마감된 기간이다 |
| 422 | UNAPPROVED_REQUEST_EXISTS | 미승인 근태 신청이 있어 정책상 마감할 수 없다 |

#### POST /attendance-closings/{attendanceClosingId}/cancel — 근태 마감을 취소한다 (`cancelAttendanceClosing`)

- 권한: 근태 담당자 · 경로 변수: attendanceClosingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceClosingId | integer int64 | attendance_closing.attendance_closing_id | 근태 마감 ID |
| status | string(20) [마감\|마감 취소] | attendance_closing.status | 마감 상태 |
| cancelledAt | string date-time | attendance_closing.cancelled_at | 마감 취소 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_CLOSING_NOT_FOUND | 마감 건이 없다 |
| 409 | ATTENDANCE_NOT_CLOSED | 마감 상태가 아니다 |

### FN-SFR-018-08 연차 설정 및 신청 관리

- 요구사항: SFR-018-10 · 테이블: approval_document, attendance_request, annual_leave_plan, annual_leave, leave_usage

#### GET /annual-leaves — 잔여 연차와 연차 집계현황을 조회한다 (`listAnnualLeaves`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | annual_leave.employee_id | 임직원 |
| baseYear | integer int32 | 아니오 | annual_leave.base_year | 기준연도 |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| annualLeaveId | integer int64 | annual_leave.annual_leave_id | 연차 ID |
| employeeId | integer int64 | annual_leave.employee_id | 임직원 |
| baseYear | integer int32 | annual_leave.base_year | 기준연도 |
| grantedDays | number | annual_leave.granted_days | 생성일수 |
| usedDays | number | annual_leave.used_days | 사용일수 |
| remainingDays | number | annual_leave.remaining_days | 잔여일수 |

오류: 공통 오류만 (1절)

#### GET /leave-usages — 연차 사용내역을 조회한다 (`listLeaveUsages`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| annualLeaveId | integer int64 | 아니오 | leave_usage.annual_leave_id | 연차 ID |
| startDate | string | 아니오 | - | 조회 시작일 |
| endDate | string | 아니오 | - | 조회 종료일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| leaveUsageId | integer int64 | leave_usage.leave_usage_id | 연차 사용 내역 ID |
| usedDate | string date | leave_usage.used_date | 사용일 |
| usedDays | number | leave_usage.used_days | 차감 일수 |
| attendanceRequestId | integer int64 | leave_usage.attendance_request_id | 근태 ID |

오류: 공통 오류만 (1절)

#### POST /attendance-requests — 연차 사용일을 선택해 연차를 신청하고 결재 상신한다 (`createAttendanceRequest`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /annual-leave-plans — 월별 연차계획을 조회한다 (`listAnnualLeavePlans`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /leave-grant-rules — 연차 발생 기준 설정을 조회한다 (`listLeaveGrantRules`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| leaveGrantRuleId | integer int64 | leave_grant_rule.leave_grant_rule_id | 연차 생성 기준 ID |
| name | string(100) | leave_grant_rule.name | 기준명 |
| baseDays | number | leave_grant_rule.base_days | 기본일수 |
| additionalDays | number | leave_grant_rule.additional_days | 가산일수 |
| additionalCondition | string(500) | leave_grant_rule.additional_condition | 가산 조건 |
| useStatus | string(10) [사용\|미사용] | leave_grant_rule.use_status | 사용 여부 |

오류: 공통 오류만 (1절)

#### PATCH /leave-grant-rules/{leaveGrantRuleId} — 연차 발생 기준 설정을 수정한다 (`updateLeaveGrantRule`)

- 권한: 근태 담당자 · 경로 변수: leaveGrantRuleId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 아니오 | leave_grant_rule.name | 기준명 |
| baseDays | number | 아니오 | leave_grant_rule.base_days | 기본일수 |
| additionalDays | number | 아니오 | leave_grant_rule.additional_days | 가산일수 |
| additionalCondition | string(500) | 아니오 | leave_grant_rule.additional_condition | 가산 조건 |
| useStatus | string(10) [사용\|미사용] | 아니오 | leave_grant_rule.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| leaveGrantRuleId | integer int64 | leave_grant_rule.leave_grant_rule_id | 연차 생성 기준 ID |
| useStatus | string(10) [사용\|미사용] | leave_grant_rule.use_status | 사용 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | LEAVE_GRANT_RULE_NOT_FOUND | 연차 생성 기준이 없다 |

### FN-SFR-018-10 출장 및 외근 관리

- 요구사항: SFR-018-11 · 테이블: approval_document, attendance_request, attendance_trip_traveler

#### POST /attendance-requests — 출장·외근 신청을 등록한다 (`createAttendanceRequest`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /attendance-requests/{attendanceRequestId}/submit — 출장·외근 신청을 결재 상신한다 (`submitAttendanceRequest`)

- 권한: 임직원 · 경로 변수: attendanceRequestId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalDocumentId | integer int64 | attendance_request.approval_document_id | 전자결재 문서 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_REQUEST_NOT_FOUND | 근태 신청이 없음 |
| 409 | ATTENDANCE_REQUEST_ALREADY_SUBMITTED | 이미 상신 또는 승인된 건 |
| 502 | APPROVAL_LINK_FAILED | 전자결재 연계 실패 |

#### GET /attendance-requests — 권한 범위 내 출장·외근 상세내역을 조회한다 (`listAttendanceRequests`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-019-01 연차 생성 기준 환경설정

- 요구사항: SFR-019-01 · 테이블: leave_grant_rule

#### GET /leave-grant-rules — 연차 생성 기준 목록을 조회한다 (`listLeaveGrantRules`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /leave-grant-rules — 연차 생성 기준을 등록한다 (`createLeaveGrantRule`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 예 | leave_grant_rule.name | 기준명 |
| baseDays | number | 예 | leave_grant_rule.base_days | 기본일수 |
| additionalDays | number | 아니오 | leave_grant_rule.additional_days | 가산일수 |
| additionalCondition | string(500) | 아니오 | leave_grant_rule.additional_condition | 가산 조건 |
| useStatus | string(10) [사용\|미사용] | 아니오 | leave_grant_rule.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| leaveGrantRuleId | integer int64 | leave_grant_rule.leave_grant_rule_id | 연차 생성 기준 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | LEAVE_GRANT_RULE_INVALID | 기본 일수·가산 일수 누락 또는 숫자 형식 아님 |

#### PUT /leave-grant-rules/{leaveGrantRuleId} — 연차 생성 기준을 수정한다 (`updateLeaveGrantRule2`)

- 권한: 근태 담당자 · 경로 변수: leaveGrantRuleId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 예 | leave_grant_rule.name | 기준명 |
| baseDays | number | 예 | leave_grant_rule.base_days | 기본일수 |
| additionalDays | number | 아니오 | leave_grant_rule.additional_days | 가산일수 |
| additionalCondition | string(500) | 아니오 | leave_grant_rule.additional_condition | 가산 조건 |
| useStatus | string(10) [사용\|미사용] | 아니오 | leave_grant_rule.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| leaveGrantRuleId | integer int64 | leave_grant_rule.leave_grant_rule_id | 연차 생성 기준 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | LEAVE_GRANT_RULE_NOT_FOUND | 기준이 없음 |
| 422 | LEAVE_GRANT_RULE_INVALID | 기본 일수·가산 일수 누락 또는 숫자 형식 아님 |

#### DELETE /leave-grant-rules/{leaveGrantRuleId} — 연차 생성 기준을 삭제한다 (`deleteLeaveGrantRule`)

- 권한: 근태 담당자 · 경로 변수: leaveGrantRuleId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | LEAVE_GRANT_RULE_NOT_FOUND | 기준이 없음 |

### FN-SFR-019-02 연차 생성 및 확정

- 요구사항: SFR-019-02 · 테이블: employee, change_history, leave_grant_rule, annual_leave

#### POST /annual-leaves/generate — 기준 연도와 대상 임직원의 연차를 생성한다 (`generateAnnualLeaves`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeIds | array | 예 | - | 대상 임직원 ID 목록 |
| baseYear | integer int32 | 예 | annual_leave.base_year | 기준연도 |
| grantedDays | number | 아니오 | annual_leave.granted_days | 조정 생성 일수 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| annualLeaveId | integer int64 | annual_leave.annual_leave_id | 연차 ID |
| employeeId | integer int64 | annual_leave.employee_id | 임직원 |
| grantedDays | number | annual_leave.granted_days | 생성일수 |
| isConfirmed | boolean | annual_leave.is_confirmed | 확정 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | GENERATE_REQUIRED_MISSING | 대상 임직원 또는 기준 연도 미선택 |
| 409 | ANNUAL_LEAVE_ALREADY_EXISTS | 동일 연도 연차가 이미 존재 |

#### POST /annual-leaves/confirm — 생성된 연차를 확정한다 (`confirmAnnualLeaves`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| annualLeaveIds | array | 예 | - | 확정할 연차 ID 목록 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| annualLeaveId | integer int64 | annual_leave.annual_leave_id | 연차 ID |
| isConfirmed | boolean | annual_leave.is_confirmed | 확정 여부 |
| confirmedAt | string date-time | annual_leave.confirmed_at | 확정 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ANNUAL_LEAVE_NOT_FOUND | 연차가 없음 |
| 409 | ANNUAL_LEAVE_ALREADY_CONFIRMED | 이미 확정된 연차 |

#### PUT /annual-leaves/{annualLeaveId} — 미확정 연차의 생성 일수를 수정한다 (`updateAnnualLeave`)

- 권한: 근태 담당자 · 경로 변수: annualLeaveId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| grantedDays | number | 예 | annual_leave.granted_days | 생성일수 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| annualLeaveId | integer int64 | annual_leave.annual_leave_id | 연차 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ANNUAL_LEAVE_NOT_FOUND | 연차가 없음 |
| 409 | ANNUAL_LEAVE_CONFIRMED | 확정된 연차는 직접 수정 불가 |

#### DELETE /annual-leaves/{annualLeaveId} — 미확정 연차를 삭제한다 (`deleteAnnualLeave`)

- 권한: 근태 담당자 · 경로 변수: annualLeaveId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ANNUAL_LEAVE_NOT_FOUND | 연차가 없음 |
| 409 | ANNUAL_LEAVE_CONFIRMED | 확정된 연차는 직접 삭제 불가 |

### FN-SFR-019-03 연차조정 및 정산

- 요구사항: SFR-019-03 · 테이블: employee, change_history, annual_leave, annual_leave_settlement

#### POST /annual-leaves/{annualLeaveId}/adjust — 확정된 연차를 사유와 함께 가감 조정한다 (`adjustAnnualLeave`)

- 권한: 근태 담당자 · 경로 변수: annualLeaveId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| adjustDays | number | 예 | - | 가산(+) 또는 차감(-) 일수 |
| changeReason | string(500) | 예 | change_history.change_reason | 조정 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| remainingDays | number | annual_leave.remaining_days | 잔여일수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ANNUAL_LEAVE_NOT_FOUND | 연차가 없음 |
| 422 | REMAINING_DAYS_NEGATIVE | 조정 후 잔여 일수가 음수 |
| 409 | PERIOD_CLOSED | 마감된 기간의 데이터 |

#### POST /annual-leave-settlements — 미사용 연차와 수당을 산출해 정산을 확정한다 (`createAnnualLeaveSettlement`)

- 권한: 근태 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| annualLeaveId | integer int64 | 예 | annual_leave_settlement.annual_leave_id | 연차 ID |
| settlementBaseDate | string date | 예 | annual_leave_settlement.settlement_base_date | 정산기준일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| annualLeaveSettlementId | integer int64 | annual_leave_settlement.annual_leave_settlement_id | 연차 정산 ID |
| unusedDays | number | annual_leave_settlement.unused_days | 미사용 일수 |
| unusedAllowance | number | annual_leave_settlement.unused_allowance | 미사용 수당 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ANNUAL_LEAVE_NOT_FOUND | 연차가 없음 |
| 409 | PERIOD_CLOSED | 마감된 기간의 데이터 |
| 409 | SETTLEMENT_ALREADY_EXISTS | 이미 정산됨 |

### FN-SFR-019-04 연차 변경이력 조회

- 요구사항: SFR-019-04 · 테이블: change_history, annual_leave

#### GET /change-histories — 연차 변경이력을 조회한다 (`listChangeHistories`)

- 권한: 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer | 아니오 | - | 대상 임직원 |
| fromDate | string | 아니오 | - | 변경 일시 시작 |
| toDate | string | 아니오 | - | 변경 일시 종료 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| changedAt | string date-time | change_history.changed_at | 변경 일시 |
| changerId | integer int64 | change_history.changer_id | 수정자 |
| changeContent | string | change_history.change_content | 변경 내용 |
| changeType | string(50) | change_history.change_type | 변경 구분 |

오류: 공통 오류만 (1절)

### FN-SFR-019-05 연차 총괄현황 및 월별 사용 연차 조회

- 요구사항: SFR-019-05 · 테이블: employee, department, attendance_request, annual_leave, leave_usage

#### GET /annual-leaves/summary — 임직원별 연차 발생·사용·잔여 총괄현황과 월별 사용 연차를 조회한다 (`listAnnualLeaveSummaries`)

- 권한: 임직원, 근태 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| scope | string | 예 | - | 조회 범위(전체/부서/개인) |
| baseYear | integer int32 | 예 | annual_leave.base_year | 기준연도 |
| departmentId | integer int64 | 아니오 | department.department_id | 부서 범위 조회 시 대상 부서 |
| employmentStatus | string(20) [재직자\|퇴직자] | 아니오 | employee.employment_status | 재직 구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeNo | string(50) | employee.employee_no | 사번 |
| employeeName | string(100) | employee.name | 임직원명 |
| departmentName | string(100) | department.name | 부서명 |
| grantedDays | number | annual_leave.granted_days | 생성일수 |
| usedDays | number | annual_leave.used_days | 사용일수 |
| remainingDays | number | annual_leave.remaining_days | 잔여일수 |
| monthlyUsedDays | array | - | 월별 사용 연차 일수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_LEAVE_SCOPE | 조회 범위가 전체/부서/개인이 아니거나 부서 범위인데 부서가 없는 경우 |

### FN-SFR-019-06 월별 연차계획·연차사용촉진 운영 및 현황 조회

- 요구사항: SFR-019-06 · 테이블: employee, approval_document, notification, annual_leave_plan, leave_promotion, annual_leave

#### POST /annual-leave-plans — 임직원이 월별 연차계획을 등록한다 (`createAnnualLeavePlan`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /leave-promotions — 근태 담당자가 대상자별 연차사용촉진계획을 등록한다 (`createLeavePromotion`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /leave-promotions — 연차사용촉진 현황을 조회한다 (`listLeavePromotions`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-020-01 급여 기초코드 및 세금 코드 관리

- 요구사항: SFR-020-01 · 테이블: change_history, payroll_code

#### GET /payroll-codes — 코드 구분별 급여 기초코드 목록을 조회한다 (`listPayrollCodes`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| codeCategory | string(30) [근로소득\|퇴직소득\|소득공제\|농특세\|지방소득세\|사회보험정산\|학자금상환] | 아니오 | payroll_code.code_category | 코드구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollCodeId | integer int64 | payroll_code.payroll_code_id | 급여 기초코드 ID |
| codeCategory | string(30) [근로소득\|퇴직소득\|소득공제\|농특세\|지방소득세\|사회보험정산\|학자금상환] | payroll_code.code_category | 코드구분 |
| code | string(20) | payroll_code.code | 코드 |
| codeName | string(100) | payroll_code.code_name | 코드명 |
| useYn | string(10) [사용\|미사용] | payroll_code.use_yn | 사용 여부 |
| remark | string(500) | payroll_code.remark | 비고 |

오류: 공통 오류만 (1절)

#### POST /payroll-codes — 급여 기초코드를 등록한다 (`createPayrollCode`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| codeCategory | string(30) [근로소득\|퇴직소득\|소득공제\|농특세\|지방소득세\|사회보험정산\|학자금상환] | 예 | payroll_code.code_category | 코드구분 |
| code | string(20) | 예 | payroll_code.code | 코드 |
| codeName | string(100) | 예 | payroll_code.code_name | 코드명 |
| useYn | string(10) [사용\|미사용] | 아니오 | payroll_code.use_yn | 사용 여부 |
| remark | string(500) | 아니오 | payroll_code.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollCodeId | integer int64 | payroll_code.payroll_code_id | 급여 기초코드 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | PAYROLL_CODE_DUPLICATED | 동일 코드 구분 내 코드가 중복된 경우 |
| 422 | INVALID_PAYROLL_CODE_CATEGORY | 코드 구분이 허용된 값이 아닌 경우 |

#### PATCH /payroll-codes/{payrollCodeId} — 급여 기초코드를 수정하거나 사용 여부를 변경한다 (`updatePayrollCode`)

- 권한: 급여 담당자 · 경로 변수: payrollCodeId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| codeName | string(100) | 아니오 | payroll_code.code_name | 코드명 |
| useYn | string(10) [사용\|미사용] | 아니오 | payroll_code.use_yn | 사용 여부 |
| remark | string(500) | 아니오 | payroll_code.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollCodeId | integer int64 | payroll_code.payroll_code_id | 급여 기초코드 ID |
| useYn | string(10) [사용\|미사용] | payroll_code.use_yn | 사용 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_CODE_NOT_FOUND | 대상 코드가 없는 경우 |

### FN-SFR-020-02 급여 기준 및 계정과목 설정

- 요구사항: SFR-020-02 · 테이블: account_subject, system_setting, change_history, payroll_account_mapping

#### GET /payroll-account-mappings — 급여 구분별 전표처리 계정과목 설정 내역을 조회한다 (`listPayrollAccountMappings`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollAccountMappingId | integer int64 | payroll_account_mapping.payroll_account_mapping_id | 급여 전표 계정 설정 ID |
| payrollType | string(30) [상용직\|일용직\|퇴직금] | payroll_account_mapping.payroll_type | 급여 구분 |
| accountSubjectId | integer int64 | payroll_account_mapping.account_subject_id | 계정과목 |
| isActive | string(10) [사용\|미사용] | payroll_account_mapping.is_active | 사용 여부 |

오류: 공통 오류만 (1절)

#### PUT /payroll-account-mappings/{payrollAccountMappingId} — 급여 구분별 전표처리용 계정과목을 설정한다 (`updatePayrollAccountMapping`)

- 권한: 급여 담당자 · 경로 변수: payrollAccountMappingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| accountSubjectId | integer int64 | 예 | payroll_account_mapping.account_subject_id | 계정과목 |
| isActive | string(10) [사용\|미사용] | 예 | payroll_account_mapping.is_active | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollAccountMappingId | integer int64 | payroll_account_mapping.payroll_account_mapping_id | 급여 전표 계정 설정 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_ACCOUNT_MAPPING_NOT_FOUND | 대상 설정이 없는 경우 |
| 422 | INVALID_ACCOUNT_SUBJECT | 등록되지 않았거나 사용하지 않는 계정과목을 선택한 경우 |
| 409 | PAYROLL_PERIOD_CLOSED | 해당 기간 급여가 마감된 경우 |

#### GET /system-settings — 출결 마감·급여 계산 기준 설정 내역을 조회한다 (`listSystemSettings`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PATCH /system-settings/{systemSettingId} — 출결 마감 기준과 급여·근태 계산 기준을 저장한다 (`updateSystemSetting`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-020-03 사회보험 코드·환경 및 공제항목 관리

- 요구사항: SFR-020-03 · 테이블: employee, approval_document, personal_info_access_log, system_setting, change_history, payroll_code, payroll_item, withholding_adjustment_request

#### GET /payroll-codes — 사회보험 정산코드·학자금 상환코드 등 기초코드 목록을 조회한다 (`listPayrollCodes`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /payroll-codes — 사회보험 정산코드·학자금 상환코드를 등록한다 (`createPayrollCode`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PATCH /payroll-codes/{payrollCodeId} — 사회보험 정산코드·학자금 상환코드를 수정한다 (`updatePayrollCode`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /payroll-items — 지급공제항목 목록을 조회한다 (`listPayrollItems`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| itemType | string(10) [지급\|공제] | 아니오 | payroll_item.item_type | 지급공제 구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollItemId | integer int64 | payroll_item.payroll_item_id | 지급공제항목 ID |
| itemType | string(10) [지급\|공제] | payroll_item.item_type | 지급공제 구분 |
| itemName | string(100) | payroll_item.item_name | 항목명 |
| useYn | string(10) [사용\|미사용] | payroll_item.use_yn | 사용 여부 |

오류: 공통 오류만 (1절)

#### POST /payroll-items — 지급공제항목을 등록한다 (`createPayrollItem`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| itemType | string(10) [지급\|공제] | 예 | payroll_item.item_type | 지급공제 구분 |
| itemName | string(100) | 예 | payroll_item.item_name | 항목명 |
| useYn | string(10) [사용\|미사용] | 아니오 | payroll_item.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollItemId | integer int64 | payroll_item.payroll_item_id | 지급공제항목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | PAYROLL_PERIOD_CLOSED | 마감된 급여 기간의 공제항목을 변경하는 경우 |

#### PATCH /payroll-items/{payrollItemId} — 지급공제항목을 수정하거나 사용 여부를 변경한다 (`updatePayrollItem`)

- 권한: 급여 담당자 · 경로 변수: payrollItemId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| itemName | string(100) | 아니오 | payroll_item.item_name | 항목명 |
| useYn | string(10) [사용\|미사용] | 아니오 | payroll_item.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollItemId | integer int64 | payroll_item.payroll_item_id | 지급공제항목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_ITEM_NOT_FOUND | 대상 항목이 없는 경우 |
| 409 | PAYROLL_PERIOD_CLOSED | 마감된 급여 기간의 항목을 수정하는 경우 |

#### GET /system-settings — 사회보험 환경 설정 내역을 조회한다 (`listSystemSettings`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PATCH /system-settings/{systemSettingId} — 사회보험 환경 설정값을 수정한다 (`updateSystemSetting`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /withholding-adjustment-requests — 원천징수세액 조정 신청을 등록한다 (`createWithholdingAdjustmentRequest`)

- 권한: 급여 담당자, 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | withholding_adjustment_request.employee_id | 신청 임직원 |
| taxYear | integer int32 | 예 | withholding_adjustment_request.tax_year | 조정 대상 연도 |
| adjustmentRate | number | 아니오 | withholding_adjustment_request.adjustment_rate | 조정 세율(%) |
| adjustmentAmount | number | 아니오 | - | 조정 금액(암호화 저장) |
| reason | string | 아니오 | withholding_adjustment_request.reason | 신청 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| withholdingAdjustmentRequestId | integer int64 | withholding_adjustment_request.withholding_adjustment_request_id | 원천징수세액 조정 신청 ID |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | withholding_adjustment_request.approval_status | 승인 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 신청 대상 임직원이 없는 경우 |
| 409 | WITHHOLDING_REQUEST_DUPLICATED | 동일 임직원·연도의 신청이 이미 있는 경우 |

#### GET /withholding-adjustment-requests — 원천징수세액 조정 신청 내역을 조회한다 (`listWithholdingAdjustmentRequests`)

- 권한: 급여 담당자, 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| taxYear | integer int32 | 아니오 | withholding_adjustment_request.tax_year | 조정 대상 연도 |
| employeeId | integer int64 | 아니오 | withholding_adjustment_request.employee_id | 신청 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| withholdingAdjustmentRequestId | integer int64 | withholding_adjustment_request.withholding_adjustment_request_id | 원천징수세액 조정 신청 ID |
| employeeId | integer int64 | withholding_adjustment_request.employee_id | 신청 임직원 |
| taxYear | integer int32 | withholding_adjustment_request.tax_year | 조정 대상 연도 |
| adjustmentRate | number | withholding_adjustment_request.adjustment_rate | 조정 세율(%) |
| reason | string | withholding_adjustment_request.reason | 신청 사유 |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | withholding_adjustment_request.approval_status | 승인 상태 |

오류: 공통 오류만 (1절)

#### PATCH /withholding-adjustment-requests/{withholdingAdjustmentRequestId} — 원천징수세액 조정 신청을 수정한다 (`updateWithholdingAdjustmentRequest`)

- 권한: 급여 담당자 · 경로 변수: withholdingAdjustmentRequestId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| adjustmentRate | number | 아니오 | withholding_adjustment_request.adjustment_rate | 조정 세율(%) |
| reason | string | 아니오 | withholding_adjustment_request.reason | 신청 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| withholdingAdjustmentRequestId | integer int64 | withholding_adjustment_request.withholding_adjustment_request_id | 원천징수세액 조정 신청 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | WITHHOLDING_REQUEST_NOT_FOUND | 대상 신청이 없는 경우 |
| 409 | WITHHOLDING_REQUEST_APPROVED | 승인된 신청 건을 수정하려는 경우 |
| 409 | PAYROLL_PERIOD_CLOSED | 마감된 급여 기간의 데이터인 경우 |

### FN-SFR-021-01 급여 계산·과세 집계 및 마감

- 요구사항: SFR-021-01 · 테이블: employee, payroll

#### POST /payrolls/calculate — 지급일 기준으로 임직원별 급여를 계산하고 과세를 집계한다 (`calculatePayrolls`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 예 | payroll.pay_date | 급여 지급일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollId | integer int64 | payroll.payroll_id | 급여 ID |
| employeeId | integer int64 | payroll.employee_id | 임직원 ID |
| payDate | string date | payroll.pay_date | 급여 지급일 |
| closingStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | payroll.closing_status | 마감 상태 |
| taxableTotal | number | - | 과세 집계 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | NO_PAYROLL_TARGET | 급여 대상이 없는 지급일인 경우 |
| 409 | PAYROLL_ALREADY_CLOSED | 이미 마감된 기간을 다시 계산하는 경우 |

#### POST /payrolls/close — 급여를 마감하고 전자결재 상신으로 확정한다 (`closePayrolls`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 예 | payroll.pay_date | 급여 지급일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| closingStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | payroll.closing_status | 마감 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_NOT_FOUND | 해당 지급일의 계산된 급여가 없는 경우 |
| 409 | PAYROLL_ALREADY_CLOSED | 이미 마감된 경우 |
| 502 | APPROVAL_SUBMIT_FAILED | 전자결재 상신 연계가 실패한 경우 |

#### POST /payrolls/cancel-close — 급여 마감을 취소한다 (`cancelClosePayrolls`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 예 | payroll.pay_date | 급여 지급일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| closingStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | payroll.closing_status | 마감 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_NOT_FOUND | 해당 지급일의 급여가 없는 경우 |
| 409 | PAYROLL_NOT_CLOSED | 마감 상태가 아닌 경우 |

### FN-SFR-021-02 급여이체 현황 조회

- 요구사항: SFR-021-02 · 테이블: employee, partner_account, payroll, personal_info_access_log, payroll_run

#### GET /payroll-transfers — 지급일·부서 조건으로 임직원별 급여이체 현황(이체 금액·계좌 정보)을 조회한다 (`listPayrollTransfers`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 아니오 | payroll.pay_date | 조회 대상 지급일 |
| departmentId | integer int64 | 아니오 | employee.department_id | 부서 조건 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeNo | string(50) | employee.employee_no | 사번 |
| employeeName | string(100) | employee.name | 임직원명 |
| payDate | string date | payroll.pay_date | 급여 지급일 |
| netPayAmountEnc | string(500) | payroll.net_pay_amount_enc | 실지급액(암호문) |
| bankName | string | - | 이체 은행명 |
| accountNumber | string | - | 이체 계좌번호 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_NOT_FOUND | 계산된 급여가 없는 경우 |

### FN-SFR-021-03 책정임금 일괄 변경 및 현황 조회

- 요구사항: SFR-021-03 · 테이블: employee, payroll, personal_info_access_log, change_history, employee_wage

#### POST /employee-wages/bulk-update — 대상 임직원의 책정임금을 금액 또는 비율로 일괄 변경한다 (`bulkUpdateEmployeeWages`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeIds | array | 예 | - | 변경 대상 임직원 ID 목록 |
| changeAmount | number | 아니오 | - | 변경 금액 |
| changeRate | number | 아니오 | - | 변경 비율 |
| effectiveDate | string date | 예 | employee_wage.effective_date | 변경 효력일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| updatedCount | integer | - | 변경된 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 대상 임직원이 존재하지 않는 경우 |
| 422 | INVALID_WAGE_CHANGE_VALUE | 변경 금액 또는 비율이 유효하지 않은 경우 |

#### GET /employee-wages — 임직원별 책정임금 현황을 조회한다 (`listEmployeeWages`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| departmentId | integer int64 | 아니오 | employee.department_id | 부서 조건 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | employee_wage.employee_id | 임직원 |
| employeeName | string(100) | employee.name | 임직원명 |
| effectiveDate | string date | employee_wage.effective_date | 적용일 |
| wageAmountEnc | string | employee_wage.wage_amount_enc | 책정임금(암호화) |

오류: 공통 오류만 (1절)

### FN-SFR-021-04 일용직 사원 및 급여정보 관리

- 요구사항: SFR-021-04 · 테이블: employee, payroll, personal_info_access_log, daily_worker, daily_worker_payment

#### POST /daily-workers — 일용직 사원을 등록한다 (`createDailyWorker`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 예 | daily_worker.name | 성명 |
| residentRegistrationNo | string | 예 | - | 주민등록번호(서버에서 암호화 저장) |
| dailyWage | number | 예 | daily_worker.daily_wage | 일급 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| dailyWorkerId | integer int64 | daily_worker.daily_worker_id | 일용직 사원 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수값이 누락된 경우 |

#### GET /daily-workers — 일용직 사원 등록 현황을 조회한다 (`listDailyWorkers`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 아니오 | daily_worker.name | 성명 조건 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| dailyWorkerId | integer int64 | daily_worker.daily_worker_id | 일용직 사원 ID |
| name | string(100) | daily_worker.name | 성명 |
| dailyWage | number | daily_worker.daily_wage | 일급 |

오류: 공통 오류만 (1절)

#### POST /daily-worker-payments — 일용직 급여 지급일과 급여정보를 등록한다 (`createDailyWorkerPayment`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| dailyWorkerId | integer int64 | 예 | daily_worker_payment.daily_worker_id | 일용직 사원 ID |
| paymentDate | string date | 예 | daily_worker_payment.payment_date | 지급일 |
| workDays | integer int32 | 예 | daily_worker_payment.work_days | 근무일수 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| dailyWorkerPaymentId | integer int64 | daily_worker_payment.daily_worker_payment_id | 일용직 급여 지급 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | DAILY_WORKER_NOT_FOUND | 일용직 사원이 없는 경우 |
| 409 | PAYROLL_PERIOD_CLOSED | 마감된 기간의 급여인 경우 |
| 422 | REQUIRED_FIELD_MISSING | 필수값이 누락된 경우 |

### FN-SFR-021-05 퇴직기준 설정 및 퇴직금 산정·추계액 관리

- 요구사항: SFR-021-05 · 테이블: employee, payroll, system_setting, personnel_record, severance_calculation

#### PUT /severance-settings — 퇴직 산정 기준을 설정한다 (`updateSeveranceSetting`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| settingValue | string(1000) | 예 | system_setting.setting_value | 퇴직 기준 값 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| settingValue | string(1000) | system_setting.setting_value | 설정 값 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_SEVERANCE_BASIS | 퇴직 기준 값이 유효하지 않은 경우 |

#### POST /severance-calculations — 설정된 퇴직기준에 따라 대상자의 퇴직금을 산정한다 (`createSeveranceCalculation`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | severance_calculation.employee_id | 퇴직 임직원 ID |
| retirementDate | string date | 예 | severance_calculation.retirement_date | 퇴직일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| severanceCalculationId | integer int64 | severance_calculation.severance_calculation_id | 퇴직금 산정 ID |
| severanceAmountEnc | string | severance_calculation.severance_amount_enc | 퇴직금 산정액(암호화) |
| estimatedAmountEnc | string | severance_calculation.estimated_amount_enc | 퇴직금 추계액(암호화) |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 대상 임직원이 없는 경우 |
| 422 | SEVERANCE_BASIS_NOT_SET | 퇴직기준이 설정되지 않은 경우 |

#### GET /severance-calculations — 퇴직금 산정 결과와 추계액을 조회한다 (`listSeveranceCalculations`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | severance_calculation.employee_id | 대상 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| severanceCalculationId | integer int64 | severance_calculation.severance_calculation_id | 퇴직금 산정 ID |
| employeeId | integer int64 | severance_calculation.employee_id | 퇴직 임직원 ID |
| retirementDate | string date | severance_calculation.retirement_date | 퇴직일 |
| severanceAmountEnc | string | severance_calculation.severance_amount_enc | 퇴직금 산정액(암호화) |
| estimatedAmountEnc | string | severance_calculation.estimated_amount_enc | 퇴직금 추계액(암호화) |

오류: 공통 오류만 (1절)

### FN-SFR-021-06 급여명세서 발송

- 요구사항: SFR-021-06 · 테이블: notification, payroll, payroll_run

#### POST /payslips/send — 마감된 급여의 급여명세서를 통합알림으로 발송한다 (`sendPayslips`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 예 | payroll.pay_date | 발송 대상 지급일 |
| employeeIds | array | 아니오 | - | 수신 임직원 ID 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| successCount | integer | - | 발송 성공 건수 |
| failureCount | integer | - | 발송 실패 건수 |
| failures | array | - | 실패 건과 사유 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_NOT_FOUND | 대상 급여가 없는 경우 |
| 409 | PAYROLL_NOT_CLOSED | 마감되지 않은 급여인 경우 |

### FN-SFR-021-07 급여 시뮬레이션

- 요구사항: SFR-021-07 · 테이블: employee, payroll, personal_info_access_log

#### POST /payroll-simulations — 가정한 인상률·조건으로 예상 급여와 인건비를 계산한다(저장하지 않음) (`simulatePayroll`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| raiseRate | number | 예 | - | 인상률 또는 변경 조건 |
| departmentId | integer int64 | 아니오 | employee.department_id | 대상 부서 |
| employeeIds | array | 아니오 | - | 대상 임직원 ID 목록 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer | - |  |
| expectedPay | number | - | 예상 급여 |
| totalLaborCost | number | - | 예상 인건비 합계 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_SIMULATION_CONDITION | 조건값이 유효하지 않은 경우 |

### FN-SFR-021-08 급여 지급일 등록 및 급여 대상 관리

- 요구사항: SFR-021-01 · 테이블: employee, payroll, personnel_record, payroll_run

#### POST /payroll-runs — 급여 지급일을 등록한다 (`createPayrollRun`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 예 | payroll_run.pay_date | 지급일 |
| payrollType | string(20) [REGULAR\|DAILY\|SEVERANCE] | 예 | payroll_run.payroll_type | 급여구분 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollRunId | integer int64 | payroll_run.payroll_run_id | 급여 지급일 ID |
| payDate | string date | payroll_run.pay_date | 지급일 |
| payrollType | string(20) [REGULAR\|DAILY\|SEVERANCE] | payroll_run.payroll_type | 급여구분 |
| isClosed | boolean | payroll_run.is_closed | 마감 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | PAY_DATE_REQUIRED | 지급일이 누락된 경우 |

#### GET /payroll-runs — 급여 지급일 목록과 대상자 현황을 조회한다 (`listPayrollRuns`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 아니오 | payroll_run.pay_date | 지급일 |
| payrollType | string(20) [REGULAR\|DAILY\|SEVERANCE] | 아니오 | payroll_run.payroll_type | 급여구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollRunId | integer int64 | payroll_run.payroll_run_id | 급여 지급일 ID |
| payDate | string date | payroll_run.pay_date | 지급일 |
| payrollType | string(20) [REGULAR\|DAILY\|SEVERANCE] | payroll_run.payroll_type | 급여구분 |
| isClosed | boolean | payroll_run.is_closed | 마감 여부 |
| targetCount | integer | - | 지급일별 급여 대상자 수 |

오류: 공통 오류만 (1절)

#### PATCH /payroll-runs/{payrollRunId} — 급여 지급일을 수정한다 (`updatePayrollRun`)

- 권한: 급여 담당자 · 경로 변수: payrollRunId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 예 | payroll_run.pay_date | 지급일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollRunId | integer int64 | payroll_run.payroll_run_id | 급여 지급일 ID |
| payDate | string date | payroll_run.pay_date | 지급일 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_RUN_NOT_FOUND | 지급일이 없는 경우 |
| 409 | PAYROLL_RUN_CLOSED | 마감된 기간의 지급일을 수정하려는 경우(마감 취소 후 가능) |

#### POST /payrolls — 지급일의 급여 대상 임직원을 지정한다 (`createPayroll`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | payroll.employee_id | 임직원 ID |
| payDate | string date | 예 | payroll.pay_date | 급여 지급일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollId | integer int64 | payroll.payroll_id | 급여 ID |
| employeeId | integer int64 | payroll.employee_id | 임직원 ID |
| payDate | string date | payroll.pay_date | 급여 지급일 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 임직원이 없는 경우 |
| 409 | PAYROLL_PERIOD_CLOSED | 마감된 기간의 대상자를 지정·수정하려는 경우(마감 취소 후 가능) |
| 422 | PAY_DATE_REQUIRED | 지급일이 누락된 경우 |

#### DELETE /payrolls/{payrollId} — 지급일의 급여 대상자를 제외한다 (`deletePayroll`)

- 권한: 급여 담당자 · 경로 변수: payrollId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_NOT_FOUND | 급여 대상이 없는 경우 |
| 409 | PAYROLL_PERIOD_CLOSED | 마감된 기간의 대상자를 수정하려는 경우 |

### FN-SFR-021-09 연말정산용 연간 급여 일괄 입력

- 요구사항: SFR-021-01 · 테이블: employee, payroll, upload_history

#### POST /payrolls/annual-bulk — 연말정산용 연간 급여를 일괄 입력한다 (`bulkCreateAnnualPayrolls`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| attributionYear | integer | 예 | - | 귀속 연도 |
| items | array | 예 | - | 임직원별 월별 급여 금액 목록(employeeId, month, amount) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| items | array | - | 임직원별 연간 급여 합계 및 반영 결과 |
| errorCount | integer | - | 반영되지 않은 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 임직원이 존재하지 않는 경우 |
| 422 | PAYROLL_PERIOD_CLOSED | 마감된 기간의 건은 반영하지 않고 사유 안내 |

#### POST /upload-histories — 엑셀 업로드 이력을 등록한다 (`createUploadHistory`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| targetBusiness | string(50) [PARTNER\|PERSONNEL_RECORD\|ANNUAL_LEAVE\|PAYROLL\|ASSET\|ATTENDANCE\|CARRYOVER\|COMMUTE_RECORD\|EDUCATION_ATTENDEE\|DAILY_WORKER_PAYMENT] | 예 | upload_history.target_business | 업로드 대상 업무 |
| fileName | string(255) | 예 | upload_history.file_name | 파일명 |
| file | string | 예 | - | 업로드 엑셀 파일 |
| processMode | string(30) [EXCLUDE_ERROR\|CANCEL_ALL] | 아니오 | upload_history.process_mode | 오류 처리 방식 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| uploadHistoryId | integer int64 | upload_history.upload_history_id | 엑셀 업로드 이력 ID |
| totalCount | integer int32 | upload_history.total_count | 전체 건수 |
| successCount | integer int32 | upload_history.success_count | 정상 반영 건수 |
| errorCount | integer int32 | upload_history.error_count | 오류 건수 |
| errorDetail | string | upload_history.error_detail | 오류 내역 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | UPLOAD_FORMAT_INVALID | 양식 형식 또는 필수값 검증에 실패한 경우 |

### FN-SFR-021-10 급여 전표처리

- 요구사항: SFR-021-02 · 테이블: account_subject, journal_entry, payroll, payroll_account_mapping, payroll_run

#### POST /payroll-runs/{payrollRunId}/create-journal-entry — 마감된 급여 기준으로 급여 전표를 생성한다 (`createPayrollJournalEntry`)

- 권한: 급여 담당자 · 경로 변수: payrollRunId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalEntryId | integer int64 | journal_entry.journal_entry_id | 전표 ID |
| entryDate | string date | journal_entry.entry_date | 전표 일자 |
| totalDebitAmount | number | journal_entry.total_debit_amount | 차변 합계 |
| totalCreditAmount | number | journal_entry.total_credit_amount | 대변 합계 |
| journalStatus | string(20) [UNPROCESSED\|PROCESSED] | payroll_run.journal_status | 전표처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_RUN_NOT_FOUND | 지급일이 없는 경우 |
| 409 | PAYROLL_NOT_CLOSED | 급여가 마감되지 않은 경우 |
| 409 | JOURNAL_ALREADY_PROCESSED | 이미 전표처리된 경우 |
| 422 | ACCOUNT_MAPPING_MISSING | 계정과목 매핑이 없는 경우(누락 항목 안내) |

### FN-SFR-021-11 호봉테이블 및 임직원 호봉 현황 관리

- 요구사항: SFR-021-03 · 테이블: employee, change_history, salary_step, employee_wage

#### POST /salary-steps — 호봉테이블을 등록한다 (`createSalaryStep`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| stepGrade | string(20) | 예 | salary_step.step_grade | 호봉 등급 |
| amount | number | 예 | salary_step.amount | 호봉별 금액 |
| isActive | string(10) [사용\|미사용] | 예 | salary_step.is_active | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| salaryStepId | integer int64 | salary_step.salary_step_id | 호봉테이블 ID |
| stepGrade | string(20) | salary_step.step_grade | 호봉 등급 |
| amount | number | salary_step.amount | 호봉별 금액 |

오류: 공통 오류만 (1절)

#### PATCH /salary-steps/{salaryStepId} — 호봉테이블을 수정하고 변경 이력을 남긴다 (`updateSalaryStep`)

- 권한: 급여 담당자 · 경로 변수: salaryStepId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| stepGrade | string(20) | 아니오 | salary_step.step_grade | 호봉 등급 |
| amount | number | 아니오 | salary_step.amount | 호봉별 금액 |
| isActive | string(10) [사용\|미사용] | 아니오 | salary_step.is_active | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| salaryStepId | integer int64 | salary_step.salary_step_id | 호봉테이블 ID |
| stepGrade | string(20) | salary_step.step_grade | 호봉 등급 |
| amount | number | salary_step.amount | 호봉별 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SALARY_STEP_NOT_FOUND | 호봉이 없는 경우 |

#### GET /salary-steps — 호봉테이블을 조회한다 (`listSalarySteps`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| isActive | string(10) [사용\|미사용] | 아니오 | salary_step.is_active | 사용 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| salaryStepId | integer int64 | salary_step.salary_step_id | 호봉테이블 ID |
| stepGrade | string(20) | salary_step.step_grade | 호봉 등급 |
| amount | number | salary_step.amount | 호봉별 금액 |
| isActive | string(10) [사용\|미사용] | salary_step.is_active | 사용 여부 |

오류: 공통 오류만 (1절)

#### POST /employee-wages — 임직원별 호봉을 지정한다 (`createEmployeeWage`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | employee_wage.employee_id | 임직원 |
| salaryStepId | integer int64 | 예 | employee_wage.salary_step_id | 호봉 |
| effectiveDate | string date | 예 | employee_wage.effective_date | 적용일 |
| wageAmount | string | 예 | employee_wage.wage_amount_enc | 책정임금(암호화) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeWageId | integer int64 | employee_wage.employee_wage_id | 임직원 책정임금·호봉 ID |
| employeeId | integer int64 | employee_wage.employee_id | 임직원 |
| salaryStepId | integer int64 | employee_wage.salary_step_id | 호봉 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 임직원이 없는 경우 |
| 422 | SALARY_STEP_NOT_REGISTERED | 호봉테이블에 등록되지 않은 호봉을 지정한 경우 |

#### GET /employee-wages — 임직원 호봉 현황을 조회한다 (`listEmployeeWages`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-021-12 일용직 급여 일괄 입력 및 이체 현황 조회

- 요구사항: SFR-021-04 · 테이블: employee, partner_account, payroll, personal_info_access_log, upload_history, daily_worker, daily_worker_payment

#### POST /daily-worker-payments — 일용직 급여를 입력한다 (`createDailyWorkerPayment`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /daily-worker-payments/bulk — 일용직 급여를 일괄 입력한다 (`bulkCreateDailyWorkerPayments`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| items | array | 예 | - | 일용직 급여 목록(dailyWorkerId, paymentDate, workDays, paymentAmount) |
| uploadHistoryId | integer | 예 | - | 엑셀 업로드 시 업로드 이력 ID(선택) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| successCount | integer | - |  |
| errorCount | integer | - |  |
| errors | array | - | 반영되지 않은 건과 사유 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | DAILY_WORKER_NOT_REGISTERED | 미등록 일용직 사원 건은 반영하지 않고 사유 안내 |

#### GET /daily-worker-payments — 일용직 급여이체 현황을 조회한다 (`listDailyWorkerPayments`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| paymentDate | string date | 아니오 | daily_worker_payment.payment_date | 지급일 |
| dailyWorkerId | integer int64 | 아니오 | daily_worker_payment.daily_worker_id | 일용직 사원 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| dailyWorkerPaymentId | integer int64 | daily_worker_payment.daily_worker_payment_id | 일용직 급여 지급 ID |
| dailyWorkerId | integer int64 | daily_worker_payment.daily_worker_id | 일용직 사원 ID |
| name | string(100) | daily_worker.name | 성명 |
| paymentAmount | number | daily_worker_payment.payment_amount | 지급액 |
| bankName | string(100) | partner_account.bank_name | 은행 |
| accountHolder | string(100) | partner_account.account_holder | 예금주 |
| accountNumber | string | - | 계좌번호(복호화·마스킹) |

오류: 공통 오류만 (1절)

### FN-SFR-021-13 일용근로소득 지급명세서·원천징수영수증 관리

- 요구사항: SFR-021-04 · 테이블: employee, payroll, personal_info_access_log, daily_worker, daily_worker_payment, income_certificate

#### POST /income-certificates/generate — 귀속 기간의 일용근로소득 지급명세서·원천징수영수증을 생성한다 (`generateIncomeCertificates`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| periodStart | string date | 예 | income_certificate.period_start | 귀속 시작일 |
| periodEnd | string date | 예 | income_certificate.period_end | 귀속 종료일 |
| dailyWorkerId | integer int64 | 아니오 | income_certificate.daily_worker_id | 일용직 사원 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| generatedCount | integer | - | 생성된 문서 수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | NO_PAYMENT_DATA | 대상 급여가 없는 경우 |
| 409 | INCOME_CERTIFICATE_PERIOD_CLOSED | 마감된 기간의 문서를 수정하려는 경우 |

#### GET /income-certificates — 일용근로소득 지급명세서·원천징수영수증을 조회한다 (`listIncomeCertificates`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| periodStart | string date | 아니오 | income_certificate.period_start | 귀속 시작일 |
| periodEnd | string date | 아니오 | income_certificate.period_end | 귀속 종료일 |
| dailyWorkerId | integer int64 | 아니오 | income_certificate.daily_worker_id | 일용직 사원 |
| documentType | string(30) [PAYMENT_STATEMENT\|WITHHOLDING_RECEIPT] | 아니오 | income_certificate.document_type | 문서 종류 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| incomeCertificateId | integer int64 | income_certificate.income_certificate_id | 소득 지급명세서·원천징수영수증 ID |
| dailyWorkerId | integer int64 | income_certificate.daily_worker_id | 일용직 사원 |
| documentType | string(30) [PAYMENT_STATEMENT\|WITHHOLDING_RECEIPT] | income_certificate.document_type | 문서 종류 |
| periodStart | string date | income_certificate.period_start | 귀속 시작일 |
| periodEnd | string date | income_certificate.period_end | 귀속 종료일 |
| totalPaymentAmount | number | income_certificate.total_payment_amount | 총지급액 |
| withheldTaxAmount | number | income_certificate.withheld_tax_amount | 원천징수세액 |
| issuedAt | string date-time | income_certificate.issued_at | 발급 일시 |

오류: 공통 오류만 (1절)

### FN-SFR-021-14 퇴직금 산정 현황 및 퇴직소득 원천징수영수증 관리

- 요구사항: SFR-021-05 · 테이블: employee, payroll, personal_info_access_log, severance_calculation, income_certificate

#### GET /severance-calculations — 퇴직금 산정 현황 목록을 조회한다 (`listSeveranceCalculations`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /income-certificates — 퇴직소득 원천징수영수증 목록을 조회한다 (`listIncomeCertificates`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /income-certificates — 퇴직소득 원천징수영수증을 생성한다 (`createIncomeCertificate`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | income_certificate.employee_id | 임직원 |
| periodStart | string date | 예 | income_certificate.period_start | 귀속 시작일 |
| periodEnd | string date | 예 | income_certificate.period_end | 귀속 종료일 |
| totalPaymentAmount | number | 아니오 | income_certificate.total_payment_amount | 총지급액 |
| withheldTaxAmount | number | 아니오 | income_certificate.withheld_tax_amount | 원천징수세액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| incomeCertificateId | integer int64 | income_certificate.income_certificate_id | 소득 지급명세서·원천징수영수증 ID |
| issuedAt | string date-time | income_certificate.issued_at | 발급 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SEVERANCE_CALCULATION_NOT_FOUND | 대상 임직원의 퇴직금 산정이 없는 경우 |

### FN-SFR-021-15 급여대장·급여명세·급여현황 조회

- 요구사항: SFR-021-06 · 테이블: employee, payroll, personal_info_access_log, payroll_detail

#### GET /payrolls — 급여대장을 조회한다 (`listPayrolls`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 예 | payroll.pay_date | 급여 지급일 |
| departmentId | integer int64 | 아니오 | employee.department_id | 주부서 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollId | integer int64 | payroll.payroll_id | 급여 ID |
| employeeId | integer int64 | payroll.employee_id | 임직원 ID |
| employeeName | string(100) | employee.name | 임직원명 |
| payDate | string date | payroll.pay_date | 급여 지급일 |
| totalPaymentAmountEnc | string(500) | payroll.total_payment_amount_enc | 총 지급액(암호문) |
| totalDeductionAmountEnc | string(500) | payroll.total_deduction_amount_enc | 총 공제액(암호문) |
| netPayAmountEnc | string(500) | payroll.net_pay_amount_enc | 실지급액(암호문) |
| closingStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | payroll.closing_status | 마감 상태 |

오류: 공통 오류만 (1절)

#### GET /payrolls/{payrollId} — 급여명세를 조회한다 (임직원은 본인 것만) (`getPayroll`)

- 권한: 급여 담당자, 임직원 · 경로 변수: payrollId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payrollId | integer int64 | payroll.payroll_id | 급여 ID |
| payDate | string date | payroll.pay_date | 급여 지급일 |
| totalPaymentAmountEnc | string(500) | payroll.total_payment_amount_enc | 총 지급액(암호문) |
| totalDeductionAmountEnc | string(500) | payroll.total_deduction_amount_enc | 총 공제액(암호문) |
| netPayAmountEnc | string(500) | payroll.net_pay_amount_enc | 실지급액(암호문) |
| payrollItemId | integer int64 | payroll_detail.payroll_item_id | 지급공제항목 ID |
| amount | number | payroll_detail.amount | 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYROLL_NOT_FOUND | 급여가 없거나 조회 권한 범위 밖인 경우 |

#### GET /payrolls/summary — 급여현황 집계를 조회한다 (`getPayrollSummary`)

- 권한: 급여 담당자

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDate | string date | 예 | payroll.pay_date | 급여 지급일 |
| departmentId | integer int64 | 아니오 | employee.department_id | 주부서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeCount | integer | - |  |
| totalPaymentAmount | number | - |  |
| totalDeductionAmount | number | - |  |
| netPayAmount | number | - |  |

오류: 공통 오류만 (1절)

### FN-SFR-021-16 급여통계 및 급여분석 현황 조회

- 요구사항: SFR-021-07 · 테이블: employee, department, project, payroll

#### GET /payroll-analyses — 급여 통계·증감·손익 분석 현황을 조회한다 (`listPayrollAnalyses`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| payDateFrom | string | 예 | - | 분석 기간 시작일 |
| payDateTo | string | 예 | - | 분석 기간 종료일 |
| departmentId | integer int64 | 아니오 | employee.department_id | 주부서 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | payroll.employee_id | 임직원 ID |
| employeeName | string(100) | employee.name | 임직원명 |
| departmentName | string(100) | department.name | 부서명 |
| payDate | string date | payroll.pay_date | 급여 지급일 |
| totalPaymentAmountEnc | string(500) | payroll.total_payment_amount_enc | 총 지급액(암호문) |
| changeAmount | number | - | 전기 대비 급여 증감 |

오류: 공통 오류만 (1절)

### FN-SFR-022-01 사회보험 취득·상실 대상자 등록 및 신고서 관리

- 요구사항: SFR-022-01 · 테이블: employee, personnel_record, social_insurance_enrollment, social_insurance_report

#### POST /social-insurance-enrollments — 사회보험 취득·상실 대상자를 등록한다 (`createSocialInsuranceEnrollment`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | social_insurance_enrollment.employee_id | 임직원 ID |
| insuranceType | string(50) [국민연금\|건강보험\|고용보험\|산재보험] | 예 | social_insurance_enrollment.insurance_type | 보험 종류 |
| reportType | string(50) [취득\|상실] | 예 | social_insurance_enrollment.report_type | 신고 구분 |
| acquisitionDate | string date | 아니오 | social_insurance_enrollment.acquisition_date | 취득일 |
| lossDate | string date | 아니오 | social_insurance_enrollment.loss_date | 상실일 |
| lossReason | string(500) | 아니오 | social_insurance_enrollment.loss_reason | 상실 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| socialInsuranceEnrollmentId | integer int64 | social_insurance_enrollment.social_insurance_enrollment_id | 사회보험 취득·상실 대상자 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONNEL_RECORD_NOT_FOUND | 대상 임직원의 인사기록카드가 없는 경우 |
| 409 | ENROLLMENT_DUPLICATED | 동일 대상자·신고 구분이 이미 등록된 경우 |
| 422 | ENROLLMENT_DATE_REQUIRED | 신고 구분에 맞는 취득일 또는 상실일이 없거나 취득 신고에 상실 사유를 입력한 경우 |

#### GET /social-insurance-enrollments — 취득·상실 대상자 목록을 조회한다 (`listSocialInsuranceEnrollments`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | social_insurance_enrollment.employee_id | 임직원 ID |
| reportType | string(50) [취득\|상실] | 아니오 | social_insurance_enrollment.report_type | 신고 구분 |
| insuranceType | string(50) [국민연금\|건강보험\|고용보험\|산재보험] | 아니오 | social_insurance_enrollment.insurance_type | 보험 종류 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| socialInsuranceEnrollmentId | integer int64 | social_insurance_enrollment.social_insurance_enrollment_id | 사회보험 취득·상실 대상자 ID |
| employeeId | integer int64 | social_insurance_enrollment.employee_id | 임직원 ID |
| insuranceType | string(50) [국민연금\|건강보험\|고용보험\|산재보험] | social_insurance_enrollment.insurance_type | 보험 종류 |
| reportType | string(50) [취득\|상실] | social_insurance_enrollment.report_type | 신고 구분 |
| acquisitionDate | string date | social_insurance_enrollment.acquisition_date | 취득일 |
| lossDate | string date | social_insurance_enrollment.loss_date | 상실일 |
| lossReason | string(500) | social_insurance_enrollment.loss_reason | 상실 사유 |

오류: 공통 오류만 (1절)

#### POST /social-insurance-reports — 사회보험 신고서를 생성한다 (`createSocialInsuranceReport`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| socialInsuranceEnrollmentId | integer int64 | 아니오 | social_insurance_report.social_insurance_enrollment_id | 취득·상실 대상자 |
| employeeId | integer int64 | 아니오 | social_insurance_report.employee_id | 대상 임직원 |
| reportType | string(30) [QUALIFICATION_ACQUISITION\|QUALIFICATION_LOSS\|TOTAL_REMUNERATION\|EMPLOYMENT_INDUSTRIAL\|SEPARATION_CONFIRMATION\|WORK_CONTENT_CONFIRMATION] | 예 | social_insurance_report.report_type | 신고서 종류 |
| insuranceType | string(30) [NATIONAL_PENSION\|HEALTH\|EMPLOYMENT\|INDUSTRIAL_ACCIDENT] | 아니오 | social_insurance_report.insurance_type | 보험 종류 |
| periodStart | string date | 아니오 | social_insurance_report.period_start | 대상 기간 시작일 |
| periodEnd | string date | 아니오 | social_insurance_report.period_end | 대상 기간 종료일 |
| eventDate | string date | 아니오 | social_insurance_report.event_date | 취득일 또는 상실일 |
| lossReason | string(200) | 아니오 | social_insurance_report.loss_reason | 상실 사유 |
| totalAmount | number | 아니오 | social_insurance_report.total_amount | 보수총액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| socialInsuranceReportId | integer int64 | social_insurance_report.social_insurance_report_id | 사회보험 신고서 ID |
| createdAt | string date-time | social_insurance_report.created_at | 생성 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ENROLLMENT_NOT_FOUND | 등록된 대상자가 없는 경우 |
| 422 | REPORT_DATA_NOT_FOUND | 대상 기간의 인사·급여 데이터가 없거나 신고서 종류·대상 기간이 누락된 경우 |

#### GET /social-insurance-reports — 신고서 이력을 조회한다 (`listSocialInsuranceReports`)

- 권한: 인사 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | social_insurance_report.employee_id | 대상 임직원 |
| reportType | string(30) [QUALIFICATION_ACQUISITION\|QUALIFICATION_LOSS\|TOTAL_REMUNERATION\|EMPLOYMENT_INDUSTRIAL\|SEPARATION_CONFIRMATION\|WORK_CONTENT_CONFIRMATION] | 아니오 | social_insurance_report.report_type | 신고서 종류 |
| insuranceType | string(30) [NATIONAL_PENSION\|HEALTH\|EMPLOYMENT\|INDUSTRIAL_ACCIDENT] | 아니오 | social_insurance_report.insurance_type | 보험 종류 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| socialInsuranceReportId | integer int64 | social_insurance_report.social_insurance_report_id | 사회보험 신고서 ID |
| employeeId | integer int64 | social_insurance_report.employee_id | 대상 임직원 |
| reportType | string(30) [QUALIFICATION_ACQUISITION\|QUALIFICATION_LOSS\|TOTAL_REMUNERATION\|EMPLOYMENT_INDUSTRIAL\|SEPARATION_CONFIRMATION\|WORK_CONTENT_CONFIRMATION] | social_insurance_report.report_type | 신고서 종류 |
| insuranceType | string(30) [NATIONAL_PENSION\|HEALTH\|EMPLOYMENT\|INDUSTRIAL_ACCIDENT] | social_insurance_report.insurance_type | 보험 종류 |
| eventDate | string date | social_insurance_report.event_date | 취득일 또는 상실일 |
| createdById | integer int64 | social_insurance_report.created_by_id | 작성자 |
| printedAt | string date-time | social_insurance_report.printed_at | 최종 출력 일시 |
| createdAt | string date-time | social_insurance_report.created_at | 생성 일시 |

오류: 공통 오류만 (1절)

#### POST /social-insurance-reports/{socialInsuranceReportId}/print — 신고서를 출력 처리한다 (`printSocialInsuranceReport`)

- 권한: 인사 담당자 · 경로 변수: socialInsuranceReportId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| printedAt | string date-time | social_insurance_report.printed_at | 최종 출력 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SOCIAL_INSURANCE_REPORT_NOT_FOUND | 신고서가 없는 경우 |

### FN-SFR-022-02 사회보험 보수총액·고용산재·이직확인·근로내용확인 신고서 관리

- 요구사항: SFR-022-01 · 테이블: employee, payroll, personal_info_access_log, personnel_record, social_insurance_report

#### POST /social-insurance-reports — 사회보험 신고서를 생성한다 (`createSocialInsuranceReport`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /social-insurance-reports — 신고서 이력을 조회한다 (`listSocialInsuranceReports`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /social-insurance-reports/{socialInsuranceReportId}/print — 신고서를 출력 처리한다 (`printSocialInsuranceReport`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-022-03 사회보험 공제내역서 관리

- 요구사항: SFR-022-02 · 테이블: employee, payroll, personal_info_access_log, payroll_detail, social_insurance_grade

#### GET /social-insurance-deductions — 사회보험 공제내역서와 합계를 조회한다 (`listSocialInsuranceDeductions`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| insuranceType | string(30) [NATIONAL_PENSION\|HEALTH\|EMPLOYMENT\|INDUSTRIAL_ACCIDENT] | 예 | social_insurance_grade.insurance_type | 보험 종류 |
| payMonth | string | 예 | - | 대상 기간 연월(YYYYMM) |
| employeeId | integer int64 | 아니오 | payroll.employee_id | 임직원 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | payroll.employee_id | 임직원 ID |
| employeeName | string(100) | employee.name | 임직원명 |
| grade | string(20) | social_insurance_grade.grade | 등급 |
| standardMonthlyAmount | number | social_insurance_grade.standard_monthly_amount | 기준소득월액 |
| deductionAmount | number | payroll_detail.amount | 금액 |
| closingStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | payroll.closing_status | 마감 상태 |
| totalDeductionAmount | number | - | 보험별 공제 합계 |

오류: 공통 오류만 (1절)

### FN-SFR-022-04 사회보험 등급 변경 관리

- 요구사항: SFR-022-02 · 테이블: employee, change_history, social_insurance_grade

#### POST /social-insurance-grades/change — 임직원의 사회보험 등급을 변경하고 변경 이력을 기록한다 (`changeSocialInsuranceGrade`)

- 권한: 인사 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | social_insurance_grade.employee_id | 임직원 |
| insuranceType | string(30) [NATIONAL_PENSION\|HEALTH\|EMPLOYMENT\|INDUSTRIAL_ACCIDENT] | 예 | social_insurance_grade.insurance_type | 보험 종류 |
| grade | string(20) | 예 | social_insurance_grade.grade | 등급 |
| applyStartMonth | string(6) | 예 | social_insurance_grade.apply_start_month | 적용 시작월 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | social_insurance_grade.employee_id | 임직원 |
| insuranceType | string(30) [NATIONAL_PENSION\|HEALTH\|EMPLOYMENT\|INDUSTRIAL_ACCIDENT] | social_insurance_grade.insurance_type | 보험 종류 |
| previousGrade | string | - | 변경 전 등급 |
| grade | string(20) | social_insurance_grade.grade | 등급 |
| applyStartMonth | string(6) | social_insurance_grade.apply_start_month | 적용 시작월 |
| changedAt | string date-time | social_insurance_grade.changed_at | 변경 일시 |
| changedById | integer int64 | social_insurance_grade.changed_by_id | 변경자 |
| changeContent | string(1000) | social_insurance_grade.change_content | 변경 내용 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SOCIAL_INSURANCE_GRADE_NOT_FOUND | 대상 임직원에 해당 보험 종류의 등급이 등록되어 있지 않은 경우 |
| 422 | PAYROLL_PERIOD_CLOSED | 적용 시작월이 마감된 급여 기간에 해당하는 경우 (마감 취소 필요) |

#### GET /change-histories — 변경 이력을 조회한다 (`listChangeHistories`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-023-01 원천세 신고 기준정보 설정 및 신고서 관리

- 요구사항: SFR-023-01 · 테이블: payroll, system_setting, tax_filing

#### GET /system-settings — 원천세 신고 기준정보를 조회한다 (`listSystemSettings`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /system-settings/{systemSettingId} — 원천세 신고 기준정보를 수정한다 (`updateSystemSetting2`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /tax-filings/generate — 귀속연월·지급연월 기준으로 급여를 집계해 원천징수이행상황신고서와 학자금상환금명세서를 생성한다 (`generateTaxFiling`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| attributionMonth | string(6) | 예 | tax_filing.attribution_month | 귀속연월 |
| paymentMonth | string(6) | 예 | tax_filing.payment_month | 지급연월 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| taxFilingId | integer int64 | tax_filing.tax_filing_id | 세무 신고서 ID |
| filingType | string(40) [WITHHOLDING_STATUS\|TUITION_REPAYMENT\|LOCAL_INCOME_TAX\|RESIDENT_TAX_EMPLOYEE\|SIMPLIFIED_PAYMENT\|SUBMISSION_SUMMARY\|PAYMENT_MEDIA] | tax_filing.filing_type | 신고서 유형 |
| attributionMonth | string(6) | tax_filing.attribution_month | 귀속연월 |
| paymentMonth | string(6) | tax_filing.payment_month | 지급연월 |
| totalAmount | number | tax_filing.total_amount | 집계 금액 |
| filingStatus | string(20) [DRAFT\|SUCCESS\|FAILURE] | tax_filing.filing_status | 신고 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | WITHHOLDING_SETTING_NOT_CONFIGURED | 원천세 신고 기준정보가 설정되지 않은 경우 |
| 422 | PAYROLL_DATA_NOT_FOUND | 대상 귀속연월의 급여 지급 데이터가 없는 경우 |

#### GET /tax-filings — 세무 신고서를 조회한다 (`listTaxFilings`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| filingType | string(40) [WITHHOLDING_STATUS\|TUITION_REPAYMENT\|LOCAL_INCOME_TAX\|RESIDENT_TAX_EMPLOYEE\|SIMPLIFIED_PAYMENT\|SUBMISSION_SUMMARY\|PAYMENT_MEDIA] | 아니오 | tax_filing.filing_type | 신고서 유형 |
| attributionMonth | string(6) | 아니오 | tax_filing.attribution_month | 귀속연월 |
| paymentMonth | string(6) | 아니오 | tax_filing.payment_month | 지급연월 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| taxFilingId | integer int64 | tax_filing.tax_filing_id | 세무 신고서 ID |
| filingType | string(40) [WITHHOLDING_STATUS\|TUITION_REPAYMENT\|LOCAL_INCOME_TAX\|RESIDENT_TAX_EMPLOYEE\|SIMPLIFIED_PAYMENT\|SUBMISSION_SUMMARY\|PAYMENT_MEDIA] | tax_filing.filing_type | 신고서 유형 |
| attributionMonth | string(6) | tax_filing.attribution_month | 귀속연월 |
| paymentMonth | string(6) | tax_filing.payment_month | 지급연월 |
| totalAmount | number | tax_filing.total_amount | 집계 금액 |
| filingStatus | string(20) [DRAFT\|SUCCESS\|FAILURE] | tax_filing.filing_status | 신고 상태 |
| filedAt | string date-time | tax_filing.filed_at | 전자신고 일시 |
| resultMessage | string(1000) | tax_filing.result_message | 전자신고 결과 메시지 |
| receiptNumber | string(50) | tax_filing.receipt_number | 접수번호 |

오류: 공통 오류만 (1절)

#### PUT /tax-filings/{taxFilingId} — 작성된 신고서 내용을 수정·저장한다 (`updateTaxFiling`)

- 권한: 급여 담당자 · 경로 변수: taxFilingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| totalAmount | number | 예 | tax_filing.total_amount | 집계 금액 |
| incomeCategory | string(30) | 아니오 | tax_filing.income_category | 소득 구분 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| taxFilingId | integer int64 | tax_filing.tax_filing_id | 세무 신고서 ID |
| totalAmount | number | tax_filing.total_amount | 집계 금액 |
| filingStatus | string(20) [DRAFT\|SUCCESS\|FAILURE] | tax_filing.filing_status | 신고 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | TAX_FILING_NOT_FOUND | 신고서가 존재하지 않는 경우 |
| 409 | TAX_FILING_ALREADY_SUBMITTED | 이미 신고 완료된 신고서인 경우 |

### FN-SFR-023-02 국세청 원천세 전자파일 신고

- 요구사항: SFR-023-01 · 테이블: link_log, tax_filing

#### POST /tax-filings/{taxFilingId}/submit — 신고서를 국세청 전자파일로 생성해 신고하고 접수 결과를 저장한다 (`submitTaxFiling`)

- 권한: 급여 담당자 · 경로 변수: taxFilingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| taxFilingId | integer int64 | tax_filing.tax_filing_id | 세무 신고서 ID |
| filingStatus | string(20) [DRAFT\|SUCCESS\|FAILURE] | tax_filing.filing_status | 신고 상태 |
| filedAt | string date-time | tax_filing.filed_at | 전자신고 일시 |
| resultMessage | string(1000) | tax_filing.result_message | 전자신고 결과 메시지 |
| receiptNumber | string(50) | tax_filing.receipt_number | 접수번호 |
| electronicFileName | string | - | 생성된 국세청 전자파일 이름 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | TAX_FILING_NOT_FOUND | 신고서가 존재하지 않는 경우 |
| 422 | ELECTRONIC_FILE_VALIDATION_FAILED | 전자파일 규격 검증에 실패한 경우 |
| 502 | NTS_LINK_FAILED | 국세청 연계에 실패한 경우 (신고 상태 미완료 유지) |

### FN-SFR-023-03 지방세 전자신고

- 요구사항: SFR-023-02 · 테이블: payroll, link_log, tax_filing

#### POST /tax-filings/generate-local — 지방세 신고서를 유형별로 작성한다 (`generateLocalTaxFiling`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| filingType | string(40) [WITHHOLDING_STATUS\|TUITION_REPAYMENT\|LOCAL_INCOME_TAX\|RESIDENT_TAX_EMPLOYEE\|SIMPLIFIED_PAYMENT\|SUBMISSION_SUMMARY\|PAYMENT_MEDIA] | 예 | tax_filing.filing_type | 신고서 유형 |
| attributionMonth | string(6) | 예 | tax_filing.attribution_month | 귀속연월 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| taxFilingId | integer int64 | tax_filing.tax_filing_id | 세무 신고서 ID |
| filingType | string(40) [WITHHOLDING_STATUS\|TUITION_REPAYMENT\|LOCAL_INCOME_TAX\|RESIDENT_TAX_EMPLOYEE\|SIMPLIFIED_PAYMENT\|SUBMISSION_SUMMARY\|PAYMENT_MEDIA] | tax_filing.filing_type | 신고서 유형 |
| attributionMonth | string(6) | tax_filing.attribution_month | 귀속연월 |
| totalAmount | number | tax_filing.total_amount | 집계 금액 |
| filingStatus | string(20) [DRAFT\|SUCCESS\|FAILURE] | tax_filing.filing_status | 신고 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | FILING_SOURCE_DATA_NOT_FOUND | 신고 대상 데이터가 없는 경우 |

#### POST /tax-filings/{taxFilingId}/submit — 신고서를 전자신고하고 접수 결과를 저장한다 (`submitTaxFiling`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-023-04 일용근로소득 지급명세서 및 영수증 관리

- 요구사항: SFR-023-03 · 테이블: daily_worker, daily_worker_payment, income_certificate

#### POST /income-certificates/generate-daily — 일용근로자 지급 데이터로 지급명세서와 원천징수영수증을 생성한다 (`generateDailyIncomeCertificates`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| paymentMonth | string | 예 | - | 지급연월 (YYYYMM) |
| dailyWorkerId | integer int64 | 아니오 | income_certificate.daily_worker_id | 일용직 사원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| incomeCertificateId | integer int64 | income_certificate.income_certificate_id | 소득 지급명세서·원천징수영수증 ID |
| dailyWorkerId | integer int64 | income_certificate.daily_worker_id | 일용직 사원 |
| documentType | string(30) [PAYMENT_STATEMENT\|WITHHOLDING_RECEIPT] | income_certificate.document_type | 문서 종류 |
| periodStart | string date | income_certificate.period_start | 귀속 시작일 |
| periodEnd | string date | income_certificate.period_end | 귀속 종료일 |
| totalPaymentAmount | number | income_certificate.total_payment_amount | 총지급액 |
| withheldTaxAmount | number | income_certificate.withheld_tax_amount | 원천징수세액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | DAILY_PAYMENT_DATA_NOT_FOUND | 대상 기간의 일용근로자 지급 데이터가 없는 경우 |

#### GET /income-certificates — 지급명세서·원천징수영수증을 조회한다 (`listIncomeCertificates`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /income-certificates/{incomeCertificateId} — 생성된 지급명세서·영수증 내용을 수정·저장한다 (`updateIncomeCertificate`)

- 권한: 급여 담당자 · 경로 변수: incomeCertificateId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| totalPaymentAmount | number | 예 | income_certificate.total_payment_amount | 총지급액 |
| withheldTaxAmount | number | 예 | income_certificate.withheld_tax_amount | 원천징수세액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| incomeCertificateId | integer int64 | income_certificate.income_certificate_id | 소득 지급명세서·원천징수영수증 ID |
| totalPaymentAmount | number | income_certificate.total_payment_amount | 총지급액 |
| withheldTaxAmount | number | income_certificate.withheld_tax_amount | 원천징수세액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | INCOME_CERTIFICATE_NOT_FOUND | 지급명세서·영수증이 존재하지 않는 경우 |

### FN-SFR-023-05 퇴직소득 원천징수영수증 관리

- 요구사항: SFR-023-04 · 테이블: severance_calculation, income_certificate

#### POST /income-certificates/generate-retirement — 퇴직소득 지급 데이터로 퇴직소득 원천징수영수증을 생성한다 (`generateRetirementIncomeCertificate`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | income_certificate.employee_id | 임직원 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| incomeCertificateId | integer int64 | income_certificate.income_certificate_id | 소득 지급명세서·원천징수영수증 ID |
| employeeId | integer int64 | income_certificate.employee_id | 임직원 |
| documentType | string(30) [PAYMENT_STATEMENT\|WITHHOLDING_RECEIPT] | income_certificate.document_type | 문서 종류 |
| periodStart | string date | income_certificate.period_start | 귀속 시작일 |
| periodEnd | string date | income_certificate.period_end | 귀속 종료일 |
| totalPaymentAmount | number | income_certificate.total_payment_amount | 총지급액 |
| withheldTaxAmount | number | income_certificate.withheld_tax_amount | 원천징수세액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | RETIREMENT_INCOME_DATA_NOT_FOUND | 대상 퇴직자의 퇴직소득 데이터가 없는 경우 |

#### GET /income-certificates — 지급명세서·원천징수영수증을 조회한다 (`listIncomeCertificates`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /income-certificates/{incomeCertificateId} — 생성된 지급명세서·영수증 내용을 수정·저장한다 (`updateIncomeCertificate`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-023-06 연말정산 항목 관리 및 자료 입력

- 요구사항: SFR-023-05 · 테이블: year_end_item, year_end_data, year_end_result

#### POST /year-end-items — 연말정산 항목을 등록한다 (`createYearEndItem`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| code | string(30) | 예 | year_end_item.code | 항목 코드 |
| name | string(100) | 예 | year_end_item.name | 항목명 |
| category | string(50) | 아니오 | year_end_item.category | 항목 분류 |
| limitAmount | number | 아니오 | year_end_item.limit_amount | 공제 한도액 |
| sortOrder | integer int32 | 아니오 | year_end_item.sort_order | 정렬 순서 |
| useYn | string(10) [사용\|미사용] | 예 | year_end_item.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| yearEndItemId | integer int64 | year_end_item.year_end_item_id | 연말정산 항목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | YEAR_END_ITEM_CODE_DUPLICATED | 이미 존재하는 항목 코드로 등록하는 경우 |

#### PUT /year-end-items/{yearEndItemId} — 연말정산 항목을 수정한다 (`updateYearEndItem`)

- 권한: 급여 담당자 · 경로 변수: yearEndItemId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| code | string(30) | 예 | year_end_item.code | 항목 코드 |
| name | string(100) | 예 | year_end_item.name | 항목명 |
| category | string(50) | 아니오 | year_end_item.category | 항목 분류 |
| limitAmount | number | 아니오 | year_end_item.limit_amount | 공제 한도액 |
| sortOrder | integer int32 | 아니오 | year_end_item.sort_order | 정렬 순서 |
| useYn | string(10) [사용\|미사용] | 예 | year_end_item.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| yearEndItemId | integer int64 | year_end_item.year_end_item_id | 연말정산 항목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | YEAR_END_ITEM_NOT_FOUND | 항목이 없는 경우 |

#### POST /year-end-data — 대상자의 연말정산 자료를 입력하고 정산 세액을 계산해 저장한다 (`createYearEndData`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 예 | year_end_data.employee_id | 임직원 |
| yearEndItemId | integer int64 | 예 | year_end_data.year_end_item_id | 연말정산 항목 |
| targetYear | integer int32 | 예 | year_end_data.target_year | 정산 대상 연도 |
| amount | number | 아니오 | year_end_data.amount | 금액 |
| attachmentId | integer int64 | 아니오 | year_end_data.attachment_id | 증빙 첨부파일 |
| remark | string(500) | 아니오 | year_end_data.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| yearEndDataId | integer int64 | year_end_data.year_end_data_id | 연말정산 자료 ID |
| determinedTaxAmount | number | year_end_result.determined_tax_amount | 결정세액 |
| paidTaxAmount | number | year_end_result.paid_tax_amount | 기납부세액 |
| payableTaxAmount | number | year_end_result.payable_tax_amount | 납부세액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | YEAR_END_REQUIRED_DATA_MISSING | 필수 자료가 누락된 경우 누락 항목 안내 |
| 409 | YEAR_END_CLOSED | 마감된 정산 데이터인 경우 |
| 404 | EMPLOYEE_NOT_FOUND | 대상자가 없는 경우 |

#### PUT /year-end-data/{yearEndDataId} — 연말정산 자료를 수정하고 정산 세액을 재계산한다 (`updateYearEndData`)

- 권한: 급여 담당자 · 경로 변수: yearEndDataId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| amount | number | 아니오 | year_end_data.amount | 금액 |
| attachmentId | integer int64 | 아니오 | year_end_data.attachment_id | 증빙 첨부파일 |
| remark | string(500) | 아니오 | year_end_data.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| yearEndDataId | integer int64 | year_end_data.year_end_data_id | 연말정산 자료 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | YEAR_END_DATA_NOT_FOUND | 자료가 없는 경우 |
| 409 | YEAR_END_CLOSED | 마감된 정산 데이터를 수정하려는 경우 |

### FN-SFR-023-07 근로소득 원천징수부 및 영수증 관리

- 요구사항: SFR-023-05 · 테이블: payroll, income_certificate, year_end_result

#### GET /withholding-ledgers — 연도와 대상자의 월별 근로소득 원천징수부를 조회한다 (`listWithholdingLedgers`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| targetYear | integer int32 | 예 | year_end_result.target_year | 정산 대상 연도 |
| employeeId | integer int64 | 예 | year_end_result.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| payDate | string date | payroll.pay_date | 급여 지급일 |
| totalPaymentAmount | string(500) | payroll.total_payment_amount_enc | 총 지급액(암호문) |
| totalDeductionAmount | string(500) | payroll.total_deduction_amount_enc | 총 공제액(암호문) |
| determinedTaxAmount | number | year_end_result.determined_tax_amount | 결정세액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | YEAR_END_RESULT_NOT_FOUND | 정산 결과가 없어 생성할 수 없는 경우 |

#### GET /income-certificates — 근로소득 원천징수영수증을 조회한다 (`listIncomeCertificates`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-023-08 연말정산 납부세액 분납 및 현황 관리

- 요구사항: SFR-023-05 · 테이블: year_end_result, year_end_installment

#### POST /year-end-installments — 연말정산 납부세액 분납 회차를 입력한다 (`createYearEndInstallment`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| yearEndResultId | integer int64 | 예 | year_end_installment.year_end_result_id | 연말정산 결과 |
| installmentNo | integer int32 | 예 | year_end_installment.installment_no | 분납 회차 |
| installmentAmount | number | 예 | year_end_installment.installment_amount | 분납 금액 |
| dueDate | string date | 아니오 | year_end_installment.due_date | 납부 예정일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| yearEndInstallmentId | integer int64 | year_end_installment.year_end_installment_id | 연말정산 분납 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | YEAR_END_RESULT_NOT_FOUND | 정산 결과가 없는 경우 |
| 422 | INSTALLMENT_SUM_MISMATCH | 분납액 합계가 납부세액과 일치하지 않는 경우 |

#### GET /year-end-installments — 분납 내역을 조회한다 (`listYearEndInstallments`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| yearEndResultId | integer int64 | 아니오 | year_end_installment.year_end_result_id | 연말정산 결과 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| yearEndInstallmentId | integer int64 | year_end_installment.year_end_installment_id | 연말정산 분납 ID |
| installmentNo | integer int32 | year_end_installment.installment_no | 분납 회차 |
| installmentAmount | number | year_end_installment.installment_amount | 분납 금액 |
| dueDate | string date | year_end_installment.due_date | 납부 예정일 |

오류: 공통 오류만 (1절)

#### GET /year-end-results — 연말정산 진행 현황을 조회한다 (`listYearEndResults`)

- 권한: 급여 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| targetYear | integer int32 | 아니오 | year_end_result.target_year | 정산 대상 연도 |
| departmentId | integer | 아니오 | - | 부서 조회 조건 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| yearEndResultId | integer int64 | year_end_result.year_end_result_id | 연말정산 결과 ID |
| employeeId | integer int64 | year_end_result.employee_id | 임직원 |
| targetYear | integer int32 | year_end_result.target_year | 정산 대상 연도 |
| payableTaxAmount | number | year_end_result.payable_tax_amount | 납부세액 |
| closingStatus | string(20) [신청\|마감\|마감 취소] | year_end_result.closing_status | 마감 상태 |

오류: 공통 오류만 (1절)

### FN-SFR-023-09 소득자료 제출집계표 및 지급명세서 전산매체 관리

- 요구사항: SFR-023-06 · 테이블: tax_filing, income_certificate

#### POST /tax-filings/submission-summaries — 소득자료 제출집계표를 작성한다 (`createSubmissionSummary`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| submissionYear | string(4) | 예 | tax_filing.submission_year | 제출 대상 연도 |
| incomeCategory | string(30) | 예 | tax_filing.income_category | 소득 구분 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| taxFilingId | integer int64 | tax_filing.tax_filing_id | 세무 신고서 ID |
| totalAmount | number | tax_filing.total_amount | 집계 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYMENT_STATEMENT_NOT_FOUND | 제출 대상 데이터가 없는 경우 |

#### POST /tax-filings/{taxFilingId}/generate-media — 지급명세서 전산매체 파일을 생성한다 (`generatePaymentMediaFile`)

- 권한: 급여 담당자 · 경로 변수: taxFilingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| fileName | string | - | 생성된 전산매체 파일명 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | TAX_FILING_NOT_FOUND | 제출집계표가 없는 경우 |
| 422 | MEDIA_SPEC_VALIDATION_FAILED | 국세청 제출 규격 검증에 실패한 경우 |

### FN-SFR-023-10 간이지급명세서 작성 및 전자신고

- 요구사항: SFR-023-06 · 테이블: link_log, tax_filing

#### POST /tax-filings/simplified-payments — 간이지급명세서를 작성한다 (`createSimplifiedPaymentStatement`)

- 권한: 급여 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| paymentMonth | string(6) | 예 | tax_filing.payment_month | 지급연월 |
| incomeCategory | string(30) | 예 | tax_filing.income_category | 소득 구분 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| taxFilingId | integer int64 | tax_filing.tax_filing_id | 세무 신고서 ID |
| totalAmount | number | tax_filing.total_amount | 집계 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PAYMENT_DATA_NOT_FOUND | 대상 기간 지급 데이터가 없는 경우 |

#### POST /tax-filings/{taxFilingId}/file — 간이지급명세서를 국세청에 전자신고하고 접수 결과를 저장한다 (`fileSimplifiedPaymentStatement`)

- 권한: 급여 담당자 · 경로 변수: taxFilingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| filingStatus | string(20) [DRAFT\|SUCCESS\|FAILURE] | tax_filing.filing_status | 신고 상태 |
| receiptNumber | string(50) | tax_filing.receipt_number | 접수번호 |
| resultMessage | string(1000) | tax_filing.result_message | 전자신고 결과 메시지 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | TAX_FILING_NOT_FOUND | 명세서가 없는 경우 |
| 422 | E_FILING_SPEC_INVALID | 전자파일 규격 오류 |
| 502 | NTS_LINK_FAILED | 국세청 연계 실패, 미신고 상태 유지 |

### FN-SFR-024-01 구매품의서 작성 및 예산 통제

- 요구사항: SFR-024-01 · 테이블: requisition

#### POST /requisitions — 구매품의서를 작성하고 예산 통제 후 저장한다 (`createRequisition`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /requisitions/{requisitionId} — 구매품의서를 수정한다 (`updateRequisition`)

- 권한: 임직원 · 경로 변수: requisitionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 예 | requisition.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | requisition.budget_account_id | 예산과목 |
| title | string(200) | 예 | requisition.title | 품의 제목 |
| requisitionAmount | number | 예 | requisition.requisition_amount | 품의 금액 |
| content | string | 아니오 | requisition.content | 품의 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| requisitionId | integer int64 | requisition.requisition_id | 품의서 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | REQUISITION_NOT_FOUND | 품의서가 없는 경우 |
| 409 | REQUISITION_APPROVED | 승인된 품의서를 수정하려는 경우 |
| 422 | BUDGET_BALANCE_EXCEEDED | 품의 금액이 예산잔액을 초과한 경우 |

#### DELETE /requisitions/{requisitionId} — 구매품의서를 삭제한다 (`deleteRequisition`)

- 권한: 임직원 · 경로 변수: requisitionId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | REQUISITION_NOT_FOUND | 품의서가 없는 경우 |
| 409 | REQUISITION_APPROVED | 승인된 품의서를 삭제하려는 경우 |

#### GET /requisitions/budget-status — 구매품의서별 예산 현황을 조회한다 (`listRequisitionBudgetStatus`)

- 권한: 임직원, 예산·회계 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 아니오 | requisition.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 아니오 | requisition.budget_account_id | 예산과목 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| requisitionId | integer int64 | requisition.requisition_id | 품의서 ID |
| title | string(200) | requisition.title | 품의 제목 |
| requisitionAmount | number | requisition.requisition_amount | 품의 금액 |
| executionBudgetAmount | number | - |  |
| carryoverBudgetAmount | number | - |  |
| totalBudgetAmount | number | - |  |
| executedAmount | number | - |  |
| budgetBalanceAmount | number | - |  |

오류: 공통 오류만 (1절)

### FN-SFR-024-02 구매품의 조회 및 승인 처리

- 요구사항: SFR-024-02 · 테이블: project, budget_account, approval_document, notification, requisition

#### GET /requisitions — 구매품의 현황을 조건별로 조회한다 (`listRequisitions`)

- 권한: 임직원, 예산·회계 담당자, 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 아니오 | requisition.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 아니오 | requisition.budget_account_id | 예산과목 |
| createdFrom | string | 아니오 | - | 작성일 조회 시작일 |
| createdTo | string | 아니오 | - | 작성일 조회 종료일 |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | 아니오 | requisition.status | 처리 상태 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| requisitionId | integer int64 | requisition.requisition_id | 품의서 ID |
| projectId | integer int64 | requisition.project_id | 프로젝트 |
| budgetAccountId | integer int64 | requisition.budget_account_id | 예산과목 |
| title | string(200) | requisition.title | 품의 제목 |
| requisitionAmount | number | requisition.requisition_amount | 품의 금액 |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | requisition.status | 처리 상태 |
| createdAt | string date-time | requisition.created_at | 생성 일시 |

오류: 공통 오류만 (1절)

#### GET /requisitions/{requisitionId} — 구매품의 상세를 조회한다 (`getRequisition`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /requisitions/{requisitionId}/approve — 신청 상태의 구매품의를 승인한다 (`approveRequisition`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /requisitions/{requisitionId}/reject — 신청 상태의 구매품의를 반려한다 (`rejectRequisition`)

- 권한: 임직원, 예산·회계 담당자, 시스템 관리자 · 경로 변수: requisitionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| rejectReason | string | 예 | - | 반려 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | requisition.status | 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | REQUISITION_NOT_FOUND | 구매품의가 없거나 권한 범위 밖인 경우 |
| 409 | REQUISITION_STATUS_MISMATCH | 신청 상태가 아닌 구매품의를 반려하는 경우 |
| 422 | REJECT_REASON_REQUIRED | 반려 사유가 없는 경우 |

### FN-SFR-024-03 구매품의 자산품목 관리 및 자산 등록 연계

- 요구사항: SFR-024-03 · 테이블: project, budget_account, account_subject, partner, notification, requisition, asset, purchase_asset_item

#### POST /purchase-asset-items — 구매품의 자산품목을 등록한다 (`createPurchaseAssetItem`)

- 권한: 임직원, 자산 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| requisitionId | integer int64 | 예 | purchase_asset_item.requisition_id | 품의서 |
| itemName | string(200) | 예 | purchase_asset_item.item_name | 자산품목명 |
| quantity | integer int32 | 예 | purchase_asset_item.quantity | 수량 |
| amount | number | 예 | purchase_asset_item.amount | 금액 |
| assetCategory | string(100) | 아니오 | purchase_asset_item.asset_category | 자산 분류 |
| inspectionRequired | boolean | 예 | purchase_asset_item.inspection_required | 검수 필요 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| purchaseAssetItemId | integer int64 | purchase_asset_item.purchase_asset_item_id | 구매품의 자산품목 ID |
| assetLinked | boolean | purchase_asset_item.asset_linked | 자산 등록 연계 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | REQUISITION_NOT_FOUND | 구매품의서가 없는 경우 |
| 409 | REQUISITION_ALREADY_APPROVED | 승인된 구매품의에 등록하는 경우 |

#### PATCH /purchase-asset-items/{purchaseAssetItemId} — 자산품목을 수정하고 검수 여부를 설정한다 (`updatePurchaseAssetItem`)

- 권한: 임직원, 자산 담당자 · 경로 변수: purchaseAssetItemId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| itemName | string(200) | 아니오 | purchase_asset_item.item_name | 자산품목명 |
| quantity | integer int32 | 아니오 | purchase_asset_item.quantity | 수량 |
| amount | number | 아니오 | purchase_asset_item.amount | 금액 |
| assetCategory | string(100) | 아니오 | purchase_asset_item.asset_category | 자산 분류 |
| inspectionRequired | boolean | 아니오 | purchase_asset_item.inspection_required | 검수 필요 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| purchaseAssetItemId | integer int64 | purchase_asset_item.purchase_asset_item_id | 구매품의 자산품목 ID |
| itemName | string(200) | purchase_asset_item.item_name | 자산품목명 |
| quantity | integer int32 | purchase_asset_item.quantity | 수량 |
| amount | number | purchase_asset_item.amount | 금액 |
| inspectionRequired | boolean | purchase_asset_item.inspection_required | 검수 필요 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PURCHASE_ASSET_ITEM_NOT_FOUND | 자산품목이 없는 경우 |
| 409 | REQUISITION_ALREADY_APPROVED | 승인된 구매품의의 자산품목을 수정하는 경우 |

#### GET /purchase-asset-items — 구매품의 자산품목 목록을 조회한다 (`listPurchaseAssetItems`)

- 권한: 임직원, 자산 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| requisitionId | integer int64 | 아니오 | purchase_asset_item.requisition_id | 품의서 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| purchaseAssetItemId | integer int64 | purchase_asset_item.purchase_asset_item_id | 구매품의 자산품목 ID |
| itemName | string(200) | purchase_asset_item.item_name | 자산품목명 |
| quantity | integer int32 | purchase_asset_item.quantity | 수량 |
| amount | number | purchase_asset_item.amount | 금액 |
| inspectionRequired | boolean | purchase_asset_item.inspection_required | 검수 필요 여부 |
| inspectionCompleted | boolean | purchase_asset_item.inspection_completed | 검수 완료 여부 |
| assetLinked | boolean | purchase_asset_item.asset_linked | 자산 등록 연계 여부 |
| linkedAt | string date-time | purchase_asset_item.linked_at | 자산 연계 일시 |

오류: 공통 오류만 (1절)

### FN-SFR-025-01 자산 정보 등록·관리

- 요구사항: SFR-025-01 · 테이블: asset

#### POST /assets — 자산 정보를 등록한다 (`createAsset`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PATCH /assets/{assetId} — 자산 정보를 수정한다 (`updateAsset`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /assets — 자산 목록을 조회한다 (`listAssets`)

- 권한: 자산 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| assetCode | string(50) | 아니오 | asset.asset_code | 자산코드 |
| assetName | string(200) | 아니오 | asset.asset_name | 자산명 |
| assetType | string(50) | 아니오 | asset.asset_type | 자산 유형 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetId | integer int64 | asset.asset_id | 자산 ID |
| assetCode | string(50) | asset.asset_code | 자산코드 |
| assetNo | string(50) | asset.asset_no | 자산번호 |
| assetName | string(200) | asset.asset_name | 자산명 |
| assetType | string(50) | asset.asset_type | 자산 유형 |
| assetCategory | string(50) | asset.asset_category | 자산 분류 |
| location | string(200) | asset.location | 위치 |
| managerId | integer int64 | asset.manager_id | 담당자 |
| isDepreciable | boolean | asset.is_depreciable | 상각 여부 |

오류: 공통 오류만 (1절)

### FN-SFR-025-02 자산 변동현황 등록·조회

- 요구사항: SFR-025-01 · 테이블: approval_document, asset, asset_change

#### POST /asset-changes — 자산 변동을 등록한다 (`createAssetChange`)

- 권한: 자산 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| assetId | integer int64 | 예 | asset_change.asset_id | 자산 |
| changeType | string(50) | 예 | asset_change.change_type | 변동 유형 |
| changeDate | string date | 예 | asset_change.change_date | 변동 일자 |
| changeContent | string | 예 | asset_change.change_content | 변동 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetChangeId | integer int64 | asset_change.asset_change_id | 자산 변동 이력 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ASSET_NOT_FOUND | 대상 자산이 없는 경우 |

#### GET /asset-changes — 자산 변동현황을 조회한다 (`listAssetChanges`)

- 권한: 자산 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| changeDateFrom | string | 아니오 | - | 조회 시작일 |
| changeDateTo | string | 아니오 | - | 조회 종료일 |
| assetId | integer int64 | 아니오 | asset_change.asset_id | 자산 |
| changeType | string(50) | 아니오 | asset_change.change_type | 변동 유형 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetChangeId | integer int64 | asset_change.asset_change_id | 자산 변동 이력 ID |
| assetId | integer int64 | asset_change.asset_id | 자산 |
| changeType | string(50) | asset_change.change_type | 변동 유형 |
| changeDate | string date | asset_change.change_date | 변동 일자 |
| changeContent | string | asset_change.change_content | 변동 내용 |
| changedById | integer int64 | asset_change.changed_by_id | 변경자 |

오류: 공통 오류만 (1절)

### FN-SFR-025-03 자산 QR·바코드 출력·관리

- 요구사항: SFR-025-02 · 테이블: asset, asset_print_log

#### POST /asset-print-logs — 자산번호별 QR·바코드를 출력하고 이력을 남긴다 (`printAssetCodes`)

- 권한: 자산 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| assetId | integer int64 | 예 | asset_print_log.asset_id | 자산 ID |
| printFormat | string(20) [QR\|BARCODE] | 예 | asset_print_log.print_format | 출력 형식 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetPrintLogId | integer int64 | asset_print_log.asset_print_log_id | QR·바코드 출력 이력 ID |
| label | object | - | 자산번호 기반 라벨 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ASSET_NOT_FOUND | 대상 자산번호가 없는 경우 |

#### GET /asset-print-logs — QR·바코드 출력 이력을 조회한다 (`listAssetPrintLogs`)

- 권한: 자산 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| assetId | integer int64 | 아니오 | asset_print_log.asset_id | 자산 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetPrintLogId | integer int64 | asset_print_log.asset_print_log_id | QR·바코드 출력 이력 ID |
| assetId | integer int64 | asset_print_log.asset_id | 자산 ID |
| assetNumber | string(50) | asset_print_log.asset_number | 자산번호 |
| printFormat | string(20) [QR\|BARCODE] | asset_print_log.print_format | 출력 형식 |
| printedAt | string date-time | asset_print_log.printed_at | 출력 일시 |

오류: 공통 오류만 (1절)

### FN-SFR-025-04 자산실사 계획 관리

- 요구사항: SFR-025-03 · 테이블: approval_document, asset, asset_inspection_plan

#### POST /asset-inspection-plans — 자산실사 계획을 작성한다 (`createAssetInspectionPlan`)

- 권한: 자산 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| inspectionType | string(50) | 예 | asset_inspection_plan.inspection_type | 실사 유형 |
| startDate | string date | 예 | asset_inspection_plan.start_date | 실사 시작일 |
| endDate | string date | 예 | asset_inspection_plan.end_date | 실사 종료일 |
| targetScope | string | 예 | asset_inspection_plan.target_scope | 실사 대상 범위 |
| managerId | integer int64 | 아니오 | asset_inspection_plan.manager_id | 실사 담당자 ID |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetInspectionPlanId | integer int64 | asset_inspection_plan.asset_inspection_plan_id | 자산실사 계획 ID |
| approvalStatus | string(20) [신청\|승인\|승인 취소\|반려] | asset_inspection_plan.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_INSPECTION_PERIOD | 종료일이 시작일보다 빠른 경우 |

#### PATCH /asset-inspection-plans/{assetInspectionPlanId} — 자산실사 계획을 수정한다 (`updateAssetInspectionPlan`)

- 권한: 자산 담당자 · 경로 변수: assetInspectionPlanId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| inspectionType | string(50) | 아니오 | asset_inspection_plan.inspection_type | 실사 유형 |
| startDate | string date | 아니오 | asset_inspection_plan.start_date | 실사 시작일 |
| endDate | string date | 아니오 | asset_inspection_plan.end_date | 실사 종료일 |
| targetScope | string | 아니오 | asset_inspection_plan.target_scope | 실사 대상 범위 |
| managerId | integer int64 | 아니오 | asset_inspection_plan.manager_id | 실사 담당자 ID |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetInspectionPlanId | integer int64 | asset_inspection_plan.asset_inspection_plan_id | 자산실사 계획 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | INSPECTION_PLAN_NOT_FOUND | 실사계획이 없는 경우 |
| 409 | INSPECTION_PLAN_APPROVED | 승인된 계획을 수정하는 경우 |
| 422 | INVALID_INSPECTION_PERIOD | 종료일이 시작일보다 빠른 경우 |

#### DELETE /asset-inspection-plans/{assetInspectionPlanId} — 진행 중인 미승인 실사계획을 삭제한다 (`deleteAssetInspectionPlan`)

- 권한: 자산 담당자 · 경로 변수: assetInspectionPlanId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | INSPECTION_PLAN_NOT_FOUND | 실사계획이 없는 경우 |
| 409 | INSPECTION_PLAN_APPROVED | 승인된 계획을 삭제하는 경우 |
| 409 | INSPECTION_NOT_IN_PROGRESS | 진행 중이 아닌 실사를 삭제하는 경우 |

#### POST /asset-inspection-plans/{assetInspectionPlanId}/cancel-approval — 실사계획 승인을 취소한다 (`cancelApprovalAssetInspectionPlan`)

- 권한: 자산 담당자 · 경로 변수: assetInspectionPlanId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(20) [신청\|승인\|승인 취소\|반려] | asset_inspection_plan.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | INSPECTION_PLAN_NOT_FOUND | 실사계획이 없는 경우 |
| 409 | INSPECTION_PLAN_NOT_APPROVED | 승인 상태가 아닌 계획의 승인을 취소하는 경우 |

#### POST /asset-inspection-plans/{assetInspectionPlanId}/cancel — 진행 중인 실사를 취소한다 (`cancelAssetInspectionPlan`)

- 권한: 자산 담당자 · 경로 변수: assetInspectionPlanId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| progressStatus | string(20) [진행\|완료\|취소] | asset_inspection_plan.progress_status | 진행 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | INSPECTION_PLAN_NOT_FOUND | 실사계획이 없는 경우 |
| 409 | INSPECTION_NOT_IN_PROGRESS | 진행 중이 아닌 실사를 취소하는 경우 |

#### POST /asset-inspection-plans/{assetInspectionPlanId}/complete — 진행 중인 실사를 완료 처리한다 (`completeAssetInspectionPlan`)

- 권한: 자산 담당자 · 경로 변수: assetInspectionPlanId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| progressStatus | string(20) [진행\|완료\|취소] | asset_inspection_plan.progress_status | 진행 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | INSPECTION_PLAN_NOT_FOUND | 실사계획이 없는 경우 |
| 409 | INSPECTION_NOT_IN_PROGRESS | 진행 중이 아닌 실사를 완료하는 경우 |

#### GET /asset-inspection-plans — 자산실사 계획 목록을 조회한다 (`listAssetInspectionPlans`)

- 권한: 자산 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| inspectionType | string(50) | 아니오 | asset_inspection_plan.inspection_type | 실사 유형 |
| approvalStatus | string(20) [신청\|승인\|승인 취소\|반려] | 아니오 | asset_inspection_plan.approval_status | 승인 처리 상태 |
| progressStatus | string(20) [진행\|완료\|취소] | 아니오 | asset_inspection_plan.progress_status | 진행 상태 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetInspectionPlanId | integer int64 | asset_inspection_plan.asset_inspection_plan_id | 자산실사 계획 ID |
| inspectionType | string(50) | asset_inspection_plan.inspection_type | 실사 유형 |
| startDate | string date | asset_inspection_plan.start_date | 실사 시작일 |
| endDate | string date | asset_inspection_plan.end_date | 실사 종료일 |
| approvalStatus | string(20) [신청\|승인\|승인 취소\|반려] | asset_inspection_plan.approval_status | 승인 처리 상태 |
| progressStatus | string(20) [진행\|완료\|취소] | asset_inspection_plan.progress_status | 진행 상태 |

오류: 공통 오류만 (1절)

### FN-SFR-025-05 자산실사 처리 및 현황 조회

- 요구사항: SFR-025-03 · 테이블: asset, link_log, asset_change, asset_inspection_plan, asset_inspection_item

#### POST /asset-inspection-plans/{assetInspectionPlanId}/link — 승인된 실사계획의 대상을 외부 자산실사 시스템과 연계한다 (`linkAssetInspectionPlan`)

- 권한: 자산 담당자 · 경로 변수: assetInspectionPlanId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| linkStatus | string(20) [REQUESTED\|SUCCESS\|FAILED] | link_log.status | 연계 상태 |
| failureReason | string | link_log.failure_reason | 연계 실패 시 오류 메시지 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ASSET_INSPECTION_PLAN_NOT_FOUND | 실사계획이 없는 경우 |
| 409 | ASSET_INSPECTION_PLAN_NOT_APPROVED | 승인되지 않은 계획의 실사를 처리하려는 경우 |
| 502 | ASSET_INSPECTION_LINK_FAILED | 외부 자산실사 시스템 연계에 실패한 경우 |

#### POST /asset-inspection-items/receive — 외부 자산실사 시스템이 실사 결과를 전송해 저장한다 (`receiveAssetInspectionResults`)

- 권한: 로그인 사용자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| assetInspectionPlanId | integer int64 | 예 | asset_inspection_item.asset_inspection_plan_id | 자산실사 계획 ID |
| assetId | integer int64 | 예 | asset_inspection_item.asset_id | 자산 ID |
| inspectionResult | string(20) | 아니오 | asset_inspection_item.inspection_result | 실사 결과 |
| inspectedAt | string date-time | 아니오 | asset_inspection_item.inspected_at | 실사 일시 |
| remark | string | 아니오 | asset_inspection_item.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| assetInspectionItemId | integer int64 | asset_inspection_item.asset_inspection_item_id | 자산실사 결과 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ASSET_INSPECTION_PLAN_NOT_FOUND | 실사계획이 없는 경우 |
| 409 | ASSET_INSPECTION_PLAN_NOT_APPROVED | 승인되지 않은 계획의 결과인 경우 |
| 422 | ASSET_NOT_IN_INSPECTION_PLAN | 자산이 없거나 실사 대상이 아닌 경우 |

#### GET /asset-inspection-plans — 실사진행 현황을 조회한다 (`listAssetInspectionPlans`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /asset-changes — 실사 차이 자산의 상시 변동을 처리한다 (`createAssetChange`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /asset-inspection-plans/{assetInspectionPlanId}/complete — 실사를 완료 처리한다 (`completeAssetInspectionPlan`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-025-06 자산 기초환경설정 관리

- 요구사항: SFR-025-04 · 테이블: asset, system_setting

#### GET /system-settings — 자산 기초환경설정을 조회한다 (`listSystemSettings`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /system-settings/{systemSettingId} — 자산품목코드 부여 규칙, 검수조서 사용 여부, 결재 연계 여부를 저장한다 (`updateSystemSetting2`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-026-01 통합 사용 권한 관리

- 요구사항: SFR-026-01 · 테이블: menu_permission

#### GET /menu-permissions — 메뉴별 사용 권한을 조회한다 (`listMenuPermissions`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /menu-permissions — 메뉴 사용 권한을 부여한다 (`createMenuPermission`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /menu-permissions/{menuPermissionId} — 메뉴 사용 권한과 조회 범위를 변경한다 (`updateMenuPermission2`)

- 권한: 시스템 관리자 · 경로 변수: menuPermissionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| viewScope | string(10) [전체\|부서\|개인] | 예 | menu_permission.view_scope | 조회 범위 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuPermissionId | integer int64 | menu_permission.menu_permission_id | 메뉴 사용 권한 ID |
| viewScope | string(10) [전체\|부서\|개인] | menu_permission.view_scope | 조회 범위 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MENU_PERMISSION_NOT_FOUND | 권한이 없는 경우 |

### FN-SFR-026-02 단일 포털 기반 통합 운영 및 시스템 설정 관리

- 요구사항: SFR-026-02 · 테이블: menu

#### GET /menus — 메뉴 목록을 조회한다 (`listMenus`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /menus — 포털 메뉴를 등록한다 (`createMenu`)

- 권한: 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 예 | menu.name | 메뉴명 |
| module | string(100) | 예 | menu.module | 연결 모듈 |
| useStatus | string(10) [사용\|미사용] | 예 | menu.use_status | 사용 여부 |
| displayOrder | integer int32 | 아니오 | menu.display_order | 표시순서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuId | integer int64 | menu.menu_id | 메뉴 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | MENU_MODULE_INVALID | 연결 모듈이 존재하지 않는 경우 |

#### PUT /menus/{menuId} — 메뉴 설정을 변경한다 (`updateMenu`)

- 권한: 시스템 관리자 · 경로 변수: menuId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 예 | menu.name | 메뉴명 |
| module | string(100) | 예 | menu.module | 연결 모듈 |
| useStatus | string(10) [사용\|미사용] | 예 | menu.use_status | 사용 여부 |
| displayOrder | integer int32 | 예 | menu.display_order | 표시순서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuId | integer int64 | menu.menu_id | 메뉴 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MENU_NOT_FOUND | 메뉴가 없는 경우 |
| 422 | MENU_MODULE_INVALID | 연결 모듈이 존재하지 않는 경우 |

### FN-SFR-026-03 그룹웨어 통합검색

- 요구사항: SFR-026-03 · 테이블: menu_permission, approval_document, attachment, board_post

#### GET /search-results — 그룹웨어 통합검색을 수행한다 (`searchGroupware`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| keyword | string | 예 | - | 검색어 |
| searchTarget | string | 아니오 | - | 제목, 내용, 첨부파일 제목, 첨부파일 내용 중 선택. 미선택 시 전체 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| title | string | - | 결과 제목 |
| resultType | string | - | 데이터 유형 |
| matchLocation | string | - | 일치 위치(본문/첨부) |
| targetId | integer | - | 이동할 데이터 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | SEARCH_KEYWORD_REQUIRED | 검색어가 없는 경우 |

### FN-SFR-026-04 통합업무포털 구성 및 개인화

- 요구사항: SFR-026-04 · 테이블: employee, menu, menu_permission, portal_widget_setting, portal_banner, personal_menu

#### GET /portal-widget-settings — 본인의 포털 위젯 설정을 조회한다 (`listPortalWidgetSettings`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| portalWidgetSettingId | integer int64 | portal_widget_setting.portal_widget_setting_id | 포털 위젯 설정 ID |
| widgetType | string(30) [결재양식\|결재함\|일정캘린더\|통합알림\|퀵링크\|나의정보] | portal_widget_setting.widget_type | 위젯 종류 |
| visibleYn | boolean | portal_widget_setting.visible_yn | 표시 여부 |
| displayOrder | integer int32 | portal_widget_setting.display_order | 배치 순서 |

오류: 공통 오류만 (1절)

#### POST /portal-widget-settings — 개인 포털 위젯 설정을 저장한다 (`createPortalWidgetSetting`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| widgetType | string(30) [결재양식\|결재함\|일정캘린더\|통합알림\|퀵링크\|나의정보] | 예 | portal_widget_setting.widget_type | 위젯 종류 |
| visibleYn | boolean | 예 | portal_widget_setting.visible_yn | 표시 여부 |
| displayOrder | integer int32 | 예 | portal_widget_setting.display_order | 배치 순서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| portalWidgetSettingId | integer int64 | portal_widget_setting.portal_widget_setting_id | 포털 위젯 설정 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | PORTAL_WIDGET_SETTING_DUPLICATED | 같은 위젯 설정이 이미 있는 경우 |

#### PUT /portal-widget-settings/{portalWidgetSettingId} — 개인 포털 위젯 표시와 배치를 변경한다 (`updatePortalWidgetSetting`)

- 권한: 임직원 · 경로 변수: portalWidgetSettingId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| visibleYn | boolean | 예 | portal_widget_setting.visible_yn | 표시 여부 |
| displayOrder | integer int32 | 예 | portal_widget_setting.display_order | 배치 순서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| portalWidgetSettingId | integer int64 | portal_widget_setting.portal_widget_setting_id | 포털 위젯 설정 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PORTAL_WIDGET_SETTING_NOT_FOUND | 설정이 없거나 본인 설정이 아닌 경우 |

#### GET /portal-banners — 포털 배너 목록을 조회한다 (`listPortalBanners`)

- 권한: 시스템 관리자, 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| useYn | string(10) [사용\|미사용] | 아니오 | portal_banner.use_yn | 사용 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| portalBannerId | integer int64 | portal_banner.portal_banner_id | 포털 배너 ID |
| title | string(200) | portal_banner.title | 배너 제목 |
| imageUrl | string(500) | portal_banner.image_url | 이미지 경로 |
| linkUrl | string(500) | portal_banner.link_url | 링크 URL |
| displayOrder | integer int32 | portal_banner.display_order | 표시 순서 |

오류: 공통 오류만 (1절)

#### POST /portal-banners — 포털 배너를 등록한다 (`createPortalBanner`)

- 권한: 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| title | string(200) | 예 | portal_banner.title | 배너 제목 |
| imageUrl | string(500) | 아니오 | portal_banner.image_url | 이미지 경로 |
| linkUrl | string(500) | 아니오 | portal_banner.link_url | 링크 URL |
| displayOrder | integer int32 | 예 | portal_banner.display_order | 표시 순서 |
| startDate | string date | 아니오 | portal_banner.start_date | 게시 시작일 |
| endDate | string date | 아니오 | portal_banner.end_date | 게시 종료일 |
| useYn | string(10) [사용\|미사용] | 예 | portal_banner.use_yn | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| portalBannerId | integer int64 | portal_banner.portal_banner_id | 포털 배너 ID |

오류: 공통 오류만 (1절)

#### GET /personal-menus — 본인의 개인 메뉴 구성을 조회한다 (`listPersonalMenus`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personalMenuId | integer int64 | personal_menu.personal_menu_id | 개인 메뉴 구성 ID |
| menuId | integer int64 | personal_menu.menu_id | 메뉴 |
| sortOrder | integer int32 | personal_menu.sort_order | 메뉴 구성 순서 |

오류: 공통 오류만 (1절)

### FN-SFR-026-05 첨부파일 문서 미리보기

- 요구사항: SFR-026-05 · 테이블: attachment

#### GET /attachments/{attachmentId}/preview — 첨부파일을 다운로드 없이 미리보기 형태로 변환해 조회한다 (`getAttachmentPreview`)

- 권한: 임직원 · 경로 변수: attachmentId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attachmentId | integer int64 | attachment.attachment_id | 첨부파일 ID |
| fileName | string(255) | attachment.file_name | 파일명 |
| fileExtension | string(20) | attachment.file_extension | 확장자 |
| previewContent | string | - | 변환된 미리보기 문서 내용 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTACHMENT_NOT_FOUND | 첨부파일이 없거나 문서관리 저장소에서 찾을 수 없는 경우 |
| 422 | PREVIEW_NOT_SUPPORTED | 지원하지 않는 형식이거나 미리보기 변환에 실패한 경우 |

### FN-SFR-027-02 다중 업무 화면 전환

- 요구사항: SFR-027-02 · 테이블: menu

#### GET /menus — 열 수 있는 메뉴 목록을 조회한다 (`listMenus`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /menus/{menuId}/open — 사용 권한을 확인하고 메뉴를 새 화면으로 연다 (`openMenu`)

- 권한: 임직원 · 경로 변수: menuId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuId | integer int64 | menu.menu_id | 메뉴 ID |
| name | string(100) | menu.name | 메뉴명 |
| module | string(100) | menu.module | 연결 모듈 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MENU_NOT_FOUND | 메뉴가 없거나 사용하지 않는 경우 |
| 422 | MENU_PERMISSION_DENIED | 열려는 메뉴에 사용 권한이 없는 경우 |

### FN-SFR-027-03 포털 위젯 표시

- 요구사항: SFR-027-01, SFR-027-03 · 테이블: employee, menu_permission, approval_document, approval_form, notification, schedule, portal_widget_setting, portal_banner, quick_link

#### GET /portal — 개인화 설정을 반영한 포털 위젯과 배너를 조회한다 (`getPortal`)

- 권한: 임직원

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| widgets | array | - | 위젯 종류별 표시 여부, 순서, 데이터 |
| banners | array | - | 표시할 배너 목록 |

오류: 공통 오류만 (1절)

### FN-SFR-027-04 최근 사용 메뉴 이력 조회 및 이동

- 요구사항: SFR-027-04 · 테이블: employee, menu, menu_permission, menu_usage_log

#### GET /menu-usage-logs — 본인의 최근 사용 메뉴 이력을 최근 순 최대 20건 조회한다 (`listMenuUsageLogs`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuId | integer int64 | menu_usage_log.menu_id | 메뉴 ID |
| usedAt | string date-time | menu_usage_log.used_at | 사용일시 |
| menuName | string | - | 메뉴명 |

오류: 공통 오류만 (1절)

#### POST /menu-usage-logs — 메뉴 사용 이력을 기록한다 (`createMenuUsageLog`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| menuId | integer int64 | 예 | menu_usage_log.menu_id | 메뉴 ID |
| usageEnvironment | string(10) [웹\|모바일] | 예 | menu_usage_log.usage_environment | 사용 환경 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MENU_NOT_FOUND | 메뉴가 없는 경우 |

#### POST /menus/{menuId}/open — 사용 권한을 확인하고 메뉴를 새 화면으로 연다 (`openMenu`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-027-05 포털 개인화 및 메뉴 구성 관리

- 요구사항: SFR-027-03 · 테이블: employee, menu, menu_permission, portal_widget_setting, portal_banner, personal_menu

#### PUT /portal-widget-settings — 본인의 위젯 표시 여부와 배치 순서를 저장한다 (`updatePortalWidgetSettings`)

- 권한: 임직원 · 목록 (페이지)

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| widgetType | string(30) [결재양식\|결재함\|일정캘린더\|통합알림\|퀵링크\|나의정보] | 예 | portal_widget_setting.widget_type | 위젯 종류 |
| visibleYn | boolean | 예 | portal_widget_setting.visible_yn | 표시 여부 |
| displayOrder | integer int32 | 예 | portal_widget_setting.display_order | 배치 순서 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| widgetType | string(30) [결재양식\|결재함\|일정캘린더\|통합알림\|퀵링크\|나의정보] | portal_widget_setting.widget_type | 위젯 종류 |
| visibleYn | boolean | portal_widget_setting.visible_yn | 표시 여부 |
| displayOrder | integer int32 | portal_widget_setting.display_order | 배치 순서 |

오류: 공통 오류만 (1절)

#### GET /portal-banners — 선택 가능한 배너 목록을 조회한다 (`listPortalBanners`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /personal-menus — 본인의 개인 메뉴 구성을 조회한다 (`listPersonalMenus`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /personal-menus — 개인 메뉴에 메뉴를 추가한다 (`createPersonalMenu`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| menuId | integer int64 | 예 | personal_menu.menu_id | 메뉴 |
| sortOrder | integer int32 | 예 | personal_menu.sort_order | 메뉴 구성 순서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personalMenuId | integer int64 | personal_menu.personal_menu_id | 개인 메뉴 구성 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MENU_NOT_FOUND | 메뉴가 없는 경우 |
| 422 | MENU_PERMISSION_DENIED | 사용 권한이 없는 메뉴를 추가하려는 경우 |
| 409 | PERSONAL_MENU_DUPLICATED | 이미 개인 메뉴에 추가된 메뉴인 경우 |

#### PATCH /personal-menus/{personalMenuId} — 개인 메뉴의 순서를 변경한다 (`updatePersonalMenu`)

- 권한: 임직원 · 경로 변수: personalMenuId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| sortOrder | integer int32 | 예 | personal_menu.sort_order | 메뉴 구성 순서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personalMenuId | integer int64 | personal_menu.personal_menu_id | 개인 메뉴 구성 ID |
| sortOrder | integer int32 | personal_menu.sort_order | 메뉴 구성 순서 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONAL_MENU_NOT_FOUND | 본인의 개인 메뉴가 없는 경우 |

#### DELETE /personal-menus/{personalMenuId} — 개인 메뉴에서 메뉴를 삭제한다 (`deletePersonalMenu`)

- 권한: 임직원 · 경로 변수: personalMenuId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONAL_MENU_NOT_FOUND | 본인의 개인 메뉴가 없는 경우 |

### FN-SFR-028-01 알림 및 @멘션 통합 관리

- 요구사항: SFR-028-01 · 테이블: notification

#### GET /notifications — 본인의 통합알림과 @멘션 목록을 조회한다 (`listNotifications`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| readStatus | string(10) [안읽음\|읽음] | 아니오 | notification.read_status | 읽음 상태 |
| eventType | string(50) | 아니오 | notification.event_type | 알림 이벤트 유형 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| notificationId | integer int64 | notification.notification_id | 알림 ID |
| channel | string(10) [포털\|메신저\|모바일\|대화방\|메일] | notification.channel | 알림 채널 |
| title | string(200) | notification.title | 알림 제목 |
| content | string | notification.content | 알림 내용 |
| readStatus | string(10) [안읽음\|읽음] | notification.read_status | 읽음 상태 |
| eventType | string(50) | notification.event_type | 알림 이벤트 유형 |
| targetType | string(50) | notification.target_type | 바로가기 대상 유형 |
| targetId | integer int64 | notification.target_id | 바로가기 대상 ID |
| createdAt | string date-time | notification.created_at | 생성 일시 |

오류: 공통 오류만 (1절)

#### POST /notifications/mentions — @멘션 대상 사용자별로 알림을 생성한다 (`createMentionNotifications`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| recipientId | integer int64 | 예 | notification.recipient_id | 수신자 |
| title | string(200) | 예 | notification.title | 알림 제목 |
| content | string | 아니오 | notification.content | 알림 내용 |
| targetType | string(50) | 예 | notification.target_type | 바로가기 대상 유형 |
| targetId | integer int64 | 예 | notification.target_id | 바로가기 대상 ID |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| notificationId | integer int64 | notification.notification_id | 알림 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MENTION_RECIPIENT_NOT_FOUND | 멘션 대상 사용자가 존재하지 않는 경우 |
| 422 | MENTION_ACCESS_DENIED | 멘션 대상 사용자가 해당 콘텐츠에 접근 권한이 없는 경우 |

#### PATCH /notifications/{notificationId}/read — 알림을 읽음 상태로 변경한다 (`readNotification`)

- 권한: 임직원 · 경로 변수: notificationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| notificationId | integer int64 | notification.notification_id | 알림 ID |
| readStatus | string(10) [안읽음\|읽음] | notification.read_status | 읽음 상태 |
| readAt | string date-time | notification.read_at | 읽은 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | NOTIFICATION_NOT_FOUND | 본인에게 발송된 알림이 없는 경우 |

### FN-SFR-028-03 알림 바로가기 및 조회

- 요구사항: SFR-028-03 · 테이블: notification

#### GET /notifications — 본인에게 수신된 알림과 멘션의 제목·요약 목록을 날짜별로 조회한다 (`listNotifications`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /notifications/{notificationId} — 선택한 알림의 상세 내용과 바로가기 대상을 조회하고 읽음으로 변경한다 (`getNotification`)

- 권한: 임직원 · 경로 변수: notificationId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| notificationId | integer int64 | notification.notification_id | 알림 ID |
| title | string(200) | notification.title | 알림 제목 |
| content | string | notification.content | 알림 내용 |
| readStatus | string(10) [안읽음\|읽음] | notification.read_status | 읽음 상태 |
| readAt | string date-time | notification.read_at | 읽은 일시 |
| eventType | string(50) | notification.event_type | 알림 이벤트 유형 |
| targetType | string(50) | notification.target_type | 바로가기 대상 유형 |
| targetId | integer int64 | notification.target_id | 바로가기 대상 ID |
| createdAt | string date-time | notification.created_at | 생성 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | NOTIFICATION_NOT_FOUND | 알림이 없거나 본인에게 수신된 알림이 아닌 경우 |
| 404 | SHORTCUT_TARGET_NOT_FOUND | 바로가기 대상 문서가 삭제된 경우 |
| 422 | SHORTCUT_ACCESS_DENIED | 바로가기 대상 메뉴·문서에 접근 권한이 없는 경우 |

### FN-SFR-028-04 알림 읽음 처리 및 상태 표시

- 요구사항: SFR-028-04 · 테이블: notification

#### POST /notifications/read-all — 본인의 안읽음 알림을 모두 읽음으로 변경한다 (`readAllNotifications`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| readCount | integer | - | 읽음 처리된 알림 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | NO_UNREAD_NOTIFICATIONS | 안읽음 알림이 없어 처리 대상이 없는 경우 |

### FN-SFR-029-01 결재양식 및 결재 프로세스 관리

- 요구사항: SFR-029-01 · 테이블: approval_form

#### GET /approval-forms — 결재양식 목록을 조회한다 (`listApprovalForms`)

- 권한: 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| useStatus | string(10) [사용\|미사용] | 아니오 | approval_form.use_status | 사용 여부 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalFormId | integer int64 | approval_form.approval_form_id | 결재양식 ID |
| formName | string(200) | approval_form.form_name | 결재양식명 |
| useStatus | string(10) [사용\|미사용] | approval_form.use_status | 사용 여부 |

오류: 공통 오류만 (1절)

#### POST /approval-forms — 결재양식을 등록한다 (`createApprovalForm`)

- 권한: 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| formName | string(200) | 예 | approval_form.form_name | 결재양식명 |
| formBody | string | 아니오 | approval_form.form_body | 양식 본문(HTML) |
| approvalProcessRule | string | 아니오 | approval_form.approval_process_rule | 결재 프로세스 규칙 |
| useStatus | string(10) [사용\|미사용] | 아니오 | approval_form.use_status | 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalFormId | integer int64 | approval_form.approval_form_id | 결재양식 ID |
| formName | string(200) | approval_form.form_name | 결재양식명 |
| useStatus | string(10) [사용\|미사용] | approval_form.use_status | 사용 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 양식명 등 필수값이 누락된 경우 |

#### PUT /approval-forms/{approvalFormId} — 결재양식과 결재 프로세스 규칙을 수정한다 (`updateApprovalForm`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-029-02 결재 처리 및 문서 조회

- 요구사항: SFR-029-02 · 테이블: approval_document

#### GET /approval-documents — 진행상태 및 결재예정 문서 목록을 조회 권한 범위에서 조회한다 (`listApprovalDocuments`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | 아니오 | approval_document.approval_status | 전자결재 처리 상태 |
| pendingOnly | boolean | 아니오 | - | 본인 결재예정 문서만 조회 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalDocumentId | integer int64 | approval_document.approval_document_id | 전자결재 문서 ID |
| documentNo | string(50) | approval_document.document_no | 문서번호 |
| title | string(500) | approval_document.title | 문서 제목 |
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 전자결재 처리 상태 |
| submittedAt | string date-time | approval_document.submitted_at | 상신 일시 |

오류: 공통 오류만 (1절)

#### POST /approval-documents/{approvalDocumentId}/process — 결재자가 문서를 승인·보류·반려한다 (`processApprovalDocument`)

- 권한: 임직원 · 경로 변수: approvalDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| approvalStatus | string(20) [결재대기\|승인\|보류\|반려] | 예 | approval_line.approval_status | 승인/보류/반려 |
| opinion | string | 아니오 | approval_line.opinion | 결재 의견 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 전자결재 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 문서가 없는 경우 |
| 409 | NOT_APPROVER_TURN | 본인의 결재 차례가 아니거나 결재자가 아닌 경우 |

#### POST /approval-documents/{approvalDocumentId}/withdraw — 기안자가 문서를 회수한다 (`withdrawApprovalDocument`)

- 권한: 임직원 · 경로 변수: approvalDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 전자결재 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 문서가 없는 경우 |
| 409 | WITHDRAW_NOT_ALLOWED | 이미 처리 완료되어 회수 가능한 상태가 아니거나 기안자가 아닌 경우 |

#### DELETE /approval-documents/{approvalDocumentId} — 반려·회수된 문서를 삭제한다 (`deleteApprovalDocument`)

- 권한: 임직원 · 경로 변수: approvalDocumentId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 문서가 없는 경우 |
| 409 | DELETE_NOT_ALLOWED | 반려·회수 상태가 아닌 문서를 삭제하려는 경우 |

### FN-SFR-029-04 일괄기안·연속결재·재기안

- 요구사항: SFR-029-03 · 테이블: approval_document, approval_line

#### POST /approval-documents — 전자결재 문서를 기안한다 (`createApprovalDocument`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| approvalFormId | integer int64 | 예 | approval_document.approval_form_id | 결재양식 |
| title | string(500) | 예 | approval_document.title | 문서 제목 |
| body | string | 아니오 | approval_document.body | 문서 본문 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalDocumentId | integer int64 | approval_document.approval_document_id | 전자결재 문서 ID |
| documentNo | string(50) | approval_document.document_no | 문서번호 |
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 전자결재 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 필수값이 누락되었거나 미사용 양식을 선택한 경우 |

#### POST /approval-documents/batch-draft — 선택한 여러 문서를 각각 별도 결재문서로 일괄 기안한다 (`batchDraftApprovalDocuments`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| documents | array | 예 | - | 일괄 기안할 문서 목록(양식·제목·본문) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| draftedCount | integer | - | 기안된 문서 건수 |
| results | array | - | 기안된 문서와 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | REQUIRED_FIELD_MISSING | 일괄기안 대상 중 필수값이 누락된 문서가 있는 경우 |

#### POST /approval-documents/{approvalDocumentId}/redraft — 기작성 문서를 기반으로 새 문서로 재기안한다 (`redraftApprovalDocument`)

- 권한: 임직원 · 경로 변수: approvalDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| title | string(500) | 예 | approval_document.title | 문서 제목 |
| body | string | 아니오 | approval_document.body | 문서 본문 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalDocumentId | integer int64 | approval_document.approval_document_id | 전자결재 문서 ID |
| documentNo | string(50) | approval_document.document_no | 문서번호 |
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 전자결재 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 원본 문서가 없는 경우 |
| 409 | REDRAFT_NOT_ALLOWED | 반려·회수 상태가 아닌 문서를 재기안하는 경우 |

### FN-SFR-029-05 겸직 사용자 업무환경 및 결재 알림

- 요구사항: SFR-029-04 · 테이블: employee, department, notification, employee_department

#### GET /employee-departments — 겸직자의 소속(주부서·겸직 부서) 목록을 조회해 주부서 기준 업무환경을 구성한다 (`listEmployeeDepartments`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | employee_department.employee_id | 임직원 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeDepartmentId | integer int64 | employee_department.employee_department_id | 겸직 부서 ID |
| employeeId | integer int64 | employee_department.employee_id | 임직원 |
| departmentId | integer int64 | employee_department.department_id | 겸직 부서 |
| primaryDepartmentId | integer int64 | employee.department_id | 주부서 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 대상 임직원이 존재하지 않음 |

#### GET /notifications — 수신자의 통합알림 목록을 조회한다 (`listNotifications`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-029-07 긴급결재 및 보안문서 설정

- 요구사항: SFR-029-06 · 테이블: approval_document, change_history

#### POST /approval-documents/{approvalDocumentId}/designate-security — 완료된 결재문서를 보안문서로 지정하고 변경 이력을 남긴다 (`designateSecurityApprovalDocument`)

- 권한: 임직원 · 경로 변수: approvalDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| changeContent | string | 예 | change_history.change_content | 변경 내용 |
| changeReason | string(500) | 아니오 | change_history.change_reason | 변경 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalDocumentId | integer int64 | approval_document.approval_document_id | 전자결재 문서 ID |
| securityDesignated | boolean | - | 보안문서 지정 반영 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 대상 문서가 없음 |
| 409 | APPROVAL_DOCUMENT_NOT_COMPLETED | 결재 완료 상태가 아닌 문서를 지정함 |
| 422 | SECURITY_DESIGNATION_NOT_ALLOWED | 지정 권한이 없는 사용자가 지정함 |

### FN-SFR-029-08 결재 관련 알림 발송

- 요구사항: SFR-029-07 · 테이블: approval_document, notification

#### GET /notifications — 수신자의 통합알림 목록을 조회한다 (`listNotifications`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /notifications/{notificationId}/read — 알림을 읽음 처리한다 (`readNotification2`)

- 권한: 임직원 · 경로 변수: notificationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| notificationId | integer int64 | notification.notification_id | 알림 ID |
| readStatus | string(10) [안읽음\|읽음] | notification.read_status | 읽음 상태 |
| readAt | string date-time | notification.read_at | 읽은 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | NOTIFICATION_NOT_FOUND | 대상 알림이 없거나 본인 알림이 아님 |

### FN-SFR-029-09 결재문서 작성 및 서명

- 요구사항: SFR-029-08 · 테이블: approval_document, approval_form, attachment

#### POST /approval-documents — 결재문서를 작성해 기안 상태로 저장한다 (`createApprovalDocument`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /attachments — 결재문서에 첨부파일을 등록한다 (`createAttachment`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| file | string | 예 | - | 업로드 파일 |
| targetType | string(50) | 아니오 | attachment.target_type | 업무 대상 유형 |
| targetId | integer int64 | 아니오 | attachment.target_id | 업무 대상 ID |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attachmentId | integer int64 | attachment.attachment_id | 첨부파일 ID |
| fileName | string(255) | attachment.file_name | 파일명 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 첨부 대상 문서가 없음 |

### FN-SFR-030-01 웹 기안기 결재 상신

- 요구사항: SFR-030-01 · 테이블: approval_document

#### POST /approval-documents — 결재문서를 작성해 기안 상태로 저장한다 (`createApprovalDocument`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /approval-documents/{approvalDocumentId}/submit — 기안 문서를 결재선과 함께 상신해 결재대기로 전환한다 (`submitApprovalDocument`)

- 권한: 임직원 · 경로 변수: approvalDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| approverIds | array | 예 | - | 결재선 결재자 ID 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalDocumentId | integer int64 | approval_document.approval_document_id | 전자결재 문서 ID |
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 전자결재 처리 상태 |
| submittedAt | string date-time | approval_document.submitted_at | 상신 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 대상 문서가 없음 |
| 409 | APPROVAL_DOCUMENT_NOT_DRAFT | 기안 상태가 아닌 문서를 상신함 |
| 422 | REQUIRED_FIELD_MISSING | 제목·본문·결재선 중 누락이 있음 |

### FN-SFR-030-02 기존 문서 파일 기반 결재양식 편집·변환

- 요구사항: SFR-030-01 · 테이블: approval_form

#### POST /approval-forms/convert — 기존 문서 파일(HWP·Word 등)을 HTML 결재양식으로 변환한다 (`convertApprovalFormFile`)

- 권한: 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| file | object | 예 | - | 변환할 기존 문서 파일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| formBody | string | approval_form.form_body | 변환된 HTML 양식 내용 |
| converted | boolean | - | 변환 성공 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | UNSUPPORTED_FILE_TYPE | 지원하지 않는 파일 형식인 경우 |
| 422 | FORM_CONVERSION_FAILED | 파일 변환에 실패한 경우 |

#### POST /approval-forms — 편집한 HTML 결재양식을 등록한다 (`createApprovalForm`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-030-03 한글웹기안기 웹기안

- 요구사항: SFR-030-03 · 테이블: approval_document, approval_form, approval_line

#### POST /approval-documents — 한글웹기안기로 작성한 결재문서를 상신한다 (`createApprovalDocument`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-031-01 결재문서 공통관리 설정

- 요구사항: SFR-031-01 · 테이블: department

#### GET /departments — 관리부서 및 부서 약칭 목록을 조회한다 (`listDepartments`)

- 권한: 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| departmentId | integer int64 | department.department_id | 부서 ID |
| departmentCode | string(50) | department.department_code | 부서코드 |
| name | string(100) | department.name | 부서명 |
| abbreviation | string(50) | department.abbreviation | 부서 약칭 |

오류: 공통 오류만 (1절)

#### PATCH /departments/{departmentId} — 부서 약칭을 수정한다 (`updateDepartment`)

- 권한: 시스템 관리자 · 경로 변수: departmentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| abbreviation | string(50) | 예 | department.abbreviation | 부서 약칭 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| departmentId | integer int64 | department.department_id | 부서 ID |
| abbreviation | string(50) | department.abbreviation | 부서 약칭 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | DEPARTMENT_NOT_FOUND | 부서가 없는 경우 |
| 422 | ABBREVIATION_REQUIRED | 부서 약칭 기반 채번 규칙인데 약칭이 없는 경우 |

### FN-SFR-031-02 전자결재 문서 인수인계

- 요구사항: SFR-031-02 · 테이블: employee, department, approval_document, change_history, personnel_appointment, approval_handover

#### POST /approval-handovers — 전자결재 문서를 인수 대상에게 인수인계한다 (`createApprovalHandover`)

- 권한: 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| fromEmployeeId | integer int64 | 예 | approval_handover.from_employee_id | 인계자 ID |
| toEmployeeId | integer int64 | 예 | approval_handover.to_employee_id | 인수자 ID |
| reason | string(500) | 예 | approval_handover.reason | 인수인계 사유 |
| documentScope | string(1000) | 예 | approval_handover.document_scope | 문서 범위 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalHandoverId | integer int64 | approval_handover.approval_handover_id | 결재문서 인수인계 ID |
| handedOverCount | integer | - | 이관된 문서 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 인계자 또는 인수자가 없는 경우 |
| 422 | INVALID_HANDOVER_TARGET | 인수 대상이 유효하지 않은 경우 |

### FN-SFR-031-04 문서 수정이력 관리

- 요구사항: SFR-031-04 · 테이블: approval_document, change_history

#### GET /change-histories — 문서의 수정이력을 조회한다 (`listChangeHistories`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-031-05 첨부파일 관리

- 요구사항: SFR-031-05 · 테이블: attachment

#### POST /attachments — 첨부파일 중복 검증 후 ECM에 저장 (`createAttachment`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /attachments — 문서의 첨부파일 목록 조회 (`listAttachments`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| targetType | string(50) | 예 | attachment.target_type | 업무 대상 유형 |
| targetId | integer int64 | 예 | attachment.target_id | 업무 대상 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attachmentId | integer int64 | attachment.attachment_id | 첨부파일 ID |
| fileName | string(255) | attachment.file_name | 파일명 |
| fileExtension | string(20) | attachment.file_extension | 확장자 |
| fileSize | integer int64 | attachment.file_size | 파일 크기(바이트) |
| downloadAllowed | boolean | - | 사용 권한에 따른 다운로드 허용 여부 |
| previewAvailable | boolean | - | HWP·Word·Excel·PPT 미리보기 가능 여부 |

오류: 공통 오류만 (1절)

#### GET /attachments/{attachmentId}/download — 권한이 있는 경우 첨부파일 다운로드 (`downloadAttachment`)

- 권한: 임직원 · 경로 변수: attachmentId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| file | string | - | ECM에서 가져온 파일 내용 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTACHMENT_NOT_FOUND | 첨부파일이 없는 경우 |
| 422 | DOWNLOAD_NOT_ALLOWED | 다운로드 권한이 없어 차단되는 경우(미리보기만 제공) |
| 502 | ECM_LINK_FAILED | ECM 연계 조회에 실패한 경우 |

#### GET /attachments/{attachmentId}/preview — 첨부파일 미리보기 조회 (`getAttachmentPreview`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-032-01 본인 인사정보 조회

- 요구사항: SFR-032-01, SFR-032-03 · 테이블: employee, menu_permission, personal_info_access_log, personnel_record

#### GET /personnel-records/me — 본인 인사기록카드 조회 및 열람 이력 기록 (`getMyPersonnelRecord`)

- 권한: 임직원

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| personnelRecordId | integer int64 | personnel_record.personnel_record_id | 인사기록카드 ID |
| employeeNo | string(50) | employee.employee_no | 사번 |
| name | string(100) | employee.name | 임직원명 |
| hireDate | string date | personnel_record.hire_date | 입사일 |
| recruitmentType | string(50) | personnel_record.recruitment_type | 채용 구분 |
| recruitmentNote | string | personnel_record.recruitment_note | 채용 정보 비고 |
| address | string(1000) | personnel_record.address_enc | 주소(암호화) |
| veteranInfo | string(200) | personnel_record.veteran_info | 보훈 정보 |
| militaryServiceInfo | string(200) | personnel_record.military_service_info | 병역 정보 |
| employmentStatus | string(20) [재직자\|퇴직자] | personnel_record.employment_status | 재직 구분 |
| resignationDate | string date | personnel_record.resignation_date | 퇴사일 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | PERSONNEL_RECORD_NOT_FOUND | 본인의 인사기록카드가 없는 경우 |

### FN-SFR-032-02 증명서 신청 및 발급

- 요구사항: SFR-032-03 · 테이블: employee, approval_document, notification, personal_info_access_log, certificate_type, certificate_request

#### POST /certificate-requests — 증명서 신청 및 승인 불필요 시 발급 (`createCertificateRequest`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /certificate-requests — 본인 증명서 신청 현황 조회 (`listCertificateRequests`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-032-03 근태신청 및 근무변경 관리

- 요구사항: SFR-032-02 · 테이블: attendance_request

#### POST /attendance-requests — 근태·근무변경 신청 등록 (`createAttendanceRequest`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /attendance-requests — 본인 근태신청 현황 조회 (`listAttendanceRequests`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /attendance-requests/{attendanceRequestId} — 근태신청 수정 (`updateAttendanceRequest`)

- 권한: 임직원 · 경로 변수: attendanceRequestId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | 예 | attendance_request.attendance_type | 근태 유형 |
| startDate | string date | 예 | attendance_request.start_date | 시작일 |
| endDate | string date | 예 | attendance_request.end_date | 종료일 |
| reason | string(1000) | 아니오 | attendance_request.reason | 사유 |
| changedWorkTime | string(100) | 아니오 | attendance_request.changed_work_time | 변경 근무시간 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceRequestId | integer int64 | attendance_request.attendance_request_id | 근태 ID |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | attendance_request.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_REQUEST_NOT_FOUND | 신청 건이 없는 경우 |
| 409 | ATTENDANCE_REQUEST_LOCKED | 승인된 건이거나 마감된 기간의 건인 경우 |
| 422 | ATTENDANCE_REQUEST_INVALID | 필수값 누락 또는 종료일이 시작일보다 빠른 경우 |
| 422 | LEAVE_BALANCE_INSUFFICIENT | 잔여 일수가 부족한 경우 |

#### DELETE /attendance-requests/{attendanceRequestId} — 근태신청 삭제 (`deleteAttendanceRequest`)

- 권한: 임직원 · 경로 변수: attendanceRequestId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_REQUEST_NOT_FOUND | 신청 건이 없는 경우 |
| 409 | ATTENDANCE_REQUEST_LOCKED | 승인된 건이거나 마감된 기간의 건인 경우 |

### FN-SFR-032-04 근무시간 동의 및 근태집계 현황 조회

- 요구사항: SFR-032-02 · 테이블: employee, attendance_request

#### POST /attendance-requests/{attendanceRequestId}/consent — 근무시간 동의 (`consentAttendanceRequest`)

- 권한: 임직원 · 경로 변수: attendanceRequestId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| consentedAt | string | - | 동의 일시 |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | attendance_request.approval_status | 승인 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | ATTENDANCE_REQUEST_NOT_FOUND | 대상 근태 데이터가 없는 경우 |
| 409 | ATTENDANCE_PERIOD_CLOSED | 마감된 기간이거나 승인된 건인 경우 |

#### GET /attendance-summaries — 기간별 근태 유형별 집계 현황 조회 (`listAttendanceSummaries`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| month | string | 예 | - | 조회 기간(월 단위) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| attendanceType | string(20) [연차\|반차\|보상휴가\|병가\|예비군\|출장\|외근\|교육] | attendance_request.attendance_type | 근태 유형 |
| approvalStatus | string(20) [신청\|마감\|마감 취소\|승인\|승인 취소\|반려] | attendance_request.approval_status | 승인 처리 상태 |
| count | integer | - | 건수 |
| consentedAt | string | - | 동의 일시 |

오류: 공통 오류만 (1절)

### FN-SFR-032-05 월별 연차계획 작성 및 연차촉진 확인

- 요구사항: SFR-032-02 · 테이블: approval_document, notification, attendance_request, annual_leave_plan, leave_promotion, annual_leave

#### POST /annual-leave-plans — 월별 연차계획 작성 (`createAnnualLeavePlan`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /annual-leave-plans — 본인 연차계획 및 승인 상태 조회 (`listAnnualLeavePlans`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PUT /annual-leave-plans/{annualLeavePlanId} — 연차계획 수정 (`updateAnnualLeavePlan`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /leave-promotions — 본인 대상 연차촉진 내역 조회 (`listLeavePromotions`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-032-06 급여명세서 및 퇴직금 시뮬레이션 조회

- 요구사항: SFR-032-04 · 테이블: employee, payroll, personal_info_access_log, personnel_record

#### GET /payrolls — 본인의 확정된 급여명세서를 조회하고 열람 이력을 기록한다 (`listPayrolls`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /severance-simulations — 퇴직 예정일 기준 예상 퇴직금을 계산해 조회한다(저장하지 않음) (`getSeveranceSimulation`)

- 권한: 임직원

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| resignationDate | string date | 예 | personnel_record.resignation_date | 퇴직금 시뮬레이션 기준일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| hireDate | string date | personnel_record.hire_date | 입사일 |
| estimatedSeverancePay | number | - | 기준일 기준 예상 퇴직금 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_RESIGNATION_DATE | 퇴직 예정일이 유효하지 않은 경우 |

### FN-SFR-032-07 개인 연말정산 자료 입력 및 관리

- 요구사항: SFR-032-04 · 테이블: employee, attachment, personal_info_access_log, personnel_record, year_end_data

#### GET /year-end-data — 본인의 연말정산 자료를 조회한다 (`listYearEndData`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| targetYear | integer int32 | 예 | year_end_data.target_year | 정산 대상 연도 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| yearEndDataId | integer int64 | year_end_data.year_end_data_id | 연말정산 자료 ID |
| yearEndItemId | integer int64 | year_end_data.year_end_item_id | 연말정산 항목 |
| targetYear | integer int32 | year_end_data.target_year | 정산 대상 연도 |
| amount | number | year_end_data.amount | 금액 |
| closingStatus | string(20) [신청\|마감\|마감 취소] | year_end_data.closing_status | 마감 상태 |
| attachmentId | integer int64 | year_end_data.attachment_id | 증빙 첨부파일 |
| remark | string(500) | year_end_data.remark | 비고 |

오류: 공통 오류만 (1절)

#### POST /year-end-data — 연말정산 공제 항목을 입력한다 (`createYearEndData`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### PATCH /year-end-data/{yearEndDataId} — 본인의 연말정산 자료를 수정한다 (`updateYearEndData2`)

- 권한: 임직원 · 경로 변수: yearEndDataId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| amount | number | 아니오 | year_end_data.amount | 금액 |
| attachmentId | integer int64 | 아니오 | year_end_data.attachment_id | 증빙 첨부파일 |
| remark | string(500) | 아니오 | year_end_data.remark | 비고 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| yearEndDataId | integer int64 | year_end_data.year_end_data_id | 연말정산 자료 ID |
| closingStatus | string(20) [신청\|마감\|마감 취소] | year_end_data.closing_status | 마감 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | YEAR_END_DATA_NOT_FOUND | 본인의 해당 자료가 없는 경우 |
| 409 | YEAR_END_INPUT_CLOSED | 입력 기간 종료 또는 마감된 자료 |
| 422 | INVALID_YEAR_END_INPUT | 형식 오류 |

#### POST /year-end-data/{yearEndDataId}/submit — 연말정산 자료를 제출한다 (`submitYearEndData`)

- 권한: 임직원 · 경로 변수: yearEndDataId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| closingStatus | string(20) [신청\|마감\|마감 취소] | year_end_data.closing_status | 마감 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | YEAR_END_DATA_NOT_FOUND | 본인의 해당 자료가 없는 경우 |
| 409 | YEAR_END_INPUT_CLOSED | 입력 기간이 아니거나 마감된 경우 |

### FN-SFR-032-08 지출품의서 작성 및 결재 연계

- 요구사항: SFR-032-05 · 테이블: project, budget_account, approval_document, notification, attachment, requisition

#### POST /requisitions — 지출품의서를 작성한다 (`createRequisition`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /requisitions/{requisitionId}/submit — 품의서를 상신하고 S3 전자결재를 연계한다 (`submitRequisition`)

- 권한: 임직원 · 경로 변수: requisitionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | requisition.status | 처리 상태 |
| approvalDocumentId | integer int64 | requisition.approval_document_id | 전자결재 문서 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | REQUISITION_NOT_FOUND | 품의서가 없는 경우 |
| 409 | REQUISITION_NOT_EDITABLE | 이미 승인된 품의서이거나 상신할 수 없는 상태 |
| 422 | BUDGET_CONTROL_EXCEEDED | 예산 통제 기준 초과 |
| 502 | APPROVAL_LINK_FAILED | S3 결재 연계 실패 |

### FN-SFR-032-09 지출결의 및 증빙자료 현황 조회

- 요구사항: SFR-032-05 · 테이블: menu_permission, credit_card, attachment, requisition, expense_resolution, tax_invoice

#### GET /expense-resolutions — 권한 범위 내 지출결의 현황과 증빙 정보를 조회한다 (`listExpenseResolutions`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-032-10 예산정보 조회 및 예산 통제

- 요구사항: SFR-032-06 · 테이블: project, budget_account, budget_execution, budget_adjustment, requisition, expense_resolution

#### GET /budget-controls — 예산정보를 조회하고 요청 금액의 집행 가능 여부를 판단한다 (`getBudgetControl`)

- 권한: 임직원, 예산·회계 담당자

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| projectId | integer int64 | 예 | budget_adjustment.project_id | 프로젝트 |
| budgetAccountId | integer int64 | 예 | budget_adjustment.budget_account_id | 예산과목(출처) |
| baseDate | string | 아니오 | - | 통제 주기 판단 기준 일자 |
| requestAmount | number | 아니오 | - | 집행 요청 금액 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| allocatedAmount | number | - | 배정액 |
| executedAmount | number | - | 집행액 |
| balanceAmount | number | - | 잔액 |
| controlCycle | string(10) [월\|분기\|연] | budget_account.control_cycle | 예산 통제 주기 |
| executable | boolean | - | 집행 가능 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BUDGET_BASIS_NOT_FOUND | 예산과목 또는 실행예산이 없는 경우 |
| 422 | BUDGET_BALANCE_EXCEEDED | 요청 금액이 잔액 초과 |

### FN-SFR-032-11 ERP 연계 예산 반영 및 자동전표 처리

- 요구사항: SFR-032-06 · 테이블: project, budget_account, account_subject, partner, budget_execution, expense_resolution, journal_entry, link_log

#### POST /expense-resolutions/{expenseResolutionId}/reflect-budget — 승인된 결의서를 기존 ERP에 연계해 예산 집행을 반영하고 자동전표를 생성한다 (`reflectExpenseResolutionBudget`)

- 권한: 로그인 사용자 · 경로 변수: expenseResolutionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| accountSubjectId | integer int64 | 아니오 | budget_account.account_subject_id | 자동전표 분개 계정과목 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| journalEntryId | integer int64 | journal_entry.journal_entry_id | 전표 ID |
| entryDate | string date | journal_entry.entry_date | 전표 일자 |
| totalDebitAmount | number | journal_entry.total_debit_amount | 차변 합계 |
| totalCreditAmount | number | journal_entry.total_credit_amount | 대변 합계 |
| executionAmount | number | budget_execution.execution_amount | 실행예산 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EXPENSE_RESOLUTION_NOT_FOUND | 결의서가 없는 경우 |
| 409 | EXPENSE_RESOLUTION_ALREADY_REFLECTED | 이미 반영된 결의서 재처리 |
| 422 | ACCOUNT_MAPPING_NOT_FOUND | 계정과목 매핑 기준이 없는 경우 |
| 502 | LEGACY_ERP_LINK_FAILED | 기존 ERP 연계 실패 |

### FN-SFR-032-12 지출결의서 작성 및 결재 연계

- 요구사항: SFR-032-05 · 테이블: expense_resolution

#### POST /expense-resolutions — 지출결의서를 작성하여 저장한다 (`createExpenseResolution`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /expense-resolutions/{expenseResolutionId}/submit — 지출결의서를 상신하여 결재를 연계한다 (`submitExpenseResolution`)

- 권한: 임직원 · 경로 변수: expenseResolutionId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| expenseResolutionId | integer int64 | expense_resolution.expense_resolution_id | 결의서 ID |
| approvalDocumentId | integer int64 | expense_resolution.approval_document_id | 전자결재 문서 |
| status | string(20) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | expense_resolution.status | 진행 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EXPENSE_RESOLUTION_NOT_FOUND | 결의서가 없는 경우 |
| 409 | EXPENSE_RESOLUTION_INVALID_STATUS | 상신할 수 없는 상태(승인 등)인 경우 |
| 422 | BUDGET_LIMIT_EXCEEDED | 예산 통제 기준 초과 또는 필수값 누락인 경우 |

### FN-SFR-033-01 자원 예약 현황 조회

- 요구사항: SFR-033-01 · 테이블: menu_permission, attachment, resource_category, resource, resource_attribute, resource_permission, resource_reservation

#### GET /resources — 권한 범위 내 사용 가능 자원 목록을 조회한다 (`listResources`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| resourceCategoryId | integer int64 | 아니오 | resource.resource_category_id | 자원 분류 ID |
| attributeName | string(100) | 아니오 | resource_attribute.attribute_name | 속성명 |
| attributeValue | string(500) | 아니오 | resource_attribute.attribute_value | 속성값 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| resourceId | integer int64 | resource.resource_id | 자원 ID |
| name | string(100) | resource.name | 자원명 |
| resourceCategoryId | integer int64 | resource.resource_category_id | 자원 분류 ID |
| approvalRequired | string(10) [사용\|미사용] | resource.approval_required | 승인절차 사용 여부 |

오류: 공통 오류만 (1절)

#### GET /resource-reservations — 자원 예약 현황을 일간·주간·월간 캘린더로 조회한다 (`listResourceReservations`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| viewType | string | 예 | - | DAY/WEEK/MONTH 중 선택 |
| baseDate | string | 예 | - | 조회 기준일 |
| resourceCategoryId | integer | 아니오 | - |  |
| resourceId | integer int64 | 아니오 | resource_reservation.resource_id | 자원 |
| mine | boolean | 아니오 | - | 본인 예약만 조회 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| resourceReservationId | integer int64 | resource_reservation.resource_reservation_id | 자원 예약 ID |
| resourceId | integer int64 | resource_reservation.resource_id | 자원 |
| startAt | string date-time | resource_reservation.start_at | 시작 일시 |
| endAt | string date-time | resource_reservation.end_at | 종료 일시 |
| status | string(20) [신청\|승인\|반려\|취소] | resource_reservation.status | 예약 상태 |

오류: 공통 오류만 (1절)

#### GET /resource-reservations/{resourceReservationId} — 예약 내역 상세를 조회한다 (`getResourceReservation`)

- 권한: 임직원 · 경로 변수: resourceReservationId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| resourceId | integer int64 | resource_reservation.resource_id | 자원 |
| reserverId | integer int64 | resource_reservation.reserver_id | 예약자 |
| userId | integer int64 | resource_reservation.user_id | 사용자 |
| startAt | string date-time | resource_reservation.start_at | 시작 일시 |
| endAt | string date-time | resource_reservation.end_at | 종료 일시 |
| repeatType | string(20) [NONE\|DAILY\|WEEKLY\|MONTHLY] | resource_reservation.repeat_type | 반복 유형 |
| repeatUntil | string date | resource_reservation.repeat_until | 반복 종료일 |
| content | string | resource_reservation.content | 예약 내용 |
| status | string(20) [신청\|승인\|반려\|취소] | resource_reservation.status | 예약 상태 |
| attachments | array | - | 첨부파일 목록 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_RESERVATION_NOT_FOUND | 예약이 없는 경우 |

### FN-SFR-033-02 자원 예약 등록

- 요구사항: SFR-033-01 · 테이블: attachment, resource, resource_permission, resource_reservation

#### POST /resource-reservations — 자원 예약을 등록한다 (`createResourceReservation`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| resourceId | integer int64 | 예 | resource_reservation.resource_id | 자원 |
| startAt | string date-time | 예 | resource_reservation.start_at | 시작 일시 |
| endAt | string date-time | 예 | resource_reservation.end_at | 종료 일시 |
| repeatType | string(20) [NONE\|DAILY\|WEEKLY\|MONTHLY] | 아니오 | resource_reservation.repeat_type | 반복 유형 |
| repeatUntil | string date | 아니오 | resource_reservation.repeat_until | 반복 종료일 |
| userId | integer int64 | 아니오 | resource_reservation.user_id | 사용자 |
| content | string | 예 | resource_reservation.content | 예약 내용 |
| attachmentIds | array | 아니오 | - | 첨부파일 ID 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| resourceReservationId | integer int64 | resource_reservation.resource_reservation_id | 자원 예약 ID |
| status | string(20) [신청\|승인\|반려\|취소] | resource_reservation.status | 예약 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_NOT_FOUND | 자원이 없는 경우 |
| 409 | RESERVATION_TIME_CONFLICT | 동일 자원의 승인된 예약과 시간이 겹치는 경우 |
| 422 | INVALID_RESERVATION_PERIOD | 종료일이 시작일보다 빠른 경우 |

### FN-SFR-033-03 자원 분류·목록 및 설정 관리

- 요구사항: SFR-033-02 · 테이블: resource_category, resource, resource_attribute, resource_permission

#### GET /resource-categories — 자원 분류 목록을 조회한다 (`listResourceCategories`)

- 권한: 자원 담당자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| resourceCategoryId | integer int64 | resource_category.resource_category_id | 자원 분류 ID |
| name | string(100) | resource_category.name | 분류명 |
| sortOrder | integer int32 | resource_category.sort_order | 정렬 순서 |

오류: 공통 오류만 (1절)

#### POST /resource-categories — 자원 분류를 등록한다 (`createResourceCategory`)

- 권한: 자원 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 예 | resource_category.name | 분류명 |
| sortOrder | integer int32 | 예 | resource_category.sort_order | 정렬 순서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| resourceCategoryId | integer int64 | resource_category.resource_category_id | 자원 분류 ID |

오류: 공통 오류만 (1절)

#### PATCH /resource-categories/{resourceCategoryId} — 자원 분류를 수정한다 (`updateResourceCategory`)

- 권한: 자원 담당자 · 경로 변수: resourceCategoryId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| name | string(100) | 아니오 | resource_category.name | 분류명 |
| sortOrder | integer int32 | 아니오 | resource_category.sort_order | 정렬 순서 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| resourceCategoryId | integer int64 | resource_category.resource_category_id | 자원 분류 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_CATEGORY_NOT_FOUND | 분류가 없는 경우 |

#### DELETE /resource-categories/{resourceCategoryId} — 자원 분류를 삭제한다 (`deleteResourceCategory`)

- 권한: 자원 담당자 · 경로 변수: resourceCategoryId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_CATEGORY_NOT_FOUND | 분류가 없는 경우 |
| 409 | RESERVATION_EXISTS | 분류 하위 자원에 예약이 존재하는 경우 |

#### POST /resources — 자원을 등록한다 (`createResource`)

- 권한: 자원 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| resourceCategoryId | integer int64 | 예 | resource.resource_category_id | 자원 분류 ID |
| name | string(100) | 예 | resource.name | 자원명 |
| approvalRequired | string(10) [사용\|미사용] | 예 | resource.approval_required | 승인절차 사용 여부 |
| managerId | integer int64 | 아니오 | resource.manager_id | 담당자 ID |
| visibilityScope | string(10) [전체\|부서\|개인] | 예 | resource.visibility_scope | 공개범위 |
| description | string | 아니오 | resource.description | 자원 설명 |
| attributes | array | 아니오 | - | 자원 속성 항목·값 목록 |
| permissions | array | 아니오 | - | 사용 권한 대상(부서·임직원) 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| resourceId | integer int64 | resource.resource_id | 자원 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_CATEGORY_NOT_FOUND | 분류가 없는 경우 |

#### PATCH /resources/{resourceId} — 자원 정보·설정을 수정한다 (`updateResource`)

- 권한: 자원 담당자 · 경로 변수: resourceId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| resourceCategoryId | integer int64 | 아니오 | resource.resource_category_id | 자원 분류 ID |
| name | string(100) | 아니오 | resource.name | 자원명 |
| approvalRequired | string(10) [사용\|미사용] | 아니오 | resource.approval_required | 승인절차 사용 여부 |
| managerId | integer int64 | 아니오 | resource.manager_id | 담당자 ID |
| visibilityScope | string(10) [전체\|부서\|개인] | 아니오 | resource.visibility_scope | 공개범위 |
| description | string | 아니오 | resource.description | 자원 설명 |
| attributes | array | 아니오 | - | 자원 속성 항목·값 목록 |
| permissions | array | 아니오 | - | 사용 권한 대상 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| resourceId | integer int64 | resource.resource_id | 자원 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_NOT_FOUND | 자원이 없는 경우 |

#### DELETE /resources/{resourceId} — 자원을 삭제한다 (`deleteResource`)

- 권한: 자원 담당자 · 경로 변수: resourceId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_NOT_FOUND | 자원이 없는 경우 |
| 409 | RESERVATION_EXISTS | 자원에 예약이 존재하는 경우 |

### FN-SFR-033-05 자원 예약 승인 처리

- 요구사항: SFR-033-03 · 테이블: change_history, resource, resource_reservation

#### POST /resource-reservations/{resourceReservationId}/approve — 예약 신청을 승인한다 (`approveResourceReservation`)

- 권한: 자원 담당자 · 경로 변수: resourceReservationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [신청\|승인\|반려\|취소] | resource_reservation.status | 예약 상태 |
| processedAt | string date-time | resource_reservation.processed_at | 처리 일시 |
| processedBy | integer int64 | resource_reservation.processed_by | 처리자 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_RESERVATION_NOT_FOUND | 예약이 없는 경우 |
| 409 | RESERVATION_STATUS_MISMATCH | 신청 상태가 아닌 예약을 승인하는 경우 |
| 409 | RESERVATION_TIME_CONFLICT | 다른 승인 예약과 시간이 겹치는 경우 |

#### POST /resource-reservations/{resourceReservationId}/reject — 예약 신청을 반려한다 (`rejectResourceReservation`)

- 권한: 자원 담당자 · 경로 변수: resourceReservationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| rejectReason | string | 아니오 | resource_reservation.reject_reason | 반려 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [신청\|승인\|반려\|취소] | resource_reservation.status | 예약 상태 |
| processedAt | string date-time | resource_reservation.processed_at | 처리 일시 |
| processedBy | integer int64 | resource_reservation.processed_by | 처리자 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_RESERVATION_NOT_FOUND | 예약이 없는 경우 |
| 409 | RESERVATION_STATUS_MISMATCH | 신청 상태가 아닌 예약을 반려하는 경우 |

#### POST /resource-reservations/{resourceReservationId}/cancel-approval — 승인된 예약의 승인을 취소한다 (`cancelApprovalResourceReservation`)

- 권한: 자원 담당자 · 경로 변수: resourceReservationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [신청\|승인\|반려\|취소] | resource_reservation.status | 예약 상태 |
| processedAt | string date-time | resource_reservation.processed_at | 처리 일시 |
| processedBy | integer int64 | resource_reservation.processed_by | 처리자 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_RESERVATION_NOT_FOUND | 예약이 없는 경우 |
| 409 | RESERVATION_STATUS_MISMATCH | 승인 상태가 아닌 예약인 경우 |

#### POST /resource-reservations/{resourceReservationId}/cancel — 예약을 취소한다 (`cancelResourceReservation`)

- 권한: 자원 담당자, 임직원 · 경로 변수: resourceReservationId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| status | string(20) [신청\|승인\|반려\|취소] | resource_reservation.status | 예약 상태 |
| processedAt | string date-time | resource_reservation.processed_at | 처리 일시 |
| processedBy | integer int64 | resource_reservation.processed_by | 처리자 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_RESERVATION_NOT_FOUND | 예약이 없는 경우 |
| 409 | RESERVATION_STATUS_MISMATCH | 취소할 수 없는 상태인 경우 |

#### DELETE /resource-reservations/{resourceReservationId} — 예약을 삭제한다 (`deleteResourceReservation`)

- 권한: 자원 담당자 · 경로 변수: resourceReservationId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | RESOURCE_RESERVATION_NOT_FOUND | 예약이 없는 경우 |
| 409 | RESERVATION_STATUS_MISMATCH | 승인된 예약 등 삭제할 수 없는 상태인 경우 |

### FN-SFR-034-01 공지·게시물 등록

- 요구사항: SFR-034-01 · 테이블: department, menu_permission, notification, attachment, board_post, post_audience

#### POST /board-posts — 공지·게시물을 공개범위와 기간을 지정해 등록한다 (`createBoardPost`)

- 권한: 임직원, 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| postType | string(20) [공지\|게시글] | 예 | board_post.post_type | 구분 |
| category | string(100) | 예 | board_post.category | 분류 |
| title | string(300) | 예 | board_post.title | 제목 |
| content | string | 예 | board_post.content | 내용 |
| visibilityScope | string(20) [전체\|부서\|개인] | 예 | board_post.visibility_scope | 공개범위 |
| audienceDepartmentIds | array | 아니오 | - | 공개범위가 부서일 때 대상 부서 ID 목록 |
| audienceEmployeeIds | array | 아니오 | - | 공개범위가 개인일 때 대상 임직원 ID 목록 |
| popupStartDate | string date | 아니오 | board_post.popup_start_date | 팝업공지 시작일 |
| popupEndDate | string date | 아니오 | board_post.popup_end_date | 팝업공지 종료일 |
| pinStartDate | string date | 아니오 | board_post.pin_start_date | 상단 고정 시작일 |
| pinEndDate | string date | 아니오 | board_post.pin_end_date | 상단 고정 종료일 |
| attachmentIds | array | 아니오 | - | 미리 업로드한 첨부파일 ID 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| boardPostId | integer int64 | board_post.board_post_id | 공지·게시물 ID |
| registered | boolean | - | 등록 완료 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | BOARD_POST_REQUIRED_FIELD_MISSING | 구분·분류·제목·내용·공개범위 중 필수값이 누락된 경우 |
| 422 | BOARD_POST_PERIOD_INVALID | 팝업공지 또는 상단 고정 기간의 시작일이 종료일보다 늦은 경우 |

### FN-SFR-034-02 공지·게시물 열람자 확인

- 요구사항: SFR-034-01 · 테이블: employee, department, board_post, post_read_log

#### GET /board-posts/{boardPostId}/readers — 공지·게시물의 열람자와 미열람자 목록을 조회한다 (`listBoardPostReaders`)

- 권한: 임직원, 시스템 관리자 · 경로 변수: boardPostId · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| readStatus | string | 아니오 | - | 읽음 또는 안읽음 필터 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeId | integer int64 | employee.employee_id | 임직원 ID |
| employeeName | string(100) | employee.name | 임직원명 |
| departmentName | string(100) | department.name | 부서명 |
| readAt | string date-time | post_read_log.read_at | 미열람자는 없음 |
| readStatus | string | - | 읽음 또는 안읽음 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BOARD_POST_NOT_FOUND | 대상 공지·게시물이 삭제되었거나 존재하지 않는 경우 |
| 422 | READER_VIEW_NOT_ALLOWED | 작성자가 아니고 열람자 확인 권한도 없는 경우 |

### FN-SFR-034-03 공지·게시물 분류별·최근 조회

- 요구사항: SFR-034-01 · 테이블: notification, board_post, post_read_log

#### GET /board-posts — 권한 범위 내 공지·게시물을 분류별로 조회하며 상단 고정 우선, 최신순으로 표시한다 (`listBoardPosts`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| category | string(100) | 아니오 | board_post.category | 분류 |
| postType | string(20) [공지\|게시글] | 아니오 | board_post.post_type | 최근 공지사항·최근 게시물 구분 조회용 |
| keyword | string | 아니오 | - | 제목·내용 검색어 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| boardPostId | integer int64 | board_post.board_post_id | 공지·게시물 ID |
| postType | string(20) [공지\|게시글] | board_post.post_type | 구분 |
| category | string(100) | board_post.category | 분류 |
| title | string(300) | board_post.title | 제목 |
| authorId | integer int64 | board_post.author_id | 작성자 |
| createdAt | string date-time | board_post.created_at | 생성 일시 |
| pinStartDate | string date | board_post.pin_start_date | 상단 고정 시작일 |
| pinEndDate | string date | board_post.pin_end_date | 상단 고정 종료일 |
| readStatus | string | - | 읽음 또는 안읽음 |

오류: 공통 오류만 (1절)

#### GET /board-posts/{boardPostId} — 공지·게시물 상세를 조회하고 열람 이력을 기록한다 (`getBoardPost`)

- 권한: 임직원 · 경로 변수: boardPostId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| boardPostId | integer int64 | board_post.board_post_id | 공지·게시물 ID |
| postType | string(20) [공지\|게시글] | board_post.post_type | 구분 |
| category | string(100) | board_post.category | 분류 |
| title | string(300) | board_post.title | 제목 |
| content | string | board_post.content | 내용 |
| authorId | integer int64 | board_post.author_id | 작성자 |
| createdAt | string date-time | board_post.created_at | 생성 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | BOARD_POST_NOT_FOUND | 대상 공지·게시물이 삭제되었거나 존재하지 않는 경우 |

### FN-SFR-035-01 설문조사 등록 및 공개·대상·알림 설정

- 요구사항: SFR-035-01, SFR-035-02, SFR-035-03 · 테이블: notification, survey, survey_target

#### POST /surveys — 설문조사를 등록하고 공개·대상·알림 채널을 설정한다 (`createSurvey`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| title | string(200) | 예 | survey.title | 설문 제목 |
| content | string | 아니오 | survey.content | 설문 내용 |
| startDate | string date | 예 | survey.start_date | 설문 시작일 |
| endDate | string date | 예 | survey.end_date | 설문 종료일 |
| status | string(20) [진행 전\|진행 중\|종료] | 예 | survey.status | 진행상태 |
| commentEnabled | boolean | 예 | survey.comment_enabled | 댓글 사용 여부 |
| resultPublic | boolean | 예 | survey.result_public | 결과 공개 여부 |
| participantPublic | boolean | 예 | survey.participant_public | 참여자 정보 공개 여부 |
| notificationChannel | string(20) [메신저\|모바일\|대화방\|메일\|포털] | 아니오 | survey.notification_channel | 알림 채널 |
| targetEmployeeIds | array | 예 | - | 설문 대상 임직원 ID 목록(부서 지정 시 소속 임직원으로 전개) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| surveyId | integer int64 | survey.survey_id | 설문조사 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | SURVEY_PERIOD_INVALID | 제목 또는 기간이 누락되었거나 종료일이 시작일보다 빠른 경우 |

### FN-SFR-035-02 설문항목 관리

- 요구사항: SFR-035-04 · 테이블: survey, survey_question, survey_option

#### POST /survey-questions — 설문항목과 선택지를 등록한다 (`createSurveyQuestion`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| surveyId | integer int64 | 예 | survey_question.survey_id | 설문 |
| title | string(500) | 예 | survey_question.title | 문항 제목 |
| questionType | string(20) [선택형\|주관식] | 예 | survey_question.question_type | 문항 유형 |
| answerMode | string(20) [단답\|다답] | 예 | survey_question.answer_mode | 응답 방식 |
| otherOpinionEnabled | boolean | 예 | survey_question.other_opinion_enabled | 기타 의견 입력 여부 |
| optionTexts | array | 아니오 | - | 선택형 문항의 선택지 목록(1개 이상) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| surveyQuestionId | integer int64 | survey_question.survey_question_id | 설문항목 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SURVEY_NOT_FOUND | 대상 설문이 존재하지 않는 경우 |
| 422 | SURVEY_QUESTION_INVALID | 제목이 없거나 선택형 문항에 선택지가 없는 경우 |

#### GET /survey-questions — 설문항목 목록을 조회한다 (`listSurveyQuestions`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| surveyId | integer int64 | 예 | survey_question.survey_id | 설문 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| surveyQuestionId | integer int64 | survey_question.survey_question_id | 설문항목 ID |
| title | string(500) | survey_question.title | 문항 제목 |
| questionType | string(20) [선택형\|주관식] | survey_question.question_type | 문항 유형 |
| answerMode | string(20) [단답\|다답] | survey_question.answer_mode | 응답 방식 |
| otherOpinionEnabled | boolean | survey_question.other_opinion_enabled | 기타 의견 입력 여부 |
| options | array | - | 선택지 목록 |

오류: 공통 오류만 (1절)

### FN-SFR-035-03 설문 응답 입력

- 요구사항: SFR-035-04, SFR-035-02 · 테이블: survey_target, survey_question, survey_response, survey_response_option, survey_comment

#### POST /surveys/{surveyId}/responses — 설문 대상자가 설문에 응답을 제출한다 (`submitSurveyResponses`)

- 권한: 임직원 · 경로 변수: surveyId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| answers | array | 예 | - | 문항별 응답(surveyQuestionId, 선택한 surveyOptionIds, textAnswer, otherOpinion) |
| comment | string | 아니오 | - | 댓글 사용 설정 시 작성하는 댓글 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| submitted | boolean | - | 응답 저장 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | SURVEY_NOT_FOUND | 대상 설문이 존재하지 않는 경우 |
| 409 | SURVEY_ALREADY_RESPONDED | 동일 설문에 이미 응답한 경우 |
| 422 | SURVEY_NOT_ALLOWED | 대상자가 아니거나 설문이 진행 중이 아니거나 기간 밖인 경우 |
| 422 | SURVEY_REQUIRED_ANSWER_MISSING | 필수 문항에 응답이 없는 경우 |
| 422 | SURVEY_COMMENT_DISABLED | 댓글 사용이 아닌 설문에 댓글을 작성한 경우 |

### FN-SFR-036-01 실시간 채팅 대화방 이용 및 개인 대화방 관리

- 요구사항: SFR-036-01 · 테이블: employee, department, messenger_room, messenger_room_member

#### GET /messenger-rooms — 참여 중인 대화방 목록 조회 (`listMessengerRooms`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| messengerRoomId | integer int64 | messenger_room.messenger_room_id | 대화방 ID |
| roomName | string(200) | messenger_room.room_name | 대화방 이름 |
| creatorId | integer int64 | messenger_room.creator_id | 생성자 ID |

오류: 공통 오류만 (1절)

#### POST /messenger-rooms — 개인 대화방 등록 (`createMessengerRoom`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| roomName | string(200) | 예 | messenger_room.room_name | 대화방 이름 |
| memberIds | array | 예 | - | 조직도에서 선택한 참여 임직원 ID 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| messengerRoomId | integer int64 | messenger_room.messenger_room_id | 대화방 ID |
| roomName | string(200) | messenger_room.room_name | 대화방 이름 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 선택한 참여자가 임직원 목록에 없는 경우 |

#### PATCH /messenger-rooms/{messengerRoomId} — 개인 대화방 정보 변경 (`updateMessengerRoom`)

- 권한: 임직원 · 경로 변수: messengerRoomId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| roomName | string(200) | 예 | messenger_room.room_name | 대화방 이름 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| messengerRoomId | integer int64 | messenger_room.messenger_room_id | 대화방 ID |
| roomName | string(200) | messenger_room.room_name | 대화방 이름 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MESSENGER_ROOM_NOT_FOUND | 대화방이 없는 경우 |
| 422 | ROOM_MANAGE_NOT_ALLOWED | 대화방 생성자가 아닌 사용자가 변경하는 경우 |

#### DELETE /messenger-rooms/{messengerRoomId} — 개인 대화방 삭제 (`deleteMessengerRoom`)

- 권한: 임직원 · 경로 변수: messengerRoomId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MESSENGER_ROOM_NOT_FOUND | 대화방이 없는 경우 |
| 422 | ROOM_MANAGE_NOT_ALLOWED | 대화방 생성자가 아닌 사용자가 삭제하는 경우 |

### FN-SFR-036-02 메시지·파일 실시간 송수신

- 요구사항: SFR-036-02 · 테이블: employee, attachment, messenger_message, messenger_message_recipient

#### POST /messenger-messages — 대화방에 메시지·파일 전송 (`createMessengerMessage`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| messengerRoomId | integer int64 | 예 | messenger_message.messenger_room_id | 대화방 ID |
| content | string | 예 | messenger_message.content | 메시지 내용 |
| replyToMessageId | integer int64 | 아니오 | messenger_message.reply_to_message_id | 답장 원본 메시지 ID |
| files | array | 아니오 | - | 첨부 파일·폴더 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| messengerMessageId | integer int64 | messenger_message.messenger_message_id | 메신저 메시지 ID |
| sentAt | string date-time | messenger_message.sent_at | 발송 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MESSENGER_ROOM_NOT_FOUND | 대화방이 없는 경우 |
| 422 | ROOM_ACCESS_DENIED | 대화방 참여자가 아닌 경우 |
| 422 | FILE_UPLOAD_FAILED | 파일 전송에 실패한 경우 |

#### POST /messenger-messages/{messengerMessageId}/forward — 메시지를 다른 대화방 또는 사용자에게 전달 (`forwardMessengerMessage`)

- 권한: 임직원 · 경로 변수: messengerMessageId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| targetRoomId | integer | 아니오 | - | 전달받을 대화방 ID |
| targetEmployeeIds | array | 아니오 | - | 전달받을 사용자 ID 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| messengerMessageId | integer int64 | messenger_message.messenger_message_id | 메신저 메시지 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MESSENGER_MESSAGE_NOT_FOUND | 전달할 메시지가 없는 경우 |
| 422 | FORWARD_TARGET_REQUIRED | 전달 대상이 지정되지 않은 경우 |

#### GET /messenger-message-recipients — 메시지 수신자별 읽음 상태 조회 (`listMessengerMessageRecipients`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| messengerMessageId | integer int64 | 예 | messenger_message_recipient.messenger_message_id | 메시지 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| recipientId | integer int64 | messenger_message_recipient.recipient_id | 수신자 ID |
| readStatus | string(10) [안읽음\|읽음] | messenger_message_recipient.read_status | 읽음 상태 |
| readAt | string date-time | messenger_message_recipient.read_at | 읽은 일시 |

오류: 공통 오류만 (1절)

#### POST /messenger-messages/{messengerMessageId}/read — 메시지 읽음 처리 (`readMessengerMessage`)

- 권한: 임직원 · 경로 변수: messengerMessageId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| readStatus | string(10) [안읽음\|읽음] | messenger_message_recipient.read_status | 읽음 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MESSENGER_MESSAGE_NOT_FOUND | 수신 대상 메시지가 없는 경우 |

### FN-SFR-036-03 쪽지·파일 일괄 전송

- 요구사항: SFR-036-03 · 테이블: employee, department, attachment, messenger_message, messenger_message_recipient

#### POST /messenger-messages/send-notes — 쪽지·파일 일괄 전송 (`sendMessengerNotes`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeIds | array | 아니오 | - | 수신 임직원 ID 목록 |
| departmentIds | array | 아니오 | - | 수신 부서 ID 목록 (소속 임직원 전원 수신) |
| content | string | 예 | messenger_message.content | 메시지 내용 |
| files | array | 아니오 | - | 첨부 파일 목록 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| messengerMessageId | integer int64 | messenger_message.messenger_message_id | 메신저 메시지 ID |
| results | array | - | 수신자별 전송 결과(실패 수신자 포함) |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | RECIPIENT_REQUIRED | 수신 대상이 선택되지 않은 경우 |
| 422 | RECIPIENT_OUT_OF_SCOPE | 조직도 권한 범위 밖의 수신 대상을 선택한 경우 |

### FN-SFR-036-04 알림 이력 조회 및 메신저 메시지 통합 관리

- 요구사항: SFR-036-04 · 테이블: notification, attachment, messenger_message

#### GET /messenger-messages — 채팅·쪽지·파일 통합 메시지 목록 조회 (`listMessengerMessages`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| messageType | string(20) [CHAT\|NOTE] | 아니오 | messenger_message.message_type | 메시지 구분 |
| fromDate | string | 아니오 | - | 조회 시작일 |
| toDate | string | 아니오 | - | 조회 종료일 |
| readStatus | string(10) [안읽음\|읽음] | 아니오 | messenger_message_recipient.read_status | 읽음 상태 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| messengerMessageId | integer int64 | messenger_message.messenger_message_id | 메신저 메시지 ID |
| messageType | string(20) [CHAT\|NOTE] | messenger_message.message_type | 메시지 구분 |
| content | string | messenger_message.content | 메시지 내용 |
| sentAt | string date-time | messenger_message.sent_at | 발송 일시 |
| fileName | string(255) | attachment.file_name | 파일명 |

오류: 공통 오류만 (1절)

#### DELETE /messenger-messages/{messengerMessageId} — 본인 메시지 삭제 (`deleteMessengerMessage`)

- 권한: 임직원 · 경로 변수: messengerMessageId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | MESSENGER_MESSAGE_NOT_FOUND | 본인 관련 메시지가 없는 경우 |

#### GET /notifications — 알림 이력 조회 (`listNotifications`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### DELETE /notifications/{notificationId} — 알림 삭제 (`deleteNotification`)

- 권한: 임직원 · 경로 변수: notificationId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | NOTIFICATION_NOT_FOUND | 본인 알림이 없는 경우 |

### FN-SFR-036-05 메신저 메시지 검색

- 요구사항: SFR-036-05 · 테이블: employee, attachment, messenger_message

#### GET /messenger-messages/search — 첨부파일 제목 또는 사용자명으로 메시지 검색 (`searchMessengerMessages`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| searchType | string | 예 | - | 검색 구분(첨부파일 제목 / 사용자명) |
| keyword | string | 예 | - | 검색어 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| messengerMessageId | integer int64 | messenger_message.messenger_message_id | 메신저 메시지 ID |
| content | string | messenger_message.content | 메시지 내용 |
| sentAt | string date-time | messenger_message.sent_at | 발송 일시 |
| senderName | string(100) | employee.name | 임직원명 |
| fileName | string(255) | attachment.file_name | 파일명 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | KEYWORD_REQUIRED | 검색어가 비어 있는 경우 |

### FN-SFR-036-06 그룹웨어 모듈 이벤트 실시간 알림 및 바로가기

- 요구사항: SFR-036-07 · 테이블: menu_permission, notification

#### POST /notifications — 그룹웨어 모듈 이벤트 알림 생성 (`createNotification`)

- 권한: 로그인 사용자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| recipientId | integer int64 | 예 | notification.recipient_id | 수신자 |
| title | string(200) | 예 | notification.title | 알림 제목 |
| eventType | string(50) | 예 | notification.event_type | 알림 이벤트 유형 |
| targetType | string(50) | 예 | notification.target_type | 바로가기 대상 유형 |
| targetId | integer int64 | 예 | notification.target_id | 바로가기 대상 ID |
| channel | string(10) [포털\|메신저\|모바일\|대화방\|메일] | 예 | notification.channel | 알림 채널 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| notificationId | integer int64 | notification.notification_id | 알림 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 알림 대상자가 없는 경우 |

#### POST /notifications/{notificationId}/read — 알림 읽음 처리 후 바로가기 대상 반환 (`readNotification2`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-036-07 메신저 데이터 서버 통합 저장 및 단말기 변경 시 조회

- 요구사항: SFR-036-08 · 테이블: employee, attachment, messenger_message, auth_device

#### GET /messenger-messages — 서버에 저장된 본인 권한 범위의 쪽지·대화방 메시지 목록 조회 (`listMessengerMessages`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /messenger-messages — 쪽지·대화방 메시지를 서버에 저장 (`createMessengerMessage`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /attachments — 메시지에 연결된 첨부파일 목록 조회 (`listAttachments`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /attachments — 첨부파일을 문서관리 저장소에 저장 (`createAttachment`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-036-08 게시판 게시물 메신저 알림

- 요구사항: SFR-036-10 · 테이블: notification, board_post

#### GET /notifications — 본인의 메신저 알림 목록 조회 (`listNotifications`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /notifications/{notificationId}/read — 알림을 읽음 처리 (`readNotification2`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /board-posts/{boardPostId} — 알림에서 게시물로 바로가기하여 조회 (`getBoardPost`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-036-09 그룹웨어·조직도 연계

- 요구사항: SFR-036-06 · 테이블: employee, department

#### GET /departments — 조직도 부서 목록 조회 (`listDepartments`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /employees — 조직원 검색·조회 (권한 범위 내, 재직자만) (`listEmployees`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-037-01 2차 인증 로그인

- 요구사항: SFR-037-01 · 테이블: employee

#### POST /auth/login — ID/비밀번호와 OTP 2차 인증 로그인 (`login`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| loginType | string | 예 | - | 웹/메신저/모바일 앱 |
| userId | string(50) | 예 | employee.employee_no | 사번 |
| password | string | 예 | - | 1차 인증용 비밀번호 |
| otpValue | string | 아니오 | - | OTP 일회용 값 |
| deviceIdentifier | string(200) | 예 | auth_device.device_identifier | 기기 식별정보 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accessToken | string | - | 로그인 토큰 |
| employeeId | integer int64 | employee.employee_id | 임직원 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_CREDENTIALS | ID 또는 비밀번호가 일치하지 않는 경우 |
| 422 | INVALID_OTP | OTP가 유효하지 않거나 만료된 경우 |
| 422 | AUTH_DEVICE_NOT_ALLOWED | 미승인·미사용 기기이거나 허용 기기 수를 초과한 경우 |

### FN-SFR-037-02 인증 대상·허용 인증기기 수 설정

- 요구사항: SFR-037-02 · 테이블: employee, menu_permission, change_history, auth_setting, auth_device

#### GET /auth-settings — 인증 대상·허용 인증기기 수 설정 조회 (`listAuthSettings`)

- 권한: 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | auth_setting.employee_id | 인증 대상 임직원 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| authSettingId | integer int64 | auth_setting.auth_setting_id | 인증 설정 ID |
| employeeId | integer int64 | auth_setting.employee_id | 인증 대상 임직원 ID |
| allowedDeviceCount | integer int32 | auth_setting.allowed_device_count | 허용 인증기기 수 |

오류: 공통 오류만 (1절)

#### PUT /auth-settings — 인증 대상과 허용 인증기기 수 저장 (`saveAuthSetting`)

- 권한: 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeId | integer int64 | 아니오 | auth_setting.employee_id | 인증 대상 임직원 ID |
| twoFactorRequired | boolean | 예 | employee.two_factor_required | 2차 인증 대상 여부 |
| allowedDeviceCount | integer int32 | 예 | auth_setting.allowed_device_count | 허용 인증기기 수 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| authSettingId | integer int64 | auth_setting.auth_setting_id | 인증 설정 ID |
| allowedDeviceCount | integer int32 | auth_setting.allowed_device_count | 허용 인증기기 수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_ALLOWED_DEVICE_COUNT | 허용 인증기기 수가 정수가 아니거나 음수인 경우 |
| 404 | EMPLOYEE_NOT_FOUND | 대상 임직원이 존재하지 않는 경우 |

### FN-SFR-037-03 인증기기 승인·관리

- 요구사항: SFR-037-03 · 테이블: employee, menu_permission, notification, change_history, auth_setting, auth_device

#### GET /auth-devices — 인증기기 목록 조회 (`listAuthDevices`)

- 권한: 시스템 관리자, 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| approvalStatus | string(20) [신청\|승인\|반려] | 아니오 | auth_device.approval_status | 승인 상태 |
| employeeId | integer int64 | 아니오 | auth_device.employee_id | 임직원 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| authDeviceId | integer int64 | auth_device.auth_device_id | 인증기기 ID |
| employeeId | integer int64 | auth_device.employee_id | 임직원 ID |
| deviceName | string(100) | auth_device.device_name | 기기명 |
| deviceIdentifier | string(200) | auth_device.device_identifier | 기기 식별정보 |
| approvalStatus | string(20) [신청\|승인\|반려] | auth_device.approval_status | 승인 상태 |
| useStatus | string(10) [사용\|미사용] | auth_device.use_status | 사용 여부 |

오류: 공통 오류만 (1절)

#### POST /auth-devices — 인증기기 등록 요청 (`createAuthDevice`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| deviceIdentifier | string(200) | 예 | auth_device.device_identifier | 기기 식별정보 |
| deviceName | string(100) | 아니오 | auth_device.device_name | 기기명 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| authDeviceId | integer int64 | auth_device.auth_device_id | 인증기기 ID |
| approvalStatus | string(20) [신청\|승인\|반려] | auth_device.approval_status | 승인 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | AUTH_DEVICE_DUPLICATED | 이미 등록 요청된 기기인 경우 |

#### POST /auth-devices/{authDeviceId}/approve — 인증기기 승인 (`approveAuthDevice`)

- 권한: 시스템 관리자 · 경로 변수: authDeviceId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| authDeviceId | integer int64 | auth_device.auth_device_id | 인증기기 ID |
| approvalStatus | string(20) [신청\|승인\|반려] | auth_device.approval_status | 승인 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | AUTH_DEVICE_NOT_FOUND | 인증기기가 존재하지 않는 경우 |
| 409 | AUTH_DEVICE_ALREADY_PROCESSED | 이미 승인·반려 처리된 요청인 경우 |
| 422 | ALLOWED_DEVICE_COUNT_EXCEEDED | 승인 시 허용 인증기기 수를 초과하는 경우 |

#### POST /auth-devices/{authDeviceId}/reject — 인증기기 반려 (`rejectAuthDevice`)

- 권한: 시스템 관리자 · 경로 변수: authDeviceId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| rejectReason | string(500) | 아니오 | auth_device.reject_reason | 반려 사유 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| authDeviceId | integer int64 | auth_device.auth_device_id | 인증기기 ID |
| approvalStatus | string(20) [신청\|승인\|반려] | auth_device.approval_status | 승인 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | AUTH_DEVICE_NOT_FOUND | 인증기기가 존재하지 않는 경우 |
| 409 | AUTH_DEVICE_ALREADY_PROCESSED | 이미 승인·반려 처리된 요청인 경우 |

#### POST /auth-devices/{authDeviceId}/deactivate — 승인된 인증기기 사용중지 (`deactivateAuthDevice`)

- 권한: 시스템 관리자 · 경로 변수: authDeviceId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| authDeviceId | integer int64 | auth_device.auth_device_id | 인증기기 ID |
| useStatus | string(10) [사용\|미사용] | auth_device.use_status | 사용 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | AUTH_DEVICE_NOT_FOUND | 인증기기가 존재하지 않는 경우 |
| 409 | AUTH_DEVICE_NOT_APPROVED | 승인되지 않은 기기인 경우 |

#### DELETE /auth-devices/{authDeviceId} — 인증기기 삭제 (`deleteAuthDevice`)

- 권한: 시스템 관리자 · 경로 변수: authDeviceId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | AUTH_DEVICE_NOT_FOUND | 인증기기가 존재하지 않는 경우 |

### FN-SFR-038-01 로그인 내역 통계 조회

- 요구사항: SFR-038-01 · 테이블: employee, login_history

#### GET /login-histories — 로그인 내역을 조건별로 접속일시 기준 목록 조회한다 (`listLoginHistories`)

- 권한: 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 아니오 | - | 접속일시 조회 시작일 |
| endDate | string | 아니오 | - | 접속일시 조회 종료일 |
| employeeName | string(100) | 아니오 | employee.name | 임직원명 |
| loginType | string(20) [웹\|메신저\|모바일 앱] | 아니오 | login_history.login_type | 로그인 구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| employeeName | string(100) | employee.name | 임직원명 |
| employeeNo | string(50) | employee.employee_no | 로그인 ID |
| loginAt | string date-time | login_history.login_at | 접속일시 |
| loginIp | string(45) | login_history.login_ip | 로그인 IP |
| loginType | string(20) [웹\|메신저\|모바일 앱] | login_history.login_type | 로그인 구분 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_LOGIN_HISTORY_PERIOD | 조회 종료일이 시작일보다 앞선 경우 |

### FN-SFR-038-02 메뉴 사용 내역 조회

- 요구사항: SFR-038-02 · 테이블: employee, menu, menu_permission, menu_usage_log

#### GET /menu-usage-logs — 메뉴 사용 내역을 웹/모바일 구분하여 조회한다 (`listMenuUsageLogs`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-038-03 서버 사용 용량 현황 조회

- 요구사항: SFR-038-03 · 테이블: 없음

#### GET /server-capacities — 그룹웨어 서버 사용 용량 현황을 조회한다 (`getServerCapacity`)

- 권한: 시스템 관리자

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| totalCapacity | number | - | 전체 용량 |
| usedCapacity | number | - | 사용 용량 |
| remainingCapacity | number | - | 잔여 용량 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 502 | SERVER_CAPACITY_UNAVAILABLE | 서버 모니터링 정보를 가져오지 못한 경우 |

### FN-SFR-038-04 메뉴별 사용 통계 시각화 조회

- 요구사항: SFR-038-04 · 테이블: menu, menu_permission, menu_usage_log

#### GET /menu-usage-statistics — 메뉴별 사용 건수 통계를 조회한다 (`listMenuUsageStatistics`)

- 권한: 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 아니오 | - | 집계 시작일 |
| endDate | string | 아니오 | - | 집계 종료일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuName | string(100) | menu.name | 메뉴명 |
| usageCount | integer | - | 메뉴별 사용 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_STATISTICS_PERIOD | 집계 종료일이 시작일보다 앞선 경우 |

### FN-SFR-039-01 그룹웨어 정보 통합검색

- 요구사항: SFR-039-01 · 테이블: menu_permission, approval_document, attachment, schedule, board_post, document_box

#### GET /integrated-searches — 키워드로 전자결재·게시판·일정·문서함·첨부파일을 권한 범위 내에서 통합 검색한다 (`searchIntegrated`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| keyword | string | 예 | - | 검색어 |
| category | string | 아니오 | - | 검색 카테고리(전자결재, 게시판, 일정, 문서함) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| category | string | - | 결과 카테고리 |
| categoryCount | integer | - | 카테고리별 건수 |
| targetId | integer | - | 원문서 식별자 |
| title | string | - | 문서·게시물·일정·문서함 제목 |
| attachmentId | integer int64 | attachment.attachment_id | 첨부파일 ID |
| fileName | string(255) | attachment.file_name | 파일명 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | SEARCH_KEYWORD_REQUIRED | 검색어가 입력되지 않은 경우 |

### FN-SFR-039-02 조직원 검색 및 활동 내역 조회

- 요구사항: SFR-039-02 · 테이블: employee, department, menu_permission, approval_document, personal_info_access_log, personnel_record, board_post

#### GET /employees — 권한 범위 내 조직원을 이름·부서로 검색한다 (`listEmployees`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /employees/{employeeId}/activities — 조직원의 전자결재·게시판 업무활동 내역을 권한 범위 내에서 조회한다 (`listEmployeeActivities`)

- 권한: 임직원 · 경로 변수: employeeId · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| activityType | string | 아니오 | - | 활동 구분(전자결재, 게시판) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| activityType | string | - | 활동 유형 |
| title | string | - | 문서·게시물 제목 |
| activityAt | string | - | 활동 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | EMPLOYEE_NOT_FOUND | 대상 조직원이 없거나 권한 범위 밖인 경우 |

### FN-SFR-040-01 모바일 로그인·로그아웃

- 요구사항: SFR-040-01 · 테이블: employee, login_history, auth_device

#### POST /auth/mobile-login — 모바일 앱에서 ID/비밀번호로 로그인한다 (`loginMobile`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| employeeNo | string(50) | 예 | employee.employee_no | 사번 |
| password | string | 예 | - | 임직원 비밀번호 (저장하지 않고 해시 검증) |
| deviceIdentifier | string(200) | 예 | auth_device.device_identifier | 인증기기 허용 여부 확인용 기기 식별자 |
| otpCode | string | 아니오 | - | 2차 인증 코드 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| accessToken | string | - | 로그인 세션 토큰 |
| employeeId | integer int64 | employee.employee_id | 임직원 ID |
| name | string(100) | employee.name | 임직원명 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_CREDENTIALS | ID 또는 비밀번호가 일치하지 않음 |
| 422 | SECOND_AUTH_FAILED | 2차 인증 실패 |
| 422 | UNAPPROVED_AUTH_DEVICE | 승인되지 않았거나 허용 기기 수를 초과한 인증기기 |

#### POST /auth/mobile-logout — 현재 모바일 세션을 종료한다 (`logoutMobile`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류: 공통 오류만 (1절)

### FN-SFR-040-02 모바일 메뉴 신규 건수 조회

- 요구사항: SFR-040-02 · 테이블: menu, menu_permission, approval_document, notification, board_post, mail_recipient

#### GET /mobile/menu-badges — 모바일 메뉴별 신규 건수를 조회한다 (`listMobileMenuBadges`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| menuName | string(100) | menu.name | 메뉴명 |
| newCount | integer | - | 메뉴별 안읽음 신규 건수 |

오류: 공통 오류만 (1절)

### FN-SFR-040-03 모바일 메일 작성·받은편지함 조회

- 요구사항: SFR-040-03 · 테이블: menu_permission, attachment, mail_message, mail_recipient

#### GET /mail-messages/inbox — 받은편지함 메일 목록을 조회한다 (`listInboxMailMessages`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| mailMessageId | integer int64 | mail_message.mail_message_id | 메일 ID |
| subject | string(500) | mail_message.subject | 제목 |
| sentAt | string date-time | mail_message.sent_at | 발송 시각 |
| readStatus | string(10) [안읽음\|읽음] | mail_recipient.read_status | 읽음 상태 |

오류: 공통 오류만 (1절)

#### POST /mail-messages — 메일을 작성하여 발송한다 (`createMailMessage`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| recipientIds | array | 예 | - | 받는 사람 임직원 ID 목록 |
| subject | string(500) | 예 | mail_message.subject | 제목 |
| body | string | 아니오 | mail_message.body | 본문 |
| attachmentFiles | array | 아니오 | - | 첨부파일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| mailMessageId | integer int64 | mail_message.mail_message_id | 메일 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | MAIL_RECIPIENT_REQUIRED | 받는 사람이 입력되지 않음 |
| 502 | MAIL_SEND_FAILED | 메일 발송 실패 |

### FN-SFR-040-04 모바일 공지·게시글 조회

- 요구사항: SFR-040-04 · 테이블: menu_permission, attachment, board_post

#### GET /board-posts — 권한 범위의 공지·게시글 목록을 최신순으로 조회한다 (`listBoardPosts`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /board-posts/{boardPostId} — 게시물 상세를 조회한다 (`getBoardPost`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-040-05 모바일 조직도 조회·검색

- 요구사항: SFR-040-05 · 테이블: employee, department, menu_permission

#### GET /employees — 조직도 구성원을 탐색·검색한다 (`listEmployees`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-040-06 모바일 일정·자원예약 조회

- 요구사항: SFR-040-06 · 테이블: menu_permission, resource_reservation, schedule

#### GET /schedules — 기간 내 열람 가능한 일정을 조회한다 (`listSchedules`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 아니오 | - | 조회 시작일 (미지정 시 오늘) |
| endDate | string | 아니오 | - | 조회 종료일 (미지정 시 오늘) |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| scheduleId | integer int64 | schedule.schedule_id | 일정 ID |
| title | string(200) | schedule.title | 제목 |
| startAt | string date-time | schedule.start_at | 시작 일시 |
| endAt | string date-time | schedule.end_at | 종료 일시 |
| allDay | boolean | schedule.all_day | 종일 여부 |
| location | string(200) | schedule.location | 장소 |

오류: 공통 오류만 (1절)

#### GET /resource-reservations — 기간 내 자원예약 현황을 조회한다 (`listResourceReservations`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SFR-040-07 모바일 결재문서 승인·반려

- 요구사항: SFR-040-07 · 테이블: menu_permission, approval_document, notification, approval_line

#### POST /approval-documents/{approvalDocumentId}/approve — 결재 차례인 결재대기 문서를 승인한다 (`approveApprovalDocument`)

- 권한: 임직원 · 경로 변수: approvalDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| opinion | string | 아니오 | approval_line.opinion | 승인 의견 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 변경된 전자결재 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 결재문서가 존재하지 않음 |
| 409 | APPROVAL_STATUS_MISMATCH | 본인 결재 차례가 아니거나 이미 처리된 문서 |

#### POST /approval-documents/{approvalDocumentId}/reject — 결재 차례인 결재대기 문서를 반려한다 (`rejectApprovalDocument`)

- 권한: 임직원 · 경로 변수: approvalDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| opinion | string | 아니오 | approval_line.opinion | 반려 의견 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 변경된 전자결재 처리 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 결재문서가 존재하지 않음 |
| 409 | APPROVAL_STATUS_MISMATCH | 본인 결재 차례가 아니거나 이미 처리된 문서 |

### FN-SFR-040-08 모바일 상신 문서 조회

- 요구사항: SFR-040-08 · 테이블: menu_permission, approval_document, attachment

#### GET /approval-documents — 본인이 상신한 결재문서 목록을 조회한다 (`listApprovalDocuments`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### GET /approval-documents/{approvalDocumentId} — 상신 문서 상세와 결재 진행 현황을 조회한다 (`getApprovalDocument`)

- 권한: 임직원 · 경로 변수: approvalDocumentId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| title | string(500) | approval_document.title | 문서 제목 |
| body | string | approval_document.body | 문서 본문 |
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 전자결재 처리 상태 |
| approvalLines | array | - | 결재선 목록(결재자·순서·상태·의견·처리 시각) |
| attachments | array | - | 첨부파일 목록(파일명·확장자·크기) |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_DOCUMENT_NOT_FOUND | 문서가 없거나 본인이 상신한 문서가 아님 |

### FN-SFR-040-09 모바일 문서함 완료문서 조회

- 요구사항: SFR-040-09 · 테이블: department, approval_document, attachment, document_box, document_box_item

#### GET /document-box-items — 개인·부서 문서함의 완료문서 목록을 조회한다 (`listDocumentBoxItems`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| boxType | string | 예 | - | 개인문서함 또는 부서문서함 |
| title | string | 아니오 | - | 제목 검색어 |
| completedFrom | string | 아니오 | - | 조회 시작일 |
| completedTo | string | 아니오 | - | 조회 종료일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalDocumentId | integer int64 | approval_document.approval_document_id | 전자결재 문서 ID |
| title | string(500) | approval_document.title | 문서 제목 |
| approvalStatus | string(10) [기안\|결재대기\|승인\|보류\|반려\|회수\|재기안\|완료] | approval_document.approval_status | 전자결재 처리 상태 |
| completedAt | string date-time | approval_document.completed_at | 완료 일시 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_BOX_TYPE | 문서함 구분이 개인문서함 또는 부서문서함이 아님 |

#### GET /document-box-items/{documentBoxItemId} — 완료문서 상세를 조회한다 (`getDocumentBoxItem`)

- 권한: 임직원 · 경로 변수: documentBoxItemId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| title | string(500) | approval_document.title | 문서 제목 |
| body | string | approval_document.body | 문서 본문 |
| approvalLines | array | - | 결재선 목록 |
| attachments | array | - | 첨부파일 목록 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | DOCUMENT_BOX_ITEM_NOT_FOUND | 문서함 문서가 없거나 접근 범위 밖 |

### FN-SFR-040-10 모바일 통합검색

- 요구사항: SFR-040-10 · 테이블: menu_permission, approval_document, attachment, board_post

#### GET /search — 업무영역과 첨부파일 제목·내용을 통합 검색한다 (`searchIntegrated2`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| keyword | string | 예 | - | 검색어 |
| searchTarget | string | 아니오 | - | 업무영역 또는 첨부파일 제목·내용 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| areaType | string | - | 업무영역 구분 |
| targetId | integer | - | 결과 문서·게시물 ID |
| title | string | - | 결과 제목 |
| attachmentName | string(255) | attachment.file_name | 파일명 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | SEARCH_KEYWORD_REQUIRED | 검색어가 비어 있음 |
| 502 | SEARCH_ENGINE_FAILED | 그룹웨어 통합검색 영역 호출 실패 |

### FN-SFR-041-01 웹 오피스 문서 작성 및 편집

- 요구사항: SFR-041-01, SFR-041-04, SFR-041-06 · 테이블: office_template, office_document

#### GET /office-templates — 웹 오피스 템플릿 목록을 조회한다 (`listOfficeTemplates`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| officeTemplateId | integer int64 | office_template.office_template_id | 웹 오피스 템플릿 ID |
| name | string(200) | office_template.name | 템플릿 이름 |
| templateType | string(255) [REPORT\|PROPOSAL] | office_template.template_type | 템플릿 구분 |
| bodyContent | string | office_template.body_content | 양식 본문 |

오류: 공통 오류만 (1절)

#### POST /office-documents — 웹 오피스 문서를 작성해 내 문서함에 저장한다 (`createOfficeDocument`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| title | string(300) | 예 | office_document.title | 문서 제목 |
| officeTemplateId | integer int64 | 아니오 | office_document.office_template_id | 템플릿 |
| body | string | 아니오 | office_document.body | 문서 본문 |
| chartType | string(255) [BAR\|LINE\|PIE] | 아니오 | office_document.chart_type | 차트 유형 |
| chartData | object | 아니오 | office_document.chart_data | 차트 데이터 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| officeDocumentId | integer int64 | office_document.office_document_id | 웹 오피스 문서 ID |
| title | string(300) | office_document.title | 문서 제목 |
| chartType | string(255) [BAR\|LINE\|PIE] | office_document.chart_type | 차트 유형 |
| chartData | object | office_document.chart_data | 차트 데이터 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | OFFICE_TEMPLATE_NOT_FOUND | 선택한 템플릿이 존재하지 않음 |
| 422 | CHART_DATA_REQUIRED | 차트 유형을 선택했으나 차트 데이터가 없음 |

### FN-SFR-041-03 한글·Word 양식 문서 변환 및 편집

- 요구사항: SFR-041-05 · 테이블: attachment, office_document

#### POST /office-documents/convert — 한글·Word 파일을 웹 오피스 문서로 변환해 저장한다 (`convertOfficeDocument`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| file | string | 예 | - | 변환할 HWP 또는 Word 파일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| officeDocumentId | integer int64 | office_document.office_document_id | 웹 오피스 문서 ID |
| title | string(300) | office_document.title | 문서 제목 |
| body | string | office_document.body | 문서 본문 |
| result | string | - | 변환 성공 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | UNSUPPORTED_FILE_TYPE | HWP·Word가 아닌 파일 형식 |
| 502 | DOCUMENT_CONVERSION_FAILED | 파일 변환에 실패함 |

### FN-SFR-041-05 웹 오피스 문서 공유 및 권한 설정

- 요구사항: SFR-041-02 · 테이블: messenger_message, office_document, office_document_share

#### POST /office-documents/{officeDocumentId}/share — 문서를 그룹웨어 사용자에게 쪽지 또는 이메일로 공유하고 사용자별 권한을 설정한다 (`shareOfficeDocument`)

- 권한: 임직원 · 경로 변수: officeDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| shareMethod | string | 예 | - | 공유 방식 (NOTE 쪽지 또는 EMAIL 이메일) |
| targets | array | 예 | - | 공유 대상자별 권한 목록 (employeeId, canEdit) |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| shared | boolean | - | 공유 완료 여부 |
| grantedPermissions | array | - | 대상자별 부여 권한 |
| notificationStatus | string | - | 쪽지 또는 이메일 공유 안내 발송 결과 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | OFFICE_DOCUMENT_NOT_FOUND | 공유할 문서가 존재하지 않는 경우 |
| 422 | SHARE_TARGET_REQUIRED | 공유 대상자 또는 권한을 지정하지 않은 경우 |
| 422 | INVALID_SHARE_PERMISSION | 열람 권한 없이 수정 권한을 부여하거나 그룹웨어 사용자가 아닌 대상을 지정한 경우 |
| 502 | SHARE_NOTIFICATION_FAILED | 쪽지 또는 이메일 발송에 실패한 경우 |

### FN-SFR-041-06 내 문서함 및 공유 문서함 관리

- 요구사항: SFR-041-03 · 테이블: office_document, office_document_share

#### GET /office-documents — 내 문서함 또는 공유 문서함의 문서 목록을 조회한다 (`listOfficeDocuments`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| boxType | string | 예 | - | 문서함 구분 (MY 내 문서함, SHARED 공유 문서함) |
| title | string(300) | 아니오 | office_document.title | 문서 제목 |
| createdFrom | string | 아니오 | - | 작성일 검색 시작일 |
| createdTo | string | 아니오 | - | 작성일 검색 종료일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| officeDocumentId | integer int64 | office_document.office_document_id | 웹 오피스 문서 ID |
| title | string(300) | office_document.title | 문서 제목 |
| authorId | integer int64 | office_document.author_id | 작성자 |
| createdAt | string date-time | office_document.created_at | 생성 일시 |
| canEdit | boolean | office_document_share.can_edit | 공유받은 문서의 수정 권한 |
| shareType | string | - | 공유한 문서 또는 공유받은 문서 구분 |

오류: 공통 오류만 (1절)

#### GET /office-documents/{officeDocumentId} — 문서를 열람한다 (`getOfficeDocument`)

- 권한: 임직원 · 경로 변수: officeDocumentId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| officeDocumentId | integer int64 | office_document.office_document_id | 웹 오피스 문서 ID |
| title | string(300) | office_document.title | 문서 제목 |
| body | string | office_document.body | 문서 본문 |
| authorId | integer int64 | office_document.author_id | 작성자 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | OFFICE_DOCUMENT_NOT_FOUND | 문서가 존재하지 않는 경우 |

#### PATCH /office-documents/{officeDocumentId} — 문서를 수정한다 (`updateOfficeDocument`)

- 권한: 임직원 · 경로 변수: officeDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| title | string(300) | 아니오 | office_document.title | 문서 제목 |
| body | string | 아니오 | office_document.body | 문서 본문 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| officeDocumentId | integer int64 | office_document.office_document_id | 웹 오피스 문서 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | OFFICE_DOCUMENT_NOT_FOUND | 문서가 존재하지 않는 경우 |
| 422 | DOCUMENT_EDIT_NOT_ALLOWED | 수정 권한이 없는 공유받은 문서를 수정하려는 경우 |

#### DELETE /office-documents/{officeDocumentId} — 작성자가 문서를 삭제한다 (`deleteOfficeDocument`)

- 권한: 임직원 · 경로 변수: officeDocumentId

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| 없음 |  |  |  |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | OFFICE_DOCUMENT_NOT_FOUND | 문서가 존재하지 않는 경우 |
| 422 | DOCUMENT_DELETE_NOT_ALLOWED | 작성자가 아닌 사용자가 삭제하려는 경우 |

### FN-SFR-041-07 웹 오피스 ECM 연계 통합 관리

- 요구사항: SFR-041-07 · 테이블: attachment, link_log, office_document, office_document_share

#### POST /office-documents/{officeDocumentId}/link-ecm — 웹 오피스 문서를 기존 ECM에 연계 저장한다 (`linkOfficeDocumentToEcm`)

- 권한: 임직원 · 경로 변수: officeDocumentId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| 없음 |  |  |  |  |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| linked | boolean | - | ECM 연계 성공 여부 |
| ecmDocumentId | string(200) | office_document.ecm_document_id | ECM 문서 식별자 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | OFFICE_DOCUMENT_NOT_FOUND | 연계할 문서가 존재하지 않는 경우 |
| 502 | ECM_LINK_FAILED | ECM 연계 호출이 실패한 경우(연계 상태를 실패로 기록) |

#### GET /ecm-documents — ECM의 작성·공유·공유받은 문서 목록을 조회한다 (`listEcmDocuments`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| documentType | string | 예 | - | 문서 구분 (작성 문서, 공유 문서, 공유받은 문서) |
| keyword | string | 아니오 | - | ECM 문서 조회 조건 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| officeDocumentId | integer int64 | office_document.office_document_id | 웹 오피스 문서 ID |
| title | string(300) | office_document.title | 문서 제목 |
| ecmDocumentId | string(200) | office_document.ecm_document_id | ECM 문서 식별자 |
| authorId | integer int64 | office_document.author_id | 작성자 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 502 | ECM_LINK_FAILED | ECM 조회 연계 호출이 실패한 경우 |

### FN-SFR-042-01 심사수수료·재발급 수수료 단가 관리

- 요구사항: SFR-042-01 · 테이블: change_history, fee_unit_price

#### GET /fee-unit-prices — 수수료 단가 목록을 조회한다 (`listFeeUnitPrices`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| feeType | string(20) [REVIEW\|REISSUE] | 아니오 | fee_unit_price.fee_type | 수수료 구분 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| feeUnitPriceId | integer int64 | fee_unit_price.fee_unit_price_id | 수수료 단가 ID |
| feeType | string(20) [REVIEW\|REISSUE] | fee_unit_price.fee_type | 수수료 구분 |
| unitPrice | number | fee_unit_price.unit_price | 단가 |
| effectiveFrom | string date | fee_unit_price.effective_from | 적용 시작일 |
| effectiveTo | string date | fee_unit_price.effective_to | 적용 종료일 |

오류: 공통 오류만 (1절)

#### POST /fee-unit-prices — 수수료 단가를 등록한다 (`createFeeUnitPrice`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| feeType | string(20) [REVIEW\|REISSUE] | 예 | fee_unit_price.fee_type | 수수료 구분 |
| unitPrice | number | 예 | fee_unit_price.unit_price | 단가 |
| effectiveFrom | string date | 예 | fee_unit_price.effective_from | 적용 시작일 |
| effectiveTo | string date | 아니오 | fee_unit_price.effective_to | 적용 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| feeUnitPriceId | integer int64 | fee_unit_price.fee_unit_price_id | 수수료 단가 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_FEE_UNIT_PRICE | 필수값 누락, 단가 형식 오류 또는 적용 기간이 올바르지 않은 경우 |

#### PATCH /fee-unit-prices/{feeUnitPriceId} — 수수료 단가를 수정한다 (`updateFeeUnitPrice`)

- 권한: 임직원 · 경로 변수: feeUnitPriceId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| unitPrice | number | 아니오 | fee_unit_price.unit_price | 단가 |
| effectiveFrom | string date | 아니오 | fee_unit_price.effective_from | 적용 시작일 |
| effectiveTo | string date | 아니오 | fee_unit_price.effective_to | 적용 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| feeUnitPriceId | integer int64 | fee_unit_price.fee_unit_price_id | 수수료 단가 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FEE_UNIT_PRICE_NOT_FOUND | 단가가 존재하지 않는 경우 |
| 422 | INVALID_FEE_UNIT_PRICE | 필수값 누락, 단가 형식 오류 또는 적용 기간이 올바르지 않은 경우 |

### FN-SFR-042-03 심사수수료·재발급 수수료 등록

- 요구사항: SFR-042-01 · 테이블: change_history, fee_unit_price, fee_record

#### POST /fee-records — 심사수수료·재발급 수수료를 등록한다 (`createFeeRecord`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| feeUnitPriceId | integer int64 | 예 | fee_record.fee_unit_price_id | 수수료 단가 ID |
| reviewDate | string date | 아니오 | fee_record.review_date | 심사일자 |
| resolutionDate | string date | 아니오 | fee_record.resolution_date | 결의일자 |
| quantity | integer int32 | 예 | fee_record.quantity | 수량 |
| isOffline | boolean | 예 | fee_record.is_offline | 오프라인 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| feeRecordId | integer int64 | fee_record.fee_record_id | 수수료 등록 ID |
| quantity | integer int32 | fee_record.quantity | 수량 |
| amount | number | fee_record.amount | 금액 |
| isOffline | boolean | fee_record.is_offline | 오프라인 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | FEE_UNIT_PRICE_NOT_FOUND | 적용할 단가가 등록되어 있지 않은 경우 |
| 422 | INVALID_FEE_RECORD | 필수값 누락 또는 형식 오류인 경우 |

### FN-SFR-042-04 심사현황 조회

- 요구사항: SFR-042-01 · 테이블: fee_unit_price, fee_record

#### GET /fee-records/review-status — 심사일자·결의일자·항목별·지역별·품단계 기준 심사현황을 조회한다 (`getReviewStatus`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| criteria | string | 예 | - | 조회 기준 (심사일자, 결의일자, 항목별, 지역별, 품단계) |
| fromDate | string | 예 | - | 조회 시작일 |
| toDate | string | 예 | - | 조회 종료일 |
| condition | string | 아니오 | - | 항목·지역·품단계 추가 조건 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| groupKey | string | - | 집계 기준 값 |
| reviewCount | integer | - | 심사 건수 |
| feeAmount | number | - | 수수료 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_PERIOD | 조회 기간이 누락되었거나 시작일이 종료일보다 늦은 경우 |

### FN-SFR-042-05 재발급 내역현황·집계 조회

- 요구사항: SFR-042-01 · 테이블: fee_unit_price, fee_record

#### GET /fee-records — 재발급 수수료 내역현황 조회 (`listReissueFeeRecords`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| feeRecordId | string | - |  |
| reviewDate | string | - |  |
| resolutionDate | string | - |  |
| quantity | string | - |  |
| amount | string | - |  |
| isOffline | string | - |  |
| unitPrice | number | fee_unit_price.unit_price | 단가 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_SEARCH_PERIOD | 조회 기간이 올바르지 않음(종료일이 시작일보다 앞섬) |

#### GET /fee-records/summary — 재발급 수수료 내역집계 조회 (`getReissueFeeRecordSummary`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 예 | - | 조회 시작일 |
| endDate | string | 예 | - | 조회 종료일 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| groupKey | string | - | 집계 기준 값(기준은 소스 분석 후 확정) |
| totalQuantity | integer | - | 기준별 재발급 건수 |
| totalAmount | number | - | 기준별 재발급 금액 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_SEARCH_PERIOD | 조회 기간이 올바르지 않음(종료일이 시작일보다 앞섬) |

### FN-SFR-044-02 AI 기안문 작성 지원 및 문구 추천

- 요구사항: SFR-044-03 · 테이블: approval_document, approval_form

#### POST /approval-documents/draft-assist — AI 기안문 초안 생성 (`generateApprovalDocumentDraft`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| approvalFormId | integer int64 | 예 | approval_document.approval_form_id | 결재양식 |
| requestContent | string | 예 | - | 제목·목적·핵심 내용 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| draftBody | string | - | AI가 생성한 기안문 초안 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_FORM_NOT_FOUND | 선택한 결재양식이 없음 |
| 422 | REQUEST_CONTENT_EMPTY | 작성 요청 내용이 비어 있음 |
| 502 | AI_DRAFT_GENERATION_FAILED | AI 초안 생성 실패 |

#### POST /approval-documents/phrase-suggestions — 기안문 추천 문구 조회 (`suggestApprovalDocumentPhrases`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| approvalFormId | integer int64 | 예 | approval_document.approval_form_id | 결재양식 |
| body | string | 아니오 | approval_document.body | 문서 본문 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| phrases | array | - | 추천 문구 목록 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_FORM_NOT_FOUND | 선택한 결재양식이 없음 |
| 502 | AI_PHRASE_SUGGESTION_FAILED | 문구 추천 생성 실패 |

### FN-SFR-044-03 예산·회계·인사 데이터 분석 및 질의응답

- 요구사항: SFR-044-04 · 테이블: menu_permission, budget_account, account_subject, budget_execution, journal_entry, personal_info_access_log, personnel_record

#### POST /data-analysis/queries — 예산·회계·인사 데이터 AI 분석 질의응답 (`queryDataAnalysis`)

- 권한: 임직원

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| analysisArea | string | 예 | - | 분석 대상 영역(예산/회계/인사) |
| question | string | 예 | - | 자연어 질의 내용 |
| startDate | string | 아니오 | - | 분석 기간 시작일 |
| endDate | string | 아니오 | - | 분석 기간 종료일 |
| departmentId | integer | 아니오 | - | 부서 조건 |
| projectId | integer | 아니오 | - | 프로젝트 조건 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| analysisResult | object | - | 분석 결과 |
| answer | string | - | 자연어 질의 응답 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | ANSWER_NOT_AVAILABLE | 질의에 해당하는 데이터가 없거나 응답을 생성할 수 없음 |
| 502 | DATA_LINK_FAILED | 기존 시스템과의 데이터 연계 실패 |

### FN-COR-002-01 개인정보 열람 이력 통계 조회

- 요구사항: COR-002-02 · 테이블: personal_info_access_log

#### GET /personal-info-access-logs/statistics — 개인정보 열람 이력 통계 조회 (`getPersonalInfoAccessStatistics`)

- 권한: 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| startDate | string | 아니오 | - | 조회 시작일 |
| endDate | string | 아니오 | - | 조회 종료일 |
| employeeId | integer int64 | 아니오 | personal_info_access_log.employee_id | 열람자 |
| targetInfoType | string(50) | 아니오 | personal_info_access_log.target_info_type | 열람 대상 정보 구분 |
| departmentId | integer | 아니오 | - | 열람자 소속 부서 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| totalCount | integer | - | 열람 건수 합계 |
| employeeId | integer int64 | personal_info_access_log.employee_id | 열람자 |
| departmentId | integer | - | 열람자 부서 |
| targetInfoType | string(50) | personal_info_access_log.target_info_type | 열람 대상 정보 구분 |
| count | integer | - | 그룹별 열람 건수 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 422 | INVALID_SEARCH_PERIOD | 종료일이 시작일보다 앞섬 |

### FN-SIR-001-01 외부 금융·결재 시스템 API 연계

- 요구사항: SIR-001-03 · 테이블: partner, partner_account, credit_card, approval_document, expense_resolution, link_log, tax_invoice

#### POST /link-logs/sync — 외부 금융·결재 시스템 연계 수동 요청 (`syncExternalLink`)

- 권한: 시스템 관리자, 예산·회계 담당자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| linkTarget | string(50) [E_NARA_DOUM\|NTS_HOMETAX\|NTS_EFILING\|BANK_CMS\|CARD_COMPANY\|LEGACY_ERP\|ASSET_INSPECTION\|COMMUTE_SYSTEM\|ECM] | 예 | link_log.link_target | 연계 대상 |
| linkType | string(100) | 아니오 | link_log.link_type | 연계 구분 |
| requestSummary | string(1000) | 아니오 | link_log.request_summary | 요청 조건 |
| startDate | string | 아니오 | - | 연계 기간 시작일 |
| endDate | string | 아니오 | - | 연계 기간 종료일 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| linkLogId | integer int64 | link_log.link_log_id | 외부 연계 이력 ID |
| status | string(20) [REQUESTED\|SUCCESS\|FAILED] | link_log.status | 연계 상태 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 409 | LINK_ALREADY_IN_PROGRESS | 동일 대상 연계가 이미 진행 중 |
| 422 | INVALID_LINK_PERIOD | 연계 기간이 올바르지 않음 |
| 502 | EXTERNAL_LINK_FAILED | 외부 시스템 API 호출 실패 또는 응답 지연 |

#### GET /link-logs — 연계 이력 조회 (`listLinkLogs`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

### FN-SIR-002-01 내부 단위시스템 연계 인터페이스 표준 관리

- 요구사항: SIR-002-01 · 테이블: menu_permission, api_client, interface_standard

#### POST /interface-standards — 내부 단위시스템 연계 인터페이스 표준을 등록한다 (`createInterfaceStandard`)

- 권한: 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| apiClientId | integer int64 | 예 | interface_standard.api_client_id | 연계 대상 시스템(Tcon 또는 WTA 사이버연수원) |
| interfaceItems | string | 예 | interface_standard.interface_items | 연계 정보 항목 |
| linkMethod | string(100) | 예 | interface_standard.link_method | 연계 방식 |
| standardVersion | string(20) | 예 | interface_standard.standard_version | 표준 버전 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| interfaceStandardId | integer int64 | interface_standard.interface_standard_id | 연계 인터페이스 표준 ID |
| apiClientId | integer int64 | interface_standard.api_client_id | 연계 시스템 ID |
| standardVersion | string(20) | interface_standard.standard_version | 표준 버전 |
| registered | boolean | - | 표준 등록 완료 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | API_CLIENT_NOT_FOUND | 연계 대상 시스템이 등록되어 있지 않은 경우 |
| 422 | INTERFACE_TARGET_OUT_OF_SCOPE | 연계 대상이 Tcon 또는 WTA 사이버연수원이 아닌 경우 |
| 422 | INTERFACE_STANDARD_REQUIRED_MISSING | 필수 정의 항목이 누락된 경우 |

#### GET /interface-standards — 내부 연계 인터페이스 표준 목록을 조회한다 (`listInterfaceStandards`)

- 권한: 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| apiClientId | integer int64 | 아니오 | interface_standard.api_client_id | 연계 시스템 ID |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| interfaceStandardId | integer int64 | interface_standard.interface_standard_id | 연계 인터페이스 표준 ID |
| apiClientId | integer int64 | interface_standard.api_client_id | 연계 시스템 ID |
| interfaceItems | string | interface_standard.interface_items | 연계 정보 항목 |
| linkMethod | string(100) | interface_standard.link_method | 연계 방식 |
| standardVersion | string(20) | interface_standard.standard_version | 표준 버전 |

오류: 공통 오류만 (1절)

### FN-SIR-002-02 표준 연계 API 제공

- 요구사항: SIR-002-02 · 테이블: api_client, interface_standard, api_call_log

#### POST /interface-standards/invoke — 연계 시스템이 표준 연계 API를 호출한다 (`invokeStandardInterface`)

- 권한: 로그인 사용자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| requestSystemIdentifier | string(100) | 예 | api_call_log.request_system_identifier | 요청 시스템 식별자 |
| requestData | object | 예 | - | 표준에 정의된 연계 정보 항목 값 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| responseData | object | - | 표준 형식의 처리 결과 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | API_CLIENT_NOT_FOUND | 등록되지 않은 시스템이 호출한 경우 |
| 409 | API_CLIENT_DISABLED | 호출 시스템의 API 사용 여부가 미사용인 경우 |
| 422 | INVALID_REQUEST_FORMAT | 요청 데이터가 표준 형식에 맞지 않는 경우 |
| 502 | INTERFACE_PROCESSING_FAILED | 연계 처리 중 오류가 발생한 경우 |

#### PATCH /api-clients/{apiClientId} — 연계 시스템 API 사용 여부를 설정한다 (`updateApiClientUsage`)

- 권한: 시스템 관리자 · 경로 변수: apiClientId

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| useYn | string(10) [사용\|미사용] | 예 | api_client.use_yn | API 사용 여부 |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| apiClientId | integer int64 | api_client.api_client_id | 연계 시스템 ID |
| useYn | string(10) [사용\|미사용] | api_client.use_yn | API 사용 여부 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | API_CLIENT_NOT_FOUND | 연계 시스템이 없는 경우 |

### FN-SIR-002-03 전자결재 양식 연동결재 지원

- 요구사항: SIR-002-04 · 테이블: approval_document, approval_form, notification, approval_linked_form

#### POST /approval-documents — 연동결재 대상 양식으로 결재문서를 생성한다 (`createApprovalDocument`를 함께 씀)

- 요청·응답·오류는 그 API(먼저 나온 기능의 절)와 같다. 따로 만들지 않는다.

#### POST /approval-linked-forms — 연동결재 대상 양식을 등록한다 (`createApprovalLinkedForm`)

- 권한: 시스템 관리자

요청 (본문):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| approvalFormId | integer int64 | 예 | approval_linked_form.approval_form_id | 결재양식 ID |

응답:

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| approvalLinkedFormId | integer int64 | approval_linked_form.approval_linked_form_id | 연동결재 대상 양식 ID |
| approvalFormId | integer int64 | approval_linked_form.approval_form_id | 결재양식 ID |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | APPROVAL_FORM_NOT_FOUND | 결재양식이 없는 경우 |
| 409 | APPROVAL_LINKED_FORM_DUPLICATED | 이미 등록된 연동결재 양식인 경우 |

### FN-SIR-003-01 사용자 기능 온라인 도움말 조회

- 요구사항: SIR-003-01 · 테이블: menu, menu_permission, help_content

#### GET /help-contents — 온라인 도움말을 조회·검색한다 (`listHelpContents`)

- 권한: 임직원, 시스템 관리자 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| menuId | integer int64 | 아니오 | help_content.menu_id | 메뉴 |
| keyword | string | 아니오 | - | 도움말 검색어 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| helpContentId | integer int64 | help_content.help_content_id | 도움말 ID |
| menuId | integer int64 | help_content.menu_id | 메뉴 |
| title | string(200) | help_content.title | 제목 |
| content | string | help_content.content | 도움말 내용 |

오류:

| 상태 | 코드 | 조건 |
|---|---|---|
| 404 | HELP_CONTENT_NOT_FOUND | 해당 기능의 도움말이 등록되어 있지 않은 경우 |

### FN-SIR-003-02 오류 에러 메시지 표시

- 요구사항: SIR-003-02 · 테이블: error_message

#### GET /error-messages — 오류 유형에 맞는 에러 메시지를 조회한다 (`listErrorMessages`)

- 권한: 임직원 · 목록 (페이지)

요청 (쿼리):

| 필드 | 타입 | 필수 | DB 컬럼 | 설명 |
|---|---|---|---|---|
| errorCode | string(50) | 아니오 | error_message.error_code | 에러 코드 |

응답 (items 한 건):

| 필드 | 타입 | DB 컬럼 | 설명 |
|---|---|---|---|
| errorCode | string(50) | error_message.error_code | 에러 코드 |
| message | string(500) | error_message.message | 에러 메시지 |
| actionGuide | string(1000) | error_message.action_guide | 조치 안내 |

오류: 공통 오류만 (1절)

## 4. API가 없는 기능 (배치·자동 실행·내부 처리)

| 기능 | 기능명 | 이유 |
|---|---|---|
| FN-SFR-006-02 | 재무제표 양식·자동분개 유형 설정 | 재무제표 양식과 자동분개 유형을 저장할 전용 테이블이 데이터 모델에 없어 근거 있는 API를 설계할 수 없다. |
| FN-SFR-018-12 | 연차 발생 및 사용 관리 | 스케줄러의 연차 발생과 근태 승인 시 사용 내역 기록은 시스템 내부 처리이며, 발생·사용 내역 확인은 연차 조회 API로 충족된다. |
| FN-SFR-028-02 | 메뉴별 알림 연계 | 각 메뉴의 업무 이벤트 발생 시 시스템 내부에서 수신 대상자 확인, 통합알림 생성, 채널 발송이 자동으로 처리되며 HTTP 호출을 받는 기능이 아니다. |
| FN-SFR-029-06 | 문서번호 자동 채번 | 기안 시점에 시스템이 내부적으로 문서번호를 채번하는 처리이며 별도 HTTP 호출 대상이 아니다(기안 상신 API에서 처리). |
| FN-SFR-031-03 | 완료문서 보관 | 완료 시점에 시스템이 자동 실행하는 내부 처리(문서함 이관·PDF 변환·첨부 등록)로 HTTP 호출이 필요 없다 |
| FN-SFR-033-06 | 자원 예약 알림 발송 | 예약 등록·승인 이벤트 발생 시 시스템이 통합알림으로 자동 발송하는 내부 처리이며 직접 호출되는 API가 없다. |
| FN-SFR-044-01 | AI 문서 유형 자동 분류 및 담당 부서 자동 배분 | 문서 등록 시 시스템(AI 문서 처리)이 자동으로 수행하는 내부 처리이며 HTTP 호출을 받는 기능이 없음 |
