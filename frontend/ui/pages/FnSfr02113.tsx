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
  DateInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const DOC_LABELS: Record<string, string> = {
  PAYMENT_STATEMENT: '일용근로소득 지급명세서',
  WITHHOLDING_RECEIPT: '일용근로소득 원천징수영수증',
};

const DOC_OPTIONS: [string, string][] = [
  ['PAYMENT_STATEMENT', '일용근로소득 지급명세서'],
  ['WITHHOLDING_RECEIPT', '일용근로소득 원천징수영수증'],
];

export default function FnSfr02113Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState<Row>({});

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/income-certificates', role, undefined, { ...applied, page, size: 20 }),
    [applied, page, role],
  );

  const search = () => {
    setPage(0);
    setApplied({ ...draft });
  };

  const reset = () => {
    setDraft({});
    setPage(0);
    setApplied({});
  };

  const generate = async () => {
    if (!form.periodStart || !form.periodEnd) {
      throw new Error('귀속 시작일과 종료일을 입력해 주세요.');
    }
    if (String(form.periodEnd) < String(form.periodStart)) {
      throw new Error('귀속 종료일은 시작일보다 빠를 수 없습니다.');
    }
    const result = await call<Row>('POST', '/income-certificates/generate', role, {
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      dailyWorkerId: form.dailyWorkerId === '' ? undefined : form.dailyWorkerId,
    });
    notify('지급명세서·원천징수영수증 ' + String(result.generatedCount) + '건을 생성했습니다.');
    setGenerating(false);
    setForm({});
    reload();
  };

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>{DOC_LABELS[String(selected.documentType)] ?? '문서'}</h2>
          <Pairs
            items={[
              ['일용직 사원', <RefName table="daily_worker" role={role} value={selected.dailyWorkerId} />],
              ['문서 종류', <Badge value={DOC_LABELS[String(selected.documentType)] ?? selected.documentType} />],
              ['귀속 시작일', <DateText value={selected.periodStart} />],
              ['귀속 종료일', <DateText value={selected.periodEnd} />],
              ['총지급액', <Num value={selected.totalPaymentAmount} />],
              ['원천징수세액', <Num value={selected.withheldTaxAmount} />],
              ['발급 일시', <DateText value={selected.issuedAt} time />],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>일용근로소득 지급명세서·원천징수영수증</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="귀속 시작일">
            <DateInput value={draft.periodStart} onChange={(v) => setDraft({ ...draft, periodStart: v })} />
          </Field>
          <Field label="귀속 종료일">
            <DateInput value={draft.periodEnd} onChange={(v) => setDraft({ ...draft, periodEnd: v })} />
          </Field>
          <Field label="일용직 사원">
            <LookupSelect
              table="daily_worker"
              role={role}
              value={draft.dailyWorkerId}
              onChange={(v) => setDraft({ ...draft, dailyWorkerId: v })}
              placeholder="전체"
            />
          </Field>
          <Field label="문서 종류">
            <Select
              value={draft.documentType}
              onChange={(v) => setDraft({ ...draft, documentType: v })}
              options={DOC_OPTIONS}
              placeholder="전체"
            />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button
            onClick={() => {
              setForm({});
              setGenerating(true);
            }}
          >
            명세서·영수증 생성
          </button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        {loading ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          columns={[
            {
              key: 'dailyWorkerId',
              label: '일용직 사원',
              render: (r) => <RefName table="daily_worker" role={role} value={r.dailyWorkerId} />,
            },
            {
              key: 'documentType',
              label: '문서 종류',
              render: (r) => <Badge value={DOC_LABELS[String(r.documentType)] ?? r.documentType} />,
            },
            {
              key: 'periodStart',
              label: '귀속 기간',
              render: (r) => (
                <span>
                  <DateText value={r.periodStart} /> ~ <DateText value={r.periodEnd} />
                </span>
              ),
            },
            { key: 'totalPaymentAmount', label: '총지급액', render: (r) => <Num value={r.totalPaymentAmount} /> },
            { key: 'withheldTaxAmount', label: '원천징수세액', render: (r) => <Num value={r.withheldTaxAmount} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty="아직 생성한 문서가 없습니다. 명세서·영수증 생성 버튼으로 귀속 기간을 지정해 만들어 주세요."
        />
        <Pager page={page} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {generating ? (
        <Drawer title="명세서·영수증 생성" onClose={() => setGenerating(false)}>
          <Form
            onSubmit={generate}
            submit="생성"
            note="지정한 기간의 일용직 급여로 지급명세서와 원천징수영수증을 각각 생성합니다. 이미 생성한 문서는 다시 계산합니다."
          >
            <Field label="귀속 시작일" required>
              <DateInput value={form.periodStart} onChange={(v) => setForm({ ...form, periodStart: v })} />
            </Field>
            <Field label="귀속 종료일" required>
              <DateInput value={form.periodEnd} onChange={(v) => setForm({ ...form, periodEnd: v })} />
            </Field>
            <Field label="일용직 사원" hint="비우면 기간 내 지급 대상 전체를 생성합니다.">
              <LookupSelect
                table="daily_worker"
                role={role}
                value={form.dailyWorkerId}
                onChange={(v) => setForm({ ...form, dailyWorkerId: v })}
                placeholder="전체"
              />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
