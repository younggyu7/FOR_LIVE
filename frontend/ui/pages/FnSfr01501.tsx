import { useState } from 'react';
import { Band, Column, DataTable, DateText, ErrorText, Field, Filters, LookupSelect, Num, Page, PageProps, Pager, Row, call, useData } from '../kit';

const SIZE = 20;

export default function FnSfr01501Page({ role }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [applied, setApplied] = useState<number | string>('');
  const [evalPage, setEvalPage] = useState(0);
  const [rpPage, setRpPage] = useState(0);
  const [message, setMessage] = useState('');

  const evals = useData<Page | null>(async () => {
    if (applied === '') return null;
    return call<Page>('GET', '/employee-evaluations', role, undefined, { employeeId: applied, page: evalPage, size: SIZE });
  }, [applied, evalPage, role]);

  const rewards = useData<Page | null>(async () => {
    if (applied === '') return null;
    return call<Page>('GET', '/employee-reward-penalties', role, undefined, { employeeId: applied, page: rpPage, size: SIZE });
  }, [applied, rpPage, role]);

  const search = () => {
    if (employeeId === '') {
      setMessage('조회할 임직원을 선택해 주세요.');
      return;
    }
    setMessage('');
    setEvalPage(0);
    setRpPage(0);
    if (employeeId === applied) {
      evals.reload();
      rewards.reload();
    } else {
      setApplied(employeeId);
    }
  };

  const reset = () => {
    setEmployeeId('');
    setApplied('');
    setEvalPage(0);
    setRpPage(0);
    setMessage('');
  };

  const evalColumns: Column<Row>[] = [
    {
      key: 'periodStartDate',
      label: '대상기간',
      render: (r) => (
        <span>
          <DateText value={r.periodStartDate} /> ~ <DateText value={r.periodEndDate} />
        </span>
      ),
    },
    { key: 'evaluationGrade', label: '고과 등급' },
    { key: 'evaluationScore', label: '고과 점수', render: (r) => <Num value={r.evaluationScore} /> },
    { key: 'evaluatorName', label: '평가자' },
    { key: 'comment', label: '평가 의견' },
  ];

  const rewardColumns: Column<Row>[] = [
    { key: 'rewardPenaltyType', label: '상벌 구분' },
    { key: 'title', label: '상벌명' },
    { key: 'awardedDate', label: '상벌 일자', render: (r) => <DateText value={r.awardedDate} /> },
    { key: 'issuer', label: '수여·시행 기관' },
    { key: 'content', label: '상벌 내용' },
  ];

  return (
    <div className='doc'>
      <section className='box'>
        <h2>조회 조건</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label='임직원' required>
            <LookupSelect table='employee' role={role} value={employeeId} onChange={setEmployeeId} placeholder='임직원 선택' />
          </Field>
        </Filters>
        {message && <ErrorText text={message} />}
      </section>

      {applied === '' ? (
        <p>임직원을 선택하고 조회하면 인사고과와 상벌 현황을 볼 수 있습니다.</p>
      ) : (
        <>
          <section className='box'>
            <h2>인사고과 현황</h2>
            {evals.error && <ErrorText text={evals.error} />}
            <Band total={evals.data?.total} />
            <DataTable columns={evalColumns} rows={evals.data?.items ?? []} empty='조회 결과가 없습니다. 조건을 바꿔 다시 조회해 주세요.' />
            <Pager page={evalPage} size={SIZE} total={evals.data?.total ?? 0} onPage={setEvalPage} />
          </section>

          <section className='box'>
            <h2>상벌 현황</h2>
            {rewards.error && <ErrorText text={rewards.error} />}
            <Band total={rewards.data?.total} />
            <DataTable columns={rewardColumns} rows={rewards.data?.items ?? []} empty='조회 결과가 없습니다. 조건을 바꿔 다시 조회해 주세요.' />
            <Pager page={rpPage} size={SIZE} total={rewards.data?.total ?? 0} onPage={setRpPage} />
          </section>
        </>
      )}
    </div>
  );
}
