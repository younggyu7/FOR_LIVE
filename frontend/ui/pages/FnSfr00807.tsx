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
  Field,
  DateInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const LEDGER_TYPES: [string, string][] = [
  ['관리항목 원장', '관리항목 원장'],
  ['관리내역', '관리내역'],
  ['멀티 관리내역', '멀티 관리내역'],
  ['적요별 원장', '적요별 원장'],
  ['품의내역별 원장', '품의내역별 원장'],
  ['증빙별 원장', '증빙별 원장'],
  ['프로젝트별 계정내역', '프로젝트별 계정내역'],
];
const PAGE_SIZE = 20;

export default function FnSfr00807Page({ role, notify }: PageProps) {
  const [ledgerType, setLedgerType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [item1, setItem1] = useState<number | string>('');
  const [item2, setItem2] = useState<number | string>('');
  const [projectId, setProjectId] = useState<number | string>('');
  const [accountSubjectId, setAccountSubjectId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) return undefined;
    return call<Page>('GET', '/management-item-ledgers', role, undefined, {
      ...applied,
      page,
      size: PAGE_SIZE,
    });
  }, [applied, page, role]);

  const search = () => {
    if (!ledgerType) {
      setFormError('조회 유형을 선택해 주세요.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('조회 시작일과 종료일을 입력해 주세요.');
      return;
    }
    if (startDate > endDate) {
      setFormError('조회 기간이 올바르지 않습니다. 시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }
    const ids = [item1, item2].filter((v) => v !== '').map((v) => String(v));
    if (ledgerType === '멀티 관리내역' && ids.length < 2) {
      setFormError('멀티 관리내역은 관리항목을 둘 이상 선택해 주세요.');
      return;
    }
    setFormError('');
    setPage(0);
    setApplied({
      ledgerType,
      startDate,
      endDate,
      managementItemIds: ids.join(','),
      projectId,
      accountSubjectId,
    });
  };

  const reset = () => {
    setLedgerType('');
    setStartDate('');
    setEndDate('');
    setItem1('');
    setItem2('');
    setProjectId('');
    setAccountSubjectId('');
    setFormError('');
    setApplied(null);
    setPage(0);
  };

  const rows = data ? data.items : [];

  return (
    <div className="doc">
      <section className="box">
        <h2>관리항목별 장부 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 유형" required>
            <Select value={ledgerType} onChange={setLedgerType} options={LEDGER_TYPES} placeholder="조회 유형 선택" />
          </Field>
          <Field label="조회 시작일" required>
            <DateInput value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="조회 종료일" required>
            <DateInput value={endDate} onChange={setEndDate} />
          </Field>
          <Field label="관리항목 1" hint="멀티 관리내역은 두 항목을 모두 고르세요.">
            <LookupSelect table="management_item" role={role} value={item1} onChange={setItem1} />
          </Field>
          <Field label="관리항목 2">
            <LookupSelect table="management_item" role={role} value={item2} onChange={setItem2} />
          </Field>
          <Field label="프로젝트 ID">
            <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} />
          </Field>
          <Field label="계정과목 ID">
            <LookupSelect table="account_subject" role={role} value={accountSubjectId} onChange={setAccountSubjectId} />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>조회 결과</h2>
        <Band total={data ? data.total : 0} />
        <DataTable
          columns={[
            { key: 'accountSubjectId', label: '계정과목 ID', render: (r) => <RefName table="account_subject" role={role} value={r.accountSubjectId} /> },
            { key: 'projectId', label: '프로젝트 ID', render: (r) => <RefName table="project" role={role} value={r.projectId} /> },
            { key: 'summary', label: '적요' },
            {
              key: 'managementItemId',
              label: '관리항목',
              render: (r) => (
                <span>
                  <RefName table="management_item" role={role} value={r.managementItemId} />
                  {r.itemValue ? ' : ' + String(r.itemValue) : ''}
                </span>
              ),
            },
            {
              key: 'debitAmount',
              label: '차변 금액 / 대변 금액 / 집계 잔액',
              render: (r) => (
                <span>
                  <Num value={r.debitAmount} /> / <Num value={r.creditAmount} /> / <Num value={r.balance} />
                </span>
              ),
            },
          ]}
          rows={rows}
          empty={applied ? (loading ? '불러오는 중입니다.' : '조건에 맞는 장부 내역이 없습니다.') : '조회 유형과 기간을 입력한 뒤 조회해 주세요.'}
        />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} /> : null}
      </section>
    </div>
  );
}
