import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateText,
  Drawer,
  Field,
  Form,
  LookupSelect,
  Num,
  RefName,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr02110Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [payrollRunId, setPayrollRunId] = useState<number | string>('');

  const submit = async () => {
    if (payrollRunId === '') {
      throw new Error('전표처리할 급여 지급일을 선택해 주세요.');
    }
    const res = await call('POST', `/payroll-runs/${payrollRunId}/create-journal-entry`, role, {});
    setResults([{ ...res, payrollRunId }, ...results]);
    notify('급여 전표처리를 했습니다.');
    setOpen(false);
    setPayrollRunId('');
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>급여 전표처리</h2>
        <Band total={results.length}>
          <button onClick={() => setOpen(true)}>전표처리</button>
        </Band>
        <DataTable
          columns={[
            { key: 'payrollRunId', label: '급여 지급일', render: (r) => <RefName table="payroll_run" role={role} value={r.payrollRunId} /> },
            { key: 'journalEntryId', label: '전표 ID' },
            { key: 'entryDate', label: '전표 일자', render: (r) => <DateText value={r.entryDate} /> },
            { key: 'totalDebitAmount', label: '차변 합계', render: (r) => <Num value={r.totalDebitAmount} /> },
            { key: 'journalStatus', label: '전표처리 상태', render: (r) => <Badge value={r.journalStatus} /> },
          ]}
          rows={results}
          empty="아직 전표처리한 내역이 없습니다. 전표처리 버튼으로 마감된 급여를 처리해 주세요."
        />
      </section>
      {open && (
        <Drawer title="급여 전표처리" onClose={() => setOpen(false)}>
          <Form
            onSubmit={submit}
            submit="전표처리"
            note="마감된 급여만 처리할 수 있고, 처리한 급여는 다시 전표처리할 수 없습니다."
          >
            <Field label="급여 지급일" required wide>
              <LookupSelect table="payroll_run" role={role} value={payrollRunId} onChange={setPayrollRunId} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
