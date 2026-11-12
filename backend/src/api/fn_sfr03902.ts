// 코드가 만든 파일 (스펙에서 생성). 고치지 말고 스펙을 고치세요. 업무 규칙은 src/logic에 있습니다.
/** FN-SFR-039-02 조직원 검색 및 활동 내역 조회 */
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

import * as checks from '../common/checks';
import { Ctx } from '../common/ctx';
import { Col, Table, transaction } from '../common/db';
import { currentUser } from '../common/user';
import * as logic from '../logic/fn_sfr03902';

const T_EMPLOYEE = new Table('employee', 'employee_id', 'bigint', ['created_at', 'updated_at'], ['updated_at']);
const OUT_LIST_EMPLOYEE_ACTIVITIES: Col[] = [];
const FILTER_LIST_EMPLOYEE_ACTIVITIES: Col[] = [];

@Controller('api/v1')
export class FnSfr03902Controller {
  /** GET /employees/{employeeId}/activities — 조직원의 전자결재·게시판 업무활동 내역을 권한 범위 내에서 조회한다 */
  @Get('/employees/:employeeId/activities')
  async listEmployeeActivities(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.queryOf(req.query);
    data['employeeId'] = req.params['employeeId'];
    // 업무 로직·자동 처리까지 한 묶음: 예외가 나면 모두 되돌린다
    return transaction((db) => logic.listEmployeeActivities(data, new Ctx(db, user), () => db.page(T_EMPLOYEE, OUT_LIST_EMPLOYEE_ACTIVITIES, FILTER_LIST_EMPLOYEE_ACTIVITIES, data)));
  }
}
