import { useState } from 'react';
import {
  Badge,
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
  Pairs,
  RefName,
  Tiles,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr02115Page({ role, notify }: PageProps) {
  const [payDate, setPayDate] = useState('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [applied, setApplied] = useState({ payDate: '', departmentId: '' as number | string });
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const list = useData<Page | undefined>(
    async () => {
      if (!applied.payDate) return undefined;
      return call<Page>('GET', '/payrolls', role, undefined, {
        payDate: applied.payDate,
        departmentId: applied.departmentId,
        page,
        size: PAGE_SIZE,
      });
    },
    [applied, page],
  );

  const summary = useData<Row | undefined>(
    async () => {
      if (!applied.payDate) return undefined;
      return call<Row>('GET', '/payrolls/summary', role, undefined, {
        payDate: applied.payDate,
        departmentId: applied.departmentId,
      });
    },
    [applied],
  );

  const detail = useData<Row | undefined>(
    async () => {
      if (selectedId === null) return undefined;
      return call<Row>('GET', '/payrolls/' + selectedId, role);
    },
    [selectedId],
  );

  function search() {
    if (!payDate) {
      notify('급여 지급일을 입력해 주세요.');
      return;
    }
    setPage(0);
    setApplied({ payDate, departmentId });
  }

  function reset() {
    setPayDate('');
    setDepartmentId('');
    setPage(0);
    setApplied({ payDate: '', departmentId: '' });
  }

  if (selectedId !== null) {
    const d = detail.data;
    const details = ((d?.details as Row[] | undefined) ?? []);
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelectedId(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>급여명세</h2>
          {detail.error && <ErrorText text={detail.error} />}
          {d && (
            <Pairs
              items={[
                ['급여 지급일', <DateText value={d.payDate} />],
                ['총 지급액(암호문)', String(d.totalPaymentAmountEnc ?? '')],
                ['총 공제액(암호문)', String(d.totalDeductionAmountEnc ?? '')],
                ['실지급액(암호문)', String(d.netPayAmountEnc ?? '')],
              ]}
            />
          )}
        </section>
        <section className="box">
          <h2>지급·공제 항목</h2>
          <DataTable
            columns={[
              {
                key: 'payrollItemId',
                label: '지급공제항목',
                render: (r) => <RefName table="payroll_item" role={role} value={r.payrollItemId} />,
              },
              { key: 'amount', label: '금액', render: (r) => <Num value={r.amount} /> },
            ]}
            rows={details}
            empty="이 급여에는 항목별 금액이 없습니다."
          />
        </section>
      </div>
    );
  }

  const s = summary.data;
  return (
    <div className="doc">
      <section className="box">
        <h2>급여대장</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="급여 지급일" required>
            <DateInput value={payDate} onChange={setPayDate} />
          </Field>
          <Field label="주부서">
            <LookupSelect
              table="department"
              role={role}
              value={departmentId}
              onChange={setDepartmentId}
              placeholder="전체"
            />
          </Field>
        </Filters>
      </section>
      {s && (
        <section className="box">
          <h2>급여현황</h2>
          <Tiles
            items={[
              ['대상 인원', <Num value={s.employeeCount} />],
              ['총 지급액', <Num value={s.totalPaymentAmount} />],
              ['총 공제액', <Num value={s.totalDeductionAmount} />],
              ['실지급액', <Num value={s.netPayAmount} />],
            ]}
          />
        </section>
      )}
      {summary.error && <ErrorText text={summary.error} />}
      <section className="box">
        <Band total={list.data?.total} />
        {list.error && <ErrorText text={list.error} />}
        <DataTable
          columns={[
            { key: 'employeeName', label: '임직원명' },
            { key: 'payDate', label: '급여 지급일', render: (r) => <DateText value={r.payDate} /> },
            { key: 'netPayAmountEnc', label: '실지급액(암호문)' },
            { key: 'closingStatus', label: '마감 상태', render: (r) => <Badge value={r.closingStatus} /> },
          ]}
          rows={list.data?.items ?? []}
          onRowClick={(r) => setSelectedId(Number(r.payrollId))}
          empty={applied.payDate ? '조건에 맞는 급여가 없습니다.' : '급여 지급일을 입력하고 조회해 주세요.'}
        />
        {list.data && (
          <Pager page={list.data.page} size={list.data.size} total={list.data.total} onPage={setPage} />
        )}
      </section>
    </div>
  );
}
