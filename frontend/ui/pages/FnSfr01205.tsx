import { useState } from 'react';
import {
  call,
  useData,
  Num,
  DateText,
  Badge,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Form,
  Field,
  TextInput,
  NumberInput,
  DateInput,
  Select,
  LookupSelect,
  RefName,
} from '../kit';
import type { PageProps, Row, Page, Column } from '../kit';

type Kind = 'text' | 'multi' | 'date' | 'num' | 'bool';

interface FieldDef {
  key: string;
  label: string;
  kind: Kind;
  required?: boolean;
  keepIfEmpty?: boolean;
}

interface Section {
  key: string;
  title: string;
  idKey: string;
  columns: Column[];
  fields: FieldDef[];
  list: (q: Row) => Promise<Page>;
  create?: (b: Row) => Promise<Row>;
  update?: (id: number | string, b: Row) => Promise<Row>;
  remove?: (id: number | string) => Promise<Row>;
}

interface Panel {
  mode: 'create' | 'edit' | 'delete';
  row?: Row;
}

const SIZE = 20;

function F(key: string, label: string, kind: Kind = 'text', required = false): FieldDef {
  return { key, label, kind, required };
}

const FAMILY_FIELDS: FieldDef[] = [
  F('name', '가족 성명(암호화)', 'text', true),
  F('relationship', '관계', 'text', true),
  F('birthDate', '생년월일(암호화)'),
  { key: 'residentNumber', label: '주민등록번호(암호화)', kind: 'text', keepIfEmpty: true },
  F('isDependent', '부양가족 여부', 'bool', true),
];

const EDUCATION_FIELDS: FieldDef[] = [
  F('schoolName', '학교명', 'text', true),
  F('major', '전공'),
  F('degree', '학위'),
  F('admissionDate', '입학일', 'date'),
  F('graduationDate', '졸업일', 'date'),
  F('graduationStatus', '졸업 구분'),
];

const CAREER_FIELDS: FieldDef[] = [
  F('companyName', '근무처명', 'text', true),
  F('departmentName', '근무부서'),
  F('positionTitle', '직위·직책'),
  F('jobDescription', '담당업무', 'multi'),
  F('startDate', '근무 시작일', 'date', true),
  F('endDate', '근무 종료일', 'date'),
];

const LICENSE_FIELDS: FieldDef[] = [
  F('licenseName', '자격·면허명', 'text', true),
  F('issuingOrganization', '발급기관'),
  F('acquiredDate', '취득일', 'date'),
  F('expiryDate', '만료일', 'date'),
  F('licenseNumber', '자격·면허번호(암호화)'),
];

const LANGUAGE_FIELDS: FieldDef[] = [
  F('languageName', '외국어명', 'text', true),
  F('testName', '시험명'),
  F('score', '점수', 'num'),
  F('grade', '등급'),
  F('testDate', '취득일', 'date'),
  F('expiryDate', '유효기간 만료일', 'date'),
];

const EVALUATION_FIELDS: FieldDef[] = [
  F('periodStartDate', '대상기간 시작일', 'date', true),
  F('periodEndDate', '대상기간 종료일', 'date', true),
  F('evaluationGrade', '고과 등급'),
  F('evaluationScore', '고과 점수', 'num'),
  F('evaluatorName', '평가자'),
  F('comment', '평가 의견', 'multi'),
];

const REWARD_FIELDS: FieldDef[] = [
  F('rewardPenaltyType', '상벌 구분', 'text', true),
  F('title', '상벌명', 'text', true),
  F('awardedDate', '상벌 일자', 'date', true),
  F('issuer', '수여·시행 기관'),
  F('content', '상벌 내용', 'multi'),
];

const TRIP_FIELDS: FieldDef[] = [
  F('destination', '출장지', 'text', true),
  F('startDate', '출장 시작일', 'date', true),
  F('endDate', '출장 종료일', 'date', true),
  F('purpose', '출장 목적'),
  F('remark', '비고', 'multi'),
];

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

function dateCol(key: string, label: string): Column {
  return { key, label, render: (r: Row) => <DateText value={r[key]} /> };
}

function numCol(key: string, label: string): Column {
  return { key, label, render: (r: Row) => <Num value={r[key]} /> };
}

function initialForm(fields: FieldDef[], row?: Row): Row {
  const out: Row = {};
  for (const fd of fields) {
    const v = row ? row[fd.key] : undefined;
    if (fd.kind === 'bool') {
      out[fd.key] = isEmpty(v) ? 'false' : String(v);
    } else {
      out[fd.key] = isEmpty(v) ? '' : v;
    }
  }
  return out;
}

function buildBody(fields: FieldDef[], form: Row, create: boolean): Row {
  const body: Row = {};
  for (const fd of fields) {
    const v = form[fd.key];
    if (isEmpty(v)) {
      if (!create && !fd.keepIfEmpty) {
        body[fd.key] = null;
      }
      continue;
    }
    body[fd.key] = fd.kind === 'bool' ? v === 'true' : v;
  }
  return body;
}

export default function FnSfr01205Page({ role, notify }: PageProps) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [tab, setTab] = useState('family');
  const [page, setPage] = useState(0);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [form, setForm] = useState<Row>({});

  const sections: Section[] = [
    {
      key: 'family',
      title: '가족',
      idKey: 'employeeFamilyId',
      columns: [
        { key: 'name', label: '가족 성명' },
        { key: 'relationship', label: '관계' },
        { key: 'birthDate', label: '생년월일' },
        { key: 'isDependent', label: '부양가족 여부', render: (r: Row) => <span>{r['isDependent'] === true ? '예' : '아니오'}</span> },
      ],
      fields: FAMILY_FIELDS,
      list: (q) => call<Page>('GET', '/employee-families', role, undefined, q),
      create: (b) => call('POST', '/employee-families', role, b),
      update: (id, b) => call('PATCH', `/employee-families/${id}`, role, b),
      remove: (id) => call('DELETE', `/employee-families/${id}`, role),
    },
    {
      key: 'education',
      title: '학력',
      idKey: 'employeeEducationId',
      columns: [
        { key: 'schoolName', label: '학교명' },
        { key: 'major', label: '전공' },
        { key: 'degree', label: '학위' },
        dateCol('graduationDate', '졸업일'),
      ],
      fields: EDUCATION_FIELDS,
      list: (q) => call<Page>('GET', '/employee-educations', role, undefined, q),
      create: (b) => call('POST', '/employee-educations', role, b),
      update: (id, b) => call('PATCH', `/employee-educations/${id}`, role, b),
      remove: (id) => call('DELETE', `/employee-educations/${id}`, role),
    },
    {
      key: 'career',
      title: '경력',
      idKey: 'employeeCareerId',
      columns: [
        { key: 'companyName', label: '근무처명' },
        { key: 'positionTitle', label: '직위·직책' },
        dateCol('startDate', '근무 시작일'),
        dateCol('endDate', '근무 종료일'),
      ],
      fields: CAREER_FIELDS,
      list: (q) => call<Page>('GET', '/employee-careers', role, undefined, q),
      create: (b) => call('POST', '/employee-careers', role, b),
      update: (id, b) => call('PATCH', `/employee-careers/${id}`, role, b),
      remove: (id) => call('DELETE', `/employee-careers/${id}`, role),
    },
    {
      key: 'license',
      title: '자격·면허',
      idKey: 'employeeLicenseId',
      columns: [
        { key: 'licenseName', label: '자격·면허명' },
        { key: 'issuingOrganization', label: '발급기관' },
        dateCol('acquiredDate', '취득일'),
        dateCol('expiryDate', '만료일'),
      ],
      fields: LICENSE_FIELDS,
      list: (q) => call<Page>('GET', '/employee-licenses', role, undefined, q),
      create: (b) => call('POST', '/employee-licenses', role, b),
      update: (id, b) => call('PATCH', `/employee-licenses/${id}`, role, b),
      remove: (id) => call('DELETE', `/employee-licenses/${id}`, role),
    },
    {
      key: 'language',
      title: '외국어',
      idKey: 'employeeLanguageId',
      columns: [
        { key: 'languageName', label: '외국어명' },
        { key: 'testName', label: '시험명' },
        numCol('score', '점수'),
        dateCol('testDate', '취득일'),
      ],
      fields: LANGUAGE_FIELDS,
      list: (q) => call<Page>('GET', '/employee-languages', role, undefined, q),
      create: (b) => call('POST', '/employee-languages', role, b),
      update: (id, b) => call('PATCH', `/employee-languages/${id}`, role, b),
      remove: (id) => call('DELETE', `/employee-languages/${id}`, role),
    },
    {
      key: 'evaluation',
      title: '인사고과',
      idKey: 'employeeEvaluationId',
      columns: [
        dateCol('periodStartDate', '대상기간 시작일'),
        dateCol('periodEndDate', '대상기간 종료일'),
        { key: 'evaluationGrade', label: '고과 등급' },
        numCol('evaluationScore', '고과 점수'),
      ],
      fields: EVALUATION_FIELDS,
      list: (q) => call<Page>('GET', '/employee-evaluations', role, undefined, q),
      create: (b) => call('POST', '/employee-evaluations', role, b),
      update: (id, b) => call('PATCH', `/employee-evaluations/${id}`, role, b),
      remove: (id) => call('DELETE', `/employee-evaluations/${id}`, role),
    },
    {
      key: 'reward',
      title: '상벌',
      idKey: 'employeeRewardPenaltyId',
      columns: [
        { key: 'rewardPenaltyType', label: '상벌 구분' },
        { key: 'title', label: '상벌명' },
        dateCol('awardedDate', '상벌 일자'),
        { key: 'issuer', label: '수여·시행 기관' },
      ],
      fields: REWARD_FIELDS,
      list: (q) => call<Page>('GET', '/employee-reward-penalties', role, undefined, q),
      create: (b) => call('POST', '/employee-reward-penalties', role, b),
      update: (id, b) => call('PATCH', `/employee-reward-penalties/${id}`, role, b),
      remove: (id) => call('DELETE', `/employee-reward-penalties/${id}`, role),
    },
    {
      key: 'trip',
      title: '출장',
      idKey: 'employeeBusinessTripId',
      columns: [
        { key: 'destination', label: '출장지' },
        dateCol('startDate', '출장 시작일'),
        dateCol('endDate', '출장 종료일'),
        { key: 'purpose', label: '출장 목적' },
      ],
      fields: TRIP_FIELDS,
      list: (q) => call<Page>('GET', '/employee-business-trips', role, undefined, q),
      create: (b) => call('POST', '/employee-business-trips', role, b),
      update: (id, b) => call('PATCH', `/employee-business-trips/${id}`, role, b),
      remove: (id) => call('DELETE', `/employee-business-trips/${id}`, role),
    },
    {
      key: 'appointment',
      title: '인사발령 내역',
      idKey: 'personnelAppointmentId',
      columns: [
        { key: 'departmentId', label: '발령 후 부서', render: (r: Row) => <RefName table={'department'} role={role} value={r['departmentId']} /> },
        { key: 'appointmentType', label: '발령 구분' },
        dateCol('appointmentDate', '발령일자'),
        { key: 'positionAfter', label: '발령 후 직위·직책' },
        { key: 'status', label: '발령 상태', render: (r: Row) => <Badge value={r['status']} /> },
      ],
      fields: [],
      list: (q) => call<Page>('GET', '/personnel-appointments', role, undefined, q),
    },
    {
      key: 'attendee',
      title: '교육이수 내역',
      idKey: 'educationAttendeeId',
      columns: [
        { key: 'educationSessionId', label: '교육차수', render: (r: Row) => <RefName table={'education_session'} role={role} value={r['educationSessionId']} /> },
      ],
      fields: [],
      list: (q) => call<Page>('GET', '/education-attendees', role, undefined, q),
    },
  ];

  const section = sections.find((s) => s.key === tab) ?? sections[0];
  const editable = section.fields.length > 0;

  const { data, error, reload } = useData<Page>(async () => {
    if (employeeId === '') {
      return { items: [], page: 0, size: SIZE, total: 0 };
    }
    return section.list({ employeeId, page, size: SIZE });
  }, [employeeId, tab, page]);

  const rows: Row[] = data ? data.items : [];

  function openCreate() {
    setForm(initialForm(section.fields));
    setPanel({ mode: 'create' });
  }

  function openEdit(row: Row) {
    setForm(initialForm(section.fields, row));
    setPanel({ mode: 'edit', row });
  }

  function openDelete(row: Row) {
    setPanel({ mode: 'delete', row });
  }

  function setValue(key: string, v: unknown) {
    setForm({ ...form, [key]: v });
  }

  function checkRequired() {
    for (const fd of section.fields) {
      if (fd.required && isEmpty(form[fd.key])) {
        throw new Error(fd.label + ' 항목을 입력해 주세요.');
      }
    }
  }

  async function submit() {
    if (!panel) {
      return;
    }
    const id = panel.row ? (panel.row[section.idKey] as number) : 0;
    if (panel.mode === 'delete') {
      if (!section.remove) {
        return;
      }
      await section.remove(id);
      notify(section.title + ' 정보를 삭제했습니다.');
    } else if (panel.mode === 'create') {
      if (!section.create) {
        return;
      }
      checkRequired();
      const body = buildBody(section.fields, form, true);
      body['employeeId'] = employeeId;
      await section.create(body);
      notify(section.title + ' 정보를 등록했습니다.');
    } else {
      if (!section.update) {
        return;
      }
      checkRequired();
      await section.update(id, buildBody(section.fields, form, false));
      notify(section.title + ' 정보를 수정했습니다.');
    }
    setPanel(null);
    reload();
  }

  function renderInput(fd: FieldDef) {
    const v = form[fd.key];
    if (fd.kind === 'multi') {
      return <TextInput value={v} onChange={(x) => setValue(fd.key, x)} multiline />;
    }
    if (fd.kind === 'date') {
      return <DateInput value={v} onChange={(x) => setValue(fd.key, x)} />;
    }
    if (fd.kind === 'num') {
      return <NumberInput value={v} onChange={(x) => setValue(fd.key, x)} />;
    }
    if (fd.kind === 'bool') {
      return (
        <Select
          value={v}
          onChange={(x) => setValue(fd.key, x)}
          options={[
            ['true', '예'],
            ['false', '아니오'],
          ]}
        />
      );
    }
    return <TextInput value={v} onChange={(x) => setValue(fd.key, x)} />;
  }

  const columns: Column[] = editable
    ? [
        ...section.columns,
        {
          key: 'manage',
          label: '관리',
          render: (r: Row) => (
            <span>
              <button className={'ghost'} onClick={() => openEdit(r)}>수정</button>
              <button className={'ghost'} onClick={() => openDelete(r)}>삭제</button>
            </span>
          ),
        },
      ]
    : section.columns;

  return (
    <div>
      <h2>인사기록카드 상세정보</h2>
      <Filters onSearch={() => { setPage(0); reload(); }} onReset={() => { setEmployeeId(''); setPage(0); }}>
        <Field label={'임직원'} required>
          <LookupSelect
            table={'employee'}
            role={role}
            value={employeeId}
            onChange={(v) => { setEmployeeId(v); setPage(0); }}
            placeholder={'임직원 선택'}
          />
        </Field>
        <Field label={'정보 항목'}>
          <Select
            value={tab}
            onChange={(v) => { setTab(v); setPage(0); setPanel(null); }}
            options={sections.map((s): [string, string] => [s.key, s.title])}
            placeholder={'정보 항목'}
          />
        </Field>
      </Filters>
      <Band total={data ? data.total : 0}>
        {editable && employeeId !== '' ? <button onClick={openCreate}>{section.title} 등록</button> : null}
      </Band>
      {error ? <p>{error}</p> : null}
      <DataTable
        columns={columns}
        rows={rows}
        empty={employeeId === '' ? '임직원을 먼저 선택해 주세요.' : '아직 등록한 내역이 없습니다.'}
      />
      <Pager page={page} size={SIZE} total={data ? data.total : 0} onPage={setPage} />
      {panel ? (
        <Drawer
          title={section.title + (panel.mode === 'create' ? ' 등록' : panel.mode === 'edit' ? ' 수정' : ' 삭제')}
          onClose={() => setPanel(null)}
        >
          {panel.mode === 'delete' ? (
            <Form
              onSubmit={submit}
              submit={'삭제'}
              danger
              note={'삭제한 정보는 되돌릴 수 없고 변경 이력에 삭제 내용이 남습니다.'}
            />
          ) : (
            <Form onSubmit={submit} submit={panel.mode === 'create' ? '등록' : '저장'}>
              {section.fields.map((fd) => (
                <Field key={fd.key} label={fd.label} required={fd.required} wide={fd.kind === 'multi'}>
                  {renderInput(fd)}
                </Field>
              ))}
            </Form>
          )}
        </Drawer>
      ) : null}
    </div>
  );
}
