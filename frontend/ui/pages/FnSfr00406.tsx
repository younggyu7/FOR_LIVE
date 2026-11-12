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
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  NumberInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const SIZE = 20;
const METHOD_OPTIONS: [string, string][] = [
  ['카드사용내역', '카드사용내역'],
  ['세금계산서', '세금계산서'],
  ['통장거래내역', '통장거래내역'],
  ['직접입력', '직접입력'],
];
const TYPE_OPTIONS: [string, string][] = [
  ['수입', '수입'],
  ['지출', '지출'],
];
const BULK_HINT = 'projectId, budgetAccountId, partnerId, departmentId, resolutionMethod, resolutionAmount 순서의 머리글로 시작하는 탭 또는 쉼표 구분 내용을 붙여 넣습니다.';

interface BulkResult {
  successCount: number;
  errors: { row: number; reason: string }[];
}

export default function FnSfr00406Page({ role, notify }: PageProps) {
  const [type, setType] = useState('');
  const [projectId, setProjectId] = useState<number | string>('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [drafterId, setDrafterId] = useState<number | string>('');
  const [budgetAccountId, setBudgetAccountId] = useState<number | string>('');
  const [query, setQuery] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<'' | 'create' | 'bulk'>('');

  const [form, setForm] = useState<Row>({ resolutionMethod: '직접입력' });
  const [file, setFile] = useState('');
  const [result, setResult] = useState<BulkResult | undefined>(undefined);

  const list = useData<Page>(
    () => call<Page>('GET', '/expense-resolutions', role, undefined, { ...query, page: page, size: SIZE }),
    [query, page, role],
  );

  const search = () => {
    setPage(0);
    setQuery({
      incomeExpenseType: type,
      projectId: projectId,
      departmentId: departmentId,
      drafterId: drafterId,
      budgetAccountId: budgetAccountId,
    });
  };

  const reset = () => {
    setType('');
    setProjectId('');
    setDepartmentId('');
    setDrafterId('');
    setBudgetAccountId('');
    setPage(0);
    setQuery({});
  };

  const setField = (key: string, value: unknown) => setForm({ ...form, [key]: value });

  const close = () => {
    setMode('');
    setResult(undefined);
  };

  const submitCreate = async () => {
    const required: [string, string][] = [
      ['projectId', '프로젝트'],
      ['budgetAccountId', '예산과목'],
      ['partnerId', '거래처'],
      ['departmentId', '결의부서'],
      ['resolutionMethod', '결의 방식'],
      ['resolutionAmount', '결의 금액'],
    ];
    for (const [key, label] of required) {
      if (form[key] === undefined || form[key] === '') {
        throw new Error(label + ' 값을 입력해 주세요.');
      }
    }
    if (!(Number(form.resolutionAmount) > 0)) {
      throw new Error('결의 금액은 0보다 커야 합니다.');
    }
    await call('POST', '/expense-resolutions', role, form);
    notify('결의서를 등록했습니다.');
    setForm({ resolutionMethod: '직접입력' });
    close();
    list.reload();
  };

  const submitBulk = async () => {
    if (file.trim() === '') {
      throw new Error('지출내역 엑셀 파일 내용을 입력해 주세요.');
    }
    const res = await call<BulkResult>('POST', '/expense-resolutions/bulk-import', role, { file: file });
    setResult(res);
    notify('일괄 등록을 처리했습니다.');
    list.reload();
  };

  const data = list.data;

  return (
    <div className="doc">
      <section className="box">
        <h2>수입·지출 내역</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="거래 유형">
            <Select value={type} onChange={setType} options={TYPE_OPTIONS} placeholder="전체" />
          </Field>
          <Field label="프로젝트">
            <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} placeholder="전체" />
          </Field>
          <Field label="결의부서">
            <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} placeholder="전체" />
          </Field>
          <Field label="작성자">
            <LookupSelect table="employee" role={role} value={drafterId} onChange={setDrafterId} placeholder="전체" />
          </Field>
          <Field label="예산과목">
            <LookupSelect table="budget_account" role={role} value={budgetAccountId} onChange={setBudgetAccountId} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button className="ghost" onClick={() => setMode('bulk')}>지출내역 일괄 등록</button>
          <button onClick={() => setMode('create')}>수입·지출 등록</button>
        </Band>
        {list.error ? <ErrorText text={list.error} /> : null}
        <DataTable
          rows={data?.items ?? []}
          empty="아직 등록한 내역이 없습니다. 수입·지출 등록 버튼으로 첫 거래를 등록해 주세요."
          columns={[
            { key: 'projectId', label: '프로젝트', render: (r) => <RefName table="project" role={role} value={r.projectId} /> },
            { key: 'budgetAccountId', label: '예산과목', render: (r) => <RefName table="budget_account" role={role} value={r.budgetAccountId} /> },
            { key: 'departmentId', label: '결의부서', render: (r) => <RefName table="department" role={role} value={r.departmentId} /> },
            { key: 'resolutionAmount', label: '결의 금액', render: (r) => <Num value={r.resolutionAmount} /> },
            { key: 'status', label: '진행 상태', render: (r) => <Badge value={r.status} /> },
          ]}
        />
        <Pager page={data?.page ?? 0} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>

      {mode === 'create' ? (
        <Drawer title="수입·지출 등록" onClose={close}>
          <Form onSubmit={submitCreate} submit="등록">
            <Field label="품의서">
              <LookupSelect table="requisition" role={role} value={form.requisitionId} onChange={(v) => setField('requisitionId', v)} placeholder="선택 안 함" />
            </Field>
            <Field label="프로젝트" required>
              <LookupSelect table="project" role={role} value={form.projectId} onChange={(v) => setField('projectId', v)} />
            </Field>
            <Field label="예산과목" required>
              <LookupSelect table="budget_account" role={role} value={form.budgetAccountId} onChange={(v) => setField('budgetAccountId', v)} />
            </Field>
            <Field label="거래처" required>
              <LookupSelect table="partner" role={role} value={form.partnerId} onChange={(v) => setField('partnerId', v)} />
            </Field>
            <Field label="결의부서" required>
              <LookupSelect table="department" role={role} value={form.departmentId} onChange={(v) => setField('departmentId', v)} />
            </Field>
            <Field label="결의 방식" required>
              <Select value={form.resolutionMethod} onChange={(v) => setField('resolutionMethod', v)} options={METHOD_OPTIONS} />
            </Field>
            <Field label="결의 금액" required>
              <NumberInput value={form.resolutionAmount} onChange={(v) => setField('resolutionAmount', v)} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode === 'bulk' ? (
        <Drawer title="지출내역 일괄 등록" onClose={close}>
          <Form
            onSubmit={submitBulk}
            submit="일괄 등록"
            note="오류가 있는 행은 반영하지 않고 사유를 알려 드립니다. 정상 행만 등록됩니다."
          >
            <Field label="지출내역 엑셀 파일" required wide hint={BULK_HINT}>
              <TextInput value={file} onChange={setFile} multiline />
            </Field>
          </Form>
          {result ? (
            <section className="box">
              <h2>등록 결과</h2>
              <Pairs items={[['등록 건수', <Num value={result.successCount} />], ['오류 건수', <Num value={result.errors.length} />]]} />
              <DataTable
                rows={result.errors as unknown as Row[]}
                empty="오류 건이 없습니다."
                columns={[
                  { key: 'row', label: '행 번호' },
                  { key: 'reason', label: '오류 사유' },
                ]}
              />
            </section>
          ) : null}
        </Drawer>
      ) : null}
    </div>
  );
}
