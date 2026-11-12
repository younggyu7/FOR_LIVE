import { useState } from 'react';
import {
  Band,
  Column,
  DataTable,
  DateText,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Page,
  PageProps,
  Pager,
  Pairs,
  RefName,
  Row,
  call,
  useData,
} from '../kit';

const SIZE = 20;

export default function FnSfr01401Page({ role }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [applied, setApplied] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page>(
    () =>
      call<Page>('GET', '/personnel-records', role, undefined, {
        employeeId: applied,
        page,
        size: SIZE,
      }),
    [role, applied, page],
  );

  const columns: Column[] = [
    {
      key: 'employeeId',
      label: '임직원',
      render: (row) => <RefName table="employee" role={role} value={row.employeeId} />,
    },
    {
      key: 'hireDate',
      label: '입사일',
      render: (row) => <DateText value={row.hireDate} />,
    },
    { key: 'recruitmentType', label: '채용 구분' },
    { key: 'veteranInfo', label: '보훈 정보' },
    { key: 'militaryServiceInfo', label: '병역 정보' },
  ];

  const search = () => {
    setPage(0);
    setApplied(employeeId);
  };

  const reset = () => {
    setEmployeeId('');
    setApplied('');
    setPage(0);
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>기본 정보</h2>
          <Pairs
            items={[
              ['임직원', <RefName table="employee" role={role} value={selected.employeeId} />],
              ['입사일', <DateText value={selected.hireDate} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>채용 정보</h2>
          <Pairs
            items={[
              ['채용 구분', String(selected.recruitmentType ?? '')],
              ['채용 정보 비고', String(selected.recruitmentNote ?? '')],
            ]}
          />
        </section>
        <section className="box">
          <h2>개인 정보</h2>
          <Pairs
            items={[
              ['주소', String(selected.address ?? '')],
              ['보훈 정보', String(selected.veteranInfo ?? '')],
              ['병역 정보', String(selected.militaryServiceInfo ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <h2>인사정보 현황</h2>
      <Filters onSearch={search} onReset={reset}>
        <Field label="임직원">
          <LookupSelect
            table="employee"
            role={role}
            value={employeeId}
            onChange={setEmployeeId}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {error && <ErrorText text={error} />}
      <Band total={data?.total} />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        onRowClick={(row) => setSelected(row)}
        empty={loading ? '불러오는 중입니다.' : '조회 결과가 없습니다. 조건을 바꿔 다시 조회해 주세요.'}
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
