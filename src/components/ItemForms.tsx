import { useId, useState, type FormEvent } from 'react';
import { findMaster, validateItemInput, type ItemInput, type ItemInputErrors } from '../lib/rules';
import type { ItemKebutuhan, ItemMaster } from '../lib/types';
import { StatusLabel } from './Status';

type Saved = { uraianBarang: string; qty: number; satuan: string };

/** Field Uraian + Qty + Satuan, dipakai form tambah dan editor. */
function ItemFields({
  value,
  onChange,
  errors,
  master,
  kategori,
}: {
  value: ItemInput;
  onChange: (v: ItemInput) => void;
  errors: ItemInputErrors;
  master: ItemMaster[];
  kategori: number;
}) {
  const id = useId();
  const suggestions = master.filter((m) => m.aktif && m.kategori === kategori);

  const setUraian = (uraianBarang: string) => {
    const match = findMaster(master, kategori, uraianBarang);
    // Isi satuan otomatis hanya jika masih kosong.
    onChange({ ...value, uraianBarang, satuan: match && !value.satuan.trim() ? match.satuan : value.satuan });
  };

  return (
    <>
      <div className="field">
        <label htmlFor={`${id}-u`}>Uraian barang</label>
        <input
          id={`${id}-u`}
          className="input"
          list={suggestions.length ? `${id}-dl` : undefined}
          autoComplete="off"
          value={value.uraianBarang}
          aria-invalid={!!errors.uraianBarang}
          aria-describedby={errors.uraianBarang ? `${id}-ue` : undefined}
          onChange={(e) => setUraian(e.target.value)}
        />
        {suggestions.length > 0 && (
          <datalist id={`${id}-dl`}>
            {suggestions.map((m) => (
              <option key={m.id} value={m.nama}>
                {m.satuan}
              </option>
            ))}
          </datalist>
        )}
        {errors.uraianBarang && (
          <p className="error-text" id={`${id}-ue`}>
            {errors.uraianBarang}
          </p>
        )}
      </div>
      <div className="field-pair">
        <div className="field">
          <label htmlFor={`${id}-q`}>Qty</label>
          <input
            id={`${id}-q`}
            className="input"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={value.qty}
            aria-invalid={!!errors.qty}
            aria-describedby={errors.qty ? `${id}-qe` : undefined}
            onChange={(e) => onChange({ ...value, qty: e.target.value })}
          />
          {errors.qty && (
            <p className="error-text" id={`${id}-qe`}>
              {errors.qty}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor={`${id}-s`}>Satuan</label>
          <input
            id={`${id}-s`}
            className="input"
            placeholder="pcs"
            autoComplete="off"
            value={value.satuan}
            onChange={(e) => onChange({ ...value, satuan: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}

const EMPTY: ItemInput = { uraianBarang: '', qty: '', satuan: '' };

export function AddItemForm({
  kategori,
  master,
  onAdd,
}: {
  kategori: number;
  master: ItemMaster[];
  onAdd: (v: Saved) => void;
}) {
  const [value, setValue] = useState<ItemInput>(EMPTY);
  const [errors, setErrors] = useState<ItemInputErrors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = validateItemInput(value);
    if (!r.ok) return setErrors(r.errors);
    onAdd(r.value);
    setValue(EMPTY);
    setErrors({});
  };

  return (
    <form className="add-form" onSubmit={submit} noValidate>
      <h3>Tambah barang</h3>
      <ItemFields value={value} onChange={setValue} errors={errors} master={master} kategori={kategori} />
      <div>
        <button type="submit" className="btn btn-primary">
          Tambah
        </button>
      </div>
    </form>
  );
}

export function ItemRow({ item, onEdit }: { item: ItemKebutuhan; onEdit?: () => void }) {
  const content = (
    <>
      <span className="row-main">
        <span className="row-title">{item.uraianBarang}</span>
        <span className="small">
          <StatusLabel status={item.progress} />
        </span>
      </span>
      <span className="row-side">
        {item.qty} {item.satuan}
      </span>
    </>
  );
  if (!onEdit) return <div className="row-button">{content}</div>;
  return (
    <button type="button" className="row-button" onClick={onEdit} aria-label={`Ubah ${item.uraianBarang}`}>
      {content}
    </button>
  );
}

export function ItemEditor({
  item,
  master,
  onSave,
  onCancel,
  onDelete,
}: {
  item: ItemKebutuhan;
  master: ItemMaster[];
  onSave: (v: Saved) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [value, setValue] = useState<ItemInput>({
    uraianBarang: item.uraianBarang,
    qty: String(item.qty),
    satuan: item.satuan,
  });
  const [errors, setErrors] = useState<ItemInputErrors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = validateItemInput(value);
    if (!r.ok) return setErrors(r.errors);
    onSave(r.value);
  };

  return (
    <form className="item-editor" onSubmit={submit} noValidate aria-label={`Ubah ${item.uraianBarang}`}>
      <ItemFields value={value} onChange={setValue} errors={errors} master={master} kategori={item.kategori} />
      <div className="btn-row">
        <button type="submit" className="btn btn-primary">
          Simpan
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Batal
        </button>
        <button type="button" className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={onDelete}>
          Hapus
        </button>
      </div>
    </form>
  );
}
