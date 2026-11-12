import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Filters,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  Pager,
  Pairs,
  RefName,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr00301Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Row>({});

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/budget-mains', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page, role],
  );

  const setDraftValue = (key: string, value: unknown) => setDraft({ ...draft, [key]: value });
  const setFormValue = (key: string, value: unknown) => setForm({ ...form, [key]: value });

  const search = () => {
    setPage(0);
    setApplied({ ...draft });
  };

  const reset = () => {
    setDraft({});
    setApplied({});
    setPage(0);
  };

  const submit = async () => {
    const required: [string, string][] = [
      ['accountingUnit', '회계단위'],
      ['fiscalYear', '기수(회계연도)'],
      ['projectId', '프로젝트'],
      ['budgetAccountId', '예산과목'],
      ['requestedAmount', '신청금액'],
      ['requestedDate', '신청일'],
    ];
    const empty = required.filter(([key]) => form[key] === undefined || form[key] === null || form[key] === '');
    if (empty.length > 0) {
      throw new Error(empty.map(([, label]) => label).join(', ') + ' 값을 입력해 주세요.');
    }
    await call('POST', '/budget-mains', role, {
      accountingUnit: form['accountingUnit'],
      fiscalYear: form['fiscalYear'],
      projectId: form['projectId'],
      budgetAccountId: form['budgetAccountId'],
      budgetGroup: form['budgetGroup'] ? form['budgetGroup'] : undefined,
      requestedAmount: form['requestedAmount'],
      requestedDate: form['requestedDate'],
    });
    notify('본예산을 신청했습니다.');
    setCreating(false);
    setForm({});
    setPage(0);
    reload();
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>본예산 신청 내용</h2>
          <Pairs
            items={[
              ['회계단위', String(selected['accountingUnit'] ?? '')],
              ['기수(회계연도)', String(selected['fiscalYear'] ?? '')],
              ['프로젝트', <RefName table="project" role={role} value={selected['projectId']} />],
              ['예산과목', <RefName table="budget_account" role={role} value={selected['budgetAccountId']} />],
              ['예산그룹', String(selected['budgetGroup'] ?? '')],
              ['신청금액', <Num value={selected['requestedAmount']} />],
              ['신청일', <DateText value={selected['requestedDate']} />],
              ['신청자', <RefName table="employee" role={role} value={selected['requesterId']} />],
              ['승인 처리 상태', <Badge value={selected['approvalStatus']} />],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>본예산 편성 대상</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="회계단위">
            <TextInput value={draft['accountingUnit']} onChange={(v) => setDraftValue('accountingUnit', v)} />
          </Field>
          <Field label="기수(회계연도)">
            <NumberInput value={draft['fiscalYear']} onChange={(v) => setDraftValue('fiscalYear', v)} />
          </Field>
          <Field label="프로젝트">
            <LookupSelect table="project" role={role} value={draft['projectId']} onChange={(v) => setDraftValue('projectId', v)} />
          </Field>
          <Field label="예산그룹">
            <TextInput value={draft['budgetGroup']} onChange={(v) => setDraftValue('budgetGroup', v)} />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={() => setCreating(true)}>본예산 신청</button>
        </Band>
        {error ? <p>{error}</p> : null}
        {loading && !data ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          rows={data?.items ?? []}
          onRowClick={(row) => setSelected(row)}
          empty="아직 신청한 본예산이 없습니다. 본예산 신청 버튼으로 등록해 주세요."
          columns={[
            { key: 'fiscalYear', label: '기수(회계연도)' },
            { key: 'projectId', label: '프로젝트', render: (r) => <RefName table="project" role={role} value={r['projectId']} /> },
            { key: 'budgetAccountId', label: '예산과목', render: (r) => <RefName table="budget_account" role={role} value={r['budgetAccountId']} /> },
            { key: 'requestedAmount', label: '신청금액', render: (r) => <Num value={r['requestedAmount']} /> },
            { key: 'approvalStatus', label: '승인 처리 상태', render: (r) => <Badge value={r['approvalStatus']} /> },
          ]}
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {creating ? (
        <Drawer title="본예산 신청" onClose={() => setCreating(false)}>
          <Form submit="신청 저장" onSubmit={submit} note="신청자는 현재 로그인한 사용자로 기록되고, 처리 상태는 '신청'으로 저장됩니다.">
            <Field label="회계단위" required>
              <TextInput value={form['accountingUnit']} onChange={(v) => setFormValue('accountingUnit', v)} />
            </Field>
            <Field label="기수(회계연도)" required>
              <NumberInput value={form['fiscalYear']} onChange={(v) => setFormValue('fiscalYear', v)} />
            </Field>
            <Field label="프로젝트" required>
              <LookupSelect table="project" role={role} value={form['projectId']} onChange={(v) => setFormValue('projectId', v)} />
            </Field>
            <Field label="예산과목" required>
              <LookupSelect table="budget_account" role={role} value={form['budgetAccountId']} onChange={(v) => setFormValue('budgetAccountId', v)} />
            </Field>
            <Field label="예산그룹">
              <TextInput value={form['budgetGroup']} onChange={(v) => setFormValue('budgetGroup', v)} />
            </Field>
            <Field label="신청금액" required>
              <NumberInput value={form['requestedAmount']} onChange={(v) => setFormValue('requestedAmount', v)} />
            </Field>
            <Field label="신청일" required>
              <DateInput value={form['requestedDate']} onChange={(v) => setFormValue('requestedDate', v)} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
