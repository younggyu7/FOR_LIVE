import { useState } from 'react';
import { call, useData, Badge, Filters, Band, DataTable, Pager, Drawer, Form, Field, TextInput, Select, LookupSelect, RefName, ErrorText } from '../kit';
import type { PageProps, Row, Page } from '../kit';

const YES_NO: [string, string][] = [['Y', '사용'], ['N', '사용 안 함']];
const USE_STATUS: [string, string][] = [['사용', '사용'], ['미사용', '미사용']];

function SettingForm({ role, row, onDone }: { role: string; row: Row | null; onDone: (text: string) => void }) {
  const [evidenceType, setEvidenceType] = useState(row ? String(row['evidenceType'] ?? '') : '');
  const [evidenceItemName, setEvidenceItemName] = useState(row ? String(row['evidenceItemName'] ?? '') : '');
  const [collectEnabled, setCollectEnabled] = useState(row && row['collectEnabled'] === false ? 'N' : 'Y');
  const [autoJournalEnabled, setAutoJournalEnabled] = useState(row && row['autoJournalEnabled'] === false ? 'N' : 'Y');
  const [collectCondition, setCollectCondition] = useState(row ? String(row['collectCondition'] ?? '') : '');
  const [journalCondition, setJournalCondition] = useState(row ? String(row['journalCondition'] ?? '') : '');
  const [accountSubjectId, setAccountSubjectId] = useState<number | string>(row ? (row['accountSubjectId'] as number) : '');
  const [useStatus, setUseStatus] = useState(row ? String(row['useStatus'] ?? '사용') : '사용');

  const submit = async () => {
    const missing: string[] = [];
    if (!evidenceType.trim()) {
      missing.push('증빙유형');
    }
    if (!evidenceItemName.trim()) {
      missing.push('증빙항목명');
    }
    if (accountSubjectId === '' || accountSubjectId === undefined) {
      missing.push('분개 계정과목');
    }
    if (missing.length > 0) {
      throw new Error('다음 항목을 입력해 주세요: ' + missing.join(', '));
    }
    const body: Row = {
      evidenceType: evidenceType.trim(),
      evidenceItemName: evidenceItemName.trim(),
      collectEnabled: collectEnabled === 'Y',
      autoJournalEnabled: autoJournalEnabled === 'Y',
      collectCondition,
      journalCondition,
      accountSubjectId,
      useStatus,
    };
    if (row) {
      await call('PUT', '/auto-journal-settings/' + String(row['autoJournalSettingId']), role, body);
      onDone('설정을 수정했습니다.');
    } else {
      await call('POST', '/auto-journal-settings', role, body);
      onDone('설정을 등록했습니다.');
    }
  };

  return (
    <Form onSubmit={submit} submit={row ? '수정 저장' : '등록'}>
      <Field label="증빙유형" required hint="예: 통장, 카드, 현금영수증, 전자세금계산서">
        <TextInput value={evidenceType} onChange={setEvidenceType} />
      </Field>
      <Field label="증빙항목명" required>
        <TextInput value={evidenceItemName} onChange={setEvidenceItemName} />
      </Field>
      <Field label="자료수집 사용 여부" required>
        <Select value={collectEnabled} onChange={setCollectEnabled} options={YES_NO} />
      </Field>
      <Field label="자료수집 조건" wide>
        <TextInput value={collectCondition} onChange={setCollectCondition} multiline />
      </Field>
      <Field label="자동분개 사용 여부" required>
        <Select value={autoJournalEnabled} onChange={setAutoJournalEnabled} options={YES_NO} />
      </Field>
      <Field label="자동분개 조건" wide>
        <TextInput value={journalCondition} onChange={setJournalCondition} multiline />
      </Field>
      <Field label="분개 계정과목" required>
        <LookupSelect table="account_subject" role={role} value={accountSubjectId} onChange={setAccountSubjectId} />
      </Field>
      <Field label="사용 여부" hint="미사용 증빙항목은 자료수집과 자동분개에서 제외됩니다.">
        <Select value={useStatus} onChange={setUseStatus} options={USE_STATUS} />
      </Field>
    </Form>
  );
}

export default function FnSfr00701Page({ role, notify }: PageProps) {
  const [evidenceType, setEvidenceType] = useState('');
  const [useStatus, setUseStatus] = useState('');
  const [applied, setApplied] = useState<{ evidenceType: string; useStatus: string }>({ evidenceType: '', useStatus: '' });
  const [pageNo, setPageNo] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/auto-journal-settings', role, undefined, { evidenceType: applied.evidenceType, useStatus: applied.useStatus, page: pageNo, size: 20 }),
    [role, applied, pageNo],
  );

  const search = () => {
    setPageNo(0);
    setApplied({ evidenceType, useStatus });
  };

  const reset = () => {
    setEvidenceType('');
    setUseStatus('');
    setPageNo(0);
    setApplied({ evidenceType: '', useStatus: '' });
  };

  const done = (text: string) => {
    setCreating(false);
    setEditing(null);
    notify(text);
    reload();
  };

  return (
    <div>
      <h1>자동전표 증빙설정</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="증빙유형">
          <TextInput value={evidenceType} onChange={setEvidenceType} />
        </Field>
        <Field label="사용 여부">
          <Select value={useStatus} onChange={setUseStatus} options={USE_STATUS} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data ? data.total : 0}>
        <button onClick={() => setCreating(true)}>설정 등록</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      <DataTable
        columns={[
          { key: 'evidenceType', label: '증빙유형' },
          { key: 'evidenceItemName', label: '증빙항목명' },
          { key: 'accountSubjectId', label: '분개 계정과목', render: (r: Row) => <RefName table="account_subject" role={role} value={r['accountSubjectId']} /> },
          { key: 'useStatus', label: '사용 여부', render: (r: Row) => <Badge value={r['useStatus']} /> },
        ]}
        rows={data ? data.items : []}
        onRowClick={(r: Row) => setEditing(r)}
        empty="아직 등록한 설정이 없습니다. 설정 등록 버튼으로 증빙항목을 추가해 주세요."
      />
      <Pager page={pageNo} size={data ? data.size : 20} total={data ? data.total : 0} onPage={setPageNo} />
      {creating ? (
        <Drawer title="자동전표 증빙설정 등록" onClose={() => setCreating(false)}>
          <SettingForm role={role} row={null} onDone={done} />
        </Drawer>
      ) : null}
      {editing ? (
        <Drawer title="자동전표 증빙설정 수정" onClose={() => setEditing(null)}>
          <SettingForm role={role} row={editing} onDone={done} />
        </Drawer>
      ) : null}
    </div>
  );
}
