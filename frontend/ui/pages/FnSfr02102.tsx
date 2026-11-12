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
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr02102Page({ role, notify }: PageProps) {
  const [payDate, setPayDate] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [applied, setApplied] = useState<{ payDate: string; departmentId: number | string }>({ payDate: '', departmentId: '' });
  const [page, setPage] = useState(0);

  const { data, error, loading } = useData<Page>(
    () =>
      call<Page>('GET', '/payroll-transfers', role, undefined, {
        payDate: applied.payDate,
        departmentId: applied.departmentId,
        page,
        size: SIZE,
      }),
    [role, applied, page],
  );

  function search() {
    setPage(0);
    setApplied({ payDate, departmentId });
    notify('급여이체 현황을 조회합니다.');
  }

  function reset() {
    setPayDate('');
    setDepartmentId('');
    setPage(0);
    setApplied({ payDate: '', departmentId: '' });
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>급여이체 현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 대상 지급일">
            <DateInput value={payDate} onChange={setPayDate} />
          </Field>
          <Field label="부서 조건">
            <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} placeholder="전체 부서" />
          </Field>
        </Filters>
      </section>
      <section className="box">
        <Band total={data ? data.total : undefined} />
        {error ? <ErrorText text={error} /> : null}
        {loading && !data ? <p>불러오는 중입니다.</p> : null}
        <DataTable<Row>
          columns={[
            { key: 'employeeNo', label: '사번' },
            { key: 'employeeName', label: '임직원명' },
            { key: 'payDate', label: '급여 지급일', render: (r) => <DateText value={r.payDate} /> },
            { key: 'netPayAmountEnc', label: '실지급액(암호문)' },
            {
              key: 'accountNumber',
              label: '이체 계좌',
              render: (r) => (r.bankName || r.accountNumber ? `${String(r.bankName ?? '')} ${String(r.accountNumber ?? '')}` : '계좌 정보가 없습니다.'),
            },
          ]}
          rows={data ? data.items : []}
          empty="조건에 맞는 급여이체 내역이 없습니다. 지급일이나 부서를 바꿔 다시 조회해 주세요."
        />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} /> : null}
      </section>
    </div>
  );
}
