import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Pairs,
  Field,
  TextInput,
  Select,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

function Detail({ id, role, onBack }: { id: number; role: string; onBack: () => void }) {
  // 상세를 조회하면 서버가 읽음으로 바꾼다
  const { data, error, loading } = useData<Row>(
    () => call('GET', `/notifications/${id}`, role),
    [id],
  );
  return (
    <div className="doc">
      <button className="ghost" onClick={onBack}>
        목록으로 돌아가기
      </button>
      {loading && <p>알림을 불러오는 중입니다.</p>}
      {error && <ErrorText text={error} />}
      {data && (
        <>
          <section className="box">
            <h2>알림 내용</h2>
            <Pairs
              items={[
                ['알림 제목', String(data.title ?? '')],
                ['알림 내용', String(data.content ?? '')],
                ['읽음 상태', <Badge value={data.readStatus} />],
                ['읽은 일시', <DateText value={data.readAt} time />],
                ['생성 일시', <DateText value={data.createdAt} time />],
              ]}
            />
          </section>
          <section className="box">
            <h2>바로가기 대상</h2>
            <Pairs
              items={[
                ['알림 이벤트 유형', String(data.eventType ?? '')],
                ['바로가기 대상 유형', String(data.targetType ?? '')],
                ['바로가기 대상 ID', String(data.targetId ?? '')],
              ]}
            />
          </section>
        </>
      )}
    </div>
  );
}

export default function FnSfr02803Page({ role, notify }: PageProps) {
  const [readStatus, setReadStatus] = useState('');
  const [eventType, setEventType] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/notifications', role, undefined, { ...applied, page, size: 20 }),
    [applied, page],
  );

  if (selected !== null) {
    return (
      <Detail
        id={selected}
        role={role}
        onBack={() => {
          setSelected(null);
          reload();
        }}
      />
    );
  }

  return (
    <div className="doc">
      <h1>통합알림</h1>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied({ readStatus, eventType });
        }}
        onReset={() => {
          setReadStatus('');
          setEventType('');
          setPage(0);
          setApplied({});
        }}
      >
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
      <Band total={data?.total} />
      {error && <ErrorText text={error} />}
      {loading && <p>알림을 불러오는 중입니다.</p>}
      <DataTable
        columns={[
          { key: 'title', label: '알림 제목' },
          { key: 'channel', label: '알림 채널' },
          { key: 'readStatus', label: '읽음 상태', render: (r) => <Badge value={r.readStatus} /> },
          { key: 'eventType', label: '알림 이벤트 유형' },
          { key: 'createdAt', label: '생성 일시', render: (r) => <DateText value={r.createdAt} time /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={(r) => {
          setSelected(Number(r.notificationId));
          notify('알림을 열었습니다.');
        }}
        empty="받은 알림이 없습니다. 조회 조건을 바꿔 다시 조회해 보세요."
      />
      <Pager page={page} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
