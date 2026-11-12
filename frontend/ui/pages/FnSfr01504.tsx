import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
  DateText,
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
  LookupSelect,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const COMPLETED_OPTIONS: [string, string][] = [
  ['true', '수료'],
  ['false', '미수료'],
];

export default function FnSfr01504Page({ role, notify }: PageProps) {
  const [sessionId, setSessionId] = useState<number | string>('');
  const [appliedId, setAppliedId] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [attendeeId, setAttendeeId] = useState<number | string>('');
  const [item, setItem] = useState('');
  const [score, setScore] = useState<number | string>('');
  const [completed, setCompleted] = useState('');

  const { data, error, reload } = useData<Page>(async () => {
    if (appliedId === '') {
      return { items: [], page: 0, size: 20, total: 0 };
    }
    return call<Page>('GET', '/education-evaluations', role, undefined, {
      educationSessionId: appliedId,
      page,
      size: 20,
    });
  }, [appliedId, page]);

  function search() {
    setPage(0);
    setAppliedId(sessionId);
    reload();
  }

  function reset() {
    setSessionId('');
    setAppliedId('');
    setPage(0);
  }

  function openCreate() {
    setAttendeeId('');
    setItem('');
    setScore('');
    setCompleted('');
    setCreating(true);
  }

  function openEdit(row: Row) {
    setItem(String(row['evaluationItem'] ?? ''));
    setScore(row['score'] === null || row['score'] === undefined ? '' : Number(row['score']));
    setCompleted(row['completed'] === null || row['completed'] === undefined ? '' : String(row['completed']));
    setEditing(row);
  }

  async function create() {
    if (attendeeId === '') {
      throw new Error('교육대상자를 선택해 주세요.');
    }
    if (item.trim() === '') {
      throw new Error('평가 항목을 입력해 주세요.');
    }
    const body: Row = { educationAttendeeId: attendeeId, evaluationItem: item };
    if (score !== '') {
      body.score = score;
    }
    if (completed !== '') {
      body.completed = completed === 'true';
    }
    await call('POST', '/education-evaluations', role, body);
    notify('교육평가를 등록했습니다.');
    setCreating(false);
    reload();
  }

  async function update() {
    if (editing === null) {
      return;
    }
    if (item.trim() === '') {
      throw new Error('평가 항목을 입력해 주세요.');
    }
    const body: Row = { evaluationItem: item };
    if (score !== '') {
      body.score = score;
    }
    if (completed !== '') {
      body.completed = completed === 'true';
    }
    await call('PATCH', '/education-evaluations/' + String(editing['educationEvaluationId']), role, body);
    notify('교육평가를 수정했습니다.');
    setEditing(null);
    reload();
  }

  const columns = [
    { key: 'employeeName', label: '임직원명' },
    { key: 'evaluationItem', label: '평가 항목' },
    { key: 'score', label: '점수', render: (row: Row) => <Num value={row['score']} /> },
    {
      key: 'completed',
      label: '수료 여부',
      render: (row: Row) => <Badge value={row['completed'] === true ? '수료' : row['completed'] === false ? '미수료' : ''} />,
    },
    { key: 'evaluatedAt', label: '평가 일시', render: (row: Row) => <DateText value={row['evaluatedAt']} time /> },
  ];

  return (
    <div>
      <h1>교육평가 관리</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="교육 차수 ID" required>
          <LookupSelect
            table="education_session"
            role={role}
            value={sessionId}
            onChange={setSessionId}
            placeholder="교육 차수 선택"
          />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>교육평가 등록</button>
      </Band>
      {error !== '' && <ErrorText text={error} />}
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        onRowClick={openEdit}
        empty={appliedId === '' ? '교육 차수를 선택하고 조회해 주세요.' : '아직 등록한 교육평가가 없습니다.'}
      />
      <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      {creating && (
        <Drawer title="교육평가 등록" onClose={() => setCreating(false)}>
          <Form onSubmit={create} submit="등록">
            <Field label="교육대상자 ID" required>
              <LookupSelect
                table="education_attendee"
                role={role}
                value={attendeeId}
                onChange={setAttendeeId}
                placeholder="교육대상자 선택"
              />
            </Field>
            <Field label="평가 항목" required>
              <TextInput value={item} onChange={setItem} />
            </Field>
            <Field label="점수">
              <NumberInput value={score} onChange={setScore} />
            </Field>
            <Field label="수료 여부">
              <Select value={completed} onChange={setCompleted} options={COMPLETED_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      )}
      {editing !== null && (
        <Drawer title="교육평가 수정" onClose={() => setEditing(null)}>
          <Form onSubmit={update} submit="수정">
            <Field label="평가 항목" required>
              <TextInput value={item} onChange={setItem} />
            </Field>
            <Field label="점수">
              <NumberInput value={score} onChange={setScore} />
            </Field>
            <Field label="수료 여부">
              <Select value={completed} onChange={setCompleted} options={COMPLETED_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
