import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  Pager,
  Drawer,
  Filters,
  Form,
  Field,
  NumberInput,
  Select,
  LookupSelect,
  RefName,
  Num,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr03702Page({ role, notify }: PageProps) {
  const [filterEmployee, setFilterEmployee] = useState<number | string>('');
  const [appliedEmployee, setAppliedEmployee] = useState<number | string>('');
  const [pageNo, setPageNo] = useState(0);
  const [editing, setEditing] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [twoFactor, setTwoFactor] = useState('');
  const [count, setCount] = useState<number | string>('');

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/auth-settings', role, undefined, {
      employeeId: appliedEmployee,
      page: pageNo,
      size: PAGE_SIZE,
    }),
    [appliedEmployee, pageNo, role],
  );

  function openEditor(row?: Row) {
    setEmployeeId(row && row['employeeId'] != null ? (row['employeeId'] as number) : '');
    setTwoFactor('');
    setCount(row && row['allowedDeviceCount'] != null ? (row['allowedDeviceCount'] as number) : '');
    setEditing(true);
  }

  async function save() {
    if (twoFactor === '') {
      throw new Error('2차 인증 대상 여부를 선택해 주세요.');
    }
    if (count === '') {
      throw new Error('허용 인증기기 수를 입력해 주세요.');
    }
    const body: Row = {
      employeeId: employeeId === '' ? null : employeeId,
      twoFactorRequired: twoFactor === 'true',
      allowedDeviceCount: count,
    };
    await call('PUT', '/auth-settings', role, body);
    notify('인증 설정을 저장했습니다.');
    setEditing(false);
    reload();
  }

  return (
    <div>
      <h2>인증 대상·허용 인증기기 수 설정</h2>
      <Filters
        onSearch={() => {
          setPageNo(0);
          setAppliedEmployee(filterEmployee);
        }}
        onReset={() => {
          setFilterEmployee('');
          setAppliedEmployee('');
          setPageNo(0);
        }}
      >
        <Field label="인증 대상 임직원 ID">
          <LookupSelect
            table="employee"
            role={role}
            value={filterEmployee}
            onChange={setFilterEmployee}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {error ? <ErrorText text={error} /> : null}
      <Band total={data?.total}>
        <button onClick={() => openEditor()}>설정 저장하기</button>
      </Band>
      <DataTable
        columns={[
          {
            key: 'employeeId',
            label: '인증 대상 임직원 ID',
            render: (row) =>
              row['employeeId'] == null ? (
                <span>기본 설정</span>
              ) : (
                <RefName table="employee" role={role} value={row['employeeId']} />
              ),
          },
          {
            key: 'allowedDeviceCount',
            label: '허용 인증기기 수',
            render: (row) => <Num value={row['allowedDeviceCount']} />,
          },
        ]}
        rows={data?.items ?? []}
        onRowClick={(row) => openEditor(row)}
        empty="아직 등록한 인증 설정이 없습니다. 설정 저장하기 버튼으로 첫 설정을 만들어 주세요."
      />
      <Pager page={pageNo} size={PAGE_SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      {editing ? (
        <Drawer title="인증 대상·허용 인증기기 수 저장" onClose={() => setEditing(false)}>
          <Form
            onSubmit={save}
            submit="저장"
            note="변경한 허용 인증기기 수는 이후 로그인과 인증기기 승인부터 적용됩니다. 임직원을 고르지 않으면 기본 설정으로 저장합니다."
          >
            <Field label="인증 대상 임직원 ID" wide>
              <LookupSelect
                table="employee"
                role={role}
                value={employeeId}
                onChange={setEmployeeId}
                placeholder="기본 설정"
              />
            </Field>
            <Field label="2차 인증 대상 여부" required>
              <Select
                value={twoFactor}
                onChange={setTwoFactor}
                options={[
                  ['true', '대상'],
                  ['false', '대상 아님'],
                ]}
              />
            </Field>
            <Field label="허용 인증기기 수" required hint="0 이상의 정수">
              <NumberInput value={count} onChange={setCount} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
