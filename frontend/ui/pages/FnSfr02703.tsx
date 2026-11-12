import { call, useData, Badge, DateText, Pairs, RefName, ErrorText } from '../kit';
import type { PageProps, Row } from '../kit';

interface Widget {
  widgetType: string;
  visible: boolean;
  displayOrder: number;
  status: string;
  data: unknown;
}

interface PortalData {
  widgets: Widget[];
  banners: Row[];
}

export default function FnSfr02703Page({ role, notify }: PageProps) {
  const { data, error, loading, reload } = useData<PortalData>(
    () => call<PortalData>('GET', '/portal', role),
    [role],
  );

  function renderBody(widget: Widget) {
    if (widget.status === 'error') {
      return <ErrorText text='이 위젯의 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' />;
    }
    if (widget.widgetType === '나의정보') {
      const me = widget.data as Row | null;
      if (!me) return <p>표시할 정보가 없습니다.</p>;
      return (
        <Pairs
          items={[
            ['사번', String(me.employeeNo ?? '')],
            ['이름', String(me.name ?? '')],
            ['부서', <RefName table='department' role={role} value={me.departmentId} />],
            ['재직 구분', <Badge value={me.employmentStatus} />],
            ['이메일', String(me.email ?? '')],
            ['휴대전화', String(me.mobilePhone ?? '')],
          ]}
        />
      );
    }
    if (widget.widgetType === '통합알림') {
      const noti = widget.data as { unreadCount: number; items: Row[] } | null;
      const items = noti?.items ?? [];
      return (
        <div>
          <p>안 읽은 알림 {noti?.unreadCount ?? 0}건</p>
          {items.length === 0 ? <p>받은 알림이 없습니다.</p> : null}
          <ul>
            {items.map((n) => (
              <li key={String(n.notificationId)}>
                <Badge value={n.readStatus} /> {String(n.title ?? '')} <DateText value={n.createdAt} time />
              </li>
            ))}
          </ul>
        </div>
      );
    }
    const rows = (widget.data as Row[] | null) ?? [];
    if (rows.length === 0) return <p>표시할 내용이 없습니다.</p>;
    if (widget.widgetType === '결재양식') {
      return (
        <ul>
          {rows.map((r) => (
            <li key={String(r.approvalFormId)}>{String(r.formName ?? '')}</li>
          ))}
        </ul>
      );
    }
    if (widget.widgetType === '결재함') {
      return (
        <ul>
          {rows.map((r) => (
            <li key={String(r.approvalDocumentId)}>
              <Badge value={r.approvalStatus} /> {String(r.title ?? '')} (<RefName table='approval_form' role={role} value={r.approvalFormId} />)
            </li>
          ))}
        </ul>
      );
    }
    if (widget.widgetType === '일정캘린더') {
      return (
        <ul>
          {rows.map((r) => (
            <li key={String(r.scheduleId)}>
              <DateText value={r.startAt} time={!r.allDay} /> {String(r.title ?? '')}
              {r.location ? ' · ' + String(r.location) : ''}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <ul>
        {rows.map((r) => (
          <li key={String(r.quickLinkId)}>
            <a href={String(r.linkUrl ?? '')}>{String(r.title ?? '')}</a>
          </li>
        ))}
      </ul>
    );
  }

  const widgets = (data?.widgets ?? []).filter((w) => w.visible);
  const banners = data?.banners ?? [];

  return (
    <div className='doc'>
      <h1>포털</h1>
      <button
        className='ghost'
        onClick={() => {
          reload();
          notify('포털을 새로 읽었습니다.');
        }}
      >
        새로 읽기
      </button>
      {loading ? <p>불러오는 중입니다.</p> : null}
      {error ? <ErrorText text={error} /> : null}
      {data && banners.length > 0 ? (
        <section className='box'>
          <h2>배너</h2>
          <ul>
            {banners.map((b) => (
              <li key={String(b.portalBannerId)}>
                <a href={String(b.linkUrl ?? '')}>{String(b.title ?? '')}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {data && widgets.length === 0 ? <p>표시할 위젯이 없습니다. 포털 설정에서 위젯을 켜 주세요.</p> : null}
      {widgets.map((w) => (
        <section className='box' key={w.widgetType}>
          <h2>{w.widgetType}</h2>
          {renderBody(w)}
        </section>
      ))}
    </div>
  );
}
