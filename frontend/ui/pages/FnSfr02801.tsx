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
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  NumberInput,
  Select,
  LookupSelect,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

export default function FnSfr02801Page({ role, notify }: PageProps) {
  const [readStatus, setReadStatus] = useState('');
  const [eventType, setEventType] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [recipientId, setRecipientId] = useState<number | string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('');
  const [targetId, setTargetId] = useState<number | string>('');

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/notifications', role, undefined, { ...applied, page: pageNo, size: SIZE }),
    [applied, pageNo, role],
  );

  function search() {
    setPageNo(0);
    setApplied({ readStatus: readStatus, eventType: eventType });
  }

  function reset() {
    setReadStatus('');
    setEventType('');
    setPageNo(0);
    setApplied({});
  }

  async function markRead() {
    if (!selected) {
      return;
    }
    const result = await call('PATCH', `/notifications/${selected['notificationId']}/read`, role, {});
    notify('알림을 읽음으로 처리했습니다.');
    setSelected({ ...selected, readStatus: result['readStatus'] });
    reload();
  }

  async function createMention() {
    if (recipientId === '' || title.trim() === '' || targetType.trim() === '' || targetId === '') {
      throw new Error('수신자, 제목, 바로가기 대상 유형과 ID를 모두 입력해 주세요.');
    }
    await call('POST', '/notifications/mentions', role, {
      recipientId: recipientId,
      title: title,
      content: content,
      targetType: targetType,
      targetId: targetId,
    });
    notify('멘션 알림을 생성했습니다.');
    setCreating(false);
    setRecipientId('');
    setTitle('');
    setContent('');
    setTargetType('');
    setTargetId('');
    reload();
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>알림 내용</h2>
          <Pairs
            items={[
              ['알림 제목', String(selected['title'] ?? '')],
              ['알림 내용', String(selected['content'] ?? '')],
              ['알림 채널', String(selected['channel'] ?? '')],
              ['읽음 상태', <Badge value={selected['readStatus']} />],
              ['알림 이벤트 유형', String(selected['eventType'] ?? '')],
              ['바로가기 대상', `${selected['targetType'] ?? ''} ${selected['targetId'] ?? ''}`],
              ['생성 일시', <DateText value={selected['createdAt']} time />],
            ]}
          />
        </section>
        {selected['readStatus'] === '안읽음' && (
          <section className="box">
            <h2>처리</h2>
            <Form onSubmit={markRead} submit="읽음 처리">
              <p>읽음으로 처리하면 안읽음 상태로 되돌릴 수 없습니다.</p>
            </Form>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="doc">
      <h2>통합알림</h2>
      <Filters onSearch={search} onReset={reset}>
        <Field label="읽음 상태">
          <Select value={readStatus} onChange={setReadStatus} options={[['안읽음', '안읽음'], ['읽음', '읽음']]} placeholder="전체" />
        </Field>
        <Field label="알림 이벤트 유형">
          <TextInput value={eventType} onChange={setEventType} />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={() => setCreating(true)}>멘션 알림 보내기</button>
      </Band>
      {error && <ErrorText text={error} />}
      <DataTable
        columns={[
          { key: 'title', label: '알림 제목' },
          { key: 'channel', label: '알림 채널' },
          { key: 'readStatus', label: '읽음 상태', render: (r) => <Badge value={r['readStatus']} /> },
          { key: 'eventType', label: '알림 이벤트 유형' },
          { key: 'createdAt', label: '생성 일시', render: (r) => <DateText value={r['createdAt']} time /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={(r) => setSelected(r)}
        empty="받은 알림이 아직 없습니다."
      />
      <Pager page={pageNo} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      {creating && (
        <Drawer title="멘션 알림 보내기" onClose={() => setCreating(false)}>
          <Form onSubmit={createMention} submit="알림 보내기">
            <Field label="수신자" required>
              <LookupSelect table="employee" role={role} value={recipientId} onChange={setRecipientId} />
            </Field>
            <Field label="알림 제목" required>
              <TextInput value={title} onChange={setTitle} />
            </Field>
            <Field label="알림 내용" wide>
              <TextInput value={content} onChange={setContent} multiline />
            </Field>
            <Field label="바로가기 대상 유형" required>
              <TextInput value={targetType} onChange={setTargetType} />
            </Field>
            <Field label="바로가기 대상 ID" required>
              <NumberInput value={targetId} onChange={setTargetId} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
