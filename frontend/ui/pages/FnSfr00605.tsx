import { useState } from 'react';
import {
  Band,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Form,
  Num,
  Pairs,
  Select,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

interface ConversionResult extends Row {
  startDate: string;
  endDate: string;
  dataType: string;
  taxProgramFormat: string;
  convertedFile: string;
  convertedCount: number;
  errorReasons: string[];
}

export default function FnSfr00605Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<ConversionResult | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dataType, setDataType] = useState('전표');
  const [taxProgramFormat, setTaxProgramFormat] = useState('');

  function openForm() {
    setStartDate('');
    setEndDate('');
    setDataType('전표');
    setTaxProgramFormat('');
    setCreating(true);
  }

  async function submit() {
    if (!startDate || !endDate) {
      throw new Error('변환 대상 기간을 입력해 주세요.');
    }
    if (!dataType) {
      throw new Error('자료 구분을 선택해 주세요.');
    }
    if (!taxProgramFormat.trim()) {
      throw new Error('세무 프로그램 형식을 입력해 주세요.');
    }
    const res = await call<Row>('POST', '/tax-office-conversions', role, {
      startDate,
      endDate,
      dataType,
      taxProgramFormat: taxProgramFormat.trim(),
    });
    const result: ConversionResult = {
      startDate,
      endDate,
      dataType,
      taxProgramFormat: taxProgramFormat.trim(),
      convertedFile: String(res['convertedFile'] ?? ''),
      convertedCount: Number(res['convertedCount'] ?? 0),
      errorReasons: Array.isArray(res['errorReasons']) ? (res['errorReasons'] as string[]) : [],
    };
    setResults([result, ...results]);
    setCreating(false);
    setSelected(result);
    notify('변환했습니다.');
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>세무회계사무소 연계 자료 변환</h2>
        <Band total={results.length}>
          <button onClick={openForm}>변환 요청</button>
        </Band>
        <DataTable<ConversionResult>
          columns={[
            { key: 'startDate', label: '변환 기간', render: (r) => (<span><DateText value={r.startDate} /> ~ <DateText value={r.endDate} /></span>) },
            { key: 'dataType', label: '자료 구분' },
            { key: 'taxProgramFormat', label: '세무 프로그램 형식' },
            { key: 'convertedCount', label: '변환 건수', render: (r) => <Num value={r.convertedCount} /> },
            { key: 'errorReasons', label: '오류 건수', render: (r) => <Num value={r.errorReasons.length} /> },
          ]}
          rows={results}
          onRowClick={(r) => setSelected(r)}
          empty="아직 변환한 내역이 없습니다. 변환 요청 버튼으로 시작하세요."
        />
      </section>
      {selected && (
        <Drawer title="변환 결과" onClose={() => setSelected(null)}>
          <Pairs
            items={[
              ['변환 대상 기간 시작일', <DateText value={selected.startDate} />],
              ['변환 대상 기간 종료일', <DateText value={selected.endDate} />],
              ['변환 대상 자료 구분', selected.dataType],
              ['대상 세무 프로그램 형식', selected.taxProgramFormat],
              ['변환 건수', <Num value={selected.convertedCount} />],
              ['변환된 파일 다운로드 경로', <a href={selected.convertedFile}>{selected.convertedFile}</a>],
              [
                '변환 오류 사유 목록',
                selected.errorReasons.length === 0
                  ? '오류 없이 모두 변환했습니다.'
                  : (
                    <ul>
                      {selected.errorReasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  ),
              ],
            ]}
          />
        </Drawer>
      )}
      {creating && (
        <Drawer title="변환 요청" onClose={() => setCreating(false)}>
          <Form
            onSubmit={submit}
            submit="변환"
            note="선택한 기간의 회계자료를 세무 프로그램 형식으로 변환하여 파일 경로와 결과를 보여 드립니다."
          >
            <Field label="변환 대상 기간 시작일" required>
              <DateInput value={startDate} onChange={setStartDate} />
            </Field>
            <Field label="변환 대상 기간 종료일" required>
              <DateInput value={endDate} onChange={setEndDate} />
            </Field>
            <Field label="변환 대상 자료 구분" required>
              <Select value={dataType} onChange={setDataType} options={[['전표', '전표']]} />
            </Field>
            <Field label="대상 세무 프로그램 형식" required>
              <TextInput value={taxProgramFormat} onChange={setTaxProgramFormat} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
