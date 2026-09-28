import { useState, type FormEvent } from 'react';
import { useStore } from '../../data/store';
import { countStatus } from '../../lib/rules';
import type { Unit } from '../../lib/types';

export function UnitUser() {
  return (
    <>
      <h1 className="page-title">Unit dan user</h1>
      <UnitTable />
      <UserTable />
    </>
  );
}

/** Input yang menyimpan saat blur atau Enter; nilai kosong dikembalikan. */
function InlineInput({ value, label, onCommit }: { value: string; label: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setDraft(value);
  }
  const commit = () => {
    const v = draft.trim();
    if (!v) return setDraft(value);
    if (v !== value) onCommit(v);
  };
  return (
    <input
      className="input cell-input"
      aria-label={label}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') setDraft(value);
      }}
    />
  );
}

function UnitTable() {
  const { units, users, items, bulanBerjalan, actions } = useStore();
  const [form, setForm] = useState({ nama: '', lokasi: '' });
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) return setError('Nama unit wajib diisi.');
    actions.addUnit({ nama: form.nama.trim(), lokasi: form.lokasi.trim() });
    setForm({ nama: '', lokasi: '' });
    setError('');
  };

  const status = (u: Unit) => {
    const c = countStatus(items.filter((it) => it.unitId === u.id && it.bulan === bulanBerjalan));
    return c.total ? (
      <span>
        {c.selesai} dari {c.total} selesai
      </span>
    ) : (
      <span style={{ color: 'var(--status-belum)' }}>Belum mengisi daftar</span>
    );
  };

  return (
    <section>
      <h2 className="section-title">Unit</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama unit</th>
              <th>Lokasi</th>
              <th>PIC</th>
              <th>Status bulan ini</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => {
              const pics = users.filter((p) => p.peran === 'pic' && p.unitId === u.id);
              return (
                <tr key={u.id}>
                  <td>
                    <InlineInput value={u.nama} label={`Nama unit ${u.nama}`} onCommit={(nama) => actions.updateUnit(u.id, { nama })} />
                  </td>
                  <td>
                    <InlineInput
                      value={u.lokasi}
                      label={`Lokasi ${u.nama}`}
                      onCommit={(lokasi) => actions.updateUnit(u.id, { lokasi })}
                    />
                  </td>
                  <td>{pics.length ? pics.map((p) => p.nama).join(', ') : <span className="muted">Belum ada PIC</span>}</td>
                  <td className="nowrap">{status(u)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <form className="form-inline" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="nu-nama">Nama unit</label>
          <input
            id="nu-nama"
            className="input"
            value={form.nama}
            aria-invalid={!!error}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="nu-lokasi">Lokasi</label>
          <input id="nu-lokasi" className="input" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary">
          Tambah unit
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}

function UserTable() {
  const { users, units, actions } = useStore();
  const [form, setForm] = useState({ nama: '', username: '', unitId: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = actions.addPic({ nama: form.nama, username: form.username, unitId: form.unitId || null });
    if (err) {
      setDone('');
      return setError(err);
    }
    setDone(`Akun ${form.username.trim()} dibuat. Password awal diatur oleh sistem.`);
    setForm({ nama: '', username: '', unitId: '' });
    setError('');
  };

  return (
    <section>
      <h2 className="section-title">User</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Username</th>
              <th>Peran</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.nama}</td>
                <td>{u.username}</td>
                <td>{u.peran === 'admin' ? 'Admin' : 'PIC'}</td>
                <td>
                  {u.peran === 'admin' ? (
                    'Semua unit'
                  ) : (
                    <select
                      className="select"
                      aria-label={`Unit ${u.nama}`}
                      value={u.unitId ?? ''}
                      onChange={(e) => actions.assignUnit(u.id, e.target.value || null)}
                    >
                      <option value="">Belum di-assign</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.nama}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">Buat akun PIC</h2>
      <form className="form-inline" style={{ marginTop: 0 }} onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="np-nama">Nama</label>
          <input id="np-nama" className="input" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="np-username">Username</label>
          <input
            id="np-username"
            className="input"
            autoCapitalize="none"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="np-unit">Unit (opsional)</label>
          <select id="np-unit" className="select" value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })}>
            <option value="">Belum di-assign</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Buat akun
        </button>
      </form>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="small" role="status" style={{ marginTop: 8 }}>
          {done}
        </p>
      )}
    </section>
  );
}
