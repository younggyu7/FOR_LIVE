# BEHAVIOR — 업무 동작

> 프로젝트: **회사1** · 설계 버전: **v3.1.1** · spec-format v2  
> 상태가 어떻게 바뀌고, 시스템이 무엇을 스스로 하며, 요청에 없는 값이 어디서 오는지 정리한 문서다. 읽는 순서와 작업 규칙은 `AGENTS.md`.

근거: 원문(요구사항·규칙에 있음) · 결정(고객 답) · 가정(설계에 필요한 추천안) · 확인 필요(고객 답 대기, 구현하지 않고 TODO) · 제외(고객이 뺌)

## 1. 상태 전환

### employee.employment_status (재직 구분)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### menu.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### sub_project.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### partner_account.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### approval_document.approval_status (전자결재 처리 상태)

새 행의 상태: `기안`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 기안 | POST /approval-documents/{approvalDocumentId}/submit | 결재대기 | 상신 시 결재선과 함께 결재대기로 전환 | 원문 |
| 결재대기 | POST /approval-documents/{approvalDocumentId}/approve | 승인 | 결재 차례인 결재자가 승인 | 원문 |
| 결재대기 | POST /approval-documents/{approvalDocumentId}/reject | 반려 | 결재 차례인 결재자가 반려 | 원문 |
| 결재대기 | POST /approval-documents/{approvalDocumentId}/withdraw | 회수 | 기안자가 회수 가능한 상태에서 회수 | 원문 |
| 반려 | POST /approval-documents/{approvalDocumentId}/redraft | 재기안 | - | 원문 |
| 회수 | POST /approval-documents/{approvalDocumentId}/redraft | 재기안 | - | 원문 |

### approval_form.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### notification.read_status (읽음 상태)

새 행의 상태: `안읽음`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 안읽음 | PATCH /notifications/{notificationId}/read | 읽음 | - | 원문 |

### budget_main.approval_status (승인 처리 상태)

새 행의 상태: `신청`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /budget-mains/{budgetMainId}/close | 마감 | - | 원문 |
| 마감 | POST /budget-mains/{budgetMainId}/cancel-close | 마감 취소 | - | 원문 |
| 마감 | POST /budget-mains/{budgetMainId}/approve | 승인 | - | 원문 |
| 승인 | POST /budget-mains/{budgetMainId}/cancel-approval | 승인 취소 | - | 원문 |

### budget_execution.approval_status (승인 처리 상태)

새 행의 상태: `신청`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /budget-executions/{budgetExecutionId}/close | 마감 | - | 원문 |
| 마감 | POST /budget-executions/{budgetExecutionId}/cancel-close | 마감 취소 | - | 원문 |
| 마감 | POST /budget-executions/{budgetExecutionId}/approve | 승인 | - | 원문 |
| 승인 | POST /budget-executions/{budgetExecutionId}/cancel-approval | 승인 취소 | - | 원문 |

### budget_adjustment.approval_status (승인 처리 상태)

새 행의 상태: `신청`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /budget-adjustments/{budgetAdjustmentId}/close | 마감 | - | 원문 |

### requisition.status (처리 상태)

새 행의 상태: `기안`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 기안 | POST /requisitions/{requisitionId}/submit | 결재대기 | - | 원문 |
| 결재대기 | POST /requisitions/{requisitionId}/approve | 승인 | - | 원문 |
| 결재대기 | POST /requisitions/{requisitionId}/reject | 반려 | - | 원문 |

### expense_resolution.status (진행 상태)

새 행의 상태: `기안`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 기안 | POST /expense-resolutions/{expenseResolutionId}/submit | 결재대기 | - | 원문 |
| 결재대기 | POST /expense-resolutions/{expenseResolutionId}/approve | 승인 | - | 원문 |

### journal_entry.status (전표 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### attendance_request.approval_status (승인 처리 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### payroll.closing_status (마감 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### account_carryover.closing_status (마감 여부)

새 행의 상태: `미마감`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 미마감 | POST /account-carryovers/{accountCarryoverId}/close | 마감 | - | 원문 |
| 마감 | POST /account-carryovers/{accountCarryoverId}/cancel-close | 미마감 | - | 원문 |

### auto_journal_setting.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### tax_invoice.issue_status (발행 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### tax_invoice.journal_status (전표처리 상태)

새 행의 상태: `UNPROCESSED`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| UNPROCESSED | POST /tax-invoices/create-journal-entries | PROCESSED | - | 원문 |

### management_item.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### fund_subject.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### fixed_fund.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### fund_plan.closing_status (마감 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### financial_instrument.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### loan.voucher_status (전표처리 상태)

새 행의 상태: `미처리`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 미처리 | POST /loans/{loanId}/process-voucher | 처리완료 | - | 원문 |

### allocation_rule.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### budget_commitment.approval_status (승인 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### personnel_record.employment_status (재직 구분)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### personnel_change_request.status (승인 처리 상태)

새 행의 상태: `신청`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /personnel-change-requests/{personnelChangeRequestId}/review | 승인 | - | 원문 |
| 신청 | POST /personnel-change-requests/{personnelChangeRequestId}/review | 반려 | 반려 사유 필수 | 원문 |

### leave_of_absence_request.status (승인 처리 상태)

새 행의 상태: `신청`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | 승인 | - | 원문 |
| 신청 | POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | 반려 | - | 원문 |

### personnel_appointment.status (발령 상태)

새 행의 상태: `신청`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /personnel-appointments/{personnelAppointmentId}/approve | 승인 | - | 원문 |
| 신청 | POST /personnel-appointments/{personnelAppointmentId}/reject | 반려 | 반려 사유 필수 | 원문 |

### education_application.status (처리 상태)

새 행의 상태: `신청`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /education-applications/{educationApplicationId}/approve | 승인 | - | 원문 |
| 신청 | POST /education-applications/{educationApplicationId}/reject | 반려 | - | 원문 |
| 승인 | POST /education-applications/{educationApplicationId}/cancel-approval | 승인 취소 | - | 원문 |

### certificate_request.status (처리 상태)

새 행의 상태: `신청`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /certificate-requests/{certificateRequestId}/approve | 승인 | - | 원문 |
| 신청 | POST /certificate-requests/{certificateRequestId}/reject | 반려 | 반려 사유 필수 | 원문 |

### annual_leave_plan.approval_status (승인 처리 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### attendance_closing.status (마감 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### leave_grant_rule.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### withholding_adjustment_request.approval_status (승인 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### payroll_run.journal_status (전표처리 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### tax_filing.filing_status (신고 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### year_end_data.closing_status (마감 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### year_end_result.closing_status (마감 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### asset_inspection_plan.approval_status (승인 처리 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### asset_inspection_plan.progress_status (진행 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### resource_reservation.status (예약 상태)

새 행의 상태: `신청` · 고객 확인 확인 필요 BQ-001

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /resource-reservations/{resourceReservationId}/approve | 승인 | - | 원문 |
| 신청 | POST /resource-reservations/{resourceReservationId}/reject | 반려 | - | 원문 |
| 승인 | POST /resource-reservations/{resourceReservationId}/cancel-approval | 신청 | 승인 취소 후 상태 | 확인 필요 |
| 신청 | POST /resource-reservations/{resourceReservationId}/cancel | 취소 | - | 원문 |
| 승인 | POST /resource-reservations/{resourceReservationId}/cancel | 취소 | - | 원문 |

### survey.status (진행상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### messenger_message_recipient.read_status (읽음 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### auth_device.approval_status (승인 상태)

새 행의 상태: `신청`

| 현재 상태 | 처리 | 바뀐 상태 | 조건 | 근거 |
|---|---|---|---|---|
| 신청 | POST /auth-devices/{authDeviceId}/approve | 승인 | - | 원문 |
| 신청 | POST /auth-devices/{authDeviceId}/reject | 반려 | - | 원문 |

### auth_device.use_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### approval_line.approval_status (결재 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### document_dispatch_rule.usage_status (사용 여부)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

### mail_recipient.read_status (읽음 상태)

전환이 정해지지 않았다 (미정). 고객에게 확인한다.

## 2. 자동 처리

| ID | 이름 | 언제 | 무엇을 | 바꾸는 테이블 | 실패하면 | 근거 | 맡는 기능 |
|---|---|---|---|---|---|---|---|
| AUTO-001 | 결재 상신 시 통합알림 발송 | API 실행: 기안 문서가 상신되어 결재대기로 전환될 때 (POST /approval-documents/{approvalDocumentId}/submit) | 결재자에게 통합알림을 생성하고 설정된 채널로 발송한다 | notification | 정해지지 않음 | 원문 | - |
| AUTO-002 | 결재 결과의 업무 상태 반영 | 상태 변경: 전자결재 문서가 승인 또는 반려될 때 | 결재 결과를 연계된 업무 상태에 반영하고 알림을 발송한다 | budget_main, budget_execution, budget_adjustment, requisition, expense_resolution, attendance_request | 정해지지 않음 | 원문 | - |
| AUTO-003 | 결의서 승인 시 집행액·예산잔액 갱신 | 상태 변경: 결의서가 승인될 때 | 집행액을 반영하고 예산잔액을 갱신한다 | budget_execution | 반영·전표 생성을 완료로 처리하지 않는다 | 원문 | - |
| AUTO-004 | 승인 결의서 자동전표 생성 | API 실행: 승인된 결의서의 예산 반영을 요청할 때 (POST /expense-resolutions/{expenseResolutionId}/reflect-budget) | 기존 ERP 연계로 예산 집행을 반영하고 자동전표를 생성해 결의서와 연결한다 | journal_entry, journal_entry_line | 연계 실패 시 완료로 처리하지 않는다 | 원문 | - |
| AUTO-005 | 전표 취소 시 결의서 반영 | API 실행: 전표가 취소될 때 (POST /journal-entries/{journalEntryId}/cancel) | 연계된 결의서 상태와 집행 정보에 취소 결과를 반영한다 | expense_resolution | 정해지지 않음 | 원문 | - |
| AUTO-006 | 인사정보 변경 승인 반영 | API 실행: 인사정보 변경 신청이 승인될 때 (POST /personnel-change-requests/{personnelChangeRequestId}/review) | 변경 내용을 인사기록카드에 반영하고 변경 이력을 남긴다 | personnel_record, change_history | 정해지지 않음 | 원문 | - |
| AUTO-007 | 휴직·단축근무 승인 반영 | API 실행: 휴직 또는 단축근무 신청이 승인될 때 (POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review) | 재직정보에 반영하고 변경 이력을 남기며 신청자에게 알린다 | personnel_record, change_history, notification | 정해지지 않음 | 원문 | - |
| AUTO-008 | 인사발령 처리 및 공고 게시 | API 실행: 승인된 인사발령을 처리할 때 (POST /personnel-appointments/{personnelAppointmentId}/process) | 발령 내용을 인사기록카드에 반영하고 처리 상태를 완료로 변경하며 발령공고를 자동 게시하고 알림을 발송한다 | personnel_record, personnel_appointment, board_post, notification | 정해지지 않음 | 원문 BQ-002 | - |
| AUTO-009 | 교육신청 승인 시 교육대상자 반영 | API 실행: 교육신청이 승인될 때 (POST /education-applications/{educationApplicationId}/approve) | 승인된 신청자를 해당 차수의 교육대상자로 등록하고 신청자에게 알린다 | education_attendee, notification | 정해지지 않음 | 원문 | - |
| AUTO-010 | 증명서 승인 시 발급번호 부여 | API 실행: 증명서 신청이 승인될 때 (POST /certificate-requests/{certificateRequestId}/approve) | 증명서 종류별 채번 규칙에 따라 발급번호를 부여하고 신청자에게 결과를 알린다 | certificate_request, notification | 정해지지 않음 | 원문 | - |
| AUTO-011 | 구매품의 자산품목 자산 등록 연계 | 상태 변경: 구매품의서가 승인되고 자산품목이 검수 불필요이거나 검수가 완료될 때 | 자산품목을 자산으로 자동 등록하고 결과를 담당자에게 알린다. 이미 연계된 품목은 건너뛴다 | asset, notification | 정해지지 않음 | 원문 | - |
| AUTO-012 | 자원 예약 등록 시 승인 방식 적용 | API 실행: 자원 예약을 등록할 때 (POST /resource-reservations) | 승인 절차 사용이면 신청, 미사용이면 자동 승인 상태로 저장하고 예약자에게 알린다. 승인 요청 알림은 자원 담당자에게 발송한다 | resource_reservation, notification | 정해지지 않음 | 원문 | - |
| AUTO-013 | 자원 예약 승인·반려 알림 | 상태 변경: 예약이 승인 또는 반려될 때 | 예약자에게 통합알림을 발송한다 | notification | 정해지지 않음 | 원문 | - |
| AUTO-014 | 연차 사용 시 잔여 연차 차감 | 상태 변경: 연차 근태가 승인될 때 | 사용 내역을 기록하고 잔여 연차에서 차감한다 | leave_usage, annual_leave | 정해지지 않음 | 원문 | - |
| AUTO-015 | 출퇴근 연동 수신 저장 | 외부 수신: 출퇴근 연동 시스템이 출퇴근 정보를 보낼 때 (POST /commute-records/receive-linked) | 수신한 출퇴근 정보를 저장한다 | commute_record | 사용자에게 오류 메시지를 표시한다 | 원문 | - |
| AUTO-016 | 신규 게시물 알림 발송 | API 실행: 공지·게시물이 등록될 때 (POST /board-posts) | 공개범위 대상자에게 통합알림을 발송한다 | notification | 정해지지 않음 | 원문 | - |
| AUTO-017 | 메뉴 사용 이력 자동 기록 | API 실행: 임직원이 메뉴를 열 때 (POST /menus/{menuId}/open) | 사원명, 사용일시, 메뉴명, 접속 IP, 사용 환경을 기록한다 | menu_usage_log | 정해지지 않음 | 원문 | - |
| AUTO-018 | 로그인 내역 자동 기록 | API 실행: 로그인에 성공할 때 (POST /auth/login) | 로그인 내역을 기록한다 | login_history | 정해지지 않음 | 원문 | - |
| AUTO-019 | 전자세금계산서 수집 | 일정: 주기는 확인 필요 (POST /tax-invoices/collect) | 홈택스 연계로 전자세금계산서를 수집하고 기준정보와 대조해 반영하며 이력을 저장한다 | tax_invoice, link_log | 업무 데이터에 반영하지 않고 실패 사유를 이력에 남긴다 | 결정 BQ-003 | - |
| AUTO-020 | 은행거래 수집 및 자동전표 | API 실행: 은행계좌 거래내역을 수집할 때 (POST /bank-transactions/collect) | 거래내역을 수집하고 자동분개 설정과 일치하면 자동전표를 생성하며 불일치는 예외 거래로 분류한다 | bank_transaction, journal_entry, link_log | 반영하지 않고 실패 사유를 이력에 남긴다 | 원문 | - |
| AUTO-021 | 전표처리 상태 반영 | API 실행: 세금계산서 또는 차입금·대여금이 전표처리될 때 (POST /tax-invoices/create-journal-entries) | 전표를 생성하고 처리 상태를 처리됨으로 반영한다. 중복 전표처리는 허용하지 않는다 | tax_invoice, journal_entry | 정해지지 않음 | 원문 | - |
| AUTO-022 | 급여 전표 생성 및 상태 반영 | API 실행: 마감된 급여의 전표처리를 요청할 때 (POST /payroll-runs/{payrollRunId}/create-journal-entry) | 급여 전표를 생성하고 전표처리 상태를 PROCESSED로 반영한다 | journal_entry, payroll_run | 정해지지 않음 | 원문 | - |
| AUTO-023 | 급여명세서 통합알림 발송 | API 실행: 담당자가 마감된 급여의 명세서 발송을 요청할 때 (POST /payslips/send) | 선택 대상에게 명세서를 통합알림으로 발송한다 | notification | 정해지지 않음 | 원문 | - |
| AUTO-024 | 사회보험 등급 변경 이력 기록 | API 실행: 사회보험 등급이 변경될 때 (POST /social-insurance-grades/change) | 변경 이력을 기록하고 적용 시작월부터 공제내역에 반영한다 | social_insurance_grade, change_history | 정해지지 않음 | 원문 | - |
| AUTO-025 | 자산실사 외부 시스템 연계 | API 실행: 승인된 실사계획을 연계할 때 (POST /asset-inspection-plans/{assetInspectionPlanId}/link) | 승인된 실사 대상을 외부 자산실사 시스템에 전달한다 | asset_inspection_item | 사용자에게 오류 메시지를 표시한다 | 원문 | - |
| AUTO-026 | 문서 유형 자동 분류·부서 배분 | 외부 수신: 문서가 접수될 때 | AI가 문서 유형을 분류해 담당 부서를 배분하고 통합알림을 발송한다. 신뢰도가 낮거나 매칭 부서가 없으면 수동 지정 대상으로 남긴다 | document_dispatch_rule, notification | 정해지지 않음 | 원문 | - |

## 3. 값의 출처

요청에 없는 필수 값과 계산 값이 어디서 오는지다. 출처가 미정이면 지어내지 말고 `TODO`로 남긴다.

| API | 값 | 출처 | 내용 | 근거 |
|---|---|---|---|---|
| POST /rfid-scan-logs | rfid_scan_log.match_status | 계산 | tag_value가 asset.rfid_tag_value와 일치하면 MATCHED, 아니면 UNMATCHED | 원문 |
| POST /rfid-scan-logs | rfid_scan_log.asset_id | 다른 테이블 | asset.asset_id (asset.rfid_tag_value = tag_value인 행) | 원문 |
| POST /link-logs | link_log.requester_id | 현재 사용자 | - | 원문 |
| POST /link-logs | link_log.requested_at | 현재 시각 | - | 원문 |
| POST /link-logs | link_log.status | 계산 | 연계 성공 시 SUCCESS, 실패 시 FAILED | 가정 |
| POST /partner-accounts | partner_account.account_number_enc | 계산 | accountNumber를 암호화 | 원문 |
| POST /credit-cards | credit_card.card_number_enc | 계산 | cardNumber를 암호화 | 원문 |
| POST /credit-cards | credit_card.card_number_last4 | 계산 | cardNumber 마지막 4자리 | 가정 |
| POST /budget-mains | budget_main.requester_id | 현재 사용자 | - | 가정 |
| POST /budget-mains | budget_main.approval_status | 고정값 | 신청 | 원문 |
| POST /budget-mains/{budgetMainId}/close | budget_main.approval_status | 고정값 | 마감 | 원문 |
| POST /budget-mains/{budgetMainId}/cancel-close | budget_main.approval_status | 고정값 | 마감 취소 | 원문 |
| POST /budget-mains/{budgetMainId}/approve | budget_main.approval_status | 고정값 | 승인 | 원문 |
| POST /budget-mains/{budgetMainId}/cancel-approval | budget_main.approval_status | 고정값 | 승인 취소 | 원문 |
| POST /budget-executions | budget_execution.approval_status | 고정값 | 신청 | 원문 |
| POST /budget-executions/{budgetExecutionId}/close | budget_execution.approval_status | 고정값 | 마감 | 원문 |
| POST /budget-executions/{budgetExecutionId}/cancel-close | budget_execution.approval_status | 고정값 | 마감 취소 | 원문 |
| POST /budget-executions/{budgetExecutionId}/approve | budget_execution.approval_status | 고정값 | 승인 | 원문 |
| POST /budget-executions/{budgetExecutionId}/cancel-approval | budget_execution.approval_status | 고정값 | 승인 취소 | 원문 |
| GET /budget-accounts/execution-status | executedAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /budget-accounts/execution-status | remainingAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /budget-adjustments | budget_adjustment.approval_status | 고정값 | 신청 | 원문 |
| POST /budget-adjustments/{budgetAdjustmentId}/close | budget_adjustment.approval_status | 고정값 | 마감 | 원문 |
| POST /requisitions | requisition.drafter_id | 현재 사용자 | - | 가정 |
| POST /requisitions | requisition.status | 고정값 | 기안 | 가정 |
| POST /expense-resolutions | expense_resolution.status | 고정값 | 기안 | 가정 |
| GET /budget-statuses | executionBudgetAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /budget-statuses | carryoverBudgetAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /budget-statuses | totalBudgetAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /budget-statuses | executedAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /budget-statuses | budgetBalance | 계산 | 예산총액 - 집행액 | 가정 |
| POST /expense-resolutions/{expenseResolutionId}/approve | expense_resolution.status | 고정값 | 승인 | 원문 |
| POST /expense-resolutions/{expenseResolutionId}/approve | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /expense-resolutions/{expenseResolutionId}/approve | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /requisitions/{requisitionId}/approve | requisition.status | 고정값 | 승인 | 원문 |
| POST /budget-commitments | budget_commitment.approval_status | 고정값 | 신청 | 가정 |
| POST /budget-commitments/{budgetCommitmentId}/cancel | budget_commitment.approval_status | 고정값 | 승인 취소 | 가정 |
| POST /journal-entries | journal_entry.entry_date | 현재 시각 | - | 가정 |
| POST /journal-entries | journal_entry.status | 고정값 | 신청 | 가정 |
| POST /journal-entries/{journalEntryId}/cancel | journal_entry.status | 고정값 | 승인 취소 | 가정 |
| POST /expense-resolutions/bulk-import | successCount | 계산 | 오류 건을 제외한 정상 등록 건수 | 원문 |
| POST /expense-resolutions/bulk-import | errors | 계산 | 검증에 실패한 행과 사유 | 원문 |
| POST /account-transfer-resolutions | account_transfer_resolution.processor_id | 현재 사용자 | - | 원문 |
| POST /account-transfer-resolutions | account_transfer_resolution.processed_at | 현재 시각 | - | 원문 |
| POST /account-transfer-resolutions | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /account-transfer-resolutions | change_history.changed_at | 현재 시각 | - | 원문 |
| GET /budget-ledgers | totalAmount | 계산 | 조회 조건에 해당하는 항목 금액의 합계 | 원문 |
| GET /budget-status | ratio | 계산 | 항목 예산액 / 프로젝트 예산 합계 × 100 | 가정 |
| GET /budget-status | balance | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /account-carryovers | account_carryover.closing_status | 고정값 | 미마감 | 가정 |
| POST /account-carryovers/{accountCarryoverId}/close | account_carryover.closing_status | 고정값 | 마감 | 원문 |
| POST /account-carryovers/{accountCarryoverId}/cancel-close | account_carryover.closing_status | 고정값 | 미마감 | 원문 |
| POST /tax-office-conversions | convertedFile | 계산 | 조회 권한 범위의 회계자료를 세무 프로그램 형식으로 변환한 파일 | 가정 |
| POST /tax-office-conversions | convertedCount | 계산 | 변환에 성공한 자료 건수 | 원문 |
| POST /tax-office-conversions | errorReasons | 계산 | 변환 실패 건별 오류 사유 | 원문 |
| POST /excel-uploads | upload_history.uploader_id | 현재 사용자 | - | 원문 |
| POST /excel-uploads | upload_history.file_name | 계산 | 업로드한 파일 이름 | 가정 |
| POST /excel-uploads | upload_history.uploaded_at | 현재 시각 | - | 가정 |
| POST /excel-uploads | upload_history.total_count | 계산 | 파일 전체 행 수 | 가정 |
| POST /excel-uploads | upload_history.success_count | 계산 | 검증을 통과해 반영된 행 수 | 가정 |
| POST /excel-uploads | upload_history.error_count | 계산 | 전체 행 수 - 정상 행 수 | 가정 |
| POST /excel-uploads | upload_history.error_detail | 계산 | 오류 행 위치와 사유 | 원문 |
| POST /excel-uploads | upload_history.process_mode | 고정값 | EXCLUDE_ERROR | 원문 |
| POST /excel-uploads | uploadHistoryId | 다른 테이블 | upload_history.upload_history_id, 이번에 저장한 행 | 가정 |
| GET /auto-journal-settings | autoJournalSettingId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /auto-journal-settings | autoJournalSettingId | 다른 테이블 | auto_journal_setting.auto_journal_setting_id, 새로 저장한 행 | 가정 |
| PUT /auto-journal-settings/{autoJournalSettingId} | autoJournalSettingId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /tax-invoices/collect | link_log.requester_id | 현재 사용자 | - | 가정 |
| POST /tax-invoices/collect | link_log.link_target | 고정값 | NTS_HOMETAX | 원문 |
| POST /tax-invoices/collect | link_log.status | 계산 | 연계 성공 시 SUCCESS, 실패 시 FAILED | 가정 |
| POST /tax-invoices/collect | link_log.requested_at | 현재 시각 | - | 가정 |
| POST /tax-invoices/collect | collectedCount | 계산 | 수집·저장된 세금계산서 건수 | 가정 |
| GET /tax-invoices | reconcileResult | 계산 | 내부 매출·매입자료와 비교한 일치·불일치 구분 | 원문 |
| GET /tax-invoices | taxInvoiceId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /expense-resolutions/from-tax-invoice | expense_resolution.partner_id | 다른 테이블 | tax_invoice.partner_id, 선택한 세금계산서 행 | 가정 |
| POST /expense-resolutions/from-tax-invoice | expense_resolution.resolution_method | 고정값 | 세금계산서 | 원문 |
| POST /expense-resolutions/from-tax-invoice | expense_resolution.status | 고정값 | 기안 | 가정 |
| POST /expense-resolutions/from-tax-invoice | expenseResolutionId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /bank-transactions/collect | collectedCount | 계산 | 수집·저장된 거래내역 건수 | 가정 |
| POST /bank-transactions/collect | journalizedCount | 계산 | 자동분개 설정과 일치해 전표 생성된 건수 | 가정 |
| POST /bank-transactions/collect | exceptionCount | 계산 | 자동분개 기준과 불일치한 건수 | 가정 |
| GET /bank-transactions | bankTransactionId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /journal-settlements | journal_settlement.settled_by_id | 현재 사용자 | - | 원문 |
| POST /journal-settlements | journal_settlement.settled_at | 현재 시각 | - | 가정 |
| POST /journal-settlements | journalSettlementId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /card-approvals/collect | collectedCount | 계산 | 수집·저장된 승인내역 건수 | 가정 |
| GET /card-approvals | cardApprovalId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /cash-receipts | cashReceiptId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /expense-resolutions/from-card-or-cash-receipt | expense_resolution.resolution_method | 고정값 | 카드사용내역 | 가정 |
| POST /expense-resolutions/from-card-or-cash-receipt | expense_resolution.status | 고정값 | 기안 | 가정 |
| POST /expense-resolutions/from-card-or-cash-receipt | expenseResolutionId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /journal-entries/{journalEntryId} | lines | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /journal-entries/{journalEntryId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /journal-entries/{journalEntryId} | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /journal-entries/{journalEntryId}/cancel-approval | journal_entry.status | 고정값 | 승인 취소 | 원문 |
| POST /journal-entries/{journalEntryId}/cancel-approval | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /journal-entries/{journalEntryId}/cancel-approval | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /journal-entries/{journalEntryId}/cancel-approval | change_history.target_type | 고정값 | journal_entry | 가정 |
| POST /journal-entries/{journalEntryId}/cancel-approval | change_history.target_id | 다른 테이블 | journal_entry.journal_entry_id 대상 전표 | 가정 |
| POST /journal-entries/{journalEntryId}/cancel-approval | change_history.change_content | 계산 | 승인 → 승인 취소 상태 변경 내용 | 가정 |
| PATCH /journal-entries/evidence-details | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /journal-entries/evidence-details | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /journal-entries/evidence-details | results | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /journal-entries/{journalEntryId}/print | printFile | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /tax-invoices | tax_invoice.issue_status | 계산 | 외부 시스템 발행 성공 시 ISSUED, 실패 시 NOT_ISSUED | 원문 |
| POST /tax-invoices | tax_invoice.journal_status | 고정값 | UNPROCESSED | 가정 |
| POST /tax-invoices | link_log.requester_id | 현재 사용자 | - | 가정 |
| POST /tax-invoices | link_log.link_target | 고정값 | NTS_HOMETAX | 가정 |
| POST /tax-invoices | link_log.status | 계산 | 요청 후 회신 결과에 따라 SUCCESS 또는 FAILED | 가정 |
| POST /tax-invoices | link_log.requested_at | 현재 시각 | - | 가정 |
| POST /tax-invoices/validate | results | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /tax-invoices/create-journal-entries | tax_invoice.journal_status | 고정값 | PROCESSED | 원문 |
| POST /tax-invoices/create-journal-entries | tax_invoice.journal_entry_id | 다른 테이블 | 생성된 journal_entry.journal_entry_id | 가정 |
| POST /tax-invoices/create-journal-entries | results | 계산 | 건별 처리 성공·실패 집계 | 가정 |
| PATCH /tax-invoices/issue-status | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /tax-invoices/issue-status | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /tax-invoices/issue-status | change_history.target_type | 고정값 | tax_invoice | 가정 |
| PATCH /tax-invoices/issue-status | change_history.change_content | 계산 | 발행 여부 변경 전후 값 | 가정 |
| PATCH /tax-invoices/issue-status | results | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /account-ledgers | balance | 계산 | 기간 내 차변 합계 - 대변 합계 누계 | 가정 |
| GET /partner-ledgers | balance | 계산 | 기간 내 차변 합계 - 대변 합계 누계 | 가정 |
| GET /partner-ledgers | aggregationPeriod | 계산 | 집계 단위에 따라 전표 일자를 일 또는 월로 묶음 | 가정 |
| GET /management-item-ledgers | balance | 계산 | 차변 합계 - 대변 합계 | 가정 |
| GET /receivable-aging | bucket | 계산 | 기준일자와 전표일 차이를 환경설정(system_setting)의 구간 기준으로 분류 | 원문 |
| GET /receivable-aging | balance | 계산 | 구간별 채권 잔액 합계 | 가정 |
| GET /partner-balances | receivableBalance | 계산 | 채권 라인 금액 - 상계 금액 합계 | 가정 |
| GET /partner-balances | payableBalance | 계산 | 채무 라인 금액 - 상계 금액 합계 | 가정 |
| GET /settlement-aging | bucket | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /settlement-aging | balance | 계산 | 전표 라인 금액 - 반제 금액 합계 | 가정 |
| GET /fund-plans | balanceDifference | 계산 | 수입 계획 금액 - 지출 계획 금액 | 원문 |
| POST /fund-plans | fund_plan.closing_status | 고정값 | 마감 취소 | 가정 |
| GET /daily-fund-reports | previousBalance | 계산 | 전일 계좌 잔액 | 가정 |
| GET /daily-fund-reports | depositAmount | 계산 | 해당 일자 자금 입금 내역 합계 | 원문 |
| GET /daily-fund-reports | withdrawalAmount | 계산 | 해당 일자 자금 출금 내역 합계 | 원문 |
| GET /daily-fund-reports | currentBalance | 계산 | previousBalance + depositAmount - withdrawalAmount | 가정 |
| GET /daily-fund-reports | reportDate | 계산 | 조회 일자 그대로 반환 | 가정 |
| GET /fund-statuses | itemName | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fund-statuses | amount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fund-statuses | totalAmount | 계산 | 목록 amount 합계 | 원문 |
| GET /fund-statuses | planAmount | 다른 테이블 | fund_plan.income_amount, fund_plan.expense_amount 중 조회 기간에 해당하는 행 | 원문 |
| GET /fund-statuses | actualAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fund-statuses | differenceAmount | 계산 | actualAmount - planAmount | 원문 |
| GET /loan-statements | repaidAmount | 계산 | 기간 내 loan_transaction REPAYMENT amount 합계 | 가정 |
| GET /loan-statements | balance | 계산 | principalAmount - repaidAmount | 가정 |
| POST /loans/{loanId}/process-voucher | loan.voucher_status | 고정값 | 처리완료 | 원문 |
| POST /loans/{loanId}/process-voucher | journal_entry.entry_date | 현재 시각 | - | 가정 |
| POST /loans/{loanId}/process-voucher | journal_entry.status | 고정값 | 신청 | 가정 |
| POST /loans/{loanId}/process-voucher | journal_entry.expense_resolution_id | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /financial-statements | amount | 계산 | journal_entry_line 차대변 금액과 closing_data.closing_amount를 재무제표 종류별로 집계 | 원문 |
| GET /management-balance-sheets | amount | 계산 | 조건별 journal_entry_line 차변-대변 금액 집계 | 원문 |
| GET /management-income-statements | revenueAmount | 계산 | 기간·조건 내 전표 분개 라인 수익 계정 대변-차변 합계 | 원문 |
| GET /management-income-statements | expenseAmount | 계산 | 기간·조건 내 전표 분개 라인 비용 계정 차변-대변 합계 | 원문 |
| GET /management-income-statements | profitAmount | 계산 | revenueAmount - expenseAmount | 가정 |
| GET /management-income-statements | allocatedAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /management-cost-reports | costAmount | 계산 | 기간·조건 내 비용 계정 분개 라인 차변-대변 합계 | 가정 |
| POST /vat-forms | vat_form.form_content | 계산 | 과세 기간 내 전표·전자세금계산서 매입·매출 집계 | 원문 |
| POST /vat-forms | vat_form.is_closed | 고정값 | false | 가정 |
| POST /assets | asset_depreciation.acquisition_cost | 다른 테이블 | 요청의 acquisitionAmount (asset.acquisition_amount) | 가정 |
| POST /assets | asset_depreciation.depreciation_method | 다른 테이블 | 요청의 depreciationMethod | 가정 |
| POST /assets | asset_depreciation.useful_life_months | 다른 테이블 | 요청의 usefulLifeMonths | 가정 |
| POST /assets | asset_depreciation.account_subject_id | 다른 테이블 | 요청의 accountSubjectId (asset.account_subject_id) | 가정 |
| PATCH /assets/{assetId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /assets/{assetId} | change_history.target_type | 고정값 | asset | 가정 |
| PATCH /assets/{assetId} | change_history.target_id | 다른 테이블 | 수정한 asset.asset_id | 가정 |
| PATCH /assets/{assetId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /assets/{assetId} | change_history.change_content | 계산 | 수정 전후 변경 내용 | 원문 |
| GET /asset-reports | depreciationAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /asset-reports | changeAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /employees/{employeeId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /employees/{employeeId} | change_history.target_type | 고정값 | employee | 가정 |
| PATCH /employees/{employeeId} | change_history.target_id | 다른 테이블 | 수정한 employee.employee_id | 가정 |
| PATCH /employees/{employeeId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /employees/{employeeId} | change_history.change_content | 계산 | 수정 전후 변경 내용 | 원문 |
| GET /personnel-change-requests | personnelChangeRequestId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /personnel-change-requests | personnel_change_request.employee_id | 현재 사용자 | - | 가정 |
| POST /personnel-change-requests | personnel_change_request.status | 고정값 | 신청 | 원문 |
| POST /personnel-change-requests | personnel_change_request.before_value_enc | 다른 테이블 | personnel_record의 신청자 행에서 변경 항목에 해당하는 컬럼 | 가정 |
| POST /personnel-change-requests | personnelChangeRequestId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | personnel_change_request.reviewer_id | 현재 사용자 | - | 원문 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | personnel_change_request.reviewed_at | 현재 시각 | - | 원문 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | change_history.target_type | 고정값 | personnel_record | 가정 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | change_history.target_id | 다른 테이블 | personnel_record.personnel_record_id, 신청자의 인사기록카드 행 | 가정 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | change_history.change_content | 계산 | 변경 항목과 변경 전후 값 | 원문 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | notification.recipient_id | 다른 테이블 | personnel_change_request.employee_id, 해당 신청 행 | 원문 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | notification.channel | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | notification.title | 계산 | 처리 결과(승인/반려) 안내 문구 | 가정 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | notification.read_status | 고정값 | 안읽음 | 가정 |
| POST /personnel-change-requests/{personnelChangeRequestId}/review | appliedPersonnelRecordId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /personnel-records/bulk-update | successCount | 계산 | 반영 성공 건수 | 원문 |
| POST /personnel-records/bulk-update | failureCount | 계산 | 반영 실패 건수 | 원문 |
| POST /personnel-records/bulk-update | failures | 계산 | 건별 실패 사유 목록 | 원문 |
| POST /personnel-records/bulk-update | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /personnel-records/bulk-update | change_history.target_type | 고정값 | personnel_record | 가정 |
| POST /personnel-records/bulk-update | change_history.target_id | 다른 테이블 | personnel_record.personnel_record_id, 대상 임직원 행 | 가정 |
| POST /personnel-records/bulk-update | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /personnel-records/bulk-update | change_history.change_content | 계산 | 건별 변경 항목과 변경 전후 값 | 원문 |
| GET /personnel-records | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /personnel-records | personal_info_access_log.target_info_type | 고정값 | 기초 인적사항 | 가정 |
| GET /personnel-records | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /personnel-records | personnelRecordId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /personnel-records | personnel_record.employment_status | 다른 테이블 | employee.employment_status, 대상 임직원 행 | 가정 |
| POST /personnel-records | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /personnel-records | change_history.target_type | 고정값 | personnel_record | 가정 |
| POST /personnel-records | change_history.target_id | 자동 번호 | 생성된 personnel_record_id | 가정 |
| POST /personnel-records | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /personnel-records | change_history.change_content | 계산 | 등록 내용 | 가정 |
| POST /personnel-records | personnelRecordId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /personnel-records/{personnelRecordId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /personnel-records/{personnelRecordId} | change_history.target_type | 고정값 | personnel_record | 가정 |
| PATCH /personnel-records/{personnelRecordId} | change_history.target_id | 다른 테이블 | 수정한 personnel_record.personnel_record_id | 가정 |
| PATCH /personnel-records/{personnelRecordId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /personnel-records/{personnelRecordId} | change_history.change_content | 계산 | 변경 전후 값 | 원문 |
| PATCH /personnel-records/{personnelRecordId} | personnelRecordId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /employee-families | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /employee-families | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /employee-families | personal_info_access_log.target_info_type | 고정값 | 가족 정보 | 가정 |
| GET /employee-families | employeeFamilyId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /employee-families | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-families | change_history.target_type | 고정값 | employee_family | 가정 |
| POST /employee-families | change_history.target_id | 자동 번호 | 생성된 employee_family_id | 가정 |
| POST /employee-families | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-families | change_history.change_content | 계산 | 등록 내용 | 가정 |
| POST /employee-families | employeeFamilyId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /employee-families/{employeeFamilyId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /employee-families/{employeeFamilyId} | change_history.target_type | 고정값 | employee_family | 가정 |
| PATCH /employee-families/{employeeFamilyId} | change_history.target_id | 다른 테이블 | 수정한 employee_family.employee_family_id | 가정 |
| PATCH /employee-families/{employeeFamilyId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /employee-families/{employeeFamilyId} | change_history.change_content | 계산 | 변경 전후 값 | 원문 |
| PATCH /employee-families/{employeeFamilyId} | employeeFamilyId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| DELETE /employee-families/{employeeFamilyId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /employee-families/{employeeFamilyId} | change_history.target_type | 고정값 | employee_family | 가정 |
| DELETE /employee-families/{employeeFamilyId} | change_history.target_id | 다른 테이블 | 삭제한 employee_family.employee_family_id | 가정 |
| DELETE /employee-families/{employeeFamilyId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /employee-families/{employeeFamilyId} | change_history.change_content | 계산 | 삭제 내용 | 가정 |
| GET /employee-educations | employeeEducationId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /employee-educations | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-educations | change_history.target_type | 고정값 | employee_education | 가정 |
| POST /employee-educations | change_history.target_id | 자동 번호 | 생성된 employee_education_id | 가정 |
| POST /employee-educations | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-educations | change_history.change_content | 계산 | 등록 내용 | 가정 |
| POST /employee-educations | employeeEducationId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /employee-educations/{employeeEducationId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /employee-educations/{employeeEducationId} | change_history.target_type | 고정값 | employee_education | 가정 |
| PATCH /employee-educations/{employeeEducationId} | change_history.target_id | 다른 테이블 | 수정한 employee_education.employee_education_id | 가정 |
| PATCH /employee-educations/{employeeEducationId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /employee-educations/{employeeEducationId} | change_history.change_content | 계산 | 변경 전후 값 | 원문 |
| PATCH /employee-educations/{employeeEducationId} | employeeEducationId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| DELETE /employee-educations/{employeeEducationId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /employee-educations/{employeeEducationId} | change_history.target_type | 고정값 | employee_education | 가정 |
| DELETE /employee-educations/{employeeEducationId} | change_history.target_id | 다른 테이블 | 삭제한 employee_education.employee_education_id | 가정 |
| DELETE /employee-educations/{employeeEducationId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /employee-educations/{employeeEducationId} | change_history.change_content | 계산 | 삭제 내용 | 가정 |
| GET /employee-careers | employeeCareerId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /employee-careers | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-careers | change_history.target_type | 고정값 | employee_career | 가정 |
| POST /employee-careers | change_history.target_id | 자동 번호 | 생성된 employee_career_id | 가정 |
| POST /employee-careers | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-careers | change_history.change_content | 계산 | 등록 내용 | 가정 |
| POST /employee-careers | employeeCareerId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /employee-careers/{employeeCareerId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /employee-careers/{employeeCareerId} | change_history.target_type | 고정값 | employee_career | 가정 |
| PATCH /employee-careers/{employeeCareerId} | change_history.target_id | 다른 테이블 | 수정한 employee_career.employee_career_id | 가정 |
| PATCH /employee-careers/{employeeCareerId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /employee-careers/{employeeCareerId} | change_history.change_content | 계산 | 변경 전후 값 | 원문 |
| PATCH /employee-careers/{employeeCareerId} | employeeCareerId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| DELETE /employee-careers/{employeeCareerId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /employee-careers/{employeeCareerId} | change_history.target_type | 고정값 | employee_career | 가정 |
| DELETE /employee-careers/{employeeCareerId} | change_history.target_id | 다른 테이블 | 삭제한 employee_career.employee_career_id | 가정 |
| DELETE /employee-careers/{employeeCareerId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /employee-careers/{employeeCareerId} | change_history.change_content | 계산 | 삭제 내용 | 가정 |
| GET /employee-licenses | employeeLicenseId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /employee-licenses | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-licenses | change_history.target_type | 고정값 | employee_license | 가정 |
| POST /employee-licenses | change_history.target_id | 자동 번호 | 생성된 employee_license_id | 가정 |
| POST /employee-licenses | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-licenses | change_history.change_content | 계산 | 등록 내용 | 가정 |
| POST /employee-licenses | employeeLicenseId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /employee-licenses/{employeeLicenseId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /employee-licenses/{employeeLicenseId} | change_history.target_type | 고정값 | employee_license | 가정 |
| PATCH /employee-licenses/{employeeLicenseId} | change_history.target_id | 다른 테이블 | 수정한 employee_license.employee_license_id | 가정 |
| PATCH /employee-licenses/{employeeLicenseId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /employee-licenses/{employeeLicenseId} | change_history.change_content | 계산 | 변경 전후 값 | 원문 |
| PATCH /employee-licenses/{employeeLicenseId} | employeeLicenseId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| DELETE /employee-licenses/{employeeLicenseId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /employee-licenses/{employeeLicenseId} | change_history.target_type | 고정값 | employee_license | 가정 |
| DELETE /employee-licenses/{employeeLicenseId} | change_history.target_id | 다른 테이블 | 삭제한 employee_license.employee_license_id | 가정 |
| DELETE /employee-licenses/{employeeLicenseId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /employee-licenses/{employeeLicenseId} | change_history.change_content | 계산 | 삭제 내용 | 가정 |
| GET /employee-languages | employeeLanguageId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /employee-languages | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-languages | change_history.target_type | 고정값 | employee_language | 가정 |
| POST /employee-languages | change_history.target_id | 자동 번호 | 생성된 employee_language_id | 가정 |
| POST /employee-languages | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-languages | change_history.change_content | 계산 | 등록 내용 | 가정 |
| POST /employee-languages | employeeLanguageId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /employee-languages/{employeeLanguageId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /employee-languages/{employeeLanguageId} | change_history.target_type | 고정값 | employee_language | 가정 |
| PATCH /employee-languages/{employeeLanguageId} | change_history.target_id | 다른 테이블 | 수정한 employee_language.employee_language_id | 가정 |
| PATCH /employee-languages/{employeeLanguageId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /employee-languages/{employeeLanguageId} | change_history.change_content | 계산 | 변경 전후 값 | 원문 |
| PATCH /employee-languages/{employeeLanguageId} | employeeLanguageId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| DELETE /employee-languages/{employeeLanguageId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /employee-languages/{employeeLanguageId} | change_history.target_type | 고정값 | employee_language | 가정 |
| DELETE /employee-languages/{employeeLanguageId} | change_history.target_id | 다른 테이블 | 삭제한 employee_language.employee_language_id | 가정 |
| DELETE /employee-languages/{employeeLanguageId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /employee-languages/{employeeLanguageId} | change_history.change_content | 계산 | 삭제 내용 | 가정 |
| GET /employee-evaluations | employeeEvaluationId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /employee-evaluations | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-evaluations | change_history.target_type | 고정값 | employee_evaluation | 가정 |
| POST /employee-evaluations | change_history.target_id | 자동 번호 | 생성된 employee_evaluation_id | 가정 |
| POST /employee-evaluations | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-evaluations | change_history.change_content | 계산 | 등록 내용 | 가정 |
| POST /employee-evaluations | employeeEvaluationId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /employee-evaluations/{employeeEvaluationId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /employee-evaluations/{employeeEvaluationId} | change_history.target_type | 고정값 | employee_evaluation | 가정 |
| PATCH /employee-evaluations/{employeeEvaluationId} | change_history.target_id | 다른 테이블 | 수정한 employee_evaluation.employee_evaluation_id | 가정 |
| PATCH /employee-evaluations/{employeeEvaluationId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /employee-evaluations/{employeeEvaluationId} | change_history.change_content | 계산 | 변경 전후 값 | 원문 |
| PATCH /employee-evaluations/{employeeEvaluationId} | employeeEvaluationId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| DELETE /employee-evaluations/{employeeEvaluationId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /employee-evaluations/{employeeEvaluationId} | change_history.target_type | 고정값 | employee_evaluation | 가정 |
| DELETE /employee-evaluations/{employeeEvaluationId} | change_history.target_id | 다른 테이블 | 삭제한 employee_evaluation.employee_evaluation_id | 가정 |
| DELETE /employee-evaluations/{employeeEvaluationId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /employee-evaluations/{employeeEvaluationId} | change_history.change_content | 계산 | 삭제 내용 | 가정 |
| GET /employee-reward-penalties | employeeRewardPenaltyId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /employee-reward-penalties | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-reward-penalties | change_history.target_type | 고정값 | employee_reward_penalty | 가정 |
| POST /employee-reward-penalties | change_history.target_id | 자동 번호 | 생성된 employee_reward_penalty_id | 가정 |
| POST /employee-reward-penalties | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-reward-penalties | change_history.change_content | 계산 | 등록 내용 | 가정 |
| POST /employee-reward-penalties | employeeRewardPenaltyId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.target_type | 고정값 | employee_reward_penalty | 가정 |
| PATCH /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.target_id | 다른 테이블 | 수정한 employee_reward_penalty.employee_reward_penalty_id | 가정 |
| PATCH /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.change_content | 계산 | 변경 전후 값 | 원문 |
| PATCH /employee-reward-penalties/{employeeRewardPenaltyId} | employeeRewardPenaltyId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| DELETE /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.target_type | 고정값 | employee_reward_penalty | 가정 |
| DELETE /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.target_id | 다른 테이블 | 삭제한 employee_reward_penalty.employee_reward_penalty_id | 가정 |
| DELETE /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /employee-reward-penalties/{employeeRewardPenaltyId} | change_history.change_content | 계산 | 삭제 내용 | 가정 |
| GET /employee-business-trips | employeeBusinessTripId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /employee-business-trips | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-business-trips | change_history.target_type | 고정값 | employee_business_trip | 가정 |
| POST /employee-business-trips | change_history.target_id | 자동 번호 | 생성된 employee_business_trip_id | 가정 |
| POST /employee-business-trips | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-business-trips | change_history.change_content | 계산 | 등록 내용 | 가정 |
| POST /employee-business-trips | employeeBusinessTripId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| PATCH /employee-business-trips/{employeeBusinessTripId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /employee-business-trips/{employeeBusinessTripId} | change_history.target_type | 고정값 | employee_business_trip | 가정 |
| PATCH /employee-business-trips/{employeeBusinessTripId} | change_history.target_id | 다른 테이블 | 수정한 employee_business_trip.employee_business_trip_id | 가정 |
| PATCH /employee-business-trips/{employeeBusinessTripId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /employee-business-trips/{employeeBusinessTripId} | change_history.change_content | 계산 | 변경 전후 값 | 원문 |
| PATCH /employee-business-trips/{employeeBusinessTripId} | employeeBusinessTripId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| DELETE /employee-business-trips/{employeeBusinessTripId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /employee-business-trips/{employeeBusinessTripId} | change_history.target_type | 고정값 | employee_business_trip | 가정 |
| DELETE /employee-business-trips/{employeeBusinessTripId} | change_history.target_id | 다른 테이블 | 삭제한 employee_business_trip.employee_business_trip_id | 가정 |
| DELETE /employee-business-trips/{employeeBusinessTripId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /employee-business-trips/{employeeBusinessTripId} | change_history.change_content | 계산 | 삭제 내용 | 가정 |
| GET /personnel-appointments | personnelAppointmentId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /education-attendees | educationAttendeeId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /upload-histories/personnel-records | upload_history.uploader_id | 현재 사용자 | - | 원문 |
| POST /upload-histories/personnel-records | upload_history.target_business | 고정값 | PERSONNEL_RECORD | 원문 |
| POST /upload-histories/personnel-records | upload_history.file_name | 계산 | 업로드 파일 원본 이름 | 가정 |
| POST /upload-histories/personnel-records | upload_history.uploaded_at | 현재 시각 | - | 가정 |
| POST /upload-histories/personnel-records | upload_history.total_count | 계산 | 파일의 데이터 행 수 | 가정 |
| POST /upload-histories/personnel-records | upload_history.success_count | 계산 | 반영된 행 수 | 가정 |
| POST /upload-histories/personnel-records | upload_history.error_count | 계산 | 오류 행 수 | 가정 |
| POST /upload-histories/personnel-records | upload_history.error_detail | 계산 | 오류 행별 사유 | 가정 |
| POST /upload-histories/personnel-records | upload_history.process_mode | 고정값 | EXCLUDE_ERROR | 원문 |
| POST /upload-histories/personnel-records | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /upload-histories/personnel-records | change_history.target_type | 고정값 | personnel_record | 가정 |
| POST /upload-histories/personnel-records | change_history.target_id | 다른 테이블 | 반영된 personnel_record.personnel_record_id | 가정 |
| POST /upload-histories/personnel-records | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /upload-histories/personnel-records | change_history.change_content | 계산 | 반영 행별 변경 내용 | 원문 |
| POST /upload-histories/personnel-records | uploadHistoryId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /leave-of-absence-requests | leaveOfAbsenceRequestId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /leave-of-absence-requests | leave_of_absence_request.employee_id | 현재 사용자 | - | 가정 |
| POST /leave-of-absence-requests | leave_of_absence_request.status | 고정값 | 신청 | 원문 |
| POST /leave-of-absence-requests | leaveOfAbsenceRequestId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | leave_of_absence_request.reviewer_id | 현재 사용자 | - | 원문 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | leave_of_absence_request.reviewed_at | 현재 시각 | - | 원문 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | change_history.target_type | 고정값 | personnel_record | 가정 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | change_history.target_id | 다른 테이블 | personnel_record.personnel_record_id, 신청자의 인사기록카드 행 | 가정 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | change_history.change_content | 계산 | 승인된 휴직·단축근무 정보 | 원문 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | notification.recipient_id | 다른 테이블 | leave_of_absence_request.employee_id, 해당 신청 행 | 원문 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | notification.channel | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | notification.title | 계산 | 처리 결과(승인/반려) 안내 문구 | 가정 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | notification.read_status | 고정값 | 안읽음 | 가정 |
| POST /leave-of-absence-requests/{leaveOfAbsenceRequestId}/review | appliedPersonnelRecordId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /personnel-appointments/{personnelAppointmentId}/approve | personnel_appointment.processed_by | 현재 사용자 | - | 원문 |
| POST /personnel-appointments/{personnelAppointmentId}/approve | personnel_appointment.processed_at | 현재 시각 | - | 가정 |
| POST /personnel-appointments/{personnelAppointmentId}/approve | personnel_appointment.status | 고정값 | 승인 | 원문 |
| POST /personnel-appointments/{personnelAppointmentId}/reject | personnel_appointment.processed_by | 현재 사용자 | - | 원문 |
| POST /personnel-appointments/{personnelAppointmentId}/reject | personnel_appointment.processed_at | 현재 시각 | - | 가정 |
| POST /personnel-appointments/{personnelAppointmentId}/reject | personnel_appointment.status | 고정값 | 반려 | 원문 |
| POST /personnel-appointments | personnel_appointment.status | 고정값 | 신청 | 가정 |
| PATCH /personnel-appointments/{personnelAppointmentId}/status | personnel_appointment.processed_by | 현재 사용자 | - | 가정 |
| PATCH /personnel-appointments/{personnelAppointmentId}/status | personnel_appointment.processed_at | 현재 시각 | - | 가정 |
| POST /personnel-appointments/{personnelAppointmentId}/process | personnel_appointment.processed_by | 현재 사용자 | - | 원문 |
| POST /personnel-appointments/{personnelAppointmentId}/process | personnel_appointment.processed_at | 현재 시각 | - | 가정 |
| POST /personnel-appointments/{personnelAppointmentId}/process | personnel_appointment.status | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /personnel-appointments/{personnelAppointmentId}/repost-announcement | board_post.author_id | 현재 사용자 | - | 가정 |
| POST /personnel-appointments/{personnelAppointmentId}/repost-announcement | board_post.post_type | 고정값 | 공지 | 원문 |
| POST /personnel-appointments/{personnelAppointmentId}/repost-announcement | board_post.title | 계산 | 발령 내용으로 공고 제목 생성 | 가정 |
| POST /personnel-appointments/{personnelAppointmentId}/repost-announcement | board_post.content | 계산 | 발령 내용 중 공고 목적 항목만 포함 | 원문 |
| POST /personnel-appointments/{personnelAppointmentId}/repost-announcement | board_post.visibility_scope | 고정값 | 전체 | 가정 |
| GET /personnel-appointment-histories/summary | count | 계산 | 발령 구분별 이력 건수 합계 | 가정 |
| POST /personnel-appointment-reports | reportType | 계산 | 요청 보고서 종류 | 가정 |
| POST /personnel-appointment-reports | items | 계산 | 승진현황은 appointment_type이 승진인 이력 기준 | 원문 |
| POST /personnel-appointment-reports | personnel_appointment.appointment_type | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /personnel-appointment-reports | personnel_appointment.appointment_date | 현재 시각 | - | 가정 |
| POST /personnel-appointment-reports | personnel_appointment.status | 고정값 | 신청 | 가정 |
| GET /personnel-record-items | items | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /personnel-status | serviceYears | 계산 | 현재 일자 - personnel_record.hire_date 를 연 단위로 산정 | 원문 |
| GET /personnel-status | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /personnel-status | personal_info_access_log.target_info_type | 고정값 | 임직원 현황 | 가정 |
| GET /personnel-status | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| PATCH /education-courses/{educationCourseId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /education-courses/{educationCourseId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /education-attendees/{educationAttendeeId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /education-attendees/{educationAttendeeId} | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /education-result-reports | education_result_report.reported_at | 현재 시각 | - | 가정 |
| POST /education-applications | education_application.employee_id | 현재 사용자 | - | 원문 |
| POST /education-applications | education_application.status | 고정값 | 신청 | 원문 |
| POST /education-applications | notification.recipient_id | 다른 테이블 | 승인권자 임직원 (employee.employee_id) | 가정 |
| POST /education-applications/{educationApplicationId}/approve | education_application.status | 고정값 | 승인 | 원문 |
| POST /education-applications/{educationApplicationId}/approve | education_attendee.education_session_id | 다른 테이블 | education_application.education_session_id (해당 신청) | 원문 |
| POST /education-applications/{educationApplicationId}/approve | education_attendee.employee_id | 다른 테이블 | education_application.employee_id (해당 신청) | 원문 |
| POST /education-applications/{educationApplicationId}/approve | notification.recipient_id | 다른 테이블 | education_application.employee_id (해당 신청) | 원문 |
| POST /education-applications/{educationApplicationId}/reject | education_application.status | 고정값 | 반려 | 원문 |
| POST /education-applications/{educationApplicationId}/reject | notification.recipient_id | 다른 테이블 | education_application.employee_id (해당 신청) | 원문 |
| POST /education-applications/{educationApplicationId}/cancel-approval | education_application.status | 고정값 | 승인 취소 | 원문 |
| POST /education-applications/{educationApplicationId}/cancel-approval | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /education-applications/{educationApplicationId}/cancel-approval | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /education-evaluations | education_evaluation.evaluated_at | 현재 시각 | - | 가정 |
| PATCH /education-evaluations/{educationEvaluationId} | education_evaluation.evaluated_at | 현재 시각 | - | 가정 |
| POST /certificate-types | certificate_type.approval_required | 고정값 | false | 가정 |
| POST /certificate-requests | certificate_request.employee_id | 현재 사용자 | - | 원문 |
| POST /certificate-requests | certificate_request.status | 고정값 | 신청 | 원문 |
| POST /certificate-requests/{certificateRequestId}/approve | certificate_request.status | 고정값 | 승인 | 원문 |
| POST /certificate-requests/{certificateRequestId}/approve | certificate_request.issue_number | 자동 번호 | certificate_type 채번 규칙(접두어·연도·일련번호 자릿수)에 따라 부여 | 원문 |
| POST /certificate-requests/{certificateRequestId}/reject | certificate_request.status | 고정값 | 반려 | 원문 |
| GET /certificate-requests | issuedDate | 다른 테이블 | certificate_request.updated_at (승인된 행) | 가정 |
| GET /certificate-requests | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /certificate-requests | personal_info_access_log.target_info_type | 고정값 | 증명서 발급 정보 | 가정 |
| GET /certificate-requests | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| POST /attendance-standards | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /attendance-standards | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /attendance-standards/{attendanceStandardId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /attendance-standards/{attendanceStandardId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /attendance-standards/{attendanceStandardId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /attendance-standards/{attendanceStandardId} | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /attendance-items | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /attendance-items | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /attendance-items/{attendanceItemId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /attendance-items/{attendanceItemId} | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-attendance-settings | employee_attendance_setting.apply_start_date | 현재 시각 | 적용 시작일 미입력 시 당일 | 가정 |
| POST /employee-attendance-settings | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-attendance-settings | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-attendance-settings | change_history.change_content | 계산 | 등록 내용 요약 | 원문 |
| PUT /employee-attendance-settings/{employeeAttendanceSettingId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PUT /employee-attendance-settings/{employeeAttendanceSettingId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PUT /employee-attendance-settings/{employeeAttendanceSettingId} | change_history.change_content | 계산 | 변경 전후 내용 | 원문 |
| POST /commute-check-settings | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /commute-check-settings | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /commute-check-settings | change_history.change_content | 계산 | 등록 내용 요약 | 원문 |
| PUT /commute-check-settings/{commuteCheckSettingId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PUT /commute-check-settings/{commuteCheckSettingId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PUT /commute-check-settings/{commuteCheckSettingId} | change_history.change_content | 계산 | 변경 전후 내용 | 원문 |
| POST /allowed-ips | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /allowed-ips | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /allowed-ips | change_history.change_content | 계산 | 등록 내용 요약 | 원문 |
| PUT /allowed-ips/{allowedIpId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PUT /allowed-ips/{allowedIpId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PUT /allowed-ips/{allowedIpId} | change_history.change_content | 계산 | 변경 전후 내용 | 원문 |
| DELETE /allowed-ips/{allowedIpId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| DELETE /allowed-ips/{allowedIpId} | change_history.changed_at | 현재 시각 | - | 원문 |
| DELETE /allowed-ips/{allowedIpId} | change_history.change_content | 계산 | 삭제 내용 요약 | 원문 |
| POST /annual-leave-plans | annual_leave_plan.approval_status | 고정값 | 신청 | 가정 |
| PUT /annual-leave-plans/{annualLeavePlanId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PUT /annual-leave-plans/{annualLeavePlanId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PUT /annual-leave-plans/{annualLeavePlanId} | change_history.change_content | 계산 | 변경 전후 내용 | 원문 |
| POST /attendance-requests | attendance_request.employee_id | 현재 사용자 | - | 원문 |
| POST /attendance-requests | attendance_request.approval_status | 고정값 | 신청 | 원문 |
| POST /attendance-requests | attendance_request.approval_document_id | 다른 테이블 | 결재 상신으로 생성된 approval_document.approval_document_id | 원문 |
| POST /attendance-requests/{attendanceRequestId}/cancel | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /attendance-requests/{attendanceRequestId}/cancel | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /commute-records | commute_record.employee_id | 현재 사용자 | - | 가정 |
| POST /commute-records | commute_record.is_linked | 고정값 | false | 가정 |
| POST /commute-records | commute_record.is_closed | 고정값 | false | 가정 |
| POST /commute-records/receive-linked | commute_record.is_linked | 고정값 | true | 가정 |
| POST /commute-records/receive-linked | commute_record.is_closed | 고정값 | false | 가정 |
| POST /commute-records/receive-linked | link_log.link_target | 고정값 | COMMUTE_SYSTEM | 가정 |
| POST /commute-records/receive-linked | link_log.status | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /commute-records/receive-linked | link_log.requested_at | 현재 시각 | - | 가정 |
| POST /attendance-requests/adjust | attendance_request.end_date | 다른 테이블 | 요청의 조정 일자와 동일 | 가정 |
| POST /attendance-requests/adjust | attendance_request.approval_status | 고정값 | 승인 | 가정 |
| POST /attendance-requests/adjust | adjustedAt | 현재 시각 | - | 원문 |
| GET /attendance-status/monthly | month | 계산 | 근태 일자의 연월 | 가정 |
| GET /attendance-status/monthly | attendanceDays | 계산 | 기간 내 근태 일수 합계 | 가정 |
| GET /attendance-status/summary | count | 계산 | 유형별 근태 건수 합계 | 가정 |
| GET /work-hours/weekly | weekStartDate | 계산 | 근무일자가 속한 주의 시작일 | 가정 |
| GET /work-hours/weekly | weeklyWorkHours | 계산 | 주간 (check_out_at - check_in_at) 합계 | 원문 |
| GET /work-hours/weekly | isOverLimit | 계산 | weeklyWorkHours > system_setting.setting_value(법정 기준시간 설정 행) | 원문 |
| GET /work-hours/weekly | hasMissingRecord | 계산 | 출근 또는 퇴근 시각이 없는 기록 존재 여부 | 원문 |
| GET /work-hours/type-summary | count | 계산 | 유형별 근태 건수 | 가정 |
| GET /work-hours/type-summary | days | 계산 | 유형별 (end_date - start_date + 1) 합계 | 가정 |
| GET /attendance-closings/preview | unapprovedCount | 계산 | 기간 내 attendance_request.approval_status가 신청인 건수 | 가정 |
| GET /attendance-closings/preview | recordCount | 계산 | 기간 내 commute_record 건수 | 가정 |
| POST /attendance-closings | attendance_closing.status | 고정값 | 마감 | 원문 |
| POST /attendance-closings | attendance_closing.closed_at | 현재 시각 | - | 원문 |
| POST /attendance-closings/{attendanceClosingId}/cancel | attendance_closing.status | 고정값 | 마감 취소 | 원문 |
| POST /attendance-closings/{attendanceClosingId}/cancel | attendance_closing.cancelled_at | 현재 시각 | - | 원문 |
| POST /attendance-requests/{attendanceRequestId}/submit | attendance_request.approval_document_id | 다른 테이블 | approval_document.approval_document_id, 상신으로 생성된 문서 | 가정 |
| POST /annual-leaves/generate | annual_leave.is_confirmed | 고정값 | false | 가정 |
| POST /annual-leaves/generate | annual_leave.leave_grant_rule_id | 다른 테이블 | leave_grant_rule.leave_grant_rule_id, 사용 상태인 기준 행 | 원문 |
| POST /annual-leaves/confirm | annual_leave.is_confirmed | 고정값 | true | 원문 |
| POST /annual-leaves/confirm | annual_leave.confirmed_at | 현재 시각 | - | 가정 |
| POST /annual-leaves/{annualLeaveId}/adjust | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /annual-leaves/{annualLeaveId}/adjust | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /annual-leaves/{annualLeaveId}/adjust | change_history.target_type | 고정값 | annual_leave | 가정 |
| POST /annual-leaves/{annualLeaveId}/adjust | change_history.target_id | 다른 테이블 | annual_leave.annual_leave_id, 경로의 연차 행 | 가정 |
| POST /annual-leaves/{annualLeaveId}/adjust | change_history.change_content | 계산 | 조정 전후 일수와 adjustDays 기록 | 가정 |
| POST /annual-leave-settlements | annual_leave_settlement.unused_days | 계산 | annual_leave.remaining_days | 가정 |
| POST /annual-leave-settlements | annual_leave_settlement.unused_allowance | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /annual-leave-settlements | annual_leave_settlement.settled_at | 현재 시각 | - | 가정 |
| GET /annual-leaves/summary | monthlyUsedDays | 계산 | 승인된 근태(attendance_request.approval_status=승인)에 연결된 leave_usage.used_days를 used_date의 월별로 합산 | 원문 |
| POST /payroll-codes | payroll_code.use_yn | 고정값 | 사용 | 가정 |
| PATCH /payroll-codes/{payrollCodeId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /payroll-codes/{payrollCodeId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PUT /payroll-account-mappings/{payrollAccountMappingId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PUT /payroll-account-mappings/{payrollAccountMappingId} | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /payroll-items | payroll_item.use_yn | 고정값 | 사용 | 가정 |
| PATCH /payroll-items/{payrollItemId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /payroll-items/{payrollItemId} | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /withholding-adjustment-requests | withholding_adjustment_request.approval_status | 고정값 | 신청 | 가정 |
| POST /withholding-adjustment-requests | withholding_adjustment_request.adjustment_amount_enc | 계산 | adjustmentAmount를 암호화하여 저장 | 원문 |
| POST /withholding-adjustment-requests | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| POST /withholding-adjustment-requests | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /withholding-adjustment-requests | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /withholding-adjustment-requests | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| PATCH /withholding-adjustment-requests/{withholdingAdjustmentRequestId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /withholding-adjustment-requests/{withholdingAdjustmentRequestId} | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /payrolls/calculate | payroll.total_payment_amount_enc | 계산 | 지급항목 설정(payroll_item)에 따른 지급 합계를 암호화 | 원문 |
| POST /payrolls/calculate | payroll.total_deduction_amount_enc | 계산 | 공제항목 설정(payroll_item)에 따른 공제 합계를 암호화 | 원문 |
| POST /payrolls/calculate | payroll.net_pay_amount_enc | 계산 | 지급 합계 - 공제 합계를 암호화 | 가정 |
| POST /payrolls/calculate | payroll.closing_status | 고정값 | 신청 | 가정 |
| POST /payrolls/calculate | taxableTotal | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /payrolls/close | payroll.closing_status | 고정값 | 마감 | 원문 |
| POST /payrolls/cancel-close | payroll.closing_status | 고정값 | 마감 취소 | 원문 |
| GET /payroll-transfers | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /payroll-transfers | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /payroll-transfers | personal_info_access_log.target_info_type | 고정값 | 급여이체 계좌정보 | 가정 |
| GET /payroll-transfers | bankName | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /payroll-transfers | accountNumber | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /employee-wages/bulk-update | employee_wage.wage_amount_enc | 계산 | 현재 책정임금에 변경 금액 가산 또는 변경 비율 적용 후 암호화 | 가정 |
| POST /employee-wages/bulk-update | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /employee-wages/bulk-update | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /employee-wages/bulk-update | change_history.target_type | 고정값 | employee_wage | 가정 |
| POST /employee-wages/bulk-update | change_history.target_id | 다른 테이블 | employee_wage.employee_wage_id, 변경된 행 | 가정 |
| POST /employee-wages/bulk-update | change_history.change_content | 계산 | 변경 전후 책정임금 내용 | 원문 |
| POST /employee-wages/bulk-update | updatedCount | 계산 | 변경된 employee_wage 행 수 | 가정 |
| GET /employee-wages | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /employee-wages | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /employee-wages | personal_info_access_log.target_info_type | 고정값 | 책정임금 | 가정 |
| POST /daily-workers | daily_worker.resident_registration_no_enc | 계산 | 요청 주민등록번호를 암호화 | 원문 |
| GET /daily-workers | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /daily-workers | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /daily-workers | personal_info_access_log.target_info_type | 고정값 | 일용직 주민등록번호 | 가정 |
| POST /daily-worker-payments | daily_worker_payment.payment_amount | 계산 | daily_worker.daily_wage × workDays | 가정 |
| PUT /severance-settings | system_setting.category | 고정값 | 퇴직금 | 가정 |
| PUT /severance-settings | system_setting.setting_key | 고정값 | SEVERANCE_BASIS | 가정 |
| POST /severance-calculations | severance_calculation.severance_amount_enc | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /severance-calculations | severance_calculation.estimated_amount_enc | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /severance-calculations | severance_calculation.retirement_basis | 다른 테이블 | system_setting.setting_value, 퇴직기준 행 | 가정 |
| POST /payslips/send | successCount | 계산 | 발송 성공 건수 합계 | 가정 |
| POST /payslips/send | failureCount | 계산 | 발송 실패 건수 합계 | 가정 |
| POST /payslips/send | failures | 계산 | 실패 임직원과 사유 목록 | 원문 |
| POST /payroll-simulations | expectedPay | 계산 | 현재 급여 × (1 + 인상률) | 가정 |
| POST /payroll-simulations | totalLaborCost | 계산 | 대상 임직원 예상 급여 합계 | 가정 |
| POST /payroll-simulations | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| POST /payroll-simulations | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| POST /payroll-simulations | personal_info_access_log.target_info_type | 고정값 | 급여 | 가정 |
| POST /payroll-simulations | employeeId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /payroll-runs | payroll_run.is_closed | 고정값 | false | 가정 |
| POST /payroll-runs | payroll_run.journal_status | 고정값 | UNPROCESSED | 가정 |
| GET /payroll-runs | targetCount | 계산 | 해당 지급일(pay_date)의 payroll 행 수 | 가정 |
| POST /payrolls | payroll.closing_status | 고정값 | 신청 | 가정 |
| POST /payrolls/annual-bulk | items | 계산 | 임직원별 월별 급여 금액의 연간 합계 | 원문 |
| POST /payrolls/annual-bulk | errorCount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /upload-histories | upload_history.uploader_id | 현재 사용자 | - | 원문 |
| POST /upload-histories | upload_history.uploaded_at | 현재 시각 | - | 원문 |
| POST /payroll-runs/{payrollRunId}/create-journal-entry | journal_entry.expense_resolution_id | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /payroll-runs/{payrollRunId}/create-journal-entry | journal_entry.entry_date | 현재 시각 | - | 가정 |
| POST /payroll-runs/{payrollRunId}/create-journal-entry | journal_entry.status | 고정값 | 신청 | 가정 |
| POST /payroll-runs/{payrollRunId}/create-journal-entry | payroll_run.journal_status | 고정값 | PROCESSED | 원문 |
| POST /payroll-runs/{payrollRunId}/create-journal-entry | payroll_run.journal_entry_id | 다른 테이블 | 생성된 journal_entry.journal_entry_id | 가정 |
| PATCH /salary-steps/{salaryStepId} | change_history.changer_id | 현재 사용자 | - | 원문 |
| PATCH /salary-steps/{salaryStepId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /salary-steps/{salaryStepId} | change_history.target_type | 고정값 | salary_step | 가정 |
| PATCH /salary-steps/{salaryStepId} | change_history.target_id | 다른 테이블 | 수정한 salary_step.salary_step_id | 가정 |
| PATCH /salary-steps/{salaryStepId} | change_history.change_content | 계산 | 수정 전후 값 비교 내용 | 원문 |
| POST /daily-worker-payments/bulk | successCount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /daily-worker-payments/bulk | errorCount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /daily-worker-payments/bulk | errors | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /daily-worker-payments | accountNumber | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /daily-worker-payments | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /daily-worker-payments | personal_info_access_log.target_info_type | 고정값 | 일용직 급여이체 계좌 | 가정 |
| GET /daily-worker-payments | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| POST /income-certificates/generate | income_certificate.certificate_category | 고정값 | DAILY_WAGE | 원문 |
| POST /income-certificates/generate | income_certificate.document_type | 고정값 | PAYMENT_STATEMENT 및 WITHHOLDING_RECEIPT 각 1건 | 원문 |
| POST /income-certificates/generate | income_certificate.total_payment_amount | 계산 | 기간 내 daily_worker_payment.payment_amount 합계 | 가정 |
| POST /income-certificates/generate | income_certificate.withheld_tax_amount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /income-certificates/generate | income_certificate.issued_at | 현재 시각 | - | 가정 |
| POST /income-certificates/generate | generatedCount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /income-certificates | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /income-certificates | personal_info_access_log.target_info_type | 고정값 | 일용근로소득 지급명세서 | 가정 |
| GET /income-certificates | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| POST /income-certificates | income_certificate.certificate_category | 고정값 | RETIREMENT_INCOME | 원문 |
| POST /income-certificates | income_certificate.document_type | 고정값 | WITHHOLDING_RECEIPT | 원문 |
| POST /income-certificates | income_certificate.issued_at | 현재 시각 | - | 가정 |
| POST /income-certificates | income_certificate.resident_number_enc | 다른 테이블 | personnel_record.resident_number_enc, 대상 임직원 행 | 가정 |
| GET /payrolls | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /payrolls | personal_info_access_log.target_info_type | 고정값 | 급여 | 가정 |
| GET /payrolls | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /payrolls/{payrollId} | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /payrolls/{payrollId} | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /payrolls/summary | employeeCount | 계산 | 조건에 맞는 payroll 행 수 | 가정 |
| GET /payrolls/summary | totalPaymentAmount | 계산 | 복호화한 payroll.total_payment_amount_enc 합계 | 가정 |
| GET /payrolls/summary | totalDeductionAmount | 계산 | 복호화한 payroll.total_deduction_amount_enc 합계 | 가정 |
| GET /payrolls/summary | netPayAmount | 계산 | 복호화한 payroll.net_pay_amount_enc 합계 | 가정 |
| GET /payrolls/summary | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /payrolls/summary | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /payroll-analyses | changeAmount | 계산 | 당기 총지급액 - 직전 지급일 총지급액 | 가정 |
| GET /payroll-analyses | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /payroll-analyses | personal_info_access_log.target_info_type | 고정값 | 급여 | 가정 |
| GET /payroll-analyses | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| POST /social-insurance-reports | social_insurance_report.created_by_id | 현재 사용자 | - | 원문 |
| POST /social-insurance-reports | social_insurance_report.resident_number_enc | 다른 테이블 | personnel_record.resident_number_enc, 대상 임직원 행 | 원문 |
| POST /social-insurance-reports/{socialInsuranceReportId}/print | social_insurance_report.printed_at | 현재 시각 | - | 가정 |
| GET /social-insurance-deductions | totalDeductionAmount | 계산 | 조회된 payroll_detail.amount 합계 | 원문 |
| GET /social-insurance-deductions | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /social-insurance-deductions | personal_info_access_log.target_info_type | 고정값 | 사회보험 공제내역 | 가정 |
| GET /social-insurance-deductions | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| POST /social-insurance-grades/change | social_insurance_grade.changed_by_id | 현재 사용자 | - | 원문 |
| POST /social-insurance-grades/change | social_insurance_grade.changed_at | 현재 시각 | - | 원문 |
| POST /social-insurance-grades/change | social_insurance_grade.change_content | 계산 | 변경 전 등급 → 변경 후 등급, 적용 시작월 | 가정 |
| POST /social-insurance-grades/change | previousGrade | 다른 테이블 | social_insurance_grade.grade, 대상 임직원·보험 종류의 현재 행 | 원문 |
| POST /social-insurance-grades/change | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /social-insurance-grades/change | change_history.target_type | 고정값 | social_insurance_grade | 가정 |
| POST /social-insurance-grades/change | change_history.target_id | 다른 테이블 | social_insurance_grade.social_insurance_grade_id, 변경된 행 | 가정 |
| POST /social-insurance-grades/change | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /social-insurance-grades/change | change_history.change_content | 계산 | 변경 전·후 등급과 적용 시작월 | 원문 |
| POST /tax-filings/generate | tax_filing.filing_type | 고정값 | WITHHOLDING_STATUS, 학자금상환 대상자가 있으면 TUITION_REPAYMENT 추가 | 원문 |
| POST /tax-filings/generate | tax_filing.filing_status | 고정값 | DRAFT | 가정 |
| POST /tax-filings/generate | tax_filing.total_amount | 계산 | 대상 기간 payroll 급여 데이터 집계 | 원문 |
| POST /tax-filings/{taxFilingId}/submit | tax_filing.filing_status | 고정값 | 접수 결과에 따라 SUCCESS 또는 FAILURE | 원문 |
| POST /tax-filings/{taxFilingId}/submit | tax_filing.filed_at | 현재 시각 | - | 가정 |
| POST /tax-filings/{taxFilingId}/submit | tax_filing.result_message | 다른 테이블 | 국세청 회신 접수 결과 | 원문 |
| POST /tax-filings/{taxFilingId}/submit | link_log.requester_id | 현재 사용자 | - | 가정 |
| POST /tax-filings/{taxFilingId}/submit | link_log.link_target | 고정값 | NTS_EFILING | 가정 |
| POST /tax-filings/{taxFilingId}/submit | link_log.status | 고정값 | REQUESTED 후 연계 결과에 따라 SUCCESS 또는 FAILED | 가정 |
| POST /tax-filings/{taxFilingId}/submit | link_log.requested_at | 현재 시각 | - | 가정 |
| POST /tax-filings/{taxFilingId}/submit | electronicFileName | 계산 | 국세청 규격에 따른 전자파일 생성 결과 | 가정 |
| POST /tax-filings/generate-local | tax_filing.filing_status | 고정값 | DRAFT | 가정 |
| POST /tax-filings/generate-local | tax_filing.total_amount | 계산 | 급여 원천 데이터 기준 집계 (법인지방소득세는 재무·결산 데이터 참조) | 원문 |
| POST /income-certificates/generate-daily | income_certificate.certificate_category | 고정값 | DAILY_WAGE | 원문 |
| POST /income-certificates/generate-daily | income_certificate.document_type | 고정값 | PAYMENT_STATEMENT 및 WITHHOLDING_RECEIPT | 가정 |
| POST /income-certificates/generate-daily | income_certificate.period_start | 계산 | 지급연월의 첫날 | 가정 |
| POST /income-certificates/generate-daily | income_certificate.period_end | 계산 | 지급연월의 말일 | 가정 |
| POST /income-certificates/generate-daily | income_certificate.total_payment_amount | 계산 | daily_worker_payment.payment_amount 합계 | 원문 |
| POST /income-certificates/generate-daily | income_certificate.withheld_tax_amount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /income-certificates/generate-daily | income_certificate.resident_number_enc | 다른 테이블 | daily_worker.resident_registration_no_enc, 대상 일용근로자 행 | 가정 |
| POST /income-certificates/generate-retirement | income_certificate.certificate_category | 고정값 | RETIREMENT_INCOME | 원문 |
| POST /income-certificates/generate-retirement | income_certificate.document_type | 고정값 | WITHHOLDING_RECEIPT | 가정 |
| POST /income-certificates/generate-retirement | income_certificate.period_start | 다른 테이블 | employee 입사일 정보 없음, 귀속 시작일은 퇴직 기준으로 산정 | 가정 |
| POST /income-certificates/generate-retirement | income_certificate.period_end | 다른 테이블 | severance_calculation.retirement_date, 대상 퇴직자의 행 | 가정 |
| POST /income-certificates/generate-retirement | income_certificate.total_payment_amount | 다른 테이블 | severance_calculation.severance_amount_enc 복호화 값, 대상 퇴직자의 행 | 가정 |
| POST /income-certificates/generate-retirement | income_certificate.withheld_tax_amount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /income-certificates/generate-retirement | income_certificate.resident_number_enc | 다른 테이블 | employee.resident_no_enc, 대상 퇴직자 행 | 가정 |
| POST /year-end-data | year_end_data.closing_status | 고정값 | 신청 | 가정 |
| POST /year-end-data | year_end_result.determined_tax_amount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /year-end-data | year_end_result.paid_tax_amount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /year-end-data | year_end_result.payable_tax_amount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /tax-filings/submission-summaries | tax_filing.filing_type | 고정값 | SUBMISSION_SUMMARY | 가정 |
| POST /tax-filings/submission-summaries | tax_filing.filing_status | 고정값 | DRAFT | 가정 |
| POST /tax-filings/submission-summaries | tax_filing.total_amount | 계산 | 소득 구분별 income_certificate.total_payment_amount 합계 | 원문 |
| POST /tax-filings/{taxFilingId}/generate-media | fileName | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /tax-filings/simplified-payments | tax_filing.filing_type | 고정값 | SIMPLIFIED_PAYMENT | 가정 |
| POST /tax-filings/simplified-payments | tax_filing.filing_status | 고정값 | DRAFT | 원문 |
| POST /tax-filings/simplified-payments | tax_filing.total_amount | 계산 | 대상 기간 지급 데이터 합계 | 가정 |
| POST /tax-filings/{taxFilingId}/file | tax_filing.filed_at | 현재 시각 | - | 가정 |
| POST /tax-filings/{taxFilingId}/file | link_log.link_target | 고정값 | NTS_EFILING | 가정 |
| POST /tax-filings/{taxFilingId}/file | link_log.status | 계산 | 연계 결과에 따라 SUCCESS 또는 FAILED | 가정 |
| POST /tax-filings/{taxFilingId}/file | link_log.requested_at | 현재 시각 | - | 가정 |
| POST /tax-filings/{taxFilingId}/file | link_log.requester_id | 현재 사용자 | - | 가정 |
| GET /requisitions/budget-status | executionBudgetAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /requisitions/budget-status | carryoverBudgetAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /requisitions/budget-status | totalBudgetAmount | 계산 | 실행예산액 + 이월예산액 | 원문 |
| GET /requisitions/budget-status | executedAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /requisitions/budget-status | budgetBalanceAmount | 계산 | 예산총액 - 집행액 | 원문 |
| POST /requisitions/{requisitionId}/reject | requisition.status | 고정값 | 반려 | 원문 |
| POST /purchase-asset-items | purchase_asset_item.asset_linked | 고정값 | false | 가정 |
| POST /asset-changes | asset_change.is_regular_change | 고정값 | false | 가정 |
| POST /asset-changes | asset_change.changed_by_id | 현재 사용자 | - | 원문 |
| POST /asset-print-logs | asset_print_log.printed_by_id | 현재 사용자 | - | 원문 |
| POST /asset-print-logs | asset_print_log.asset_number | 다른 테이블 | asset.asset_no, 대상 자산 행 | 원문 |
| POST /asset-print-logs | asset_print_log.printed_at | 현재 시각 | - | 원문 |
| POST /asset-print-logs | label | 계산 | 자산번호 기반 QR 또는 바코드 생성 | 원문 |
| POST /asset-inspection-plans | asset_inspection_plan.approval_status | 고정값 | 신청 | 가정 |
| POST /asset-inspection-plans | asset_inspection_plan.progress_status | 고정값 | 진행 | 가정 |
| POST /asset-inspection-plans/{assetInspectionPlanId}/cancel-approval | asset_inspection_plan.approval_status | 고정값 | 승인 취소 | 원문 |
| POST /asset-inspection-plans/{assetInspectionPlanId}/cancel | asset_inspection_plan.progress_status | 고정값 | 취소 | 원문 |
| POST /asset-inspection-plans/{assetInspectionPlanId}/complete | asset_inspection_plan.progress_status | 고정값 | 완료 | 원문 |
| POST /asset-inspection-plans/{assetInspectionPlanId}/link | link_log.requester_id | 현재 사용자 | - | 가정 |
| POST /asset-inspection-plans/{assetInspectionPlanId}/link | link_log.link_target | 고정값 | ASSET_INSPECTION | 원문 |
| POST /asset-inspection-plans/{assetInspectionPlanId}/link | link_log.status | 고정값 | REQUESTED 후 결과에 따라 SUCCESS 또는 FAILED | 가정 |
| POST /asset-inspection-plans/{assetInspectionPlanId}/link | link_log.requested_at | 현재 시각 | - | 가정 |
| POST /menus | menu.display_order | 계산 | 표시 순서 미입력 시 마지막 순서 + 1 | 가정 |
| GET /search-results | title | 다른 테이블 | approval_document.title 또는 board_post.title 또는 attachment.file_name, 일치한 행 | 가정 |
| GET /search-results | resultType | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /search-results | matchLocation | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /search-results | targetId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /portal-widget-settings | portal_widget_setting.employee_id | 현재 사용자 | - | 원문 |
| GET /attachments/{attachmentId}/preview | previewContent | 계산 | attachment.ecm_ref의 파일을 저장소에서 읽어 미리보기 형태로 변환 | 원문 |
| GET /portal | widgets | 다른 테이블 | portal_widget_setting 현재 사용자 행과 approval_form, approval_document, schedule, notification, quick_link, employee 데이터 | 원문 |
| GET /portal | banners | 다른 테이블 | portal_banner 중 use_yn이 사용이고 기간 내인 행 | 가정 |
| GET /menu-usage-logs | menuName | 다른 테이블 | menu.name, menu_usage_log.menu_id가 같은 행 | 원문 |
| POST /menu-usage-logs | menu_usage_log.employee_id | 현재 사용자 | - | 원문 |
| POST /menu-usage-logs | menu_usage_log.used_at | 현재 시각 | - | 원문 |
| POST /menu-usage-logs | menu_usage_log.access_ip | 계산 | 요청의 접속 IP | 가정 |
| PUT /portal-widget-settings | portal_widget_setting.employee_id | 현재 사용자 | - | 원문 |
| POST /personal-menus | personal_menu.employee_id | 현재 사용자 | - | 원문 |
| POST /notifications/mentions | notification.channel | 고정값 | 포털 | 가정 |
| POST /notifications/mentions | notification.read_status | 고정값 | 안읽음 | 원문 |
| POST /notifications/mentions | notification.event_type | 고정값 | 멘션 | 가정 |
| PATCH /notifications/{notificationId}/read | notification.read_status | 고정값 | 읽음 | 원문 |
| PATCH /notifications/{notificationId}/read | notification.read_at | 현재 시각 | - | 원문 |
| GET /notifications/{notificationId} | notification.read_status | 고정값 | 읽음 | 원문 |
| GET /notifications/{notificationId} | notification.read_at | 현재 시각 | - | 원문 |
| POST /notifications/read-all | notification.read_status | 고정값 | 읽음 | 원문 |
| POST /notifications/read-all | notification.read_at | 현재 시각 | - | 원문 |
| POST /notifications/read-all | readCount | 계산 | 변경된 본인 안읽음 알림 행 수 | 원문 |
| POST /approval-forms | approval_form.use_status | 고정값 | 사용 | 가정 |
| POST /approval-documents/{approvalDocumentId}/process | approval_line.processed_at | 현재 시각 | - | 원문 |
| POST /approval-documents/{approvalDocumentId}/process | approval_document.approval_status | 계산 | 결재선 처리 결과에 따라 다음 결재자 전달 시 결재대기, 최종 승인 시 완료 | 가정 |
| POST /approval-documents/{approvalDocumentId}/withdraw | approval_document.approval_status | 고정값 | 회수 | 원문 |
| POST /approval-documents | approval_document.document_no | 자동 번호 | - | 가정 |
| POST /approval-documents | approval_document.drafter_id | 현재 사용자 | - | 원문 |
| POST /approval-documents | approval_document.approval_status | 고정값 | 기안 | 가정 |
| POST /approval-documents | approval_document.submitted_at | 현재 시각 | - | 가정 |
| POST /approval-documents/batch-draft | draftedCount | 계산 | 기안 성공 문서 수 | 가정 |
| POST /approval-documents/batch-draft | results | 계산 | 문서별 문서번호와 처리 상태 | 가정 |
| POST /approval-documents/{approvalDocumentId}/redraft | approval_document.document_no | 자동 번호 | - | 가정 |
| POST /approval-documents/{approvalDocumentId}/redraft | approval_document.approval_form_id | 다른 테이블 | approval_document.approval_form_id, 원본 문서 행 | 원문 |
| POST /approval-documents/{approvalDocumentId}/redraft | approval_document.drafter_id | 현재 사용자 | - | 원문 |
| POST /approval-documents/{approvalDocumentId}/redraft | approval_document.approval_status | 고정값 | 재기안 | 원문 |
| POST /approval-documents/{approvalDocumentId}/redraft | approval_document.submitted_at | 현재 시각 | - | 가정 |
| POST /approval-documents/{approvalDocumentId}/designate-security | change_history.changer_id | 현재 사용자 | - | 원문 |
| POST /approval-documents/{approvalDocumentId}/designate-security | change_history.target_type | 고정값 | approval_document | 가정 |
| POST /approval-documents/{approvalDocumentId}/designate-security | change_history.target_id | 다른 테이블 | approval_document.approval_document_id (경로의 문서) | 가정 |
| POST /approval-documents/{approvalDocumentId}/designate-security | change_history.change_type | 고정값 | 보안문서 지정 | 가정 |
| POST /approval-documents/{approvalDocumentId}/designate-security | change_history.changed_at | 현재 시각 | - | 원문 |
| POST /approval-documents/{approvalDocumentId}/designate-security | securityDesignated | 고정값 | true | 가정 |
| POST /notifications/{notificationId}/read | notification.read_status | 고정값 | 읽음 | 원문 |
| POST /notifications/{notificationId}/read | notification.read_at | 현재 시각 | - | 원문 |
| POST /attachments | attachment.uploader_id | 현재 사용자 | - | 원문 |
| POST /attachments | attachment.file_name | 계산 | 업로드 파일의 원본 파일명 | 가정 |
| POST /approval-documents/{approvalDocumentId}/submit | approval_document.approval_status | 고정값 | 결재대기 | 원문 |
| POST /approval-documents/{approvalDocumentId}/submit | approval_document.submitted_at | 현재 시각 | - | 원문 |
| POST /approval-forms/convert | converted | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /approval-handovers | approval_handover.handed_over_at | 현재 시각 | - | 가정 |
| POST /approval-handovers | approval_handover.handled_by_id | 현재 사용자 | - | 원문 |
| POST /approval-handovers | handedOverCount | 계산 | 이관된 approval_document 행 수 | 가정 |
| GET /attachments | downloadAllowed | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /attachments | previewAvailable | 계산 | file_extension이 hwp·doc·docx·xls·xlsx·ppt·pptx 중 하나인지 여부 | 원문 |
| GET /attachments/{attachmentId}/download | file | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /personnel-records/me | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /personnel-records/me | personal_info_access_log.target_employee_id | 현재 사용자 | - | 원문 |
| GET /personnel-records/me | personal_info_access_log.target_info_type | 고정값 | 인사기록카드 | 가정 |
| GET /personnel-records/me | personal_info_access_log.access_type | 고정값 | 조회 | 가정 |
| GET /personnel-records/me | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| POST /attendance-requests/{attendanceRequestId}/consent | consentedAt | 현재 시각 | - | 원문 |
| GET /attendance-summaries | count | 계산 | 조회 월의 본인 근태 건을 유형·상태별로 집계 | 가정 |
| GET /attendance-summaries | consentedAt | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /severance-simulations | estimatedSeverancePay | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /severance-simulations | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /severance-simulations | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /year-end-data | personal_info_access_log.employee_id | 현재 사용자 | - | 가정 |
| GET /year-end-data | personal_info_access_log.accessed_at | 현재 시각 | - | 가정 |
| POST /year-end-data/{yearEndDataId}/submit | year_end_data.closing_status | 고정값 | 신청 | 가정 |
| POST /requisitions/{requisitionId}/submit | requisition.status | 고정값 | 결재대기 | 가정 |
| POST /requisitions/{requisitionId}/submit | requisition.approval_document_id | 다른 테이블 | approval_document.approval_document_id (S3 상신으로 생성된 문서) | 가정 |
| GET /budget-controls | allocatedAmount | 계산 | 조정 반영 실행예산 합계 (budget_execution.execution_amount + 승인된 budget_adjustment.adjustment_amount) | 가정 |
| GET /budget-controls | executedAmount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /budget-controls | balanceAmount | 계산 | allocatedAmount - executedAmount (통제 주기 기준) | 가정 |
| GET /budget-controls | executable | 계산 | requestAmount <= balanceAmount | 원문 |
| POST /expense-resolutions/{expenseResolutionId}/reflect-budget | journal_entry.expense_resolution_id | 고정값 | 경로의 expenseResolutionId | 원문 |
| POST /expense-resolutions/{expenseResolutionId}/reflect-budget | journal_entry.entry_date | 현재 시각 | - | 가정 |
| POST /expense-resolutions/{expenseResolutionId}/reflect-budget | journal_entry.status | 고정값 | 신청 | 가정 |
| POST /expense-resolutions/{expenseResolutionId}/reflect-budget | link_log.link_target | 고정값 | LEGACY_ERP | 원문 |
| POST /expense-resolutions/{expenseResolutionId}/reflect-budget | link_log.status | 고정값 | REQUESTED | 가정 |
| POST /expense-resolutions/{expenseResolutionId}/reflect-budget | link_log.requested_at | 현재 시각 | - | 가정 |
| POST /expense-resolutions/{expenseResolutionId}/submit | expense_resolution.status | 고정값 | 결재대기 | 가정 |
| POST /expense-resolutions/{expenseResolutionId}/submit | expense_resolution.approval_document_id | 다른 테이블 | S3 결재 연계로 생성된 approval_document.approval_document_id | 원문 |
| GET /resource-reservations/{resourceReservationId} | attachments | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /resource-reservations | resource_reservation.reserver_id | 현재 사용자 | - | 원문 |
| POST /resource-reservations | resource_reservation.status | 계산 | resource.approval_required가 '사용'이면 신청, '미사용'이면 승인 | 원문 |
| POST /resource-reservations/{resourceReservationId}/approve | resource_reservation.status | 고정값 | 승인 | 원문 |
| POST /resource-reservations/{resourceReservationId}/approve | resource_reservation.processed_by | 현재 사용자 | - | 원문 |
| POST /resource-reservations/{resourceReservationId}/approve | resource_reservation.processed_at | 현재 시각 | - | 원문 |
| POST /resource-reservations/{resourceReservationId}/reject | resource_reservation.status | 고정값 | 반려 | 원문 |
| POST /resource-reservations/{resourceReservationId}/reject | resource_reservation.processed_by | 현재 사용자 | - | 원문 |
| POST /resource-reservations/{resourceReservationId}/reject | resource_reservation.processed_at | 현재 시각 | - | 원문 |
| POST /resource-reservations/{resourceReservationId}/cancel-approval | resource_reservation.status | 고정값 | 취소 | 가정 |
| POST /resource-reservations/{resourceReservationId}/cancel-approval | resource_reservation.processed_by | 현재 사용자 | - | 원문 |
| POST /resource-reservations/{resourceReservationId}/cancel-approval | resource_reservation.processed_at | 현재 시각 | - | 원문 |
| POST /resource-reservations/{resourceReservationId}/cancel | resource_reservation.status | 고정값 | 취소 | 원문 |
| POST /resource-reservations/{resourceReservationId}/cancel | resource_reservation.processed_by | 현재 사용자 | - | 원문 |
| POST /resource-reservations/{resourceReservationId}/cancel | resource_reservation.processed_at | 현재 시각 | - | 원문 |
| POST /board-posts | board_post.author_id | 현재 사용자 | - | 원문 |
| POST /board-posts | registered | 고정값 | true | 가정 |
| GET /board-posts/{boardPostId}/readers | readStatus | 계산 | 공개범위 대상자 중 post_read_log에 기록이 있으면 읽음, 없으면 안읽음 | 원문 |
| GET /board-posts | readStatus | 계산 | 조회자의 post_read_log 기록이 있으면 읽음, 없으면 안읽음 | 원문 |
| GET /board-posts/{boardPostId} | post_read_log.employee_id | 현재 사용자 | - | 원문 |
| GET /board-posts/{boardPostId} | post_read_log.read_at | 현재 시각 | - | 원문 |
| POST /surveys | survey.creator_id | 현재 사용자 | - | 원문 |
| GET /survey-questions | options | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /surveys/{surveyId}/responses | survey_response.respondent_id | 현재 사용자 | - | 원문 |
| POST /surveys/{surveyId}/responses | survey_response.submitted_at | 현재 시각 | - | 원문 |
| POST /surveys/{surveyId}/responses | survey_comment.author_id | 현재 사용자 | - | 원문 |
| POST /surveys/{surveyId}/responses | submitted | 고정값 | true | 가정 |
| POST /messenger-rooms | messenger_room.creator_id | 현재 사용자 | - | 원문 |
| POST /messenger-messages | messenger_message.sender_id | 현재 사용자 | - | 원문 |
| POST /messenger-messages | messenger_message.message_type | 고정값 | CHAT | 가정 |
| POST /messenger-messages | messenger_message.sent_at | 현재 시각 | - | 가정 |
| POST /messenger-messages/{messengerMessageId}/forward | messenger_message.sender_id | 현재 사용자 | - | 원문 |
| POST /messenger-messages/{messengerMessageId}/forward | messenger_message.message_type | 고정값 | CHAT | 가정 |
| POST /messenger-messages/{messengerMessageId}/forward | messenger_message.sent_at | 현재 시각 | - | 가정 |
| POST /messenger-messages/{messengerMessageId}/read | messenger_message_recipient.read_at | 현재 시각 | - | 원문 |
| POST /messenger-messages/send-notes | messenger_message.sender_id | 현재 사용자 | - | 원문 |
| POST /messenger-messages/send-notes | messenger_message.message_type | 고정값 | NOTE | 가정 |
| POST /messenger-messages/send-notes | messenger_message.sent_at | 현재 시각 | - | 가정 |
| POST /messenger-messages/send-notes | messenger_message_recipient.read_status | 고정값 | 안읽음 | 가정 |
| POST /messenger-messages/send-notes | results | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /notifications | notification.read_status | 고정값 | 안읽음 | 원문 |
| POST /auth/login | accessToken | 계산 | 인증 성공 시 발급 | 가정 |
| PUT /auth-settings | change_history.changer_id | 현재 사용자 | - | 원문 |
| PUT /auth-settings | change_history.changed_at | 현재 시각 | - | 원문 |
| PUT /auth-settings | change_history.target_type | 고정값 | auth_setting | 가정 |
| PUT /auth-settings | change_history.target_id | 다른 테이블 | auth_setting.auth_setting_id 저장된 행 | 가정 |
| PUT /auth-settings | change_history.change_content | 계산 | 변경 전후 인증 대상·허용 인증기기 수 | 원문 |
| POST /auth-devices | auth_device.employee_id | 현재 사용자 | - | 원문 |
| POST /auth-devices | auth_device.otp_enabled | 고정값 | true | 원문 |
| POST /auth-devices | auth_device.approval_status | 고정값 | 신청 | 원문 |
| POST /auth-devices | auth_device.use_status | 고정값 | 미사용 | 가정 |
| POST /auth-devices/{authDeviceId}/approve | auth_device.approval_status | 고정값 | 승인 | 원문 |
| POST /auth-devices/{authDeviceId}/approve | auth_device.use_status | 고정값 | 사용 | 가정 |
| POST /auth-devices/{authDeviceId}/approve | auth_device.approver_id | 현재 사용자 | - | 원문 |
| POST /auth-devices/{authDeviceId}/approve | auth_device.processed_at | 현재 시각 | - | 원문 |
| POST /auth-devices/{authDeviceId}/reject | auth_device.approval_status | 고정값 | 반려 | 원문 |
| POST /auth-devices/{authDeviceId}/reject | auth_device.approver_id | 현재 사용자 | - | 원문 |
| POST /auth-devices/{authDeviceId}/reject | auth_device.processed_at | 현재 시각 | - | 원문 |
| POST /auth-devices/{authDeviceId}/deactivate | auth_device.use_status | 고정값 | 미사용 | 원문 |
| POST /auth-devices/{authDeviceId}/deactivate | auth_device.approver_id | 현재 사용자 | - | 가정 |
| POST /auth-devices/{authDeviceId}/deactivate | auth_device.processed_at | 현재 시각 | - | 가정 |
| GET /server-capacities | totalCapacity | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /server-capacities | usedCapacity | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /server-capacities | remainingCapacity | 계산 | totalCapacity - usedCapacity | 가정 |
| GET /menu-usage-statistics | usageCount | 계산 | menu_usage_log를 menu_id별로 건수 집계 | 원문 |
| GET /integrated-searches | category | 계산 | 검색 대상 테이블별 구분 | 원문 |
| GET /integrated-searches | categoryCount | 계산 | 카테고리별 권한 범위 내 결과 건수 | 원문 |
| GET /integrated-searches | targetId | 다른 테이블 | 각 결과 테이블의 기본키 | 가정 |
| GET /integrated-searches | title | 다른 테이블 | approval_document.title, board_post.title, schedule.title, document_box.name | 가정 |
| GET /employees/{employeeId}/activities | activityType | 계산 | 조회 테이블에 따라 전자결재/게시판 구분 | 가정 |
| GET /employees/{employeeId}/activities | title | 다른 테이블 | approval_document.title, board_post.title (대상 조직원이 기안·작성한 행) | 가정 |
| GET /employees/{employeeId}/activities | activityAt | 다른 테이블 | approval_document.created_at, board_post.created_at | 가정 |
| GET /employees/{employeeId}/activities | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| GET /employees/{employeeId}/activities | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| POST /auth/mobile-login | login_history.employee_id | 현재 사용자 | - | 원문 |
| POST /auth/mobile-login | login_history.login_at | 현재 시각 | - | 원문 |
| POST /auth/mobile-login | login_history.login_ip | 다른 테이블 | 요청 클라이언트 IP | 가정 |
| POST /auth/mobile-login | login_history.login_type | 고정값 | 모바일 앱 | 원문 |
| POST /auth/mobile-login | accessToken | 계산 | 인증 성공 시 세션 토큰 발급 | 가정 |
| GET /mobile/menu-badges | newCount | 계산 | 본인 권한 범위에서 메일은 mail_recipient.read_status=안읽음, 전자결재와 게시판은 notification.read_status=안읽음 건수 집계 | 가정 |
| POST /mail-messages | mail_message.sender_id | 현재 사용자 | - | 원문 |
| POST /mail-messages | mail_message.sent_at | 현재 시각 | - | 가정 |
| POST /mail-messages | mail_recipient.read_status | 고정값 | 안읽음 | 가정 |
| POST /approval-documents/{approvalDocumentId}/approve | approval_line.approval_status | 고정값 | 승인 | 원문 |
| POST /approval-documents/{approvalDocumentId}/approve | approval_line.processed_at | 현재 시각 | - | 가정 |
| POST /approval-documents/{approvalDocumentId}/approve | approval_document.approval_status | 계산 | 최종 결재자이면 완료, 아니면 다음 결재자에게 이동(결재대기 유지) | 원문 |
| POST /approval-documents/{approvalDocumentId}/approve | approval_document.completed_at | 현재 시각 | 최종 결재자 승인 시 | 가정 |
| POST /approval-documents/{approvalDocumentId}/approve | notification.recipient_id | 다른 테이블 | approval_line.employee_id (다음 결재자) 또는 approval_document.drafter_id (완료 시) | 가정 |
| POST /approval-documents/{approvalDocumentId}/approve | notification.channel | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /approval-documents/{approvalDocumentId}/approve | notification.title | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /approval-documents/{approvalDocumentId}/approve | notification.read_status | 고정값 | 안읽음 | 가정 |
| POST /approval-documents/{approvalDocumentId}/reject | approval_line.approval_status | 고정값 | 반려 | 원문 |
| POST /approval-documents/{approvalDocumentId}/reject | approval_line.processed_at | 현재 시각 | - | 가정 |
| POST /approval-documents/{approvalDocumentId}/reject | approval_document.approval_status | 고정값 | 반려 | 원문 |
| POST /approval-documents/{approvalDocumentId}/reject | notification.recipient_id | 다른 테이블 | approval_document.drafter_id | 가정 |
| POST /approval-documents/{approvalDocumentId}/reject | notification.channel | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /approval-documents/{approvalDocumentId}/reject | notification.title | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /approval-documents/{approvalDocumentId}/reject | notification.read_status | 고정값 | 안읽음 | 가정 |
| GET /approval-documents/{approvalDocumentId} | approvalLines | 다른 테이블 | approval_line 중 해당 approval_document_id의 모든 행 | 원문 |
| GET /approval-documents/{approvalDocumentId} | attachments | 다른 테이블 | attachment 중 target_type이 결재문서이고 target_id가 해당 문서인 행 | 가정 |
| GET /document-box-items/{documentBoxItemId} | approvalLines | 다른 테이블 | approval_line 중 해당 문서의 모든 행 | 원문 |
| GET /document-box-items/{documentBoxItemId} | attachments | 다른 테이블 | attachment 중 해당 문서에 연결된 행 | 가정 |
| GET /search | areaType | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /search | targetId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /search | title | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /office-documents | office_document.author_id | 현재 사용자 | - | 원문 |
| POST /office-documents/convert | office_document.author_id | 현재 사용자 | - | 원문 |
| POST /office-documents/convert | office_document.title | 계산 | 업로드 파일명에서 확장자를 뺀 값 | 가정 |
| POST /office-documents/convert | result | 고정값 | 성공 | 가정 |
| POST /office-documents/{officeDocumentId}/share | messenger_message.sender_id | 현재 사용자 | - | 가정 |
| POST /office-documents/{officeDocumentId}/share | messenger_message.message_type | 고정값 | NOTE | 가정 |
| POST /office-documents/{officeDocumentId}/share | messenger_message.sent_at | 현재 시각 | - | 가정 |
| POST /office-documents/{officeDocumentId}/share | shared | 계산 | 공유 권한 저장 성공 여부 | 가정 |
| POST /office-documents/{officeDocumentId}/share | grantedPermissions | 다른 테이블 | office_document_share.employee_id, office_document_share.can_edit (해당 문서의 공유 행) | 가정 |
| POST /office-documents/{officeDocumentId}/share | notificationStatus | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /office-documents | shareType | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /office-documents/{officeDocumentId}/link-ecm | link_log.requester_id | 현재 사용자 | - | 가정 |
| POST /office-documents/{officeDocumentId}/link-ecm | link_log.link_target | 고정값 | ECM | 원문 |
| POST /office-documents/{officeDocumentId}/link-ecm | link_log.status | 계산 | 연계 결과에 따라 SUCCESS 또는 FAILED | 원문 |
| POST /office-documents/{officeDocumentId}/link-ecm | link_log.requested_at | 현재 시각 | - | 가정 |
| POST /office-documents/{officeDocumentId}/link-ecm | linked | 계산 | ECM 연계 성공 여부 | 가정 |
| PATCH /fee-unit-prices/{feeUnitPriceId} | change_history.changer_id | 현재 사용자 | - | 가정 |
| PATCH /fee-unit-prices/{feeUnitPriceId} | change_history.target_type | 고정값 | fee_unit_price | 가정 |
| PATCH /fee-unit-prices/{feeUnitPriceId} | change_history.target_id | 고정값 | 수정한 feeUnitPriceId | 가정 |
| PATCH /fee-unit-prices/{feeUnitPriceId} | change_history.changed_at | 현재 시각 | - | 원문 |
| PATCH /fee-unit-prices/{feeUnitPriceId} | change_history.change_content | 계산 | 수정 전후 값 비교 내용 | 가정 |
| POST /fee-records | fee_record.amount | 계산 | fee_unit_price.unit_price × quantity (선택한 단가 행 기준) | 원문 |
| GET /fee-records/review-status | groupKey | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fee-records/review-status | reviewCount | 계산 | 기준별 fee_record 건수 합계 | 가정 |
| GET /fee-records/review-status | feeAmount | 계산 | 기준별 fee_record.amount 합계 | 가정 |
| GET /fee-records | feeRecordId | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fee-records | reviewDate | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fee-records | resolutionDate | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fee-records | quantity | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fee-records | amount | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fee-records | isOffline | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fee-records/summary | groupKey | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| GET /fee-records/summary | totalQuantity | 계산 | SUM(fee_record.quantity) 기준별 | 가정 |
| GET /fee-records/summary | totalAmount | 계산 | SUM(fee_record.amount) 기준별 | 가정 |
| POST /approval-documents/draft-assist | draftBody | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /approval-documents/phrase-suggestions | phrases | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /data-analysis/queries | analysisResult | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /data-analysis/queries | answer | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
| POST /data-analysis/queries | personal_info_access_log.employee_id | 현재 사용자 | - | 원문 |
| POST /data-analysis/queries | personal_info_access_log.accessed_at | 현재 시각 | - | 원문 |
| GET /personal-info-access-logs/statistics | totalCount | 계산 | COUNT(personal_info_access_log) | 원문 |
| GET /personal-info-access-logs/statistics | departmentId | 다른 테이블 | employee.department_id (열람자 행) | 가정 |
| GET /personal-info-access-logs/statistics | count | 계산 | 그룹별 COUNT(personal_info_access_log) | 원문 |
| POST /link-logs/sync | link_log.requester_id | 현재 사용자 | - | 원문 |
| POST /link-logs/sync | link_log.status | 고정값 | REQUESTED | 가정 |
| POST /link-logs/sync | link_log.requested_at | 현재 시각 | - | 원문 |
| POST /interface-standards | registered | 고정값 | true | 가정 |
| POST /interface-standards/invoke | api_call_log.called_at | 현재 시각 | - | 원문 |
| POST /interface-standards/invoke | api_call_log.result_status | 계산 | 처리 성공이면 성공, 오류면 실패 | 원문 |
| POST /interface-standards/invoke | responseData | 미정 | 개발 담당자가 구현하며 정한다 | 결정 |
