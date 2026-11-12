import { useState } from 'react';
import {
  call,
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  RefName,
  TextInput,
} from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr01903Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<'' | 'adjust' | 'settle'>('');
  const [adjusts, setAdjusts] = useState<Row[]>([]);
  const [settlements, setSettlements] = useState<Row[]>([]);
  const [annualLeaveId, setAnnualLeaveId] = useState<number | string>('');
  const [adjustDays, setAdjustDays] = useState<number | string>('');
  const [changeReason, setChangeReason] = useState('');
  const [baseDate, setBaseDate] = useState('');

  function open(next: 'adjust' | 'settle') {
    setAnnualLeaveId('');
    setAdjustDays('');
    setChangeReason('');
    setBaseDate('');
    setMode(next);
  }

  async function submitAdjust() {
    if (annualLeaveId === '' || adjustDays === '' || changeReason.trim() === '') {
      throw new Error('연차, 조정 일수, 조정 사유를 모두 입력해 주세요.');
    }
    const res = await call('POST', `/annual-leaves/${annualLeaveId}/adjust`, role, {
      adjustDays,
      changeReason,
    });
    setAdjusts([{ annualLeaveId, adjustDays, changeReason, remainingDays: res.remainingDays }, ...adjusts]);
    notify('연차를 조정했습니다.');
    setMode('');
  }

  async function submitSettle() {
    if (annualLeaveId === '' || baseDate === '') {
      throw new Error('연차와 정산기준일을 입력해 주세요.');
    }
    const res = await call('POST', '/annual-leave-settlements', role, {
      annualLeaveId,
      settlementBaseDate: baseDate,
    });
    setSettlements([
      {
        annualLeaveSettlementId: res.annualLeaveSettlementId,
        annualLeaveId,
        settlementBaseDate: baseDate,
        unusedDays: res.unusedDays,
        unusedAllowance: res.unusedAllowance,
      },
      ...settlements,
    ]);
    notify('연차 정산을 확정했습니다.');
    setMode('');
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>연차 조정 결과</h2>
        <Band total={adjusts.length}>
          <button onClick={() => open('adjust')}>연차 조정</button>
          <button className="ghost" onClick={() => open('settle')}>연차 정산</button>
        </Band>
        <DataTable
          columns={[
            { key: 'annualLeaveId', label: '연차', render: (r) => <RefName table="annual_leave" role={role} value={r.annualLeaveId} /> },
            { key: 'adjustDays', label: '가산(+) 또는 차감(-) 일수', render: (r) => <Num value={r.adjustDays} /> },
            { key: 'changeReason', label: '조정 사유' },
            { key: 'remainingDays', label: '잔여일수', render: (r) => <Num value={r.remainingDays} /> },
          ]}
          rows={adjusts}
          empty="아직 조정한 내역이 없습니다. 연차 조정 버튼을 눌러 시작하세요."
        />
      </section>
      <section className="box">
        <h2>연차 정산 결과</h2>
        <DataTable
          columns={[
            { key: 'annualLeaveSettlementId', label: '연차 정산 ID' },
            { key: 'annualLeaveId', label: '연차', render: (r) => <RefName table="annual_leave" role={role} value={r.annualLeaveId} /> },
            { key: 'settlementBaseDate', label: '정산기준일', render: (r) => <DateText value={r.settlementBaseDate} /> },
            { key: 'unusedDays', label: '미사용 일수', render: (r) => <Num value={r.unusedDays} /> },
            { key: 'unusedAllowance', label: '미사용 수당', render: (r) => <Num value={r.unusedAllowance} /> },
          ]}
          rows={settlements}
          empty="아직 정산한 내역이 없습니다. 연차 정산 버튼을 눌러 시작하세요."
        />
      </section>
      {mode === 'adjust' && (
        <Drawer title="연차 조정" onClose={() => setMode('')}>
          <Form onSubmit={submitAdjust} submit="조정하기">
            <Field label="연차" required wide>
              <LookupSelect table="annual_leave" role={role} value={annualLeaveId} onChange={setAnnualLeaveId} />
            </Field>
            <Field label="가산(+) 또는 차감(-) 일수" required>
              <NumberInput value={adjustDays} onChange={setAdjustDays} />
            </Field>
            <Field label="조정 사유" required wide>
              <TextInput value={changeReason} onChange={setChangeReason} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
      {mode === 'settle' && (
        <Drawer title="연차 정산" onClose={() => setMode('')}>
          <Form
            onSubmit={submitSettle}
            submit="정산 확정"
            danger
            note="정산을 확정하면 되돌릴 수 없습니다. 미사용 일수와 수당은 확정 시 산출됩니다."
          >
            <Field label="연차" required wide>
              <LookupSelect table="annual_leave" role={role} value={annualLeaveId} onChange={setAnnualLeaveId} />
            </Field>
            <Field label="정산기준일" required>
              <DateInput value={baseDate} onChange={setBaseDate} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
