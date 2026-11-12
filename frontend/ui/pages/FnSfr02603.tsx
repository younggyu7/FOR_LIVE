import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  Drawer,
  ErrorText,
  Field,
  Filters,
  Pager,
  Pairs,
  Select,
  TextInput,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const SIZE = 20;
const TARGET_OPTIONS: [string, string][] = [
  ['제목', '제목'],
  ['내용', '내용'],
  ['첨부파일 제목', '첨부파일 제목'],
  ['첨부파일 내용', '첨부파일 내용'],
];

export default function FnSfr02603Page({ role }: PageProps) {
  const [keyword, setKeyword] = useState('');
  const [target, setTarget] = useState('');
  const [applied, setApplied] = useState<{ keyword: string; target: string } | null>(null);
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    return call<Page>('GET', '/search-results', role, undefined, {
      keyword: applied.keyword,
      searchTarget: applied.target,
      page,
      size: SIZE,
    });
  }, [applied, page, role]);

  const search = () => {
    if (!keyword.trim()) {
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
    setApplied(null);
    setPage(0);
    setMessage('');
  };

  const rows = data ? (data.items as Row[]) : [];
  const emptyText = applied
    ? '권한 범위 안에 검색 결과가 없습니다.'
    : '검색어를 입력하고 조회를 눌러 주세요.';

  return (
    <div>
      <h1>그룹웨어 통합검색</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="검색어" required>
          <TextInput value={keyword} onChange={setKeyword} placeholder="검색어를 입력하세요" />
        </Field>
        <Field label="검색 대상" hint="선택하지 않으면 전체에서 검색합니다.">
          <Select value={target} onChange={setTarget} options={TARGET_OPTIONS} placeholder="전체" />
        </Field>
      </Filters>
      {message ? <ErrorText text={message} /> : null}
      {error ? <ErrorText text={error} /> : null}
      <Band total={data ? data.total : 0} />
      <DataTable
        columns={[
          { key: 'title', label: '결과 제목' },
          { key: 'resultType', label: '데이터 유형' },
          { key: 'matchLocation', label: '일치 위치' },
          { key: 'targetId', label: '이동할 데이터 ID' },
        ]}
        rows={rows}
        onRowClick={(row) => setSelected(row)}
        empty={loading ? '검색 중입니다.' : emptyText}
      />
      {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} /> : null}
      {selected ? (
        <Drawer title="검색 결과" onClose={() => setSelected(null)}>
          <Pairs
            items={[
              ['결과 제목', String(selected['title'] ?? '')],
              ['데이터 유형', String(selected['resultType'] ?? '')],
              ['일치 위치', String(selected['matchLocation'] ?? '')],
              ['이동할 데이터 ID', String(selected['targetId'] ?? '')],
            ]}
          />
        </Drawer>
      ) : null}
    </div>
  );
}
