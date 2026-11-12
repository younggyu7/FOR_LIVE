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
  TextInput,
  DateInput,
  call,
  useData,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const PAGE_SIZE = 20;
const BOX_TYPES: [string, string][] = [
  ['개인문서함', '개인문서함'],
  ['부서문서함', '부서문서함'],
];

interface Condition {
  boxType: string;
  title: string;
  completedFrom: string;
  completedTo: string;
}

const INITIAL: Condition = { boxType: '개인문서함', title: '', completedFrom: '', completedTo: '' };

function Detail({ role, id, onBack }: { role: string; id: number; onBack: () => void }) {
  const { data, error, loading } = useData<Row>(
    () => call('GET', `/document-box-items/${id}`, role),
    [id],
  );
  const lines = (data?.['approvalLines'] as Row[] | undefined) ?? [];
  const files = (data?.['attachments'] as Row[] | undefined) ?? [];
  return (
    <div className="doc">
      <button className="ghost" onClick={onBack}>
        목록으로 돌아가기
      </button>
      {error ? <ErrorText text={error} /> : null}
      {loading ? <p>문서를 불러오는 중입니다.</p> : null}
      {data ? (
        <>
          <section className="box">
            <h2>문서 내용</h2>
            <Pairs
              items={[
                ['문서 제목', String(data['title'] ?? '')],
                ['전자결재 처리 상태', <Badge value={data['approvalStatus']} />],
                ['완료 일시', <DateText value={data['completedAt']} time />],
                ['문서 본문', String(data['body'] ?? '')],
              ]}
            />
          </section>
          <section className="box">
            <h2>결재선</h2>
            <DataTable
              columns={[
                { key: 'approvalOrder', label: '결재 순서', render: (r) => <Num value={r['approvalOrder']} /> },
                { key: 'employeeId', label: '결재자', render: (r) => <RefName table="employee" role={role} value={r['employeeId']} /> },
                { key: 'approvalStatus', label: '결재 상태', render: (r) => <Badge value={r['approvalStatus']} /> },
                { key: 'opinion', label: '결재 의견' },
                { key: 'processedAt', label: '처리일시', render: (r) => <DateText value={r['processedAt']} time /> },
              ]}
              rows={lines}
              empty="등록된 결재선이 없습니다."
            />
          </section>
          <section className="box">
            <h2>첨부파일</h2>
            <DataTable
              columns={[
                { key: 'fileName', label: '파일명' },
                { key: 'fileExtension', label: '확장자' },
                { key: 'fileSize', label: '파일 크기(바이트)', render: (r) => <Num value={r['fileSize']} /> },
              ]}
              rows={files}
              empty="첨부된 파일이 없습니다."
            />
          </section>
        </>
      ) : null}
    </div>
  );
}

export default function FnSfr04009Page({ role }: PageProps) {
  const [form, setForm] = useState<Condition>(INITIAL);
  const [applied, setApplied] = useState<Condition>(INITIAL);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, error, loading } = useData<Page>(
    () =>
      call<Page>('GET', '/document-box-items', role, undefined, {
        ...applied,
        page,
        size: PAGE_SIZE,
      }),
    [applied, page],
  );

  if (selectedId !== null) {
    return <Detail role={role} id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const search = () => {
    setPage(0);
    setApplied(form);
  };
  const reset = () => {
    setForm(INITIAL);
    setPage(0);
    setApplied(INITIAL);
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>모바일 문서함 완료문서</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="문서함 구분" required>
            <Select
              value={form.boxType}
              onChange={(v) => setForm({ ...form, boxType: v })}
              options={BOX_TYPES}
            />
          </Field>
          <Field label="제목 검색어">
            <TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          </Field>
          <Field label="조회 시작일">
            <DateInput value={form.completedFrom} onChange={(v) => setForm({ ...form, completedFrom: v })} />
          </Field>
          <Field label="조회 종료일">
            <DateInput value={form.completedTo} onChange={(v) => setForm({ ...form, completedTo: v })} />
          </Field>
        </Filters>
      </section>
      <section className="box">
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'title', label: '문서 제목' },
            { key: 'approvalStatus', label: '전자결재 처리 상태', render: (r) => <Badge value={r['approvalStatus']} /> },
            { key: 'completedAt', label: '완료 일시', render: (r) => <DateText value={r['completedAt']} time /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(row) => setSelectedId(Number(row['documentBoxItemId']))}
          empty={loading ? '불러오는 중입니다.' : '완료된 문서가 없습니다. 다른 문서함이나 기간을 선택해 보세요.'}
        />
        <Pager page={page} size={data?.size ?? PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
