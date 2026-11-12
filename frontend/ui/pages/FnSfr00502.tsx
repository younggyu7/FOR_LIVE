import { useState } from 'react';
import {
  Band,
  DataTable,
  DateInput,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  Pairs,
  RefName,
  Select,
  Badge,
  call,
  useData,
} from '../kit';
import type { Column, Page, PageProps, Row } from '../kit';

const SIZE = 20;
const STATUS_TYPES = [
  '품의서·원인행위·결의서 현황',
  '지출결의서 현황',
  '예실 대비 현황',
  '프로젝트별 예산 구성비',
  '예산과목 원장',
  '자금예산서',
  '추가경정자금예산서',
  '자금계산서',
];
const RESOLUTION_TYPES = ['품의서·원인행위·결의서 현황', '지출결의서 현황'];
const PROGRESS = ['기안', '결재대기', '승인', '보류', '반려', '회수', '재기안', '완료'];
const VIEW_FORMS = ['기본', '상세'];

const EMPTY_DRAFT: Row = {
  statusType: '',
  fromDate: '',
  toDate: '',
  projectId: '',
  budgetAccountId: '',
  progressStatus: '',
  viewForm: '기본',
};

export default function FnSfr00502Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>(EMPTY_DRAFT);
  const [applied, setApplied] = useState<Row | null>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [message, setMessage] = useState('');

  const { data, error, loading } = useData<Page | undefined>(
    async () => {
      if (applied === null) {
        return undefined;
      }
      return call<Page>('GET', '/budget-status', role, undefined, { ...applied, page, size: SIZE });
    },
    [applied, page],
  );

  function change(key: string, value: unknown) {
    setDraft({ ...draft, [key]: value });
  }

  function search() {
    if (draft.statusType === '') {
      setMessage('조회 항목을 선택해 주세요.');
      return;
    }
    if (draft.fromDate === '' || draft.toDate === '') {
      setMessage('조회 시작일과 종료일을 입력해 주세요.');
      return;
    }
    if (String(draft.fromDate) > String(draft.toDate)) {
      setMessage('조회 시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }
    setMessage('');
    setPage(0);
    setSelected(null);
    setApplied({ ...draft });
    notify('조건에 맞는 현황을 조회합니다.');
  }

  function reset() {
    setDraft(EMPTY_DRAFT);
    setApplied(null);
    setSelected(null);
    setPage(0);
    setMessage('');
  }

  const projectCol: Column = {
    key: 'projectId',
    label: '프로젝트',
    render: (r) => <RefName table='project' role={role} value={r.projectId} />,
  };
  const accountCol: Column = {
    key: 'budgetAccountId',
    label: '예산과목',
    render: (r) => <RefName table='budget_account' role={role} value={r.budgetAccountId} />,
  };
  const numCol = (key: string, label: string): Column => ({
    key,
    label,
    render: (r) => <Num value={r[key]} />,
  });

  function columnsOf(type: string): Column[] {
    if (RESOLUTION_TYPES.includes(type)) {
      return [
        projectCol,
        accountCol,
        {
          key: 'requisitionAmount',
          label: '품의·원인행위 금액',
          render: (r) => (
            <span>
              <Num value={r.requisitionAmount} /> / <Num value={r.commitmentAmount} />
            </span>
          ),
        },
        numCol('resolutionAmount', '결의 금액'),
        { key: 'status', label: '진행 상태', render: (r) => <Badge value={r.status} /> },
      ];
    }
    if (type === '프로젝트별 예산 구성비') {
      return [
        projectCol,
        accountCol,
        numCol('budgetAmount', '신청금액'),
        {
          key: 'ratio',
          label: '구성 비율(%)',
          render: (r) => (
            <span>
              <Num value={r.ratio} />%
            </span>
          ),
        },
      ];
    }
    if (type === '추가경정자금예산서') {
      return [projectCol, accountCol, numCol('adjustmentAmount', '조정 금액')];
    }
    if (type === '자금예산서') {
      return [projectCol, accountCol, numCol('budgetAmount', '신청금액'), numCol('executionAmount', '실행예산 금액')];
    }
    if (type === '자금계산서') {
      return [projectCol, accountCol, numCol('resolutionAmount', '결의 금액'), numCol('balance', '잔액')];
    }
    if (type === '예산과목 원장') {
      return [
        projectCol,
        accountCol,
        numCol('budgetAmount', '신청금액'),
        numCol('resolutionAmount', '결의 금액'),
        numCol('balance', '잔액'),
      ];
    }
    return [
      projectCol,
      accountCol,
      numCol('budgetAmount', '신청금액'),
      numCol('resolutionAmount', '결의 금액'),
      numCol('balance', '잔액'),
    ];
  }

  const labels: [string, string, boolean][] = [
    ['requisitionAmount', '품의 금액', true],
    ['commitmentAmount', '원인행위 금액', true],
    ['resolutionAmount', '결의 금액', true],
    ['budgetAmount', '신청금액', true],
    ['executionAmount', '실행예산 금액', true],
    ['adjustmentAmount', '조정 금액', true],
    ['ratio', '구성 비율(%)', true],
    ['balance', '잔액', true],
  ];

  if (selected !== null) {
    const items: [string, React.ReactNode][] = [
      ['프로젝트', <RefName table='project' role={role} value={selected.projectId} />],
      ['예산과목', <RefName table='budget_account' role={role} value={selected.budgetAccountId} />],
    ];
    for (const [key, label] of labels) {
      if (selected[key] !== undefined && selected[key] !== null) {
        items.push([label, <Num value={selected[key]} />]);
      }
    }
    if (selected.status) {
      items.push(['진행 상태', <Badge value={selected.status} />]);
    }
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className='box'>
          <h2>{String(applied?.statusType ?? '')} 상세</h2>
          <Pairs items={items} />
        </section>
      </div>
    );
  }

  const type = String(applied?.statusType ?? '');
  const showProgress = draft.statusType === '' || RESOLUTION_TYPES.includes(String(draft.statusType));

  return (
    <div className='doc'>
      <section className='box'>
        <h2>결의서 현황 및 예실 조회</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label='조회 항목' required>
            <Select
              value={draft.statusType}
              onChange={(v) => change('statusType', v)}
              options={STATUS_TYPES.map((t): [string, string] => [t, t])}
            />
          </Field>
          <Field label='조회 시작일' required>
            <DateInput value={draft.fromDate} onChange={(v) => change('fromDate', v)} />
          </Field>
          <Field label='조회 종료일' required>
            <DateInput value={draft.toDate} onChange={(v) => change('toDate', v)} />
          </Field>
          <Field label='프로젝트'>
            <LookupSelect
              table='project'
              role={role}
              value={draft.projectId}
              onChange={(v) => change('projectId', v)}
            />
          </Field>
          <Field label='예산과목'>
            <LookupSelect
              table='budget_account'
              role={role}
              value={draft.budgetAccountId}
              onChange={(v) => change('budgetAccountId', v)}
            />
          </Field>
          {showProgress ? (
            <Field label='진행상태'>
              <Select
                value={draft.progressStatus}
                onChange={(v) => change('progressStatus', v)}
                options={PROGRESS.map((s): [string, string] => [s, s])}
                placeholder='전체'
              />
            </Field>
          ) : null}
          {draft.statusType === '예실 대비 현황' ? (
            <Field label='보기 구분'>
              <Select
                value={draft.viewForm}
                onChange={(v) => change('viewForm', v)}
                options={VIEW_FORMS.map((s): [string, string] => [s, s])}
              />
            </Field>
          ) : null}
        </Filters>
        {message !== '' ? <ErrorText text={message} /> : null}
        {error !== '' ? <ErrorText text={error} /> : null}
      </section>
      <section className='box'>
        <h2>조회 결과</h2>
        <Band total={data?.total ?? 0} />
        <DataTable
          columns={columnsOf(type)}
          rows={data?.items ?? []}
          onRowClick={(row) => setSelected(row)}
          empty={
            applied === null
              ? '조회 항목과 기간을 입력하고 조회해 주세요.'
              : loading
                ? '불러오는 중입니다.'
                : '조회 조건에 해당하는 데이터가 없습니다.'
          }
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
