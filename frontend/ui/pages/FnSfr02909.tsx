import { useState } from 'react';
import {
  ApiFail,
  Badge,
  Band,
  DataTable,
  Drawer,
  Field,
  Form,
  LookupSelect,
  RefName,
  TextInput,
} from '../kit';
import type { PageProps, Row } from '../kit';
import { call } from '../kit';

export default function FnSfr02909Page({ role, notify }: PageProps) {
  const [docs, setDocs] = useState<Row[]>([]);
  const [files, setFiles] = useState<Record<string, string[]>>({});
  const [mode, setMode] = useState<'create' | 'attach' | null>(null);
  const [target, setTarget] = useState<Row | null>(null);
  const [formId, setFormId] = useState<number | string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [fileName, setFileName] = useState('');

  function close() {
    setMode(null);
    setTarget(null);
  }

  function openCreate() {
    setFormId('');
    setTitle('');
    setBody('');
    setMode('create');
  }

  function openAttach(row: Row) {
    setFileName('');
    setTarget(row);
    setMode('attach');
  }

  async function submitCreate() {
    if (formId === '' || title.trim() === '') {
      throw new ApiFail(400, 'VALIDATION_FAILED', '결재양식과 문서 제목을 입력해 주세요.');
    }
    const created = await call('POST', '/approval-documents', role, {
      approvalFormId: formId,
      title,
      body,
    });
    setDocs([{ ...created, title, approvalFormId: formId }, ...docs]);
    notify('결재문서를 기안했습니다.');
    close();
  }

  async function submitAttach() {
    if (target === null) return;
    if (fileName.trim() === '') {
      throw new ApiFail(400, 'VALIDATION_FAILED', '첨부할 파일을 입력해 주세요.');
    }
    const id = String(target['approvalDocumentId']);
    const saved = await call('POST', '/attachments', role, {
      file: fileName,
      targetType: 'APPROVAL_DOCUMENT',
      targetId: target['approvalDocumentId'],
    });
    setFiles({ ...files, [id]: [...(files[id] ?? []), String(saved['fileName'])] });
    notify('첨부파일을 등록했습니다.');
    close();
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>결재문서 작성</h2>
        <Band total={docs.length}>
          <button onClick={openCreate}>결재문서 작성</button>
        </Band>
        <DataTable
          rows={docs}
          empty="아직 작성한 결재문서가 없습니다. 결재문서 작성 버튼을 눌러 기안해 보세요."
          columns={[
            { key: 'documentNo', label: '문서번호' },
            { key: 'title', label: '문서 제목' },
            {
              key: 'approvalFormId',
              label: '결재양식',
              render: (r) => <RefName table="approval_form" role={role} value={r['approvalFormId']} />,
            },
            { key: 'approvalStatus', label: '전자결재 처리 상태', render: (r) => <Badge value={r['approvalStatus']} /> },
            {
              key: 'attach',
              label: '첨부파일',
              render: (r) => (
                <span>
                  {(files[String(r['approvalDocumentId'])] ?? []).join(', ')}
                  {r['approvalStatus'] === '기안' ? (
                    <button className="ghost" onClick={() => openAttach(r)}>
                      첨부파일 등록
                    </button>
                  ) : null}
                </span>
              ),
            },
          ]}
        />
      </section>
      {mode === 'create' ? (
        <Drawer title="결재문서 작성" onClose={close}>
          <Form onSubmit={submitCreate} submit="기안 저장">
            <Field label="결재양식" required>
              <LookupSelect table="approval_form" role={role} value={formId} onChange={setFormId} />
            </Field>
            <Field label="문서 제목" required wide>
              <TextInput value={title} onChange={setTitle} />
            </Field>
            <Field label="문서 본문" wide>
              <TextInput value={body} onChange={setBody} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
      {mode === 'attach' && target !== null ? (
        <Drawer title="첨부파일 등록" onClose={close}>
          <Form onSubmit={submitAttach} submit="첨부파일 등록">
            <Field label="업로드 파일" required wide hint="첨부할 파일 이름을 입력합니다.">
              <TextInput value={fileName} onChange={setFileName} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
