import { useState } from 'react';
import {
  Band,
  DataTable,
  DateInput,
  ErrorText,
  Field,
  Filters,
  Form,
  LookupSelect,
  Num,
  NumberInput,
  Pairs,
  RefName,
  Select,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

type Mode = 'list' | 'create' | 'detail' | 'edit';

const YES_NO: [string, string][] = [
  ['true', '예'],
  ['false', '아니오'],
];

function filled(v: unknown): boolean {
  return v !== undefined && v !== null && String(v).trim() !== '';
}

export default function FnSfr01101Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<Mode>('list');
  const [items, setItems] = useState<Row[]>([]);
  const [current, setCurrent] = useState<Row>({});
  const [form, setForm] = useState<Row>({});
  const [searchId, setSearchId] = useState<number | string>('');
  const [searchError, setSearchError] = useState('');

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const remember = (row: Row) => {
    setItems((list) => [row, ...list.filter((x) => x['assetId'] !== row['assetId'])]);
  };

  const open = async (assetId: unknown) => {
    const row = await call('GET', '/assets/' + String(assetId), role);
    remember(row);
    setCurrent(row);
    setMode('detail');
  };

  const search = async () => {
    setSearchError('');
    if (!filled(searchId)) {
      setSearchError('조회할 자산 ID를 입력해 주세요.');
      return;
    }
    try {
      await open(searchId);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : '조회하지 못했습니다.');
    }
  };

  const startCreate = () => {
    setForm({});
    setMode('create');
  };

  const startEdit = () => {
    setForm({
      assetName: current['assetName'],
      isDepreciable: String(current['isDepreciable']),
      depreciationMethod: current['depreciationMethod'],
      usefulLifeMonths: current['usefulLifeMonths'],
      acquisitionAmount: current['acquisitionAmount'],
      accountSubjectId: current['accountSubjectId'],
      projectId: current['projectId'],
      partnerId: current['partnerId'],
    });
    setMode('edit');
  };

  const create = async () => {
    const need: [string, string][] = [
      ['assetCode', '자산코드'],
      ['assetNo', '자산번호'],
      ['assetName', '자산명'],
      ['isDepreciable', '상각 여부'],
      ['depreciationMethod', '상각 방법'],
      ['usefulLifeMonths', '내용연수(월)'],
      ['acquisitionAmount', '취득원가'],
      ['accountSubjectId', '계정과목'],
      ['acquisitionDate', '취득일'],
    ];
    const missing = need.filter(([k]) => !filled(form[k])).map(([, label]) => label);
    if (missing.length > 0) {
      throw new Error('다음 항목을 입력해 주세요: ' + missing.join(', '));
    }
    const body: Row = {
      assetCode: form['assetCode'],
      assetNo: form['assetNo'],
      assetName: form['assetName'],
      isDepreciable: form['isDepreciable'] === 'true',
      depreciationMethod: form['depreciationMethod'],
      usefulLifeMonths: form['usefulLifeMonths'],
      acquisitionAmount: form['acquisitionAmount'],
      accountSubjectId: form['accountSubjectId'],
      acquisitionDate: form['acquisitionDate'],
    };
    if (filled(form['projectId'])) body['projectId'] = form['projectId'];
    if (filled(form['partnerId'])) body['partnerId'] = form['partnerId'];
    if (filled(form['salvageValue'])) body['salvageValue'] = form['salvageValue'];
    const created = await call('POST', '/assets', role, body);
    notify('고정자산을 등록했습니다.');
    await open(created['assetId']);
  };

  const update = async () => {
    const need: [string, string][] = [
      ['assetName', '자산명'],
      ['depreciationMethod', '상각 방법'],
      ['usefulLifeMonths', '내용연수(월)'],
      ['acquisitionAmount', '취득원가'],
    ];
    const missing = need.filter(([k]) => !filled(form[k])).map(([, label]) => label);
    if (missing.length > 0) {
      throw new Error('다음 항목을 입력해 주세요: ' + missing.join(', '));
    }
    const body: Row = {
      assetName: form['assetName'],
      isDepreciable: form['isDepreciable'] === 'true',
      depreciationMethod: form['depreciationMethod'],
      usefulLifeMonths: form['usefulLifeMonths'],
      acquisitionAmount: form['acquisitionAmount'],
    };
    if (filled(form['accountSubjectId'])) body['accountSubjectId'] = form['accountSubjectId'];
    if (filled(form['projectId'])) body['projectId'] = form['projectId'];
    if (filled(form['partnerId'])) body['partnerId'] = form['partnerId'];
    await call('PATCH', '/assets/' + String(current['assetId']), role, body);
    notify('고정자산 정보를 수정했습니다.');
    await open(current['assetId']);
  };

  if (mode === 'create') {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setMode('list')}>목록으로</button>
        <h1>고정자산 등록</h1>
        <Form onSubmit={create} submit="등록">
          <section className="box">
            <h2>기본 정보</h2>
            <Field label="자산코드" required>
              <TextInput value={form['assetCode']} onChange={(v) => set('assetCode', v)} />
            </Field>
            <Field label="자산번호" required>
              <TextInput value={form['assetNo']} onChange={(v) => set('assetNo', v)} />
            </Field>
            <Field label="자산명" required>
              <TextInput value={form['assetName']} onChange={(v) => set('assetName', v)} />
            </Field>
            <Field label="취득일" required>
              <DateInput value={form['acquisitionDate']} onChange={(v) => set('acquisitionDate', v)} />
            </Field>
            <Field label="취득원가" required>
              <NumberInput value={form['acquisitionAmount']} onChange={(v) => set('acquisitionAmount', v)} />
            </Field>
          </section>
          <section className="box">
            <h2>감가상각 정보</h2>
            <Field label="상각 여부" required>
              <Select value={form['isDepreciable']} onChange={(v) => set('isDepreciable', v)} options={YES_NO} />
            </Field>
            <Field label="상각 방법" required>
              <TextInput value={form['depreciationMethod']} onChange={(v) => set('depreciationMethod', v)} />
            </Field>
            <Field label="내용연수(월)" required>
              <NumberInput value={form['usefulLifeMonths']} onChange={(v) => set('usefulLifeMonths', v)} />
            </Field>
            <Field label="잔존가액">
              <NumberInput value={form['salvageValue']} onChange={(v) => set('salvageValue', v)} />
            </Field>
          </section>
          <section className="box">
            <h2>연계 기준정보</h2>
            <Field label="계정과목" required>
              <LookupSelect table="account_subject" role={role} value={form['accountSubjectId']} onChange={(v) => set('accountSubjectId', v)} />
            </Field>
            <Field label="프로젝트">
              <LookupSelect table="project" role={role} value={form['projectId']} onChange={(v) => set('projectId', v)} />
            </Field>
            <Field label="거래처">
              <LookupSelect table="partner" role={role} value={form['partnerId']} onChange={(v) => set('partnerId', v)} />
            </Field>
          </section>
        </Form>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setMode('detail')}>상세로 돌아가기</button>
        <h1>고정자산 정보 수정</h1>
        <Form onSubmit={update} submit="수정 저장" note="수정 내용은 변경 이력에 남습니다.">
          <section className="box">
            <h2>기본 정보</h2>
            <Field label="자산명" required>
              <TextInput value={form['assetName']} onChange={(v) => set('assetName', v)} />
            </Field>
            <Field label="취득원가" required>
              <NumberInput value={form['acquisitionAmount']} onChange={(v) => set('acquisitionAmount', v)} />
            </Field>
          </section>
          <section className="box">
            <h2>감가상각 정보</h2>
            <Field label="상각 여부">
              <Select value={form['isDepreciable']} onChange={(v) => set('isDepreciable', v)} options={YES_NO} />
            </Field>
            <Field label="상각 방법" required>
              <TextInput value={form['depreciationMethod']} onChange={(v) => set('depreciationMethod', v)} />
            </Field>
            <Field label="내용연수(월)" required>
              <NumberInput value={form['usefulLifeMonths']} onChange={(v) => set('usefulLifeMonths', v)} />
            </Field>
          </section>
          <section className="box">
            <h2>연계 기준정보</h2>
            <Field label="계정과목">
              <LookupSelect table="account_subject" role={role} value={form['accountSubjectId']} onChange={(v) => set('accountSubjectId', v)} />
            </Field>
            <Field label="프로젝트">
              <LookupSelect table="project" role={role} value={form['projectId']} onChange={(v) => set('projectId', v)} />
            </Field>
            <Field label="거래처">
              <LookupSelect table="partner" role={role} value={form['partnerId']} onChange={(v) => set('partnerId', v)} />
            </Field>
          </section>
        </Form>
      </div>
    );
  }

  if (mode === 'detail') {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setMode('list')}>목록으로</button>
        <h1>{String(current['assetName'] ?? '')}</h1>
        <section className="box">
          <h2>기본 정보</h2>
          <Pairs
            items={[
              ['자산코드', String(current['assetCode'] ?? '')],
              ['자산번호', String(current['assetNo'] ?? '')],
              ['자산명', String(current['assetName'] ?? '')],
              ['취득원가', <Num value={current['acquisitionAmount']} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>감가상각 정보</h2>
          <Pairs
            items={[
              ['상각 여부', current['isDepreciable'] ? '예' : '아니오'],
              ['상각 방법', String(current['depreciationMethod'] ?? '')],
              ['내용연수(월)', <Num value={current['usefulLifeMonths']} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>연계 기준정보</h2>
          <Pairs
            items={[
              ['계정과목', <RefNameOrDash table="account_subject" role={role} value={current['accountSubjectId']} />],
              ['프로젝트', <RefNameOrDash table="project" role={role} value={current['projectId']} />],
              ['거래처', <RefNameOrDash table="partner" role={role} value={current['partnerId']} />],
            ]}
          />
        </section>
        <button onClick={startEdit}>정보 수정</button>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>고정자산 정보</h1>
      <Filters
        onSearch={search}
        onReset={() => {
          setSearchId('');
          setSearchError('');
        }}
      >
        <Field label="자산 ID로 조회">
          <NumberInput value={searchId} onChange={setSearchId} />
        </Field>
      </Filters>
      {searchError !== '' && <ErrorText text={searchError} />}
      <Band total={items.length}>
        <button onClick={startCreate}>고정자산 등록</button>
      </Band>
      <DataTable
        columns={[
          { key: 'assetCode', label: '자산코드' },
          { key: 'assetName', label: '자산명' },
          { key: 'acquisitionAmount', label: '취득원가', render: (r) => <Num value={r['acquisitionAmount']} /> },
          { key: 'isDepreciable', label: '상각 여부', render: (r) => (r['isDepreciable'] ? '예' : '아니오') },
          { key: 'accountSubjectId', label: '계정과목', render: (r) => <RefNameOrDash table="account_subject" role={role} value={r['accountSubjectId']} /> },
        ]}
        rows={items}
        onRowClick={(r) => {
          open(r['assetId']).catch((e) => setSearchError(e instanceof Error ? e.message : '조회하지 못했습니다.'));
        }}
        empty="아직 조회하거나 등록한 고정자산이 없습니다. 자산 ID로 조회하거나 새로 등록해 주세요."
      />
    </div>
  );
}

function RefNameOrDash({ table, role, value }: { table: string; role: string; value: unknown }) {
  if (!filled(value)) return <span>-</span>;
  return <RefName table={table} role={role} value={value} />;
}
