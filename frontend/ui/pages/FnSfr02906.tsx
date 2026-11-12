import type { PageProps } from '../kit';
import { Pairs } from '../kit';

export default function FnSfr02906Page({ role, notify }: PageProps) {
  return (
    <div className="doc">
      <section className="box">
        <h2>문서번호 자동 채번</h2>
        <p>문서번호는 기안 시점에 시스템이 자동으로 부여합니다.</p>
        <p>이 화면에서 직접 입력하거나 조회하는 값은 없습니다.</p>
      </section>
      <section className="box">
        <h2>채번 기준</h2>
        <Pairs
          items={[
            ['채번 시점', '기안 시점'],
            ['채번 기준', '기록물관리법 기준 규칙'],
            ['중복 여부', '문서번호는 중복되지 않습니다.'],
            ['처리 위치', '기안 상신 처리 안에서 자동으로 수행됩니다.'],
          ]}
        />
      </section>
      <section className="box">
        <h2>채번에 실패한 경우</h2>
        <p>채번에 실패하면 기안이 완료되지 않고 오류 문장이 안내됩니다.</p>
        <p>부여된 문서번호는 결재 문서 화면의 상세에서 확인할 수 있습니다.</p>
      </section>
    </div>
  );
}
