import { useState } from 'react';
import { ApiFail, Badge, Band, DataTable, DateText, ErrorText, Field, Filters, Pager, Pairs, RefName, Select, TextInput, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;
// 가정: 게시물로 바로가기하는 알림의 target_type 값 (코드 집합 미확정)
const BOARD_TARGETS = ['BOARD_POST', 'board_post', '게시물'];

export default function FnSfr03608Page({ role, notify }: PageProps) {
  const [readStatus, setReadStatus] = useState('');
  const [eventType, setEventType] = useState('');
  const [applied, setApplied] = useState({ readStatus: '', eventType: '' });
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState<Row | undefined>(undefined);
  const [post, setPost] = useState<Row | undefined>(undefined);
  const [postError, setPostError] = useState('');

  const list = useData<Page>(
    () => call<Page>('GET', '/notifications', role, undefined, {
      readStatus: applied.readStatus,
      eventType: applied.eventType,
      page,
      size: SIZE,
    }),
    [role, applied, page],
  );

  const search = () => {
    setPage(0);
    setApplied({ readStatus, eventType });
  };

  const reset = () => {
    setReadStatus('');
    setEventType('');
    setPage(0);
    setApplied({ readStatus: '', eventType: '' });
  };

  const open = async (row: Row) => {
    setNotice(row);
    setPost(undefined);
    setPostError('');
    try {
      if (row.readStatus === '안읽음') {
        await call('POST', `/notifications/${row.notificationId}/read`, role, {});
        notify('알림을 읽음 처리했습니다.');
        list.reload();
      }
    } catch (e) {
      setPostError(e instanceof Error ? e.message : '알림을 읽음 처리하지 못했습니다.');
      return;
    }
    if (!BOARD_TARGETS.includes(String(row.targetType)) || row.targetId == null) {
      return;
    }
    try {
      const found = await call('GET', `/board-posts/${row.targetId}`, role);
      setPost(found);
    } catch (e) {
      if (e instanceof ApiFail && e.status === 404) {
        setPostError('삭제되었거나 존재하지 않는 게시물입니다.');
      } else {
        setPostError(e instanceof Error ? e.message : '게시물을 불러오지 못했습니다.');
      }
    }
  };

  const close = () => {
    setNotice(undefined);
    setPost(undefined);
    setPostError('');
  };

  if (notice) {
    return (
      <div className="doc">
        <button className="ghost" onClick={close}>목록으로 돌아가기</button>
        <section className="box">
          <h2>알림</h2>
          <Pairs
            items={[
              ['알림 제목', String(notice.title ?? '')],
              ['알림 내용', String(notice.content ?? '')],
              ['알림 채널', String(notice.channel ?? '')],
              ['생성 일시', <DateText value={notice.createdAt} time />],
            ]}
          />
        </section>
        <section className="box">
          <h2>게시물</h2>
          {postError ? <ErrorText text={postError} /> : null}
          {post ? (
            <Pairs
              items={[
                ['구분', <Badge value={post.postType} />],
                ['분류', String(post.category ?? '')],
                ['제목', String(post.title ?? '')],
                ['작성자', <RefName table="employee" role={role} value={post.authorId} />],
                ['생성 일시', <DateText value={post.createdAt} time />],
                ['내용', String(post.content ?? '')],
              ]}
            />
          ) : null}
          {!post && !postError ? <p>바로가기할 게시물이 없는 알림입니다.</p> : null}
        </section>
      </div>
    );
  }

  const data = list.data;

  return (
    <div className="doc">
      <section className="box">
        <h2>메신저 알림</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="읽음 상태">
            <Select
              value={readStatus}
              onChange={setReadStatus}
              options={[['안읽음', '안읽음'], ['읽음', '읽음']]}
              placeholder="전체"
            />
          </Field>
          <Field label="알림 이벤트 유형">
            <TextInput value={eventType} onChange={setEventType} />
          </Field>
        </Filters>
        {list.error ? <ErrorText text={list.error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'title', label: '알림 제목' },
            { key: 'channel', label: '알림 채널' },
            { key: 'readStatus', label: '읽음 상태', render: (r: Row) => <Badge value={r.readStatus} /> },
            { key: 'eventType', label: '알림 이벤트 유형' },
            { key: 'createdAt', label: '생성 일시', render: (r: Row) => <DateText value={r.createdAt} time /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={open}
          empty="받은 알림이 없습니다. 새 게시물이 등록되면 이곳에 표시됩니다."
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
