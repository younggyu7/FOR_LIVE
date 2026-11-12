import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Form,
  Num,
  Pager,
  RefName,
  call,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

type Mode = 'calculate' | 'close' | 'cancel';

const TITLES: Record<Mode, string> = {
  calculate: '급여 계산',
  close: '급여 마감',
  cancel: '급여 마감 취소',
};

export default function FnSfr02101Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [payDate, setPayDate] = useState('');
  const [result, setResult] = useState<Page | undefined>(undefined);
  const [shownDate, setShownDate] = useState('');

  async function calculate(date: string, page: number) {
    const res = await call<Page>('POST', '/payrolls/calculate', role, { payDate: date }, { page, size: 20 });
    setResult(res);
    setShownDate(date);
  }

  function requireDate() {
    if (!payDate) {
      throw new Error('급여 지급일을 입력해 주세요.');
    }
  }

  async function submit() {
    requireDate();
    if (mode === 'calculate') {
      await calculate(payDate, 0);
      notify('급여를 계산했습니다.');
    } else if (mode === 'close') {
      const res = await call('POST', '/payrolls/close', role, { payDate });
      applyStatus(res['closingStatus']);
      notify('급여를 마감했습니다.');
    } else if (mode === 'cancel') {
      const res = await call('POST', '/payrolls/cancel-close', role, { payDate });
      applyStatus(res['closingStatus']);
      notify('급여 마감을 취소했습니다.');
    }
    setMode(null);
  }

  function applyStatus(status: unknown) {
    if (result && payDate === shownDate) {
      setResult({
        ...result,
        items: result.items.map((row) => ({ ...row, closingStatus: status })),
      });
    }
  }

  function open(next: Mode) {
    setPayDate(shownDate);
    setMode(next);
  }

  return (
    <div>
      <h2>급여 계산·과세 집계 및 마감</h2>
      <Band total={result?.total}>
        <button onClick={() => open('calculate')}>급여 계산</button>
        <button className="ghost" onClick={() => open('close')}>마감</button>
        <button className="ghost" onClick={() => open('cancel')}>마감 취소</button>
      </Band>
      <DataTable
        columns={[
          { key: 'payrollId', label: '급여 ID' },
          {
            key: 'employeeId',
            label: '임직원',
            render: (row: Row) => <RefName table="employee" role={role} value={row['employeeId']} />,
          },
          { key: 'payDate', label: '급여 지급일', render: (row: Row) => <DateText value={row['payDate']} /> },
          { key: 'closingStatus', label: '마감 상태', render: (row: Row) => <Badge value={row['closingStatus']} /> },
          { key: 'taxableTotal', label: '과세 집계 금액', render: (row: Row) => <Num value={row['taxableTotal']} /> },
        ]}
        rows={result?.items ?? []}
        empty="급여 계산을 실행하면 임직원별 결과가 여기에 나타납니다."
      />
      {result && (
        <Pager
          page={result.page}
          size={result.size}
          total={result.total}
          onPage={(p) => {
            calculate(shownDate, p).catch((e: Error) => notify(e.message));
          }}
        />
      )}
      {mode && (
        <Drawer title={TITLES[mode]} onClose={() => setMode(null)}>
          <Form
            onSubmit={submit}
            submit={TITLES[mode]}
            danger={mode === 'cancel'}
            note={mode === 'close' ? '마감하면 취소하기 전에는 급여를 수정할 수 없습니다.' : undefined}
          >
            <Field label="급여 지급일" required>
              <DateInput value={payDate} onChange={setPayDate} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
