import { useState } from 'react';
import { Band, DataTable, DateInput, DateText, ErrorText, Field, Filters, Pager, Select, TextInput, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr03802Page({ role, notify }: PageProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [menuName, setMenuName] = useState('');
  const [environment, setEnvironment] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [periodError, setPeriodError] = useState('');

  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/menu-usage-logs', role, undefined, { ...applied, page, size: SIZE }),
    [role, applied, page],
  );

  function search() {
    if (fromDate && toDate && toDate < fromDate) {
      setPeriodError('조회 종료일이 시작일보다 앞서 조회할 수 없습니다. 기간을 다시 지정해 주세요.');
      return;
    }
    setPeriodError('');
    setPage(0);
    setApplied({ fromDate, toDate, employeeName, menuName, usageEnvironment: environment });
  }

  function reset() {
    setFromDate('');
    setToDate('');
    setEmployeeName('');
    setMenuName('');
    setEnvironment('');
    setPeriodError('');
    setPage(0);
    setApplied({});
  }

  const text = (value: unknown) => (value === undefined || value === null || value === '' ? '-' : String(value));

  return (
    <div className="doc">
      <h1>메뉴 사용 내역</h1>
      <p>조회 조건은 모두 선택 입력이며, 입력하지 않으면 전체 내역을 보여 드립니다.</p>
      <Filters onSearch={search} onReset={reset}>
        <Field label="조회 시작일">
          <DateInput value={fromDate} onChange={setFromDate} />
        </Field>
        <Field label="조회 종료일">
          <DateInput value={toDate} onChange={setToDate} />
        </Field>
        <Field label="사원명">
          <TextInput value={employeeName} onChange={setEmployeeName} />
        </Field>
        <Field label="메뉴명">
          <TextInput value={menuName} onChange={setMenuName} />
        </Field>
        <Field label="사용 환경">
          <Select
            value={environment}
            onChange={setEnvironment}
            options={[['웹', '웹'], ['모바일', '모바일']]}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {periodError ? <ErrorText text={periodError} /> : null}
      {error ? <ErrorText text={error} /> : null}
      <Band total={data?.total} />
      <DataTable
        columns={[
          { key: 'employeeName', label: '사원명', render: (row) => text(row['employeeName']) },
          { key: 'usedAt', label: '사용일시', render: (row) => <DateText value={row['usedAt']} time /> },
          { key: 'menuName', label: '메뉴명', render: (row) => text(row['menuName']) },
          { key: 'accessIp', label: '접속 IP', render: (row) => text(row['accessIp']) },
          { key: 'usageEnvironment', label: '사용 환경', render: (row) => text(row['usageEnvironment']) },
        ]}
        rows={data?.items ?? []}
        empty={loading ? '불러오는 중입니다.' : '조회 결과가 없습니다. 조회 조건을 바꿔 다시 조회해 주세요.'}
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
