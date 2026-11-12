import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  DateText,
  Drawer,
  Field,
  Filters,
  LookupSelect,
  Pager,
  Pairs,
  RefName,
  Select,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

function Departments({ role }: { role: string }) {
  const [employeeId, setEmployeeId] = useState<number | string>('');
  const [applied, setApplied] = useState<number | string>('');
  const [page, setPage] = useState(0);
  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/employee-departments', role, undefined, { employeeId: applied, page, size: SIZE }),
    [applied, page],
  );

  return (
    <section className="box">
      <h2>겸직 소속 목록</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(employeeId);
          reload();
        }}
        onReset={() => {
          setEmployeeId('');
          setApplied('');
          setPage(0);
        }}
      >
        <Field label="임직원" hint="비워 두면 본인의 소속을 보여 줍니다.">
          <LookupSelect table="employee" role={role} value={employeeId} onChange={setEmployeeId} />
        </Field>
      </Filters>
      {error ? <p>{error}</p> : null}
      <Band total={data?.total} />
      <DataTable
        rows={data?.items ?? []}
        empty="겸직 부서가 없습니다. 임직원을 골라 다시 조회해 주세요."
        columns={[
          { key: 'employeeId', label: '임직원', render: (r: Row) => <RefName table="employee" role={role} value={r.employeeId} /> },
          { key: 'primaryDepartmentId', label: '주부서 ID', render: (r: Row) => <RefName table="department" role={role} value={r.primaryDepartmentId} /> },
          { key: 'departmentId', label: '겸직 부서', render: (r: Row) => <RefName table="department" role={role} value={r.departmentId} /> },
        ]}
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
    </section>
  );
}

function Notifications({ role }: { role: string }) {
  const [readStatus, setReadStatus] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const { data, error, reload } = useData<Page>(
    () => call<Page>('GET', '/notifications', role, undefined, { readStatus: applied, page, size: SIZE }),
    [applied, page],
  );

  return (
    <section className="box">
      <h2>겸직 결재 알림</h2>
      <Filters
        onSearch={() => {
          setPage(0);
          setApplied(readStatus);
          reload();
        }}
        onReset={() => {
          setReadStatus('');
          setApplied('');
          setPage(0);
        }}
      >
        <Field label="읽음 상태">
          <Select
            value={readStatus}
            onChange={setReadStatus}
            options={[['안읽음', '안읽음'], ['읽음', '읽음']]}
            placeholder="전체"
          />
        </Field>
      </Filters>
      {error ? <p>{error}</p> : null}
      <Band total={data?.total} />
      <DataTable
        rows={data?.items ?? []}
        onRowClick={(r: Row) => setSelected(r)}
        empty="받은 알림이 없습니다."
        columns={[
          { key: 'title', label: '알림 제목' },
          { key: 'channel', label: '알림 채널' },
          { key: 'readStatus', label: '읽음 상태', render: (r: Row) => <Badge value={r.readStatus} /> },
          { key: 'eventType', label: '알림 이벤트 유형' },
          { key: 'createdAt', label: '생성 일시', render: (r: Row) => <DateText value={r.createdAt} time /> },
        ]}
      />
      <Pager page={page} size={SIZE} total={data?.total ?? 0} onPage={setPage} />
      {selected ? (
        <Drawer title="알림 상세" onClose={() => setSelected(null)}>
          <Pairs
            items={[
              ['알림 제목', String(selected.title ?? '')],
              ['알림 내용', String(selected.content ?? '')],
              ['알림 채널', String(selected.channel ?? '')],
              ['읽음 상태', <Badge value={selected.readStatus} />],
              ['알림 이벤트 유형', String(selected.eventType ?? '')],
              ['바로가기 대상 유형', String(selected.targetType ?? '')],
              ['바로가기 대상 ID', String(selected.targetId ?? '')],
              ['생성 일시', <DateText value={selected.createdAt} time />],
            ]}
          />
        </Drawer>
      ) : null}
    </section>
  );
}

export default function FnSfr02905Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'departments' | 'notifications'>('departments');

  return (
    <div className="doc">
      <h1>겸직 사용자 업무환경 및 결재 알림</h1>
      <p>겸직자는 주부서 기준으로 업무환경을 사용하며, 겸직 부서의 결재 알림을 받습니다.</p>
      <div>
        <button className={tab === 'departments' ? '' : 'ghost'} onClick={() => setTab('departments')}>
          겸직 소속
        </button>
        <button className={tab === 'notifications' ? '' : 'ghost'} onClick={() => setTab('notifications')}>
          결재 알림
        </button>
      </div>
      {tab === 'departments' ? <Departments role={role} /> : <Notifications role={role} />}
    </div>
  );
}
