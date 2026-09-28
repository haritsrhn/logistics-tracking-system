import { useState, type FormEvent } from 'react';
import { useStore } from '../../data/store';
import { KATEGORI } from '../../lib/constants';
import type { ItemMaster as Item } from '../../lib/types';

type Draft = Pick<Item, 'nama' | 'kategori' | 'satuan'>;
const NEW = '__new__';

export function ItemMaster() {
  const { master, actions } = useStore();
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  const list = filter === '' ? master : master.filter((m) => m.kategori === Number(filter));
  const sorted = [...list].sort((a, b) => a.kategori - b.kategori || a.nama.localeCompare(b.nama, 'id'));

  return (
    <>
      <h1 className="page-title">Item master</h1>
      <p className="muted" style={{ marginTop: -12, marginBottom: 20 }}>
        Sumber saran uraian dan satuan di form Kebutuhan PIC. PIC tetap boleh menulis barang di luar daftar ini.
      </p>
      <div className="toolbar">
        <div className="filters">
          <div className="field">
            <label htmlFor="im-kat">Kategori</label>
            <select id="im-kat" className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Semua kategori</option>
              {KATEGORI.map((k, i) => (
                <option key={k} value={i}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="button" className="btn btn-primary" disabled={editing === NEW} onClick={() => setEditing(NEW)}>
          Tambah item
        </button>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Uraian</th>
              <th>Kategori</th>
              <th>Satuan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {editing === NEW && (
              <EditRow
                initial={{ nama: '', kategori: filter === '' ? 0 : Number(filter), satuan: '' }}
                onCancel={() => setEditing(null)}
                onSave={(d) => {
                  actions.addMaster({ ...d, aktif: true });
                  setEditing(null);
                }}
              />
            )}
            {sorted.map((m) =>
              editing === m.id ? (
                <EditRow
                  key={m.id}
                  initial={m}
                  aktif={m.aktif}
                  onCancel={() => setEditing(null)}
                  onSave={(d) => {
                    actions.updateMaster(m.id, d);
                    setEditing(null);
                  }}
                />
              ) : (
                <tr key={m.id} className={m.aktif ? undefined : 'row-inactive'}>
                  <td>{m.nama}</td>
                  <td>{KATEGORI[m.kategori]}</td>
                  <td>{m.satuan}</td>
                  <td>{m.aktif ? 'Aktif' : 'Nonaktif'}</td>
                  <td className="nowrap">
                    <span className="btn-row" style={{ gap: 16 }}>
                      <button type="button" className="btn-text" onClick={() => setEditing(m.id)}>
                        Edit
                      </button>
                      <button type="button" className="btn-text" onClick={() => actions.updateMaster(m.id, { aktif: !m.aktif })}>
                        {m.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </span>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {sorted.length === 0 && editing !== NEW && <p className="table-empty">Belum ada item di kategori ini.</p>}
      </div>
    </>
  );
}

function EditRow({
  initial,
  aktif = true,
  onSave,
  onCancel,
}: {
  initial: Draft;
  aktif?: boolean;
  onSave: (d: Draft) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<Draft>({ nama: initial.nama, kategori: initial.kategori, satuan: initial.satuan });
  const [error, setError] = useState('');
  const formId = `im-form-${initial.nama || 'baru'}`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!d.nama.trim()) return setError('Uraian wajib diisi.');
    onSave({ nama: d.nama.trim(), kategori: d.kategori, satuan: d.satuan.trim() || 'pcs' });
  };

  return (
    <tr>
      <td>
        <form id={formId} onSubmit={submit} noValidate />
        <input
          form={formId}
          className="input"
          aria-label="Uraian"
          autoFocus
          value={d.nama}
          aria-invalid={!!error}
          onChange={(e) => setD({ ...d, nama: e.target.value })}
        />
        {error && <p className="error-text">{error}</p>}
      </td>
      <td>
        <select
          form={formId}
          className="select"
          aria-label="Kategori"
          value={d.kategori}
          onChange={(e) => setD({ ...d, kategori: Number(e.target.value) })}
        >
          {KATEGORI.map((k, i) => (
            <option key={k} value={i}>
              {k}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          form={formId}
          className="input"
          aria-label="Satuan"
          placeholder="pcs"
          style={{ width: 100 }}
          value={d.satuan}
          onChange={(e) => setD({ ...d, satuan: e.target.value })}
        />
      </td>
      <td>{aktif ? 'Aktif' : 'Nonaktif'}</td>
      <td className="nowrap">
        <span className="btn-row" style={{ gap: 16 }}>
          <button type="submit" form={formId} className="btn-text">
            Simpan
          </button>
          <button type="button" className="btn-text" onClick={onCancel}>
            Batal
          </button>
        </span>
      </td>
    </tr>
  );
}
