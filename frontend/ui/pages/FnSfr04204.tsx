import { useState } from 'react';
import {
  call,
  useData,
  Num,
  Filters,
  Band,
  DataTable,
  Pager,
  Field,
  DateInput,
  Select,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const SIZE = 20;

const CRITERIA_OPTIONS: [string, string][] = [
  ['심사일자', '심사일자'],
  ['결의일자', '결의일자'],
  ['항목별', '항목별'],
  ['지역별', '지역별'],
  ['품단계', '품단계'],
];

const CONDITION_OPTIONS: [string, string][] = [
  ['REVIEW', '심사'],
  ['REISSUE', '재발급'],
];

const FEE_TYPE_NAMES: Record<string, string> = {
  REVIEW: '심사',
  REISSUE: '재발급',
};

interface Applied {
  criteria: string;
  fromDate: string;
  toDate: string;
  condition: string;
}

export default function FnSfr04204Page({ role, notify }: PageProps) {
  const [criteria, setCriteria] = useState('심사일자');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [condition, setCondition] = useState('');
  const [applied, setApplied] = useState<Applied | null>(null);
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    return call<Page>('GET', '/fee-records/review-status', role, undefined, {
      criteria: applied.criteria,
      fromDate: applied.fromDate,
      toDate: applied.toDate,
      condition: applied.condition,
      page,
      size: SIZE,
    });
  }, [applied, page, role]);

  function search() {
    if (!criteria) {
      setFormError('조회 기준을 선택해 주세요.');
      return;
    }
    if (!fromDate || !toDate) {
      setFormError('조회 시작일과 종료일을 모두 입력해 주세요.');
      return;
    }
    if (fromDate > toDate) {
      setFormError('조회 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setFormError('');
    setPage(0);
    setApplied({ criteria, fromDate, toDate, condition });
  }

  function reset() {
    setCriteria('심사일자');
    setFromDate('');
    setToDate('');
    setCondition('');
    setFormError('');
    setPage(0);
    setApplied(null);
  }

  const rows: Row[] = data ? data.items : [];
  const isItemCriteria = applied?.criteria === '항목별';

  return (
    <div className="doc">
      <section className="box">
        <h2>심사현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 기준" required>
            <Select value={criteria} onChange={setCriteria} options={CRITERIA_OPTIONS} placeholder="선택" />
          </Field>
          <Field label="조회 시작일" required>
            <DateInput value={fromDate} onChange={setFromDate} />
          </Field>
          <Field label="조회 종료일" required>
            <DateInput value={toDate} onChange={setToDate} />
          </Field>
          <Field label="추가 조건" hint="수수료 구분으로 좁혀 볼 수 있습니다.">
            <Select value={condition} onChange={setCondition} options={CONDITION_OPTIONS} placeholder="전체" />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>현황 목록</h2>
        {!applied ? (
          <p>조회 기준과 기간을 입력한 뒤 조회해 주세요.</p>
        ) : (
          <>
            <Band total={data ? data.total : 0} />
            <DataTable
              columns={[
                {
                  key: 'groupKey',
                  label: '집계 기준 값',
                  render: (row: Row) =>
                    isItemCriteria
                      ? FEE_TYPE_NAMES[String(row['groupKey'])] ?? String(row['groupKey'] ?? '')
                      : String(row['groupKey'] ?? ''),
                },
                { key: 'reviewCount', label: '심사 건수', render: (row: Row) => <Num value={row['reviewCount']} /> },
                { key: 'feeAmount', label: '수수료 금액', render: (row: Row) => <Num value={row['feeAmount']} /> },
              ]}
              rows={rows}
              empty={loading ? '불러오는 중입니다.' : '조회 결과가 없습니다. 조회 기준이나 기간을 바꿔 다시 조회해 주세요.'}
            />
            <Pager page={page} size={SIZE} total={data ? data.total : 0} onPage={setPage} />
          </>
        )}
      </section>
    </div>
  );
}
