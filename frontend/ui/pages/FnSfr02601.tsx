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
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SCOPES: [string, string][] = [
  ['전체', '전체'],
  ['부서', '부서'],
  ['개인', '개인'],
];

const MODULES: [string, string][] = [
  ['ERP', 'ERP'],
  ['그룹웨어', '그룹웨어'],
];

export default function FnSfr02601Page({ role, notify }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [module, setModule] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [editScope, setEditScope] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState<number | string>('');
  const [newMenuId, setNewMenuId] = useState<number | string>('');
  const [newScope, setNewScope] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/menu-permissions', role, undefined, { ...applied, page, size: 20 }),
    [applied, page],
  );

  const search = () => {
    setPage(0);
    setApplied({ employeeId, module });
  };

  const reset = () => {
    setEmployeeId('');
    setModule('');
    setPage(0);
    setApplied({});
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setEditScope(String(row['viewScope'] ?? ''));
  };

  const openCreate = () => {
    setNewEmployeeId('');
    setNewMenuId('');
    setNewScope('');
    setCreating(true);
  };

  const submitEdit = async () => {
    if (!editing) return;
    if (!editScope) throw new Error('조회 범위를 선택해 주세요.');
    await call('PUT', `/menu-permissions/${editing['menuPermissionId']}`, role, { viewScope: editScope });
    notify('메뉴 사용 권한을 변경했습니다.');
    setEditing(null);
    reload();
  };

  const submitCreate = async () => {
    if (newEmployeeId === '') throw new Error('권한을 부여할 임직원을 선택해 주세요.');
    if (newMenuId === '') throw new Error('대상 메뉴를 선택해 주세요.');
    if (!newScope) throw new Error('조회 범위를 선택해 주세요.');
    await call('POST', '/menu-permissions', role, {
      employeeId: newEmployeeId,
      menuId: newMenuId,
      viewScope: newScope,
    });
    notify('메뉴 사용 권한을 부여했습니다.');
    setCreating(false);
    setPage(0);
    reload();
  };

  return (
    <div>
      <h1>통합 사용 권한 관리</h1>
      <p>그룹웨어와 추가기능 메뉴의 사용 권한과 조회 범위를 한 곳에서 설정합니다.</p>
      <Filters onSearch={search} onReset={reset}>
        <Field label="임직원">
          <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} placeholder="전체" />
        </Field>
        <Field label="대상 시스템 구분">
          <Select value={module} onChange={setModule} options={MODULES} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>권한 부여</button>
      </Band>
      {error ? <p>{error}</p> : null}
      {loading ? <p>불러오는 중입니다.</p> : null}
      <DataTable
        columns={[
          {
            key: 'employeeId',
            label: '임직원',
            render: (r: Row) => <RefName table="employee" role={role} value={r['employeeId']} />,
          },
          {
            key: 'menuId',
            label: '메뉴',
            render: (r: Row) => <RefName table="menu" role={role} value={r['menuId']} />,
          },
          {
            key: 'viewScope',
            label: '조회 범위',
            render: (r: Row) => <Badge value={r['viewScope']} />,
          },
          {
            key: 'menuPermissionId',
            label: '처리',
            render: (r: Row) => (
              <button className="ghost" onClick={() => openEdit(r)}>
                조회 범위 변경
              </button>
            ),
          },
        ]}
        rows={data?.items ?? []}
        empty="아직 부여한 권한이 없습니다. 권한 부여 버튼으로 첫 권한을 등록해 주세요."
      />
      <Pager page={page} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      {editing ? (
        <Drawer title="조회 범위 변경" onClose={() => setEditing(null)}>
          <Form onSubmit={submitEdit} submit="저장">
            <Field label="임직원">
              <RefName table="employee" role={role} value={editing['employeeId']} />
            </Field>
            <Field label="메뉴">
              <RefName table="menu" role={role} value={editing['menuId']} />
            </Field>
            <Field label="조회 범위" required>
              <Select value={editScope} onChange={setEditScope} options={SCOPES} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
      {creating ? (
        <Drawer title="권한 부여" onClose={() => setCreating(false)}>
          <Form onSubmit={submitCreate} submit="부여">
            <Field label="임직원" required>
              <LookupSelect table="employee" role={role} value={newEmployeeId} onChange={setNewEmployeeId} />
            </Field>
            <Field label="메뉴" required>
              <LookupSelect table="menu" role={role} value={newMenuId} onChange={setNewMenuId} />
            </Field>
            <Field label="조회 범위" required>
              <Select value={newScope} onChange={setNewScope} options={SCOPES} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
