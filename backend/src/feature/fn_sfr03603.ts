import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

// 가정: 쪽지의 메시지 구분 고정값
const MESSAGE_TYPE_NOTE = 'NOTE';
// 가정: 수신자 행은 안읽음으로 시작
const READ_STATUS_UNREAD = '안읽음';
// 가정: 첨부파일의 업무 대상 유형 코드 (코드 집합 미확정)
const ATTACHMENT_TARGET_TYPE = 'MESSENGER_MESSAGE';
// 가정: 부서 선택 시 재직자만 수신 대상으로 전개
const ACTIVE_STATUS = '재직자';
const RESULT_OK = '성공';
const RESULT_FAIL = '실패';

interface FileInput {
  fileName: string;
  fileExtension: string | null;
  fileSize: number | null;
  ecmRef: string | null;
  fileHash: string | null;
}

interface SendResult {
  recipientId: number;
  status: string;
  reason: string | null;
}

function invalid(message: string): ApiError {
  return new ApiError(400, 'VALIDATION_FAILED', message);
}

function idsOf(value: unknown, label: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  const ids: string[] = [];
  for (const item of value) {
    let id = '';
    if (typeof item === 'number' && Number.isInteger(item) && item > 0) {
      id = String(item);
    } else if (typeof item === 'string' && /^[0-9]+$/.test(item)) {
      id = item;
    } else {
      throw invalid(label + ' 형식이 올바르지 않습니다.');
    }
    if (!ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

function optionalText(value: unknown, max: number, label: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || value.length > max) {
    throw invalid(label + ' 형식이 올바르지 않습니다.');
  }
  return value;
}

function filesOf(value: unknown): FileInput[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw invalid('첨부 파일 형식이 올바르지 않습니다.');
  }
  return value.map((item: unknown) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw invalid('첨부 파일 형식이 올바르지 않습니다.');
    }
    const file = item as Record<string, unknown>;
    const fileName = optionalText(file['fileName'], 255, '파일명');
    if (fileName === null || fileName.trim() === '') {
      throw invalid('파일명을 입력해 주세요.');
    }
    let fileSize: number | null = null;
    const rawSize = file['fileSize'];
    if (rawSize !== undefined && rawSize !== null && rawSize !== '') {
      const size = Number(rawSize);
      if (!Number.isInteger(size) || size < 0) {
        throw invalid('파일 크기는 0 이상의 정수여야 합니다.');
      }
      fileSize = size;
    }
    return {
      fileName,
      fileExtension: optionalText(file['fileExtension'], 20, '확장자'),
      fileSize,
      ecmRef: optionalText(file['ecmRef'], 500, 'ECM 참조'),
      fileHash: optionalText(file['fileHash'], 128, '파일 해시'),
    };
  });
}

@Controller('api/v1')
export class FnSfr03603Controller {
  @Post('/messenger-messages/send-notes')
  @HttpCode(200)
  async sendMessengerNotes(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const data = checks.inputOf(req.body);
    const content = data['content'];
    if (typeof content !== 'string' || content.trim() === '') {
      throw invalid('메시지 내용을 입력해 주세요.');
    }
    const employeeIds = idsOf(data['employeeIds'], '수신 임직원');
    const departmentIds = idsOf(data['departmentIds'], '수신 부서');
    const files = filesOf(data['files']);
    if (employeeIds.length === 0 && departmentIds.length === 0) {
      throw new ApiError(422, 'RECIPIENT_REQUIRED', '수신 대상을 선택해 주세요.');
    }
    return transaction(async (db) => {
      const results: SendResult[] = [];
      const deliver = new Map<string, number>();
      if (departmentIds.length > 0) {
        const found = await db.query(
          'SELECT department_id AS "departmentId" FROM department WHERE department_id = ANY(CAST(:ids AS bigint[]))',
          { ids: departmentIds },
        );
        if (found.length !== departmentIds.length) {
          throw new ApiError(404, 'NOT_FOUND', '존재하지 않는 부서가 있습니다.');
        }
        const members = await db.query(
          'SELECT employee_id AS "employeeId" FROM employee WHERE department_id = ANY(CAST(:ids AS bigint[])) AND employment_status = :status ORDER BY employee_id',
          { ids: departmentIds, status: ACTIVE_STATUS },
        );
        for (const row of members) {
          deliver.set(String(row.employeeId), Number(row.employeeId));
        }
      }
      if (employeeIds.length > 0) {
        const found = await db.query(
          'SELECT employee_id AS "employeeId", employment_status AS "employmentStatus" FROM employee WHERE employee_id = ANY(CAST(:ids AS bigint[]))',
          { ids: employeeIds },
        );
        const byId = new Map<string, string>();
        for (const row of found) {
          byId.set(String(row.employeeId), String(row.employmentStatus));
        }
        for (const id of employeeIds) {
          const status = byId.get(id);
          if (status === undefined) {
            results.push({ recipientId: Number(id), status: RESULT_FAIL, reason: '존재하지 않는 임직원입니다.' });
          } else if (status !== ACTIVE_STATUS) {
            results.push({ recipientId: Number(id), status: RESULT_FAIL, reason: '퇴직한 임직원입니다.' });
          } else {
            deliver.set(id, Number(id));
          }
        }
      }
      if (deliver.size === 0) {
        throw new ApiError(422, 'RECIPIENT_REQUIRED', '전송할 수 있는 수신 대상이 없습니다.');
      }
      const inserted = await db.query(
        'INSERT INTO messenger_message (sender_id, message_type, content, sent_at, created_at, updated_at) VALUES (CAST(:userId AS bigint), :messageType, :content, now(), now(), now()) RETURNING messenger_message_id AS "messengerMessageId"',
        { userId: user.id, messageType: MESSAGE_TYPE_NOTE, content },
      );
      const messengerMessageId = Number(inserted[0].messengerMessageId);
      for (const recipientId of deliver.values()) {
        await db.execute(
          'INSERT INTO messenger_message_recipient (messenger_message_id, recipient_id, read_status, created_at, updated_at) VALUES (CAST(:messageId AS bigint), CAST(:recipientId AS bigint), :readStatus, now(), now())',
          { messageId: messengerMessageId, recipientId, readStatus: READ_STATUS_UNREAD },
        );
        results.push({ recipientId, status: RESULT_OK, reason: null });
      }
      for (const file of files) {
        await db.execute(
          'INSERT INTO attachment (uploader_id, file_name, file_extension, file_size, ecm_ref, file_hash, target_type, target_id, created_at, updated_at) VALUES (CAST(:userId AS bigint), :fileName, :fileExtension, CAST(:fileSize AS bigint), :ecmRef, :fileHash, :targetType, CAST(:messageId AS bigint), now(), now())',
          {
            userId: user.id,
            fileName: file.fileName,
            fileExtension: file.fileExtension,
            fileSize: file.fileSize === null ? null : String(file.fileSize),
            ecmRef: file.ecmRef,
            fileHash: file.fileHash,
            targetType: ATTACHMENT_TARGET_TYPE,
            messageId: messengerMessageId,
          },
        );
      }
      return { messengerMessageId, results };
    });
  }
}
