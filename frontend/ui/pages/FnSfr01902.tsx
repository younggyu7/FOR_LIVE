import { useState } from 'react';
import { call, Band, DataTable, Drawer, Form, Field, NumberInput, LookupSelect, RefName, Badge, Num, DateText, Pairs } from '../kit';
import type { PageProps, Row, Page } from '../kit';

type Drawing =
  | { kind: 'generate' }
  | { kind: 'edit'; row: Row }
  | { kind: 'delete'; row: Row }
  | { kind: 'confirm'; ids: number[] }
  | null;

export default function FnSfr01902Page({ role, notify }: PageProps) {
  // 조회 API가 없어 이 화면에서 생성·확정한 결과를 목록으로 보인다.
  const [rows, setRows] = useState<Row[]>([]);
  const [drawer, setDrawer] = useState<Drawing>(null);
  const [employeeIds, setEmployeeIds] = useState<number[]>([]);
  const [pick, setPick] = useState<number | string>('');
  const [baseYear, setBaseYear] = useState<number | string>('');
  const [grantedDays, setGrantedDays] = useState<number | string>('');

  const unconfirmedIds = rows
    .filter((r) => r['isConfirmed'] !== true)
    .map((r) => Number(r['annualLeaveId']));

  function openGenerate() {
    setEmployeeIds([]);
    setPick('');
    setBaseYear('');
    setGrantedDays('');
    setDrawer({ kind: 'generate' });
  }

  function openEdit(row: Row) {
    setGrantedDays(row['grantedDays'] as number);
    setDrawer({ kind: 'edit', row });
  }

  function addEmployee() {
    if (pick === '' || typeof pick !== 'number') {
      return;
    }
    if (!employeeIds.includes(pick)) {
      setEmployeeIds([...employeeIds, pick]);
    }
    setPick('');
  }

  async function generate() {
    if (employeeIds.length === 0) {
      throw new Error('대상 임직원을 한 명 이상 추가해 주세요.');
    }
    if (baseYear === '') {
      throw new Error('기준연도를 입력해 주세요.');
    }
    const body: Row = { employeeIds, baseYear: Number(baseYear) };
    if (grantedDays !== '') {
      body['grantedDays'] = grantedDays;
    }
    const res = await call<Page>('POST', '/annual-leaves/generate', role, body);
    const added = res.items.map((item) => ({ ...item, baseYear: Number(baseYear) }));
    setRows([...added, ...rows]);
    setDrawer(null);
    notify('연차를 생성했습니다.');
  }

  async function confirm(ids: number[]) {
    const res = await call<Page>('POST', '/annual-leaves/confirm', role, { annualLeaveIds: ids });
    setRows(
      rows.map((r) => {
        const done = res.items.find((i) => i['annualLeaveId'] === r['annualLeaveId']);
        return done ? { ...r, isConfirmed: done['isConfirmed'], confirmedAt: done['confirmedAt'] } : r;
      }),
    );
    setDrawer(null);
    notify('연차를 확정했습니다.');
  }

  async function update(row: Row) {
    if (grantedDays === '') {
      throw new Error('생성일수를 입력해 주세요.');
    }
    await call('PUT', '/annual-leaves/' + String(row['annualLeaveId']), role, { grantedDays });
    setRows(rows.map((r) => (r['annualLeaveId'] === row['annualLeaveId'] ? { ...r, grantedDays } : r)));
    setDrawer(null);
    notify('생성일수를 수정했습니다.');
  }

  async function remove(row: Row) {
    await call('DELETE', '/annual-leaves/' + String(row['annualLeaveId']), role);
    setRows(rows.filter((r) => r['annualLeaveId'] !== row['annualLeaveId']));
    setDrawer(null);
    notify('연차를 삭제했습니다.');
  }

  return (
    <div className="doc">
      <h1>연차 생성 및 확정</h1>
      <Band total={rows.length}>
        <button type="button" className="ghost" disabled={unconfirmedIds.length === 0} onClick={() => setDrawer({ kind: 'confirm', ids: unconfirmedIds })}>
          미확정 연차 모두 확정
        </button>
        <button type="button" onClick={openGenerate}>연차 생성</button>
      </Band>
      <DataTable
        rows={rows}
        empty="아직 생성한 연차가 없습니다. '연차 생성'을 눌러 기준 연도와 대상 임직원을 선택해 주세요."
        columns={[
          { key: 'employeeId', label: '임직원', render: (r) => <RefName table="employee" role={role} value={r['employeeId']} /> },
          { key: 'baseYear', label: '기준연도' },
          { key: 'grantedDays', label: '생성일수', render: (r) => <Num value={r['grantedDays']} /> },
          {
            key: 'isConfirmed',
            label: '확정 여부',
            render: (r) => <Badge value={r['isConfirmed'] === true ? '확정' : '미확정'} />,
          },
          {
            key: 'actions',
            label: '처리',
            render: (r) =>
              r['isConfirmed'] === true ? (
                <DateText value={r['confirmedAt']} time />
              ) : (
                <span>
                  <button type="button" className="ghost" onClick={() => setDrawer({ kind: 'confirm', ids: [Number(r['annualLeaveId'])] })}>확정</button>
                  <button type="button" className="ghost" onClick={() => openEdit(r)}>수정</button>
                  <button type="button" className="ghost" onClick={() => setDrawer({ kind: 'delete', row: r })}>삭제</button>
                </span>
              ),
          },
        ]}
      />
      {drawer && drawer.kind === 'generate' && (
        <Drawer title="연차 생성" onClose={() => setDrawer(null)}>
          <Form submit="생성" onSubmit={generate}>
            <Field label="기준연도" required>
              <NumberInput value={baseYear} onChange={setBaseYear} />
            </Field>
            <Field label="대상 임직원" required wide hint="임직원을 고른 뒤 추가를 누르세요.">
              <LookupSelect table="employee" role={role} value={pick} onChange={setPick} placeholder="임직원 선택" />
              <button type="button" className="ghost" onClick={addEmployee}>추가</button>
            </Field>
            <Pairs
              items={employeeIds.map((id, i): [string, JSX.Element] => [
                String(i + 1),
                <span key={id}>
                  <RefName table="employee" role={role} value={id} />
                  <button type="button" className="ghost" onClick={() => setEmployeeIds(employeeIds.filter((e) => e !== id))}>빼기</button>
                </span>,
              ])}
            />
            <Field label="조정 생성 일수" hint="비우면 연차 생성 기준의 기본일수로 생성합니다.">
              <NumberInput value={grantedDays} onChange={setGrantedDays} />
            </Field>
          </Form>
        </Drawer>
      )}
      {drawer && drawer.kind === 'edit' && (
        <Drawer title="생성일수 수정" onClose={() => setDrawer(null)}>
          <Form submit="수정" onSubmit={() => update(drawer.row)}>
            <Field label="임직원">
              <RefName table="employee" role={role} value={drawer.row['employeeId']} />
            </Field>
            <Field label="생성일수" required>
              <NumberInput value={grantedDays} onChange={setGrantedDays} />
            </Field>
          </Form>
        </Drawer>
      )}
      {drawer && drawer.kind === 'confirm' && (
        <Drawer title="연차 확정" onClose={() => setDrawer(null)}>
          <Form
            submit="확정"
            danger
            note={'선택한 ' + String(drawer.ids.length) + '건을 확정합니다. 확정한 연차는 직접 수정하거나 삭제할 수 없고, 변경은 정해진 절차를 따라야 합니다.'}
            onSubmit={() => confirm(drawer.ids)}
          />
        </Drawer>
      )}
      {drawer && drawer.kind === 'delete' && (
        <Drawer title="연차 삭제" onClose={() => setDrawer(null)}>
          <Form
            submit="삭제"
            danger
            note="삭제한 연차는 되돌릴 수 없습니다."
            onSubmit={() => remove(drawer.row)}
          >
            <Field label="임직원">
              <RefName table="employee" role={role} value={drawer.row['employeeId']} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
