import { useState } from 'react';
import {
  call,
  Badge,
  Band,
  DataTable,
  DateText,
  Drawer,
  Field,
  Form,
  LookupSelect,
  RefName,
  Select,
  TextInput,
} from '../kit';
import type { PageProps, Row } from '../kit';

type Action = {
  key: string;
  label: string;
  method: 'POST' | 'DELETE';
  suffix: string;
  from: string[];
  danger: boolean;
};

const ACTIONS: Action[] = [
  { key: 'approve', label: '승인', method: 'POST', suffix: '/approve', from: ['신청'], danger: false },
  { key: 'reject', label: '반려', method: 'POST', suffix: '/reject', from: ['신청'], danger: true },
  { key: 'cancel-approval', label: '승인 취소', method: 'POST', suffix: '/cancel-approval', from: ['승인'], danger: true },
  { key: 'cancel', label: '예약 취소', method: 'POST', suffix: '/cancel', from: ['신청', '승인'], danger: true },
  { key: 'delete', label: '예약 삭제', method: 'DELETE', suffix: '', from: ['신청', '반려', '취소'], danger: true },
];

export default function FnSfr03305Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [reservationId, setReservationId] = useState<number | string>('');
  const [knownStatus, setKnownStatus] = useState('');
  const [actionKey, setActionKey] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const action = ACTIONS.find((a) => a.key === actionKey);
  const options: [string, string][] = ACTIONS.filter((a) => !knownStatus || a.from.includes(knownStatus)).map(
    (a) => [a.key, a.label],
  );

  function openDrawer(id: number | string, status: string) {
    setReservationId(id);
    setKnownStatus(status);
    setActionKey('');
    setRejectReason('');
    setOpen(true);
  }

  async function submit() {
    if (reservationId === '' || reservationId === undefined) {
      throw new Error('처리할 예약을 선택해 주세요.');
    }
    if (!action) {
      throw new Error('처리 구분을 선택해 주세요.');
    }
    const path = `/resource-reservations/${reservationId}${action.suffix}`;
    const body: Row = action.key === 'reject' ? { rejectReason } : {};
    const res = await call(action.method, path, role, action.method === 'POST' ? body : undefined);
    if (action.key === 'delete') {
      setResults((prev) => prev.filter((r) => String(r.id) !== String(reservationId)));
      notify('예약을 삭제했습니다.');
    } else {
      const entry: Row = {
        id: reservationId,
        action: action.label,
        status: res.status,
        processedAt: res.processedAt,
        processedBy: res.processedBy,
      };
      setResults((prev) => [entry, ...prev.filter((r) => String(r.id) !== String(reservationId))]);
      notify(`예약을 ${action.label} 처리했습니다.`);
    }
    setOpen(false);
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>예약 처리 결과</h2>
        <Band total={results.length}>
          <button type="button" onClick={() => openDrawer('', '')}>
            예약 처리
          </button>
        </Band>
        <DataTable
          columns={[
            { key: 'id', label: '예약', render: (r) => <RefName table="resource_reservation" role={role} value={r.id} /> },
            { key: 'action', label: '처리' },
            { key: 'status', label: '예약 상태', render: (r) => <Badge value={r.status} /> },
            { key: 'processedAt', label: '처리 일시', render: (r) => <DateText value={r.processedAt} time /> },
            { key: 'processedBy', label: '처리자', render: (r) => <RefName table="employee" role={role} value={r.processedBy} /> },
          ]}
          rows={results}
          onRowClick={(r) => openDrawer(r.id as number | string, String(r.status))}
          empty="아직 처리한 예약이 없습니다. '예약 처리' 버튼으로 예약을 선택해 처리해 주세요."
        />
      </section>
      {open && (
        <Drawer title="예약 처리" onClose={() => setOpen(false)}>
          <Form
            onSubmit={submit}
            submit={action ? action.label : '처리'}
            danger={action ? action.danger : false}
            note={action && action.key === 'delete' ? '삭제한 예약은 되돌릴 수 없습니다.' : undefined}
          >
            <Field label="예약" required wide>
              <LookupSelect table="resource_reservation" role={role} value={reservationId} onChange={setReservationId} />
            </Field>
            <Field label="처리 구분" required wide>
              <Select value={actionKey} onChange={setActionKey} options={options} />
            </Field>
            {actionKey === 'reject' && (
              <Field label="반려 사유" wide>
                <TextInput value={rejectReason} onChange={setRejectReason} multiline />
              </Field>
            )}
          </Form>
        </Drawer>
      )}
    </div>
  );
}
