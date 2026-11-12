import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  NumberInput,
  DateInput,
  Select,
  LookupSelect,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const ACTIVE_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];

function StepsView({ role, notify }: PageProps) {
  const [isActive, setIsActive] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [stepGrade, setStepGrade] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [formActive, setFormActive] = useState('사용');

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/salary-steps', role, undefined, { isActive: applied, page, size: 20 }),
    [applied, page, role],
  );

  function openCreate() {
    setStepGrade('');
    setAmount('');
    setFormActive('사용');
    setCreating(true);
  }

  function openEdit(row: Row) {
    setStepGrade(String(row['stepGrade'] ?? ''));
    setAmount(Number(row['amount']));
    setFormActive(String(row['isActive'] ?? '사용'));
    setEditing(row);
  }

  function check() {
    if (stepGrade.trim() === '') {
      throw new Error('호봉 등급을 입력해 주세요.');
    }
    if (amount === '' || Number.isNaN(Number(amount)) || Number(amount) < 0) {
      throw new Error('호봉별 금액을 0 이상의 숫자로 입력해 주세요.');
    }
  }

  async function create() {
    check();
    await call('POST', '/salary-steps', role, { stepGrade, amount, isActive: formActive });
    notify('호봉테이블을 등록했습니다.');
    setCreating(false);
    reload();
  }

  async function update() {
    check();
    await call('PATCH', '/salary-steps/' + String(editing?.['salaryStepId']), role, {
      stepGrade,
      amount,
      isActive: formActive,
    });
    notify('호봉테이블을 수정했습니다. 변경 이력을 남겼습니다.');
    setEditing(null);
    reload();
  }

  const fields = (
    <>
      <Field label="호봉 등급" required>
        <TextInput value={stepGrade} onChange={setStepGrade} />
      </Field>
      <Field label="호봉별 금액" required>
        <NumberInput value={amount} onChange={setAmount} />
      </Field>
      <Field label="사용 여부" required>
        <Select value={formActive} onChange={setFormActive} options={ACTIVE_OPTIONS} />
      </Field>
    </>
  );

  return (
    <div>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(isActive);
        }}
        onReset={() => {
          setIsActive('');
          setApplied('');
          setPage(0);
        }}
      >
        <Field label="사용 여부">
          <Select value={isActive} onChange={setIsActive} options={ACTIVE_OPTIONS} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>호봉 등록</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      <DataTable
        rows={data?.items ?? []}
        empty="아직 등록한 호봉이 없습니다. 호봉 등록 버튼을 눌러 시작해 주세요."
        columns={[
          { key: 'stepGrade', label: '호봉 등급' },
          { key: 'amount', label: '호봉별 금액', render: (r) => <Num value={r['amount']} /> },
          { key: 'isActive', label: '사용 여부', render: (r) => <Badge value={r['isActive']} /> },
          {
            key: 'edit',
            label: '처리',
            render: (r) => (
              <button
                className="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(r);
                }}
              >
                수정
              </button>
            ),
          },
        ]}
      />
      <Pager page={page} size={20} total={data?.total ?? 0} onPage={setPage} />
      {creating ? (
        <Drawer title="호봉 등록" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="등록">
            {fields}
          </Form>
        </Drawer>
      ) : null}
      {editing ? (
        <Drawer title="호봉 수정" onClose={() => setEditing(null)}>
          <Form onSubmit={update} submit="수정" note="수정하면 변경 이력이 남습니다.">
            {fields}
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}

function WagesView({ role, notify }: PageProps) {
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [applied, setApplied] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [salaryStepId, setSalaryStepId] = useState<number | string>('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [wageAmount, setWageAmount] = useState('');

  const { data, error, reload } = useData<Page>(
    () =>
      call<Page>('GET', '/employee-wages', role, undefined, {
        departmentId: applied,
        page,
        size: 20,
      }),
    [applied, page, role],
  );

  function openCreate() {
    setEmployeeId('');
    setSalaryStepId('');
    setEffectiveDate('');
    setWageAmount('');
    setCreating(true);
  }

  async function create() {
    if (employeeId === '') {
      throw new Error('임직원을 선택해 주세요.');
    }
    if (salaryStepId === '') {
      throw new Error('호봉을 선택해 주세요.');
    }
    if (effectiveDate === '') {
      throw new Error('적용일을 입력해 주세요.');
    }
    if (wageAmount.trim() === '') {
      throw new Error('책정임금을 입력해 주세요.');
    }
    await call('POST', '/employee-wages', role, {
      employeeId,
      salaryStepId,
      effectiveDate,
      wageAmount,
    });
    notify('임직원 호봉을 지정했습니다.');
    setCreating(false);
    reload();
  }

  return (
    <div>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(departmentId);
        }}
        onReset={() => {
          setDepartmentId('');
          setApplied('');
          setPage(0);
        }}
      >
        <Field label="부서 조건">
          <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>호봉 지정</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      <DataTable
        rows={data?.items ?? []}
        empty="아직 지정한 임직원 호봉이 없습니다. 호봉 지정 버튼을 눌러 시작해 주세요."
        columns={[
          { key: 'employeeName', label: '임직원명' },
          { key: 'effectiveDate', label: '적용일', render: (r) => <DateText value={r['effectiveDate']} /> },
        ]}
      />
      <Pager page={page} size={20} total={data?.total ?? 0} onPage={setPage} />
      {creating ? (
        <Drawer title="임직원 호봉 지정" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="지정">
            <Field label="임직원" required>
              <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
            </Field>
            <Field label="호봉" required>
              <LookupSelect table="salary_step" role={role} value={salaryStepId} onChange={setSalaryStepId} />
            </Field>
            <Field label="적용일" required>
              <DateInput value={effectiveDate} onChange={setEffectiveDate} />
            </Field>
            <Field label="책정임금(암호화)" required>
              <TextInput value={wageAmount} onChange={setWageAmount} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}

export default function FnSfr02111Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'steps' | 'wages'>('steps');
  return (
    <div className="doc">
      <section className="box">
        <h2>호봉테이블 및 임직원 호봉 현황</h2>
        <button className={tab === 'steps' ? '' : 'ghost'} onClick={() => setTab('steps')}>
          호봉테이블
        </button>
        <button className={tab === 'wages' ? '' : 'ghost'} onClick={() => setTab('wages')}>
          임직원 호봉 현황
        </button>
      </section>
      {tab === 'steps' ? (
        <StepsView role={role} notify={notify} />
      ) : (
        <WagesView role={role} notify={notify} />
      )}
    </div>
  );
}
