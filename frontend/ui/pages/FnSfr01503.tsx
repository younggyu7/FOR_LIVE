import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  Drawer,
  Field,
  Form,
  LookupSelect,
  RefName,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

type Mode =
  | { kind: 'create' }
  | { kind: 'approve'; row: Row }
  | { kind: 'reject'; row: Row }
  | { kind: 'cancel'; row: Row }
  | { kind: 'delete'; row: Row };

export default function FnSfr01503Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [mode, setMode] = useState<Mode | null>(null);
  const [sessionId, setSessionId] = useState<number | string>('');
  const [reason, setReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  function close() {
    setMode(null);
    setSessionId('');
    setReason('');
    setRejectReason('');
  }

  function replaceRow(id: unknown, next: Row) {
    setResults((list) => list.map((r) => (r.educationApplicationId === id ? { ...r, ...next } : r)));
  }

  async function create() {
    if (sessionId === '') {
      throw new Error('교육차수를 선택해 주세요.');
    }
    const res = await call('POST', '/education-applications', role, {
      educationSessionId: sessionId,
      applicationReason: reason,
    });
    setResults((list) => [{ ...res, educationSessionId: sessionId }, ...list]);
    notify('교육을 신청했습니다.');
    close();
  }

  async function approve(row: Row) {
    const res = await call('POST', `/education-applications/${row.educationApplicationId}/approve`, role, {});
    replaceRow(row.educationApplicationId, res);
    notify('교육신청을 승인했습니다.');
    close();
  }

  async function reject(row: Row) {
    if (rejectReason.trim() === '') {
      throw new Error('반려 사유를 입력해 주세요.');
    }
    const res = await call('POST', `/education-applications/${row.educationApplicationId}/reject`, role, {
      rejectReason,
    });
    replaceRow(row.educationApplicationId, res);
    notify('교육신청을 반려했습니다.');
    close();
  }

  async function cancelApproval(row: Row) {
    const res = await call('POST', `/education-applications/${row.educationApplicationId}/cancel-approval`, role, {});
    replaceRow(row.educationApplicationId, res);
    notify('승인을 취소했습니다.');
    close();
  }

  async function remove(row: Row) {
    await call('DELETE', `/education-applications/${row.educationApplicationId}`, role);
    setResults((list) => list.filter((r) => r.educationApplicationId !== row.educationApplicationId));
    notify('교육신청을 삭제했습니다.');
    close();
  }

  const columns = [
    { key: 'educationApplicationId', label: '교육신청 ID' },
    {
      key: 'educationSessionId',
      label: '교육차수',
      render: (r: Row) => <RefName table="education_session" role={role} value={r.educationSessionId} />,
    },
    { key: 'status', label: '처리 상태', render: (r: Row) => <Badge value={r.status} /> },
    {
      key: 'actions',
      label: '처리',
      render: (r: Row) => (
        <span>
          {r.status === '신청' && (
            <button className="ghost" onClick={() => setMode({ kind: 'approve', row: r })}>
              승인
            </button>
          )}
          {r.status === '신청' && (
            <button className="ghost" onClick={() => setMode({ kind: 'reject', row: r })}>
              반려
            </button>
          )}
          {r.status === '승인' && (
            <button className="ghost" onClick={() => setMode({ kind: 'cancel', row: r })}>
              승인 취소
            </button>
          )}
          {r.status !== '승인' && (
            <button className="ghost" onClick={() => setMode({ kind: 'delete', row: r })}>
              삭제
            </button>
          )}
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>교육신청 및 승인 처리</h1>
      <Band total={results.length}>
        <button onClick={() => setMode({ kind: 'create' })}>교육 신청</button>
      </Band>
      <DataTable
        columns={columns}
        rows={results}
        empty="아직 처리한 내역이 없습니다. 교육 신청 버튼으로 시작해 주세요."
      />
      {mode?.kind === 'create' && (
        <Drawer title="교육 신청" onClose={close}>
          <Form onSubmit={create} submit="신청">
            <Field label="교육차수" required>
              <LookupSelect table="education_session" role={role} value={sessionId} onChange={setSessionId} />
            </Field>
            <Field label="신청 사유" wide>
              <TextInput value={reason} onChange={setReason} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
      {mode?.kind === 'approve' && (
        <Drawer title="교육신청 승인" onClose={close}>
          <Form
            onSubmit={() => approve(mode.row)}
            submit="승인"
            note="승인하면 신청자가 해당 차수의 교육대상자로 반영되고 신청자에게 알림이 갑니다."
          />
        </Drawer>
      )}
      {mode?.kind === 'reject' && (
        <Drawer title="교육신청 반려" onClose={close}>
          <Form onSubmit={() => reject(mode.row)} submit="반려" danger>
            <Field label="반려 사유" required wide>
              <TextInput value={rejectReason} onChange={setRejectReason} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
      {mode?.kind === 'cancel' && (
        <Drawer title="승인 취소" onClose={close}>
          <Form
            onSubmit={() => cancelApproval(mode.row)}
            submit="승인 취소"
            danger
            note="승인을 취소하면 변경 이력이 남습니다."
          />
        </Drawer>
      )}
      {mode?.kind === 'delete' && (
        <Drawer title="교육신청 삭제" onClose={close}>
          <Form
            onSubmit={() => remove(mode.row)}
            submit="삭제"
            danger
            note="삭제한 신청은 되돌릴 수 없습니다."
          />
        </Drawer>
      )}
    </div>
  );
}
