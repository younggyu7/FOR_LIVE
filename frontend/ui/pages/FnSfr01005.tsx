import { useState } from 'react';
import {
  Band,
  DataTable,
  DateInput,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';
import { ErrorText } from '../kit';

interface Condition {
  startDate: string;
  endDate: string;
  accountingUnitId: number | string;
  projectId: number | string;
  departmentId: number | string;
}

const EMPTY: Condition = {
  startDate: '',
  endDate: '',
  accountingUnitId: '',
  projectId: '',
  departmentId: '',
};

export default function FnSfr01005Page({ role, notify }: PageProps) {
  const [form, setForm] = useState<Condition>(EMPTY);
  const [applied, setApplied] = useState<Condition | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    return call<Page>('GET', '/management-cost-reports', role, undefined, {
      startDate: applied.startDate,
      endDate: applied.endDate,
      accountingUnitId: applied.accountingUnitId,
      projectId: applied.projectId,
      departmentId: applied.departmentId,
      page: pageNo,
    });
  }, [applied, pageNo, role]);

  const search = () => {
    if (!form.startDate || !form.endDate) {
      setFormError('조회 기간을 입력해 주세요.');
      return;
    }
    if (form.startDate > form.endDate) {
      setFormError('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setFormError('');
    setPageNo(0);
    setApplied({ ...form });
  };

  const reset = () => {
    setForm(EMPTY);
    setApplied(null);
    setPageNo(0);
    setFormError('');
  };

  const columns = [
    { key: 'departmentName', label: '부서명' },
    { key: 'projectName', label: '프로젝트 명칭' },
    { key: 'accountSubjectName', label: '계정과목 명칭' },
    {
      key: 'costAmount',
      label: '원가 금액',
      render: (row: Row) => <Num value={row.costAmount} />,
    },
  ];

  return (
    <div className="doc">
      <section className="box">
        <h2>관리용 원가보고서</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 시작일" required>
            <DateInput
              value={form.startDate}
              onChange={(v) => setForm({ ...form, startDate: v })}
            />
          </Field>
          <Field label="조회 종료일" required>
            <DateInput
              value={form.endDate}
              onChange={(v) => setForm({ ...form, endDate: v })}
            />
          </Field>
          <Field label="회계단위 ID">
            <LookupSelect
              table="accounting_unit"
              role={role}
              value={form.accountingUnitId}
              onChange={(v) => setForm({ ...form, accountingUnitId: v })}
            />
          </Field>
          <Field label="프로젝트 ID">
            <LookupSelect
              table="project"
              role={role}
              value={form.projectId}
              onChange={(v) => setForm({ ...form, projectId: v })}
            />
          </Field>
          <Field label="부서 ID">
            <LookupSelect
              table="department"
              role={role}
              value={form.departmentId}
              onChange={(v) => setForm({ ...form, departmentId: v })}
            />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        {!applied ? (
          <p>조회 기간을 선택한 뒤 조회 버튼을 눌러 주세요.</p>
        ) : (
          <>
            <Band total={data?.total} />
            <DataTable
              columns={columns}
              rows={data?.items ?? []}
              empty={loading ? '불러오는 중입니다.' : '조건에 해당하는 데이터가 없습니다. 조회 조건을 바꿔 다시 조회해 주세요.'}
            />
            {data ? (
              <Pager
                page={data.page}
                size={data.size}
                total={data.total}
                onPage={setPageNo}
              />
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
