import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  Select,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const STATUS_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];

export default function FnSfr02901Page({ role, notify }: PageProps) {
  const [useStatus, setUseStatus] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formBody, setFormBody] = useState('');
  const [rule, setRule] = useState('');
  const [newStatus, setNewStatus] = useState('사용');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/approval-forms', role, undefined, { useStatus: applied, page, size: 20 }),
    [applied, page, role],
  );

  function openCreate() {
    setFormName('');
    setFormBody('');
    setRule('');
    setNewStatus('사용');
    setCreating(true);
  }

  async function submit() {
    if (formName.trim() === '') {
      throw new Error('결재양식명을 입력해 주세요.');
    }
    await call('POST', '/approval-forms', role, {
      formName: formName.trim(),
      formBody,
      approvalProcessRule: rule,
      useStatus: newStatus,
    });
    notify('결재양식을 등록했습니다.');
    setCreating(false);
    setPage(0);
    reload();
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>결재양식 관리</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setApplied(useStatus);
          }}
          onReset={() => {
            setUseStatus('');
            setApplied('');
            setPage(0);
          }}
        >
          <Field label="사용 여부">
            <Select value={useStatus} onChange={setUseStatus} options={STATUS_OPTIONS} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openCreate}>결재양식 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        <DataTable<Row>
          columns={[
            { key: 'approvalFormId', label: '결재양식 ID' },
            { key: 'formName', label: '결재양식명' },
            { key: 'useStatus', label: '사용 여부', render: (row) => <Badge value={row['useStatus']} /> },
          ]}
          rows={data?.items ?? []}
          empty={loading ? '불러오는 중입니다.' : '아직 등록한 결재양식이 없습니다. 결재양식 등록 버튼으로 첫 양식을 추가해 주세요.'}
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {creating ? (
        <Drawer title="결재양식 등록" onClose={() => setCreating(false)}>
          <Form onSubmit={submit} submit="저장">
            <Field label="결재양식명" required>
              <TextInput value={formName} onChange={setFormName} />
            </Field>
            <Field label="사용 여부">
              <Select value={newStatus} onChange={setNewStatus} options={STATUS_OPTIONS} />
            </Field>
            <Field label="양식 본문(HTML)" wide>
              <TextInput value={formBody} onChange={setFormBody} multiline />
            </Field>
            <Field label="결재 프로세스 규칙" wide>
              <TextInput value={rule} onChange={setRule} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
