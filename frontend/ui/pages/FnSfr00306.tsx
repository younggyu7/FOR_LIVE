import { useState } from 'react';
import {
  PageProps,
  Page,
  Row,
  call,
  useData,
  Num,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  NumberInput,
  DateInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';

const SIZE = 20;
const TYPE_OPTIONS: [string, string][] = [
  ['결의서', '결의서'],
  ['출납', '출납'],
];
const INITIAL_OPTIONS: [string, string][] = [
  ['true', '초기 이월'],
  ['false', '일반 이월'],
];

function ClosingPeriods({ role, notify }: PageProps) {
  const [typeInput, setTypeInput] = useState('');
  const [closingType, setClosingType] = useState('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [formType, setFormType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const list = useData(
    () => call<Page>('GET', '/budget-closing-periods', role, undefined, { closingType, page, size: SIZE }),
    [closingType, page, role],
  );

  async function create() {
    if (!formType || !startDate || !endDate) {
      throw new Error('폐쇄 구분, 시작일, 종료일을 모두 입력해 주세요.');
    }
    if (endDate < startDate) {
      throw new Error('종료일은 시작일보다 빠를 수 없습니다.');
    }
    await call('POST', '/budget-closing-periods', role, { closingType: formType, startDate, endDate });
    notify('폐쇄기간을 설정했습니다.');
    setCreating(false);
    setFormType('');
    setStartDate('');
    setEndDate('');
    list.reload();
  }

  return (
    <section className="box">
      <h2>결의서·출납 폐쇄기간</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setClosingType(typeInput);
        }}
        onReset={() => {
          setTypeInput('');
          setClosingType('');
          setPage(0);
        }}
      >
        <Field label="폐쇄 구분">
          <Select value={typeInput} onChange={setTypeInput} options={TYPE_OPTIONS} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={list.data?.total}>
        <button onClick={() => setCreating(true)}>폐쇄기간 설정</button>
      </Band>
      {list.error ? <ErrorText text={list.error} /> : null}
      <DataTable
        columns={[
          { key: 'closingType', label: '폐쇄 구분' },
          { key: 'startDate', label: '시작일', render: (r: Row) => <DateText value={r.startDate} /> },
          { key: 'endDate', label: '종료일', render: (r: Row) => <DateText value={r.endDate} /> },
        ]}
        rows={list.data?.items ?? []}
        empty="아직 설정한 폐쇄기간이 없습니다. 폐쇄기간 설정 버튼으로 등록해 주세요."
      />
      <Pager page={page} size={SIZE} total={list.data?.total ?? 0} onPage={setPage} />
      {creating ? (
        <Drawer title="폐쇄기간 설정" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="설정">
            <Field label="폐쇄 구분" required>
              <Select value={formType} onChange={setFormType} options={TYPE_OPTIONS} />
            </Field>
            <Field label="시작일" required>
              <DateInput value={startDate} onChange={setStartDate} />
            </Field>
            <Field label="종료일" required>
              <DateInput value={endDate} onChange={setEndDate} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </section>
  );
}

function Carryovers({ role, notify }: PageProps) {
  const [projectInput, setProjectInput] = useState<number | string>('');
  const [accountInput, setAccountInput] = useState<number | string>('');
  const [projectId, setProjectId] = useState<number | string>('');
  const [budgetAccountId, setBudgetAccountId] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [formProject, setFormProject] = useState<number | string>('');
  const [formAccount, setFormAccount] = useState<number | string>('');
  const [formAmount, setFormAmount] = useState<number | string>('');
  const [formInitial, setFormInitial] = useState('');
  const [editAmount, setEditAmount] = useState<number | string>('');
  const list = useData(
    () => call<Page>('GET', '/budget-carryovers', role, undefined, { projectId, budgetAccountId, page, size: SIZE }),
    [projectId, budgetAccountId, page, role],
  );

  async function create() {
    if (formProject === '' || formAccount === '' || formAmount === '' || formInitial === '') {
      throw new Error('프로젝트, 예산과목, 이월 대상 금액, 초기 이월 여부를 모두 입력해 주세요.');
    }
    await call('POST', '/budget-carryovers', role, {
      projectId: formProject,
      budgetAccountId: formAccount,
      carryoverAmount: formAmount,
      isInitialCarryover: formInitial === 'true',
    });
    notify('이월 내역을 등록했습니다.');
    setCreating(false);
    setFormProject('');
    setFormAccount('');
    setFormAmount('');
    setFormInitial('');
    list.reload();
  }

  async function update() {
    if (!editing) {
      return;
    }
    if (editAmount === '') {
      throw new Error('이월 대상 금액을 입력해 주세요.');
    }
    await call('PATCH', `/budget-carryovers/${String(editing.budgetCarryoverId)}`, role, { carryoverAmount: editAmount });
    notify('이월 내역을 수정했습니다.');
    setEditing(null);
    list.reload();
  }

  return (
    <section className="box">
      <h2>예산 이월 내역</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setProjectId(projectInput);
          setBudgetAccountId(accountInput);
        }}
        onReset={() => {
          setProjectInput('');
          setAccountInput('');
          setProjectId('');
          setBudgetAccountId('');
          setPage(0);
        }}
      >
        <Field label="프로젝트">
          <LookupSelect table="project" role={role} value={projectInput} onChange={setProjectInput} placeholder="전체" />
        </Field>
        <Field label="예산과목">
          <LookupSelect table="budget_account" role={role} value={accountInput} onChange={setAccountInput} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={list.data?.total}>
        <button onClick={() => setCreating(true)}>이월 등록</button>
      </Band>
      {list.error ? <ErrorText text={list.error} /> : null}
      <DataTable
        columns={[
          { key: 'projectId', label: '프로젝트', render: (r: Row) => <RefName table="project" role={role} value={r.projectId} /> },
          { key: 'budgetAccountId', label: '예산과목', render: (r: Row) => <RefName table="budget_account" role={role} value={r.budgetAccountId} /> },
          { key: 'carryoverAmount', label: '이월 대상 금액', render: (r: Row) => <Num value={r.carryoverAmount} /> },
          { key: 'isInitialCarryover', label: '초기 이월 여부', render: (r: Row) => (r.isInitialCarryover ? '초기 이월' : '일반 이월') },
        ]}
        rows={list.data?.items ?? []}
        onRowClick={(row: Row) => {
          setEditing(row);
          setEditAmount(row.carryoverAmount as number);
        }}
        empty="아직 등록한 이월 내역이 없습니다. 이월 등록 버튼으로 추가해 주세요."
      />
      <Pager page={page} size={SIZE} total={list.data?.total ?? 0} onPage={setPage} />
      {creating ? (
        <Drawer title="이월 등록" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="등록">
            <Field label="프로젝트" required>
              <LookupSelect table="project" role={role} value={formProject} onChange={setFormProject} />
            </Field>
            <Field label="예산과목" required>
              <LookupSelect table="budget_account" role={role} value={formAccount} onChange={setFormAccount} />
            </Field>
            <Field label="이월 대상 금액" required>
              <NumberInput value={formAmount} onChange={setFormAmount} />
            </Field>
            <Field label="초기 이월 여부" required>
              <Select value={formInitial} onChange={setFormInitial} options={INITIAL_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
      {editing ? (
        <Drawer title="이월 내역 수정" onClose={() => setEditing(null)}>
          <Pairs
            items={[
              ['프로젝트', <RefName table="project" role={role} value={editing.projectId} />],
              ['예산과목', <RefName table="budget_account" role={role} value={editing.budgetAccountId} />],
              ['초기 이월 여부', editing.isInitialCarryover ? '초기 이월' : '일반 이월'],
            ]}
          />
          <Form onSubmit={update} submit="수정">
            <Field label="이월 대상 금액" required>
              <NumberInput value={editAmount} onChange={setEditAmount} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </section>
  );
}

export default function FnSfr00306Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'period' | 'carryover'>('period');
  return (
    <div className="doc">
      <h1>예산 폐쇄기간 및 이월 관리</h1>
      <p>결의서·출납 폐쇄기간을 정하고, 프로젝트별 예산과목의 이월 대상 금액을 관리합니다.</p>
      <div>
        <button className={tab === 'period' ? undefined : 'ghost'} onClick={() => setTab('period')}>
          폐쇄기간
        </button>
        <button className={tab === 'carryover' ? undefined : 'ghost'} onClick={() => setTab('carryover')}>
          이월 내역
        </button>
      </div>
      {tab === 'period' ? <ClosingPeriods role={role} notify={notify} /> : <Carryovers role={role} notify={notify} />}
    </div>
  );
}
