import { useState } from 'react';
import {
  Band,
  DataTable,
  DateText,
  ErrorText,
  Field,
  Filters,
  Pager,
  Pairs,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SEARCH_TYPES: [string, string][] = [
  ['첨부파일 제목', '첨부파일 제목'],
  ['사용자명', '사용자명'],
];

export default function FnSfr03605Page({ role, notify }: PageProps) {
  const [searchType, setSearchType] = useState('사용자명');
  const [keyword, setKeyword] = useState('');
  const [applied, setApplied] = useState<{ searchType: string; keyword: string } | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page | null>(async () => {
    if (!applied) {
      return null;
    }
    return call<Page>('GET', '/messenger-messages/search', role, undefined, {
      searchType: applied.searchType,
      keyword: applied.keyword,
      page: pageNo,
    });
  }, [applied, pageNo, role]);

  const search = () => {
    if (keyword.trim() === '') {
      notify('검색어를 입력해 주세요.');
      return;
    }
    setPageNo(0);
    setApplied({ searchType, keyword: keyword.trim() });
  };

  const reset = () => {
    setSearchType('사용자명');
    setKeyword('');
    setApplied(null);
    setPageNo(0);
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로
        </button>
        <section className="box">
          <h2>메시지</h2>
          <Pairs
            items={[
              ['임직원명', String(selected.senderName ?? '')],
              ['메시지 내용', String(selected.content ?? '')],
              ['파일명', String(selected.fileName ?? '-')],
              ['발송 일시', <DateText value={selected.sentAt} time />],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>메신저 메시지 검색</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="검색 구분" required>
          <Select value={searchType} onChange={setSearchType} options={SEARCH_TYPES} />
        </Field>
        <Field label="검색어" required>
          <TextInput value={keyword} onChange={setKeyword} placeholder="검색어를 입력해 주세요" />
        </Field>
      </Filters>
      {error ? <ErrorText text={error} /> : null}
      {!applied ? (
        <p>검색 구분과 검색어를 입력한 뒤 조회해 주세요.</p>
      ) : (
        <>
          <Band total={data?.total} />
          <DataTable
            columns={[
              { key: 'senderName', label: '임직원명' },
              { key: 'content', label: '메시지 내용' },
              { key: 'fileName', label: '파일명' },
              {
                key: 'sentAt',
                label: '발송 일시',
                render: (row) => <DateText value={row.sentAt} time />,
              },
            ]}
            rows={data?.items ?? []}
            onRowClick={(row) => setSelected(row)}
            empty={loading ? '불러오는 중입니다.' : '검색 결과가 없습니다. 검색어를 바꿔 다시 조회해 주세요.'}
          />
          <Pager
            page={data?.page ?? 0}
            size={data?.size ?? 20}
            total={data?.total ?? 0}
            onPage={setPageNo}
          />
        </>
      )}
    </div>
  );
}
