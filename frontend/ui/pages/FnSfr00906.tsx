import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  DateInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const LOAN_TYPE_OPTIONS: [string, string][] = [
  ['BORROWING', '차입금'],
  ['LENDING', '대여금'],
];

const TRANSACTION_TYPE_NAMES: Record<string, string> = {
  OCCURRENCE: '발생',
  REPAYMENT: '상환',
  INTEREST: '이자',
};

const EMPTY_PAGE: Page = { items: [], page: 0, size: 20, total: 0 };

export default function FnSfr00906Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<'statement' | 'ledger'>('statement');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loanType, setLoanType] = useState('');
  const [partnerId, setPartnerId] = useState<number | string>('');
  const [loanId, setLoanId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [target, setTarget] = useState<Row | null>(null);
  const [message, setMessage] = useState('');

  const { data, error, loading, reload } = useData<Page>(async () => {
    if (applied === null) {
      return EMPTY_PAGE;
    }
    const path = mode === 'statement' ? '/loan-statements' : '/loan-transactions';
    return call<Page>('GET', path, role, undefined, { ...applied, page: pageNo });
  }, [applied, pageNo, mode, role]);

  const search = () => {
    if (startDate === '' || endDate === '') {
      setMessage('조회 시작일과 종료일을 입력해 주세요.');
      return;
    }
    if (mode === 'statement' && loanType === '') {
      setMessage('구분을 선택해 주세요.');
      return;
    }
    setMessage('');
    setPageNo(0);
    setApplied({
      startDate,
      endDate,
      loanType,
      partnerId,
      loanId: mode === 'ledger' ? loanId : '',
    });
  };

  const reset = () => {
    setStartDate('');
    setEndDate('');
    setLoanType('');
    setPartnerId('');
    setLoanId('');
    setMessage('');
    setApplied(null);
    setPageNo(0);
  };

  const switchMode = (next: 'statement' | 'ledger') => {
    setMode(next);
    setApplied(null);
    setPageNo(0);
    setMessage('');
  };

  const openLedger = (row: Row) => {
    setLoanId(row['loanId'] as number);
    setMode('ledger');
    setPageNo(0);
    setMessage('');
    setApplied({ startDate, endDate, loanType, partnerId, loanId: row['loanId'] });
  };

  const processVoucher = async () => {
    if (target === null) {
      return;
    }
    const path = '/loans/{loanId}/process-voucher'.replace('{loanId}', String(target['loanId']));
    await call('POST', path, role, {});
    notify('전표처리를 했습니다.');
    setTarget(null);
    reload();
  };

  const statementColumns = [
    { key: 'partnerId', label: '거래처', render: (r: Row) => <RefName table="partner" role={role} value={r['partnerId']} /> },
    { key: 'principalAmount', label: '원금', render: (r: Row) => <Num value={r['principalAmount']} /> },
    { key: 'repaidAmount', label: '상환 합계', render: (r: Row) => <Num value={r['repaidAmount']} /> },
    { key: 'balance', label: '잔액', render: (r: Row) => <Num value={r['balance']} /> },
    {
      key: 'voucherStatus',
      label: '전표처리 상태',
      render: (r: Row) => (
        <span>
          <Badge value={r['voucherStatus']} />
          {r['voucherStatus'] === '미처리' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setTarget(r);
              }}
            >
              전표처리
            </button>
          ) : null}
        </span>
      ),
    },
  ];

  const ledgerColumns = [
    {
      key: 'transactionType',
      label: '거래 유형',
      render: (r: Row) => <span>{TRANSACTION_TYPE_NAMES[String(r['transactionType'])] ?? String(r['transactionType'])}</span>,
    },
    { key: 'transactionDate', label: '거래일', render: (r: Row) => <DateText value={r['transactionDate']} /> },
    { key: 'amount', label: '거래금액', render: (r: Row) => <Num value={r['amount']} /> },
    { key: 'balanceAfter', label: '거래 후 잔액', render: (r: Row) => <Num value={r['balanceAfter']} /> },
    { key: 'memo', label: '적요' },
  ];

  const list = data ?? EMPTY_PAGE;

  return (
    <div className="doc">
      <section className="box">
        <h2>{mode === 'statement' ? '차입금·대여금 명세서' : '차입금·대여금 원장'}</h2>
        <div>
          <button type="button" className={mode === 'statement' ? '' : 'ghost'} onClick={() => switchMode('statement')}>
            명세서
          </button>
          <button type="button" className={mode === 'ledger' ? '' : 'ghost'} onClick={() => switchMode('ledger')}>
            원장
          </button>
        </div>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 시작일" required>
            <DateInput value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="조회 종료일" required>
            <DateInput value={endDate} onChange={setEndDate} />
          </Field>
          <Field label="구분" required={mode === 'statement'}>
            <Select value={loanType} onChange={setLoanType} options={LOAN_TYPE_OPTIONS} />
          </Field>
          <Field label="거래처">
            <LookupSelect table="partner" role={role} value={partnerId} onChange={setPartnerId} />
          </Field>
        </Filters>
        {message !== '' ? <ErrorText text={message} /> : null}
        {error !== '' ? <ErrorText text={error} /> : null}
        <Band total={list.total} />
        {mode === 'statement' ? (
          <DataTable
            columns={statementColumns}
            rows={list.items}
            onRowClick={openLedger}
            empty={loading ? '불러오는 중입니다.' : '조건을 입력해 조회하면 명세서가 나타납니다.'}
          />
        ) : (
          <DataTable
            columns={ledgerColumns}
            rows={list.items}
            empty={loading ? '불러오는 중입니다.' : '조건을 입력해 조회하면 원장이 나타납니다.'}
          />
        )}
        <Pager page={list.page} size={list.size} total={list.total} onPage={setPageNo} />
      </section>
      {target !== null ? (
        <Drawer title="전표처리" onClose={() => setTarget(null)}>
          <Pairs
            items={[
              ['거래처', <RefName table="partner" role={role} value={target['partnerId']} />],
              ['원금', <Num value={target['principalAmount']} />],
              ['전표처리 상태', <Badge value={target['voucherStatus']} />],
            ]}
          />
          <Form
            onSubmit={processVoucher}
            submit="전표처리"
            note="전표처리를 하면 전표가 만들어지고 처리 상태가 처리완료로 바뀝니다. 같은 건을 다시 처리할 수 없습니다."
          />
        </Drawer>
      ) : null}
    </div>
  );
}
