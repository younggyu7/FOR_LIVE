import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  ErrorText,
  Field,
  Filters,
  Pager,
  TextInput,
} from '../kit';
import type { Page, PageProps, Row } from '../kit';

const PAGE_SIZE = 20;

export default function FnSfr00105Page({ role, notify }: PageProps) {
  const [moduleInput, setModuleInput] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [pageNo, setPageNo] = useState(0);

  const { data, error, loading, reload } = useData<Page>(
    () =>
      call<Page>('GET', '/menus', role, undefined, {
        module: moduleName,
        page: pageNo,
        size: PAGE_SIZE,
      }),
    [role, moduleName, pageNo],
  );

  function search() {
    setPageNo(0);
    setModuleName(moduleInput.trim());
    reload();
  }

  function reset() {
    setModuleInput('');
    setModuleName('');
    setPageNo(0);
  }

  const rows: Row[] = data ? data.items : [];

  return (
    <div className="doc">
      <section className="box">
        <h2>사용 가능한 메뉴</h2>
        <p>권한이 부여된 그룹웨어·ERP 메뉴를 확인합니다.</p>
        <Filters onSearch={search} onReset={reset}>
          <Field label="연결 모듈">
            <TextInput
              value={moduleInput}
              onChange={setModuleInput}
              placeholder="연결 모듈 이름"
            />
          </Field>
        </Filters>
        {error ? <ErrorText text={error} /> : null}
        <Band total={data ? data.total : undefined} />
        <DataTable
          columns={[
            { key: 'name', label: '메뉴명' },
            { key: 'module', label: '연결 모듈' },
            { key: 'displayOrder', label: '표시순서' },
          ]}
          rows={rows}
          empty={loading ? '불러오는 중입니다.' : '사용할 수 있는 메뉴가 없습니다. 권한이 필요하면 관리자에게 요청해 주세요.'}
        />
        <Pager
          page={pageNo}
          size={data ? data.size : PAGE_SIZE}
          total={data ? data.total : 0}
          onPage={setPageNo}
        />
      </section>
    </div>
  );
}
