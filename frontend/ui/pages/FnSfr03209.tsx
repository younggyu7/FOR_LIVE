import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  Pairs,
  RefName,
  Select,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr03209Page({ role }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [query, setQuery] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/expense-resolutions', role, undefined, { ...query, page, size: SIZE }),
    [query, page, role],
  );

  const search = () => {
    setPage(0);
    setQuery({ ...draft });
  };

  const reset = () => {
    setDraft({});
    setPage(0);
    setQuery({});
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로
        </button>
        <section className="box">
          <h2>지출결의 내역</h2>
          <Pairs
            items={[
              ['결의서 ID', String(selected.expenseResolutionId ?? '')],
              ['프로젝트', <RefName table="project" role={role} value={selected.projectId} />],
              ['예산과목', <RefName table="budget_account" role={role} value={selected.budgetAccountId} />],
              ['결의부서', <RefName table="department" role={role} value={selected.departmentId} />],
              ['결의 금액', <Num value={selected.resolutionAmount} />],
              ['진행 상태', <Badge value={selected.status} />],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>지출결의 현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="거래 유형">
            <Select
              value={draft.incomeExpenseType}
              onChange={(v) => setDraft({ ...draft, incomeExpenseType: v })}
              options={[
                ['수입', '수입'],
                ['지출', '지출'],
              ]}
              placeholder="전체"
            />
          </Field>
          <Field label="프로젝트">
            <LookupSelect
              table="project"
              role={role}
              value={draft.projectId}
              onChange={(v) => setDraft({ ...draft, projectId: v })}
              placeholder="전체"
            />
          </Field>
          <Field label="결의부서">
            <LookupSelect
              table="department"
              role={role}
              value={draft.departmentId}
              onChange={(v) => setDraft({ ...draft, departmentId: v })}
              placeholder="전체"
            />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            {
              key: 'projectId',
              label: '프로젝트',
              render: (r) => <RefName table="project" role={role} value={r.projectId} />,
            },
            {
              key: 'budgetAccountId',
              label: '예산과목',
              render: (r) => <RefName table="budget_account" role={role} value={r.budgetAccountId} />,
            },
            {
              key: 'departmentId',
              label: '결의부서',
              render: (r) => <RefName table="department" role={role} value={r.departmentId} />,
            },
            {
              key: 'resolutionAmount',
              label: '결의 금액',
              render: (r) => <Num value={r.resolutionAmount} />,
            },
            {
              key: 'status',
              label: '진행 상태',
              render: (r) => <Badge value={r.status} />,
            },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty={loading ? '불러오는 중입니다.' : '조건에 맞는 지출결의가 없습니다. 조회 조건을 바꿔 다시 조회해 주세요.'}
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
