import { useState } from 'react';
import {
  Badge,
  Band,
  DataTable,
  DateInput,
  DateText,
  ErrorText,
  Field,
  Filters,
  LookupSelect,
  Pager,
  Pairs,
  Select,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

interface Condition {
  issuedFrom: string;
  issuedTo: string;
  certificateTypeId: number | string;
  employeeId: number | string;
  status: string;
}

const EMPTY: Condition = {
  issuedFrom: '',
  issuedTo: '',
  certificateTypeId: '',
  employeeId: '',
  status: '',
};

const SIZE = 20;

export default function FnSfr01604Page({ role }: PageProps) {
  const [draft, setDraft] = useState<Condition>(EMPTY);
  const [applied, setApplied] = useState<Condition>(EMPTY);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/certificate-requests', role, undefined, { ...applied, page, size: SIZE }),
    [applied, page],
  );

  function search() {
    setPage(0);
    setApplied({ ...draft });
  }

  function reset() {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPage(0);
  }

  if (selected) {
    return (
      <div className="doc">
        <button className="ghost" onClick={() => setSelected(null)}>
          목록으로 돌아가기
        </button>
        <section className="box">
          <h2>증명서 발급 내역</h2>
          <Pairs
            items={[
              ['발급번호', String(selected['issueNumber'] ?? '-')],
              ['증명서 종류명', String(selected['certificateTypeName'] ?? '')],
              ['임직원명', String(selected['employeeName'] ?? '')],
              ['생성 일시', <DateText value={selected['createdAt']} time />],
              ['처리 상태', <Badge value={selected['status']} />],
              ['발급일', <DateText value={selected['issuedDate']} />],
            ]}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>증명서 관리대장</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="발급 일자 시작">
            <DateInput value={draft.issuedFrom} onChange={(v) => setDraft({ ...draft, issuedFrom: v })} />
          </Field>
          <Field label="발급 일자 종료">
            <DateInput value={draft.issuedTo} onChange={(v) => setDraft({ ...draft, issuedTo: v })} />
          </Field>
          <Field label="증명서 종류">
            <LookupSelect
              table="certificate_type"
              role={role}
              value={draft.certificateTypeId}
              onChange={(v) => setDraft({ ...draft, certificateTypeId: v })}
            />
          </Field>
          <Field label="처리 상태">
            <Select
              value={draft.status}
              onChange={(v) => setDraft({ ...draft, status: v })}
              options={[
                ['신청', '신청'],
                ['승인', '승인'],
                ['반려', '반려'],
              ]}
            />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data?.total} />
        <DataTable
          columns={[
            { key: 'issueNumber', label: '발급번호', render: (r) => String(r['issueNumber'] ?? '-') },
            { key: 'certificateTypeName', label: '증명서 종류명' },
            { key: 'employeeName', label: '임직원명' },
            { key: 'status', label: '처리 상태', render: (r) => <Badge value={r['status']} /> },
            { key: 'issuedDate', label: '발급일', render: (r) => <DateText value={r['issuedDate']} /> },
          ]}
          rows={data?.items ?? []}
          onRowClick={(row) => setSelected(row)}
          empty={loading ? '불러오는 중입니다.' : '조건에 맞는 증명서 발급 내역이 없습니다. 조회 조건을 바꿔 다시 조회해 주세요.'}
        />
        <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      </section>
    </div>
  );
}
