import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  Select,
  ErrorText,
  type PageProps,
  type Row,
  type Page,
} from '../kit';

const SIZE = 20;
const USE_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];

type Panel = { mode: 'create' } | { mode: 'edit'; row: Row } | { mode: 'delete'; row: Row } | null;

export default function FnSfr01705Page({ role, notify }: PageProps) {
  const [useYn, setUseYn] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/allowed-ips', role, undefined, { useYn: applied, page, size: SIZE }),
    [applied, page, role],
  );

  const done = (text: string) => {
    notify(text);
    setPanel(null);
    reload();
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>접근 허용 IP</h2>
        <p>허용 IP는 출퇴근 체크 접근에만 적용되며, 미사용 IP는 접근 허용 판단에서 제외됩니다.</p>
        <Filters
          onSearch={() => {
            setPage(0);
            setApplied(useYn);
          }}
          onReset={() => {
            setUseYn('');
            setApplied('');
            setPage(0);
          }}
        >
          <Field label="사용 여부">
            <Select value={useYn} onChange={setUseYn} options={USE_OPTIONS} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={() => setPanel({ mode: 'create' })}>IP 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        {loading && !data ? <p>불러오는 중입니다.</p> : null}
        <DataTable
          columns={[
            { key: 'ipAddress', label: '허용 IP 주소' },
            { key: 'description', label: '설명' },
            { key: 'useYn', label: '사용 여부', render: (r) => <Badge value={r.useYn} /> },
            {
              key: 'actions',
              label: '처리',
              render: (r) => (
                <span>
                  <button className="ghost" onClick={() => setPanel({ mode: 'edit', row: r })}>
                    수정
                  </button>
                  <button className="ghost" onClick={() => setPanel({ mode: 'delete', row: r })}>
                    삭제
                  </button>
                </span>
              ),
            },
          ]}
          rows={data?.items ?? []}
          empty="아직 등록한 허용 IP가 없습니다. IP 등록 버튼으로 추가해 주세요."
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>

      {panel && panel.mode !== 'delete' ? (
        <Drawer title={panel.mode === 'create' ? '접근 허용 IP 등록' : '접근 허용 IP 수정'} onClose={() => setPanel(null)}>
          <IpForm
            role={role}
            row={panel.mode === 'edit' ? panel.row : undefined}
            onDone={done}
          />
        </Drawer>
      ) : null}

      {panel && panel.mode === 'delete' ? (
        <Drawer title="접근 허용 IP 삭제" onClose={() => setPanel(null)}>
          <Form
            submit="삭제"
            danger
            note={`${String(panel.row.ipAddress)} 을(를) 삭제하면 되돌릴 수 없습니다. 삭제 내용은 변경 이력에 남습니다.`}
            onSubmit={async () => {
              await call('DELETE', `/allowed-ips/${String(panel.row.allowedIpId)}`, role);
              done('접근 허용 IP를 삭제했습니다.');
            }}
          />
        </Drawer>
      ) : null}
    </div>
  );
}

function IpForm({ role, row, onDone }: { role: string; row?: Row; onDone: (text: string) => void }) {
  const [ipAddress, setIpAddress] = useState(row ? String(row.ipAddress ?? '') : '');
  const [description, setDescription] = useState(row ? String(row.description ?? '') : '');
  const [useYn, setUseYn] = useState(row ? String(row.useYn ?? '사용') : '사용');

  return (
    <Form
      submit={row ? '수정' : '등록'}
      onSubmit={async () => {
        if (ipAddress.trim() === '') {
          throw new Error('허용 IP 주소를 입력해 주세요.');
        }
        if (useYn === '') {
          throw new Error('사용 여부를 선택해 주세요.');
        }
        const body: Row = { ipAddress: ipAddress.trim(), description, useYn };
        if (row) {
          await call('PUT', `/allowed-ips/${String(row.allowedIpId)}`, role, body);
          onDone('접근 허용 IP를 수정했습니다.');
        } else {
          await call('POST', '/allowed-ips', role, body);
          onDone('접근 허용 IP를 등록했습니다.');
        }
      }}
    >
      <Field label="허용 IP 주소" required hint="IPv4 또는 IPv6 형식으로 입력합니다.">
        <TextInput value={ipAddress} onChange={setIpAddress} />
      </Field>
      <Field label="설명" wide>
        <TextInput value={description} onChange={setDescription} multiline />
      </Field>
      <Field label="사용 여부" required>
        <Select value={useYn} onChange={setUseYn} options={USE_OPTIONS} />
      </Field>
    </Form>
  );
}
