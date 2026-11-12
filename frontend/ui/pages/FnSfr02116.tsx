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
  Num,
  Pager,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr02116Page({ role, notify }: PageProps) {
  const [payDateFrom, setPayDateFrom] = useState('');
  const [payDateTo, setPayDateTo] = useState('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | null>(async () => {
    if (!applied) {
      return null;
    }
    return call<Page>('GET', '/payroll-analyses', role, undefined, {
      ...applied,
      page: pageNo,
      size: SIZE,
    });
  }, [applied, pageNo, role]);

  const search = () => {
    if (!payDateFrom || !payDateTo) {
      setFormError('분석 기간 시작일과 종료일을 모두 입력해 주세요.');
      return;
    }
    setFormError('');
    setPageNo(0);
    setApplied({ payDateFrom, payDateTo, departmentId });
  };

  const reset = () => {
    setPayDateFrom('');
    setPayDateTo('');
    setDepartmentId('');
    setFormError('');
    setApplied(null);
    setPageNo(0);
  };

  const rows = data?.items ?? [];

  return (
    <div className="doc">
      <section className="box">
        <h2>급여통계 및 급여분석 현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="분석 기간 시작일" required>
            <DateInput value={payDateFrom} onChange={setPayDateFrom} />
          </Field>
          <Field label="분석 기간 종료일" required>
            <DateInput value={payDateTo} onChange={setPayDateTo} />
          </Field>
          <Field label="주부서">
            <LookupSelect
              table="department"
              role={role}
              value={departmentId}
              onChange={setDepartmentId}
              placeholder="전체 부서"
            />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>분석 결과</h2>
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'employeeName', label: '임직원명' },
            { key: 'departmentName', label: '부서명' },
            {
              key: 'payDate',
              label: '급여 지급일',
              render: (row) => <DateText value={row.payDate} />,
            },
            {
              key: 'changeAmount',
              label: '전기 대비 급여 증감',
              render: (row) =>
                row.changeAmount === null || row.changeAmount === undefined ? (
                  <span>-</span>
                ) : (
                  <Num value={row.changeAmount} />
                ),
            },
          ]}
          rows={rows}
          empty={
            loading
              ? '불러오는 중입니다.'
              : applied
                ? '조건에 맞는 급여 데이터가 없습니다. 기간을 바꿔 다시 조회해 주세요.'
                : '분석 기간을 입력하고 조회해 주세요.'
          }
        />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} /> : null}
      </section>
    </div>
  );
}
