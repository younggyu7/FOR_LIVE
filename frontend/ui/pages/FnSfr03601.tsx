import { useState } from 'react';
import {
  call,
  useData,
  Band,
  DataTable,
  Pager,
  Drawer,
  Pairs,
  Form,
  Field,
  TextInput,
  LookupSelect,
  RefName,
  ErrorText,
} from '../kit';
import type { PageProps, Row, Page } from '../kit';

const PAGE_SIZE = 20;

type Mode = 'none' | 'create' | 'edit' | 'delete';

export default function FnSfr03601Page({ role, notify }: PageProps) {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const [mode, setMode] = useState<Mode>('none');
  const [roomName, setRoomName] = useState('');
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [pick, setPick] = useState<number | string>('');
  const [formError, setFormError] = useState('');

  const { data, error, loading, reload } = useData<Page>(
    () => call<Page>('GET', '/messenger-rooms', role, undefined, { page, size: PAGE_SIZE }),
    [page, role],
  );

  function closeDrawer() {
    setMode('none');
    setFormError('');
  }

  function openCreate() {
    setRoomName('');
    setMemberIds([]);
    setPick('');
    setFormError('');
    setMode('create');
  }

  function openEdit() {
    setRoomName(String(selected?.roomName ?? ''));
    setFormError('');
    setMode('edit');
  }

  function addMember(value: number | string) {
    setPick('');
    if (value === '' || typeof value !== 'number') {
      return;
    }
    if (!memberIds.includes(value)) {
      setMemberIds([...memberIds, value]);
    }
  }

  async function submitCreate() {
    if (roomName.trim() === '') {
      throw new Error('대화방 이름을 입력해 주세요.');
    }
    if (memberIds.length === 0) {
      throw new Error('참여 임직원을 한 명 이상 선택해 주세요.');
    }
    await call('POST', '/messenger-rooms', role, { roomName: roomName.trim(), memberIds });
    notify('대화방을 등록했습니다.');
    closeDrawer();
    setPage(0);
    reload();
  }

  async function submitEdit() {
    if (roomName.trim() === '') {
      throw new Error('대화방 이름을 입력해 주세요.');
    }
    const id = String(selected?.messengerRoomId);
    const result = await call('PATCH', '/messenger-rooms/' + id, role, { roomName: roomName.trim() });
    notify('대화방 정보를 변경했습니다.');
    setSelected({ ...(selected ?? {}), roomName: result.roomName });
    closeDrawer();
    reload();
  }

  async function submitDelete() {
    const id = String(selected?.messengerRoomId);
    await call('DELETE', '/messenger-rooms/' + id, role);
    notify('대화방을 삭제했습니다.');
    closeDrawer();
    setSelected(null);
    reload();
  }

  const drawers = (
    <>
      {mode === 'create' && (
        <Drawer title="개인 대화방 등록" onClose={closeDrawer}>
          <Form onSubmit={submitCreate} submit="등록">
            <Field label="대화방 이름" required wide>
              <TextInput value={roomName} onChange={setRoomName} />
            </Field>
            <Field label="참여 임직원" required wide hint="조직도의 임직원 중에서 한 명씩 추가합니다.">
              <LookupSelect
                table="employee"
                role={role}
                value={pick}
                onChange={addMember}
                placeholder="임직원 선택"
              />
            </Field>
            {memberIds.length === 0 ? (
              <p>아직 선택한 참여자가 없습니다. 임직원을 선택해 주세요.</p>
            ) : (
              <ul>
                {memberIds.map((id) => (
                  <li key={id}>
                    <RefName table="employee" role={role} value={id} />{' '}
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => setMemberIds(memberIds.filter((m) => m !== id))}
                    >
                      제외
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Form>
        </Drawer>
      )}
      {mode === 'edit' && (
        <Drawer title="대화방 이름 변경" onClose={closeDrawer}>
          <Form onSubmit={submitEdit} submit="변경">
            <Field label="대화방 이름" required wide>
              <TextInput value={roomName} onChange={setRoomName} />
            </Field>
          </Form>
        </Drawer>
      )}
      {mode === 'delete' && (
        <Drawer title="대화방 삭제" onClose={closeDrawer}>
          <Form
            onSubmit={submitDelete}
            submit="삭제"
            danger
            note="삭제하면 대화방과 참여자 정보가 사라지며 되돌릴 수 없습니다."
          >
            <p>{String(selected?.roomName ?? '')} 대화방을 삭제합니다.</p>
          </Form>
        </Drawer>
      )}
    </>
  );

  if (selected) {
    return (
      <div className="doc">
        <button type="button" className="ghost" onClick={() => setSelected(null)}>
          목록으로
        </button>
        <section className="box">
          <h2>대화방 정보</h2>
          <Pairs
            items={[
              ['대화방 ID', String(selected.messengerRoomId)],
              ['대화방 이름', String(selected.roomName ?? '')],
              ['생성자', <RefName table="employee" role={role} value={selected.creatorId} />],
            ]}
          />
        </section>
        <section className="box">
          <h2>관리</h2>
          <p>대화방 변경과 삭제는 생성자만 할 수 있습니다.</p>
          <button type="button" onClick={openEdit}>
            이름 변경
          </button>{' '}
          <button type="button" className="ghost" onClick={() => setMode('delete')}>
            삭제
          </button>
        </section>
        {drawers}
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>대화방</h1>
      <Band total={data?.total}>
        <button type="button" onClick={openCreate}>
          개인 대화방 등록
        </button>
      </Band>
      {error && <ErrorText text={error} />}
      <DataTable
        columns={[
          { key: 'messengerRoomId', label: '대화방 ID' },
          { key: 'roomName', label: '대화방 이름' },
          {
            key: 'creatorId',
            label: '생성자',
            render: (row) => <RefName table="employee" role={role} value={row.creatorId} />,
          },
        ]}
        rows={data?.items ?? []}
        onRowClick={(row) => setSelected(row)}
        empty={loading ? '불러오는 중입니다.' : '참여 중인 대화방이 없습니다. 개인 대화방을 등록해 보세요.'}
      />
      <Pager page={page} size={PAGE_SIZE} total={data?.total ?? 0} onPage={setPage} />
      {drawers}
    </div>
  );
}
