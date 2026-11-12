import { useState } from 'react';
import {
  Badge,
  Band,
  call,
  DataTable,
  DateInput,
  DateText,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  RefName,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

type Tab = 'weekly' | 'summary';

const EMPTY_FORM = { startDate: '', endDate: '', departmentId: '' as number | string, employeeId: '' as number | string };

export default function FnSfr01806Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<Tab>('weekly');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [applied, setApplied] = useState<typeof EMPTY_FORM | null>(null);
  const [pageNo, setPageNo] = useState(0);

  const path = tab === 'weekly' ? '/work-hours/weekly' : '/work-hours/type-summary';
  const { data, error, loading } = useData<Page | undefined>(
    async () => {
      if (!applied) {
        return undefined;
      }
      return call<Page>('GET', path, role, undefined, {
        startDate: applied.startDate,
        endDate: applied.endDate,
        departmentId: applied.departmentId,
        employeeId: applied.employeeId,
        page: pageNo,
        size: 20,
      });
    },
    [applied, tab, pageNo, role],
  );

  function search() {
    if (!form.startDate || !form.endDate) {
      notify('조회 시작일과 종료일을 입력해 주세요.');
      return;
    }
    if (form.endDate < form.startDate) {
      notify('종료일은 시작일 이후여야 합니다.');
      return;
    }
    setPageNo(0);
    setApplied({ ...form });
  }

  function reset() {
    setForm({ ...EMPTY_FORM });
    setApplied(null);
    setPageNo(0);
  }

  function changeTab(next: Tab) {
    setTab(next);
    setPageNo(0);
  }

  const weeklyColumns = [
    { key: 'employeeId', label: '임직원', render: (r: Row) => <RefName table="employee" role={role} value={r.employeeId} /> },
    { key: 'weekStartDate', label: '주 시작일', render: (r: Row) => <DateText value={r.weekStartDate} /> },
    { key: 'weeklyWorkHours', label: '주간 합계 근무시간', render: (r: Row) => <Num value={r.weeklyWorkHours} /> },
    { key: 'isOverLimit', label: '법정 기준시간 초과 여부', render: (r: Row) => <Badge value={r.isOverLimit ? '초과' : '정상'} /> },
    { key: 'hasMissingRecord', label: '출퇴근 데이터 누락 여부', render: (r: Row) => <Badge value={r.hasMissingRecord ? '누락 있음' : '정상'} /> },
  ];

  const summaryColumns = [
    { key: 'attendanceType', label: '근태 유형' },
    { key: 'count', label: '유형별 건수', render: (r: Row) => <Num value={r.count} /> },
    { key: 'days', label: '유형별 일수', render: (r: Row) => <Num value={r.days} /> },
  ];

  return (
    <div className="doc">
      <section className="box">
        <h2>근무시간 집계 및 현황</h2>
        <div>
          <button className={tab === 'weekly' ? '' : 'ghost'} onClick={() => changeTab('weekly')}>
            주간 근무시간
          </button>
          <button className={tab === 'summary' ? '' : 'ghost'} onClick={() => changeTab('summary')}>
            근태 유형별 집계
          </button>
        </div>
      </section>
      <section className="box">
        <h2>조회 조건</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 시작일" required>
            <DateInput value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
          </Field>
          <Field label="조회 종료일" required>
            <DateInput value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} />
          </Field>
          <Field label="부서 ID">
            <LookupSelect table="department" role={role} value={form.departmentId} onChange={(v) => setForm({ ...form, departmentId: v })} />
          </Field>
          <Field label="임직원 ID">
            <LookupSelect table="employee" role={role} value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })} />
          </Field>
        </Filters>
      </section>
      <section className="box">
        <h2>{tab === 'weekly' ? '주간 근무시간' : '근태 유형별 집계'}</h2>
        {error ? <ErrorText text={error} /> : null}
        {!applied ? (
          <p>조회 기간을 입력하고 조회 버튼을 눌러 주세요.</p>
        ) : (
          <>
            <Band total={data ? data.total : 0} />
            <DataTable
              columns={tab === 'weekly' ? weeklyColumns : summaryColumns}
              rows={data ? data.items : []}
              empty={loading ? '불러오는 중입니다.' : '조회된 내역이 없습니다. 기간을 바꿔 다시 조회해 주세요.'}
            />
            {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} /> : null}
          </>
        )}
      </section>
    </div>
  );
}
