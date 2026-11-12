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
import type { PageProps, Page, Row } from '../kit';

const USE_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];
const SIZE = 20;

export default function FnSfr01601Page({ role, notify }: PageProps) {
  const [useYn, setUseYn] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [name, setName] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formUse, setFormUse] = useState('사용');

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/certificate-types', role, undefined, { useYn: applied, page, size: SIZE }),
    [applied, page, role],
  );

  function openCreate() {
    setName('');
    setFormBody('');
    setFormUse('사용');
    setCreating(true);
  }

  function openEdit(row: Row) {
    setName(String(row['name'] ?? ''));
    setFormBody('');
    setFormUse(String(row['useYn'] ?? '사용'));
    setEditing(row);
  }

  function close() {
    setCreating(false);
    setEditing(null);
  }

  async function create() {
    if (name.trim() === '' || formBody.trim() === '') {
      throw new Error('증명서 종류명과 양식 본문을 입력해 주세요.');
    }
    await call('POST', '/certificate-types', role, { name, formBody, useYn: formUse });
    notify('증명서 양식을 등록했습니다.');
    close();
    reload();
  }

  async function update() {
    if (editing === null) {
      return;
    }
    if (name.trim() === '') {
      throw new Error('증명서 종류명을 입력해 주세요.');
    }
    const body: Row = { name, useYn: formUse };
    if (formBody.trim() !== '') {
      body['formBody'] = formBody;
    }
    await call('PATCH', '/certificate-types/' + String(editing['certificateTypeId']), role, body);
    notify('증명서 양식을 수정했습니다.');
    close();
    reload();
  }

  async function toggleUse(row: Row) {
    const next = row['useYn'] === '사용' ? '미사용' : '사용';
    try {
      await call('PATCH', '/certificate-types/' + String(row['certificateTypeId']), role, { useYn: next });
      notify('사용 여부를 ' + next + '(으)로 바꿨습니다.');
      reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : '처리하지 못했습니다.');
    }
  }

  return (
    <div>
      <h1>증명서 양식 관리</h1>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(useYn);
        }}
        onReset={() => {
          setUseYn('');
          setApplied('');
          setPage(0);
        }}
      >
        <Field label="사용 여부">
          <Select value={useYn} onChange={setUseYn} options={USE_OPTIONS} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>양식 등록</button>
      </Band>
      {error !== '' && <ErrorText text={error} />}
      <DataTable
        columns={[
          { key: 'certificateTypeId', label: '증명서 종류 ID' },
          { key: 'name', label: '증명서 종류명' },
          { key: 'useYn', label: '사용 여부', render: (r) => <Badge value={r['useYn']} /> },
          {
            key: 'actions',
            label: '처리',
            render: (r) => (
              <span>
                <button className="ghost" onClick={() => openEdit(r)}>
                  수정
                </button>
                <button className="ghost" onClick={() => toggleUse(r)}>
                  {r['useYn'] === '사용' ? '미사용 처리' : '사용 처리'}
                </button>
              </span>
            ),
          },
        ]}
        rows={data?.items ?? []}
        empty="아직 등록한 증명서 양식이 없습니다. 양식 등록 버튼으로 첫 양식을 추가해 보세요."
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      {creating && (
        <Drawer title="증명서 양식 등록" onClose={close}>
          <Form onSubmit={create} submit="등록">
            <Field label="증명서 종류명" required>
              <TextInput value={name} onChange={setName} />
            </Field>
            <Field label="사용 여부">
              <Select value={formUse} onChange={setFormUse} options={USE_OPTIONS} />
            </Field>
            <Field label="양식 본문" required wide>
              <TextInput value={formBody} onChange={setFormBody} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
      {editing !== null && (
        <Drawer title="증명서 양식 수정" onClose={close}>
          <Form
            onSubmit={update}
            submit="저장"
            note="양식을 수정해도 이미 발급된 증명서의 내용은 바뀌지 않습니다."
          >
            <Field label="증명서 종류명" required>
              <TextInput value={name} onChange={setName} />
            </Field>
            <Field label="사용 여부">
              <Select value={formUse} onChange={setFormUse} options={USE_OPTIONS} />
            </Field>
            <Field label="양식 본문" wide hint="비워 두면 기존 본문을 그대로 둡니다.">
              <TextInput value={formBody} onChange={setFormBody} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
