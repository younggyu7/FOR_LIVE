import { useState } from 'react';
import {
  call,
  useData,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  ErrorText,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

export default function FnSfr00207Page({ role, notify }: PageProps) {
  const [category, setCategory] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [value, setValue] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/system-settings', role, undefined, { category: applied, page, size: 20 }),
    [applied, page, role],
  );

  function openEdit(row: Row) {
    setEditing(row);
    setValue(String(row['settingValue'] ?? ''));
  }

  async function save() {
    if (!editing) return;
    if (value.trim() === '') {
      throw new Error('설정 값을 입력해 주세요.');
    }
    await call('PATCH', '/system-settings/' + String(editing['systemSettingId']), role, { settingValue: value });
    notify('환경설정 값을 변경했습니다.');
    setEditing(null);
    reload();
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>기준정보 환경설정</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setApplied(category);
          }}
          onReset={() => {
            setCategory('');
            setApplied('');
            setPage(0);
          }}
        >
          <Field label="설정 분류">
            <TextInput value={category} onChange={setCategory} />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'category', label: '설정 분류' },
            { key: 'settingName', label: '설정 항목명' },
            { key: 'settingKey', label: '설정 키' },
            { key: 'settingValue', label: '설정 값' },
            {
              key: 'systemSettingId',
              label: '처리',
              render: (row) => (
                <button className="ghost" onClick={() => openEdit(row)}>
                  값 변경
                </button>
              ),
            },
          ]}
          rows={data?.items ?? []}
          empty={loading ? '불러오는 중입니다.' : '조회된 환경설정 항목이 없습니다.'}
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {editing ? (
        <Drawer title="환경설정 값 변경" onClose={() => setEditing(null)}>
          <Form
            onSubmit={save}
            submit="저장"
            note="변경한 값은 이후 처리되는 업무부터 적용됩니다."
          >
            <Field label="설정 분류">
              <span>{String(editing['category'] ?? '')}</span>
            </Field>
            <Field label="설정 항목명">
              <span>{String(editing['settingName'] ?? '')}</span>
            </Field>
            <Field label="설정 값" required wide>
              <TextInput value={value} onChange={setValue} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
