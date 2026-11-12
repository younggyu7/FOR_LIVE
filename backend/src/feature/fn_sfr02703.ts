import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import * as checks from '../common/checks';
import { transaction } from '../common/db';
import { ApiError } from '../common/errors';
import { currentUser } from '../common/user';

interface Db {
  query(sql: string, params?: Record<string, unknown>): Promise<any[]>;
}

const WIDGET_TYPES = ['결재양식', '결재함', '일정캘린더', '통합알림', '퀵링크', '나의정보'];
// 가정: 위젯 설정이 없으면 6종 모두 표시하고 기본 순서대로 배치한다
const DEFAULT_VISIBLE = true;
// 가정: 위젯 한 개에 보여 줄 항목은 최대 10건
const WIDGET_LIMIT = 10;

async function loadWidget(db: Db, widgetType: string, userId: string): Promise<unknown> {
  const params = { userId, limit: WIDGET_LIMIT };
  if (widgetType === '결재양식') {
    return db.query(
      `SELECT approval_form_id AS "approvalFormId", form_name AS "formName" FROM approval_form WHERE use_status = '사용' ORDER BY approval_form_id LIMIT CAST(:limit AS integer)`,
      params,
    );
  }
  if (widgetType === '결재함') {
    // 본인이 기안한 문서만 (본인 권한 범위)
    return db.query(
      `SELECT approval_document_id AS "approvalDocumentId", document_no AS "documentNo", approval_form_id AS "approvalFormId", title, approval_status AS "approvalStatus", submitted_at AS "submittedAt" FROM approval_document WHERE drafter_id = CAST(:userId AS bigint) ORDER BY approval_document_id DESC LIMIT CAST(:limit AS integer)`,
      params,
    );
  }
  if (widgetType === '일정캘린더') {
    return db.query(
      `SELECT schedule_id AS "scheduleId", title, start_at AS "startAt", end_at AS "endAt", all_day AS "allDay", location FROM schedule WHERE owner_id = CAST(:userId AS bigint) AND end_at >= now() ORDER BY start_at LIMIT CAST(:limit AS integer)`,
      params,
    );
  }
  if (widgetType === '통합알림') {
    const items = await db.query(
      `SELECT notification_id AS "notificationId", channel, title, content, read_status AS "readStatus", read_at AS "readAt", event_type AS "eventType", target_type AS "targetType", target_id AS "targetId", created_at AS "createdAt" FROM notification WHERE recipient_id = CAST(:userId AS bigint) ORDER BY notification_id DESC LIMIT CAST(:limit AS integer)`,
      params,
    );
    const counts = await db.query(
      `SELECT COUNT(*) AS "unread" FROM notification WHERE recipient_id = CAST(:userId AS bigint) AND read_status = '안읽음'`,
      { userId },
    );
    return { unreadCount: Number(counts[0]?.unread ?? 0), items };
  }
  if (widgetType === '퀵링크') {
    return db.query(
      `SELECT quick_link_id AS "quickLinkId", title, link_url AS "linkUrl", sort_order AS "sortOrder" FROM quick_link WHERE employee_id = CAST(:userId AS bigint) ORDER BY sort_order ASC NULLS LAST, quick_link_id`,
      { userId },
    );
  }
  const rows = await db.query(
    `SELECT employee_id AS "employeeId", employee_no AS "employeeNo", name, department_id AS "departmentId", employment_status AS "employmentStatus", email, mobile_phone AS "mobilePhone" FROM employee WHERE employee_id = CAST(:userId AS bigint)`,
    { userId },
  );
  return rows[0] ?? null;
}

@Controller('api/v1')
export class FnSfr02703Controller {
  @Get('/portal')
  async getPortal(@Req() req: Request) {
    const user = currentUser(req);
    user.require('임직원');
    const userId = user.id;
    if (!userId) {
      throw new ApiError(401, 'UNAUTHORIZED', '로그인이 필요합니다.');
    }
    checks.queryOf(req.query);
    return transaction(async (db) => {
      const settings = await db.query(
        `SELECT widget_type AS "widgetType", visible_yn AS "visible", display_order AS "displayOrder" FROM portal_widget_setting WHERE employee_id = CAST(:userId AS bigint)`,
        { userId },
      );
      const widgets: Record<string, unknown>[] = [];
      for (let i = 0; i < WIDGET_TYPES.length; i++) {
        const widgetType = WIDGET_TYPES[i];
        const setting = settings.find((s: any) => s.widgetType === widgetType);
        const visible = setting ? setting.visible === true : DEFAULT_VISIBLE;
        const displayOrder = setting ? Number(setting.displayOrder) : i + 1;
        let status = 'ok';
        let data: unknown = null;
        if (visible) {
          try {
            data = await loadWidget(db, widgetType, userId);
          } catch (e) {
            // 가정: 위젯 데이터 조회 실패는 해당 위젯만 오류 상태로 표시한다
            status = 'error';
            data = null;
          }
        }
        widgets.push({ widgetType, visible, displayOrder, status, data });
      }
      widgets.sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
      // 가정: 사용 중이고 게시 기간 안(기간이 비어 있으면 제한 없음)인 배너만 표시
      const banners = await db.query(
        `SELECT portal_banner_id AS "portalBannerId", title, image_url AS "imageUrl", link_url AS "linkUrl", display_order AS "displayOrder", start_date AS "startDate", end_date AS "endDate" FROM portal_banner WHERE use_yn = '사용' AND (start_date IS NULL OR start_date <= CURRENT_DATE) AND (end_date IS NULL OR end_date >= CURRENT_DATE) ORDER BY display_order, portal_banner_id`,
        {},
      );
      return { widgets, banners };
    });
  }
}
