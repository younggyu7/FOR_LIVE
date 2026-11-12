import { useState } from 'react';
import {
  Band,
  DataTable,
  Drawer,
  Field,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  Pager,
  RefName,
  TextInput,
  Tiles,
  call,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr02107Page({ role, notify }: PageProps) {
  const [open, setOpen] = useState(false);
  const [raiseRate, setRaiseRate] = useState<number | string>('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [idsText, setIdsText] = useState('');
  const [cond, setCond] = useState<Row | undefined>(undefined);
  const [result, setResult] = useState<Page | undefined>(undefined);

  const run = async (body: Row, page: number) => {
    const res = await call<Page>('POST', '/payroll-simulations', role, body, { page, size: SIZE });
    setCond(body);
    setResult(res);
  };

  const submit = async () => {
    if (raiseRate === '' || typeof raiseRate !== 'number') {
      throw new Error('인상률을 숫자로 입력해 주세요.');
    }
    const body: Row = { raiseRate };
    if (departmentId !== '') {
      body.departmentId = departmentId;
    }
    const ids = idsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map((s) => Number(s));
    if (ids.some((n) => !Number.isInteger(n))) {
      throw new Error('임직원 ID는 쉼표로 구분한 숫자로 입력해 주세요.');
    }
    if (ids.length > 0) {
      body.employeeIds = ids;
    }
    await run(body, 0);
    setOpen(false);
    notify('급여 시뮬레이션을 계산했습니다.');
  };

  const items = result ? result.items : [];
  const totalLaborCost = items.length > 0 ? items[0].totalLaborCost : 0;

  return (
    <div>
      <h1>급여 시뮬레이션</h1>
      <Band total={result ? result.total : 0}>
        <button onClick={() => setOpen(true)}>시뮬레이션 실행</button>
      </Band>
      {result && <Tiles items={[['예상 인건비 합계', <Num value={totalLaborCost} />]]} />}
      <DataTable
        columns={[
          {
            key: 'employeeId',
            label: '임직원',
            render: (row) => <RefName table="employee" role={role} value={row.employeeId} />,
          },
          { key: 'expectedPay', label: '예상 급여', render: (row) => <Num value={row.expectedPay} /> },
          {
            key: 'totalLaborCost',
            label: '예상 인건비 합계',
            render: (row) => <Num value={row.totalLaborCost} />,
          },
        ]}
        rows={items}
        empty="아직 계산한 결과가 없습니다. 시뮬레이션 실행 버튼을 눌러 조건을 입력해 주세요."
      />
      {result && cond && (
        <Pager
          page={result.page}
          size={result.size}
          total={result.total}
          onPage={(p) => {
            void run(cond, p);
          }}
        />
      )}
      {open && (
        <Drawer title="급여 시뮬레이션 조건" onClose={() => setOpen(false)}>
          <Form
            onSubmit={submit}
            submit="계산"
            note="계산 결과는 실제 급여 데이터에 반영되지 않으며, 급여 개인정보 열람 이력이 기록됩니다. 인상률은 0.05처럼 소수로 입력합니다."
          >
            <Field label="인상률 또는 변경 조건" required>
              <NumberInput value={raiseRate} onChange={setRaiseRate} />
            </Field>
            <Field label="대상 부서">
              <LookupSelect
                table="department"
                role={role}
                value={departmentId}
                onChange={setDepartmentId}
              />
            </Field>
            <Field label="대상 임직원 ID 목록" hint="쉼표로 구분합니다. 비우면 전체 재직자가 대상입니다." wide>
              <TextInput value={idsText} onChange={setIdsText} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
