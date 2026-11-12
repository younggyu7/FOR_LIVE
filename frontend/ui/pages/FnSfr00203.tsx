import { useState } from 'react';
import {
  call, useData, Badge, DateText, Filters, Band, DataTable, Pager, Drawer, Pairs,
  Form, Field, TextInput, DateInput, Select, LookupSelect, RefName, ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;
const TYPE_OPTIONS: [string, string][] = [['수입', '수입'], ['지출', '지출']];
const CYCLE_OPTIONS: [string, string][] = [['월', '월'], ['분기', '분기'], ['연', '연']];
const TRANSFER_OPTIONS: [string, string][] = [['true', '허용'], ['false', '불가']];

function empty(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

export default function FnSfr00203Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Row>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/budget-accounts', role, undefined, { ...applied, page: pageNo, size: SIZE }),
    [applied, pageNo],
  );

  function setField(key: string, value: unknown) {
    setForm({ ...form, [key]: value });
  }

  function openCreate() {
    setForm({ transferAllowed: 'true' });
    setMode('create');
  }

  function openEdit(row: Row) {
    setForm({
      budgetGroup: row.budgetGroup ?? '',
      name: row.name ?? '',
      controlCycle: row.controlCycle ?? '',
      transferAllowed: row.transferAllowed ? 'true' : 'false',
      useStartDate: row.useStartDate ?? '',
      useEndDate: row.useEndDate ?? '',
      accountSubjectId: row.accountSubjectId ?? '',
    });
    setMode('edit');
  }

  function periodCheck() {
    const s = form.useStartDate;
    const e = form.useEndDate;
    if (!empty(s) && !empty(e) && String(e) < String(s)) {
      throw new Error('사용 종료일이 시작일보다 빠릅니다.');
    }
  }

  async function submitCreate() {
    if (empty(form.budgetGroup) || empty(form.incomeExpenseType) || empty(form.name)
      || empty(form.controlCycle) || empty(form.accountSubjectId)) {
      throw new Error('예산과목 그룹, 수입·지출 유형, 명칭, 통제 주기, 매핑 계정과목을 모두 입력해 주세요.');
    }
    periodCheck();
    const body: Row = {
      budgetGroup: form.budgetGroup,
      incomeExpenseType: form.incomeExpenseType,
      name: form.name,
      controlCycle: form.controlCycle,
      transferAllowed: form.transferAllowed === 'true',
      accountSubjectId: form.accountSubjectId,
    };
    if (!empty(form.parentBudgetAccountId)) body.parentBudgetAccountId = form.parentBudgetAccountId;
    if (!empty(form.useStartDate)) body.useStartDate = form.useStartDate;
    if (!empty(form.useEndDate)) body.useEndDate = form.useEndDate;
    await call('POST', '/budget-accounts', role, body);
    notify('예산과목을 등록했습니다.');
    setMode(null);
    reload();
  }

  async function submitEdit() {
    if (!selected) return;
    if (empty(form.budgetGroup) || empty(form.name) || empty(form.controlCycle)) {
      throw new Error('예산과목 그룹, 명칭, 통제 주기를 입력해 주세요.');
    }
    periodCheck();
    const body: Row = {
      budgetGroup: form.budgetGroup,
      name: form.name,
      controlCycle: form.controlCycle,
      transferAllowed: form.transferAllowed === 'true',
    };
    if (!empty(form.useStartDate)) body.useStartDate = form.useStartDate;
    if (!empty(form.useEndDate)) body.useEndDate = form.useEndDate;
    if (!empty(form.accountSubjectId)) body.accountSubjectId = form.accountSubjectId;
    await call('PATCH', '/budget-accounts/' + selected.budgetAccountId, role, body);
    notify('예산과목을 수정했습니다.');
    setMode(null);
    setSelected(null);
    reload();
  }

  async function submitDelete() {
    if (!selected) return;
    await call('DELETE', '/budget-accounts/' + selected.budgetAccountId, role);
    notify('예산과목을 삭제했습니다.');
    setConfirmDelete(false);
    setSelected(null);
    reload();
  }

  const drawer = mode ? (
    <Drawer title={mode === 'create' ? '예산과목 등록' : '예산과목 수정'} onClose={() => setMode(null)}>
      <Form onSubmit={mode === 'create' ? submitCreate : submitEdit} submit={mode === 'create' ? '등록' : '저장'}>
        <Field label='예산과목 그룹' required>
          <TextInput value={form.budgetGroup} onChange={(v) => setField('budgetGroup', v)} />
        </Field>
        {mode === 'create' && (
          <Field label='수입·지출 유형' required>
            <Select value={form.incomeExpenseType} onChange={(v) => setField('incomeExpenseType', v)} options={TYPE_OPTIONS} />
          </Field>
        )}
        {mode === 'create' && (
          <Field label='상위 예산과목' hint='최상위 과목이면 비워 둡니다.'>
            <LookupSelect table='budget_account' role={role} value={form.parentBudgetAccountId} onChange={(v) => setField('parentBudgetAccountId', v)} />
          </Field>
        )}
        <Field label='예산과목 명칭' required>
          <TextInput value={form.name} onChange={(v) => setField('name', v)} />
        </Field>
        <Field label='예산 통제 주기' required>
          <Select value={form.controlCycle} onChange={(v) => setField('controlCycle', v)} options={CYCLE_OPTIONS} />
        </Field>
        <Field label='예산 전용 가능 여부' required>
          <Select value={form.transferAllowed} onChange={(v) => setField('transferAllowed', v)} options={TRANSFER_OPTIONS} />
        </Field>
        <Field label='사용 시작일'>
          <DateInput value={form.useStartDate} onChange={(v) => setField('useStartDate', v)} />
        </Field>
        <Field label='사용 종료일'>
          <DateInput value={form.useEndDate} onChange={(v) => setField('useEndDate', v)} />
        </Field>
        <Field label='매핑 계정과목' required={mode === 'create'}>
          <LookupSelect table='account_subject' role={role} value={form.accountSubjectId} onChange={(v) => setField('accountSubjectId', v)} />
        </Field>
      </Form>
    </Drawer>
  ) : null;

  if (selected) {
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => { setSelected(null); setConfirmDelete(false); }}>목록으로 돌아가기</button>
        <section className='box'>
          <h2>예산과목 정보</h2>
          <Pairs
            items={[
              ['예산과목 그룹', String(selected.budgetGroup ?? '')],
              ['예산과목 명칭', String(selected.name ?? '')],
              ['수입·지출 유형', <Badge value={selected.incomeExpenseType} />],
              ['상위 예산과목', empty(selected.parentBudgetAccountId) ? '최상위' : <RefName table='budget_account' role={role} value={selected.parentBudgetAccountId} />],
              ['매핑 계정과목', empty(selected.accountSubjectId) ? '매핑 없음' : <RefName table='account_subject' role={role} value={selected.accountSubjectId} />],
            ]}
          />
        </section>
        <section className='box'>
          <h2>통제와 사용기간</h2>
          <Pairs
            items={[
              ['예산 통제 주기', String(selected.controlCycle ?? '')],
              ['예산 전용 가능 여부', selected.transferAllowed ? '허용' : '불가'],
              ['사용 시작일', <DateText value={selected.useStartDate} />],
              ['사용 종료일', <DateText value={selected.useEndDate} />],
            ]}
          />
        </section>
        <section className='box'>
          <h2>관리</h2>
          <button onClick={() => openEdit(selected)}>수정</button>
          {' '}
          <button className='ghost' onClick={() => setConfirmDelete(true)}>삭제</button>
          {confirmDelete && (
            <Form
              onSubmit={submitDelete}
              submit='삭제 확인'
              danger
              note='삭제한 예산과목은 되돌릴 수 없습니다. 예산 집행 이력이 있으면 삭제할 수 없습니다.'
            />
          )}
        </section>
        {drawer}
      </div>
    );
  }

  return (
    <div className='doc'>
      <h1>예산과목 관리</h1>
      <Filters
        onSearch={() => { setApplied({ ...draft }); setPageNo(0); }}
        onReset={() => { setDraft({}); setApplied({}); setPageNo(0); }}
      >
        <Field label='예산과목 그룹'>
          <TextInput value={draft.budgetGroup} onChange={(v) => setDraft({ ...draft, budgetGroup: v })} />
        </Field>
        <Field label='수입·지출 유형'>
          <Select value={draft.incomeExpenseType} onChange={(v) => setDraft({ ...draft, incomeExpenseType: v })} options={TYPE_OPTIONS} placeholder='전체' />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>예산과목 등록</button>
      </Band>
      {error && <ErrorText text={error} />}
      <DataTable
        rows={data?.items ?? []}
        empty='아직 등록한 예산과목이 없습니다. 예산과목 등록 버튼으로 첫 과목을 만들어 보세요.'
        onRowClick={(row) => setSelected(row)}
        columns={[
          { key: 'budgetGroup', label: '예산과목 그룹' },
          { key: 'name', label: '예산과목 명칭' },
          { key: 'incomeExpenseType', label: '수입·지출 유형', render: (r) => <Badge value={r.incomeExpenseType} /> },
          { key: 'controlCycle', label: '예산 통제 주기' },
          { key: 'accountSubjectId', label: '매핑 계정과목', render: (r) => (empty(r.accountSubjectId) ? '-' : <RefName table='account_subject' role={role} value={r.accountSubjectId} />) },
        ]}
      />
      <Pager page={pageNo} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      {drawer}
    </div>
  );
}
