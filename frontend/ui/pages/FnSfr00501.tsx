import { useState } from 'react';
import { Band, DataTable, DateInput, DateText, ErrorText, Field, Filters, LookupSelect, Num, Pager, Select, Tiles, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const LEDGER_TYPES: [string, string][] = [
  ['예산일계표', '예산일계표'],
  ['월계표', '월계표'],
  ['수입·지출부', '수입·지출부'],
  ['자금출납장', '자금출납장'],
  ['은행이체명세서', '은행이체명세서'],
  ['지출원인행위부', '지출원인행위부'],
  ['수입징수부', '수입징수부'],
  ['세출·세입총괄표', '세출·세입총괄표'],
];

const CASH_SCOPES: [string, string][] = [
  ['전체', '전체'],
  ['금융기관별', '금융기관별'],
  ['프로젝트별', '프로젝트별'],
  ['결의 담당자별', '결의 담당자별'],
];

const VIEW_FORMS: [string, string][] = [
  ['상세', '상세'],
  ['총괄', '총괄'],
];

const PAGE_SIZE = 20;

export default function FnSfr00501Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row | null>(null);
  const [pageNo, setPageNo] = useState(0);

  const ledgerType = String(draft['ledgerType'] ?? '');
  const cashScope = String(draft['cashBookScope'] ?? '');
  const isCashBook = ledgerType === '자금출납장';
  const hasViewForm = ledgerType === '은행이체명세서' || ledgerType === '지출원인행위부' || ledgerType === '수입징수부';

  const { data, error, loading } = useData<Page | null>(async () => {
    if (!applied) {
      return null;
    }
    return call<Page>('GET', '/budget-ledgers', role, undefined, { ...applied, page: pageNo, size: PAGE_SIZE });
  }, [applied, pageNo, role]);

  const set = (key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const changeType = (value: string) => {
    setDraft((prev) => ({ ledgerType: value, fromDate: prev['fromDate'], toDate: prev['toDate'] }));
  };

  const search = () => {
    if (!draft['ledgerType'] || !draft['fromDate'] || !draft['toDate']) {
      notify('장부 종류와 조회 기간을 모두 입력해 주세요.');
      return;
    }
    const query: Row = {
      ledgerType: draft['ledgerType'],
      fromDate: draft['fromDate'],
      toDate: draft['toDate'],
    };
    if (isCashBook) {
      query['cashBookScope'] = draft['cashBookScope'];
      if (cashScope === '금융기관별') {
        query['partnerId'] = draft['partnerId'];
      }
      if (cashScope === '프로젝트별') {
        query['projectId'] = draft['projectId'];
      }
      if (cashScope === '결의 담당자별') {
        query['resolverId'] = draft['resolverId'];
      }
    }
    if (hasViewForm) {
      query['viewForm'] = draft['viewForm'];
    }
    setPageNo(0);
    setApplied(query);
  };

  const reset = () => {
    setDraft({});
    setApplied(null);
    setPageNo(0);
  };

  const items = data?.items ?? [];
  const totalAmount = items.length > 0 ? items[0]['totalAmount'] : 0;

  return (
    <div className="doc">
      <section className="box">
        <h2>예산장부 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="장부 종류" required>
            <Select value={draft['ledgerType']} onChange={changeType} options={LEDGER_TYPES} />
          </Field>
          <Field label="조회 시작일" required>
            <DateInput value={draft['fromDate']} onChange={(v) => set('fromDate', v)} />
          </Field>
          <Field label="조회 종료일" required>
            <DateInput value={draft['toDate']} onChange={(v) => set('toDate', v)} />
          </Field>
          {isCashBook && (
            <Field label="자금출납장 조회 구분">
              <Select value={draft['cashBookScope']} onChange={(v) => set('cashBookScope', v)} options={CASH_SCOPES} placeholder="전체" />
            </Field>
          )}
          {isCashBook && cashScope === '금융기관별' && (
            <Field label="금융거래처" required>
              <LookupSelect table="partner" role={role} value={draft['partnerId']} onChange={(v) => set('partnerId', v)} />
            </Field>
          )}
          {isCashBook && cashScope === '프로젝트별' && (
            <Field label="프로젝트" required>
              <LookupSelect table="project" role={role} value={draft['projectId']} onChange={(v) => set('projectId', v)} />
            </Field>
          )}
          {isCashBook && cashScope === '결의 담당자별' && (
            <Field label="결의 담당자" required>
              <LookupSelect table="employee" role={role} value={draft['resolverId']} onChange={(v) => set('resolverId', v)} />
            </Field>
          )}
          {hasViewForm && (
            <Field label="조회 형태">
              <Select value={draft['viewForm']} onChange={(v) => set('viewForm', v)} options={VIEW_FORMS} placeholder="상세" />
            </Field>
          )}
        </Filters>
      </section>
      <section className="box">
        <h2>조회 결과</h2>
        {error !== '' && <ErrorText text={error} />}
        {data && <Tiles items={[['합계 금액', <Num value={totalAmount} />]]} />}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'entryDate', label: '전표 일자', render: (row) => <DateText value={row['entryDate']} /> },
            { key: 'summary', label: '적요' },
            { key: 'debitAmount', label: '차변 금액', render: (row) => <Num value={row['debitAmount']} /> },
            { key: 'creditAmount', label: '대변 금액', render: (row) => <Num value={row['creditAmount']} /> },
            { key: 'resolutionAmount', label: '결의 금액', render: (row) => <Num value={row['resolutionAmount']} /> },
          ]}
          rows={items}
          empty={applied ? '조회 조건에 해당하는 내역이 없습니다.' : '장부 종류와 기간을 선택한 뒤 조회해 주세요.'}
        />
        {loading && <p>불러오는 중입니다.</p>}
        {data && <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} />}
      </section>
    </div>
  );
}
