import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  DateText,
  Drawer,
  Field,
  Form,
  LookupSelect,
  NumberInput,
  Pager,
  RefName,
  Select,
  call,
  useData,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const WIDGETS: [string, string][] = [
  ['결재양식', '결재양식'],
  ['결재함', '결재함'],
  ['일정캘린더', '일정캘린더'],
  ['통합알림', '통합알림'],
  ['퀵링크', '퀵링크'],
  ['나의정보', '나의정보'],
];

type Mode =
  | { kind: 'none' }
  | { kind: 'widget' }
  | { kind: 'add' }
  | { kind: 'sort'; row: Row }
  | { kind: 'remove'; row: Row };

export default function FnSfr02705Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<Mode>({ kind: 'none' });
  const [page, setPage] = useState(0);
  const [widgetType, setWidgetType] = useState('');
  const [visible, setVisible] = useState('true');
  const [widgetOrder, setWidgetOrder] = useState<number | string>('');
  const [menuId, setMenuId] = useState<number | string>('');
  const [sortOrder, setSortOrder] = useState<number | string>('');
  const [saved, setSaved] = useState<Row[]>([]);

  const menus = useData<Page>(
    () => call<Page>('GET', '/personal-menus', role, undefined, { page, size: 20 }),
    [role, page],
  );
  const banners = useData<Page>(
    () => call<Page>('GET', '/portal-banners', role, undefined, { useYn: '사용', page: 0, size: 20 }),
    [role],
  );

  const close = () => setMode({ kind: 'none' });

  const saveWidget = async () => {
    if (!widgetType) throw new Error('위젯 종류를 선택해 주세요.');
    if (widgetOrder === '') throw new Error('배치 순서를 입력해 주세요.');
    const res = await call('PUT', '/portal-widget-settings', role, {
      widgetType,
      visibleYn: visible === 'true',
      displayOrder: widgetOrder,
    });
    setSaved([res, ...saved.filter((s) => s['widgetType'] !== res['widgetType'])]);
    notify('위젯 설정을 저장했습니다.');
    close();
  };

  const addMenu = async () => {
    if (menuId === '') throw new Error('추가할 메뉴를 선택해 주세요.');
    if (sortOrder === '') throw new Error('메뉴 구성 순서를 입력해 주세요.');
    await call('POST', '/personal-menus', role, { menuId, sortOrder });
    notify('개인 메뉴에 추가했습니다.');
    close();
    menus.reload();
  };

  const changeSort = async (row: Row) => {
    if (sortOrder === '') throw new Error('메뉴 구성 순서를 입력해 주세요.');
    await call('PATCH', '/personal-menus/' + String(row['personalMenuId']), role, { sortOrder });
    notify('메뉴 순서를 변경했습니다.');
    close();
    menus.reload();
  };

  const removeMenu = async (row: Row) => {
    await call('DELETE', '/personal-menus/' + String(row['personalMenuId']), role);
    notify('개인 메뉴에서 삭제했습니다.');
    close();
    menus.reload();
  };

  const menuRows = menus.data ? menus.data.items : [];

  return (
    <div className={'doc'}>
      <section className={'box'}>
        <h2>내 개인 메뉴</h2>
        <Band total={menus.data ? menus.data.total : 0}>
          <button
            onClick={() => {
              setMenuId('');
              setSortOrder('');
              setMode({ kind: 'add' });
            }}
          >
            메뉴 추가
          </button>
          <button
            className={'ghost'}
            onClick={() => {
              setWidgetType('');
              setVisible('true');
              setWidgetOrder('');
              setMode({ kind: 'widget' });
            }}
          >
            위젯 설정
          </button>
        </Band>
        {menus.error ? <p>{menus.error}</p> : null}
        <DataTable
          rows={menuRows}
          empty={'아직 추가한 메뉴가 없습니다. 메뉴 추가 버튼으로 자주 쓰는 메뉴를 담아 보세요.'}
          columns={[
            {
              key: 'menuId',
              label: '메뉴',
              render: (r) => <RefName table={'menu'} role={role} value={r['menuId']} />,
            },
            { key: 'sortOrder', label: '메뉴 구성 순서' },
            {
              key: 'action',
              label: '처리',
              render: (r) => (
                <span>
                  <button
                    className={'ghost'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortOrder(r['sortOrder'] as number);
                      setMode({ kind: 'sort', row: r });
                    }}
                  >
                    순서 변경
                  </button>
                  <button
                    className={'ghost'}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMode({ kind: 'remove', row: r });
                    }}
                  >
                    삭제
                  </button>
                </span>
              ),
            },
          ]}
        />
        <Pager
          page={page}
          size={menus.data ? menus.data.size : 20}
          total={menus.data ? menus.data.total : 0}
          onPage={setPage}
        />
      </section>

      <section className={'box'}>
        <h2>이번에 저장한 위젯 설정</h2>
        <DataTable
          rows={saved}
          empty={'아직 저장한 위젯 설정이 없습니다. 위젯 설정 버튼으로 표시 여부와 순서를 정해 보세요.'}
          columns={[
            { key: 'widgetType', label: '위젯 종류' },
            {
              key: 'visibleYn',
              label: '표시 여부',
              render: (r) => <Badge value={r['visibleYn'] ? '표시' : '숨김'} />,
            },
            { key: 'displayOrder', label: '배치 순서' },
          ]}
        />
      </section>

      <section className={'box'}>
        <h2>선택 가능한 배너</h2>
        {banners.error ? <p>{banners.error}</p> : null}
        <DataTable
          rows={banners.data ? banners.data.items : []}
          empty={'게시 중인 배너가 없습니다.'}
          columns={[
            { key: 'title', label: '배너 제목' },
            { key: 'linkUrl', label: '링크 URL' },
            { key: 'displayOrder', label: '표시 순서' },
          ]}
        />
      </section>

      {mode.kind === 'widget' ? (
        <Drawer title={'위젯 설정'} onClose={close}>
          <Form onSubmit={saveWidget} submit={'저장'}>
            <Field label={'위젯 종류'} required>
              <Select value={widgetType} onChange={setWidgetType} options={WIDGETS} />
            </Field>
            <Field label={'표시 여부'} required>
              <Select
                value={visible}
                onChange={setVisible}
                options={[
                  ['true', '표시'],
                  ['false', '숨김'],
                ]}
              />
            </Field>
            <Field label={'배치 순서'} required hint={'1 이상의 정수'}>
              <NumberInput value={widgetOrder} onChange={setWidgetOrder} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode.kind === 'add' ? (
        <Drawer title={'메뉴 추가'} onClose={close}>
          <Form onSubmit={addMenu} submit={'추가'}>
            <Field label={'메뉴'} required hint={'사용 권한이 있는 메뉴만 추가할 수 있습니다.'}>
              <LookupSelect table={'menu'} role={role} value={menuId} onChange={setMenuId} />
            </Field>
            <Field label={'메뉴 구성 순서'} required hint={'0 이상의 정수'}>
              <NumberInput value={sortOrder} onChange={setSortOrder} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode.kind === 'sort' ? (
        <Drawer title={'메뉴 순서 변경'} onClose={close}>
          <Form onSubmit={() => changeSort(mode.row)} submit={'변경'}>
            <Field label={'메뉴 구성 순서'} required hint={'0 이상의 정수'}>
              <NumberInput value={sortOrder} onChange={setSortOrder} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode.kind === 'remove' ? (
        <Drawer title={'개인 메뉴 삭제'} onClose={close}>
          <Form
            onSubmit={() => removeMenu(mode.row)}
            submit={'삭제'}
            danger
            note={'삭제하면 이 메뉴가 내 개인 메뉴에서 사라집니다. 필요하면 메뉴 추가로 다시 담을 수 있습니다.'}
          >
            <Field label={'메뉴'}>
              <RefName table={'menu'} role={role} value={mode.row['menuId']} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
