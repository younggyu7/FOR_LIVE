import { useState } from 'react';
import { Band, Badge, DataTable, DateInput, ErrorText, Field, Filters, LookupSelect, Num, Pager, Select, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;
const VIEW_STATEMENT = '손익계산서';
const VIEW_ALLOCATION = '안분 현황';

export default function FnSfr01004Page({ role, notify }: PageProps) {
  const [viewType, setViewType] = useState(VIEW_STATEMENT);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectId, setProjectId] = useState<number | string>('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    return call<Page>('GET', '/management-income-statements', role, undefined, { ...applied, page: pageNo, size: SIZE });
  }, [applied, pageNo]);

  function search() {
    if (!viewType) {
      setFormError('조회 구분을 선택해 주세요.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('조회 시작일과 종료일을 모두 입력해 주세요.');
      return;
    }
    if (startDate > endDate) {
      setFormError('조회 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setFormError('');
    setPageNo(0);
    setApplied({ viewType, startDate, endDate, projectId, departmentId });
  }

  function reset() {
    setViewType(VIEW_STATEMENT);
    setStartDate('');
    setEndDate('');
    setProjectId('');
    setDepartmentId('');
    setFormError('');
    setApplied(null);
    setPageNo(0);
  }

  const names = (row: Row) => (
    <span>
      {String(row['projectName'] ?? '-')} / {String(row['departmentName'] ?? '-')}
    </span>
  );

  const statementColumns = [
    {
      key: 'accountSubjectName',
      label: '계정과목 명칭',
      render: (row: Row) => (
        <span>
          {String(row['accountSubjectName'] ?? '')} <Badge value={row['category']} />
        </span>
      ),
    },
    { key: 'projectName', label: '프로젝트 명칭 / 부서명', render: names },
    { key: 'revenueAmount', label: '수익 금액', render: (row: Row) => <Num value={row['revenueAmount']} /> },
    { key: 'expenseAmount', label: '비용 금액', render: (row: Row) => <Num value={row['expenseAmount']} /> },
    { key: 'profitAmount', label: '손익 금액', render: (row: Row) => <Num value={row['profitAmount']} /> },
  ];

  const allocationColumns = [
    { key: 'allocationRuleName', label: '안분 기준명' },
    { key: 'projectName', label: '프로젝트 명칭 / 부서명', render: names },
    { key: 'profitAmount', label: '손익 금액', render: (row: Row) => <Num value={row['profitAmount']} /> },
    { key: 'allocatedAmount', label: '안분 금액', render: (row: Row) => <Num value={row['allocatedAmount']} /> },
  ];

  const columns = applied && applied['viewType'] === VIEW_ALLOCATION ? allocationColumns : statementColumns;
  const emptyText = applied
    ? '조건에 해당하는 데이터가 없습니다. 조회 조건을 바꿔 다시 조회해 보세요.'
    : '조회 구분과 기간을 선택한 뒤 조회해 주세요.';

  return (
    <div className="doc">
      <section className="box">
        <h2>관리용 손익계산서 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 구분" required>
            <Select
              value={viewType}
              onChange={setViewType}
              options={[
                [VIEW_STATEMENT, '손익계산서'],
                [VIEW_ALLOCATION, '안분 현황'],
              ]}
            />
          </Field>
          <Field label="조회 시작일" required>
            <DateInput value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="조회 종료일" required>
            <DateInput value={endDate} onChange={setEndDate} />
          </Field>
          <Field label="프로젝트 ID">
            <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} placeholder="전체 프로젝트" />
          </Field>
          <Field label="부서 ID">
            <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} placeholder="전체 부서" />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>{applied && applied['viewType'] === VIEW_ALLOCATION ? '손익계산서 안분 현황' : '관리용 손익계산서'}</h2>
        <Band total={data ? data.total : 0} />
        <DataTable columns={columns} rows={data ? data.items : []} empty={loading ? '불러오는 중입니다.' : emptyText} />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} /> : null}
      </section>
    </div>
  );
}
