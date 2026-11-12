import { useState } from 'react';
import {
  Band,
  DataTable,
  DateInput,
  DateText,
  Badge,
  Drawer,
  Field,
  Form,
  LookupSelect,
  RefName,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

// 가정: 상태 전환표 (서버와 동일)
const NEXT: Record<string, string[]> = {
  '신청': ['승인'],
  '승인': ['마감', '승인 취소'],
  '마감': ['마감 취소'],
};

export default function FnSfr01302Page({ role, notify }: PageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState<Row | null>(null);
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [appointmentType, setAppointmentType] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [positionAfter, setPositionAfter] = useState('');

  function openCreate() {
    setEmployeeId('');
    setAppointmentType('');
    setAppointmentDate('');
    setDepartmentId('');
    setPositionAfter('');
    setCreating(true);
  }

  async function create() {
    if (employeeId === '' || !appointmentType.trim() || !appointmentDate || departmentId === '') {
      throw new Error('대상 임직원, 발령 구분, 발령일자, 발령 후 부서를 모두 입력해 주세요.');
    }
    const res = await call('POST', '/personnel-appointments', role, {
      employeeId,
      appointmentType,
      appointmentDate,
      departmentId,
      positionAfter,
    });
    setRows([
      {
        personnelAppointmentId: res['personnelAppointmentId'],
        employeeId,
        appointmentType,
        appointmentDate,
        departmentId,
        positionAfter,
        status: res['status'],
      },
      ...rows,
    ]);
    setCreating(false);
    notify('발령 대상자를 등록했습니다.');
  }

  async function changeStatus(row: Row, status: string) {
    const id = String(row['personnelAppointmentId']);
    const res = await call('PATCH', `/personnel-appointments/${id}/status`, role, { status });
    setRows(rows.map((r) => (r['personnelAppointmentId'] === row['personnelAppointmentId'] ? { ...r, status: res['status'] } : r)));
    setTarget(null);
    notify('발령 상태를 변경했습니다.');
  }

  const current = target ? rows.find((r) => r['personnelAppointmentId'] === target['personnelAppointmentId']) ?? target : null;

  return (
    <div>
      <h2>인사발령 대상자</h2>
      <Band total={rows.length}>
        <button onClick={openCreate}>대상자 등록</button>
      </Band>
      <DataTable
        rows={rows}
        empty="아직 등록한 대상자가 없습니다. 대상자 등록 버튼을 눌러 시작하세요."
        columns={[
          { key: 'employeeId', label: '발령 대상 임직원', render: (r) => <RefName table="employee" role={role} value={r['employeeId']} /> },
          { key: 'appointmentType', label: '발령 구분' },
          { key: 'appointmentDate', label: '발령일자', render: (r) => <DateText value={r['appointmentDate']} /> },
          { key: 'status', label: '발령 상태', render: (r) => <Badge value={r['status']} /> },
          {
            key: 'action',
            label: '처리',
            render: (r) =>
              (NEXT[String(r['status'])] ?? []).length > 0 ? (
                <button className="ghost" onClick={() => setTarget(r)}>상태 변경</button>
              ) : (
                <span>처리 완료</span>
              ),
          },
        ]}
      />
      {creating && (
        <Drawer title="발령 대상자 등록" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="등록">
            <Field label="발령 대상 임직원" required>
              <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
            </Field>
            <Field label="발령 구분" required>
              <TextInput value={appointmentType} onChange={setAppointmentType} />
            </Field>
            <Field label="발령일자" required>
              <DateInput value={appointmentDate} onChange={setAppointmentDate} />
            </Field>
            <Field label="발령 후 부서" required>
              <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} />
            </Field>
            <Field label="발령 후 직위·직책">
              <TextInput value={positionAfter} onChange={setPositionAfter} />
            </Field>
          </Form>
        </Drawer>
      )}
      {current && (NEXT[String(current['status'])] ?? []).map((next) => (
        <Drawer key={next} title={'발령 상태 변경: ' + next} onClose={() => setTarget(null)}>
          <Form
            onSubmit={() => changeStatus(current, next)}
            submit={next + '(으)로 변경'}
            note={'현재 상태 ' + String(current['status']) + '에서 ' + next + '(으)로 바꾸고 변경 이력을 남깁니다.'}
          />
        </Drawer>
      ))}
    </div>
  );
}
