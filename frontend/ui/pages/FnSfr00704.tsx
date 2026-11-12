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
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr00704Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'card' | 'cash'>('card');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creditCardId, setCreditCardId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [page, setPage] = useState(0);
  const [collecting, setCollecting] = useState(false);
  const [collectCard, setCollectCard] = useState<number | string>('');
  const [collectStart, setCollectStart] = useState('');
  const [collectEnd, setCollectEnd] = useState('');
  const [target, setTarget] = useState<Row | null>(null);
  const [projectId, setProjectId] = useState<number | string>('');
  const [budgetAccountId, setBudgetAccountId] = useState<number | string>('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [amount, setAmount] = useState<number | string>('');

  const path = tab === 'card' ? '/card-approvals' : '/cash-receipts';
  const list = useData<Page<Row> | undefined>(async () => {
    if (!applied) return undefined;
    return call<Page<Row>>('GET', path, role, undefined, { ...applied, page, size: PAGE_SIZE });
  }, [applied, page, tab]);

  function search() {
    if (!startDate || !endDate) {
      notify('조회 기간의 시작일과 종료일을 입력해 주세요.');
      return;
    }
    setPage(0);
    setApplied({ startDate, endDate, creditCardId: tab === 'card' ? creditCardId : '' });
  }

  function reset() {
    setStartDate('');
    setEndDate('');
    setCreditCardId('');
    setApplied(null);
    setPage(0);
  }

  function changeTab(next: 'card' | 'cash') {
    setTab(next);
    setApplied(null);
    setPage(0);
  }

  function openCreate(row: Row) {
    setTarget(row);
    setProjectId('');
    setBudgetAccountId('');
    setDepartmentId('');
    setAmount(((tab === 'card' ? row.approvalAmount : row.totalAmount) as number) ?? '');
  }

  const resolutionCell = (row: Row) =>
    row.expenseResolutionId ? (
      <Badge value='작성완료' />
    ) : (
      <button className='ghost' onClick={(e) => { e.stopPropagation(); openCreate(row); }}>
        결의서 작성
      </button>
    );

  const cardColumns = [
    { key: 'creditCardId', label: '신용카드', render: (r: Row) => <RefName table='credit_card' role={role} value={r.creditCardId} /> },
    { key: 'approvedAt', label: '승인일시', render: (r: Row) => <DateText value={r.approvedAt} time /> },
    { key: 'merchantName', label: '가맹점명' },
    { key: 'approvalAmount', label: '승인금액', render: (r: Row) => <Num value={r.approvalAmount} /> },
    { key: 'expenseResolutionId', label: '결의서', render: resolutionCell },
  ];

  const cashColumns = [
    { key: 'issuedAt', label: '발행일시', render: (r: Row) => <DateText value={r.issuedAt} time /> },
    { key: 'approvalNo', label: '승인번호' },
    { key: 'merchantName', label: '가맹점명' },
    { key: 'totalAmount', label: '합계금액', render: (r: Row) => <Num value={r.totalAmount} /> },
    { key: 'expenseResolutionId', label: '결의서', render: resolutionCell },
  ];

  const data = list.data;

  return (
    <div className='doc'>
      <h1>카드 승인내역 및 현금영수증 결의서 작성</h1>
      <div>
        <button className={tab === 'card' ? '' : 'ghost'} onClick={() => changeTab('card')}>신용카드 승인내역</button>
        <button className={tab === 'cash' ? '' : 'ghost'} onClick={() => changeTab('cash')}>현금영수증</button>
      </div>
      <Filters onSearch={search} onReset={reset}>
        <Field label='조회 기간 시작일' required>
          <DateInput value={startDate} onChange={setStartDate} />
        </Field>
        <Field label='조회 기간 종료일' required>
          <DateInput value={endDate} onChange={setEndDate} />
        </Field>
        {tab === 'card' && (
          <Field label='신용카드'>
            <LookupSelect table='credit_card' role={role} value={creditCardId} onChange={setCreditCardId} placeholder='전체' />
          </Field>
        )}
      </Filters>
      <Band total={data?.total}>
        {tab === 'card' && role === '예산·회계 담당자' && (
          <button onClick={() => { setCollectCard(''); setCollectStart(''); setCollectEnd(''); setCollecting(true); }}>
            승인내역 수집
          </button>
        )}
      </Band>
      {list.error && <p>{list.error}</p>}
      <DataTable<Row>
        columns={tab === 'card' ? cardColumns : cashColumns}
        rows={data?.items ?? []}
        empty={applied ? '조회된 내역이 없습니다. 기간을 바꿔 다시 조회해 주세요.' : '조회 기간을 입력하고 조회해 주세요.'}
      />
      {data && <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />}

      {collecting && (
        <Drawer title='카드 승인내역 수집' onClose={() => setCollecting(false)}>
          <Form
            submit='수집'
            note='카드사 연계로 선택한 기간의 승인내역을 수집합니다.'
            onSubmit={async () => {
              if (collectCard === '' || !collectStart || !collectEnd) {
                throw new Error('신용카드와 수집 기간을 모두 입력해 주세요.');
              }
              const result = await call<Row>('POST', '/card-approvals/collect', role, {
                creditCardId: collectCard,
                startDate: collectStart,
                endDate: collectEnd,
              });
              notify(String(result.collectedCount ?? 0) + '건을 수집했습니다.');
              setCollecting(false);
              list.reload();
            }}
          >
            <Field label='신용카드' required>
              <LookupSelect table='credit_card' role={role} value={collectCard} onChange={setCollectCard} />
            </Field>
            <Field label='수집 기간 시작일' required>
              <DateInput value={collectStart} onChange={setCollectStart} />
            </Field>
            <Field label='수집 기간 종료일' required>
              <DateInput value={collectEnd} onChange={setCollectEnd} />
            </Field>
          </Form>
        </Drawer>
      )}

      {target && (
        <Drawer title='결의서 작성' onClose={() => setTarget(null)}>
          <Form
            submit='결의서 작성'
            note={'승인번호 ' + String(target.approvalNo ?? '') + ' 건으로 결의서를 기안 상태로 작성합니다.'}
            onSubmit={async () => {
              if (projectId === '' || budgetAccountId === '' || departmentId === '' || amount === '') {
                throw new Error('프로젝트, 예산과목, 결의부서, 결의 금액을 모두 입력해 주세요.');
              }
              const body: Row =
                tab === 'card'
                  ? { cardApprovalId: target.cardApprovalId }
                  : { cashReceiptId: target.cashReceiptId };
              await call('POST', '/expense-resolutions/from-card-or-cash-receipt', role, {
                ...body,
                projectId,
                budgetAccountId,
                departmentId,
                resolutionAmount: amount,
              });
              notify('결의서를 작성했습니다.');
              setTarget(null);
              list.reload();
            }}
          >
            <Field label='프로젝트' required>
              <LookupSelect table='project' role={role} value={projectId} onChange={setProjectId} />
            </Field>
            <Field label='예산과목' required>
              <LookupSelect table='budget_account' role={role} value={budgetAccountId} onChange={setBudgetAccountId} />
            </Field>
            <Field label='결의부서' required>
              <LookupSelect table='department' role={role} value={departmentId} onChange={setDepartmentId} />
            </Field>
            <Field label='결의 금액' required>
              <NumberInput value={amount} onChange={setAmount} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
