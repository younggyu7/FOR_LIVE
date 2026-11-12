import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateText,
  ErrorText,
  Field,
  Filters,
  NumberInput,
  Pager,
  Select,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr03402Page({ role, notify }: PageProps) {
  const [postId, setPostId] = useState<number | string>('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState<{ postId: number | string; status: string }>({ postId: '', status: '' });
  const [pageNo, setPageNo] = useState(0);

  const { data, error, loading } = useData<Page | undefined>(
    async () => {
      if (applied.postId === '') {
        return undefined;
      }
      return call<Page>('GET', `/board-posts/${applied.postId}/readers`, role, undefined, {
        readStatus: applied.status,
        page: pageNo,
        size: SIZE,
      });
    },
    [applied, pageNo, role],
  );

  const search = () => {
    if (postId === '' || typeof postId !== 'number') {
      notify('조회할 공지·게시물 ID를 숫자로 입력해 주세요.');
      return;
    }
    setPageNo(0);
    setApplied({ postId, status });
  };

  const reset = () => {
    setPostId('');
    setStatus('');
    setPageNo(0);
    setApplied({ postId: '', status: '' });
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>열람자 확인</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="공지·게시물 ID" required>
            <NumberInput value={postId} onChange={setPostId} />
          </Field>
          <Field label="읽음 상태">
            <Select
              value={status}
              onChange={setStatus}
              options={[
                ['읽음', '읽음'],
                ['안읽음', '안읽음'],
              ]}
              placeholder="전체"
            />
          </Field>
        </Filters>
      </section>
      <section className="box">
        <h2>열람 현황</h2>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data ? data.total : 0} />
        <DataTable<Row>
          columns={[
            { key: 'employeeName', label: '임직원명' },
            { key: 'departmentName', label: '부서명' },
            { key: 'readStatus', label: '읽음 상태', render: (r) => <Badge value={r.readStatus} /> },
            { key: 'readAt', label: '열람 일시', render: (r) => (r.readAt ? <DateText value={r.readAt} time /> : <span>-</span>) },
          ]}
          rows={data ? data.items : []}
          empty={loading ? '불러오는 중입니다.' : '공지·게시물 ID를 입력하고 조회하면 열람자와 미열람자가 표시됩니다.'}
        />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} /> : null}
      </section>
    </div>
  );
}
