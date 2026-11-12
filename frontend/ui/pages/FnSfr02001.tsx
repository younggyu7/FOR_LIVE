import { useState } from 'react';
import { call, useData, Badge, Filters, Band, DataTable, Pager, Drawer, Form, Field, TextInput, Select, ErrorText } from '../kit';
import type { PageProps, Row, Page } from '../kit';

const CATEGORIES: [string, string][] = [
  ['근로소득', '근로소득'],
  ['퇴직소득', '퇴직소득'],
  ['소득공제', '소득공제'],
  ['농특세', '농특세'],
  ['지방소득세', '지방소득세'],
  ['사회보험정산', '사회보험정산'],
  ['학자금상환', '학자금상환'],
];
const USE_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];

export default function FnSfr02001Page({ role, notify }: PageProps) {
  const [category, setCategory] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const [newCategory, setNewCategory] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newUse, setNewUse] = useState('사용');
  const [newRemark, setNewRemark] = useState('');

  const [editName, setEditName] = useState('');
  const [editUse, setEditUse] = useState('사용');
  const [editRemark, setEditRemark] = useState('');

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/payroll-codes', role, undefined, { codeCategory: applied, page, size: 20 }),
    [applied, page],
  );

  function openCreate() {
    setNewCategory('');
    setNewCode('');
    setNewName('');
    setNewUse('사용');
    setNewRemark('');
    setCreating(true);
  }

  function openEdit(row: Row) {
    setEditName(String(row.codeName ?? ''));
    setEditUse(String(row.useYn ?? '사용'));
    setEditRemark(String(row.remark ?? ''));
    setEditing(row);
  }

  async function create() {
    if (!newCategory) {
      throw new Error('코드구분을 선택해 주세요.');
    }
    if (!newCode.trim()) {
      throw new Error('코드를 입력해 주세요.');
    }
    if (!newName.trim()) {
      throw new Error('코드명을 입력해 주세요.');
    }
    await call('POST', '/payroll-codes', role, {
      codeCategory: newCategory,
      code: newCode,
      codeName: newName,
      useYn: newUse,
      remark: newRemark,
    });
    notify('급여 기초코드를 등록했습니다.');
    setCreating(false);
    reload();
  }

  async function update() {
    if (!editing) {
      return;
    }
    if (!editName.trim()) {
      throw new Error('코드명을 입력해 주세요.');
    }
    await call('PATCH', '/payroll-codes/' + String(editing.payrollCodeId), role, {
      codeName: editName,
      useYn: editUse,
      remark: editRemark,
    });
    notify('급여 기초코드를 수정했습니다.');
    setEditing(null);
    reload();
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>급여 기초코드</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setApplied(category);
          }}
          onReset={() => {
            setCategory('');
            setApplied('');
            setPage(0);
          }}
        >
          <Field label="코드구분">
            <Select value={category} onChange={setCategory} options={CATEGORIES} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openCreate}>코드 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        <DataTable
          columns={[
            { key: 'codeCategory', label: '코드구분' },
            { key: 'code', label: '코드' },
            { key: 'codeName', label: '코드명' },
            { key: 'useYn', label: '사용 여부', render: (r: Row) => <Badge value={r.useYn} /> },
            { key: 'remark', label: '비고' },
          ]}
          rows={data?.items ?? []}
          onRowClick={openEdit}
          empty="아직 등록한 코드가 없습니다. 코드 등록 버튼으로 첫 코드를 추가해 주세요."
        />
        <Pager page={page} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </section>

      {creating ? (
        <Drawer title="급여 기초코드 등록" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="등록">
            <Field label="코드구분" required>
              <Select value={newCategory} onChange={setNewCategory} options={CATEGORIES} />
            </Field>
            <Field label="코드" required>
              <TextInput value={newCode} onChange={setNewCode} />
            </Field>
            <Field label="코드명" required>
              <TextInput value={newName} onChange={setNewName} />
            </Field>
            <Field label="사용 여부">
              <Select value={newUse} onChange={setNewUse} options={USE_OPTIONS} />
            </Field>
            <Field label="비고" wide>
              <TextInput value={newRemark} onChange={setNewRemark} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {editing ? (
        <Drawer title="급여 기초코드 수정" onClose={() => setEditing(null)}>
          <Form
            onSubmit={update}
            submit="저장"
            note="미사용으로 바꾸면 이후 급여 계산·신청에서 선택할 수 없습니다. 변경 내용은 이력으로 남습니다."
          >
            <Field label="코드구분">
              <span>{String(editing.codeCategory ?? '')}</span>
            </Field>
            <Field label="코드">
              <span>{String(editing.code ?? '')}</span>
            </Field>
            <Field label="코드명" required>
              <TextInput value={editName} onChange={setEditName} />
            </Field>
            <Field label="사용 여부">
              <Select value={editUse} onChange={setEditUse} options={USE_OPTIONS} />
            </Field>
            <Field label="비고" wide>
              <TextInput value={editRemark} onChange={setEditRemark} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
