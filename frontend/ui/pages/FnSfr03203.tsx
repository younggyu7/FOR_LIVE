import { useState } from 'react';
import {
  call, useData, Badge, DateText, Filters, Band, DataTable, Pager, Drawer, Pairs,
  Form, Field, TextInput, DateInput, Select, ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const TYPES: [string, string][] = [
  ['연차', '연차'], ['반차', '반차'], ['보상휴가', '보상휴가'], ['병가', '병가'],
  ['예비군', '예비군'], ['출장', '출장'], ['외근', '외근'], ['교육', '교육'],
];
const STATUSES: [string, string][] = [
  ['신청', '신청'], ['마감', '마감'], ['마감 취소', '마감 취소'],
  ['승인', '승인'], ['승인 취소', '승인 취소'], ['반려', '반려'],
];
const LOCKED = ['승인', '마감'];

export default function FnSfr03203Page({ role, notify }: PageProps) {
  const [typeInput, setTypeInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [mode, setMode] = useState<'' | 'create' | 'edit' | 'delete'>('');
  const [form, setForm] = useState<Row>({});

  const list = useData<Page>(
    () => call<Page>('GET', '/attendance-requests', role, undefined, {
      attendanceType: typeFilter,
      approvalStatus: statusFilter,
      page,
      size: 20,
    }),
    [typeFilter, statusFilter, page],
  );

  const setField = (key: string, value: unknown) => setForm({ ...form, [key]: value });

  const search = () => {
    setPage(0);
    setTypeFilter(typeInput);
    setStatusFilter(statusInput);
  };

  const reset = () => {
    setTypeInput('');
    setStatusInput('');
    setTypeFilter('');
    setStatusFilter('');
    setPage(0);
  };

  const openCreate = () => {
    setForm({ attendanceType: '', startDate: '', endDate: '', reason: '', changedWorkTime: '' });
    setMode('create');
  };

  const openEdit = (row: Row) => {
    setForm({
      attendanceType: row['attendanceType'] ?? '',
      startDate: row['startDate'] ?? '',
      endDate: row['endDate'] ?? '',
      reason: row['reason'] ?? '',
      changedWorkTime: row['changedWorkTime'] ?? '',
    });
    setMode('edit');
  };

  const checkForm = () => {
    if (!form['attendanceType']) throw new Error('근태 유형을 선택해 주세요.');
    if (!form['startDate']) throw new Error('시작일을 입력해 주세요.');
    if (!form['endDate']) throw new Error('종료일을 입력해 주세요.');
    if (String(form['endDate']) < String(form['startDate'])) {
      throw new Error('종료일은 시작일보다 빠를 수 없습니다.');
    }
  };

  const body = (): Row => ({
    attendanceType: form['attendanceType'],
    startDate: form['startDate'],
    endDate: form['endDate'],
    reason: form['reason'] ? form['reason'] : undefined,
    changedWorkTime: form['changedWorkTime'] ? form['changedWorkTime'] : undefined,
  });

  const create = async () => {
    checkForm();
    await call('POST', '/attendance-requests', role, body());
    notify('근태 신청을 등록했습니다.');
    setMode('');
    list.reload();
  };

  const update = async () => {
    checkForm();
    await call('PUT', `/attendance-requests/${selected?.['attendanceRequestId']}`, role, body());
    notify('근태 신청을 수정했습니다.');
    setMode('');
    setSelected(null);
    list.reload();
  };

  const remove = async () => {
    await call('DELETE', `/attendance-requests/${selected?.['attendanceRequestId']}`, role);
    notify('근태 신청을 삭제했습니다.');
    setMode('');
    setSelected(null);
    list.reload();
  };

  const drawer = mode === '' ? null : (
    <Drawer
      title={mode === 'create' ? '근태 신청' : mode === 'edit' ? '근태 신청 수정' : '근태 신청 삭제'}
      onClose={() => setMode('')}
    >
      {mode === 'delete' ? (
        <Form
          onSubmit={remove}
          submit="삭제"
          danger
          note="삭제한 신청은 되돌릴 수 없습니다. 정말 삭제하시겠습니까?"
        />
      ) : (
        <Form onSubmit={mode === 'create' ? create : update} submit={mode === 'create' ? '신청' : '저장'}>
          <Field label="근태 유형" required>
            <Select value={form['attendanceType']} onChange={(v) => setField('attendanceType', v)} options={TYPES} />
          </Field>
          <Field label="시작일" required>
            <DateInput value={form['startDate']} onChange={(v) => setField('startDate', v)} />
          </Field>
          <Field label="종료일" required>
            <DateInput value={form['endDate']} onChange={(v) => setField('endDate', v)} />
          </Field>
          <Field label="사유" wide>
            <TextInput multiline value={form['reason']} onChange={(v) => setField('reason', v)} />
          </Field>
          <Field label="변경 근무시간" wide>
            <TextInput value={form['changedWorkTime']} onChange={(v) => setField('changedWorkTime', v)} />
          </Field>
        </Form>
      )}
    </Drawer>
  );

  if (selected) {
    const locked = LOCKED.includes(String(selected['approvalStatus']));
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로</button>
        <section className="box">
          <h2>신청 내용</h2>
          <Pairs
            items={[
              ['근태 유형', String(selected['attendanceType'] ?? '')],
              ['시작일', <DateText value={selected['startDate']} />],
              ['종료일', <DateText value={selected['endDate']} />],
              ['사유', String(selected['reason'] ?? '')],
              ['변경 근무시간', String(selected['changedWorkTime'] ?? '')],
              ['승인 처리 상태', <Badge value={selected['approvalStatus']} />],
            ]}
          />
        </section>
        {locked ? (
          <p>승인되었거나 마감된 건은 수정·삭제할 수 없습니다. 승인 취소·회수 또는 마감 취소 후 변경해 주세요.</p>
        ) : (
          <div>
            <button onClick={() => openEdit(selected)}>수정</button>
            <button className="ghost" onClick={() => setMode('delete')}>삭제</button>
          </div>
        )}
        {drawer}
      </div>
    );
  }

  const data = list.data;
  return (
    <div className="doc">
      <h1>근태 신청 현황</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="근태 유형">
          <Select value={typeInput} onChange={setTypeInput} options={TYPES} placeholder="전체" />
        </Field>
        <Field label="승인 처리 상태">
          <Select value={statusInput} onChange={setStatusInput} options={STATUSES} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>근태 신청</button>
      </Band>
      {list.error ? <ErrorText text={list.error} /> : null}
      <DataTable
        columns={[
          { key: 'attendanceType', label: '근태 유형' },
          { key: 'startDate', label: '시작일', render: (r) => <DateText value={r['startDate']} /> },
          { key: 'endDate', label: '종료일', render: (r) => <DateText value={r['endDate']} /> },
          { key: 'approvalStatus', label: '승인 처리 상태', render: (r) => <Badge value={r['approvalStatus']} /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={(row) => setSelected(row)}
        empty="아직 등록한 신청 내역이 없습니다. 근태 신청 버튼으로 첫 신청을 등록해 주세요."
      />
      <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      {drawer}
    </div>
  );
}
