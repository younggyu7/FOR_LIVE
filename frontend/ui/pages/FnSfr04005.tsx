import { useState } from 'react';
import { call, useData, Filters, Band, DataTable, Pager, Pairs, Badge, RefName, LookupSelect, Select, TextInput, Field } from '../kit';
import type { PageProps, Row, Page } from '../kit';

const PAGE_SIZE = 20;
const SEARCH_SIZE = 200;

export default function FnSfr04005Page({ role, notify }: PageProps) {
  const [status, setStatus] = useState<string>('재직자');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [keyword, setKeyword] = useState('');
  const [applied, setApplied] = useState({ status: '재직자', departmentId: '' as number | string, keyword: '' });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const size = applied.keyword ? SEARCH_SIZE : PAGE_SIZE;
  const { data, error, loading } = useData<Page>(
    () =>
      call<Page>('GET', '/employees', role, undefined, {
        employmentStatus: applied.status,
        departmentId: applied.departmentId,
        page: applied.keyword ? 0 : page,
        size,
      }),
    [role, applied, page],
  );

  const word = applied.keyword.trim().toLowerCase();
  const allRows = data ? data.items : [];
  const rows = word
    ? allRows.filter((r) =>
        String(r['name'] ?? '').toLowerCase().includes(word) ||
        String(r['employeeNo'] ?? '').toLowerCase().includes(word),
      )
    : allRows;

  const search = () => {
    setApplied({ status, departmentId, keyword });
    setPage(0);
    setSelected(null);
  };

  const reset = () => {
    setStatus('재직자');
    setDepartmentId('');
    setKeyword('');
    setApplied({ status: '재직자', departmentId: '', keyword: '' });
    setPage(0);
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>구성원 정보</h2>
          <Pairs
            items={[
              ['임직원명', String(selected['name'] ?? '')],
              ['사번', String(selected['employeeNo'] ?? '')],
              ['주부서', <RefName table="department" role={role} value={selected['departmentId']} />],
              ['재직 구분', <Badge value={selected['employmentStatus']} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>연락처</h2>
          <Pairs
            items={[
              ['이메일', String(selected['email'] ?? '') || '등록된 이메일이 없습니다.'],
              ['휴대전화번호', String(selected['mobilePhone'] ?? '') || '등록된 번호가 없습니다.'],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>조직도</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="검색어">
          <TextInput value={keyword} onChange={setKeyword} placeholder="이름 또는 사번" />
        </Field>
        <Field label="주부서">
          <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} placeholder="전체 부서" />
        </Field>
        <Field label="재직 구분">
          <Select
            value={status}
            onChange={setStatus}
            options={[
              ['재직자', '재직자'],
              ['퇴직자', '퇴직자'],
            ]}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {error ? <p>{error}</p> : null}
      {loading && !data ? <p>불러오는 중입니다.</p> : null}
      <Band total={rows.length} />
      <DataTable
        columns={[
          { key: 'name', label: '임직원명' },
          { key: 'employeeNo', label: '사번' },
          {
            key: 'departmentId',
            label: '주부서',
            render: (r: Row) => <RefName table="department" role={role} value={r['departmentId']} />,
          },
          {
            key: 'employmentStatus',
            label: '재직 구분',
            render: (r: Row) => <Badge value={r['employmentStatus']} />,
          },
          { key: 'mobilePhone', label: '휴대전화번호' },
        ]}
        rows={rows}
        onRowClick={(r: Row) => setSelected(r)}
        empty="검색 결과가 없습니다. 검색어나 조건을 바꿔 다시 조회해 보세요."
      />
      {data && !applied.keyword ? (
        <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
      ) : null}
    </div>
  );
}
