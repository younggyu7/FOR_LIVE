import { useState } from 'react';
import { Band, DataTable, DateInput, DateText, Drawer, Field, Form, LookupSelect, Num, Pairs, RefName, Select, Tiles, TextInput, call } from '../kit';
import type { PageProps } from '../kit';

const ITEM_OPTIONS: [string, string][] = [
  ['hireDate', '입사일'],
  ['recruitmentType', '채용 구분'],
  ['recruitmentNote', '채용 정보 비고'],
  ['veteranInfo', '보훈 정보'],
  ['militaryServiceInfo', '병역 정보'],
  ['employmentStatus', '재직 구분'],
  ['resignationDate', '퇴사일'],
];

const STATUS_OPTIONS: [string, string][] = [
  ['재직자', '재직자'],
  ['퇴직자', '퇴직자'],
];

interface FailureItem {
  employeeId: number;
  reason: string;
}

interface Result {
  successCount: number;
  failureCount: number;
  failures: FailureItem[];
}

interface Run extends Result {
  no: number;
  itemName: string;
  value: string;
  at: string;
  [key: string]: unknown;
}

function itemLabel(item: string): string {
  const found = ITEM_OPTIONS.find((o) => o[0] === item);
  return found ? found[1] : item;
}

export default function FnSfr01203Page({ role, notify }: PageProps) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Run | null>(null);
  const [ids, setIds] = useState<number[]>([]);
  const [pick, setPick] = useState<number | string>('');
  const [item, setItem] = useState('');
  const [value, setValue] = useState('');

  function addEmployee(v: number | string) {
    if (v === '') {
      return;
    }
    const n = Number(v);
    if (!ids.includes(n)) {
      setIds([...ids, n]);
    }
    setPick('');
  }

  function openDrawer() {
    setIds([]);
    setPick('');
    setItem('');
    setValue('');
    setOpen(true);
  }

  async function submit() {
    if (ids.length === 0) {
      throw new Error('변경할 임직원을 한 명 이상 선택해 주세요.');
    }
    if (item === '') {
      throw new Error('변경할 인사정보 항목을 선택해 주세요.');
    }
    if (value.trim() === '') {
      throw new Error('적용할 값을 입력해 주세요.');
    }
    const res = await call<Result>('POST', '/personnel-records/bulk-update', role, {
      employeeIds: ids,
      changeItem: item,
      changeValue: value.trim(),
    });
    const run: Run = {
      no: runs.length + 1,
      itemName: itemLabel(item),
      value: value.trim(),
      at: new Date().toISOString(),
      successCount: res.successCount,
      failureCount: res.failureCount,
      failures: res.failures || [],
    };
    setRuns([run, ...runs]);
    setOpen(false);
    setDetail(run);
    notify('인사정보를 일괄 변경했습니다.');
  }

  function valueInput() {
    if (item === 'hireDate' || item === 'resignationDate') {
      return <DateInput value={value} onChange={setValue} />;
    }
    if (item === 'employmentStatus') {
      return <Select value={value} onChange={setValue} options={STATUS_OPTIONS} />;
    }
    return <TextInput value={value} onChange={setValue} />;
  }

  if (detail) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setDetail(null)}>목록으로</button>
        <section className="box">
          <h2>변경 내용</h2>
          <Pairs items={[
            ['변경 항목', detail.itemName],
            ['적용한 값', detail.value],
          ]} />
        </section>
        <section className="box">
          <h2>변경 결과</h2>
          <Tiles items={[
            ['성공', <Num value={detail.successCount} />],
            ['실패', <Num value={detail.failureCount} />],
          ]} />
        </section>
        <section className="box">
          <h2>실패 사유</h2>
          <DataTable<FailureItem & Record<string, unknown>>
            columns={[
              { key: 'employeeId', label: '임직원', render: (r) => <RefName table="employee" role={role} value={r.employeeId} /> },
              { key: 'reason', label: '사유' },
            ]}
            rows={detail.failures as (FailureItem & Record<string, unknown>)[]}
            empty="실패한 건이 없습니다."
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>인사정보 일괄 변경</h1>
      <Band total={runs.length}>
        <button onClick={openDrawer}>일괄 변경</button>
      </Band>
      <DataTable<Run>
        columns={[
          { key: 'no', label: '순번' },
          { key: 'at', label: '처리 일시', render: (r) => <DateText value={r.at} time /> },
          { key: 'itemName', label: '변경 항목' },
          { key: 'successCount', label: '성공', render: (r) => <Num value={r.successCount} /> },
          { key: 'failureCount', label: '실패', render: (r) => <Num value={r.failureCount} /> },
        ]}
        rows={runs}
        onRowClick={(r) => setDetail(r)}
        empty="아직 일괄 변경한 내역이 없습니다. 위의 일괄 변경 버튼으로 시작해 주세요."
      />
      {open && (
        <Drawer title="인사정보 일괄 변경" onClose={() => setOpen(false)}>
          <Form
            onSubmit={submit}
            submit="일괄 변경"
            note="선택한 모든 임직원에게 같은 값이 적용되며, 반영에 실패한 건만 제외하고 나머지는 변경됩니다."
          >
            <Field label="변경 대상 임직원" required wide hint="한 명씩 골라 목록에 담습니다.">
              <LookupSelect table="employee" role={role} value={pick} onChange={addEmployee} placeholder="임직원 선택" />
            </Field>
            <Field label="선택한 임직원" wide>
              <div>
                {ids.length === 0 && <p>아직 선택한 임직원이 없습니다.</p>}
                {ids.map((id) => (
                  <div key={id}>
                    <RefName table="employee" role={role} value={id} />
                    <button type="button" className="ghost" onClick={() => setIds(ids.filter((x) => x !== id))}>제외</button>
                  </div>
                ))}
              </div>
            </Field>
            <Field label="변경할 인사정보 항목" required>
              <Select value={item} onChange={(v) => { setItem(v); setValue(''); }} options={ITEM_OPTIONS} />
            </Field>
            <Field label="적용할 값" required>
              {valueInput()}
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
