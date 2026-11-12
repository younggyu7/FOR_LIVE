import { useState } from 'react';
import {
  Band,
  Badge,
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
  RefName,
  Select,
  call,
  useData,
} from '../kit';
import type { Column, Page, PageProps, Row } from '../kit';

const STATUS_TYPES: [string, string][] = [
  ['입·퇴사', '입·퇴사'],
  ['휴직', '휴직'],
  ['근속연수', '근속연수'],
  ['가족', '가족'],
  ['학력·경력', '학력·경력'],
];
const SCOPES: [string, string][] = [
  ['전체', '전체'],
  ['부서', '부서'],
  ['개인', '개인'],
];
const EMPLOYMENT: [string, string][] = [
  ['재직자', '재직자'],
  ['퇴직자', '퇴직자'],
];
const SIZE = 20;

interface Cond {
  statusType: string;
  startDate: string;
  endDate: string;
  viewScope: string;
  employmentStatus: string;
  departmentId: number | string;
}

const EMPTY: Cond = {
  statusType: '',
  startDate: '',
  endDate: '',
  viewScope: '',
  employmentStatus: '',
  departmentId: '',
};

export default function FnSfr01403Page({ role }: PageProps) {
  const [cond, setCond] = useState<Cond>(EMPTY);
  const [applied, setApplied] = useState<Cond | null>(null);
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page | null>(async () => {
    if (applied === null) {
      return null;
    }
    return call<Page>('GET', '/personnel-status', role, undefined, {
      statusType: applied.statusType,
      startDate: applied.startDate,
      endDate: applied.endDate,
      viewScope: applied.viewScope,
      employmentStatus: applied.employmentStatus,
      departmentId: applied.departmentId,
      page,
      size: SIZE,
    });
  }, [applied, page]);

  function set<K extends keyof Cond>(key: K, value: Cond[K]) {
    setCond({ ...cond, [key]: value });
  }

  function search() {
    if (cond.statusType === '') {
      setFormError('현황 구분을 선택해 주세요.');
      return;
    }
    if (cond.startDate !== '' && cond.endDate !== '' && cond.startDate > cond.endDate) {
      setFormError('조회 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setFormError('');
    setPage(0);
    setApplied({ ...cond });
  }

  function reset() {
    setCond(EMPTY);
    setApplied(null);
    setFormError('');
    setPage(0);
  }

  const type = applied ? applied.statusType : '';

  const columns: Column[] = [
    {
      key: 'employeeName',
      label: '임직원',
      render: (row) => String(row['employeeNo'] ?? '') + ' ' + String(row['employeeName'] ?? ''),
    },
    { key: 'departmentName', label: '부서명' },
    { key: 'employmentStatus', label: '재직 구분', render: (row) => <Badge value={row['employmentStatus']} /> },
    {
      key: 'hireDate',
      label: '입사일',
      render: (row) => (
        <span>
          <DateText value={row['hireDate']} />
          {row['resignationDate'] ? ' ~ ' : ''}
          {row['resignationDate'] ? <DateText value={row['resignationDate']} /> : null}
        </span>
      ),
    },
    {
      key: 'serviceYears',
      label: type === '휴직' ? '발령' : type === '가족' ? '가족 관계' : '근속연수',
      render: (row) => {
        if (type === '휴직') {
          return (
            <span>
              {String(row['appointmentType'] ?? '')} <DateText value={row['appointmentDate']} />
            </span>
          );
        }
        if (type === '가족') {
          return String(row['familyRelationship'] ?? '');
        }
        return (
          <span>
            <Num value={row['serviceYears']} />년
          </span>
        );
      },
    },
  ];

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>임직원 정보</h2>
          <Pairs
            items={[
              ['사번', String(selected['employeeNo'] ?? '')],
              ['임직원명', String(selected['employeeName'] ?? '')],
              ['부서명', String(selected['departmentName'] ?? '')],
              ['재직 구분', <Badge value={selected['employmentStatus']} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>{type} 현황</h2>
          <Pairs
            items={[
              ['입사일', <DateText value={selected['hireDate']} />],
              ['퇴사일', <DateText value={selected['resignationDate']} />],
              ['근속연수', <Num value={selected['serviceYears']} />],
              ['발령 구분', String(selected['appointmentType'] ?? '')],
              ['발령일자', <DateText value={selected['appointmentDate']} />],
              ['관계', String(selected['familyRelationship'] ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  const rows = data ? data.items : [];

  return (
    <div className="doc">
      <section className="box">
        <h2>임직원 현황 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="현황 구분" required>
            <Select value={cond.statusType} onChange={(v) => set('statusType', v)} options={STATUS_TYPES} />
          </Field>
          <Field label="조회 시작일">
            <DateInput value={cond.startDate} onChange={(v) => set('startDate', v)} />
          </Field>
          <Field label="조회 종료일">
            <DateInput value={cond.endDate} onChange={(v) => set('endDate', v)} />
          </Field>
          <Field label="조회 범위">
            <Select value={cond.viewScope} onChange={(v) => set('viewScope', v)} options={SCOPES} />
          </Field>
          <Field label="재직 구분">
            <Select
              value={cond.employmentStatus}
              onChange={(v) => set('employmentStatus', v)}
              options={EMPLOYMENT}
            />
          </Field>
          <Field label="주부서">
            <LookupSelect
              table="department"
              role={role}
              value={cond.departmentId}
              onChange={(v) => set('departmentId', v)}
            />
          </Field>
        </Filters>
        {formError !== '' ? <ErrorText text={formError} /> : null}
        {error !== '' ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>임직원 현황 목록</h2>
        <Band total={data ? data.total : 0} />
        <DataTable
          columns={columns}
          rows={rows}
          onRowClick={(row) => setSelected(row)}
          empty={
            applied === null
              ? '현황 구분을 선택하고 조회해 주세요.'
              : loading
                ? '불러오는 중입니다.'
                : '조회 조건에 맞는 임직원이 없습니다. 조건을 바꿔 다시 조회해 주세요.'
          }
        />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} /> : null}
      </section>
    </div>
  );
}
