import { useState } from 'react';
import {
  call,
  useData,
  Filters,
  Band,
  DataTable,
  Pager,
  Pairs,
  Field,
  DateInput,
  LookupSelect,
  RefName,
  DateText,
  Badge,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

export default function FnSfr03104Page({ role, notify }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/change-histories', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page, role],
  );

  const search = () => {
    if (fromDate && toDate && fromDate > toDate) {
      notify('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setPage(0);
    setApplied({ employeeId, fromDate, toDate });
  };

  const reset = () => {
    setEmployeeId('');
    setFromDate('');
    setToDate('');
    setPage(0);
    setApplied({});
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>수정이력 내용</h2>
          <Pairs
            items={[
              ['변경 일시', <DateText value={selected.changedAt} time />],
              ['수정자', <RefName table="employee" role={role} value={selected.changerId} />],
              ['변경 구분', selected.changeType ? <Badge value={selected.changeType} /> : '-'],
              ['변경 내용', String(selected.changeContent ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>문서 수정이력</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="대상 임직원">
            <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} placeholder="전체" />
          </Field>
          <Field label="변경 일시 시작">
            <DateInput value={fromDate} onChange={setFromDate} />
          </Field>
          <Field label="변경 일시 종료">
            <DateInput value={toDate} onChange={setToDate} />
          </Field>
        </Filters>
        {error ? <p>{error}</p> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'changedAt', label: '변경 일시', render: (r) => <DateText value={r.changedAt} time /> },
            { key: 'changerId', label: '수정자', render: (r) => <RefName table="employee" role={role} value={r.changerId} /> },
            { key: 'changeType', label: '변경 구분', render: (r) => (r.changeType ? <Badge value={r.changeType} /> : <span>-</span>) },
            { key: 'changeContent', label: '변경 내용' },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty={loading ? '불러오는 중입니다.' : '조회된 수정이력이 없습니다. 조회 조건을 바꿔 다시 조회해 주세요.'}
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
