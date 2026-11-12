import { useState } from 'react';
import { call, useData, Badge, DateText, Filters, Band, DataTable, Pager, Drawer, Pairs, Form, Field, TextInput, DateInput, Select, ErrorText } from '../kit';
import type { PageProps, Row, Page } from '../kit';

const TYPES: [string, string][] = [
  ['출장', '출장'],
  ['외근', '외근'],
];
const ALL_TYPES: [string, string][] = [
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

export default function FnSfr01810Page({ role, notify }: PageProps) {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({ attendanceType: '출장' });

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/attendance-requests', role, undefined, { ...applied, page, size: 20 }),
    [applied, page, role],
  );

  const setField = (key: string, value: unknown) => setForm({ ...form, [key]: value });

  const create = async () => {
    if (!form.attendanceType || !form.startDate || !form.endDate) {
      throw new Error('근태 유형, 시작일, 종료일을 모두 입력해 주세요.');
    }
    await call('POST', '/attendance-requests', role, {
      attendanceType: form.attendanceType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
      changedWorkTime: form.changedWorkTime,
    });
    notify('출장·외근 신청을 등록했습니다.');
    setCreating(false);
    setForm({ attendanceType: '출장' });
    reload();
  };

  const submit = async () => {
    if (!detail) return;
    await call('POST', `/attendance-requests/${String(detail.attendanceRequestId)}/submit`, role, {});
    notify('결재 상신했습니다.');
    setDetail(null);
    reload();
  };

  if (detail) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setDetail(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>신청 내용</h2>
          <Pairs
            items={[
              ['근태 유형', String(detail.attendanceType ?? '')],
              ['시작일', <DateText value={detail.startDate} />],
              ['종료일', <DateText value={detail.endDate} />],
              ['사유', String(detail.reason ?? '')],
              ['변경 근무시간', String(detail.changedWorkTime ?? '')],
              ['승인 처리 상태', <Badge value={detail.approvalStatus} />],
            ]}
          />
        </section>
        {detail.approvalStatus === '신청' && (
          <section className="box">
            <h2>결재 상신</h2>
            <Form onSubmit={submit} submit="결재 상신" note="상신하면 전자결재 문서가 만들어지고, 승인 전에는 이 신청을 임의로 바꿀 수 없습니다." />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>출장·외근 신청 현황</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setApplied({ attendanceType: type, approvalStatus: status });
          }}
          onReset={() => {
            setType('');
            setStatus('');
            setPage(0);
            setApplied({});
          }}
        >
          <Field label="근태 유형">
            <Select value={type} onChange={setType} options={ALL_TYPES} placeholder="전체" />
          </Field>
          <Field label="승인 처리 상태">
            <Select value={status} onChange={setStatus} options={STATUSES} placeholder="전체" />
          </Field>
        </Filters>
        {error && <ErrorText text={error} />}
        <Band total={data?.total}>
          <button onClick={() => setCreating(true)}>출장·외근 신청</button>
        </Band>
        <DataTable
          columns={[
            { key: 'attendanceType', label: '근태 유형' },
            { key: 'startDate', label: '시작일', render: (r) => <DateText value={r.startDate} /> },
            { key: 'endDate', label: '종료일', render: (r) => <DateText value={r.endDate} /> },
            { key: 'reason', label: '사유' },
            { key: 'approvalStatus', label: '승인 처리 상태', render: (r) => <Badge value={r.approvalStatus} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r) => setDetail(r)}
          empty="아직 등록한 신청이 없습니다. 출장·외근 신청 버튼으로 시작하세요."
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {creating && (
        <Drawer title="출장·외근 신청" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="등록">
            <Field label="근태 유형" required>
              <Select value={form.attendanceType} onChange={(v) => setField('attendanceType', v)} options={TYPES} />
            </Field>
            <Field label="시작일" required>
              <DateInput value={form.startDate} onChange={(v) => setField('startDate', v)} />
            </Field>
            <Field label="종료일" required>
              <DateInput value={form.endDate} onChange={(v) => setField('endDate', v)} />
            </Field>
            <Field label="사유" wide>
              <TextInput multiline value={form.reason} onChange={(v) => setField('reason', v)} />
            </Field>
            <Field label="변경 근무시간">
              <TextInput value={form.changedWorkTime} onChange={(v) => setField('changedWorkTime', v)} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
