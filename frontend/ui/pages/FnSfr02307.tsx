import { useState } from 'react';
import { call, useData, Filters, Field, NumberInput, LookupSelect, Band, DataTable, Pager, DateText, Num, ErrorText } from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

export default function FnSfr02307Page({ role, notify }: PageProps) {
  const [year, setYear] = useState<number | string>(new Date().getFullYear());
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [applied, setApplied] = useState<{ year: number | string; employeeId: number | string } | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    return call<Page>('GET', '/withholding-ledgers', role, undefined, {
      targetYear: applied.year,
      employeeId: applied.employeeId,
      page: pageNo,
      size: SIZE,
    });
  }, [applied, pageNo, role]);

  const search = () => {
    if (year === '' || employeeId === '') {
      setFormError('정산 대상 연도와 임직원을 모두 입력해 주세요.');
      return;
    }
    setFormError('');
    setPageNo(0);
    setApplied({ year, employeeId });
    notify('원천징수부를 조회했습니다.');
  };

  const reset = () => {
    setYear(new Date().getFullYear());
    setEmployeeId('');
    setApplied(null);
    setPageNo(0);
    setFormError('');
  };

  const columns = [
    { key: 'payDate', label: '급여 지급일', render: (r: Row) => <DateText value={r.payDate} /> },
    { key: 'totalPaymentAmount', label: '총 지급액(암호문)' },
    { key: 'totalDeductionAmount', label: '총 공제액(암호문)' },
    { key: 'determinedTaxAmount', label: '결정세액', render: (r: Row) => <Num value={r.determinedTaxAmount} /> },
  ];

  return (
    <div className="doc">
      <section className="box">
        <h2>근로소득 원천징수부</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="정산 대상 연도" required>
            <NumberInput value={year} onChange={setYear} />
          </Field>
          <Field label="임직원" required>
            <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
          </Field>
        </Filters>
        {formError && <ErrorText text={formError} />}
        {error && <ErrorText text={error} />}
      </section>
      <section className="box">
        <h2>월별 내역</h2>
        <Band total={data?.total} />
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          empty={applied ? (loading ? '불러오는 중입니다.' : '조회된 급여 내역이 없습니다.') : '연도와 임직원을 선택한 뒤 조회해 주세요.'}
        />
        {data && <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} />}
      </section>
    </div>
  );
}
