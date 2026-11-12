import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  Select,
  LookupSelect,
  RefName,
  DateText,
  Num,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

export default function FnSfr00407Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const [expenseResolutionId, setExpenseResolutionId] = useState<number | string>('');
  const [partnerId, setPartnerId] = useState<number | string>('');
  const [partnerAccountId, setPartnerAccountId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const accounts = useData<Page>(async () => {
    if (partnerId === '') {
      return { items: [], page: 0, size: 200, total: 0 };
    }
    return call<Page>('GET', '/partner-accounts', role, undefined, { partnerId, size: 200 });
  }, [partnerId, role]);

  const accountOptions: [string, string][] = (accounts.data?.items ?? [])
    .filter((a) => a['useStatus'] === '사용')
    .map((a) => [String(a['partnerAccountId']), String(a['bankName']) + ' · ' + String(a['accountHolder'])]);

  function openCreate() {
    setExpenseResolutionId('');
    setPartnerId('');
    setPartnerAccountId('');
    setTransferReason('');
    setCreating(true);
  }

  async function submit() {
    if (expenseResolutionId === '') {
      throw new Error('대체 대상 원 결의서를 선택해 주세요.');
    }
    if (partnerAccountId === '') {
      throw new Error('대체 계좌를 선택해 주세요.');
    }
    if (transferReason.trim() === '') {
      throw new Error('대체 사유를 입력해 주세요.');
    }
    const res = await call('POST', '/account-transfer-resolutions', role, {
      expenseResolutionId,
      partnerAccountId: Number(partnerAccountId),
      transferReason: transferReason.trim(),
    });
    setResults([
      {
        accountTransferResolutionId: res['accountTransferResolutionId'],
        expenseResolutionId,
        partnerAccountId: Number(partnerAccountId),
        transferReason: transferReason.trim(),
        processedAt: res['processedAt'],
      },
      ...results,
    ]);
    notify('계좌 대체를 등록하고 대체결의를 처리했습니다.');
    setCreating(false);
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>은행계좌 대체 및 대체결의 처리</h2>
        <Band total={results.length}>
          <button onClick={openCreate}>계좌 대체 등록</button>
        </Band>
        <DataTable
          columns={[
            { key: 'accountTransferResolutionId', label: '계좌 대체결의 ID', render: (r) => <Num value={r['accountTransferResolutionId']} /> },
            { key: 'expenseResolutionId', label: '원 결의서', render: (r) => <RefName table="expense_resolution" role={role} value={r['expenseResolutionId']} /> },
            { key: 'partnerAccountId', label: '대체 거래처 계좌', render: (r) => <RefName table="partner_account" role={role} value={r['partnerAccountId']} /> },
            { key: 'transferReason', label: '대체 사유' },
            { key: 'processedAt', label: '처리일시', render: (r) => <DateText value={r['processedAt']} time /> },
          ]}
          rows={results}
          onRowClick={(r) => setDetail(r)}
          empty="아직 처리한 대체 내역이 없습니다. 계좌 대체 등록 버튼으로 시작해 주세요."
        />
      </section>
      {creating && (
        <Drawer title="계좌 대체 등록" onClose={() => setCreating(false)}>
          <Form
            onSubmit={submit}
            submit="대체결의 처리"
            note="처리하면 변경 이력이 남고, 마감된 기간의 건은 거부될 수 있습니다."
          >
            <Field label="원 결의서" required wide>
              <LookupSelect table="expense_resolution" role={role} value={expenseResolutionId} onChange={setExpenseResolutionId} />
            </Field>
            <Field label="거래처" required wide hint="대체 계좌를 고르기 위해 거래처를 먼저 선택합니다.">
              <LookupSelect
                table="partner"
                role={role}
                value={partnerId}
                onChange={(v) => {
                  setPartnerId(v);
                  setPartnerAccountId('');
                }}
              />
            </Field>
            <Field label="대체 거래처 계좌" required wide>
              <Select value={partnerAccountId} onChange={setPartnerAccountId} options={accountOptions} placeholder="계좌 선택" />
            </Field>
            <Field label="대체 사유" required wide>
              <TextInput value={transferReason} onChange={setTransferReason} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
      {detail && (
        <Drawer title="대체결의 상세" onClose={() => setDetail(null)}>
          <Pairs
            items={[
              ['계좌 대체결의 ID', <Num value={detail['accountTransferResolutionId']} />],
              ['원 결의서', <RefName table="expense_resolution" role={role} value={detail['expenseResolutionId']} />],
              ['대체 거래처 계좌', <RefName table="partner_account" role={role} value={detail['partnerAccountId']} />],
              ['대체 사유', String(detail['transferReason'])],
              ['처리일시', <DateText value={detail['processedAt']} time />],
            ]}
          />
        </Drawer>
      )}
    </div>
  );
}
