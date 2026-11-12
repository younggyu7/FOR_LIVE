import { useState } from 'react';
import {
  ApiFail,
  Badge,
  Band,
  DataTable,
  Drawer,
  Field,
  Form,
  LookupSelect,
  RefName,
  Select,
  TextInput,
} from '../kit';
import type { PageProps, Row } from '../kit';
import { call } from '../kit';

type Mode = '' | 'invoke' | 'usage';

export default function FnSir00202Page({ role, notify }: PageProps) {
  const [results, setResults] = useState<Row[]>([]);
  const [mode, setMode] = useState<Mode>('');
  const [identifier, setIdentifier] = useState('');
  const [requestText, setRequestText] = useState('{}');
  const [apiClientId, setApiClientId] = useState<number | string>('');
  const [useYn, setUseYn] = useState('');

  const addResult = (row: Row) => {
    setResults((prev) => [row, ...prev]);
  };

  const close = () => {
    setMode('');
  };

  const submitInvoke = async () => {
    if (identifier.trim() === '') {
      throw new Error('요청 시스템 식별자를 입력해 주세요.');
    }
    let requestData: unknown;
    try {
      requestData = JSON.parse(requestText);
    } catch (e) {
      throw new Error('요청 데이터를 JSON 형식으로 입력해 주세요.');
    }
    if (requestData === null || typeof requestData !== 'object' || Array.isArray(requestData)) {
      throw new Error('요청 데이터는 항목과 값으로 이루어진 객체여야 합니다.');
    }
    try {
      const res = await call<Row>(
        'POST',
        '/interface-standards/invoke',
        role,
        { requestSystemIdentifier: identifier.trim(), requestData: requestData as Row },
      );
      addResult({
        kind: '표준 연계 호출',
        target: identifier.trim(),
        status: '성공',
        detail: JSON.stringify(res.responseData),
      });
      notify('표준 연계 호출을 처리했습니다.');
      close();
    } catch (e) {
      if (e instanceof ApiFail) {
        addResult({
          kind: '표준 연계 호출',
          target: identifier.trim(),
          status: '실패',
          detail: e.message,
        });
      }
      throw e;
    }
  };

  const submitUsage = async () => {
    if (apiClientId === '') {
      throw new Error('연계 시스템을 선택해 주세요.');
    }
    if (useYn === '') {
      throw new Error('API 사용 여부를 선택해 주세요.');
    }
    const res = await call<Row>('PATCH', '/api-clients/' + apiClientId, role, { useYn });
    addResult({
      kind: '사용 여부 설정',
      clientId: res.apiClientId,
      status: String(res.useYn),
      detail: 'API 사용 여부를 ' + String(res.useYn) + '(으)로 바꿨습니다.',
    });
    notify('API 사용 여부를 설정했습니다.');
    close();
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>표준 연계 API</h2>
        <Band total={results.length}>
          <button
            onClick={() => {
              setIdentifier('');
              setRequestText('{}');
              setMode('invoke');
            }}
          >
            표준 연계 호출
          </button>
          <button
            className="ghost"
            onClick={() => {
              setApiClientId('');
              setUseYn('');
              setMode('usage');
            }}
          >
            API 사용 여부 설정
          </button>
        </Band>
        <DataTable
          columns={[
            { key: 'kind', label: '구분' },
            {
              key: 'target',
              label: '연계 시스템',
              render: (row) =>
                row.clientId !== undefined ? (
                  <RefName table="api_client" role={role} value={row.clientId} />
                ) : (
                  String(row.target ?? '')
                ),
            },
            { key: 'status', label: '결과', render: (row) => <Badge value={row.status} /> },
            { key: 'detail', label: '내용' },
          ]}
          rows={results}
          empty="아직 처리한 내역이 없습니다. 위 버튼으로 표준 연계 호출이나 사용 여부 설정을 시작해 주세요."
        />
      </section>
      {mode === 'invoke' && (
        <Drawer title="표준 연계 호출" onClose={close}>
          <Form onSubmit={submitInvoke} submit="호출">
            <Field label="요청 시스템 식별자" required wide>
              <TextInput value={identifier} onChange={setIdentifier} />
            </Field>
            <Field label="표준에 정의된 연계 정보 항목 값" required wide hint="JSON 객체로 입력합니다.">
              <TextInput value={requestText} onChange={setRequestText} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
      {mode === 'usage' && (
        <Drawer title="API 사용 여부 설정" onClose={close}>
          <Form onSubmit={submitUsage} submit="설정">
            <Field label="연계 시스템" required>
              <LookupSelect table="api_client" role={role} value={apiClientId} onChange={setApiClientId} />
            </Field>
            <Field label="API 사용 여부" required>
              <Select
                value={useYn}
                onChange={setUseYn}
                options={[
                  ['사용', '사용'],
                  ['미사용', '미사용'],
                ]}
              />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
