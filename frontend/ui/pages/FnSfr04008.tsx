import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateText,
  ErrorText,
  Field,
  Filters,
  Num,
  Pager,
  Pairs,
  RefName,
  Select,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

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

const SIZE = 20;

function Detail({ id, role, onBack }: { id: number; role: string; onBack: () => void }) {
  const { data, error, loading } = useData<Row>(
    () => call('GET', '/approval-documents/' + id, role),
    [id],
  );
  const lines = ((data?.approvalLines as Row[] | undefined) ?? []);
  const files = ((data?.attachments as Row[] | undefined) ?? []);
  return (
    <div className="doc">
      <button className="ghost" onClick={onBack}>
        목록으로 돌아가기
      </button>
      {error && <ErrorText text={error} />}
      {loading && <p>불러오는 중입니다.</p>}
      {data && (
        <>
          <section className="box">
            <h2>문서 내용</h2>
            <Pairs
              items={[
                ['문서 제목', String(data.title ?? '')],
                ['전자결재 처리 상태', <Badge value={data.approvalStatus} />],
                ['문서 본문', String(data.body ?? '')],
              ]}
            />
          </section>
          <section className="box">
            <h2>결재 진행 현황</h2>
            <DataTable
              rows={lines}
              empty="등록된 결재선이 없습니다."
              columns={[
                { key: 'approvalOrder', label: '결재 순서' },
                {
                  key: 'employeeId',
                  label: '결재자',
                  render: (r) => <RefName table="employee" role={role} value={r.employeeId} />,
                },
                {
                  key: 'approvalStatus',
                  label: '결재 상태',
                  render: (r) => <Badge value={r.approvalStatus} />,
                },
                { key: 'opinion', label: '결재 의견' },
                {
                  key: 'processedAt',
                  label: '처리 시각',
                  render: (r) => <DateText value={r.processedAt} time />,
                },
              ]}
            />
          </section>
          <section className="box">
            <h2>첨부파일</h2>
            <DataTable
              rows={files}
              empty="첨부된 파일이 없습니다."
              columns={[
                { key: 'fileName', label: '파일명' },
                { key: 'fileExtension', label: '확장자' },
                {
                  key: 'fileSize',
                  label: '파일 크기(바이트)',
                  render: (r) => <Num value={r.fileSize} />,
                },
              ]}
            />
          </section>
        </>
      )}
    </div>
  );
}

export default function FnSfr04008Page({ role }: PageProps) {
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, error, loading } = useData<Page>(
    () =>
      call<Page>('GET', '/approval-documents', role, undefined, {
        approvalStatus: applied,
        page,
        size: SIZE,
      }),
    [applied, page],
  );

  if (selectedId !== null) {
    return <Detail id={selectedId} role={role} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>상신함</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setApplied(status);
          }}
          onReset={() => {
            setStatus('');
            setApplied('');
            setPage(0);
          }}
        >
          <Field label="전자결재 처리 상태">
            <Select value={status} onChange={setStatus} options={STATUSES} placeholder="전체" />
          </Field>
        </Filters>
        {error && <ErrorText text={error} />}
        {loading && <p>불러오는 중입니다.</p>}
        <Band total={data?.total} />
        <DataTable
          rows={data?.items ?? []}
          empty="아직 상신한 문서가 없습니다. 문서를 상신하면 이곳에 표시됩니다."
          onRowClick={(r) => setSelectedId(Number(r.approvalDocumentId))}
          columns={[
            { key: 'documentNo', label: '문서번호' },
            { key: 'title', label: '문서 제목' },
            {
              key: 'approvalStatus',
              label: '전자결재 처리 상태',
              render: (r) => <Badge value={r.approvalStatus} />,
            },
            {
              key: 'submittedAt',
              label: '상신 일시',
              render: (r) => <DateText value={r.submittedAt} time />,
            },
          ]}
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
