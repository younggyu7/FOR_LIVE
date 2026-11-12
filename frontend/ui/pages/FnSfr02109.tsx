import { useState } from 'react';
import { Band, Badge, DataTable, DateText, Drawer, Field, Form, LookupSelect, Num, NumberInput, RefName, Select, TextInput, call, useData } from '../kit';
import type { PageProps, Row } from '../kit';

interface Line {
  employeeId: number | string;
  month: string;
  amount: number | string;
}

const MONTHS: [string, string][] = Array.from({ length: 12 }, (_, i): [string, string] => [String(i + 1), (i + 1) + '월']);

const TARGETS: [string, string][] = [
  ['PARTNER', '거래처'],
  ['PERSONNEL_RECORD', '인사기록'],
  ['ANNUAL_LEAVE', '연차'],
  ['PAYROLL', '급여'],
  ['ASSET', '자산'],
  ['ATTENDANCE', '근태'],
  ['CARRYOVER', '이월'],
  ['COMMUTE_RECORD', '출퇴근 기록'],
  ['EDUCATION_ATTENDEE', '교육 참석자'],
  ['DAILY_WORKER_PAYMENT', '일용직 지급'],
];

const MODES: [string, string][] = [
  ['EXCLUDE_ERROR', '오류 건 제외 후 정상 건 반영'],
  ['CANCEL_ALL', '오류 시 전체 취소'],
];

const emptyLine = (): Line => ({ employeeId: '', month: '', amount: '' });

export default function FnSfr02109Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<'' | 'bulk' | 'upload'>('');
  const [year, setYear] = useState<number | string>(new Date().getFullYear());
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [results, setResults] = useState<Row[]>([]);
  const [uploads, setUploads] = useState<Row[]>([]);
  const [target, setTarget] = useState('PAYROLL');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState('');
  const [processMode, setProcessMode] = useState('EXCLUDE_ERROR');
  const { reload } = useData(async () => true, []);

  const setLine = (index: number, patch: Partial<Line>) => {
    setLines(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const closeDrawer = () => setMode('');

  const submitBulk = async () => {
    if (year === '' || Number(year) <= 0) {
      throw new Error('귀속 연도를 입력해 주세요.');
    }
    if (lines.some((l) => l.employeeId === '' || l.month === '' || l.amount === '')) {
      throw new Error('임직원, 월, 금액을 모두 입력해 주세요.');
    }
    const res = await call<Row>('POST', '/payrolls/annual-bulk', role, {
      attributionYear: Number(year),
      items: lines.map((l) => ({ employeeId: l.employeeId, month: Number(l.month), amount: l.amount })),
    });
    const items = (res.items as Row[]) ?? [];
    setResults([...items, ...results]);
    const errorCount = Number(res.errorCount ?? 0);
    notify(errorCount > 0 ? '연간 급여를 입력했습니다. 반영되지 않은 건이 ' + errorCount + '건 있습니다.' : '연간 급여를 입력했습니다.');
    setLines([emptyLine()]);
    closeDrawer();
    reload();
  };

  const submitUpload = async () => {
    if (fileName.trim() === '' || file.trim() === '') {
      throw new Error('파일명과 업로드 내용을 입력해 주세요.');
    }
    const res = await call<Row>('POST', '/upload-histories', role, {
      targetBusiness: target,
      fileName,
      file,
      processMode,
    });
    setUploads([{ ...res, targetBusiness: target, fileName }, ...uploads]);
    notify('엑셀 업로드 이력을 등록했습니다.');
    setFileName('');
    setFile('');
    closeDrawer();
    reload();
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>연말정산용 연간 급여 입력 결과</h2>
        <Band total={results.length}>
          <button onClick={() => setMode('bulk')}>연간 급여 입력</button>
          <button className="ghost" onClick={() => setMode('upload')}>엑셀 업로드 이력 등록</button>
        </Band>
        <DataTable
          columns={[
            { key: 'employeeId', label: '임직원', render: (r) => <RefName table="employee" role={role} value={r.employeeId} /> },
            { key: 'attributionYear', label: '귀속 연도' },
            { key: 'annualAmount', label: '연간 급여 합계', render: (r) => <Num value={r.annualAmount} /> },
            { key: 'appliedCount', label: '반영 건수', render: (r) => <Num value={r.appliedCount} /> },
            { key: 'errors', label: '미반영 사유', render: (r) => <span>{((r.errors as string[]) ?? []).join(' / ') || '-'}</span> },
          ]}
          rows={results}
          empty="아직 입력한 연간 급여가 없습니다. 연간 급여 입력 버튼을 눌러 시작하세요."
        />
      </section>
      <section className="box">
        <h2>엑셀 업로드 이력</h2>
        <DataTable
          columns={[
            { key: 'uploadHistoryId', label: '이력 번호' },
            { key: 'targetBusiness', label: '대상 업무', render: (r) => <Badge value={TARGETS.find((t) => t[0] === r.targetBusiness)?.[1] ?? r.targetBusiness} /> },
            { key: 'fileName', label: '파일명' },
            { key: 'totalCount', label: '전체 건수', render: (r) => <Num value={r.totalCount} /> },
            { key: 'errorCount', label: '오류 건수', render: (r) => <Num value={r.errorCount} /> },
          ]}
          rows={uploads}
          empty="아직 등록한 업로드 이력이 없습니다."
        />
      </section>
      {mode === 'bulk' && (
        <Drawer title="연간 급여 일괄 입력" onClose={closeDrawer}>
          <Form
            onSubmit={submitBulk}
            submit="입력"
            note="마감된 기간의 건은 반영하지 않고 사유를 안내합니다."
          >
            <Field label="귀속 연도" required>
              <NumberInput value={year} onChange={setYear} />
            </Field>
            {lines.map((line, i) => (
              <Field key={i} label={'급여 ' + (i + 1)} required wide>
                <LookupSelect table="employee" role={role} value={line.employeeId} onChange={(v) => setLine(i, { employeeId: v })} placeholder="임직원 선택" />
                <Select value={line.month} onChange={(v) => setLine(i, { month: v })} options={MONTHS} placeholder="월 선택" />
                <NumberInput value={line.amount} onChange={(v) => setLine(i, { amount: v })} />
                {lines.length > 1 && (
                  <button type="button" className="ghost" onClick={() => setLines(lines.filter((_, j) => j !== i))}>삭제</button>
                )}
              </Field>
            ))}
            <button type="button" className="ghost" onClick={() => setLines([...lines, emptyLine()])}>줄 추가</button>
          </Form>
        </Drawer>
      )}
      {mode === 'upload' && (
        <Drawer title="엑셀 업로드 이력 등록" onClose={closeDrawer}>
          <Form onSubmit={submitUpload} submit="등록">
            <Field label="업로드 대상 업무" required>
              <Select value={target} onChange={setTarget} options={TARGETS} />
            </Field>
            <Field label="파일명" required>
              <TextInput value={fileName} onChange={setFileName} />
            </Field>
            <Field label="업로드 엑셀 파일" required wide>
              <TextInput value={file} onChange={setFile} multiline />
            </Field>
            <Field label="오류 처리 방식">
              <Select value={processMode} onChange={setProcessMode} options={MODES} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
