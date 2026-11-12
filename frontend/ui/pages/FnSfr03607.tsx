import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  DateText,
  Drawer,
  Field,
  Filters,
  Form,
  LookupSelect,
  NumberInput,
  Num,
  Pager,
  Pairs,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Column, Page, PageProps, Row } from '../kit';

// 가정: 메시지에 연결된 첨부파일의 업무 대상 유형 값
const MESSAGE_TARGET_TYPE = 'MESSENGER_MESSAGE';
const PAGE_SIZE = 20;

const TYPE_OPTIONS: [string, string][] = [
  ['CHAT', '대화방 메시지'],
  ['NOTE', '쪽지'],
];

const READ_OPTIONS: [string, string][] = [
  ['안읽음', '안읽음'],
  ['읽음', '읽음'],
];

function typeLabel(value: unknown): string {
  return value === 'CHAT' ? '대화방 메시지' : value === 'NOTE' ? '쪽지' : String(value ?? '');
}

function AttachmentSection({ role, messageId }: { role: string; messageId: unknown }) {
  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/attachments', role, undefined, { targetType: MESSAGE_TARGET_TYPE, targetId: messageId as number }),
    [messageId],
  );
  const columns: Column[] = [
    { key: 'fileName', label: '파일명' },
    { key: 'fileExtension', label: '확장자' },
    { key: 'fileSize', label: '파일 크기(바이트)', render: (r) => <Num value={r.fileSize} /> },
    { key: 'downloadAllowed', label: '다운로드', render: (r) => (r.downloadAllowed ? '가능' : '권한 없음') },
    { key: 'previewAvailable', label: '미리보기', render: (r) => (r.previewAvailable ? '가능' : '불가') },
  ];
  if (loading) return <p>첨부파일을 불러오는 중입니다.</p>;
  if (error) return <p>{error}</p>;
  return <DataTable columns={columns} rows={data?.items ?? []} empty="이 메시지에 연결된 첨부파일이 없습니다." />;
}

export default function FnSfr03607Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<Row>({});

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/messenger-messages', role, undefined, { ...applied, page: pageNo, size: PAGE_SIZE }),
    [applied, pageNo, role],
  );

  const columns: Column[] = [
    { key: 'sentAt', label: '발송 일시', render: (r) => <DateText value={r.sentAt} time /> },
    { key: 'messageType', label: '메시지 구분', render: (r) => <Badge value={typeLabel(r.messageType)} /> },
    { key: 'content', label: '메시지 내용' },
    { key: 'fileName', label: '파일명' },
  ];

  const search = () => {
    setPageNo(0);
    setApplied({ ...draft });
  };

  const reset = () => {
    setDraft({});
    setPageNo(0);
    setApplied({});
  };

  const openSend = () => {
    setForm({});
    setSending(true);
  };

  const send = async () => {
    if (!form.messengerRoomId) throw new Error('대화방을 선택해 주세요.');
    if (!String(form.content ?? '').trim()) throw new Error('메시지 내용을 입력해 주세요.');
    const body: Row = {
      messengerRoomId: form.messengerRoomId,
      content: form.content,
    };
    if (form.replyToMessageId !== undefined && form.replyToMessageId !== '') {
      body.replyToMessageId = form.replyToMessageId;
    }
    await call('POST', '/messenger-messages', role, body);
    notify('메시지를 서버에 저장했습니다.');
    setSending(false);
    reload();
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>메시지</h2>
          <Pairs
            items={[
              ['메신저 메시지 ID', String(selected.messengerMessageId ?? '')],
              ['메시지 구분', <Badge value={typeLabel(selected.messageType)} />],
              ['발송 일시', <DateText value={selected.sentAt} time />],
              ['메시지 내용', String(selected.content ?? '')],
            ]}
          />
        </section>
        <section className="box">
          <h2>첨부파일</h2>
          <AttachmentSection role={role} messageId={selected.messengerMessageId} />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>서버에 저장된 메시지</h2>
        <p>쪽지와 대화방 메시지, 첨부파일은 단말기가 아닌 서버에 저장됩니다. 새 단말기에서 로그인해도 본인 권한 범위의 기존 메시지를 볼 수 있습니다.</p>
        <Filters onSearch={search} onReset={reset}>
          <Field label="메시지 구분">
            <Select
              value={draft.messageType}
              onChange={(v) => setDraft({ ...draft, messageType: v })}
              options={TYPE_OPTIONS}
              placeholder="전체"
            />
          </Field>
          <Field label="조회 시작일">
            <input
              type="date"
              value={String(draft.fromDate ?? '')}
              onChange={(e) => setDraft({ ...draft, fromDate: e.target.value })}
            />
          </Field>
          <Field label="조회 종료일">
            <input
              type="date"
              value={String(draft.toDate ?? '')}
              onChange={(e) => setDraft({ ...draft, toDate: e.target.value })}
            />
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
        <Band total={data?.total}>
          <button onClick={openSend}>메시지 보내기</button>
        </Band>
        {error ? <p>{error}</p> : null}
        {loading ? <p>메시지를 불러오는 중입니다.</p> : null}
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty="아직 서버에 저장된 메시지가 없습니다. 메시지 보내기 버튼으로 첫 메시지를 보내 보세요."
        />
        <Pager page={pageNo} size={data?.size ?? PAGE_SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
      {sending ? (
        <Drawer title="메시지 보내기" onClose={() => setSending(false)}>
          <Form onSubmit={send} submit="보내기">
            <Field label="대화방 ID" required>
              <LookupSelect
                table="messenger_room"
                role={role}
                value={form.messengerRoomId}
                onChange={(v) => setForm({ ...form, messengerRoomId: v })}
                placeholder="대화방 선택"
              />
            </Field>
            <Field label="메시지 내용" required wide>
              <TextInput
                value={form.content}
                onChange={(v) => setForm({ ...form, content: v })}
                multiline
              />
            </Field>
            <Field label="답장 원본 메시지 ID" hint="답장일 때만 입력합니다.">
              <NumberInput
                value={form.replyToMessageId}
                onChange={(v) => setForm({ ...form, replyToMessageId: v })}
              />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
