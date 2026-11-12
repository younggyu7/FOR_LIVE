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
  Tiles,
  Form,
  Field,
  DateInput,
  Select,
  RefName,
  ErrorText,
  Num,
  DateText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SIZE = 20;
const SCOPES: [string, string][] = [
  ['전체', '전체'],
  ['부서', '부서'],
  ['개인', '개인'],
];
const STATUSES: [string, string][] = [
  ['재직자', '재직자'],
  ['퇴직자', '퇴직자'],
];
const REPORT_TYPES: [string, string][] = [
  ['승진현황', '승진현황'],
  ['발령현황', '발령현황'],
];

export default function FnSfr01304Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [page, setPage] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [report, setReport] = useState<Row | null>(null);

  const list = useData(
    () =>
      call<Page>('GET', '/personnel-appointment-histories', role, undefined, {
        ...applied,
        page,
        size: SIZE,
      }),
    [applied, page],
  );
  const summary = useData(
    () =>
      call<Page>('GET', '/personnel-appointment-histories/summary', role, undefined, applied),
    [applied],
  );

  const setField = (key: string, value: string) => {
    setDraft({ ...draft, [key]: value });
  };

  const search = () => {
    setPage(0);
    setApplied({ ...draft });
  };

  const reset = () => {
    setDraft({});
    setPage(0);
    setApplied({});
  };

  const openReport = () => {
    setReportType('');
    setReport(null);
    setReportOpen(true);
  };

  const submitReport = async () => {
    if (!reportType) {
      throw new Error('보고서 종류를 선택해 주세요.');
    }
    const result = await call<Row>('POST', '/personnel-appointment-reports', role, {
      reportType,
      startDate: applied.startDate,
      endDate: applied.endDate,
      viewScope: applied.viewScope,
    });
    setReport(result);
    notify('보고서를 생성했습니다.');
    list.reload();
  };

  const columns = [
    {
      key: 'employeeId',
      label: '발령 대상 임직원',
      render: (r: Row) => <RefName table="employee" role={role} value={r.employeeId} />,
    },
    { key: 'appointmentType', label: '발령 구분' },
    {
      key: 'appointmentDate',
      label: '발령일자',
      render: (r: Row) => <DateText value={r.appointmentDate} />,
    },
    {
      key: 'departmentId',
      label: '발령 후 부서',
      render: (r: Row) => <RefName table="department" role={role} value={r.departmentId} />,
    },
    { key: 'positionAfter', label: '발령 후 직위·직책' },
  ];

  const tiles = (summary.data?.items ?? []).map((r): [string, JSX.Element] => [
    String(r.appointmentType),
    <Num value={r.count} />,
  ]);
  const reportItems = (report?.items as Row[] | undefined) ?? [];

  return (
    <div className="doc">
      <section className="box">
        <h2>인사발령 현황</h2>
        {summary.error ? <ErrorText text={summary.error} /> : null}
        {tiles.length > 0 ? (
          <Tiles items={tiles} />
        ) : (
          <p>조회 조건에 해당하는 발령 현황이 없습니다.</p>
        )}
      </section>
      <section className="box">
        <h2>인사발령 이력</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="발령일자 조회 시작">
            <DateInput value={draft.startDate} onChange={(v) => setField('startDate', v)} />
          </Field>
          <Field label="발령일자 조회 종료">
            <DateInput value={draft.endDate} onChange={(v) => setField('endDate', v)} />
          </Field>
          <Field label="조회 범위">
            <Select
              value={draft.viewScope}
              onChange={(v) => setField('viewScope', v)}
              options={SCOPES}
              placeholder="전체 범위"
            />
          </Field>
          <Field label="재직 구분">
            <Select
              value={draft.employmentStatus}
              onChange={(v) => setField('employmentStatus', v)}
              options={STATUSES}
              placeholder="전체"
            />
          </Field>
        </Filters>
        {list.error ? <ErrorText text={list.error} /> : null}
        <Band total={list.data?.total}>
          {role === '인사 담당자' ? (
            <button type="button" onClick={openReport}>
              보고서 생성
            </button>
          ) : null}
        </Band>
        <DataTable
          columns={columns}
          rows={list.data?.items ?? []}
          empty="조건에 해당하는 발령 이력이 없습니다. 조회 조건을 바꿔 다시 조회해 주세요."
        />
        <Pager page={page} size={SIZE} total={list.data?.total ?? 0} onPage={setPage} />
      </section>
      {reportOpen ? (
        <Drawer title="인사발령 현황 보고서" onClose={() => setReportOpen(false)}>
          {report === null ? (
            <Form
              onSubmit={submitReport}
              submit="보고서 생성"
              note="현재 조회 조건으로 보고서를 만들고 열람 이력을 기록합니다."
            >
              <Field label="보고서 종류(승진현황 등)" required wide>
                <Select value={reportType} onChange={setReportType} options={REPORT_TYPES} />
              </Field>
            </Form>
          ) : (
            <div>
              <Pairs
                items={[
                  ['보고서 종류', String(report.reportType)],
                  ['대상 건수', <Num value={reportItems.length} />],
                ]}
              />
              <DataTable columns={columns} rows={reportItems} />
              <button type="button" className="ghost" onClick={() => setReportOpen(false)}>
                닫기
              </button>
            </div>
          )}
        </Drawer>
      ) : null}
    </div>
  );
}
