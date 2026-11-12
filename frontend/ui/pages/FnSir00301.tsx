import { useState } from 'react';
import {
  ApiFail,
  Band,
  DataTable,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Pager,
  Pairs,
  RefName,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

type HelpPage = Page & { missing?: boolean };

export default function FnSir00301Page({ role, notify }: PageProps) {
  const [menuId, setMenuId] = useState<number | string>('');
  const [keyword, setKeyword] = useState('');
  const [applied, setApplied] = useState<{ menuId: number | string; keyword: string }>({ menuId: '', keyword: '' });
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<HelpPage>(async () => {
    try {
      return await call<HelpPage>('GET', '/help-contents', role, undefined, {
        menuId: applied.menuId,
        keyword: applied.keyword,
        page: pageNo,
        size: 20,
      });
    } catch (e) {
      if (e instanceof ApiFail && e.status === 404) {
        return { items: [], page: 0, size: 20, total: 0, missing: true };
      }
      throw e;
    }
  }, [role, applied, pageNo]);

  function search() {
    setPageNo(0);
    setApplied({ menuId, keyword });
  }

  function reset() {
    setMenuId('');
    setKeyword('');
    setPageNo(0);
    setApplied({ menuId: '', keyword: '' });
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>도움말</h2>
          <Pairs
            items={[
              ['제목', String(selected.title ?? '')],
              ['메뉴', <RefName table="menu" role={role} value={selected.menuId} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>도움말 내용</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{String(selected.content ?? '')}</p>
        </section>
      </div>
    );
  }

  const emptyText = data?.missing
    ? '해당 기능의 도움말이 아직 준비되지 않았습니다.'
    : applied.keyword || applied.menuId !== ''
      ? '조건에 맞는 도움말이 없습니다. 검색어나 메뉴를 바꿔 다시 조회해 주세요.'
      : '조회할 수 있는 도움말이 없습니다.';

  return (
    <div>
      <h1>온라인 도움말</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="메뉴">
          <LookupSelect table="menu" role={role} value={menuId} onChange={setMenuId} placeholder="전체 메뉴" />
        </Field>
        <Field label="도움말 검색어">
          <TextInput value={keyword} onChange={setKeyword} placeholder="제목이나 내용으로 검색" />
        </Field>
      </Filters>
      {error ? <ErrorText text={error} /> : null}
      <Band total={data?.total} />
      <DataTable
        columns={[
          { key: 'title', label: '제목' },
          { key: 'menuId', label: '메뉴', render: (r) => <RefName table="menu" role={role} value={r.menuId} /> },
        ]}
        rows={loading && !data ? [] : (data?.items ?? [])}
        onRowClick={(row) => setSelected(row)}
        empty={emptyText}
      />
      <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPageNo} />
    </div>
  );
}
