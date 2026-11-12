import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  DateText,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  NumberInput,
  Pager,
  Pairs,
  Select,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const SIZE = 20;

interface Cond {
  scope: string;
  baseYear: number | string;
  departmentId: number | string;
  employmentStatus: string;
}

const INITIAL: Cond = {
  scope: '개인',
  baseYear: new Date().getFullYear(),
  departmentId: '',
  employmentStatus: '',
};

export default function FnSfr01905Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Cond>(INITIAL);
  const [applied, setApplied] = useState<Cond>(INITIAL);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page>(
    () =>
      call<Page>('GET', '/annual-leaves/summary', role, undefined, {
        scope: applied.scope,
        baseYear: applied.baseYear,
        departmentId: applied.scope === '부서' ? applied.departmentId : '',
        employmentStatus: applied.employmentStatus,
        page,
        size: SIZE,
      }),
    [applied, page, role],
  );

  function search() {
    if (draft.baseYear === '' || draft.baseYear === undefined) {
      setFormError('기준연도를 입력해 주세요.');
      return;
    }
    if (draft.scope === '부서' && draft.departmentId === '') {
      setFormError('부서 범위로 조회하려면 부서를 선택해 주세요.');
      return;
    }
    setFormError('');
    setPage(0);
    setApplied(draft);
    notify('조회했습니다.');
  }

  function reset() {
    setFormError('');
    setDraft(INITIAL);
    setApplied(INITIAL);
    setPage(0);
  }

  if (selected) {
    const months = (selected.monthlyUsedDays as number[] | undefined) ?? [];
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>연차 총괄현황</h2>
          <Pairs
            items={[
              ['사번', String(selected.employeeNo ?? '')],
              ['임직원명', String(selected.employeeName ?? '')],
              ['부서명', String(selected.departmentName ?? '')],
              ['생성일수', <Num value={selected.grantedDays} />],
              ['사용일수', <Num value={selected.usedDays} />],
              ['잔여일수', <Num value={selected.remainingDays} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>월별 사용 연차</h2>
          <Pairs
            items={months.map((d, i): [string, React.ReactNode] => [`${i + 1}월`, <Num value={d} />])}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>연차 총괄현황</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="조회 범위" required>
          <Select
            value={draft.scope}
            onChange={(v) => setDraft({ ...draft, scope: v })}
            options={[
              ['전체', '전체'],
              ['부서', '부서'],
              ['개인', '개인'],
            ]}
            placeholder="선택"
          />
        </Field>
        <Field label="기준연도" required>
          <NumberInput value={draft.baseYear} onChange={(v) => setDraft({ ...draft, baseYear: v })} />
        </Field>
        {draft.scope === '부서' && (
          <Field label="부서" required>
            <LookupSelect
              table="department"
              role={role}
              value={draft.departmentId}
              onChange={(v) => setDraft({ ...draft, departmentId: v })}
              placeholder="부서 선택"
            />
          </Field>
        )}
        <Field label="재직 구분">
          <Select
            value={draft.employmentStatus}
            onChange={(v) => setDraft({ ...draft, employmentStatus: v })}
            options={[
              ['재직자', '재직자'],
              ['퇴직자', '퇴직자'],
            ]}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {formError && <ErrorText text={formError} />}
      {error && <ErrorText text={error} />}
      <Band total={data?.total} />
      <DataTable
        columns={[
          { key: 'employeeNo', label: '사번' },
          { key: 'employeeName', label: '임직원명' },
          { key: 'departmentName', label: '부서명' },
          { key: 'grantedDays', label: '생성일수', render: (r) => <Num value={r.grantedDays} /> },
          { key: 'remainingDays', label: '잔여일수', render: (r) => <Num value={r.remainingDays} /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={(r) => setSelected(r)}
        empty={loading ? '불러오는 중입니다.' : '조회 결과가 없습니다. 조회 범위와 기준연도를 바꿔 다시 조회해 주세요.'}
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
