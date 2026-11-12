import { useState } from 'react';
import { Band, DataTable, DateInput, DateText, ErrorText, Field, Filters, Num, Pager, Pairs, call, useData } from '../kit';
import type { Column, PageProps, Page, Row } from '../kit';

const SIZE = 20;

type Tab = 'list' | 'summary';
type Period = { startDate: string; endDate: string };

export default function FnSfr04205Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<Tab>('list');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applied, setApplied] = useState<Period | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    const path = tab === 'list' ? '/fee-records' : '/fee-records/summary';
    return call<Page>('GET', path, role, undefined, {
      startDate: applied.startDate,
      endDate: applied.endDate,
      page: pageNo,
      size: SIZE,
    });
  }, [applied, tab, pageNo, role]);

  function search() {
    if (!startDate || !endDate) {
      setFormError('조회 시작일과 종료일을 모두 입력해 주세요.');
      return;
    }
    if (endDate < startDate) {
      setFormError('종료일은 시작일보다 앞설 수 없습니다.');
      return;
    }
    setFormError('');
    setPageNo(0);
    setApplied({ startDate, endDate });
    notify('조회 조건을 적용했습니다.');
  }

  function reset() {
    setStartDate('');
    setEndDate('');
    setFormError('');
    setApplied(null);
    setPageNo(0);
  }

  function changeTab(next: Tab) {
    setTab(next);
    setPageNo(0);
    setSelected(null);
  }

  const listColumns: Column[] = [
    { key: 'resolutionDate', label: '결의일자', render: (row) => <DateText value={row.resolutionDate} /> },
    { key: 'quantity', label: '수량', render: (row) => <Num value={row.quantity} /> },
    { key: 'unitPrice', label: '단가', render: (row) => <Num value={row.unitPrice} /> },
    { key: 'amount', label: '금액', render: (row) => <Num value={row.amount} /> },
    { key: 'isOffline', label: '오프라인 여부', render: (row) => (row.isOffline ? '오프라인' : '온라인') },
  ];

  const summaryColumns: Column[] = [
    { key: 'groupKey', label: '집계 기준(결의월)' },
    { key: 'totalQuantity', label: '재발급 건수', render: (row) => <Num value={row.totalQuantity} /> },
    { key: 'totalAmount', label: '재발급 금액', render: (row) => <Num value={row.totalAmount} /> },
  ];

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>재발급 수수료 내역</h2>
          <Pairs
            items={[
              ['수수료 등록 번호', String(selected.feeRecordId ?? '')],
              ['심사일자', <DateText value={selected.reviewDate} />],
              ['결의일자', <DateText value={selected.resolutionDate} />],
              ['수량', <Num value={selected.quantity} />],
              ['단가', <Num value={selected.unitPrice} />],
              ['금액', <Num value={selected.amount} />],
              ['오프라인 여부', selected.isOffline ? '오프라인' : '온라인'],
            ]}
          />
        </section>
      </div>
    );
  }

  const rows = data ? data.items : [];
  const emptyText = applied
    ? '조회 결과가 없습니다. 조회 기간을 바꿔 다시 조회해 보세요.'
    : '조회 기간을 입력하고 조회를 눌러 주세요.';

  return (
    <div className="doc">
      <section className="box">
        <h2>재발급 수수료 내역</h2>
        <div>
          <button className={tab === 'list' ? '' : 'ghost'} onClick={() => changeTab('list')}>재발급 내역현황</button>
          <button className={tab === 'summary' ? '' : 'ghost'} onClick={() => changeTab('summary')}>재발급 내역집계</button>
        </div>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 시작일" required>
            <DateInput value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="조회 종료일" required>
            <DateInput value={endDate} onChange={setEndDate} />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>{tab === 'list' ? '내역현황' : '내역집계'}</h2>
        <Band total={data ? data.total : undefined} />
        <DataTable
          columns={tab === 'list' ? listColumns : summaryColumns}
          rows={loading ? [] : rows}
          onRowClick={tab === 'list' ? (row) => setSelected(row) : undefined}
          empty={emptyText}
        />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} /> : null}
      </section>
    </div>
  );
}
