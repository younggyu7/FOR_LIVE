import { Badge, DateText, ErrorText, Pairs, call, useData } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr03201Page({ role, notify }: PageProps) {
  const { data, error, loading, reload } = useData<Row>(
    () => call<Row>('GET', '/personnel-records/me', role),
    [role],
  );

  return (
    <div className="doc">
      <h1>내 인사정보</h1>
      <button
        className="ghost"
        onClick={() => {
          reload();
          notify('인사정보를 다시 조회했습니다.');
        }}
      >
        다시 조회
      </button>
      {loading && <p>불러오는 중입니다.</p>}
      {!loading && error && (
        <section className="box">
          <h2>조회 결과</h2>
          <ErrorText text={error} />
          <p>조회된 인사기록카드가 없습니다. 인사 담당자에게 등록을 요청해 주세요.</p>
        </section>
      )}
      {!loading && !error && data && (
        <>
          <section className="box">
            <h2>기본 정보</h2>
            <Pairs
              items={[
                ['사번', String(data.employeeNo ?? '')],
                ['임직원명', String(data.name ?? '')],
                ['주소(암호화)', String(data.address ?? '')],
              ]}
            />
          </section>
          <section className="box">
            <h2>채용 정보</h2>
            <Pairs
              items={[
                ['입사일', <DateText value={data.hireDate} />],
                ['채용 구분', String(data.recruitmentType ?? '')],
                ['채용 정보 비고', String(data.recruitmentNote ?? '')],
              ]}
            />
          </section>
          <section className="box">
            <h2>보훈·병역</h2>
            <Pairs
              items={[
                ['보훈 정보', String(data.veteranInfo ?? '')],
                ['병역 정보', String(data.militaryServiceInfo ?? '')],
              ]}
            />
          </section>
          <section className="box">
            <h2>재직 정보</h2>
            <Pairs
              items={[
                ['재직 구분', <Badge value={data.employmentStatus} />],
                ['퇴사일', <DateText value={data.resignationDate} />],
              ]}
            />
          </section>
        </>
      )}
    </div>
  );
}
