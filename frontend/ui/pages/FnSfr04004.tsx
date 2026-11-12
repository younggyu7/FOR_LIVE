import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateText,
  ErrorText,
  Field,
  Filters,
  Pager,
  Pairs,
  RefName,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

const TYPE_OPTIONS: [string, string][] = [
  ['공지', '공지'],
  ['게시글', '게시글'],
];

function PostDetail({ id, role, onBack }: { id: number; role: string; onBack: () => void }) {
  const { data, error, loading } = useData<Row>(
    () => call<Row>('GET', '/board-posts/' + id, role),
    [id, role],
  );
  return (
    <div className="doc">
      <button className="ghost" onClick={onBack}>
        목록으로 돌아가기
      </button>
      {loading && <p>불러오는 중입니다.</p>}
      {error && <ErrorText text={error} />}
      {data && (
        <section className="box">
          <h2>{String(data.title ?? '')}</h2>
          <Pairs
            items={[
              ['구분', <Badge value={data.postType} />],
              ['분류', String(data.category ?? '')],
              ['작성자', <RefName table="employee" role={role} value={data.authorId} />],
              ['생성 일시', <DateText value={data.createdAt} time />],
              ['내용', String(data.content ?? '')],
            ]}
          />
        </section>
      )}
    </div>
  );
}

export default function FnSfr04004Page({ role, notify }: PageProps) {
  void notify;
  const [postType, setPostType] = useState('');
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/board-posts', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page, role, selectedId],
  );

  const search = () => {
    setPage(0);
    setApplied({ postType, category, keyword });
  };

  const reset = () => {
    setPostType('');
    setCategory('');
    setKeyword('');
    setPage(0);
    setApplied({});
  };

  if (selectedId !== null) {
    return <PostDetail id={selectedId} role={role} onBack={() => setSelectedId(null)} />;
  }

  const rows = data?.items ?? [];

  return (
    <div className="doc">
      <section className="box">
        <h2>공지·게시글</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="구분">
            <Select value={postType} onChange={setPostType} options={TYPE_OPTIONS} placeholder="전체" />
          </Field>
          <Field label="분류">
            <TextInput value={category} onChange={setCategory} />
          </Field>
          <Field label="검색어" hint="제목·내용">
            <TextInput value={keyword} onChange={setKeyword} />
          </Field>
        </Filters>
        {error && <ErrorText text={error} />}
        {loading && <p>불러오는 중입니다.</p>}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'postType', label: '구분', render: (r) => <Badge value={r.postType} /> },
            { key: 'title', label: '제목' },
            {
              key: 'authorId',
              label: '작성자',
              render: (r) => <RefName table="employee" role={role} value={r.authorId} />,
            },
            { key: 'createdAt', label: '생성 일시', render: (r) => <DateText value={r.createdAt} time /> },
            { key: 'readStatus', label: '읽음 여부', render: (r) => <Badge value={r.readStatus} /> },
          ]}
          rows={rows}
          onRowClick={(r) => setSelectedId(Number(r.boardPostId))}
          empty="조회된 게시물이 없습니다. 조회 조건을 바꿔 다시 찾아보세요."
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
