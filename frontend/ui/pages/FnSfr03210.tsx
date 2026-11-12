import { useState } from 'react';
import { call, Band, DateInput, ErrorText, Field, Filters, LookupSelect, NumberInput, Num, Pairs, Tiles } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr03210Page({ role, notify }: PageProps) {
  const [projectId, setProjectId] = useState<number | string>('');
  const [budgetAccountId, setBudgetAccountId] = useState<number | string>('');
  const [baseDate, setBaseDate] = useState('');
  const [requestAmount, setRequestAmount] = useState<number | string>('');
  const [result, setResult] = useState<Row | undefined>(undefined);
  const [error, setError] = useState('');

  async function search() {
    setError('');
    setResult(undefined);
    if (projectId === '' || budgetAccountId === '') {
      setError('프로젝트와 예산과목을 선택해 주세요.');
      return;
    }
    try {
      const data = await call('GET', '/budget-controls', role, undefined, {
        projectId,
        budgetAccountId,
        baseDate,
        requestAmount,
      });
      setResult(data);
      notify('예산정보를 조회했습니다.');
    } catch (e) {
      setError(e instanceof Error ? e.message : '조회하지 못했습니다.');
    }
  }

  function reset() {
    setProjectId('');
    setBudgetAccountId('');
    setBaseDate('');
    setRequestAmount('');
    setResult(undefined);
    setError('');
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>예산 조회 조건</h2>
        <Filters
          onSearch={() => {
            void search();
          }}
          onReset={reset}
        >
          <Field label="프로젝트" required>
            <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} />
          </Field>
          <Field label="예산과목(출처)" required>
            <LookupSelect table="budget_account" role={role} value={budgetAccountId} onChange={setBudgetAccountId} />
          </Field>
          <Field label="통제 주기 판단 기준 일자">
            <DateInput value={baseDate} onChange={setBaseDate} />
          </Field>
          <Field label="집행 요청 금액">
            <NumberInput value={requestAmount} onChange={setRequestAmount} />
          </Field>
        </Filters>
        {error !== '' && <ErrorText text={error} />}
      </section>
      <section className="box">
        <h2>예산 통제 결과</h2>
        {result === undefined ? (
          <Band>
            <span>프로젝트와 예산과목을 선택한 뒤 조회해 주세요.</span>
          </Band>
        ) : (
          <>
            <Tiles
              items={[
                ['배정액', <Num value={result['allocatedAmount']} />],
                ['집행액', <Num value={result['executedAmount']} />],
                ['잔액', <Num value={result['balanceAmount']} />],
              ]}
            />
            <Pairs
              items={[
                ['예산 통제 주기', String(result['controlCycle'] ?? '')],
                ['집행 가능 여부', result['executable'] === true ? '집행할 수 있습니다.' : '집행할 수 없습니다.'],
              ]}
            />
          </>
        )}
      </section>
    </div>
  );
}
