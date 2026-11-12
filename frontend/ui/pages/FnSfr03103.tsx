import { DataTable, Band } from '../kit';
import type { PageProps, Row, Column } from '../kit';

const columns: Column<Row>[] = [
  { key: 'documentNo', label: '문서번호' },
  { key: 'title', label: '제목' },
  { key: 'drafterName', label: '담당자' },
  { key: 'documentBoxName', label: '문서함' },
  { key: 'completedAt', label: '완료 일시' },
];

export default function FnSfr03103Page({ role, notify }: PageProps) {
  const rows: Row[] = [];
  return (
    <div className="doc">
      <section className="box">
        <h2>완료문서 보관</h2>
        <p>
          결재가 완료된 문서는 완료 시점에 시스템이 지정 문서함으로 자동 이관합니다.
        </p>
        <p>
          이관된 문서는 PDF로 변환해 첨부파일로 등록하고, 문서번호·제목·담당자 같은 문서정보를 표기합니다.
        </p>
        <p>
          이 처리는 사람이 직접 실행하는 기능이 아니므로 이 화면에서 누를 버튼은 없습니다.
        </p>
      </section>
      <section className="box">
        <h2>보관된 문서</h2>
        <Band total={rows.length} />
        <DataTable
          columns={columns}
          rows={rows}
          empty="아직 보관된 문서가 없습니다. 결재가 완료되면 자동으로 이곳에 보관됩니다."
        />
      </section>
    </div>
  );
}
