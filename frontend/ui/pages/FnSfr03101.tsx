import { useState } from 'react';
import { call, useData, Band, DataTable, Pager, Drawer, Form, Field, TextInput, ErrorText } from '../kit';
import type { PageProps, Row, Page } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr03101Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  const [abbreviation, setAbbreviation] = useState('');
  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/departments', role, undefined, { page: page, size: PAGE_SIZE }),
    [page, role],
  );

  function openEdit(row: Row) {
    setEditing(row);
    setAbbreviation(row['abbreviation'] ? String(row['abbreviation']) : '');
  }

  async function save() {
    if (!editing) {
      return;
    }
    if (abbreviation.trim() === '') {
      throw new Error('부서 약칭을 입력해 주세요.');
    }
    await call('PATCH', '/departments/' + String(editing['departmentId']), role, { abbreviation: abbreviation.trim() });
    notify('부서 약칭을 수정했습니다.');
    setEditing(null);
    reload();
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>관리부서 및 부서 약칭</h2>
        <p>부서 약칭은 부서 약칭 기반 채번 규칙으로 결재문서 번호를 만들 때 사용합니다.</p>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data ? data.total : undefined} />
        <DataTable
          columns={[
            { key: 'departmentCode', label: '부서코드' },
            { key: 'name', label: '부서명' },
            { key: 'abbreviation', label: '부서 약칭', render: (r) => (r['abbreviation'] ? String(r['abbreviation']) : '미등록') },
            {
              key: 'departmentId',
              label: '처리',
              render: (r) => (
                <button className="ghost" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>
                  약칭 수정
                </button>
              ),
            },
          ]}
          rows={data ? data.items : []}
          empty={loading ? '불러오는 중입니다.' : '등록된 부서가 없습니다.'}
        />
        {data ? <Pager page={data.page} size={data.size} total={data.total} onPage={setPage} /> : null}
      </section>
      {editing ? (
        <Drawer title="부서 약칭 수정" onClose={() => setEditing(null)}>
          <Form onSubmit={save} submit="저장">
            <Field label="부서명">
              <span>{String(editing['name'] ?? '')}</span>
            </Field>
            <Field label="부서 약칭" required hint="50자 이하로 입력합니다.">
              <TextInput value={abbreviation} onChange={setAbbreviation} />
            </Field>
          </Form>
        </Drawer>
      ) : null}
    </div>
  );
}
