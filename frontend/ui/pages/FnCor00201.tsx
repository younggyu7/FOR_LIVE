import { useState } from 'react';
import {
  Band,
  DataTable,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  RefName,
  Tiles,
  TextInput,
  DateInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const PAGE_SIZE = 20;

interface Condition {
  startDate: string;
  endDate: string;
  employeeId: number | string;
  targetInfoType: string;
  departmentId: number | string;
}

const EMPTY: Condition = {
  startDate: '',
  endDate: '',
  employeeId: '',
  targetInfoType: '',
  departmentId: '',
};

export default function FnCor00201Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Condition>(EMPTY);
  const [applied, setApplied] = useState<Condition>(EMPTY);
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page>(
    () =>
      call<Page>('GET', '/personal-info-access-logs/statistics', role, undefined, {
        ...applied,
        page,
        size: PAGE_SIZE,
      }),
    [applied, page, role],
  );

  const search = () => {
    if (draft.startDate !== '' && draft.endDate !== '' && draft.endDate < draft.startDate) {
      setFormError('종료일이 시작일보다 앞서 조회할 수 없습니다. 조회 기간을 다시 선택하세요.');
      return;
    }
    setFormError('');
    setPage(0);
    setApplied(draft);
    notify('조회 조건을 적용했습니다.');
  };

  const reset = () => {
    setFormError('');
    setPage(0);
    setDraft(EMPTY);
    setApplied(EMPTY);
  };

  const items: Row[] = data ? data.items : [];
  const totalCount = items.length > 0 ? items[0]['totalCount'] : 0;

  return (
    <div className="doc">
      <h1>개인정보 열람 이력 통계</h1>
      <p>개인정보 원본 값은 표시하지 않고 열람 건수를 집계한 결과만 보여 줍니다.</p>
      <Filters onSearch={search} onReset={reset}>
        <Field label="조회 시작일">
          <DateInput value={draft.startDate} onChange={(v) => setDraft({ ...draft, startDate: v })} />
        </Field>
        <Field label="조회 종료일">
          <DateInput value={draft.endDate} onChange={(v) => setDraft({ ...draft, endDate: v })} />
        </Field>
        <Field label="열람자">
          <LookupSelect
            table="employee"
            role={role}
            value={draft.employeeId}
            onChange={(v) => setDraft({ ...draft, employeeId: v })}
            placeholder="전체"
          />
        </Field>
        <Field label="열람 대상 정보 구분">
          <TextInput
            value={draft.targetInfoType}
            onChange={(v) => setDraft({ ...draft, targetInfoType: v })}
          />
        </Field>
        <Field label="열람자 소속 부서">
          <LookupSelect
            table="department"
            role={role}
            value={draft.departmentId}
            onChange={(v) => setDraft({ ...draft, departmentId: v })}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {formError !== '' && <ErrorText text={formError} />}
      {error !== '' && <ErrorText text={error} />}
      <section className="box">
        <h2>열람 건수 통계</h2>
        <Tiles items={[['열람 건수 합계', <Num value={totalCount} />]]} />
        <Band total={data ? data.total : 0} />
        <DataTable
          columns={[
            { key: 'employeeId', label: '열람자', render: (r) => <RefName table="employee" role={role} value={r['employeeId']} /> },
            { key: 'departmentId', label: '열람자 부서', render: (r) => <RefName table="department" role={role} value={r['departmentId']} /> },
            { key: 'targetInfoType', label: '열람 대상 정보 구분' },
            { key: 'count', label: '그룹별 열람 건수', render: (r) => <Num value={r['count']} /> },
          ]}
          rows={items}
          empty={loading ? '불러오는 중입니다.' : '조건에 해당하는 열람 이력이 없습니다. 조회 조건을 바꿔 다시 조회해 보세요.'}
        />
        <Pager
          page={data ? data.page : 0}
          size={PAGE_SIZE}
          total={data ? data.total : 0}
          onPage={setPage}
        />
      </section>
    </div>
  );
}
