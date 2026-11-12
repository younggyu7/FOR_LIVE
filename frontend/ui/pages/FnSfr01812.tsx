import type { PageProps } from '../kit';

export default function FnSfr01812Page({ role, notify }: PageProps) {
  return (
    <div className="doc">
      <section className="box">
        <h2>연차 발생 및 사용 관리</h2>
        <p>
          연차 발생과 사용 내역 기록은 시스템이 자동으로 처리합니다.
        </p>
        <p>
          발생 연차와 잔여 연차는 연차 조회 화면에서 확인해 주세요.
        </p>
      </section>
    </div>
  );
}
