import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  DateInput,
  Select,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;
const FORM_TYPE_OPTIONS: [string, string][] = [
  ['기본장부', '기본장부'],
  ['주요', '주요 서식'],
  ['영세율첨부', '영세율 첨부서식'],
  ['업종별첨부', '업종별 첨부서식'],
  ['기타', '기타 서식'],
];

function formTypeName(value: unknown): string {
  const found = FORM_TYPE_OPTIONS.find((option) => option[0] === value);
  return found ? found[1] : String(value ?? '');
}

interface Condition {
  taxPeriodStart: string;
  taxPeriodEnd: string;
  formType: string;
}

const EMPTY: Condition = { taxPeriodStart: '', taxPeriodEnd: '', formType: '' };

export default function FnSfr01006Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Condition>(EMPTY);
  const [applied, setApplied] = useState<Condition>(EMPTY);
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [createForm, setCreateForm] = useState<Condition>(EMPTY);
  const [content, setContent] = useState('');

  const ready = applied.taxPeriodStart !== '' && applied.taxPeriodEnd !== '' && applied.formType !== '';

  const { data, error, loading, reload } = useData<Page>(async () => {
    if (!ready) {
      return { items: [], page: 0, size: SIZE, total: 0 };
    }
    return call<Page>('GET', '/vat-forms', role, undefined, {
      taxPeriodStart: applied.taxPeriodStart,
      taxPeriodEnd: applied.taxPeriodEnd,
      formType: applied.formType,
      page: pageNo,
      size: SIZE,
    });
  }, [applied, pageNo, role]);

  function search() {
    if (!draft.taxPeriodStart || !draft.taxPeriodEnd || !draft.formType) {
      notify('과세 기간과 서식 구분을 모두 선택해 주세요.');
      return;
    }
    setPageNo(0);
    setApplied({ ...draft });
  }

  function reset() {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPageNo(0);
  }

  async function create() {
    if (!createForm.taxPeriodStart || !createForm.taxPeriodEnd || !createForm.formType) {
      throw new Error('과세 기간과 서식 구분을 모두 입력해 주세요.');
    }
    await call('POST', '/vat-forms', role, {
      taxPeriodStart: createForm.taxPeriodStart,
      taxPeriodEnd: createForm.taxPeriodEnd,
      formType: createForm.formType,
    });
    notify('부가가치세 서식을 생성했습니다.');
    setCreating(false);
    setDraft({ ...createForm });
    setApplied({ ...createForm });
    setPageNo(0);
    reload();
  }

  async function save() {
    if (!selected) {
      return;
    }
    if (content.trim() === '') {
      throw new Error('서식 입력 내용을 입력해 주세요.');
    }
    const result = await call('PATCH', '/vat-forms/' + String(selected['vatFormId']), role, {
      formContent: content,
    });
    notify('서식 내용을 저장했습니다.');
    setSelected({ ...selected, formContent: result['formContent'] });
    setEditing(false);
    reload();
  }

  if (selected) {
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <h1>부가가치세 서식</h1>
        <section className='box'>
          <h2>서식 정보</h2>
          <Pairs
            items={[
              ['서식구분', formTypeName(selected['formType'])],
              ['과세기간 시작일', <DateText value={selected['taxPeriodStart']} />],
              ['과세기간 종료일', <DateText value={selected['taxPeriodEnd']} />],
              ['마감 여부', <Badge value={selected['isClosed'] ? '마감' : '진행'} />],
            ]}
          />
        </section>
        <section className='box'>
          <h2>서식 입력 내용</h2>
          <pre>{String(selected['formContent'] ?? '아직 입력한 내용이 없습니다.')}</pre>
          {selected['isClosed'] ? (
            <p>마감된 과세 기간의 서식은 마감을 취소한 뒤에 수정할 수 있습니다.</p>
          ) : (
            <button
              onClick={() => {
                setContent(String(selected['formContent'] ?? ''));
                setEditing(true);
              }}
            >
              내용 수정
            </button>
          )}
        </section>
        {editing && (
          <Drawer title='서식 내용 수정' onClose={() => setEditing(false)}>
            <Form onSubmit={save} submit='저장'>
              <Field label='서식 입력 내용' required wide>
                <TextInput value={content} onChange={setContent} multiline />
              </Field>
            </Form>
          </Drawer>
        )}
      </div>
    );
  }

  return (
    <div className='doc'>
      <h1>부가가치세 관리</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label='과세기간 시작일' required>
          <DateInput value={draft.taxPeriodStart} onChange={(v) => setDraft({ ...draft, taxPeriodStart: v })} />
        </Field>
        <Field label='과세기간 종료일' required>
          <DateInput value={draft.taxPeriodEnd} onChange={(v) => setDraft({ ...draft, taxPeriodEnd: v })} />
        </Field>
        <Field label='서식구분' required>
          <Select value={draft.formType} onChange={(v) => setDraft({ ...draft, formType: v })} options={FORM_TYPE_OPTIONS} />
        </Field>
      </Filters>
      <Band total={data ? data.total : 0}>
        <button
          onClick={() => {
            setCreateForm({ ...draft });
            setCreating(true);
          }}
        >
          서식 생성
        </button>
      </Band>
      {error && <ErrorText text={error} />}
      {!ready ? (
        <p>과세 기간과 서식 구분을 선택해 조회해 주세요.</p>
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'formType', label: '서식구분', render: (row) => formTypeName(row['formType']) },
              { key: 'taxPeriodStart', label: '과세기간 시작일', render: (row) => <DateText value={row['taxPeriodStart']} /> },
              { key: 'taxPeriodEnd', label: '과세기간 종료일', render: (row) => <DateText value={row['taxPeriodEnd']} /> },
              { key: 'isClosed', label: '마감 여부', render: (row) => <Badge value={row['isClosed'] ? '마감' : '진행'} /> },
            ]}
            rows={data ? data.items : []}
            onRowClick={(row) => setSelected(row)}
            empty={loading ? '불러오는 중입니다.' : '조건에 맞는 서식이 없습니다. 서식 생성 버튼으로 새 서식을 만들 수 있습니다.'}
          />
          <Pager page={pageNo} size={SIZE} total={data ? data.total : 0} onPage={setPageNo} />
        </>
      )}
      {creating && (
        <Drawer title='부가가치세 서식 생성' onClose={() => setCreating(false)}>
          <Form
            onSubmit={create}
            submit='생성'
            note='선택한 과세 기간의 전표와 전자세금계산서를 집계해 서식을 만듭니다.'
          >
            <Field label='과세기간 시작일' required>
              <DateInput value={createForm.taxPeriodStart} onChange={(v) => setCreateForm({ ...createForm, taxPeriodStart: v })} />
            </Field>
            <Field label='과세기간 종료일' required>
              <DateInput value={createForm.taxPeriodEnd} onChange={(v) => setCreateForm({ ...createForm, taxPeriodEnd: v })} />
            </Field>
            <Field label='서식구분' required>
              <Select value={createForm.formType} onChange={(v) => setCreateForm({ ...createForm, formType: v })} options={FORM_TYPE_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
