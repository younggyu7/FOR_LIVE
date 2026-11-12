import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  ErrorText,
  Field,
  Filters,
  Form,
  LookupSelect,
  Pager,
  Pairs,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;
const TYPE_OPTIONS: [string, string][] = [
  ['일반', '일반'],
  ['금융', '금융'],
];

function textOf(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

export default function FnSfr00204Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);
  const [f, setF] = useState<Row>({});

  const { data, error, reload } = useData(
    () => call<Page>('GET', '/partners', role, undefined, { ...applied, page: pageNo, size: SIZE }),
    [applied, pageNo, role],
  );

  function setField(key: string, value: unknown) {
    setF({ ...f, [key]: value });
  }

  function openCreate() {
    setF({ partnerType: '일반' });
    setMode('create');
  }

  function openEdit(row: Row) {
    setF({
      name: textOf(row.name),
      shortName: textOf(row.shortName),
      code: textOf(row.code),
      businessRegNo: textOf(row.businessRegNo),
      representative: textOf(row.representative),
      tradeStartDate: textOf(row.tradeStartDate).slice(0, 10),
      tradeEndDate: textOf(row.tradeEndDate).slice(0, 10),
    });
    setMode('edit');
  }

  function buildBody(keys: string[]): Row {
    const body: Row = {};
    for (const key of keys) {
      const v = f[key];
      if (v === undefined || v === null || v === '') {
        continue;
      }
      if (key === 'taxInvoiceYn') {
        body[key] = v === 'true';
      } else {
        body[key] = v;
      }
    }
    return body;
  }

  function checkPeriod() {
    const start = textOf(f.tradeStartDate);
    const end = textOf(f.tradeEndDate);
    if (start !== '' && end !== '' && end < start) {
      throw new Error('거래 종료일은 거래 시작일보다 빠를 수 없습니다.');
    }
  }

  async function submitCreate() {
    const required: [string, string][] = [
      ['partnerType', '거래처 유형'],
      ['name', '거래처 명칭'],
      ['code', '거래처 코드'],
      ['businessRegNo', '사업자등록번호'],
      ['representative', '대표자'],
      ['projectId', '프로젝트'],
    ];
    for (const [key, label] of required) {
      if (textOf(f[key]) === '') {
        throw new Error(label + '을(를) 입력해 주세요.');
      }
    }
    checkPeriod();
    const body = buildBody([
      'partnerType', 'name', 'shortName', 'code', 'businessRegNo', 'representative', 'projectId',
      'category', 'region', 'taxInvoiceYn', 'tradeStartDate', 'tradeEndDate', 'contactPerson',
    ]);
    await call('POST', '/partners', role, body);
    notify('거래처를 등록했습니다.');
    setMode(null);
    setPageNo(0);
    reload();
  }

  async function submitEdit() {
    if (selected === null) {
      return;
    }
    checkPeriod();
    const body = buildBody([
      'name', 'shortName', 'code', 'businessRegNo', 'representative', 'category', 'region',
      'taxInvoiceYn', 'tradeStartDate', 'tradeEndDate', 'contactPerson',
    ]);
    await call('PATCH', '/partners/' + textOf(selected.partnerId), role, body);
    notify('거래처를 수정했습니다.');
    setMode(null);
    setSelected(null);
    reload();
  }

  function fields(create: boolean) {
    return (
      <>
        {create ? (
          <Field label="거래처 유형" required>
            <Select value={f.partnerType} onChange={(v) => setField('partnerType', v)} options={TYPE_OPTIONS} />
          </Field>
        ) : null}
        {create ? (
          <Field label="프로젝트" required>
            <LookupSelect table="project" role={role} value={f.projectId} onChange={(v) => setField('projectId', v)} />
          </Field>
        ) : null}
        <Field label="거래처 코드" required={create}>
          <TextInput value={f.code} onChange={(v) => setField('code', v)} />
        </Field>
        <Field label="거래처 명칭" required={create}>
          <TextInput value={f.name} onChange={(v) => setField('name', v)} />
        </Field>
        <Field label="약칭">
          <TextInput value={f.shortName} onChange={(v) => setField('shortName', v)} />
        </Field>
        <Field label="사업자등록번호" required={create} hint="하이픈 없이 숫자 10자리">
          <TextInput value={f.businessRegNo} onChange={(v) => setField('businessRegNo', v)} />
        </Field>
        <Field label="대표자" required={create}>
          <TextInput value={f.representative} onChange={(v) => setField('representative', v)} />
        </Field>
        <Field label="거래처 분류">
          <TextInput value={f.category} onChange={(v) => setField('category', v)} />
        </Field>
        <Field label="지역">
          <TextInput value={f.region} onChange={(v) => setField('region', v)} />
        </Field>
        <Field label="세금계산서 여부">
          <Select
            value={f.taxInvoiceYn}
            onChange={(v) => setField('taxInvoiceYn', v)}
            options={[['true', '예'], ['false', '아니오']]}
          />
        </Field>
        <Field label="거래 시작일">
          <DateInput value={f.tradeStartDate} onChange={(v) => setField('tradeStartDate', v)} />
        </Field>
        <Field label="거래 종료일">
          <DateInput value={f.tradeEndDate} onChange={(v) => setField('tradeEndDate', v)} />
        </Field>
        <Field label="거래처 담당자">
          <TextInput value={f.contactPerson} onChange={(v) => setField('contactPerson', v)} />
        </Field>
      </>
    );
  }

  const drawer =
    mode === null ? null : (
      <Drawer title={mode === 'create' ? '거래처 등록' : '거래처 수정'} onClose={() => setMode(null)}>
        <Form
          onSubmit={mode === 'create' ? submitCreate : submitEdit}
          submit={mode === 'create' ? '등록' : '저장'}
        >
          {fields(mode === 'create')}
        </Form>
      </Drawer>
    );

  if (selected !== null) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>거래처 정보</h2>
          <Pairs
            items={[
              ['거래처 코드', textOf(selected.code)],
              ['거래처 유형', <Badge value={selected.partnerType} />],
              ['거래처 명칭', textOf(selected.name)],
              ['약칭', textOf(selected.shortName)],
              ['사업자등록번호', textOf(selected.businessRegNo)],
              ['대표자', textOf(selected.representative)],
              ['거래 시작일', <DateText value={selected.tradeStartDate} />],
              ['거래 종료일', <DateText value={selected.tradeEndDate} />],
            ]}
          />
          <button onClick={() => openEdit(selected)}>수정</button>
        </section>
        {drawer}
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>거래처 목록</h2>
        <Filters
          onSearch={() => {
            setPageNo(0);
            setApplied({ ...draft });
          }}
          onReset={() => {
            setDraft({});
            setApplied({});
            setPageNo(0);
          }}
        >
          <Field label="거래처 유형">
            <Select
              value={draft.partnerType}
              onChange={(v) => setDraft({ ...draft, partnerType: v })}
              options={TYPE_OPTIONS}
              placeholder="전체"
            />
          </Field>
          <Field label="프로젝트">
            <LookupSelect
              table="project"
              role={role}
              value={draft.projectId}
              onChange={(v) => setDraft({ ...draft, projectId: v })}
              placeholder="전체"
            />
          </Field>
          <Field label="검색어">
            <TextInput value={draft.keyword} onChange={(v) => setDraft({ ...draft, keyword: v })} placeholder="명칭 또는 코드" />
          </Field>
        </Filters>
        {error !== '' ? <ErrorText text={error} /> : null}
        <Band total={data?.total}>
          <button onClick={openCreate}>거래처 등록</button>
        </Band>
        <DataTable
          columns={[
            { key: 'code', label: '거래처 코드' },
            { key: 'name', label: '거래처 명칭' },
            { key: 'partnerType', label: '거래처 유형', render: (r) => <Badge value={r.partnerType} /> },
            { key: 'businessRegNo', label: '사업자등록번호' },
            {
              key: 'tradeStartDate',
              label: '거래 기간',
              render: (r) => (
                <span>
                  <DateText value={r.tradeStartDate} /> ~ <DateText value={r.tradeEndDate} />
                </span>
              ),
            },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty="아직 등록한 거래처가 없습니다. 거래처 등록 버튼으로 첫 거래처를 추가해 주세요."
        />
        <Pager page={pageNo} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
      {drawer}
    </div>
  );
}
