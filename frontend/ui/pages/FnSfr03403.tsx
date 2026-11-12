import { useState } from 'react';
import {
  Band,
  Badge,
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

export default function FnSfr03403Page({ role }: PageProps) {
  const [category, setCategory] = useState('');
  const [postType, setPostType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const list = useData<Page>(
    () => call<Page>('GET', '/board-posts', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page, selected === null],
  );
  const detail = useData<Row | null>(
    () => (selected === null ? Promise.resolve(null) : call('GET', '/board-posts/' + selected, role)),
    [selected],
  );

  function search() {
    setPage(0);
    setApplied({ category, postType, keyword });
  }

  function reset() {
    setCategory('');
    setPostType('');
    setKeyword('');
    setPage(0);
    setApplied({});
  }

  function isPinned(row: Row) {
    const start = row['pinStartDate'];
    const end = row['pinEndDate'];
    if (typeof start !== 'string' || typeof end !== 'string') {
      return false;
    }
    const today = new Date().toISOString().slice(0, 10);
    return start <= today && today <= end;
  }

  if (selected !== null) {
    const post = detail.data;
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        {detail.error ? <ErrorText text={detail.error} /> : null}
        {post ? (
          <>
            <section className="box">
              <h2>{String(post['title'] ?? '')}</h2>
              <Pairs
                items={[
                  ['구분', <Badge value={post['postType']} />],
                  ['분류', String(post['category'] ?? '')],
                  ['작성자', <RefName table="employee" role={role} value={post['authorId']} />],
                  ['생성 일시', <DateText value={post['createdAt']} time />],
                ]}
              />
            </section>
            <section className="box">
              <h2>내용</h2>
              <p>{String(post['content'] ?? '')}</p>
            </section>
          </>
        ) : null}
      </div>
    );
  }

  const rows = list.data?.items ?? [];
  return (
    <div className="doc">
      <section className="box">
        <h2>공지·게시물</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="분류">
            <TextInput value={category} onChange={setCategory} />
          </Field>
          <Field label="구분">
            <Select
              value={postType}
              onChange={setPostType}
              options={[
                ['공지', '공지'],
                ['게시글', '게시글'],
              ]}
              placeholder="전체"
            />
          </Field>
          <Field label="검색어">
            <TextInput value={keyword} onChange={setKeyword} placeholder="제목·내용" />
          </Field>
        </Filters>
      </section>
      <section className="box">
        {list.error ? <ErrorText text={list.error} /> : null}
        <Band total={list.data?.total} />
        <DataTable
          columns={[
            {
              key: 'title',
              label: '제목',
              render: (row) => (
                <span>
                  {isPinned(row) ? '[고정] ' : ''}
                  [{String(row['postType'] ?? '')}] {String(row['title'] ?? '')}
                </span>
              ),
            },
            { key: 'category', label: '분류' },
            {
              key: 'authorId',
              label: '작성자',
              render: (row) => <RefName table="employee" role={role} value={row['authorId']} />,
            },
            {
              key: 'createdAt',
              label: '생성 일시',
              render: (row) => <DateText value={row['createdAt']} />,
            },
            {
              key: 'readStatus',
              label: '읽음 상태',
              render: (row) => <Badge value={row['readStatus']} />,
            },
          ]}
          rows={rows}
          onRowClick={(row) => setSelected(Number(row['boardPostId']))}
          empty="조회 결과가 없습니다. 분류나 검색어를 바꿔 다시 조회해 주세요."
        />
        <Pager page={page} size={SIZE} total={list.data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
