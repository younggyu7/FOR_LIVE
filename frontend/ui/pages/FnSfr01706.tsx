import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  ErrorText,
  Field,
  Filters,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  Pager,
  RefName,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const PAGE_SIZE = 20;
const MANAGER_ROLE = '근태 담당자';
const LOCKED_STATUSES = ['승인', '마감'];

function dateOnly(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 10) : '';
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

export default function FnSfr01706Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState('plan');
  const isManager = role === MANAGER_ROLE;
  return (
    <div className="doc">
      <section className="box">
        <h2>근태 스케줄 관리</h2>
        <div>
          <button className={tab === 'plan' ? '' : 'ghost'} onClick={() => setTab('plan')}>
            월별 연차계획
          </button>
          {isManager && (
            <button className={tab === 'promotion' ? '' : 'ghost'} onClick={() => setTab('promotion')}>
              연차촉진계획
            </button>
          )}
        </div>
      </section>
      {tab === 'plan' || !isManager ? (
        <PlanSection role={role} notify={notify} />
      ) : (
        <PromotionSection role={role} notify={notify} />
      )}
    </div>
  );
}

function PlanSection({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<{ planMonth: string; employeeId: number | string }>({ planMonth: '', employeeId: '' });
  const [applied, setApplied] = useState(draft);
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const { data, error, reload } = useData(
    () => call<Page>('GET', '/annual-leave-plans', role, undefined, {
      page,
      size: PAGE_SIZE,
      planMonth: applied.planMonth,
      employeeId: applied.employeeId,
    }),
    [role, page, applied],
  );
  return (
    <section className="box">
      <h2>월별 연차계획 현황</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(draft);
        }}
        onReset={() => {
          const empty = { planMonth: '', employeeId: '' };
          setDraft(empty);
          setApplied(empty);
          setPage(0);
        }}
      >
        <Field label="계획월">
          <TextInput value={draft.planMonth} onChange={(v) => setDraft({ ...draft, planMonth: v })} placeholder="YYYY-MM" />
        </Field>
        <Field label="임직원">
          <LookupSelect table="employee" role={role} value={draft.employeeId} onChange={(v) => setDraft({ ...draft, employeeId: v })} />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={() => setCreating(true)}>연차계획 등록</button>
      </Band>
      {error && <ErrorText text={error} />}
      <DataTable
        rows={data?.items ?? []}
        empty="아직 등록한 연차계획이 없습니다. 연차계획 등록 버튼으로 시작해 주세요."
        columns={[
          { key: 'employeeId', label: '임직원', render: (r) => <RefName table="employee" role={role} value={r['employeeId']} /> },
          { key: 'planMonth', label: '계획월' },
          { key: 'planDays', label: '계획 일수 합계', render: (r) => <Num value={r['planDays']} /> },
          { key: 'approvalStatus', label: '승인 처리 상태', render: (r) => <Badge value={r['approvalStatus']} /> },
          {
            key: 'action',
            label: '처리',
            render: (r) =>
              LOCKED_STATUSES.includes(String(r['approvalStatus'])) ? null : (
                <button className="ghost" onClick={() => setEditing(r)}>수정</button>
              ),
          },
        ]}
      />
      <Pager page={page} size={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      {creating && (
        <PlanCreateDrawer
          role={role}
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            notify('연차계획을 등록했습니다.');
            reload();
          }}
        />
      )}
      {editing && (
        <PlanEditDrawer
          role={role}
          row={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            notify('연차계획을 수정했습니다.');
            reload();
          }}
        />
      )}
    </section>
  );
}

function PlanCreateDrawer({ role, onClose, onDone }: { role: string; onClose: () => void; onDone: () => void }) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [planMonth, setPlanMonth] = useState('');
  const [planDates, setPlanDates] = useState('');
  const [planDays, setPlanDays] = useState<number | string>('');
  return (
    <Drawer title="월별 연차계획 등록" onClose={onClose}>
      <Form
        submit="등록"
        onSubmit={async () => {
          if (isBlank(employeeId) || isBlank(planMonth) || isBlank(planDays)) {
            throw new Error('임직원, 계획월, 계획 일수 합계는 필수입니다.');
          }
          await call('POST', '/annual-leave-plans', role, { employeeId, planMonth, planDates, planDays });
          onDone();
        }}
      >
        <Field label="임직원" required>
          <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
        </Field>
        <Field label="계획월" required hint="YYYY-MM 형식">
          <TextInput value={planMonth} onChange={setPlanMonth} placeholder="2025-01" />
        </Field>
        <Field label="계획 일자">
          <DateInput value={planDates} onChange={setPlanDates} />
        </Field>
        <Field label="계획 일수 합계" required hint="반차는 0.5로 입력합니다.">
          <NumberInput value={planDays} onChange={setPlanDays} />
        </Field>
      </Form>
    </Drawer>
  );
}

function PlanEditDrawer({ role, row, onClose, onDone }: { role: string; row: Row; onClose: () => void; onDone: () => void }) {
  const [planDates, setPlanDates] = useState(dateOnly(row['planDates']));
  const [planDays, setPlanDays] = useState<number | string>(Number(row['planDays']));
  return (
    <Drawer title="월별 연차계획 수정" onClose={onClose}>
      <Form
        submit="수정"
        note="수정하면 변경 전후 내용이 변경 이력에 남습니다."
        onSubmit={async () => {
          if (isBlank(planDays)) {
            throw new Error('계획 일수 합계는 필수입니다.');
          }
          await call('PUT', '/annual-leave-plans/' + String(row['annualLeavePlanId']), role, { planDates, planDays });
          onDone();
        }}
      >
        <Field label="계획 일자">
          <DateInput value={planDates} onChange={setPlanDates} />
        </Field>
        <Field label="계획 일수 합계" required>
          <NumberInput value={planDays} onChange={setPlanDays} />
        </Field>
      </Form>
    </Drawer>
  );
}

function PromotionSection({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<{ promotionYear: number | string; employeeId: number | string }>({ promotionYear: '', employeeId: '' });
  const [applied, setApplied] = useState(draft);
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const { data, error, reload } = useData(
    () => call<Page>('GET', '/leave-promotions', role, undefined, {
      page,
      size: PAGE_SIZE,
      promotionYear: applied.promotionYear,
      employeeId: applied.employeeId,
    }),
    [role, page, applied],
  );
  return (
    <section className="box">
      <h2>연차촉진계획 현황</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(draft);
        }}
        onReset={() => {
          const empty = { promotionYear: '', employeeId: '' };
          setDraft(empty);
          setApplied(empty);
          setPage(0);
        }}
      >
        <Field label="기준연도">
          <NumberInput value={draft.promotionYear} onChange={(v) => setDraft({ ...draft, promotionYear: v })} />
        </Field>
        <Field label="대상 임직원">
          <LookupSelect table="employee" role={role} value={draft.employeeId} onChange={(v) => setDraft({ ...draft, employeeId: v })} />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={() => setCreating(true)}>촉진 대상·일정 등록</button>
      </Band>
      {error && <ErrorText text={error} />}
      <DataTable
        rows={data?.items ?? []}
        empty="아직 등록한 촉진 계획이 없습니다. 촉진 대상·일정 등록 버튼으로 시작해 주세요."
        columns={[
          { key: 'employeeId', label: '대상 임직원', render: (r) => <RefName table="employee" role={role} value={r['employeeId']} /> },
          { key: 'promotionYear', label: '기준연도' },
          { key: 'promotionStage', label: '촉진 구분' },
          { key: 'scheduledDate', label: '통지 예정일', render: (r) => <DateText value={r['scheduledDate']} /> },
          { key: 'remainingDays', label: '촉진 시점 잔여일수', render: (r) => <Num value={r['remainingDays']} /> },
        ]}
      />
      <Pager page={page} size={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      {creating && (
        <PromotionCreateDrawer
          role={role}
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            notify('연차촉진 대상·일정을 등록했습니다.');
            reload();
          }}
        />
      )}
    </section>
  );
}

function PromotionCreateDrawer({ role, onClose, onDone }: { role: string; onClose: () => void; onDone: () => void }) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [promotionYear, setPromotionYear] = useState<number | string>('');
  const [promotionStage, setPromotionStage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  return (
    <Drawer title="연차촉진 대상·일정 등록" onClose={onClose}>
      <Form
        submit="등록"
        onSubmit={async () => {
          if (isBlank(employeeId) || isBlank(promotionYear) || isBlank(promotionStage) || isBlank(scheduledDate)) {
            throw new Error('대상 임직원, 기준연도, 촉진 구분, 통지 예정일은 필수입니다.');
          }
          await call('POST', '/leave-promotions', role, { employeeId, promotionYear, promotionStage, scheduledDate });
          onDone();
        }}
      >
        <Field label="대상 임직원" required>
          <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
        </Field>
        <Field label="기준연도" required>
          <NumberInput value={promotionYear} onChange={setPromotionYear} />
        </Field>
        <Field label="촉진 구분" required>
          <TextInput value={promotionStage} onChange={setPromotionStage} />
        </Field>
        <Field label="통지 예정일" required>
          <DateInput value={scheduledDate} onChange={setScheduledDate} />
        </Field>
      </Form>
    </Drawer>
  );
}
