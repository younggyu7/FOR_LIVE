import { useState } from 'react';
import {
  call,
  useData,
  Filters,
  Band,
  DataTable,
  Pager,
  Field,
  DateInput,
  Select,
  LookupSelect,
  Num,
  DateText,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

export default function FnSfr00809Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState('settlements');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [baseDate, setBaseDate] = useState('');
  const [accountSubjectId, setAccountSubjectId] = useState<number | string>('');
  const [partnerId, setPartnerId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    const path = tab === 'settlements' ? '/journal-settlements' : '/settlement-aging';
    return call<Page>('GET', path, role, undefined, { ...applied, page, size: 20 });
  }, [tab, applied, page, role]);

  function search() {
    if (!startDate || !endDate) {
      setFormError('조회 시작일과 종료일을 입력해 주세요.');
      return;
    }
    if (startDate > endDate) {
      setFormError('조회 기간이 올바르지 않습니다. 시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }
    setFormError('');
    const query: Row = { startDate, endDate, partnerId };
    if (tab === 'aging') {
      query.baseDate = baseDate;
      query.accountSubjectId = accountSubjectId;
    }
    setPage(0);
    setApplied(query);
    notify('조회 조건을 적용했습니다.');
  }

  function reset() {
    setStartDate('');
    setEndDate('');
    setBaseDate('');
    setAccountSubjectId('');
    setPartnerId('');
    setFormError('');
    setApplied(null);
    setPage(0);
  }

  function changeTab(value: string) {
    setTab(value);
    setApplied(null);
    setPage(0);
    setFormError('');
  }

  const settlementColumns = [
    { key: 'receivableLineId', label: '채권 분개라인 ID' },
    { key: 'payableLineId', label: '채무 분개라인 ID' },
    {
      key: 'partnerId',
      label: '거래처',
      render: (row: Row) => <RefName table="partner" role={role} value={row.partnerId} />,
    },
    {
      key: 'settlementAmount',
      label: '반제·상계 금액',
      render: (row: Row) => <Num value={row.settlementAmount} />,
    },
    {
      key: 'settledAt',
      label: '처리일시',
      render: (row: Row) => <DateText value={row.settledAt} time />,
    },
  ];

  const agingColumns = [
    {
      key: 'accountSubjectId',
      label: '계정과목',
      render: (row: Row) => <RefName table="account_subject" role={role} value={row.accountSubjectId} />,
    },
    { key: 'bucket', label: '연령 구간' },
    {
      key: 'balance',
      label: '반제 기준 잔액',
      render: (row: Row) => <Num value={row.balance} />,
    },
  ];

  return (
    <div>
      <h1>전표 반제 관리</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="조회 구분">
          <Select
            value={tab}
            onChange={changeTab}
            options={[
              ['settlements', '반제처리 현황'],
              ['aging', '반제 기준 연령분석'],
            ]}
          />
        </Field>
        <Field label="조회 시작일" required>
          <DateInput value={startDate} onChange={setStartDate} />
        </Field>
        <Field label="조회 종료일" required>
          <DateInput value={endDate} onChange={setEndDate} />
        </Field>
        {tab === 'aging' && (
          <Field label="연령분석 기준일" hint="비우면 조회 종료일을 기준으로 합니다.">
            <DateInput value={baseDate} onChange={setBaseDate} />
          </Field>
        )}
        {tab === 'aging' && (
          <Field label="계정과목">
            <LookupSelect
              table="account_subject"
              role={role}
              value={accountSubjectId}
              onChange={setAccountSubjectId}
              placeholder="전체"
            />
          </Field>
        )}
        <Field label="거래처">
          <LookupSelect
            table="partner"
            role={role}
            value={partnerId}
            onChange={setPartnerId}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {formError && <ErrorText text={formError} />}
      {error && <ErrorText text={error} />}
      {!applied && <p>조회 기간을 입력하고 조회 버튼을 눌러 주세요.</p>}
      {applied && (
        <div>
          <Band total={data ? data.total : 0} />
          <DataTable
            columns={tab === 'settlements' ? settlementColumns : agingColumns}
            rows={data ? data.items : []}
            empty={loading ? '불러오는 중입니다.' : '조건에 맞는 내역이 없습니다. 기간이나 거래처를 바꿔 다시 조회해 주세요.'}
          />
          {data && (
            <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />
          )}
        </div>
      )}
    </div>
  );
}
