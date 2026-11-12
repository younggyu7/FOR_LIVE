import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateText,
  Drawer,
  ErrorText,
  Field,
  Filters,
  Form,
  LookupSelect,
  Pager,
  RefName,
  Select,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const FORMAT_OPTIONS: [string, string][] = [
  ['QR', 'QR'],
  ['BARCODE', '바코드'],
];

export default function FnSfr02503Page({ role, notify }: PageProps) {
  const [assetInput, setAssetInput] = useState<number | string>('');
  const [assetFilter, setAssetFilter] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [printing, setPrinting] = useState(false);
  const [assetId, setAssetId] = useState<number | string>('');
  const [printFormat, setPrintFormat] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/asset-print-logs', role, undefined, { assetId: assetFilter, page, size: 20 }),
    [assetFilter, page],
  );

  function search() {
    setPage(0);
    setAssetFilter(assetInput);
  }

  function reset() {
    setAssetInput('');
    setAssetFilter('');
    setPage(0);
  }

  function openPrint() {
    setAssetId('');
    setPrintFormat('');
    setPrinting(true);
  }

  async function submit() {
    if (assetId === '' || printFormat === '') {
      throw new Error('자산과 출력 형식을 선택해 주세요.');
    }
    const result = await call<Row>('POST', '/asset-print-logs', role, { assetId, printFormat });
    const label = (result.label ?? {}) as Row;
    setPrinting(false);
    notify('자산번호 ' + String(label.value ?? '') + ' 코드를 출력했습니다.');
    setPage(0);
    reload();
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>QR·바코드 출력 이력</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="자산 ID">
            <LookupSelect table="asset" role={role} value={assetInput} onChange={setAssetInput} placeholder="전체 자산" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openPrint}>QR·바코드 출력</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        {loading ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          columns={[
            { key: 'assetId', label: '자산 ID', render: (row) => <RefName table="asset" role={role} value={row.assetId} /> },
            { key: 'assetNumber', label: '자산번호' },
            { key: 'printFormat', label: '출력 형식', render: (row) => <Badge value={row.printFormat} /> },
            { key: 'printedAt', label: '출력 일시', render: (row) => <DateText value={row.printedAt} time /> },
          ]}
          rows={data?.items ?? []}
          empty="아직 출력한 내역이 없습니다. QR·바코드 출력 버튼으로 첫 출력을 해 보세요."
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {printing ? (
        <Drawer title="QR·바코드 출력" onClose={() => setPrinting(false)}>
          <Form onSubmit={submit} submit="출력" note="출력하면 이력이 저장되며, 재출력 시에도 같은 자산번호 값을 사용합니다.">
            <Field label="자산 ID" required>
              <LookupSelect table="asset" role={role} value={assetId} onChange={setAssetId} placeholder="자산 선택" />
            </Field>
            <Field label="출력 형식" required>
              <Select value={printFormat} onChange={setPrintFormat} options={FORMAT_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
