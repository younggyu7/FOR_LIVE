import { useState } from 'react';
import { Band, DataTable, DateInput, DateText, Drawer, Field, Filters, Form, LookupSelect, Pager, RefName, TextInput, call, useData } from '../kit';
import type { Column, Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr02105Page({ role, notify }: PageProps) {
  const [draftEmployee, setDraftEmployee] = useState<number | string>('');
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [pageNo, setPageNo] = useState(0);
  const [drawer, setDrawer] = useState<'' | 'setting' | 'calc'>('');
  const [settingValue, setSettingValue] = useState('');
  const [calcEmployee, setCalcEmployee] = useState<number | string>('');
  const [retirementDate, setRetirementDate] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/severance-calculations', role, undefined, { employeeId: employeeId, page: pageNo, size: SIZE }),
    [role, employeeId, pageNo],
  );

  const columns: Column[] = [
    { key: 'severanceCalculationId', label: '퇴직금 산정 ID' },
    { key: 'employeeId', label: '퇴직 임직원', render: (row: Row) => <RefName table="employee" role={role} value={row.employeeId} /> },
    { key: 'retirementDate', label: '퇴직일', render: (row: Row) => <DateText value={row.retirementDate} /> },
    { key: 'severanceAmountEnc', label: '퇴직금 산정액(암호화)', render: (row: Row) => <span>{row.severanceAmountEnc ? String(row.severanceAmountEnc) : '-'}</span> },
    { key: 'estimatedAmountEnc', label: '퇴직금 추계액(암호화)', render: (row: Row) => <span>{row.estimatedAmountEnc ? String(row.estimatedAmountEnc) : '-'}</span> },
  ];

  const search = () => {
    setPageNo(0);
    setEmployeeId(draftEmployee);
  };

  const reset = () => {
    setDraftEmployee('');
    setEmployeeId('');
    setPageNo(0);
  };

  const saveSetting = async () => {
    if (settingValue.trim() === '') {
      throw new Error('퇴직 기준 값을 입력해 주세요.');
    }
    await call('PUT', '/severance-settings', role, { settingValue: settingValue.trim() });
    notify('퇴직기준을 설정했습니다.');
    setSettingValue('');
    setDrawer('');
  };

  const calculate = async () => {
    if (calcEmployee === '') {
      throw new Error('퇴직 임직원을 선택해 주세요.');
    }
    if (retirementDate === '') {
      throw new Error('퇴직일을 입력해 주세요.');
    }
    await call('POST', '/severance-calculations', role, { employeeId: calcEmployee, retirementDate: retirementDate });
    notify('퇴직금을 산정했습니다.');
    setCalcEmployee('');
    setRetirementDate('');
    setDrawer('');
    setPageNo(0);
    reload();
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>퇴직금 산정 현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="대상 임직원">
            <LookupSelect table="employee" role={role} value={draftEmployee} onChange={setDraftEmployee} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button className="ghost" onClick={() => setDrawer('setting')}>퇴직기준 설정</button>
          <button onClick={() => setDrawer('calc')}>퇴직금 산정</button>
        </Band>
        {error ? <p>{error}</p> : null}
        {loading && !data ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          empty="아직 산정한 내역이 없습니다. 퇴직기준을 설정한 뒤 퇴직금을 산정해 주세요."
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      </section>

      {drawer === 'setting' ? (
        <Drawer title="퇴직기준 설정" onClose={() => setDrawer('')}>
          <Form onSubmit={saveSetting} submit="설정 저장" note="저장한 기준은 이후 퇴직금 산정부터 적용됩니다.">
            <Field label="퇴직 기준 값" required wide>
              <TextInput value={settingValue} onChange={setSettingValue} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {drawer === 'calc' ? (
        <Drawer title="퇴직금 산정" onClose={() => setDrawer('')}>
          <Form onSubmit={calculate} submit="산정" note="설정된 퇴직기준에 따라 산정하며, 결과는 암호화해 저장합니다.">
            <Field label="퇴직 임직원" required>
              <LookupSelect table="employee" role={role} value={calcEmployee} onChange={setCalcEmployee} />
            </Field>
            <Field label="퇴직일" required>
              <DateInput value={retirementDate} onChange={setRetirementDate} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
