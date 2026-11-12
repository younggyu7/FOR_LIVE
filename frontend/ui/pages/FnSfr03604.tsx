import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateText,
  Drawer,
  ErrorText,
  Field,
  Filters,
  Form,
  Pager,
  Pairs,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;
const EMPTY_TEXT = '조건에 맞는 내역이 없습니다. 조건을 바꿔 다시 조회해 주세요.';
const READ_OPTIONS: [string, string][] = [
  ['안읽음', '안읽음'],
  ['읽음', '읽음'],
];

export default function FnSfr03604Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'messages' | 'notifications'>('messages');
  return (
    <div>
      <h1>알림 이력 및 메시지 관리</h1>
      <p>
        <button className={tab === 'messages' ? '' : 'ghost'} onClick={() => setTab('messages')}>
          메시지
        </button>
        <button className={tab === 'notifications' ? '' : 'ghost'} onClick={() => setTab('notifications')}>
          알림
        </button>
      </p>
      {tab === 'messages' ? (
        <MessagesTab role={role} notify={notify} />
      ) : (
        <NotificationsTab role={role} notify={notify} />
      )}
    </div>
  );
}

function MessagesTab({ role, notify }: PageProps) {
  const blank = { messageType: '', fromDate: '', toDate: '', readStatus: '' };
  const [draft, setDraft] = useState(blank);
  const [query, setQuery] = useState(blank);
  const [page, setPage] = useState(0);
  const [filterError, setFilterError] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [removing, setRemoving] = useState<Row | null>(null);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/messenger-messages', role, undefined, { ...query, page, size: SIZE }),
    [query, page, role],
  );

  function search() {
    if (draft.fromDate !== '' && draft.toDate !== '' && draft.fromDate > draft.toDate) {
      setFilterError('조회 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setFilterError('');
    setPage(0);
    setQuery(draft);
  }

  function reset() {
    setFilterError('');
    setDraft(blank);
    setPage(0);
    setQuery(blank);
  }

  async function remove() {
    if (!removing) {
      return;
    }
    await call('DELETE', '/messenger-messages/' + String(removing['messengerMessageId']), role);
    notify('메시지를 삭제했습니다.');
    setRemoving(null);
    setSelected(null);
    reload();
  }

  const typeName = (value: unknown) => (value === 'CHAT' ? '채팅' : value === 'NOTE' ? '쪽지' : String(value ?? ''));

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>메시지 내용</h2>
          <Pairs
            items={[
              ['메시지 구분', typeName(selected['messageType'])],
              ['발송 일시', <DateText value={selected['sentAt']} time />],
              ['파일명', String(selected['fileName'] ?? '첨부 파일 없음')],
              ['메시지 내용', String(selected['content'] ?? '')],
            ]}
          />
        </section>
        <button className="ghost" onClick={() => setRemoving(selected)}>
          삭제
        </button>
        {removing && (
          <Drawer title="메시지 삭제" onClose={() => setRemoving(null)}>
            <Form
              onSubmit={remove}
              submit="삭제"
              danger
              note="삭제한 메시지는 되돌릴 수 없습니다. 본인이 보낸 메시지는 받는 사람에게서도 사라집니다."
            >
              <Pairs items={[['메시지 내용', String(removing['content'] ?? '')]]} />
            </Form>
          </Drawer>
        )}
      </div>
    );
  }

  return (
    <div>
      <Filters onSearch={search} onReset={reset}>
        <Field label="메시지 구분">
          <Select
            value={draft.messageType}
            onChange={(v) => setDraft({ ...draft, messageType: v })}
            options={[
              ['CHAT', '채팅'],
              ['NOTE', '쪽지'],
            ]}
            placeholder="전체"
          />
        </Field>
        <Field label="조회 시작일">
          <input type="date" value={draft.fromDate} onChange={(e) => setDraft({ ...draft, fromDate: e.target.value })} />
        </Field>
        <Field label="조회 종료일">
          <input type="date" value={draft.toDate} onChange={(e) => setDraft({ ...draft, toDate: e.target.value })} />
        </Field>
        <Field label="읽음 상태">
          <Select
            value={draft.readStatus}
            onChange={(v) => setDraft({ ...draft, readStatus: v })}
            options={READ_OPTIONS}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {filterError !== '' && <ErrorText text={filterError} />}
      {error !== '' && <ErrorText text={error} />}
      <Band total={data?.total} />
      <DataTable
        columns={[
          { key: 'messageType', label: '메시지 구분', render: (r) => typeName(r['messageType']) },
          { key: 'content', label: '메시지 내용' },
          { key: 'sentAt', label: '발송 일시', render: (r) => <DateText value={r['sentAt']} time /> },
          { key: 'fileName', label: '파일명', render: (r) => String(r['fileName'] ?? '-') },
          {
            key: 'manage',
            label: '관리',
            render: (r) => (
              <button
                className="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setRemoving(r);
                }}
              >
                삭제
              </button>
            ),
          },
        ]}
        rows={data?.items ?? []}
        onRowClick={(r) => setSelected(r)}
        empty={loading ? '불러오는 중입니다.' : EMPTY_TEXT}
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      {removing && (
        <Drawer title="메시지 삭제" onClose={() => setRemoving(null)}>
          <Form
            onSubmit={remove}
            submit="삭제"
            danger
            note="삭제한 메시지는 되돌릴 수 없습니다. 본인이 보낸 메시지는 받는 사람에게서도 사라집니다."
          >
            <Pairs items={[['메시지 내용', String(removing['content'] ?? '')]]} />
          </Form>
        </Drawer>
      )}
    </div>
  );
}

function NotificationsTab({ role, notify }: PageProps) {
  const blank = { readStatus: '', eventType: '' };
  const [draft, setDraft] = useState(blank);
  const [query, setQuery] = useState(blank);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [removing, setRemoving] = useState<Row | null>(null);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/notifications', role, undefined, { ...query, page, size: SIZE }),
    [query, page, role],
  );

  function search() {
    setPage(0);
    setQuery(draft);
  }

  function reset() {
    setDraft(blank);
    setPage(0);
    setQuery(blank);
  }

  async function remove() {
    if (!removing) {
      return;
    }
    await call('DELETE', '/notifications/' + String(removing['notificationId']), role);
    notify('알림을 삭제했습니다.');
    setRemoving(null);
    setSelected(null);
    reload();
  }

  if (selected) {
    const hasTarget = selected['targetType'] !== null && selected['targetType'] !== undefined;
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
              ['읽음 상태', <Badge value={selected['readStatus']} />],
              ['알림 이벤트 유형', String(selected['eventType'] ?? '-')],
              ['생성 일시', <DateText value={selected['createdAt']} time />],
              ['알림 내용', String(selected['content'] ?? '')],
            ]}
          />
        </section>
        <section className="box">
          <h2>바로가기</h2>
          {hasTarget ? (
            <Pairs
              items={[
                ['바로가기 대상 유형', String(selected['targetType'])],
                ['바로가기 대상 ID', String(selected['targetId'] ?? '')],
              ]}
            />
          ) : (
            <p>이 알림에는 바로가기 대상이 없습니다.</p>
          )}
        </section>
        <button className="ghost" onClick={() => setRemoving(selected)}>
          삭제
        </button>
        {removing && (
          <Drawer title="알림 삭제" onClose={() => setRemoving(null)}>
            <Form onSubmit={remove} submit="삭제" danger note="삭제한 알림은 되돌릴 수 없습니다.">
              <Pairs items={[['알림 제목', String(removing['title'] ?? '')]]} />
            </Form>
          </Drawer>
        )}
      </div>
    );
  }

  return (
    <div>
      <Filters onSearch={search} onReset={reset}>
        <Field label="읽음 상태">
          <Select
            value={draft.readStatus}
            onChange={(v) => setDraft({ ...draft, readStatus: v })}
            options={READ_OPTIONS}
            placeholder="전체"
          />
        </Field>
        <Field label="알림 이벤트 유형">
          <TextInput value={draft.eventType} onChange={(v) => setDraft({ ...draft, eventType: v })} />
        </Field>
      </Filters>
      {error !== '' && <ErrorText text={error} />}
      <Band total={data?.total} />
      <DataTable
        columns={[
          { key: 'title', label: '알림 제목' },
          { key: 'channel', label: '알림 채널' },
          { key: 'readStatus', label: '읽음 상태', render: (r) => <Badge value={r['readStatus']} /> },
          { key: 'createdAt', label: '생성 일시', render: (r) => <DateText value={r['createdAt']} time /> },
          {
            key: 'manage',
            label: '관리',
            render: (r) => (
              <button
                className="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setRemoving(r);
                }}
              >
                삭제
              </button>
            ),
          },
        ]}
        rows={data?.items ?? []}
        onRowClick={(r) => setSelected(r)}
        empty={loading ? '불러오는 중입니다.' : EMPTY_TEXT}
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      {removing && (
        <Drawer title="알림 삭제" onClose={() => setRemoving(null)}>
          <Form onSubmit={remove} submit="삭제" danger note="삭제한 알림은 되돌릴 수 없습니다.">
            <Pairs items={[['알림 제목', String(removing['title'] ?? '')]]} />
          </Form>
        </Drawer>
      )}
    </div>
  );
}
