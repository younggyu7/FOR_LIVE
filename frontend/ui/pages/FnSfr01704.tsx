import { useState } from 'react';
import {
  Band,
  DataTable,
  Drawer,
  Field,
  Filters,
  Form,
  LookupSelect,
  Pager,
  RefName,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const UNIT_OPTIONS: [string, string][] = [
  ['법인', '법인'],
  ['부서', '부서'],
  ['사원', '사원'],
];
const PAGE_SIZE = 20;

interface FormProps {
  role: string;
  row: Row | null;
  notify: (text: string) => void;
  onDone: () => void;
}

function SettingForm({ role, row, notify, onDone }: FormProps) {
  const [applyUnit, setApplyUnit] = useState<string>(row ? String(row.applyUnit ?? '') : '');
  const [departmentId, setDepartmentId] = useState<unknown>(row?.departmentId ?? '');
  const [employeeId, setEmployeeId] = useState<unknown>(row?.employeeId ?? '');
  const [checkType, setCheckType] = useState<string>(row ? String(row.checkType ?? '') : '');

  const submit = async () => {
    if (!applyUnit) {
      throw new Error('적용 단위를 선택해 주세요.');
    }
    if (applyUnit === '부서' && !departmentId) {
      throw new Error('대상 부서를 선택해 주세요.');
    }
    if (applyUnit === '사원' && !employeeId) {
      throw new Error('대상 사원을 선택해 주세요.');
    }
    if (!checkType.trim()) {
      throw new Error('출퇴근 체크 유형을 입력해 주세요.');
    }
    const body: Row = {
      applyUnit,
      departmentId: applyUnit === '부서' ? departmentId : null,
      employeeId: applyUnit === '사원' ? employeeId : null,
      checkType: checkType.trim(),
    };
    if (row) {
      await call('PUT', '/commute-check-settings/' + String(row.commuteCheckSettingId), role, body);
      notify('출퇴근 체크 유형 설정을 수정했습니다.');
    } else {
      await call('POST', '/commute-check-settings', role, body);
      notify('출퇴근 체크 유형 설정을 등록했습니다.');
    }
    onDone();
  };

  return (
    <Form onSubmit={submit} submit={row ? '수정' : '등록'} note="여러 단위가 설정되면 사원 설정, 부서 설정, 법인 공통 순으로 우선 적용합니다. 저장하면 변경 이력이 남습니다.">
      <Field label="적용 단위" required>
        <Select value={applyUnit} onChange={setApplyUnit} options={UNIT_OPTIONS} />
      </Field>
      {applyUnit === '부서' && (
        <Field label="대상 부서" required>
          <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} />
        </Field>
      )}
      {applyUnit === '사원' && (
        <Field label="대상 사원" required>
          <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
        </Field>
      )}
      <Field label="출퇴근 체크 유형" required>
        <TextInput value={checkType} onChange={setCheckType} />
      </Field>
    </Form>
  );
}

export default function FnSfr01704Page({ role, notify }: PageProps) {
  const [draftUnit, setDraftUnit] = useState('');
  const [unit, setUnit] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Row | 'new' | null>(null);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/commute-check-settings', role, undefined, { applyUnit: unit, page, size: PAGE_SIZE }),
    [unit, page, role],
  );

  const close = () => setEditing(null);
  const done = () => {
    setEditing(null);
    reload();
  };

  return (
    <div className="doc">
      <section className="box">
        <h2>출퇴근 체크 유형 설정</h2>
        <Filters
          onSearch={() => {
            setPage(0);
            setUnit(draftUnit);
          }}
          onReset={() => {
            setDraftUnit('');
            setUnit('');
            setPage(0);
          }}
        >
          <Field label="적용 단위">
            <Select value={draftUnit} onChange={setDraftUnit} options={UNIT_OPTIONS} placeholder="전체" />
          </Field>
        </Filters>
        <Band total={data?.total}>
          <button onClick={() => setEditing('new')}>설정 등록</button>
        </Band>
        {error && <p>{error}</p>}
        <DataTable
          columns={[
            { key: 'applyUnit', label: '적용 단위' },
            {
              key: 'departmentId',
              label: '대상 부서',
              render: (r) => (r.departmentId ? <RefName table="department" role={role} value={r.departmentId} /> : <span>-</span>),
            },
            {
              key: 'employeeId',
              label: '대상 사원',
              render: (r) => (r.employeeId ? <RefName table="employee" role={role} value={r.employeeId} /> : <span>-</span>),
            },
            { key: 'checkType', label: '출퇴근 체크 유형' },
            {
              key: 'commuteCheckSettingId',
              label: '관리',
              render: (r) => (
                <button className="ghost" onClick={() => setEditing(r)}>
                  수정
                </button>
              ),
            },
          ]}
          rows={data?.items ?? []}
          empty={loading ? '불러오는 중입니다.' : '아직 등록한 설정이 없습니다. 설정 등록 버튼으로 첫 설정을 추가해 주세요.'}
        />
        <Pager page={data?.page ?? 0} size={data?.size ?? PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
      {editing !== null && (
        <Drawer title={editing === 'new' ? '출퇴근 체크 유형 설정 등록' : '출퇴근 체크 유형 설정 수정'} onClose={close}>
          <SettingForm role={role} row={editing === 'new' ? null : editing} notify={notify} onDone={done} />
        </Drawer>
      )}
    </div>
  );
}
