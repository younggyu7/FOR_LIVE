import { useState } from 'react';
import { Band, Badge, DataTable, Drawer, Field, Form, LookupSelect, RefName, Select, call } from '../kit';
import type { PageProps, Row } from '../kit';

interface ActionDef {
  key: string;
  path: string;
  label: string;
  from: string;
  note: string;
  danger?: boolean;
}

const ACTIONS: ActionDef[] = [
  { key: 'close', path: 'close', label: '마감', from: '신청', note: '마감하면 신청 상태로 돌아갈 수 없고, 마감 취소로만 되돌릴 수 있습니다.' },
  { key: 'cancel-close', path: 'cancel-close', label: '마감 취소', from: '마감', note: '마감을 취소합니다.', danger: true },
  { key: 'approve', path: 'approve', label: '승인', from: '마감', note: '승인한 본예산은 승인 취소 후에만 변경할 수 있습니다.' },
  { key: 'cancel-approval', path: 'cancel-approval', label: '승인 취소', from: '승인', note: '승인을 취소합니다.', danger: true },
];

export default function FnSfr00302Page({ role, notify }: PageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [adding, setAdding] = useState(false);
  const [newId, setNewId] = useState<number | string>('');
  const [newAction, setNewAction] = useState('');
  const [target, setTarget] = useState<{ id: unknown; action: ActionDef } | null>(null);

  async function run(id: unknown, action: ActionDef) {
    const res = await call<Row>('POST', `/budget-mains/${String(id)}/${action.path}`, role);
    const next: Row = { budgetMainId: id, approvalStatus: res.approvalStatus };
    setRows((prev) => [next, ...prev.filter((r) => String(r.budgetMainId) !== String(id))]);
    notify(`본예산을 ${action.label} 처리했습니다.`);
  }

  const columns = [
    { key: 'budgetMainId', label: '본예산', render: (r: Row) => <RefName table="budget_main" role={role} value={r.budgetMainId} /> },
    { key: 'approvalStatus', label: '승인 처리 상태', render: (r: Row) => <Badge value={r.approvalStatus} /> },
    {
      key: 'actions',
      label: '처리',
      render: (r: Row) => (
        <span>
          {ACTIONS.filter((a) => a.from === r.approvalStatus).map((a) => (
            <button
              key={a.key}
              className={a.key === 'approve' ? undefined : 'ghost'}
              onClick={(e) => {
                e.stopPropagation();
                setTarget({ id: r.budgetMainId, action: a });
              }}
            >
              {a.label}
            </button>
          ))}
        </span>
      ),
    },
  ];

  return (
    <div className="doc">
      <section className="box">
        <h2>본예산 마감·승인 처리 결과</h2>
        <Band total={rows.length}>
          <button onClick={() => setAdding(true)}>처리할 본예산 선택</button>
        </Band>
        <DataTable columns={columns} rows={rows} empty="아직 처리한 본예산이 없습니다. 처리할 본예산을 선택해 주세요." />
      </section>

      {adding && (
        <Drawer title="처리할 본예산 선택" onClose={() => setAdding(false)}>
          <Form
            submit="처리"
            note="선택한 처리는 본예산의 현재 상태에서만 할 수 있습니다."
            onSubmit={async () => {
              if (newId === '' || !newAction) {
                throw new Error('본예산과 처리를 선택해 주세요.');
              }
              const action = ACTIONS.find((a) => a.key === newAction);
              if (!action) {
                throw new Error('처리를 선택해 주세요.');
              }
              await run(newId, action);
              setAdding(false);
              setNewId('');
              setNewAction('');
            }}
          >
            <Field label="본예산" required>
              <LookupSelect table="budget_main" role={role} value={newId} onChange={setNewId} />
            </Field>
            <Field label="처리" required>
              <Select
                value={newAction}
                onChange={setNewAction}
                options={ACTIONS.map((a): [string, string] => [a.key, a.label])}
              />
            </Field>
          </Form>
        </Drawer>
      )}

      {target && (
        <Drawer title={`본예산 ${target.action.label}`} onClose={() => setTarget(null)}>
          <Form
            submit={target.action.label}
            danger={target.action.danger}
            note={target.action.note}
            onSubmit={async () => {
              await run(target.id, target.action);
              setTarget(null);
            }}
          >
            <Field label="본예산" wide>
              <RefName table="budget_main" role={role} value={target.id} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
