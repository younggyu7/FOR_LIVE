import { useState } from 'react';
import type { PageProps, Row } from '../kit';
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
  NumberInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';

const STATUS_OPTIONS: [string, string][] = [
  ['신청', '신청'],
  ['마감', '마감'],
  ['마감 취소', '마감 취소'],
  ['승인', '승인'],
  ['승인 취소', '승인 취소'],
  ['반려', '반려'],
];

const SIZE = 20;

function cancelPath(id: unknown): string {
  return ['', 'journal-entries', String(id), 'cancel'].join('/');
}

export default function FnSfr00405Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [resolutionFilter, setResolutionFilter] = useState<number | string>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [resolutionId, setResolutionId] = useState<number | string>('');
  const [accountSubjectId, setAccountSubjectId] = useState<number | string>('');
  const [summary, setSummary] = useState('');
  const [evidenceDetail, setEvidenceDetail] = useState('');

  const list = useData(
    () =>
      call<{ items: Row[]; page: number; size: number; total: number }>(
        'GET',
        '/journal-entries',
        role,
        undefined,
        { ...applied, page: page, size: SIZE },
      ),
    [applied, page, role],
  );

  function search() {
    setPage(0);
    setApplied({ expenseResolutionId: resolutionFilter, status: statusFilter });
  }

  function reset() {
    setResolutionFilter('');
    setStatusFilter('');
    setPage(0);
    setApplied({});
  }

  function openCreate() {
    setResolutionId('');
    setAccountSubjectId('');
    setSummary('');
    setEvidenceDetail('');
    setCreating(true);
  }

  async function submitCreate() {
    if (resolutionId === '') {
      throw new Error('결의서를 선택해 주세요.');
    }
    if (accountSubjectId === '') {
      throw new Error('계정과목 ID를 입력해 주세요.');
    }
    await call('POST', '/journal-entries', role, {
      expenseResolutionId: resolutionId,
      accountSubjectId: accountSubjectId,
      summary: summary,
      evidenceDetail: evidenceDetail,
    });
    notify('전표를 생성했습니다.');
    setCreating(false);
    list.reload();
  }

  async function submitCancel() {
    if (!selected) {
      return;
    }
    await call('POST', cancelPath(selected['journalEntryId']), role, {});
    notify('전표를 취소했습니다.');
    setCancelling(false);
    setSelected(null);
    list.reload();
  }

  if (selected) {
    const canCancel = selected['status'] !== '마감' && selected['status'] !== '승인 취소';
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>전표 정보</h2>
          <Pairs
            items={[
              ['전표 ID', String(selected['journalEntryId'])],
              ['결의서 ID', <RefName table="expense_resolution" role={role} value={selected['expenseResolutionId']} />],
              ['전표 일자', <DateText value={selected['entryDate']} />],
              ['전표 상태', <Badge value={selected['status']} />],
              ['적요', String(selected['summary'] ?? '')],
              ['증빙내역', String(selected['evidenceDetail'] ?? '')],
            ]}
          />
        </section>
        <section className="box">
          <h2>분개 금액</h2>
          <Pairs
            items={[
              ['차변 합계', <Num value={selected['totalDebitAmount']} />],
              ['대변 합계', <Num value={selected['totalCreditAmount']} />],
            ]}
          />
        </section>
        {canCancel && (
          <button onClick={() => setCancelling(true)}>전표 취소</button>
        )}
        {cancelling && (
          <Drawer title="전표 취소" onClose={() => setCancelling(false)}>
            <Form
              onSubmit={submitCancel}
              submit="전표 취소"
              danger
              note="취소하면 전표 상태가 승인 취소로 바뀌며 되돌릴 수 없습니다."
            >
              <Pairs items={[['전표 ID', String(selected['journalEntryId'])]]} />
            </Form>
          </Drawer>
        )}
      </div>
    );
  }

  const data = list.data;
  return (
    <div className="doc">
      <h1>자금집행 정보 및 전표 관리</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="결의서 ID">
          <LookupSelect
            table="expense_resolution"
            role={role}
            value={resolutionFilter}
            onChange={setResolutionFilter}
          />
        </Field>
        <Field label="전표 상태">
          <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
        </Field>
      </Filters>
      {list.error && <ErrorText text={list.error} />}
      <Band total={data?.total}>
        <button onClick={openCreate}>전표 생성</button>
      </Band>
      <DataTable
        columns={[
          { key: 'journalEntryId', label: '전표 ID' },
          {
            key: 'expenseResolutionId',
            label: '결의서 ID',
            render: (row) => <RefName table="expense_resolution" role={role} value={row['expenseResolutionId']} />,
          },
          { key: 'entryDate', label: '전표 일자', render: (row) => <DateText value={row['entryDate']} /> },
          { key: 'status', label: '전표 상태', render: (row) => <Badge value={row['status']} /> },
          { key: 'totalDebitAmount', label: '차변 합계', render: (row) => <Num value={row['totalDebitAmount']} /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={(row) => setSelected(row)}
        empty="아직 등록한 전표가 없습니다. 전표 생성 버튼으로 승인된 결의서의 전표를 만들어 주세요."
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      {creating && (
        <Drawer title="전표 생성" onClose={() => setCreating(false)}>
          <Form onSubmit={submitCreate} submit="전표 생성">
            <Field label="결의서 ID" required>
              <LookupSelect
                table="expense_resolution"
                role={role}
                value={resolutionId}
                onChange={setResolutionId}
              />
            </Field>
            <Field label="분개에 사용할 계정과목 ID" required>
              <NumberInput value={accountSubjectId} onChange={setAccountSubjectId} />
            </Field>
            <Field label="적요" wide>
              <TextInput value={summary} onChange={setSummary} />
            </Field>
            <Field label="증빙내역" wide>
              <TextInput value={evidenceDetail} onChange={setEvidenceDetail} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
