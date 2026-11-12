import { useState } from 'react';
import {
  call, useData, Badge, Num, DateText, Filters, Band, DataTable, Pager, Drawer, Pairs,
  Form, Field, TextInput, NumberInput, Select, LookupSelect, RefName, ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const DOC_TYPES: [string, string][] = [
  ['PAYMENT_STATEMENT', '지급명세서'],
  ['WITHHOLDING_RECEIPT', '원천징수영수증'],
];

function docLabel(value: unknown): string {
  const found = DOC_TYPES.find((d) => d[0] === value);
  return found ? found[1] : String(value ?? '');
}

export default function FnSfr02304Page({ role, notify }: PageProps) {
  const [filter, setFilter] = useState<Row>({});
  const [query, setQuery] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [mode, setMode] = useState<'none' | 'generate' | 'edit'>('none');
  const [genMonth, setGenMonth] = useState('');
  const [genWorker, setGenWorker] = useState<number | string>('');
  const [editTotal, setEditTotal] = useState<number | string>('');
  const [editTax, setEditTax] = useState<number | string>('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/income-certificates', role, undefined, { ...query, page: pageNo, size: 20 }),
    [query, pageNo, role],
  );

  const search = () => {
    setPageNo(0);
    setQuery({ ...filter });
  };

  const reset = () => {
    setFilter({});
    setPageNo(0);
    setQuery({});
  };

  const openGenerate = () => {
    setGenMonth('');
    setGenWorker('');
    setMode('generate');
  };

  const openEdit = () => {
    if (!selected) return;
    setEditTotal(selected['totalPaymentAmount'] as number | string);
    setEditTax(selected['withheldTaxAmount'] as number | string);
    setMode('edit');
  };

  const submitGenerate = async () => {
    if (!/^[0-9]{4}(0[1-9]|1[0-2])$/.test(genMonth)) {
      throw new Error('지급연월을 YYYYMM 형식으로 입력해 주세요. 예: 202405');
    }
    const body: Row = { paymentMonth: genMonth };
    if (genWorker !== '') body['dailyWorkerId'] = genWorker;
    await call('POST', '/income-certificates/generate-daily', role, body);
    notify('지급명세서와 원천징수영수증을 생성했습니다.');
    setMode('none');
    setPageNo(0);
    reload();
  };

  const submitEdit = async () => {
    if (!selected) return;
    if (editTotal === '' || editTax === '') {
      throw new Error('총지급액과 원천징수세액을 모두 입력해 주세요.');
    }
    const res = await call('PUT', '/income-certificates/' + String(selected['incomeCertificateId']), role, {
      totalPaymentAmount: editTotal,
      withheldTaxAmount: editTax,
    });
    notify('지급명세서·영수증을 저장했습니다.');
    setSelected({ ...selected, ...res });
    setMode('none');
    reload();
  };

  const drawer = (
    <>
      {mode === 'generate' && (
        <Drawer title='지급명세서 생성' onClose={() => setMode('none')}>
          <Form
            onSubmit={submitGenerate}
            submit='생성'
            note='선택한 지급연월의 일용근로자 지급 데이터로 지급명세서와 원천징수영수증을 함께 만듭니다.'
          >
            <Field label='지급연월 (YYYYMM)' required>
              <TextInput value={genMonth} onChange={setGenMonth} placeholder='예: 202405' />
            </Field>
            <Field label='일용직 사원' hint='비우면 지급 데이터가 있는 모든 일용직 사원이 대상입니다.'>
              <LookupSelect table='daily_worker' role={role} value={genWorker} onChange={setGenWorker} placeholder='전체' />
            </Field>
          </Form>
        </Drawer>
      )}
      {mode === 'edit' && selected && (
        <Drawer title='지급명세서·영수증 수정' onClose={() => setMode('none')}>
          <Form onSubmit={submitEdit} submit='저장'>
            <Field label='총지급액' required>
              <NumberInput value={editTotal} onChange={setEditTotal} />
            </Field>
            <Field label='원천징수세액' required>
              <NumberInput value={editTax} onChange={setEditTax} />
            </Field>
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
          <h2>{docLabel(selected['documentType'])}</h2>
          <Pairs
            items={[
              ['일용직 사원', <RefName table='daily_worker' role={role} value={selected['dailyWorkerId']} />],
              ['문서 종류', <Badge value={docLabel(selected['documentType'])} />],
              ['귀속 시작일', <DateText value={selected['periodStart']} />],
              ['귀속 종료일', <DateText value={selected['periodEnd']} />],
              ['발급 일시', <DateText value={selected['issuedAt']} time />],
            ]}
          />
        </section>
        <section className='box'>
          <h2>금액</h2>
          <Pairs
            items={[
              ['총지급액', <Num value={selected['totalPaymentAmount']} />],
              ['원천징수세액', <Num value={selected['withheldTaxAmount']} />],
            ]}
          />
        </section>
        <section className='box'>
          <h2>처리</h2>
          <button onClick={openEdit}>내용 수정</button>
          <button className='ghost' onClick={() => window.print()}>출력</button>
        </section>
        {drawer}
      </div>
    );
  }

  return (
    <div className='doc'>
      <section className='box'>
        <h2>일용근로소득 지급명세서 및 영수증</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label='일용직 사원'>
            <LookupSelect
              table='daily_worker'
              role={role}
              value={filter['dailyWorkerId']}
              onChange={(v) => setFilter({ ...filter, dailyWorkerId: v })}
              placeholder='전체'
            />
          </Field>
          <Field label='문서 종류'>
            <Select
              value={filter['documentType']}
              onChange={(v) => setFilter({ ...filter, documentType: v })}
              options={DOC_TYPES}
              placeholder='전체'
            />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openGenerate}>지급명세서 생성</button>
        </Band>
        {error && <ErrorText text={error} />}
        <DataTable
          columns={[
            { key: 'dailyWorkerId', label: '일용직 사원', render: (r) => <RefName table='daily_worker' role={role} value={r['dailyWorkerId']} /> },
            { key: 'documentType', label: '문서 종류', render: (r) => <Badge value={docLabel(r['documentType'])} /> },
            {
              key: 'periodStart',
              label: '귀속 기간',
              render: (r) => (
                <span>
                  <DateText value={r['periodStart']} /> ~ <DateText value={r['periodEnd']} />
                </span>
              ),
            },
            { key: 'totalPaymentAmount', label: '총지급액', render: (r) => <Num value={r['totalPaymentAmount']} /> },
            { key: 'withheldTaxAmount', label: '원천징수세액', render: (r) => <Num value={r['withheldTaxAmount']} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty={loading ? '불러오는 중입니다.' : '아직 생성한 지급명세서가 없습니다. 지급명세서 생성 버튼으로 시작해 주세요.'}
        />
        <Pager page={pageNo} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
      {drawer}
    </div>
  );
}
