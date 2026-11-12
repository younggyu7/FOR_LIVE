import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  Drawer,
  Field,
  Form,
  LookupSelect,
  Pairs,
  RefName,
  TextInput,
  NumberInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

interface SendResponse {
  messengerMessageId: number;
  results: Row[];
}

interface Sent extends Row {
  messengerMessageId: number;
  content: string;
  okCount: number;
  failCount: number;
  results: Row[];
}

export default function FnSfr03603Page({ role, notify }: PageProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Sent[]>([]);
  const [detail, setDetail] = useState<Sent | null>(null);
  const [employeeIds, setEmployeeIds] = useState<(number | string)[]>([]);
  const [departmentIds, setDepartmentIds] = useState<(number | string)[]>([]);
  const [pickEmployee, setPickEmployee] = useState<number | string>('');
  const [pickDepartment, setPickDepartment] = useState<number | string>('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<Row[]>([]);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | string>('');
  const [ecmRef, setEcmRef] = useState('');

  function reset() {
    setEmployeeIds([]);
    setDepartmentIds([]);
    setPickEmployee('');
    setPickDepartment('');
    setContent('');
    setFiles([]);
    setFileName('');
    setFileSize('');
    setEcmRef('');
  }

  function addEmployee() {
    if (pickEmployee === '' || employeeIds.includes(pickEmployee)) {
      return;
    }
    setEmployeeIds([...employeeIds, pickEmployee]);
    setPickEmployee('');
  }

  function addDepartment() {
    if (pickDepartment === '' || departmentIds.includes(pickDepartment)) {
      return;
    }
    setDepartmentIds([...departmentIds, pickDepartment]);
    setPickDepartment('');
  }

  function addFile() {
    if (fileName.trim() === '') {
      return;
    }
    const dot = fileName.lastIndexOf('.');
    setFiles([
      ...files,
      {
        fileName: fileName.trim(),
        fileExtension: dot >= 0 ? fileName.slice(dot + 1) : '',
        fileSize,
        ecmRef,
      },
    ]);
    setFileName('');
    setFileSize('');
    setEcmRef('');
  }

  async function send() {
    if (employeeIds.length === 0 && departmentIds.length === 0) {
      throw new Error('수신 대상을 한 명 이상 선택해 주세요.');
    }
    if (content.trim() === '') {
      throw new Error('쪽지 내용을 입력해 주세요.');
    }
    const res = await call<SendResponse>('POST', '/messenger-messages/send-notes', role, {
      employeeIds,
      departmentIds,
      content,
      files,
    });
    const results = res.results;
    const sent: Sent = {
      messengerMessageId: res.messengerMessageId,
      content,
      okCount: results.filter((r) => r.status === '성공').length,
      failCount: results.filter((r) => r.status === '실패').length,
      results,
    };
    setHistory([sent, ...history]);
    setDetail(sent);
    setOpen(false);
    reset();
    notify('쪽지를 전송했습니다.');
  }

  if (detail) {
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setDetail(null)}>목록으로</button>
        <section className='box'>
          <h2>전송한 쪽지</h2>
          <Pairs
            items={[
              ['메신저 메시지 ID', String(detail.messengerMessageId)],
              ['메시지 내용', detail.content],
              ['전송 성공', String(detail.okCount) + '명'],
              ['전송 실패', String(detail.failCount) + '명'],
            ]}
          />
        </section>
        <section className='box'>
          <h2>수신자별 전송 결과</h2>
          <DataTable
            columns={[
              {
                key: 'recipientId',
                label: '수신자',
                render: (r) => <RefName table='employee' role={role} value={r.recipientId} />,
              },
              { key: 'status', label: '결과', render: (r) => <Badge value={r.status} /> },
              { key: 'reason', label: '실패 사유', render: (r) => <span>{String(r.reason ?? '')}</span> },
            ]}
            rows={detail.results}
            empty='수신자별 결과가 없습니다.'
          />
        </section>
      </div>
    );
  }

  return (
    <div className='doc'>
      <section className='box'>
        <h2>쪽지·파일 일괄 전송</h2>
        <Band total={history.length}>
          <button onClick={() => setOpen(true)}>쪽지 쓰기</button>
        </Band>
        <DataTable<Sent>
          columns={[
            { key: 'messengerMessageId', label: '메신저 메시지 ID' },
            { key: 'content', label: '메시지 내용' },
            { key: 'okCount', label: '전송 성공' },
            { key: 'failCount', label: '전송 실패' },
          ]}
          rows={history}
          onRowClick={(row) => setDetail(row)}
          empty='아직 전송한 쪽지가 없습니다. 쪽지 쓰기 버튼으로 시작하세요.'
        />
      </section>
      {open && (
        <Drawer title='쪽지 쓰기' onClose={() => setOpen(false)}>
          <Form
            onSubmit={send}
            submit='전송'
            note='선택한 수신자 전원에게 쪽지가 전송되며 되돌릴 수 없습니다. 부서를 선택하면 소속 재직 임직원 전원이 수신합니다.'
          >
            <Field label='수신 임직원 ID 목록' wide>
              <LookupSelect table='employee' role={role} value={pickEmployee} onChange={setPickEmployee} placeholder='임직원 선택' />
              <button type='button' className='ghost' onClick={addEmployee}>임직원 추가</button>
              {employeeIds.map((id) => (
                <div key={String(id)}>
                  <RefName table='employee' role={role} value={id} />
                  <button type='button' className='ghost' onClick={() => setEmployeeIds(employeeIds.filter((x) => x !== id))}>삭제</button>
                </div>
              ))}
            </Field>
            <Field label='수신 부서 ID 목록 (소속 임직원 전원 수신)' wide>
              <LookupSelect table='department' role={role} value={pickDepartment} onChange={setPickDepartment} placeholder='부서 선택' />
              <button type='button' className='ghost' onClick={addDepartment}>부서 추가</button>
              {departmentIds.map((id) => (
                <div key={String(id)}>
                  <RefName table='department' role={role} value={id} />
                  <button type='button' className='ghost' onClick={() => setDepartmentIds(departmentIds.filter((x) => x !== id))}>삭제</button>
                </div>
              ))}
            </Field>
            <Field label='메시지 내용' required wide>
              <TextInput value={content} onChange={setContent} multiline />
            </Field>
            <Field label='첨부 파일 목록' wide hint='파일명과 ECM 참조를 입력한 뒤 파일 추가를 누릅니다.'>
              <TextInput value={fileName} onChange={setFileName} placeholder='파일명 (예: 안내문.docx)' />
              <NumberInput value={fileSize} onChange={setFileSize} />
              <TextInput value={ecmRef} onChange={setEcmRef} placeholder='ECM 참조' />
              <button type='button' className='ghost' onClick={addFile}>파일 추가</button>
              {files.map((f, i) => (
                <div key={i}>
                  <span>{String(f.fileName)}</span>
                  <button type='button' className='ghost' onClick={() => setFiles(files.filter((_, j) => j !== i))}>삭제</button>
                </div>
              ))}
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
