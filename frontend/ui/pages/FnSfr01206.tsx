import { useState } from 'react';
import { Band, DataTable, Drawer, Field, Form, Num, Pairs, Select, TextInput, call } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr01206Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [opened, setOpened] = useState(false);
  const [detail, setDetail] = useState<Row | undefined>(undefined);
  const [uploadTarget, setUploadTarget] = useState('');
  const [file, setFile] = useState('');

  async function submit() {
    if (uploadTarget === '') {
      throw new Error('업로드 대상 구분을 선택해 주세요.');
    }
    if (file.trim() === '') {
      throw new Error('업로드할 파일 내용을 입력해 주세요.');
    }
    const result = await call<Row>('POST', '/upload-histories/personnel-records', role, { file, uploadTarget });
    setResults([{ ...result, uploadTarget }, ...results]);
    setOpened(false);
    setFile('');
    setUploadTarget('');
    setDetail({ ...result, uploadTarget });
    notify('업로드를 처리했습니다.');
  }

  if (detail) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setDetail(undefined)}>목록으로</button>
        <section className="box">
          <h2>업로드 결과</h2>
          <Pairs
            items={[
              ['업로드 대상 구분', String(detail.uploadTarget ?? '')],
              ['전체 건수', <Num value={detail.totalCount} />],
              ['정상 반영 건수', <Num value={detail.successCount} />],
              ['오류 건수', <Num value={detail.errorCount} />],
              ['오류 내역', detail.errorDetail ? <pre>{String(detail.errorDetail)}</pre> : '오류가 없습니다.'],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>인사정보·인사기록카드 엑셀 업로드</h2>
        <Band total={results.length}>
          <button onClick={() => setOpened(true)}>엑셀 업로드</button>
        </Band>
        <DataTable
          columns={[
            { key: 'uploadTarget', label: '업로드 대상 구분' },
            { key: 'totalCount', label: '전체 건수', render: (r) => <Num value={r.totalCount} /> },
            { key: 'successCount', label: '정상 반영 건수', render: (r) => <Num value={r.successCount} /> },
            { key: 'errorCount', label: '오류 건수', render: (r) => <Num value={r.errorCount} /> },
          ]}
          rows={results}
          onRowClick={(row) => setDetail(row)}
          empty="아직 업로드한 내역이 없습니다. 엑셀 업로드 버튼을 눌러 시작하세요."
        />
      </section>
      {opened && (
        <Drawer title="엑셀 업로드" onClose={() => setOpened(false)}>
          <Form
            onSubmit={submit}
            submit="업로드"
            note="오류가 있는 행은 반영하지 않고 정상 행만 반영하며, 반영한 내용은 변경 이력으로 남습니다."
          >
            <Field label="업로드 대상 구분(인사정보 또는 인사기록카드)" required>
              <Select
                value={uploadTarget}
                onChange={setUploadTarget}
                options={[['인사정보', '인사정보'], ['인사기록카드', '인사기록카드']]}
              />
            </Field>
            <Field label="업로드 엑셀 파일" required wide hint="첫 줄은 머리글이며 열은 탭 또는 쉼표로 구분합니다.">
              <TextInput value={file} onChange={setFile} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
