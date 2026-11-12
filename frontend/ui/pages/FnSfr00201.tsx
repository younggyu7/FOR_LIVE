import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  ErrorText,
  Field,
  Filters,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  Pager,
  Pairs,
  RefName,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const CATEGORIES: [string, string][] = [
  ['고유목적사업', '고유목적사업'],
  ['수익사업', '수익사업'],
  ['공통사업', '공통사업'],
];
const TYPES: [string, string][] = [
  ['공통', '공통'],
  ['직접사업', '직접사업'],
];
const TARGETS: [string, string][] = [
  ['employee', '임직원'],
  ['department', '부서'],
];

function blank(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function ProjectForm({ role, notify, project, onDone, onCancel }: {
  role: string;
  notify: (text: string) => void;
  project: Row | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const editing = project !== null;
  const [v, setV] = useState<Row>({
    projectCode: project?.projectCode ?? '',
    name: project?.name ?? '',
    shortName: '',
    managedAccount: '',
    startDate: project?.startDate ?? '',
    endDate: project?.endDate ?? '',
    businessCategory: project?.businessCategory ?? '',
    projectType: project?.projectType ?? '',
    departmentId: '',
    managerId: '',
    projectAmount: '',
    purpose: '',
  });
  const set = (key: string, value: unknown) => setV((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    const required: [string, string][] = [
      ['name', '프로젝트 명칭'],
      ['startDate', '시작일'],
      ['endDate', '종료일'],
      ['businessCategory', '사업구분'],
      ['projectType', '프로젝트 유형'],
    ];
    if (!editing) {
      required.unshift(['projectCode', '프로젝트 코드']);
      required.push(['departmentId', '주관부서'], ['managerId', '담당자']);
    }
    const missing = required.filter(([key]) => blank(v[key])).map(([, label]) => label);
    if (missing.length > 0) {
      throw new Error('다음 항목을 입력해 주세요: ' + missing.join(', '));
    }
    if (String(v.endDate) < String(v.startDate)) {
      throw new Error('종료일은 시작일보다 빠를 수 없습니다.');
    }
    const body: Row = {};
    Object.keys(v).forEach((key) => {
      if (blank(v[key])) {
        return;
      }
      if (editing && key === 'projectCode') {
        return;
      }
      body[key] = v[key];
    });
    if (editing) {
      await call('PATCH', '/projects/' + String(project?.projectId), role, body);
      notify('프로젝트를 수정했습니다.');
    } else {
      await call('POST', '/projects', role, body);
      notify('프로젝트를 등록했습니다.');
    }
    onDone();
  };

  return (
    <div className='doc'>
      <button className='ghost' onClick={onCancel}>목록으로 돌아가기</button>
      <h1>{editing ? '프로젝트 수정' : '프로젝트 등록'}</h1>
      <Form onSubmit={submit} submit={editing ? '수정 저장' : '등록'} note={editing ? '비워 둔 항목은 바뀌지 않습니다.' : undefined}>
        <section className='box'>
          <h2>기본 정보</h2>
          <Field label='프로젝트 코드' required={!editing}>
            {editing ? <span>{String(v.projectCode)}</span> : <TextInput value={v.projectCode} onChange={(x) => set('projectCode', x)} />}
          </Field>
          <Field label='프로젝트 명칭' required>
            <TextInput value={v.name} onChange={(x) => set('name', x)} />
          </Field>
          <Field label='약칭'>
            <TextInput value={v.shortName} onChange={(x) => set('shortName', x)} />
          </Field>
          <Field label='관리계좌'>
            <TextInput value={v.managedAccount} onChange={(x) => set('managedAccount', x)} />
          </Field>
        </section>
        <section className='box'>
          <h2>기간과 구분</h2>
          <Field label='시작일' required>
            <DateInput value={v.startDate} onChange={(x) => set('startDate', x)} />
          </Field>
          <Field label='종료일' required>
            <DateInput value={v.endDate} onChange={(x) => set('endDate', x)} />
          </Field>
          <Field label='사업구분' required>
            <Select value={v.businessCategory} onChange={(x) => set('businessCategory', x)} options={CATEGORIES} />
          </Field>
          <Field label='프로젝트 유형' required>
            <Select value={v.projectType} onChange={(x) => set('projectType', x)} options={TYPES} />
          </Field>
        </section>
        <section className='box'>
          <h2>담당과 금액</h2>
          <Field label='주관부서' required={!editing}>
            <LookupSelect table='department' role={role} value={v.departmentId} onChange={(x) => set('departmentId', x)} />
          </Field>
          <Field label='담당자' required={!editing}>
            <LookupSelect table='employee' role={role} value={v.managerId} onChange={(x) => set('managerId', x)} />
          </Field>
          <Field label='프로젝트 금액'>
            <NumberInput value={v.projectAmount} onChange={(x) => set('projectAmount', x)} />
          </Field>
          <Field label='목적 및 내용' wide>
            <TextInput multiline value={v.purpose} onChange={(x) => set('purpose', x)} />
          </Field>
        </section>
      </Form>
    </div>
  );
}

function ProjectDetail({ role, notify, project, onBack, onEdit }: {
  role: string;
  notify: (text: string) => void;
  project: Row;
  onBack: () => void;
  onEdit: () => void;
}) {
  const projectId = Number(project.projectId);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [targetType, setTargetType] = useState('employee');
  const [targetId, setTargetId] = useState<number | string>('');
  const perms = useData(
    () => call<Page>('GET', '/project-permissions', role, undefined, { projectId, page: 0, size: 200 }),
    [role, projectId],
  );

  const addPermission = async () => {
    if (blank(targetId)) {
      throw new Error('사용 권한을 줄 대상을 선택해 주세요.');
    }
    const body: Row = { projectId };
    body[targetType === 'employee' ? 'employeeId' : 'departmentId'] = targetId;
    await call('POST', '/project-permissions', role, body);
    notify('사용 권한 대상을 설정했습니다.');
    setAdding(false);
    setTargetId('');
    perms.reload();
  };

  const removePermission = async (row: Row) => {
    try {
      await call('DELETE', '/project-permissions/' + String(row.projectPermissionId), role);
      notify('사용 권한 대상을 삭제했습니다.');
      perms.reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : '삭제하지 못했습니다.');
    }
  };

  const removeProject = async () => {
    await call('DELETE', '/projects/' + String(projectId), role);
    notify('프로젝트를 삭제했습니다.');
    onBack();
  };

  return (
    <div className='doc'>
      <button className='ghost' onClick={onBack}>목록으로 돌아가기</button>
      <h1>{String(project.name)}</h1>
      <section className='box'>
        <h2>프로젝트 정보</h2>
        <Pairs
          items={[
            ['프로젝트 코드', String(project.projectCode)],
            ['프로젝트 명칭', String(project.name)],
            ['사업구분', <Badge value={project.businessCategory} />],
            ['프로젝트 유형', String(project.projectType)],
            ['시작일', <DateText value={project.startDate} />],
            ['종료일', <DateText value={project.endDate} />],
          ]}
        />
        <button onClick={onEdit}>수정</button>
        <button className='ghost' onClick={() => setDeleting(true)}>삭제</button>
      </section>
      <section className='box'>
        <h2>프로젝트별 사용 권한</h2>
        {perms.error ? <ErrorText text={perms.error} /> : null}
        <Band total={perms.data?.total}>
          <button className='ghost' onClick={() => setAdding(true)}>사용 권한 대상 추가</button>
        </Band>
        <DataTable
          rows={perms.data?.items ?? []}
          empty='아직 설정한 사용 권한 대상이 없습니다. 대상을 추가해 주세요.'
          columns={[
            {
              key: 'target',
              label: '대상',
              render: (r) => blank(r.employeeId)
                ? <span>부서 <RefName table='department' role={role} value={r.departmentId} /></span>
                : <span>임직원 <RefName table='employee' role={role} value={r.employeeId} /></span>,
            },
            {
              key: 'action',
              label: '처리',
              render: (r) => <button className='ghost' onClick={() => removePermission(r)}>삭제</button>,
            },
          ]}
        />
      </section>
      {adding ? (
        <Drawer title='사용 권한 대상 추가' onClose={() => setAdding(false)}>
          <Form onSubmit={addPermission} submit='추가'>
            <Field label='대상 구분' required>
              <Select
                value={targetType}
                onChange={(x) => {
                  setTargetType(x);
                  setTargetId('');
                }}
                options={TARGETS}
              />
            </Field>
            <Field label={targetType === 'employee' ? '임직원' : '부서'} required>
              <LookupSelect
                key={targetType}
                table={targetType}
                role={role}
                value={targetId}
                onChange={setTargetId}
              />
            </Field>
          </Form>
        </Drawer>
      ) : null}
      {deleting ? (
        <Drawer title='프로젝트 삭제' onClose={() => setDeleting(false)}>
          <Form
            onSubmit={removeProject}
            submit='삭제'
            danger
            note='삭제하면 되돌릴 수 없고, 이 프로젝트의 사용 권한 대상도 함께 지워집니다. 다른 업무에서 사용 중이면 삭제되지 않습니다.'
          />
        </Drawer>
      ) : null}
    </div>
  );
}

export default function FnSfr00201Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<'list' | 'detail' | 'form'>('list');
  const [selected, setSelected] = useState<Row | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [query, setQuery] = useState({ projectCode: '', name: '' });
  const [page, setPage] = useState(0);
  const list = useData(
    () => call<Page>('GET', '/projects', role, undefined, { ...query, page, size: 20 }),
    [role, query, page],
  );

  const backToList = () => {
    setMode('list');
    setSelected(null);
    list.reload();
  };

  if (mode === 'form') {
    return (
      <ProjectForm
        role={role}
        notify={notify}
        project={selected}
        onDone={backToList}
        onCancel={() => setMode(selected ? 'detail' : 'list')}
      />
    );
  }

  if (mode === 'detail' && selected) {
    return (
      <ProjectDetail
        role={role}
        notify={notify}
        project={selected}
        onBack={backToList}
        onEdit={() => setMode('form')}
      />
    );
  }

  return (
    <div className='doc'>
      <h1>프로젝트 등록·관리</h1>
      <Filters
        onSearch={() => {
          setPage(0);
          setQuery({ projectCode: code, name });
        }}
        onReset={() => {
          setCode('');
          setName('');
          setPage(0);
          setQuery({ projectCode: '', name: '' });
        }}
      >
        <Field label='프로젝트 코드'>
          <TextInput value={code} onChange={setCode} />
        </Field>
        <Field label='프로젝트 명칭'>
          <TextInput value={name} onChange={setName} />
        </Field>
      </Filters>
      {list.error ? <ErrorText text={list.error} /> : null}
      <Band total={list.data?.total}>
        <button
          onClick={() => {
            setSelected(null);
            setMode('form');
          }}
        >
          프로젝트 등록
        </button>
      </Band>
      <DataTable
        rows={list.data?.items ?? []}
        empty='아직 등록한 프로젝트가 없습니다. 프로젝트 등록 버튼으로 시작해 주세요.'
        onRowClick={(row) => {
          setSelected(row);
          setMode('detail');
        }}
        columns={[
          { key: 'projectCode', label: '프로젝트 코드' },
          { key: 'name', label: '프로젝트 명칭' },
          { key: 'businessCategory', label: '사업구분', render: (r) => <Badge value={r.businessCategory} /> },
          { key: 'projectType', label: '프로젝트 유형' },
          {
            key: 'period',
            label: '기간',
            render: (r) => (
              <span>
                <DateText value={r.startDate} /> ~ <DateText value={r.endDate} />
              </span>
            ),
          },
        ]}
      />
      <Pager page={page} size={20} total={list.data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
