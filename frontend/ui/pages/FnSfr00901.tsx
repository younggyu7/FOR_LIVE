import { useState } from 'react';
import { Badge, Band, DataTable, Drawer, Field, Filters, Form, LookupSelect, NumberInput, Pager, RefName, Select, TextInput, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;
const TYPE_OPTIONS: [string, string][] = [['INFLOW', '수입(INFLOW)'], ['OUTFLOW', '지출(OUTFLOW)']];
const STATUS_OPTIONS: [string, string][] = [['사용', '사용'], ['미사용', '미사용']];

interface DrawerState {
  mode: 'create' | 'edit' | 'delete';
  row?: Row;
}

function SubjectForm({ role, row, notify, onDone }: { role: string; row?: Row; notify: (text: string) => void; onDone: () => void }) {
  const [name, setName] = useState<string>(row ? String(row.name ?? '') : '');
  const [subjectType, setSubjectType] = useState<string>(row ? String(row.subjectType ?? '') : '');
  const [useStatus, setUseStatus] = useState<string>(row ? String(row.useStatus ?? '') : '사용');
  const [accountSubjectId, setAccountSubjectId] = useState<number | string>(row && row.accountSubjectId ? (row.accountSubjectId as number) : '');
  return (
    <Form
      submit={row ? '수정' : '등록'}
      onSubmit={async () => {
        if (name.trim() === '') {
          throw new Error('자금과목명을 입력해 주세요.');
        }
        if (subjectType === '') {
          throw new Error('자금과목 구분을 선택해 주세요.');
        }
        if (useStatus === '') {
          throw new Error('사용 여부를 선택해 주세요.');
        }
        const body: Row = { name: name.trim(), subjectType, useStatus };
        if (accountSubjectId !== '') {
          body.accountSubjectId = accountSubjectId;
        }
        if (row) {
          await call('PATCH', '/fund-subjects/' + String(row.fundSubjectId), role, body);
          notify('자금과목을 수정했습니다.');
        } else {
          await call('POST', '/fund-subjects', role, body);
          notify('자금과목을 등록했습니다.');
        }
        onDone();
      }}
    >
      <Field label='자금과목명' required>
        <TextInput value={name} onChange={setName} />
      </Field>
      <Field label='자금과목 구분' required>
        <Select value={subjectType} onChange={setSubjectType} options={TYPE_OPTIONS} />
      </Field>
      <Field label='사용 여부' required hint='이미 사용된 자금과목은 삭제하지 않고 미사용으로만 바꿉니다.'>
        <Select value={useStatus} onChange={setUseStatus} options={STATUS_OPTIONS} />
      </Field>
      <Field label='연결 계정과목'>
        <LookupSelect table='account_subject' role={role} value={accountSubjectId} onChange={setAccountSubjectId} />
      </Field>
    </Form>
  );
}

function SubjectsPanel({ role, notify }: PageProps) {
  const [useStatus, setUseStatus] = useState('');
  const [applied, setApplied] = useState('');
  const [pageNo, setPageNo] = useState(0);
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const { data, error, reload } = useData(
    () => call<Page>('GET', '/fund-subjects', role, undefined, { useStatus: applied, page: pageNo, size: SIZE }),
    [applied, pageNo, role],
  );
  const close = () => {
    setDrawer(null);
    reload();
  };
  return (
    <div>
      <Filters
        onSearch={() => {
          setPageNo(0);
          setApplied(useStatus);
        }}
        onReset={() => {
          setUseStatus('');
          setApplied('');
          setPageNo(0);
        }}
      >
        <Field label='사용 여부'>
          <Select value={useStatus} onChange={setUseStatus} options={STATUS_OPTIONS} placeholder='전체' />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={() => setDrawer({ mode: 'create' })}>자금과목 등록</button>
      </Band>
      {error !== '' && <p>{error}</p>}
      <DataTable
        rows={data?.items ?? []}
        empty='아직 등록한 자금과목이 없습니다. 자금과목 등록 버튼으로 첫 자금과목을 만들어 주세요.'
        columns={[
          { key: 'name', label: '자금과목명' },
          { key: 'subjectType', label: '자금과목 구분', render: (r) => (r.subjectType === 'INFLOW' ? '수입' : '지출') },
          { key: 'useStatus', label: '사용 여부', render: (r) => <Badge value={r.useStatus} /> },
          { key: 'accountSubjectId', label: '연결 계정과목', render: (r) => (r.accountSubjectId ? <RefName table='account_subject' role={role} value={r.accountSubjectId} /> : '-') },
          { key: 'fundSubjectId', label: '처리', render: (r) => <button className='ghost' onClick={() => setDrawer({ mode: 'edit', row: r })}>수정</button> },
        ]}
      />
      <Pager page={data?.page ?? 0} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      {drawer && (
        <Drawer title={drawer.mode === 'create' ? '자금과목 등록' : '자금과목 수정'} onClose={() => setDrawer(null)}>
          <SubjectForm role={role} row={drawer.row} notify={notify} onDone={close} />
        </Drawer>
      )}
    </div>
  );
}

function ItemForm({ role, row, notify, onDone }: { role: string; row?: Row; notify: (text: string) => void; onDone: () => void }) {
  const [fundSubjectId, setFundSubjectId] = useState<number | string>(row ? (row.fundSubjectId as number) : '');
  const [sortOrder, setSortOrder] = useState<number | string>(row ? (row.sortOrder as number) : '');
  const [itemName, setItemName] = useState<string>(row ? String(row.itemName ?? '') : '');
  return (
    <Form
      submit={row ? '수정' : '추가'}
      onSubmit={async () => {
        if (fundSubjectId === '') {
          throw new Error('자금과목을 선택해 주세요.');
        }
        if (sortOrder === '') {
          throw new Error('순서를 입력해 주세요.');
        }
        const body: Row = { fundSubjectId, sortOrder };
        if (itemName.trim() !== '') {
          body.itemName = itemName.trim();
        }
        if (row) {
          await call('PATCH', '/fund-pl-form-items/' + String(row.fundPlFormItemId), role, body);
          notify('자금 손익 양식 항목을 수정했습니다.');
        } else {
          await call('POST', '/fund-pl-form-items', role, body);
          notify('자금 손익 양식 항목을 추가했습니다.');
        }
        onDone();
      }}
    >
      <Field label='자금과목' required>
        <LookupSelect table='fund_subject' role={role} value={fundSubjectId} onChange={setFundSubjectId} />
      </Field>
      <Field label='순서' required hint='1 이상의 숫자로 입력합니다.'>
        <NumberInput value={sortOrder} onChange={setSortOrder} />
      </Field>
      <Field label='항목명' hint='비워 두면 자금과목명을 사용합니다.'>
        <TextInput value={itemName} onChange={setItemName} />
      </Field>
    </Form>
  );
}

function ItemsPanel({ role, notify }: PageProps) {
  const [pageNo, setPageNo] = useState(0);
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const { data, error, reload } = useData(
    () => call<Page>('GET', '/fund-pl-form-items', role, undefined, { page: pageNo, size: SIZE }),
    [pageNo, role],
  );
  const close = () => {
    setDrawer(null);
    reload();
  };
  return (
    <div>
      <Band total={data?.total}>
        <button onClick={() => setDrawer({ mode: 'create' })}>양식 항목 추가</button>
      </Band>
      {error !== '' && <p>{error}</p>}
      <DataTable
        rows={data?.items ?? []}
        empty='아직 구성한 양식 항목이 없습니다. 양식 항목 추가 버튼으로 항목을 만들어 주세요.'
        columns={[
          { key: 'sortOrder', label: '순서' },
          { key: 'itemName', label: '항목명', render: (r) => (r.itemName ? String(r.itemName) : '-') },
          { key: 'fundSubjectId', label: '자금과목', render: (r) => <RefName table='fund_subject' role={role} value={r.fundSubjectId} /> },
          {
            key: 'fundPlFormItemId',
            label: '처리',
            render: (r) => (
              <span>
                <button className='ghost' onClick={() => setDrawer({ mode: 'edit', row: r })}>수정</button>
                <button className='ghost' onClick={() => setDrawer({ mode: 'delete', row: r })}>삭제</button>
              </span>
            ),
          },
        ]}
      />
      <Pager page={data?.page ?? 0} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      {drawer && drawer.mode !== 'delete' && (
        <Drawer title={drawer.mode === 'create' ? '양식 항목 추가' : '양식 항목 수정'} onClose={() => setDrawer(null)}>
          <ItemForm role={role} row={drawer.row} notify={notify} onDone={close} />
        </Drawer>
      )}
      {drawer && drawer.mode === 'delete' && drawer.row && (
        <Drawer title='양식 항목 삭제' onClose={() => setDrawer(null)}>
          <Form
            submit='삭제'
            danger
            note='삭제한 양식 항목은 되돌릴 수 없습니다.'
            onSubmit={async () => {
              await call('DELETE', '/fund-pl-form-items/' + String(drawer.row?.fundPlFormItemId), role);
              notify('자금 손익 양식 항목을 삭제했습니다.');
              close();
            }}
          >
            <p>선택한 양식 항목을 삭제합니다.</p>
          </Form>
        </Drawer>
      )}
    </div>
  );
}

export default function FnSfr00901Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'subjects' | 'items'>('subjects');
  return (
    <div className='doc'>
      <h2>자금과목 및 자금 손익 양식 설정</h2>
      <div>
        <button className={tab === 'subjects' ? undefined : 'ghost'} onClick={() => setTab('subjects')}>자금과목</button>
        <button className={tab === 'items' ? undefined : 'ghost'} onClick={() => setTab('items')}>자금 손익 양식</button>
      </div>
      {tab === 'subjects' ? <SubjectsPanel role={role} notify={notify} /> : <ItemsPanel role={role} notify={notify} />}
    </div>
  );
}
