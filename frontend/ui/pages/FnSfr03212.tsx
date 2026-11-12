import { useState } from 'react';
import {
  PageProps,
  Row,
  call,
  Badge,
  Num,
  Band,
  DataTable,
  Drawer,
  Form,
  Field,
  NumberInput,
  Select,
  LookupSelect,
  RefName,
  Pairs,
} from '../kit';

const METHODS: [string, string][] = [
  ['카드사용내역', '카드사용내역'],
  ['세금계산서', '세금계산서'],
  ['통장거래내역', '통장거래내역'],
  ['직접입력', '직접입력'],
];

export default function FnSfr03212Page({ role, notify }: PageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState<Row | null>(null);
  const [requisitionId, setRequisitionId] = useState<unknown>('');
  const [projectId, setProjectId] = useState<unknown>('');
  const [budgetAccountId, setBudgetAccountId] = useState<unknown>('');
  const [partnerId, setPartnerId] = useState<unknown>('');
  const [departmentId, setDepartmentId] = useState<unknown>('');
  const [method, setMethod] = useState<unknown>('');
  const [amount, setAmount] = useState<unknown>('');

  const resetForm = () => {
    setRequisitionId('');
    setProjectId('');
    setBudgetAccountId('');
    setPartnerId('');
    setDepartmentId('');
    setMethod('');
    setAmount('');
  };

  const create = async () => {
    if (!projectId || !budgetAccountId || !partnerId || !departmentId || !method || amount === '') {
      throw new Error('필수 항목을 모두 입력해 주세요.');
    }
    const res = await call('POST', '/expense-resolutions', role, {
      requisitionId: requisitionId === '' ? undefined : requisitionId,
      projectId,
      budgetAccountId,
      partnerId,
      departmentId,
      resolutionMethod: method,
      resolutionAmount: amount,
    });
    const row: Row = {
      ...res,
      projectId,
      budgetAccountId,
      resolutionAmount: amount,
      resolutionMethod: method,
    };
    setRows([row, ...rows]);
    setCreating(false);
    resetForm();
    notify('결의서를 저장했습니다.');
  };

  const submit = async () => {
    if (!target) return;
    const id = target['expenseResolutionId'];
    const res = await call('POST', `/expense-resolutions/${id}/submit`, role, {});
    setRows(rows.map((r) => (r['expenseResolutionId'] === id ? { ...r, ...res } : r)));
    setTarget(null);
    notify('결의서를 상신했습니다.');
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>지출결의서</h2>
        <Band total={rows.length}>
          <button onClick={() => setCreating(true)}>결의서 작성</button>
        </Band>
        <DataTable
          rows={rows}
          empty="아직 작성한 결의서가 없습니다. 결의서 작성 버튼으로 시작하세요."
          columns={[
            { key: 'expenseResolutionId', label: '결의서 ID' },
            { key: 'projectId', label: '프로젝트', render: (r) => <RefName table="project" role={role} value={r['projectId']} /> },
            { key: 'resolutionAmount', label: '결의 금액', render: (r) => <Num value={r['resolutionAmount']} /> },
            { key: 'status', label: '진행 상태', render: (r) => <Badge value={r['status']} /> },
            {
              key: 'action',
              label: '처리',
              render: (r) =>
                r['status'] === '기안' ? (
                  <button className="ghost" onClick={() => setTarget(r)}>상신</button>
                ) : null,
            },
          ]}
        />
      </section>
      {creating && (
        <Drawer title="결의서 작성" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="저장">
            <Field label="품의서">
              <LookupSelect table="requisition" role={role} value={requisitionId} onChange={setRequisitionId} />
            </Field>
            <Field label="프로젝트" required>
              <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} />
            </Field>
            <Field label="예산과목" required>
              <LookupSelect table="budget_account" role={role} value={budgetAccountId} onChange={setBudgetAccountId} />
            </Field>
            <Field label="거래처" required>
              <LookupSelect table="partner" role={role} value={partnerId} onChange={setPartnerId} />
            </Field>
            <Field label="결의부서" required>
              <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} />
            </Field>
            <Field label="결의 방식" required>
              <Select value={method} onChange={setMethod} options={METHODS} />
            </Field>
            <Field label="결의 금액" required>
              <NumberInput value={amount} onChange={setAmount} />
            </Field>
          </Form>
        </Drawer>
      )}
      {target && (
        <Drawer title="결의서 상신" onClose={() => setTarget(null)}>
          <Pairs
            items={[
              ['결의서 ID', String(target['expenseResolutionId'])],
              ['결의 금액', <Num value={target['resolutionAmount']} />],
              ['진행 상태', <Badge value={target['status']} />],
            ]}
          />
          <Form
            onSubmit={submit}
            submit="상신"
            note="상신하면 결재가 요청되고 승인 전까지 수정할 수 없습니다."
          />
        </Drawer>
      )}
    </div>
  );
}
