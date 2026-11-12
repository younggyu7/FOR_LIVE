import { useState } from 'react';
import {
  call,
  useData,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  DateInput,
  Select,
  NumberInput,
  LookupSelect,
  RefName,
  Badge,
  Num,
  DateText,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const TAX_TYPES: [string, string][] = [
  ['TAXABLE', '과세'],
  ['EXEMPT', '면세'],
];

export default function FnSfr00702Page({ role, notify }: PageProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taxType, setTaxType] = useState('');
  const [applied, setApplied] = useState({ startDate: '', endDate: '', taxType: '' });
  const [pageNo, setPageNo] = useState(0);
  const [collectOpen, setCollectOpen] = useState(false);
  const [target, setTarget] = useState<Row | null>(null);

  const [cStart, setCStart] = useState('');
  const [cEnd, setCEnd] = useState('');
  const [cType, setCType] = useState('');

  const [projectId, setProjectId] = useState<number | string>('');
  const [budgetAccountId, setBudgetAccountId] = useState<number | string>('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [amount, setAmount] = useState<number | string>('');

  const list = useData<Page>(
    () => call<Page>('GET', '/tax-invoices', role, undefined, { ...applied, page: pageNo, size: 20 }),
    [applied, pageNo, role],
  );

  function search() {
    setPageNo(0);
    setApplied({ startDate, endDate, taxType });
  }

  function reset() {
    setStartDate('');
    setEndDate('');
    setTaxType('');
    setPageNo(0);
    setApplied({ startDate: '', endDate: '', taxType: '' });
  }

  function openResolution(row: Row) {
    setProjectId('');
    setBudgetAccountId('');
    setDepartmentId('');
    const supply = Number(row['supplyAmount']);
    const tax = Number(row['taxAmount']);
    setAmount(Number.isFinite(supply) && Number.isFinite(tax) ? supply + tax : '');
    setTarget(row);
  }

  async function collect() {
    if (!cStart || !cEnd) {
      throw new Error('수집 기간을 입력해 주세요.');
    }
    const result = await call<Row>('POST', '/tax-invoices/collect', role, {
      startDate: cStart,
      endDate: cEnd,
      taxType: cType || undefined,
    });
    setCollectOpen(false);
    notify('전자세금계산서 ' + String(result['collectedCount']) + '건을 수집했습니다.');
    list.reload();
  }

  async function createResolution() {
    if (target === null) {
      return;
    }
    if (projectId === '' || budgetAccountId === '' || departmentId === '' || amount === '') {
      throw new Error('프로젝트, 예산과목, 결의부서, 결의 금액을 모두 입력해 주세요.');
    }
    await call<Row>('POST', '/expense-resolutions/from-tax-invoice', role, {
      taxInvoiceId: target['taxInvoiceId'],
      projectId,
      budgetAccountId,
      departmentId,
      resolutionAmount: amount,
    });
    setTarget(null);
    notify('결의서를 작성했습니다.');
    list.reload();
  }

  const page = list.data;

  return (
    <div className="doc">
      <section className="box">
        <h2>전자세금계산서 수집·대사</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="조회 기간 시작일">
            <DateInput value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="조회 기간 종료일">
            <DateInput value={endDate} onChange={setEndDate} />
          </Field>
          <Field label="과세·면세 구분">
            <Select value={taxType} onChange={setTaxType} options={TAX_TYPES} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={page?.total}>
          <button
            type="button"
            onClick={() => {
              setCStart('');
              setCEnd('');
              setCType('');
              setCollectOpen(true);
            }}
          >
            홈택스 수집
          </button>
        </Band>
        {list.error ? <ErrorText text={list.error} /> : null}
        <DataTable
          columns={[
            { key: 'partnerId', label: '거래처', render: (r) => <RefName table="partner" role={role} value={r['partnerId']} /> },
            {
              key: 'issueDate',
              label: '작성일자',
              render: (r) => (
                <span>
                  <DateText value={r['issueDate']} /> · {r['taxType'] === 'EXEMPT' ? '면세' : '과세'}
                </span>
              ),
            },
            { key: 'supplyAmount', label: '공급가액', render: (r) => <Num value={r['supplyAmount']} /> },
            { key: 'journalStatus', label: '전표처리 상태', render: (r) => <Badge value={r['journalStatus']} /> },
            {
              key: 'expenseResolutionId',
              label: '결의서',
              render: (r) =>
                r['expenseResolutionId'] ? (
                  <span>작성됨</span>
                ) : (
                  <button type="button" className="ghost" onClick={() => openResolution(r)}>
                    결의서 작성
                  </button>
                ),
            },
          ]}
          rows={page?.items ?? []}
          empty="수집한 전자세금계산서가 없습니다. 홈택스 수집을 눌러 내역을 가져오세요."
        />
        <Pager page={pageNo} size={page?.size ?? 20} total={page?.total ?? 0} onPage={setPageNo} />
      </section>

      {collectOpen ? (
        <Drawer title="홈택스 전자세금계산서 수집" onClose={() => setCollectOpen(false)}>
          <Form onSubmit={collect} submit="수집">
            <Field label="수집 기간 시작일" required>
              <DateInput value={cStart} onChange={setCStart} />
            </Field>
            <Field label="수집 기간 종료일" required>
              <DateInput value={cEnd} onChange={setCEnd} />
            </Field>
            <Field label="과세·면세 구분">
              <Select value={cType} onChange={setCType} options={TAX_TYPES} placeholder="전체" />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {target !== null ? (
        <Drawer title="전자세금계산서로 결의서 작성" onClose={() => setTarget(null)}>
          <Form
            onSubmit={createResolution}
            submit="결의서 작성"
            note="작성하면 이 전자세금계산서에는 결의서를 다시 작성할 수 없습니다."
          >
            <Field label="프로젝트" required>
              <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} />
            </Field>
            <Field label="예산과목" required>
              <LookupSelect table="budget_account" role={role} value={budgetAccountId} onChange={setBudgetAccountId} />
            </Field>
            <Field label="결의부서" required>
              <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} />
            </Field>
            <Field label="결의 금액" required>
              <NumberInput value={amount} onChange={setAmount} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
