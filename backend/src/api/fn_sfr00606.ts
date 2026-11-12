// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-006-06 엑셀 일괄 업로드 22*/
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, NOW, Table, col, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr00606';

const T_UPLOAD_HISTORY = new Table('upload_history', 'upload_history_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_UPLOAD_EXCEL_DATA: Col[] = [
  col('totalCount', 'upload_history.total_count', 'integer'),
  col('successCount', 'upload_history.success_count', 'integer'),
  col('errorCount', 'upload_history.error_count', 'integer'),
  col('errorDetail', 'upload_history.error_detail', 'text'),
];
const IN_UPLOAD_EXCEL_DATA: Col[] = [
  col('targetBusiness', 'target_business', 'varchar'),
  col('uploaderId', 'uploader_id', 'bigint'),
  col('fileName', 'file_name', 'varchar'),
];

@Controller('api/v1')
export class FnSfr00606Controller {
  /** POST /excel-uploads — 엑셀 파일로 업무 데이터를 일괄 등록하고 결과를 제공한다 */
  @Post('/excel-uploads')
  @HttpCode(200)
  async uploadExcelData(@Req() req: Request) {
    const user = currentUser(req);
    user.require('예산·회계 담당자', '인사 담당자', '근태 담당자', '급여 담당자', '자산 담당자');
    const data = checks.inputOf(req.body);
    if (data['uploaderId'] == null) {
      data['uploaderId'] = user.id;
    }
    checks.required(data, 'targetBusiness', 'file');
    checks.oneOf(data, 'targetBusiness', 'PARTNER', 'PERSONNEL_RECORD', 'ANNUAL_LEAVE', 'PAYROLL', 'ASSET', 'ATTENDANCE', 'CARRYOVER', 'COMMUTE_RECORD', 'EDUCATION_ATTENDEE', 'DAILY_WORKER_PAYMENT');
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.uploadExcelData(data, new Ctx(db, user), () => db.insert(T_UPLOAD_HISTORY, IN_UPLOAD_EXCEL_DATA, OUT_UPLOAD_EXCEL_DATA, data, { 'uploaded_at': NOW }, 'uploadExcelData', 'fileName')));
  }
}
