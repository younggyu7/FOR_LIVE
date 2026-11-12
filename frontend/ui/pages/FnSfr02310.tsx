import { useState } from 'react';
import { call, Badge, Num, Band, DataTable, Drawer, Form, Field, TextInput, Pairs } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr02310Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [creating, setCreating] = useState(false);
  const [filing, setFiling] = useState<Row | null>(null);
  const [paymentMonth, setPaymentMonth] = useState('');
  const [incomeCategory, setIncomeCategory] = useState('');

  const patchRow = (id: unknown, patch: Row) => {
    setResults((prev) => prev.map((r) => (r.taxFilingId === id ? { ...r, ...patch } : r)));
  };

  const create = async () => {
    if (!paymentMonth.trim() || !incomeCategory.trim()) {
      throw new Error('지급연월과 소득 구분을 입력해 주세요.');
    }
    const res = await call('POST', '/tax-filings/simplified-payments', role, { paymentMonth, incomeCategory });
    setResults((prev) => [{ ...res, paymentMonth, incomeCategory, filingStatus: 'DRAFT' }, ...prev]);
    notify('간이지급명세서를 작성했습니다.');
    setCreating(false);
    setPaymentMonth('');
    setIncomeCategory('');
  };

  const file = async () => {
    if (!filing) return;
    const res = await call('POST', '/tax-filings/{taxFilingId}/file'.replace('{taxFilingId}', String(filing.taxFilingId)), role);
    patchRow(filing.taxFilingId, res);
    notify('전자신고를 요청했습니다.');
    setFiling(null);
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>간이지급명세서</h2>
        <Band total={results.length}>
          <button onClick={() => setCreating(true)}>명세서 작성</button>
        </Band>
        <DataTable
          columns={[
            { key: 'paymentMonth', label: '지급연월' },
            { key: 'incomeCategory', label: '소득 구분' },
            { key: 'totalAmount', label: '집계 금액', render: (r) => <Num value={r.totalAmount} /> },
            { key: 'filingStatus', label: '신고 상태', render: (r) => <Badge value={r.filingStatus} /> },
            {
              key: 'action',
              label: '처리',
              render: (r) =>
                r.filingStatus === 'DRAFT' ? (
                  <button className="ghost" onClick={() => setFiling(r)}>전자신고</button>
                ) : null,
            },
          ]}
          rows={results}
          empty="아직 작성한 명세서가 없습니다. 명세서 작성 버튼을 눌러 시작하세요."
        />
      </section>
      {creating && (
        <Drawer title="간이지급명세서 작성" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="작성">
            <Field label="지급연월" required hint="YYYYMM 형식">
              <TextInput value={paymentMonth} onChange={setPaymentMonth} />
            </Field>
            <Field label="소득 구분" required>
              <TextInput value={incomeCategory} onChange={setIncomeCategory} />
            </Field>
          </Form>
        </Drawer>
      )}
      {filing && (
        <Drawer title="전자신고" onClose={() => setFiling(null)}>
          <Form
            onSubmit={file}
            submit="전자신고 요청"
            note="국세청에 전자신고를 요청하며 결과는 명세서에 기록됩니다. 연계에 실패하면 미신고 상태가 유지됩니다."
          >
            <Pairs
              items={[
                ['지급연월', String(filing.paymentMonth ?? '')],
                ['소득 구분', String(filing.incomeCategory ?? '')],
                ['집계 금액', <Num value={filing.totalAmount} />],
              ]}
            />
          </Form>
        </Drawer>
      )}
    </div>
  );
}
