import { Fragment, useState } from 'react';
import { StatusDot, StatusLabel } from '../../components/Status';
import { SummaryStrip } from '../../components/SummaryStrip';
import { useStore } from '../../data/store';
import { KATEGORI } from '../../lib/constants';
import { formatDate, formatMonth } from '../../lib/date';
import { countStatus, groupByKategori } from '../../lib/rules';

export function AdminRiwayat() {
  const { units, items, bulanBerjalan } = useStore();
  const months = [...new Set(items.filter((it) => it.bulan < bulanBerjalan).map((it) => it.bulan))].sort().reverse();
  const [bulan, setBulan] = useState(months[0] ?? '');
  const [unitId, setUnitId] = useState(units[0]?.id ?? '');

  const shownUnits = unitId ? units.filter((u) => u.id === unitId) : units;
  const list = items.filter((it) => it.bulan === bulan && shownUnits.some((u) => u.id === it.unitId));
  const c = countStatus(list);

  return (
    <>
      <h1 className="page-title">Riwayat</h1>
      {months.length === 0 ? (
        <p className="muted">Belum ada arsip bulan sebelumnya.</p>
      ) : (
        <>
          <div className="filters">
            <div className="field">
              <label htmlFor="r-unit">Unit</label>
              <select id="r-unit" className="select" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                <option value="">Semua unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="r-bulan">Bulan</label>
              <select id="r-bulan" className="select" value={bulan} onChange={(e) => setBulan(e.target.value)}>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {formatMonth(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SummaryStrip
            entries={[
              { label: 'Total barang', value: c.total },
              { label: <><StatusDot status="selesai" />Selesai</>, value: c.selesai },
              { label: <><StatusDot status="proses" />Dalam Proses</>, value: c.proses },
              { label: <><StatusDot status="belum" />Belum Selesai</>, value: c.belum },
            ]}
          />
          {shownUnits.map((u) => {
            const unitList = list.filter((it) => it.unitId === u.id);
            return (
              <section key={u.id}>
                {!unitId && <h2 className="section-title">{u.nama}</h2>}
                {unitList.length === 0 ? (
                  <p className="table-empty">Tidak ada daftar di bulan ini.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Kategori</th>
                          <th className="num">No</th>
                          <th>Uraian</th>
                          <th className="num">Qty</th>
                          <th>Satuan</th>
                          <th>Progress</th>
                          <th>Tgl selesai</th>
                          <th>Keterangan</th>
                          <th>Diinput oleh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupByKategori(unitList).map((g) => (
                          <Fragment key={g.kategori}>
                            {g.items.map((it, i) => (
                              <tr key={it.id}>
                                <td style={{ fontWeight: 500 }}>{i === 0 ? KATEGORI[g.kategori] : ''}</td>
                                <td className="num">{i + 1}</td>
                                <td>{it.uraianBarang}</td>
                                <td className="num">{it.qty}</td>
                                <td>{it.satuan}</td>
                                <td>
                                  <StatusLabel status={it.progress} />
                                </td>
                                <td className="nowrap">{it.tanggalSelesai ? formatDate(it.tanggalSelesai) : ''}</td>
                                <td>{it.keterangan}</td>
                                <td className="nowrap">{it.diinputOleh}</td>
                              </tr>
                            ))}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}
    </>
  );
}
