import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  Drawer,
  Field,
  Filters,
  Form,
  LookupSelect,
  Pager,
  Pairs,
  RefName,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

type Panel = null | 'create' | 'edit' | 'delete' | 'permission' | { removePermission: number };

export default function FnSfr00202Page({ role, notify }: PageProps) {
  const [projectInput, setProjectInput] = useState<number | string>('');
  const [projectId, setProjectId] = useState<number | string>('');
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [parentId, setParentId] = useState<number | string>('');
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [useStatus, setUseStatus] = useState('사용');
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [departmentId, setDepartmentId] = useState<number | string>('');

  const list = useData<Page>(async () => {
    if (projectId === '') {
      return { items: [], page: 0, size: 20, total: 0 };
    }
    return call<Page>('GET', '/sub-projects', role, undefined, { projectId, page: pageNo, size: 20 });
  }, [projectId, pageNo]);

  const perms = useData<Page>(async () => {
    if (!selected) {
      return { items: [], page: 0, size: 200, total: 0 };
    }
    return call<Page>('GET', '/sub-project-permissions', role, undefined, { subProjectId: selected['subProjectId'], size: 200 });
  }, [selected]);

  const openCreate = () => {
    setParentId('');
    setName('');
    setAccount('');
    setUseStatus('사용');
    setPanel('create');
  };

  const openEdit = () => {
    if (!selected) {
      return;
    }
    setParentId((selected['parentSubProjectId'] as number | null) ?? '');
    setName(String(selected['name'] ?? ''));
    setAccount(String(selected['managedAccount'] ?? ''));
    setUseStatus(String(selected['useStatus'] ?? '사용'));
    setPanel('edit');
  };

  const openPermission = () => {
    setEmployeeId('');
    setDepartmentId('');
    setPanel('permission');
  };

  const search = () => {
    setPageNo(0);
    setProjectId(projectInput);
  };

  const reset = () => {
    setProjectInput('');
    setProjectId('');
    setPageNo(0);
  };

  const submitCreate = async () => {
    if (projectId === '' || name.trim() === '') {
      throw new Error('프로젝트를 조회한 뒤 하위사업 명칭을 입력해 주세요.');
    }
    await call('POST', '/sub-projects', role, {
      projectId,
      parentSubProjectId: parentId === '' ? undefined : parentId,
      name,
      managedAccount: account === '' ? undefined : account,
      useStatus,
    });
    notify('하위사업을 등록했습니다.');
    setPanel(null);
    list.reload();
  };

  const submitEdit = async () => {
    if (!selected) {
      return;
    }
    if (name.trim() === '') {
      throw new Error('하위사업 명칭을 입력해 주세요.');
    }
    const updated = await call('PATCH', '/sub-projects/' + selected['subProjectId'], role, {
      parentSubProjectId: parentId === '' ? null : parentId,
      name,
      managedAccount: account === '' ? undefined : account,
      useStatus,
    });
    notify('하위사업을 수정했습니다.');
    setPanel(null);
    setSelected({
      ...selected,
      parentSubProjectId: parentId === '' ? null : parentId,
      name,
      managedAccount: account === '' ? selected['managedAccount'] : account,
      useStatus,
      subProjectId: updated['subProjectId'] ?? selected['subProjectId'],
    });
    list.reload();
  };

  const submitDelete = async () => {
    if (!selected) {
      return;
    }
    await call('DELETE', '/sub-projects/' + selected['subProjectId'], role);
    notify('하위사업을 삭제했습니다.');
    setPanel(null);
    setSelected(null);
    list.reload();
  };

  const submitPermission = async () => {
    if (!selected) {
      return;
    }
    if ((employeeId === '') === (departmentId === '')) {
      throw new Error('임직원 또는 부서 중 하나만 선택해 주세요.');
    }
    await call('POST', '/sub-project-permissions', role, {
      subProjectId: selected['subProjectId'],
      employeeId: employeeId === '' ? undefined : employeeId,
      departmentId: departmentId === '' ? undefined : departmentId,
    });
    notify('사용 권한 대상을 설정했습니다.');
    setPanel(null);
    perms.reload();
  };

  const submitRemovePermission = async (permissionId: number) => {
    await call('DELETE', '/sub-project-permissions/' + permissionId, role);
    notify('사용 권한을 삭제했습니다.');
    setPanel(null);
    perms.reload();
  };

  const drawer = () => {
    if (panel === null) {
      return null;
    }
    if (panel === 'create' || panel === 'edit') {
      const creating = panel === 'create';
      return (
        <Drawer title={creating ? '하위사업 등록' : '하위사업 수정'} onClose={() => setPanel(null)}>
          <Form onSubmit={creating ? submitCreate : submitEdit} submit={creating ? '등록' : '저장'}>
            <Field label='상위 하위사업' hint='비워 두면 최상위 하위사업입니다.'>
              <LookupSelect table='sub_project' role={role} value={parentId} onChange={setParentId} placeholder='최상위' />
            </Field>
            <Field label='하위사업 명칭' required>
              <TextInput value={name} onChange={setName} />
            </Field>
            <Field label='관리계좌'>
              <TextInput value={account} onChange={setAccount} />
            </Field>
            <Field label='사용 여부' required>
              <Select value={useStatus} onChange={setUseStatus} options={[['사용', '사용'], ['미사용', '미사용']]} />
            </Field>
          </Form>
        </Drawer>
      );
    }
    if (panel === 'delete') {
      return (
        <Drawer title='하위사업 삭제' onClose={() => setPanel(null)}>
          <Form
            onSubmit={submitDelete}
            submit='삭제'
            danger
            note='삭제한 하위사업은 되돌릴 수 없습니다. 하위 단계가 있거나 사용 이력이 있으면 삭제할 수 없습니다.'
          />
        </Drawer>
      );
    }
    if (panel === 'permission') {
      return (
        <Drawer title='사용 권한 대상 설정' onClose={() => setPanel(null)}>
          <Form onSubmit={submitPermission} submit='설정' note='임직원 또는 부서 중 하나만 선택합니다.'>
            <Field label='임직원'>
              <LookupSelect table='employee' role={role} value={employeeId} onChange={setEmployeeId} />
            </Field>
            <Field label='부서'>
              <LookupSelect table='department' role={role} value={departmentId} onChange={setDepartmentId} />
            </Field>
          </Form>
        </Drawer>
      );
    }
    const permissionId = panel.removePermission;
    return (
      <Drawer title='사용 권한 삭제' onClose={() => setPanel(null)}>
        <Form onSubmit={() => submitRemovePermission(permissionId)} submit='삭제' danger note='삭제하면 이 대상은 하위사업을 사용할 수 없습니다.' />
      </Drawer>
    );
  };

  if (selected) {
    const permRows = perms.data?.items ?? [];
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setSelected(null)}>목록으로</button>
        <section className='box'>
          <h2>하위사업 정보</h2>
          <Pairs
            items={[
              ['프로젝트', <RefName table='project' role={role} value={selected['projectId']} />],
              ['상위 하위사업', selected['parentSubProjectId'] ? <RefName table='sub_project' role={role} value={selected['parentSubProjectId']} /> : '최상위'],
              ['하위사업 명칭', String(selected['name'] ?? '')],
              ['관리계좌', String(selected['managedAccount'] ?? '')],
              ['사용 여부', <Badge value={selected['useStatus']} />],
            ]}
          />
          <button onClick={openEdit}>수정</button>
          <button className='ghost' onClick={() => setPanel('delete')}>삭제</button>
        </section>
        <section className='box'>
          <h2>사용 권한</h2>
          <Band total={perms.data?.total}>
            <button className='ghost' onClick={openPermission}>권한 대상 설정</button>
          </Band>
          <DataTable
            columns={[
              { key: 'employeeId', label: '임직원', render: (r) => (r['employeeId'] ? <RefName table='employee' role={role} value={r['employeeId']} /> : '') },
              { key: 'departmentId', label: '부서', render: (r) => (r['departmentId'] ? <RefName table='department' role={role} value={r['departmentId']} /> : '') },
              {
                key: 'subProjectPermissionId',
                label: '처리',
                render: (r) => (
                  <button className='ghost' onClick={() => setPanel({ removePermission: Number(r['subProjectPermissionId']) })}>삭제</button>
                ),
              },
            ]}
            rows={permRows}
            empty='아직 설정한 사용 권한이 없습니다. 권한 대상 설정을 눌러 추가하세요.'
          />
        </section>
        {drawer()}
      </div>
    );
  }

  return (
    <div>
      <Filters onSearch={search} onReset={reset}>
        <Field label='프로젝트' required>
          <LookupSelect table='project' role={role} value={projectInput} onChange={setProjectInput} />
        </Field>
      </Filters>
      <Band total={list.data?.total}>
        <button onClick={openCreate} disabled={projectId === ''}>하위사업 등록</button>
      </Band>
      <DataTable
        columns={[
          { key: 'name', label: '하위사업 명칭' },
          { key: 'parentSubProjectId', label: '상위 하위사업', render: (r) => (r['parentSubProjectId'] ? <RefName table='sub_project' role={role} value={r['parentSubProjectId']} /> : '최상위') },
          { key: 'managedAccount', label: '관리계좌' },
          { key: 'useStatus', label: '사용 여부', render: (r) => <Badge value={r['useStatus']} /> },
        ]}
        rows={list.data?.items ?? []}
        onRowClick={(r) => setSelected(r)}
        empty={projectId === '' ? '프로젝트를 선택한 뒤 조회해 주세요.' : '아직 등록한 하위사업이 없습니다. 하위사업 등록을 눌러 시작하세요.'}
      />
      <Pager page={pageNo} size={list.data?.size ?? 20} total={list.data?.total ?? 0} onPage={setPageNo} />
      {drawer()}
    </div>
  );
}
