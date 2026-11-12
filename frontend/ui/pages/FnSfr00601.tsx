import { useState } from 'react';
import { call, useData, Filters, Band, DataTable, Pager, Drawer, Pairs, Form, Field, TextInput, Select, Badge, ErrorText } from '../kit';
import type { PageProps, Row, Page } from '../kit';

const CATEGORIES: [string, string][] = [
  ['자산', '자산'],
  ['부채', '부채'],
  ['자본', '자본'],
  ['수익', '수익'],
  ['비용', '비용'],
];

const EMPTY: Row = { category: '', code: '', name: '', description: '', remark: '' };

export default function FnSfr00601Page({ role, notify }: PageProps) {
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [detail, setDetail] = useState<Row | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Row>(EMPTY);

  const { data, error, reload } = useData(
    () => call<Page>('GET', '/account-subjects', role, undefined, { ...applied, page: pageNo, size: 20 }),
    [applied, pageNo, role],
  );

  function setField(key: string, value: unknown) {
    setForm({ ...form, [key]: value });
  }

  function openCreate() {
    setEditId(null);
    setForm(EMPTY);
    setFormOpen(true);
  }

  function openEdit(row: Row) {
    setEditId(Number(row.accountSubjectId));
    setForm({
      category: row.category ?? '',
      code: row.code ?? '',
      name: row.name ?? '',
      description: row.description ?? '',
      remark: row.remark ?? '',
    });
    setFormOpen(true);
  }

  function search() {
    setPageNo(0);
    setApplied({ category, keyword });
  }

  function reset() {
    setCategory('');
    setKeyword('');
    setPageNo(0);
    setApplied({});
  }

  async function save() {
    const missing: string[] = [];
    if (!form.category) missing.push('계정 구분');
    if (!String(form.code ?? '').trim()) missing.push('계정과목 코드');
    if (!String(form.name ?? '').trim()) missing.push('계정과목 명칭');
    if (missing.length > 0) {
      throw new Error(missing.join(', ') + '을(를) 입력해 주세요.');
    }
    const body: Row = {
      category: form.category,
      code: String(form.code).trim(),
      name: String(form.name).trim(),
      description: form.description,
      remark: form.remark,
    };
    if (editId === null) {
      await call('POST', '/account-subjects', role, body);
      notify('계정과목을 등록했습니다.');
    } else {
      await call('PUT', '/account-subjects/' + editId, role, body);
      notify('계정과목을 수정했습니다.');
      setDetail(null);
    }
    setFormOpen(false);
    reload();
  }

  const drawer = formOpen ? (
    <Drawer title={editId === null ? '계정과목 등록' : '계정과목 수정'} onClose={() => setFormOpen(false)}>
      <Form onSubmit={save} submit='저장'>
        <Field label='계정 구분' required>
          <Select value={form.category} onChange={(v) => setField('category', v)} options={CATEGORIES} />
        </Field>
        <Field label='계정과목 코드' required>
          <TextInput value={form.code} onChange={(v) => setField('code', v)} />
        </Field>
        <Field label='계정과목 명칭' required>
          <TextInput value={form.name} onChange={(v) => setField('name', v)} />
        </Field>
        <Field label='계정 설명' wide>
          <TextInput multiline value={form.description} onChange={(v) => setField('description', v)} />
        </Field>
        <Field label='계정 비고' wide>
          <TextInput multiline value={form.remark} onChange={(v) => setField('remark', v)} />
        </Field>
      </Form>
    </Drawer>
  ) : null;

  if (detail) {
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setDetail(null)}>목록으로 돌아가기</button>
        <section className='box'>
          <h2>계정과목 정보</h2>
          <Pairs
            items={[
              ['계정과목 코드', String(detail.code ?? '')],
              ['계정과목 명칭', String(detail.name ?? '')],
              ['계정 구분', <Badge value={detail.category} />],
              ['계정 설명', String(detail.description ?? '') || '입력한 설명이 없습니다.'],
              ['계정 비고', String(detail.remark ?? '') || '입력한 비고가 없습니다.'],
            ]}
          />
          <button onClick={() => openEdit(detail)}>수정</button>
        </section>
        {drawer}
      </div>
    );
  }

  return (
    <div className='doc'>
      <section className='box'>
        <h2>계정과목</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label='계정 구분'>
            <Select value={category} onChange={setCategory} options={CATEGORIES} placeholder='전체' />
          </Field>
          <Field label='검색어' hint='코드 또는 명칭'>
            <TextInput value={keyword} onChange={setKeyword} />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openCreate}>계정과목 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        <DataTable
          columns={[
            { key: 'code', label: '계정과목 코드' },
            { key: 'name', label: '계정과목 명칭' },
            { key: 'category', label: '계정 구분', render: (r) => <Badge value={r.category} /> },
            { key: 'description', label: '계정 설명' },
          ]}
          rows={data?.items ?? []}
          onRowClick={(row) => setDetail(row)}
          empty='아직 등록한 계정과목이 없습니다. 계정과목 등록 버튼으로 첫 계정과목을 추가해 주세요.'
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
      {drawer}
    </div>
  );
}
