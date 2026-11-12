import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
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
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;
const MONTHS: [string, string][] = Array.from({ length: 12 }, (_, i): [string, string] => [String(i + 1), `${i + 1}월`]);

// 현재 상태별로 할 수 있는 처리 (BEHAVIOR.md 전환표)
const ACTIONS: Record<string, { path: string; label: string; done: string; danger?: boolean }[]> = {
  '신청': [{ path: 'close', label: '마감', done: '마감했습니다.' }],
  '마감': [
    { path: 'approve', label: '승인', done: '승인했습니다.' },
    { path: 'cancel-close', label: '마감 취소', done: '마감을 취소했습니다.', danger: true },
  ],
  '승인': [{ path: 'cancel-approval', label: '승인 취소', done: '승인을 취소했습니다.', danger: true }],
};

export default function FnSfr00303Page({ role, notify }: PageProps) {
  const [input, setInput] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Row>({});

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/budget-executions', role, undefined, { ...applied, page: pageNo, size: SIZE }),
    [applied, pageNo, role],
  );

  const setIn = (k: string, v: unknown) => setInput({ ...input, [k]: v });
  const setF = (k: string, v: unknown) => setForm({ ...form, [k]: v });

  const search = () => {
    setPageNo(0);
    setApplied({ ...input });
  };
  const reset = () => {
    setInput({});
    setPageNo(0);
    setApplied({});
  };

  const create = async () => {
    if (form.budgetMainId === undefined || form.budgetMainId === '') {
      throw new Error('본예산을 선택해 주세요.');
    }
    if (!form.executionMonth) {
      throw new Error('편성월을 선택해 주세요.');
    }
    if (form.executionAmount === undefined || form.executionAmount === '') {
      throw new Error('실행예산 금액을 입력해 주세요.');
    }
    await call('POST', '/budget-executions', role, {
      budgetMainId: form.budgetMainId,
      executionMonth: Number(form.executionMonth),
      executionAmount: form.executionAmount,
    });
    notify('실행예산을 편성하고 신청했습니다.');
    setCreating(false);
    setForm({});
    reload();
  };

  if (selected) {
    const status = String(selected.approvalStatus ?? '');
    const actions = ACTIONS[status] ?? [];
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>실행예산</h2>
          <Pairs
            items={[
              ['실행예산 ID', String(selected.budgetExecutionId)],
              ['본예산', <RefName table="budget_main" role={role} value={selected.budgetMainId} />],
              ['편성월', `${selected.executionMonth}월`],
              ['실행예산 금액', <Num value={selected.executionAmount} />],
              ['승인 처리 상태', <Badge value={selected.approvalStatus} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>처리</h2>
          {actions.length === 0 && <p>이 상태에서는 처리할 수 있는 작업이 없습니다.</p>}
          {actions.map((a) => (
            <Form
              key={a.path}
              submit={a.label}
              danger={a.danger}
              note={a.danger ? `${a.label}하면 상태가 바뀝니다. 계속하려면 버튼을 누르세요.` : undefined}
              onSubmit={async () => {
                await call('POST', `/budget-executions/${selected.budgetExecutionId}/${a.path}`, role, {});
                notify(a.done);
                setSelected(null);
                reload();
              }}
            />
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>실행예산 신청 대상</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="회계단위">
            <TextInput value={input.accountingUnit} onChange={(v) => setIn('accountingUnit', v)} />
          </Field>
          <Field label="기수(회계연도)">
            <NumberInput value={input.fiscalYear} onChange={(v) => setIn('fiscalYear', v)} />
          </Field>
          <Field label="예산과목">
            <LookupSelect table="budget_account" role={role} value={input.budgetAccountId} onChange={(v) => setIn('budgetAccountId', v)} />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={() => setCreating(true)}>실행예산 편성</button>
        </Band>
        {error && <ErrorText text={error} />}
        <DataTable
          columns={[
            { key: 'budgetExecutionId', label: '실행예산 ID' },
            { key: 'budgetMainId', label: '본예산', render: (r) => <RefName table="budget_main" role={role} value={r.budgetMainId} /> },
            { key: 'executionMonth', label: '편성월', render: (r) => <span>{String(r.executionMonth)}월</span> },
            { key: 'executionAmount', label: '실행예산 금액', render: (r) => <Num value={r.executionAmount} /> },
            { key: 'approvalStatus', label: '승인 처리 상태', render: (r) => <Badge value={r.approvalStatus} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty={loading ? '불러오는 중입니다.' : '아직 편성한 실행예산이 없습니다. 실행예산 편성 버튼으로 시작하세요.'}
        />
        <Pager page={pageNo} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
      {creating && (
        <Drawer title="월별 실행예산 편성·신청" onClose={() => setCreating(false)}>
          <Form submit="편성·신청" onSubmit={create}>
            <Field label="본예산" required wide hint="승인된 본예산만 선택할 수 있습니다.">
              <LookupSelect table="budget_main" role={role} value={form.budgetMainId} onChange={(v) => setF('budgetMainId', v)} />
            </Field>
            <Field label="편성월" required>
              <Select value={form.executionMonth} onChange={(v) => setF('executionMonth', v)} options={MONTHS} />
            </Field>
            <Field label="실행예산 금액" required>
              <NumberInput value={form.executionAmount} onChange={(v) => setF('executionAmount', v)} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
