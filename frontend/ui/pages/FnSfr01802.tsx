import { useState } from 'react';
import {
  Band,
  call,
  DataTable,
  Drawer,
  ErrorText,
  Field,
  Filters,
  Form,
  LookupSelect,
  Pager,
  Select,
  TextInput,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

type Panel = { kind: 'setting'; row: Row } | { kind: 'item' } | { kind: 'form' } | null;

const USE_OPTIONS: [string, string][] = [
  ['사용', '사용'],
  ['미사용', '미사용'],
];

export default function FnSfr01802Page({ role, notify }: PageProps) {
  const [category, setCategory] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [settingValue, setSettingValue] = useState('');
  const [description, setDescription] = useState('');
  const [itemId, setItemId] = useState<number | string>('');
  const [itemUse, setItemUse] = useState('');
  const [formId, setFormId] = useState<number | string>('');
  const [formBody, setFormBody] = useState('');
  const [formUse, setFormUse] = useState('');

  const list = useData<Page>(
    () => call<Page>('GET', '/system-settings', role, undefined, { category: applied, page, size: 20 }),
    [applied, page, role],
  );

  const openSetting = (row: Row) => {
    setSettingValue(String(row['settingValue'] ?? ''));
    setDescription('');
    setPanel({ kind: 'setting', row });
  };

  const openItem = () => {
    setItemId('');
    setItemUse('');
    setPanel({ kind: 'item' });
  };

  const openForm = () => {
    setFormId('');
    setFormBody('');
    setFormUse('');
    setPanel({ kind: 'form' });
  };

  const close = () => setPanel(null);

  const saveSetting = async (row: Row) => {
    if (settingValue.trim() === '') {
      throw new Error('설정 값을 입력해 주세요.');
    }
    const body: Row = { settingValue };
    if (description.trim() !== '') {
      body['description'] = description;
    }
    await call('PUT', `/system-settings/${row['systemSettingId']}`, role, body);
    notify('근태 설정값을 수정했습니다.');
    close();
    list.reload();
  };

  const saveItem = async () => {
    if (itemId === '') {
      throw new Error('근태 유형을 선택해 주세요.');
    }
    if (itemUse === '') {
      throw new Error('사용 여부를 선택해 주세요.');
    }
    await call('PUT', `/attendance-items/${itemId}`, role, { useYn: itemUse });
    notify('근태 유형 사용 여부를 수정했습니다.');
    close();
  };

  const saveForm = async () => {
    if (formId === '') {
      throw new Error('신청 양식을 선택해 주세요.');
    }
    if (formUse === '') {
      throw new Error('사용 여부를 선택해 주세요.');
    }
    const body: Row = { useStatus: formUse };
    if (formBody.trim() !== '') {
      body['formBody'] = formBody;
    }
    await call('PUT', `/approval-forms/${formId}`, role, body);
    notify('근태 신청 양식을 수정했습니다.');
    close();
  };

  const data = list.data;

  return (
    <div className="doc">
      <section className="box">
        <h2>근태 설정</h2>
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
        <Band total={data?.total}>
          <button className="ghost" onClick={openItem}>근태 유형 사용 여부 변경</button>
          <button className="ghost" onClick={openForm}>신청 양식 수정</button>
        </Band>
        {list.error !== '' && <ErrorText text={list.error} />}
        <DataTable
          columns={[
            { key: 'category', label: '설정 분류' },
            { key: 'settingName', label: '설정 항목명' },
            { key: 'settingKey', label: '설정 키' },
            { key: 'settingValue', label: '설정 값' },
            {
              key: 'edit',
              label: '수정',
              render: (row) => (
                <button className="ghost" onClick={() => openSetting(row)}>값 수정</button>
              ),
            },
          ]}
          rows={data?.items ?? []}
          empty="등록된 근태 설정이 없습니다."
        />
        <Pager page={page} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPage} />
      </section>

      {panel?.kind === 'setting' && (
        <Drawer title="근태 설정값 수정" onClose={close}>
          <Form
            submit="저장"
            note="변경한 설정은 이후 신청부터 적용됩니다."
            onSubmit={() => saveSetting(panel.row)}
          >
            <Field label="설정 항목명" wide>
              <span>{String(panel.row['settingName'] ?? panel.row['settingKey'] ?? '')}</span>
            </Field>
            <Field label="설정 값" required wide>
              <TextInput value={settingValue} onChange={setSettingValue} />
            </Field>
            <Field label="설명" wide hint="비우면 기존 설명을 유지합니다.">
              <TextInput value={description} onChange={setDescription} multiline />
            </Field>
          </Form>
        </Drawer>
      )}

      {panel?.kind === 'item' && (
        <Drawer title="근태 유형 사용 여부 변경" onClose={close}>
          <Form
            submit="저장"
            note="미사용으로 바꾼 근태 유형은 이후 신청할 수 없습니다."
            onSubmit={saveItem}
          >
            <Field label="근태 유형" required wide>
              <LookupSelect table="attendance_item" role={role} value={itemId} onChange={setItemId} />
            </Field>
            <Field label="사용 여부" required wide>
              <Select value={itemUse} onChange={setItemUse} options={USE_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      )}

      {panel?.kind === 'form' && (
        <Drawer title="근태 신청 양식 수정" onClose={close}>
          <Form submit="저장" onSubmit={saveForm}>
            <Field label="결재양식" required wide>
              <LookupSelect table="approval_form" role={role} value={formId} onChange={setFormId} />
            </Field>
            <Field label="양식 본문(HTML)" wide hint="비우면 기존 본문을 유지합니다.">
              <TextInput value={formBody} onChange={setFormBody} multiline />
            </Field>
            <Field label="사용 여부" required wide>
              <Select value={formUse} onChange={setFormUse} options={USE_OPTIONS} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
