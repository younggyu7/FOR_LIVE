import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 요청 IP를 알 수 없을 때 쓰는 값 (login_ip는 NOT NULL)
const UNKNOWN_IP = '0.0.0.0';

@Controller('api/v1')
export class FnSfr04001Controller {
  @Post('/auth/mobile-login')
  @HttpCode(200)
  async loginMobile(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const employeeNo = data['employeeNo'];
    const password = data['password'];
    const deviceIdentifier = data['deviceIdentifier'];
    if (typeof employeeNo !== 'string' || employeeNo.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '사번을 입력해 주세요.');
    }
    if (typeof password !== 'string' || password === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '비밀번호를 입력해 주세요.');
    }
    if (typeof deviceIdentifier !== 'string' || deviceIdentifier.trim() === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '기기 식별자를 입력해 주세요.');
    }
    const clientIp = req.ip ? req.ip.slice(0, 45) : UNKNOWN_IP;
    return transaction(async (db) => {
      // 가정: 비밀번호 해시는 pgcrypto crypt()로 검증한다 (평문은 저장·기록하지 않는다)
      const rows = await db.query(
        'SELECT employee_id AS "employeeId", name AS "name", ' +
          '(password_hash IS NOT NULL AND password_hash = crypt(:password, password_hash)) AS "matched" ' +
          'FROM employee WHERE employee_no = :employeeNo',
        { employeeNo: employeeNo.trim(), password },
      );
      const found = rows[0];
      if (!found || found['matched'] !== true) {
        throw new ApiError(422, 'INVALID_CREDENTIALS', '사번 또는 비밀번호가 일치하지 않습니다.');
      }
      // 2차 인증·인증기기 허용 여부 확인은 공통 규칙 P12가 맡는다.
      await db.execute(
        'INSERT INTO login_history (employee_id, login_at, login_ip, login_type, created_at, updated_at) ' +
          "VALUES (CAST(:employeeId AS bigint), now(), :loginIp, '모바일 앱', now(), now())",
        { employeeId: found['employeeId'], loginIp: clientIp },
      );
      // 가정: 인증 성공 시 세션 토큰을 DB에서 무작위로 발급한다
      const tokenRows = await db.query(
        "SELECT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '') AS \"accessToken\"",
        {},
      );
      return {
        accessToken: tokenRows[0]['accessToken'],
        employeeId: Number(found['employeeId']),
        name: found['name'],
      };
    });
  }

  @Post('/auth/mobile-logout')
  @HttpCode(200)
  async logoutMobile(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    return {};
  }
}
