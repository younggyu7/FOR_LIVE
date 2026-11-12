import { Controller, Get, Post, Patch, Delete, HttpCode, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

type Obj = Record<string, unknown>;
type Db = Parameters<Parameters<typeof transaction>[0]>[0];
type Kind = 'text' | 'date' | 'num' | 'bool';
type UserId = string | null;

interface Field {
  key: string;
  col: string;
  kind: Kind;
  req: boolean;
  hidden: boolean;
}

interface Spec {
  table: string;
  idCol: string;
  idKey: string;
  type: string;
  code: string;
  label: string;
  fields: Field[];
  range?: [string, string];
}

const ROLE = '인사 담당자';
const Q = String.fromCharCode(34);
// 가정: 목록 기본 크기 20, 최대 200
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;
// 가정: 개인정보 열람 이력의 접근 유형과 변경 이력의 변경 구분 값
const ACCESS_TYPE = '조회';
const CHANGE_CREATE = '등록';
const CHANGE_UPDATE = '수정';
const CHANGE_DELETE = '삭제';

function f(key: string, col: string, kind: Kind, req = false, hidden = false): Field {
  return { key, col, kind, req, hidden };
}

const FAMILY: Spec = {
  table: 'employee_family',
  idCol: 'employee_family_id',
  idKey: 'employeeFamilyId',
  type: 'employee_family',
  code: 'EMPLOYEE_FAMILY_NOT_FOUND',
  label: '가족 정보가 없습니다.',
  fields: [
    f('name', 'name_enc', 'text', true),
    f('relationship', 'relationship', 'text', true),
    f('birthDate', 'birth_date_enc', 'text'),
    f('residentNumber', 'resident_number_enc', 'text', false, true),
    f('isDependent', 'is_dependent', 'bool', true),
  ],
};

const EDUCATION: Spec = {
  table: 'employee_education',
  idCol: 'employee_education_id',
  idKey: 'employeeEducationId',
  type: 'employee_education',
  code: 'EMPLOYEE_EDUCATION_NOT_FOUND',
  label: '학력 정보가 없습니다.',
  range: ['admissionDate', 'graduationDate'],
  fields: [
    f('schoolName', 'school_name', 'text', true),
    f('major', 'major', 'text'),
    f('degree', 'degree', 'text'),
    f('admissionDate', 'admission_date', 'date'),
    f('graduationDate', 'graduation_date', 'date'),
    f('graduationStatus', 'graduation_status', 'text'),
  ],
};

const CAREER: Spec = {
  table: 'employee_career',
  idCol: 'employee_career_id',
  idKey: 'employeeCareerId',
  type: 'employee_career',
  code: 'EMPLOYEE_CAREER_NOT_FOUND',
  label: '경력 정보가 없습니다.',
  range: ['startDate', 'endDate'],
  fields: [
    f('companyName', 'company_name', 'text', true),
    f('departmentName', 'department_name', 'text'),
    f('positionTitle', 'position_title', 'text'),
    f('jobDescription', 'job_description', 'text'),
    f('startDate', 'start_date', 'date', true),
    f('endDate', 'end_date', 'date'),
  ],
};

const LICENSE: Spec = {
  table: 'employee_license',
  idCol: 'employee_license_id',
  idKey: 'employeeLicenseId',
  type: 'employee_license',
  code: 'EMPLOYEE_LICENSE_NOT_FOUND',
  label: '자격·면허 정보가 없습니다.',
  range: ['acquiredDate', 'expiryDate'],
  fields: [
    f('licenseName', 'license_name', 'text', true),
    f('issuingOrganization', 'issuing_organization', 'text'),
    f('acquiredDate', 'acquired_date', 'date'),
    f('expiryDate', 'expiry_date', 'date'),
    f('licenseNumber', 'license_number_enc', 'text'),
  ],
};

const LANGUAGE: Spec = {
  table: 'employee_language',
  idCol: 'employee_language_id',
  idKey: 'employeeLanguageId',
  type: 'employee_language',
  code: 'EMPLOYEE_LANGUAGE_NOT_FOUND',
  label: '외국어 정보가 없습니다.',
  range: ['testDate', 'expiryDate'],
  fields: [
    f('languageName', 'language_name', 'text', true),
    f('testName', 'test_name', 'text'),
    f('score', 'score', 'num'),
    f('grade', 'grade', 'text'),
    f('testDate', 'test_date', 'date'),
    f('expiryDate', 'expiry_date', 'date'),
  ],
};

const EVALUATION: Spec = {
  table: 'employee_evaluation',
  idCol: 'employee_evaluation_id',
  idKey: 'employeeEvaluationId',
  type: 'employee_evaluation',
  code: 'EMPLOYEE_EVALUATION_NOT_FOUND',
  label: '인사고과 정보가 없습니다.',
  range: ['periodStartDate', 'periodEndDate'],
  fields: [
    f('periodStartDate', 'period_start_date', 'date', true),
    f('periodEndDate', 'period_end_date', 'date', true),
    f('evaluationGrade', 'evaluation_grade', 'text'),
    f('evaluationScore', 'evaluation_score', 'num'),
    f('evaluatorName', 'evaluator_name', 'text'),
    f('comment', 'comment', 'text'),
  ],
};

const REWARD: Spec = {
  table: 'employee_reward_penalty',
  idCol: 'employee_reward_penalty_id',
  idKey: 'employeeRewardPenaltyId',
  type: 'employee_reward_penalty',
  code: 'EMPLOYEE_REWARD_PENALTY_NOT_FOUND',
  label: '상벌 정보가 없습니다.',
  fields: [
    f('rewardPenaltyType', 'reward_penalty_type', 'text', true),
    f('title', 'title', 'text', true),
    f('awardedDate', 'awarded_date', 'date', true),
    f('issuer', 'issuer', 'text'),
    f('content', 'content', 'text'),
  ],
};

const TRIP: Spec = {
  table: 'employee_business_trip',
  idCol: 'employee_business_trip_id',
  idKey: 'employeeBusinessTripId',
  type: 'employee_business_trip',
  code: 'EMPLOYEE_BUSINESS_TRIP_NOT_FOUND',
  label: '출장 정보가 없습니다.',
  range: ['startDate', 'endDate'],
  fields: [
    f('destination', 'destination', 'text', true),
    f('startDate', 'start_date', 'date', true),
    f('endDate', 'end_date', 'date', true),
    f('purpose', 'purpose', 'text'),
    f('remark', 'remark', 'text'),
  ],
};

// 조회 전용 (발령 처리와 교육 운영은 각 기능 영역이 맡는다)
const APPOINTMENT: Spec = {
  table: 'personnel_appointment',
  idCol: 'personnel_appointment_id',
  idKey: 'personnelAppointmentId',
  type: 'personnel_appointment',
  code: 'PERSONNEL_APPOINTMENT_NOT_FOUND',
  label: '인사발령 정보가 없습니다.',
  fields: [
    f('departmentId', 'department_id', 'num'),
    f('appointmentType', 'appointment_type', 'text'),
    f('appointmentDate', 'appointment_date', 'date'),
    f('positionAfter', 'position_after', 'text'),
    f('status', 'status', 'text'),
  ],
};

const ATTENDEE: Spec = {
  table: 'education_attendee',
  idCol: 'education_attendee_id',
  idKey: 'educationAttendeeId',
  type: 'education_attendee',
  code: 'EDUCATION_ATTENDEE_NOT_FOUND',
  label: '교육이수 정보가 없습니다.',
  fields: [f('educationSessionId', 'education_session_id', 'num')],
};

function bad(text: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', text);
}

function who(userId: UserId): string {
  if (userId === null || userId === undefined) {
    throw new ApiError(401, 'UNAUTHORIZED', '인증이 필요합니다.');
  }
  return userId;
}

function employeeIdOf(o: Obj, status: number, code: string): number {
  const raw = o['employeeId'];
  if (raw === undefined || raw === null || raw === '') {
    throw new ApiError(status, code, '임직원을 지정해 주세요.');
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    throw bad('임직원 값이 올바르지 않습니다.');
  }
  return n;
}

function intParam(v: unknown, def: number, min: number, max: number): number {
  if (v === undefined || v === null || v === '') {
    return def;
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n < min) {
    throw bad('쪽 번호 또는 크기가 올바르지 않습니다.');
  }
  return Math.min(n, max);
}

function isDateText(v: string): boolean {
  if (v.length !== 10 || v[4] !== '-' || v[7] !== '-') {
    return false;
  }
  return Number.isInteger(Number(v.slice(0, 4) + v.slice(5, 7) + v.slice(8)));
}

function cleanValue(fd: Field, v: unknown): unknown {
  if (v === undefined || v === null || v === '') {
    return null;
  }
  const msg = fd.key + ' 값의 형식이 올바르지 않습니다.';
  if (fd.kind === 'text') {
    if (typeof v !== 'string') {
      throw bad(msg);
    }
    return v;
  }
  if (fd.kind === 'date') {
    if (typeof v !== 'string' || !isDateText(v)) {
      throw bad(msg);
    }
    return v;
  }
  if (fd.kind === 'num') {
    if (typeof v !== 'number' && typeof v !== 'string') {
      throw bad(msg);
    }
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) {
      throw bad(msg);
    }
    return n;
  }
  if (typeof v !== 'boolean') {
    throw bad(msg);
  }
  return v;
}

function valueExpr(fd: Field): string {
  if (fd.kind === 'date') {
    return 'CAST(:' + fd.key + ' AS date)';
  }
  if (fd.kind === 'num') {
    return 'CAST(:' + fd.key + ' AS numeric)';
  }
  if (fd.kind === 'bool') {
    return 'CAST(:' + fd.key + ' AS boolean)';
  }
  return ':' + fd.key;
}

function checkRange(spec: Spec, values: Obj): void {
  if (!spec.range) {
    return;
  }
  const from = values[spec.range[0]];
  const to = values[spec.range[1]];
  if (typeof from === 'string' && typeof to === 'string' && to < from) {
    throw bad('종료일은 시작일 이후여야 합니다.');
  }
}

async function employeeMustExist(db: Db, employeeId: number): Promise<void> {
  const rows = (await db.query(
    'SELECT employee_id FROM employee WHERE employee_id = CAST(:employeeId AS bigint)',
    { employeeId },
  )) as Obj[];
  if (rows.length === 0) {
    throw new ApiError(404, 'EMPLOYEE_NOT_FOUND', '임직원을 찾을 수 없습니다.');
  }
}

// 변경 이력에는 암호화 컬럼과 감사 컬럼을 넣지 않는다 (개인정보 보호)
async function snapshot(db: Db, spec: Spec, id: number): Promise<Obj | null> {
  const rows = (await db.query(
    'SELECT to_jsonb(t) AS j FROM ' + spec.table + ' t WHERE ' + spec.idCol + ' = CAST(:id AS bigint)',
    { id },
  )) as Obj[];
  if (rows.length === 0) {
    return null;
  }
  const src = rows[0]['j'] as Obj;
  const out: Obj = {};
  for (const k of Object.keys(src)) {
    if (k.endsWith('_enc') || k === 'created_at' || k === 'updated_at') {
      continue;
    }
    out[k] = src[k];
  }
  return out;
}

async function logChange(db: Db, userId: UserId, spec: Spec, targetId: number, changeType: string, content: string): Promise<void> {
  const uid = who(userId);
  await db.execute(
    'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) ' +
      'VALUES (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), :changeType, now(), :content, now(), now())',
    { userId: uid, targetType: spec.type, targetId, changeType, content },
  );
}

async function logAccess(db: Db, userId: UserId, q: Obj, infoType: string): Promise<void> {
  const uid = who(userId);
  const employeeId = employeeIdOf(q, 400, 'VALIDATION_FAILED');
  await db.execute(
    'INSERT INTO personal_info_access_log (employee_id, target_employee_id, target_info_type, access_type, accessed_at, created_at, updated_at) ' +
      'VALUES (CAST(:userId AS bigint), CAST(:employeeId AS bigint), :infoType, :accessType, now(), now(), now())',
    { userId: uid, employeeId, infoType, accessType: ACCESS_TYPE },
  );
}

async function listRows(db: Db, spec: Spec, q: Obj): Promise<Obj> {
  const employeeId = employeeIdOf(q, 400, 'VALIDATION_FAILED');
  const page = intParam(q['page'], 0, 0, 1000000);
  const size = intParam(q['size'], DEFAULT_SIZE, 1, MAX_SIZE);
  const cols = [spec.idCol + ' AS ' + Q + spec.idKey + Q];
  for (const fd of spec.fields) {
    if (fd.hidden) {
      continue;
    }
    if (fd.kind === 'date') {
      cols.push('CAST(' + fd.col + ' AS text) AS ' + Q + fd.key + Q);
    } else {
      cols.push(fd.col + ' AS ' + Q + fd.key + Q);
    }
  }
  const where = ' WHERE employee_id = CAST(:employeeId AS bigint)';
  const items = await db.query(
    'SELECT ' + cols.join(', ') + ' FROM ' + spec.table + where +
      ' ORDER BY ' + spec.idCol + ' DESC LIMIT CAST(:size AS integer) OFFSET CAST(:offset AS integer)',
    { employeeId, size, offset: page * size },
  );
  const counted = (await db.query(
    'SELECT COUNT(*) AS ' + Q + 'total' + Q + ' FROM ' + spec.table + where,
    { employeeId },
  )) as Obj[];
  return { items, page, size, total: Number(counted[0]['total']) };
}

async function createRow(db: Db, userId: UserId, spec: Spec, data: Obj): Promise<Obj> {
  const employeeId = employeeIdOf(data, 422, 'REQUIRED_FIELD_MISSING');
  const cols = ['employee_id'];
  const exprs = ['CAST(:employeeId AS bigint)'];
  const params: Obj = { employeeId };
  const values: Obj = {};
  for (const fd of spec.fields) {
    const v = cleanValue(fd, data[fd.key]);
    if (v === null) {
      if (fd.req) {
        throw new ApiError(422, 'REQUIRED_FIELD_MISSING', '필수 항목이 누락되었습니다: ' + fd.key);
      }
      continue;
    }
    values[fd.key] = v;
    params[fd.key] = v;
    cols.push(fd.col);
    exprs.push(valueExpr(fd));
  }
  checkRange(spec, values);
  await employeeMustExist(db, employeeId);
  cols.push('created_at', 'updated_at');
  exprs.push('now()', 'now()');
  const rows = (await db.query(
    'INSERT INTO ' + spec.table + ' (' + cols.join(', ') + ') VALUES (' + exprs.join(', ') + ') RETURNING ' +
      spec.idCol + ' AS ' + Q + spec.idKey + Q,
    params,
  )) as Obj[];
  const newId = Number(rows[0][spec.idKey]);
  const after = await snapshot(db, spec, newId);
  await logChange(db, userId, spec, newId, CHANGE_CREATE, '등록 내용: ' + JSON.stringify(after));
  const out: Obj = {};
  out[spec.idKey] = newId;
  return out;
}

async function updateRow(db: Db, userId: UserId, spec: Spec, rawId: string | undefined, data: Obj): Promise<Obj> {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw bad('경로 변수가 올바르지 않습니다.');
  }
  const sets: string[] = [];
  const params: Obj = { id };
  const values: Obj = {};
  for (const fd of spec.fields) {
    if (data[fd.key] === undefined) {
      continue;
    }
    const v = cleanValue(fd, data[fd.key]);
    if (v === null && fd.req) {
      throw bad('필수 항목은 비울 수 없습니다: ' + fd.key);
    }
    values[fd.key] = v;
    params[fd.key] = v;
    sets.push(fd.col + ' = ' + valueExpr(fd));
  }
  if (sets.length === 0) {
    throw bad('수정할 값이 없습니다.');
  }
  checkRange(spec, values);
  const before = await snapshot(db, spec, id);
  if (before === null) {
    throw new ApiError(404, spec.code, spec.label);
  }
  sets.push('updated_at = now()');
  await db.execute(
    'UPDATE ' + spec.table + ' SET ' + sets.join(', ') + ' WHERE ' + spec.idCol + ' = CAST(:id AS bigint)',
    params,
  );
  const after = await snapshot(db, spec, id);
  await logChange(db, userId, spec, id, CHANGE_UPDATE, '변경 전: ' + JSON.stringify(before) + ' 변경 후: ' + JSON.stringify(after));
  const out: Obj = {};
  out[spec.idKey] = id;
  return out;
}

async function removeRow(db: Db, userId: UserId, spec: Spec, rawId: string | undefined): Promise<Obj> {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw bad('경로 변수가 올바르지 않습니다.');
  }
  const before = await snapshot(db, spec, id);
  if (before === null) {
    throw new ApiError(404, spec.code, spec.label);
  }
  await db.execute(
    'DELETE FROM ' + spec.table + ' WHERE ' + spec.idCol + ' = CAST(:id AS bigint)',
    { id },
  );
  await logChange(db, userId, spec, id, CHANGE_DELETE, '삭제 내용: ' + JSON.stringify(before));
  return {};
}

@Controller('api/v1')
export class FnSfr01205Controller {
  @Get('/employee-families')
  async listEmployeeFamilies(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      await logAccess(db, user.id, q, '가족 정보');
      return listRows(db, FAMILY, q);
    });
  }

  @Post('/employee-families')
  @HttpCode(200)
  async createEmployeeFamily(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return createRow(db, user.id, FAMILY, data);
    });
  }

  @Patch('/employee-families/:employeeFamilyId')
  async updateEmployeeFamily(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeFamilyId'];
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return updateRow(db, user.id, FAMILY, id, data);
    });
  }

  @Delete('/employee-families/:employeeFamilyId')
  async deleteEmployeeFamily(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeFamilyId'];
    return transaction(async (db) => {
      return removeRow(db, user.id, FAMILY, id);
    });
  }

  @Get('/employee-educations')
  async listEmployeeEducations(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      return listRows(db, EDUCATION, q);
    });
  }

  @Post('/employee-educations')
  @HttpCode(200)
  async createEmployeeEducation(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return createRow(db, user.id, EDUCATION, data);
    });
  }

  @Patch('/employee-educations/:employeeEducationId')
  async updateEmployeeEducation(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeEducationId'];
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return updateRow(db, user.id, EDUCATION, id, data);
    });
  }

  @Delete('/employee-educations/:employeeEducationId')
  async deleteEmployeeEducation(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeEducationId'];
    return transaction(async (db) => {
      return removeRow(db, user.id, EDUCATION, id);
    });
  }

  @Get('/employee-careers')
  async listEmployeeCareers(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      return listRows(db, CAREER, q);
    });
  }

  @Post('/employee-careers')
  @HttpCode(200)
  async createEmployeeCareer(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return createRow(db, user.id, CAREER, data);
    });
  }

  @Patch('/employee-careers/:employeeCareerId')
  async updateEmployeeCareer(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeCareerId'];
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return updateRow(db, user.id, CAREER, id, data);
    });
  }

  @Delete('/employee-careers/:employeeCareerId')
  async deleteEmployeeCareer(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeCareerId'];
    return transaction(async (db) => {
      return removeRow(db, user.id, CAREER, id);
    });
  }

  @Get('/employee-licenses')
  async listEmployeeLicenses(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      return listRows(db, LICENSE, q);
    });
  }

  @Post('/employee-licenses')
  @HttpCode(200)
  async createEmployeeLicense(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return createRow(db, user.id, LICENSE, data);
    });
  }

  @Patch('/employee-licenses/:employeeLicenseId')
  async updateEmployeeLicense(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeLicenseId'];
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return updateRow(db, user.id, LICENSE, id, data);
    });
  }

  @Delete('/employee-licenses/:employeeLicenseId')
  async deleteEmployeeLicense(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeLicenseId'];
    return transaction(async (db) => {
      return removeRow(db, user.id, LICENSE, id);
    });
  }

  @Get('/employee-languages')
  async listEmployeeLanguages(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      return listRows(db, LANGUAGE, q);
    });
  }

  @Post('/employee-languages')
  @HttpCode(200)
  async createEmployeeLanguage(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return createRow(db, user.id, LANGUAGE, data);
    });
  }

  @Patch('/employee-languages/:employeeLanguageId')
  async updateEmployeeLanguage(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeLanguageId'];
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return updateRow(db, user.id, LANGUAGE, id, data);
    });
  }

  @Delete('/employee-languages/:employeeLanguageId')
  async deleteEmployeeLanguage(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeLanguageId'];
    return transaction(async (db) => {
      return removeRow(db, user.id, LANGUAGE, id);
    });
  }

  @Get('/employee-evaluations')
  async listEmployeeEvaluations(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      return listRows(db, EVALUATION, q);
    });
  }

  @Post('/employee-evaluations')
  @HttpCode(200)
  async createEmployeeEvaluation(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return createRow(db, user.id, EVALUATION, data);
    });
  }

  @Patch('/employee-evaluations/:employeeEvaluationId')
  async updateEmployeeEvaluation(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeEvaluationId'];
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return updateRow(db, user.id, EVALUATION, id, data);
    });
  }

  @Delete('/employee-evaluations/:employeeEvaluationId')
  async deleteEmployeeEvaluation(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeEvaluationId'];
    return transaction(async (db) => {
      return removeRow(db, user.id, EVALUATION, id);
    });
  }

  @Get('/employee-reward-penalties')
  async listEmployeeRewardPenalties(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      return listRows(db, REWARD, q);
    });
  }

  @Post('/employee-reward-penalties')
  @HttpCode(200)
  async createEmployeeRewardPenalty(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return createRow(db, user.id, REWARD, data);
    });
  }

  @Patch('/employee-reward-penalties/:employeeRewardPenaltyId')
  async updateEmployeeRewardPenalty(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeRewardPenaltyId'];
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return updateRow(db, user.id, REWARD, id, data);
    });
  }

  @Delete('/employee-reward-penalties/:employeeRewardPenaltyId')
  async deleteEmployeeRewardPenalty(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeRewardPenaltyId'];
    return transaction(async (db) => {
      return removeRow(db, user.id, REWARD, id);
    });
  }

  @Get('/employee-business-trips')
  async listEmployeeBusinessTrips(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      return listRows(db, TRIP, q);
    });
  }

  @Post('/employee-business-trips')
  @HttpCode(200)
  async createEmployeeBusinessTrip(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return createRow(db, user.id, TRIP, data);
    });
  }

  @Patch('/employee-business-trips/:employeeBusinessTripId')
  async updateEmployeeBusinessTrip(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeBusinessTripId'];
    const data = checks.inputOf(req.body);
    return transaction(async (db) => {
      return updateRow(db, user.id, TRIP, id, data);
    });
  }

  @Delete('/employee-business-trips/:employeeBusinessTripId')
  async deleteEmployeeBusinessTrip(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const id = req.params['employeeBusinessTripId'];
    return transaction(async (db) => {
      return removeRow(db, user.id, TRIP, id);
    });
  }

  @Get('/personnel-appointments')
  async listPersonnelAppointments(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      return listRows(db, APPOINTMENT, q);
    });
  }

  @Get('/education-attendees')
  async listEducationAttendees(@Req() req: Request) {
    const user = currentUser(req);
    user.require(ROLE);
    const q = checks.queryOf(req.query);
    return transaction(async (db) => {
      return listRows(db, ATTENDEE, q);
    });
  }
}
