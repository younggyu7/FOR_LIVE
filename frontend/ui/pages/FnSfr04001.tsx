import { useState } from 'react';
import { Band, DataTable, DateText, Drawer, Field, Form, Pairs, RefName, TextInput, call } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr04001Page({ role, notify }: PageProps) {
  const [drawer, setDrawer] = useState('');
  const [session, setSession] = useState<Row | null>(null);
  const [history, setHistory] = useState<Row[]>([]);
  const [employeeNo, setEmployeeNo] = useState('');
  const [password, setPassword] = useState('');
  const [deviceIdentifier, setDeviceIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const close = () => setDrawer('');

  const login = async () => {
    if (employeeNo.trim() === '' || password === '') {
      throw new Error('사번과 비밀번호를 입력해 주세요.');
    }
    if (deviceIdentifier.trim() === '') {
      throw new Error('기기 식별자를 입력해 주세요.');
    }
    const body: Row = { employeeNo: employeeNo.trim(), password, deviceIdentifier: deviceIdentifier.trim() };
    if (otpCode !== '') {
      body.otpCode = otpCode;
    }
    const res = await call('POST', '/auth/mobile-login', role, body);
    setSession(res);
    setHistory([{ id: history.length + 1, at: new Date().toISOString(), kind: '로그인', name: res.name }, ...history]);
    setPassword('');
    setOtpCode('');
    close();
    notify('로그인했습니다.');
  };

  const logout = async () => {
    await call('POST', '/auth/mobile-logout', role, {});
    setHistory([{ id: history.length + 1, at: new Date().toISOString(), kind: '로그아웃', name: session ? session.name : '' }, ...history]);
    setSession(null);
    close();
    notify('로그아웃했습니다.');
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>모바일 로그인 상태</h2>
        {session ? (
          <Pairs
            items={[
              ['임직원명', String(session.name ?? '')],
              ['임직원', <RefName table="employee" role={role} value={session.employeeId} />],
            ]}
          />
        ) : (
          <p>로그인하지 않았습니다. 로그인 버튼을 눌러 시작해 주세요.</p>
        )}
        <Band>
          {session ? (
            <button onClick={() => setDrawer('logout')}>로그아웃</button>
          ) : (
            <button onClick={() => setDrawer('login')}>로그인</button>
          )}
        </Band>
      </section>
      <section className="box">
        <h2>처리 결과</h2>
        <DataTable
          columns={[
            { key: 'at', label: '처리 시각', render: (r) => <DateText value={r.at} time /> },
            { key: 'kind', label: '구분' },
            { key: 'name', label: '임직원명' },
          ]}
          rows={history}
          empty="아직 처리한 내역이 없습니다. 로그인하면 결과가 여기에 쌓입니다."
        />
      </section>
      {drawer === 'login' && (
        <Drawer title="모바일 로그인" onClose={close}>
          <Form onSubmit={login} submit="로그인">
            <Field label="사번" required>
              <TextInput value={employeeNo} onChange={setEmployeeNo} />
            </Field>
            <Field label="임직원 비밀번호" required>
              <TextInput value={password} onChange={setPassword} />
            </Field>
            <Field label="인증기기 허용 여부 확인용 기기 식별자" required>
              <TextInput value={deviceIdentifier} onChange={setDeviceIdentifier} />
            </Field>
            <Field label="2차 인증 코드">
              <TextInput value={otpCode} onChange={setOtpCode} />
            </Field>
          </Form>
        </Drawer>
      )}
      {drawer === 'logout' && (
        <Drawer title="모바일 로그아웃" onClose={close}>
          <Form onSubmit={logout} submit="로그아웃" danger note="현재 모바일 세션을 종료하고 로그인 화면으로 돌아갑니다." />
        </Drawer>
      )}
    </div>
  );
}
