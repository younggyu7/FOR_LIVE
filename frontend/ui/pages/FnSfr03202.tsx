import { useState } from 'react';
import { Badge, Band, DataTable, DateText, Drawer, Field, Filters, Form, LookupSelect, NumberInput, Pager, Pairs, Select, TextInput, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

export default function FnSfr03202Page({ role, notify }: PageProps) {
  const [status, setStatus] = useState('');
  const [typeId, setTypeId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row>({ status: '', certificateTypeId: '' });
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const [newTypeId, setNewTypeId] = useState<number | string>('');
  const [purpose, setPurpose] = useState('');
  const [copies, setCopies] = useState<number | string>(1);

  const list = useData<Page>(
    () => call<Page>('GET', '/certificate-requests', role, undefined, { ...applied, page, size: SIZE }),
    [role, applied, page],
  );

  const search = () => {
    setPage(0);
    setApplied({ status, certificateTypeId: typeId });
  };

  const reset = () => {
    setStatus('');
    setTypeId('');
    setPage(0);
    setApplied({ status: '', certificateTypeId: '' });
  };

  const openCreate = () => {
    setNewTypeId('');
    setPurpose('');
    setCopies(1);
    setCreating(true);
  };

  const submit = async () => {
    if (newTypeId === '') {
      throw new Error('증명서 종류를 선택해 주세요.');
    }
    if (purpose.trim() === '') {
      throw new Error('용도를 입력해 주세요.');
    }
    if (copies === '' || Number(copies) < 1 || !Number.isInteger(Number(copies))) {
      throw new Error('부수는 1 이상의 정수로 입력해 주세요.');
    }
    const result = await call('POST', '/certificate-requests', role, {
      certificateTypeId: newTypeId,
      purpose: purpose.trim(),
      copies: Number(copies),
    });
    setCreating(false);
    notify(result.status === '승인' ? '증명서가 발급되었습니다.' : '증명서를 신청했습니다.');
    list.reload();
  };

  if (detail) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setDetail(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>신청 내용</h2>
          <Pairs
            items={[
              ['발급번호', String(detail.issueNumber ?? '아직 발급되지 않았습니다.')],
              ['증명서 종류명', String(detail.certificateTypeName ?? '')],
              ['임직원명', String(detail.employeeName ?? '')],
              ['생성 일시', <DateText value={detail.createdAt} time />],
              ['처리 상태', <Badge value={detail.status} />],
              ['발급일', <DateText value={detail.issuedDate} />],
            ]}
          />
        </section>
      </div>
    );
  }

  const rows = list.data?.items ?? [];

  return (
    <div>
      <h1>증명서 신청 및 발급</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="증명서 종류 ID">
          <LookupSelect table="certificate_type" role={role} value={typeId} onChange={setTypeId} placeholder="전체" />
        </Field>
        <Field label="처리 상태">
          <Select
            value={status}
            onChange={setStatus}
            placeholder="전체"
            options={[['신청', '신청'], ['승인', '승인'], ['반려', '반려']]}
          />
        </Field>
      </Filters>
      <Band total={list.data?.total}>
        <button onClick={openCreate}>증명서 신청</button>
      </Band>
      {list.error ? <p>{list.error}</p> : null}
      <DataTable
        rows={rows}
        onRowClick={(row) => setDetail(row)}
        empty="아직 신청한 내역이 없습니다. 증명서 신청 버튼으로 첫 신청을 해 보세요."
        columns={[
          { key: 'issueNumber', label: '발급번호' },
          { key: 'certificateTypeName', label: '증명서 종류명' },
          { key: 'employeeName', label: '임직원명' },
          { key: 'status', label: '처리 상태', render: (row) => <Badge value={row.status} /> },
          { key: 'issuedDate', label: '발급일', render: (row) => <DateText value={row.issuedDate} /> },
        ]}
      />
      <Pager page={page} size={SIZE} total={list.data?.total ?? 0} onPage={setPage} />
      {creating ? (
        <Drawer title="증명서 신청" onClose={() => setCreating(false)}>
          <Form
            onSubmit={submit}
            submit="신청"
            note="증명서는 본인에 대해서만 신청할 수 있습니다. 승인이 필요한 증명서는 결재 후 발급됩니다."
          >
            <Field label="증명서 종류 ID" required>
              <LookupSelect table="certificate_type" role={role} value={newTypeId} onChange={setNewTypeId} />
            </Field>
            <Field label="용도" required wide>
              <TextInput value={purpose} onChange={setPurpose} />
            </Field>
            <Field label="부수" required>
              <NumberInput value={copies} onChange={setCopies} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
