import { useState } from 'react';
import { Badge, Band, DataTable, Drawer, Field, Form, Select, TextInput, call } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr03002Page({ role, notify }: PageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'upload' | 'edit'>('upload');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [formName, setFormName] = useState('');
  const [formBody, setFormBody] = useState('');
  const [useStatus, setUseStatus] = useState('사용');

  function openDrawer() {
    setStage('upload');
    setFileName('');
    setFileContent('');
    setFormName('');
    setFormBody('');
    setUseStatus('사용');
    setOpen(true);
  }

  async function pickFile(file: File | undefined) {
    if (!file) {
      setFileName('');
      setFileContent('');
      return;
    }
    setFileName(file.name);
    setFileContent(await file.text());
  }

  async function convert() {
    if (fileName === '') {
      throw new Error('변환할 파일을 선택해 주세요.');
    }
    const res = await call<Row>('POST', '/approval-forms/convert', role, {
      file: { name: fileName, content: fileContent },
    });
    setFormBody(String(res.formBody ?? ''));
    setStage('edit');
  }

  async function save() {
    if (formName.trim() === '') {
      throw new Error('결재양식명을 입력해 주세요.');
    }
    const res = await call<Row>('POST', '/approval-forms', role, {
      formName: formName.trim(),
      formBody,
      useStatus,
    });
    setRows([res, ...rows]);
    setOpen(false);
    notify('결재양식을 등록했습니다.');
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>결재양식 변환·등록</h2>
        <Band total={rows.length}>
          <button onClick={openDrawer}>문서 파일로 양식 만들기</button>
        </Band>
        <DataTable
          columns={[
            { key: 'approvalFormId', label: '결재양식 ID' },
            { key: 'formName', label: '결재양식명' },
            { key: 'useStatus', label: '사용 여부', render: (r) => <Badge value={r.useStatus} /> },
          ]}
          rows={rows}
          empty="아직 등록한 양식이 없습니다. 문서 파일로 양식 만들기를 눌러 시작하세요."
        />
      </section>
      {open && stage === 'upload' && (
        <Drawer title="기존 문서 파일 변환" onClose={() => setOpen(false)}>
          <Form onSubmit={convert} submit="HTML 양식으로 변환">
            <Field label="변환할 기존 문서 파일" required wide hint="HWP·Word 등 제공 대상 형식">
              <input type="file" onChange={(e) => pickFile(e.target.files?.[0])} />
            </Field>
          </Form>
        </Drawer>
      )}
      {open && stage === 'edit' && (
        <Drawer title="변환된 양식 편집·저장" onClose={() => setOpen(false)}>
          <Form onSubmit={save} submit="저장">
            <Field label="결재양식명" required wide>
              <TextInput value={formName} onChange={setFormName} />
            </Field>
            <Field label="양식 본문(HTML)" wide>
              <TextInput value={formBody} onChange={setFormBody} multiline />
            </Field>
            <Field label="사용 여부">
              <Select
                value={useStatus}
                onChange={setUseStatus}
                options={[['사용', '사용'], ['미사용', '미사용']]}
              />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
