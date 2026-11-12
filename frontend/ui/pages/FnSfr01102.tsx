import { useState } from 'react';
import {
  Band,
  DataTable,
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
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const REPORT_TYPES: [string, string][] = [
  ['감가상각비 현황', '감가상각비 현황'],
  ['고정자산 명세서', '고정자산 명세서'],
  ['변동 현황', '고정자산 변동 현황'],
  ['관리대장', '고정자산 관리대장'],
  ['미상각자산 감가상각 명세서', '미상각자산 감가상각 명세서'],
];

const BASIS_OPTIONS: [string, string][] = [
  ['전체', '전체'],
  ['월별', '월별'],
];

const PAGE_SIZE = 20;

export default function FnSfr01102Page({ role, notify }: PageProps) {
  const [reportType, setReportType] = useState('고정자산 명세서');
  const [basis, setBasis] = useState('전체');
  const [baseMonth, setBaseMonth] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [accountSubjectId, setAccountSubjectId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row>({ reportType: '고정자산 명세서', basis: '전체' });
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/asset-reports', role, undefined, { ...applied, page: pageNo, size: PAGE_SIZE }),
    [role, applied, pageNo],
  );

  const search = () => {
    if (reportType === '') {
      notify('조회 유형을 선택해 주세요.');
      return;
    }
    setPageNo(0);
    setApplied({ reportType, basis, baseMonth, assetCode, accountSubjectId });
  };

  const reset = () => {
    setReportType('고정자산 명세서');
    setBasis('전체');
    setBaseMonth('');
    setAssetCode('');
    setAccountSubjectId('');
    setPageNo(0);
    setApplied({ reportType: '고정자산 명세서', basis: '전체' });
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>자산 정보</h2>
          <Pairs
            items={[
              ['자산코드', String(selected.assetCode ?? '')],
              ['자산명', String(selected.assetName ?? '')],
              ['계정과목', <RefName table="account_subject" role={role} value={selected.accountSubjectId} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>취득·감가상각 정보</h2>
          <Pairs
            items={[
              ['취득일', <DateText value={selected.acquisitionDate} />],
              ['취득원가', <Num value={selected.acquisitionCost} />],
              ['감가상각 방법', String(selected.depreciationMethod ?? '')],
              ['내용연수(개월)', <Num value={selected.usefulLifeMonths} />],
              ['감가상각비', <Num value={selected.depreciationAmount} />],
              ['기간 중 증감 금액', <Num value={selected.changeAmount} />],
            ]}
          />
        </section>
      </div>
    );
  }

  const rows = data?.items ?? [];

  return (
    <div className="doc">
      <section className="box">
        <h2>고정자산 현황·명세 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 유형" required>
            <Select value={reportType} onChange={setReportType} options={REPORT_TYPES} placeholder="조회 유형 선택" />
          </Field>
          <Field label="조회 기준월 또는 기간" hint="예: 2025-03 또는 2025-01~2025-03">
            <TextInput value={baseMonth} onChange={setBaseMonth} placeholder="YYYY-MM" />
          </Field>
          {reportType === '감가상각비 현황' && (
            <Field label="감가상각비 현황 기준">
              <Select value={basis} onChange={setBasis} options={BASIS_OPTIONS} />
            </Field>
          )}
          <Field label="자산코드">
            <TextInput value={assetCode} onChange={setAssetCode} />
          </Field>
          <Field label="계정과목">
            <LookupSelect table="account_subject" role={role} value={accountSubjectId} onChange={setAccountSubjectId} />
          </Field>
        </Filters>
      </section>
      <section className="box">
        <h2>{reportType}</h2>
        <Band total={data?.total} />
        {error !== '' && <ErrorText text={error} />}
        {loading && <p>불러오는 중입니다.</p>}
        <DataTable
          columns={[
            { key: 'assetCode', label: '자산코드' },
            { key: 'assetName', label: '자산명' },
            {
              key: 'accountSubjectId',
              label: '계정과목',
              render: (r) => <RefName table="account_subject" role={role} value={r.accountSubjectId} />,
            },
            { key: 'acquisitionCost', label: '취득원가', render: (r) => <Num value={r.acquisitionCost} /> },
            { key: 'depreciationAmount', label: '감가상각비', render: (r) => <Num value={r.depreciationAmount} /> },
          ]}
          rows={rows}
          onRowClick={(r) => setSelected(r)}
          empty="조회 결과가 없습니다. 조회 조건을 바꿔 다시 조회해 주세요."
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? PAGE_SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
    </div>
  );
}
