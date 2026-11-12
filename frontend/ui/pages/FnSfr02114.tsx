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
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

export default function FnSfr02114Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'severance' | 'certificate'>('severance');
  const [employeeFilter, setEmployeeFilter] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [certPage, setCertPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [totalPaymentAmount, setTotalPaymentAmount] = useState<number | string>('');
  const [withheldTaxAmount, setWithheldTaxAmount] = useState<number | string>('');

  const severances = useData<Page>(
    () => call<Page>('GET', '/severance-calculations', role, undefined, { employeeId: employeeFilter, page, size: 20 }),
    [role, employeeFilter, page],
  );
  const certificates = useData<Page>(
    () => call<Page>('GET', '/income-certificates', role, undefined, { page: certPage, size: 20 }),
    [role, certPage],
  );

  function openCreate(row?: Row) {
    setEmployeeId(row ? (row['employeeId'] as number) : '');
    setPeriodStart('');
    setPeriodEnd('');
    setTotalPaymentAmount('');
    setWithheldTaxAmount('');
    setCreating(true);
  }

  async function submit() {
    if (employeeId === '' || !periodStart || !periodEnd) {
      throw new Error('임직원, 귀속 시작일, 귀속 종료일을 모두 입력해 주세요.');
    }
    if (periodEnd < periodStart) {
      throw new Error('귀속 종료일은 귀속 시작일 이후여야 합니다.');
    }
    await call('POST', '/income-certificates', role, {
      employeeId,
      periodStart,
      periodEnd,
      totalPaymentAmount,
      withheldTaxAmount,
    });
    notify('퇴직소득 원천징수영수증을 생성했습니다.');
    setCreating(false);
    setTab('certificate');
    setCertPage(0);
    certificates.reload();
  }

  return (
    <div>
      <h1>퇴직금 산정 현황 및 퇴직소득 원천징수영수증</h1>
      <div>
        <button className={tab === 'severance' ? '' : 'ghost'} onClick={() => setTab('severance')}>
          퇴직금 산정 현황
        </button>
        <button className={tab === 'certificate' ? '' : 'ghost'} onClick={() => setTab('certificate')}>
          발급한 영수증
        </button>
      </div>

      {tab === 'severance' && (
        <div>
          <Filters
            onSearch={() => {
              setPage(0);
              severances.reload();
            }}
            onReset={() => {
              setEmployeeFilter('');
              setPage(0);
            }}
          >
            <Field label="대상 임직원">
              <LookupSelect table="employee" role={role} value={employeeFilter} onChange={setEmployeeFilter} />
            </Field>
          </Filters>
          <Band total={severances.data?.total}>
            <button onClick={() => openCreate()}>원천징수영수증 생성</button>
          </Band>
          {severances.error && <ErrorText text={severances.error} />}
          <DataTable
            columns={[
              {
                key: 'employeeId',
                label: '퇴직 임직원',
                render: (row) => <RefName table="employee" role={role} value={row['employeeId']} />,
              },
              { key: 'retirementDate', label: '퇴직일', render: (row) => <DateText value={row['retirementDate']} /> },
              {
                key: 'action',
                label: '처리',
                render: (row) => (
                  <button className="ghost" onClick={() => openCreate(row)}>
                    영수증 생성
                  </button>
                ),
              },
            ]}
            rows={severances.data?.items ?? []}
            empty="아직 산정된 퇴직금이 없습니다."
          />
          <Pager page={page} size={severances.data?.size ?? 20} total={severances.data?.total ?? 0} onPage={setPage} />
        </div>
      )}

      {tab === 'certificate' && (
        <div>
          <Band total={certificates.data?.total}>
            <button onClick={() => openCreate()}>원천징수영수증 생성</button>
          </Band>
          {certificates.error && <ErrorText text={certificates.error} />}
          <DataTable
            columns={[
              { key: 'documentType', label: '문서 종류', render: (row) => <Badge value={row['documentType']} /> },
              {
                key: 'periodStart',
                label: '귀속 기간',
                render: (row) => (
                  <span>
                    <DateText value={row['periodStart']} /> ~ <DateText value={row['periodEnd']} />
                  </span>
                ),
              },
              { key: 'totalPaymentAmount', label: '총지급액', render: (row) => <Num value={row['totalPaymentAmount']} /> },
              { key: 'withheldTaxAmount', label: '원천징수세액', render: (row) => <Num value={row['withheldTaxAmount']} /> },
              { key: 'issuedAt', label: '발급 일시', render: (row) => <DateText value={row['issuedAt']} time /> },
            ]}
            rows={certificates.data?.items ?? []}
            empty="아직 발급한 영수증이 없습니다. 퇴직금 산정 현황에서 영수증을 생성해 주세요."
          />
          <Pager
            page={certPage}
            size={certificates.data?.size ?? 20}
            total={certificates.data?.total ?? 0}
            onPage={setCertPage}
          />
        </div>
      )}

      {creating && (
        <Drawer title="퇴직소득 원천징수영수증 생성" onClose={() => setCreating(false)}>
          <Form onSubmit={submit} submit="생성">
            <Field label="임직원" required>
              <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
            </Field>
            <Field label="귀속 시작일" required>
              <DateInput value={periodStart} onChange={setPeriodStart} />
            </Field>
            <Field label="귀속 종료일" required>
              <DateInput value={periodEnd} onChange={setPeriodEnd} />
            </Field>
            <Field label="총지급액">
              <NumberInput value={totalPaymentAmount} onChange={setTotalPaymentAmount} />
            </Field>
            <Field label="원천징수세액">
              <NumberInput value={withheldTaxAmount} onChange={setWithheldTaxAmount} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
