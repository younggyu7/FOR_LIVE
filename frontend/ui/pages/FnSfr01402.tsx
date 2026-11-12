import { useState } from 'react';
import {
  Band,
  DataTable,
  DateText,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const ITEM_OPTIONS: [string, string][] = [
  ['출장', '출장'],
  ['자격·면허', '자격·면허'],
  ['외국어', '외국어'],
  ['학력', '학력'],
  ['경력', '경력'],
  ['인사고과', '인사고과'],
  ['상벌', '상벌'],
  ['가족', '가족'],
];

const SCOPE_OPTIONS: [string, string][] = [
  ['전체', '전체'],
  ['부서', '부서'],
  ['개인', '개인'],
];

const STATUS_OPTIONS: [string, string][] = [
  ['재직자', '재직자'],
  ['퇴직자', '퇴직자'],
];

const LABELS: Record<string, string> = {
  destination: '출장지',
  startDate: '시작일',
  endDate: '종료일',
  purpose: '목적',
  remark: '비고',
  licenseName: '자격·면허명',
  issuingOrganization: '발급기관',
  acquiredDate: '취득일',
  expiryDate: '만료일',
  languageName: '외국어',
  testName: '시험명',
  score: '점수',
  grade: '등급',
  testDate: '취득일',
  schoolName: '학교',
  major: '전공',
  degree: '학위',
  admissionDate: '입학일',
  graduationDate: '졸업일',
  graduationStatus: '졸업 구분',
  companyName: '근무처',
  departmentName: '근무부서',
  positionTitle: '직위·직책',
  jobDescription: '담당업무',
  periodStartDate: '대상기간 시작',
  periodEndDate: '대상기간 종료',
  evaluationGrade: '고과 등급',
  evaluationScore: '고과 점수',
  evaluatorName: '평가자',
  comment: '평가 의견',
  rewardPenaltyType: '상벌 구분',
  title: '상벌명',
  awardedDate: '상벌 일자',
  issuer: '수여·시행 기관',
  content: '내용',
  relationship: '관계',
  isDependent: '부양가족',
};

const NUMBER_KEYS = ['score', 'evaluationScore'];

function cell(key: string, value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (key.endsWith('Date')) {
    return <DateText value={value} />;
  }
  if (NUMBER_KEYS.includes(key)) {
    return <Num value={value} />;
  }
  if (typeof value === 'boolean') {
    return value ? '예' : '아니오';
  }
  return String(value);
}

export default function FnSfr01402Page({ role, notify }: PageProps) {
  const [itemType, setItemType] = useState('');
  const [viewScope, setViewScope] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [departmentId, setDepartmentId] = useState<number | string>('');
  const [keyword, setKeyword] = useState('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<Page | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    return call<Page>('GET', '/personnel-record-items', role, undefined, { ...applied, page: pageNo });
  }, [applied, pageNo, role]);

  function search() {
    if (itemType === '') {
      setFormError('인사기록 항목을 선택해 주세요.');
      notify('인사기록 항목을 선택해 주세요.');
      return;
    }
    setFormError('');
    setPageNo(0);
    setApplied({ itemType, viewScope, employmentStatus, departmentId, keyword });
  }

  function reset() {
    setItemType('');
    setViewScope('');
    setEmploymentStatus('');
    setDepartmentId('');
    setKeyword('');
    setFormError('');
    setApplied(null);
    setPageNo(0);
  }

  const rows = (data?.items ?? []) as Row[];

  return (
    <div className="doc">
      <section className="box">
        <h2>인사기록 현황</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="인사기록 항목" required>
            <Select value={itemType} onChange={setItemType} options={ITEM_OPTIONS} placeholder="항목 선택" />
          </Field>
          <Field label="조회 범위">
            <Select value={viewScope} onChange={setViewScope} options={SCOPE_OPTIONS} placeholder="권한 범위 전체" />
          </Field>
          <Field label="재직 구분">
            <Select value={employmentStatus} onChange={setEmploymentStatus} options={STATUS_OPTIONS} placeholder="전체" />
          </Field>
          <Field label="주부서">
            <LookupSelect table="department" role={role} value={departmentId} onChange={setDepartmentId} placeholder="전체" />
          </Field>
          <Field label="임직원 이름 또는 사번">
            <TextInput value={keyword} onChange={setKeyword} />
          </Field>
        </Filters>
        {formError !== '' && <ErrorText text={formError} />}
        {error !== '' && <ErrorText text={error} />}
      </section>
      <section className="box">
        <h2>조회 결과</h2>
        {!applied && <p>인사기록 항목을 선택하고 조회해 주세요.</p>}
        {applied && (
          <>
            <Band total={data?.total} />
            <DataTable
              columns={[
                { key: 'employeeName', label: '임직원명' },
                {
                  key: 'items',
                  label: String(applied['itemType']) + ' 기록',
                  render: (row) => (
                    <div>
                      {((row['items'] as Row[]) ?? []).map((item, index) => (
                        <p key={index}>
                          {Object.entries(item).map(([k, v], i) => (
                            <span key={k}>
                              {i > 0 ? ' · ' : ''}
                              {LABELS[k] ?? k}: {cell(k, v)}
                            </span>
                          ))}
                        </p>
                      ))}
                    </div>
                  ),
                },
              ]}
              rows={rows}
              empty={loading ? '불러오는 중입니다.' : '조회 조건에 해당하는 인사기록이 없습니다. 조건을 바꿔 다시 조회해 주세요.'}
            />
            <Pager page={pageNo} size={data?.size ?? 20} total={data?.total ?? 0} onPage={setPageNo} />
          </>
        )}
      </section>
    </div>
  );
}
