import { useState } from 'react';
import type { PageProps, Row } from '../kit';
import {
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Form,
  LookupSelect,
  RefName,
  Select,
  TextInput,
  call,
} from '../kit';

const TYPES: [string, string][] = [
  ['연차', '연차'],
  ['반차', '반차'],
  ['보상휴가', '보상휴가'],
  ['병가', '병가'],
  ['예비군', '예비군'],
  ['출장', '출장'],
  ['외근', '외근'],
  ['교육', '교육'],
];

export default function FnSfr01804Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [adjustDate, setAdjustDate] = useState('');
  const [attendanceType, setAttendanceType] = useState('');
  const [changedWorkTime, setChangedWorkTime] = useState('');
  const [reason, setReason] = useState('');

  function reset() {
    setEmployeeId('');
    setAdjustDate('');
    setAttendanceType('');
    setChangedWorkTime('');
    setReason('');
  }

  async function submit() {
    if (employeeId === '' || adjustDate === '' || attendanceType === '' || reason.trim() === '') {
      throw new Error('대상 사원, 조정 일자, 근태 유형, 사유를 모두 입력해 주세요.');
    }
    const body: Row = {
      employeeId,
      adjustDate,
      attendanceType,
      reason: reason.trim(),
    };
    if (changedWorkTime.trim() !== '') {
      body.changedWorkTime = changedWorkTime.trim();
    }
    const result = await call('POST', '/attendance-requests/adjust', role, body);
    setResults([{ ...result, employeeId, adjustDate }, ...results]);
    notify('근태를 조정했습니다.');
    reset();
    setOpen(false);
  }

  return (
    <div>
      <h1>근태 조정</h1>
      <Band total={results.length}>
        <button
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          근태 조정
        </button>
      </Band>
      <DataTable
        columns={[
          { key: 'employeeId', label: '신청자', render: (r) => <RefName table="employee" role={role} value={r.employeeId} /> },
          { key: 'adjustDate', label: '조정 일자', render: (r) => <DateText value={r.adjustDate} /> },
          { key: 'attendanceType', label: '근태 유형' },
          { key: 'changedWorkTime', label: '변경 근무시간' },
          { key: 'adjustedAt', label: '조정 일시', render: (r) => <DateText value={r.adjustedAt} time /> },
        ]}
        rows={results}
        empty="아직 조정한 내역이 없습니다. 근태 조정 버튼을 눌러 시작해 주세요."
      />
      {open && (
        <Drawer title="근태 조정" onClose={() => setOpen(false)}>
          <Form
            onSubmit={submit}
            submit="조정"
            note="조정하면 승인된 근태로 기록되며, 마감된 일자는 조정할 수 없습니다."
          >
            <Field label="신청자 ID" required>
              <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} placeholder="사원 선택" />
            </Field>
            <Field label="시작일" required>
              <DateInput value={adjustDate} onChange={setAdjustDate} />
            </Field>
            <Field label="근태 유형" required>
              <Select value={attendanceType} onChange={setAttendanceType} options={TYPES} />
            </Field>
            <Field label="변경 근무시간">
              <TextInput value={changedWorkTime} onChange={setChangedWorkTime} />
            </Field>
            <Field label="사유" required wide>
              <TextInput value={reason} onChange={setReason} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
