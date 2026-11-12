import { Pairs } from '../kit';
import type { PageProps } from '../kit';

export default function FnSfr03306Page({ role, notify }: PageProps) {
  return (
    <div className="doc">
      <section className="box">
        <h2>자원 예약 알림 발송</h2>
        <p>
          이 기능은 예약 등록·승인 이벤트가 발생하면 시스템이 통합알림으로 자동 발송합니다.
        </p>
        <p>
          직접 호출하는 API가 없어 이 화면에서 따로 처리할 일은 없습니다.
        </p>
      </section>
      <section className="box">
        <h2>발송 기준</h2>
        <Pairs
          items={[
            ['알림 채널', '시스템 내 알림(통합알림)'],
            ['예약 등록', '예약자에게 발송합니다.'],
            ['승인 요청', '해당 자원 담당자에게 발송합니다.'],
            ['승인·반려·자동 승인', '예약자에게 발송합니다.'],
            ['발송 실패', '예약·승인 결과는 유지하고 발송 실패를 기록합니다.'],
          ]}
        />
      </section>
    </div>
  );
}
