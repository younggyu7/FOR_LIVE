import { useState } from 'react';
import {
  call,
  useData,
  Num,
  Badge,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  NumberInput,
  Select,
  LookupSelect,
  RefName,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;
const LOCKED = ['승인', '완료'];
const METHOD_OPTIONS: [string, string][] = [
  ['카드사용내역', '카드사용내역'],
  ['세금계산서', '세금계산서'],
  ['통장거래내역', '통장거래내역'],
  ['직접입력', '직접입력'],
];
const EMPTY_FORM: Row = {
  requisitionId: '',
  projectId: '',
  budgetAccountId: '',
  partnerId: '',
  departmentId: '',
  resolutionMethod: '',
  resolutionAmount: '',
};

type PanelState =
  | { kind: 'detail'; row: Row }
  | { kind: 'form'; id: number | null; form: Row }
  | null;

function ResolutionForm({ role, id, initial, onDone }: { role: string; id: number | null; initial: Row; onDone: (saved: Row) => void }) {
  const [form, setForm] = useState<Row>(initial);
  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    const required: [string, string][] = [
      ['projectId', '프로젝트'],
      ['budgetAccountId', '예산과목'],
      ['partnerId', '거래처'],
      ['departmentId', '결의부서'],
      ['resolutionMethod', '결의 방식'],
      ['resolutionAmount', '결의 금액'],
    ];
    for (const [key, label] of required) {
      if (form[key] === '' || form[key] === undefined || form[key] === null) {
        throw new Error(label + ' 항목을 입력해 주세요.');
      }
    }
    const body: Row = { ...form };
    if (body.requisitionId === '') {
      delete body.requisitionId;
    }
    const res = id === null
      ? await call<Row>('POST', '/expense-resolutions', role, body)
      : await call<Row>('PUT', '/expense-resolutions/' + id, role, body);
    onDone({ ...body, ...res });
  };

  return (
    <Form onSubmit={submit} submit={id === null ? '저장' : '수정 저장'}>
      <Field label="프로젝트" required>
        <LookupSelect table="project" role={role} value={form.projectId} onChange={(v) => set('projectId', v)} />
      </Field>
      <Field label="예산과목" required>
        <LookupSelect table="budget_account" role={role} value={form.budgetAccountId} onChange={(v) => set('budgetAccountId', v)} />
      </Field>
      <Field label="거래처" required>
        <LookupSelect table="partner" role={role} value={form.partnerId} onChange={(v) => set('partnerId', v)} />
      </Field>
      <Field label="결의부서" required>
        <LookupSelect table="department" role={role} value={form.departmentId} onChange={(v) => set('departmentId', v)} />
      </Field>
      <Field label="품의서">
        <LookupSelect table="requisition" role={role} value={form.requisitionId} onChange={(v) => set('requisitionId', v)} />
      </Field>
      <Field label="결의 방식" required>
        <Select value={form.resolutionMethod} onChange={(v) => set('resolutionMethod', v)} options={METHOD_OPTIONS} />
      </Field>
      <Field label="결의 금액" required>
        <NumberInput value={form.resolutionAmount} onChange={(v) => set('resolutionAmount', v)} />
      </Field>
    </Form>
  );
}

export default function FnSfr00402Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({ budgetAccountId: '', projectId: '' });
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [panel, setPanel] = useState<PanelState>(null);
  const [saved, setSaved] = useState<Row[]>([]);

  const list = useData<Page>(
    () => call<Page>('GET', '/budget-statuses', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page, role],
  );
  const rows = list.data?.items ?? [];

  const search = () => {
    setPage(0);
    setApplied({ ...draft });
  };
  const reset = () => {
    const cleared = { budgetAccountId: '', projectId: '' };
    setDraft(cleared);
    setPage(0);
    setApplied({});
  };

  const done = (isNew: boolean) => (row: Row) => {
    setSaved((prev) => {
      if (isNew) {
        return [row, ...prev];
      }
      return prev.map((r) => (r.expenseResolutionId === row.expenseResolutionId ? row : r));
    });
    notify(isNew ? '결의서를 저장했습니다.' : '결의서를 수정했습니다.');
    setPanel(null);
    list.reload();
  };

  return (
    <div>
      <h1>결의서 입력</h1>
      <section>
        <h2>예산과목별 예산현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="예산과목">
            <LookupSelect table="budget_account" role={role} value={draft.budgetAccountId} onChange={(v) => setDraft({ ...draft, budgetAccountId: v })} />
          </Field>
          <Field label="프로젝트">
            <LookupSelect table="project" role={role} value={draft.projectId} onChange={(v) => setDraft({ ...draft, projectId: v })} />
          </Field>
        </Filters>
        <Band total={list.data?.total}>
          <button onClick={() => setPanel({ kind: 'form', id: null, form: EMPTY_FORM })}>결의서 입력</button>
        </Band>
        {list.error ? <p>{list.error}</p> : null}
        <DataTable
          columns={[
            { key: 'budgetAccountId', label: '예산과목', render: (r) => <RefName table="budget_account" role={role} value={r.budgetAccountId} /> },
            { key: 'totalBudgetAmount', label: '예산총액', render: (r) => <Num value={r.totalBudgetAmount} /> },
            { key: 'executedAmount', label: '집행액', render: (r) => <Num value={r.executedAmount} /> },
            { key: 'budgetBalance', label: '예산잔액', render: (r) => <Num value={r.budgetBalance} /> },
          ]}
          rows={rows}
          onRowClick={(row) => setPanel({ kind: 'detail', row })}
          empty="조건에 맞는 예산과목이 없습니다. 조회 조건을 바꿔 보세요."
        />
        <Pager page={page} size={SIZE} total={list.data?.total ?? 0} onPage={setPage} />
      </section>
      <section>
        <h2>이 화면에서 저장한 결의서</h2>
        <DataTable
          columns={[
            { key: 'expenseResolutionId', label: '결의서 ID' },
            { key: 'budgetAccountId', label: '예산과목', render: (r) => <RefName table="budget_account" role={role} value={r.budgetAccountId} /> },
            { key: 'resolutionAmount', label: '결의 금액', render: (r) => <Num value={r.resolutionAmount} /> },
            { key: 'status', label: '진행 상태', render: (r) => <Badge value={r.status} /> },
            {
              key: 'action',
              label: '처리',
              render: (r) =>
                LOCKED.includes(String(r.status)) ? null : (
                  <button
                    className="ghost"
                    onClick={() => setPanel({ kind: 'form', id: Number(r.expenseResolutionId), form: r })}
                  >
                    수정
                  </button>
                ),
            },
          ]}
          rows={saved}
          empty="아직 저장한 결의서가 없습니다. 결의서 입력 버튼으로 시작하세요."
        />
      </section>
      {panel && panel.kind === 'detail' ? (
        <Drawer title="예산현황 상세" onClose={() => setPanel(null)}>
          <Pairs
            items={[
              ['예산과목', <RefName table="budget_account" role={role} value={panel.row.budgetAccountId} />],
              ['실행예산액', <Num value={panel.row.executionBudgetAmount} />],
              ['이월예산액', <Num value={panel.row.carryoverBudgetAmount} />],
              ['예산총액', <Num value={panel.row.totalBudgetAmount} />],
              ['집행액', <Num value={panel.row.executedAmount} />],
              ['예산잔액', <Num value={panel.row.budgetBalance} />],
            ]}
          />
        </Drawer>
      ) : null}
      {panel && panel.kind === 'form' ? (
        <Drawer title={panel.id === null ? '결의서 입력' : '결의서 수정'} onClose={() => setPanel(null)}>
          <ResolutionForm
            role={role}
            id={panel.id}
            initial={panel.form}
            onDone={done(panel.id === null)}
          />
        </Drawer>
      ) : null}
    </div>
  );
}
