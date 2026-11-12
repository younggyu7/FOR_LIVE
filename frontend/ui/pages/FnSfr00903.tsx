import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Num,
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
  NumberInput,
  DateInput,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

type Mode = 'none' | 'create' | 'edit' | 'delete';

const EMPTY_FORM: Row = {
  fundSubjectId: '',
  planStartDate: '',
  planEndDate: '',
  incomeAmount: '',
  expenseAmount: '',
  remark: '',
};

export default function FnSfr00903Page({ role, notify }: PageProps) {
  const [filter, setFilter] = useState<Row>({ startDate: '', endDate: '', fundSubjectId: '' });
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [mode, setMode] = useState<Mode>('none');
  const [form, setForm] = useState<Row>(EMPTY_FORM);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/fund-plans', role, undefined, { ...applied, page: pageNo, size: SIZE }),
    [role, applied, pageNo],
  );

  const setField = (key: string, value: unknown) => setForm({ ...form, [key]: value });
  const isClosed = (row: Row) => row['closingStatus'] === '마감';

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setMode('create');
  };

  const openEdit = (row: Row) => {
    setForm({
      fundSubjectId: row['fundSubjectId'],
      planStartDate: row['planStartDate'],
      planEndDate: row['planEndDate'],
      incomeAmount: row['incomeAmount'] ?? '',
      expenseAmount: row['expenseAmount'] ?? '',
      remark: row['remark'] ?? '',
    });
    setMode('edit');
  };

  const closeDrawer = () => setMode('none');

  const validate = () => {
    if (form['fundSubjectId'] === '' || form['fundSubjectId'] === undefined) {
      throw new Error('자금과목을 선택해 주세요.');
    }
    if (!form['planStartDate']) {
      throw new Error('계획 시작일을 입력해 주세요.');
    }
    if (!form['planEndDate']) {
      throw new Error('계획 종료일을 입력해 주세요.');
    }
    if (String(form['planEndDate']) < String(form['planStartDate'])) {
      throw new Error('계획 종료일은 시작일보다 앞설 수 없습니다.');
    }
    for (const key of ['incomeAmount', 'expenseAmount']) {
      const v = form[key];
      if (v !== '' && v !== undefined && (typeof v !== 'number' || v < 0)) {
        throw new Error('금액은 0 이상의 숫자로 입력해 주세요.');
      }
    }
  };

  const submitCreate = async () => {
    validate();
    await call('POST', '/fund-plans', role, form);
    notify('자금수지계획을 등록했습니다.');
    closeDrawer();
    reload();
  };

  const submitEdit = async () => {
    validate();
    if (!selected) {
      return;
    }
    await call('PATCH', '/fund-plans/' + String(selected['fundPlanId']), role, form);
    notify('자금수지계획을 수정했습니다.');
    closeDrawer();
    setSelected(null);
    reload();
  };

  const submitDelete = async () => {
    if (!selected) {
      return;
    }
    await call('DELETE', '/fund-plans/' + String(selected['fundPlanId']), role);
    notify('자금수지계획을 삭제했습니다.');
    closeDrawer();
    setSelected(null);
    reload();
  };

  const search = () => {
    setPageNo(0);
    setApplied({ ...filter });
  };

  const reset = () => {
    const empty = { startDate: '', endDate: '', fundSubjectId: '' };
    setFilter(empty);
    setPageNo(0);
    setApplied({});
  };

  const fields = (
    <>
      <Field label='자금과목' required>
        <LookupSelect table='fund_subject' role={role} value={form['fundSubjectId']} onChange={(v) => setField('fundSubjectId', v)} />
      </Field>
      <Field label='계획 시작일' required>
        <DateInput value={form['planStartDate']} onChange={(v) => setField('planStartDate', v)} />
      </Field>
      <Field label='계획 종료일' required>
        <DateInput value={form['planEndDate']} onChange={(v) => setField('planEndDate', v)} />
      </Field>
      <Field label='수입 계획 금액'>
        <NumberInput value={form['incomeAmount']} onChange={(v) => setField('incomeAmount', v)} />
      </Field>
      <Field label='지출 계획 금액'>
        <NumberInput value={form['expenseAmount']} onChange={(v) => setField('expenseAmount', v)} />
      </Field>
      <Field label='비고' wide>
        <TextInput multiline value={form['remark']} onChange={(v) => setField('remark', v)} />
      </Field>
    </>
  );

  const drawers = (
    <>
      {mode === 'create' && (
        <Drawer title='자금수지계획 등록' onClose={closeDrawer}>
          <Form onSubmit={submitCreate} submit='등록'>
            {fields}
          </Form>
        </Drawer>
      )}
      {mode === 'edit' && selected && (
        <Drawer title='자금수지계획 수정' onClose={closeDrawer}>
          <Form onSubmit={submitEdit} submit='수정 저장'>
            {fields}
          </Form>
        </Drawer>
      )}
      {mode === 'delete' && selected && (
        <Drawer title='자금수지계획 삭제' onClose={closeDrawer}>
          <Form onSubmit={submitDelete} submit='삭제' danger note='삭제한 계획은 되돌릴 수 없습니다. 계속하려면 삭제를 눌러 주세요.' />
        </Drawer>
      )}
    </>
  );

  if (selected) {
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className='box'>
          <h2>계획 내용</h2>
          <Pairs
            items={[
              ['자금과목', <RefName table='fund_subject' role={role} value={selected['fundSubjectId']} />],
              ['계획 기간', <span><DateText value={selected['planStartDate']} /> ~ <DateText value={selected['planEndDate']} /></span>],
              ['수입 계획 금액', <Num value={selected['incomeAmount']} />],
              ['지출 계획 금액', <Num value={selected['expenseAmount']} />],
              ['수지 차액', <Num value={selected['balanceDifference']} />],
              ['마감 상태', <Badge value={selected['closingStatus']} />],
              ['비고', String(selected['remark'] ?? '')],
            ]}
          />
        </section>
        {!isClosed(selected) && (
          <section className='box'>
            <h2>처리</h2>
            <button onClick={() => openEdit(selected)}>수정</button>
            <button className='ghost' onClick={() => setMode('delete')}>삭제</button>
          </section>
        )}
        {isClosed(selected) && <p>마감된 계획입니다. 마감을 취소한 뒤에 수정하거나 삭제할 수 있습니다.</p>}
        {drawers}
      </div>
    );
  }

  return (
    <div className='doc'>
      <section className='box'>
        <h2>자금수지계획</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label='계획 기간 시작'>
            <DateInput value={filter['startDate']} onChange={(v) => setFilter({ ...filter, startDate: v })} />
          </Field>
          <Field label='계획 기간 종료'>
            <DateInput value={filter['endDate']} onChange={(v) => setFilter({ ...filter, endDate: v })} />
          </Field>
          <Field label='자금과목'>
            <LookupSelect table='fund_subject' role={role} value={filter['fundSubjectId']} onChange={(v) => setFilter({ ...filter, fundSubjectId: v })} />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openCreate}>계획 등록</button>
        </Band>
        {error && <ErrorText text={error} />}
        {loading && <p>불러오는 중입니다.</p>}
        <DataTable
          columns={[
            { key: 'fundSubjectId', label: '자금과목', render: (r) => <RefName table='fund_subject' role={role} value={r['fundSubjectId']} /> },
            { key: 'planStartDate', label: '계획 기간', render: (r) => <span><DateText value={r['planStartDate']} /> ~ <DateText value={r['planEndDate']} /></span> },
            { key: 'incomeAmount', label: '수입 계획 금액', render: (r) => <Num value={r['incomeAmount']} /> },
            { key: 'expenseAmount', label: '지출 계획 금액', render: (r) => <Num value={r['expenseAmount']} /> },
            { key: 'balanceDifference', label: '수지 차액', render: (r) => <Num value={r['balanceDifference']} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(row) => setSelected(row)}
          empty='아직 등록한 계획이 없습니다. 계획 등록 버튼으로 첫 계획을 만들어 주세요.'
        />
        <Pager page={pageNo} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
      {drawers}
    </div>
  );
}
