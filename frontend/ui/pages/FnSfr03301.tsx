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
  RefName,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const SIZE = 20;

const VIEW_OPTIONS: [string, string][] = [
  ['DAY', '일간'],
  ['WEEK', '주간'],
  ['MONTH', '월간'],
];

const MINE_OPTIONS: [string, string][] = [
  ['false', '전체 예약'],
  ['true', '내 예약만'],
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function ResourceList({ role }: { role: string }) {
  const [draft, setDraft] = useState<Row>({});
  const [applied, setApplied] = useState<Row>({});
  const [pageNo, setPageNo] = useState(0);
  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/resources', role, undefined, { ...applied, page: pageNo, size: SIZE }),
    [applied, pageNo],
  );
  return (
    <div>
      <Filters
        onSearch={() => {
          setPageNo(0);
          setApplied({ ...draft });
        }}
        onReset={() => {
          setDraft({});
          setPageNo(0);
          setApplied({});
        }}
      >
        <Field label='자원 분류 ID'>
          <LookupSelect
            table='resource_category'
            role={role}
            value={draft.resourceCategoryId}
            onChange={(v) => setDraft({ ...draft, resourceCategoryId: v })}
          />
        </Field>
        <Field label='속성명'>
          <TextInput value={draft.attributeName} onChange={(v) => setDraft({ ...draft, attributeName: v })} />
        </Field>
        <Field label='속성값'>
          <TextInput value={draft.attributeValue} onChange={(v) => setDraft({ ...draft, attributeValue: v })} />
        </Field>
      </Filters>
      {error ? <ErrorText text={error} /> : null}
      <Band total={data?.total} />
      <DataTable
        columns={[
          { key: 'name', label: '자원명' },
          {
            key: 'resourceCategoryId',
            label: '자원 분류 ID',
            render: (r) => <RefName table='resource_category' role={role} value={r.resourceCategoryId} />,
          },
          { key: 'approvalRequired', label: '승인절차 사용 여부', render: (r) => <Badge value={r.approvalRequired} /> },
        ]}
        rows={data?.items ?? []}
        empty={loading ? '불러오는 중입니다.' : '조건에 맞는 자원이 없습니다. 조건을 바꿔 다시 조회해 주세요.'}
      />
      <Pager page={pageNo} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
    </div>
  );
}

function ReservationDetail({ role, id, onBack }: { role: string; id: number; onBack: () => void }) {
  const { data, error, loading } = useData<Row>(
    () => call<Row>('GET', `/resource-reservations/${id}`, role),
    [id],
  );
  const attachments = (data?.attachments as Row[] | undefined) ?? [];
  return (
    <div className='doc'>
      <button className='ghost' onClick={onBack}>
        목록으로 돌아가기
      </button>
      {error ? <ErrorText text={error} /> : null}
      {loading || !data ? null : (
        <div>
          <section className='box'>
            <h2>예약 정보</h2>
            <Pairs
              items={[
                ['자원', <RefName table='resource' role={role} value={data.resourceId} />],
                ['예약 상태', <Badge value={data.status} />],
                ['예약자', <RefName table='employee' role={role} value={data.reserverId} />],
                ['사용자', <RefName table='employee' role={role} value={data.userId} />],
              ]}
            />
          </section>
          <section className='box'>
            <h2>사용 일정</h2>
            <Pairs
              items={[
                ['시작 일시', <DateText value={data.startAt} time />],
                ['종료 일시', <DateText value={data.endAt} time />],
                ['반복 유형', String(data.repeatType ?? '')],
                ['반복 종료일', <DateText value={data.repeatUntil} />],
              ]}
            />
          </section>
          <section className='box'>
            <h2>예약 내용</h2>
            <p>{String(data.content ?? '') || '입력한 예약 내용이 없습니다.'}</p>
          </section>
          <section className='box'>
            <h2>첨부파일</h2>
            {attachments.length === 0 ? (
              <p>첨부파일이 없습니다.</p>
            ) : (
              <Pairs
                items={attachments.map((a): [string, React.ReactNode] => [
                  String(a.fileName ?? ''),
                  String(a.fileExtension ?? ''),
                ])}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function ReservationList({ role, notify, onOpen }: { role: string; notify: (t: string) => void; onOpen: (id: number) => void }) {
  const [draft, setDraft] = useState<Row>({ viewType: 'MONTH', baseDate: today(), mine: 'false' });
  const [applied, setApplied] = useState<Row>({ viewType: 'MONTH', baseDate: today(), mine: 'false' });
  const [pageNo, setPageNo] = useState(0);
  const { data, error, loading } = useData<Page>(
    () => call<Page>('GET', '/resource-reservations', role, undefined, { ...applied, page: pageNo, size: SIZE }),
    [applied, pageNo],
  );
  return (
    <div>
      <Filters
        onSearch={() => {
          if (!draft.baseDate) {
            notify('조회 기준일을 선택해 주세요.');
            return;
          }
          setPageNo(0);
          setApplied({ ...draft });
        }}
        onReset={() => {
          const first = { viewType: 'MONTH', baseDate: today(), mine: 'false' };
          setDraft(first);
          setPageNo(0);
          setApplied(first);
        }}
      >
        <Field label='조회 형태' required>
          <Select
            value={draft.viewType}
            onChange={(v) => setDraft({ ...draft, viewType: v })}
            options={VIEW_OPTIONS}
          />
        </Field>
        <Field label='조회 기준일' required>
          <DateInput value={draft.baseDate} onChange={(v) => setDraft({ ...draft, baseDate: v })} />
        </Field>
        <Field label='자원'>
          <LookupSelect
            table='resource'
            role={role}
            value={draft.resourceId}
            onChange={(v) => setDraft({ ...draft, resourceId: v })}
          />
        </Field>
        <Field label='본인 예약만 조회'>
          <Select value={draft.mine} onChange={(v) => setDraft({ ...draft, mine: v })} options={MINE_OPTIONS} />
        </Field>
      </Filters>
      {error ? <ErrorText text={error} /> : null}
      <Band total={data?.total} />
      <DataTable
        columns={[
          { key: 'resourceId', label: '자원', render: (r) => <RefName table='resource' role={role} value={r.resourceId} /> },
          { key: 'startAt', label: '시작 일시', render: (r) => <DateText value={r.startAt} time /> },
          { key: 'endAt', label: '종료 일시', render: (r) => <DateText value={r.endAt} time /> },
          { key: 'status', label: '예약 상태', render: (r) => <Badge value={r.status} /> },
        ]}
        rows={data?.items ?? []}
        onRowClick={(r) => onOpen(Number(r.resourceReservationId))}
        empty={loading ? '불러오는 중입니다.' : '조건에 맞는 예약이 없습니다. 기준일이나 조회 형태를 바꿔 보세요.'}
      />
      <Pager page={pageNo} size={SIZE} total={data?.total ?? 0} onPage={setPageNo} />
    </div>
  );
}

export default function FnSfr03301Page({ role, notify }: PageProps) {
  const [tab, setTab] = useState<'reservations' | 'resources'>('reservations');
  const [detailId, setDetailId] = useState<number | null>(null);

  if (detailId !== null) {
    return <ReservationDetail role={role} id={detailId} onBack={() => setDetailId(null)} />;
  }
  return (
    <div className='doc'>
      <h1>자원 예약 현황</h1>
      <div>
        <button className={tab === 'reservations' ? '' : 'ghost'} onClick={() => setTab('reservations')}>
          예약 현황
        </button>
        <button className={tab === 'resources' ? '' : 'ghost'} onClick={() => setTab('resources')}>
          사용 가능 자원
        </button>
      </div>
      {tab === 'reservations' ? (
        <ReservationList role={role} notify={notify} onOpen={setDetailId} />
      ) : (
        <ResourceList role={role} />
      )}
    </div>
  );
}
