import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Form,
  LookupSelect,
  Pairs,
  RefName,
  Select,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

const TYPE_OPTIONS: [string, string][] = [
  ['NATIONAL_PENSION', '국민연금'],
  ['HEALTH', '건강보험'],
  ['EMPLOYMENT', '고용보험'],
  ['INDUSTRIAL_ACCIDENT', '산재보험'],
];

function typeName(value: unknown): string {
  const found = TYPE_OPTIONS.find(([v]) => v === value);
  return found ? found[1] : String(value ?? '');
}

export default function FnSfr02204Page({ role, notify }: PageProps) {
  // 조회 API가 없으므로 이 화면에서 처리한 결과를 목록으로 보인다.
  const [results, setResults] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [opening, setOpening] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [insuranceType, setInsuranceType] = useState('');
  const [grade, setGrade] = useState('');
  const [applyStartMonth, setApplyStartMonth] = useState('');

  function openForm() {
    setEmployeeId('');
    setInsuranceType('');
    setGrade('');
    setApplyStartMonth('');
    setOpening(true);
  }

  async function submit() {
    if (employeeId === '' || !insuranceType || !grade.trim() || !applyStartMonth.trim()) {
      throw new Error('임직원, 보험 종류, 등급, 적용 시작월을 모두 입력해 주세요.');
    }
    const result = await call('POST', '/social-insurance-grades/change', role, {
      employeeId,
      insuranceType,
      grade: grade.trim(),
      applyStartMonth: applyStartMonth.trim(),
    });
    setResults([result, ...results]);
    setOpening(false);
    notify('사회보험 등급을 변경했습니다.');
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로
        </button>
        <section className="box">
          <h2>등급 변경 결과</h2>
          <Pairs
            items={[
              ['임직원', <RefName table="employee" role={role} value={selected.employeeId} />],
              ['보험 종류', typeName(selected.insuranceType)],
              ['변경 전 등급', String(selected.previousGrade ?? '')],
              ['등급', String(selected.grade ?? '')],
              ['적용 시작월', String(selected.applyStartMonth ?? '')],
            ]}
          />
        </section>
        <section className="box">
          <h2>변경 이력</h2>
          <Pairs
            items={[
              ['변경 일시', <DateText value={selected.changedAt} time />],
              ['변경자', <RefName table="employee" role={role} value={selected.changedById} />],
              ['변경 내용', String(selected.changeContent ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>사회보험 등급 변경 관리</h1>
      <Band total={results.length}>
        <button onClick={openForm}>등급 변경</button>
      </Band>
      <DataTable
        columns={[
          {
            key: 'employeeId',
            label: '임직원',
            render: (row) => <RefName table="employee" role={role} value={row.employeeId} />,
          },
          { key: 'insuranceType', label: '보험 종류', render: (row) => typeName(row.insuranceType) },
          { key: 'grade', label: '등급' },
          { key: 'applyStartMonth', label: '적용 시작월' },
          {
            key: 'changedAt',
            label: '변경 일시',
            render: (row) => <DateText value={row.changedAt} time />,
          },
        ]}
        rows={results}
        onRowClick={(row) => setSelected(row)}
        empty="아직 변경한 내역이 없습니다. 등급 변경 버튼으로 시작해 주세요."
      />
      {opening && (
        <Drawer title="사회보험 등급 변경" onClose={() => setOpening(false)}>
          <Form
            onSubmit={submit}
            submit="변경"
            note="변경하면 적용 시작월부터 공제내역 산정에 반영되고 변경 이력이 남습니다. 마감된 급여 기간은 마감 취소 후에만 변경할 수 있습니다."
          >
            <Field label="임직원" required>
              <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
            </Field>
            <Field label="보험 종류" required>
              <Select value={insuranceType} onChange={setInsuranceType} options={TYPE_OPTIONS} />
            </Field>
            <Field label="등급" required>
              <TextInput value={grade} onChange={setGrade} />
            </Field>
            <Field label="적용 시작월" required hint="YYYYMM 형식 (예: 202601)">
              <TextInput value={applyStartMonth} onChange={setApplyStartMonth} placeholder="202601" />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
