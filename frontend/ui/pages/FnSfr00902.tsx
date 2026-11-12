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
  Form,
  Field,
  NumberInput,
  DateInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;
const CYCLE_OPTIONS: [string, string][] = [['월', '월'], ['분기', '분기'], ['연', '연']];
const USE_OPTIONS: [string, string][] = [['사용', '사용'], ['미사용', '미사용']];

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; row: Row }
  | { kind: 'delete'; row: Row }
  | null;

export default function FnSfr00902Page({ role, notify }: PageProps) {
  const [fundSubjectId, setFundSubjectId] = useState<number | string>('');
  const [useStatus, setUseStatus] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<Mode>(null);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/fixed-funds', role, undefined, { ...applied, page, size: SIZE }),
    [role, applied, page],
  );

  const search = () => {
    setPage(0);
    setApplied({ fundSubjectId, useStatus });
  };

  const reset = () => {
    setFundSubjectId('');
    setUseStatus('');
    setPage(0);
    setApplied({});
  };

  const toggleUse = async (row: Row) => {
    const next = row['useStatus'] === '사용' ? '미사용' : '사용';
    try {
      await call('PATCH', '/fixed-funds/' + String(row['fixedFundId']), role, { useStatus: next });
      notify('사용 여부를 변경했습니다.');
      reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : '처리하지 못했습니다.');
    }
  };

  const columns = [
    {
      key: 'fundSubjectId',
      label: '자금과목',
      render: (r: Row) => <RefName table={'fund_subject'} role={role} value={r['fundSubjectId']} />,
    },
    {
      key: 'partnerId',
      label: '거래처',
      render: (r: Row) => (r['partnerId'] ? <RefName table={'partner'} role={role} value={r['partnerId']} /> : <span>-</span>),
    },
    {
      key: 'amount',
      label: '금액',
      render: (r: Row) => (
        <span>
          <Num value={r['amount']} /> ({String(r['cycle'])})
        </span>
      ),
    },
    {
      key: 'startDate',
      label: '적용 기간',
      render: (r: Row) => (
        <span>
          <DateText value={r['startDate']} /> ~ {r['endDate'] ? <DateText value={r['endDate']} /> : '종료일 미정'}
        </span>
      ),
    },
    {
      key: 'useStatus',
      label: '사용 여부',
      render: (r: Row) => <Badge value={r['useStatus']} />,
    },
    {
      key: 'actions',
      label: '관리',
      render: (r: Row) => (
        <span>
          <button className={'ghost'} onClick={(e) => { e.stopPropagation(); setMode({ kind: 'edit', row: r }); }}>수정</button>
          <button className={'ghost'} onClick={(e) => { e.stopPropagation(); void toggleUse(r); }}>
            {r['useStatus'] === '사용' ? '미사용으로 변경' : '사용으로 변경'}
          </button>
          <button className={'ghost'} onClick={(e) => { e.stopPropagation(); setMode({ kind: 'delete', row: r }); }}>삭제</button>
        </span>
      ),
    },
  ];

  const close = () => setMode(null);
  const done = (text: string) => {
    notify(text);
    close();
    reload();
  };

  return (
    <div className={'doc'}>
      <h2>고정자금 관리</h2>
      <Filters onSearch={search} onReset={reset}>
        <Field label={'자금과목'}>
          <LookupSelect table={'fund_subject'} role={role} value={fundSubjectId} onChange={setFundSubjectId} />
        </Field>
        <Field label={'사용 여부'}>
          <Select value={useStatus} onChange={setUseStatus} options={USE_OPTIONS} />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={() => setMode({ kind: 'create' })}>고정자금 등록</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      {loading && !data ? <p>불러오는 중입니다.</p> : null}
      <DataTable columns={columns} rows={data?.items ?? []} empty={'아직 등록한 고정자금이 없습니다. 고정자금 등록 버튼으로 시작해 주세요.'} />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      {mode && mode.kind === 'create' ? (
        <Drawer title={'고정자금 등록'} onClose={close}>
          <FundForm role={role} row={null} onDone={() => done('고정자금을 등록했습니다.')} />
        </Drawer>
      ) : null}
      {mode && mode.kind === 'edit' ? (
        <Drawer title={'고정자금 수정'} onClose={close}>
          <FundForm role={role} row={mode.row} onDone={() => done('고정자금을 수정했습니다.')} />
        </Drawer>
      ) : null}
      {mode && mode.kind === 'delete' ? (
        <Drawer title={'고정자금 삭제'} onClose={close}>
          <Form
            submit={'삭제'}
            danger
            note={'삭제한 고정자금은 되돌릴 수 없습니다. 계획에서 빼기만 하려면 사용 여부를 미사용으로 바꿔 주세요.'}
            onSubmit={async () => {
              await call('DELETE', '/fixed-funds/' + String(mode.row['fixedFundId']), role);
              done('고정자금을 삭제했습니다.');
            }}
          />
        </Drawer>
      ) : null}
    </div>
  );
}

function FundForm({ role, row, onDone }: { role: string; row: Row | null; onDone: () => void }) {
  const [fundSubjectId, setFundSubjectId] = useState<unknown>(row ? row['fundSubjectId'] : '');
  const [partnerId, setPartnerId] = useState<unknown>(row && row['partnerId'] ? row['partnerId'] : '');
  const [amount, setAmount] = useState<unknown>(row ? row['amount'] : '');
  const [cycle, setCycle] = useState<string>(row ? String(row['cycle']) : '');
  const [startDate, setStartDate] = useState<string>(row ? String(row['startDate']) : '');
  const [endDate, setEndDate] = useState<string>(row && row['endDate'] ? String(row['endDate']) : '');
  const [useStatus, setUseStatus] = useState<string>(row ? String(row['useStatus']) : '사용');

  const submit = async () => {
    const missing: string[] = [];
    if (fundSubjectId === '' || fundSubjectId === null || fundSubjectId === undefined) missing.push('자금과목');
    if (amount === '' || amount === null || amount === undefined) missing.push('금액');
    if (!cycle) missing.push('발생 주기');
    if (!startDate) missing.push('적용 시작일');
    if (!useStatus) missing.push('사용 여부');
    if (missing.length > 0) throw new Error('다음 항목을 입력해 주세요: ' + missing.join(', '));
    const body: Row = {
      fundSubjectId,
      partnerId: partnerId === '' ? null : partnerId,
      amount,
      cycle,
      startDate,
      endDate: endDate === '' ? null : endDate,
      useStatus,
    };
    if (row) {
      await call('PATCH', '/fixed-funds/' + String(row['fixedFundId']), role, body);
    } else {
      await call('POST', '/fixed-funds', role, body);
    }
    onDone();
  };

  return (
    <Form submit={row ? '수정 저장' : '등록'} onSubmit={submit}>
      <Field label={'자금과목'} required>
        <LookupSelect table={'fund_subject'} role={role} value={fundSubjectId} onChange={setFundSubjectId} />
      </Field>
      <Field label={'거래처'}>
        <LookupSelect table={'partner'} role={role} value={partnerId} onChange={setPartnerId} />
      </Field>
      <Field label={'금액'} required>
        <NumberInput value={amount} onChange={setAmount} />
      </Field>
      <Field label={'발생 주기'} required>
        <Select value={cycle} onChange={setCycle} options={CYCLE_OPTIONS} />
      </Field>
      <Field label={'적용 시작일'} required>
        <DateInput value={startDate} onChange={setStartDate} />
      </Field>
      <Field label={'적용 종료일'} hint={'비워 두면 종료일 미정입니다.'}>
        <DateInput value={endDate} onChange={setEndDate} />
      </Field>
      <Field label={'사용 여부'} required>
        <Select value={useStatus} onChange={setUseStatus} options={USE_OPTIONS} />
      </Field>
    </Form>
  );
}
