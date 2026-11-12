import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateText,
  Drawer,
  Field,
  Form,
  Num,
  Pairs,
  Select,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

const TYPE_OPTIONS: [string, string][] = [
  ['WITHHOLDING_STATUS', '원천징수이행상황신고서'],
  ['TUITION_REPAYMENT', '학자금상환 명세'],
  ['LOCAL_INCOME_TAX', '지방소득세'],
  ['RESIDENT_TAX_EMPLOYEE', '주민세(종업원분)'],
  ['SIMPLIFIED_PAYMENT', '간이지급명세서'],
  ['SUBMISSION_SUMMARY', '제출집계표'],
  ['PAYMENT_MEDIA', '지급명세 전산매체'],
];

function typeName(value: unknown): string {
  const found = TYPE_OPTIONS.find(([v]) => v === value);
  return found ? found[1] : String(value ?? '');
}

export default function FnSfr02303Page({ role, notify }: PageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [creating, setCreating] = useState(false);
  const [filingType, setFilingType] = useState('');
  const [month, setMonth] = useState('');
  const [target, setTarget] = useState<Row | null>(null);
  const [result, setResult] = useState<Row | null>(null);

  const create = async () => {
    if (!filingType) {
      throw new Error('신고서 유형을 선택해 주세요.');
    }
    if (!/^\d{4}(0[1-9]|1[0-2])$/.test(month)) {
      throw new Error('귀속연월은 YYYYMM 형식으로 입력해 주세요.');
    }
    const created = await call('POST', '/tax-filings/generate-local', role, {
      filingType,
      attributionMonth: month,
    });
    setRows([created, ...rows]);
    setCreating(false);
    setFilingType('');
    setMonth('');
    notify('신고서를 작성했습니다.');
  };

  const submit = async () => {
    if (!target) {
      return;
    }
    const id = target['taxFilingId'];
    const res = await call('POST', `/tax-filings/${id}/submit`, role, {});
    setRows(rows.map((r) => (r['taxFilingId'] === id ? { ...r, ...res } : r)));
    setResult(res);
    setTarget(null);
    notify('전자신고를 했습니다.');
  };

  return (
    <div>
      <h1>지방세 전자신고</h1>
      <Band total={rows.length}>
        <button onClick={() => setCreating(true)}>신고서 작성</button>
      </Band>
      <DataTable
        columns={[
          { key: 'taxFilingId', label: '신고서 번호' },
          { key: 'filingType', label: '신고서 유형', render: (r) => typeName(r['filingType']) },
          { key: 'attributionMonth', label: '귀속연월' },
          { key: 'totalAmount', label: '집계 금액', render: (r) => <Num value={r['totalAmount']} /> },
          {
            key: 'filingStatus',
            label: '신고 상태',
            render: (r) => (
              <span>
                <Badge value={r['filingStatus']} />{' '}
                {r['filingStatus'] === 'DRAFT' ? (
                  <button className="ghost" onClick={() => setTarget(r)}>
                    전자신고
                  </button>
                ) : null}
              </span>
            ),
          },
        ]}
        rows={rows}
        onRowClick={(r) => setResult(r)}
        empty="아직 작성한 신고서가 없습니다. 신고서 작성 버튼을 눌러 시작해 주세요."
      />
      {creating ? (
        <Drawer title="신고서 작성" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="작성">
            <Field label="신고서 유형" required>
              <Select value={filingType} onChange={setFilingType} options={TYPE_OPTIONS} />
            </Field>
            <Field label="귀속연월" required hint="예: 202406">
              <TextInput value={month} onChange={setMonth} placeholder="YYYYMM" />
            </Field>
          </Form>
        </Drawer>
      ) : null}
      {target ? (
        <Drawer title="전자신고" onClose={() => setTarget(null)}>
          <Form
            onSubmit={submit}
            submit="전자신고 요청"
            note={<p>신고서를 국세청 전자파일로 만들어 전송합니다. 연계에 실패하면 미신고 상태로 남습니다.</p>}
          >
            <Pairs
              items={[
                ['신고서 유형', typeName(target['filingType'])],
                ['귀속연월', String(target['attributionMonth'] ?? '')],
                ['집계 금액', <Num value={target['totalAmount']} />],
              ]}
            />
          </Form>
        </Drawer>
      ) : null}
      {result ? (
        <Drawer title="신고서 상세" onClose={() => setResult(null)}>
          <Pairs
            items={[
              ['신고서 유형', typeName(result['filingType'])],
              ['귀속연월', String(result['attributionMonth'] ?? '')],
              ['집계 금액', <Num value={result['totalAmount']} />],
              ['신고 상태', <Badge value={result['filingStatus']} />],
              ['전자신고 일시', <DateText value={result['filedAt']} time />],
              ['접수번호', String(result['receiptNumber'] ?? '')],
              ['결과 메시지', String(result['resultMessage'] ?? '')],
              ['전자파일 이름', String(result['electronicFileName'] ?? '')],
            ]}
          />
        </Drawer>
      ) : null}
    </div>
  );
}
