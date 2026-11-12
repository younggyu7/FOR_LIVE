import { useState } from 'react';
import { call, useData, Badge, Filters, Band, DataTable, Pager, Drawer, Form, Field, TextInput, NumberInput, Select, LookupSelect, RefName, Num } from '../kit';
import type { PageProps, Page, Row } from '../kit';

const ITEM_TYPE_OPTIONS: [string, string][] = [['지급', '지급'], ['공제', '공제']];
const USE_OPTIONS: [string, string][] = [['사용', '사용'], ['미사용', '미사용']];

function ItemsView({ role, notify }: PageProps) {
  const [filterType, setFilterType] = useState('');
  const [itemType, setItemType] = useState('');
  const [page, setPage] = useState(0);
  const [drawer, setDrawer] = useState<null | 'create' | Row>(null);
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [useYn, setUseYn] = useState('사용');
  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/payroll-items', role, undefined, { itemType, page, size: 20 }),
    [itemType, page],
  );

  function openCreate() {
    setType('');
    setName('');
    setUseYn('사용');
    setDrawer('create');
  }

  function openEdit(row: Row) {
    setName(String(row.itemName ?? ''));
    setUseYn(String(row.useYn ?? '사용'));
    setDrawer(row);
  }

  async function submit() {
    if (drawer === 'create') {
      if (!type) {
        throw new Error('지급공제 구분을 선택해 주세요.');
      }
      if (!name.trim()) {
        throw new Error('항목명을 입력해 주세요.');
      }
      await call('POST', '/payroll-items', role, { itemType: type, itemName: name, useYn });
      notify('지급공제항목을 등록했습니다.');
    } else if (drawer) {
      if (!name.trim()) {
        throw new Error('항목명을 입력해 주세요.');
      }
      await call('PATCH', '/payroll-items/' + drawer.payrollItemId, role, { itemName: name, useYn });
      notify('지급공제항목을 수정했습니다.');
    }
    setDrawer(null);
    reload();
  }

  return (
    <section className="box">
      <h2>지급공제항목</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setItemType(filterType);
        }}
        onReset={() => {
          setFilterType('');
          setItemType('');
          setPage(0);
        }}
      >
        <Field label="지급공제 구분">
          <Select value={filterType} onChange={setFilterType} options={ITEM_TYPE_OPTIONS} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>항목 등록</button>
      </Band>
      {error ? <p>{error}</p> : null}
      <DataTable
        rows={data?.items ?? []}
        empty="아직 등록한 항목이 없습니다. 항목 등록 버튼으로 첫 항목을 추가해 주세요."
        columns={[
          { key: 'itemType', label: '지급공제 구분' },
          { key: 'itemName', label: '항목명' },
          { key: 'useYn', label: '사용 여부', render: (r) => <Badge value={r.useYn} /> },
          {
            key: 'actions',
            label: '처리',
            render: (r) => (
              <button className="ghost" onClick={() => openEdit(r)}>
                수정
              </button>
            ),
          },
        ]}
      />
      <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      {drawer ? (
        <Drawer title={drawer === 'create' ? '지급공제항목 등록' : '지급공제항목 수정'} onClose={() => setDrawer(null)}>
          <Form onSubmit={submit} submit={drawer === 'create' ? '등록' : '저장'}>
            {drawer === 'create' ? (
              <Field label="지급공제 구분" required>
                <Select value={type} onChange={setType} options={ITEM_TYPE_OPTIONS} />
              </Field>
            ) : null}
            <Field label="항목명" required>
              <TextInput value={name} onChange={setName} />
            </Field>
            <Field label="사용 여부">
              <Select value={useYn} onChange={setUseYn} options={USE_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </section>
  );
}

function RequestsView({ role, notify }: PageProps) {
  const [filterYear, setFilterYear] = useState<number | string>('');
  const [taxYearQuery, setTaxYearQuery] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [drawer, setDrawer] = useState<null | 'create' | Row>(null);
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [taxYear, setTaxYear] = useState<number | string>('');
  const [rate, setRate] = useState<number | string>('');
  const [amount, setAmount] = useState<number | string>('');
  const [reason, setReason] = useState('');
  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/withholding-adjustment-requests', role, undefined, { taxYear: taxYearQuery, page, size: 20 }),
    [taxYearQuery, page],
  );

  function openCreate() {
    setEmployeeId('');
    setTaxYear('');
    setRate('');
    setAmount('');
    setReason('');
    setDrawer('create');
  }

  function openEdit(row: Row) {
    setRate(row.adjustmentRate === null || row.adjustmentRate === undefined ? '' : (row.adjustmentRate as number));
    setReason(String(row.reason ?? ''));
    setDrawer(row);
  }

  async function submit() {
    if (drawer === 'create') {
      if (employeeId === '' || taxYear === '') {
        throw new Error('신청 임직원과 조정 대상 연도를 입력해 주세요.');
      }
      await call('POST', '/withholding-adjustment-requests', role, {
        employeeId,
        taxYear,
        adjustmentRate: rate,
        adjustmentAmount: amount,
        reason,
      });
      notify('원천징수세액 조정 신청을 등록했습니다.');
    } else if (drawer) {
      await call('PATCH', '/withholding-adjustment-requests/' + drawer.withholdingAdjustmentRequestId, role, {
        adjustmentRate: rate,
        reason,
      });
      notify('원천징수세액 조정 신청을 수정했습니다.');
    }
    setDrawer(null);
    reload();
  }

  return (
    <section className="box">
      <h2>원천징수세액 조정 신청</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setTaxYearQuery(filterYear);
        }}
        onReset={() => {
          setFilterYear('');
          setTaxYearQuery('');
          setPage(0);
        }}
      >
        <Field label="조정 대상 연도">
          <NumberInput value={filterYear} onChange={setFilterYear} />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>조정 신청 등록</button>
      </Band>
      {error ? <p>{error}</p> : null}
      <DataTable
        rows={data?.items ?? []}
        empty="아직 등록한 신청 내역이 없습니다. 조정 신청 등록 버튼으로 신청해 주세요."
        columns={[
          { key: 'employeeId', label: '신청 임직원', render: (r) => <RefName table="employee" role={role} value={r.employeeId} /> },
          { key: 'taxYear', label: '조정 대상 연도' },
          { key: 'adjustmentRate', label: '조정 세율(%)', render: (r) => <Num value={r.adjustmentRate} /> },
          { key: 'approvalStatus', label: '승인 상태', render: (r) => <Badge value={r.approvalStatus} /> },
          {
            key: 'actions',
            label: '처리',
            render: (r) =>
              r.approvalStatus === '승인' || r.approvalStatus === '마감' ? null : (
                <button className="ghost" onClick={() => openEdit(r)}>
                  수정
                </button>
              ),
          },
        ]}
      />
      <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      {drawer ? (
        <Drawer title={drawer === 'create' ? '조정 신청 등록' : '조정 신청 수정'} onClose={() => setDrawer(null)}>
          <Form onSubmit={submit} submit={drawer === 'create' ? '등록' : '저장'}>
            {drawer === 'create' ? (
              <>
                <Field label="신청 임직원" required>
                  <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
                </Field>
                <Field label="조정 대상 연도" required>
                  <NumberInput value={taxYear} onChange={setTaxYear} />
                </Field>
              </>
            ) : null}
            <Field label="조정 세율(%)">
              <NumberInput value={rate} onChange={setRate} />
            </Field>
            {drawer === 'create' ? (
              <Field label="조정 금액">
                <NumberInput value={amount} onChange={setAmount} />
              </Field>
            ) : null}
            <Field label="신청 사유" wide>
              <TextInput value={reason} onChange={setReason} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </section>
  );
}

export default function FnSfr02003Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'items' | 'requests'>('items');
  return (
    <div className="doc">
      <h1>공제항목 및 원천징수세액 조정 관리</h1>
      <div>
        <button className={tab === 'items' ? '' : 'ghost'} onClick={() => setTab('items')}>
          지급공제항목
        </button>
        <button className={tab === 'requests' ? '' : 'ghost'} onClick={() => setTab('requests')}>
          원천징수세액 조정 신청
        </button>
      </div>
      {tab === 'items' ? <ItemsView role={role} notify={notify} /> : <RequestsView role={role} notify={notify} />}
    </div>
  );
}
