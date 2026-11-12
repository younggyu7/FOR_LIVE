import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  NumberInput,
  DateInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

export default function FnSfr00808Page({ role, notify }: PageProps) {
  const [view, setView] = useState('balances');
  const [baseDate, setBaseDate] = useState('');
  const [partnerId, setPartnerId] = useState<unknown>('');
  const [accountSubjectId, setAccountSubjectId] = useState<unknown>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState('');
  const [settling, setSettling] = useState(false);
  const [bankTransactionId, setBankTransactionId] = useState<unknown>('');
  const [receivableLineId, setReceivableLineId] = useState<unknown>('');
  const [payableLineId, setPayableLineId] = useState<unknown>('');
  const [settlePartnerId, setSettlePartnerId] = useState<unknown>('');
  const [settlementAmount, setSettlementAmount] = useState<unknown>('');
  const [memo, setMemo] = useState('');

  const path = view === 'aging' ? '/receivable-aging' : '/partner-balances';

  const list = useData<Page>(async () => {
    if (!applied) {
      return { items: [], page: 0, size: SIZE, total: 0 };
    }
    return call<Page>('GET', path, role, undefined, { ...applied, page, size: SIZE });
  }, [applied, page, path, role]);

  function search() {
    setFormError('');
    if (!baseDate) {
      setFormError('기준일자를 입력해 주세요.');
      return;
    }
    setPage(0);
    setApplied({ baseDate, partnerId, accountSubjectId });
  }

  function reset() {
    setBaseDate('');
    setPartnerId('');
    setAccountSubjectId('');
    setApplied(null);
    setPage(0);
    setFormError('');
  }

  function openSettle(row?: Row) {
    setBankTransactionId('');
    setReceivableLineId('');
    setPayableLineId('');
    setSettlePartnerId(row ? row['partnerId'] : '');
    setSettlementAmount('');
    setMemo('');
    setSettling(true);
  }

  async function submitSettle() {
    if (
      bankTransactionId === '' ||
      receivableLineId === '' ||
      payableLineId === '' ||
      settlePartnerId === '' ||
      settlementAmount === ''
    ) {
      throw new Error('거래내역, 채권·채무 분개라인, 거래처, 상계 금액을 모두 입력해 주세요.');
    }
    await call('POST', '/journal-settlements', role, {
      bankTransactionId,
      receivableLineId,
      payableLineId,
      partnerId: settlePartnerId,
      settlementAmount,
      memo,
    });
    notify('상계 처리를 완료했습니다.');
    setSettling(false);
    list.reload();
  }

  const agingColumns = [
    { key: 'partnerId', label: '거래처', render: (row: Row) => <RefName table="partner" role={role} value={row['partnerId']} /> },
    { key: 'bucket', label: '연령 구간', render: (row: Row) => <Badge value={row['bucket']} /> },
    { key: 'balance', label: '구간별 채권 잔액', render: (row: Row) => <Num value={row['balance']} /> },
  ];

  const balanceColumns = [
    { key: 'partnerId', label: '거래처', render: (row: Row) => <RefName table="partner" role={role} value={row['partnerId']} /> },
    { key: 'receivableBalance', label: '채권 잔액', render: (row: Row) => <Num value={row['receivableBalance']} /> },
    { key: 'payableBalance', label: '채무 잔액', render: (row: Row) => <Num value={row['payableBalance']} /> },
    {
      key: 'action',
      label: '처리',
      render: (row: Row) =>
        Number(row['receivableBalance']) > 0 && Number(row['payableBalance']) > 0 ? (
          <button className="ghost" onClick={() => openSettle(row)}>
            상계
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <h1>채권·채무 관리</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="조회 구분">
          <Select
            value={view}
            onChange={(v) => {
              setView(v);
              setPage(0);
            }}
            options={[
              ['balances', '거래처별 잔액'],
              ['aging', '채권 연령분석'],
            ]}
            placeholder="선택"
          />
        </Field>
        <Field label="기준일자" required>
          <DateInput value={baseDate} onChange={setBaseDate} />
        </Field>
        <Field label="거래처 ID">
          <LookupSelect table="partner" role={role} value={partnerId} onChange={setPartnerId} placeholder="전체" />
        </Field>
        <Field label="계정과목 ID">
          <LookupSelect
            table="account_subject"
            role={role}
            value={accountSubjectId}
            onChange={setAccountSubjectId}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {formError ? <ErrorText text={formError} /> : null}
      {list.error ? <ErrorText text={list.error} /> : null}
      <Band total={list.data ? list.data.total : 0}>
        <button onClick={() => openSettle()}>상계 처리</button>
      </Band>
      <DataTable
        columns={view === 'aging' ? agingColumns : balanceColumns}
        rows={list.data ? list.data.items : []}
        empty={applied ? '조회된 내역이 없습니다.' : '기준일자를 입력하고 조회해 주세요.'}
      />
      <Pager page={page} size={SIZE} total={list.data ? list.data.total : 0} onPage={setPage} />
      {settling ? (
        <Drawer title="채권·채무 상계 처리" onClose={() => setSettling(false)}>
          <Form
            onSubmit={submitSettle}
            submit="상계 처리"
            danger
            note="처리하면 선택한 채권과 채무의 잔액이 줄어들고, 처리 이력이 남습니다."
          >
            <Field label="반제할 예외 거래내역 ID" required>
              <NumberInput value={bankTransactionId} onChange={setBankTransactionId} />
            </Field>
            <Field label="거래처 ID" required>
              <LookupSelect table="partner" role={role} value={settlePartnerId} onChange={setSettlePartnerId} />
            </Field>
            <Field label="채권 분개라인 ID" required>
              <LookupSelect
                table="journal_entry_line"
                role={role}
                value={receivableLineId}
                onChange={setReceivableLineId}
              />
            </Field>
            <Field label="채무 분개라인 ID" required>
              <LookupSelect
                table="journal_entry_line"
                role={role}
                value={payableLineId}
                onChange={setPayableLineId}
              />
            </Field>
            <Field label="반제·상계 금액" required>
              <NumberInput value={settlementAmount} onChange={setSettlementAmount} />
            </Field>
            <Field label="처리 내용" wide>
              <TextInput value={memo} onChange={setMemo} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
