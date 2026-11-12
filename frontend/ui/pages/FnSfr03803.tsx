import { call, useData, Tiles, Num, ErrorText, Band } from '../kit';
import type { PageProps } from '../kit';

export default function FnSfr03803Page({ role, notify }: PageProps) {
  const { data, error, loading, reload } = useData(
    () => call('GET', '/server-capacities', role),
    [role],
  );

  return (
    <div className="doc">
      <section className="box">
        <h2>서버 사용 용량 현황</h2>
        <Band>
          <button
            className="ghost"
            onClick={() => {
              reload();
              notify('다시 조회했습니다.');
            }}
          >
            다시 조회
          </button>
        </Band>
        {error ? <ErrorText text={error} /> : null}
        {loading ? <p>불러오는 중입니다.</p> : null}
        {data ? (
          <Tiles
            items={[
              ['전체 용량', <Num value={data.totalCapacity} />],
              ['사용 용량', <Num value={data.usedCapacity} />],
              ['잔여 용량', <Num value={data.remainingCapacity} />],
            ]}
          />
        ) : null}
      </section>
    </div>
  );
}
