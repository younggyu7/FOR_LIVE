import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

export default function FnSfr03502Page({ role, notify }: PageProps) {
  const [surveyId, setSurveyId] = useState<number | string>('');
  const [pageNo, setPageNo] = useState(0);
  const [creating, setCreating] = useState(false);

  const [formSurveyId, setFormSurveyId] = useState<number | string>('');
  const [title, setTitle] = useState('');
  const [questionType, setQuestionType] = useState('선택형');
  const [answerMode, setAnswerMode] = useState('단답');
  const [otherOpinion, setOtherOpinion] = useState('false');
  const [optionTexts, setOptionTexts] = useState<string[]>(['']);

  const { data, error, loading, reload } = useData<Page | undefined>(async () => {
    if (surveyId === '') {
      return undefined;
    }
    return call<Page>('GET', '/survey-questions', role, undefined, { surveyId, page: pageNo, size: SIZE });
  }, [surveyId, pageNo, role]);

  function openCreate() {
    setFormSurveyId(surveyId);
    setTitle('');
    setQuestionType('선택형');
    setAnswerMode('단답');
    setOtherOpinion('false');
    setOptionTexts(['']);
    setCreating(true);
  }

  function changeOption(index: number, value: string) {
    setOptionTexts(optionTexts.map((t, i) => (i === index ? value : t)));
  }

  async function submit() {
    if (formSurveyId === '') {
      throw new Error('설문을 선택해 주세요.');
    }
    if (title.trim() === '') {
      throw new Error('문항 제목을 입력해 주세요.');
    }
    const isChoice = questionType === '선택형';
    const texts = optionTexts.map((t) => t.trim()).filter((t) => t !== '');
    if (isChoice && texts.length < 1) {
      throw new Error('선택형 문항은 선택지를 1개 이상 입력해 주세요.');
    }
    await call('POST', '/survey-questions', role, {
      surveyId: formSurveyId,
      title: title.trim(),
      questionType,
      answerMode: isChoice ? answerMode : undefined,
      otherOpinionEnabled: otherOpinion === 'true',
      optionTexts: isChoice ? texts : undefined,
    });
    notify('설문항목을 등록했습니다.');
    setCreating(false);
    setSurveyId(formSurveyId);
    setPageNo(0);
    reload();
  }

  const columns = [
    { key: 'title', label: '문항 제목' },
    { key: 'questionType', label: '문항 유형', render: (row: Row) => <Badge value={row.questionType} /> },
    { key: 'answerMode', label: '응답 방식', render: (row: Row) => (row.answerMode ? String(row.answerMode) : '-') },
    { key: 'otherOpinionEnabled', label: '기타 의견', render: (row: Row) => (row.otherOpinionEnabled ? '입력 가능' : '입력 불가') },
    {
      key: 'options',
      label: '선택지',
      render: (row: Row) => {
        const options = (row.options as Row[] | undefined) ?? [];
        return options.length > 0 ? options.map((o) => String(o.optionText)).join(', ') : '-';
      },
    },
  ];

  return (
    <div>
      <h1>설문항목 관리</h1>
      <Filters
        onSearch={() => {
          setPageNo(0);
          reload();
        }}
        onReset={() => {
          setSurveyId('');
          setPageNo(0);
        }}
      >
        <Field label='설문'>
          <LookupSelect table='survey' role={role} value={surveyId} onChange={(v) => { setSurveyId(v); setPageNo(0); }} placeholder='설문 선택' />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>설문항목 등록</button>
      </Band>
      {surveyId !== '' && (
        <p>
          선택한 설문: <RefName table='survey' role={role} value={surveyId} />
        </p>
      )}
      {error && <ErrorText text={error} />}
      {surveyId === '' ? (
        <p>설문을 선택하면 설문항목 목록을 볼 수 있습니다.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data?.items ?? []}
            empty={loading ? '불러오는 중입니다.' : '아직 등록한 설문항목이 없습니다. 설문항목 등록 버튼으로 첫 문항을 추가해 주세요.'}
          />
          <Pager page={pageNo} size={data?.size ?? SIZE} total={data?.total ?? 0} onPage={setPageNo} />
        </>
      )}
      {creating && (
        <Drawer title='설문항목 등록' onClose={() => setCreating(false)}>
          <Form onSubmit={submit} submit='등록'>
            <Field label='설문' required>
              <LookupSelect table='survey' role={role} value={formSurveyId} onChange={setFormSurveyId} placeholder='설문 선택' />
            </Field>
            <Field label='문항 제목' required wide>
              <TextInput value={title} onChange={setTitle} multiline />
            </Field>
            <Field label='문항 유형' required>
              <Select
                value={questionType}
                onChange={setQuestionType}
                options={[['선택형', '선택형'], ['주관식', '주관식']]}
              />
            </Field>
            {questionType === '선택형' && (
              <Field label='응답 방식' required hint='단답은 하나만, 다답은 복수 선택을 허용합니다.'>
                <Select
                  value={answerMode}
                  onChange={setAnswerMode}
                  options={[['단답', '단답'], ['다답', '다답']]}
                />
              </Field>
            )}
            <Field label='기타 의견 입력 여부' required>
              <Select
                value={otherOpinion}
                onChange={setOtherOpinion}
                options={[['false', '입력 안 함'], ['true', '입력 가능']]}
              />
            </Field>
            {questionType === '선택형' && (
              <Field label='선택지 목록' required wide hint='선택지를 1개 이상 입력해 주세요.'>
                <div>
                  {optionTexts.map((text, index) => (
                    <div key={index}>
                      <TextInput value={text} onChange={(v) => changeOption(index, v)} placeholder={'선택지 ' + (index + 1)} />
                      {optionTexts.length > 1 && (
                        <button type='button' className='ghost' onClick={() => setOptionTexts(optionTexts.filter((_, i) => i !== index))}>
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                  <button type='button' className='ghost' onClick={() => setOptionTexts([...optionTexts, ''])}>
                    선택지 추가
                  </button>
                </div>
              </Field>
            )}
          </Form>
        </Drawer>
      )}
    </div>
  );
}
