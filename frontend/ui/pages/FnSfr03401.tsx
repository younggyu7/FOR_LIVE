import { useState } from 'react';
import {
  Band,
  Badge,
  DataTable,
  DateInput,
  Field,
  Form,
  LookupSelect,
  RefName,
  Select,
  TextInput,
  call,
} from '../kit';
import type { PageProps, Row } from '../kit';

const POST_TYPES: [string, string][] = [
  ['공지', '공지'],
  ['게시글', '게시글'],
];

const SCOPES: [string, string][] = [
  ['전체', '전체'],
  ['부서', '부서'],
  ['개인', '개인'],
];

interface IdListProps {
  table: string;
  role: string;
  ids: number[];
  placeholder: string;
  onChange: (ids: number[]) => void;
}

function IdList({ table, role, ids, placeholder, onChange }: IdListProps) {
  return (
    <div>
      <LookupSelect
        table={table}
        role={role}
        value=""
        placeholder={placeholder}
        onChange={(v) => {
          const n = Number(v);
          if (v !== '' && Number.isInteger(n) && !ids.includes(n)) {
            onChange([...ids, n]);
          }
        }}
      />
      <ul>
        {ids.map((id) => (
          <li key={id}>
            <RefName table={table} role={role} value={id} />
            {' '}
            <button type="button" className="ghost" onClick={() => onChange(ids.filter((x) => x !== id))}>
              빼기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FnSfr03401Page({ role, notify }: PageProps) {
  const [mode, setMode] = useState<'list' | 'new'>('list');
  const [results, setResults] = useState<Row[]>([]);
  const [postType, setPostType] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scope, setScope] = useState('');
  const [departmentIds, setDepartmentIds] = useState<number[]>([]);
  const [employeeIds, setEmployeeIds] = useState<number[]>([]);
  const [popupStart, setPopupStart] = useState('');
  const [popupEnd, setPopupEnd] = useState('');
  const [pinStart, setPinStart] = useState('');
  const [pinEnd, setPinEnd] = useState('');
  const [attachmentIds, setAttachmentIds] = useState<number[]>([]);

  function startNew() {
    setPostType('');
    setCategory('');
    setTitle('');
    setContent('');
    setScope('');
    setDepartmentIds([]);
    setEmployeeIds([]);
    setPopupStart('');
    setPopupEnd('');
    setPinStart('');
    setPinEnd('');
    setAttachmentIds([]);
    setMode('new');
  }

  async function submit() {
    if (!postType || !category.trim() || !title.trim() || !content.trim() || !scope) {
      throw new Error('구분·분류·제목·내용·공개범위를 모두 입력해 주세요.');
    }
    if (scope === '부서' && departmentIds.length === 0) {
      throw new Error('대상 부서를 하나 이상 지정해 주세요.');
    }
    if (scope === '개인' && employeeIds.length === 0) {
      throw new Error('대상 임직원을 하나 이상 지정해 주세요.');
    }
    if ((popupStart !== '') !== (popupEnd !== '') || (popupStart !== '' && popupStart > popupEnd)) {
      throw new Error('팝업공지 기간의 시작일은 종료일보다 늦을 수 없고, 시작일과 종료일을 함께 입력해야 합니다.');
    }
    if ((pinStart !== '') !== (pinEnd !== '') || (pinStart !== '' && pinStart > pinEnd)) {
      throw new Error('상단 고정 기간의 시작일은 종료일보다 늦을 수 없고, 시작일과 종료일을 함께 입력해야 합니다.');
    }
    const body: Row = {
      postType,
      category: category.trim(),
      title: title.trim(),
      content: content.trim(),
      visibilityScope: scope,
      audienceDepartmentIds: scope === '부서' ? departmentIds : [],
      audienceEmployeeIds: scope === '개인' ? employeeIds : [],
      popupStartDate: popupStart,
      popupEndDate: popupEnd,
      pinStartDate: pinStart,
      pinEndDate: pinEnd,
      attachmentIds,
    };
    const res = await call('POST', '/board-posts', role, body);
    setResults([
      { boardPostId: res['boardPostId'], postType, category: category.trim(), title: title.trim(), visibilityScope: scope },
      ...results,
    ]);
    notify('공지·게시물을 등록했습니다.');
    setMode('list');
  }

  if (mode === 'new') {
    return (
      <div className="doc">
        <button type="button" className="ghost" onClick={() => setMode('list')}>
          목록으로 돌아가기
        </button>
        <h1>공지·게시물 등록</h1>
        <Form
          onSubmit={submit}
          submit="등록"
          note="등록하면 공개범위에 포함된 사용자만 이 글을 볼 수 있습니다."
        >
          <section className="box">
            <h2>기본 정보</h2>
            <Field label="구분" required>
              <Select value={postType} onChange={setPostType} options={POST_TYPES} />
            </Field>
            <Field label="분류" required>
              <TextInput value={category} onChange={setCategory} />
            </Field>
            <Field label="제목" required wide>
              <TextInput value={title} onChange={setTitle} />
            </Field>
            <Field label="내용" required wide>
              <TextInput value={content} onChange={setContent} multiline />
            </Field>
          </section>
          <section className="box">
            <h2>공개범위</h2>
            <Field label="공개범위" required>
              <Select value={scope} onChange={setScope} options={SCOPES} />
            </Field>
            {scope === '부서' && (
              <Field label="공개범위가 부서일 때 대상 부서" required wide>
                <IdList
                  table="department"
                  role={role}
                  ids={departmentIds}
                  placeholder="부서 선택"
                  onChange={setDepartmentIds}
                />
              </Field>
            )}
            {scope === '개인' && (
              <Field label="공개범위가 개인일 때 대상 임직원" required wide>
                <IdList
                  table="employee"
                  role={role}
                  ids={employeeIds}
                  placeholder="임직원 선택"
                  onChange={setEmployeeIds}
                />
              </Field>
            )}
          </section>
          <section className="box">
            <h2>팝업공지·상단 고정 기간</h2>
            <Field label="팝업공지 시작일">
              <DateInput value={popupStart} onChange={setPopupStart} />
            </Field>
            <Field label="팝업공지 종료일">
              <DateInput value={popupEnd} onChange={setPopupEnd} />
            </Field>
            <Field label="상단 고정 시작일">
              <DateInput value={pinStart} onChange={setPinStart} />
            </Field>
            <Field label="상단 고정 종료일">
              <DateInput value={pinEnd} onChange={setPinEnd} />
            </Field>
          </section>
          <section className="box">
            <h2>첨부파일</h2>
            <Field label="미리 업로드한 첨부파일" wide>
              <IdList
                table="attachment"
                role={role}
                ids={attachmentIds}
                placeholder="첨부파일 선택"
                onChange={setAttachmentIds}
              />
            </Field>
          </section>
        </Form>
      </div>
    );
  }

  return (
    <div className="doc">
      <h1>공지·게시물</h1>
      <Band total={results.length}>
        <button type="button" onClick={startNew}>
          공지·게시물 등록
        </button>
      </Band>
      <DataTable
        columns={[
          { key: 'boardPostId', label: '공지·게시물 ID' },
          { key: 'postType', label: '구분', render: (r) => <Badge value={r['postType']} /> },
          { key: 'category', label: '분류' },
          { key: 'title', label: '제목' },
          { key: 'visibilityScope', label: '공개범위' },
        ]}
        rows={results}
        empty="아직 등록한 내역이 없습니다. 공지·게시물 등록 버튼을 눌러 시작해 주세요."
      />
    </div>
  );
}
