import { useState } from 'react';
import { Band, DataTable, Drawer, Field, Form, LookupSelect, Num, RefName, TextInput, call } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr03102Page({ role, notify }: PageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [fromEmployeeId, setFromEmployeeId] = useState<number | string>('');
  const [toEmployeeId, setToEmployeeId] = useState<number | string>('');
  const [reason, setReason] = useState('');
  const [documentScope, setDocumentScope] = useState('');

  function reset() {
    setFromEmployeeId('');
    setToEmployeeId('');
    setReason('');
    setDocumentScope('');
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function submit() {
    if (fromEmployeeId === '' || toEmployeeId === '') {
      throw new Error('인계자와 인수자를 선택해 주세요.');
    }
    if (fromEmployeeId === toEmployeeId) {
      throw new Error('인계자와 인수자는 서로 달라야 합니다.');
    }
    if (reason.trim() === '') {
      throw new Error('인수인계 사유를 입력해 주세요.');
    }
    if (documentScope.trim() === '') {
      throw new Error('문서 범위를 입력해 주세요.');
    }
    const result = await call<Row>('POST', '/approval-handovers', role, {
      fromEmployeeId,
      toEmployeeId,
      reason,
      documentScope,
    });
    setRows([{ fromEmployeeId, toEmployeeId, reason, ...result }, ...rows]);
    notify('인수인계를 했습니다.');
    close();
  }

  return (
    <div>
      <h1>전자결재 문서 인수인계</h1>
      <p>입·퇴사나 부서 통폐합으로 담당자가 바뀔 때 전자결재 문서를 인수자에게 넘깁니다.</p>
      <Band total={rows.length}>
        <button onClick={() => setOpen(true)}>인수인계</button>
      </Band>
      <DataTable
        rows={rows}
        empty="아직 처리한 인수인계가 없습니다. 인수인계 버튼을 눌러 시작해 주세요."
        columns={[
          { key: 'approvalHandoverId', label: '결재문서 인수인계 ID' },
          {
            key: 'fromEmployeeId',
            label: '인계자',
            render: (row) => <RefName table="employee" role={role} value={row.fromEmployeeId} />,
          },
          {
            key: 'toEmployeeId',
            label: '인수자',
            render: (row) => <RefName table="employee" role={role} value={row.toEmployeeId} />,
          },
          { key: 'reason', label: '인수인계 사유' },
          {
            key: 'handedOverCount',
            label: '이관된 문서 건수',
            render: (row) => <Num value={row.handedOverCount} />,
          },
        ]}
      />
      {open && (
        <Drawer title="전자결재 문서 인수인계" onClose={close}>
          <Form
            onSubmit={submit}
            submit="인수인계"
            note="인수인계하면 인계자의 문서가 인수자에게 넘어가고 변경 이력이 남습니다. 결재가 확정된 문서는 넘기지 않습니다."
          >
            <Field label="인계자 ID" required>
              <LookupSelect table="employee" role={role} value={fromEmployeeId} onChange={setFromEmployeeId} />
            </Field>
            <Field label="인수자 ID" required>
              <LookupSelect table="employee" role={role} value={toEmployeeId} onChange={setToEmployeeId} />
            </Field>
            <Field label="인수인계 사유" required wide>
              <TextInput value={reason} onChange={setReason} placeholder="예: 퇴사, 부서 통폐합" />
            </Field>
            <Field label="문서 범위" required wide>
              <TextInput value={documentScope} onChange={setDocumentScope} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
