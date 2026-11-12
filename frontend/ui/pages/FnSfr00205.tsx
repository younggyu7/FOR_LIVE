import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; row: Row }
  | { kind: 'delete'; row: Row }
  | null;

const STATUS_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];

export default function FnSfr00205Page({ role, notify }: PageProps) {
  const [partnerInput, setPartnerInput] = useState<number | string>('');
  const [partnerId, setPartnerId] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<Mode>(null);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [useStatus, setUseStatus] = useState('사용');
  const [formPartner, setFormPartner] = useState<number | string>('');

  const { data, error, reload } = useData<Page>(async () => {
    if (partnerId === '') {
      return { items: [], page: 0, size: 20, total: 0 };
    }
    return call<Page>('GET', '/partner-accounts', role, undefined, { partnerId, page, size: 20 });
  }, [partnerId, page, role]);

  function search() {
    setPage(0);
    setPartnerId(partnerInput);
  }

  function reset() {
    setPartnerInput('');
    setPartnerId('');
    setPage(0);
  }

  function openCreate() {
    setBankName('');
    setAccountNumber('');
    setAccountHolder('');
    setUseStatus('사용');
    setFormPartner(partnerId);
    setMode({ kind: 'create' });
  }

  function openEdit(row: Row) {
    setBankName(String(row['bankName'] ?? ''));
    setAccountNumber('');
    setAccountHolder(String(row['accountHolder'] ?? ''));
    setUseStatus(String(row['useStatus'] ?? '사용'));
    setMode({ kind: 'edit', row });
  }

  async function create() {
    if (formPartner === '' || bankName.trim() === '' || accountNumber.trim() === '' || accountHolder.trim() === '') {
      throw new Error('거래처, 은행, 계좌번호, 예금주를 모두 입력해 주세요.');
    }
    await call('POST', '/partner-accounts', role, {
      partnerId: formPartner,
      bankName,
      accountNumber,
      accountHolder,
      useStatus,
    });
    notify('거래처 계좌를 등록했습니다.');
    setMode(null);
    reload();
  }

  async function update(row: Row) {
    if (bankName.trim() === '' || accountHolder.trim() === '') {
      throw new Error('은행과 예금주를 입력해 주세요.');
    }
    const body: Row = { bankName, accountHolder, useStatus };
    if (accountNumber.trim() !== '') {
      body['accountNumber'] = accountNumber;
    }
    await call('PATCH', '/partner-accounts/' + String(row['partnerAccountId']), role, body);
    notify('거래처 계좌를 수정했습니다.');
    setMode(null);
    reload();
  }

  async function remove(row: Row) {
    await call('DELETE', '/partner-accounts/' + String(row['partnerAccountId']), role);
    notify('거래처 계좌를 삭제했습니다.');
    setMode(null);
    reload();
  }

  const rows = data?.items ?? [];

  return (
    <div className="doc">
      <section className="box">
        <h2>거래처 계좌</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="거래처" required>
            <LookupSelect table="partner" role={role} value={partnerInput} onChange={setPartnerInput} />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total}>
          <button onClick={openCreate}>계좌 등록</button>
        </Band>
        <DataTable
          columns={[
            { key: 'partnerId', label: '거래처', render: (r) => <RefName table="partner" role={role} value={r['partnerId']} /> },
            { key: 'bankName', label: '은행' },
            { key: 'accountHolder', label: '예금주' },
            { key: 'useStatus', label: '사용 여부', render: (r) => <Badge value={r['useStatus']} /> },
            {
              key: 'partnerAccountId',
              label: '처리',
              render: (r) => (
                <span>
                  <button className="ghost" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>수정</button>
                  <button className="ghost" onClick={(e) => { e.stopPropagation(); setMode({ kind: 'delete', row: r }); }}>삭제</button>
                </span>
              ),
            },
          ]}
          rows={rows}
          empty={partnerId === '' ? '거래처를 선택하고 조회해 주세요.' : '아직 등록한 계좌가 없습니다. 계좌 등록 버튼으로 추가해 주세요.'}
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </section>

      {mode && mode.kind === 'create' ? (
        <Drawer title="거래처 계좌 등록" onClose={() => setMode(null)}>
          <Form onSubmit={create} submit="등록">
            <Field label="거래처" required>
              <LookupSelect table="partner" role={role} value={formPartner} onChange={setFormPartner} />
            </Field>
            <Field label="은행" required>
              <TextInput value={bankName} onChange={setBankName} />
            </Field>
            <Field label="계좌번호" required hint="평문 계좌번호를 입력합니다.">
              <TextInput value={accountNumber} onChange={setAccountNumber} />
            </Field>
            <Field label="예금주" required>
              <TextInput value={accountHolder} onChange={setAccountHolder} />
            </Field>
            <Field label="사용 여부">
              <Select value={useStatus} onChange={setUseStatus} options={STATUS_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode && mode.kind === 'edit' ? (
        <Drawer title="거래처 계좌 수정" onClose={() => setMode(null)}>
          <Form onSubmit={() => update(mode.row)} submit="저장">
            <Field label="은행" required>
              <TextInput value={bankName} onChange={setBankName} />
            </Field>
            <Field label="계좌번호" hint="바꿀 때만 입력합니다. 비우면 기존 계좌번호를 유지합니다.">
              <TextInput value={accountNumber} onChange={setAccountNumber} />
            </Field>
            <Field label="예금주" required>
              <TextInput value={accountHolder} onChange={setAccountHolder} />
            </Field>
            <Field label="사용 여부">
              <Select value={useStatus} onChange={setUseStatus} options={STATUS_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      ) : null}

      {mode && mode.kind === 'delete' ? (
        <Drawer title="거래처 계좌 삭제" onClose={() => setMode(null)}>
          <Form
            onSubmit={() => remove(mode.row)}
            submit="삭제"
            danger
            note="삭제한 계좌는 되돌릴 수 없습니다. 더 쓰지 않는 계좌라면 수정에서 사용 여부를 미사용으로 바꿔 주세요."
          >
            <p>{String(mode.row['bankName'] ?? '')} 계좌를 삭제합니다.</p>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
