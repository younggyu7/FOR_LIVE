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
  Select,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const TYPES: [string, string][] = [
  ['연차', '연차'],
  ['반차', '반차'],
  ['보상휴가', '보상휴가'],
  ['병가', '병가'],
  ['예비군', '예비군'],
  ['출장', '출장'],
  ['외근', '외근'],
  ['교육', '교육'],
];

const STATUSES: [string, string][] = [
  ['신청', '신청'],
  ['마감', '마감'],
  ['마감 취소', '마감 취소'],
  ['승인', '승인'],
  ['승인 취소', '승인 취소'],
  ['반려', '반려'],
];

const SIZE = 20;

export default function FnSfr01801Page({ role, notify }: PageProps) {
  const [typeDraft, setTypeDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [attendanceType, setAttendanceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [changedWorkTime, setChangedWorkTime] = useState('');

  const list = useData<Page>(
    () => call<Page>('GET', '/attendance-requests', role, undefined, {
      attendanceType: typeFilter,
      approvalStatus: statusFilter,
      page,
      size: SIZE,
    }),
    [role, typeFilter, statusFilter, page],
  );

  function search() {
    setPage(0);
    setTypeFilter(typeDraft);
    setStatusFilter(statusDraft);
  }

  function reset() {
    setTypeDraft('');
    setStatusDraft('');
    setTypeFilter('');
    setStatusFilter('');
    setPage(0);
  }

  function openCreate() {
    setAttendanceType('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setChangedWorkTime('');
    setCreating(true);
  }

  async function create() {
    if (attendanceType === '' || startDate === '' || endDate === '') {
      throw new Error('근태 유형, 시작일, 종료일을 모두 입력해 주세요.');
    }
    await call('POST', '/attendance-requests', role, {
      attendanceType,
      startDate,
      endDate,
      reason,
      changedWorkTime,
    });
    notify('근태를 신청했습니다.');
    setCreating(false);
    list.reload();
  }

  async function cancel(id: unknown) {
    await call('POST', `/attendance-requests/${id}/cancel`, role, {});
    notify('근태 신청을 취소했습니다.');
    setSelected(null);
    list.reload();
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>신청 내용</h2>
          <Pairs
            items={[
              ['근태 유형', String(selected['attendanceType'])],
              ['시작일', <DateText value={selected['startDate']} />],
              ['종료일', <DateText value={selected['endDate']} />],
              ['사유', String(selected['reason'] ?? '')],
              ['변경 근무시간', String(selected['changedWorkTime'] ?? '')],
              ['승인 처리 상태', <Badge value={selected['approvalStatus']} />],
            ]}
          />
        </section>
        {selected['approvalStatus'] === '신청' && (
          <section className="box">
            <h2>신청 취소</h2>
            <Form
              onSubmit={() => cancel(selected['attendanceRequestId'])}
              submit="신청 취소"
              danger
              note="취소하면 결재 상신도 회수되며 되돌릴 수 없습니다."
            />
          </section>
        )}
      </div>
    );
  }

  const data = list.data;
  return (
    <div className="doc">
      <h1>근태 신청 현황</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="근태 유형">
          <Select value={typeDraft} onChange={setTypeDraft} options={TYPES} placeholder="전체" />
        </Field>
        <Field label="승인 처리 상태">
          <Select value={statusDraft} onChange={setStatusDraft} options={STATUSES} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>근태 신청</button>
      </Band>
      {list.error !== '' && <ErrorText text={list.error} />}
      <DataTable
        columns={[
          { key: 'attendanceType', label: '근태 유형' },
          { key: 'startDate', label: '시작일', render: (r) => <DateText value={r['startDate']} /> },
          { key: 'endDate', label: '종료일', render: (r) => <DateText value={r['endDate']} /> },
          { key: 'reason', label: '사유' },
          { key: 'approvalStatus', label: '승인 처리 상태', render: (r) => <Badge value={r['approvalStatus']} /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={(row) => setSelected(row)}
        empty="아직 신청한 근태가 없습니다. 근태 신청 버튼으로 첫 신청을 등록해 보세요."
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      {creating && (
        <Drawer title="근태 신청" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="신청">
            <Field label="근태 유형" required>
              <Select value={attendanceType} onChange={setAttendanceType} options={TYPES} />
            </Field>
            <Field label="시작일" required>
              <DateInput value={startDate} onChange={setStartDate} />
            </Field>
            <Field label="종료일" required>
              <DateInput value={endDate} onChange={setEndDate} />
            </Field>
            <Field label="사유" wide>
              <TextInput value={reason} onChange={setReason} multiline />
            </Field>
            <Field label="변경 근무시간" hint="근무변경 신청일 때만 입력합니다.">
              <TextInput value={changedWorkTime} onChange={setChangedWorkTime} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
