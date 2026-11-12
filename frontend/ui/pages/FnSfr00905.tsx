import { useState } from 'react';
import {
  call,
  useData,
  Filters,
  Field,
  Band,
  DataTable,
  Pager,
  Tiles,
  Num,
  DateInput,
  Select,
  LookupSelect,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const STATUS_TYPES: [string, string][] = [
  ['PLAN_VS_ACTUAL', '자금계획 대비 실적'],
  ['FUND_PL', '자금손익현황'],
  ['JOURNAL', '일일자금 및 분개현황'],
  ['BILL', '어음현황'],
  ['DEPOSIT_SAVINGS', '예·적금 현황'],
  ['SECURITIES', '유가증권명세서'],
  ['FOREIGN_CURRENCY', '외화명세서'],
];

const SCOPES: [string, string][] = [
  ['전체', '전체'],
  ['부서', '부서'],
  ['개인', '개인'],
];

interface Applied {
  statusType: string;
  startDate: string;
  endDate: string;
  scope: string;
  partnerId: number | string;
  partnerAccountId: number | string;
}

export default function FnSfr00905Page({ role, notify }: PageProps) {
  const [statusType, setStatusType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [scope, setScope] = useState('');
  const [partnerId, setPartnerId] = useState<number | string>('');
  const [partnerAccountId, setPartnerAccountId] = useState<number | string>('');
  const [applied, setApplied] = useState<Applied | null>(null);
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (applied === null) return undefined;
    const result = await call<Page>('GET', '/fund-statuses', role, undefined, {
      statusType: applied.statusType,
      startDate: applied.startDate,
      endDate: applied.endDate,
      scope: applied.scope,
      partnerId: applied.partnerId,
      partnerAccountId: applied.partnerAccountId,
      page,
    });
    return result;
  }, [applied, page]);

  const search = () => {
    if (statusType === '' || startDate === '' || endDate === '') {
      setFormError('현황 종류와 조회 기간을 모두 입력해 주세요.');
      return;
    }
    if (startDate > endDate) {
      setFormError('조회 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setFormError('');
    setPage(0);
    setApplied({ statusType, startDate, endDate, scope, partnerId, partnerAccountId });
  };

  const reset = () => {
    setStatusType('');
    setStartDate('');
    setEndDate('');
    setScope('');
    setPartnerId('');
    setPartnerAccountId('');
    setFormError('');
    setPage(0);
    setApplied(null);
  };

  const rows: Row[] = data ? data.items : [];
  const totalAmount = rows.length > 0 ? rows[0]['totalAmount'] : 0;

  return (
    <div className="doc">
      <section className="box">
        <h2>자금현황 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="현황 종류" required>
            <Select value={statusType} onChange={setStatusType} options={STATUS_TYPES} />
          </Field>
          <Field label="조회 시작일" required>
            <DateInput value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="조회 종료일" required>
            <DateInput value={endDate} onChange={setEndDate} />
          </Field>
          <Field label="조회 범위 (전체/부서/개인)">
            <Select value={scope} onChange={setScope} options={SCOPES} placeholder="선택 안 함" />
          </Field>
          <Field label="거래처 ID">
            <LookupSelect table="partner" role={role} value={partnerId} onChange={setPartnerId} />
          </Field>
          <Field label="거래처 계좌 ID">
            <LookupSelect
              table="partner_account"
              role={role}
              value={partnerAccountId}
              onChange={setPartnerAccountId}
            />
          </Field>
        </Filters>
        {formError !== '' && <ErrorText text={formError} />}
        {error !== '' && <ErrorText text={error} />}
      </section>
      <section className="box">
        <h2>조회 결과</h2>
        {applied === null ? (
          <p>현황 종류와 조회 기간을 선택한 뒤 조회해 주세요.</p>
        ) : (
          <>
            <Tiles items={[['합계', <Num value={totalAmount} />]]} />
            <Band total={data ? data.total : 0} />
            <DataTable
              columns={[
                { key: 'itemName', label: '현황 항목명' },
                { key: 'amount', label: '항목 금액', render: (r) => <Num value={r['amount']} /> },
                { key: 'planAmount', label: '자금수지계획 금액', render: (r) => <Num value={r['planAmount']} /> },
                { key: 'actualAmount', label: '실적 금액', render: (r) => <Num value={r['actualAmount']} /> },
                {
                  key: 'differenceAmount',
                  label: '계획 대비 실적 차이',
                  render: (r) => <Num value={r['differenceAmount']} />,
                },
              ]}
              rows={rows}
              empty={loading ? '불러오는 중입니다.' : '조회 결과가 없습니다. 조건을 바꿔 다시 조회해 주세요.'}
            />
            {data && (
              <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
            )}
          </>
        )}
      </section>
    </div>
  );
}
