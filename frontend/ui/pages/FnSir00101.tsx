import { useState } from 'react';
import {
  Badge,
  Band,
  call,
  DataTable,
  DateInput,
  DateText,
  Drawer,
  Field,
  Filters,
  Form,
  Pager,
  Pairs,
  Select,
  TextInput,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const TARGETS: [string, string][] = [
  ['E_NARA_DOUM', 'e나라도움'],
  ['NTS_HOMETAX', '국세청 홈택스'],
  ['NTS_EFILING', '국세청 전자신고'],
  ['BANK_CMS', '은행 CMS'],
  ['CARD_COMPANY', '카드사'],
  ['LEGACY_ERP', '기존 ERP'],
  ['ASSET_INSPECTION', '자산 실사'],
  ['COMMUTE_SYSTEM', '출퇴근 시스템'],
  ['ECM', 'ECM'],
];
const STATUSES: [string, string][] = [
  ['REQUESTED', '요청됨'],
  ['SUCCESS', '성공'],
  ['FAILED', '실패'],
];

function targetName(value: unknown): string {
  const found = TARGETS.find(([code]) => code === value);
  return found ? found[1] : String(value ?? '');
}

export default function FnSir00101Page({ role, notify }: PageProps) {
  const [linkTarget, setLinkTarget] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [applied, setApplied] = useState({ linkTarget: '', status: '' });
  const [detail, setDetail] = useState<Row | null>(null);
  const [requesting, setRequesting] = useState(false);

  const [formTarget, setFormTarget] = useState('');
  const [formType, setFormType] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/link-logs', role, undefined, { ...applied, page, size: 20 }),
    [applied, page, role],
  );

  function search() {
    setPage(0);
    setApplied({ linkTarget, status });
  }

  function reset() {
    setLinkTarget('');
    setStatus('');
    setPage(0);
    setApplied({ linkTarget: '', status: '' });
  }

  function openRequest() {
    setFormTarget('');
    setFormType('');
    setFormSummary('');
    setStartDate('');
    setEndDate('');
    setRequesting(true);
  }

  async function submit() {
    if (!formTarget) {
      throw new Error('연계 대상을 선택해 주세요.');
    }
    if ((startDate && !endDate) || (!startDate && endDate)) {
      throw new Error('연계 기간은 시작일과 종료일을 함께 입력해 주세요.');
    }
    if (startDate && endDate && endDate < startDate) {
      throw new Error('종료일은 시작일 이후여야 합니다.');
    }
    await call('POST', '/link-logs/sync', role, {
      linkTarget: formTarget,
      linkType: formType,
      requestSummary: formSummary,
      startDate,
      endDate,
    });
    notify('연계를 요청했습니다.');
    setRequesting(false);
    reload();
  }

  const rows = data ? data.items : [];

  return (
    <div>
      <h1>외부 연계 이력</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="연계 대상">
          <Select value={linkTarget} onChange={setLinkTarget} options={TARGETS} placeholder="전체" />
        </Field>
        <Field label="연계 상태">
          <Select value={status} onChange={setStatus} options={STATUSES} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data ? data.total : 0}>
        <button onClick={openRequest}>연계 요청</button>
      </Band>
      {error ? <p>{error}</p> : null}
      {loading ? <p>불러오는 중입니다.</p> : null}
      <DataTable
        columns={[
          { key: 'linkTarget', label: '연계 대상', render: (r) => targetName(r['linkTarget']) },
          { key: 'linkType', label: '연계 구분' },
          { key: 'status', label: '연계 상태', render: (r) => <Badge value={r['status']} /> },
          { key: 'requestedAt', label: '요청 일시', render: (r) => <DateText value={r['requestedAt']} time /> },
          { key: 'completedAt', label: '완료 일시', render: (r) => <DateText value={r['completedAt']} time /> },
        ]}
        rows={rows}
        onRowClick={(row) => setDetail(row)}
        empty="아직 연계 이력이 없습니다. 연계 요청 버튼으로 시작해 주세요."
      />
      <Pager page={page} size={data ? data.size : 20} total={data ? data.total : 0} onPage={setPage} />

      {detail ? (
        <Drawer title="연계 이력 상세" onClose={() => setDetail(null)}>
          <Pairs
            items={[
              ['외부 연계 이력 ID', String(detail['linkLogId'] ?? '')],
              ['연계 대상', targetName(detail['linkTarget'])],
              ['연계 구분', String(detail['linkType'] ?? '')],
              ['연계 상태', <Badge value={detail['status']} />],
              ['요청 일시', <DateText value={detail['requestedAt']} time />],
              ['완료 일시', <DateText value={detail['completedAt']} time />],
              ['실패 사유', String(detail['failureReason'] ?? '')],
            ]}
          />
        </Drawer>
      ) : null}

      {requesting ? (
        <Drawer title="외부 연계 요청" onClose={() => setRequesting(false)}>
          <Form onSubmit={submit} submit="연계 요청">
            <Field label="연계 대상" required>
              <Select value={formTarget} onChange={setFormTarget} options={TARGETS} />
            </Field>
            <Field label="연계 구분">
              <TextInput value={formType} onChange={setFormType} />
            </Field>
            <Field label="연계 기간 시작일">
              <DateInput value={startDate} onChange={setStartDate} />
            </Field>
            <Field label="연계 기간 종료일">
              <DateInput value={endDate} onChange={setEndDate} />
            </Field>
            <Field label="요청 조건" wide>
              <TextInput value={formSummary} onChange={setFormSummary} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
