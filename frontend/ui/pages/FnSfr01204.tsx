import { useState } from 'react';
import {
  call,
  useData,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  DateInput,
  LookupSelect,
  RefName,
  DateText,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;

interface RecordFormProps {
  role: string;
  record: Row | null;
  onDone: (saved: Row) => void;
}

function RecordForm({ role, record, onDone }: RecordFormProps) {
  const editing = record !== null;
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [hireDate, setHireDate] = useState(String(record?.hireDate ?? ''));
  const [recruitmentType, setRecruitmentType] = useState(String(record?.recruitmentType ?? ''));
  const [recruitmentNote, setRecruitmentNote] = useState(String(record?.recruitmentNote ?? ''));
  const [address, setAddress] = useState(String(record?.address ?? ''));
  const [veteranInfo, setVeteranInfo] = useState(String(record?.veteranInfo ?? ''));
  const [militaryServiceInfo, setMilitaryServiceInfo] = useState(String(record?.militaryServiceInfo ?? ''));

  async function submit() {
    if (!editing && employeeId === '') {
      throw new Error('임직원을 선택해 주세요.');
    }
    if (hireDate === '') {
      throw new Error('입사일을 입력해 주세요.');
    }
    if (recruitmentType.trim() === '') {
      throw new Error('채용 구분을 입력해 주세요.');
    }
    const body: Row = {
      hireDate,
      recruitmentType,
      recruitmentNote,
      address,
      veteranInfo,
      militaryServiceInfo,
    };
    if (editing) {
      await call('PATCH', '/personnel-records/' + String(record?.personnelRecordId), role, body);
      onDone({ ...record, ...body });
    } else {
      body.employeeId = employeeId;
      const saved = await call('POST', '/personnel-records', role, body);
      onDone({ ...body, personnelRecordId: saved.personnelRecordId });
    }
  }

  return (
    <Form onSubmit={submit} submit={editing ? '수정 저장' : '등록'} note="보훈·병역 정보는 해당 사항이 없으면 비워 둡니다.">
      {!editing && (
        <Field label="임직원" required wide>
          <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} placeholder="임직원 선택" />
        </Field>
      )}
      <Field label="입사일" required>
        <DateInput value={hireDate} onChange={setHireDate} />
      </Field>
      <Field label="채용 구분" required>
        <TextInput value={recruitmentType} onChange={setRecruitmentType} />
      </Field>
      <Field label="채용 정보 비고" wide>
        <TextInput value={recruitmentNote} onChange={setRecruitmentNote} multiline />
      </Field>
      <Field label="주소" wide hint="암호화되어 저장됩니다.">
        <TextInput value={address} onChange={setAddress} />
      </Field>
      <Field label="보훈 정보">
        <TextInput value={veteranInfo} onChange={setVeteranInfo} />
      </Field>
      <Field label="병역 정보">
        <TextInput value={militaryServiceInfo} onChange={setMilitaryServiceInfo} />
      </Field>
    </Form>
  );
}

export default function FnSfr01204Page({ role, notify }: PageProps) {
  const [draftEmployee, setDraftEmployee] = useState<number | string>('');
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [drawer, setDrawer] = useState<'create' | 'edit' | null>(null);

  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/personnel-records', role, undefined, { employeeId, page, size: SIZE }),
    [employeeId, page, role],
  );

  function search() {
    setPage(0);
    setEmployeeId(draftEmployee);
  }

  function reset() {
    setDraftEmployee('');
    setPage(0);
    setEmployeeId('');
  }

  function done(saved: Row) {
    const wasEdit = drawer === 'edit';
    setDrawer(null);
    notify(wasEdit ? '기초 인적사항을 수정했습니다.' : '기초 인적사항을 등록했습니다.');
    if (wasEdit) {
      setSelected(saved);
    }
    reload();
  }

  const drawerView = drawer !== null && (
    <Drawer
      title={drawer === 'edit' ? '기초 인적사항 수정' : '기초 인적사항 등록'}
      onClose={() => setDrawer(null)}
    >
      <RecordForm role={role} record={drawer === 'edit' ? selected : null} onDone={done} />
    </Drawer>
  );

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>목록으로 돌아가기</button>
        <h1>기초 인적사항</h1>
        <section className="box">
          <h2>채용 정보</h2>
          <Pairs
            items={[
              ['임직원', <RefName table="employee" role={role} value={selected.employeeId} />],
              ['입사일', <DateText value={selected.hireDate} />],
              ['채용 구분', String(selected.recruitmentType ?? '')],
              ['채용 정보 비고', String(selected.recruitmentNote ?? '')],
            ]}
          />
        </section>
        <section className="box">
          <h2>거주 정보</h2>
          <Pairs items={[['주소', String(selected.address ?? '')]]} />
        </section>
        <section className="box">
          <h2>보훈·병역 정보</h2>
          <Pairs
            items={[
              ['보훈 정보', String(selected.veteranInfo ?? '') || '해당 사항 없음'],
              ['병역 정보', String(selected.militaryServiceInfo ?? '') || '해당 사항 없음'],
            ]}
          />
        </section>
        <div>
          <button onClick={() => setDrawer('edit')}>수정</button>
        </div>
        {drawerView}
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>기초 인적사항</h1>
      <Filters onSearch={search} onReset={reset}>
        <Field label="임직원">
          <LookupSelect
            table="employee"
            role={role}
            value={draftEmployee}
            onChange={setDraftEmployee}
            placeholder="전체"
          />
        </Field>
      </Filters>
      <Band total={data?.total}>
        <button onClick={() => setDrawer('create')}>인사기록카드 등록</button>
      </Band>
      {error && <ErrorText text={error} />}
      <DataTable
        columns={[
          {
            key: 'employeeId',
            label: '임직원',
            render: (row) => <RefName table="employee" role={role} value={row.employeeId} />,
          },
          { key: 'hireDate', label: '입사일', render: (row) => <DateText value={row.hireDate} /> },
          { key: 'recruitmentType', label: '채용 구분' },
          { key: 'veteranInfo', label: '보훈 정보' },
          { key: 'militaryServiceInfo', label: '병역 정보' },
        ]}
        rows={data?.items ?? []}
        onRowClick={(row) => setSelected(row)}
        empty="아직 등록한 내역이 없습니다. 인사기록카드 등록 버튼으로 시작해 주세요."
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      {drawerView}
    </div>
  );
}
