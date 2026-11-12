import { useState } from 'react';
import { Badge, Band, DataTable, DateText, Field, Filters, Form, Pager, Pairs, RefName, Select, TextInput, call, useData } from '../kit';
import type { Column, Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr02908Page({ role, notify }: PageProps) {
  const [readStatus, setReadStatus] = useState('');
  const [eventType, setEventType] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/notifications', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page, role],
  );

  const search = () => {
    setPage(0);
    setApplied({ readStatus, eventType });
  };

  const reset = () => {
    setReadStatus('');
    setEventType('');
    setPage(0);
    setApplied({});
  };

  const markRead = async (row: Row) => {
    await call('POST', `/notifications/${row['notificationId']}/read`, role, {});
    notify('알림을 읽음 처리했습니다.');
    setSelected(null);
    reload();
  };

  const columns: Column[] = [
    { key: 'title', label: '알림 제목' },
    { key: 'channel', label: '알림 채널' },
    { key: 'readStatus', label: '읽음 상태', render: (r) => <Badge value={r['readStatus']} /> },
    { key: 'createdAt', label: '생성 일시', render: (r) => <DateText value={r['createdAt']} time /> },
    {
      key: 'action',
      label: '처리',
      render: (r) =>
        r['readStatus'] === '안읽음' ? (
          <button
            className="ghost"
            onClick={(e) => {
              e.stopPropagation();
              markRead(r).catch((err) => notify(err instanceof Error ? err.message : '처리하지 못했습니다.'));
            }}
          >
            읽음 처리
          </button>
        ) : null,
    },
  ];

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>알림 내용</h2>
          <Pairs
            items={[
              ['알림 제목', String(selected['title'] ?? '')],
              ['알림 채널', String(selected['channel'] ?? '')],
              ['알림 이벤트 유형', String(selected['eventType'] ?? '')],
              ['알림 내용', String(selected['content'] ?? '')],
              ['읽음 상태', <Badge value={selected['readStatus']} />],
              ['생성 일시', <DateText value={selected['createdAt']} time />],
            ]}
          />
        </section>
        {selected['targetType'] === 'APPROVAL_DOCUMENT' && selected['targetId'] != null ? (
          <section className="box">
            <h2>바로가기 대상</h2>
            <Pairs
              items={[
                ['바로가기 대상 유형', '전자결재 문서'],
                ['결재 문서', <RefName table="approval_document" role={role} value={selected['targetId']} />],
              ]}
            />
          </section>
        ) : null}
        {selected['readStatus'] === '안읽음' ? (
          <section className="box">
            <h2>읽음 처리</h2>
            <Form submit="읽음 처리" onSubmit={() => markRead(selected)}>
              <p>이 알림을 읽음으로 표시합니다.</p>
            </Form>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>결재 관련 알림</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="읽음 상태">
            <Select
              value={readStatus}
              onChange={setReadStatus}
              options={[
                ['안읽음', '안읽음'],
                ['읽음', '읽음'],
              ]}
              placeholder="전체"
            />
          </Field>
          <Field label="알림 이벤트 유형">
            <TextInput value={eventType} onChange={setEventType} />
          </Field>
        </Filters>
        {error ? <p>{error}</p> : null}
        <Band total={data?.total} />
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty={loading ? '불러오는 중입니다.' : '받은 알림이 아직 없습니다.'}
        />
        <Pager page={data?.page ?? page} size={data?.size ?? SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
