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
  Pairs,
  RefName,
  Tiles,
} from '../kit';
import type { PageProps, Row } from '../kit';

interface SendResult extends Row {
  payDate: string;
  successCount: number;
  failureCount: number;
  failures: Row[];
}

export default function FnSfr02106Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<SendResult[]>([]);
  const [sending, setSending] = useState(false);
  const [detail, setDetail] = useState<SendResult | null>(null);
  const [payDate, setPayDate] = useState('');
  const [employeeIds, setEmployeeIds] = useState<number[]>([]);
  const [pick, setPick] = useState<number | string>('');

  function openSend() {
    setPayDate('');
    setEmployeeIds([]);
    setPick('');
    setSending(true);
  }

  function addEmployee() {
    if (typeof pick !== 'number') {
      return;
    }
    if (!employeeIds.includes(pick)) {
      setEmployeeIds([...employeeIds, pick]);
    }
    setPick('');
  }

  async function send() {
    if (!payDate) {
      throw new Error('지급일을 입력해 주세요.');
    }
    const body: Row = { payDate };
    if (employeeIds.length > 0) {
      body.employeeIds = employeeIds;
    }
    const res = await call<Row>('POST', '/payslips/send', role, body);
    const result: SendResult = {
      payDate,
      successCount: Number(res.successCount ?? 0),
      failureCount: Number(res.failureCount ?? 0),
      failures: (res.failures as Row[]) ?? [],
    };
    setResults([result, ...results]);
    setSending(false);
    notify('급여명세서를 발송했습니다.');
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>급여명세서 발송</h2>
        <Band total={results.length}>
          <button type="button" onClick={openSend}>급여명세서 발송</button>
        </Band>
        <DataTable<SendResult>
          columns={[
            { key: 'payDate', label: '발송 대상 지급일', render: (r) => <DateText value={r.payDate} /> },
            { key: 'successCount', label: '발송 성공 건수', render: (r) => <Num value={r.successCount} /> },
            { key: 'failureCount', label: '발송 실패 건수', render: (r) => <Num value={r.failureCount} /> },
          ]}
          rows={results}
          onRowClick={(r) => setDetail(r)}
          empty="아직 발송한 내역이 없습니다. 급여명세서 발송 버튼을 눌러 마감된 급여를 발송해 보세요."
        />
      </section>

      {sending && (
        <Drawer title="급여명세서 발송" onClose={() => setSending(false)}>
          <Form
            onSubmit={send}
            submit="발송"
            note="마감된 급여만 통합알림으로 발송할 수 있습니다. 수신 임직원을 고르지 않으면 해당 지급일의 전체 대상에게 발송합니다."
          >
            <Field label="발송 대상 지급일" required>
              <DateInput value={payDate} onChange={setPayDate} />
            </Field>
            <Field label="수신 임직원 ID 목록" wide hint="선택하지 않으면 전체 발송">
              <LookupSelect
                table="employee"
                role={role}
                value={pick}
                onChange={setPick}
                placeholder="임직원 선택"
              />
              <button type="button" className="ghost" onClick={addEmployee}>추가</button>
              <ul>
                {employeeIds.map((id) => (
                  <li key={id}>
                    <RefName table="employee" role={role} value={id} />
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setEmployeeIds(employeeIds.filter((x) => x !== id))}
                    >
                      제외
                    </button>
                  </li>
                ))}
              </ul>
            </Field>
          </Form>
        </Drawer>
      )}

      {detail && (
        <Drawer title="발송 결과" onClose={() => setDetail(null)}>
          <Pairs items={[['발송 대상 지급일', <DateText value={detail.payDate} />]]} />
          <Tiles
            items={[
              ['발송 성공 건수', <Num value={detail.successCount} />],
              ['발송 실패 건수', <Num value={detail.failureCount} />],
            ]}
          />
          <h2>실패 건과 사유</h2>
          <DataTable<Row>
            columns={[
              {
                key: 'employeeId',
                label: '임직원',
                render: (r) => <RefName table="employee" role={role} value={r.employeeId} />,
              },
              { key: 'reason', label: '실패 사유' },
            ]}
            rows={detail.failures}
            empty="발송에 실패한 건이 없습니다."
          />
        </Drawer>
      )}
    </div>
  );
}
