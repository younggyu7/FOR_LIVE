import { useState } from 'react';
import { Band, DataTable, ErrorText, Field, Filters, Pager, Pairs, Select, TextInput, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr04010Page({ role, notify }: PageProps) {
  const [keyword, setKeyword] = useState('');
  const [target, setTarget] = useState('');
  const [applied, setApplied] = useState<{ keyword: string; target: string } | null>(null);
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page>(async () => {
    if (applied === null) {
      return { items: [], page: 0, size: SIZE, total: 0 };
    }
    return call<Page>('GET', '/search', role, undefined, {
      keyword: applied.keyword,
      searchTarget: applied.target,
      page,
      size: SIZE,
    });
  }, [applied, page, role]);

  const search = () => {
    if (keyword.trim() === '') {
      setMessage('검색어를 입력해 주세요.');
      return;
    }
    setMessage('');
    setPage(0);
    setApplied({ keyword: keyword.trim(), target });
  };

  const reset = () => {
    setKeyword('');
    setTarget('');
    setMessage('');
    setApplied(null);
    setPage(0);
  };

  const open = (row: Row) => {
    setSelected(row);
    notify('선택한 결과의 상세를 표시했습니다.');
  };

  if (selected !== null) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>검색 결과로 돌아가기</button>
        <section className="box">
          <h2>선택한 결과</h2>
          <Pairs
            items={[
              ['업무영역 구분', String(selected['areaType'] ?? '')],
              ['결과 제목', String(selected['title'] ?? '')],
              ['결과 문서·게시물 ID', String(selected['targetId'] ?? '')],
              ['파일명', String(selected['attachmentName'] ?? '-')],
            ]}
          />
        </section>
      </div>
    );
  }

  const rows = data?.items ?? [];
  return (
    <div className="doc">
      <h1>모바일 통합검색</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="검색어" required>
          <TextInput value={keyword} onChange={setKeyword} placeholder="검색어를 입력하세요" />
        </Field>
        <Field label="업무영역 또는 첨부파일 제목·내용">
          <Select
            value={target}
            onChange={setTarget}
            placeholder="전체"
            options={[['업무영역', '업무영역'], ['첨부파일', '첨부파일']]}
          />
        </Field>
      </Filters>
      {message !== '' && <ErrorText text={message} />}
      {error !== '' && <ErrorText text={error} />}
      {applied === null ? (
        <p>검색어를 입력하고 조회 버튼을 눌러 주세요.</p>
      ) : (
        <>
          <Band total={data?.total ?? 0} />
          <DataTable
            columns={[
              { key: 'areaType', label: '업무영역 구분' },
              { key: 'title', label: '결과 제목' },
              { key: 'attachmentName', label: '파일명', render: (r) => <span>{String(r['attachmentName'] ?? '-')}</span> },
            ]}
            rows={rows}
            onRowClick={open}
            empty={loading ? '불러오는 중입니다.' : '검색 결과가 없습니다. 다른 검색어로 다시 찾아 보세요.'}
          />
          <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
        </>
      )}
    </div>
  );
}
