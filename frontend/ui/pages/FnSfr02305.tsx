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
  Form,
  Field,
  NumberInput,
  DateInput,
  Select,
  LookupSelect,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

export default function FnSfr02305Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [pg, setPg] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [editing, setEditing] = useState<Row | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | string>('');
  const [taxAmount, setTaxAmount] = useState<number | string>('');

  const list = useData<Page>(
    () => call<Page>('GET', '/income-certificates', role, undefined, { ...applied, page: pg, size: SIZE }),
    [applied, pg],
  );

  const openEdit = (row: Row) => {
    setEditing(row);
    setTotalAmount(row['totalPaymentAmount'] === null || row['totalPaymentAmount'] === undefined ? '' : (row['totalPaymentAmount'] as number));
    setTaxAmount(row['withheldTaxAmount'] === null || row['withheldTaxAmount'] === undefined ? '' : (row['withheldTaxAmount'] as number));
  };

  const generate = async () => {
    if (employeeId === '') {
      throw new Error('퇴직자를 선택해 주세요.');
    }
    await call('POST', '/income-certificates/generate-retirement', role, { employeeId });
    notify('퇴직소득 원천징수영수증을 생성했습니다.');
    setGenerating(false);
    setEmployeeId('');
    list.reload();
  };

  const save = async () => {
    if (!editing) {
      return;
    }
    if (totalAmount === '' || taxAmount === '') {
      throw new Error('총지급액과 원천징수세액을 입력해 주세요.');
    }
    await call('PUT', '/income-certificates/' + String(editing['incomeCertificateId']), role, {
      totalPaymentAmount: totalAmount,
      withheldTaxAmount: taxAmount,
    });
    notify('영수증 내용을 저장했습니다.');
    setEditing(null);
    list.reload();
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>퇴직소득 원천징수영수증</h2>
        <Filters
          onSearch={() => {
            setPg(0);
            setApplied({ ...draft });
          }}
          onReset={() => {
            setDraft({});
            setPg(0);
            setApplied({});
          }}
        >
          <Field label="문서 종류">
            <Select
              value={draft['documentType']}
              onChange={(v) => setDraft({ ...draft, documentType: v })}
              options={[
                ['PAYMENT_STATEMENT', '지급명세서'],
                ['WITHHOLDING_RECEIPT', '원천징수영수증'],
              ]}
            />
          </Field>
          <Field label="귀속 시작일">
            <DateInput value={draft['periodStart']} onChange={(v) => setDraft({ ...draft, periodStart: v })} />
          </Field>
          <Field label="귀속 종료일">
            <DateInput value={draft['periodEnd']} onChange={(v) => setDraft({ ...draft, periodEnd: v })} />
          </Field>
        </Filters>
        <Band total={list.data?.total}>
          <button onClick={() => setGenerating(true)}>영수증 생성</button>
        </Band>
        {list.error ? <ErrorText text={list.error} /> : null}
        <DataTable
          rows={list.data?.items ?? []}
          empty="아직 생성한 영수증이 없습니다. 영수증 생성 버튼으로 퇴직자의 영수증을 만들어 주세요."
          columns={[
            { key: 'incomeCertificateId', label: '소득 지급명세서·원천징수영수증 ID' },
            { key: 'documentType', label: '문서 종류', render: (r) => <Badge value={r['documentType']} /> },
            {
              key: 'periodStart',
              label: '귀속 기간',
              render: (r) => (
                <span>
                  <DateText value={r['periodStart']} /> ~ <DateText value={r['periodEnd']} />
                </span>
              ),
            },
            {
              key: 'totalPaymentAmount',
              label: '총지급액',
              render: (r) => <Num value={r['totalPaymentAmount']} />,
            },
            {
              key: 'withheldTaxAmount',
              label: '원천징수세액',
              render: (r) => (
                <span>
                  <Num value={r['withheldTaxAmount']} />{' '}
                  <button className="ghost" onClick={() => openEdit(r)}>
                    수정
                  </button>
                </span>
              ),
            },
          ]}
        />
        <Pager page={pg} size={SIZE} total={list.data?.total ?? 0} onPage={setPg} />
      </section>

      {generating ? (
        <Drawer title="퇴직소득 원천징수영수증 생성" onClose={() => setGenerating(false)}>
          <Form
            submit="생성"
            note="퇴직소득 지급 데이터를 기준으로 영수증을 생성합니다. 데이터가 없으면 생성되지 않습니다."
            onSubmit={generate}
          >
            <Field label="임직원" required wide>
              <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {editing ? (
        <Drawer title="영수증 내용 수정" onClose={() => setEditing(null)}>
          <Form submit="저장" onSubmit={save}>
            <Field label="총지급액" required>
              <NumberInput value={totalAmount} onChange={setTotalAmount} />
            </Field>
            <Field label="원천징수세액" required>
              <NumberInput value={taxAmount} onChange={setTaxAmount} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
