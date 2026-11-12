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
  NumberInput,
  Pager,
  Pairs,
  RefName,
  Select,
  TextInput,
  Num,
  call,
  useData,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const REPORT_TYPES: [string, string][] = [
  ['QUALIFICATION_ACQUISITION', '자격취득 신고서'],
  ['QUALIFICATION_LOSS', '자격상실 신고서'],
  ['TOTAL_REMUNERATION', '보수총액 신고서'],
  ['EMPLOYMENT_INDUSTRIAL', '고용·산재보험 신고서'],
  ['SEPARATION_CONFIRMATION', '이직확인서'],
  ['WORK_CONTENT_CONFIRMATION', '근로내용확인신고서'],
];

const INSURANCE_TYPES: [string, string][] = [
  ['NATIONAL_PENSION', '국민연금'],
  ['HEALTH', '건강보험'],
  ['EMPLOYMENT', '고용보험'],
  ['INDUSTRIAL_ACCIDENT', '산재보험'],
];

function nameOf(options: [string, string][], value: unknown) {
  const found = options.find(([v]) => v === value);
  return found ? found[1] : '';
}

export default function FnSfr02202Page({ role, notify }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [reportType, setReportType] = useState('');
  const [insuranceType, setInsuranceType] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const [fEnrollment, setFEnrollment] = useState<number | string>('');
  const [fEmployee, setFEmployee] = useState<number | string>('');
  const [fType, setFType] = useState('');
  const [fInsurance, setFInsurance] = useState('');
  const [fStart, setFStart] = useState('');
  const [fEnd, setFEnd] = useState('');
  const [fEvent, setFEvent] = useState('');
  const [fLoss, setFLoss] = useState('');
  const [fAmount, setFAmount] = useState<number | string>('');

  const list = useData<Page>(
    () => call<Page>('GET', '/social-insurance-reports', role, undefined, { ...applied, page, size: 20 }),
    [applied, page, role],
  );

  function search() {
    setPage(0);
    setApplied({ employeeId, reportType, insuranceType });
  }

  function reset() {
    setEmployeeId('');
    setReportType('');
    setInsuranceType('');
    setPage(0);
    setApplied({});
  }

  function resetForm() {
    setFEnrollment('');
    setFEmployee('');
    setFType('');
    setFInsurance('');
    setFStart('');
    setFEnd('');
    setFEvent('');
    setFLoss('');
    setFAmount('');
  }

  async function create() {
    if (!fType) {
      throw new Error('신고서 종류를 선택해 주세요.');
    }
    const hasPeriod = fStart !== '' && fEnd !== '';
    if (!hasPeriod && fEmployee === '' && fEnrollment === '') {
      throw new Error('대상 기간(시작일·종료일) 또는 대상자를 입력해 주세요.');
    }
    if ((fStart !== '' || fEnd !== '') && !hasPeriod) {
      throw new Error('대상 기간의 시작일과 종료일을 모두 입력해 주세요.');
    }
    const body: Row = { reportType: fType };
    if (fEnrollment !== '') body.socialInsuranceEnrollmentId = fEnrollment;
    if (fEmployee !== '') body.employeeId = fEmployee;
    if (fInsurance) body.insuranceType = fInsurance;
    if (fStart) body.periodStart = fStart;
    if (fEnd) body.periodEnd = fEnd;
    if (fEvent) body.eventDate = fEvent;
    if (fLoss) body.lossReason = fLoss;
    if (fAmount !== '') body.totalAmount = fAmount;
    await call('POST', '/social-insurance-reports', role, body);
    notify('신고서를 저장했습니다.');
    setCreating(false);
    resetForm();
    setPage(0);
    list.reload();
  }

  async function print(row: Row) {
    const res = await call('POST', `/social-insurance-reports/${row.socialInsuranceReportId}/print`, role, {});
    notify('신고서를 출력 처리했습니다.');
    setSelected({ ...row, printedAt: res.printedAt });
    list.reload();
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>신고서 정보</h2>
          <Pairs
            items={[
              ['신고서 종류', nameOf(REPORT_TYPES, selected.reportType)],
              ['보험 종류', nameOf(INSURANCE_TYPES, selected.insuranceType) || '-'],
              ['대상 임직원', selected.employeeId ? <RefName table="employee" role={role} value={selected.employeeId} /> : '-'],
              ['취득일 또는 상실일', <DateText value={selected.eventDate} />],
              ['작성자', selected.createdById ? <RefName table="employee" role={role} value={selected.createdById} /> : '-'],
              ['생성 일시', <DateText value={selected.createdAt} time />],
              ['최종 출력 일시', selected.printedAt ? <DateText value={selected.printedAt} time /> : '아직 출력하지 않았습니다.'],
            ]}
          />
        </section>
        <section className="box">
          <h2>출력</h2>
          <p>출력하면 최종 출력 일시가 기록됩니다. 외부 기관으로 전자 신고는 하지 않습니다.</p>
          <Form onSubmit={() => print(selected)} submit="신고서 출력" />
        </section>
      </div>
    );
  }

  const data = list.data;
  const columns = [
    { key: 'reportType', label: '신고서 종류', render: (r: Row) => nameOf(REPORT_TYPES, r.reportType) },
    { key: 'employeeId', label: '대상 임직원', render: (r: Row) => (r.employeeId ? <RefName table="employee" role={role} value={r.employeeId} /> : '-') },
    { key: 'insuranceType', label: '보험 종류', render: (r: Row) => (r.insuranceType ? <Badge value={nameOf(INSURANCE_TYPES, r.insuranceType)} /> : '-') },
    { key: 'eventDate', label: '취득일 또는 상실일', render: (r: Row) => <DateText value={r.eventDate} /> },
    { key: 'printedAt', label: '최종 출력 일시', render: (r: Row) => (r.printedAt ? <DateText value={r.printedAt} time /> : '미출력') },
  ];

  return (
    <div className="doc">
      <h1>사회보험 신고서 관리</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="대상 임직원">
          <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
        </Field>
        <Field label="신고서 종류">
          <Select value={reportType} onChange={setReportType} options={REPORT_TYPES} />
        </Field>
        <Field label="보험 종류">
          <Select value={insuranceType} onChange={setInsuranceType} options={INSURANCE_TYPES} />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={() => setCreating(true)}>신고서 작성</button>
      </Band>
      {list.error ? <p>{list.error}</p> : null}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        onRowClick={(r) => setSelected(r)}
        empty="아직 작성한 신고서가 없습니다. 신고서 작성 버튼을 눌러 시작하세요."
      />
      <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      {creating ? (
        <Drawer title="신고서 작성" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="신고서 저장" note="저장하면 인사·급여 데이터를 참조해 신고서가 만들어지고 이력이 기록됩니다.">
            <Field label="신고서 종류" required>
              <Select value={fType} onChange={setFType} options={REPORT_TYPES} />
            </Field>
            <Field label="보험 종류">
              <Select value={fInsurance} onChange={setFInsurance} options={INSURANCE_TYPES} />
            </Field>
            <Field label="대상 임직원">
              <LookupSelect table="employee" role={role} value={fEmployee} onChange={setFEmployee} />
            </Field>
            <Field label="취득·상실 대상자" hint="자격취득·상실 신고서일 때 고릅니다.">
              <LookupSelect table="social_insurance_enrollment" role={role} value={fEnrollment} onChange={setFEnrollment} />
            </Field>
            <Field label="대상 기간 시작일">
              <DateInput value={fStart} onChange={setFStart} />
            </Field>
            <Field label="대상 기간 종료일">
              <DateInput value={fEnd} onChange={setFEnd} />
            </Field>
            <Field label="취득일 또는 상실일">
              <DateInput value={fEvent} onChange={setFEvent} />
            </Field>
            <Field label="상실 사유" wide>
              <TextInput value={fLoss} onChange={setFLoss} />
            </Field>
            <Field label="보수총액" hint="비워 두면 급여 데이터를 참조해 작성합니다.">
              <NumberInput value={fAmount} onChange={setFAmount} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
