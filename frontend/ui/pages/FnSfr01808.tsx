import { useState } from 'react';
import {
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Filters,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  Pager,
  RefName,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

function LeaveTab({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [applying, setApplying] = useState(false);
  const [form, setForm] = useState<Row>({});
  const list = useData<Page>(
    () => call<Page>('GET', '/annual-leaves', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page],
  );
  const rows = list.data?.items ?? [];
  return (
    <section className="box">
      <h2>잔여 연차와 집계현황</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(draft);
        }}
        onReset={() => {
          setPage(0);
          setDraft({});
          setApplied({});
        }}
      >
        <Field label="임직원">
          <LookupSelect
            table="employee"
            role={role}
            value={draft.employeeId}
            onChange={(v) => setDraft({ ...draft, employeeId: v })}
          />
        </Field>
        <Field label="기준연도">
          <NumberInput value={draft.baseYear} onChange={(v) => setDraft({ ...draft, baseYear: v })} />
        </Field>
        <Field label="부서 ID">
          <LookupSelect
            table="department"
            role={role}
            value={draft.departmentId}
            onChange={(v) => setDraft({ ...draft, departmentId: v })}
          />
        </Field>
      </Filters>
      <Band total={list.data?.total}>
        <button onClick={() => setApplying(true)}>연차 신청</button>
      </Band>
      <DataTable
        rows={rows}
        empty="조건에 맞는 연차가 없습니다. 조건을 바꿔 다시 조회해 주세요."
        columns={[
          {
            key: 'employeeId',
            label: '임직원',
            render: (r) => <RefName table="employee" role={role} value={r.employeeId} />,
          },
          { key: 'baseYear', label: '기준연도' },
          { key: 'grantedDays', label: '생성일수', render: (r) => <Num value={r.grantedDays} /> },
          { key: 'usedDays', label: '사용일수', render: (r) => <Num value={r.usedDays} /> },
          { key: 'remainingDays', label: '잔여일수', render: (r) => <Num value={r.remainingDays} /> },
        ]}
      />
      <Pager page={page} size={SIZE} total={list.data?.total ?? 0} onPage={setPage} />
      {applying && (
        <Drawer title="연차 신청" onClose={() => setApplying(false)}>
          <Form
            submit="신청하고 결재 상신"
            note="신청한 연차는 결재가 끝나기 전까지 사용 내역에 반영되지 않습니다."
            onSubmit={async () => {
              if (!form.startDate || !form.endDate) {
                throw new Error('시작일과 종료일을 입력해 주세요.');
              }
              await call('POST', '/attendance-requests', role, {
                attendanceType: '연차',
                startDate: form.startDate,
                endDate: form.endDate,
                reason: form.reason,
              });
              notify('연차를 신청했습니다.');
              setApplying(false);
              setForm({});
              list.reload();
            }}
          >
            <Field label="시작일" required>
              <DateInput value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
            </Field>
            <Field label="종료일" required>
              <DateInput value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} />
            </Field>
            <Field label="사유" wide>
              <TextInput
                multiline
                value={form.reason}
                onChange={(v) => setForm({ ...form, reason: v })}
              />
            </Field>
          </Form>
        </Drawer>
      )}
    </section>
  );
}

function UsageTab({ role }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const list = useData<Page>(
    () => call<Page>('GET', '/leave-usages', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page],
  );
  return (
    <section className="box">
      <h2>연차 사용내역</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(draft);
        }}
        onReset={() => {
          setPage(0);
          setDraft({});
          setApplied({});
        }}
      >
        <Field label="연차 ID">
          <LookupSelect
            table="annual_leave"
            role={role}
            value={draft.annualLeaveId}
            onChange={(v) => setDraft({ ...draft, annualLeaveId: v })}
          />
        </Field>
        <Field label="조회 시작일">
          <DateInput value={draft.startDate} onChange={(v) => setDraft({ ...draft, startDate: v })} />
        </Field>
        <Field label="조회 종료일">
          <DateInput value={draft.endDate} onChange={(v) => setDraft({ ...draft, endDate: v })} />
        </Field>
      </Filters>
      <Band total={list.data?.total} />
      <DataTable
        rows={list.data?.items ?? []}
        empty="아직 연차 사용내역이 없습니다."
        columns={[
          { key: 'usedDate', label: '사용일', render: (r) => <DateText value={r.usedDate} /> },
          { key: 'usedDays', label: '차감 일수', render: (r) => <Num value={r.usedDays} /> },
          {
            key: 'attendanceRequestId',
            label: '근태 ID',
            render: (r) => (
              <RefName table="attendance_request" role={role} value={r.attendanceRequestId} />
            ),
          },
        ]}
      />
      <Pager page={page} size={SIZE} total={list.data?.total ?? 0} onPage={setPage} />
    </section>
  );
}

function RuleTab({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const list = useData<Page>(
    () => call<Page>('GET', '/leave-grant-rules', role, undefined, { page, size: SIZE }),
    [page],
  );
  return (
    <section className="box">
      <h2>연차 발생 기준 설정</h2>
      <Band total={list.data?.total} />
      <DataTable
        rows={list.data?.items ?? []}
        empty="아직 등록한 연차 발생 기준이 없습니다."
        columns={[
          { key: 'name', label: '기준명' },
          { key: 'baseDays', label: '기본일수', render: (r) => <Num value={r.baseDays} /> },
          { key: 'additionalDays', label: '가산일수', render: (r) => <Num value={r.additionalDays} /> },
          { key: 'useStatus', label: '사용 여부' },
          {
            key: 'edit',
            label: '처리',
            render: (r) => (
              <button
                className="ghost"
                onClick={() => {
                  setEditing(r);
                  setForm({ ...r });
                }}
              >
                수정
              </button>
            ),
          },
        ]}
      />
      <Pager page={page} size={SIZE} total={list.data?.total ?? 0} onPage={setPage} />
      {editing && (
        <Drawer title="연차 발생 기준 수정" onClose={() => setEditing(null)}>
          <Form
            submit="저장"
            note="수정한 기준은 이후 생성하는 연차부터 적용됩니다."
            onSubmit={async () => {
              if (!form.name || form.baseDays === '' || form.baseDays === undefined) {
                throw new Error('기준명과 기본일수를 입력해 주세요.');
              }
              const body: Row = {
                name: form.name,
                baseDays: form.baseDays,
                additionalCondition: form.additionalCondition ?? undefined,
                useStatus: form.useStatus,
              };
              if (form.additionalDays !== '' && form.additionalDays !== null && form.additionalDays !== undefined) {
                body.additionalDays = form.additionalDays;
              }
              await call('PATCH', '/leave-grant-rules/' + String(editing.leaveGrantRuleId), role, body);
              notify('연차 발생 기준을 수정했습니다.');
              setEditing(null);
              list.reload();
            }}
          >
            <Field label="기준명" required>
              <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            </Field>
            <Field label="기본일수" required>
              <NumberInput value={form.baseDays} onChange={(v) => setForm({ ...form, baseDays: v })} />
            </Field>
            <Field label="가산일수">
              <NumberInput
                value={form.additionalDays}
                onChange={(v) => setForm({ ...form, additionalDays: v })}
              />
            </Field>
            <Field label="가산 조건" wide>
              <TextInput
                multiline
                value={form.additionalCondition}
                onChange={(v) => setForm({ ...form, additionalCondition: v })}
              />
            </Field>
            <Field label="사용 여부" required>
              <Select
                value={form.useStatus}
                onChange={(v) => setForm({ ...form, useStatus: v })}
                options={[
                  ['사용', '사용'],
                  ['미사용', '미사용'],
                ]}
              />
            </Field>
          </Form>
        </Drawer>
      )}
    </section>
  );
}

export default function FnSfr01808Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState('leave');
  return (
    <div className="doc">
      <h1>연차 설정 및 신청 관리</h1>
      <div>
        <button className="ghost" onClick={() => setTab('leave')}>
          잔여 연차
        </button>
        <button className="ghost" onClick={() => setTab('usage')}>
          사용내역
        </button>
        <button className="ghost" onClick={() => setTab('rule')}>
          발생 기준
        </button>
      </div>
      {tab === 'leave' && <LeaveTab role={role} notify={notify} />}
      {tab === 'usage' && <UsageTab role={role} notify={notify} />}
      {tab === 'rule' && <RuleTab role={role} notify={notify} />}
    </div>
  );
}
