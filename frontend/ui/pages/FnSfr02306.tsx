import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateText,
  Drawer,
  Field,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  Pairs,
  RefName,
  Select,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

type DrawerState =
  | { kind: 'itemNew' }
  | { kind: 'itemEdit'; row: Row }
  | { kind: 'dataNew' }
  | { kind: 'dataEdit'; row: Row }
  | null;

function ItemForm({ role, initial, onDone }: { role: string; initial: Row | null; onDone: (row: Row) => void }) {
  const [code, setCode] = useState<unknown>(initial?.code ?? '');
  const [name, setName] = useState<unknown>(initial?.name ?? '');
  const [category, setCategory] = useState<unknown>(initial?.category ?? '');
  const [limitAmount, setLimitAmount] = useState<unknown>(initial?.limitAmount ?? '');
  const [sortOrder, setSortOrder] = useState<unknown>(initial?.sortOrder ?? '');
  const [useYn, setUseYn] = useState<unknown>(initial?.useYn ?? '사용');

  async function submit() {
    if (!String(code).trim()) {
      throw new Error('항목 코드를 입력해 주세요.');
    }
    if (!String(name).trim()) {
      throw new Error('항목명을 입력해 주세요.');
    }
    const body: Row = { code, name, category, limitAmount, sortOrder, useYn };
    const res = initial
      ? await call('PUT', '/year-end-items/' + initial.yearEndItemId, role, body)
      : await call('POST', '/year-end-items', role, body);
    onDone({ ...body, yearEndItemId: res.yearEndItemId });
  }

  return (
    <Form onSubmit={submit} submit={initial ? '항목 수정' : '항목 등록'}>
      <Field label="항목 코드" required>
        <TextInput value={code} onChange={setCode} />
      </Field>
      <Field label="항목명" required>
        <TextInput value={name} onChange={setName} />
      </Field>
      <Field label="항목 분류">
        <TextInput value={category} onChange={setCategory} />
      </Field>
      <Field label="공제 한도액">
        <NumberInput value={limitAmount} onChange={setLimitAmount} />
      </Field>
      <Field label="정렬 순서">
        <NumberInput value={sortOrder} onChange={setSortOrder} />
      </Field>
      <Field label="사용 여부" required>
        <Select value={useYn} onChange={setUseYn} options={[['사용', '사용'], ['미사용', '미사용']]} />
      </Field>
    </Form>
  );
}

function DataForm({ role, initial, onDone }: { role: string; initial: Row | null; onDone: (row: Row) => void }) {
  const [employeeId, setEmployeeId] = useState<unknown>(initial?.employeeId ?? '');
  const [yearEndItemId, setYearEndItemId] = useState<unknown>(initial?.yearEndItemId ?? '');
  const [targetYear, setTargetYear] = useState<unknown>(initial?.targetYear ?? new Date().getFullYear());
  const [amount, setAmount] = useState<unknown>(initial?.amount ?? '');
  const [attachmentId, setAttachmentId] = useState<unknown>(initial?.attachmentId ?? '');
  const [remark, setRemark] = useState<unknown>(initial?.remark ?? '');

  async function submit() {
    if (!initial) {
      const missing: string[] = [];
      if (employeeId === '') {
        missing.push('임직원');
      }
      if (yearEndItemId === '') {
        missing.push('연말정산 항목');
      }
      if (targetYear === '') {
        missing.push('정산 대상 연도');
      }
      if (missing.length > 0) {
        throw new Error('필수 자료가 누락되었습니다: ' + missing.join(', '));
      }
    }
    if (initial) {
      const body: Row = { amount, attachmentId, remark };
      await call('PUT', '/year-end-data/' + initial.yearEndDataId, role, body);
      onDone({ ...initial, ...body });
      return;
    }
    const body: Row = { employeeId, yearEndItemId, targetYear, amount, attachmentId, remark };
    const res = await call('POST', '/year-end-data', role, body);
    onDone({ ...body, ...res });
  }

  return (
    <Form onSubmit={submit} submit={initial ? '자료 수정 및 재계산' : '자료 입력 및 세액 계산'}>
      {initial ? null : (
        <>
          <Field label="임직원" required>
            <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
          </Field>
          <Field label="연말정산 항목" required>
            <LookupSelect table="year_end_item" role={role} value={yearEndItemId} onChange={setYearEndItemId} />
          </Field>
          <Field label="정산 대상 연도" required>
            <NumberInput value={targetYear} onChange={setTargetYear} />
          </Field>
        </>
      )}
      <Field label="금액">
        <NumberInput value={amount} onChange={setAmount} />
      </Field>
      <Field label="증빙 첨부파일">
        <LookupSelect table="attachment" role={role} value={attachmentId} onChange={setAttachmentId} />
      </Field>
      <Field label="비고" wide>
        <TextInput value={remark} onChange={setRemark} multiline />
      </Field>
    </Form>
  );
}

export default function FnSfr02306Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'item' | 'data'>('item');
  const [items, setItems] = useState<Row[]>([]);
  const [dataRows, setDataRows] = useState<Row[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  function saveItem(row: Row, created: boolean) {
    setItems((prev) => {
      const rest = prev.filter((r) => r.yearEndItemId !== row.yearEndItemId);
      return [row, ...rest];
    });
    notify(created ? '연말정산 항목을 등록했습니다.' : '연말정산 항목을 수정했습니다.');
    setDrawer(null);
  }

  function saveData(row: Row, created: boolean) {
    setDataRows((prev) => {
      const rest = prev.filter((r) => r.yearEndDataId !== row.yearEndDataId);
      return [row, ...rest];
    });
    notify(created ? '연말정산 자료를 입력하고 세액을 계산했습니다.' : '연말정산 자료를 수정하고 세액을 다시 계산했습니다.');
    setDrawer(null);
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>연말정산 항목 관리 및 자료 입력</h2>
        <Band total={tab === 'item' ? items.length : dataRows.length}>
          <button className={tab === 'item' ? '' : 'ghost'} onClick={() => setTab('item')}>
            연말정산 항목
          </button>
          <button className={tab === 'data' ? '' : 'ghost'} onClick={() => setTab('data')}>
            연말정산 자료
          </button>
          {tab === 'item' ? (
            <button onClick={() => setDrawer({ kind: 'itemNew' })}>항목 등록</button>
          ) : (
            <button onClick={() => setDrawer({ kind: 'dataNew' })}>자료 입력</button>
          )}
        </Band>
        {tab === 'item' ? (
          <DataTable
            rows={items}
            empty="아직 등록한 항목이 없습니다. 항목 등록 버튼으로 첫 항목을 만들어 주세요."
            onRowClick={(row) => setDrawer({ kind: 'itemEdit', row })}
            columns={[
              { key: 'code', label: '항목 코드' },
              { key: 'name', label: '항목명' },
              { key: 'category', label: '항목 분류' },
              { key: 'limitAmount', label: '공제 한도액', render: (r) => <Num value={r.limitAmount} /> },
              { key: 'useYn', label: '사용 여부', render: (r) => <Badge value={r.useYn} /> },
            ]}
          />
        ) : (
          <DataTable
            rows={dataRows}
            empty="아직 입력한 자료가 없습니다. 자료 입력 버튼으로 대상자의 자료를 입력해 주세요."
            onRowClick={(row) => setDrawer({ kind: 'dataEdit', row })}
            columns={[
              { key: 'employeeId', label: '임직원', render: (r) => <RefName table="employee" role={role} value={r.employeeId} /> },
              { key: 'yearEndItemId', label: '연말정산 항목', render: (r) => <RefName table="year_end_item" role={role} value={r.yearEndItemId} /> },
              { key: 'targetYear', label: '정산 대상 연도' },
              { key: 'amount', label: '금액', render: (r) => <Num value={r.amount} /> },
              { key: 'payableTaxAmount', label: '납부세액', render: (r) => <Num value={r.payableTaxAmount} /> },
            ]}
          />
        )}
      </section>
      {drawer?.kind === 'itemNew' ? (
        <Drawer title="연말정산 항목 등록" onClose={() => setDrawer(null)}>
          <ItemForm role={role} initial={null} onDone={(row) => saveItem(row, true)} />
        </Drawer>
      ) : null}
      {drawer?.kind === 'itemEdit' ? (
        <Drawer title="연말정산 항목 수정" onClose={() => setDrawer(null)}>
          <ItemForm role={role} initial={drawer.row} onDone={(row) => saveItem(row, false)} />
        </Drawer>
      ) : null}
      {drawer?.kind === 'dataNew' ? (
        <Drawer title="연말정산 자료 입력" onClose={() => setDrawer(null)}>
          <DataForm role={role} initial={null} onDone={(row) => saveData(row, true)} />
        </Drawer>
      ) : null}
      {drawer?.kind === 'dataEdit' ? (
        <Drawer title="연말정산 자료 수정" onClose={() => setDrawer(null)}>
          <Pairs
            items={[
              ['임직원', <RefName table="employee" role={role} value={drawer.row.employeeId} />],
              ['연말정산 항목', <RefName table="year_end_item" role={role} value={drawer.row.yearEndItemId} />],
              ['정산 대상 연도', String(drawer.row.targetYear ?? '')],
              ['결정세액', <Num value={drawer.row.determinedTaxAmount} />],
              ['기납부세액', <Num value={drawer.row.paidTaxAmount} />],
              ['납부세액', <Num value={drawer.row.payableTaxAmount} />],
            ]}
          />
          <DataForm role={role} initial={drawer.row} onDone={(row) => saveData(row, false)} />
        </Drawer>
      ) : null}
    </div>
  );
}
