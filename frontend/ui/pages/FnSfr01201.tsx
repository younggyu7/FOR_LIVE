import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const STATUS_OPTIONS: [string, string][] = [
  ['재직자', '재직자'],
  ['퇴직자', '퇴직자'],
];
const SIZE = 20;

export default function FnSfr01201Page({ role, notify }: PageProps) {
  const [status, setStatus] = useState('');
  const [dept, setDept] = useState<number | string>('');
  const [applied, setApplied] = useState<{ status: string; dept: number | string }>({ status: '', dept: '' });
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const { data, error, loading, reload } = useData<Page>(
    () =>
      call<Page>('GET', '/employees', role, undefined, {
        employmentStatus: applied.status,
        departmentId: applied.dept,
        page,
        size: SIZE,
      }),
    [applied, page, role],
  );

  const search = () => {
    setPage(0);
    setApplied({ status, dept });
  };
  const reset = () => {
    setStatus('');
    setDept('');
    setPage(0);
    setApplied({ status: '', dept: '' });
  };

  return (
    <div>
      <h1>임직원 인사정보</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="재직 구분">
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="전체" />
        </Field>
        <Field label="주부서">
          <LookupSelect table="department" role={role} value={dept} onChange={setDept} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={() => setCreating(true)}>임직원 등록</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      <DataTable
        columns={[
          { key: 'employeeNo', label: '사번' },
          { key: 'name', label: '임직원명' },
          {
            key: 'departmentId',
            label: '주부서',
            render: (r) => <RefName table="department" role={role} value={r.departmentId} />,
          },
          { key: 'employmentStatus', label: '재직 구분', render: (r) => <Badge value={r.employmentStatus} /> },
          { key: 'email', label: '이메일' },
        ]}
        rows={data?.items ?? []}
        onRowClick={(r) => setEditing(r)}
        empty={loading ? '불러오는 중입니다.' : '아직 등록한 임직원이 없습니다. 임직원 등록 버튼을 눌러 시작해 주세요.'}
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      {creating ? (
        <CreateDrawer
          role={role}
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            notify('임직원을 등록했습니다.');
            reload();
          }}
        />
      ) : null}
      {editing ? (
        <EditDrawer
          role={role}
          row={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            notify('임직원 인사정보를 수정했습니다.');
            reload();
          }}
        />
      ) : null}
    </div>
  );
}

function CreateDrawer({ role, onClose, onDone }: { role: string; onClose: () => void; onDone: () => void }) {
  const [employeeNo, setEmployeeNo] = useState('');
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [employmentStatus, setEmploymentStatus] = useState('재직자');
  const [email, setEmail] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [residentNo, setResidentNo] = useState('');

  const submit = async () => {
    const missing: string[] = [];
    if (!employeeNo.trim()) missing.push('사번');
    if (!name.trim()) missing.push('임직원명');
    if (departmentId === '') missing.push('주부서');
    if (!employmentStatus) missing.push('재직 구분');
    if (missing.length > 0) {
      throw new Error('필수 항목을 입력해 주세요: ' + missing.join(', '));
    }
    await call('POST', '/employees', role, {
      employeeNo: employeeNo.trim(),
      name: name.trim(),
      departmentId,
      employmentStatus,
      email,
      mobilePhone,
      residentNo,
    });
    onDone();
  };

  return (
    <Drawer title="임직원 등록" onClose={onClose}>
      <Form onSubmit={submit} submit="등록">
        <Field label="사번" required>
          <TextInput value={employeeNo} onChange={setEmployeeNo} />
        </Field>
        <Field label="임직원명" required>
          <TextInput value={name} onChange={setName} />
        </Field>
        <Field label="주부서" required>
          <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} />
        </Field>
        <Field label="재직 구분" required>
          <Select value={employmentStatus} onChange={setEmploymentStatus} options={STATUS_OPTIONS} />
        </Field>
        <Field label="이메일">
          <TextInput value={email} onChange={setEmail} />
        </Field>
        <Field label="휴대전화번호">
          <TextInput value={mobilePhone} onChange={setMobilePhone} />
        </Field>
        <Field label="주민등록번호" hint="암호화하여 저장합니다.">
          <TextInput value={residentNo} onChange={setResidentNo} />
        </Field>
      </Form>
    </Drawer>
  );
}

function EditDrawer({
  role,
  row,
  onClose,
  onDone,
}: {
  role: string;
  row: Row;
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState(String(row.name ?? ''));
  const [departmentId, setDepartmentId] = useState<number | string>((row.departmentId as number) ?? '');
  const [employmentStatus, setEmploymentStatus] = useState(String(row.employmentStatus ?? ''));
  const [email, setEmail] = useState(String(row.email ?? ''));
  const [mobilePhone, setMobilePhone] = useState(String(row.mobilePhone ?? ''));
  const [residentNo, setResidentNo] = useState('');

  const submit = async () => {
    if (!name.trim()) {
      throw new Error('임직원명을 입력해 주세요.');
    }
    if (departmentId === '') {
      throw new Error('주부서를 선택해 주세요.');
    }
    const body: Row = { name: name.trim(), departmentId, employmentStatus, email, mobilePhone };
    if (residentNo.trim()) {
      body.residentNo = residentNo.trim();
    }
    await call('PATCH', '/employees/' + String(row.employeeId), role, body);
    onDone();
  };

  return (
    <Drawer title="임직원 인사정보 수정" onClose={onClose}>
      <Pairs items={[['사번', String(row.employeeNo ?? '')]]} />
      <Form onSubmit={submit} submit="저장">
        <Field label="임직원명" required>
          <TextInput value={name} onChange={setName} />
        </Field>
        <Field label="주부서" required>
          <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} />
        </Field>
        <Field label="재직 구분" required>
          <Select value={employmentStatus} onChange={setEmploymentStatus} options={STATUS_OPTIONS} />
        </Field>
        <Field label="이메일">
          <TextInput value={email} onChange={setEmail} />
        </Field>
        <Field label="휴대전화번호">
          <TextInput value={mobilePhone} onChange={setMobilePhone} />
        </Field>
        <Field label="주민등록번호" hint="바꿀 때만 입력합니다. 암호화하여 저장합니다.">
          <TextInput value={residentNo} onChange={setResidentNo} />
        </Field>
      </Form>
    </Drawer>
  );
}
