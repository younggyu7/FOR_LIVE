import { useState } from 'react';
import { Band, DataTable, DateInput, ErrorText, Field, Filters, Num, Pager, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr03804Page({ role, notify }: PageProps) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/menu-usage-statistics', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page],
  );

  const rows = data ? data.items : [];
  const maxCount = rows.reduce((max, row) => Math.max(max, Number(row['usageCount']) || 0), 0);

  const search = () => {
    if (start && end && end < start) {
      setFormError('집계 종료일은 시작일보다 앞설 수 없습니다.');
      return;
    }
    setFormError('');
    setPage(0);
    setApplied({ startDate: start, endDate: end });
  };

  const reset = () => {
    setStart('');
    setEnd('');
    setFormError('');
    setPage(0);
    setApplied({});
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>메뉴별 사용 통계</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="집계 시작일">
            <DateInput value={start} onChange={setStart} />
          </Field>
          <Field label="집계 종료일">
            <DateInput value={end} onChange={setEnd} />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>사용 건수</h2>
        <Band total={data ? data.total : undefined} />
        {loading ? <p>통계를 불러오는 중입니다.</p> : null}
        <DataTable
          columns={[
            { key: 'menuName', label: '메뉴명' },
            { key: 'usageCount', label: '메뉴별 사용 건수', render: (row) => <Num value={row['usageCount']} /> },
            {
              key: 'chart',
              label: '비율',
              render: (row) => {
                const count = Number(row['usageCount']) || 0;
                const percent = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                return (
                  <div className="bar">
                    <div className="bar-fill" style={{ width: percent + '%' }}>&nbsp;</div>
                  </div>
                );
              },
            },
          ]}
          rows={rows}
          empty="선택한 기간에 기록된 메뉴 사용 내역이 없습니다. 조회 기간을 바꿔 다시 조회해 주세요."
        />
        <Pager page={page} size={SIZE} total={data ? data.total : 0} onPage={setPage} />
      </section>
    </div>
  );
}
