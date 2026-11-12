import { useState } from 'react';
import {
  Band,
  DataTable,
  DateInput,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  DateText,
  Pager,
  RefName,
  Select,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const LEDGER_TYPES = [
  '분개장',
  '일계표',
  '월계표',
  '총계정원장',
  '현금출납장',
  '계정별 원장',
  '주요계정 증감 현황',
  '계정별 변동추이',
  '관리항목 상세 원장',
];

interface Condition {
  fromDate: string;
  toDate: string;
  ledgerType: string;
  accountSubjectId: number | string;
  managementItemId: number | string;
}

const EMPTY: Condition = {
  fromDate: '',
  toDate: '',
  ledgerType: '',
  accountSubjectId: '',
  managementItemId: '',
};

export default function FnSfr00805Page({ role }: PageProps) {
  const [draft, setDraft] = useState<Condition>(EMPTY);
  const [applied, setApplied] = useState<Condition | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [formError, setFormError] = useState('');
  const size = 20;

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    return call<Page>('GET', '/account-ledgers', role, undefined, {
      fromDate: applied.fromDate,
      toDate: applied.toDate,
      ledgerType: applied.ledgerType,
      accountSubjectId: applied.accountSubjectId,
      managementItemId: applied.managementItemId,
      page: pageNo,
      size,
    });
  }, [applied, pageNo]);

  function change(patch: Partial<Condition>) {
    setDraft({ ...draft, ...patch });
  }

  function search() {
    if (!draft.ledgerType) {
      setFormError('장부 종류를 선택해 주세요.');
      return;
    }
    if (!draft.fromDate || !draft.toDate) {
      setFormError('조회 시작 일자와 종료 일자를 입력해 주세요.');
      return;
    }
    if (draft.ledgerType === '관리항목 상세 원장' && draft.managementItemId === '') {
      setFormError('관리항목 상세 원장은 관리항목을 지정해야 조회할 수 있습니다.');
      return;
    }
    setFormError('');
    setPageNo(0);
    setApplied({ ...draft });
  }

  function reset() {
    setDraft(EMPTY);
    setApplied(null);
    setPageNo(0);
    setFormError('');
  }

  const columns = [
    { key: 'entryDate', label: '전표 일자', render: (row: Row) => <DateText value={row.entryDate} /> },
    {
      key: 'accountSubjectId',
      label: '계정과목',
      render: (row: Row) => (
        <>
          <RefName table="account_subject" role={role} value={row.accountSubjectId} />
          {row.itemValue ? ' · ' + String(row.itemValue) : ''}
        </>
      ),
    },
    { key: 'debitAmount', label: '차변 금액', render: (row: Row) => <Num value={row.debitAmount} /> },
    { key: 'creditAmount', label: '대변 금액', render: (row: Row) => <Num value={row.creditAmount} /> },
    { key: 'balance', label: '집계 잔액', render: (row: Row) => <Num value={row.balance} /> },
  ];

  return (
    <div className="doc">
      <h2>계정별 장부 조회</h2>
      <Filters onSearch={search} onReset={reset}>
        <Field label="장부 종류" required>
          <Select
            value={draft.ledgerType}
            onChange={(v) => change({ ledgerType: v })}
            options={LEDGER_TYPES.map((t): [string, string] => [t, t])}
          />
        </Field>
        <Field label="조회 시작 일자" required>
          <DateInput value={draft.fromDate} onChange={(v) => change({ fromDate: v })} />
        </Field>
        <Field label="조회 종료 일자" required>
          <DateInput value={draft.toDate} onChange={(v) => change({ toDate: v })} />
        </Field>
        <Field label="계정과목">
          <LookupSelect
            table="account_subject"
            role={role}
            value={draft.accountSubjectId}
            onChange={(v) => change({ accountSubjectId: v })}
          />
        </Field>
        <Field label="관리항목" hint="관리항목 상세 원장은 관리항목을 지정해야 합니다.">
          <LookupSelect
            table="management_item"
            role={role}
            value={draft.managementItemId}
            onChange={(v) => change({ managementItemId: v })}
          />
        </Field>
      </Filters>
      {formError ? <ErrorText text={formError} /> : null}
      {error ? <ErrorText text={error} /> : null}
      <Band total={data ? data.total : undefined} />
      <DataTable
        columns={columns}
        rows={data ? data.items : []}
        empty={
          loading
            ? '불러오는 중입니다.'
            : applied
              ? '조건에 맞는 장부 내역이 없습니다.'
              : '장부 종류와 조회 기간을 입력한 뒤 조회해 주세요.'
        }
      />
      {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} /> : null}
    </div>
  );
}
