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
  DateInput,
  Select,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const SIZE = 20;

export default function FnSfr00803Page({ role, notify }: PageProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taxType, setTaxType] = useState('');
  const [query, setQuery] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [mode, setMode] = useState<'' | 'validate' | 'journal'>('');
  const [results, setResults] = useState<Row[]>([]);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/tax-invoices', role, undefined, { ...query, page, size: SIZE }),
    [query, page, role],
  );

  const search = () => {
    setPage(0);
    setSelected([]);
    setQuery({ startDate, endDate, taxType });
  };

  const reset = () => {
    setStartDate('');
    setEndDate('');
    setTaxType('');
    setPage(0);
    setSelected([]);
    setQuery({});
  };

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const open = (next: 'validate' | 'journal') => {
    if (selected.length === 0) {
      notify('대상 세금계산서를 먼저 선택해 주세요.');
      return;
    }
    setResults([]);
    setMode(next);
  };

  const submit = async () => {
    if (selected.length === 0) {
      throw new Error('대상 세금계산서를 선택해 주세요.');
    }
    const path = mode === 'validate' ? '/tax-invoices/validate' : '/tax-invoices/create-journal-entries';
    const res = await call<{ results: Row[] }>('POST', path, role, { taxInvoiceIds: selected });
    setResults(res.results ?? []);
    if (mode === 'validate') {
      notify('검증했습니다.');
    } else {
      notify('전표처리했습니다.');
      setSelected([]);
      reload();
    }
  };

  const rows = data?.items ?? [];

  return (
    <div className="doc">
      <section className="box">
        <h2>전자세금계산서 발행·수취 현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 기간 시작일">
            <DateInput value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="조회 기간 종료일">
            <DateInput value={endDate} onChange={setEndDate} />
          </Field>
          <Field label="과세·면세 구분">
            <Select
              value={taxType}
              onChange={setTaxType}
              placeholder="전체"
              options={[
                ['TAXABLE', '과세'],
                ['EXEMPT', '면세'],
              ]}
            />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button className="ghost" onClick={() => open('validate')}>선택 건 검증</button>
          <button onClick={() => open('journal')}>선택 건 전표처리</button>
          <button className="ghost" onClick={() => window.print()}>현황 출력</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        <DataTable
          columns={[
            {
              key: 'select',
              label: '선택',
              render: (r) =>
                r['journalStatus'] === 'UNPROCESSED' ? (
                  <input
                    type="checkbox"
                    checked={selected.includes(Number(r['taxInvoiceId']))}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggle(Number(r['taxInvoiceId']))}
                  />
                ) : null,
            },
            { key: 'partnerId', label: '거래처', render: (r) => <RefName table="partner" role={role} value={r['partnerId']} /> },
            { key: 'issueDate', label: '작성일자', render: (r) => <DateText value={r['issueDate']} /> },
            { key: 'supplyAmount', label: '공급가액', render: (r) => <Num value={r['supplyAmount']} /> },
            { key: 'journalStatus', label: '전표처리 상태', render: (r) => <Badge value={r['journalStatus']} /> },
          ]}
          rows={rows}
          empty={loading ? '불러오는 중입니다.' : '조건에 맞는 세금계산서가 없습니다. 조회 조건을 바꿔 보세요.'}
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {mode ? (
        <Drawer title={mode === 'validate' ? '세금계산서 검증' : '세금계산서 전표처리'} onClose={() => setMode('')}>
          <Form
            onSubmit={submit}
            submit={mode === 'validate' ? '검증하기' : '전표처리하기'}
            note={
              mode === 'journal'
                ? '선택한 ' + selected.length + '건을 전표처리합니다. 처리한 건은 되돌릴 수 없고 다시 처리할 수 없습니다.'
                : '선택한 ' + selected.length + '건의 필수 항목과 금액을 검증합니다.'
            }
          />
          {results.length > 0 ? (
            <DataTable
              columns={[
                { key: 'taxInvoiceId', label: '세금계산서 번호' },
                {
                  key: 'valid',
                  label: '결과',
                  render: (r) => (r['valid'] === false ? '오류' : '정상'),
                },
                {
                  key: 'errors',
                  label: '오류 사유',
                  render: (r) => (Array.isArray(r['errors']) ? (r['errors'] as string[]).join(' ') : ''),
                },
                { key: 'journalEntryId', label: '생성 전표 번호' },
              ]}
              rows={results}
            />
          ) : null}
        </Drawer>
      ) : null}
    </div>
  );
}
