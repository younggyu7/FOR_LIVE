import { useState } from 'react';
import {
  call, useData, Band, DataTable, Pager, Drawer, Form, Field, TextInput, NumberInput, DateInput,
  LookupSelect, RefName, Filters,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

type Mode = '' | 'courseNew' | 'courseEdit' | 'session' | 'attendee' | 'report' | 'remove';

export default function FnSfr01502Page({ role, notify }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [query, setQuery] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<Mode>('');
  const [target, setTarget] = useState<Row | null>(null);

  const list = useData<Page>(async () => {
    if (query === '') return { items: [], page: 0, size: 20, total: 0 };
    return call<Page>('GET', '/education-attendees', role, undefined, { employeeId: query, page, size: 20 });
  }, [query, page]);

  const [courseId, setCourseId] = useState<number | string>('');
  const [courseName, setCourseName] = useState('');
  const [typeId, setTypeId] = useState<number | string>('');
  const [methodId, setMethodId] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [sessionId, setSessionId] = useState<number | string>('');
  const [sessionNo, setSessionNo] = useState<number | string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [attendeeEmployee, setAttendeeEmployee] = useState<number | string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  function open(next: Mode, row?: Row) {
    setCourseId('');
    setCourseName('');
    setTypeId('');
    setMethodId('');
    setDescription('');
    setSessionId('');
    setSessionNo('');
    setStartDate('');
    setEndDate('');
    setAttendeeEmployee('');
    setTitle('');
    setContent('');
    setTarget(row ?? null);
    setMode(next);
  }

  function close() {
    setMode('');
    setTarget(null);
  }

  async function done(text: string) {
    notify(text);
    close();
    list.reload();
  }

  async function submitCourseNew() {
    if (courseName.trim() === '') throw new Error('교육과정명을 입력해 주세요.');
    if (typeId === '') throw new Error('교육유형을 선택해 주세요.');
    if (methodId === '') throw new Error('교육방법을 선택해 주세요.');
    await call('POST', '/education-courses', role, {
      courseName,
      educationTypeId: typeId,
      educationMethodId: methodId,
      description: description === '' ? undefined : description,
    });
    await done('교육과정을 등록했습니다.');
  }

  async function submitCourseEdit() {
    if (courseId === '') throw new Error('수정할 교육과정을 선택해 주세요.');
    const body: Row = {};
    if (courseName.trim() !== '') body.courseName = courseName;
    if (typeId !== '') body.educationTypeId = typeId;
    if (methodId !== '') body.educationMethodId = methodId;
    if (description !== '') body.description = description;
    if (Object.keys(body).length === 0) throw new Error('수정할 항목을 한 가지 이상 입력해 주세요.');
    await call('PATCH', '/education-courses/' + courseId, role, body);
    await done('교육과정을 수정했습니다.');
  }

  async function submitSession() {
    if (courseId === '') throw new Error('교육과정을 선택해 주세요.');
    if (sessionNo === '') throw new Error('차수를 입력해 주세요.');
    if (startDate === '') throw new Error('교육 시작일을 입력해 주세요.');
    if (endDate === '') throw new Error('교육 종료일을 입력해 주세요.');
    await call('POST', '/education-sessions', role, {
      educationCourseId: courseId,
      sessionNo,
      startDate,
      endDate,
    });
    await done('교육 차수를 등록했습니다.');
  }

  async function submitAttendee() {
    if (sessionId === '') throw new Error('교육차수를 선택해 주세요.');
    if (attendeeEmployee === '') throw new Error('임직원을 선택해 주세요.');
    await call('POST', '/education-attendees', role, {
      educationSessionId: sessionId,
      employeeId: attendeeEmployee,
    });
    await done('교육대상자를 등록했습니다.');
  }

  async function submitRemove() {
    if (!target) return;
    await call('DELETE', '/education-attendees/' + target.educationAttendeeId, role);
    await done('교육대상자를 삭제했습니다.');
  }

  async function submitReport() {
    if (sessionId === '') throw new Error('교육차수를 선택해 주세요.');
    if (content.trim() === '') throw new Error('결과보고 내용을 입력해 주세요.');
    await call('POST', '/education-result-reports', role, {
      educationSessionId: sessionId,
      title: title === '' ? undefined : title,
      reportContent: content,
    });
    await done('교육결과 보고를 등록했습니다.');
  }

  const data = list.data;

  return (
    <div className="doc">
      <h1>교육과정 및 대상자 관리</h1>
      <Filters
        onSearch={() => {
          setPage(0);
          setQuery(employeeId);
        }}
        onReset={() => {
          setEmployeeId('');
          setQuery('');
          setPage(0);
        }}
      >
        <Field label="임직원">
          <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
        </Field>
      </Filters>
      <Band total={data?.total ?? 0}>
        <button onClick={() => open('courseNew')}>교육과정 등록</button>
        <button className="ghost" onClick={() => open('courseEdit')}>교육과정 수정</button>
        <button className="ghost" onClick={() => open('session')}>차수 등록</button>
        <button className="ghost" onClick={() => open('attendee')}>교육대상자 등록</button>
        <button className="ghost" onClick={() => open('report')}>교육결과 보고 등록</button>
      </Band>
      {list.error !== '' && <p>{list.error}</p>}
      <DataTable
        columns={[
          {
            key: 'educationSessionId',
            label: '교육차수',
            render: (row) => <RefName table="education_session" role={role} value={row.educationSessionId} />,
          },
          {
            key: 'educationAttendeeId',
            label: '처리',
            render: (row) => (
              <button className="ghost" onClick={() => open('remove', row)}>삭제</button>
            ),
          },
        ]}
        rows={data?.items ?? []}
        empty={query === '' ? '임직원을 골라 조회하면 교육이수 내역이 보입니다.' : '아직 등록한 내역이 없습니다.'}
      />
      <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />

      {mode === 'courseNew' && (
        <Drawer title="교육과정 등록" onClose={close}>
          <Form onSubmit={submitCourseNew} submit="등록">
            <Field label="교육과정명" required>
              <TextInput value={courseName} onChange={setCourseName} />
            </Field>
            <Field label="교육유형" required>
              <LookupSelect table="education_code" role={role} value={typeId} onChange={setTypeId} />
            </Field>
            <Field label="교육방법" required>
              <LookupSelect table="education_code" role={role} value={methodId} onChange={setMethodId} />
            </Field>
            <Field label="과정 설명" wide>
              <TextInput value={description} onChange={setDescription} multiline />
            </Field>
          </Form>
        </Drawer>
      )}

      {mode === 'courseEdit' && (
        <Drawer title="교육과정 수정" onClose={close}>
          <Form onSubmit={submitCourseEdit} submit="수정" note="입력한 항목만 바뀝니다.">
            <Field label="교육과정" required>
              <LookupSelect table="education_course" role={role} value={courseId} onChange={setCourseId} />
            </Field>
            <Field label="교육과정명">
              <TextInput value={courseName} onChange={setCourseName} />
            </Field>
            <Field label="교육유형">
              <LookupSelect table="education_code" role={role} value={typeId} onChange={setTypeId} />
            </Field>
            <Field label="교육방법">
              <LookupSelect table="education_code" role={role} value={methodId} onChange={setMethodId} />
            </Field>
            <Field label="과정 설명" wide>
              <TextInput value={description} onChange={setDescription} multiline />
            </Field>
          </Form>
        </Drawer>
      )}

      {mode === 'session' && (
        <Drawer title="차수 등록" onClose={close}>
          <Form onSubmit={submitSession} submit="등록">
            <Field label="교육과정" required>
              <LookupSelect table="education_course" role={role} value={courseId} onChange={setCourseId} />
            </Field>
            <Field label="차수" required>
              <NumberInput value={sessionNo} onChange={setSessionNo} />
            </Field>
            <Field label="교육 시작일" required>
              <DateInput value={startDate} onChange={setStartDate} />
            </Field>
            <Field label="교육 종료일" required>
              <DateInput value={endDate} onChange={setEndDate} />
            </Field>
          </Form>
        </Drawer>
      )}

      {mode === 'attendee' && (
        <Drawer title="교육대상자 등록" onClose={close}>
          <Form onSubmit={submitAttendee} submit="등록">
            <Field label="교육차수" required>
              <LookupSelect table="education_session" role={role} value={sessionId} onChange={setSessionId} />
            </Field>
            <Field label="임직원" required>
              <LookupSelect table="employee" role={role} value={attendeeEmployee} onChange={setAttendeeEmployee} />
            </Field>
          </Form>
        </Drawer>
      )}

      {mode === 'remove' && target && (
        <Drawer title="교육대상자 삭제" onClose={close}>
          <Form
            onSubmit={submitRemove}
            submit="삭제"
            danger
            note="삭제하면 되돌릴 수 없고 변경 이력이 남습니다."
          >
            <p>
              <RefName table="education_session" role={role} value={target.educationSessionId} /> 차수의 교육대상자를 삭제합니다.
            </p>
          </Form>
        </Drawer>
      )}

      {mode === 'report' && (
        <Drawer title="교육결과 보고 등록" onClose={close}>
          <Form onSubmit={submitReport} submit="등록">
            <Field label="교육차수" required>
              <LookupSelect table="education_session" role={role} value={sessionId} onChange={setSessionId} />
            </Field>
            <Field label="보고 제목">
              <TextInput value={title} onChange={setTitle} />
            </Field>
            <Field label="결과보고 내용" required wide>
              <TextInput value={content} onChange={setContent} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
