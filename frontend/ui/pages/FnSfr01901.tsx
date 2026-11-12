import { useState } from 'react';
import { Badge, Band, DataTable, Drawer, Field, Form, Num, NumberInput, Pager, Pairs, Select, TextInput, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const PAGE_SIZE = 20;

type Mode = { kind: 'create' } | { kind: 'edit'; row: Row } | { kind: 'delete'; row: Row } | null;

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function isNonNegative(v: unknown): boolean {
  return typeof v === 'number' ? Number.isFinite(v) && v >= 0 : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0;
}

function RuleForm({ role, row, onDone, onClose, notify }: { role: string; row?: Row; onDone: () => void; onClose: () => void; notify: (text: string) => void }) {
  const [name, setName] = useState(String(row?.name ?? ''));
  const [baseDays, setBaseDays] = useState<unknown>(row?.baseDays ?? '');
  const [additionalDays, setAdditionalDays] = useState<unknown>(row?.additionalDays ?? '');
  const [additionalCondition, setAdditionalCondition] = useState(String(row?.additionalCondition ?? ''));
  const [useStatus, setUseStatus] = useState(String(row?.useStatus ?? '사용'));

  async function submit() {
    if (name.trim() === '') {
      throw new Error('기준명을 입력해 주세요.');
    }
    if (!isNonNegative(baseDays)) {
      throw new Error('기본 일수를 0 이상의 숫자로 입력해 주세요.');
    }
    if (!isBlank(additionalDays) && !isNonNegative(additionalDays)) {
      throw new Error('가산 일수는 0 이상의 숫자로 입력해 주세요.');
    }
    const body: Row = {
      name: name.trim(),
      baseDays,
      additionalDays: isBlank(additionalDays) ? null : additionalDays,
      additionalCondition: additionalCondition === '' ? null : additionalCondition,
      useStatus,
    };
    if (row) {
      await call('PUT', '/leave-grant-rules/' + String(row.leaveGrantRuleId), role, body);
      notify('연차 생성 기준을 수정했습니다.');
    } else {
      await call('POST', '/leave-grant-rules', role, body);
      notify('연차 생성 기준을 등록했습니다.');
    }
    onDone();
    onClose();
  }

  return (
    <Form onSubmit={submit} submit={row ? '수정' : '등록'} note="기준 변경은 이미 확정된 연차에는 적용되지 않고, 이후 생성되는 연차부터 적용됩니다.">
      <Field label="기준명" required>
        <TextInput value={name} onChange={setName} />
      </Field>
      <Field label="기본일수" required>
        <NumberInput value={baseDays} onChange={setBaseDays} />
      </Field>
      <Field label="가산일수">
        <NumberInput value={additionalDays} onChange={setAdditionalDays} />
      </Field>
      <Field label="가산 조건" wide>
        <TextInput value={additionalCondition} onChange={setAdditionalCondition} multiline />
      </Field>
      <Field label="사용 여부">
        <Select value={useStatus} onChange={setUseStatus} options={[['사용', '사용'], ['미사용', '미사용']]} />
      </Field>
    </Form>
  );
}

export default function FnSfr01901Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<Mode>(null);
  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/leave-grant-rules', role, undefined, { page, size: PAGE_SIZE }),
    [role, page],
  );

  async function remove(row: Row) {
    await call('DELETE', '/leave-grant-rules/' + String(row.leaveGrantRuleId), role);
    notify('연차 생성 기준을 삭제했습니다.');
    setMode(null);
    reload();
  }

  const columns = [
    { key: 'name', label: '기준명' },
    { key: 'baseDays', label: '기본일수', render: (r: Row) => <Num value={r.baseDays} /> },
    { key: 'additionalDays', label: '가산일수', render: (r: Row) => <Num value={r.additionalDays} /> },
    { key: 'useStatus', label: '사용 여부', render: (r: Row) => <Badge value={r.useStatus} /> },
    {
      key: 'actions',
      label: '처리',
      render: (r: Row) => (
        <span>
          <button className="ghost" onClick={(e) => { e.stopPropagation(); setMode({ kind: 'edit', row: r }); }}>수정</button>
          <button className="ghost" onClick={(e) => { e.stopPropagation(); setMode({ kind: 'delete', row: r }); }}>삭제</button>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>연차 생성 기준 환경설정</h1>
      <p>연차를 생성할 때 적용하는 기본 일수와 가산 일수 기준을 관리합니다. 사용 상태인 기준만 연차 생성에 적용됩니다.</p>
      <Band total={data?.total}>
        <button onClick={() => setMode({ kind: 'create' })}>기준 등록</button>
      </Band>
      {error !== '' && <p>{error}</p>}
      {loading && !data && <p>불러오는 중입니다.</p>}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        onRowClick={(r) => setMode({ kind: 'edit', row: r })}
        empty="아직 등록한 연차 생성 기준이 없습니다. 기준 등록 버튼으로 첫 기준을 추가해 주세요."
      />
      <Pager page={page} size={data?.size ?? PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      {mode?.kind === 'create' && (
        <Drawer title="연차 생성 기준 등록" onClose={() => setMode(null)}>
          <RuleForm role={role} onDone={reload} onClose={() => setMode(null)} notify={notify} />
        </Drawer>
      )}
      {mode?.kind === 'edit' && (
        <Drawer title="연차 생성 기준 수정" onClose={() => setMode(null)}>
          <RuleForm role={role} row={mode.row} onDone={reload} onClose={() => setMode(null)} notify={notify} />
        </Drawer>
      )}
      {mode?.kind === 'delete' && (
        <Drawer title="연차 생성 기준 삭제" onClose={() => setMode(null)}>
          <Pairs
            items={[
              ['기준명', String(mode.row.name ?? '')],
              ['기본일수', <Num value={mode.row.baseDays} />],
              ['가산일수', <Num value={mode.row.additionalDays} />],
              ['가산 조건', String(mode.row.additionalCondition ?? '')],
              ['사용 여부', <Badge value={mode.row.useStatus} />],
            ]}
          />
          <Form
            onSubmit={() => remove(mode.row)}
            submit="삭제"
            danger
            note="삭제한 기준은 되돌릴 수 없습니다. 이미 확정된 연차에는 영향을 주지 않습니다."
          />
        </Drawer>
      )}
    </div>
  );
}
