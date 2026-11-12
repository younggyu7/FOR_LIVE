import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  DateInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const CARD_TYPES: [string, string][] = [
  ['법인', '법인'],
  ['개인', '개인'],
  ['사업용', '사업용'],
];

function maskCard(last4: unknown): string {
  // 화면에는 카드번호 끝 4자리만 보인다.
  return last4 ? '**** **** **** ' + String(last4) : '-';
}

export default function FnSfr00206Page({ role, notify }: PageProps) {
  const [typeInput, setTypeInput] = useState('');
  const [cardType, setCardType] = useState('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const size = 20;

  const list = useData<Page>(
    () => call<Page>('GET', '/credit-cards', role, undefined, { cardType, page, size }),
    [cardType, page],
  );

  if (selected) {
    return (
      <CardDetail
        role={role}
        notify={notify}
        card={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div>
      <h1>신용카드 등록·관리</h1>
      <Filters
        onSearch={() => {
          setPage(0);
          setCardType(typeInput);
        }}
        onReset={() => {
          setTypeInput('');
          setCardType('');
          setPage(0);
        }}
      >
        <Field label="카드 유형">
          <Select value={typeInput} onChange={setTypeInput} options={CARD_TYPES} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={list.data?.total}>
        <button onClick={() => setCreating(true)}>카드 등록</button>
      </Band>
      {list.error ? <ErrorText text={list.error} /> : null}
      <DataTable
        rows={list.data?.items ?? []}
        empty="아직 등록한 카드가 없습니다. 카드 등록 버튼으로 첫 카드를 등록해 주세요."
        onRowClick={(row) => setSelected(row)}
        columns={[
          { key: 'cardType', label: '카드 유형', render: (r) => <Badge value={r.cardType} /> },
          { key: 'cardName', label: '카드명' },
          { key: 'cardNumberLast4', label: '카드번호', render: (r) => maskCard(r.cardNumberLast4) },
          { key: 'issuerName', label: '카드사명' },
          { key: 'expiryDate', label: '유효기간 만료일', render: (r) => <DateText value={r.expiryDate} /> },
        ]}
      />
      <Pager page={page} size={size} total={list.data?.total ?? 0} onPage={setPage} />
      {creating ? (
        <Drawer title="카드 등록" onClose={() => setCreating(false)}>
          <CardForm
            role={role}
            onDone={() => {
              setCreating(false);
              notify('카드를 등록했습니다.');
              list.reload();
            }}
          />
        </Drawer>
      ) : null}
    </div>
  );
}

function CardForm({ role, onDone }: { role: string; onDone: () => void }) {
  const [cardType, setCardType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  return (
    <Form
      submit="등록"
      note="카드번호는 암호화 저장 대상이며 화면에는 끝 4자리만 표시됩니다."
      onSubmit={async () => {
        if (!cardType) {
          throw new Error('카드 유형을 선택해 주세요.');
        }
        if (!cardNumber.trim()) {
          throw new Error('카드번호를 입력해 주세요.');
        }
        await call('POST', '/credit-cards', role, {
          cardType,
          cardNumber: cardNumber.trim(),
          cardName,
          issuerName,
          expiryDate,
        });
        onDone();
      }}
    >
      <Field label="카드 유형" required>
        <Select value={cardType} onChange={setCardType} options={CARD_TYPES} />
      </Field>
      <Field label="평문 카드번호" required>
        <TextInput value={cardNumber} onChange={setCardNumber} />
      </Field>
      <Field label="카드명">
        <TextInput value={cardName} onChange={setCardName} />
      </Field>
      <Field label="카드사명">
        <TextInput value={issuerName} onChange={setIssuerName} />
      </Field>
      <Field label="유효기간 만료일">
        <DateInput value={expiryDate} onChange={setExpiryDate} />
      </Field>
    </Form>
  );
}

function CardDetail({
  role,
  notify,
  card,
  onBack,
}: {
  role: string;
  notify: (text: string) => void;
  card: Row;
  onBack: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const perms = useData<Page>(
    () =>
      call<Page>('GET', '/credit-card-permissions', role, undefined, {
        creditCardId: card.creditCardId,
        page: 0,
        size: 200,
      }),
    [card.creditCardId],
  );

  async function remove(row: Row) {
    setError('');
    try {
      await call('DELETE', '/credit-card-permissions/' + String(row.creditCardPermissionId), role);
      notify('조회 권한을 삭제했습니다.');
      perms.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제하지 못했습니다.');
    }
  }

  return (
    <div className="doc">
      <button className="ghost" onClick={onBack}>목록으로</button>
      <section className="box">
        <h2>카드 정보</h2>
        <Pairs
          items={[
            ['카드 유형', <Badge value={card.cardType} />],
            ['카드명', String(card.cardName ?? '-')],
            ['카드번호', maskCard(card.cardNumberLast4)],
            ['카드사명', String(card.issuerName ?? '-')],
            ['유효기간 만료일', <DateText value={card.expiryDate} />],
          ]}
        />
      </section>
      <section className="box">
        <h2>카드 조회 권한</h2>
        <Band total={perms.data?.total}>
          <button onClick={() => setAdding(true)}>권한 대상 추가</button>
        </Band>
        {perms.error ? <ErrorText text={perms.error} /> : null}
        {error ? <ErrorText text={error} /> : null}
        <DataTable
          rows={perms.data?.items ?? []}
          empty="아직 조회 권한 대상이 없습니다. 권한 대상 추가 버튼으로 임직원을 지정해 주세요."
          columns={[
            {
              key: 'employeeId',
              label: '임직원',
              render: (r) => <RefName table="employee" role={role} value={r.employeeId} />,
            },
            {
              key: 'creditCardPermissionId',
              label: '처리',
              render: (r) => (
                <button className="ghost" onClick={() => remove(r)}>삭제</button>
              ),
            },
          ]}
        />
      </section>
      {adding ? (
        <Drawer title="권한 대상 추가" onClose={() => setAdding(false)}>
          <PermissionForm
            role={role}
            creditCardId={card.creditCardId}
            onDone={() => {
              setAdding(false);
              notify('조회 권한을 설정했습니다.');
              perms.reload();
            }}
          />
        </Drawer>
      ) : null}
    </div>
  );
}

function PermissionForm({
  role,
  creditCardId,
  onDone,
}: {
  role: string;
  creditCardId: unknown;
  onDone: () => void;
}) {
  const [employeeId, setEmployeeId] = useState<number | string>('');

  return (
    <Form
      submit="추가"
      onSubmit={async () => {
        if (employeeId === '') {
          throw new Error('임직원을 선택해 주세요.');
        }
        await call('POST', '/credit-card-permissions', role, { creditCardId, employeeId });
        onDone();
      }}
    >
      <Field label="임직원" required>
        <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
      </Field>
    </Form>
  );
}
