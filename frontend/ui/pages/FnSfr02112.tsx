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
  Tiles,
  Form,
  Field,
  NumberInput,
  DateInput,
  LookupSelect,
} from '../kit';
import type { PageProps, Page, Row, Column } from '../kit';

interface Line {
  dailyWorkerId: number | string;
  paymentDate: string;
  workDays: number | string;
  paymentAmount: number | string;
}

interface BulkResult {
  successCount: number;
  errorCount: number;
  errors: Row[];
}

const SIZE = 20;

function emptyLine(): Line {
  return { dailyWorkerId: '', paymentDate: '', workDays: '', paymentAmount: '' };
}

function show(value: unknown): string {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

export default function FnSfr02112Page({ role, notify }: PageProps) {
  const [draftDate, setDraftDate] = useState('');
  const [draftWorker, setDraftWorker] = useState<number | string>('');
  const [paymentDate, setPaymentDate] = useState('');
  const [dailyWorkerId, setDailyWorkerId] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [opened, setOpened] = useState(false);
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [result, setResult] = useState<BulkResult | undefined>(undefined);

  const list = useData<Page>(
    () => call<Page>('GET', '/daily-worker-payments', role, undefined, { paymentDate, dailyWorkerId, page, size: SIZE }),
    [role, paymentDate, dailyWorkerId, page],
  );

  const columns: Column[] = [
    { key: 'name', label: '성명' },
    { key: 'paymentAmount', label: '지급액', render: (row) => <Num value={row.paymentAmount} /> },
    { key: 'bankName', label: '은행', render: (row) => show(row.bankName) },
    { key: 'accountHolder', label: '예금주', render: (row) => show(row.accountHolder) },
    { key: 'accountNumber', label: '계좌번호', render: (row) => show(row.accountNumber) },
  ];

  function search() {
    setPage(0);
    setPaymentDate(draftDate);
    setDailyWorkerId(draftWorker);
  }

  function reset() {
    setDraftDate('');
    setDraftWorker('');
    setPage(0);
    setPaymentDate('');
    setDailyWorkerId('');
  }

  function openBulk() {
    setLines([emptyLine()]);
    setResult(undefined);
    setOpened(true);
  }

  function closeBulk() {
    setOpened(false);
    setResult(undefined);
  }

  function changeLine(index: number, patch: Partial<Line>) {
    setLines(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function removeLine(index: number) {
    setLines(lines.filter((_, i) => i !== index));
  }

  async function submit() {
    if (lines.length === 0) {
      throw new Error('입력할 급여를 한 건 이상 추가해 주세요.');
    }
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (line.dailyWorkerId === '' || line.paymentDate === '' || line.workDays === '' || line.paymentAmount === '') {
        throw new Error(`${i + 1}번째 줄의 일용직 사원, 지급일, 근무일수, 지급액을 모두 입력해 주세요.`);
      }
    }
    const body: Row = {
      items: lines.map((line) => ({
        dailyWorkerId: line.dailyWorkerId,
        paymentDate: line.paymentDate,
        workDays: line.workDays,
        paymentAmount: line.paymentAmount,
      })),
    };
    const response = await call<BulkResult>('POST', '/daily-worker-payments/bulk', role, body);
    setResult(response);
    notify('일용직 급여를 일괄 입력했습니다.');
    list.reload();
  }

  const rows = list.data ? list.data.items : [];

  return (
    <div className="doc">
      <section className="box">
        <h2>일용직 급여이체 현황</h2>
        <p>이체 현황만 조회하며 실제 이체는 이 화면에서 수행하지 않습니다.</p>
        <Filters onSearch={search} onReset={reset}>
          <Field label="지급일">
            <DateInput value={draftDate} onChange={setDraftDate} />
          </Field>
          <Field label="일용직 사원 ID">
            <LookupSelect table="daily_worker" role={role} value={draftWorker} onChange={setDraftWorker} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={list.data ? list.data.total : undefined}>
          <button onClick={openBulk}>일괄 입력</button>
        </Band>
        {list.error ? <p>{list.error}</p> : null}
        <DataTable
          columns={columns}
          rows={rows}
          empty="아직 등록한 내역이 없습니다. 일괄 입력으로 일용직 급여를 등록해 주세요."
        />
        {list.data ? <Pager page={list.data.page} size={list.data.size} total={list.data.total} onPage={setPage} /> : null}
      </section>

      {opened ? (
        <Drawer title="일용직 급여 일괄 입력" onClose={closeBulk}>
          {result ? (
            <div>
              <Tiles
                items={[
                  ['반영된 건수', <Num value={result.successCount} />],
                  ['반영되지 않은 건수', <Num value={result.errorCount} />],
                ]}
              />
              {result.errors.length > 0 ? (
                <section className="box">
                  <h2>반영되지 않은 건과 사유</h2>
                  <DataTable
                    columns={[
                      { key: 'row', label: '줄' },
                      { key: 'dailyWorkerId', label: '일용직 사원', render: (row) => <span>{show(row.dailyWorkerId)}</span> },
                      { key: 'reason', label: '사유' },
                    ]}
                    rows={result.errors}
                  />
                </section>
              ) : null}
              <button className="ghost" onClick={closeBulk}>닫기</button>
            </div>
          ) : (
            <Form onSubmit={submit} submit="일괄 입력" note="오류가 있는 줄은 제외하고 정상 건만 반영하며, 제외된 건의 사유를 알려 드립니다.">
              {lines.map((line, index) => (
                <section className="box" key={index}>
                  <h2>{`${index + 1}번째 줄`}</h2>
                  <Field label="일용직 사원 ID" required>
                    <LookupSelect
                      table="daily_worker"
                      role={role}
                      value={line.dailyWorkerId}
                      onChange={(v) => changeLine(index, { dailyWorkerId: v })}
                    />
                  </Field>
                  <Field label="지급일" required>
                    <DateInput value={line.paymentDate} onChange={(v) => changeLine(index, { paymentDate: v })} />
                  </Field>
                  <Field label="근무일수" required>
                    <NumberInput value={line.workDays} onChange={(v) => changeLine(index, { workDays: v })} />
                  </Field>
                  <Field label="지급액" required>
                    <NumberInput value={line.paymentAmount} onChange={(v) => changeLine(index, { paymentAmount: v })} />
                  </Field>
                  <button type="button" className="ghost" onClick={() => removeLine(index)}>이 줄 삭제</button>
                </section>
              ))}
              <button type="button" className="ghost" onClick={() => setLines([...lines, emptyLine()])}>줄 추가</button>
            </Form>
          )}
        </Drawer>
      ) : null}
    </div>
  );
}
