import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  NumberInput,
  DateInput,
  Select,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const WIDGET_TYPES: [string, string][] = [
  ['결재양식', '결재양식'],
  ['결재함', '결재함'],
  ['일정캘린더', '일정캘린더'],
  ['통합알림', '통합알림'],
  ['퀵링크', '퀵링크'],
  ['나의정보', '나의정보'],
];
const USE_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];
const VISIBLE_OPTIONS: [string, string][] = [
  ['true', '표시'],
  ['false', '숨김'],
];

export default function FnSfr02604Page({ role, notify }: PageProps) {
  const isAdmin = role === '시스템 관리자';
  const [widgetPage, setWidgetPage] = useState(0);
  const [bannerPage, setBannerPage] = useState(0);
  const [menuPage, setMenuPage] = useState(0);
  const [useYnInput, setUseYnInput] = useState('');
  const [useYn, setUseYn] = useState('');
  const [widgetForm, setWidgetForm] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [bannerForm, setBannerForm] = useState<Row | null>(null);

  const widgets = useData<Page>(
    () => (isAdmin ? Promise.resolve({ items: [], page: 0, size: 20, total: 0 }) : call<Page>('GET', '/portal-widget-settings', role, undefined, { page: widgetPage })),
    [role, widgetPage],
  );
  const banners = useData<Page>(
    () => call<Page>('GET', '/portal-banners', role, undefined, { page: bannerPage, useYn }),
    [role, bannerPage, useYn],
  );
  const menus = useData<Page>(
    () => (isAdmin ? Promise.resolve({ items: [], page: 0, size: 20, total: 0 }) : call<Page>('GET', '/personal-menus', role, undefined, { page: menuPage })),
    [role, menuPage],
  );

  async function saveWidget() {
    if (!widgetForm) {
      return;
    }
    if (!widgetForm.widgetType) {
      throw new Error('위젯 종류를 선택해 주세요.');
    }
    if (widgetForm.displayOrder === '' || widgetForm.displayOrder === undefined) {
      throw new Error('배치 순서를 입력해 주세요.');
    }
    await call('POST', '/portal-widget-settings', role, {
      widgetType: widgetForm.widgetType,
      visibleYn: widgetForm.visibleYn !== 'false',
      displayOrder: widgetForm.displayOrder,
    });
    notify('위젯 설정을 저장했습니다.');
    setWidgetForm(null);
    widgets.reload();
  }

  async function updateWidget() {
    if (!editing) {
      return;
    }
    if (editing.displayOrder === '' || editing.displayOrder === undefined) {
      throw new Error('배치 순서를 입력해 주세요.');
    }
    await call('PUT', '/portal-widget-settings/' + String(editing.portalWidgetSettingId), role, {
      visibleYn: editing.visibleYn === true || editing.visibleYn === 'true',
      displayOrder: editing.displayOrder,
    });
    notify('위젯 설정을 변경했습니다.');
    setEditing(null);
    widgets.reload();
  }

  async function saveBanner() {
    if (!bannerForm) {
      return;
    }
    if (!bannerForm.title) {
      throw new Error('배너 제목을 입력해 주세요.');
    }
    if (bannerForm.displayOrder === '' || bannerForm.displayOrder === undefined) {
      throw new Error('표시 순서를 입력해 주세요.');
    }
    if (!bannerForm.useYn) {
      throw new Error('사용 여부를 선택해 주세요.');
    }
    await call('POST', '/portal-banners', role, {
      title: bannerForm.title,
      imageUrl: bannerForm.imageUrl,
      linkUrl: bannerForm.linkUrl,
      displayOrder: bannerForm.displayOrder,
      startDate: bannerForm.startDate,
      endDate: bannerForm.endDate,
      useYn: bannerForm.useYn,
    });
    notify('배너를 등록했습니다.');
    setBannerForm(null);
    banners.reload();
  }

  const widgetData = widgets.data;
  const bannerData = banners.data;
  const menuData = menus.data;

  return (
    <div className="doc">
      <section className="box">
        <h2>포털 배너</h2>
        <Filters
          onSearch={() => {
            setBannerPage(0);
            setUseYn(useYnInput);
          }}
          onReset={() => {
            setBannerPage(0);
            setUseYnInput('');
            setUseYn('');
          }}
        >
          <Field label="사용 여부">
            <Select value={useYnInput} onChange={setUseYnInput} options={USE_OPTIONS} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={bannerData?.total}>
          {isAdmin && (
            <button onClick={() => setBannerForm({ displayOrder: 1, useYn: '사용' })}>배너 등록</button>
          )}
        </Band>
        {banners.error && <ErrorText text={banners.error} />}
        <DataTable
          columns={[
            { key: 'title', label: '배너 제목' },
            { key: 'imageUrl', label: '이미지 경로' },
            { key: 'linkUrl', label: '링크 URL' },
            { key: 'displayOrder', label: '표시 순서' },
          ]}
          rows={bannerData?.items ?? []}
          empty="아직 등록한 배너가 없습니다."
        />
        {bannerData && <Pager page={bannerData.page} size={bannerData.size} total={bannerData.total} onPage={setBannerPage} />}
      </section>

      {!isAdmin && (
        <section className="box">
          <h2>내 포털 위젯</h2>
          <Band total={widgetData?.total}>
            <button onClick={() => setWidgetForm({ visibleYn: 'true', displayOrder: 1 })}>위젯 설정 추가</button>
          </Band>
          {widgets.error && <ErrorText text={widgets.error} />}
          <DataTable
            columns={[
              { key: 'widgetType', label: '위젯 종류' },
              { key: 'visibleYn', label: '표시 여부', render: (r) => <Badge value={r.visibleYn ? '표시' : '숨김'} /> },
              { key: 'displayOrder', label: '배치 순서' },
              {
                key: 'action',
                label: '처리',
                render: (r) => (
                  <button className="ghost" onClick={() => setEditing({ ...r })}>변경</button>
                ),
              },
            ]}
            rows={widgetData?.items ?? []}
            empty="저장된 개인 설정이 없어 기본 포털 구성이 적용됩니다."
          />
          {widgetData && <Pager page={widgetData.page} size={widgetData.size} total={widgetData.total} onPage={setWidgetPage} />}
        </section>
      )}

      {!isAdmin && (
        <section className="box">
          <h2>내 메뉴 구성</h2>
          {menus.error && <ErrorText text={menus.error} />}
          <DataTable
            columns={[
              { key: 'menuId', label: '메뉴', render: (r) => <RefName table="menu" role={role} value={r.menuId} /> },
              { key: 'sortOrder', label: '메뉴 구성 순서' },
            ]}
            rows={menuData?.items ?? []}
            empty="구성한 개인 메뉴가 아직 없습니다."
          />
          {menuData && <Pager page={menuData.page} size={menuData.size} total={menuData.total} onPage={setMenuPage} />}
        </section>
      )}

      {widgetForm && (
        <Drawer title="위젯 설정 추가" onClose={() => setWidgetForm(null)}>
          <Form onSubmit={saveWidget} submit="저장">
            <Field label="위젯 종류" required>
              <Select value={widgetForm.widgetType} onChange={(v) => setWidgetForm({ ...widgetForm, widgetType: v })} options={WIDGET_TYPES} />
            </Field>
            <Field label="표시 여부" required>
              <Select value={widgetForm.visibleYn} onChange={(v) => setWidgetForm({ ...widgetForm, visibleYn: v })} options={VISIBLE_OPTIONS} />
            </Field>
            <Field label="배치 순서" required>
              <NumberInput value={widgetForm.displayOrder} onChange={(v) => setWidgetForm({ ...widgetForm, displayOrder: v })} />
            </Field>
          </Form>
        </Drawer>
      )}

      {editing && (
        <Drawer title="위젯 설정 변경" onClose={() => setEditing(null)}>
          <Form onSubmit={updateWidget} submit="변경">
            <Field label="위젯 종류">
              <TextInput value={editing.widgetType} onChange={() => undefined} />
            </Field>
            <Field label="표시 여부" required>
              <Select
                value={editing.visibleYn === true || editing.visibleYn === 'true' ? 'true' : 'false'}
                onChange={(v) => setEditing({ ...editing, visibleYn: v })}
                options={VISIBLE_OPTIONS}
              />
            </Field>
            <Field label="배치 순서" required>
              <NumberInput value={editing.displayOrder} onChange={(v) => setEditing({ ...editing, displayOrder: v })} />
            </Field>
          </Form>
        </Drawer>
      )}

      {bannerForm && (
        <Drawer title="배너 등록" onClose={() => setBannerForm(null)}>
          <Form onSubmit={saveBanner} submit="등록">
            <Field label="배너 제목" required>
              <TextInput value={bannerForm.title} onChange={(v) => setBannerForm({ ...bannerForm, title: v })} />
            </Field>
            <Field label="이미지 경로">
              <TextInput value={bannerForm.imageUrl} onChange={(v) => setBannerForm({ ...bannerForm, imageUrl: v })} />
            </Field>
            <Field label="링크 URL">
              <TextInput value={bannerForm.linkUrl} onChange={(v) => setBannerForm({ ...bannerForm, linkUrl: v })} />
            </Field>
            <Field label="표시 순서" required>
              <NumberInput value={bannerForm.displayOrder} onChange={(v) => setBannerForm({ ...bannerForm, displayOrder: v })} />
            </Field>
            <Field label="게시 시작일">
              <DateInput value={bannerForm.startDate} onChange={(v) => setBannerForm({ ...bannerForm, startDate: v })} />
            </Field>
            <Field label="게시 종료일">
              <DateInput value={bannerForm.endDate} onChange={(v) => setBannerForm({ ...bannerForm, endDate: v })} />
            </Field>
            <Field label="사용 여부" required>
              <Select value={bannerForm.useYn} onChange={(v) => setBannerForm({ ...bannerForm, useYn: v })} options={USE_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
