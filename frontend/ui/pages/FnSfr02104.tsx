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
  Pairs,
  Form,
  Field,
  TextInput,
  NumberInput,
  DateInput,
  LookupSelect,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const SIZE = 20;

type Mode =
  | null
  | { kind: 'worker' }
  | { kind: 'payment'; workerId: number | string }
  | { kind: 'detail'; row: Row };

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function WorkerForm({ role, onDone }: { role: string; onDone: () => void }) {
  const [name, setName] = useState('');
  const [rrn, setRrn] = useState('');
  const [wage, setWage] = useState<number | string>('');
  return (
    <Form
      submit="등록"
      note="주민등록번호는 암호화해 저장하며, 조회할 때마다 열람 이력이 남습니다."
      onSubmit={async () => {
        if (name.trim() === '' || rrn.trim() === '' || isEmpty(wage)) {
          throw new Error('성명, 주민등록번호, 일급을 모두 입력해 주세요.');
        }
        await call('POST', '/daily-workers', role, {
          name: name.trim(),
          residentRegistrationNo: rrn.trim(),
          dailyWage: wage,
        });
        onDone();
      }}
    >
      <Field label="성명" required>
        <TextInput value={name} onChange={setName} />
      </Field>
      <Field label="주민등록번호(서버에서 암호화 저장)" required>
        <TextInput value={rrn} onChange={setRrn} />
      </Field>
      <Field label="일급" required>
        <NumberInput value={wage} onChange={setWage} />
      </Field>
    </Form>
  );
}

function PaymentForm({
  role,
  initialWorkerId,
  onDone,
}: {
  role: string;
  initialWorkerId: number | string;
  onDone: () => void;
}) {
  const [workerId, setWorkerId] = useState<number | string>(initialWorkerId);
  const [paymentDate, setPaymentDate] = useState('');
  const [workDays, setWorkDays] = useState<number | string>('');
  return (
    <Form
      submit="등록"
      note="지급액은 일급에 근무일수를 곱해 계산합니다."
      onSubmit={async () => {
        if (isEmpty(workerId) || paymentDate === '' || isEmpty(workDays)) {
          throw new Error('일용직 사원, 지급일, 근무일수를 모두 입력해 주세요.');
        }
        await call('POST', '/daily-worker-payments', role, {
          dailyWorkerId: workerId,
          paymentDate: paymentDate,
          workDays: workDays,
        });
        onDone();
      }}
    >
      <Field label="일용직 사원 ID" required>
        <LookupSelect table="daily_worker" role={role} value={workerId} onChange={setWorkerId} />
      </Field>
      <Field label="지급일" required>
        <DateInput value={paymentDate} onChange={setPaymentDate} />
      </Field>
      <Field label="근무일수" required>
        <NumberInput value={workDays} onChange={setWorkDays} />
      </Field>
    </Form>
  );
}

export default function FnSfr02104Page({ role, notify }: PageProps) {
  const [name, setName] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<Mode>(null);
  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/daily-workers', role, undefined, { name: applied, page: page, size: SIZE }),
    [applied, page, role],
  );

  return (
    <div className="doc">
      <section className="box">
        <h2>일용직 사원</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setApplied(name.trim());
          }}
          onReset={() => {
            setName('');
            setApplied('');
            setPage(0);
          }}
        >
          <Field label="성명 조건">
            <TextInput value={name} onChange={setName} />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={() => setMode({ kind: 'worker' })}>일용직 사원 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        <DataTable
          rows={data?.items ?? []}
          empty="아직 등록한 일용직 사원이 없습니다. 일용직 사원 등록 버튼으로 시작해 주세요."
          onRowClick={(row) => setMode({ kind: 'detail', row: row })}
          columns={[
            { key: 'name', label: '성명' },
            { key: 'dailyWage', label: '일급', render: (row) => <Num value={row['dailyWage']} /> },
            {
              key: 'dailyWorkerId',
              label: '급여',
              render: (row) => (
                <button
                  className="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMode({ kind: 'payment', workerId: row['dailyWorkerId'] as number });
                  }}
                >
                  지급 등록
                </button>
              ),
            },
          ]}
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {mode?.kind === 'worker' ? (
        <Drawer title="일용직 사원 등록" onClose={() => setMode(null)}>
          <WorkerForm
            role={role}
            onDone={() => {
              notify('일용직 사원을 등록했습니다.');
              setMode(null);
              reload();
            }}
          />
        </Drawer>
      ) : null}
      {mode?.kind === 'payment' ? (
        <Drawer title="일용직 급여 지급 등록" onClose={() => setMode(null)}>
          <PaymentForm
            role={role}
            initialWorkerId={mode.workerId}
            onDone={() => {
              notify('일용직 급여를 등록했습니다.');
              setMode(null);
              reload();
            }}
          />
        </Drawer>
      ) : null}
      {mode?.kind === 'detail' ? (
        <Drawer title="일용직 사원 상세" onClose={() => setMode(null)}>
          <Pairs
            items={[
              ['성명', String(mode.row['name'] ?? '')],
              ['일급', <Num key="wage" value={mode.row['dailyWage']} />],
            ]}
          />
          <button
            className="ghost"
            onClick={() => setMode({ kind: 'payment', workerId: mode.row['dailyWorkerId'] as number })}
          >
            지급 등록
          </button>
        </Drawer>
      ) : null}
    </div>
  );
}
