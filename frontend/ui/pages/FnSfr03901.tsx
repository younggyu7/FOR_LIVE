import { useState } from 'react';
import {
  call,
  useData,
  Page,
  Row,
  PageProps,
  Filters,
  Band,
  DataTable,
  Pager,
  Pairs,
  Tiles,
  Field,
  TextInput,
  Select,
  ErrorText,
  Num,
} from '../kit';

const CATEGORY_OPTIONS: [string, string][] = [
  ['전자결재', '전자결재'],
  ['게시판', '게시판'],
  ['일정', '일정'],
  ['문서함', '문서함'],
];

export default function FnSfr03901Page({ role, notify }: PageProps) {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [applied, setApplied] = useState({ keyword: '', category: '', page: 0 });
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);

  const list = useData<Page>(async () => {
    if (!applied.keyword) {
      return { items: [], page: 0, size: 20, total: 0 };
    }
    return call<Page>('GET', '/integrated-searches', role, undefined, {
      keyword: applied.keyword,
      category: applied.category,
      page: applied.page,
      size: 20,
    });
  }, [applied.keyword, applied.category, applied.page]);

  const search = () => {
    if (!keyword.trim()) {
      setMessage('검색어를 입력해 주세요.');
      return;
    }
    setMessage('');
    setApplied({ keyword: keyword.trim(), category, page: 0 });
  };

  const reset = () => {
    setKeyword('');
    setCategory('');
    setMessage('');
    setApplied({ keyword: '', category: '', page: 0 });
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>검색 결과</h2>
          <Pairs
            items={[
              ['결과 카테고리', String(selected.category ?? '')],
              ['문서·게시물·일정·문서함 제목', String(selected.title ?? '')],
              ['원문서 식별자', String(selected.targetId ?? '')],
              ['파일명', selected.fileName ? String(selected.fileName) : '첨부파일 없음'],
            ]}
          />
        </section>
      </div>
    );
  }

  const page = list.data;
  const items = page ? page.items : [];
  const counts: Record<string, unknown> = {};
  items.forEach((row) => {
    counts[String(row.category)] = row.categoryCount;
  });
  const tiles: [string, React.ReactNode][] = Object.keys(counts).map((name) => [
    name,
    <Num key={name} value={counts[name]} />,
  ]);

  return (
    <div className="doc">
      <h1>그룹웨어 통합검색</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="검색어" required>
          <TextInput value={keyword} onChange={setKeyword} placeholder="검색어를 입력하세요" />
        </Field>
        <Field label="검색 카테고리">
          <Select value={category} onChange={setCategory} options={CATEGORY_OPTIONS} placeholder="전체" />
        </Field>
      </Filters>
      {message ? <ErrorText text={message} /> : null}
      {list.error ? <ErrorText text={list.error} /> : null}
      {tiles.length > 0 ? <Tiles items={tiles} /> : null}
      <Band total={page ? page.total : 0} />
      <DataTable
        columns={[
          { key: 'category', label: '결과 카테고리' },
          { key: 'title', label: '제목' },
          { key: 'fileName', label: '파일명' },
          { key: 'categoryCount', label: '카테고리별 건수', render: (row) => <Num value={row.categoryCount} /> },
        ]}
        rows={items}
        onRowClick={(row) => setSelected(row)}
        empty={applied.keyword ? '검색 결과가 없습니다. 다른 검색어로 다시 찾아 보세요.' : '검색어를 입력하고 검색해 보세요.'}
      />
      {page ? (
        <Pager
          page={page.page}
          size={page.size}
          total={page.total}
          onPage={(p) => setApplied({ ...applied, page: p })}
        />
      ) : null}
    </div>
  );
}
