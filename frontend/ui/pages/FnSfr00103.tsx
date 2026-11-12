import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  DateText,
  Filters,
  Field,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  TextInput,
  DateInput,
  Select,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const SIZE = 20;

export default function FnSfr00103Page({ role, notify }: PageProps) {
  const [matchStatus, setMatchStatus] = useState('');
  const [scannedFrom, setScannedFrom] = useState('');
  const [scannedTo, setScannedTo] = useState('');
  const [applied, setApplied] = useState({ matchStatus: '', scannedFrom: '', scannedTo: '' });
  const [page, setPage] = useState(0);
  const [opening, setOpening] = useState(false);
  const [tagValue, setTagValue] = useState('');
  const [scannedAt, setScannedAt] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/rfid-scan-logs', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page],
  );

  function search() {
    setPage(0);
    setApplied({ matchStatus, scannedFrom, scannedTo });
  }

  function reset() {
    setMatchStatus('');
    setScannedFrom('');
    setScannedTo('');
    setPage(0);
    setApplied({ matchStatus: '', scannedFrom: '', scannedTo: '' });
  }

  function openForm() {
    setTagValue('');
    setScannedAt('');
    setOpening(true);
  }

  async function submit() {
    if (tagValue.trim() === '') {
      throw new Error('RFID 태그 식별값을 입력해 주세요.');
    }
    if (scannedAt.trim() === '') {
      throw new Error('스캔 일시를 입력해 주세요.');
    }
    const result = await call('POST', '/rfid-scan-logs', role, {
      tagValue: tagValue.trim(),
      scannedAt: scannedAt.trim(),
    });
    if (result['matchStatus'] === 'MATCHED') {
      notify('스캔 결과를 등록했습니다. 자산: ' + String(result['assetName']));
    } else {
      notify('등록된 자산과 매칭되지 않아 미매칭 태그로 기록했습니다.');
    }
    setOpening(false);
    reload();
  }

  const rows: Row[] = data ? data.items : [];

  return (
    <div>
      <h1>RFID 기반 자산 관리</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label='매칭 여부'>
          <Select
            value={matchStatus}
            onChange={setMatchStatus}
            options={[
              ['MATCHED', '매칭'],
              ['UNMATCHED', '미매칭'],
            ]}
            placeholder='전체'
          />
        </Field>
        <Field label='스캔 시작 일시'>
          <DateInput value={scannedFrom} onChange={setScannedFrom} />
        </Field>
        <Field label='스캔 종료 일시'>
          <DateInput value={scannedTo} onChange={setScannedTo} />
        </Field>
      </Filters>
      <Band total={data ? data.total : undefined}>
        <button onClick={openForm}>스캔 결과 등록</button>
      </Band>
      {error ? <ErrorText text={error} /> : null}
      <DataTable
        columns={[
          { key: 'scannedAt', label: '스캔 일시', render: (r) => <DateText value={r['scannedAt']} time /> },
          { key: 'tagValue', label: 'RFID 태그 식별값' },
          { key: 'matchStatus', label: '매칭 여부', render: (r) => <Badge value={r['matchStatus']} /> },
          {
            key: 'assetId',
            label: '자산',
            render: (r) =>
              r['assetId'] ? <RefName table='asset' role={role} value={r['assetId']} /> : <span>미매칭</span>,
          },
        ]}
        rows={rows}
        empty={loading ? '불러오는 중입니다.' : '아직 스캔한 내역이 없습니다. 스캔 결과 등록 버튼으로 시작해 주세요.'}
      />
      <Pager page={page} size={SIZE} total={data ? data.total : 0} onPage={setPage} />
      {opening ? (
        <Drawer title='스캔 결과 등록' onClose={() => setOpening(false)}>
          <Form onSubmit={submit} submit='등록'>
            <Field label='RFID 태그 식별값' required wide>
              <TextInput value={tagValue} onChange={setTagValue} />
            </Field>
            <Field label='스캔 일시' required wide hint='예: 2025-01-31T09:00:00+09:00'>
              <TextInput value={scannedAt} onChange={setScannedAt} placeholder='2025-01-31T09:00:00+09:00' />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
