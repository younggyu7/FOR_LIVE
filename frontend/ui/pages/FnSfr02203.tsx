import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Num,
  Pager,
  Select,
  Tiles,
  TextInput,
  call,
  useData,
} from '../kit';
import type { PageProps, Row, Page as ListPage } from '../kit';

const SIZE = 20;

const INSURANCE_OPTIONS: [string, string][] = [
  ['NATIONAL_PENSION', '국민연금'],
  ['HEALTH', '건강보험'],
  ['EMPLOYMENT', '고용보험'],
  ['INDUSTRIAL_ACCIDENT', '산재보험'],
];

export default function FnSfr02203Page({ role }: PageProps) {
  const [insuranceType, setInsuranceType] = useState('');
  const [payMonth, setPayMonth] = useState('');
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [applied, setApplied] = useState<Row | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [formError, setFormError] = useState('');

  const { data, error, loading } = useData<ListPage | undefined>(async () => {
    if (!applied) {
      return undefined;
    }
    return call<ListPage>('GET', '/social-insurance-deductions', role, undefined, {
      ...applied,
      page: pageNo,
      size: SIZE,
    });
  }, [applied, pageNo, role]);

  function search() {
    if (!insuranceType) {
      setFormError('보험 종류를 선택해 주세요.');
      return;
    }
    if (!/^\d{4}(0[1-9]|1[0-2])$/.test(payMonth)) {
      setFormError('대상 기간은 YYYYMM 형식(예: 202401)으로 입력해 주세요.');
      return;
    }
    setFormError('');
    setPageNo(0);
    setApplied({ insuranceType, payMonth, employeeId });
  }

  function reset() {
    setInsuranceType('');
    setPayMonth('');
    setEmployeeId('');
    setApplied(null);
    setPageNo(0);
    setFormError('');
  }

  const total = data ? (data as unknown as Row).totalDeductionAmount : 0;

  return (
    <div className="doc">
      <section className="box">
        <h2>사회보험 공제내역서</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="보험 종류" required>
            <Select value={insuranceType} onChange={setInsuranceType} options={INSURANCE_OPTIONS} />
          </Field>
          <Field label="대상 기간 연월(YYYYMM)" required>
            <TextInput value={payMonth} onChange={setPayMonth} placeholder="202401" />
          </Field>
          <Field label="임직원">
            <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} placeholder="전체" />
          </Field>
        </Filters>
        {formError ? <ErrorText text={formError} /> : null}
        {error ? <ErrorText text={error} /> : null}
      </section>

      <section className="box">
        <h2>공제내역</h2>
        {!applied ? (
          <p>보험 종류와 대상 기간을 선택한 뒤 조회해 주세요.</p>
        ) : (
          <>
            <Tiles items={[['보험별 공제 합계', <Num value={total} />]]} />
            <Band total={data ? data.total : 0} />
            <DataTable
              columns={[
                { key: 'employeeName', label: '임직원명' },
                { key: 'grade', label: '등급' },
                { key: 'standardMonthlyAmount', label: '기준소득월액', render: (r) => <Num value={r.standardMonthlyAmount} /> },
                { key: 'deductionAmount', label: '금액', render: (r) => <Num value={r.deductionAmount} /> },
                { key: 'closingStatus', label: '마감 상태', render: (r) => <Badge value={r.closingStatus} /> },
              ]}
              rows={data ? data.items : []}
              empty={loading ? '불러오는 중입니다.' : '조회된 공제내역이 없습니다. 보험 종류와 대상 기간을 확인해 주세요.'}
            />
            <Pager page={pageNo} size={SIZE} total={data ? data.total : 0} onPage={setPageNo} />
          </>
        )}
      </section>
    </div>
  );
}
