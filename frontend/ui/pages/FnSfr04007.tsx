import { useState } from 'react';
import {
  Band,
  DataTable,
  DateText,
  Badge,
  Drawer,
  Field,
  Form,
  LookupSelect,
  RefName,
  Select,
  TextInput,
} from '../kit';
import type { PageProps, Row } from '../kit';
import { call } from '../kit';

export default function FnSfr04007Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [documentId, setDocumentId] = useState<number | string>('');
  const [action, setAction] = useState('approve');
  const [opinion, setOpinion] = useState('');

  function openDrawer() {
    setDocumentId('');
    setAction('approve');
    setOpinion('');
    setOpen(true);
  }

  async function submit() {
    if (documentId === '' || documentId === undefined) {
      throw new Error('결재문서를 선택해 주세요.');
    }
    const approve = action === 'approve';
    const path = `/approval-documents/${documentId}/${approve ? 'approve' : 'reject'}`;
    const res = await call<Row>('POST', path, role, opinion ? { opinion } : {});
    const row: Row = {
      id: `${documentId}-${results.length}`,
      approvalDocumentId: documentId,
      action: approve ? '승인' : '반려',
      opinion,
      approvalStatus: res.approvalStatus,
      processedAt: new Date().toISOString(),
    };
    setResults([row, ...results]);
    notify(approve ? '승인했습니다.' : '반려했습니다.');
    setOpen(false);
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>모바일 결재문서 승인·반려</h2>
        <Band total={results.length}>
          <button onClick={openDrawer}>결재 처리</button>
        </Band>
        <DataTable
          columns={[
            {
              key: 'approvalDocumentId',
              label: '결재문서',
              render: (r) => (
                <RefName table="approval_document" role={role} value={r.approvalDocumentId} />
              ),
            },
            { key: 'action', label: '처리' },
            { key: 'opinion', label: '의견' },
            {
              key: 'approvalStatus',
              label: '전자결재 처리 상태',
              render: (r) => <Badge value={r.approvalStatus} />,
            },
            {
              key: 'processedAt',
              label: '처리 일시',
              render: (r) => <DateText value={r.processedAt} time />,
            },
          ]}
          rows={results}
          empty="아직 처리한 결재문서가 없습니다. 결재 처리 버튼을 눌러 시작하세요."
        />
      </section>
      {open && (
        <Drawer title="결재문서 승인·반려" onClose={() => setOpen(false)}>
          <Form
            onSubmit={submit}
            submit={action === 'approve' ? '승인' : '반려'}
            danger={action === 'reject'}
            note={
              action === 'reject'
                ? '반려하면 문서 상태가 반려로 바뀌고 기안자에게 알림이 갑니다.'
                : '승인하면 다음 결재자에게 넘어가며, 마지막 결재자이면 완료 처리됩니다.'
            }
          >
            <Field label="결재문서" required wide>
              <LookupSelect
                table="approval_document"
                role={role}
                value={documentId}
                onChange={setDocumentId}
                placeholder="결재문서 선택"
              />
            </Field>
            <Field label="처리" required>
              <Select
                value={action}
                onChange={setAction}
                options={[
                  ['approve', '승인'],
                  ['reject', '반려'],
                ]}
              />
            </Field>
            <Field label={action === 'approve' ? '승인 의견' : '반려 의견'} wide>
              <TextInput value={opinion} onChange={setOpinion} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
