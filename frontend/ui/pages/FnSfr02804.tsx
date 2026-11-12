import { useState } from 'react';
import { Band, Badge, DataTable, DateText, Drawer, Form, Num, call } from '../kit';
import type { PageProps, Row } from '../kit';

export default function FnSfr02804Page({ role, notify }: PageProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Row[]>([]);

  async function readAll() {
    const res = await call<{ readCount: number }>('POST', '/notifications/read-all', role, {});
    setResults((prev) => [
      { id: prev.length + 1, processedAt: new Date().toISOString(), readCount: res.readCount, status: '읽음' },
      ...prev,
    ]);
    setOpen(false);
    notify('안읽음 알림 ' + res.readCount + '건을 읽음으로 처리했습니다.');
  }

  return (
    <div className='doc'>
      <h1>알림 읽음 처리</h1>
      <Band total={results.length}>
        <button onClick={() => setOpen(true)}>모두 읽음 처리</button>
      </Band>
      <DataTable
        columns={[
          { key: 'processedAt', label: '처리 일시', render: (r) => <DateText value={r.processedAt} time /> },
          { key: 'readCount', label: '읽음 처리 건수', render: (r) => <Num value={r.readCount} /> },
          { key: 'status', label: '읽음 상태', render: (r) => <Badge value={r.status} /> },
        ]}
        rows={results}
        empty='아직 처리한 내역이 없습니다. 모두 읽음 처리 버튼으로 안읽음 알림을 정리해 보세요.'
      />
      {open && (
        <Drawer title='모두 읽음 처리' onClose={() => setOpen(false)}>
          <Form
            onSubmit={readAll}
            submit='모두 읽음 처리'
            note='본인의 안읽음 알림이 모두 읽음으로 바뀝니다. 안읽음 알림이 없으면 변경 없이 안내만 표시됩니다.'
          />
        </Drawer>
      )}
    </div>
  );
}
