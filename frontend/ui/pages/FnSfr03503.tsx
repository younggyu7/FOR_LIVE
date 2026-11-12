import { useState } from 'react';
import { Band, DataTable, DateText, Field, Form, LookupSelect, RefName, TextInput, Pairs, call } from '../kit';
import type { PageProps, Row } from '../kit';

interface AnswerForm {
  questionId: number | string;
  optionIds: (number | string)[];
  textAnswer: string;
  otherOpinion: string;
}

const emptyAnswer = (): AnswerForm => ({ questionId: '', optionIds: [], textAnswer: '', otherOpinion: '' });

export default function FnSfr03503Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [results, setResults] = useState<Row[]>([]);
  const [surveyId, setSurveyId] = useState<number | string>('');
  const [answers, setAnswers] = useState<AnswerForm[]>([emptyAnswer()]);
  const [comment, setComment] = useState('');

  const open = () => {
    setSurveyId('');
    setAnswers([emptyAnswer()]);
    setComment('');
    setMode('form');
  };

  const patch = (index: number, change: Partial<AnswerForm>) => {
    setAnswers(answers.map((a, i) => (i === index ? { ...a, ...change } : a)));
  };

  const submit = async () => {
    if (surveyId === '') {
      throw new Error('응답할 설문을 선택해 주세요.');
    }
    if (answers.length === 0 || answers.some((a) => a.questionId === '')) {
      throw new Error('응답할 문항을 모두 선택해 주세요.');
    }
    const body: Row = {
      answers: answers.map((a) => ({
        surveyQuestionId: a.questionId,
        surveyOptionIds: a.optionIds,
        textAnswer: a.textAnswer,
        otherOpinion: a.otherOpinion,
      })),
      comment,
    };
    await call('POST', `/surveys/${surveyId}/responses`, role, body);
    setResults([
      { id: results.length + 1, surveyId, count: answers.length, comment, submittedAt: new Date().toISOString() },
      ...results,
    ]);
    notify('설문 응답을 제출했습니다.');
    setMode('list');
  };

  if (mode === 'form') {
    return (
      <div className='doc'>
        <button className='ghost' onClick={() => setMode('list')}>목록으로 돌아가기</button>
        <h1>설문 응답 입력</h1>
        <Form onSubmit={submit} submit='응답 제출' note='제출한 응답은 설문당 1회만 가능하며 다시 수정할 수 없습니다.'>
          <section className='box'>
            <h2>설문 선택</h2>
            <Field label='설문' required wide>
              <LookupSelect table='survey' role={role} value={surveyId} onChange={setSurveyId} placeholder='설문을 선택하세요' />
            </Field>
          </section>
          <section className='box'>
            <h2>문항별 응답</h2>
            {answers.map((a, index) => (
              <div key={index}>
                <Field label={`문항 ${index + 1}`} required wide>
                  <LookupSelect table='survey_question' role={role} value={a.questionId} onChange={(v) => patch(index, { questionId: v })} placeholder='문항을 선택하세요' />
                </Field>
                <Field label='선택한 선택지' wide hint='다답형 문항은 여러 개를 추가할 수 있습니다.'>
                  <div>
                    {a.optionIds.map((optionId) => (
                      <span key={String(optionId)}>
                        <RefName table='survey_option' role={role} value={optionId} />
                        <button type='button' className='ghost' onClick={() => patch(index, { optionIds: a.optionIds.filter((x) => x !== optionId) })}>빼기</button>
                      </span>
                    ))}
                    <LookupSelect
                      table='survey_option'
                      role={role}
                      value=''
                      placeholder='선택지 추가'
                      onChange={(v) => {
                        if (v !== '' && !a.optionIds.includes(v)) {
                          patch(index, { optionIds: [...a.optionIds, v] });
                        }
                      }}
                    />
                  </div>
                </Field>
                <Field label='주관식 응답' wide>
                  <TextInput value={a.textAnswer} onChange={(v) => patch(index, { textAnswer: v })} multiline />
                </Field>
                <Field label='기타 의견' wide>
                  <TextInput value={a.otherOpinion} onChange={(v) => patch(index, { otherOpinion: v })} multiline />
                </Field>
                {answers.length > 1 && (
                  <button type='button' className='ghost' onClick={() => setAnswers(answers.filter((_, i) => i !== index))}>이 문항 지우기</button>
                )}
              </div>
            ))}
            <button type='button' className='ghost' onClick={() => setAnswers([...answers, emptyAnswer()])}>문항 추가</button>
          </section>
          <section className='box'>
            <h2>댓글</h2>
            <Field label='댓글' wide hint='댓글을 사용하는 설문에서만 작성할 수 있습니다.'>
              <TextInput value={comment} onChange={setComment} multiline />
            </Field>
          </section>
        </Form>
      </div>
    );
  }

  return (
    <div className='doc'>
      <h1>설문 응답</h1>
      <Band total={results.length}>
        <button onClick={open}>설문 응답하기</button>
      </Band>
      <DataTable
        rows={results}
        empty='아직 제출한 응답이 없습니다. 설문 응답하기 버튼을 눌러 응답해 주세요.'
        columns={[
          { key: 'surveyId', label: '설문', render: (r) => <RefName table='survey' role={role} value={r.surveyId} /> },
          { key: 'count', label: '응답한 문항 수' },
          { key: 'comment', label: '댓글', render: (r) => <Pairs items={[['내용', String(r.comment || '없음')]]} /> },
          { key: 'submittedAt', label: '제출 시각', render: (r) => <DateText value={r.submittedAt} time /> },
        ]}
      />
    </div>
  );
}
