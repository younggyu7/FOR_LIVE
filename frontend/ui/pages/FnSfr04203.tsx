import { useState } from 'react';
import { call, Band, DataTable, Drawer, Form, Field, LookupSelect, DateInput, NumberInput, Select, Num, Badge, RefName } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr04203Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [feeUnitPriceId, setFeeUnitPriceId] = useState<number | string>('');
  const [reviewDate, setReviewDate] = useState('');
  const [resolutionDate, setResolutionDate] = useState('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [isOffline, setIsOffline] = useState('false');

  function openForm() {
    setFeeUnitPriceId('');
    setReviewDate('');
    setResolutionDate('');
    setQuantity('');
    setIsOffline('false');
    setOpen(true);
  }

  async function submit() {
    if (feeUnitPriceId === '') {
      throw new Error('수수료 단가를 선택해 주세요.');
    }
    if (quantity === '') {
      throw new Error('수량을 입력해 주세요.');
    }
    const created = await call('POST', '/fee-records', role, {
      feeUnitPriceId,
      reviewDate: reviewDate || undefined,
      resolutionDate: resolutionDate || undefined,
      quantity,
      isOffline: isOffline === 'true',
    });
    setResults([{ ...created, feeUnitPriceId }, ...results]);
    setOpen(false);
    notify('수수료를 등록했습니다.');
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>심사수수료·재발급 수수료 등록</h2>
        <Band total={results.length}>
          <button onClick={openForm}>수수료 등록</button>
        </Band>
        <DataTable
          columns={[
            { key: 'feeRecordId', label: '수수료 등록 ID' },
            { key: 'feeUnitPriceId', label: '수수료 단가', render: (r) => <RefName table="fee_unit_price" role={role} value={r['feeUnitPriceId']} /> },
            { key: 'quantity', label: '수량', render: (r) => <Num value={r['quantity']} /> },
            { key: 'amount', label: '금액', render: (r) => <Num value={r['amount']} /> },
            { key: 'isOffline', label: '오프라인 여부', render: (r) => <Badge value={r['isOffline'] === true ? '오프라인' : '일반'} /> },
          ]}
          rows={results}
          empty="아직 등록한 내역이 없습니다. 수수료 등록 버튼을 눌러 시작해 주세요."
        />
      </section>
      {open && (
        <Drawer title="수수료 등록" onClose={() => setOpen(false)}>
          <Form onSubmit={submit} submit="등록" note="금액은 선택한 단가에 수량을 곱해 자동으로 계산됩니다.">
            <Field label="수수료 단가 ID" required>
              <LookupSelect table="fee_unit_price" role={role} value={feeUnitPriceId} onChange={setFeeUnitPriceId} />
            </Field>
            <Field label="심사일자">
              <DateInput value={reviewDate} onChange={setReviewDate} />
            </Field>
            <Field label="결의일자">
              <DateInput value={resolutionDate} onChange={setResolutionDate} />
            </Field>
            <Field label="수량" required>
              <NumberInput value={quantity} onChange={setQuantity} />
            </Field>
            <Field label="오프라인 여부" required>
              <Select value={isOffline} onChange={setIsOffline} options={[['false', '일반'], ['true', '오프라인']]} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
