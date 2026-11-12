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
  Pairs,
  Field,
  DateInput,
  Select,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

export default function FnSfr00904Page({ role, notify }: PageProps) {
  const [reportDate, setReportDate] = useState('');
  const [scope, setScope] = useState('전체');
  const [applied, setApplied] = useState<{ reportDate: string; scope: string } | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page>(async () => {
    if (!applied) {
      return { items: [], page: 0, size: 20, total: 0 };
    }
    return call<Page>('GET', '/daily-fund-reports', role, undefined, {
      reportDate: applied.reportDate,
      scope: applied.scope,
      page: pageNo,
      size: 20,
    });
  }, [applied, pageNo, role]);

  const search = () => {
    if (!reportDate) {
      notify('조회 일자를 입력해 주세요.');
      return;
    }
    setPageNo(0);
    setApplied({ reportDate, scope });
  };

  const reset = () => {
    setReportDate('');
    setScope('전체');
    setApplied(null);
    setPageNo(0);
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>자금일보</h2>
          <Pairs
            items={[
              ['자금일보 기준 일자', <DateText value={selected.reportDate} />],
              ['전일 잔액', <Num value={selected.previousBalance} />],
              ['입금 합계', <Num value={selected.depositAmount} />],
              ['출금 합계', <Num value={selected.withdrawalAmount} />],
              ['당일 잔액', <Num value={selected.currentBalance} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>결재 상태</h2>
          <Pairs items={[['전자결재 처리 상태', <Badge value={selected.approvalStatus} />]]} />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>자금일보 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="자금일보 기준 일자" required>
            <DateInput value={reportDate} onChange={setReportDate} />
          </Field>
          <Field label="조회 범위">
            <Select
              value={scope}
              onChange={setScope}
              options={[
                ['전체', '전체'],
                ['부서', '부서'],
                ['개인', '개인'],
              ]}
            />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'reportDate', label: '자금일보 기준 일자', render: (r) => <DateText value={r.reportDate} /> },
            { key: 'depositAmount', label: '입금 합계', render: (r) => <Num value={r.depositAmount} /> },
            { key: 'withdrawalAmount', label: '출금 합계', render: (r) => <Num value={r.withdrawalAmount} /> },
            { key: 'currentBalance', label: '당일 잔액', render: (r) => <Num value={r.currentBalance} /> },
            { key: 'approvalStatus', label: '전자결재 처리 상태', render: (r) => <Badge value={r.approvalStatus} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(row) => setSelected(row)}
          empty={
            loading
              ? '불러오는 중입니다.'
              : applied
                ? '조회 일자에 해당하는 자금일보가 없습니다. 다른 일자를 선택해 보세요.'
                : '조회 일자를 선택한 뒤 조회해 주세요.'
          }
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
    </div>
  );
}
