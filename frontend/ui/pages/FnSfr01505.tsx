import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  Pairs,
  Select,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

const EMPTY_FILTER: Row = {
  viewScope: '',
  startDate: '',
  endDate: '',
  educationCourseId: '',
  departmentId: '',
  employeeId: '',
};

function completedText(value: unknown) {
  if (value === true) {
    return '수료';
  }
  if (value === false) {
    return '미수료';
  }
  return '-';
}

export default function FnSfr01505Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>(EMPTY_FILTER);
  const [applied, setApplied] = useState<Row>(EMPTY_FILTER);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/education-status', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page, role],
  );

  function change(key: string, value: unknown) {
    setDraft({ ...draft, [key]: value });
  }

  function search() {
    if (draft.startDate && draft.endDate && String(draft.startDate) > String(draft.endDate)) {
      notify('교육 기간 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setPage(0);
    setApplied({ ...draft });
  }

  function reset() {
    setDraft(EMPTY_FILTER);
    setApplied(EMPTY_FILTER);
    setPage(0);
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>교육 정보</h2>
          <Pairs
            items={[
              ['교육과정명', String(selected.courseName ?? '')],
              ['차수', <Num value={selected.sessionNo} />],
              [
                '교육 기간',
                <span>
                  <DateText value={selected.startDate} /> ~ <DateText value={selected.endDate} />
                </span>,
              ],
            ]}
          />
        </section>
        <section className="box">
          <h2>교육 이수 현황</h2>
          <Pairs
            items={[
              ['임직원명', String(selected.employeeName ?? '')],
              ['부서명', String(selected.departmentName ?? '')],
              ['처리 상태', selected.applicationStatus ? <Badge value={selected.applicationStatus} /> : '-'],
              ['수료 여부', completedText(selected.completed)],
              ['점수', selected.score === null || selected.score === undefined ? '-' : <Num value={selected.score} />],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>교육현황 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 범위">
            <Select
              value={draft.viewScope}
              onChange={(v) => change('viewScope', v)}
              options={[
                ['전체', '전체'],
                ['부서', '부서'],
                ['개인', '개인'],
              ]}
              placeholder="선택"
            />
          </Field>
          <Field label="교육 기간 시작일">
            <DateInput value={draft.startDate} onChange={(v) => change('startDate', v)} />
          </Field>
          <Field label="교육 기간 종료일">
            <DateInput value={draft.endDate} onChange={(v) => change('endDate', v)} />
          </Field>
          <Field label="교육과정">
            <LookupSelect
              table="education_course"
              role={role}
              value={draft.educationCourseId}
              onChange={(v) => change('educationCourseId', v)}
            />
          </Field>
          <Field label="주부서">
            <LookupSelect
              table="department"
              role={role}
              value={draft.departmentId}
              onChange={(v) => change('departmentId', v)}
            />
          </Field>
          <Field label="임직원">
            <LookupSelect
              table="employee"
              role={role}
              value={draft.employeeId}
              onChange={(v) => change('employeeId', v)}
            />
          </Field>
        </Filters>
      </section>
      <section className="box">
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            {
              key: 'courseName',
              label: '교육과정명',
              render: (row) => String(row.courseName ?? '') + ' ' + String(row.sessionNo ?? '') + '차',
            },
            {
              key: 'startDate',
              label: '교육 기간',
              render: (row) => (
                <span>
                  <DateText value={row.startDate} /> ~ <DateText value={row.endDate} />
                </span>
              ),
            },
            {
              key: 'employeeName',
              label: '임직원명',
              render: (row) => String(row.employeeName ?? '') + ' (' + String(row.departmentName ?? '') + ')',
            },
            {
              key: 'applicationStatus',
              label: '처리 상태',
              render: (row) => (row.applicationStatus ? <Badge value={row.applicationStatus} /> : '-'),
            },
            {
              key: 'completed',
              label: '수료 여부',
              render: (row) => completedText(row.completed),
            },
          ]}
          rows={data?.items ?? []}
          onRowClick={(row) => setSelected(row)}
          empty={loading ? '불러오는 중입니다.' : '조회 결과가 없습니다. 조회 조건을 바꿔 다시 검색해 보세요.'}
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
