import { useState } from 'react';
import { call, Badge, Band, DataTable, DateText, Drawer, Field, Form, LookupSelect, RefName, TextInput } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr03001Page({ role, notify }: PageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [mode, setMode] = useState<'' | 'create' | 'submit'>('');
  const [target, setTarget] = useState<Row | null>(null);
  const [formId, setFormId] = useState<number | string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pick, setPick] = useState<number | string>('');
  const [approverIds, setApproverIds] = useState<number[]>([]);

  const close = () => {
    setMode('');
    setTarget(null);
  };

  const openCreate = () => {
    setFormId('');
    setTitle('');
    setBody('');
    setMode('create');
  };

  const openSubmit = (row: Row) => {
    setTarget(row);
    setPick('');
    setApproverIds([]);
    setMode('submit');
  };

  const addApprover = () => {
    const n = Number(pick);
    if (pick === '' || !Number.isInteger(n)) return;
    if (approverIds.includes(n)) return;
    setApproverIds([...approverIds, n]);
    setPick('');
  };

  const create = async () => {
    if (formId === '') throw new Error('결재양식을 선택해 주세요.');
    if (title.trim() === '') throw new Error('제목을 입력해 주세요.');
    if (body.trim() === '') throw new Error('본문을 입력해 주세요.');
    const res = await call('POST', '/approval-documents', role, { approvalFormId: formId, title, body });
    setRows([{ ...res, title, body, approvalFormId: formId }, ...rows]);
    notify('문서를 기안했습니다.');
    close();
  };

  const submit = async () => {
    if (!target) return;
    if (approverIds.length === 0) throw new Error('결재선을 지정해 주세요.');
    const res = await call('POST', `/approval-documents/${target['approvalDocumentId']}/submit`, role, { approverIds });
    setRows(rows.map((r) => (r['approvalDocumentId'] === target['approvalDocumentId'] ? { ...r, ...res } : r)));
    notify('결재를 상신했습니다.');
    close();
  };

  return (
    <div className='doc'>
      <h1>웹 기안기 결재 상신</h1>
      <Band total={rows.length}>
        <button onClick={openCreate}>새 문서 기안</button>
      </Band>
      <DataTable
        rows={rows}
        empty='아직 기안한 문서가 없습니다. 새 문서 기안 버튼으로 시작해 주세요.'
        columns={[
          { key: 'documentNo', label: '문서번호' },
          { key: 'title', label: '문서 제목' },
          { key: 'approvalStatus', label: '전자결재 처리 상태', render: (r) => <Badge value={r['approvalStatus']} /> },
          { key: 'submittedAt', label: '상신 일시', render: (r) => <DateText value={r['submittedAt']} time /> },
          {
            key: 'action',
            label: '처리',
            render: (r) =>
              r['approvalStatus'] === '기안' ? (
                <button className='ghost' onClick={() => openSubmit(r)}>상신</button>
              ) : null,
          },
        ]}
      />
      {mode === 'create' && (
        <Drawer title='새 문서 기안' onClose={close}>
          <Form onSubmit={create} submit='기안 저장'>
            <Field label='결재양식' required>
              <LookupSelect table='approval_form' role={role} value={formId} onChange={setFormId} />
            </Field>
            <Field label='문서 제목' required wide>
              <TextInput value={title} onChange={setTitle} />
            </Field>
            <Field label='문서 본문' required wide>
              <TextInput value={body} onChange={setBody} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
      {mode === 'submit' && target && (
        <Drawer title='결재 상신' onClose={close}>
          <Form
            onSubmit={submit}
            submit='상신'
            note={<p>상신하면 문서가 결재대기 상태로 바뀌며 기안 상태로 되돌릴 수 없습니다.</p>}
          >
            <Field label='문서 제목' wide>
              <span>{String(target['title'] ?? '')}</span>
            </Field>
            <Field label='결재선 결재자 ID 목록' required wide hint='결재자를 고른 뒤 추가 버튼을 누르세요.'>
              <LookupSelect table='employee' role={role} value={pick} onChange={setPick} />
              <button type='button' className='ghost' onClick={addApprover}>추가</button>
            </Field>
            <ol>
              {approverIds.map((id) => (
                <li key={id}>
                  <RefName table='employee' role={role} value={id} />
                  <button type='button' className='ghost' onClick={() => setApproverIds(approverIds.filter((x) => x !== id))}>삭제</button>
                </li>
              ))}
            </ol>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
