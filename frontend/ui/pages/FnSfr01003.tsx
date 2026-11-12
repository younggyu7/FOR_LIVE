import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  DateInput,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  call,
  useData,
  ErrorText,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const EMPTY: Page = { items: [], page: 0, size: 20, total: 0 };

export default function FnSfr01003Page({ role, notify }: PageProps) {
  const [baseDate, setBaseDate] = useState('');
  const [accountingUnitId, setAccountingUnitId] = useState<number | string>('');
  const [projectId, setProjectId] = useState<number | string>('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page>(async () => {
    if (!applied) {
      return EMPTY;
    }
    return call<Page>('GET', '/management-balance-sheets', role, undefined, { ...applied, page, size: 20 });
  }, [applied, page, role]);

  const search = () => {
    if (!baseDate) {
      setFormError('조회 기준일을 입력해 주세요.');
      return;
    }
    setFormError('');
    setPage(0);
    setApplied({ baseDate, accountingUnitId, projectId, departmentId });
  };

  const reset = () => {
    setBaseDate('');
    setAccountingUnitId('');
    setProjectId('');
    setDepartmentId('');
    setFormError('');
    setPage(0);
    setApplied(null);
  };

  const result = data ?? EMPTY;

  return (
    <div className="doc">
      <section className="box">
        <h2>관리용 재무상태표</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 기준일 또는 기간" required>
            <DateInput value={baseDate} onChange={setBaseDate} />
          </Field>
          <Field label="회계단위">
            <LookupSelect table="accounting_unit" role={role} value={accountingUnitId} onChange={setAccountingUnitId} />
          </Field>
          <Field label="프로젝트 ID">
            <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} />
          </Field>
          <Field label="부서 ID">
            <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>조회 결과</h2>
        <Band total={applied ? result.total : undefined} />
        <DataTable
          columns={[
            { key: 'accountSubjectName', label: '계정과목 명칭' },
            { key: 'category', label: '계정 구분', render: (row) => <Badge value={row['category']} /> },
            { key: 'amount', label: '계정과목 금액', render: (row) => <Num value={row['amount']} /> },
          ]}
          rows={result.items}
          empty={
            applied
              ? (loading ? '불러오는 중입니다.' : '조건에 해당하는 데이터가 없습니다. 기준일이나 조건을 바꿔 다시 조회해 주세요.')
              : '기준일을 입력하고 조회해 주세요.'
          }
        />
        <Pager page={result.page} size={result.size} total={result.total} onPage={setPage} />
      </section>
    </div>
  );
}
