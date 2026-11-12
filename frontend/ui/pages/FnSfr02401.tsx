import { useState } from 'react';
import type { PageProps, Row, Page } from '../kit';
import {
  call, useData, Num, Filters, Band, DataTable, Pager, Drawer, Pairs, Form, Field,
  TextInput, NumberInput, Select, LookupSelect, ErrorText,
} from '../kit';

type Mode = 'none' | 'create' | 'edit' | 'delete';

export default function FnSfr02401Page({ role, notify }: PageProps) {
  const [draftProject, setDraftProject] = useState<number | string>('');
  const [draftAccount, setDraftAccount] = useState<number | string>('');
  const [projectId, setProjectId] = useState<number | string>('');
  const [budgetAccountId, setBudgetAccountId] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [mode, setMode] = useState<Mode>('none');
  const [form, setForm] = useState<Row>({});

  const list = useData<Page>(
    () => call<Page>('GET', '/requisitions/budget-status', role, undefined, { projectId, budgetAccountId, page, size: 20 }),
    [projectId, budgetAccountId, page],
  );

  const setField = (key: string, value: unknown) => setForm({ ...form, [key]: value });

  const missing = (): string => {
    const labels: [string, string][] = [
      ['projectId', '프로젝트'],
      ['budgetAccountId', '예산과목'],
      ['title', '품의 제목'],
      ['requisitionAmount', '품의 금액'],
    ];
    const names = labels.filter(([key]) => form[key] === undefined || form[key] === '').map(([, label]) => label);
    return names.join(', ');
  };

  const openCreate = () => {
    setForm({ requisitionType: '구매' });
    setMode('create');
  };

  const openEdit = () => {
    setForm({});
    setMode('edit');
  };

  const close = () => setMode('none');

  const submitCreate = async () => {
    const names = missing();
    if (names !== '' || !form['requisitionType']) {
      throw new Error('입력하지 않은 항목이 있습니다: ' + (names || '품의 유형'));
    }
    await call('POST', '/requisitions', role, {
      projectId: form['projectId'],
      budgetAccountId: form['budgetAccountId'],
      requisitionType: form['requisitionType'],
      title: form['title'],
      content: form['content'],
      requisitionAmount: form['requisitionAmount'],
    });
    notify('구매품의서를 저장했습니다.');
    close();
    list.reload();
  };

  const submitEdit = async () => {
    const names = missing();
    if (names !== '') {
      throw new Error('입력하지 않은 항목이 있습니다: ' + names);
    }
    await call('PUT', '/requisitions/' + String(selected?.['requisitionId']), role, {
      projectId: form['projectId'],
      budgetAccountId: form['budgetAccountId'],
      title: form['title'],
      requisitionAmount: form['requisitionAmount'],
      content: form['content'],
    });
    notify('구매품의서를 수정했습니다.');
    close();
    setSelected(null);
    list.reload();
  };

  const submitDelete = async () => {
    await call('DELETE', '/requisitions/' + String(selected?.['requisitionId']), role);
    notify('구매품의서를 삭제했습니다.');
    close();
    setSelected(null);
    list.reload();
  };

  const fields = (withType: boolean) => (
    <>
      {withType && (
        <Field label='품의 유형' required>
          <Select
            value={form['requisitionType']}
            onChange={(v) => setField('requisitionType', v)}
            options={[['구매', '구매'], ['지출', '지출']]}
          />
        </Field>
      )}
      <Field label='프로젝트' required>
        <LookupSelect table='project' role={role} value={form['projectId']} onChange={(v) => setField('projectId', v)} />
      </Field>
      <Field label='예산과목' required>
        <LookupSelect table='budget_account' role={role} value={form['budgetAccountId']} onChange={(v) => setField('budgetAccountId', v)} />
      </Field>
      <Field label='품의 제목' required wide>
        <TextInput value={form['title']} onChange={(v) => setField('title', v)} />
      </Field>
      <Field label='품의 금액' required>
        <NumberInput value={form['requisitionAmount']} onChange={(v) => setField('requisitionAmount', v)} />
      </Field>
      <Field label='품의 내용' wide>
        <TextInput multiline value={form['content']} onChange={(v) => setField('content', v)} />
      </Field>
    </>
  );

  const drawers = (
    <>
      {mode === 'create' && (
        <Drawer title='구매품의서 작성' onClose={close}>
          <Form onSubmit={submitCreate} submit='저장' note='품의 금액이 예산잔액을 넘으면 저장되지 않습니다.'>
            {fields(true)}
          </Form>
        </Drawer>
      )}
      {mode === 'edit' && (
        <Drawer title='구매품의서 수정' onClose={close}>
          <Form onSubmit={submitEdit} submit='수정' note='승인된 품의서는 수정할 수 없습니다.'>
            {fields(false)}
          </Form>
        </Drawer>
      )}
      {mode === 'delete' && (
        <Drawer title='구매품의서 삭제' onClose={close}>
          <Form onSubmit={submitDelete} submit='삭제' danger note='삭제한 품의서는 되돌릴 수 없습니다. 승인된 품의서는 삭제할 수 없습니다.'>
            <Pairs items={[['품의 제목', String(selected?.['title'] ?? '')]]} />
          </Form>
        </Drawer>
      )}
    </>
  );

  if (selected) {
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setSelected(null)}>목록으로</button>
        <section className='box'>
          <h2>품의서</h2>
          <Pairs
            items={[
              ['품의서 ID', String(selected['requisitionId'])],
              ['품의 제목', String(selected['title'])],
              ['품의 금액', <Num value={selected['requisitionAmount']} />],
            ]}
          />
        </section>
        <section className='box'>
          <h2>예산 현황</h2>
          <Pairs
            items={[
              ['실행예산액', <Num value={selected['executionBudgetAmount']} />],
              ['이월예산액', <Num value={selected['carryoverBudgetAmount']} />],
              ['예산총액', <Num value={selected['totalBudgetAmount']} />],
              ['집행액', <Num value={selected['executedAmount']} />],
              ['예산잔액', <Num value={selected['budgetBalanceAmount']} />],
            ]}
          />
        </section>
        <section className='box'>
          <h2>처리</h2>
          <button onClick={openEdit}>수정</button>
          <button className='ghost' onClick={() => setMode('delete')}>삭제</button>
        </section>
        {drawers}
      </div>
    );
  }

  return (
    <div className='doc'>
      <h2>구매품의서 예산 현황</h2>
      <Filters
        onSearch={() => {
          setProjectId(draftProject);
          setBudgetAccountId(draftAccount);
          setPage(0);
        }}
        onReset={() => {
          setDraftProject('');
          setDraftAccount('');
          setProjectId('');
          setBudgetAccountId('');
          setPage(0);
        }}
      >
        <Field label='프로젝트'>
          <LookupSelect table='project' role={role} value={draftProject} onChange={setDraftProject} />
        </Field>
        <Field label='예산과목'>
          <LookupSelect table='budget_account' role={role} value={draftAccount} onChange={setDraftAccount} />
        </Field>
      </Filters>
      <Band total={list.data?.total}>
        <button onClick={openCreate}>구매품의서 작성</button>
      </Band>
      {list.error !== '' && <ErrorText text={list.error} />}
      <DataTable
        rows={list.data?.items ?? []}
        empty='아직 등록한 구매품의서가 없습니다. 구매품의서 작성 버튼으로 첫 품의서를 등록해 주세요.'
        onRowClick={(row) => setSelected(row)}
        columns={[
          { key: 'title', label: '품의 제목' },
          { key: 'requisitionAmount', label: '품의 금액', render: (r) => <Num value={r['requisitionAmount']} /> },
          { key: 'totalBudgetAmount', label: '예산총액', render: (r) => <Num value={r['totalBudgetAmount']} /> },
          { key: 'executedAmount', label: '집행액', render: (r) => <Num value={r['executedAmount']} /> },
          { key: 'budgetBalanceAmount', label: '예산잔액', render: (r) => <Num value={r['budgetBalanceAmount']} /> },
        ]}
      />
      <Pager page={page} size={list.data?.size ?? 20} total={list.data?.total ?? 0} onPage={setPage} />
      {drawers}
    </div>
  );
}
