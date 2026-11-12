import { useState } from 'react';
import { Badge, Band, DataTable, Drawer, Field, Form, LookupSelect, RefName, Select, call } from '../kit';
import type { PageProps, Row } from '../kit';

const STATUS_OPTIONS: [string, string][] = [
  ['NOT_ISSUED', '미발행'],
  ['ISSUED', '발행'],
];

export default function FnSfr00804Page({ role, notify }: PageProps) {
  const [open, setOpen] = useState(false);
  const [ids, setIds] = useState<number[]>([]);
  const [picker, setPicker] = useState<number | string>('');
  const [issueStatus, setIssueStatus] = useState('');
  const [results, setResults] = useState<Row[]>([]);

  function openDrawer() {
    setIds([]);
    setPicker('');
    setIssueStatus('');
    setOpen(true);
  }

  function addId(value: number | string) {
    if (value === '') {
      return;
    }
    const n = Number(value);
    if (!Number.isFinite(n)) {
      return;
    }
    setPicker('');
    if (!ids.includes(n)) {
      setIds([...ids, n]);
    }
  }

  async function submit() {
    if (ids.length === 0) {
      throw new Error('변경할 세금계산서를 한 건 이상 선택해 주세요.');
    }
    if (!issueStatus) {
      throw new Error('변경할 발행 여부를 선택해 주세요.');
    }
    const res = await call<{ results: Row[] }>('PATCH', '/tax-invoices/issue-status', role, {
      taxInvoiceIds: ids,
      issueStatus,
    });
    setResults(res.results);
    const failed = res.results.filter((r) => r['success'] !== true).length;
    notify(failed === 0 ? '발행 여부를 변경했습니다.' : '발행 여부를 변경했습니다. 변경하지 못한 건이 ' + failed + '건 있습니다.');
    setOpen(false);
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>세금계산서 발행 여부 변경 결과</h2>
        <Band total={results.length}>
          <button onClick={openDrawer}>발행 여부 일괄 변경</button>
        </Band>
        <DataTable
          columns={[
            { key: 'taxInvoiceId', label: '세금계산서', render: (r) => <RefName table="tax_invoice" role={role} value={r['taxInvoiceId']} /> },
            { key: 'success', label: '결과', render: (r) => <Badge value={r['success'] === true ? '완료' : '실패'} /> },
            { key: 'issueStatus', label: '변경한 발행 여부', render: (r) => <span>{r['issueStatus'] ? String(r['issueStatus']) === 'ISSUED' ? '발행' : '미발행' : '-'}</span> },
            { key: 'message', label: '사유' },
          ]}
          rows={results}
          empty="아직 변경한 내역이 없습니다. 발행 여부 일괄 변경 버튼으로 시작해 주세요."
        />
      </section>
      {open && (
        <Drawer title="세금계산서 발행 여부 일괄 변경" onClose={() => setOpen(false)}>
          <Form
            onSubmit={submit}
            submit="일괄 변경"
            note="선택한 모든 건에 같은 발행 여부를 적용합니다. 전표처리가 끝난 건은 변경되지 않고 사유가 표시됩니다."
          >
            <Field label="세금계산서 추가" required wide hint="고르면 아래 목록에 담깁니다.">
              <LookupSelect table="tax_invoice" role={role} value={picker} onChange={addId} placeholder="세금계산서 선택" />
            </Field>
            <Field label="변경 대상 세금계산서" wide>
              {ids.length === 0 ? (
                <p>아직 선택한 세금계산서가 없습니다.</p>
              ) : (
                <ul>
                  {ids.map((id) => (
                    <li key={id}>
                      <RefName table="tax_invoice" role={role} value={id} />{' '}
                      <button type="button" className="ghost" onClick={() => setIds(ids.filter((x) => x !== id))}>
                        제외
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Field>
            <Field label="발행 여부" required>
              <Select value={issueStatus} onChange={setIssueStatus} options={STATUS_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
