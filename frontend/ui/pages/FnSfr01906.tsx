import { useState } from 'react';
import {
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
  NumberInput,
  Pager,
  Pairs,
  RefName,
  TextInput,
  Num,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr01906Page({ role, notify }: PageProps) {
  const [draftYear, setDraftYear] = useState<unknown>('');
  const [draftEmployee, setDraftEmployee] = useState<unknown>('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [drawer, setDrawer] = useState<'plan' | 'promotion' | null>(null);

  const [planEmployee, setPlanEmployee] = useState<unknown>('');
  const [planMonth, setPlanMonth] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [planDays, setPlanDays] = useState<unknown>('');

  const [proEmployee, setProEmployee] = useState<unknown>('');
  const [proYear, setProYear] = useState<unknown>('');
  const [proStage, setProStage] = useState('');
  const [proDate, setProDate] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/leave-promotions', role, undefined, { ...applied, page, size: PAGE_SIZE }),
    [applied, page],
  );

  function search() {
    setPage(0);
    setApplied({ promotionYear: draftYear, employeeId: draftEmployee });
  }

  function reset() {
    setDraftYear('');
    setDraftEmployee('');
    setPage(0);
    setApplied({});
  }

  async function submitPlan() {
    if (planEmployee === '' || planEmployee === undefined) {
      throw new Error('임직원을 선택해 주세요.');
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(planMonth)) {
      throw new Error('계획월은 YYYY-MM 형식으로 입력해 주세요.');
    }
    if (planDays === '' || planDays === undefined || Number.isNaN(Number(planDays))) {
      throw new Error('계획 일수를 숫자로 입력해 주세요.');
    }
    const body: Row = {
      employeeId: planEmployee,
      planMonth,
      planDays,
    };
    if (planDate) {
      body.planDates = planDate;
    }
    await call('POST', '/annual-leave-plans', role, body);
    notify('월별 연차계획을 등록했습니다.');
    setPlanEmployee('');
    setPlanMonth('');
    setPlanDate('');
    setPlanDays('');
    setDrawer(null);
    reload();
  }

  async function submitPromotion() {
    if (proEmployee === '' || proEmployee === undefined) {
      throw new Error('대상 임직원을 선택해 주세요.');
    }
    if (proYear === '' || Number.isNaN(Number(proYear))) {
      throw new Error('기준연도를 숫자로 입력해 주세요.');
    }
    if (!proStage.trim()) {
      throw new Error('촉진 구분을 입력해 주세요.');
    }
    if (!proDate) {
      throw new Error('통지 예정일을 입력해 주세요.');
    }
    await call('POST', '/leave-promotions', role, {
      employeeId: proEmployee,
      promotionYear: proYear,
      promotionStage: proStage.trim(),
      scheduledDate: proDate,
    });
    notify('연차사용촉진계획을 등록했습니다.');
    setProEmployee('');
    setProYear('');
    setProStage('');
    setProDate('');
    setDrawer(null);
    setPage(0);
    reload();
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>연차사용촉진계획</h2>
          <Pairs
            items={[
              ['대상 임직원', <RefName table="employee" role={role} value={selected.employeeId} />],
              ['기준연도', String(selected.promotionYear ?? '')],
              ['촉진 구분', String(selected.promotionStage ?? '')],
              ['통지 예정일', <DateText value={selected.scheduledDate} />],
              ['통지 일시', selected.notifiedAt ? <DateText value={selected.notifiedAt} time /> : '아직 통지하지 않았습니다.'],
              ['촉진 시점 잔여일수', <Num value={selected.remainingDays} />],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>연차사용촉진 현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="기준연도">
            <NumberInput value={draftYear} onChange={setDraftYear} />
          </Field>
          <Field label="대상 임직원">
            <LookupSelect table="employee" role={role} value={draftEmployee} onChange={setDraftEmployee} />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button className="ghost" onClick={() => setDrawer('plan')}>
            월별 연차계획 등록
          </button>
          <button onClick={() => setDrawer('promotion')}>촉진계획 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        {loading && !data ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          columns={[
            {
              key: 'employeeId',
              label: '대상 임직원',
              render: (r: Row) => <RefName table="employee" role={role} value={r.employeeId} />,
            },
            { key: 'promotionYear', label: '기준연도' },
            { key: 'promotionStage', label: '촉진 구분' },
            {
              key: 'scheduledDate',
              label: '통지 예정일',
              render: (r: Row) => <DateText value={r.scheduledDate} />,
            },
            {
              key: 'notifiedAt',
              label: '통지 일시',
              render: (r: Row) => <DateText value={r.notifiedAt} time />,
            },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r: Row) => setSelected(r)}
          empty="아직 등록한 촉진계획이 없습니다. 촉진계획 등록 버튼으로 대상자를 추가해 주세요."
        />
        <Pager page={page} size={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>

      {drawer === 'plan' ? (
        <Drawer title="월별 연차계획 등록" onClose={() => setDrawer(null)}>
          <Form onSubmit={submitPlan} submit="등록">
            <Field label="임직원" required>
              <LookupSelect table="employee" role={role} value={planEmployee} onChange={setPlanEmployee} />
            </Field>
            <Field label="계획월" required hint="YYYY-MM 형식">
              <TextInput value={planMonth} onChange={setPlanMonth} placeholder="2025-01" />
            </Field>
            <Field label="계획 일자">
              <DateInput value={planDate} onChange={setPlanDate} />
            </Field>
            <Field label="계획 일수 합계" required hint="반차는 0.5로 입력합니다.">
              <NumberInput value={planDays} onChange={setPlanDays} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {drawer === 'promotion' ? (
        <Drawer title="연차사용촉진계획 등록" onClose={() => setDrawer(null)}>
          <Form onSubmit={submitPromotion} submit="등록">
            <Field label="대상 임직원" required>
              <LookupSelect table="employee" role={role} value={proEmployee} onChange={setProEmployee} />
            </Field>
            <Field label="기준연도" required>
              <NumberInput value={proYear} onChange={setProYear} />
            </Field>
            <Field label="촉진 구분" required>
              <TextInput value={proStage} onChange={setProStage} />
            </Field>
            <Field label="통지 예정일" required>
              <DateInput value={proDate} onChange={setProDate} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
