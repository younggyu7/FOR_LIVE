import { useState } from 'react';
import { call, Band, DataTable, ErrorText, Field, Filters, LookupSelect, Pairs } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr02605Page({ role, notify }: PageProps) {
  const [attachmentId, setAttachmentId] = useState<number | string>('');
  const [current, setCurrent] = useState<Row | undefined>(undefined);
  const [history, setHistory] = useState<Row[]>([]);
  const [error, setError] = useState('');

  async function open(id: number | string) {
    setError('');
    try {
      const result = await call<Row>('GET', `/attachments/${id}/preview`, role);
      setCurrent(result);
      setHistory((prev) => [result, ...prev.filter((r) => r.attachmentId !== result.attachmentId)]);
      notify('미리보기를 불러왔습니다.');
    } catch (e) {
      setCurrent(undefined);
      setError(e instanceof Error ? e.message : '미리보기를 불러오지 못했습니다.');
    }
  }

  function search() {
    if (attachmentId === '') {
      setError('미리볼 첨부파일을 선택해 주세요.');
      return;
    }
    void open(attachmentId);
  }

  function reset() {
    setAttachmentId('');
    setCurrent(undefined);
    setError('');
  }

  if (current) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setCurrent(undefined)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>첨부파일 정보</h2>
          <Pairs
            items={[
              ['파일명', String(current.fileName ?? '')],
              ['확장자', String(current.fileExtension ?? '')],
            ]}
          />
        </section>
        <section className="box">
          <h2>미리보기</h2>
          <pre>{String(current.previewContent ?? '')}</pre>
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>첨부파일 미리보기</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="첨부파일 ID" required>
            <LookupSelect
              table="attachment"
              role={role}
              value={attachmentId}
              onChange={setAttachmentId}
              placeholder="첨부파일 선택"
            />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
      </section>
      <section className="box">
        <h2>최근에 본 첨부파일</h2>
        <Band total={history.length} />
        <DataTable
          columns={[
            { key: 'fileName', label: '파일명' },
            { key: 'fileExtension', label: '확장자' },
          ]}
          rows={history}
          onRowClick={(row) => setCurrent(row)}
          empty="아직 미리본 첨부파일이 없습니다. 위에서 첨부파일을 선택해 조회해 주세요."
        />
      </section>
    </div>
  );
}
