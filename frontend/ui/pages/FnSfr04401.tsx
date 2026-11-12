import type { PageProps } from '../kit';
import { Pairs } from '../kit';

export default function FnSfr04401Page({ role, notify }: PageProps) {
  return (
    <div className="doc">
      <section className="box">
        <h2>AI 문서 유형 자동 분류 및 담당 부서 자동 배분</h2>
        <p>
          문서가 등록되면 시스템이 문서 내용을 분석해 문서 유형을 분류하고, 담당 부서를 자동으로 배분합니다.
        </p>
        <p>
          이 처리는 시스템이 자동으로 수행하므로 이 화면에서 직접 실행하거나 입력할 항목은 없습니다.
        </p>
      </section>
      <section className="box">
        <h2>자동 처리 순서</h2>
        <Pairs
          items={[
            ['1단계', '등록된 문서와 첨부 내용을 조회합니다.'],
            ['2단계', 'AI가 문서 내용을 분석해 문서 유형을 분류합니다.'],
            ['3단계', '사전 설정된 배분 기준에서 분류된 유형의 담당 부서를 찾습니다.'],
            ['4단계', '문서에 문서 유형과 담당 부서를 반영합니다.'],
            ['5단계', '담당 부서에 통합알림을 발송합니다.'],
          ]}
        />
      </section>
      <section className="box">
        <h2>수동 처리 대상</h2>
        <Pairs
          items={[
            ['분류 실패 또는 신뢰도 부족', '자동 배분하지 않고 수동 분류·배분 대상으로 남깁니다.'],
            ['배분 기준 없음', '담당 부서를 미배분 상태로 두고 수동 지정 대상으로 남깁니다.'],
          ]}
        />
      </section>
      <section className="box">
        <h2>안내</h2>
        <p>
          AI 처리 대상 데이터는 외부로 반출하지 않고 내부에서 처리합니다. 배분 기준은 사전 설정값을 사용합니다.
        </p>
      </section>
    </div>
  );
}
