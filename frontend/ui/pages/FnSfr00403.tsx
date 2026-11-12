import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  DateInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

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

export default function FnSfr00403Page({ role, notify }: PageProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [projectId, setProjectId] = useState<number | string>('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | undefined>(undefined);
  const [mode, setMode] = useState<'resolution' | 'requisition'>('resolution');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/approval-items', role, undefined, { ...applied, page }),
    [applied, page, role],
  );

  const search = () => {
    setPage(0);
    setApplied({ fromDate, toDate, projectId, status });
  };

  const reset = () => {
    setFromDate('');
    setToDate('');
    setProjectId('');
    setStatus('');
    setPage(0);
    setApplied({});
  };

  const approveResolution = async () => {
    if (!selected) return;
    const id = String(selected['expenseResolutionId']);
    await call(
      'POST',
      '/expense-resolutions/{expenseResolutionId}/approve'.replace('{expenseResolutionId}', id),
      role,
      {},
    );
    notify('결의서를 승인했습니다.');
    setSelected(undefined);
    reload();
  };

  const approveRequisition = async () => {
    if (!selected) return;
    const id = String(selected['requisitionId']);
    await call(
      'POST',
      '/requisitions/{requisitionId}/approve'.replace('{requisitionId}', id),
      role,
    );
    notify('품의서를 승인했습니다.');
    setSelected(undefined);
    reload();
  };

  const open = (row: Row, next: 'resolution' | 'requisition') => {
    setMode(next);
    setSelected(row);
  };

  const hasRequisition = selected !== undefined && selected['requisitionId'] != null;

  return (
    <div>
      <h1>품의·결의 승인</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="조회 시작일">
          <DateInput value={fromDate} onChange={setFromDate} />
        </Field>
        <Field label="조회 종료일">
          <DateInput value={toDate} onChange={setToDate} />
        </Field>
        <Field label="프로젝트">
          <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} />
        </Field>
        <Field label="진행 상태">
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </Field>
      </Filters>
      {error ? <ErrorText text={error} /> : null}
      <Band total={data ? data.total : 0} />
      <DataTable
        rows={data ? data.items : []}
        empty={loading ? '불러오는 중입니다.' : '조건에 맞는 품의·결의가 없습니다. 조건을 바꿔 다시 조회해 주세요.'}
        onRowClick={(row) => open(row, 'resolution')}
        columns={[
          { key: 'expenseResolutionId', label: '결의서 ID' },
          {
            key: 'requisitionId',
            label: '품의서 ID',
            render: (row) =>
              row['requisitionId'] != null ? (
                <RefName table="requisition" role={role} value={row['requisitionId']} />
              ) : (
                <span>-</span>
              ),
          },
          {
            key: 'projectId',
            label: '프로젝트',
            render: (row) => <RefName table="project" role={role} value={row['projectId']} />,
          },
          { key: 'status', label: '진행 상태', render: (row) => <Badge value={row['status']} /> },
        ]}
      />
      <Pager
        page={data ? data.page : 0}
        size={data ? data.size : 20}
        total={data ? data.total : 0}
        onPage={setPage}
      />
      {selected ? (
        <Drawer title="품의·결의 승인 처리" onClose={() => setSelected(undefined)}>
          <Pairs
            items={[
              ['결의서 ID', String(selected['expenseResolutionId'])],
              [
                '품의서 ID',
                selected['requisitionId'] != null ? (
                  <RefName table="requisition" role={role} value={selected['requisitionId']} />
                ) : (
                  '-'
                ),
              ],
              ['프로젝트', <RefName table="project" role={role} value={selected['projectId']} />],
              ['진행 상태', <Badge value={selected['status']} />],
            ]}
          />
          <div>
            <button className="ghost" onClick={() => setMode('resolution')}>
              결의서 승인
            </button>
            {hasRequisition ? (
              <button className="ghost" onClick={() => setMode('requisition')}>
                품의서 승인
              </button>
            ) : null}
          </div>
          {mode === 'resolution' ? (
            selected['status'] === '결재대기' ? (
              <Form
                onSubmit={approveResolution}
                submit="결의서 승인"
                note="승인하면 결의서 상태가 승인으로 바뀌고 변경 이력이 남습니다."
              />
            ) : (
              <p>결재대기 상태의 결의서만 승인할 수 있습니다.</p>
            )
          ) : (
            <Form
              onSubmit={approveRequisition}
              submit="품의서 승인"
              note="결재대기 상태의 품의서만 승인되며, 승인하면 품의서 상태가 승인으로 바뀝니다."
            />
          )}
        </Drawer>
      ) : null}
    </div>
  );
}
