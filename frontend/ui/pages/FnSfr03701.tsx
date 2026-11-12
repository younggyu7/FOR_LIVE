import { useState } from 'react';
import { call, Band, DataTable, DateText, Drawer, Field, Form, RefName, Select, TextInput } from '../kit';
import type { PageProps, Row } from '../kit';

const LOGIN_TYPES: [string, string][] = [
  ['웹', '웹'],
  ['메신저', '메신저'],
  ['모바일 앱', '모바일 앱'],
];

export default function FnSfr03701Page({ role, notify }: PageProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Row[]>([]);
  const [loginType, setLoginType] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [deviceIdentifier, setDeviceIdentifier] = useState('');

  function reset() {
    setLoginType('');
    setUserId('');
    setPassword('');
    setOtpValue('');
    setDeviceIdentifier('');
  }

  async function submit() {
    if (!loginType || !userId.trim() || !password || !deviceIdentifier.trim()) {
      throw new Error('로그인 구분, 사번, 비밀번호, 기기 식별정보를 모두 입력해 주세요.');
    }
    const res = await call('POST', '/auth/login', role, {
      loginType,
      userId: userId.trim(),
      password,
      otpValue: otpValue.trim() === '' ? undefined : otpValue.trim(),
      deviceIdentifier: deviceIdentifier.trim(),
    });
    setResults([
      { id: results.length + 1, loginType, userId: userId.trim(), employeeId: res['employeeId'], at: new Date().toISOString() },
      ...results,
    ]);
    reset();
    setOpen(false);
    notify('로그인했습니다.');
  }

  return (
    <div>
      <h1>2차 인증 로그인</h1>
      <Band total={results.length}>
        <button onClick={() => setOpen(true)}>로그인</button>
      </Band>
      <DataTable
        columns={[
          { key: 'loginType', label: '로그인 구분' },
          { key: 'userId', label: '사번' },
          { key: 'employeeId', label: '임직원', render: (row) => <RefName table="employee" role={role} value={row['employeeId']} /> },
          { key: 'at', label: '로그인 일시', render: (row) => <DateText value={row['at']} time /> },
        ]}
        rows={results}
        empty="아직 로그인한 내역이 없습니다. 로그인 버튼을 눌러 시작해 주세요."
      />
      {open && (
        <Drawer title="로그인" onClose={() => setOpen(false)}>
          <Form onSubmit={submit} submit="로그인" note="ID와 비밀번호를 확인한 뒤 OTP로 2차 인증을 진행합니다.">
            <Field label="웹/메신저/모바일 앱" required>
              <Select value={loginType} onChange={setLoginType} options={LOGIN_TYPES} />
            </Field>
            <Field label="사번" required>
              <TextInput value={userId} onChange={setUserId} />
            </Field>
            <Field label="1차 인증용 비밀번호" required>
              <TextInput value={password} onChange={setPassword} />
            </Field>
            <Field label="기기 식별정보" required>
              <TextInput value={deviceIdentifier} onChange={setDeviceIdentifier} />
            </Field>
            <Field label="OTP 일회용 값" hint="2차 인증 대상이면 입력해 주세요.">
              <TextInput value={otpValue} onChange={setOtpValue} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
