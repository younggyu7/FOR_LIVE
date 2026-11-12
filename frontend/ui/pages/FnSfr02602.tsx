import { useState } from 'react';
import {
  call,
  useData,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  NumberInput,
  Select,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const USE_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];

export default function FnSfr02602Page({ role, notify }: PageProps) {
  const [moduleFilter, setModuleFilter] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [useStatus, setUseStatus] = useState('사용');
  const [displayOrder, setDisplayOrder] = useState<number | string>('');

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/menus', role, undefined, { module: applied, page, size: 20 }),
    [applied, page, role],
  );

  function openCreate() {
    setName('');
    setModuleName('');
    setUseStatus('사용');
    setDisplayOrder('');
    setCreating(true);
  }

  function openEdit(row: Row) {
    setName(String(row['name'] ?? ''));
    setModuleName(String(row['module'] ?? ''));
    setUseStatus('사용');
    setDisplayOrder(row['displayOrder'] as number);
    setEditing(row);
  }

  function close() {
    setCreating(false);
    setEditing(null);
  }

  async function submit() {
    if (name.trim() === '' || moduleName.trim() === '') {
      throw new Error('메뉴명과 연결 모듈을 입력해 주세요.');
    }
    if (editing) {
      if (displayOrder === '') {
        throw new Error('표시순서를 입력해 주세요.');
      }
      await call('PUT', '/menus/' + String(editing['menuId']), role, {
        name,
        module: moduleName,
        useStatus,
        displayOrder,
      });
      notify('메뉴 설정을 변경했습니다.');
    } else {
      await call('POST', '/menus', role, {
        name,
        module: moduleName,
        useStatus,
        displayOrder: displayOrder === '' ? undefined : displayOrder,
      });
      notify('메뉴를 등록했습니다.');
    }
    close();
    reload();
  }

  return (
    <div>
      <h1>포털 메뉴 설정</h1>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(moduleFilter);
        }}
        onReset={() => {
          setModuleFilter('');
          setApplied('');
          setPage(0);
        }}
      >
        <Field label='연결 모듈'>
          <TextInput value={moduleFilter} onChange={setModuleFilter} />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>메뉴 등록</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      <DataTable
        rows={data?.items ?? []}
        empty='아직 등록한 메뉴가 없습니다. 메뉴 등록 버튼으로 첫 메뉴를 추가해 주세요.'
        columns={[
          { key: 'name', label: '메뉴명' },
          { key: 'module', label: '연결 모듈' },
          { key: 'displayOrder', label: '표시순서' },
          {
            key: 'action',
            label: '처리',
            render: (row: Row) => (
              <button className='ghost' onClick={() => openEdit(row)}>
                수정
              </button>
            ),
          },
        ]}
      />
      <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      {creating || editing ? (
        <Drawer title={editing ? '메뉴 설정 변경' : '메뉴 등록'} onClose={close}>
          <Form onSubmit={submit} submit={editing ? '저장' : '등록'}>
            <Field label='메뉴명' required>
              <TextInput value={name} onChange={setName} />
            </Field>
            <Field label='연결 모듈' required>
              <TextInput value={moduleName} onChange={setModuleName} />
            </Field>
            <Field label='사용 여부' required>
              <Select value={useStatus} onChange={setUseStatus} options={USE_OPTIONS} placeholder='선택' />
            </Field>
            <Field
              label='표시순서'
              required={!!editing}
              hint={editing ? undefined : '비우면 마지막 순서 다음으로 등록됩니다.'}
            >
              <NumberInput value={displayOrder} onChange={setDisplayOrder} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
