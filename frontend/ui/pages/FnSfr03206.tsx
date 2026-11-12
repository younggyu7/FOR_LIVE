import { useState } from 'react';
import { call, Band, DateInput, DateText, Drawer, Field, Form, Num, Pairs } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr03206Page({ role, notify }: PageProps) {
  const [open, setOpen] = useState(false);
  const [resignationDate, setResignationDate] = useState('');
  const [result, setResult] = useState<Row | undefined>(undefined);

  async function simulate() {
    if (!resignationDate) {
      throw new Error('퇴직 예정일을 입력해 주세요.');
    }
    const data = await call('GET', '/severance-simulations', role, undefined, { resignationDate });
    setResult(data);
    setOpen(false);
    notify('퇴직금을 계산했습니다.');
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>퇴직금 시뮬레이션</h2>
        <Band>
          <button onClick={() => setOpen(true)}>퇴직금 계산</button>
        </Band>
        {result ? (
          <Pairs
            items={[
              ['입사일', <DateText value={result.hireDate} />],
              ['퇴직 예정일', <DateText value={resignationDate} />],
              ['기준일 기준 예상 퇴직금', <Num value={result.estimatedSeverancePay} />],
            ]}
          />
        ) : (
          <p>퇴직 예정일을 입력해 예상 퇴직금을 계산해 보세요.</p>
        )}
      </section>
      {open && (
        <Drawer title="퇴직금 계산" onClose={() => setOpen(false)}>
          <Form
            onSubmit={simulate}
            submit="계산"
            note="계산 결과는 저장되지 않으며 열람 이력만 기록됩니다."
          >
            <Field label="퇴직금 시뮬레이션 기준일" required>
              <DateInput value={resignationDate} onChange={setResignationDate} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
