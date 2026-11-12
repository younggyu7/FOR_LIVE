import { useState } from 'react';
import { Badge, Band, DataTable, DateText, Drawer, Field, Filters, Form, Num, NumberInput, Pager, Pairs, Select, TextInput, call, useData } from '../kit';
import type { Page, PageProps, Row } from '../kit';

// 가정: 원천세 신고 기준정보는 설정 분류 '원천세'로 모아 둔다.
const SETTING_CATEGORY = '원천세';
const SIZE = 20;

const FILING_TYPES: [string, string][] = [
  ['WITHHOLDING_STATUS', '원천징수이행상황신고서'],
  ['TUITION_REPAYMENT', '학자금상환금명세서'],
  ['LOCAL_INCOME_TAX', '지방소득세'],
  ['RESIDENT_TAX_EMPLOYEE', '주민세 종업원분'],
  ['SIMPLIFIED_PAYMENT', '간이지급명세서'],
  ['SUBMISSION_SUMMARY', '제출집계표'],
  ['PAYMENT_MEDIA', '지급명세 전산매체'],
];

const STATUS_LABEL: Record<string, string> = {
  DRAFT: '작성 중',
  SUCCESS: '완료',
  FAILURE: '실패',
};

function typeName(value: unknown): string {
  const found = FILING_TYPES.find((t) => t[0] === value);
  return found ? found[1] : String(value ?? '');
}

function statusName(value: unknown): string {
  return STATUS_LABEL[String(value)] ?? String(value ?? '');
}

export default function FnSfr02301Page({ role, notify }: PageProps) {
  const [view, setView] = useState<'list' | 'settings'>('list');
  const [selected, setSelected] = useState<Row | null>(null);
  const [drawer, setDrawer] = useState<'generate' | 'edit' | 'setting' | null>(null);
  const [page, setPage] = useState(0);
  const [typeInput, setTypeInput] = useState('');
  const [attrInput, setAttrInput] = useState('');
  const [payInput, setPayInput] = useState('');
  const [filters, setFilters] = useState<Row>({});

  const [genAttr, setGenAttr] = useState('');
  const [genPay, setGenPay] = useState('');
  const [editAmount, setEditAmount] = useState<number | string>('');
  const [editCategory, setEditCategory] = useState('');

  const [settingRow, setSettingRow] = useState<Row | null>(null);
  const [settingValue, setSettingValue] = useState('');

  const filings = useData<Page>(
    () => call<Page>('GET', '/tax-filings', role, undefined, { ...filters, page, size: SIZE }),
    [role, filters, page],
  );
  const settings = useData<Page>(
    async () => {
      if (view !== 'settings') {
        return { items: [], page: 0, size: SIZE, total: 0 };
      }
      return call<Page>('GET', '/system-settings', role, undefined, { category: SETTING_CATEGORY, size: 200 });
    },
    [role, view],
  );

  function search() {
    setPage(0);
    setFilters({ filingType: typeInput, attributionMonth: attrInput, paymentMonth: payInput });
  }

  function reset() {
    setTypeInput('');
    setAttrInput('');
    setPayInput('');
    setPage(0);
    setFilters({});
  }

  function openGenerate() {
    setGenAttr('');
    setGenPay('');
    setDrawer('generate');
  }

  function openEdit(row: Row) {
    setEditAmount(row.totalAmount === null || row.totalAmount === undefined ? '' : (row.totalAmount as number));
    setEditCategory('');
    setDrawer('edit');
  }

  async function generate() {
    if (!genAttr.trim() || !genPay.trim()) {
      throw new Error('귀속연월과 지급연월을 모두 입력해 주세요.');
    }
    await call('POST', '/tax-filings/generate', role, { attributionMonth: genAttr.trim(), paymentMonth: genPay.trim() });
    notify('신고서를 생성했습니다.');
    setDrawer(null);
    filings.reload();
  }

  async function saveFiling() {
    if (!selected) {
      return;
    }
    if (editAmount === '' || editAmount === null) {
      throw new Error('집계 금액을 입력해 주세요.');
    }
    const body: Row = { totalAmount: editAmount };
    if (editCategory.trim()) {
      body.incomeCategory = editCategory.trim();
    }
    const saved = await call('PUT', `/tax-filings/${selected.taxFilingId}`, role, body);
    notify('신고서를 저장했습니다.');
    setSelected({ ...selected, totalAmount: saved.totalAmount, filingStatus: saved.filingStatus });
    setDrawer(null);
    filings.reload();
  }

  async function saveSetting() {
    if (!settingRow) {
      return;
    }
    if (!settingValue.trim()) {
      throw new Error('설정 값을 입력해 주세요.');
    }
    await call('PUT', `/system-settings/${settingRow.systemSettingId}`, role, { settingValue: settingValue.trim() });
    notify('기준정보를 저장했습니다.');
    setDrawer(null);
    settings.reload();
  }

  if (view === 'settings') {
    const settingRows = settings.data ? settings.data.items : [];
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setView('list')}>신고서 목록으로</button>
        <section className='box'>
          <h2>원천세 신고 기준정보</h2>
          <p>신고서를 작성하기 전에 기준정보를 설정해 주세요. 항목을 누르면 값을 고칠 수 있습니다.</p>
          <DataTable
            columns={[
              { key: 'settingName', label: '설정 항목명' },
              { key: 'settingKey', label: '설정 키' },
              { key: 'settingValue', label: '설정 값' },
            ]}
            rows={settingRows}
            onRowClick={(row) => {
              setSettingRow(row);
              setSettingValue(String(row.settingValue ?? ''));
              setDrawer('setting');
            }}
            empty='아직 등록한 기준정보가 없습니다.'
          />
        </section>
        {drawer === 'setting' && settingRow && (
          <Drawer title='기준정보 수정' onClose={() => setDrawer(null)}>
            <Form onSubmit={saveSetting} submit='저장'>
              <Field label='설정 항목명'>
                <span>{String(settingRow.settingName ?? settingRow.settingKey ?? '')}</span>
              </Field>
              <Field label='설정 값' required wide>
                <TextInput value={settingValue} onChange={setSettingValue} />
              </Field>
            </Form>
          </Drawer>
        )}
      </div>
    );
  }

  if (selected) {
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setSelected(null)}>목록으로</button>
        <section className='box'>
          <h2>신고서 내용</h2>
          <Pairs
            items={[
              ['신고서 유형', typeName(selected.filingType)],
              ['귀속연월', String(selected.attributionMonth ?? '')],
              ['지급연월', String(selected.paymentMonth ?? '')],
              ['집계 금액', <Num value={selected.totalAmount} />],
              ['신고 상태', <Badge value={statusName(selected.filingStatus)} />],
            ]}
          />
        </section>
        <section className='box'>
          <h2>전자신고 결과</h2>
          <Pairs
            items={[
              ['전자신고 일시', <DateText value={selected.filedAt} time />],
              ['전자신고 결과 메시지', String(selected.resultMessage ?? '')],
              ['접수번호', String(selected.receiptNumber ?? '')],
            ]}
          />
        </section>
        {selected.filingStatus !== 'SUCCESS' && (
          <div>
            <button onClick={() => openEdit(selected)}>내용 수정</button>
          </div>
        )}
        {drawer === 'edit' && (
          <Drawer title='신고서 내용 수정' onClose={() => setDrawer(null)}>
            <Form onSubmit={saveFiling} submit='저장'>
              <Field label='집계 금액' required>
                <NumberInput value={editAmount} onChange={setEditAmount} />
              </Field>
              <Field label='소득 구분'>
                <TextInput value={editCategory} onChange={setEditCategory} />
              </Field>
            </Form>
          </Drawer>
        )}
      </div>
    );
  }

  const data = filings.data;
  return (
    <div className='doc'>
      <section className='box'>
        <h2>원천세 신고서</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label='신고서 유형'>
            <Select value={typeInput} onChange={setTypeInput} options={FILING_TYPES} placeholder='전체' />
          </Field>
          <Field label='귀속연월'>
            <TextInput value={attrInput} onChange={setAttrInput} placeholder='YYYYMM' />
          </Field>
          <Field label='지급연월'>
            <TextInput value={payInput} onChange={setPayInput} placeholder='YYYYMM' />
          </Field>
        </Filters>
        <Band total={data ? data.total : undefined}>
          <button className='ghost' onClick={() => setView('settings')}>기준정보 설정</button>
          <button onClick={openGenerate}>신고서 작성</button>
        </Band>
        {filings.error && <p>{filings.error}</p>}
        <DataTable
          columns={[
            { key: 'filingType', label: '신고서 유형', render: (row) => <span>{typeName(row.filingType)}</span> },
            { key: 'attributionMonth', label: '귀속연월' },
            { key: 'paymentMonth', label: '지급연월' },
            { key: 'totalAmount', label: '집계 금액', render: (row) => <Num value={row.totalAmount} /> },
            { key: 'filingStatus', label: '신고 상태', render: (row) => <Badge value={statusName(row.filingStatus)} /> },
          ]}
          rows={data ? data.items : []}
          onRowClick={(row) => setSelected(row)}
          empty='아직 작성한 신고서가 없습니다. 신고서 작성을 눌러 시작해 주세요.'
        />
        {data && <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} />}
      </section>
      {drawer === 'generate' && (
        <Drawer title='신고서 작성' onClose={() => setDrawer(null)}>
          <Form
            onSubmit={generate}
            submit='신고서 생성'
            note='급여 데이터를 집계해 원천징수이행상황신고서를 만듭니다. 기준정보가 설정되어 있어야 합니다.'
          >
            <Field label='귀속연월' required hint='예: 202406'>
              <TextInput value={genAttr} onChange={setGenAttr} placeholder='YYYYMM' />
            </Field>
            <Field label='지급연월' required hint='예: 202407'>
              <TextInput value={genPay} onChange={setGenPay} placeholder='YYYYMM' />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
