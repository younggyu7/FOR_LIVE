import { useState } from 'react';
import { call, useData, Filters, Band, DataTable, Pager, Pairs, Field, TextInput, ErrorText } from '../kit';
import type { PageProps, Page, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr00106Page({ role }: PageProps) {
  const [draftModule, setDraftModule] = useState('');
  const [module, setModule] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/menus', role, undefined, { module, page, size: PAGE_SIZE }),
    [module, page, role],
  );

  const search = () => {
    setPage(0);
    setModule(draftModule.trim());
  };

  const reset = () => {
    setDraftModule('');
    setModule('');
    setPage(0);
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>메뉴 정보</h2>
          <Pairs
            items={[
              ['메뉴명', String(selected.name ?? '')],
              ['연결 모듈', String(selected.module ?? '')],
              ['표시순서', String(selected.displayOrder ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>사용할 수 있는 ERP 메뉴</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="연결 모듈">
            <TextInput value={draftModule} onChange={setDraftModule} placeholder="모듈 이름" />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'module', label: '연결 모듈' },
            { key: 'name', label: '메뉴명' },
            { key: 'displayOrder', label: '표시순서' },
          ]}
          rows={data?.items ?? []}
          onRowClick={(row) => setSelected(row)}
          empty={loading ? '메뉴를 불러오는 중입니다.' : '사용할 수 있는 메뉴가 없습니다. 권한을 확인해 주세요.'}
        />
        <Pager page={data?.page ?? page} size={data?.size ?? PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
