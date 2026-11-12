import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 임직원 한 명이 로그인에 쓸 수 있는 승인·사용 기기는 최대 3대
const MAX_DEVICES = 3;
// 가정: OTP는 숫자 6자리 형식으로만 검사한다 (유효·만료 검증 수단은 입력에 없음)
const OTP_PATTERN = /^[0-9]{6}$/;
const LOGIN_TYPES = ['웹', '메신저', '모바일 앱'];

@Controller('api/v1')
export class FnSfr03701Controller {
  @Post('/auth/login')
  @HttpCode(200)
  async login(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const loginType = data['loginType'];
    const userId = data['userId'];
    const password = data['password'];
    const otpValue = data['otpValue'];
    const deviceIdentifier = data['deviceIdentifier'];
    if (typeof loginType !== 'string' || !LOGIN_TYPES.includes(loginType)) {
      throw new ApiError(400, 'VALIDATION_FAILED', '로그인 구분을 확인해 주세요.');
    }
    if (typeof userId !== 'string' || userId.trim() === '' || userId.length > 50) {
      throw new ApiError(400, 'VALIDATION_FAILED', '사번을 확인해 주세요.');
    }
    if (typeof password !== 'string' || password === '') {
      throw new ApiError(400, 'VALIDATION_FAILED', '비밀번호를 입력해 주세요.');
    }
    if (typeof deviceIdentifier !== 'string' || deviceIdentifier.trim() === '' || deviceIdentifier.length > 200) {
      throw new ApiError(400, 'VALIDATION_FAILED', '기기 식별정보를 확인해 주세요.');
    }
    if (otpValue !== undefined && otpValue !== null && typeof otpValue !== 'string') {
      throw new ApiError(400, 'VALIDATION_FAILED', 'OTP 값 형식이 올바르지 않습니다.');
    }
    return transaction(async (db) => {
      const employees = await db.query(
        'SELECT employee_id AS "employeeId", password_hash AS "passwordHash", employment_status AS "employmentStatus", two_factor_required AS "twoFactorRequired" FROM employee WHERE employee_no = :userId',
        { userId },
      );
      const employee = employees[0];
      // 가정: 암호화는 운영 DB 설정에서. 비밀번호 컬럼 값을 그대로 읽어 비교한다
      if (!employee || employee.passwordHash === null || employee.passwordHash !== password || employee.employmentStatus !== '재직자') {
        throw new ApiError(422, 'INVALID_CREDENTIALS', '사번 또는 비밀번호가 일치하지 않습니다.');
      }
      // 가정: 2차 인증 대상 값이 비어 있으면 대상으로 본다
      const twoFactor = employee.twoFactorRequired !== false;
      if (twoFactor) {
        const devices = await db.query(
          `SELECT device_identifier AS "deviceIdentifier" FROM auth_device WHERE employee_id = CAST(:employeeId AS bigint) AND approval_status = '승인' AND use_status = '사용' AND otp_enabled = true ORDER BY auth_device_id LIMIT :maxDevices`,
          { employeeId: String(employee.employeeId), maxDevices: MAX_DEVICES },
        );
        const allowed = devices.some((d) => d['deviceIdentifier'] === deviceIdentifier);
        if (!allowed) {
          throw new ApiError(422, 'AUTH_DEVICE_NOT_ALLOWED', '승인되지 않았거나 허용 기기 수를 넘은 기기입니다. 기기 승인을 요청하거나 관리자에게 문의해 주세요.');
        }
        if (typeof otpValue !== 'string' || !OTP_PATTERN.test(otpValue)) {
          throw new ApiError(422, 'INVALID_OTP', 'OTP가 유효하지 않거나 만료되었습니다.');
        }
      }
      // 가정: 토큰은 인증 성공 시 DB 함수로 만든 임의 문자열이다
      const tokens = await db.query(
        'SELECT md5(CAST(:employeeId AS text) || clock_timestamp()::text || random()::text) AS "token"',
        { employeeId: String(employee.employeeId) },
      );
      return { accessToken: tokens[0].token, employeeId: employee.employeeId };
    });
  }
}
