import { useMemo, useState } from 'react';
import { HeatCell } from '../../components/HeatCell';
import { StatusDot, StatusSelect } from '../../components/Status';
import { SummaryStrip } from '../../components/SummaryStrip';
import { useStore } from '../../data/store';
import { KATEGORI } from '../../lib/constants';
import { formatMonth } from '../../lib/date';
import { countStatus, numberInCategory } from '../../lib/rules';
import type { ItemKebutuhan } from '../../lib/types';

interface Cell {
  unitId: string;
  kategori: number;
}

export function Dashboard() {
  const { units, items, bulanBerjalan } = useStore();
  const [bulan, setBulan] = useState(bulanBerjalan);
  const [unitId, setUnitId] = useState('');
  const [kategori, setKategori] = useState('');
  const [selected, setSelected] = useState<Cell | null>(null);

  const months = useMemo(
    () => [...new Set([bulanBerjalan, ...items.filter((it) => it.bulan < bulanBerjalan).map((it) => it.bulan)])].sort().reverse(),
    [items, bulanBerjalan],
  );

  const monthItems = items.filter((it) => it.bulan === bulan);
  const rowUnits = unitId ? units.filter((u) => u.id === unitId) : units;
  const cols = kategori === '' ? KATEGORI.map((_, k) => k) : [Number(kategori)];

  const scoped = monthItems.filter((it) => rowUnits.some((u) => u.id === it.unitId) && cols.includes(it.kategori));
  const c = countStatus(scoped);
  const emptyUnits = rowUnits.filter((u) => !monthItems.some((it) => it.unitId === u.id));
  const pct = c.total ? Math.round((c.selesai / c.total) * 100) : 0;

  const changeKategori = (v: string) => {
    setKategori(v);
    // Pindahkan sel terpilih ke kategori baru.
    if (v !== '') {
      const k = Number(v);
      const target = selected?.unitId ?? (unitId || null);
      if (target) setSelected({ unitId: target, kategori: k });
    }
  };

  const changeUnit = (v: string) => {
    setUnitId(v);
    if (v && selected && selected.unitId !== v) setSelected({ unitId: v, kategori: selected.kategori });
  };

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <div className="filters">
        <div className="field">
          <label htmlFor="f-bulan">Bulan</label>
          <select id="f-bulan" className="select" value={bulan} onChange={(e) => setBulan(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
                {m === bulanBerjalan ? ' (berjalan)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-unit">Unit</label>
          <select id="f-unit" className="select" value={unitId} onChange={(e) => changeUnit(e.target.value)}>
            <option value="">Semua unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-kat">Kategori</label>
          <select id="f-kat" className="select" value={kategori} onChange={(e) => changeKategori(e.target.value)}>
            <option value="">Semua kategori</option>
            {KATEGORI.map((k, i) => (
              <option key={k} value={i}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SummaryStrip
        entries={[
          { label: 'Total barang', value: c.total, note: `${pct}% selesai` },
          { label: <><StatusDot status="selesai" />Selesai</>, value: c.selesai },
          { label: <><StatusDot status="proses" />Dalam Proses</>, value: c.proses },
          { label: <><StatusDot status="belum" />Belum Selesai</>, value: c.belum },
          {
            label: 'Unit tanpa daftar',
            value: emptyUnits.length,
            note: emptyUnits.length ? emptyUnits.map((u) => u.nama).join(', ') : 'Semua unit sudah mengisi',
          },
        ]}
      />

      <div className="table-scroll">
        <table className={`data-table heat-table${cols.length === 1 ? " is-single" : ""}`}>
          <thead>
            <tr>
              <th scope="col">Unit</th>
              {cols.map((k) => (
                <th scope="col" key={k}>
                  {KATEGORI[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowUnits.map((u) => {
              const unitItems = monthItems.filter((it) => it.unitId === u.id);
              const uc = countStatus(unitItems);
              return (
                <tr key={u.id}>
                  <th scope="row" style={{ fontWeight: 400 }}>
                    <div className="heat-unit-name">{u.nama}</div>
                    {uc.total ? (
                      <div className="heat-unit-status">
                        {uc.selesai} dari {uc.total} selesai
                      </div>
                    ) : (
                      <div className="heat-unit-status is-empty">Belum mengisi daftar</div>
                    )}
                  </th>
                  {cols.map((k) => (
                    <td key={k}>
                      <HeatCell
                        kategori={k}
                        count={countStatus(unitItems.filter((it) => it.kategori === k))}
                        selected={selected?.unitId === u.id && selected.kategori === k}
                        onSelect={() => setSelected({ unitId: u.id, kategori: k })}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected ? (
        <DetailPanel cell={selected} bulan={bulan} />
      ) : (
        <p className="muted" style={{ marginTop: 24 }}>
          Pilih sel di tabel untuk melihat rincian barang.
        </p>
      )}
    </>
  );
}

function DetailPanel({ cell, bulan }: { cell: Cell; bulan: string }) {
  const { units, items, bulanBerjalan, actions } = useStore();
  const unit = units.find((u) => u.id === cell.unitId);
  const list = items.filter((it) => it.unitId === cell.unitId && it.bulan === bulan && it.kategori === cell.kategori);
  const archived = bulan !== bulanBerjalan;

  return (
    <section aria-labelledby="detail-title">
      <div className="detail-head">
        <h2 className="section-title" id="detail-title">
          {unit?.nama}, {KATEGORI[cell.kategori]}
        </h2>
        <span className="small muted">
          {archived ? `Arsip ${formatMonth(bulan)}, hanya baca` : 'Koreksi admin tersimpan otomatis'}
        </span>
      </div>
      {list.length === 0 ? (
        <p className="table-empty">Tidak ada barang di kategori ini.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="num">No</th>
                <th>Uraian</th>
                <th className="num">Qty</th>
                <th>Progress</th>
                <th>Tanggal selesai</th>
                <th>Keterangan</th>
                <th>Diinput oleh</th>
              </tr>
            </thead>
            <tbody>
              {list.map((it) => (
                <DetailRow key={it.id} item={it} no={numberInCategory(items, it)} disabled={archived} actions={actions} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DetailRow({
  item,
  no,
  disabled,
  actions,
}: {
  item: ItemKebutuhan;
  no: number;
  disabled: boolean;
  actions: ReturnType<typeof useStore>['actions'];
}) {
  return (
    <tr>
      <td className="num">{no}</td>
      <td>{item.uraianBarang}</td>
      <td className="num nowrap">
        {item.qty} {item.satuan}
      </td>
      <td>
        <span className="progress-cell">
          <StatusDot status={item.progress} />
          <StatusSelect
            value={item.progress}
            disabled={disabled}
            label={`Progress ${item.uraianBarang}`}
            onChange={(p) => actions.setProgress(item.id, p)}
          />
        </span>
      </td>
      <td>
        <input
          className="input"
          type="date"
          aria-label={`Tanggal selesai ${item.uraianBarang}`}
          disabled={disabled}
          value={item.tanggalSelesai ?? ''}
          onChange={(e) => actions.updateItem(item.id, { tanggalSelesai: e.target.value || null })}
        />
      </td>
      <td>
        <input
          className="input cell-input"
          aria-label={`Keterangan ${item.uraianBarang}`}
          disabled={disabled}
          value={item.keterangan}
          onChange={(e) => actions.updateItem(item.id, { keterangan: e.target.value })}
        />
      </td>
      <td className="nowrap">{item.diinputOleh}</td>
    </tr>
  );
}
