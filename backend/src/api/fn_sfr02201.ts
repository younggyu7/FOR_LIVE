// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-022-01 사회보험 취득·상실 대상자 등록 및 신고서 관리 */
import { Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, col, transaction } from '../common/db';
import { notImplemented } from '../common/errors';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr02201';

const T_SOCIAL_INSURANCE_ENROLLMENT = new Table('social_insurance_enrollment', 'social_insurance_enrollment_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const T_SOCIAL_INSURANCE_REPORT = new Table('social_insurance_report', 'social_insurance_report_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_CREATE_SOCIAL_INSURANCE_ENROLLMENT: Col[] = [
  col('socialInsuranceEnrollmentId', 'social_insurance_enrollment.social_insurance_enrollment_id', 'bigint'),
];
const IN_CREATE_SOCIAL_INSURANCE_ENROLLMENT: Col[] = [
  col('employeeId', 'employee_id', 'bigint'),
  col('insuranceType', 'insurance_type', 'varchar'),
  col('reportType', 'report_type', 'varchar'),
  col('acquisitionDate', 'acquisition_date', 'date'),
  col('lossDate', 'loss_date', 'date'),
  col('lossReason', 'loss_reason', 'varchar'),
];
const OUT_LIST_SOCIAL_INSURANCE_ENROLLMENTS: Col[] = [
  col('socialInsuranceEnrollmentId', 'social_insurance_enrollment.social_insurance_enrollment_id', 'bigint'),
  col('employeeId', 'social_insurance_enrollment.employee_id', 'bigint'),
  col('insuranceType', 'social_insurance_enrollment.insurance_type', 'varchar'),
  col('reportType', 'social_insurance_enrollment.report_type', 'varchar'),
  col('acquisitionDate', 'social_insurance_enrollment.acquisition_date', 'date'),
  col('lossDate', 'social_insurance_enrollment.loss_date', 'date'),
  col('lossReason', 'social_insurance_enrollment.loss_reason', 'varchar'),
];
const FILTER_LIST_SOCIAL_INSURANCE_ENROLLMENTS: Col[] = [
  col('employeeId', 'social_insurance_enrollment.employee_id', 'bigint'),
  col('reportType', 'social_insurance_enrollment.report_type', 'varchar'),
  col('insuranceType', 'social_insurance_enrollment.insurance_type', 'varchar'),
];
const OUT_CREATE_SOCIAL_INSURANCE_REPORT: Col[] = [
  col('socialInsuranceReportId', 'social_insurance_report.social_insurance_report_id', 'bigint'),
  col('createdAt', 'social_insurance_report.created_at', 'timestamptz'),
];
const IN_CREATE_SOCIAL_INSURANCE_REPORT: Col[] = [
  col('socialInsuranceEnrollmentId', 'social_insurance_enrollment_id', 'bigint'),
  col('employeeId', 'employee_id', 'bigint'),
  col('reportType', 'report_type', 'varchar'),
  col('insuranceType', 'insurance_type', 'varchar'),
  col('periodStart', 'period_start', 'date'),
  col('periodEnd', 'period_end', 'date'),
  col('eventDate', 'event_date', 'date'),
  col('lossReason', 'loss_reason', 'varchar'),
  col('totalAmount', 'total_amount', 'numeric'),
];
const OUT_LIST_SOCIAL_INSURANCE_REPORTS: Col[] = [
  col('socialInsuranceReportId', 'social_insurance_report.social_insurance_report_id', 'bigint'),
  col('employeeId', 'social_insurance_report.employee_id', 'bigint'),
  col('reportType', 'social_insurance_report.report_type', 'varchar'),
  col('insuranceType', 'social_insurance_report.insurance_type', 'varchar'),
  col('eventDate', 'social_insurance_report.event_date', 'date'),
  col('createdById', 'social_insurance_report.created_by_id', 'bigint'),
  col('printedAt', 'social_insurance_report.printed_at', 'timestamptz'),
  col('createdAt', 'social_insurance_report.created_at', 'timestamptz'),
];
const FILTER_LIST_SOCIAL_INSURANCE_REPORTS: Col[] = [
  col('employeeId', 'social_insurance_report.employee_id', 'bigint'),
  col('reportType', 'social_insurance_report.report_type', 'varchar'),
  col('insuranceType', 'social_insurance_report.insurance_type', 'varchar'),
];
const OUT_PRINT_SOCIAL_INSURANCE_REPORT: Col[] = [
  col('printedAt', 'social_insurance_report.printed_at', 'timestamptz'),
];
const STAMP_PRINT_SOCIAL_INSURANCE_REPORT: Col[] = [
  col('printedAt', 'printed_at', 'timestamptz'),
];

@Controller('api/v1')
export class FnSfr02201Controller {
  /** POST /social-insurance-enrollments — 사회보험 취득·상실 대상자를 등록한다 */
  @Post('/social-insurance-enrollments')
  @HttpCode(200)
  async createSocialInsuranceEnrollment(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    checks.required(data, 'employeeId', 'insuranceType', 'reportType');
    checks.oneOf(data, 'insuranceType', '국민연금', '건강보험', '고용보험', '산재보험');
    checks.oneOf(data, 'reportType', '취득', '상실');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createSocialInsuranceEnrollment(data, new Ctx(db, user), () => db.insert(T_SOCIAL_INSURANCE_ENROLLMENT, IN_CREATE_SOCIAL_INSURANCE_ENROLLMENT, OUT_CREATE_SOCIAL_INSURANCE_ENROLLMENT, data, {})));
  }

  /** GET /social-insurance-enrollments — 취득·상실 대상자 목록을 조회한다 */
  @Get('/social-insurance-enrollments')
  async listSocialInsuranceEnrollments(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.queryOf(req.query);
    checks.oneOf(data, 'reportType', '취득', '상실');
    checks.oneOf(data, 'insuranceType', '국민연금', '건강보험', '고용보험', '산재보험');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listSocialInsuranceEnrollments(data, new Ctx(db, user), () => db.page(T_SOCIAL_INSURANCE_ENROLLMENT, OUT_LIST_SOCIAL_INSURANCE_ENROLLMENTS, FILTER_LIST_SOCIAL_INSURANCE_ENROLLMENTS, data)));
  }

  /** POST /social-insurance-reports — 사회보험 신고서를 생성한다 */
  @Post('/social-insurance-reports')
  @HttpCode(200)
  async createSocialInsuranceReport(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    checks.required(data, 'reportType');
    checks.oneOf(data, 'reportType', 'QUALIFICATION_ACQUISITION', 'QUALIFICATION_LOSS', 'TOTAL_REMUNERATION', 'EMPLOYMENT_INDUSTRIAL', 'SEPARATION_CONFIRMATION', 'WORK_CONTENT_CONFIRMATION');
    checks.oneOf(data, 'insuranceType', 'NATIONAL_PENSION', 'HEALTH', 'EMPLOYMENT', 'INDUSTRIAL_ACCIDENT');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.createSocialInsuranceReport(data, new Ctx(db, user), () => db.insert(T_SOCIAL_INSURANCE_REPORT, IN_CREATE_SOCIAL_INSURANCE_REPORT, OUT_CREATE_SOCIAL_INSURANCE_REPORT, data, {})));
  }

  /** GET /social-insurance-reports — 신고서 이력을 조회한다 */
  @Get('/social-insurance-reports')
  async listSocialInsuranceReports(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.queryOf(req.query);
    checks.oneOf(data, 'reportType', 'QUALIFICATION_ACQUISITION', 'QUALIFICATION_LOSS', 'TOTAL_REMUNERATION', 'EMPLOYMENT_INDUSTRIAL', 'SEPARATION_CONFIRMATION', 'WORK_CONTENT_CONFIRMATION');
    checks.oneOf(data, 'insuranceType', 'NATIONAL_PENSION', 'HEALTH', 'EMPLOYMENT', 'INDUSTRIAL_ACCIDENT');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listSocialInsuranceReports(data, new Ctx(db, user), () => db.page(T_SOCIAL_INSURANCE_REPORT, OUT_LIST_SOCIAL_INSURANCE_REPORTS, FILTER_LIST_SOCIAL_INSURANCE_REPORTS, data)));
  }

  /** POST /social-insurance-reports/{socialInsuranceReportId}/print — 신고서를 출력 처리한다 */
  @Post('/social-insurance-reports/:socialInsuranceReportId/print')
  @HttpCode(200)
  async printSocialInsuranceReport(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    data['socialInsuranceReportId'] = req.params['socialInsuranceReportId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.printSocialInsuranceReport(data, new Ctx(db, user), () => notImplemented('printSocialInsuranceReport')));
  }
}
