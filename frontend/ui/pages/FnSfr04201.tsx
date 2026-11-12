import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  NumberInput,
  DateInput,
  Select,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;
const FEE_OPTIONS: [string, string][] = [
  ['REVIEW', '심사수수료'],
  ['REISSUE', '재발급 수수료'],
];

function feeName(value: unknown): string {
  const found = FEE_OPTIONS.find((o) => o[0] === value);
  return found ? found[1] : String(value ?? '');
}

function dateValue(value: unknown): string {
  return value ? String(value).slice(0, 10) : '';
}

export default function FnSfr04201Page({ role, notify }: PageProps) {
  const [feeTypeDraft, setFeeTypeDraft] = useState('');
  const [feeType, setFeeType] = useState('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/fee-unit-prices', role, undefined, { feeType, page, size: SIZE }),
    [feeType, page],
  );

  return (
    <div className="doc">
      <section className="box">
        <h2>수수료 단가 관리</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setFeeType(feeTypeDraft);
          }}
          onReset={() => {
            setFeeTypeDraft('');
            setFeeType('');
            setPage(0);
          }}
        >
          <Field label="수수료 구분">
            <Select value={feeTypeDraft} onChange={setFeeTypeDraft} options={FEE_OPTIONS} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={() => setCreating(true)}>단가 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        {loading && !data ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          columns={[
            { key: 'feeType', label: '수수료 구분', render: (r) => <Badge value={feeName(r.feeType)} /> },
            { key: 'unitPrice', label: '단가', render: (r) => <Num value={r.unitPrice} /> },
            { key: 'effectiveFrom', label: '적용 시작일', render: (r) => <DateText value={r.effectiveFrom} /> },
            { key: 'effectiveTo', label: '적용 종료일', render: (r) => <DateText value={r.effectiveTo} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(row) => setEditing(row)}
          empty="아직 등록한 단가가 없습니다. 단가 등록 버튼으로 첫 단가를 추가해 주세요."
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
        <p>행을 누르면 단가를 수정할 수 있습니다. 변경한 단가는 이후 등록 건부터 적용됩니다.</p>
      </section>

      {creating ? (
        <CreateDrawer
          role={role}
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            notify('수수료 단가를 등록했습니다.');
            reload();
          }}
        />
      ) : null}

      {editing ? (
        <EditDrawer
          role={role}
          row={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            notify('수수료 단가를 수정했습니다.');
            reload();
          }}
        />
      ) : null}
    </div>
  );
}

function CreateDrawer({ role, onClose, onDone }: { role: string; onClose: () => void; onDone: () => void }) {
  const [feeType, setFeeType] = useState('');
  const [unitPrice, setUnitPrice] = useState<number | string>('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');

  return (
    <Drawer title="수수료 단가 등록" onClose={onClose}>
      <Form
        submit="등록"
        onSubmit={async () => {
          if (!feeType) throw new Error('수수료 구분을 선택해 주세요.');
          if (unitPrice === '') throw new Error('단가를 입력해 주세요.');
          if (!effectiveFrom) throw new Error('적용 시작일을 입력해 주세요.');
          if (effectiveTo && effectiveTo < effectiveFrom) {
            throw new Error('적용 종료일은 적용 시작일보다 빠를 수 없습니다.');
          }
          await call('POST', '/fee-unit-prices', role, {
            feeType,
            unitPrice,
            effectiveFrom,
            effectiveTo: effectiveTo || null,
          });
          onDone();
        }}
      >
        <Field label="수수료 구분" required>
          <Select value={feeType} onChange={setFeeType} options={FEE_OPTIONS} />
        </Field>
        <Field label="단가" required>
          <NumberInput value={unitPrice} onChange={setUnitPrice} />
        </Field>
        <Field label="적용 시작일" required>
          <DateInput value={effectiveFrom} onChange={setEffectiveFrom} />
        </Field>
        <Field label="적용 종료일" hint="비워 두면 종료일 없이 적용됩니다.">
          <DateInput value={effectiveTo} onChange={setEffectiveTo} />
        </Field>
      </Form>
    </Drawer>
  );
}

function EditDrawer({
  role,
  row,
  onClose,
  onDone,
}: {
  role: string;
  row: Row;
  onClose: () => void;
  onDone: () => void;
}) {
  const [unitPrice, setUnitPrice] = useState<number | string>(row.unitPrice === null || row.unitPrice === undefined ? '' : Number(row.unitPrice));
  const [effectiveFrom, setEffectiveFrom] = useState(dateValue(row.effectiveFrom));
  const [effectiveTo, setEffectiveTo] = useState(dateValue(row.effectiveTo));

  return (
    <Drawer title={feeName(row.feeType) + ' 단가 수정'} onClose={onClose}>
      <Form
        submit="수정"
        note="변경한 단가는 이후 등록 건부터 적용되며 기존 등록 건의 금액은 바뀌지 않습니다."
        onSubmit={async () => {
          if (unitPrice === '') throw new Error('단가를 입력해 주세요.');
          if (!effectiveFrom) throw new Error('적용 시작일을 입력해 주세요.');
          if (effectiveTo && effectiveTo < effectiveFrom) {
            throw new Error('적용 종료일은 적용 시작일보다 빠를 수 없습니다.');
          }
          await call('PATCH', '/fee-unit-prices/' + String(row.feeUnitPriceId), role, {
            unitPrice,
            effectiveFrom,
            effectiveTo: effectiveTo || null,
          });
          onDone();
        }}
      >
        <Field label="수수료 구분">
          <Badge value={feeName(row.feeType)} />
        </Field>
        <Field label="단가" required>
          <NumberInput value={unitPrice} onChange={setUnitPrice} />
        </Field>
        <Field label="적용 시작일" required>
          <DateInput value={effectiveFrom} onChange={setEffectiveFrom} />
        </Field>
        <Field label="적용 종료일" hint="비워 두면 종료일 없이 적용됩니다.">
          <DateInput value={effectiveTo} onChange={setEffectiveTo} />
        </Field>
      </Form>
    </Drawer>
  );
}
