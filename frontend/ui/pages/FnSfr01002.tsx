import { useState } from 'react';
import {
  Band,
  DataTable,
  DateText,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const STATEMENT_TYPES: [string, string][] = [
  ['합계잔액시산표', '합계잔액시산표'],
  ['원가보고서', '원가보고서'],
  ['손익계산서', '손익계산서'],
  ['이익잉여금처분계산서', '이익잉여금처분계산서'],
  ['재무상태표', '재무상태표'],
  ['자본변동표', '자본변동표'],
  ['현금흐름표', '현금흐름표'],
  ['결산부속명세서', '결산부속명세서'],
  ['기간비용 현황', '기간비용 현황'],
];

export default function FnSfr01002Page({ role, notify }: PageProps) {
  const [statementType, setStatementType] = useState('');
  const [startPeriod, setStartPeriod] = useState('');
  const [endPeriod, setEndPeriod] = useState('');
  const [unitId, setUnitId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const size = 20;

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    return call<Page>('GET', '/financial-statements', role, undefined, {
      ...applied,
      page: pageNo,
      size,
    });
  }, [applied, pageNo, role]);

  function search() {
    if (statementType === '' || startPeriod.trim() === '' || endPeriod.trim() === '') {
      notify('재무제표 종류와 조회 기간을 모두 입력해 주세요.');
      return;
    }
    setPageNo(0);
    setApplied({
      statementType,
      startPeriod: startPeriod.trim(),
      endPeriod: endPeriod.trim(),
      accountingUnitId: unitId,
    });
  }

  function reset() {
    setStatementType('');
    setStartPeriod('');
    setEndPeriod('');
    setUnitId('');
    setApplied(null);
    setPageNo(0);
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>주요 재무제표 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="재무제표 종류" required>
            <Select
              value={statementType}
              onChange={setStatementType}
              options={STATEMENT_TYPES}
            />
          </Field>
          <Field label="조회 시작 회계기간" required hint="YYYY-MM 형식">
            <TextInput value={startPeriod} onChange={setStartPeriod} placeholder="2024-01" />
          </Field>
          <Field label="조회 종료 회계기간" required hint="YYYY-MM 형식">
            <TextInput value={endPeriod} onChange={setEndPeriod} placeholder="2024-12" />
          </Field>
          <Field label="회계단위">
            <LookupSelect
              table="accounting_unit"
              role={role}
              value={unitId}
              onChange={setUnitId}
              placeholder="전체"
            />
          </Field>
        </Filters>
      </section>
      <section className="box">
        <h2>{applied ? String(applied['statementType']) : '조회 결과'}</h2>
        {!applied && <p>재무제표 종류와 기간을 선택한 뒤 조회해 주세요.</p>}
        {applied && error !== '' && <p>{error}</p>}
        {applied && error === '' && (
          <>
            <Band total={data?.total} />
            <DataTable
              columns={[
                { key: 'accountSubjectId', label: '계정과목 ID' },
                { key: 'accountSubjectName', label: '계정과목 명칭' },
                {
                  key: 'amount',
                  label: '계정과목별 금액',
                  render: (row: Row) => <Num value={row['amount']} />,
                },
              ]}
              rows={data?.items ?? []}
              empty={loading ? '불러오는 중입니다.' : '조회 조건에 해당하는 데이터가 없습니다. 기간이나 재무제표 종류를 바꿔 다시 조회해 주세요.'}
            />
            <Pager
              page={pageNo}
              size={size}
              total={data?.total ?? 0}
              onPage={setPageNo}
            />
            <p>
              조회 기간 <DateText value={applied['startPeriod']} /> ~ <DateText value={applied['endPeriod']} />
            </p>
          </>
        )}
      </section>
    </div>
  );
}
