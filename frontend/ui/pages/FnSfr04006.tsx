import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  DateInput,
  DateText,
  ErrorText,
  Field,
  Filters,
  Pager,
  RefName,
  Select,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

function todayText(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function FnSfr04006Page({ role }: PageProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewType, setViewType] = useState('DAY');
  const [applied, setApplied] = useState({ startDate: '', endDate: '', viewType: 'DAY' });
  const [schedulePage, setSchedulePage] = useState(0);
  const [reservationPage, setReservationPage] = useState(0);

  const schedules = useData<Page>(
    () => call<Page>('GET', '/schedules', role, undefined, {
      startDate: applied.startDate,
      endDate: applied.endDate,
      page: schedulePage,
    }),
    [applied, schedulePage],
  );

  const reservations = useData<Page>(
    () => call<Page>('GET', '/resource-reservations', role, undefined, {
      viewType: applied.viewType,
      baseDate: applied.startDate || todayText(),
      page: reservationPage,
    }),
    [applied, reservationPage],
  );

  const search = () => {
    setSchedulePage(0);
    setReservationPage(0);
    setApplied({ startDate, endDate, viewType });
  };

  const reset = () => {
    setStartDate('');
    setEndDate('');
    setViewType('DAY');
    setSchedulePage(0);
    setReservationPage(0);
    setApplied({ startDate: '', endDate: '', viewType: 'DAY' });
  };

  return (
    <div className="doc">
      <h1>일정·자원예약 조회</h1>
      <p>기간을 고르지 않으면 오늘 기준으로 보여 드립니다.</p>
      <Filters onSearch={search} onReset={reset}>
        <Field label="조회 시작일">
          <DateInput value={startDate} onChange={setStartDate} />
        </Field>
        <Field label="조회 종료일">
          <DateInput value={endDate} onChange={setEndDate} />
        </Field>
        <Field label="자원예약 보기">
          <Select
            value={viewType}
            onChange={setViewType}
            options={[['DAY', '일간'], ['WEEK', '주간'], ['MONTH', '월간']]}
          />
        </Field>
      </Filters>

      <section className="box">
        <h2>일정</h2>
        {schedules.error ? <ErrorText text={schedules.error} /> : null}
        <Band total={schedules.data?.total} />
        <DataTable<Row>
          columns={[
            { key: 'title', label: '제목' },
            { key: 'startAt', label: '시작 일시', render: (r) => <DateText value={r.startAt} time /> },
            { key: 'endAt', label: '종료 일시', render: (r) => <DateText value={r.endAt} time /> },
            { key: 'allDay', label: '종일 여부', render: (r) => (r.allDay ? '종일' : '시간 지정') },
            { key: 'location', label: '장소' },
          ]}
          rows={schedules.data?.items ?? []}
          empty="해당 기간에 조회할 일정이 없습니다. 조회 기간을 바꿔 보세요."
        />
        <Pager
          page={schedules.data?.page ?? 0}
          size={schedules.data?.size ?? 20}
          total={schedules.data?.total ?? 0}
          onPage={setSchedulePage}
        />
      </section>

      <section className="box">
        <h2>자원예약</h2>
        {reservations.error ? <ErrorText text={reservations.error} /> : null}
        <Band total={reservations.data?.total} />
        <DataTable<Row>
          columns={[
            { key: 'resourceId', label: '자원', render: (r) => <RefName table="resource" role={role} value={r.resourceId} /> },
            { key: 'startAt', label: '시작 일시', render: (r) => <DateText value={r.startAt} time /> },
            { key: 'endAt', label: '종료 일시', render: (r) => <DateText value={r.endAt} time /> },
            { key: 'status', label: '예약 상태', render: (r) => <Badge value={r.status} /> },
          ]}
          rows={reservations.data?.items ?? []}
          empty="해당 기간에 조회할 자원예약이 없습니다. 조회 기간을 바꿔 보세요."
        />
        <Pager
          page={reservations.data?.page ?? 0}
          size={reservations.data?.size ?? 20}
          total={reservations.data?.total ?? 0}
          onPage={setReservationPage}
        />
      </section>
    </div>
  );
}
