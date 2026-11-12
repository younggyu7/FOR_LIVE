import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
  Filters,
  Band,
  DataTable,
  Pager,
  Pairs,
  Form,
  Field,
  TextInput,
  NumberInput,
  DateInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

function clean(o: Row): Row {
  const out: Row = {};
  for (const k of Object.keys(o)) {
    if (o[k] !== '' && o[k] !== undefined && o[k] !== null) {
      out[k] = o[k];
    }
  }
  return out;
}

export default function FnSfr02501Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [f, setF] = useState<Row>({});

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/assets', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page, role],
  );

  const set = (k: string, v: unknown) => setF({ ...f, [k]: v });
  const depreciable = f['isDepreciable'] === 'true';

  const openCreate = () => {
    setF({ isDepreciable: 'false' });
    setMode('create');
  };

  const openEdit = (row: Row) => {
    setF({
      assetName: row['assetName'],
      isDepreciable: row['isDepreciable'] ? 'true' : 'false',
    });
    setMode('edit');
  };

  const checkDepreciation = () => {
    if (depreciable) {
      if (!f['depreciationMethod']) {
        throw new Error('상각 자산은 상각 방법을 입력해야 합니다.');
      }
      if (f['usefulLifeMonths'] === '' || f['usefulLifeMonths'] === undefined) {
        throw new Error('상각 자산은 내용연수(월)를 입력해야 합니다.');
      }
    }
    const amount = f['acquisitionAmount'];
    if (amount !== '' && amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      throw new Error('취득원가는 0 이상의 숫자여야 합니다.');
    }
  };

  const submitCreate = async () => {
    if (!f['assetCode'] || !f['assetNo'] || !f['assetName'] || !f['acquisitionDate']) {
      throw new Error('자산코드, 자산번호, 자산명, 취득일을 입력해 주세요.');
    }
    if (f['acquisitionAmount'] === '' || f['acquisitionAmount'] === undefined) {
      throw new Error('취득원가를 입력해 주세요.');
    }
    checkDepreciation();
    await call('POST', '/assets', role, clean({ ...f, isDepreciable: depreciable }));
    notify('자산을 등록했습니다.');
    setMode('list');
    reload();
  };

  const submitEdit = async () => {
    if (!selected) {
      return;
    }
    checkDepreciation();
    await call('PATCH', '/assets/' + String(selected['assetId']), role, clean({ ...f, isDepreciable: depreciable }));
    notify('자산 정보를 수정했습니다.');
    setMode('list');
    reload();
  };

  const back = (to: 'list' | 'detail') => (
    <button className="ghost" onClick={() => setMode(to)}>
      {to === 'list' ? '목록으로 돌아가기' : '상세로 돌아가기'}
    </button>
  );

  const depreciationFields = (
    <>
      <Field label="상각 여부" required>
        <Select
          value={f['isDepreciable']}
          onChange={(v) => set('isDepreciable', v)}
          options={[['true', '상각'], ['false', '상각 안 함']]}
        />
      </Field>
      <Field label="상각 방법" required={depreciable}>
        <TextInput value={f['depreciationMethod']} onChange={(v) => set('depreciationMethod', v)} />
      </Field>
      <Field label="내용연수(월)" required={depreciable}>
        <NumberInput value={f['usefulLifeMonths']} onChange={(v) => set('usefulLifeMonths', v)} />
      </Field>
      <Field label="취득원가" required={mode === 'create'}>
        <NumberInput value={f['acquisitionAmount']} onChange={(v) => set('acquisitionAmount', v)} />
      </Field>
    </>
  );

  const referenceFields = (
    <>
      <Field label="계정과목">
        <LookupSelect table="account_subject" role={role} value={f['accountSubjectId']} onChange={(v) => set('accountSubjectId', v)} />
      </Field>
      <Field label="프로젝트">
        <LookupSelect table="project" role={role} value={f['projectId']} onChange={(v) => set('projectId', v)} />
      </Field>
      <Field label="거래처">
        <LookupSelect table="partner" role={role} value={f['partnerId']} onChange={(v) => set('partnerId', v)} />
      </Field>
    </>
  );

  if (mode === 'create') {
    return (
      <div className="doc">
        {back('list')}
        <h1>자산 등록</h1>
        <Form onSubmit={submitCreate} submit="등록">
          <section className="box">
            <h2>기본 정보</h2>
            <Field label="자산코드" required>
              <TextInput value={f['assetCode']} onChange={(v) => set('assetCode', v)} />
            </Field>
            <Field label="자산번호" required hint="자산코드 안에서 중복될 수 없습니다.">
              <TextInput value={f['assetNo']} onChange={(v) => set('assetNo', v)} />
            </Field>
            <Field label="자산명" required>
              <TextInput value={f['assetName']} onChange={(v) => set('assetName', v)} />
            </Field>
            <Field label="취득일" required>
              <DateInput value={f['acquisitionDate']} onChange={(v) => set('acquisitionDate', v)} />
            </Field>
          </section>
          <section className="box">
            <h2>상각 정보</h2>
            {depreciationFields}
            <Field label="잔존가액">
              <NumberInput value={f['salvageValue']} onChange={(v) => set('salvageValue', v)} />
            </Field>
          </section>
          <section className="box">
            <h2>기준정보</h2>
            {referenceFields}
          </section>
        </Form>
      </div>
    );
  }

  if (mode === 'edit' && selected) {
    return (
      <div className="doc">
        {back('detail')}
        <h1>자산 수정</h1>
        <Form onSubmit={submitEdit} submit="수정 저장" note="입력하지 않은 항목은 바뀌지 않습니다.">
          <section className="box">
            <h2>기본 정보</h2>
            <Field label="자산명">
              <TextInput value={f['assetName']} onChange={(v) => set('assetName', v)} />
            </Field>
          </section>
          <section className="box">
            <h2>상각 정보</h2>
            {depreciationFields}
          </section>
          <section className="box">
            <h2>기준정보</h2>
            {referenceFields}
          </section>
        </Form>
      </div>
    );
  }

  if (mode === 'detail' && selected) {
    return (
      <div className="doc">
        {back('list')}
        <h1>{String(selected['assetName'])}</h1>
        <section className="box">
          <h2>자산 정보</h2>
          <Pairs
            items={[
              ['자산 ID', String(selected['assetId'])],
              ['자산코드', String(selected['assetCode'])],
              ['자산번호', String(selected['assetNo'])],
              ['자산명', String(selected['assetName'])],
              ['자산 유형', String(selected['assetType'] ?? '')],
              ['자산 분류', String(selected['assetCategory'] ?? '')],
              ['위치', String(selected['location'] ?? '')],
              ['담당자', <RefName table="employee" role={role} value={selected['managerId']} />],
              ['상각 여부', selected['isDepreciable'] ? '상각' : '상각 안 함'],
            ]}
          />
        </section>
        <button onClick={() => openEdit(selected)}>수정</button>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>자산 정보</h1>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied({ ...draft });
        }}
        onReset={() => {
          setDraft({});
          setPage(0);
          setApplied({});
        }}
      >
        <Field label="자산코드">
          <TextInput value={draft['assetCode']} onChange={(v) => setDraft({ ...draft, assetCode: v })} />
        </Field>
        <Field label="자산명">
          <TextInput value={draft['assetName']} onChange={(v) => setDraft({ ...draft, assetName: v })} />
        </Field>
        <Field label="자산 유형">
          <TextInput value={draft['assetType']} onChange={(v) => setDraft({ ...draft, assetType: v })} />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>자산 등록</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      <DataTable
        columns={[
          { key: 'assetCode', label: '자산코드' },
          { key: 'assetNo', label: '자산번호' },
          { key: 'assetName', label: '자산명' },
          { key: 'assetType', label: '자산 유형' },
          {
            key: 'isDepreciable',
            label: '상각 여부',
            render: (r: Row) => <Badge value={r['isDepreciable'] ? '상각' : '상각 안 함'} />,
          },
        ]}
        rows={data?.items ?? []}
        onRowClick={(r: Row) => {
          setSelected(r);
          setMode('detail');
        }}
        empty={loading ? '불러오는 중입니다.' : '등록한 자산이 없습니다. 자산 등록 버튼으로 첫 자산을 등록해 주세요.'}
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
    </div>
  );
}
