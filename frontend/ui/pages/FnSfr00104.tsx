import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  Select,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const TARGET_OPTIONS: [string, string][] = [
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

const STATUS_OPTIONS: [string, string][] = [
  ['REQUESTED', '요청됨'],
  ['SUCCESS', '성공'],
  ['FAILED', '실패'],
];

function nameOf(options: [string, string][], value: unknown): string {
  const found = options.find((o) => o[0] === value);
  return found ? found[1] : String(value ?? '');
}

export default function FnSfr00104Page({ role, notify }: PageProps) {
  const size = 20;
  const [page, setPage] = useState(0);
  const [targetDraft, setTargetDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [linkTarget, setLinkTarget] = useState('E_NARA_DOUM');
  const [linkType, setLinkType] = useState('');
  const [requestSummary, setRequestSummary] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/link-logs', role, undefined, { linkTarget: target, status, page, size }),
    [target, status, page],
  );

  function search() {
    setPage(0);
    setTarget(targetDraft);
    setStatus(statusDraft);
  }

  function reset() {
    setTargetDraft('');
    setStatusDraft('');
    setTarget('');
    setStatus('');
    setPage(0);
  }

  function openCreate() {
    setLinkTarget('E_NARA_DOUM');
    setLinkType('');
    setRequestSummary('');
    setCreating(true);
  }

  async function submit() {
    if (!linkTarget) {
      throw new Error('연계 대상을 선택해 주세요.');
    }
    if (!String(linkType).trim()) {
      throw new Error('연계 구분을 입력해 주세요.');
    }
    const result = await call<Row>('POST', '/link-logs', role, {
      linkTarget,
      linkType,
      requestSummary,
    });
    setCreating(false);
    notify('연계를 요청했습니다. 처리 상태: ' + nameOf(STATUS_OPTIONS, result.status));
    reload();
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>연계 이력</h2>
          <Pairs
            items={[
              ['외부 연계 이력 ID', String(selected.linkLogId)],
              ['연계 대상', nameOf(TARGET_OPTIONS, selected.linkTarget)],
              ['연계 구분', String(selected.linkType ?? '')],
              ['연계 상태', <Badge value={selected.status} />],
              ['요청 일시', <DateText value={selected.requestedAt} time />],
              ['완료 일시', <DateText value={selected.completedAt} time />],
              ['실패 사유', String(selected.failureReason ?? '')],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>e나라도움 연동</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="연계 대상">
          <Select value={targetDraft} onChange={setTargetDraft} options={TARGET_OPTIONS} placeholder="전체" />
        </Field>
        <Field label="연계 상태">
          <Select value={statusDraft} onChange={setStatusDraft} options={STATUS_OPTIONS} placeholder="전체" />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={openCreate}>연계 요청</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      <DataTable
        columns={[
          { key: 'linkLogId', label: '외부 연계 이력 ID' },
          { key: 'linkTarget', label: '연계 대상', render: (r) => nameOf(TARGET_OPTIONS, r.linkTarget) },
          { key: 'linkType', label: '연계 구분' },
          { key: 'status', label: '연계 상태', render: (r) => <Badge value={r.status} /> },
          { key: 'requestedAt', label: '요청 일시', render: (r) => <DateText value={r.requestedAt} time /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={(r) => setSelected(r)}
        empty={loading ? '불러오는 중입니다.' : '아직 연계 이력이 없습니다. 연계 요청 버튼으로 첫 연계를 요청해 보세요.'}
      />
      <Pager page={page} size={size} total={data?.total ?? 0} onPage={setPage} />
      {creating ? (
        <Drawer title="연계 요청" onClose={() => setCreating(false)}>
          <Form onSubmit={submit} submit="연계 요청">
            <Field label="연계 대상" required>
              <Select value={linkTarget} onChange={setLinkTarget} options={TARGET_OPTIONS} />
            </Field>
            <Field label="연계 구분" required>
              <TextInput value={linkType} onChange={setLinkType} placeholder="예: 집행 내역 전송" />
            </Field>
            <Field label="요청 조건" wide>
              <TextInput value={requestSummary} onChange={setRequestSummary} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
