import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateText,
  Drawer,
  Field,
  Filters,
  Form,
  Pager,
  Pairs,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;
const STATUS_OPTIONS: [string, string][] = [
  ['기안', '기안'],
  ['결재대기', '결재대기'],
  ['승인', '승인'],
  ['보류', '보류'],
  ['반려', '반려'],
  ['회수', '회수'],
  ['재기안', '재기안'],
  ['완료', '완료'],
];

type Mode = '' | 'process' | 'withdraw' | 'delete';

export default function FnSfr02902Page({ role, notify }: PageProps) {
  const [statusIn, setStatusIn] = useState('');
  const [pendingIn, setPendingIn] = useState('');
  const [applied, setApplied] = useState({ status: '', pending: '' });
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [mode, setMode] = useState<Mode>('');
  const [decision, setDecision] = useState('');
  const [opinion, setOpinion] = useState('');

  const { data, error, reload } = useData(
    () =>
      call<Page>('GET', '/approval-documents', role, undefined, {
        approvalStatus: applied.status,
        pendingOnly: applied.pending,
        page,
        size: SIZE,
      }),
    [applied, page],
  );

  const search = () => {
    setApplied({ status: statusIn, pending: pendingIn });
    setPage(0);
  };

  const reset = () => {
    setStatusIn('');
    setPendingIn('');
    setApplied({ status: '', pending: '' });
    setPage(0);
  };

  const closeDrawer = () => {
    setMode('');
    setDecision('');
    setOpinion('');
  };

  const finish = (text: string) => {
    notify(text);
    closeDrawer();
    setSelected(null);
    reload();
  };

  const docPath = () => '/approval-documents/' + String(selected?.approvalDocumentId);
  const status = selected ? String(selected.approvalStatus) : '';

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => { setSelected(null); closeDrawer(); }}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>문서 정보</h2>
          <Pairs
            items={[
              ['문서번호', String(selected.documentNo)],
              ['문서 제목', String(selected.title)],
              ['전자결재 처리 상태', <Badge value={selected.approvalStatus} />],
              ['상신 일시', <DateText value={selected.submittedAt} time />],
            ]}
          />
        </section>
        <section className="box">
          <h2>처리</h2>
          {status === '결재대기' && (
            <>
              <button onClick={() => setMode('process')}>결재 처리</button>
              <button className="ghost" onClick={() => setMode('withdraw')}>회수</button>
            </>
          )}
          {(status === '반려' || status === '회수') && (
            <button className="ghost" onClick={() => setMode('delete')}>삭제</button>
          )}
          {status !== '결재대기' && status !== '반려' && status !== '회수' && (
            <p>이 문서는 지금 처리할 수 있는 작업이 없습니다.</p>
          )}
        </section>
        {mode === 'process' && (
          <Drawer title="결재 처리" onClose={closeDrawer}>
            <Form
              submit="처리"
              onSubmit={async () => {
                if (!decision) {
                  throw new Error('승인, 보류, 반려 중 하나를 선택해 주세요.');
                }
                await call('POST', docPath() + '/process', role, { approvalStatus: decision, opinion });
                finish('결재를 처리했습니다.');
              }}
            >
              <Field label="승인/보류/반려" required>
                <Select
                  value={decision}
                  onChange={setDecision}
                  options={[['승인', '승인'], ['보류', '보류'], ['반려', '반려']]}
                />
              </Field>
              <Field label="결재 의견" wide>
                <TextInput value={opinion} onChange={setOpinion} multiline />
              </Field>
            </Form>
          </Drawer>
        )}
        {mode === 'withdraw' && (
          <Drawer title="문서 회수" onClose={closeDrawer}>
            <Form
              submit="회수"
              danger
              note="회수하면 결재 진행이 멈추고 문서 상태가 회수로 바뀝니다."
              onSubmit={async () => {
                await call('POST', docPath() + '/withdraw', role, {});
                finish('문서를 회수했습니다.');
              }}
            />
          </Drawer>
        )}
        {mode === 'delete' && (
          <Drawer title="문서 삭제" onClose={closeDrawer}>
            <Form
              submit="삭제"
              danger
              note="삭제한 문서는 되돌릴 수 없습니다."
              onSubmit={async () => {
                await call('DELETE', docPath(), role);
                finish('문서를 삭제했습니다.');
              }}
            />
          </Drawer>
        )}
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>결재 문서</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="전자결재 처리 상태">
          <Select value={statusIn} onChange={setStatusIn} options={STATUS_OPTIONS} placeholder="전체" />
        </Field>
        <Field label="본인 결재예정 문서만 조회">
          <Select
            value={pendingIn}
            onChange={setPendingIn}
            options={[['true', '결재예정만 보기']]}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {error && <p>{error}</p>}
      <Band total={data?.total} />
      <DataTable
        columns={[
          { key: 'documentNo', label: '문서번호' },
          { key: 'title', label: '문서 제목' },
          { key: 'approvalStatus', label: '전자결재 처리 상태', render: (r) => <Badge value={r.approvalStatus} /> },
          { key: 'submittedAt', label: '상신 일시', render: (r) => <DateText value={r.submittedAt} time /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={(row) => setSelected(row)}
        empty="조건에 맞는 결재 문서가 없습니다. 조회 조건을 바꿔 보세요."
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
