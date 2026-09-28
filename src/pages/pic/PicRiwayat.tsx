import { useState } from 'react';
import { StatusLabel } from '../../components/Status';
import { useStore } from '../../data/store';
import { KATEGORI, PROGRESS_ORDER } from '../../lib/constants';
import { archiveDate, formatDate, formatMonth } from '../../lib/date';
import { countStatus, groupByKategori } from '../../lib/rules';
import { itemDetail } from './Realisasi';

export function PicRiwayat() {
  const { me, items, bulanBerjalan } = useStore();
  const months = [...new Set(items.filter((it) => it.unitId === me?.unitId && it.bulan < bulanBerjalan).map((it) => it.bulan))]
    .sort()
    .reverse();
  const [bulan, setBulan] = useState(months[0] ?? '');
  const list = items.filter((it) => it.unitId === me?.unitId && it.bulan === bulan);
  const c = countStatus(list);

  return (
    <>
      <div className="page-intro">
        <h1 className="page-title">Riwayat</h1>
        <p className="muted">Arsip bulan sebelumnya, hanya baca.</p>
      </div>
      {months.length === 0 ? (
        <p className="muted">Belum ada arsip bulan sebelumnya.</p>
      ) : (
        <>
          <div className="field">
            <label htmlFor="riwayat-bulan">Bulan</label>
            <select id="riwayat-bulan" className="select" value={bulan} onChange={(e) => setBulan(e.target.value)}>
              {months.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="riwayat-summary">
            <span style={{ flexBasis: '100%' }}>
              {c.total} barang · diarsipkan {formatDate(archiveDate(bulan))}
            </span>
            {PROGRESS_ORDER.slice()
              .reverse()
              .map((p) => (
                <span key={p} className="status-label">
                  <StatusLabel status={p} />
                  <span style={{ fontWeight: 600 }}>{c[p]}</span>
                </span>
              ))}
          </div>
          {groupByKategori(list).map((g) => (
            <section className="group" key={g.kategori}>
              <h2 className="group-title">{KATEGORI[g.kategori]}</h2>
              <ul className="list">
                {g.items.map((it) => (
                  <li key={it.id}>
                    <div className="row-button">
                      <span className="row-main">
                        <span className="row-title">{it.uraianBarang}</span>
                        <span className="row-sub">{itemDetail(it, 'Tanpa keterangan')}</span>
                        <span className="small">
                          <StatusLabel status={it.progress} />
                        </span>
                      </span>
                      <span className="row-side">
                        {it.qty} {it.satuan}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </>
  );
}
