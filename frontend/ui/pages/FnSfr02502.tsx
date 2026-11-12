import { useState } from 'react';
import {
  call,
  useData,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  DateInput,
  DateText,
  LookupSelect,
  RefName,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const SIZE = 20;

export default function FnSfr02502Page({ role, notify }: PageProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [assetId, setAssetId] = useState<number | string>('');
  const [changeType, setChangeType] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [creating, setCreating] = useState(false);

  const [fAsset, setFAsset] = useState<number | string>('');
  const [fType, setFType] = useState('');
  const [fDate, setFDate] = useState('');
  const [fContent, setFContent] = useState('');

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/asset-changes', role, undefined, { ...applied, page: pageNo, size: SIZE }),
    [applied, pageNo],
  );

  function search() {
    setPageNo(0);
    setApplied({ changeDateFrom: from, changeDateTo: to, assetId, changeType });
  }

  function reset() {
    setFrom('');
    setTo('');
    setAssetId('');
    setChangeType('');
    setPageNo(0);
    setApplied({});
  }

  function openCreate() {
    setFAsset('');
    setFType('');
    setFDate('');
    setFContent('');
    setCreating(true);
  }

  async function submit() {
    if (fAsset === '' || fType.trim() === '' || fDate === '' || fContent.trim() === '') {
      throw new Error('자산, 변동 유형, 변동 일자, 변동 내용을 모두 입력해 주세요.');
    }
    await call('POST', '/asset-changes', role, {
      assetId: fAsset,
      changeType: fType.trim(),
      changeDate: fDate,
      changeContent: fContent.trim(),
    });
    notify('자산 변동을 등록했습니다.');
    setCreating(false);
    reload();
  }

  return (
    <div>
      <h1>자산 변동현황</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="조회 시작일">
          <DateInput value={from} onChange={setFrom} />
        </Field>
        <Field label="조회 종료일">
          <DateInput value={to} onChange={setTo} />
        </Field>
        <Field label="자산">
          <LookupSelect table="asset" role={role} value={assetId} onChange={setAssetId} />
        </Field>
        <Field label="변동 유형">
          <TextInput value={changeType} onChange={setChangeType} />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>변동 등록</button>
      </Band>
      {error ? <p>{error}</p> : null}
      <DataTable
        rows={data?.items ?? []}
        empty="아직 등록한 변동 내역이 없습니다. 변동 등록 버튼으로 첫 내역을 남겨 보세요."
        columns={[
          { key: 'changeDate', label: '변동 일자', render: (r) => <DateText value={r.changeDate} /> },
          { key: 'assetId', label: '자산', render: (r) => <RefName table="asset" role={role} value={r.assetId} /> },
          { key: 'changeType', label: '변동 유형' },
          { key: 'changeContent', label: '변동 내용' },
          { key: 'changedById', label: '변경자', render: (r) => <RefName table="employee" role={role} value={r.changedById} /> },
        ]}
      />
      <Pager page={pageNo} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      {creating ? (
        <Drawer title="자산 변동 등록" onClose={() => setCreating(false)}>
          <Form onSubmit={submit} submit="등록">
            <Field label="자산" required>
              <LookupSelect table="asset" role={role} value={fAsset} onChange={setFAsset} />
            </Field>
            <Field label="변동 유형" required>
              <TextInput value={fType} onChange={setFType} />
            </Field>
            <Field label="변동 일자" required>
              <DateInput value={fDate} onChange={setFDate} />
            </Field>
            <Field label="변동 내용" required wide>
              <TextInput value={fContent} onChange={setFContent} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
