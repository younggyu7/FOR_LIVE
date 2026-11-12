import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  Select,
  LookupSelect,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const CHART_OPTIONS: [string, string][] = [
  ['BAR', '막대형'],
  ['LINE', '선형'],
  ['PIE', '원형'],
];

const SIZE = 20;

export default function FnSfr04101Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [saved, setSaved] = useState<Row[]>([]);
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState<number | string>('');
  const [body, setBody] = useState('');
  const [chartType, setChartType] = useState('');
  const [chartLines, setChartLines] = useState('');

  const templates = useData<Page>(
    () => call<Page>('GET', '/office-templates', role, undefined, { page, size: SIZE }),
    [page, role],
  );
  const rows = templates.data ? templates.data.items : [];

  function openCreate() {
    setTitle('');
    setTemplateId('');
    setBody('');
    setChartType('');
    setChartLines('');
    setCreating(true);
  }

  function pickTemplate(value: number | string) {
    setTemplateId(value);
    const found = rows.find((r) => r['officeTemplateId'] === value);
    if (found && body.trim() === '') {
      setBody(String(found['bodyContent'] ?? ''));
    }
  }

  function parseChart(): Row | undefined {
    const lines = chartLines.split('\n').map((l) => l.trim()).filter((l) => l !== '');
    if (lines.length === 0) {
      return undefined;
    }
    const labels: string[] = [];
    const values: number[] = [];
    for (const line of lines) {
      const idx = line.lastIndexOf(',');
      const label = idx < 0 ? '' : line.slice(0, idx).trim();
      const value = idx < 0 ? NaN : Number(line.slice(idx + 1).trim());
      if (label === '' || Number.isNaN(value)) {
        throw new Error('차트 데이터는 한 줄에 "항목,숫자" 형식으로 입력해 주세요.');
      }
      labels.push(label);
      values.push(value);
    }
    return { labels, values };
  }

  async function submit() {
    if (title.trim() === '') {
      throw new Error('문서 제목을 입력해 주세요.');
    }
    const chartData = parseChart();
    if (chartType !== '' && !chartData) {
      throw new Error('차트 유형을 선택했으니 차트 데이터를 입력해 주세요.');
    }
    const result = await call('POST', '/office-documents', role, {
      title: title.trim(),
      officeTemplateId: templateId === '' ? undefined : templateId,
      body: body === '' ? undefined : body,
      chartType: chartType === '' ? undefined : chartType,
      chartData: chartType === '' ? undefined : chartData,
    });
    setSaved([result, ...saved]);
    setCreating(false);
    notify('문서를 내 문서함에 저장했습니다.');
    templates.reload();
  }

  return (
    <div>
      <h2>웹 오피스 문서</h2>
      <Band total={templates.data ? templates.data.total : undefined}>
        <button onClick={openCreate}>새 문서 작성</button>
      </Band>
      {templates.error !== '' && <ErrorText text={templates.error} />}
      <DataTable
        columns={[
          { key: 'name', label: '템플릿 이름' },
          {
            key: 'templateType',
            label: '템플릿 구분',
            render: (r) => <Badge value={r['templateType'] === 'REPORT' ? '보고서' : '기획서'} />,
          },
        ]}
        rows={rows}
        empty='제공되는 템플릿이 아직 없습니다. 빈 문서로 새 문서를 작성할 수 있습니다.'
      />
      {templates.data && (
        <Pager page={page} size={SIZE} total={templates.data.total} onPage={setPage} />
      )}

      <h2>이번에 저장한 문서</h2>
      <DataTable
        columns={[
          { key: 'officeDocumentId', label: '문서 번호' },
          { key: 'title', label: '문서 제목' },
          {
            key: 'chartType',
            label: '차트 유형',
            render: (r) => {
              const found = CHART_OPTIONS.find((o) => o[0] === r['chartType']);
              return found ? found[1] : '없음';
            },
          },
        ]}
        rows={saved}
        empty='아직 저장한 문서가 없습니다. 새 문서 작성을 눌러 시작해 보세요.'
      />

      {creating && (
        <Drawer title='새 문서 작성' onClose={() => setCreating(false)}>
          <Form onSubmit={submit} submit='저장'>
            <Field label='문서 제목' required wide>
              <TextInput value={title} onChange={setTitle} />
            </Field>
            <Field label='템플릿' hint='선택하지 않으면 빈 문서로 시작합니다.'>
              <LookupSelect
                table='office_template'
                role={role}
                value={templateId}
                onChange={pickTemplate}
                placeholder='빈 문서'
              />
            </Field>
            <Field label='문서 본문' wide>
              <TextInput value={body} onChange={setBody} multiline />
            </Field>
            <Field label='차트 유형'>
              <Select
                value={chartType}
                onChange={setChartType}
                options={CHART_OPTIONS}
                placeholder='차트 없음'
              />
            </Field>
            {chartType !== '' && (
              <Field label='차트 데이터' required wide hint='한 줄에 항목,숫자 형식으로 입력합니다. 예: 1분기,120'>
                <TextInput value={chartLines} onChange={setChartLines} multiline />
              </Field>
            )}
          </Form>
        </Drawer>
      )}
    </div>
  );
}
