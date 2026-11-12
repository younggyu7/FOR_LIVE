import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  Drawer,
  Field,
  Filters,
  Form,
  LookupSelect,
  Pager,
  Pairs,
  RefName,
  TextInput,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSir00201Page({ role, notify }: PageProps) {
  const [filterClient, setFilterClient] = useState<number | string>('');
  const [appliedClient, setAppliedClient] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [apiClientId, setApiClientId] = useState<number | string>('');
  const [interfaceItems, setInterfaceItems] = useState('');
  const [linkMethod, setLinkMethod] = useState('');
  const [standardVersion, setStandardVersion] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/interface-standards', role, undefined, { apiClientId: appliedClient, page, size: PAGE_SIZE }),
    [role, appliedClient, page],
  );

  function openCreate() {
    setApiClientId('');
    setInterfaceItems('');
    setLinkMethod('');
    setStandardVersion('');
    setCreating(true);
  }

  async function submit() {
    const missing: string[] = [];
    if (apiClientId === '') {
      missing.push('연계 대상 시스템');
    }
    if (interfaceItems.trim() === '') {
      missing.push('연계 정보 항목');
    }
    if (linkMethod.trim() === '') {
      missing.push('연계 방식');
    }
    if (standardVersion.trim() === '') {
      missing.push('표준 버전');
    }
    if (missing.length > 0) {
      throw new Error('다음 항목을 입력해 주세요: ' + missing.join(', '));
    }
    await call('POST', '/interface-standards', role, {
      apiClientId,
      interfaceItems: interfaceItems.trim(),
      linkMethod: linkMethod.trim(),
      standardVersion: standardVersion.trim(),
    });
    notify('연계 인터페이스 표준을 등록했습니다.');
    setCreating(false);
    setPage(0);
    reload();
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <section className="box">
          <h2>연계 인터페이스 표준</h2>
          <Pairs
            items={[
              ['연계 인터페이스 표준 ID', String(selected['interfaceStandardId'])],
              ['연계 시스템', <RefName table="api_client" role={role} value={selected['apiClientId']} />],
              ['연계 방식', String(selected['linkMethod'] ?? '')],
              ['표준 버전', String(selected['standardVersion'] ?? '')],
            ]}
          />
        </section>
        <section className="box">
          <h2>연계 정보 항목</h2>
          <p>{String(selected['interfaceItems'] ?? '')}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>내부 연계 인터페이스 표준</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setAppliedClient(filterClient);
          }}
          onReset={() => {
            setFilterClient('');
            setAppliedClient('');
            setPage(0);
          }}
        >
          <Field label="연계 시스템 ID">
            <LookupSelect table="api_client" role={role} value={filterClient} onChange={setFilterClient} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={openCreate}>표준 등록</button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        <DataTable
          columns={[
            { key: 'interfaceStandardId', label: '연계 인터페이스 표준 ID' },
            { key: 'apiClientId', label: '연계 시스템', render: (r) => <RefName table="api_client" role={role} value={r['apiClientId']} /> },
            { key: 'linkMethod', label: '연계 방식' },
            { key: 'standardVersion', label: '표준 버전' },
            { key: 'interfaceItems', label: '연계 정보 항목' },
          ]}
          rows={data?.items ?? []}
          onRowClick={(r) => setSelected(r)}
          empty={loading ? '불러오는 중입니다.' : '아직 등록한 표준이 없습니다. 표준 등록 버튼으로 첫 표준을 만들어 주세요.'}
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {creating ? (
        <Drawer title="연계 인터페이스 표준 등록" onClose={() => setCreating(false)}>
          <Form onSubmit={submit} submit="등록" note="연계 대상은 Tcon 또는 WTA 사이버연수원만 선택할 수 있습니다.">
            <Field label="연계 대상 시스템(Tcon 또는 WTA 사이버연수원)" required wide>
              <LookupSelect table="api_client" role={role} value={apiClientId} onChange={setApiClientId} />
            </Field>
            <Field label="연계 정보 항목" required wide>
              <TextInput value={interfaceItems} onChange={setInterfaceItems} multiline />
            </Field>
            <Field label="연계 방식" required>
              <TextInput value={linkMethod} onChange={setLinkMethod} />
            </Field>
            <Field label="표준 버전" required>
              <TextInput value={standardVersion} onChange={setStandardVersion} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
