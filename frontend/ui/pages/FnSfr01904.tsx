import { useState } from 'react';
import {
  Band,
  DataTable,
  DateInput,
  DateText,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Pager,
  RefName,
  call,
  useData,
} from '../kit';
import type { Page as PageResult, PageProps, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr01904Page({ role, notify }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);

  const { data, error, loading } = useData<PageResult>(
    () => call<PageResult>('GET', '/change-histories', role, undefined, { ...applied, page, size: PAGE_SIZE }),
    [applied, page, role],
  );

  const search = () => {
    if (fromDate && toDate && fromDate > toDate) {
      notify('변경 일시 시작은 종료보다 늦을 수 없습니다.');
      return;
    }
    setPage(0);
    setApplied({ employeeId, fromDate, toDate });
  };

  const reset = () => {
    setEmployeeId('');
    setFromDate('');
    setToDate('');
    setPage(0);
    setApplied({});
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>연차 변경이력</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="대상 임직원">
            <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} placeholder="전체" />
          </Field>
          <Field label="변경 일시 시작">
            <DateInput value={fromDate} onChange={setFromDate} />
          </Field>
          <Field label="변경 일시 종료">
            <DateInput value={toDate} onChange={setToDate} />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'changedAt', label: '변경 일시', render: (r) => <DateText value={r['changedAt']} time /> },
            { key: 'changerId', label: '수정자', render: (r) => <RefName table="employee" role={role} value={r['changerId']} /> },
            { key: 'changeType', label: '변경 구분' },
            { key: 'changeContent', label: '변경 내용' },
          ]}
          rows={data?.items ?? []}
          empty={loading ? '불러오는 중입니다.' : '조건에 해당하는 변경이력이 없습니다. 조건을 바꿔 다시 조회해 주세요.'}
        />
        <Pager page={page} size={data?.size ?? PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
