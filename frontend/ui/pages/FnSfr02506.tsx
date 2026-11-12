import { useState } from 'react';
import { call, useData, Band, DataTable, Pager, Drawer, Form, Field, TextInput, Filters, Pairs, ErrorText } from '../kit';
import type { PageProps, Row, Page } from '../kit';

export default function FnSfr02506Page({ role, notify }: PageProps) {
  const [category, setCategory] = useState('자산');
  const [applied, setApplied] = useState('자산');
  const [pageNo, setPageNo] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');

  const { data, error, reload } = useData(
    () => call<Page>('GET', '/system-settings', role, undefined, { category: applied, page: pageNo, size: 20 }),
    [applied, pageNo, role],
  );

  const openEdit = (row: Row) => {
    setEditing(row);
    setValue(String(row.settingValue ?? ''));
    setDescription('');
  };

  const submit = async () => {
    if (!editing) return;
    if (!value.trim()) {
      throw new Error('설정 값을 입력해 주세요.');
    }
    const body: Row = { settingValue: value };
    if (description.trim()) {
      body.description = description;
    }
    await call('PUT', `/system-settings/${editing.systemSettingId}`, role, body);
    notify('환경설정을 저장했습니다. 변경은 이후 등록 건부터 적용됩니다.');
    setEditing(null);
    reload();
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>자산 기초환경설정</h2>
        <p>자산품목코드 부여 규칙, 검수조서 사용 여부, 결재 연계 여부를 확인하고 수정합니다.</p>
        <Filters
          onSearch={() => {
            setPageNo(0);
            setApplied(category);
          }}
          onReset={() => {
            setCategory('자산');
            setApplied('자산');
            setPageNo(0);
          }}
        >
          <Field label="설정 분류">
            <TextInput value={category} onChange={setCategory} />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          rows={data?.items ?? []}
          empty="조회된 환경설정이 없습니다. 설정 분류를 확인해 주세요."
          columns={[
            { key: 'category', label: '설정 분류' },
            { key: 'settingName', label: '설정 항목명' },
            { key: 'settingKey', label: '설정 키' },
            { key: 'settingValue', label: '설정 값' },
            {
              key: 'action',
              label: '수정',
              render: (row: Row) => (
                <button className="ghost" onClick={() => openEdit(row)}>
                  수정
                </button>
              ),
            },
          ]}
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPageNo} />
      </section>
      {editing ? (
        <Drawer title="환경설정 수정" onClose={() => setEditing(null)}>
          <Pairs
            items={[
              ['설정 분류', String(editing.category ?? '')],
              ['설정 항목명', String(editing.settingName ?? '')],
              ['설정 키', String(editing.settingKey ?? '')],
            ]}
          />
          <Form onSubmit={submit} submit="저장" note="설정 변경은 이후 등록 건부터 적용됩니다.">
            <Field label="설정 값" required wide>
              <TextInput value={value} onChange={setValue} />
            </Field>
            <Field label="설명" wide>
              <TextInput value={description} onChange={setDescription} multiline />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
