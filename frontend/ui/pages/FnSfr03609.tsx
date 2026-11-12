import { useEffect, useState } from 'react';
import { Band, Badge, DataTable, ErrorText, Field, Filters, LookupSelect, Pager, Pairs, RefName, Select, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr03609Page({ role, notify }: PageProps) {
  // 퇴직자는 조직도 대화 대상에서 제외하므로 기본 조회는 재직자다.
  const [status, setStatus] = useState<string>('재직자');
  const [dept, setDept] = useState<number | string>('');
  const [applied, setApplied] = useState<{ status: string; dept: number | string }>({ status: '재직자', dept: '' });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [lastEmployees, setLastEmployees] = useState<Page | undefined>(undefined);
  const [lastDepartments, setLastDepartments] = useState<Page | undefined>(undefined);

  const departments = useData<Page>(
    () => call<Page>('GET', '/departments', role, undefined, { page: 0, size: 200 }),
    [role],
  );
  const employees = useData<Page>(
    () => call<Page>('GET', '/employees', role, undefined, {
      employmentStatus: applied.status,
      departmentId: applied.dept,
      page,
      size: SIZE,
    }),
    [role, applied, page],
  );

  useEffect(() => {
    if (departments.data) setLastDepartments(departments.data);
  }, [departments.data]);

  useEffect(() => {
    if (employees.data) setLastEmployees(employees.data);
  }, [employees.data]);

  const search = () => {
    setPage(0);
    setApplied({ status, dept });
  };

  const reset = () => {
    setStatus('재직자');
    setDept('');
    setPage(0);
    setApplied({ status: '재직자', dept: '' });
  };

  const refresh = () => {
    departments.reload();
    employees.reload();
    notify('조직도를 다시 불러왔습니다.');
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>조직원 정보</h2>
          <Pairs
            items={[
              ['사번', String(selected.employeeNo ?? '')],
              ['임직원명', String(selected.name ?? '')],
              ['주부서', <RefName table="department" role={role} value={selected.departmentId} />],
              ['재직 구분', <Badge value={selected.employmentStatus} />],
              ['이메일', String(selected.email ?? '')],
              ['휴대전화번호', String(selected.mobilePhone ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  const deptRows = (departments.data ?? lastDepartments)?.items ?? [];
  const empPage = employees.data ?? lastEmployees;
  const empRows = empPage?.items ?? [];

  return (
    <div className="doc">
      <section className="box">
        <h2>조직도</h2>
        {departments.error && <ErrorText text={departments.error} />}
        {departments.error && lastDepartments && <p>그룹웨어 연계에 실패하여 마지막으로 반영된 부서 정보를 표시합니다.</p>}
        <DataTable
          columns={[
            { key: 'departmentCode', label: '부서코드' },
            { key: 'name', label: '부서명' },
            { key: 'abbreviation', label: '부서 약칭' },
          ]}
          rows={deptRows}
          onRowClick={(row) => {
            setDept(row.departmentId as number);
            setPage(0);
            setApplied({ status, dept: row.departmentId as number });
          }}
          empty="아직 반영된 부서 정보가 없습니다."
        />
      </section>
      <section className="box">
        <h2>조직원 검색</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="재직 구분">
            <Select
              value={status}
              onChange={setStatus}
              options={[['재직자', '재직자'], ['퇴직자', '퇴직자']]}
              placeholder="전체"
            />
          </Field>
          <Field label="주부서">
            <LookupSelect table="department" role={role} value={dept} onChange={setDept} placeholder="전체 부서" />
          </Field>
        </Filters>
        {employees.error && <ErrorText text={employees.error} />}
        {employees.error && lastEmployees && <p>그룹웨어 연계에 실패하여 마지막으로 반영된 조직원 정보를 표시합니다.</p>}
        <Band total={empPage?.total}>
          <button className="ghost" onClick={refresh}>다시 불러오기</button>
        </Band>
        <DataTable
          columns={[
            { key: 'employeeNo', label: '사번' },
            { key: 'name', label: '임직원명' },
            { key: 'departmentId', label: '주부서', render: (row) => <RefName table="department" role={role} value={row.departmentId} /> },
            { key: 'employmentStatus', label: '재직 구분', render: (row) => <Badge value={row.employmentStatus} /> },
          ]}
          rows={empRows}
          onRowClick={(row) => setSelected(row)}
          empty="조건에 맞는 조직원이 없습니다. 조회 조건을 바꿔 보세요."
        />
        <Pager page={empPage?.page ?? 0} size={SIZE} total={empPage?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
