import { useState } from 'react';
import { Band, DataTable, DateInput, Drawer, Field, Form, LookupSelect, Num, Pairs, Select, TextInput, call } from '../kit';
import type { PageProps, Row } from '../kit';

interface Entry extends Row {
  id: number;
  analysisArea: string;
  question: string;
  answer: string;
  analysisResult: Row;
}

export default function FnSfr04403Page({ role, notify }: PageProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selected, setSelected] = useState<Entry | undefined>(undefined);
  const [opening, setOpening] = useState(false);
  const [area, setArea] = useState('');
  const [question, setQuestion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [projectId, setProjectId] = useState<number | string>('');

  async function submit() {
    if (area === '') {
      throw new Error('분석 대상 영역을 선택해 주세요.');
    }
    if (question.trim() === '') {
      throw new Error('질의 내용을 입력해 주세요.');
    }
    const body: Row = { analysisArea: area, question: question.trim() };
    if (startDate !== '') {
      body.startDate = startDate;
    }
    if (endDate !== '') {
      body.endDate = endDate;
    }
    if (departmentId !== '') {
      body.departmentId = departmentId;
    }
    if (projectId !== '') {
      body.projectId = projectId;
    }
    const res = await call<Row>('POST', '/data-analysis/queries', role, body);
    const entry: Entry = {
      id: Date.now(),
      analysisArea: area,
      question: question.trim(),
      answer: String(res.answer ?? ''),
      analysisResult: (res.analysisResult ?? {}) as Row,
    };
    setEntries([entry, ...entries]);
    setSelected(entry);
    setOpening(false);
    setQuestion('');
    notify('분석 질의를 처리했습니다.');
  }

  const groups = selected ? ((selected.analysisResult.groups ?? []) as Row[]) : [];
  const showCredit = groups.some((g) => g.creditAmount !== undefined);
  const showAmount = groups.some((g) => g.amount !== undefined);

  if (selected) {
    const result = selected.analysisResult;
    const columns = [
      { key: 'status', label: '상태' },
      { key: 'count', label: '건수', render: (r: Row) => <Num value={r.count} /> },
    ];
    if (showAmount) {
      columns.push({ key: 'amount', label: showCredit ? '차변 합계' : '금액', render: (r: Row) => <Num value={r.amount} /> });
    }
    if (showCredit) {
      columns.push({ key: 'creditAmount', label: '대변 합계', render: (r: Row) => <Num value={r.creditAmount} /> });
    }
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(undefined)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>질의 응답</h2>
          <Pairs
            items={[
              ['분석 대상 영역', selected.analysisArea],
              ['자연어 질의 내용', selected.question],
              ['자연어 질의 응답', selected.answer],
            ]}
          />
        </section>
        <section className="box">
          <h2>분석 결과</h2>
          <Pairs
            items={[
              ['조회 범위', String(result.viewScope ?? '')],
              ['전체 건수', <Num value={result.totalCount} />],
              ['전체 금액', <Num value={result.totalAmount} />],
            ]}
          />
          <DataTable columns={columns} rows={groups} empty="분석 결과가 없습니다." />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>예산·회계·인사 데이터 분석 및 질의응답</h2>
        <Band total={entries.length}>
          <button onClick={() => setOpening(true)}>질의하기</button>
        </Band>
        <DataTable
          columns={[
            { key: 'analysisArea', label: '분석 대상 영역' },
            { key: 'question', label: '자연어 질의 내용' },
            { key: 'answer', label: '자연어 질의 응답' },
          ]}
          rows={entries}
          onRowClick={(row) => setSelected(row)}
          empty="아직 질의한 내역이 없습니다. 질의하기 버튼을 눌러 분석을 시작해 보세요."
        />
      </section>
      {opening && (
        <Drawer title="데이터 분석 질의" onClose={() => setOpening(false)}>
          <Form onSubmit={submit} submit="질의하기" note="인사 데이터를 분석하면 개인정보 열람 이력이 기록됩니다. 질의 내용은 별도로 보관하지 않습니다.">
            <Field label="분석 대상 영역" required>
              <Select
                value={area}
                onChange={setArea}
                options={[['예산', '예산'], ['회계', '회계'], ['인사', '인사']]}
              />
            </Field>
            <Field label="자연어 질의 내용" required wide>
              <TextInput value={question} onChange={setQuestion} multiline />
            </Field>
            <Field label="분석 기간 시작일">
              <DateInput value={startDate} onChange={setStartDate} />
            </Field>
            <Field label="분석 기간 종료일">
              <DateInput value={endDate} onChange={setEndDate} />
            </Field>
            <Field label="부서 조건">
              <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} />
            </Field>
            <Field label="프로젝트 조건">
              <LookupSelect table="project" role={role} value={projectId} onChange={setProjectId} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
