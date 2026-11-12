import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 업로드 파일 원본 이름은 요청에 없어 고정 이름을 쓴다.
const DEFAULT_FILE_NAME = 'upload.xlsx';
// 가정: 양식 열 이름. 파일 내용은 첫 줄이 머리글인 표(탭 또는 쉼표 구분) 텍스트로 받는다.
const RECORD_HEADERS = ['사번', '입사일', '채용구분', '채용비고', '보훈정보', '병역정보', '재직구분', '퇴사일'];
const RECORD_REQUIRED = ['사번', '입사일'];
const INFO_HEADERS = ['사번', '임직원명', '이메일', '휴대전화번호'];
const INFO_REQUIRED = ['사번', '임직원명'];
// 가정: 변경 이력 구분값
const CHANGE_TYPE = '일괄 변경';

type Cells = Record<string, string>;

function isValidDate(text: string): boolean {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(text);
  if (!m) {
    return false;
  }
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

@Controller('api/v1')
export class FnSfr01206Controller {
  @Post('/upload-histories/personnel-records')
  @HttpCode(200)
  async uploadPersonnelRecords(@Req() req: Request) {
    const user = currentUser(req);
    user.require('인사 담당자');
    const data = checks.inputOf(req.body);
    const file = typeof data['file'] === 'string' ? (data['file'] as string) : '';
    const target = typeof data['uploadTarget'] === 'string' ? (data['uploadTarget'] as string) : '';
    if (file.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '업로드 파일을 입력해 주세요.');
    }
    if (target !== '인사정보' && target !== '인사기록카드') {
      throw new ApiError(400, 'VALIDATION_FAILED', '업로드 대상 구분은 인사정보 또는 인사기록카드여야 합니다.');
    }
    const isRecord = target === '인사기록카드';
    const headers = isRecord ? RECORD_HEADERS : INFO_HEADERS;
    const required = isRecord ? RECORD_REQUIRED : INFO_REQUIRED;

    const lines = file
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
    const separator = lines[0].indexOf('\t') >= 0 ? '\t' : ',';
    const headerCells = lines[0].split(separator).map((c) => c.trim());
    for (const name of required) {
      if (headerCells.indexOf(name) < 0) {
        throw new ApiError(422, 'INVALID_UPLOAD_FORMAT', '양식 형식이 맞지 않습니다. 필수 열 \'' + name + '\'이(가) 없습니다.');
      }
    }
    for (const name of headerCells) {
      if (headers.indexOf(name) < 0) {
        throw new ApiError(422, 'INVALID_UPLOAD_FORMAT', '양식 형식이 맞지 않습니다. 알 수 없는 열 \'' + name + '\'이(가) 있습니다.');
      }
    }
    if (lines.length < 2) {
      throw new ApiError(422, 'INVALID_UPLOAD_FORMAT', '양식 형식이 맞지 않습니다. 데이터 행이 없습니다.');
    }

    return transaction(async (db) => {
      const errors: string[] = [];
      let success = 0;
      const total = lines.length - 1;

      for (let i = 1; i < lines.length; i += 1) {
        const rowNo = i + 1;
        const cells = lines[i].split(separator).map((c) => c.trim());
        const row: Cells = {};
        headerCells.forEach((name, idx) => {
          row[name] = cells[idx] === undefined ? '' : cells[idx];
        });

        const missing = required.filter((name) => row[name] === undefined || row[name] === '');
        if (missing.length > 0) {
          errors.push('행 ' + rowNo + ': 필수값 누락(' + missing.join(', ') + ')');
          continue;
        }
        const employees = await db.query(
          'SELECT employee_id AS "employeeId" FROM employee WHERE employee_no = :employeeNo',
          { employeeNo: row['사번'] },
        );
        if (employees.length === 0) {
          errors.push('행 ' + rowNo + ': 사번 ' + row['사번'] + '에 해당하는 임직원이 없습니다.');
          continue;
        }
        const employeeId = employees[0]['employeeId'];

        if (isRecord) {
          const status = row['재직구분'] ? row['재직구분'] : '재직자';
          const hireDate = row['입사일'];
          const resignation = row['퇴사일'] ? row['퇴사일'] : '';
          let problem = '';
          if (!isValidDate(hireDate)) {
            problem = '입사일 형식이 올바르지 않습니다(YYYY-MM-DD).';
          } else if (status !== '재직자' && status !== '퇴직자') {
            problem = '재직구분은 재직자 또는 퇴직자여야 합니다.';
          } else if (resignation !== '' && !isValidDate(resignation)) {
            problem = '퇴사일 형식이 올바르지 않습니다(YYYY-MM-DD).';
          } else if (status === '퇴직자' && resignation === '') {
            problem = '퇴직자는 퇴사일이 필요합니다.';
          } else if (resignation !== '' && resignation < hireDate) {
            problem = '퇴사일은 입사일 이후여야 합니다.';
          } else if ((row['채용구분'] || '').length > 50) {
            problem = '채용구분이 너무 깁니다.';
          } else if ((row['보훈정보'] || '').length > 200 || (row['병역정보'] || '').length > 200) {
            problem = '보훈정보·병역정보가 너무 깁니다.';
          }
          if (problem !== '') {
            errors.push('행 ' + rowNo + ': ' + problem);
            continue;
          }
          const saved = await db.query(
            'INSERT INTO personnel_record (employee_id, hire_date, recruitment_type, recruitment_note, veteran_info, military_service_info, employment_status, resignation_date, created_at, updated_at) ' +
              'VALUES (CAST(:employeeId AS bigint), CAST(:hireDate AS date), :recruitmentType, :recruitmentNote, :veteranInfo, :militaryInfo, :status, CAST(:resignationDate AS date), now(), now()) ' +
              'ON CONFLICT (employee_id) DO UPDATE SET hire_date = EXCLUDED.hire_date, recruitment_type = EXCLUDED.recruitment_type, ' +
              'recruitment_note = EXCLUDED.recruitment_note, veteran_info = EXCLUDED.veteran_info, military_service_info = EXCLUDED.military_service_info, ' +
              'employment_status = EXCLUDED.employment_status, resignation_date = EXCLUDED.resignation_date, updated_at = now() ' +
              'RETURNING personnel_record_id AS "personnelRecordId"',
            {
              employeeId: String(employeeId),
              hireDate,
              recruitmentType: row['채용구분'] || null,
              recruitmentNote: row['채용비고'] || null,
              veteranInfo: row['보훈정보'] || null,
              militaryInfo: row['병역정보'] || null,
              status,
              resignationDate: resignation === '' ? null : resignation,
            },
          );
          await db.execute(
            'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) ' +
              'VALUES (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), :changeType, now(), :content, now(), now())',
            {
              userId: user.id,
              targetType: 'personnel_record',
              targetId: String(saved[0]['personnelRecordId']),
              changeType: CHANGE_TYPE,
              content: '엑셀 업로드로 인사기록카드 반영(사번 ' + row['사번'] + ', 입사일 ' + hireDate + ', 재직구분 ' + status + ')',
            },
          );
          success += 1;
        } else {
          let problem = '';
          if (row['임직원명'].length > 100) {
            problem = '임직원명이 너무 깁니다.';
          } else if ((row['이메일'] || '').length > 255) {
            problem = '이메일이 너무 깁니다.';
          } else if ((row['휴대전화번호'] || '').length > 20) {
            problem = '휴대전화번호가 너무 깁니다.';
          }
          if (problem !== '') {
            errors.push('행 ' + rowNo + ': ' + problem);
            continue;
          }
          await db.execute(
            'UPDATE employee SET name = :name, email = :email, mobile_phone = :mobile, updated_at = now() WHERE employee_id = CAST(:employeeId AS bigint)',
            {
              name: row['임직원명'],
              email: row['이메일'] || null,
              mobile: row['휴대전화번호'] || null,
              employeeId: String(employeeId),
            },
          );
          // 가정: 인사정보 변경은 대상 유형 employee로 이력을 남긴다.
          await db.execute(
            'INSERT INTO change_history (changer_id, target_type, target_id, change_type, changed_at, change_content, created_at, updated_at) ' +
              'VALUES (CAST(:userId AS bigint), :targetType, CAST(:targetId AS bigint), :changeType, now(), :content, now(), now())',
            {
              userId: user.id,
              targetType: 'employee',
              targetId: String(employeeId),
              changeType: CHANGE_TYPE,
              content: '엑셀 업로드로 인사정보 반영(사번 ' + row['사번'] + ')',
            },
          );
          success += 1;
        }
      }

      const saved = await db.query(
        'INSERT INTO upload_history (uploader_id, target_business, file_name, uploaded_at, total_count, success_count, error_count, error_detail, process_mode, created_at, updated_at) ' +
          'VALUES (CAST(:userId AS bigint), :targetBusiness, :fileName, now(), CAST(:total AS integer), CAST(:success AS integer), CAST(:errorCount AS integer), :errorDetail, :processMode, now(), now()) ' +
          'RETURNING upload_history_id AS "uploadHistoryId", total_count AS "totalCount", success_count AS "successCount", error_count AS "errorCount", error_detail AS "errorDetail"',
        {
          userId: user.id,
          targetBusiness: 'PERSONNEL_RECORD',
          fileName: DEFAULT_FILE_NAME,
          total: String(total),
          success: String(success),
          errorCount: String(errors.length),
          errorDetail: errors.length === 0 ? null : errors.join('\n'),
          processMode: 'EXCLUDE_ERROR',
        },
      );
      return saved[0];
    });
  }
}
