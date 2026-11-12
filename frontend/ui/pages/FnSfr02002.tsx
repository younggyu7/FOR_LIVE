import { useState } from 'react';
import {
  Band, Badge, DataTable, Drawer, Field, Filters, Form, LookupSelect, NumberInput, Pager, RefName, Select, TextInput, call, useData,
} from '../kit';
import type { PageProps, Page, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr02002Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'mapping' | 'setting'>('mapping');
  const [page, setPage] = useState(0);
  const [editMapping, setEditMapping] = useState<Row | null>(null);
  const [accountSubjectId, setAccountSubjectId] = useState<number | string>('');
  const [isActive, setIsActive] = useState('');
  const [settingPage, setSettingPage] = useState(0);
  const [categoryInput, setCategoryInput] = useState('');
  const [category, setCategory] = useState('');
  const [editSetting, setEditSetting] = useState<Row | null>(null);
  const [settingValue, setSettingValue] = useState('');

  const mappings = useData<Page>(
    () => call<Page>('GET', '/payroll-account-mappings', role, undefined, { page, size: PAGE_SIZE }),
    [role, page],
  );
  const settings = useData<Page>(
    () => call<Page>('GET', '/system-settings', role, undefined, { page: settingPage, size: PAGE_SIZE, category }),
    [role, settingPage, category],
  );

  function openMapping(row: Row) {
    setEditMapping(row);
    setAccountSubjectId(row.accountSubjectId as number);
    setIsActive(String(row.isActive ?? ''));
  }

  function openSetting(row: Row) {
    setEditSetting(row);
    setSettingValue(String(row.settingValue ?? ''));
  }

  async function saveMapping() {
    if (accountSubjectId === '' || !isActive) {
      throw new Error('계정과목과 사용 여부를 모두 입력해 주세요.');
    }
    await call('PUT', '/payroll-account-mappings/' + String(editMapping?.payrollAccountMappingId), role, {
      accountSubjectId,
      isActive,
    });
    notify('전표처리 계정과목을 저장했습니다.');
    setEditMapping(null);
    mappings.reload();
  }

  async function saveSetting() {
    if (!settingValue.trim()) {
      throw new Error('설정 값을 입력해 주세요.');
    }
    await call('PATCH', '/system-settings/' + String(editSetting?.systemSettingId), role, { settingValue });
    notify('급여 기준 설정을 저장했습니다.');
    setEditSetting(null);
    settings.reload();
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>급여 기준 및 계정과목 설정</h2>
        <button className={tab === 'mapping' ? '' : 'ghost'} onClick={() => setTab('mapping')}>
          전표처리 계정과목
        </button>
        <button className={tab === 'setting' ? '' : 'ghost'} onClick={() => setTab('setting')}>
          출결 마감·급여 계산 기준
        </button>
      </section>

      {tab === 'mapping' && (
        <section className="box">
          <h2>급여 구분별 전표처리 계정과목</h2>
          {mappings.error && <p>{mappings.error}</p>}
          <Band total={mappings.data?.total} />
          <DataTable
            columns={[
              { key: 'payrollType', label: '급여 구분' },
              {
                key: 'accountSubjectId',
                label: '계정과목',
                render: (row) => <RefName table="account_subject" role={role} value={row.accountSubjectId} />,
              },
              { key: 'isActive', label: '사용 여부', render: (row) => <Badge value={row.isActive} /> },
              {
                key: 'action',
                label: '처리',
                render: (row) => (
                  <button className="ghost" onClick={() => openMapping(row)}>
                    수정
                  </button>
                ),
              },
            ]}
            rows={mappings.data?.items ?? []}
            empty="아직 등록한 급여 전표 계정 설정이 없습니다."
          />
          <Pager page={page} size={PAGE_SIZE} total={mappings.data?.total ?? 0} onPage={setPage} />
        </section>
      )}

      {tab === 'setting' && (
        <section className="box">
          <h2>출결 마감 기준과 급여·근태 계산 기준</h2>
          <Filters
            onSearch={() => {
              setSettingPage(0);
              setCategory(categoryInput);
            }}
            onReset={() => {
              setCategoryInput('');
              setCategory('');
              setSettingPage(0);
            }}
          >
            <Field label="설정 분류">
              <TextInput value={categoryInput} onChange={setCategoryInput} />
            </Field>
          </Filters>
          {settings.error && <p>{settings.error}</p>}
          <Band total={settings.data?.total} />
          <DataTable
            columns={[
              { key: 'category', label: '설정 분류' },
              { key: 'settingName', label: '설정 항목명' },
              { key: 'settingValue', label: '설정 값' },
              {
                key: 'action',
                label: '처리',
                render: (row) => (
                  <button className="ghost" onClick={() => openSetting(row)}>
                    수정
                  </button>
                ),
              },
            ]}
            rows={settings.data?.items ?? []}
            empty="아직 등록한 설정 항목이 없습니다."
          />
          <Pager page={settingPage} size={PAGE_SIZE} total={settings.data?.total ?? 0} onPage={setSettingPage} />
        </section>
      )}

      {editMapping && (
        <Drawer title="전표처리 계정과목 수정" onClose={() => setEditMapping(null)}>
          <Form
            submit="저장"
            onSubmit={saveMapping}
            note="변경은 저장 이후 처리하는 급여 건부터 적용되며 변경 이력이 남습니다."
          >
            <Field label="급여 구분">
              <span>{String(editMapping.payrollType ?? '')}</span>
            </Field>
            <Field label="계정과목" required>
              <LookupSelect
                table="account_subject"
                role={role}
                value={accountSubjectId}
                onChange={setAccountSubjectId}
              />
            </Field>
            <Field label="사용 여부" required>
              <Select
                value={isActive}
                onChange={setIsActive}
                options={[
                  ['사용', '사용'],
                  ['미사용', '미사용'],
                ]}
              />
            </Field>
          </Form>
        </Drawer>
      )}

      {editSetting && (
        <Drawer title="급여 기준 수정" onClose={() => setEditSetting(null)}>
          <Form
            submit="저장"
            onSubmit={saveSetting}
            note="변경은 저장 이후 처리하는 급여 건부터 적용됩니다."
          >
            <Field label="설정 항목명">
              <span>{String(editSetting.settingName ?? '')}</span>
            </Field>
            <Field label="설정 값" required wide>
              <TextInput value={settingValue} onChange={setSettingValue} />
            </Field>
          </Form>
        </Drawer>
      )}
    </div>
  );
}
