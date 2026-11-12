import { useState } from 'react';
import type { PageProps, Row } from '../kit';
import {
  Band,
  Badge,
  Column,
  DataTable,
  Filters,
  Field,
  Pager,
  Pairs,
  Select,
  TextInput,
  call,
  useData,
} from '../kit';

// 재무제표 양식·자동분개 유형을 저장할 API와 테이블이 없다.
// 이 화면은 기준정보인 계정과목 목록을 보여 주는 데까지만 한다.
// 계정과목 조회 API는 입력에 없으므로 부르지 않는다.

export default function FnSfr00602Page({ role, notify }: PageProps) {
  return (
    <div className="doc">
      <section className="box">
        <h2>재무제표 양식·자동분개 유형 설정</h2>
        <p>
          재무제표 양식과 자동분개 유형을 저장할 API가 아직 설계되지 않았습니다.
        </p>
        <p>
          설정을 저장하려면 전용 기준정보 테이블과 API가 먼저 마련되어야 합니다.
        </p>
      </section>
    </div>
  );
}
