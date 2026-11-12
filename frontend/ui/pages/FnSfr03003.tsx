import { useState } from 'react';
import { Badge, Band, DataTable, Drawer, Field, Form, LookupSelect, RefName, TextInput, call } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr03003Page({ role, notify }: PageProps) {
  // 조회 API가 없으므로 이 화면에서 상신한 결과를 목록으로 보인다.
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [formId, setFormId] = useState<number | string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function openDrawer() {
    setFormId('');
    setTitle('');
    setBody('');
    setOpen(true);
  }

  async function submit() {
    if (formId === '' || formId === undefined) {
      throw new Error('결재양식을 선택해 주세요.');
    }
    if (title.trim() === '') {
      throw new Error('문서 제목을 입력해 주세요.');
    }
    const payload: Row = {
      approvalFormId: formId,
      title: title.trim(),
    };
    if (body.trim() !== '') {
      payload.body = body;
    }
    const result = await call<Row>('POST', '/approval-documents', role, payload);
    setRows([{ ...result, title: title.trim(), approvalFormId: formId }, ...rows]);
    setOpen(false);
    notify('결재문서를 상신했습니다.');
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>한글웹기안기 웹기안</h2>
        <Band total={rows.length}>
          <button onClick={openDrawer}>기안 작성</button>
        </Band>
        <DataTable
          rows={rows}
          empty="아직 상신한 문서가 없습니다. 기안 작성 버튼으로 시작하세요."
          columns={[
            { key: 'documentNo', label: '문서번호' },
            { key: 'title', label: '문서 제목' },
            {
              key: 'approvalFormId',
              label: '결재양식',
              render: (row) => <RefName table="approval_form" role={role} value={row.approvalFormId} />,
            },
            {
              key: 'approvalStatus',
              label: '전자결재 처리 상태',
              render: (row) => <Badge value={row.approvalStatus} />,
            },
          ]}
        />
      </section>
      {open && (
        <Drawer title="기안 작성" onClose={() => setOpen(false)}>
          <Form
            submit="상신"
            onSubmit={submit}
            note="상신하면 결재문서가 결재대기 상태로 만들어집니다."
          >
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
      )}
    </div>
  );
}
