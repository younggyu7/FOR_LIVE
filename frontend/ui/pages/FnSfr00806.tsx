import { useState } from 'react';
import {
  Band,
  call,
  DataTable,
  DateInput,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  RefName,
  Select,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const EMPTY_PAGE: Page = { items: [], page: 0, size: 20, total: 0 };

export default function FnSfr00806Page({ role, notify }: PageProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [partnerId, setPartnerId] = useState<number | string>('');
  const [accountSubjectId, setAccountSubjectId] = useState<number | string>('');
  const [aggregationUnit, setAggregationUnit] = useState('월별');
  const [applied, setApplied] = useState<Row | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page>(async () => {
    if (!applied) {
      return EMPTY_PAGE;
    }
    return call<Page>('GET', '/partner-ledgers', role, undefined, { ...applied, page: pageNo, size: 20 });
  }, [applied, pageNo, role]);

  const search = () => {
    if (!fromDate || !toDate) {
      setFormError('조회 시작일과 종료일을 입력해 주세요.');
      return;
    }
    if (fromDate > toDate) {
      setFormError('조회 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setFormError('');
    setPageNo(0);
    setApplied({ fromDate, toDate, partnerId, accountSubjectId, aggregationUnit });
    notify('거래처별 장부를 조회했습니다.');
  };

  const reset = () => {
    setFromDate('');
    setToDate('');
    setPartnerId('');
    setAccountSubjectId('');
    setAggregationUnit('월별');
    setFormError('');
    setPageNo(0);
    setApplied(null);
  };

  const rows = data ? data.items : [];
  const total = data ? data.total : 0;

  return (
    <div className="doc">
      <section className="box">
        <h2>거래처별 장부 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 시작 일자" required>
            <DateInput value={fromDate} onChange={setFromDate} />
          </Field>
          <Field label="조회 종료 일자" required>
            <DateInput value={toDate} onChange={setToDate} />
          </Field>
          <Field label="거래처 ID">
            <LookupSelect table="partner" role={role} value={partnerId} onChange={setPartnerId} placeholder="전체 거래처" />
          </Field>
          <Field label="계정과목 ID">
            <LookupSelect
              table="account_subject"
              role={role}
              value={accountSubjectId}
              onChange={setAccountSubjectId}
              placeholder="전체 계정과목"
            />
          </Field>
          <Field label="일별 또는 월별">
            <Select
              value={aggregationUnit}
              onChange={setAggregationUnit}
              options={[['일별', '일별'], ['월별', '월별']]}
              placeholder="집계 단위"
            />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>거래처 원장</h2>
        <Band total={total} />
        <DataTable
          columns={[
            { key: 'aggregationPeriod', label: '일 또는 월 집계 구간' },
            {
              key: 'partnerId',
              label: '거래처 ID',
              render: (row) => <RefName table="partner" role={role} value={row['partnerId']} />,
            },
            {
              key: 'accountSubjectId',
              label: '계정과목 ID',
              render: (row) => <RefName table="account_subject" role={role} value={row['accountSubjectId']} />,
            },
            {
              key: 'debitAmount',
              label: '차변 금액 / 대변 금액',
              render: (row) => (
                <span>
                  <Num value={row['debitAmount']} /> / <Num value={row['creditAmount']} />
                </span>
              ),
            },
            { key: 'balance', label: '거래처별 잔액', render: (row) => <Num value={row['balance']} /> },
          ]}
          rows={rows}
          empty={
            applied
              ? '조건에 맞는 장부 내역이 없습니다. 기간이나 거래처를 바꿔 다시 조회해 보세요.'
              : '조회 기간을 입력하고 조회를 눌러 주세요.'
          }
        />
        {loading ? <p>불러오는 중입니다.</p> : null}
        <Pager page={pageNo} size={data ? data.size : 20} total={total} onPage={setPageNo} />
      </section>
    </div>
  );
}
