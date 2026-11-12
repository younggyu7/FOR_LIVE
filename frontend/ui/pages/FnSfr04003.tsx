import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  DateText,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Page } from '../kit';

const SIZE = 20;

export default function FnSfr04003Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [composing, setComposing] = useState(false);
  const [recipientIds, setRecipientIds] = useState<number[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [pickerKey, setPickerKey] = useState(0);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/mail-messages/inbox', role, undefined, { page, size: SIZE }),
    [page],
  );

  function openCompose() {
    setRecipientIds([]);
    setSubject('');
    setBody('');
    setPickerKey(pickerKey + 1);
    setComposing(true);
  }

  function addRecipient(v: number | string) {
    if (typeof v !== 'number') {
      return;
    }
    if (!recipientIds.includes(v)) {
      setRecipientIds([...recipientIds, v]);
    }
    setPickerKey(pickerKey + 1);
  }

  async function send() {
    if (recipientIds.length === 0) {
      throw new Error('받는 사람을 입력해 주세요.');
    }
    if (subject.trim() === '') {
      throw new Error('제목을 입력해 주세요.');
    }
    await call('POST', '/mail-messages', role, {
      recipientIds,
      subject,
      body,
    });
    notify('메일을 발송했습니다.');
    setComposing(false);
    setPage(0);
    reload();
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>받은편지함</h2>
        <Band total={data?.total}>
          <button onClick={openCompose}>메일 작성</button>
        </Band>
        {error && <ErrorText text={error} />}
        <DataTable
          columns={[
            { key: 'subject', label: '제목' },
            { key: 'sentAt', label: '발송 시각', render: (r) => <DateText value={r.sentAt} time /> },
            { key: 'readStatus', label: '읽음 상태', render: (r) => <Badge value={r.readStatus} /> },
          ]}
          rows={data?.items ?? []}
          empty={loading ? '불러오는 중입니다.' : '받은 메일이 없습니다. 메일 작성 버튼으로 첫 메일을 보내 보세요.'}
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {composing && (
        <Drawer title="메일 작성" onClose={() => setComposing(false)}>
          <Form onSubmit={send} submit="발송">
            <Field label="받는 사람 임직원 ID 목록" required wide>
              <div>
                {recipientIds.map((id) => (
                  <div key={id}>
                    <RefName table="employee" role={role} value={id} />
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setRecipientIds(recipientIds.filter((x) => x !== id))}
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <LookupSelect
                  key={pickerKey}
                  table="employee"
                  role={role}
                  value=""
                  onChange={addRecipient}
                  placeholder="받는 사람 추가"
                />
              </div>
            </Field>
            <Field label="제목" required wide>
              <TextInput value={subject} onChange={setSubject} />
            </Field>
            <Field label="본문" wide>
              <TextInput value={body} onChange={setBody} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
