import { describe, expect, it } from 'vitest';
import { applyProgress, countStatus, findMaster, groupByKategori, validateItemInput } from './rules';
import { addMonths, archiveDate, formatDate, formatMonth } from './date';

describe('applyProgress', () => {
  it('mengisi tanggal hari ini saat ke selesai dengan tanggal kosong', () => {
    expect(applyProgress({ progress: 'belum', tanggalSelesai: null }, 'selesai', '2026-09-28')).toEqual({
      progress: 'selesai',
      tanggalSelesai: '2026-09-28',
    });
  });
  it('mempertahankan tanggal yang sudah ada saat ke selesai', () => {
    expect(applyProgress({ progress: 'selesai', tanggalSelesai: '2026-09-02' }, 'selesai', '2026-09-28').tanggalSelesai).toBe('2026-09-02');
  });
  it('mengosongkan tanggal saat ke belum atau proses', () => {
    expect(applyProgress({ progress: 'selesai', tanggalSelesai: '2026-09-02' }, 'proses', '2026-09-28').tanggalSelesai).toBeNull();
    expect(applyProgress({ progress: 'selesai', tanggalSelesai: '2026-09-02' }, 'belum', '2026-09-28').tanggalSelesai).toBeNull();
  });
});

describe('validateItemInput', () => {
  it('menolak uraian kosong dan qty bukan bilangan bulat >= 1', () => {
    for (const qty of ['', '0', '-1', '1.5', 'abc']) {
      const r = validateItemInput({ uraianBarang: ' ', qty, satuan: '' });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.errors.uraianBarang).toBeTruthy();
        expect(r.errors.qty).toBeTruthy();
      }
    }
  });
  it('satuan kosong menjadi pcs', () => {
    expect(validateItemInput({ uraianBarang: ' Sapu ', qty: '3', satuan: ' ' })).toEqual({
      ok: true,
      value: { uraianBarang: 'Sapu', qty: 3, satuan: 'pcs' },
    });
  });
});

describe('findMaster', () => {
  const master = [
    { id: 'a', kategori: 9, nama: 'Sapu', satuan: 'pcs', aktif: true },
    { id: 'b', kategori: 9, nama: 'Karbol', satuan: 'liter', aktif: false },
  ];
  it('cocok tanpa peduli huruf besar/kecil, hanya item aktif', () => {
    expect(findMaster(master, 9, 'sapu')?.id).toBe('a');
    expect(findMaster(master, 9, 'Karbol')).toBeUndefined();
    expect(findMaster(master, 8, 'Sapu')).toBeUndefined();
  });
});

describe('agregasi', () => {
  it('menghitung status dan mengelompokkan kategori berisi', () => {
    const items = [
      { kategori: 3, progress: 'selesai' as const },
      { kategori: 0, progress: 'belum' as const },
      { kategori: 3, progress: 'proses' as const },
    ];
    expect(countStatus(items)).toEqual({ total: 3, belum: 1, proses: 1, selesai: 1 });
    expect(groupByKategori(items).map((g) => [g.kategori, g.items.length])).toEqual([[0, 1], [3, 2]]);
  });
});

describe('tanggal', () => {
  it('memformat dan menggeser bulan', () => {
    expect(formatMonth('2026-09')).toBe('September 2026');
    expect(formatDate('2026-08-05')).toBe('5 Agu 2026');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(archiveDate('2026-12')).toBe('2027-01-01');
  });
});
