import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  Drawer,
  Field,
  Form,
  LookupSelect,
  RefName,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr02907Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [documentId, setDocumentId] = useState<number | string>('');
  const [changeContent, setChangeContent] = useState('');
  const [changeReason, setChangeReason] = useState('');

  const openDrawer = () => {
    setDocumentId('');
    setChangeContent('');
    setChangeReason('');
    setOpen(true);
  };

  const submit = async () => {
    if (documentId === '' || documentId === null) {
      throw new Error('결재 문서를 선택해 주세요.');
    }
    if (changeContent.trim() === '') {
      throw new Error('변경 내용을 입력해 주세요.');
    }
    const body: Row = { changeContent };
    if (changeReason !== '') {
      body.changeReason = changeReason;
    }
    const res = await call(
      'POST',
      `/approval-documents/${documentId}/designate-security`,
      role,
      body,
    );
    setResults((prev) => [
      { ...res, changeContent, changeReason },
      ...prev,
    ]);
    setOpen(false);
    notify('보안문서로 지정했습니다.');
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>보안문서 지정</h2>
        <Band total={results.length}>
          <button onClick={openDrawer}>보안문서 지정</button>
        </Band>
        <DataTable
          columns={[
            {
              key: 'approvalDocumentId',
              label: '전자결재 문서',
              render: (row) => (
                <RefName
                  table="approval_document"
                  role={role}
                  value={row.approvalDocumentId}
                />
              ),
            },
            {
              key: 'securityDesignated',
              label: '보안문서 지정 반영 여부',
              render: (row) => (
                <Badge value={row.securityDesignated ? '완료' : '실패'} />
              ),
            },
            { key: 'changeContent', label: '변경 내용' },
            { key: 'changeReason', label: '변경 사유' },
          ]}
          rows={results}
          empty="아직 지정한 문서가 없습니다. 결재가 완료된 문서를 보안문서로 지정해 보세요."
        />
      </section>
      {open && (
        <Drawer title="보안문서 지정" onClose={() => setOpen(false)}>
          <Form
            onSubmit={submit}
            submit="지정"
            note="결재가 완료된 문서만 지정할 수 있으며, 지정하면 변경 이력이 남습니다."
          >
            <Field label="전자결재 문서 ID" required wide>
              <LookupSelect
                table="approval_document"
                role={role}
                value={documentId}
                onChange={setDocumentId}
              />
            </Field>
            <Field label="변경 내용" required wide>
              <TextInput
                value={changeContent}
                onChange={setChangeContent}
                multiline
              />
            </Field>
            <Field label="변경 사유" wide hint="500자 이하">
              <TextInput
                value={changeReason}
                onChange={setChangeReason}
                multiline
              />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
