import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Filters,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  Pager,
  RefName,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr00703Page({ role, notify }: PageProps) {
  const [accountId, setAccountId] = useState<number | string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isException, setIsException] = useState('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [mode, setMode] = useState<'collect' | 'settle' | null>(null);
  const [target, setTarget] = useState<Row | null>(null);

  const { data, error, reload } = useData<Page>(async () => {
    if (!applied) {
      return { items: [], page: 0, size: SIZE, total: 0 };
    }
    return call<Page>('GET', '/bank-transactions', role, undefined, {
      ...applied,
      page: pageNo,
      size: SIZE,
    });
  }, [applied, pageNo]);

  const search = () => {
    if (accountId === '' || !startDate || !endDate) {
      notify('거래처 계좌와 조회 기간을 모두 입력해 주세요.');
      return;
    }
    setPageNo(0);
    setApplied({ partnerAccountId: accountId, startDate, endDate, isException });
  };

  const reset = () => {
    setAccountId('');
    setStartDate('');
    setEndDate('');
    setIsException('');
    setPageNo(0);
    setApplied(null);
  };

  const close = () => {
    setMode(null);
    setTarget(null);
  };

  return (
    <div>
      <h1>은행계좌 거래내역</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="거래처 계좌 ID" required>
          <LookupSelect table="partner_account" role={role} value={accountId} onChange={setAccountId} />
        </Field>
        <Field label="조회 기간 시작일" required>
          <DateInput value={startDate} onChange={setStartDate} />
        </Field>
        <Field label="조회 기간 종료일" required>
          <DateInput value={endDate} onChange={setEndDate} />
        </Field>
        <Field label="예외 거래 여부">
          <Select
            value={isException}
            onChange={setIsException}
            options={[['true', '예외 거래'], ['false', '예외 아님']]}
            placeholder="전체"
          />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button type="button" onClick={() => setMode('collect')}>
          거래내역 수집
        </button>
      </Band>
      {error ? <p>{error}</p> : null}
      <DataTable
        rows={data?.items ?? []}
        empty={applied ? '조회된 거래내역이 없습니다.' : '거래처 계좌와 기간을 입력한 뒤 조회해 주세요.'}
        columns={[
          { key: 'transactionAt', label: '거래일시', render: (r) => <DateText value={r.transactionAt} time /> },
          {
            key: 'amount',
            label: '입금액 / 출금액',
            render: (r) => (
              <span>
                <Num value={r.depositAmount} /> / <Num value={r.withdrawalAmount} />
              </span>
            ),
          },
          { key: 'summary', label: '적요' },
          {
            key: 'isException',
            label: '처리 상태',
            render: (r) => (
              <Badge value={r.isJournalized ? '전표처리 완료' : r.isException ? '예외 거래' : '대기'} />
            ),
          },
          {
            key: 'action',
            label: '반제 처리',
            render: (r) =>
              r.isException && !r.isJournalized ? (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    setTarget(r);
                    setMode('settle');
                  }}
                >
                  반제 처리
                </button>
              ) : null,
          },
        ]}
      />
      <Pager page={data?.page ?? 0} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      {mode === 'collect' ? (
        <Drawer title="거래내역 수집" onClose={close}>
          <CollectForm
            role={role}
            initAccount={accountId}
            initStart={startDate}
            initEnd={endDate}
            onDone={(text) => {
              notify(text);
              close();
              reload();
            }}
          />
        </Drawer>
      ) : null}
      {mode === 'settle' && target ? (
        <Drawer title="예외 거래내역 반제 처리" onClose={close}>
          <SettleForm
            role={role}
            target={target}
            onDone={() => {
              notify('반제 처리했습니다.');
              close();
              reload();
            }}
          />
        </Drawer>
      ) : null}
    </div>
  );
}

function CollectForm({
  role,
  initAccount,
  initStart,
  initEnd,
  onDone,
}: {
  role: string;
  initAccount: number | string;
  initStart: string;
  initEnd: string;
  onDone: (text: string) => void;
}) {
  const [account, setAccount] = useState<number | string>(initAccount);
  const [start, setStart] = useState(initStart);
  const [end, setEnd] = useState(initEnd);
  return (
    <Form
      submit="수집"
      note="금융기관 API로 거래내역을 수집하고 자동분개 설정과 일치하는 거래는 자동전표로 처리합니다."
      onSubmit={async () => {
        if (account === '' || !start || !end) {
          throw new Error('거래처 계좌와 수집 기간을 모두 입력해 주세요.');
        }
        const res = await call('POST', '/bank-transactions/collect', role, {
          partnerAccountId: account,
          startDate: start,
          endDate: end,
        });
        onDone(
          '수집 ' + String(res.collectedCount) +
            '건, 자동전표 ' + String(res.journalizedCount) +
            '건, 예외 ' + String(res.exceptionCount) + '건을 처리했습니다.',
        );
      }}
    >
      <Field label="거래처 계좌 ID" required>
        <LookupSelect table="partner_account" role={role} value={account} onChange={setAccount} />
      </Field>
      <Field label="수집 기간 시작일" required>
        <DateInput value={start} onChange={setStart} />
      </Field>
      <Field label="수집 기간 종료일" required>
        <DateInput value={end} onChange={setEnd} />
      </Field>
    </Form>
  );
}

function SettleForm({
  role,
  target,
  onDone,
}: {
  role: string;
  target: Row;
  onDone: () => void;
}) {
  const [receivable, setReceivable] = useState<number | string>('');
  const [payable, setPayable] = useState<number | string>('');
  const [partnerId, setPartnerId] = useState<number | string>('');
  const [amount, setAmount] = useState<number | string>('');
  const [memo, setMemo] = useState('');
  return (
    <Form
      submit="반제 처리"
      note="반제 처리한 거래내역은 전표 처리 완료가 되어 다시 처리할 수 없습니다."
      onSubmit={async () => {
        if (receivable === '' || payable === '' || partnerId === '' || amount === '') {
          throw new Error('채권 분개라인, 채무 분개라인, 거래처, 반제·상계 금액을 모두 입력해 주세요.');
        }
        await call('POST', '/journal-settlements', role, {
          bankTransactionId: target.bankTransactionId,
          receivableLineId: receivable,
          payableLineId: payable,
          partnerId,
          settlementAmount: amount,
          memo,
        });
        onDone();
      }}
    >
      <Pairs2 target={target} />
      <Field label="채권 분개라인 ID" required>
        <LookupSelect table="journal_entry_line" role={role} value={receivable} onChange={setReceivable} />
      </Field>
      <Field label="채무 분개라인 ID" required>
        <LookupSelect table="journal_entry_line" role={role} value={payable} onChange={setPayable} />
      </Field>
      <Field label="거래처 ID" required>
        <LookupSelect table="partner" role={role} value={partnerId} onChange={setPartnerId} />
      </Field>
      <Field label="반제·상계 금액" required>
        <NumberInput value={amount} onChange={setAmount} />
      </Field>
      <Field label="처리 내용" wide>
        <TextInput value={memo} onChange={setMemo} multiline />
      </Field>
    </Form>
  );
}

function Pairs2({ target }: { target: Row }) {
  return (
    <p>
      <DateText value={target.transactionAt} time /> · {String(target.summary ?? '')} · 입금 <Num value={target.depositAmount} /> / 출금 <Num value={target.withdrawalAmount} />
    </p>
  );
}
