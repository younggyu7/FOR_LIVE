import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  Field,
  Form,
  LookupSelect,
  RefName,
  Select,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

const STATUS_OPTIONS: [string, string][] = [
  ['진행 전', '진행 전'],
  ['진행 중', '진행 중'],
  ['종료', '종료'],
];
const CHANNEL_OPTIONS: [string, string][] = [
  ['메신저', '메신저'],
  ['모바일', '모바일'],
  ['대화방', '대화방'],
  ['메일', '메일'],
  ['포털', '포털'],
];
const YES_NO: [string, string][] = [
  ['true', '사용'],
  ['false', '사용 안 함'],
];
const PUBLIC_OPTIONS: [string, string][] = [
  ['true', '공개'],
  ['false', '비공개'],
];

export default function FnSfr03501Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [created, setCreated] = useState<Row[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('진행 전');
  const [commentEnabled, setCommentEnabled] = useState('true');
  const [resultPublic, setResultPublic] = useState('false');
  const [participantPublic, setParticipantPublic] = useState('false');
  const [channel, setChannel] = useState('');
  const [targets, setTargets] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | string>('');

  function resetForm() {
    setTitle('');
    setContent('');
    setStartDate('');
    setEndDate('');
    setStatus('진행 전');
    setCommentEnabled('true');
    setResultPublic('false');
    setParticipantPublic('false');
    setChannel('');
    setTargets([]);
    setPicked('');
  }

  function addTarget() {
    if (typeof picked !== 'number') {
      return;
    }
    if (!targets.includes(picked)) {
      setTargets([...targets, picked]);
    }
    setPicked('');
  }

  async function submit() {
    if (title.trim() === '') {
      throw new Error('설문 제목을 입력해 주세요.');
    }
    if (startDate === '' || endDate === '') {
      throw new Error('설문 시작일과 종료일을 입력해 주세요.');
    }
    if (endDate < startDate) {
      throw new Error('설문 종료일은 시작일보다 빠를 수 없습니다.');
    }
    if (targets.length === 0) {
      throw new Error('설문 대상 임직원을 한 명 이상 추가해 주세요.');
    }
    const body: Row = {
      title: title.trim(),
      content,
      startDate,
      endDate,
      status,
      commentEnabled: commentEnabled === 'true',
      resultPublic: resultPublic === 'true',
      participantPublic: participantPublic === 'true',
      targetEmployeeIds: targets,
    };
    if (channel !== '') {
      body.notificationChannel = channel;
    }
    const result = await call<Row>('POST', '/surveys', role, body);
    setCreated([
      { surveyId: result.surveyId, title: title.trim(), startDate, endDate, status },
      ...created,
    ]);
    notify('설문조사를 등록했습니다.');
    resetForm();
    setMode('list');
  }

  if (mode === 'form') {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setMode('list')}>
          목록으로 돌아가기
        </button>
        <h1>설문조사 등록</h1>
        <Form onSubmit={submit} submit="설문조사 등록">
          <section className="box">
            <h2>기본 정보</h2>
            <Field label="설문 제목" required wide>
              <TextInput value={title} onChange={setTitle} />
            </Field>
            <Field label="설문 내용" wide>
              <TextInput value={content} onChange={setContent} multiline />
            </Field>
            <Field label="설문 시작일" required>
              <DateInput value={startDate} onChange={setStartDate} />
            </Field>
            <Field label="설문 종료일" required>
              <DateInput value={endDate} onChange={setEndDate} />
            </Field>
          </section>
          <section className="box">
            <h2>공개 설정</h2>
            <Field label="진행상태" required>
              <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="선택" />
            </Field>
            <Field label="댓글 사용 여부" required>
              <Select value={commentEnabled} onChange={setCommentEnabled} options={YES_NO} />
            </Field>
            <Field label="결과 공개 여부" required>
              <Select value={resultPublic} onChange={setResultPublic} options={PUBLIC_OPTIONS} />
            </Field>
            <Field label="참여자 정보 공개 여부" required>
              <Select value={participantPublic} onChange={setParticipantPublic} options={PUBLIC_OPTIONS} />
            </Field>
          </section>
          <section className="box">
            <h2>설문 대상</h2>
            <Field label="설문 대상 임직원" required wide hint="임직원을 고른 뒤 추가를 누르세요.">
              <LookupSelect table="employee" role={role} value={picked} onChange={setPicked} placeholder="임직원 선택" />
            </Field>
            <button type="button" className="ghost" onClick={addTarget}>
              대상 추가
            </button>
            {targets.length === 0 ? (
              <p>아직 추가한 대상이 없습니다. 임직원을 골라 추가해 주세요.</p>
            ) : (
              <ul>
                {targets.map((id) => (
                  <li key={id}>
                    <RefName table="employee" role={role} value={id} />{' '}
                    <button type="button" className="ghost" onClick={() => setTargets(targets.filter((t) => t !== id))}>
                      제외
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="box">
            <h2>알림 설정</h2>
            <Field label="알림 채널" hint="고르지 않으면 알림 채널을 설정하지 않습니다.">
              <Select value={channel} onChange={setChannel} options={CHANNEL_OPTIONS} placeholder="선택 안 함" />
            </Field>
          </section>
        </Form>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>설문조사</h1>
      <Band total={created.length}>
        <button onClick={() => setMode('form')}>설문조사 등록</button>
      </Band>
      <DataTable
        columns={[
          { key: 'surveyId', label: '설문조사 ID' },
          { key: 'title', label: '설문 제목' },
          { key: 'startDate', label: '설문 시작일', render: (row) => <DateText value={row.startDate} /> },
          { key: 'endDate', label: '설문 종료일', render: (row) => <DateText value={row.endDate} /> },
          { key: 'status', label: '진행상태', render: (row) => <Badge value={row.status} /> },
        ]}
        rows={created}
        empty="아직 등록한 설문조사가 없습니다. 설문조사 등록 버튼을 눌러 시작해 주세요."
      />
    </div>
  );
}
