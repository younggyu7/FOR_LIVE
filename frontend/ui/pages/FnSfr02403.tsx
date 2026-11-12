import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  Drawer,
  Field,
  Filters,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  Pager,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

const emptyForm = (): Row => ({
  requisitionId: '',
  itemName: '',
  quantity: '',
  amount: '',
  assetCategory: '',
  inspectionRequired: 'false',
});

export default function FnSfr02403Page({ role, notify }: PageProps) {
  const [draftRequisition, setDraftRequisition] = useState<number | string>('');
  const [requisitionId, setRequisitionId] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<'' | 'create' | 'edit'>('');
  const [editId, setEditId] = useState<unknown>(undefined);
  const [form, setForm] = useState<Row>(emptyForm());

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/purchase-asset-items', role, undefined, { requisitionId, page, size: SIZE }),
    [requisitionId, page, role],
  );

  const set = (key: string, value: unknown) => setForm({ ...form, [key]: value });

  const openCreate = () => {
    setForm({ ...emptyForm(), requisitionId });
    setEditId(undefined);
    setMode('create');
  };

  const openEdit = (row: Row) => {
    setForm({
      itemName: row['itemName'],
      quantity: row['quantity'],
      amount: row['amount'],
      assetCategory: '',
      inspectionRequired: row['inspectionRequired'] ? 'true' : 'false',
    });
    setEditId(row['purchaseAssetItemId']);
    setMode('edit');
  };

  const missing = (keys: [string, string][]) => {
    const names = keys.filter(([key]) => form[key] === '' || form[key] === undefined || form[key] === null).map(([, label]) => label);
    if (names.length > 0) {
      throw new Error('다음 항목을 입력해 주세요: ' + names.join(', '));
    }
  };

  const submitCreate = async () => {
    missing([
      ['requisitionId', '품의서'],
      ['itemName', '자산품목명'],
      ['quantity', '수량'],
      ['amount', '금액'],
    ]);
    await call('POST', '/purchase-asset-items', role, {
      requisitionId: form['requisitionId'],
      itemName: form['itemName'],
      quantity: form['quantity'],
      amount: form['amount'],
      assetCategory: form['assetCategory'] === '' ? undefined : form['assetCategory'],
      inspectionRequired: form['inspectionRequired'] === 'true',
    });
    notify('자산품목을 등록했습니다.');
    setMode('');
    reload();
  };

  const submitEdit = async () => {
    missing([
      ['itemName', '자산품목명'],
      ['quantity', '수량'],
      ['amount', '금액'],
    ]);
    await call('PATCH', '/purchase-asset-items/' + String(editId), role, {
      itemName: form['itemName'],
      quantity: form['quantity'],
      amount: form['amount'],
      assetCategory: form['assetCategory'] === '' ? undefined : form['assetCategory'],
      inspectionRequired: form['inspectionRequired'] === 'true',
    });
    notify('자산품목을 수정했습니다.');
    setMode('');
    reload();
  };

  const fields = (withRequisition: boolean) => (
    <>
      {withRequisition && (
        <Field label="품의서" required>
          <LookupSelect table="requisition" role={role} value={form['requisitionId']} onChange={(v) => set('requisitionId', v)} />
        </Field>
      )}
      <Field label="자산품목명" required>
        <TextInput value={form['itemName']} onChange={(v) => set('itemName', v)} />
      </Field>
      <Field label="수량" required>
        <NumberInput value={form['quantity']} onChange={(v) => set('quantity', v)} />
      </Field>
      <Field label="금액" required>
        <NumberInput value={form['amount']} onChange={(v) => set('amount', v)} />
      </Field>
      <Field label="자산 분류">
        <TextInput value={form['assetCategory']} onChange={(v) => set('assetCategory', v)} />
      </Field>
      <Field label="검수 필요 여부" required>
        <Select
          value={form['inspectionRequired']}
          onChange={(v) => set('inspectionRequired', v)}
          options={[['true', '검수 필요'], ['false', '검수 불필요']]}
        />
      </Field>
    </>
  );

  const inspectionText = (row: Row) => {
    if (!row['inspectionRequired']) {
      return '검수 불필요';
    }
    return row['inspectionCompleted'] ? '검수 완료' : '검수 대기';
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>구매품의 자산품목</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setRequisitionId(draftRequisition);
          }}
          onReset={() => {
            setPage(0);
            setDraftRequisition('');
            setRequisitionId('');
          }}
        >
          <Field label="품의서">
            <LookupSelect table="requisition" role={role} value={draftRequisition} onChange={setDraftRequisition} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openCreate}>자산품목 등록</button>
        </Band>
        {error && <p>{error}</p>}
        <DataTable
          rows={data?.items ?? []}
          empty="아직 등록한 자산품목이 없습니다. 자산품목 등록 버튼으로 첫 품목을 추가해 주세요."
          columns={[
            { key: 'itemName', label: '자산품목명' },
            { key: 'quantity', label: '수량', render: (r) => <Num value={r['quantity']} /> },
            { key: 'amount', label: '금액', render: (r) => <Num value={r['amount']} /> },
            { key: 'inspectionRequired', label: '검수', render: (r) => <Badge value={inspectionText(r)} /> },
            {
              key: 'assetLinked',
              label: '자산 등록 연계',
              render: (r) => (
                <span>
                  <Badge value={r['assetLinked'] ? '연계 완료' : '연계 전'} />{' '}
                  {!r['assetLinked'] && (
                    <button className="ghost" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>
                      수정
                    </button>
                  )}
                </span>
              ),
            },
          ]}
        />
        <Pager page={data?.page ?? 0} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {mode === 'create' && (
        <Drawer title="자산품목 등록" onClose={() => setMode('')}>
          <Form onSubmit={submitCreate} submit="등록">
            {fields(true)}
          </Form>
        </Drawer>
      )}
      {mode === 'edit' && (
        <Drawer title="자산품목 수정" onClose={() => setMode('')}>
          <Form onSubmit={submitEdit} submit="저장" note="승인된 구매품의의 자산품목은 수정할 수 없습니다. 변경하려면 승인 취소 절차를 먼저 진행해 주세요.">
            {fields(false)}
          </Form>
        </Drawer>
      )}
    </div>
  );
}
