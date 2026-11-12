import { useState } from 'react';
import { Band, Badge, DataTable, Drawer, Field, Form, Num, Select, TextInput, call } from '../kit';
import type { PageProps, Row } from '../kit';

const CATEGORIES: [string, string][] = [
  ['EARNED_INCOME', '근로소득'],
  ['DAILY_WAGE', '일용근로소득'],
  ['RETIREMENT_INCOME', '퇴직소득'],
];

export default function FnSfr02309Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState<Row | null>(null);
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');

  const categoryName = (value: unknown) => {
    const found = CATEGORIES.find((c) => c[0] === value);
    return found ? found[1] : String(value ?? '');
  };

  const openCreate = () => {
    setYear('');
    setCategory('');
    setCreating(true);
  };

  const submitCreate = async () => {
    if (!/^[0-9]{4}$/.test(year)) {
      throw new Error('제출 대상 연도를 4자리 숫자로 입력해 주세요.');
    }
    if (!category) {
      throw new Error('소득 구분을 선택해 주세요.');
    }
    const res = await call('POST', '/tax-filings/submission-summaries', role, { submissionYear: year, incomeCategory: category });
    setResults((prev) => [{ ...res, submissionYear: year, incomeCategory: category, fileName: '' }, ...prev]);
    setCreating(false);
    notify('제출집계표를 작성했습니다.');
  };

  const submitMedia = async () => {
    if (!target) {
      return;
    }
    const res = await call('POST', `/tax-filings/${target['taxFilingId']}/generate-media`, role, {});
    const id = target['taxFilingId'];
    setResults((prev) => prev.map((r) => (r['taxFilingId'] === id ? { ...r, fileName: res['fileName'] } : r)));
    setTarget(null);
    notify('전산매체 파일을 생성했습니다.');
  };

  return (
    <div>
      <h1>소득자료 제출집계표 및 지급명세서 전산매체</h1>
      <Band total={results.length}>
        <button onClick={openCreate}>제출집계표 작성</button>
      </Band>
      <DataTable
        columns={[
          { key: 'taxFilingId', label: '세무 신고서 ID' },
          { key: 'submissionYear', label: '제출 대상 연도' },
          { key: 'incomeCategory', label: '소득 구분', render: (r) => <Badge value={categoryName(r['incomeCategory'])} /> },
          { key: 'totalAmount', label: '집계 금액', render: (r) => <Num value={r['totalAmount']} /> },
          {
            key: 'fileName',
            label: '전산매체 파일',
            render: (r) =>
              r['fileName'] ? (
                <span>{String(r['fileName'])}</span>
              ) : (
                <button className="ghost" onClick={() => setTarget(r)}>파일 생성</button>
              ),
          },
        ]}
        rows={results}
        empty="아직 작성한 제출집계표가 없습니다. 제출집계표 작성 버튼을 눌러 시작해 주세요."
      />
      {creating && (
        <Drawer title="제출집계표 작성" onClose={() => setCreating(false)}>
          <Form onSubmit={submitCreate} submit="작성">
            <Field label="제출 대상 연도" required hint="예: 2024">
              <TextInput value={year} onChange={setYear} placeholder="YYYY" />
            </Field>
            <Field label="소득 구분" required>
              <Select value={category} onChange={setCategory} options={CATEGORIES} />
            </Field>
          </Form>
        </Drawer>
      )}
      {target && (
        <Drawer title="전산매체 파일 생성" onClose={() => setTarget(null)}>
          <Form
            onSubmit={submitMedia}
            submit="파일 생성"
            note={<p>{`${String(target['submissionYear'])}년 ${categoryName(target['incomeCategory'])} 제출집계표로 국세청 제출 규격에 맞춰 파일을 생성합니다. 규격 검증에 실패하면 파일을 만들지 않고 사유를 알려 드립니다.`}</p>}
          />
        </Drawer>
      )}
    </div>
  );
}
