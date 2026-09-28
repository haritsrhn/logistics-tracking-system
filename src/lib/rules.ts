import { KATEGORI } from './constants';
import type { ItemKebutuhan, ItemMaster, Progress } from './types';

/**
 * Aturan status:
 * - ke `selesai` dengan tanggal kosong: isi tanggal hari ini
 * - ke `belum` / `proses`: kosongkan tanggal selesai
 */
export function applyProgress<T extends Pick<ItemKebutuhan, 'progress' | 'tanggalSelesai'>>(
  item: T,
  next: Progress,
  today: string,
): T {
  if (next === 'selesai') {
    return { ...item, progress: next, tanggalSelesai: item.tanggalSelesai || today };
  }
  return { ...item, progress: next, tanggalSelesai: null };
}

export interface ItemInput {
  uraianBarang: string;
  qty: string;
  satuan: string;
}

export type ItemInputErrors = Partial<Record<'uraianBarang' | 'qty', string>>;

/** Validasi form barang. Satuan kosong menjadi `pcs`. */
export function validateItemInput(input: ItemInput):
  | { ok: true; value: { uraianBarang: string; qty: number; satuan: string } }
  | { ok: false; errors: ItemInputErrors } {
  const errors: ItemInputErrors = {};
  const uraian = input.uraianBarang.trim();
  if (!uraian) errors.uraianBarang = 'Uraian barang wajib diisi.';
  const qtyText = input.qty.trim();
  const qty = Number(qtyText);
  if (!/^\d+$/.test(qtyText) || !Number.isInteger(qty) || qty < 1) {
    errors.qty = 'Qty harus bilangan bulat minimal 1.';
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { uraianBarang: uraian, qty, satuan: input.satuan.trim() || 'pcs' } };
}

/** Item master aktif yang namanya cocok persis (tanpa beda huruf besar/kecil). */
export function findMaster(master: ItemMaster[], kategori: number, uraian: string): ItemMaster | undefined {
  const key = uraian.trim().toLowerCase();
  if (!key) return undefined;
  return master.find((m) => m.aktif && m.kategori === kategori && m.nama.toLowerCase() === key);
}

export interface StatusCount {
  total: number;
  belum: number;
  proses: number;
  selesai: number;
}

export function countStatus(items: Pick<ItemKebutuhan, 'progress'>[]): StatusCount {
  const c: StatusCount = { total: items.length, belum: 0, proses: 0, selesai: 0 };
  for (const it of items) c[it.progress]++;
  return c;
}

/** Kelompokkan item per kategori, urut index kategori, hanya kategori berisi. */
export function groupByKategori<T extends Pick<ItemKebutuhan, 'kategori'>>(items: T[]): { kategori: number; items: T[] }[] {
  const groups: { kategori: number; items: T[] }[] = [];
  for (let k = 0; k < KATEGORI.length; k++) {
    const list = items.filter((it) => it.kategori === k);
    if (list.length) groups.push({ kategori: k, items: list });
  }
  return groups;
}

/** Nomor urut (1-based) sebuah item di dalam kategorinya, per unit dan bulan. */
export function numberInCategory(all: ItemKebutuhan[], item: ItemKebutuhan): number {
  const siblings = all.filter((it) => it.unitId === item.unitId && it.bulan === item.bulan && it.kategori === item.kategori);
  return siblings.findIndex((it) => it.id === item.id) + 1;
}
