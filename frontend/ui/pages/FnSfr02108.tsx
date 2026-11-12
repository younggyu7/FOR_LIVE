import { useState } from 'react';
import {
  call, useData, Badge, Num, DateText, Filters, Band, DataTable, Pager, Drawer,
  Form, Field, DateInput, Select, LookupSelect, RefName, ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const TYPE_OPTIONS: [string, string][] = [
  ['REGULAR', '정기급여'],
  ['DAILY', '일용급여'],
  ['SEVERANCE', '퇴직급여'],
];

function typeName(value: unknown): string {
  const found = TYPE_OPTIONS.find((o) => o[0] === value);
  return found ? found[1] : String(value ?? '');
}

export default function FnSfr02108Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [payDate, setPayDate] = useState('');
  const [payrollType, setPayrollType] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [mode, setMode] = useState<'' | 'createRun' | 'editRun' | 'target'>('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [runDate, setRunDate] = useState('');
  const [runType, setRunType] = useState('');
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [targets, setTargets] = useState<Row[]>([]);
  const [removeError, setRemoveError] = useState('');

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/payroll-runs', role, undefined, { ...applied, page, size: 20 }),
    [applied, page, role],
  );

  function close() {
    setMode('');
    setSelected(null);
  }

  function openCreateRun() {
    setRunDate('');
    setRunType('');
    setMode('createRun');
  }

  function openEditRun(row: Row) {
    setSelected(row);
    setRunDate(String(row['payDate'] ?? ''));
    setMode('editRun');
  }

  function openTarget(row: Row) {
    setSelected(row);
    setEmployeeId('');
    setMode('target');
  }

  async function submitCreateRun() {
    if (!runDate) {
      throw new Error('지급일을 입력해 주세요.');
    }
    if (!runType) {
      throw new Error('급여구분을 선택해 주세요.');
    }
    await call('POST', '/payroll-runs', role, { payDate: runDate, payrollType: runType });
    notify('급여 지급일을 등록했습니다.');
    close();
    reload();
  }

  async function submitEditRun() {
    if (!runDate) {
      throw new Error('지급일을 입력해 주세요.');
    }
    await call('PATCH', '/payroll-runs/' + String(selected?.['payrollRunId']), role, { payDate: runDate });
    notify('급여 지급일을 수정했습니다.');
    close();
    reload();
  }

  async function submitTarget() {
    if (employeeId === '') {
      throw new Error('급여 대상 임직원을 선택해 주세요.');
    }
    const created = await call('POST', '/payrolls', role, {
      employeeId,
      payDate: selected?.['payDate'],
    });
    setTargets([created, ...targets]);
    notify('급여 대상자를 지정했습니다.');
    close();
    reload();
  }

  async function removeTarget(row: Row) {
    setRemoveError('');
    try {
      await call('DELETE', '/payrolls/' + String(row['payrollId']), role);
      setTargets(targets.filter((t) => t['payrollId'] !== row['payrollId']));
      notify('급여 대상자를 제외했습니다.');
      reload();
    } catch (e) {
      setRemoveError(e instanceof Error ? e.message : '제외하지 못했습니다.');
    }
  }

  function search() {
    setPage(0);
    setApplied({ payDate, payrollType });
  }

  function reset() {
    setPayDate('');
    setPayrollType('');
    setPage(0);
    setApplied({});
  }

  return (
    <div className='doc'>
      <section className='box'>
        <h2>급여 지급일</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label='지급일'>
            <DateInput value={payDate} onChange={setPayDate} />
          </Field>
          <Field label='급여구분'>
            <Select value={payrollType} onChange={setPayrollType} options={TYPE_OPTIONS} placeholder='전체' />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openCreateRun}>지급일 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        <DataTable
          rows={data?.items ?? []}
          empty='아직 등록한 지급일이 없습니다. 지급일 등록 버튼으로 시작해 주세요.'
          columns={[
            { key: 'payDate', label: '지급일', render: (r) => <DateText value={r['payDate']} /> },
            { key: 'payrollType', label: '급여구분', render: (r) => typeName(r['payrollType']) },
            { key: 'isClosed', label: '마감 여부', render: (r) => <Badge value={r['isClosed'] ? '마감' : '진행'} /> },
            { key: 'targetCount', label: '지급일별 급여 대상자 수', render: (r) => <Num value={r['targetCount']} /> },
            {
              key: 'actions',
              label: '처리',
              render: (r) => (
                <span>
                  {r['isClosed'] ? null : (
                    <button className='ghost' onClick={(e) => { e.stopPropagation(); openEditRun(r); }}>수정</button>
                  )}
                  {r['isClosed'] ? null : (
                    <button className='ghost' onClick={(e) => { e.stopPropagation(); openTarget(r); }}>대상 지정</button>
                  )}
                </span>
              ),
            },
          ]}
        />
        <Pager page={page} size={20} total={data?.total ?? 0} onPage={setPage} />
      </section>

      <section className='box'>
        <h2>이 화면에서 지정한 급여 대상자</h2>
        {removeError ? <ErrorText text={removeError} /> : null}
        <DataTable
          rows={targets}
          empty='아직 지정한 대상자가 없습니다. 지급일 행의 대상 지정 버튼을 눌러 주세요.'
          columns={[
            { key: 'employeeId', label: '임직원 ID', render: (r) => <RefName table='employee' role={role} value={r['employeeId']} /> },
            { key: 'payDate', label: '급여 지급일', render: (r) => <DateText value={r['payDate']} /> },
            {
              key: 'actions',
              label: '처리',
              render: (r) => <button className='ghost' onClick={() => removeTarget(r)}>대상 제외</button>,
            },
          ]}
        />
      </section>

      {mode === 'createRun' ? (
        <Drawer title='급여 지급일 등록' onClose={close}>
          <Form onSubmit={submitCreateRun} submit='등록'>
            <Field label='지급일' required>
              <DateInput value={runDate} onChange={setRunDate} />
            </Field>
            <Field label='급여구분' required>
              <Select value={runType} onChange={setRunType} options={TYPE_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode === 'editRun' ? (
        <Drawer title='급여 지급일 수정' onClose={close}>
          <Form onSubmit={submitEditRun} submit='수정' note='마감된 지급일은 마감을 취소한 뒤에만 수정할 수 있습니다.'>
            <Field label='지급일' required>
              <DateInput value={runDate} onChange={setRunDate} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode === 'target' ? (
        <Drawer title='급여 대상자 지정' onClose={close}>
          <Form onSubmit={submitTarget} submit='지정' note='선택한 지급일의 급여 대상으로 임직원을 지정합니다.'>
            <Field label='급여 지급일'>
              <DateText value={selected?.['payDate']} />
            </Field>
            <Field label='임직원' required>
              <LookupSelect table='employee' role={role} value={employeeId} onChange={setEmployeeId} placeholder='임직원 선택' />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
