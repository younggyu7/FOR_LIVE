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
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const PATH = '/leave-of-absence-requests';
const STATUS_OPTIONS: [string, string][] = [
  ['신청', '신청'],
  ['승인', '승인'],
  ['반려', '반려'],
];

export default function FnSfr01207Page({ role, notify }: PageProps) {
  const [statusDraft, setStatusDraft] = useState('');
  const [employeeDraft, setEmployeeDraft] = useState<number | string>('');
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const [requestType, setRequestType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [decision, setDecision] = useState('승인');
  const [rejectReason, setRejectReason] = useState('');

  const list = useData<Page>(
    () => call<Page>('GET', PATH, role, undefined, { ...applied, page: pageNo, size: 20 }),
    [role, applied, pageNo],
  );
  const isHr = role === '인사 담당자';
  const isEmployee = role === '임직원';

  function search() {
    setPageNo(0);
    setApplied({ status: statusDraft, employeeId: employeeDraft });
  }

  function reset() {
    setStatusDraft('');
    setEmployeeDraft('');
    setPageNo(0);
    setApplied({});
  }

  function openCreate() {
    setRequestType('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setCreating(true);
  }

  async function submitCreate() {
    if (!requestType.trim() || !startDate || !endDate) {
      throw new Error('신청 구분, 시작일, 종료일을 입력해 주세요.');
    }
    if (endDate < startDate) {
      throw new Error('종료일은 시작일보다 빠를 수 없습니다.');
    }
    await call('POST', PATH, role, { requestType, startDate, endDate, reason });
    setCreating(false);
    notify('휴직·단축근무를 신청했습니다.');
    list.reload();
  }

  function openReview() {
    setDecision('승인');
    setRejectReason('');
    setReviewing(true);
  }

  async function submitReview() {
    if (!selected) {
      return;
    }
    if (decision === '반려' && !rejectReason.trim()) {
      throw new Error('반려 사유를 입력해 주세요.');
    }
    const id = String(selected['leaveOfAbsenceRequestId']);
    await call('POST', PATH + '/' + id + '/review', role, { status: decision, rejectReason });
    setReviewing(false);
    setSelected(null);
    notify('신청을 ' + decision + ' 처리했습니다.');
    list.reload();
  }

  if (selected) {
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setSelected(null)}>
          목록으로
        </button>
        <section className='box'>
          <h2>신청 내용</h2>
          <Pairs
            items={[
              ['신청 임직원', <RefName table='employee' role={role} value={selected['employeeId']} />],
              ['신청 구분', String(selected['requestType'] ?? '')],
              ['시작일', <DateText value={selected['startDate']} />],
              ['종료일', <DateText value={selected['endDate']} />],
              ['신청 사유', String(selected['reason'] ?? '')],
            ]}
          />
        </section>
        <section className='box'>
          <h2>처리 결과</h2>
          <Pairs
            items={[
              ['승인 처리 상태', <Badge value={selected['status']} />],
              ['반려 사유', String(selected['rejectReason'] ?? '')],
            ]}
          />
          {isHr && selected['status'] === '신청' ? (
            <button onClick={openReview}>검토 처리</button>
          ) : null}
        </section>
        {reviewing ? (
          <Drawer title='신청 검토' onClose={() => setReviewing(false)}>
            <Form
              onSubmit={submitReview}
              submit='처리하기'
              danger={decision === '반려'}
              note='처리한 신청은 다시 처리할 수 없습니다. 승인하면 인사기록카드에 반영하고 신청자에게 알립니다.'
            >
              <Field label='승인 처리 상태' required>
                <Select
                  value={decision}
                  onChange={setDecision}
                  options={[
                    ['승인', '승인'],
                    ['반려', '반려'],
                  ]}
                />
              </Field>
              {decision === '반려' ? (
                <Field label='반려 사유' required wide>
                  <TextInput value={rejectReason} onChange={setRejectReason} multiline />
                </Field>
              ) : null}
            </Form>
          </Drawer>
        ) : null}
      </div>
    );
  }

  const rows = list.data ? list.data.items : [];
  return (
    <div className='doc'>
      <h1>휴직·단축근무 신청</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label='승인 처리 상태'>
          <Select value={statusDraft} onChange={setStatusDraft} options={STATUS_OPTIONS} placeholder='전체' />
        </Field>
        <Field label='신청 임직원'>
          <LookupSelect table='employee' role={role} value={employeeDraft} onChange={setEmployeeDraft} placeholder='전체' />
        </Field>
      </Filters>
      <Band total={list.data ? list.data.total : 0}>
        {isEmployee ? <button onClick={openCreate}>휴직·단축근무 신청</button> : null}
      </Band>
      {list.error ? <ErrorText text={list.error} /> : null}
      <DataTable
        rows={rows}
        empty='아직 등록한 신청이 없습니다. 임직원이 신청하면 여기에 나타납니다.'
        onRowClick={(row) => setSelected(row)}
        columns={[
          {
            key: 'employeeId',
            label: '신청 임직원',
            render: (row) => <RefName table='employee' role={role} value={row['employeeId']} />,
          },
          { key: 'requestType', label: '신청 구분' },
          {
            key: 'startDate',
            label: '시작일',
            render: (row) => <DateText value={row['startDate']} />,
          },
          {
            key: 'endDate',
            label: '종료일',
            render: (row) => <DateText value={row['endDate']} />,
          },
          {
            key: 'status',
            label: '승인 처리 상태',
            render: (row) => <Badge value={row['status']} />,
          },
        ]}
      />
      {list.data ? (
        <Pager page={list.data.page} size={list.data.size} total={list.data.total} onPage={setPageNo} />
      ) : null}
      {creating ? (
        <Drawer title='휴직·단축근무 신청' onClose={() => setCreating(false)}>
          <Form onSubmit={submitCreate} submit='신청하기'>
            <Field label='신청 구분' required>
              <TextInput value={requestType} onChange={setRequestType} placeholder='예: 휴직, 단축근무' />
            </Field>
            <Field label='시작일' required>
              <DateInput value={startDate} onChange={setStartDate} />
            </Field>
            <Field label='종료일' required>
              <DateInput value={endDate} onChange={setEndDate} />
            </Field>
            <Field label='신청 사유' wide>
              <TextInput value={reason} onChange={setReason} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
