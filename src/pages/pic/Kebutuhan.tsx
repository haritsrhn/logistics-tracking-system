import { useState } from 'react';
import { AddItemForm, ItemEditor, ItemRow } from '../../components/ItemForms';
import { CategoryAccordion } from '../../components/CategoryAccordion';
import { useStore } from '../../data/store';
import { KATEGORI, KATEGORI_LAIN } from '../../lib/constants';
import { formatMonth } from '../../lib/date';
import { useUnitItems } from './PicShell';

export function Kebutuhan() {
  const { bulanBerjalan, master, actions } = useStore();
  const items = useUnitItems(bulanBerjalan);
  const [open, setOpen] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const counts = KATEGORI.map((_, k) => items.filter((it) => it.kategori === k).length);
  const filled = counts.filter(Boolean).length;

  return (
    <>
      <div className="page-intro">
        <h1 className="page-title">Kebutuhan {formatMonth(bulanBerjalan)}</h1>
        <p className="muted">Catat barang yang dibutuhkan unit bulan ini per kategori. Perubahan tersimpan otomatis.</p>
        <p className="small">
          {items.length} barang di {filled} dari {KATEGORI.length} kategori
        </p>
      </div>
      <CategoryAccordion
        open={open}
        onToggle={(k) => {
          setOpen(k);
          setEditing(null);
        }}
        counts={counts}
        renderBody={(k) => {
          const list = items.filter((it) => it.kategori === k);
          return (
            <>
              {k === KATEGORI_LAIN && <p className="accordion-note">Barang di luar 10 kategori lain dicatat di sini.</p>}
              {list.length > 0 && (
                <ul className="list">
                  {list.map((it) => (
                    <li key={it.id}>
                      {editing === it.id ? (
                        <ItemEditor
                          item={it}
                          master={master}
                          onCancel={() => setEditing(null)}
                          onSave={(v) => {
                            actions.updateItem(it.id, v);
                            setEditing(null);
                          }}
                          onDelete={() => {
                            if (window.confirm(`Hapus "${it.uraianBarang}" dari daftar?`)) {
                              actions.deleteItem(it.id);
                              setEditing(null);
                            }
                          }}
                        />
                      ) : (
                        <ItemRow item={it} onEdit={() => setEditing(it.id)} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <AddItemForm kategori={k} master={master} onAdd={(v) => actions.addItem({ ...v, kategori: k })} />
            </>
          );
        }}
      />
    </>
  );
}
