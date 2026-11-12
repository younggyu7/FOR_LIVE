import { useState } from 'react';
import { call, useData, Badge, DateText, Filters, Band, DataTable, Pager, Drawer, Form, Field, TextInput, DateInput, Select } from '../kit';
import type { PageProps, Row, Page } from '../kit';

const TYPE_OPTIONS: [string, string][] = [
  ['기본근태', '기본근태'],
  ['근무시간', '근무시간'],
  ['시간외근무', '시간외근무'],
];
const USE_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];

type Mode = { kind: 'create' } | { kind: 'edit'; row: Row } | { kind: 'delete'; row: Row } | null;

export default function FnSfr01701Page({ role, notify }: PageProps) {
  const [standardType, setStandardType] = useState('');
  const [useYn, setUseYn] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [mode, setMode] = useState<Mode>(null);
  const [form, setForm] = useState<Row>({});

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/attendance-standards', role, undefined, { ...applied, page: pageNo, size: 20 }),
    [applied, pageNo, role],
  );

  function setField(key: string, value: unknown) {
    setForm({ ...form, [key]: value });
  }

  function openCreate() {
    setForm({ useYn: '사용' });
    setMode({ kind: 'create' });
  }

  function openEdit(row: Row) {
    setForm({ ...row });
    setMode({ kind: 'edit', row });
  }

  async function submitCreate() {
    if (!form.standardType || !String(form.itemName ?? '').trim()) {
      throw new Error('기준 구분과 기준 항목명을 입력해 주세요.');
    }
    await call('POST', '/attendance-standards', role, {
      standardType: form.standardType,
      itemName: form.itemName,
      standardValue: form.standardValue,
      unit: form.unit,
      useYn: form.useYn,
      applyStartDate: form.applyStartDate,
      applyEndDate: form.applyEndDate,
    });
    setMode(null);
    notify('근태 기준정보를 등록했습니다.');
    reload();
  }

  async function submitEdit(row: Row) {
    if (!String(form.itemName ?? '').trim()) {
      throw new Error('기준 항목명을 입력해 주세요.');
    }
    await call('PATCH', '/attendance-standards/' + row.attendanceStandardId, role, {
      itemName: form.itemName,
      standardValue: form.standardValue,
      unit: form.unit,
      useYn: form.useYn,
      applyStartDate: form.applyStartDate,
      applyEndDate: form.applyEndDate,
    });
    setMode(null);
    notify('근태 기준정보를 수정했습니다.');
    reload();
  }

  async function submitDelete(row: Row) {
    await call('DELETE', '/attendance-standards/' + row.attendanceStandardId, role);
    setMode(null);
    notify('근태 기준정보를 삭제했습니다.');
    reload();
  }

  const columns = [
    { key: 'standardType', label: '기준 구분' },
    { key: 'itemName', label: '기준 항목명' },
    {
      key: 'standardValue',
      label: '기준 값',
      render: (r: Row) => String(r.standardValue ?? '') + (r.unit ? ' ' + String(r.unit) : ''),
    },
    { key: 'useYn', label: '사용 여부', render: (r: Row) => <Badge value={r.useYn} /> },
    {
      key: 'applyStartDate',
      label: '적용 기간',
      render: (r: Row) => (
        <span>
          <DateText value={r.applyStartDate} /> ~ <DateText value={r.applyEndDate} />
        </span>
      ),
    },
    {
      key: 'actions',
      label: '처리',
      render: (r: Row) => (
        <span>
          <button className="ghost" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>수정</button>
          <button className="ghost" onClick={(e) => { e.stopPropagation(); setMode({ kind: 'delete', row: r }); }}>삭제</button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>근태 기준정보 관리</h1>
      <Filters
        onSearch={() => { setPageNo(0); setApplied({ standardType, useYn }); }}
        onReset={() => { setStandardType(''); setUseYn(''); setPageNo(0); setApplied({}); }}
      >
        <Field label="기준 구분">
          <Select value={standardType} onChange={setStandardType} options={TYPE_OPTIONS} placeholder="전체" />
        </Field>
        <Field label="사용 여부">
          <Select value={useYn} onChange={setUseYn} options={USE_OPTIONS} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>기준정보 등록</button>
      </Band>
      {error ? <p>{error}</p> : null}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        empty="아직 등록한 기준정보가 없습니다. 기준정보 등록 버튼으로 첫 기준을 추가해 주세요."
      />
      <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPageNo} />

      {mode && mode.kind === 'create' ? (
        <Drawer title="근태 기준정보 등록" onClose={() => setMode(null)}>
          <Form onSubmit={submitCreate} submit="등록">
            <Field label="기준 구분" required>
              <Select value={form.standardType} onChange={(v) => setField('standardType', v)} options={TYPE_OPTIONS} />
            </Field>
            <Field label="기준 항목명" required>
              <TextInput value={form.itemName} onChange={(v) => setField('itemName', v)} />
            </Field>
            <Field label="기준 값">
              <TextInput value={form.standardValue} onChange={(v) => setField('standardValue', v)} />
            </Field>
            <Field label="단위">
              <TextInput value={form.unit} onChange={(v) => setField('unit', v)} />
            </Field>
            <Field label="사용 여부">
              <Select value={form.useYn} onChange={(v) => setField('useYn', v)} options={USE_OPTIONS} />
            </Field>
            <Field label="적용 시작일">
              <DateInput value={form.applyStartDate} onChange={(v) => setField('applyStartDate', v)} />
            </Field>
            <Field label="적용 종료일">
              <DateInput value={form.applyEndDate} onChange={(v) => setField('applyEndDate', v)} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode && mode.kind === 'edit' ? (
        <Drawer title="근태 기준정보 수정" onClose={() => setMode(null)}>
          <Form onSubmit={() => submitEdit(mode.row)} submit="수정">
            <Field label="기준 구분">
              <span>{String(mode.row.standardType ?? '')}</span>
            </Field>
            <Field label="기준 항목명" required>
              <TextInput value={form.itemName} onChange={(v) => setField('itemName', v)} />
            </Field>
            <Field label="기준 값">
              <TextInput value={form.standardValue} onChange={(v) => setField('standardValue', v)} />
            </Field>
            <Field label="단위">
              <TextInput value={form.unit} onChange={(v) => setField('unit', v)} />
            </Field>
            <Field label="사용 여부">
              <Select value={form.useYn} onChange={(v) => setField('useYn', v)} options={USE_OPTIONS} />
            </Field>
            <Field label="적용 시작일">
              <DateInput value={form.applyStartDate} onChange={(v) => setField('applyStartDate', v)} />
            </Field>
            <Field label="적용 종료일">
              <DateInput value={form.applyEndDate} onChange={(v) => setField('applyEndDate', v)} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode && mode.kind === 'delete' ? (
        <Drawer title="근태 기준정보 삭제" onClose={() => setMode(null)}>
          <Form
            onSubmit={() => submitDelete(mode.row)}
            submit="삭제"
            danger
            note={<p>삭제한 기준정보는 되돌릴 수 없으며 변경 이력만 남습니다.</p>}
          >
            <p>{String(mode.row.standardType ?? '')} / {String(mode.row.itemName ?? '')} 기준정보를 삭제합니다.</p>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
