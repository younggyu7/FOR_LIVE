import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  Select,
  LookupSelect,
  DateText,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

export default function FnSfr02704Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [opened, setOpened] = useState<Row | null>(null);
  const [openError, setOpenError] = useState('');
  const [recording, setRecording] = useState(false);
  const [menuId, setMenuId] = useState<number | string>('');
  const [environment, setEnvironment] = useState('');

  const list = useData<Page>(
    () => call<Page>('GET', '/menu-usage-logs', role, undefined, { page, size: 20 }),
    [page, role],
  );

  async function openMenu(row: Row) {
    setOpenError('');
    try {
      const result = await call('POST', `/menus/${row.menuId}/open`, role);
      await call('POST', '/menu-usage-logs', role, { menuId: row.menuId, usageEnvironment: '웹' });
      setOpened(result);
      notify('메뉴를 열었습니다.');
      list.reload();
    } catch (e) {
      setOpenError(e instanceof Error ? e.message : '메뉴를 열 수 없습니다.');
    }
  }

  if (opened) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setOpened(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>이동한 메뉴</h2>
          <Pairs
            items={[
              ['메뉴 ID', String(opened.menuId ?? '')],
              ['메뉴명', String(opened.name ?? '')],
              ['연결 모듈', String(opened.module ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  const rows = list.data?.items ?? [];

  return (
    <div className="doc">
      <section className="box">
        <h2>최근 사용 메뉴</h2>
        <Band total={list.data?.total}>
          <button
            onClick={() => {
              setMenuId('');
              setEnvironment('');
              setRecording(true);
            }}
          >
            사용 이력 기록
          </button>
        </Band>
        {list.error ? <ErrorText text={list.error} /> : null}
        {openError ? <ErrorText text={openError} /> : null}
        <DataTable
          columns={[
            { key: 'menuName', label: '메뉴명' },
            { key: 'usedAt', label: '사용일시', render: (r) => <DateText value={r.usedAt} time /> },
            {
              key: 'open',
              label: '이동',
              render: (r) => (
                <button className="ghost" onClick={() => openMenu(r)}>열기</button>
              ),
            },
          ]}
          rows={rows}
          onRowClick={openMenu}
          empty="아직 사용한 메뉴 이력이 없습니다. 메뉴를 열면 이곳에 기록됩니다."
        />
        <Pager
          page={list.data?.page ?? 0}
          size={list.data?.size ?? 20}
          total={list.data?.total ?? 0}
          onPage={setPage}
        />
      </section>
      {recording ? (
        <Drawer title="메뉴 사용 이력 기록" onClose={() => setRecording(false)}>
          <Form
            submit="기록"
            onSubmit={async () => {
              if (menuId === '' || !environment) {
                throw new Error('메뉴와 사용 환경을 선택해 주세요.');
              }
              await call('POST', '/menu-usage-logs', role, { menuId, usageEnvironment: environment });
              notify('사용 이력을 기록했습니다.');
              setRecording(false);
              setPage(0);
              list.reload();
            }}
          >
            <Field label="메뉴 ID" required>
              <LookupSelect table="menu" role={role} value={menuId} onChange={setMenuId} />
            </Field>
            <Field label="사용 환경" required>
              <Select
                value={environment}
                onChange={setEnvironment}
                options={[['웹', '웹'], ['모바일', '모바일']]}
              />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
