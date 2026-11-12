import { useState } from 'react';
import {
  call,
  useData,
  Badge,
  DateText,
  Filters,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  DateInput,
  Select,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const SHARE_RECEIVED = '공유받은 문서';

interface DetailProps {
  id: number;
  row: Row;
  role: string;
  notify: (text: string) => void;
  onBack: () => void;
  onChanged: () => void;
}

function DocDetail({ id, row, role, notify, onBack, onChanged }: DetailProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const { data, error, loading, reload } = useData<Row>(
    () => call('GET', '/office-documents/' + id, role),
    [id],
  );
  const received = row['shareType'] === SHARE_RECEIVED;
  const canEdit = !received || row['canEdit'] === true;
  const canDelete = !received;

  function openEdit() {
    setTitle(String(data?.['title'] ?? ''));
    setBody(String(data?.['body'] ?? ''));
    setEditing(true);
  }

  return (
    <div className="doc">
      <button className="ghost" onClick={onBack}>
        목록으로 돌아가기
      </button>
      {loading && <p>문서를 불러오는 중입니다.</p>}
      {error !== '' && <ErrorText text={error} />}
      {data && (
        <section className="box">
          <h2>문서 내용</h2>
          <Pairs
            items={[
              ['문서 제목', String(data['title'] ?? '')],
              ['작성자', <RefName table="employee" role={role} value={data['authorId']} />],
              ['문서 구분', <Badge value={row['shareType']} />],
              ['문서 본문', String(data['body'] ?? '')],
            ]}
          />
          {received && !canEdit && <p>수정 권한이 없는 공유받은 문서입니다. 열람만 할 수 있습니다.</p>}
          <div>
            {canEdit && <button onClick={openEdit}>문서 수정</button>}
            {canDelete && (
              <button className="ghost" onClick={() => setDeleting(true)}>
                문서 삭제
              </button>
            )}
          </div>
        </section>
      )}
      {editing && (
        <Drawer title="문서 수정" onClose={() => setEditing(false)}>
          <Form
            submit="저장"
            onSubmit={async () => {
              if (String(title).trim() === '') {
                throw new Error('문서 제목을 입력해 주세요.');
              }
              await call('PATCH', '/office-documents/' + id, role, { title, body });
              notify('문서를 수정했습니다.');
              setEditing(false);
              reload();
              onChanged();
            }}
          >
            <Field label="문서 제목" required wide>
              <TextInput value={title} onChange={setTitle} />
            </Field>
            <Field label="문서 본문" wide>
              <TextInput value={body} onChange={setBody} multiline />
            </Field>
          </Form>
        </Drawer>
      )}
      {deleting && (
        <Drawer title="문서 삭제" onClose={() => setDeleting(false)}>
          <Form
            submit="삭제"
            danger
            note="삭제한 문서는 되돌릴 수 없고, 공유받은 사용자도 더 이상 볼 수 없습니다."
            onSubmit={async () => {
              await call('DELETE', '/office-documents/' + id, role);
              notify('문서를 삭제했습니다.');
              setDeleting(false);
              onChanged();
              onBack();
            }}
          />
        </Drawer>
      )}
    </div>
  );
}

export default function FnSfr04106Page({ role, notify }: PageProps) {
  const [boxType, setBoxType] = useState('MY');
  const [title, setTitle] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [applied, setApplied] = useState({ title: '', createdFrom: '', createdTo: '' });
  const [pageNo, setPageNo] = useState(0);
  const [selected, setSelected] = useState<Row | undefined>(undefined);

  const { data, error, loading, reload } = useData<Page>(
    () =>
      call<Page>('GET', '/office-documents', role, undefined, {
        boxType,
        title: applied.title,
        createdFrom: applied.createdFrom,
        createdTo: applied.createdTo,
        page: pageNo,
        size: 20,
      }),
    [boxType, applied, pageNo, role],
  );

  if (selected) {
    return (
      <DocDetail
        id={Number(selected['officeDocumentId'])}
        row={selected}
        role={role}
        notify={notify}
        onBack={() => setSelected(undefined)}
        onChanged={reload}
      />
    );
  }

  return (
    <div className="doc">
      <h1>문서함</h1>
      <Filters
        onSearch={() => {
          setPageNo(0);
          setApplied({ title, createdFrom, createdTo });
        }}
        onReset={() => {
          setTitle('');
          setCreatedFrom('');
          setCreatedTo('');
          setPageNo(0);
          setApplied({ title: '', createdFrom: '', createdTo: '' });
        }}
      >
        <Field label="문서함 구분">
          <Select
            value={boxType}
            onChange={(v) => {
              setBoxType(v === '' ? 'MY' : v);
              setPageNo(0);
            }}
            options={[
              ['MY', '내 문서함'],
              ['SHARED', '공유 문서함'],
            ]}
          />
        </Field>
        <Field label="문서 제목">
          <TextInput value={title} onChange={setTitle} />
        </Field>
        <Field label="작성일 시작일">
          <DateInput value={createdFrom} onChange={setCreatedFrom} />
        </Field>
        <Field label="작성일 종료일">
          <DateInput value={createdTo} onChange={setCreatedTo} />
        </Field>
      </Filters>
      {error !== '' && <ErrorText text={error} />}
      {loading && <p>문서 목록을 불러오는 중입니다.</p>}
      <Band total={data?.total} />
      <DataTable
        rows={data?.items ?? []}
        empty={boxType === 'MY' ? '아직 작성한 문서가 없습니다.' : '아직 공유한 문서나 공유받은 문서가 없습니다.'}
        onRowClick={(row) => setSelected(row)}
        columns={[
          { key: 'title', label: '문서 제목' },
          {
            key: 'authorId',
            label: '작성자',
            render: (row) => <RefName table="employee" role={role} value={row['authorId']} />,
          },
          {
            key: 'createdAt',
            label: '생성 일시',
            render: (row) => <DateText value={row['createdAt']} time />,
          },
          {
            key: 'shareType',
            label: '문서 구분',
            render: (row) => <Badge value={row['shareType']} />,
          },
          {
            key: 'canEdit',
            label: '수정 권한',
            render: (row) =>
              row['shareType'] === SHARE_RECEIVED ? (row['canEdit'] === true ? '수정 가능' : '열람만 가능') : '-',
          },
        ]}
      />
      {data && (
        <Pager page={data.page} size={data.size} total={data.total} onPage={setPageNo} />
      )}
    </div>
  );
}
