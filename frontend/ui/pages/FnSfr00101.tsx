import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const PAGE_SIZE = 20;
const MODULES: [string, string][] = [
  ['ERP', 'ERP'],
  ['그룹웨어', '그룹웨어'],
];
const SCOPES: [string, string][] = [
  ['전체', '전체'],
  ['부서', '부서'],
  ['개인', '개인'],
];

type Mode =
  | { type: 'create' }
  | { type: 'edit'; row: Row }
  | { type: 'revoke'; row: Row }
  | null;

export default function FnSfr00101Page({ role, notify }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [moduleName, setModuleName] = useState('');
  const [applied, setApplied] = useState({ employeeId: '' as number | string, moduleName: '' });
  const [pageNo, setPageNo] = useState(0);
  const [mode, setMode] = useState<Mode>(null);

  const [formEmployeeId, setFormEmployeeId] = useState<number | string>('');
  const [formMenuId, setFormMenuId] = useState<number | string>('');
  const [formScope, setFormScope] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () =>
      call<Page>('GET', '/menu-permissions', role, undefined, {
        employeeId: applied.employeeId,
        module: applied.moduleName,
        page: pageNo,
        size: PAGE_SIZE,
      }),
    [applied, pageNo, role],
  );

  function search() {
    setPageNo(0);
    setApplied({ employeeId, moduleName });
  }

  function reset() {
    setEmployeeId('');
    setModuleName('');
    setPageNo(0);
    setApplied({ employeeId: '', moduleName: '' });
  }

  function openCreate() {
    setFormEmployeeId('');
    setFormMenuId('');
    setFormScope('');
    setMode({ type: 'create' });
  }

  function openEdit(row: Row) {
    setFormScope(String(row['viewScope'] ?? ''));
    setMode({ type: 'edit', row });
  }

  async function create() {
    if (formEmployeeId === '') {
      throw new Error('임직원을 선택해 주세요.');
    }
    if (formMenuId === '') {
      throw new Error('메뉴를 선택해 주세요.');
    }
    if (formScope === '') {
      throw new Error('조회 범위를 선택해 주세요.');
    }
    await call('POST', '/menu-permissions', role, {
      employeeId: formEmployeeId,
      menuId: formMenuId,
      viewScope: formScope,
    });
    notify('권한을 부여했습니다.');
    setMode(null);
    reload();
  }

  async function update(row: Row) {
    if (formScope === '') {
      throw new Error('조회 범위를 선택해 주세요.');
    }
    await call('PATCH', '/menu-permissions/' + String(row['menuPermissionId']), role, {
      viewScope: formScope,
    });
    notify('조회 범위를 변경했습니다.');
    setMode(null);
    reload();
  }

  async function revoke(row: Row) {
    await call('DELETE', '/menu-permissions/' + String(row['menuPermissionId']), role);
    notify('권한을 회수했습니다.');
    setMode(null);
    reload();
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>통합 사용 권한 현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="임직원">
            <LookupSelect
              table="employee"
              role={role}
              value={employeeId}
              onChange={setEmployeeId}
              placeholder="전체 임직원"
            />
          </Field>
          <Field label="대상 시스템 구분">
            <Select
              value={moduleName}
              onChange={setModuleName}
              options={MODULES}
              placeholder="전체"
            />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button type="button" onClick={openCreate}>
            권한 부여
          </button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        {loading ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          columns={[
            {
              key: 'employeeId',
              label: '임직원',
              render: (row) => <RefName table="employee" role={role} value={row['employeeId']} />,
            },
            {
              key: 'menuId',
              label: '메뉴',
              render: (row) => <RefName table="menu" role={role} value={row['menuId']} />,
            },
            {
              key: 'viewScope',
              label: '조회 범위',
              render: (row) => <Badge value={row['viewScope']} />,
            },
            {
              key: 'actions',
              label: '처리',
              render: (row) => (
                <span>
                  <button type="button" className="ghost" onClick={() => openEdit(row)}>
                    범위 변경
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setMode({ type: 'revoke', row })}
                  >
                    회수
                  </button>
                </span>
              ),
            },
          ]}
          rows={data?.items ?? []}
          empty="아직 부여한 권한이 없습니다. 권한 부여 버튼으로 임직원에게 메뉴 권한을 부여해 주세요."
        />
        <Pager
          page={data?.page ?? 0}
          size={data?.size ?? PAGE_SIZE}
          total={data?.total ?? 0}
          onPage={setPageNo}
        />
      </section>

      {mode && mode.type === 'create' ? (
        <Drawer title="권한 부여" onClose={() => setMode(null)}>
          <Form onSubmit={create} submit="부여">
            <Field label="임직원" required>
              <LookupSelect
                table="employee"
                role={role}
                value={formEmployeeId}
                onChange={setFormEmployeeId}
              />
            </Field>
            <Field label="메뉴" required>
              <LookupSelect
                table="menu"
                role={role}
                value={formMenuId}
                onChange={setFormMenuId}
              />
            </Field>
            <Field label="조회 범위" required>
              <Select value={formScope} onChange={setFormScope} options={SCOPES} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode && mode.type === 'edit' ? (
        <Drawer title="조회 범위 변경" onClose={() => setMode(null)}>
          <Form onSubmit={() => update(mode.row)} submit="변경">
            <Field label="임직원">
              <RefName table="employee" role={role} value={mode.row['employeeId']} />
            </Field>
            <Field label="메뉴">
              <RefName table="menu" role={role} value={mode.row['menuId']} />
            </Field>
            <Field label="조회 범위" required>
              <Select value={formScope} onChange={setFormScope} options={SCOPES} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode && mode.type === 'revoke' ? (
        <Drawer title="권한 회수" onClose={() => setMode(null)}>
          <Form
            onSubmit={() => revoke(mode.row)}
            submit="회수"
            danger
            note="회수하면 이후 접근 요청부터 이 메뉴를 사용할 수 없고, 되돌리려면 다시 부여해야 합니다."
          >
            <Field label="임직원">
              <RefName table="employee" role={role} value={mode.row['employeeId']} />
            </Field>
            <Field label="메뉴">
              <RefName table="menu" role={role} value={mode.row['menuId']} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
