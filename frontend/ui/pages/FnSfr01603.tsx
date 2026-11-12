import { useState } from 'react';
import { Band, Badge, DataTable, Drawer, Field, Form, LookupSelect, NumberInput, RefName, TextInput, call } from '../kit';
import type { PageProps } from '../kit';

type Item = {
  id: number;
  certificateTypeId: number | string;
  purpose: string;
  copies: number | string;
  status: string;
  issueNumber: string;
};

type Panel =
  | { kind: 'create' }
  | { kind: 'approve'; item: Item }
  | { kind: 'reject'; item: Item }
  | null;

export default function FnSfr01603Page({ role, notify }: PageProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [typeId, setTypeId] = useState<number | string>('');
  const [purpose, setPurpose] = useState('');
  const [copies, setCopies] = useState<number | string>('');
  const [reason, setReason] = useState('');

  function patch(id: number, change: Partial<Item>) {
    setItems((list) => list.map((row) => (row.id === id ? { ...row, ...change } : row)));
  }

  function openCreate() {
    setTypeId('');
    setPurpose('');
    setCopies('');
    setPanel({ kind: 'create' });
  }

  async function create() {
    if (typeId === '') {
      throw new Error('증명서 종류를 선택해 주세요.');
    }
    const body: Record<string, unknown> = { certificateTypeId: typeId };
    if (purpose !== '') {
      body.purpose = purpose;
    }
    if (copies !== '') {
      body.copies = copies;
    }
    const result = await call<{ certificateRequestId: number; status: string }>('POST', '/certificate-requests', role, body);
    setItems((list) => [
      {
        id: result.certificateRequestId,
        certificateTypeId: typeId,
        purpose,
        copies,
        status: result.status,
        issueNumber: '',
      },
      ...list,
    ]);
    setPanel(null);
    notify('증명서를 신청했습니다.');
  }

  async function approve(item: Item) {
    const result = await call<{ status: string; issueNumber: string }>(
      'POST',
      `/certificate-requests/${item.id}/approve`,
      role,
      {},
    );
    patch(item.id, { status: result.status, issueNumber: result.issueNumber });
    setPanel(null);
    notify('승인했습니다.');
  }

  async function reject(item: Item) {
    if (reason.trim() === '') {
      throw new Error('반려 사유를 입력해 주세요.');
    }
    const result = await call<{ status: string }>(
      'POST',
      `/certificate-requests/${item.id}/reject`,
      role,
      { rejectReason: reason },
    );
    patch(item.id, { status: result.status });
    setPanel(null);
    notify('반려했습니다.');
  }

  const columns = [
    {
      key: 'certificateTypeId',
      label: '증명서 종류',
      render: (row: Item) => <RefName table="certificate_type" role={role} value={row.certificateTypeId} />,
    },
    { key: 'purpose', label: '용도', render: (row: Item) => <span>{row.purpose || '-'}</span> },
    { key: 'status', label: '처리 상태', render: (row: Item) => <Badge value={row.status} /> },
    { key: 'issueNumber', label: '발급번호', render: (row: Item) => <span>{row.issueNumber || '-'}</span> },
    {
      key: 'actions',
      label: '처리',
      render: (row: Item) =>
        row.status === '신청' ? (
          <span>
            <button className="ghost" onClick={() => setPanel({ kind: 'approve', item: row })}>승인</button>
            <button className="ghost" onClick={() => { setReason(''); setPanel({ kind: 'reject', item: row }); }}>반려</button>
          </span>
        ) : (
          <span>-</span>
        ),
    },
  ];

  return (
    <div className="doc">
      <section className="box">
        <h2>증명서 신청 검토·승인</h2>
        <Band total={items.length}>
          <button onClick={openCreate}>증명서 신청</button>
        </Band>
        <DataTable<Item>
          columns={columns}
          rows={items}
          empty="아직 처리한 신청 내역이 없습니다. 증명서 신청 버튼으로 시작해 주세요."
        />
      </section>

      {panel && panel.kind === 'create' && (
        <Drawer title="증명서 신청" onClose={() => setPanel(null)}>
          <Form onSubmit={create} submit="신청">
            <Field label="증명서 종류 ID" required>
              <LookupSelect table="certificate_type" role={role} value={typeId} onChange={setTypeId} />
            </Field>
            <Field label="용도">
              <TextInput value={purpose} onChange={setPurpose} />
            </Field>
            <Field label="부수">
              <NumberInput value={copies} onChange={setCopies} />
            </Field>
          </Form>
        </Drawer>
      )}

      {panel && panel.kind === 'approve' && (
        <Drawer title="증명서 신청 승인" onClose={() => setPanel(null)}>
          <Form
            onSubmit={() => approve(panel.item)}
            submit="승인"
            note="승인하면 발급번호가 부여되고 되돌릴 수 없습니다."
          />
        </Drawer>
      )}

      {panel && panel.kind === 'reject' && (
        <Drawer title="증명서 신청 반려" onClose={() => setPanel(null)}>
          <Form
            onSubmit={() => reject(panel.item)}
            submit="반려"
            danger
            note="반려하면 다시 처리할 수 없습니다."
          >
            <Field label="반려 사유" required wide>
              <TextInput value={reason} onChange={setReason} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
