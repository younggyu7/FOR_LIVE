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
  Tiles,
  Form,
  Field,
  NumberInput,
  DateInput,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

function ResultList({ role, onOpen }: { role: string; onOpen: (row: Row) => void }) {
  const [year, setYear] = useState<number | string>('');
  const [dept, setDept] = useState<number | string>('');
  const [applied, setApplied] = useState<{ year: number | string; dept: number | string }>({ year: '', dept: '' });
  const [pageNo, setPageNo] = useState(0);

  const { data, error, loading } = useData(
    () => call<Page>('GET', '/year-end-results', role, undefined, {
      targetYear: applied.year,
      departmentId: applied.dept,
      page: pageNo,
      size: 20,
    }),
    [applied, pageNo, role],
  );

  return (
    <div className="doc">
      <h1>연말정산 현황</h1>
      <Filters
        onSearch={() => {
          setApplied({ year, dept });
          setPageNo(0);
        }}
        onReset={() => {
          setYear('');
          setDept('');
          setApplied({ year: '', dept: '' });
          setPageNo(0);
        }}
      >
        <Field label="정산 대상 연도">
          <NumberInput value={year} onChange={setYear} />
        </Field>
        <Field label="부서">
          <LookupSelect table="department" role={role} value={dept} onChange={setDept} placeholder="전체" />
        </Field>
      </Filters>
      {error ? <ErrorText text={error} /> : null}
      <Band total={data?.total} />
      <DataTable
        columns={[
          { key: 'employeeId', label: '임직원', render: (r) => <RefName table="employee" role={role} value={r['employeeId']} /> },
          { key: 'targetYear', label: '정산 대상 연도' },
          { key: 'payableTaxAmount', label: '납부세액', render: (r) => <Num value={r['payableTaxAmount']} /> },
          { key: 'closingStatus', label: '마감 상태', render: (r) => <Badge value={r['closingStatus']} /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={onOpen}
        empty={loading ? '불러오는 중입니다.' : '조건에 맞는 연말정산 결과가 없습니다. 조건을 바꿔 다시 조회해 주세요.'}
      />
      <Pager page={pageNo} size={20} total={data?.total ?? 0} onPage={setPageNo} />
    </div>
  );
}

function InstallmentDrawer({
  role,
  resultId,
  nextNo,
  onClose,
  onDone,
}: {
  role: string;
  resultId: unknown;
  nextNo: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [installmentNo, setInstallmentNo] = useState<number | string>(nextNo);
  const [amount, setAmount] = useState<number | string>('');
  const [dueDate, setDueDate] = useState('');

  return (
    <Drawer title="분납 회차 입력" onClose={onClose}>
      <Form
        submit="저장"
        note="분납 금액의 합계는 납부세액을 넘을 수 없습니다. 저장한 분납 내역은 이후 급여에 반영됩니다."
        onSubmit={async () => {
          if (installmentNo === '' || amount === '') {
            throw new Error('분납 회차와 분납 금액을 입력해 주세요.');
          }
          await call('POST', '/year-end-installments', role, {
            yearEndResultId: resultId,
            installmentNo,
            installmentAmount: amount,
            dueDate: dueDate || undefined,
          });
          onDone();
        }}
      >
        <Field label="분납 회차" required>
          <NumberInput value={installmentNo} onChange={setInstallmentNo} />
        </Field>
        <Field label="분납 금액" required>
          <NumberInput value={amount} onChange={setAmount} />
        </Field>
        <Field label="납부 예정일">
          <DateInput value={dueDate} onChange={setDueDate} />
        </Field>
      </Form>
    </Drawer>
  );
}

function ResultDetail({
  role,
  notify,
  result,
  onBack,
}: {
  role: string;
  notify: (text: string) => void;
  result: Row;
  onBack: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { data, error, loading, reload } = useData(
    () => call<Page>('GET', '/year-end-installments', role, undefined, {
      yearEndResultId: result['yearEndResultId'],
      page: 0,
      size: 200,
    }),
    [result, role],
  );

  const items = data?.items ?? [];
  const payable = Number(result['payableTaxAmount'] ?? 0);
  const sum = items.reduce((acc, r) => acc + Number(r['installmentAmount'] ?? 0), 0);
  const nextNo = items.reduce((acc, r) => Math.max(acc, Number(r['installmentNo'] ?? 0)), 0) + 1;
  const closed = result['closingStatus'] === '마감';

  return (
    <div className="doc">
      <button className="ghost" onClick={onBack}>목록으로 돌아가기</button>
      <section className="box">
        <h2>정산 결과</h2>
        <Pairs
          items={[
            ['임직원', <RefName table="employee" role={role} value={result['employeeId']} />],
            ['정산 대상 연도', String(result['targetYear'] ?? '')],
            ['납부세액', <Num value={result['payableTaxAmount']} />],
            ['마감 상태', <Badge value={result['closingStatus']} />],
          ]}
        />
      </section>
      <section className="box">
        <h2>분납 내역</h2>
        <Tiles
          items={[
            ['납부세액', <Num value={payable} />],
            ['분납 합계', <Num value={sum} />],
            ['남은 금액', <Num value={payable - sum} />],
          ]}
        />
        {error ? <ErrorText text={error} /> : null}
        <DataTable
          columns={[
            { key: 'installmentNo', label: '분납 회차' },
            { key: 'installmentAmount', label: '분납 금액', render: (r) => <Num value={r['installmentAmount']} /> },
            { key: 'dueDate', label: '납부 예정일', render: (r) => <DateText value={r['dueDate']} /> },
          ]}
          rows={items}
          empty={loading ? '불러오는 중입니다.' : '아직 입력한 분납 내역이 없습니다. 분납 입력 버튼으로 회차를 추가해 주세요.'}
        />
        {closed ? (
          <p>마감된 정산 결과에는 분납을 입력할 수 없습니다.</p>
        ) : (
          <button onClick={() => setOpen(true)}>분납 입력</button>
        )}
      </section>
      {open ? (
        <InstallmentDrawer
          role={role}
          resultId={result['yearEndResultId']}
          nextNo={nextNo}
          onClose={() => setOpen(false)}
          onDone={() => {
            setOpen(false);
            notify('분납 회차를 저장했습니다.');
            reload();
          }}
        />
      ) : null}
    </div>
  );
}

export default function FnSfr02308Page({ role, notify }: PageProps) {
  const [selected, setSelected] = useState<Row | null>(null);

  if (selected) {
    return <ResultDetail role={role} notify={notify} result={selected} onBack={() => setSelected(null)} />;
  }
  return <ResultList role={role} onOpen={setSelected} />;
}
