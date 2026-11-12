import { useState } from 'react';
import {
  call,
  Band,
  Badge,
  DataTable,
  Drawer,
  Field,
  Form,
  Pairs,
  TextInput,
} from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr04103Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [file, setFile] = useState('');

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>변환된 문서</h2>
          <Pairs
            items={[
              ['웹 오피스 문서 ID', String(selected.officeDocumentId)],
              ['문서 제목', String(selected.title ?? '')],
              ['변환 성공 여부', <Badge value={selected.result} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>문서 본문</h2>
          <p>{selected.body ? String(selected.body) : '본문이 비어 있습니다.'}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>한글·Word 양식 문서 변환</h2>
        <Band total={results.length}>
          <button
            onClick={() => {
              setFile('');
              setOpened(true);
            }}
          >
            문서 변환
          </button>
        </Band>
        <DataTable
          columns={[
            { key: 'officeDocumentId', label: '웹 오피스 문서 ID' },
            { key: 'title', label: '문서 제목' },
            {
              key: 'result',
              label: '변환 성공 여부',
              render: (row) => <Badge value={row.result} />,
            },
          ]}
          rows={results}
          onRowClick={(row) => setSelected(row)}
          empty="아직 변환한 문서가 없습니다. '문서 변환' 버튼으로 파일을 변환해 보세요."
        />
      </section>
      {opened && (
        <Drawer title="문서 변환" onClose={() => setOpened(false)}>
          <Form
            submit="변환"
            note="지원 형식은 한글(HWP)과 Word입니다. 변환된 문서는 내 문서함에 저장됩니다."
            onSubmit={async () => {
              if (file.trim() === '') {
                throw new Error('변환할 파일을 입력해 주세요.');
              }
              const created = await call('POST', '/office-documents/convert', role, {
                file: file.trim(),
              });
              setResults([created, ...results]);
              setOpened(false);
              notify('문서를 변환했습니다.');
            }}
          >
            <Field label="변환할 HWP 또는 Word 파일" required wide>
              <TextInput value={file} onChange={setFile} placeholder="예: 업무보고.docx" />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
