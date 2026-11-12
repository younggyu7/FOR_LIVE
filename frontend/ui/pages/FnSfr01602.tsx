import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  NumberInput,
  Select,
  Num,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

export default function FnSfr01602Page({ role, notify }: PageProps) {
  const [pageNo, setPageNo] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [prefix, setPrefix] = useState('');
  const [digits, setDigits] = useState<number | string>('');
  const [cycle, setCycle] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/certificate-types/numbering', role, undefined, { page: pageNo, size: 20 }),
    [pageNo, role],
  );

  const open = (row: Row) => {
    setEditing(row);
    setPrefix(String(row['numberingPrefix'] ?? ''));
    setDigits((row['numberingDigits'] as number | null) ?? '');
    setCycle(String(row['numberingResetCycle'] ?? ''));
  };

  const save = async () => {
    if (!editing) return;
    if (prefix.trim() === '') throw new Error('채번 접두어를 입력해 주세요.');
    if (digits === '') throw new Error('채번 자릿수를 입력해 주세요.');
    if (cycle === '') throw new Error('채번 초기화 주기를 선택해 주세요.');
    await call(
      'PUT',
      '/certificate-types/{certificateTypeId}/numbering'.replace('{certificateTypeId}', String(editing['certificateTypeId'])),
      role,
      { numberingPrefix: prefix, numberingDigits: digits, numberingResetCycle: cycle },
    );
    notify('채번 규칙을 저장했습니다.');
    setEditing(null);
    reload();
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>증명서별 채번 설정</h2>
        <p>증명서 종류를 누르면 채번 규칙을 수정할 수 있습니다.</p>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'name', label: '증명서 종류명' },
            { key: 'numberingPrefix', label: '채번 접두어' },
            { key: 'numberingDigits', label: '채번 자릿수', render: (r: Row) => <Num value={r['numberingDigits']} /> },
            { key: 'numberingResetCycle', label: '채번 초기화 주기' },
            { key: 'lastSequence', label: '마지막 일련번호', render: (r: Row) => <Num value={r['lastSequence']} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={open}
          empty={loading ? '불러오는 중입니다.' : '아직 등록한 증명서 종류가 없습니다.'}
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
      {editing ? (
        <Drawer title={'채번 규칙 수정 · ' + String(editing['name'])} onClose={() => setEditing(null)}>
          <Form onSubmit={save} submit="저장">
            <Field label="채번 접두어" required>
              <TextInput value={prefix} onChange={setPrefix} placeholder="최대 20자" />
            </Field>
            <Field label="채번 자릿수" required>
              <NumberInput value={digits} onChange={setDigits} />
            </Field>
            <Field label="채번 초기화 주기" required>
              <Select
                value={cycle}
                onChange={setCycle}
                options={[
                  ['연', '연'],
                  ['없음', '없음'],
                ]}
              />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
