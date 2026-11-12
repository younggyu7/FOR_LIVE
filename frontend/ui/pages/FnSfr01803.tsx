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
  Pairs,
  Form,
  Field,
  TextInput,
  DateInput,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

export default function FnSfr01803Page({ role, notify }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [drawer, setDrawer] = useState<'' | 'create' | 'linked' | 'edit'>('');
  const [workDate, setWorkDate] = useState('');
  const [checkInAt, setCheckInAt] = useState('');
  const [checkOutAt, setCheckOutAt] = useState('');
  const [linkEmployee, setLinkEmployee] = useState<number | string>('');

  const list = useData<Page>(
    () => call<Page>('GET', '/commute-records', role, undefined, { ...applied, page: pageNo, size: SIZE }),
    [role, applied, pageNo],
  );

  function search() {
    setPageNo(0);
    setApplied({ employeeId, startDate, endDate });
  }

  function reset() {
    setEmployeeId('');
    setStartDate('');
    setEndDate('');
    setPageNo(0);
    setApplied({});
  }

  function open(kind: 'create' | 'linked' | 'edit') {
    if (kind === 'edit' && selected) {
      setCheckInAt(String(selected.checkInAt ?? ''));
      setCheckOutAt(String(selected.checkOutAt ?? ''));
    } else {
      setWorkDate('');
      setCheckInAt('');
      setCheckOutAt('');
      setLinkEmployee('');
    }
    setDrawer(kind);
  }

  function times(): Row {
    const body: Row = {};
    if (checkInAt) {
      body.checkInAt = checkInAt;
    }
    if (checkOutAt) {
      body.checkOutAt = checkOutAt;
    }
    return body;
  }

  async function create() {
    if (!workDate) {
      throw new Error('근무일자를 입력해 주세요.');
    }
    await call('POST', '/commute-records', role, { workDate, ...times() });
    notify('출퇴근 기록을 등록했습니다.');
    setDrawer('');
    list.reload();
  }

  async function receiveLinked() {
    if (!linkEmployee) {
      throw new Error('임직원을 선택해 주세요.');
    }
    if (!workDate) {
      throw new Error('근무일자를 입력해 주세요.');
    }
    await call('POST', '/commute-records/receive-linked', role, { employeeId: linkEmployee, workDate, ...times() });
    notify('연동 출퇴근 정보를 저장했습니다.');
    setDrawer('');
    list.reload();
  }

  async function update() {
    if (!selected) {
      return;
    }
    if (!checkInAt && !checkOutAt) {
      throw new Error('수정할 출근시각 또는 퇴근시각을 입력해 주세요.');
    }
    const res = await call('PATCH', '/commute-records/' + String(selected.commuteRecordId), role, times());
    notify('출퇴근 기록을 수정했습니다.');
    setSelected({ ...selected, ...res });
    setDrawer('');
    list.reload();
  }

  const timeHint = 'YYYY-MM-DDTHH:mm 형식으로 입력합니다.';

  const drawerView = drawer ? (
    <Drawer
      title={drawer === 'create' ? '출퇴근 기록 등록' : drawer === 'linked' ? '연동 출퇴근 정보 저장' : '출퇴근 기록 수정'}
      onClose={() => setDrawer('')}
    >
      <Form
        onSubmit={drawer === 'create' ? create : drawer === 'linked' ? receiveLinked : update}
        submit={drawer === 'edit' ? '수정' : '저장'}
      >
        {drawer === 'linked' ? (
          <Field label="임직원" required>
            <LookupSelect table="employee" role={role} value={linkEmployee} onChange={setLinkEmployee} />
          </Field>
        ) : null}
        {drawer !== 'edit' ? (
          <Field label="근무일자" required>
            <DateInput value={workDate} onChange={setWorkDate} />
          </Field>
        ) : null}
        <Field label="출근시각" hint={timeHint}>
          <TextInput value={checkInAt} onChange={setCheckInAt} placeholder="2024-05-01T09:00" />
        </Field>
        <Field label="퇴근시각" hint={timeHint}>
          <TextInput value={checkOutAt} onChange={setCheckOutAt} placeholder="2024-05-01T18:00" />
        </Field>
      </Form>
    </Drawer>
  ) : null;

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>출퇴근 기록</h2>
          <Pairs
            items={[
              ['임직원', <RefName table="employee" role={role} value={selected.employeeId} />],
              ['근무일자', <DateText value={selected.workDate} />],
              ['출근시각', <DateText value={selected.checkInAt} time />],
              ['퇴근시각', <DateText value={selected.checkOutAt} time />],
              ['연동 여부', selected.isLinked ? '연동' : '직접 입력'],
              ['마감 여부', <Badge value={selected.isClosed ? '마감' : '진행'} />],
            ]}
          />
        </section>
        {selected.isClosed ? (
          <p>마감된 일자의 기록은 마감을 취소하기 전에는 수정할 수 없습니다.</p>
        ) : (
          <button onClick={() => open('edit')}>기록 수정</button>
        )}
        {drawerView}
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>일자별 출퇴근 기록</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="임직원">
            <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} placeholder="전체" />
          </Field>
          <Field label="조회 시작일">
            <DateInput value={startDate} onChange={setStartDate} />
          </Field>
          <Field label="조회 종료일">
            <DateInput value={endDate} onChange={setEndDate} />
          </Field>
        </Filters>
        <Band total={list.data?.total}>
          <button onClick={() => open('create')}>출퇴근 등록</button>
          <button className="ghost" onClick={() => open('linked')}>연동 정보 저장</button>
        </Band>
        {list.error ? <ErrorText text={list.error} /> : null}
        <DataTable
          columns={[
            { key: 'workDate', label: '근무일자', render: (r) => <DateText value={r.workDate} /> },
            { key: 'employeeId', label: '임직원', render: (r) => <RefName table="employee" role={role} value={r.employeeId} /> },
            { key: 'checkInAt', label: '출근시각', render: (r) => <DateText value={r.checkInAt} time /> },
            { key: 'checkOutAt', label: '퇴근시각', render: (r) => <DateText value={r.checkOutAt} time /> },
            { key: 'isClosed', label: '마감 여부', render: (r) => <Badge value={r.isClosed ? '마감' : '진행'} /> },
          ]}
          rows={list.data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty="아직 등록한 출퇴근 기록이 없습니다. 출퇴근 등록 버튼으로 첫 기록을 남겨 보세요."
        />
        <Pager page={pageNo} size={SIZE} total={list.data?.total ?? 0} onPage={setPageNo} />
      </section>
      {drawerView}
    </div>
  );
}
