import { useState } from 'react';
import { call, useData, Band, DataTable, Pager, Drawer, Filters, Field, Form, LookupSelect, NumberInput, DateInput, Select, RefName, Num, DateText } from '../kit';
import type { PageProps, Page, Row } from '../kit';

export default function FnSfr02103Page({ role, notify }: PageProps) {
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [applied, setApplied] = useState<number | string>('');
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('amount');
  const [changeValue, setChangeValue] = useState<number | string>('');
  const [effectiveDate, setEffectiveDate] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/employee-wages', role, undefined, { departmentId: applied, page: pageNo, size: 20 }),
    [applied, pageNo],
  );

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = async () => {
    if (selected.length === 0) {
      throw new Error('변경할 임직원을 목록에서 선택해 주세요.');
    }
    if (changeValue === '' || typeof changeValue !== 'number') {
      throw new Error('변경 값을 숫자로 입력해 주세요.');
    }
    if (!effectiveDate) {
      throw new Error('변경 효력일을 입력해 주세요.');
    }
    const body: Row = { employeeIds: selected, effectiveDate };
    if (mode === 'amount') {
      body.changeAmount = changeValue;
    } else {
      body.changeRate = changeValue;
    }
    const result = await call<Row>('POST', '/employee-wages/bulk-update', role, body);
    notify('책정임금 ' + String(result.updatedCount) + '건을 변경했습니다.');
    setOpen(false);
    setSelected([]);
    setChangeValue('');
    setEffectiveDate('');
    reload();
  };

  const rows = data ? data.items : [];

  return (
    <div className="doc">
      <section className="box">
        <h2>책정임금 현황</h2>
        <Filters
          onSearch={() => {
            setPageNo(0);
            setApplied(departmentId);
          }}
          onReset={() => {
            setDepartmentId('');
            setApplied('');
            setPageNo(0);
          }}
        >
          <Field label="부서 조건">
            <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} placeholder="전체 부서" />
          </Field>
        </Filters>
        <Band total={data ? data.total : undefined}>
          <button onClick={() => setOpen(true)}>선택한 임직원 일괄 변경</button>
        </Band>
        {error ? <p>{error}</p> : null}
        <DataTable
          columns={[
            {
              key: 'select',
              label: '선택',
              render: (row) => (
                <input
                  type="checkbox"
                  checked={selected.includes(Number(row.employeeId))}
                  onChange={() => toggle(Number(row.employeeId))}
                />
              ),
            },
            {
              key: 'employeeName',
              label: '임직원명',
              render: (row) => (
                <span>
                  {String(row.employeeName)} (<RefName table="employee" role={role} value={row.employeeId} />)
                </span>
              ),
            },
            { key: 'effectiveDate', label: '적용일', render: (row) => <DateText value={row.effectiveDate} /> },
            { key: 'wageAmountEnc', label: '책정임금', render: (row) => <Num value={row.wageAmountEnc} /> },
          ]}
          rows={rows}
          empty={loading ? '불러오는 중입니다.' : '조회된 책정임금이 없습니다. 조회 조건을 바꿔 보세요.'}
        />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} /> : null}
      </section>

      {open ? (
        <Drawer title="책정임금 일괄 변경" onClose={() => setOpen(false)}>
          <Form
            onSubmit={submit}
            submit="일괄 변경"
            note={'선택한 임직원 ' + String(selected.length) + '명의 책정임금이 변경되고, 변경 이력이 남습니다.'}
          >
            <Field label="변경 방식" required>
              <Select
                value={mode}
                onChange={setMode}
                options={[
                  ['amount', '변경 금액'],
                  ['rate', '변경 비율(%)'],
                ]}
              />
            </Field>
            <Field label={mode === 'amount' ? '변경 금액' : '변경 비율'} required>
              <NumberInput value={changeValue} onChange={setChangeValue} />
            </Field>
            <Field label="변경 효력일" required>
              <DateInput value={effectiveDate} onChange={setEffectiveDate} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
