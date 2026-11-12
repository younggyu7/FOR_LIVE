import { useState } from 'react';
import { Band, DataTable, Num, Pager, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr04002Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/mobile/menu-badges', role, undefined, { page, size: SIZE }),
    [page, role],
  );
  const rows: Row[] = data?.items ?? [];

  return (
    <div className="doc">
      <section className="box">
        <h2>메뉴별 신규 건수</h2>
        <p>권한이 있는 메뉴의 안읽음 건수를 보여 줍니다.</p>
        <Band total={data?.total}>
          <button
            className="ghost"
            onClick={() => {
              reload();
              notify('신규 건수를 다시 읽었습니다.');
            }}
          >
            새로 고침
          </button>
        </Band>
        {error ? <p>{error}</p> : null}
        {loading ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          columns={[
            { key: 'menuName', label: '메뉴명' },
            { key: 'newCount', label: '메뉴별 안읽음 신규 건수', render: (row) => <Num value={row['newCount']} /> },
          ]}
          rows={rows}
          empty="표시할 메뉴가 없습니다. 메뉴 사용 권한을 확인해 주세요."
        />
        <Pager page={page} size={data?.size ?? SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
