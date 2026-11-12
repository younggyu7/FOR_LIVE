import { useState } from 'react';
import {
  Badge,
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
  Pairs,
  RefName,
  Select,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

const DIRECTION_OPTIONS: [string, string][] = [
  ['ISSUE', '발행(매출)'],
  ['RECEIVE', '수취(매입)'],
];

const TAX_TYPE_OPTIONS: [string, string][] = [
  ['TAXABLE', '과세'],
  ['EXEMPT', '면세'],
];

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

export default function FnSfr00802Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);

  const [direction, setDirection] = useState('');
  const [partnerId, setPartnerId] = useState<number | string>('');
  const [taxType, setTaxType] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [supplyAmount, setSupplyAmount] = useState<number | string>('');
  const [taxAmount, setTaxAmount] = useState<number | string>('');
  const [itemDescription, setItemDescription] = useState('');

  function openCreate() {
    setDirection('');
    setPartnerId('');
    setTaxType('');
    setIssueDate('');
    setSupplyAmount('');
    setTaxAmount('');
    setItemDescription('');
    setCreating(true);
  }

  async function submit() {
    if (
      isBlank(direction) ||
      isBlank(partnerId) ||
      isBlank(taxType) ||
      isBlank(issueDate) ||
      isBlank(supplyAmount) ||
      isBlank(taxAmount)
    ) {
      throw new Error('발행/수취 구분, 거래처, 과세·면세 구분, 작성일자, 공급가액, 세액을 모두 입력해 주세요.');
    }
    const body: Row = {
      direction,
      partnerId,
      taxType,
      issueDate,
      supplyAmount,
      taxAmount,
    };
    if (itemDescription !== '') {
      body.itemDescription = itemDescription;
    }
    const result = await call('POST', '/tax-invoices', role, body);
    const row: Row = { ...result, direction, partnerId, taxType, issueDate, supplyAmount, taxAmount, itemDescription };
    setResults([row, ...results]);
    setCreating(false);
    notify('전자세금계산서 발행을 요청했습니다.');
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로
        </button>
        <section className="box">
          <h2>전자세금계산서</h2>
          <Pairs
            items={[
              ['전자세금계산서 ID', String(selected.taxInvoiceId)],
              ['발행/수취 구분', <Badge value={selected.direction} />],
              ['거래처', <RefName table="partner" role={role} value={selected.partnerId} />],
              ['과세·면세 구분', <Badge value={selected.taxType} />],
              ['작성일자', <DateText value={selected.issueDate} />],
              ['공급가액', <Num value={selected.supplyAmount} />],
              ['세액', <Num value={selected.taxAmount} />],
              ['품목', String(selected.itemDescription ?? '')],
            ]}
          />
        </section>
        <section className="box">
          <h2>발행 결과</h2>
          <Pairs
            items={[
              ['발행 여부', <Badge value={selected.issueStatus} />],
              ['국세청 승인번호', String(selected.approvalNumber ?? '')],
              ['연계 상태', <Badge value={selected.linkStatus} />],
              ['실패 사유', String(selected.failureReason ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <h2>전자세금계산서 발행</h2>
      <Band total={results.length}>
        <button onClick={openCreate}>발행 요청</button>
      </Band>
      <DataTable
        columns={[
          { key: 'taxInvoiceId', label: '전자세금계산서 ID' },
          {
            key: 'partnerId',
            label: '거래처',
            render: (r) => <RefName table="partner" role={role} value={r.partnerId} />,
          },
          { key: 'issueDate', label: '작성일자', render: (r) => <DateText value={r.issueDate} /> },
          { key: 'supplyAmount', label: '공급가액', render: (r) => <Num value={r.supplyAmount} /> },
          { key: 'issueStatus', label: '발행 여부', render: (r) => <Badge value={r.issueStatus} /> },
        ]}
        rows={results}
        onRowClick={(r) => setSelected(r)}
        empty="아직 발행한 내역이 없습니다. 발행 요청 버튼을 눌러 시작해 주세요."
      />
      {creating && (
        <Drawer title="전자세금계산서 발행 요청" onClose={() => setCreating(false)}>
          <Form
            onSubmit={submit}
            submit="발행 요청"
            note="요청하면 외부 발행 시스템 연계 이력이 함께 기록됩니다."
          >
            <Field label="발행/수취 구분" required>
              <Select value={direction} onChange={setDirection} options={DIRECTION_OPTIONS} />
            </Field>
            <Field label="거래처" required>
              <LookupSelect table="partner" role={role} value={partnerId} onChange={setPartnerId} />
            </Field>
            <Field label="과세·면세 구분" required>
              <Select value={taxType} onChange={setTaxType} options={TAX_TYPE_OPTIONS} />
            </Field>
            <Field label="작성일자" required>
              <DateInput value={issueDate} onChange={setIssueDate} />
            </Field>
            <Field label="공급가액" required>
              <NumberInput value={supplyAmount} onChange={setSupplyAmount} />
            </Field>
            <Field label="세액" required>
              <NumberInput value={taxAmount} onChange={setTaxAmount} />
            </Field>
            <Field label="품목" wide>
              <TextInput value={itemDescription} onChange={setItemDescription} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
