import { useState } from 'react';
import type { PageProps, Row, Page } from '../kit';
import {
  call,
  useData,
  Band,
  Badge,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  NumberInput,
  Select,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';

type Drawing =
  | { kind: 'catNew' }
  | { kind: 'catEdit'; row: Row }
  | { kind: 'catDel'; row: Row }
  | { kind: 'resNew' }
  | { kind: 'resEdit'; row: Row }
  | { kind: 'resDel'; row: Row }
  | { kind: 'resView'; row: Row };

type PermRow = { kind: string; id: number | string };

const SIZE = 20;

function CategoryForm({ row, role, onDone }: { row?: Row; role: string; onDone: (msg: string) => void }) {
  const [name, setName] = useState<unknown>(row ? row['name'] : '');
  const [sortOrder, setSortOrder] = useState<unknown>(row ? row['sortOrder'] : '');
  return (
    <Form
      submit={row ? '수정합니다' : '등록합니다'}
      onSubmit={async () => {
        if (String(name ?? '').trim() === '') throw new Error('분류명을 입력해 주세요.');
        if (sortOrder === '' || sortOrder === undefined || sortOrder === null) throw new Error('정렬 순서를 입력해 주세요.');
        const body: Row = { name, sortOrder };
        if (row) {
          await call('PATCH', '/resource-categories/' + row['resourceCategoryId'], role, body);
          onDone('자원 분류를 수정했습니다.');
        } else {
          await call('POST', '/resource-categories', role, body);
          onDone('자원 분류를 등록했습니다.');
        }
      }}
    >
      <Field label="분류명" required>
        <TextInput value={name} onChange={setName} />
      </Field>
      <Field label="정렬 순서" required>
        <NumberInput value={sortOrder} onChange={setSortOrder} />
      </Field>
    </Form>
  );
}

function ResourceForm({ row, role, onDone }: { row?: Row; role: string; onDone: (saved: Row, msg: string) => void }) {
  const [categoryId, setCategoryId] = useState<unknown>(row ? row['resourceCategoryId'] : '');
  const [name, setName] = useState<unknown>(row ? row['name'] : '');
  const [approval, setApproval] = useState<unknown>(row ? row['approvalRequired'] : '미사용');
  const [managerId, setManagerId] = useState<unknown>(row ? row['managerId'] : '');
  const [scope, setScope] = useState<unknown>(row ? row['visibilityScope'] : '전체');
  const [description, setDescription] = useState<unknown>(row ? row['description'] : '');
  const [attrs, setAttrs] = useState<Row[]>(row && Array.isArray(row['attributes']) ? (row['attributes'] as Row[]) : []);
  const [perms, setPerms] = useState<PermRow[]>(row && Array.isArray(row['permissions']) ? (row['permissions'] as PermRow[]) : []);

  const setAttr = (i: number, key: string, v: unknown) =>
    setAttrs(attrs.map((a, k) => (k === i ? { ...a, [key]: v } : a)));
  const setPerm = (i: number, patch: Partial<PermRow>) =>
    setPerms(perms.map((p, k) => (k === i ? { ...p, ...patch } : p)));

  return (
    <Form
      submit={row ? '수정합니다' : '등록합니다'}
      onSubmit={async () => {
        if (categoryId === '' || categoryId === undefined || categoryId === null) throw new Error('자원 분류를 선택해 주세요.');
        if (String(name ?? '').trim() === '') throw new Error('자원명을 입력해 주세요.');
        if (!approval) throw new Error('승인절차 사용 여부를 선택해 주세요.');
        if (!scope) throw new Error('공개범위를 선택해 주세요.');
        const attributes = attrs
          .filter((a) => String(a['attributeName'] ?? '').trim() !== '' || String(a['attributeValue'] ?? '').trim() !== '')
          .map((a, i) => {
            if (String(a['attributeName'] ?? '').trim() === '' || String(a['attributeValue'] ?? '').trim() === '') {
              throw new Error('속성명과 속성값을 모두 입력해 주세요.');
            }
            return { attributeName: a['attributeName'], attributeValue: a['attributeValue'], sortOrder: i };
          });
        const permissions = perms
          .filter((p) => p.id !== '' && p.id !== undefined)
          .map((p) => (p.kind === '부서' ? { departmentId: p.id } : { employeeId: p.id }));
        const body: Row = {
          resourceCategoryId: categoryId,
          name,
          approvalRequired: approval,
          visibilityScope: scope,
          description: description ?? '',
          attributes,
          permissions,
        };
        if (managerId !== '' && managerId !== undefined && managerId !== null) body['managerId'] = managerId;
        const saved = row
          ? await call('PATCH', '/resources/' + row['resourceId'], role, body)
          : await call('POST', '/resources', role, body);
        const merged: Row = {
          resourceId: saved['resourceId'],
          resourceCategoryId: categoryId,
          name,
          approvalRequired: approval,
          visibilityScope: scope,
          managerId: managerId === '' ? (row ? row['managerId'] : '') : managerId,
          description,
          attributes: attrs.map((a, i) => ({ ...a, sortOrder: i })),
          permissions: perms,
        };
        onDone(merged, row ? '자원을 수정했습니다.' : '자원을 등록했습니다.');
      }}
    >
      <Field label="자원 분류 ID" required>
        <LookupSelect table="resource_category" role={role} value={categoryId} onChange={setCategoryId} />
      </Field>
      <Field label="자원명" required>
        <TextInput value={name} onChange={setName} />
      </Field>
      <Field label="승인절차 사용 여부" required hint="사용이면 예약 승인이 필요하고, 미사용이면 자동 승인됩니다.">
        <Select
          value={approval}
          onChange={setApproval}
          options={[['사용', '사용'], ['미사용', '미사용']]}
        />
      </Field>
      <Field label="담당자 ID">
        <LookupSelect table="employee" role={role} value={managerId} onChange={setManagerId} placeholder="담당자 선택" />
      </Field>
      <Field label="공개범위" required>
        <Select
          value={scope}
          onChange={setScope}
          options={[['전체', '전체'], ['부서', '부서'], ['개인', '개인']]}
        />
      </Field>
      <Field label="자원 설명" wide>
        <TextInput value={description} onChange={setDescription} multiline />
      </Field>
      <Field label="자원 속성 항목·값 목록" wide hint="예약 조회의 검색 필터에 쓰입니다.">
        <div>
          {attrs.map((a, i) => (
            <div key={i}>
              <TextInput value={a['attributeName']} onChange={(v) => setAttr(i, 'attributeName', v)} placeholder="속성명" />
              <TextInput value={a['attributeValue']} onChange={(v) => setAttr(i, 'attributeValue', v)} placeholder="속성값" />
              <button type="button" className="ghost" onClick={() => setAttrs(attrs.filter((_, k) => k !== i))}>
                속성 삭제
              </button>
            </div>
          ))}
          <button type="button" className="ghost" onClick={() => setAttrs([...attrs, { attributeName: '', attributeValue: '' }])}>
            속성 추가
          </button>
        </div>
      </Field>
      <Field label="사용 권한 대상(부서·임직원) 목록" wide hint="설정한 범위의 사용자만 이 자원을 예약할 수 있습니다.">
        <div>
          {perms.map((p, i) => (
            <div key={i}>
              <Select
                value={p.kind}
                onChange={(v) => setPerm(i, { kind: v, id: '' })}
                options={[['부서', '부서'], ['임직원', '임직원']]}
              />
              <LookupSelect
                table={p.kind === '부서' ? 'department' : 'employee'}
                role={role}
                value={p.id}
                onChange={(v) => setPerm(i, { id: v })}
              />
              <button type="button" className="ghost" onClick={() => setPerms(perms.filter((_, k) => k !== i))}>
                대상 삭제
              </button>
            </div>
          ))}
          <button type="button" className="ghost" onClick={() => setPerms([...perms, { kind: '부서', id: '' }])}>
            대상 추가
          </button>
        </div>
      </Field>
    </Form>
  );
}

export default function FnSfr03303Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [resources, setResources] = useState<Row[]>([]);
  const [showResources, setShowResources] = useState(false);

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/resource-categories', role, undefined, { page, size: SIZE }),
    [role, page],
  );

  const close = () => setDrawing(null);
  const catDone = (msg: string) => {
    close();
    notify(msg);
    reload();
  };

  const categoryColumns = [
    { key: 'name', label: '분류명' },
    { key: 'sortOrder', label: '정렬 순서' },
    {
      key: 'actions',
      label: '처리',
      render: (r: Row) => (
        <span>
          <button type="button" className="ghost" onClick={(e) => { e.stopPropagation(); setDrawing({ kind: 'catEdit', row: r }); }}>
            수정
          </button>
          <button type="button" className="ghost" onClick={(e) => { e.stopPropagation(); setDrawing({ kind: 'catDel', row: r }); }}>
            삭제
          </button>
        </span>
      ),
    },
  ];

  const resourceColumns = [
    { key: 'name', label: '자원명' },
    {
      key: 'resourceCategoryId',
      label: '자원 분류 ID',
      render: (r: Row) => <RefName table="resource_category" role={role} value={r['resourceCategoryId']} />,
    },
    { key: 'approvalRequired', label: '승인절차 사용 여부', render: (r: Row) => <Badge value={r['approvalRequired']} /> },
    { key: 'visibilityScope', label: '공개범위' },
    {
      key: 'actions',
      label: '처리',
      render: (r: Row) => (
        <span>
          <button type="button" className="ghost" onClick={(e) => { e.stopPropagation(); setDrawing({ kind: 'resEdit', row: r }); }}>
            수정
          </button>
          <button type="button" className="ghost" onClick={(e) => { e.stopPropagation(); setDrawing({ kind: 'resDel', row: r }); }}>
            삭제
          </button>
        </span>
      ),
    },
  ];

  let panel = null;
  if (drawing) {
    if (drawing.kind === 'catNew') {
      panel = (
        <Drawer title="자원 분류 등록" onClose={close}>
          <CategoryForm role={role} onDone={catDone} />
        </Drawer>
      );
    } else if (drawing.kind === 'catEdit') {
      panel = (
        <Drawer title="자원 분류 수정" onClose={close}>
          <CategoryForm row={drawing.row} role={role} onDone={catDone} />
        </Drawer>
      );
    } else if (drawing.kind === 'catDel') {
      const row = drawing.row;
      panel = (
        <Drawer title="자원 분류 삭제" onClose={close}>
          <Form
            submit="삭제합니다"
            danger
            note="삭제하면 되돌릴 수 없습니다. 예약이 있거나 하위 자원이 남아 있으면 삭제할 수 없습니다."
            onSubmit={async () => {
              await call('DELETE', '/resource-categories/' + row['resourceCategoryId'], role);
              catDone('자원 분류를 삭제했습니다.');
            }}
          >
            <Pairs items={[['분류명', String(row['name'])]]} />
          </Form>
        </Drawer>
      );
    } else if (drawing.kind === 'resNew') {
      panel = (
        <Drawer title="자원 등록" onClose={close}>
          <ResourceForm
            role={role}
            onDone={(saved, msg) => {
              setResources([saved, ...resources.filter((r) => r['resourceId'] !== saved['resourceId'])]);
              setShowResources(true);
              close();
              notify(msg);
              reload();
            }}
          />
        </Drawer>
      );
    } else if (drawing.kind === 'resEdit') {
      panel = (
        <Drawer title="자원 수정" onClose={close}>
          <ResourceForm
            row={drawing.row}
            role={role}
            onDone={(saved, msg) => {
              setResources(resources.map((r) => (r['resourceId'] === saved['resourceId'] ? saved : r)));
              close();
              notify(msg);
              reload();
            }}
          />
        </Drawer>
      );
    } else if (drawing.kind === 'resDel') {
      const row = drawing.row;
      panel = (
        <Drawer title="자원 삭제" onClose={close}>
          <Form
            submit="삭제합니다"
            danger
            note="삭제하면 되돌릴 수 없습니다. 예약이 있는 자원은 삭제할 수 없습니다."
            onSubmit={async () => {
              await call('DELETE', '/resources/' + row['resourceId'], role);
              setResources(resources.filter((r) => r['resourceId'] !== row['resourceId']));
              close();
              notify('자원을 삭제했습니다.');
              reload();
            }}
          >
            <Pairs items={[['자원명', String(row['name'])]]} />
          </Form>
        </Drawer>
      );
    } else {
      const row = drawing.row;
      panel = (
        <Drawer title="자원 상세" onClose={close}>
          <Pairs
            items={[
              ['자원명', String(row['name'])],
              ['자원 분류 ID', <RefName table="resource_category" role={role} value={row['resourceCategoryId']} />],
              ['승인절차 사용 여부', <Badge value={row['approvalRequired']} />],
              ['공개범위', String(row['visibilityScope'])],
            ]}
          />
        </Drawer>
      );
    }
  }

  return (
    <div className="doc">
      <section className="box">
        <h2>{showResources ? '이번에 처리한 자원' : '자원 분류'}</h2>
        {showResources ? (
          <div>
            <button type="button" className="ghost" onClick={() => setShowResources(false)}>
              자원 분류 목록으로 돌아가기
            </button>
            <Band total={resources.length}>
              <button type="button" onClick={() => setDrawing({ kind: 'resNew' })}>
                자원 등록
              </button>
            </Band>
            <DataTable
              columns={resourceColumns}
              rows={resources}
              onRowClick={(r) => setDrawing({ kind: 'resView', row: r })}
              empty="아직 처리한 자원이 없습니다. 자원 등록 버튼으로 첫 자원을 등록해 주세요."
            />
          </div>
        ) : (
          <div>
            {error ? <ErrorText text={error} /> : null}
            <Band total={data ? data.total : 0}>
              <button type="button" onClick={() => setDrawing({ kind: 'catNew' })}>
                자원 분류 등록
              </button>
              <button type="button" className="ghost" onClick={() => setDrawing({ kind: 'resNew' })}>
                자원 등록
              </button>
              <button type="button" className="ghost" onClick={() => setShowResources(true)}>
                처리한 자원 보기
              </button>
            </Band>
            <DataTable
              columns={categoryColumns}
              rows={data ? data.items : []}
              empty={loading ? '불러오는 중입니다.' : '아직 등록한 자원 분류가 없습니다. 자원 분류 등록 버튼으로 시작해 주세요.'}
            />
            <Pager page={page} size={SIZE} total={data ? data.total : 0} onPage={setPage} />
          </div>
        )}
      </section>
      {panel}
    </div>
  );
}
