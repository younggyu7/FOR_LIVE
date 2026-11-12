import { useState } from 'react';
import {
  call,
  Band,
  DataTable,
  DateText,
  Drawer,
  Field,
  Form,
  LookupSelect,
  Num,
  RefName,
} from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr03211Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [resolutionId, setResolutionId] = useState<number | string>('');
  const [accountSubjectId, setAccountSubjectId] = useState<number | string>('');

  const close = () => {
    setOpen(false);
    setResolutionId('');
    setAccountSubjectId('');
  };

  const submit = async () => {
    if (resolutionId === '') {
      throw new Error('결의서를 선택해 주세요.');
    }
    const body: Row = {};
    if (accountSubjectId !== '') {
      body.accountSubjectId = accountSubjectId;
    }
    const result = await call(
      'POST',
      `/expense-resolutions/${resolutionId}/reflect-budget`,
      role,
      body,
    );
    setResults([{ ...result, expenseResolutionId: resolutionId }, ...results]);
    notify('예산 반영과 자동전표 생성을 마쳤습니다.');
    close();
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>ERP 연계 예산 반영</h2>
        <Band total={results.length}>
          <button onClick={() => setOpen(true)}>예산 반영</button>
        </Band>
        <DataTable
          columns={[
            {
              key: 'expenseResolutionId',
              label: '결의서',
              render: (row) => (
                <RefName table="expense_resolution" role={role} value={row.expenseResolutionId} />
              ),
            },
            { key: 'journalEntryId', label: '전표 ID' },
            {
              key: 'entryDate',
              label: '전표 일자',
              render: (row) => <DateText value={row.entryDate} />,
            },
            {
              key: 'totalDebitAmount',
              label: '차변 합계',
              render: (row) => <Num value={row.totalDebitAmount} />,
            },
            {
              key: 'executionAmount',
              label: '실행예산 금액',
              render: (row) => <Num value={row.executionAmount} />,
            },
          ]}
          rows={results}
          empty="아직 반영한 결의서가 없습니다. 예산 반영 버튼으로 승인된 결의서를 처리해 보세요."
        />
      </section>
      {open && (
        <Drawer title="예산 반영 및 자동전표 처리" onClose={close}>
          <Form
            onSubmit={submit}
            submit="반영"
            note="반영하면 예산 집행액이 더해지고 자동전표가 만들어집니다. 같은 결의서는 다시 반영할 수 없습니다."
          >
            <Field label="결의서" required wide>
              <LookupSelect
                table="expense_resolution"
                role={role}
                value={resolutionId}
                onChange={setResolutionId}
              />
            </Field>
            <Field label="자동전표 분개 계정과목" wide hint="비우면 예산과목에 매핑된 계정과목을 씁니다.">
              <LookupSelect
                table="account_subject"
                role={role}
                value={accountSubjectId}
                onChange={setAccountSubjectId}
              />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
