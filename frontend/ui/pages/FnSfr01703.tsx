import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  Filters,
  LookupSelect,
  RefName,
  TextInput,
  DateInput,
  DateText,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr01703Page({ role, notify }: PageProps) {
  const [draftEmployee, setDraftEmployee] = useState<number | string>('');
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [formEmployee, setFormEmployee] = useState<number | string>('');
  const [formItem, setFormItem] = useState<number | string>('');
  const [formStandard, setFormStandard] = useState('');
  const [formStart, setFormStart] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/employee-attendance-settings', role, undefined, { employeeId, page, size: PAGE_SIZE }),
    [employeeId, page, role],
  );

  function openNew() {
    setFormEmployee(employeeId);
    setFormItem('');
    setFormStandard('');
    setFormStart('');
    setEditing('new');
  }

  function openEdit(row: Row) {
    setFormEmployee(row['employeeId'] as number);
    setFormItem(row['attendanceItemId'] as number);
    setFormStandard(String(row['applyStandard'] ?? ''));
    setFormStart(String(row['applyStartDate'] ?? '').slice(0, 10));
    setEditing(row);
  }

  async function submit() {
    if (formEmployee === '' || formItem === '') {
      throw new Error('임직원과 근태항목을 선택해 주세요.');
    }
    if (editing === 'new') {
      await call('POST', '/employee-attendance-settings', role, {
        employeeId: formEmployee,
        attendanceItemId: formItem,
        applyStandard: formStandard,
        applyStartDate: formStart,
      });
      notify('근태 적용 설정을 등록했습니다.');
    } else if (editing) {
      await call('PUT', '/employee-attendance-settings/' + String(editing['employeeAttendanceSettingId']), role, {
        attendanceItemId: formItem,
        applyStandard: formStandard,
        applyStartDate: formStart,
      });
      notify('근태 적용 설정을 수정했습니다.');
    }
    setEditing(null);
    reload();
  }

  function search() {
    setPage(0);
    setEmployeeId(draftEmployee);
  }

  function reset() {
    setDraftEmployee('');
    setPage(0);
    setEmployeeId('');
  }

  const columns = [
    {
      key: 'employeeId',
      label: '임직원',
      render: (row: Row) => <RefName table='employee' role={role} value={row['employeeId']} />,
    },
    {
      key: 'attendanceItemId',
      label: '근태항목',
      render: (row: Row) => <RefName table='attendance_item' role={role} value={row['attendanceItemId']} />,
    },
    { key: 'applyStandard', label: '적용 근태 기준' },
    {
      key: 'applyStartDate',
      label: '적용 시작일',
      render: (row: Row) => <DateText value={row['applyStartDate']} />,
    },
    {
      key: 'applyEndDate',
      label: '적용 종료일',
      render: (row: Row) => <DateText value={row['applyEndDate']} />,
    },
  ];

  return (
    <div>
      <h1>임직원별 근태 적용 설정</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label='임직원'>
          <LookupSelect table='employee' role={role} value={draftEmployee} onChange={setDraftEmployee} placeholder='전체 임직원' />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openNew}>설정 등록</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      {loading && !data ? <p>불러오는 중입니다.</p> : null}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        onRowClick={openEdit}
        empty='아직 등록한 설정이 없습니다. 설정 등록 버튼으로 첫 설정을 추가해 보세요.'
      />
      <Pager page={page} size={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      {editing ? (
        <Drawer title={editing === 'new' ? '근태 적용 설정 등록' : '근태 적용 설정 수정'} onClose={() => setEditing(null)}>
          <Form onSubmit={submit} submit={editing === 'new' ? '등록' : '수정'}>
            <Field label='임직원' required>
              {editing === 'new' ? (
                <LookupSelect table='employee' role={role} value={formEmployee} onChange={setFormEmployee} />
              ) : (
                <RefName table='employee' role={role} value={formEmployee} />
              )}
            </Field>
            <Field label='근태항목' required>
              <LookupSelect table='attendance_item' role={role} value={formItem} onChange={setFormItem} />
            </Field>
            <Field label='적용 근태 기준'>
              <TextInput value={formStandard} onChange={setFormStandard} />
            </Field>
            <Field label='적용 시작일' hint='비워 두면 오늘 날짜로 등록합니다.'>
              <DateInput value={formStart} onChange={setFormStart} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
