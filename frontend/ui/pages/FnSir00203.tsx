import { useState } from 'react';
import { call, Band, DataTable, Drawer, Field, Form, LookupSelect, RefName } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSir00203Page({ role, notify }: PageProps) {
  const [registered, setRegistered] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [approvalFormId, setApprovalFormId] = useState<number | string>('');

  const openDrawer = () => {
    setApprovalFormId('');
    setOpen(true);
  };

  const submit = async () => {
    if (approvalFormId === '') {
      throw new Error('결재양식을 선택해 주세요.');
    }
    const result = await call('POST', '/approval-linked-forms', role, { approvalFormId });
    setRegistered([result, ...registered]);
    setOpen(false);
    notify('연동결재 대상 양식을 등록했습니다.');
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>연동결재 대상 양식</h2>
        <Band total={registered.length}>
          <button onClick={openDrawer}>연동결재 양식 등록</button>
        </Band>
        <DataTable
          columns={[
            { key: 'approvalLinkedFormId', label: '연동결재 대상 양식 ID' },
            {
              key: 'approvalFormId',
              label: '결재양식',
              render: (row) => <RefName table="approval_form" role={role} value={row['approvalFormId']} />,
            },
          ]}
          rows={registered}
          empty="아직 등록한 내역이 없습니다. 연동결재 양식 등록 버튼으로 시작해 주세요."
        />
      </section>
      {open && (
        <Drawer title="연동결재 양식 등록" onClose={() => setOpen(false)}>
          <Form onSubmit={submit} submit="등록">
            <Field label="결재양식 ID" required wide>
              <LookupSelect
                table="approval_form"
                role={role}
                value={approvalFormId}
                onChange={setApprovalFormId}
              />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
