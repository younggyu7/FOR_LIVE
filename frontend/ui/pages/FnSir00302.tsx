import { useState } from 'react';
import {
  call,
  useData,
  Filters,
  Field,
  TextInput,
  Band,
  DataTable,
  Pager,
  Pairs,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSir00302Page({ role }: PageProps) {
  const [draftCode, setDraftCode] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error } = useData<Page>(
    () => call<Page>('GET', '/error-messages', role, undefined, { errorCode, page, size: PAGE_SIZE }),
    [errorCode, page, role],
  );

  function search() {
    setPage(0);
    setErrorCode(draftCode.trim());
  }

  function reset() {
    setDraftCode('');
    setErrorCode('');
    setPage(0);
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>에러 메시지</h2>
          <Pairs
            items={[
              ['에러 코드', String(selected['errorCode'] ?? '')],
              ['에러 메시지', String(selected['message'] ?? '')],
              ['조치 안내', String(selected['actionGuide'] ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>오류 에러 메시지</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="에러 코드">
            <TextInput value={draftCode} onChange={setDraftCode} placeholder="에러 코드를 입력하세요." />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'errorCode', label: '에러 코드' },
            { key: 'message', label: '에러 메시지' },
            { key: 'actionGuide', label: '조치 안내' },
          ]}
          rows={data?.items ?? []}
          onRowClick={(row) => setSelected(row)}
          empty="조건에 맞는 에러 메시지가 없습니다. 에러 코드를 바꿔 다시 조회해 주세요."
        />
        <Pager page={page} size={data?.size ?? PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
