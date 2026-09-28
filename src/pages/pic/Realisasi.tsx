import { useId, useState } from 'react';
import { FilterChips } from '../../components/FilterChips';
import { StatusLabel, StatusSegmented, StatusSelect } from '../../components/Status';
import { useStore } from '../../data/store';
import { KATEGORI, PIC_STATUS_CONTROL, PROGRESS_LABEL, PROGRESS_ORDER } from '../../lib/constants';
import { formatDate, formatMonth } from '../../lib/date';
import { countStatus, groupByKategori } from '../../lib/rules';
import type { ItemKebutuhan, Progress } from '../../lib/types';
import { useUnitItems } from './PicShell';

type Filter = 'semua' | Progress;

export function itemDetail(it: ItemKebutuhan, emptyText = 'Belum ada keterangan'): string {
  const parts: string[] = [];
  if (it.progress === 'selesai' && it.tanggalSelesai) parts.push(`Selesai ${formatDate(it.tanggalSelesai)}`);
  if (it.keterangan.trim()) parts.push(it.keterangan.trim());
  return parts.join(' · ') || emptyText;
}

export function Realisasi() {
  const { bulanBerjalan } = useStore();
  const items = useUnitItems(bulanBerjalan);
  const [filter, setFilter] = useState<Filter>('semua');
  const [open, setOpen] = useState<string | null>(null);

  const c = countStatus(items);
  const visible = filter === 'semua' ? items : items.filter((it) => it.progress === filter);

  return (
    <>
      <div className="page-intro">
        <h1 className="page-title">Realisasi {formatMonth(bulanBerjalan)}</h1>
        <p className="muted">Perbarui status barang saat diproses dan diterima.</p>
      </div>
      <FilterChips<Filter>
        label="Filter status"
        value={filter}
        onChange={setFilter}
        chips={[
          { value: 'semua', label: 'Semua', count: c.total },
          ...PROGRESS_ORDER.map((p) => ({ value: p, label: PROGRESS_LABEL[p], count: c[p] })),
        ]}
      />
      {items.length === 0 ? (
        <p className="muted">Belum ada barang. Tambahkan di tab Kebutuhan.</p>
      ) : visible.length === 0 ? (
        <p className="muted">Tidak ada barang dengan status ini.</p>
      ) : (
        groupByKategori(visible).map((g) => (
          <section className="group" key={g.kategori}>
            <h2 className="group-title">{KATEGORI[g.kategori]}</h2>
            <ul className="list">
              {g.items.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    className="row-button"
                    aria-expanded={open === it.id}
                    onClick={() => setOpen(open === it.id ? null : it.id)}
                  >
                    <span className="row-main">
                      <span className="row-title">
                        {it.uraianBarang} · {it.qty} {it.satuan}
                      </span>
                      <span className="row-sub">{itemDetail(it)}</span>
                    </span>
                    <span className="row-side small" style={{ fontWeight: 400 }}>
                      <StatusLabel status={it.progress} />
                    </span>
                  </button>
                  {open === it.id && <RealisasiEditor item={it} />}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}

function RealisasiEditor({ item }: { item: ItemKebutuhan }) {
  const { actions } = useStore();
  const id = useId();
  const Control = PIC_STATUS_CONTROL === 'select' ? StatusSelect : StatusSegmented;

  return (
    <div className="realisasi-editor">
      <div className="field">
        <span className="field-label" id={`${id}-p`}>
          Progress
        </span>
        <Control value={item.progress} onChange={(p) => actions.setProgress(item.id, p)} label="Progress" />
      </div>
      <div className="field">
        <label htmlFor={`${id}-t`}>Tanggal selesai</label>
        <input
          id={`${id}-t`}
          className="input"
          type="date"
          value={item.tanggalSelesai ?? ''}
          onChange={(e) => actions.updateItem(item.id, { tanggalSelesai: e.target.value || null })}
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-k`}>Keterangan</label>
        <textarea
          id={`${id}-k`}
          className="textarea"
          rows={2}
          value={item.keterangan}
          onChange={(e) => actions.updateItem(item.id, { keterangan: e.target.value })}
        />
      </div>
      <p className="small muted">Diinput oleh {item.diinputOleh}. Tersimpan otomatis.</p>
    </div>
  );
}
