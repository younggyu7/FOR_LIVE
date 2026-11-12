import { useState } from 'react';
import {
  Badge,
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
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

type Panel = { mode: 'create' } | { mode: 'edit'; row: Row } | null;

const SIZE = 20;

export default function FnSfr03205Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'plan' | 'promotion'>('plan');
  const [planMonth, setPlanMonth] = useState('');
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [promotionYear, setPromotionYear] = useState<number | string>('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);

  const [formEmployee, setFormEmployee] = useState<number | string>('');
  const [formMonth, setFormMonth] = useState('');
  const [formDates, setFormDates] = useState('');
  const [formDays, setFormDays] = useState<number | string>('');

  const plans = useData<Page>(
    () => (tab === 'plan' ? call<Page>('GET', '/annual-leave-plans', role, undefined, { ...applied, page, size: SIZE }) : Promise.resolve({ items: [], page: 0, size: SIZE, total: 0 })),
    [tab, applied, page, role],
  );
  const promotions = useData<Page>(
    () => (tab === 'promotion' ? call<Page>('GET', '/leave-promotions', role, undefined, { ...applied, page, size: SIZE }) : Promise.resolve({ items: [], page: 0, size: SIZE, total: 0 })),
    [tab, applied, page, role],
  );
  const current = tab === 'plan' ? plans : promotions;

  function switchTab(next: 'plan' | 'promotion') {
    setTab(next);
    setPage(0);
    setApplied({});
    setPlanMonth('');
    setEmployeeId('');
    setPromotionYear('');
  }

  function search() {
    setPage(0);
    if (tab === 'plan') {
      setApplied({ planMonth, employeeId });
    } else {
      setApplied({ promotionYear, employeeId });
    }
  }

  function reset() {
    setPlanMonth('');
    setEmployeeId('');
    setPromotionYear('');
    setPage(0);
    setApplied({});
  }

  function openCreate() {
    setFormEmployee('');
    setFormMonth('');
    setFormDates('');
    setFormDays('');
    setPanel({ mode: 'create' });
  }

  function openEdit(row: Row) {
    setFormDates(row.planDates ? String(row.planDates).slice(0, 10) : '');
    setFormDays(row.planDays === undefined || row.planDays === null ? '' : (row.planDays as number));
    setPanel({ mode: 'edit', row });
  }

  function checkDays() {
    if (formDays === '' || typeof formDays !== 'number' || !(formDays > 0)) {
      throw new Error('계획 일수 합계는 0보다 큰 숫자로 입력해 주세요.');
    }
  }

  async function submitCreate() {
    if (formEmployee === '') {
      throw new Error('임직원을 선택해 주세요.');
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(formMonth)) {
      throw new Error('계획월은 YYYY-MM 형식으로 입력해 주세요.');
    }
    checkDays();
    await call('POST', '/annual-leave-plans', role, {
      employeeId: formEmployee,
      planMonth: formMonth,
      planDates: formDates || undefined,
      planDays: formDays,
    });
    notify('월별 연차계획을 작성했습니다.');
    setPanel(null);
    plans.reload();
  }

  async function submitEdit(row: Row) {
    checkDays();
    await call('PUT', '/annual-leave-plans/' + String(row.annualLeavePlanId), role, {
      planDates: formDates || undefined,
      planDays: formDays,
    });
    notify('연차계획을 수정했습니다.');
    setPanel(null);
    plans.reload();
  }

  const planColumns = [
    { key: 'employeeId', label: '임직원', render: (r: Row) => <RefName table="employee" role={role} value={r.employeeId} /> },
    { key: 'planMonth', label: '계획월' },
    { key: 'planDays', label: '계획 일수 합계', render: (r: Row) => <Num value={r.planDays} /> },
    { key: 'approvalStatus', label: '승인 처리 상태', render: (r: Row) => <Badge value={r.approvalStatus} /> },
    {
      key: 'actions',
      label: '처리',
      render: (r: Row) =>
        r.approvalStatus === '승인' ? null : (
          <button className="ghost" onClick={() => openEdit(r)}>
            수정
          </button>
        ),
    },
  ];

  const promotionColumns = [
    { key: 'employeeId', label: '대상 임직원', render: (r: Row) => <RefName table="employee" role={role} value={r.employeeId} /> },
    { key: 'promotionYear', label: '기준연도' },
    { key: 'promotionStage', label: '촉진 구분' },
    {
      key: 'notifiedAt',
      label: '통지',
      render: (r: Row) =>
        r.notifiedAt ? (
          <DateText value={r.notifiedAt} time />
        ) : (
          <span>
            <DateText value={r.scheduledDate} /> 예정
          </span>
        ),
    },
    { key: 'remainingDays', label: '촉진 시점 잔여일수', render: (r: Row) => <Num value={r.remainingDays} /> },
  ];

  const rows = current.data ? current.data.items : [];
  const total = current.data ? current.data.total : 0;

  return (
    <div className="doc">
      <section className="box">
        <h2>월별 연차계획 작성 및 연차촉진 확인</h2>
        <div>
          <button className={tab === 'plan' ? '' : 'ghost'} onClick={() => switchTab('plan')}>
            연차계획
          </button>{' '}
          <button className={tab === 'promotion' ? '' : 'ghost'} onClick={() => switchTab('promotion')}>
            연차촉진 내역
          </button>
        </div>
      </section>

      <section className="box">
        <h2>{tab === 'plan' ? '연차계획 현황' : '연차촉진 내역'}</h2>
        <Filters onSearch={search} onReset={reset}>
          {tab === 'plan' ? (
            <Field label="계획월" hint="YYYY-MM">
              <TextInput value={planMonth} onChange={setPlanMonth} placeholder="2025-01" />
            </Field>
          ) : (
            <Field label="기준연도">
              <NumberInput value={promotionYear} onChange={setPromotionYear} />
            </Field>
          )}
          <Field label="임직원">
            <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
          </Field>
        </Filters>
        <Band total={total}>
          {tab === 'plan' ? <button onClick={openCreate}>연차계획 작성</button> : null}
        </Band>
        {current.error ? <p>{current.error}</p> : null}
        <DataTable
          columns={tab === 'plan' ? planColumns : promotionColumns}
          rows={rows}
          empty={tab === 'plan' ? '아직 작성한 연차계획이 없습니다. 연차계획 작성 버튼으로 시작해 주세요.' : '확인할 연차촉진 내역이 없습니다.'}
        />
        <Pager page={page} size={SIZE} total={total} onPage={setPage} />
      </section>

      {panel && panel.mode === 'create' ? (
        <Drawer title="월별 연차계획 작성" onClose={() => setPanel(null)}>
          <Form onSubmit={submitCreate} submit="작성">
            <Field label="임직원" required>
              <LookupSelect table="employee" role={role} value={formEmployee} onChange={setFormEmployee} />
            </Field>
            <Field label="계획월" required hint="YYYY-MM">
              <TextInput value={formMonth} onChange={setFormMonth} placeholder="2025-01" />
            </Field>
            <Field label="계획 일자">
              <DateInput value={formDates} onChange={setFormDates} />
            </Field>
            <Field label="계획 일수 합계" required hint="잔여 연차를 넘을 수 없습니다.">
              <NumberInput value={formDays} onChange={setFormDays} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {panel && panel.mode === 'edit' ? (
        <Drawer title="연차계획 수정" onClose={() => setPanel(null)}>
          <Form
            onSubmit={() => submitEdit(panel.row)}
            submit="수정"
            note="승인된 계획은 직접 수정할 수 없습니다. 승인 취소 절차를 먼저 진행해 주세요."
          >
            <Field label="계획월">
              <span>{String(panel.row.planMonth)}</span>
            </Field>
            <Field label="계획 일자">
              <DateInput value={formDates} onChange={setFormDates} />
            </Field>
            <Field label="계획 일수 합계" required>
              <NumberInput value={formDays} onChange={setFormDays} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
