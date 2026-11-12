import { useState } from 'react';
import {
  call,
  useData,
  Band,
  Filters,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  Select,
  DateInput,
  DateText,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const PARTNER_TYPES: [string, string][] = [['일반', '일반'], ['금융', '금융']];
const CATEGORIES: [string, string][] = [['고유목적사업', '고유목적사업'], ['수익사업', '수익사업'], ['공통사업', '공통사업']];
const PROJECT_TYPES: [string, string][] = [['공통', '공통'], ['직접사업', '직접사업']];

function missing(form: Row, labels: [string, string][]): string {
  const names = labels.filter(([key]) => form[key] === undefined || form[key] === null || form[key] === '').map(([, label]) => label);
  return names.length > 0 ? `필수 항목을 입력해 주세요: ${names.join(', ')}` : '';
}

export default function FnSfr00603Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'partner' | 'project'>('partner');
  const [page, setPage] = useState(0);
  const [partnerType, setPartnerType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [query, setQuery] = useState<Row>({});
  const [drawer, setDrawer] = useState<{ kind: 'partner' | 'project'; row?: Row } | null>(null);
  const [form, setForm] = useState<Row>({});

  const list = useData<Page>(
    () => call<Page>('GET', tab === 'partner' ? '/partners' : '/projects', role, undefined, { ...query, page, size: 20 }),
    [tab, page, query, role],
  );

  const set = (key: string) => (v: unknown) => setForm((f) => ({ ...f, [key]: v }));

  const search = () => {
    setPage(0);
    setQuery(tab === 'partner' ? { partnerType, keyword } : { projectCode, name: projectName });
  };

  const reset = () => {
    setPartnerType('');
    setKeyword('');
    setProjectCode('');
    setProjectName('');
    setPage(0);
    setQuery({});
  };

  const changeTab = (next: 'partner' | 'project') => {
    setTab(next);
    setPage(0);
    setQuery({});
  };

  const openPartner = (row?: Row) => {
    setForm(row ? { code: row.code, partnerType: row.partnerType, name: row.name, businessRegNo: row.businessRegNo ?? '' } : { partnerType: '일반' });
    setDrawer({ kind: 'partner', row });
  };

  const openProject = (row?: Row) => {
    setForm(row ? { projectCode: row.projectCode, name: row.name, businessCategory: row.businessCategory, projectType: row.projectType, startDate: row.startDate, endDate: row.endDate } : {});
    setDrawer({ kind: 'project', row });
  };

  const savePartner = async () => {
    const editing = drawer?.row;
    const required: [string, string][] = editing
      ? [['code', '거래처 코드'], ['partnerType', '거래처 유형'], ['name', '거래처 명칭']]
      : [['partnerType', '거래처 유형'], ['name', '거래처 명칭'], ['code', '거래처 코드'], ['businessRegNo', '사업자등록번호'], ['representative', '대표자'], ['projectId', '프로젝트']];
    const msg = missing(form, required);
    if (msg) {
      throw new Error(msg);
    }
    if (editing) {
      await call('PUT', `/partners/${String(editing.partnerId)}`, role, form);
      notify('거래처를 수정했습니다.');
    } else {
      await call('POST', '/partners', role, form);
      notify('거래처를 등록했습니다.');
    }
    setDrawer(null);
    list.reload();
  };

  const saveProject = async () => {
    const editing = drawer?.row;
    const msg = missing(form, [
      ['projectCode', '프로젝트 코드'],
      ['name', '프로젝트 명칭'],
      ['businessCategory', '사업구분'],
      ['projectType', '프로젝트 유형'],
      ['startDate', '시작일'],
      ['endDate', '종료일'],
      ['departmentId', '주관부서'],
      ['managerId', '담당자'],
    ]);
    if (msg) {
      throw new Error(msg);
    }
    if (editing) {
      await call('PUT', `/projects/${String(editing.projectId)}`, role, form);
      notify('프로젝트를 수정했습니다.');
    } else {
      await call('POST', '/projects', role, form);
      notify('프로젝트를 등록했습니다.');
    }
    setDrawer(null);
    list.reload();
  };

  const rows = list.data?.items ?? [];

  return (
    <div className="doc">
      <h1>기준정보 관리</h1>
      <div>
        <button className={tab === 'partner' ? '' : 'ghost'} onClick={() => changeTab('partner')}>거래처</button>
        <button className={tab === 'project' ? '' : 'ghost'} onClick={() => changeTab('project')}>프로젝트</button>
      </div>
      {tab === 'partner' ? (
        <Filters onSearch={search} onReset={reset}>
          <Field label="거래처 유형">
            <Select value={partnerType} onChange={setPartnerType} options={PARTNER_TYPES} placeholder="전체" />
          </Field>
          <Field label="명칭·코드 검색어">
            <TextInput value={keyword} onChange={setKeyword} />
          </Field>
        </Filters>
      ) : (
        <Filters onSearch={search} onReset={reset}>
          <Field label="프로젝트 코드">
            <TextInput value={projectCode} onChange={setProjectCode} />
          </Field>
          <Field label="프로젝트 명칭">
            <TextInput value={projectName} onChange={setProjectName} />
          </Field>
        </Filters>
      )}
      <Band total={list.data?.total}>
        {tab === 'partner' ? (
          <button onClick={() => openPartner()}>거래처 등록</button>
        ) : (
          <button onClick={() => openProject()}>프로젝트 등록</button>
        )}
      </Band>
      {list.error ? <ErrorText text={list.error} /> : null}
      {tab === 'partner' ? (
        <DataTable
          rows={rows}
          empty="아직 등록한 거래처가 없습니다. 거래처 등록 버튼으로 시작하세요."
          columns={[
            { key: 'code', label: '거래처 코드' },
            { key: 'name', label: '거래처 명칭' },
            { key: 'partnerType', label: '거래처 유형' },
            { key: 'businessRegNo', label: '사업자등록번호' },
            { key: 'edit', label: '관리', render: (r) => <button className="ghost" onClick={(e) => { e.stopPropagation(); openPartner(r); }}>수정</button> },
          ]}
        />
      ) : (
        <DataTable
          rows={rows}
          empty="아직 등록한 프로젝트가 없습니다. 프로젝트 등록 버튼으로 시작하세요."
          columns={[
            { key: 'projectCode', label: '프로젝트 코드' },
            { key: 'name', label: '프로젝트 명칭' },
            { key: 'businessCategory', label: '사업구분' },
            { key: 'startDate', label: '기간', render: (r) => <span><DateText value={r.startDate} /> ~ <DateText value={r.endDate} /></span> },
            { key: 'edit', label: '관리', render: (r) => <button className="ghost" onClick={(e) => { e.stopPropagation(); openProject(r); }}>수정</button> },
          ]}
        />
      )}
      <Pager page={page} size={20} total={list.data?.total ?? 0} onPage={setPage} />
      {drawer?.kind === 'partner' ? (
        <Drawer title={drawer.row ? '거래처 수정' : '거래처 등록'} onClose={() => setDrawer(null)}>
          <Form onSubmit={savePartner} submit={drawer.row ? '수정' : '등록'}>
            <Field label="거래처 유형" required>
              <Select value={form.partnerType} onChange={set('partnerType')} options={PARTNER_TYPES} />
            </Field>
            <Field label="거래처 명칭" required>
              <TextInput value={form.name} onChange={set('name')} />
            </Field>
            <Field label="거래처 코드" required>
              <TextInput value={form.code} onChange={set('code')} />
            </Field>
            <Field label="사업자등록번호" required={!drawer.row} hint="하이픈 없이 10자리">
              <TextInput value={form.businessRegNo} onChange={set('businessRegNo')} />
            </Field>
            {drawer.row ? null : (
              <>
                <Field label="약칭">
                  <TextInput value={form.shortName} onChange={set('shortName')} />
                </Field>
                <Field label="대표자" required>
                  <TextInput value={form.representative} onChange={set('representative')} />
                </Field>
                <Field label="프로젝트" required>
                  <LookupSelect table="project" role={role} value={form.projectId} onChange={set('projectId')} />
                </Field>
              </>
            )}
          </Form>
        </Drawer>
      ) : null}
      {drawer?.kind === 'project' ? (
        <Drawer title={drawer.row ? '프로젝트 수정' : '프로젝트 등록'} onClose={() => setDrawer(null)}>
          <Form onSubmit={saveProject} submit={drawer.row ? '수정' : '등록'}>
            <Field label="프로젝트 코드" required>
              <TextInput value={form.projectCode} onChange={set('projectCode')} />
            </Field>
            <Field label="프로젝트 명칭" required>
              <TextInput value={form.name} onChange={set('name')} />
            </Field>
            <Field label="사업구분" required>
              <Select value={form.businessCategory} onChange={set('businessCategory')} options={CATEGORIES} />
            </Field>
            <Field label="프로젝트 유형" required>
              <Select value={form.projectType} onChange={set('projectType')} options={PROJECT_TYPES} />
            </Field>
            <Field label="시작일" required>
              <DateInput value={form.startDate} onChange={set('startDate')} />
            </Field>
            <Field label="종료일" required>
              <DateInput value={form.endDate} onChange={set('endDate')} />
            </Field>
            <Field label="주관부서" required hint={drawer.row ? '수정할 때 다시 선택해 주세요.' : undefined}>
              <LookupSelect table="department" role={role} value={form.departmentId} onChange={set('departmentId')} />
            </Field>
            <Field label="담당자" required hint={drawer.row ? '수정할 때 다시 선택해 주세요.' : undefined}>
              <LookupSelect table="employee" role={role} value={form.managerId} onChange={set('managerId')} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
