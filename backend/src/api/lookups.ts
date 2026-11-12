// 코드가 만든 파일 (스펙에서 생성). 화면 보조 API다: 선택 목록, 수정 폼의 처음 값.
import { Controller, Get, Param, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Col, Table, asText, col, transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

const T_MENU_PERMISSION = new Table('menu_permission', 'menu_permission_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_PROJECT = new Table('project', 'project_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_SUB_PROJECT = new Table('sub_project', 'sub_project_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_BUDGET_ACCOUNT = new Table('budget_account', 'budget_account_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_PARTNER = new Table('partner', 'partner_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_PARTNER_ACCOUNT = new Table('partner_account', 'partner_account_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_SYSTEM_SETTING = new Table('system_setting', 'system_setting_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_EXPENSE_RESOLUTION = new Table('expense_resolution', 'expense_resolution_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_BUDGET_COMMITMENT = new Table('budget_commitment', 'budget_commitment_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ACCOUNT_SUBJECT = new Table('account_subject', 'account_subject_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ACCOUNT_CARRYOVER = new Table('account_carryover', 'account_carryover_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_AUTO_JOURNAL_SETTING = new Table('auto_journal_setting', 'auto_journal_setting_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_JOURNAL_ENTRY = new Table('journal_entry', 'journal_entry_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_FUND_SUBJECT = new Table('fund_subject', 'fund_subject_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_FIXED_FUND = new Table('fixed_fund', 'fixed_fund_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_FUND_PLAN = new Table('fund_plan', 'fund_plan_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_CLOSING_DATA = new Table('closing_data', 'closing_data_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_VAT_FORM = new Table('vat_form', 'vat_form_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ASSET = new Table('asset', 'asset_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_EMPLOYEE = new Table('employee', 'employee_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_PERSONNEL_RECORD = new Table('personnel_record', 'personnel_record_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_EMPLOYEE_FAMILY = new Table('employee_family', 'employee_family_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_EDUCATION_EVALUATION = new Table('education_evaluation', 'education_evaluation_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_CERTIFICATE_TYPE = new Table('certificate_type', 'certificate_type_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ATTENDANCE_STANDARD = new Table('attendance_standard', 'attendance_standard_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ATTENDANCE_ITEM = new Table('attendance_item', 'attendance_item_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_EMPLOYEE_ATTENDANCE_SETTING = new Table('employee_attendance_setting', 'employee_attendance_setting_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_COMMUTE_CHECK_SETTING = new Table('commute_check_setting', 'commute_check_setting_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ALLOWED_IP = new Table('allowed_ip', 'allowed_ip_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ANNUAL_LEAVE_PLAN = new Table('annual_leave_plan', 'annual_leave_plan_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_COMMUTE_RECORD = new Table('commute_record', 'commute_record_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_LEAVE_GRANT_RULE = new Table('leave_grant_rule', 'leave_grant_rule_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ANNUAL_LEAVE = new Table('annual_leave', 'annual_leave_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_PAYROLL_CODE = new Table('payroll_code', 'payroll_code_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_PAYROLL_ACCOUNT_MAPPING = new Table('payroll_account_mapping', 'payroll_account_mapping_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_PAYROLL_RUN = new Table('payroll_run', 'payroll_run_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_SALARY_STEP = new Table('salary_step', 'salary_step_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_INCOME_CERTIFICATE = new Table('income_certificate', 'income_certificate_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_REQUISITION = new Table('requisition', 'requisition_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_PURCHASE_ASSET_ITEM = new Table('purchase_asset_item', 'purchase_asset_item_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ASSET_INSPECTION_PLAN = new Table('asset_inspection_plan', 'asset_inspection_plan_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_MENU = new Table('menu', 'menu_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_PORTAL_WIDGET_SETTING = new Table('portal_widget_setting', 'portal_widget_setting_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_APPROVAL_FORM = new Table('approval_form', 'approval_form_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_DEPARTMENT = new Table('department', 'department_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_ATTENDANCE_REQUEST = new Table('attendance_request', 'attendance_request_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_YEAR_END_DATA = new Table('year_end_data', 'year_end_data_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_RESOURCE_CATEGORY = new Table('resource_category', 'resource_category_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_MESSENGER_ROOM = new Table('messenger_room', 'messenger_room_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_OFFICE_DOCUMENT = new Table('office_document', 'office_document_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_FEE_UNIT_PRICE = new Table('fee_unit_price', 'fee_unit_price_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
// 화면이 참조하는 테이블 → (테이블, 기본키, 이름 컬럼)
const TABLES = new Map<string, [string, string, string]>([
  ['account_subject', ['account_subject', 'account_subject_id', 'name']],
  ['accounting_unit', ['accounting_unit', 'accounting_unit_id', 'unit_name']],
  ['annual_leave', ['annual_leave', 'annual_leave_id', 'annual_leave_id']],
  ['api_client', ['api_client', 'api_client_id', 'name']],
  ['approval_document', ['approval_document', 'approval_document_id', 'title']],
  ['approval_form', ['approval_form', 'approval_form_id', 'form_name']],
  ['asset', ['asset', 'asset_id', 'asset_name']],
  ['asset_inspection_plan', ['asset_inspection_plan', 'asset_inspection_plan_id', 'inspection_type']],
  ['attachment', ['attachment', 'attachment_id', 'file_name']],
  ['attendance_closing', ['attendance_closing', 'attendance_closing_id', 'attendance_closing_id']],
  ['attendance_item', ['attendance_item', 'attendance_item_id', 'name']],
  ['board_post', ['board_post', 'board_post_id', 'title']],
  ['budget_account', ['budget_account', 'budget_account_id', 'name']],
  ['budget_adjustment', ['budget_adjustment', 'budget_adjustment_id', 'budget_adjustment_id']],
  ['budget_carryover', ['budget_carryover', 'budget_carryover_id', 'budget_carryover_id']],
  ['budget_main', ['budget_main', 'budget_main_id', 'accounting_unit']],
  ['certificate_type', ['certificate_type', 'certificate_type_id', 'name']],
  ['credit_card', ['credit_card', 'credit_card_id', 'card_name']],
  ['credit_card_permission', ['credit_card_permission', 'credit_card_permission_id', 'credit_card_permission_id']],
  ['daily_worker', ['daily_worker', 'daily_worker_id', 'name']],
  ['department', ['department', 'department_id', 'name']],
  ['education_application', ['education_application', 'education_application_id', 'application_reason']],
  ['education_attendee', ['education_attendee', 'education_attendee_id', 'education_attendee_id']],
  ['education_code', ['education_code', 'education_code_id', 'code_name']],
  ['education_course', ['education_course', 'education_course_id', 'course_name']],
  ['education_session', ['education_session', 'education_session_id', 'education_session_id']],
  ['employee', ['employee', 'employee_id', 'name']],
  ['employee_business_trip', ['employee_business_trip', 'employee_business_trip_id', 'destination']],
  ['employee_career', ['employee_career', 'employee_career_id', 'company_name']],
  ['employee_education', ['employee_education', 'employee_education_id', 'school_name']],
  ['employee_evaluation', ['employee_evaluation', 'employee_evaluation_id', 'evaluator_name']],
  ['employee_language', ['employee_language', 'employee_language_id', 'language_name']],
  ['employee_license', ['employee_license', 'employee_license_id', 'license_name']],
  ['employee_reward_penalty', ['employee_reward_penalty', 'employee_reward_penalty_id', 'title']],
  ['expense_resolution', ['expense_resolution', 'expense_resolution_id', 'expense_resolution_id']],
  ['fee_unit_price', ['fee_unit_price', 'fee_unit_price_id', 'fee_unit_price_id']],
  ['fund_pl_form_item', ['fund_pl_form_item', 'fund_pl_form_item_id', 'item_name']],
  ['fund_subject', ['fund_subject', 'fund_subject_id', 'name']],
  ['journal_entry', ['journal_entry', 'journal_entry_id', 'summary']],
  ['journal_entry_line', ['journal_entry_line', 'journal_entry_line_id', 'management_item_value']],
  ['leave_grant_rule', ['leave_grant_rule', 'leave_grant_rule_id', 'name']],
  ['management_item', ['management_item', 'management_item_id', 'name']],
  ['menu', ['menu', 'menu_id', 'name']],
  ['messenger_message', ['messenger_message', 'messenger_message_id', 'content']],
  ['messenger_room', ['messenger_room', 'messenger_room_id', 'room_name']],
  ['notification', ['notification', 'notification_id', 'title']],
  ['office_template', ['office_template', 'office_template_id', 'name']],
  ['partner', ['partner', 'partner_id', 'name']],
  ['partner_account', ['partner_account', 'partner_account_id', 'bank_name']],
  ['payroll', ['payroll', 'payroll_id', 'payroll_id']],
  ['payroll_item', ['payroll_item', 'payroll_item_id', 'item_name']],
  ['personal_menu', ['personal_menu', 'personal_menu_id', 'personal_menu_id']],
  ['project', ['project', 'project_id', 'name']],
  ['project_permission', ['project_permission', 'project_permission_id', 'project_permission_id']],
  ['requisition', ['requisition', 'requisition_id', 'title']],
  ['resource', ['resource', 'resource_id', 'name']],
  ['resource_category', ['resource_category', 'resource_category_id', 'name']],
  ['social_insurance_enrollment', ['social_insurance_enrollment', 'social_insurance_enrollment_id', 'loss_reason']],
  ['social_insurance_report', ['social_insurance_report', 'social_insurance_report_id', 'loss_reason']],
  ['sub_project', ['sub_project', 'sub_project_id', 'name']],
  ['sub_project_permission', ['sub_project_permission', 'sub_project_permission_id', 'sub_project_permission_id']],
  ['survey', ['survey', 'survey_id', 'title']],
  ['system_setting', ['system_setting', 'system_setting_id', 'setting_name']],
  ['tax_filing', ['tax_filing', 'tax_filing_id', 'receipt_number']],
  ['withholding_adjustment_request', ['withholding_adjustment_request', 'withholding_adjustment_request_id', 'reason']],
  ['year_end_data', ['year_end_data', 'year_end_data_id', 'remark']],
  ['year_end_item', ['year_end_item', 'year_end_item_id', 'name']],
  ['year_end_result', ['year_end_result', 'year_end_result_id', 'year_end_result_id']],
]);
// 수정 화면 → (테이블, 고칠 수 있는 칸, 수정 API와 같은 역할)
const FORMS = new Map<string, [Table, Col[], string[]]>([
  ['SCR-SFR-001-01', [T_MENU_PERMISSION, [col('viewScope', 'view_scope', 'varchar')], ['시스템 관리자']]],
  ['SCR-SFR-002-01', [T_PROJECT, [col('name', 'name', 'varchar'), col('shortName', 'short_name', 'varchar'), col('managedAccount', 'managed_account', 'varchar'), col('startDate', 'start_date', 'date'), col('endDate', 'end_date', 'date'), col('businessCategory', 'business_category', 'varchar'), col('projectType', 'project_type', 'varchar'), col('departmentId', 'department_id', 'bigint'), col('managerId', 'manager_id', 'bigint'), col('projectAmount', 'project_amount', 'numeric'), col('purpose', 'purpose', 'text')], ['예산·회계 담당자']]],
  ['SCR-SFR-002-02', [T_SUB_PROJECT, [col('parentSubProjectId', 'parent_sub_project_id', 'bigint'), col('name', 'name', 'varchar'), col('managedAccount', 'managed_account', 'varchar'), col('useStatus', 'use_status', 'varchar')], ['예산·회계 담당자']]],
  ['SCR-SFR-002-03', [T_BUDGET_ACCOUNT, [col('budgetGroup', 'budget_group', 'varchar'), col('name', 'name', 'varchar'), col('controlCycle', 'control_cycle', 'varchar'), col('transferAllowed', 'transfer_allowed', 'boolean'), col('useStartDate', 'use_start_date', 'date'), col('useEndDate', 'use_end_date', 'date'), col('accountSubjectId', 'account_subject_id', 'bigint')], ['예산·회계 담당자']]],
  ['SCR-SFR-002-04', [T_PARTNER, [col('name', 'name', 'varchar'), col('shortName', 'short_name', 'varchar'), col('code', 'code', 'varchar'), col('businessRegNo', 'business_reg_no', 'varchar'), col('representative', 'representative', 'varchar'), col('category', 'category', 'varchar'), col('region', 'region', 'varchar'), col('taxInvoiceYn', 'tax_invoice_yn', 'boolean'), col('tradeStartDate', 'trade_start_date', 'date'), col('tradeEndDate', 'trade_end_date', 'date'), col('contactPerson', 'contact_person', 'varchar')], ['예산·회계 담당자']]],
  ['SCR-SFR-002-05', [T_PARTNER_ACCOUNT, [col('bankName', 'bank_name', 'varchar'), col('accountHolder', 'account_holder', 'varchar'), col('useStatus', 'use_status', 'varchar')], ['예산·회계 담당자']]],
  ['SCR-SFR-002-07', [T_SYSTEM_SETTING, [col('settingValue', 'setting_value', 'varchar')], ['예산·회계 담당자', '시스템 관리자']]],
  ['SCR-SFR-004-02', [T_EXPENSE_RESOLUTION, [col('requisitionId', 'requisition_id', 'bigint'), col('projectId', 'project_id', 'bigint'), col('budgetAccountId', 'budget_account_id', 'bigint'), col('partnerId', 'partner_id', 'bigint'), col('departmentId', 'department_id', 'bigint'), col('resolutionMethod', 'resolution_method', 'varchar'), col('resolutionAmount', 'resolution_amount', 'numeric')], ['임직원', '예산·회계 담당자']]],
  ['SCR-SFR-004-04', [T_BUDGET_COMMITMENT, [col('name', 'name', 'varchar'), col('projectId', 'project_id', 'bigint'), col('budgetAccountId', 'budget_account_id', 'bigint'), col('partnerId', 'partner_id', 'bigint'), col('amount', 'amount', 'numeric')], ['예산·회계 담당자']]],
  ['SCR-SFR-006-01', [T_ACCOUNT_SUBJECT, [col('category', 'category', 'varchar'), col('code', 'code', 'varchar'), col('name', 'name', 'varchar'), col('description', 'description', 'text'), col('remark', 'remark', 'text')], ['예산·회계 담당자']]],
  ['SCR-SFR-006-03', [T_PARTNER, [col('code', 'code', 'varchar'), col('partnerType', 'partner_type', 'varchar'), col('name', 'name', 'varchar'), col('businessRegNo', 'business_reg_no', 'varchar')], ['예산·회계 담당자']]],
  ['SCR-SFR-006-04', [T_ACCOUNT_CARRYOVER, [col('accountSubjectId', 'account_subject_id', 'bigint'), col('partnerId', 'partner_id', 'bigint'), col('carryoverAmount', 'carryover_amount', 'numeric')], ['예산·회계 담당자']]],
  ['SCR-SFR-007-01', [T_AUTO_JOURNAL_SETTING, [col('evidenceType', 'evidence_type', 'varchar'), col('evidenceItemName', 'evidence_item_name', 'varchar'), col('collectEnabled', 'collect_enabled', 'boolean'), col('autoJournalEnabled', 'auto_journal_enabled', 'boolean'), col('collectCondition', 'collect_condition', 'varchar'), col('journalCondition', 'journal_condition', 'varchar'), col('accountSubjectId', 'account_subject_id', 'bigint'), col('useStatus', 'use_status', 'varchar')], ['예산·회계 담당자']]],
  ['SCR-SFR-008-01', [T_JOURNAL_ENTRY, [col('summary', 'summary', 'varchar'), col('evidenceDetail', 'evidence_detail', 'varchar')], ['예산·회계 담당자']]],
  ['SCR-SFR-009-01', [T_FUND_SUBJECT, [col('name', 'name', 'varchar'), col('subjectType', 'subject_type', 'varchar'), col('useStatus', 'use_status', 'varchar'), col('accountSubjectId', 'account_subject_id', 'bigint')], ['예산·회계 담당자']]],
  ['SCR-SFR-009-02', [T_FIXED_FUND, [col('fundSubjectId', 'fund_subject_id', 'bigint'), col('partnerId', 'partner_id', 'bigint'), col('amount', 'amount', 'numeric'), col('cycle', 'cycle', 'varchar'), col('startDate', 'start_date', 'date'), col('endDate', 'end_date', 'date'), col('useStatus', 'use_status', 'varchar')], ['예산·회계 담당자']]],
  ['SCR-SFR-009-03', [T_FUND_PLAN, [col('fundSubjectId', 'fund_subject_id', 'bigint'), col('planStartDate', 'plan_start_date', 'date'), col('planEndDate', 'plan_end_date', 'date'), col('incomeAmount', 'income_amount', 'numeric'), col('expenseAmount', 'expense_amount', 'numeric'), col('remark', 'remark', 'text')], ['예산·회계 담당자']]],
  ['SCR-SFR-010-01', [T_CLOSING_DATA, [col('accountSubjectId', 'account_subject_id', 'bigint'), col('projectId', 'project_id', 'bigint'), col('departmentId', 'department_id', 'bigint'), col('closingAmount', 'closing_amount', 'numeric')], ['예산·회계 담당자']]],
  ['SCR-SFR-010-06', [T_VAT_FORM, [col('formContent', 'form_content', 'text')], ['예산·회계 담당자']]],
  ['SCR-SFR-011-01', [T_ASSET, [col('assetName', 'asset_name', 'varchar'), col('isDepreciable', 'is_depreciable', 'boolean'), col('depreciationMethod', 'depreciation_method', 'varchar'), col('usefulLifeMonths', 'useful_life_months', 'integer'), col('acquisitionAmount', 'acquisition_amount', 'numeric'), col('accountSubjectId', 'account_subject_id', 'bigint'), col('projectId', 'project_id', 'bigint'), col('partnerId', 'partner_id', 'bigint')], ['자산 담당자']]],
  ['SCR-SFR-012-01', [T_EMPLOYEE, [col('name', 'name', 'varchar'), col('departmentId', 'department_id', 'bigint'), col('employmentStatus', 'employment_status', 'varchar'), col('email', 'email', 'varchar'), col('mobilePhone', 'mobile_phone', 'varchar')], ['인사 담당자']]],
  ['SCR-SFR-012-04', [T_PERSONNEL_RECORD, [col('hireDate', 'hire_date', 'date'), col('recruitmentType', 'recruitment_type', 'varchar'), col('recruitmentNote', 'recruitment_note', 'text'), col('veteranInfo', 'veteran_info', 'varchar'), col('militaryServiceInfo', 'military_service_info', 'varchar')], ['인사 담당자']]],
  ['SCR-SFR-012-05', [T_EMPLOYEE_FAMILY, [col('relationship', 'relationship', 'varchar'), col('isDependent', 'is_dependent', 'boolean')], ['인사 담당자']]],
  ['SCR-SFR-015-04', [T_EDUCATION_EVALUATION, [col('evaluationItem', 'evaluation_item', 'varchar'), col('score', 'score', 'numeric'), col('completed', 'completed', 'boolean')], ['인사 담당자']]],
  ['SCR-SFR-016-01', [T_CERTIFICATE_TYPE, [col('name', 'name', 'varchar'), col('formBody', 'form_body', 'text'), col('useYn', 'use_yn', 'varchar')], ['인사 담당자']]],
  ['SCR-SFR-017-01', [T_ATTENDANCE_STANDARD, [col('itemName', 'item_name', 'varchar'), col('standardValue', 'standard_value', 'varchar'), col('unit', 'unit', 'varchar'), col('useYn', 'use_yn', 'varchar'), col('applyStartDate', 'apply_start_date', 'date'), col('applyEndDate', 'apply_end_date', 'date')], ['근태 담당자']]],
  ['SCR-SFR-017-02', [T_ATTENDANCE_ITEM, [col('name', 'name', 'varchar'), col('useYn', 'use_yn', 'varchar'), col('deductYn', 'deduct_yn', 'boolean')], ['근태 담당자']]],
  ['SCR-SFR-017-03', [T_EMPLOYEE_ATTENDANCE_SETTING, [col('attendanceItemId', 'attendance_item_id', 'bigint'), col('applyStandard', 'apply_standard', 'varchar'), col('applyStartDate', 'apply_start_date', 'date')], ['근태 담당자']]],
  ['SCR-SFR-017-04', [T_COMMUTE_CHECK_SETTING, [col('applyUnit', 'apply_unit', 'varchar'), col('departmentId', 'department_id', 'bigint'), col('employeeId', 'employee_id', 'bigint'), col('checkType', 'check_type', 'varchar')], ['근태 담당자']]],
  ['SCR-SFR-017-05', [T_ALLOWED_IP, [col('ipAddress', 'ip_address', 'varchar'), col('description', 'description', 'varchar'), col('useYn', 'use_yn', 'varchar')], ['근태 담당자']]],
  ['SCR-SFR-017-06', [T_ANNUAL_LEAVE_PLAN, [col('planDates', 'plan_dates', 'date'), col('planDays', 'plan_days', 'numeric')], ['근태 담당자', '임직원']]],
  ['SCR-SFR-018-02', [T_SYSTEM_SETTING, [col('settingValue', 'setting_value', 'varchar'), col('description', 'description', 'varchar')], ['근태 담당자']]],
  ['SCR-SFR-018-03', [T_COMMUTE_RECORD, [col('checkInAt', 'check_in_at', 'timestamptz'), col('checkOutAt', 'check_out_at', 'timestamptz')], ['근태 담당자']]],
  ['SCR-SFR-019-01', [T_LEAVE_GRANT_RULE, [col('name', 'name', 'varchar'), col('baseDays', 'base_days', 'numeric'), col('additionalDays', 'additional_days', 'numeric'), col('additionalCondition', 'additional_condition', 'varchar'), col('useStatus', 'use_status', 'varchar')], ['근태 담당자']]],
  ['SCR-SFR-019-02', [T_ANNUAL_LEAVE, [col('grantedDays', 'granted_days', 'numeric')], ['근태 담당자']]],
  ['SCR-SFR-020-01', [T_PAYROLL_CODE, [col('codeName', 'code_name', 'varchar'), col('useYn', 'use_yn', 'varchar'), col('remark', 'remark', 'varchar')], ['급여 담당자']]],
  ['SCR-SFR-020-02', [T_PAYROLL_ACCOUNT_MAPPING, [col('accountSubjectId', 'account_subject_id', 'bigint'), col('isActive', 'is_active', 'varchar')], ['급여 담당자']]],
  ['SCR-SFR-020-03', [T_PAYROLL_CODE, [col('codeName', 'code_name', 'varchar'), col('useYn', 'use_yn', 'varchar'), col('remark', 'remark', 'varchar')], ['급여 담당자']]],
  ['SCR-SFR-021-08', [T_PAYROLL_RUN, [col('payDate', 'pay_date', 'date')], ['급여 담당자']]],
  ['SCR-SFR-021-11', [T_SALARY_STEP, [col('stepGrade', 'step_grade', 'varchar'), col('amount', 'amount', 'numeric'), col('isActive', 'is_active', 'varchar')], ['급여 담당자']]],
  ['SCR-SFR-023-01', [T_SYSTEM_SETTING, [col('settingValue', 'setting_value', 'varchar'), col('description', 'description', 'varchar')], ['근태 담당자']]],
  ['SCR-SFR-023-04', [T_INCOME_CERTIFICATE, [col('totalPaymentAmount', 'total_payment_amount', 'numeric'), col('withheldTaxAmount', 'withheld_tax_amount', 'numeric')], ['급여 담당자']]],
  ['SCR-SFR-023-05', [T_INCOME_CERTIFICATE, [col('totalPaymentAmount', 'total_payment_amount', 'numeric'), col('withheldTaxAmount', 'withheld_tax_amount', 'numeric')], ['급여 담당자']]],
  ['SCR-SFR-024-01', [T_REQUISITION, [col('projectId', 'project_id', 'bigint'), col('budgetAccountId', 'budget_account_id', 'bigint'), col('title', 'title', 'varchar'), col('requisitionAmount', 'requisition_amount', 'numeric'), col('content', 'content', 'text')], ['임직원']]],
  ['SCR-SFR-024-03', [T_PURCHASE_ASSET_ITEM, [col('itemName', 'item_name', 'varchar'), col('quantity', 'quantity', 'integer'), col('amount', 'amount', 'numeric'), col('assetCategory', 'asset_category', 'varchar'), col('inspectionRequired', 'inspection_required', 'boolean')], ['임직원', '자산 담당자']]],
  ['SCR-SFR-025-01', [T_ASSET, [col('assetName', 'asset_name', 'varchar'), col('isDepreciable', 'is_depreciable', 'boolean'), col('depreciationMethod', 'depreciation_method', 'varchar'), col('usefulLifeMonths', 'useful_life_months', 'integer'), col('acquisitionAmount', 'acquisition_amount', 'numeric'), col('accountSubjectId', 'account_subject_id', 'bigint'), col('projectId', 'project_id', 'bigint'), col('partnerId', 'partner_id', 'bigint')], ['자산 담당자']]],
  ['SCR-SFR-025-04', [T_ASSET_INSPECTION_PLAN, [col('inspectionType', 'inspection_type', 'varchar'), col('startDate', 'start_date', 'date'), col('endDate', 'end_date', 'date'), col('targetScope', 'target_scope', 'text'), col('managerId', 'manager_id', 'bigint')], ['자산 담당자']]],
  ['SCR-SFR-025-06', [T_SYSTEM_SETTING, [col('settingValue', 'setting_value', 'varchar'), col('description', 'description', 'varchar')], ['근태 담당자']]],
  ['SCR-SFR-026-01', [T_MENU_PERMISSION, [col('viewScope', 'view_scope', 'varchar')], ['시스템 관리자']]],
  ['SCR-SFR-026-02', [T_MENU, [col('name', 'name', 'varchar'), col('module', 'module', 'varchar'), col('useStatus', 'use_status', 'varchar'), col('displayOrder', 'display_order', 'integer')], ['시스템 관리자']]],
  ['SCR-SFR-026-04', [T_PORTAL_WIDGET_SETTING, [col('visibleYn', 'visible_yn', 'boolean'), col('displayOrder', 'display_order', 'integer')], ['임직원']]],
  ['SCR-SFR-029-01', [T_APPROVAL_FORM, [col('formBody', 'form_body', 'text'), col('useStatus', 'use_status', 'varchar')], ['근태 담당자']]],
  ['SCR-SFR-031-01', [T_DEPARTMENT, [col('abbreviation', 'abbreviation', 'varchar')], ['시스템 관리자']]],
  ['SCR-SFR-032-03', [T_ATTENDANCE_REQUEST, [col('attendanceType', 'attendance_type', 'varchar'), col('startDate', 'start_date', 'date'), col('endDate', 'end_date', 'date'), col('reason', 'reason', 'varchar'), col('changedWorkTime', 'changed_work_time', 'varchar')], ['임직원']]],
  ['SCR-SFR-032-05', [T_ANNUAL_LEAVE_PLAN, [col('planDates', 'plan_dates', 'date'), col('planDays', 'plan_days', 'numeric')], ['근태 담당자', '임직원']]],
  ['SCR-SFR-032-07', [T_YEAR_END_DATA, [col('amount', 'amount', 'numeric'), col('attachmentId', 'attachment_id', 'bigint'), col('remark', 'remark', 'varchar')], ['임직원']]],
  ['SCR-SFR-033-03', [T_RESOURCE_CATEGORY, [col('name', 'name', 'varchar'), col('sortOrder', 'sort_order', 'integer')], ['자원 담당자']]],
  ['SCR-SFR-036-01', [T_MESSENGER_ROOM, [col('roomName', 'room_name', 'varchar')], ['임직원']]],
  ['SCR-SFR-041-06', [T_OFFICE_DOCUMENT, [col('title', 'title', 'varchar'), col('body', 'body', 'text')], ['임직원']]],
  ['SCR-SFR-042-01', [T_FEE_UNIT_PRICE, [col('unitPrice', 'unit_price', 'numeric'), col('effectiveFrom', 'effective_from', 'date'), col('effectiveTo', 'effective_to', 'date')], ['임직원']]],
]);

@Controller('api/ui')
export class LookupsController {
  @Get('lookups/:table')
  async lookup(@Req() req: Request, @Param('table') table: string) {
    currentUser(req).requireLogin();
    const found = TABLES.get(table);
    if (!found) {
      throw ApiError.notFound();
    }
    const [name, pk, label] = found;
    return transaction((db) => db.query(`SELECT ${asText(pk)} AS "value", ${asText(label)} AS "label" FROM ${name} ORDER BY ${pk} LIMIT 500`));
  }

  /** 수정 폼의 처음 값: 그 화면이 고칠 수 있는 칸만, 수정 API와 같은 역할로 읽는다 */
  @Get('rows/:screen/:id')
  async row(@Req() req: Request, @Param('screen') screen: string, @Param('id') id: string) {
    const user = currentUser(req);
    const form = FORMS.get(screen);
    if (!form || !form[2].length) {
      user.requireLogin();
    } else {
      user.require(...form[2]);
    }
    if (!form) {
      return {};
    }
    return transaction((db) => db.one(form[0], form[1], id));
  }
}
