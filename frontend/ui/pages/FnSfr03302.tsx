import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Form,
  LookupSelect,
  RefName,
  Select,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

const REPEAT_OPTIONS: [string, string][] = [
  ['NONE', '반복 없음'],
  ['DAILY', '매일'],
  ['WEEKLY', '매주'],
  ['MONTHLY', '매월'],
];

export default function FnSfr03302Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [resourceId, setResourceId] = useState<number | string>('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [repeatType, setRepeatType] = useState('NONE');
  const [repeatUntil, setRepeatUntil] = useState('');
  const [userId, setUserId] = useState<number | string>('');
  const [content, setContent] = useState('');
  const [attachmentText, setAttachmentText] = useState('');

  function resetForm() {
    setResourceId('');
    setStartAt('');
    setEndAt('');
    setRepeatType('NONE');
    setRepeatUntil('');
    setUserId('');
    setContent('');
    setAttachmentText('');
  }

  async function submit() {
    if (resourceId === '') {
      throw new Error('자원을 선택해 주세요.');
    }
    if (startAt.trim() === '') {
      throw new Error('시작 일시를 입력해 주세요.');
    }
    if (endAt.trim() === '') {
      throw new Error('종료 일시를 입력해 주세요.');
    }
    if (content.trim() === '') {
      throw new Error('예약 내용을 입력해 주세요.');
    }
    const attachmentIds = attachmentText
      .split(',')
      .map((text) => text.trim())
      .filter((text) => text !== '')
      .map((text) => Number(text));
    if (attachmentIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new Error('첨부파일 ID는 쉼표로 구분한 숫자로 입력해 주세요.');
    }
    const body: Row = {
      resourceId,
      startAt: startAt.trim(),
      endAt: endAt.trim(),
      repeatType,
      content,
    };
    if (repeatUntil !== '') {
      body.repeatUntil = repeatUntil;
    }
    if (userId !== '') {
      body.userId = userId;
    }
    if (attachmentIds.length > 0) {
      body.attachmentIds = attachmentIds;
    }
    const created = await call('POST', '/resource-reservations', role, body);
    setResults([
      { ...created, resourceId, startAt: startAt.trim(), endAt: endAt.trim() },
      ...results,
    ]);
    notify('자원 예약을 등록했습니다.');
    resetForm();
    setOpen(false);
  }

  return (
    <div>
      <h1>자원 예약</h1>
      <Band total={results.length}>
        <button onClick={() => setOpen(true)}>예약 등록</button>
      </Band>
      <DataTable
        rows={results}
        empty='아직 등록한 예약이 없습니다. 예약 등록 버튼을 눌러 시작해 주세요.'
        columns={[
          { key: 'resourceReservationId', label: '자원 예약 ID' },
          {
            key: 'resourceId',
            label: '자원',
            render: (row) => <RefName table='resource' role={role} value={row.resourceId} />,
          },
          {
            key: 'startAt',
            label: '시작 일시',
            render: (row) => <DateText value={row.startAt} time />,
          },
          {
            key: 'endAt',
            label: '종료 일시',
            render: (row) => <DateText value={row.endAt} time />,
          },
          {
            key: 'status',
            label: '예약 상태',
            render: (row) => <Badge value={row.status} />,
          },
        ]}
      />
      {open && (
        <Drawer title='자원 예약 등록' onClose={() => setOpen(false)}>
          <Form onSubmit={submit} submit='등록'>
            <Field label='자원' required>
              <LookupSelect table='resource' role={role} value={resourceId} onChange={setResourceId} />
            </Field>
            <Field label='시작 일시' required hint='예: 2025-01-31T09:00'>
              <TextInput value={startAt} onChange={setStartAt} placeholder='YYYY-MM-DDTHH:mm' />
            </Field>
            <Field label='종료 일시' required hint='예: 2025-01-31T10:00'>
              <TextInput value={endAt} onChange={setEndAt} placeholder='YYYY-MM-DDTHH:mm' />
            </Field>
            <Field label='반복 유형'>
              <Select value={repeatType} onChange={setRepeatType} options={REPEAT_OPTIONS} />
            </Field>
            <Field label='반복 종료일'>
              <DateInput value={repeatUntil} onChange={setRepeatUntil} />
            </Field>
            <Field label='사용자' hint='비우면 예약자가 사용합니다.'>
              <LookupSelect table='employee' role={role} value={userId} onChange={setUserId} />
            </Field>
            <Field label='예약 내용' required wide>
              <TextInput value={content} onChange={setContent} multiline />
            </Field>
            <Field label='첨부파일 ID 목록' wide hint='쉼표로 구분해 입력합니다.'>
              <TextInput value={attachmentText} onChange={setAttachmentText} placeholder='예: 11, 12' />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
