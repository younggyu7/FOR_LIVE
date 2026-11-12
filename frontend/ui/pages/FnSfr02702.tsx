import { useState } from 'react';
import { Band, DataTable, Field, Filters, Pager, Pairs, TextInput, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

export default function FnSfr02702Page({ role, notify }: PageProps) {
  const [moduleInput, setModuleInput] = useState('');
  const [module, setModule] = useState('');
  const [page, setPage] = useState(0);
  const [opened, setOpened] = useState<Row[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [memos, setMemos] = useState<Record<string, string>>({});

  const { data, error } = useData(
    () => call<Page>('GET', '/menus', role, undefined, { module, page, size: 20 }),
    [module, page, role],
  );

  const openMenu = async (row: Row) => {
    const id = Number(row.menuId);
    if (opened.some((m) => Number(m.menuId) === id)) {
      setActiveId(id);
      return;
    }
    try {
      const res = await call('POST', `/menus/${id}/open`, role, {});
      setOpened((prev) => [...prev, res]);
      setActiveId(id);
      notify('메뉴를 열었습니다.');
    } catch (e) {
      notify(e instanceof Error ? e.message : '메뉴를 열 수 없습니다.');
    }
  };

  const closeMenu = (id: number) => {
    const rest = opened.filter((m) => Number(m.menuId) !== id);
    setOpened(rest);
    if (activeId === id) {
      setActiveId(rest.length > 0 ? Number(rest[rest.length - 1].menuId) : null);
    }
    notify('화면을 닫았습니다.');
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>열 수 있는 메뉴</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setModule(moduleInput);
          }}
          onReset={() => {
            setModuleInput('');
            setModule('');
            setPage(0);
          }}
        >
          <Field label="연결 모듈">
            <TextInput value={moduleInput} onChange={setModuleInput} />
          </Field>
        </Filters>
        {error ? <p>{error}</p> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'name', label: '메뉴명' },
            { key: 'module', label: '연결 모듈' },
            { key: 'displayOrder', label: '표시순서' },
            {
              key: 'open',
              label: '화면',
              render: (row) => (
                <button className="ghost" onClick={() => openMenu(row)}>
                  열기
                </button>
              ),
            },
          ]}
          rows={data?.items ?? []}
          empty="열 수 있는 메뉴가 없습니다. 조회 조건을 바꿔 보세요."
        />
        <Pager page={page} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </section>
      <section className="box">
        <h2>열린 화면</h2>
        {opened.length === 0 ? (
          <p>열린 화면이 없습니다. 위 목록에서 메뉴를 열어 보세요.</p>
        ) : (
          <div>
            {opened.map((m) => {
              const id = Number(m.menuId);
              return (
                <span key={id}>
                  <button className="ghost" onClick={() => setActiveId(id)}>
                    {activeId === id ? '● ' : ''}
                    {String(m.name)}
                  </button>
                  <button className="ghost" onClick={() => closeMenu(id)}>
                    닫기
                  </button>
                </span>
              );
            })}
          </div>
        )}
        {opened.map((m) => {
          const id = Number(m.menuId);
          return (
            <div key={id} hidden={activeId !== id}>
              <h2>{String(m.name)}</h2>
              <Pairs
                items={[
                  ['메뉴명', String(m.name)],
                  ['연결 모듈', String(m.module)],
                ]}
              />
              <Field label="작업 메모" wide hint="다른 화면으로 전환해도 입력한 내용은 유지됩니다.">
                <TextInput
                  multiline
                  value={memos[String(id)] ?? ''}
                  onChange={(v) => setMemos((prev) => ({ ...prev, [String(id)]: v }))}
                />
              </Field>
            </div>
          );
        })}
      </section>
    </div>
  );
}
