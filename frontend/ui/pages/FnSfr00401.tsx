import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
  Band,
  DataTable,
  Drawer,
  Pairs,
  Tiles,
  Form,
  Field,
  TextInput,
  NumberInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row } from '../kit';

function BudgetStatus({ role, projectId, budgetAccountId }: { role: string; projectId: unknown; budgetAccountId: unknown }) {
  const { data, error, loading } = useData<{ items: Row[] }>(
    () => call<{ items: Row[] }>('GET', '/budget-accounts/execution-status', role, undefined, { projectId, budgetAccountId }),
    [projectId, budgetAccountId],
  );
  if (loading) {
    return <p>예산현황을 불러오는 중입니다.</p>;
  }
  if (error) {
    return <ErrorText text={error} />;
  }
  const item = data && data.items.length > 0 ? data.items[0] : undefined;
  if (!item) {
    return <p>선택한 예산과목의 예산현황이 없습니다.</p>;
  }
  return (
    <Tiles
      items={[
        ['집행액', <Num value={item.executedAmount} />],
        ['예산잔액', <Num value={item.remainingAmount} />],
      ]}
    />
  );
}

function Detail({ role, requisitionId, onBack }: { role: string; requisitionId: unknown; onBack: () => void }) {
  const { data, error, loading } = useData<Row>(
    () => call('GET', '/requisitions/' + String(requisitionId), role),
    [requisitionId],
  );
  return (
    <div className="doc">
      <button className="ghost" onClick={onBack}>목록으로 돌아가기</button>
      {loading && <p>품의서를 불러오는 중입니다.</p>}
      {error && <ErrorText text={error} />}
      {data && (
        <>
          <section className="box">
            <h2>품의 내용</h2>
            <Pairs
              items={[
                ['품의서 ID', String(data.requisitionId)],
                ['프로젝트', <RefName table="project" role={role} value={data.projectId} />],
                ['예산과목', <RefName table="budget_account" role={role} value={data.budgetAccountId} />],
                ['품의 제목', String(data.title ?? '')],
                ['품의 내용', String(data.content ?? '')],
                ['품의 금액', <Num value={data.requisitionAmount} />],
                ['처리 상태', <Badge value={data.status} />],
              ]}
            />
          </section>
          <section className="box">
            <h2>예산현황</h2>
            <BudgetStatus role={role} projectId={data.projectId} budgetAccountId={data.budgetAccountId} />
          </section>
        </>
      )}
    </div>
  );
}

export default function FnSfr00401Page({ role, notify }: PageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<unknown>(undefined);
  const [creating, setCreating] = useState(false);
  const [projectId, setProjectId] = useState<number | string>('');
  const [budgetAccountId, setBudgetAccountId] = useState<number | string>('');
  const [requisitionType, setRequisitionType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState<number | string>('');

  function openCreate() {
    setProjectId('');
    setBudgetAccountId('');
    setRequisitionType('');
    setTitle('');
    setContent('');
    setAmount('');
    setCreating(true);
  }

  async function submit() {
    const missing: string[] = [];
    if (projectId === '') missing.push('프로젝트');
    if (budgetAccountId === '') missing.push('예산과목');
    if (requisitionType === '') missing.push('품의 유형');
    if (title.trim() === '') missing.push('품의 제목');
    if (amount === '') missing.push('품의 금액');
    if (missing.length > 0) {
      throw new Error('다음 항목을 입력해 주세요: ' + missing.join(', '));
    }
    const created = await call('POST', '/requisitions', role, {
      projectId,
      budgetAccountId,
      requisitionType,
      title,
      content,
      requisitionAmount: amount,
    });
    setRows([
      {
        requisitionId: created.requisitionId,
        projectId,
        title,
        requisitionAmount: amount,
        status: created.status,
      },
      ...rows,
    ]);
    setCreating(false);
    notify('품의서를 저장했습니다.');
  }

  if (selected !== undefined) {
    return <Detail role={role} requisitionId={selected} onBack={() => setSelected(undefined)} />;
  }

  return (
    <div className="doc">
      <h1>품의서</h1>
      <Band total={rows.length}>
        <button onClick={openCreate}>품의서 작성</button>
      </Band>
      <DataTable
        rows={rows}
        onRowClick={(row) => setSelected(row.requisitionId)}
        empty="아직 작성한 품의서가 없습니다. 품의서 작성 버튼을 눌러 시작하세요."
        columns={[
          { key: 'requisitionId', label: '품의서 ID' },
          { key: 'title', label: '품의 제목' },
          { key: 'projectId', label: '프로젝트', render: (row) => <RefName table="project" role={role} value={row.projectId} /> },
          { key: 'requisitionAmount', label: '품의 금액', render: (row) => <Num value={row.requisitionAmount} /> },
          { key: 'status', label: '처리 상태', render: (row) => <Badge value={row.status} /> },
        ]}
      />
      {creating && (
        <Drawer title="품의서 작성" onClose={() => setCreating(false)}>
          <Form onSubmit={submit} submit="저장">
            <Field label="프로젝트" required>
              <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} />
            </Field>
            <Field label="예산과목" required>
              <LookupSelect table="budget_account" role={role} value={budgetAccountId} onChange={setBudgetAccountId} />
            </Field>
            {budgetAccountId !== '' && (
              <Field label="예산현황" wide>
                <BudgetStatus role={role} projectId={projectId} budgetAccountId={budgetAccountId} />
              </Field>
            )}
            <Field label="품의 유형" required>
              <Select value={requisitionType} onChange={setRequisitionType} options={[['지출', '지출'], ['구매', '구매']]} />
            </Field>
            <Field label="품의 제목" required wide>
              <TextInput value={title} onChange={setTitle} />
            </Field>
            <Field label="품의 내용" wide>
              <TextInput value={content} onChange={setContent} multiline />
            </Field>
            <Field label="품의 금액" required>
              <NumberInput value={amount} onChange={setAmount} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
