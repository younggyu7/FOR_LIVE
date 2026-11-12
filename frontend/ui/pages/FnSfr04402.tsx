import { useState } from 'react';
import {
  call,
  Band,
  DataTable,
  Drawer,
  Form,
  Field,
  TextInput,
  LookupSelect,
  RefName,
} from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr04402Page({ role, notify }: PageProps) {
  const [formId, setFormId] = useState<number | string>('');
  const [requestContent, setRequestContent] = useState('');
  const [body, setBody] = useState('');
  const [phrases, setPhrases] = useState<string[]>([]);
  const [history, setHistory] = useState<Row[]>([]);
  const [drawer, setDrawer] = useState<'draft' | 'phrase' | null>(null);

  const addHistory = (kind: string, text: string) => {
    setHistory((prev) => [{ id: prev.length + 1, kind, text, formId }, ...prev]);
  };

  const submitDraft = async () => {
    if (formId === '') {
      throw new Error('결재양식을 선택해 주세요.');
    }
    if (requestContent.trim() === '') {
      throw new Error('작성 요청 내용을 입력해 주세요.');
    }
    const res = await call<{ draftBody: string }>('POST', '/approval-documents/draft-assist', role, {
      approvalFormId: formId,
      requestContent,
    });
    setBody(res.draftBody);
    addHistory('기안문 초안', res.draftBody);
    setDrawer(null);
    notify('기안문 초안을 생성했습니다. 내용을 확인하고 수정해 주세요.');
  };

  const submitPhrase = async () => {
    if (formId === '') {
      throw new Error('결재양식을 선택해 주세요.');
    }
    const res = await call<{ phrases: string[] }>('POST', '/approval-documents/phrase-suggestions', role, {
      approvalFormId: formId,
      body,
    });
    setPhrases(res.phrases);
    addHistory('추천 문구', res.phrases.join(' / '));
    setDrawer(null);
    notify('추천 문구를 불러왔습니다.');
  };

  const appendPhrase = (p: string) => {
    setBody((prev) => (prev === '' ? p : prev + '\n' + p));
    notify('추천 문구를 본문에 반영했습니다.');
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>AI 작성 지원</h2>
        <Band total={history.length}>
          <button className="ghost" onClick={() => setDrawer('phrase')}>문구 추천 받기</button>
          <button onClick={() => setDrawer('draft')}>AI 초안 작성</button>
        </Band>
        <DataTable
          columns={[
            { key: 'kind', label: '구분' },
            {
              key: 'formId',
              label: '결재양식',
              render: (r) => <RefName table="approval_form" role={role} value={r.formId} />,
            },
            { key: 'text', label: '내용' },
          ]}
          rows={history}
          empty="아직 생성한 내역이 없습니다. AI 초안 작성을 눌러 시작해 보세요."
        />
      </section>
      <section className="box">
        <h2>추천 문구</h2>
        {phrases.length === 0 ? (
          <p>아직 추천 문구가 없습니다. 문구 추천 받기를 눌러 주세요.</p>
        ) : (
          <ul>
            {phrases.map((p, i) => (
              <li key={i}>
                {p} <button className="ghost" onClick={() => appendPhrase(p)}>본문에 반영</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="box">
        <h2>기안문 본문</h2>
        <p>AI 결과는 확인·수정 후 반영하며 자동으로 상신되지 않습니다.</p>
        <TextInput value={body} onChange={setBody} multiline placeholder="초안이나 추천 문구를 반영해 직접 수정할 수 있습니다." />
      </section>
      {drawer === 'draft' && (
        <Drawer title="AI 초안 작성" onClose={() => setDrawer(null)}>
          <Form onSubmit={submitDraft} submit="초안 생성">
            <Field label="결재양식" required>
              <LookupSelect table="approval_form" role={role} value={formId} onChange={setFormId} />
            </Field>
            <Field label="제목·목적·핵심 내용" required wide>
              <TextInput value={requestContent} onChange={setRequestContent} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
      {drawer === 'phrase' && (
        <Drawer title="문구 추천" onClose={() => setDrawer(null)}>
          <Form onSubmit={submitPhrase} submit="문구 추천">
            <Field label="결재양식" required>
              <LookupSelect table="approval_form" role={role} value={formId} onChange={setFormId} />
            </Field>
            <Field label="문서 본문" wide hint="현재 작성 중인 본문이 추천에 쓰입니다.">
              <TextInput value={body} onChange={setBody} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
