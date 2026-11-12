import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const STATUSES: [string, string][] = [
  ['기안', '기안'],
  ['결재대기', '결재대기'],
  ['승인', '승인'],
  ['보류', '보류'],
  ['반려', '반려'],
  ['회수', '회수'],
  ['재기안', '재기안'],
  ['완료', '완료'],
];

export default function FnSfr02402Page({ role, notify }: PageProps) {
  const [projectId, setProjectId] = useState<number | string>('');
  const [budgetAccountId, setBudgetAccountId] = useState<number | string>('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<unknown>(undefined);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const list = useData<Page>(
    () => call<Page>('GET', '/requisitions', role, undefined, { ...applied, page, size: 20 }),
    [role, applied, page],
  );
  const detail = useData<Row | undefined>(
    async () => {
      if (selectedId === undefined) {
        return undefined;
      }
      return call<Row>('GET', `/requisitions/${selectedId}`, role);
    },
    [role, selectedId],
  );

  function search() {
    setPage(0);
    setApplied({ projectId, budgetAccountId, status });
  }

  function reset() {
    setProjectId('');
    setBudgetAccountId('');
    setStatus('');
    setPage(0);
    setApplied({});
  }

  async function approve() {
    try {
      await call('POST', `/requisitions/${selectedId}/approve`, role, {});
      notify('승인했습니다.');
      detail.reload();
      list.reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : '승인하지 못했습니다.');
    }
  }

  async function reject() {
    if (rejectReason.trim() === '') {
      throw new Error('반려 사유를 입력해 주세요.');
    }
    await call('POST', `/requisitions/${selectedId}/reject`, role, { rejectReason });
    notify('반려했습니다.');
    setRejecting(false);
    setRejectReason('');
    detail.reload();
    list.reload();
  }

  if (selectedId !== undefined) {
    const d = detail.data;
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelectedId(undefined)}>
          목록으로 돌아가기
        </button>
        {detail.error ? <ErrorText text={detail.error} /> : null}
        {d ? (
          <section className="box">
            <h2>구매품의 내용</h2>
            <Pairs
              items={[
                ['품의서 ID', String(d['requisitionId'])],
                ['프로젝트', <RefName table="project" role={role} value={d['projectId']} />],
                ['예산과목', <RefName table="budget_account" role={role} value={d['budgetAccountId']} />],
                ['품의 제목', String(d['title'] ?? '')],
                ['품의 내용', String(d['content'] ?? '')],
                ['품의 금액', <Num value={d['requisitionAmount']} />],
                ['처리 상태', <Badge value={d['status']} />],
              ]}
            />
            {d['status'] === '결재대기' ? (
              <div>
                <button onClick={approve}>승인</button>
                <button className="ghost" onClick={() => setRejecting(true)}>
                  반려
                </button>
              </div>
            ) : null}
          </section>
        ) : null}
        {rejecting ? (
          <Drawer title="구매품의 반려" onClose={() => setRejecting(false)}>
            <Form
              onSubmit={reject}
              submit="반려"
              danger
              note="반려하면 상태가 반려로 바뀌며 되돌릴 수 없습니다."
            >
              <Field label="반려 사유" required wide>
                <TextInput value={rejectReason} onChange={setRejectReason} multiline />
              </Field>
            </Form>
          </Drawer>
        ) : null}
      </div>
    );
  }

  const data = list.data;
  return (
    <div className="doc">
      <section className="box">
        <h2>구매품의 현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="프로젝트">
            <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} />
          </Field>
          <Field label="예산과목">
            <LookupSelect table="budget_account" role={role} value={budgetAccountId} onChange={setBudgetAccountId} />
          </Field>
          <Field label="처리 상태">
            <Select value={status} onChange={setStatus} options={STATUSES} />
          </Field>
        </Filters>
        {list.error ? <ErrorText text={list.error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'title', label: '품의 제목' },
            {
              key: 'projectId',
              label: '프로젝트',
              render: (r) => <RefName table="project" role={role} value={r['projectId']} />,
            },
            {
              key: 'budgetAccountId',
              label: '예산과목',
              render: (r) => <RefName table="budget_account" role={role} value={r['budgetAccountId']} />,
            },
            {
              key: 'requisitionAmount',
              label: '품의 금액',
              render: (r) => <Num value={r['requisitionAmount']} />,
            },
            { key: 'status', label: '처리 상태', render: (r) => <Badge value={r['status']} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelectedId(r['requisitionId'])}
          empty="조건에 맞는 구매품의가 없습니다. 조회 조건을 바꿔 다시 조회해 주세요."
        />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} /> : null}
      </section>
    </div>
  );
}
