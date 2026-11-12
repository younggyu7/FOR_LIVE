import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  DateText,
  ErrorText,
  Field,
  Filters,
  Pager,
  Select,
  TextInput,
  DateInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

const EMPTY_FILTER = { startDate: '', endDate: '', employeeName: '', loginType: '' };

export default function FnSfr03801Page({ role, notify }: PageProps) {
  const [draft, setDraft] = useState(EMPTY_FILTER);
  const [applied, setApplied] = useState(EMPTY_FILTER);
  const [page, setPage] = useState(0);
  const [localError, setLocalError] = useState('');

  const { data, error, loading } = useData<Page>(
    () =>
      call<Page>('GET', '/login-histories', role, undefined, {
        ...applied,
        page,
        size: SIZE,
      }),
    [applied, page, role],
  );

  const search = () => {
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      setLocalError('조회 종료일은 시작일보다 앞설 수 없습니다.');
      return;
    }
    setLocalError('');
    setPage(0);
    setApplied(draft);
  };

  const reset = () => {
    setLocalError('');
    setDraft(EMPTY_FILTER);
    setApplied(EMPTY_FILTER);
    setPage(0);
  };

  const columns = [
    { key: 'employeeName', label: '임직원명' },
    { key: 'employeeNo', label: '로그인 ID' },
    {
      key: 'loginAt',
      label: '접속일시',
      render: (row: Row) => <DateText value={row.loginAt} time />,
    },
    { key: 'loginIp', label: '로그인 IP' },
    {
      key: 'loginType',
      label: '로그인 구분',
      render: (row: Row) => <Badge value={row.loginType} />,
    },
  ];

  return (
    <div className="doc">
      <section className="box">
        <h2>로그인 내역 통계</h2>
        <Filters onSearch={search} onReset={reset}>
          <Field label="접속일시 조회 시작일">
            <DateInput
              value={draft.startDate}
              onChange={(v) => setDraft({ ...draft, startDate: v })}
            />
          </Field>
          <Field label="접속일시 조회 종료일">
            <DateInput
              value={draft.endDate}
              onChange={(v) => setDraft({ ...draft, endDate: v })}
            />
          </Field>
          <Field label="임직원명">
            <TextInput
              value={draft.employeeName}
              onChange={(v) => setDraft({ ...draft, employeeName: v })}
            />
          </Field>
          <Field label="로그인 구분">
            <Select
              value={draft.loginType}
              onChange={(v) => setDraft({ ...draft, loginType: v })}
              options={[
                ['웹', '웹'],
                ['메신저', '메신저'],
                ['모바일 앱', '모바일 앱'],
              ]}
              placeholder="전체"
            />
          </Field>
        </Filters>
        {localError ? <ErrorText text={localError} /> : null}
        {error ? <ErrorText text={error} /> : null}
        <Band total={data ? data.total : 0} />
        <DataTable
          columns={columns}
          rows={data ? data.items : []}
          empty={loading ? '불러오는 중입니다.' : '조회 조건에 맞는 로그인 내역이 없습니다. 조건을 바꿔 다시 조회해 주세요.'}
        />
        <Pager
          page={page}
          size={SIZE}
          total={data ? data.total : 0}
          onPage={setPage}
        />
      </section>
    </div>
  );
}
