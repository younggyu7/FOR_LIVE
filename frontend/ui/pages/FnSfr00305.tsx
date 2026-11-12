import { useState } from 'react';
import { Badge, Band, DataTable, Drawer, ErrorText, Field, Filters, Form, LookupSelect, Num, NumberInput, Pager, RefName, Select, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const TYPES: [string, string][] = [
  ['추경예산', '추경예산'],
  ['전용', '전용'],
  ['이용', '이용'],
  ['예비비', '예비비'],
];
const SIZE = 20;
const EMPTY: Row = {
  adjustmentType: '',
  projectId: '',
  budgetAccountId: '',
  targetBudgetAccountId: '',
  adjustmentAmount: '',
};

export default function FnSfr00305Page({ role, notify }: PageProps) {
  const [projectFilter, setProjectFilter] = useState<number | string>('');
  const [accountFilter, setAccountFilter] = useState<number | string>('');
  const [query, setQuery] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Row>(EMPTY);
  const [done, setDone] = useState<Row[]>([]);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/budget-accounts/execution-status', role, undefined, { ...query, page, size: SIZE }),
    [role, query, page],
  );

  const setField = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));
  const needTarget = form.adjustmentType === '전용' || form.adjustmentType === '이용';

  async function submit() {
    const type = String(form.adjustmentType ?? '');
    if (!type) throw new Error('조정 구분을 선택해 주세요.');
    if (form.projectId === '' || form.projectId === undefined) throw new Error('프로젝트를 선택해 주세요.');
    if (form.budgetAccountId === '' || form.budgetAccountId === undefined) throw new Error('예산과목을 선택해 주세요.');
    if (needTarget && (form.targetBudgetAccountId === '' || form.targetBudgetAccountId === undefined)) {
      throw new Error('전용·이용은 상대 예산과목을 선택해 주세요.');
    }
    if (form.adjustmentAmount === '' || form.adjustmentAmount === undefined) throw new Error('조정 금액을 입력해 주세요.');
    const amount = Number(form.adjustmentAmount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('조정 금액은 0보다 큰 숫자로 입력해 주세요.');
    const body: Row = {
      adjustmentType: type,
      projectId: form.projectId,
      budgetAccountId: form.budgetAccountId,
      adjustmentAmount: amount,
    };
    if (needTarget) body.targetBudgetAccountId = form.targetBudgetAccountId;
    const res = await call<Row>('POST', '/budget-adjustments', role, body);
    const added: Row = {
      budgetAdjustmentId: res.budgetAdjustmentId,
      adjustmentType: type,
      budgetAccountId: form.budgetAccountId,
      adjustmentAmount: amount,
      approvalStatus: res.approvalStatus,
    };
    setDone((prev) => [added, ...prev]);
    setOpen(false);
    setForm(EMPTY);
    notify('예산조정을 신청했습니다.');
    reload();
  }

  async function closeAdjustment(row: Row) {
    try {
      const res = await call<Row>('POST', `/budget-adjustments/${row.budgetAdjustmentId}/close`, role, {});
      setDone((prev) => prev.map((r) => (r.budgetAdjustmentId === row.budgetAdjustmentId ? { ...r, approvalStatus: res.approvalStatus } : r)));
      notify('예산조정을 마감했습니다.');
      reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : '마감하지 못했습니다.');
    }
  }

  return (
    <div className='doc'>
      <section className='box'>
        <h2>예산과목별 집행액과 잔액</h2>
        <Filters
          onSearch={() => {
            setQuery({ projectId: projectFilter, budgetAccountId: accountFilter });
            setPage(0);
          }}
          onReset={() => {
            setProjectFilter('');
            setAccountFilter('');
            setQuery({});
            setPage(0);
          }}
        >
          <Field label='프로젝트 조건'>
            <LookupSelect table='project' role={role} value={projectFilter} onChange={setProjectFilter} />
          </Field>
          <Field label='예산과목 조건'>
            <LookupSelect table='budget_account' role={role} value={accountFilter} onChange={setAccountFilter} />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={() => setOpen(true)}>예산조정 신청</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        {loading ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          columns={[
            { key: 'budgetAccountId', label: '예산과목', render: (r) => <RefName table='budget_account' role={role} value={r.budgetAccountId} /> },
            { key: 'executedAmount', label: '예산과목별 집행액', render: (r) => <Num value={r.executedAmount} /> },
            { key: 'remainingAmount', label: '예산과목별 예산잔액', render: (r) => <Num value={r.remainingAmount} /> },
          ]}
          rows={data?.items ?? []}
          empty='조건에 맞는 예산과목이 없습니다. 조회 조건을 바꿔 보세요.'
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>

      <section className='box'>
        <h2>이 화면에서 처리한 예산조정</h2>
        <DataTable
          columns={[
            { key: 'adjustmentType', label: '예산 조정 구분' },
            { key: 'budgetAccountId', label: '예산과목(출처)', render: (r) => <RefName table='budget_account' role={role} value={r.budgetAccountId} /> },
            { key: 'adjustmentAmount', label: '조정 금액', render: (r) => <Num value={r.adjustmentAmount} /> },
            { key: 'approvalStatus', label: '승인 처리 상태', render: (r) => <Badge value={r.approvalStatus} /> },
            {
              key: 'action',
              label: '처리',
              render: (r) => (r.approvalStatus === '신청' ? <button className='ghost' onClick={() => closeAdjustment(r)}>마감</button> : null),
            },
          ]}
          rows={done}
          empty='아직 신청한 예산조정이 없습니다. 예산조정 신청 버튼을 눌러 시작하세요.'
        />
      </section>

      {open ? (
        <Drawer title='예산조정 신청' onClose={() => setOpen(false)}>
          <Form onSubmit={submit} submit='신청'>
            <Field label='예산 조정 구분' required>
              <Select value={form.adjustmentType} onChange={(v) => setField('adjustmentType', v)} options={TYPES} />
            </Field>
            <Field label='프로젝트' required>
              <LookupSelect table='project' role={role} value={form.projectId} onChange={(v) => setField('projectId', v)} />
            </Field>
            <Field label='예산과목(출처)' required>
              <LookupSelect table='budget_account' role={role} value={form.budgetAccountId} onChange={(v) => setField('budgetAccountId', v)} />
            </Field>
            {needTarget ? (
              <Field label='상대 예산과목' required>
                <LookupSelect table='budget_account' role={role} value={form.targetBudgetAccountId} onChange={(v) => setField('targetBudgetAccountId', v)} />
              </Field>
            ) : null}
            <Field label='조정 금액' required>
              <NumberInput value={form.adjustmentAmount} onChange={(v) => setField('adjustmentAmount', v)} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
