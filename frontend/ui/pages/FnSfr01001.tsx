import { useState } from 'react';
import {
  call,
  useData,
  Num,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  NumberInput,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

type Panel =
  | { kind: 'create' }
  | { kind: 'edit'; row: Row }
  | { kind: 'delete'; row: Row };

export default function FnSfr01001Page({ role, notify }: PageProps) {
  const [period, setPeriod] = useState('');
  const [unitId, setUnitId] = useState<number | string>('');
  const [applied, setApplied] = useState<{ period: string; unitId: number | string } | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [form, setForm] = useState<Row>({});

  const { data, error, loading, reload } = useData<Page>(async () => {
    if (!applied) {
      return { items: [], page: 0, size: 20, total: 0 };
    }
    return call<Page>('GET', '/closing-data', role, undefined, {
      closingPeriod: applied.period,
      accountingUnitId: applied.unitId,
      page: pageNo,
    });
  }, [applied, pageNo, role]);

  function search() {
    if (period.trim() === '' || unitId === '') {
      notify('결산 기간과 회계단위를 선택해 주세요.');
      return;
    }
    setPageNo(0);
    setApplied({ period: period.trim(), unitId });
  }

  function reset() {
    setPeriod('');
    setUnitId('');
    setApplied(null);
    setPageNo(0);
  }

  function openCreate() {
    setForm({
      closingPeriod: applied ? applied.period : period,
      accountingUnitId: applied ? applied.unitId : unitId,
      accountSubjectId: '',
      projectId: '',
      departmentId: '',
      closingAmount: '',
    });
    setPanel({ kind: 'create' });
  }

  function openEdit(row: Row) {
    setForm({
      accountSubjectId: row.accountSubjectId ?? '',
      projectId: row.projectId ?? '',
      departmentId: row.departmentId ?? '',
      closingAmount: row.closingAmount ?? '',
    });
    setPanel({ kind: 'edit', row });
  }

  function setField(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function close() {
    setPanel(null);
  }

  async function submitCreate() {
    const missing: string[] = [];
    if (!form.closingPeriod) missing.push('결산 기간');
    if (!form.accountingUnitId) missing.push('회계단위');
    if (!form.accountSubjectId) missing.push('계정과목');
    if (form.closingAmount === '' || form.closingAmount === undefined) missing.push('결산 금액');
    if (missing.length > 0) {
      throw new Error(missing.join(', ') + ' 항목을 입력해 주세요.');
    }
    const body: Row = {
      closingPeriod: form.closingPeriod,
      accountingUnitId: form.accountingUnitId,
      accountSubjectId: form.accountSubjectId,
      closingAmount: form.closingAmount,
    };
    if (form.projectId !== '') body.projectId = form.projectId;
    if (form.departmentId !== '') body.departmentId = form.departmentId;
    await call('POST', '/closing-data', role, body);
    notify('결산자료를 등록했습니다.');
    close();
    reload();
  }

  async function submitEdit(row: Row) {
    if (!form.accountSubjectId) {
      throw new Error('계정과목을 선택해 주세요.');
    }
    if (form.closingAmount === '' || form.closingAmount === undefined) {
      throw new Error('결산 금액을 입력해 주세요.');
    }
    const body: Row = {
      accountSubjectId: form.accountSubjectId,
      projectId: form.projectId === '' ? null : form.projectId,
      departmentId: form.departmentId === '' ? null : form.departmentId,
      closingAmount: form.closingAmount,
    };
    await call('PATCH', '/closing-data/' + String(row.closingDataId), role, body);
    notify('결산자료를 수정했습니다.');
    close();
    reload();
  }

  async function submitDelete(row: Row) {
    await call('DELETE', '/closing-data/' + String(row.closingDataId), role);
    notify('결산자료를 삭제했습니다.');
    close();
    reload();
  }

  const detailFields = (
    <>
      <Field label="계정과목" required>
        <LookupSelect
          table="account_subject"
          role={role}
          value={form.accountSubjectId}
          onChange={(v) => setField('accountSubjectId', v)}
        />
      </Field>
      <Field label="프로젝트">
        <LookupSelect
          table="project"
          role={role}
          value={form.projectId}
          onChange={(v) => setField('projectId', v)}
          placeholder="선택 안 함"
        />
      </Field>
      <Field label="부서">
        <LookupSelect
          table="department"
          role={role}
          value={form.departmentId}
          onChange={(v) => setField('departmentId', v)}
          placeholder="선택 안 함"
        />
      </Field>
      <Field label="결산 금액" required>
        <NumberInput value={form.closingAmount} onChange={(v) => setField('closingAmount', v)} />
      </Field>
    </>
  );

  return (
    <div className="doc">
      <section className="box">
        <h2>결산자료</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="결산 기간" required hint="YYYY-MM 형식">
            <TextInput value={period} onChange={setPeriod} placeholder="2025-01" />
          </Field>
          <Field label="회계단위" required>
            <LookupSelect table="accounting_unit" role={role} value={unitId} onChange={setUnitId} />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openCreate}>결산자료 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        <DataTable
          columns={[
            { key: 'closingPeriod', label: '결산 기간' },
            {
              key: 'accountSubjectId',
              label: '계정과목',
              render: (r) => <RefName table="account_subject" role={role} value={r.accountSubjectId} />,
            },
            {
              key: 'projectId',
              label: '프로젝트·부서',
              render: (r) => (
                <>
                  {r.projectId ? <RefName table="project" role={role} value={r.projectId} /> : '-'}
                  {' / '}
                  {r.departmentId ? <RefName table="department" role={role} value={r.departmentId} /> : '-'}
                </>
              ),
            },
            {
              key: 'closingAmount',
              label: '결산 금액',
              render: (r) => <Num value={r.closingAmount} />,
            },
            {
              key: 'actions',
              label: '처리',
              render: (r) => (
                <>
                  <button
                    className="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(r);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPanel({ kind: 'delete', row: r });
                    }}
                  >
                    삭제
                  </button>
                </>
              ),
            },
          ]}
          rows={data ? data.items : []}
          empty={
            applied
              ? '해당 기간의 결산자료가 없습니다. 결산자료 등록 버튼으로 추가해 주세요.'
              : '결산 기간과 회계단위를 선택한 뒤 조회해 주세요.'
          }
        />
        {loading ? <p>불러오는 중입니다.</p> : null}
        <Pager
          page={data ? data.page : 0}
          size={data ? data.size : 20}
          total={data ? data.total : 0}
          onPage={setPageNo}
        />
      </section>

      {panel && panel.kind === 'create' ? (
        <Drawer title="결산자료 등록" onClose={close}>
          <Form onSubmit={submitCreate} submit="등록">
            <Field label="결산 기간" required hint="YYYY-MM 형식">
              <TextInput value={form.closingPeriod} onChange={(v) => setField('closingPeriod', v)} />
            </Field>
            <Field label="회계단위" required>
              <LookupSelect
                table="accounting_unit"
                role={role}
                value={form.accountingUnitId}
                onChange={(v) => setField('accountingUnitId', v)}
              />
            </Field>
            {detailFields}
          </Form>
        </Drawer>
      ) : null}

      {panel && panel.kind === 'edit' ? (
        <Drawer title="결산자료 수정" onClose={close}>
          <Form onSubmit={() => submitEdit(panel.row)} submit="수정">
            {detailFields}
          </Form>
        </Drawer>
      ) : null}

      {panel && panel.kind === 'delete' ? (
        <Drawer title="결산자료 삭제" onClose={close}>
          <Form
            onSubmit={() => submitDelete(panel.row)}
            submit="삭제"
            danger
            note="삭제한 결산자료는 되돌릴 수 없습니다. 계속하려면 삭제를 누르세요."
          >
            <p>
              {String(panel.row.closingPeriod)} 결산자료의 금액 <Num value={panel.row.closingAmount} />원을 삭제합니다.
            </p>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
