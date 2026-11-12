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
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const BASE = '/asset-inspection-plans';
const SIZE = 20;
const APPROVAL_OPTIONS: [string, string][] = [
  ['신청', '신청'],
  ['승인', '승인'],
  ['승인 취소', '승인 취소'],
  ['반려', '반려'],
];
const PROGRESS_OPTIONS: [string, string][] = [
  ['진행', '진행'],
  ['완료', '완료'],
  ['취소', '취소'],
];

type ActionKind = 'delete' | 'cancelApproval' | 'cancel' | 'complete';

const ACTIONS: Record<ActionKind, { title: string; submit: string; done: string; note: string; danger: boolean }> = {
  delete: {
    title: '실사 계획 삭제',
    submit: '삭제',
    done: '실사 계획을 삭제했습니다.',
    note: '삭제한 계획은 되돌릴 수 없습니다.',
    danger: true,
  },
  cancelApproval: {
    title: '승인 취소',
    submit: '승인 취소',
    done: '실사 계획 승인을 취소했습니다.',
    note: '승인을 취소하면 계획을 다시 수정할 수 있습니다.',
    danger: true,
  },
  cancel: {
    title: '실사 취소',
    submit: '실사 취소',
    done: '실사를 취소했습니다.',
    note: '취소한 실사는 다시 진행할 수 없습니다.',
    danger: true,
  },
  complete: {
    title: '실사 완료',
    submit: '완료 처리',
    done: '실사를 완료 처리했습니다.',
    note: '완료 처리한 실사는 다시 진행 상태로 돌릴 수 없습니다.',
    danger: false,
  },
};

function PlanForm({
  role,
  notify,
  plan,
  onDone,
}: {
  role: string;
  notify: (text: string) => void;
  plan: Row | null;
  onDone: () => void;
}) {
  const editing = plan !== null;
  const [inspectionType, setInspectionType] = useState<string>(editing ? String(plan['inspectionType'] ?? '') : '');
  const [startDate, setStartDate] = useState<string>(editing ? String(plan['startDate'] ?? '') : '');
  const [endDate, setEndDate] = useState<string>(editing ? String(plan['endDate'] ?? '') : '');
  const [targetScope, setTargetScope] = useState<string>('');
  const [managerId, setManagerId] = useState<number | string>('');

  async function submit() {
    if (!editing) {
      if (!inspectionType.trim()) throw new Error('실사 유형을 입력해 주세요.');
      if (!startDate) throw new Error('실사 시작일을 입력해 주세요.');
      if (!endDate) throw new Error('실사 종료일을 입력해 주세요.');
      if (!targetScope.trim()) throw new Error('실사 대상 범위를 입력해 주세요.');
    }
    if (startDate && endDate && endDate <= startDate) {
      throw new Error('실사 종료일은 시작일보다 늦어야 합니다.');
    }
    const body: Row = {};
    if (inspectionType.trim()) body.inspectionType = inspectionType.trim();
    if (startDate) body.startDate = startDate;
    if (endDate) body.endDate = endDate;
    if (targetScope.trim()) body.targetScope = targetScope.trim();
    if (managerId !== '') body.managerId = managerId;
    if (editing) {
      await call('PATCH', BASE + '/' + plan['assetInspectionPlanId'], role, body);
      notify('실사 계획을 수정했습니다.');
    } else {
      await call('POST', BASE, role, body);
      notify('실사 계획을 작성했습니다.');
    }
    onDone();
  }

  return (
    <Form onSubmit={submit} submit={editing ? '수정' : '작성'}>
      <Field label='실사 유형' required={!editing}>
        <TextInput value={inspectionType} onChange={setInspectionType} />
      </Field>
      <Field label='실사 시작일' required={!editing}>
        <DateInput value={startDate} onChange={setStartDate} />
      </Field>
      <Field label='실사 종료일' required={!editing} hint='시작일보다 늦어야 합니다.'>
        <DateInput value={endDate} onChange={setEndDate} />
      </Field>
      <Field
        label='실사 대상 범위'
        required={!editing}
        wide
        hint={editing ? '비워 두면 기존 내용을 유지합니다.' : undefined}
      >
        <TextInput value={targetScope} onChange={setTargetScope} multiline />
      </Field>
      <Field label='실사 담당자' hint={editing ? '비워 두면 기존 담당자를 유지합니다.' : '비워 두면 작성자가 담당자가 됩니다.'}>
        <LookupSelect table='employee' role={role} value={managerId} onChange={setManagerId} />
      </Field>
    </Form>
  );
}

export default function FnSfr02504Page({ role, notify }: PageProps) {
  const [typeDraft, setTypeDraft] = useState('');
  const [approvalDraft, setApprovalDraft] = useState('');
  const [progressDraft, setProgressDraft] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [action, setAction] = useState<ActionKind | null>(null);

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', BASE, role, undefined, { ...applied, page, size: SIZE }),
    [applied, page, role],
  );

  function search() {
    setPage(0);
    setApplied({
      inspectionType: typeDraft.trim(),
      approvalStatus: approvalDraft,
      progressStatus: progressDraft,
    });
  }

  function reset() {
    setTypeDraft('');
    setApprovalDraft('');
    setProgressDraft('');
    setPage(0);
    setApplied({});
  }

  function finish() {
    setCreating(false);
    setEditing(null);
    setAction(null);
    setSelected(null);
    reload();
  }

  async function runAction() {
    if (!selected || !action) return;
    const path = BASE + '/' + selected['assetInspectionPlanId'];
    if (action === 'delete') {
      await call('DELETE', path, role);
    } else if (action === 'cancelApproval') {
      await call('POST', path + '/cancel-approval', role, {});
    } else if (action === 'cancel') {
      await call('POST', path + '/cancel', role, {});
    } else {
      await call('POST', path + '/complete', role, {});
    }
    notify(ACTIONS[action].done);
    finish();
  }

  if (selected) {
    const approved = selected['approvalStatus'] === '승인';
    const inProgress = selected['progressStatus'] === '진행';
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setSelected(null)}>
          목록으로
        </button>
        <section className='box'>
          <h2>실사 계획</h2>
          <Pairs
            items={[
              ['실사 유형', String(selected['inspectionType'] ?? '')],
              ['실사 시작일', <DateText value={selected['startDate']} />],
              ['실사 종료일', <DateText value={selected['endDate']} />],
              ['승인 처리 상태', <Badge value={selected['approvalStatus']} />],
              ['진행 상태', <Badge value={selected['progressStatus']} />],
            ]}
          />
        </section>
        <section className='box'>
          <h2>처리</h2>
          {approved && (
            <p>승인된 계획은 수정하거나 삭제할 수 없습니다. 먼저 승인을 취소해 주세요.</p>
          )}
          {!approved && !inProgress && <p>진행 중인 실사만 수정·삭제할 수 있습니다.</p>}
          <div>
            {!approved && (
              <button className='ghost' onClick={() => setEditing(selected)}>
                수정
              </button>
            )}
            {!approved && inProgress && (
              <button className='ghost' onClick={() => setAction('delete')}>
                삭제
              </button>
            )}
            {approved && (
              <button className='ghost' onClick={() => setAction('cancelApproval')}>
                승인 취소
              </button>
            )}
            {inProgress && (
              <button className='ghost' onClick={() => setAction('cancel')}>
                실사 취소
              </button>
            )}
            {inProgress && (
              <button className='ghost' onClick={() => setAction('complete')}>
                완료 처리
              </button>
            )}
          </div>
        </section>
        {editing && (
          <Drawer title='실사 계획 수정' onClose={() => setEditing(null)}>
            <PlanForm role={role} notify={notify} plan={editing} onDone={finish} />
          </Drawer>
        )}
        {action && (
          <Drawer title={ACTIONS[action].title} onClose={() => setAction(null)}>
            <Form
              onSubmit={runAction}
              submit={ACTIONS[action].submit}
              danger={ACTIONS[action].danger}
              note={ACTIONS[action].note}
            />
          </Drawer>
        )}
      </div>
    );
  }

  const rows = data?.items ?? [];
  return (
    <div className='doc'>
      <section className='box'>
        <h2>자산실사 계획</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label='실사 유형'>
            <TextInput value={typeDraft} onChange={setTypeDraft} />
          </Field>
          <Field label='승인 처리 상태'>
            <Select value={approvalDraft} onChange={setApprovalDraft} options={APPROVAL_OPTIONS} placeholder='전체' />
          </Field>
          <Field label='진행 상태'>
            <Select value={progressDraft} onChange={setProgressDraft} options={PROGRESS_OPTIONS} placeholder='전체' />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={() => setCreating(true)}>계획 작성</button>
        </Band>
        {error && <ErrorText text={error} />}
        <DataTable
          columns={[
            { key: 'inspectionType', label: '실사 유형' },
            {
              key: 'startDate',
              label: '실사 시작일',
              render: (row) => <DateText value={row['startDate']} />,
            },
            {
              key: 'endDate',
              label: '실사 종료일',
              render: (row) => <DateText value={row['endDate']} />,
            },
            {
              key: 'approvalStatus',
              label: '승인 처리 상태',
              render: (row) => <Badge value={row['approvalStatus']} />,
            },
            {
              key: 'progressStatus',
              label: '진행 상태',
              render: (row) => <Badge value={row['progressStatus']} />,
            },
          ]}
          rows={rows}
          onRowClick={(row) => setSelected(row)}
          empty='아직 등록한 실사 계획이 없습니다. 계획 작성 버튼으로 시작해 주세요.'
        />
        <Pager page={page} size={data?.size ?? SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {creating && (
        <Drawer title='실사 계획 작성' onClose={() => setCreating(false)}>
          <PlanForm role={role} notify={notify} plan={null} onDone={finish} />
        </Drawer>
      )}
    </div>
  );
}
